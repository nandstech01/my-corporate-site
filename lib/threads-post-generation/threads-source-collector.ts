/**
 * Threads ソース収集パイプライン
 *
 * Threads向け投稿に最適なソースを収集。
 * トレンド・バズ系の鮮度が高いコンテンツを優先し、
 * LinkedIn共有ソースはフォールバックとして利用。
 *
 * 優先度:
 *  1. trending_topics (slack_bot_memory, 2日以内)
 *  2. buzz_posts (24h以内, relevance >= 0.3)
 *  3. RSS フィード (6h以内)
 *  4. linkedin_sources (slack_bot_memory, フォールバック)
 */

import { createClient } from '@supabase/supabase-js'
import { fetchRSSFeeds } from '../linkedin-source-collector/rss-feed-client'

// ============================================================
// 型定義
// ============================================================

export interface ThreadsSourceCandidate {
  readonly id: string
  readonly sourceType: 'trending' | 'buzz' | 'rss' | 'linkedin_memory'
  readonly title: string
  readonly body: string
  readonly url: string | null
  readonly freshness: number
  readonly relevanceScore: number
  readonly conversationPotential: number
  readonly trendingContext?: string
}

// ============================================================
// 環境変数ヘルパー
// ============================================================

function getSupabaseConfig(): { readonly url: string; readonly key: string; readonly userId: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!url || !key || !userId) {
    process.stdout.write('threads-source-collector: missing env vars (SUPABASE_URL, SERVICE_ROLE_KEY, or SLACK_ALLOWED_USER_IDS)\n')
    return null
  }

  return { url, key, userId }
}

// ============================================================
// 1. Trending Topics (slack_bot_memory)
// ============================================================

async function collectTrendingTopics(): Promise<readonly ThreadsSourceCandidate[]> {
  const config = getSupabaseConfig()
  if (!config) return []

  try {
    const supabase = createClient(config.url, config.key)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('slack_bot_memory')
      .select('*')
      .eq('slack_user_id', config.userId)
      .eq('memory_type', 'fact')
      .contains('context', { source: 'trending_topics' })
      .gte('created_at', twoDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      process.stdout.write(`trending topics query failed: ${error.message}\n`)
      return []
    }

    return (data ?? []).map((row: any, i: number) => {
      const createdAt = new Date(row.created_at)
      const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)

      return {
        id: `trending_${row.id ?? i}`,
        sourceType: 'trending' as const,
        title: String(row.content ?? '').slice(0, 120),
        body: String(row.content ?? ''),
        url: (row.context as any)?.url ?? null,
        freshness: hoursAgo,
        relevanceScore: 0.8,
        conversationPotential: 0.7,
        trendingContext: (row.context as any)?.category ?? undefined,
      }
    })
  } catch (err) {
    process.stdout.write(`trending topics collection failed: ${err instanceof Error ? err.message : 'unknown'}\n`)
    return []
  }
}

// ============================================================
// 2. Buzz Posts
// ============================================================

async function collectBuzzPosts(): Promise<readonly ThreadsSourceCandidate[]> {
  const config = getSupabaseConfig()
  if (!config) return []

  try {
    const supabase = createClient(config.url, config.key)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('buzz_posts')
      .select('*')
      .gte('created_at', oneDayAgo)
      .gte('relevance_score', 0.3)
      .order('buzz_score', { ascending: false })
      .limit(10)

    if (error) {
      process.stdout.write(`buzz posts query failed: ${error.message}\n`)
      return []
    }

    return (data ?? []).map((row: any) => {
      const createdAt = new Date(row.created_at)
      const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)

      return {
        id: `buzz_${row.id}`,
        sourceType: 'buzz' as const,
        title: String(row.title ?? '').slice(0, 120),
        body: String(row.summary ?? row.title ?? ''),
        url: row.url ?? null,
        freshness: hoursAgo,
        relevanceScore: Number(row.relevance_score ?? 0.5),
        conversationPotential: Number(row.buzz_score ?? 0.5) * 0.8,
      }
    })
  } catch (err) {
    process.stdout.write(`buzz posts collection failed: ${err instanceof Error ? err.message : 'unknown'}\n`)
    return []
  }
}

// ============================================================
// 3. RSS Feeds (6h freshness window)
// ============================================================

async function collectRSSSources(): Promise<readonly ThreadsSourceCandidate[]> {
  try {
    const articles = await fetchRSSFeeds()
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000

    return articles
      .filter((a) => {
        const published = new Date(a.publishedAt)
        return published.getTime() >= sixHoursAgo
      })
      .map((a) => {
        const published = new Date(a.publishedAt)
        const hoursAgo = (Date.now() - published.getTime()) / (1000 * 60 * 60)

        return {
          id: a.id,
          sourceType: 'rss' as const,
          title: a.title,
          body: a.description,
          url: a.url,
          freshness: hoursAgo,
          relevanceScore: 0.6,
          conversationPotential: 0.5,
        }
      })
  } catch (err) {
    process.stdout.write(`RSS collection failed: ${err instanceof Error ? err.message : 'unknown'}\n`)
    return []
  }
}

// ============================================================
// 4. LinkedIn Sources (fallback)
// ============================================================

async function collectLinkedInMemorySources(): Promise<readonly ThreadsSourceCandidate[]> {
  const config = getSupabaseConfig()
  if (!config) return []

  try {
    const supabase = createClient(config.url, config.key)

    const { data, error } = await supabase
      .from('slack_bot_memory')
      .select('*')
      .eq('slack_user_id', config.userId)
      .eq('context->>source', 'linkedin_sources')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      process.stdout.write(`linkedin memory query failed: ${error.message}\n`)
      return []
    }

    const candidates: ThreadsSourceCandidate[] = []

    for (const row of data ?? []) {
      const ctx = row.context as any
      const items = ctx?.candidates ?? []
      if (!Array.isArray(items)) continue

      const createdAt = new Date(row.created_at)
      const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)

      for (const item of items) {
        candidates.push({
          id: `linkedin_${item.sourceUrl ?? row.id}_${candidates.length}`,
          sourceType: 'linkedin_memory',
          title: String(item.title ?? '').slice(0, 120),
          body: String(item.sourceBody ?? item.title ?? ''),
          url: item.sourceUrl ?? null,
          freshness: hoursAgo,
          relevanceScore: Number(item.score ?? 0.4),
          conversationPotential: 0.4,
        })
      }
    }

    return candidates
  } catch (err) {
    process.stdout.write(`linkedin memory collection failed: ${err instanceof Error ? err.message : 'unknown'}\n`)
    return []
  }
}

// ============================================================
// メインエクスポート
// ============================================================

export async function collectThreadsSources(): Promise<readonly ThreadsSourceCandidate[]> {
  const [trending, buzz, rss, linkedin] = await Promise.allSettled([
    collectTrendingTopics(),
    collectBuzzPosts(),
    collectRSSSources(),
    collectLinkedInMemorySources(),
  ])

  const results: ThreadsSourceCandidate[] = []

  const sources = [
    { label: 'trending', result: trending },
    { label: 'buzz', result: buzz },
    { label: 'rss', result: rss },
    { label: 'linkedin', result: linkedin },
  ] as const

  for (const { label, result } of sources) {
    if (result.status === 'fulfilled') {
      results.push(...result.value)
      process.stdout.write(`threads-source-collector [${label}]: ${result.value.length} item(s)\n`)
    } else {
      process.stdout.write(`threads-source-collector [${label}]: failed — ${result.reason}\n`)
    }
  }

  process.stdout.write(`threads-source-collector: total ${results.length} candidate(s)\n`)
  return results
}
