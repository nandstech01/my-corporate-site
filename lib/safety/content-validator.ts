/**
 * L2: コンテンツ検証 (Content Validator)
 *
 * ブランドボイスチェック（決定論的）+ LLM事実検証（Claude Haiku）。
 * factCheckは best-effort: 失敗時はflag追加のみ、ブロックしない。
 */

import Anthropic from '@anthropic-ai/sdk'
import type { PostCandidate } from '../ai-judge/types'
import type { ContentValidationResult } from './types'

// ============================================================
// Constants
// ============================================================

const BRAND_VOICE_THRESHOLD = 0.3
const FACT_CHECK_MODEL = 'claude-haiku-4-5-20250514'
const FACT_CHECK_TIMEOUT_MS = 5000
const FACT_CHECK_MAX_TOKENS = 512

// ============================================================
// Brand Voice Markers
// ============================================================

const POSITIVE_MARKERS = [
  'AI', 'LLM', 'GPT', 'Claude', 'Anthropic', 'OpenAI', 'Google',
  '機械学習', '深層学習', '自然言語処理', '生成AI', 'RAG',
  'transformer', 'fine-tuning', 'embedding', 'vector',
  'agent', 'agentic', 'autonomous', 'automation',
  'テクノロジー', '技術', 'エンジニア', '開発',
  'API', 'SDK', 'framework', 'library',
  'プロンプト', 'マルチモーダル', 'reasoning',
  'データ', 'モデル', 'トレーニング', 'inference',
]

const NEGATIVE_MARKERS = [
  '絶対', '最強', '最高', 'やばい', 'ヤバい', 'マジ',
  '神', 'www', '草', 'ワロタ', 'ぴえん',
  '100%', '間違いない', '保証', '確実に',
  'guaranteed', 'absolutely', 'definitely',
  '炎上', '暴露', 'ステマ', 'PR案件',
]

// ============================================================
// Anthropic Client
// ============================================================

function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required')
  return new Anthropic({ apiKey })
}

// ============================================================
// Brand Voice Check (Deterministic)
// ============================================================

function checkBrandVoice(
  text: string,
  platform: PostCandidate['platform'],
): { readonly score: number; readonly flags: readonly string[] } {
  const lowerText = text.toLowerCase()
  const flags: string[] = []

  // Count positive marker hits
  let positiveHits = 0
  for (const marker of POSITIVE_MARKERS) {
    if (lowerText.includes(marker.toLowerCase())) {
      positiveHits++
    }
  }

  // Count negative marker hits
  let negativeHits = 0
  const foundNegativeMarkers: string[] = []
  for (const marker of NEGATIVE_MARKERS) {
    if (lowerText.includes(marker.toLowerCase())) {
      negativeHits++
      foundNegativeMarkers.push(marker)
    }
  }

  if (foundNegativeMarkers.length > 0) {
    flags.push(`brand_voice_negative_markers: ${foundNegativeMarkers.join(', ')}`)
  }

  // Calculate score: positive density vs negative penalty
  const totalMarkers = POSITIVE_MARKERS.length
  const positiveRatio = Math.min(positiveHits / 3, 1) // Normalize: 3+ hits = max
  const negativePenalty = negativeHits * 0.2

  let score = positiveRatio - negativePenalty

  // Platform-specific strictness
  if (platform === 'linkedin') {
    // LinkedIn: stricter brand voice
    score -= negativeHits * 0.1 // Extra penalty
    if (negativeHits > 0) {
      flags.push('brand_voice_linkedin_informal')
    }
  }

  // Clamp to [0, 1]
  score = Math.max(0, Math.min(1, score))

  if (score < BRAND_VOICE_THRESHOLD) {
    flags.push(`brand_voice_low_score: ${score.toFixed(2)}`)
  }

  return { score, flags }
}

// ============================================================
// Fact Check (Claude Haiku, best-effort)
// ============================================================

function containsVerifiableClaims(text: string): boolean {
  // Check for numbers, percentages, comparisons, attributions
  const patterns = [
    /\d+%/,                    // percentages
    /\d+[倍万億兆]/,           // Japanese multipliers
    /\d+x\s/i,                // multiplier claims
    /より(早|速|高|大|多)/,    // Japanese comparisons
    /compared to|faster|slower|better|worse/i, // English comparisons
    /によると|said|announced|reported/i, // attributions
    /調査|研究|統計|survey|study|research/i, // research claims
  ]

  return patterns.some((pattern) => pattern.test(text))
}

async function factCheckContent(text: string): Promise<{
  readonly passed: boolean
  readonly details?: string
  readonly flags: readonly string[]
}> {
  // Only fact-check if there are verifiable claims
  if (!containsVerifiableClaims(text)) {
    return { passed: true, flags: [] }
  }

  try {
    const anthropic = getAnthropic()

    const response = await anthropic.messages.create({
      model: FACT_CHECK_MODEL,
      max_tokens: FACT_CHECK_MAX_TOKENS,
      system: `あなたは事実検証AIです。以下のSNS投稿に含まれる数値・比較・帰属の主張を検証してください。
明らかに誤りがある場合は "FAIL" で始め、問題がなければ "PASS" で始めてください。
検証できない場合は "UNCERTAIN" で始めてください。簡潔に回答してください。`,
      messages: [{ role: 'user', content: text }],
    }, {
      timeout: FACT_CHECK_TIMEOUT_MS,
    })

    const responseText = response.content
      .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    if (responseText.startsWith('FAIL')) {
      return {
        passed: false,
        details: responseText,
        flags: ['fact_check_failed'],
      }
    }

    if (responseText.startsWith('UNCERTAIN')) {
      return {
        passed: true,
        details: responseText,
        flags: ['fact_check_uncertain'],
      }
    }

    return { passed: true, details: responseText, flags: [] }
  } catch {
    // Best-effort: timeout or API error → flag but don't block
    return {
      passed: true,
      flags: ['fact_check_timeout'],
    }
  }
}

// ============================================================
// Main: Validate Content
// ============================================================

export async function validateContent(
  post: PostCandidate,
): Promise<ContentValidationResult> {
  const flags: string[] = []

  // 1. Brand voice check (deterministic, fast)
  const brandVoice = checkBrandVoice(post.text, post.platform)
  flags.push(...brandVoice.flags)

  // 2. Fact check (LLM, best-effort)
  const factCheck = await factCheckContent(post.text)
  flags.push(...factCheck.flags)

  // 3. Determine pass/fail
  const brandVoicePassed = brandVoice.score >= BRAND_VOICE_THRESHOLD
  const passed = brandVoicePassed && factCheck.passed

  return {
    passed,
    brandVoiceScore: brandVoice.score,
    factCheckPassed: factCheck.passed,
    factCheckDetails: factCheck.details,
    flags,
  }
}
