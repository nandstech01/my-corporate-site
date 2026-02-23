/**
 * AI Judge Safety Checks
 *
 * 高速な決定論的チェック。LLM判定の前に実行される。
 * - NGワードチェック（Supabase + インメモリキャッシュ）
 * - 文字数バリデーション
 * - URLバリデーション
 * - AIトピック関連度（キーワードマッチング）
 * - 重複チェック（fuzzy similarity）
 */

import { createClient } from '@supabase/supabase-js'
import { getCharLimits, TOPIC_RELEVANCE_THRESHOLD } from './config'
import type { NgWord, Platform, PostCandidate, SafetyCheckResult } from './types'

// ============================================================
// Supabase Client
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  return createClient(url, key)
}

// ============================================================
// NG Word Cache
// ============================================================

interface NgWordCache {
  readonly words: readonly NgWord[]
  readonly fetchedAt: number
}

const NG_WORD_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const ngWordCacheByPlatform = new Map<Platform, NgWordCache>()

export async function fetchNgWords(platform: Platform): Promise<readonly NgWord[]> {
  const cached = ngWordCacheByPlatform.get(platform)
  if (cached && Date.now() - cached.fetchedAt < NG_WORD_CACHE_TTL_MS) {
    return cached.words
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('safety_ng_words')
    .select('id, word, severity, category, platform, active')
    .eq('active', true)
    .contains('platform', [platform])

  if (error) {
    throw new Error(`Failed to fetch NG words: ${error.message}`)
  }

  const words: readonly NgWord[] = (data ?? []) as readonly NgWord[]
  ngWordCacheByPlatform.set(platform, { words, fetchedAt: Date.now() })
  return words
}

// ============================================================
// NG Word Check
// ============================================================

interface NgWordCheckResult {
  readonly passed: boolean
  readonly flags: readonly string[]
  readonly ngWordsFound: readonly string[]
  readonly blockedReason?: string
}

function checkNgWords(text: string, ngWords: readonly NgWord[]): NgWordCheckResult {
  const lowerText = text.toLowerCase()
  const flags: string[] = []
  const ngWordsFound: string[] = []
  let blockedReason: string | undefined

  for (const ngWord of ngWords) {
    const lowerWord = ngWord.word.toLowerCase()
    if (lowerText.includes(lowerWord)) {
      ngWordsFound.push(ngWord.word)

      if (ngWord.severity === 'block') {
        blockedReason = `Blocked NG word detected: "${ngWord.word}" (category: ${ngWord.category})`
        break
      }

      flags.push(`NG word flagged: "${ngWord.word}" (${ngWord.category})`)
    }
  }

  return {
    passed: blockedReason === undefined,
    flags,
    ngWordsFound,
    blockedReason,
  }
}

// ============================================================
// Character Count Validation
// ============================================================

function checkCharacterCount(text: string, platform: Platform): boolean {
  const limits = getCharLimits(platform)
  const length = text.length
  return length >= limits.min && length <= limits.max
}

// ============================================================
// URL Validation
// ============================================================

interface UrlCheckResult {
  readonly valid: boolean
  readonly flags: readonly string[]
}

const DANGEROUS_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:']

function extractUrls(text: string): readonly string[] {
  const urlPattern = /https?:\/\/[^\s\u3000\u3001\u3002\uff0c\uff0e)}\]>」』】）]+/g
  return text.match(urlPattern) ?? []
}

function checkUrls(text: string): UrlCheckResult {
  const flags: string[] = []

  // Check for dangerous scheme patterns in the raw text
  for (const scheme of DANGEROUS_SCHEMES) {
    if (text.toLowerCase().includes(scheme)) {
      return {
        valid: false,
        flags: [`Dangerous URL scheme detected: ${scheme}`],
      }
    }
  }

  const urls = extractUrls(text)

  for (const url of urls) {
    try {
      const parsed = new URL(url)

      if (parsed.protocol !== 'https:') {
        flags.push(`Non-HTTPS URL found: ${url}`)
      }

      // Flag suspicious patterns
      if (parsed.hostname.includes('..')) {
        flags.push(`Suspicious hostname: ${parsed.hostname}`)
      }

      if (parsed.username || parsed.password) {
        flags.push(`URL contains credentials: ${url}`)
      }
    } catch {
      flags.push(`Malformed URL: ${url}`)
    }
  }

  return { valid: flags.length === 0, flags }
}

// ============================================================
// AI Topic Relevance (keyword matching)
// ============================================================

const AI_KEYWORDS_EN: readonly string[] = [
  'artificial intelligence', 'machine learning', 'deep learning',
  'neural network', 'transformer', 'large language model',
  'natural language processing', 'computer vision',
  'reinforcement learning', 'generative ai', 'gen ai',
  'fine-tuning', 'fine tuning', 'embedding',
  'prompt engineering', 'prompt',
  'retrieval augmented generation',
  'autonomous agent', 'multi-agent',
  'chatbot', 'copilot', 'assistant',
  'diffusion model', 'foundation model',
  'hallucination', 'alignment', 'safety',
  'inference', 'training data',
  'model evaluation', 'benchmark',
  'tokenizer', 'attention mechanism',
  'vector database', 'semantic search',
]

const AI_KEYWORDS_SHORT: readonly string[] = [
  'ai', 'ml', 'llm', 'nlp', 'gpt', 'rag',
  'claude', 'openai', 'anthropic', 'gemini',
  'chatgpt', 'midjourney', 'stable diffusion',
  'langchain', 'llamaindex',
  'hugging face', 'huggingface',
]

const AI_KEYWORDS_JA: readonly string[] = [
  '人工知能', '機械学習', '深層学習',
  'ニューラルネットワーク', 'トランスフォーマー',
  '大規模言語モデル', '自然言語処理',
  '生成ai', '生成AI',
  'ファインチューニング', 'エンベディング',
  'プロンプト', 'プロンプトエンジニアリング',
  'エージェント', 'マルチエージェント',
  '自動化', 'オートメーション',
  'チャットボット', 'コパイロット',
  'ベクトルデータベース', 'セマンティック検索',
  'ハルシネーション', 'アライメント',
  '推論', '学習データ',
]

export function checkTopicRelevance(text: string): number {
  const lowerText = text.toLowerCase()
  let matchedCount = 0
  const allKeywords = [...AI_KEYWORDS_EN, ...AI_KEYWORDS_SHORT, ...AI_KEYWORDS_JA]
  const uniqueCategories = new Set<string>()

  for (const keyword of AI_KEYWORDS_EN) {
    if (lowerText.includes(keyword)) {
      matchedCount++
      uniqueCategories.add('en_long')
    }
  }

  for (const keyword of AI_KEYWORDS_SHORT) {
    // For short keywords, use word boundary matching to avoid false positives
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    if (regex.test(text)) {
      matchedCount++
      uniqueCategories.add('en_short')
    }
  }

  for (const keyword of AI_KEYWORDS_JA) {
    if (text.includes(keyword)) {
      matchedCount++
      uniqueCategories.add('ja')
    }
  }

  if (matchedCount === 0) return 0

  // Score based on keyword density and category variety
  const densityScore = Math.min(matchedCount / 3, 1.0)
  const varietyBonus = Math.min((uniqueCategories.size - 1) * 0.15, 0.3)

  return Math.min(densityScore + varietyBonus, 1.0)
}

// ============================================================
// Duplicate Check (fuzzy similarity)
// ============================================================

function calculateCharacterOverlap(textA: string, textB: string): number {
  const shorter = textA.length <= textB.length ? textA : textB
  const longer = textA.length <= textB.length ? textB : textA

  if (shorter.length === 0) return 0

  // Bigram overlap for fuzzy matching
  const bigramsA = toBigrams(shorter)
  const bigramsB = toBigrams(longer)

  if (bigramsA.size === 0 || bigramsB.size === 0) return 0

  let intersectionCount = 0
  bigramsA.forEach((bigram) => {
    if (bigramsB.has(bigram)) {
      intersectionCount++
    }
  })

  const union = new Set<string>()
  bigramsA.forEach((b) => union.add(b))
  bigramsB.forEach((b) => union.add(b))
  return union.size > 0 ? intersectionCount / union.size : 0
}

function toBigrams(text: string): Set<string> {
  const normalized = text.replace(/\s+/g, ' ').trim()
  const bigrams = new Set<string>()
  for (let i = 0; i < normalized.length - 1; i++) {
    bigrams.add(normalized.substring(i, i + 2))
  }
  return bigrams
}

const DUPLICATE_THRESHOLD = 0.8

async function checkDuplicates(
  post: PostCandidate,
): Promise<readonly string[]> {
  try {
    const supabase = getSupabase()
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const table = post.platform === 'linkedin' ? 'linkedin_post_analytics' : 'x_post_analytics'
    const { data, error } = await supabase
      .from(table)
      .select('post_text')
      .gte('posted_at', since)

    if (error) {
      // Best-effort: return empty flags on error
      return []
    }

    const recentTexts: readonly string[] = (data ?? [])
      .map((row: { post_text: string | null }) => row.post_text)
      .filter((t: string | null): t is string => t !== null)

    const flags: string[] = []
    for (const existing of recentTexts) {
      const similarity = calculateCharacterOverlap(post.text, existing)
      if (similarity >= DUPLICATE_THRESHOLD) {
        flags.push(`Potential duplicate detected (${Math.round(similarity * 100)}% similarity)`)
        break // One duplicate flag is sufficient
      }
    }

    return flags
  } catch {
    // Best-effort: swallow errors for duplicate check
    return []
  }
}

// ============================================================
// Main Entry Point
// ============================================================

export async function runSafetyChecks(post: PostCandidate): Promise<SafetyCheckResult> {
  // Run independent checks in parallel
  const [ngWords, urlCheck, duplicateFlags] = await Promise.all([
    fetchNgWords(post.platform),
    Promise.resolve(checkUrls(post.text)),
    checkDuplicates(post),
  ])

  const ngWordResult = checkNgWords(post.text, ngWords)
  const characterCountValid = checkCharacterCount(post.text, post.platform)
  const topicScore = checkTopicRelevance(post.text)
  const topicRelevant = topicScore >= TOPIC_RELEVANCE_THRESHOLD

  // Aggregate flags from all checks
  const allFlags: readonly string[] = [
    ...ngWordResult.flags,
    ...urlCheck.flags,
    ...duplicateFlags,
    ...(!characterCountValid
      ? [`Character count out of range for ${post.platform}: ${post.text.length} chars`]
      : []),
    ...(!topicRelevant
      ? [`Low AI topic relevance: ${topicScore.toFixed(2)}`]
      : []),
  ]

  // Determine overall pass/fail
  const passed =
    ngWordResult.passed &&
    characterCountValid &&
    urlCheck.valid &&
    topicRelevant

  return {
    passed,
    flags: allFlags,
    blockedReason: ngWordResult.blockedReason,
    ngWordsFound: ngWordResult.ngWordsFound,
    characterCountValid,
    urlsValid: urlCheck.valid,
    topicRelevant,
  }
}
