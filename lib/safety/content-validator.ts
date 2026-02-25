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

// Broader tech markers for Threads (more casual, wider tech topics)
const THREADS_EXTRA_MARKERS = [
  // English: core tech
  'programming', 'software', 'coding', 'open source', 'GitHub',
  'developer', 'web', 'frontend', 'backend', 'startup',
  'Linux', 'Docker', 'Kubernetes', 'cloud', 'DevOps',
  'database', 'security', 'network', 'algorithm',
  'MIT', 'CS', 'terminal', 'CLI', 'IDE',
  // English: languages & tools
  'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go ',
  'React', 'Node', 'shell', 'bash', 'vim',
  'git', 'debug', 'testing', 'deploy', 'CI/CD',
  // English: broader tech
  'performance', 'workflow', 'automation', 'architecture',
  'engineering', 'tutorial', 'course', 'curriculum',
  // Japanese: core tech
  'プログラミング', 'ソフトウェア', '開発者', 'オープンソース', 'スタートアップ',
  // Japanese: CS education & practical skills
  'コンピュータサイエンス', 'コマンドライン', 'バージョン管理',
  'シェル', 'デバッグ', 'テスト', 'コード', 'リポジトリ',
  'アーキテクチャ', 'パフォーマンス', '効率化', 'ワークフロー',
  // Japanese: education & learning
  '実務', 'スキル', '教材', '学習', '講義', '講座', 'カリキュラム',
  // Japanese: broader tech terms
  'ツール', 'サーバー', 'クラウド', 'インフラ', 'セキュリティ',
  'アルゴリズム', 'フレームワーク', 'ライブラリ', 'ブラウザ',
  'アプリ', 'サービス', 'プラットフォーム', 'オートメーション',
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
  const markers = platform === 'threads'
    ? [...POSITIVE_MARKERS, ...THREADS_EXTRA_MARKERS]
    : POSITIVE_MARKERS
  let positiveHits = 0
  for (const marker of markers) {
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

  // Threads uses a lower threshold (casual platform, broader tech topics)
  const threshold = platform === 'threads' ? 0.2 : BRAND_VOICE_THRESHOLD
  if (score < threshold) {
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
  const threshold = post.platform === 'threads' ? 0.2 : BRAND_VOICE_THRESHOLD
  const brandVoicePassed = brandVoice.score >= threshold
  const passed = brandVoicePassed && factCheck.passed

  return {
    passed,
    brandVoiceScore: brandVoice.score,
    factCheckPassed: factCheck.passed,
    factCheckDetails: factCheck.details,
    flags,
  }
}
