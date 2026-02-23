/**
 * Pattern Extractor
 *
 * バズ投稿の構造パターンを抽出。
 * hook, structure, closing, emoji strategy を分析。
 *
 * 全分析は決定的（LLM呼び出しなし、純粋テキスト分析）。
 */

import { createClient } from '@supabase/supabase-js'
import type { Platform } from '@/lib/ai-judge/types'

// ============================================================
// Types
// ============================================================

export interface BuzzPost {
  readonly id: string
  readonly platform: string
  readonly post_text: string
  readonly likes: number
  readonly reposts: number
  readonly replies: number
  readonly impressions: number
  readonly buzz_score: number
  readonly collected_at: string
}

export interface PostPattern {
  readonly hookType: 'question' | 'bold_claim' | 'statistic' | 'story' | 'unknown'
  readonly structureType: 'listicle' | 'narrative' | 'comparison' | 'thread' | 'unknown'
  readonly closingType: 'cta' | 'question' | 'statement' | 'unknown'
  readonly emojiCount: number
  readonly hashtagCount: number
  readonly length: number
}

export interface BuzzInsights {
  readonly topHookTypes: readonly { readonly type: string; readonly count: number }[]
  readonly topStructures: readonly { readonly type: string; readonly count: number }[]
  readonly avgLength: number
  readonly summary: string
}

// ============================================================
// Cache
// ============================================================

interface CacheEntry {
  readonly insights: BuzzInsights
  readonly cachedAt: number
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

let insightsCache: ReadonlyMap<string, CacheEntry> = new Map()

function getCacheKey(platform: Platform, days: number): string {
  return `${platform}:${days}`
}

function getCachedInsights(
  platform: Platform,
  days: number,
): BuzzInsights | null {
  const entry = insightsCache.get(getCacheKey(platform, days))
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null
  return entry.insights
}

function setCachedInsights(
  platform: Platform,
  days: number,
  insights: BuzzInsights,
): void {
  const key = getCacheKey(platform, days)
  const newMap = new Map(insightsCache)
  newMap.set(key, { insights, cachedAt: Date.now() })
  insightsCache = newMap
}

// ============================================================
// Supabase
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

// ============================================================
// Single Post Analysis (deterministic, no LLM)
// ============================================================

function detectHookType(
  text: string,
): PostPattern['hookType'] {
  const firstLine = text.split('\n')[0] ?? ''
  const trimmed = firstLine.trim()

  // Question hook: ends with ? or Japanese question markers
  if (/[?？]$/.test(trimmed)) return 'question'
  if (/でしょうか|ですか|ませんか|だろうか/.test(trimmed)) return 'question'

  // Statistic hook: starts with or contains a number/percentage
  if (/^\d|[\d]+%|[\d]+倍|[\d]+万|[\d]+億/.test(trimmed)) return 'statistic'

  // Bold claim: strong assertion patterns
  if (/^【|^「|^◆|^■|^★/.test(trimmed)) return 'bold_claim'
  if (/は間違い|は嘘|は古い|を変える|革命|衝撃|速報|緊急/.test(trimmed)) {
    return 'bold_claim'
  }

  // Story hook: personal narrative
  if (/^私[はがも]|^僕[はがも]|^昨日|^先日|^実は|^ある日/.test(trimmed)) {
    return 'story'
  }

  return 'unknown'
}

function detectStructureType(
  text: string,
): PostPattern['structureType'] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0)

  // Listicle: numbered or bulleted items (3+ items)
  const numberedLines = lines.filter((l) =>
    /^\s*[\d①-⑩][\.\)）]?\s/.test(l) || /^\s*[・\-\*•]\s/.test(l),
  )
  if (numberedLines.length >= 3) return 'listicle'

  // Thread: very long text or explicit thread markers
  if (text.length > 500 || /スレッド|🧵|1\//.test(text)) return 'thread'

  // Comparison: versus/comparison patterns
  if (/vs\.?|VS\.?|対|比較|違い|それとも/.test(text)) return 'comparison'

  // Default to narrative
  if (lines.length >= 2) return 'narrative'

  return 'unknown'
}

function detectClosingType(
  text: string,
): PostPattern['closingType'] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  const lastLine = (lines[lines.length - 1] ?? '').trim()

  // Question closing
  if (/[?？]$/.test(lastLine)) return 'question'
  if (/でしょうか|ですか|ませんか|だろうか|どう思/.test(lastLine)) {
    return 'question'
  }

  // CTA closing
  if (
    /フォロー|いいね|RT|リツイート|シェア|コメント|チェック|リンク|詳細は|続きは/.test(
      lastLine,
    )
  ) {
    return 'cta'
  }
  if (/👇|⬇️|↓|こちら/.test(lastLine)) return 'cta'

  return 'statement'
}

function countEmojis(text: string): number {
  // Match common emoji ranges
  const emojiRegex =
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{200D}\u{20E3}\u{FE0F}]/gu
  const matches = text.match(emojiRegex)
  return matches ? matches.length : 0
}

function countHashtags(text: string): number {
  const matches = text.match(/#[\w\u3000-\u9FFF\uF900-\uFAFF]+/g)
  return matches ? matches.length : 0
}

export function analyzeSinglePost(text: string): PostPattern {
  return {
    hookType: detectHookType(text),
    structureType: detectStructureType(text),
    closingType: detectClosingType(text),
    emojiCount: countEmojis(text),
    hashtagCount: countHashtags(text),
    length: text.length,
  }
}

// ============================================================
// Batch Pattern Extraction
// ============================================================

function countBy<T>(
  items: readonly T[],
  keyFn: (item: T) => string,
): readonly { readonly type: string; readonly count: number }[] {
  const counts = new Map<string, number>()

  items.forEach((item) => {
    const key = keyFn(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  const result: { readonly type: string; readonly count: number }[] = []
  counts.forEach((count, type) => {
    result.push({ type, count })
  })

  return result.sort((a, b) => b.count - a.count)
}

export function extractPatterns(
  posts: readonly BuzzPost[],
): {
  readonly patterns: readonly PostPattern[]
  readonly hookDistribution: readonly { readonly type: string; readonly count: number }[]
  readonly structureDistribution: readonly { readonly type: string; readonly count: number }[]
  readonly closingDistribution: readonly { readonly type: string; readonly count: number }[]
} {
  // Sort by buzz_score descending and take top posts
  const sorted = [...posts].sort((a, b) => b.buzz_score - a.buzz_score)
  const topPosts = sorted.slice(0, 50)

  const patterns = topPosts.map((p) => analyzeSinglePost(p.post_text))

  return {
    patterns,
    hookDistribution: countBy(patterns, (p) => p.hookType),
    structureDistribution: countBy(patterns, (p) => p.structureType),
    closingDistribution: countBy(patterns, (p) => p.closingType),
  }
}

// ============================================================
// Buzz Insights (with caching)
// ============================================================

export async function getBuzzInsights(
  platform: Platform,
  days?: number,
): Promise<BuzzInsights> {
  const lookbackDays = days ?? 7

  // Check cache
  const cached = getCachedInsights(platform, lookbackDays)
  if (cached) return cached

  const supabase = getSupabase()

  const since = new Date()
  since.setDate(since.getDate() - lookbackDays)

  // Map Platform to buzz_posts platform values
  const dbPlatform = platform === 'x' ? 'x' : 'linkedin'

  const { data, error } = await supabase
    .from('buzz_posts')
    .select(
      'id, platform, post_text, likes, reposts, replies, impressions, buzz_score, collected_at',
    )
    .eq('platform', dbPlatform)
    .gte('collected_at', since.toISOString())
    .order('buzz_score', { ascending: false })
    .limit(100)

  if (error) {
    throw new Error(`Failed to fetch buzz posts: ${error.message}`)
  }

  const posts: readonly BuzzPost[] = (data ?? []).map(
    (row): BuzzPost => ({
      id: row.id,
      platform: row.platform,
      post_text: row.post_text,
      likes: row.likes ?? 0,
      reposts: row.reposts ?? 0,
      replies: row.replies ?? 0,
      impressions: row.impressions ?? 0,
      buzz_score: row.buzz_score ?? 0,
      collected_at: row.collected_at,
    }),
  )

  if (posts.length === 0) {
    const emptyInsights: BuzzInsights = {
      topHookTypes: [],
      topStructures: [],
      avgLength: 0,
      summary: 'バズデータなし。収集を開始してください。',
    }
    setCachedInsights(platform, lookbackDays, emptyInsights)
    return emptyInsights
  }

  const { hookDistribution, structureDistribution, patterns } =
    extractPatterns(posts)

  const totalLength = patterns.reduce((sum, p) => sum + p.length, 0)
  const avgLength =
    patterns.length > 0 ? Math.round(totalLength / patterns.length) : 0

  const topHook = hookDistribution[0]
  const topStructure = structureDistribution[0]

  const summaryParts = [
    `直近${lookbackDays}日の${dbPlatform}バズ投稿${posts.length}件を分析。`,
    topHook
      ? `最多hookタイプ: ${topHook.type}(${topHook.count}件)`
      : '',
    topStructure
      ? `最多構造: ${topStructure.type}(${topStructure.count}件)`
      : '',
    `平均文字数: ${avgLength}文字`,
  ]

  const insights: BuzzInsights = {
    topHookTypes: hookDistribution,
    topStructures: structureDistribution,
    avgLength,
    summary: summaryParts.filter(Boolean).join(' '),
  }

  setCachedInsights(platform, lookbackDays, insights)

  return insights
}
