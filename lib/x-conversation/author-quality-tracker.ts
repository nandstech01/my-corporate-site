/**
 * Author Quality Tracker
 *
 * 著者ごとの返信品質プロファイルを計算し、
 * プロアクティブ返信の優先順位付けに使用する。
 * x_conversation_threads テーブルからオンデマンドで計算。
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================
// Types
// ============================================================

export interface AuthorQualityProfile {
  readonly authorUsername: string
  readonly totalReplies: number
  readonly avgEngagement: number
  readonly avgResponseRate: number
  readonly bestStrategyUsed: string | null
  readonly lastRepliedAt: string
  readonly qualityScore: number
}

interface ThreadRow {
  readonly root_author_username: string
  readonly engagement_after: unknown
  readonly depth_level: number
  readonly strategy_used: string | null
  readonly posted_at: string
}

// ============================================================
// Supabase
// ============================================================

let cachedSupabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (cachedSupabase) return cachedSupabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  cachedSupabase = createClient(url, key)
  return cachedSupabase
}

// ============================================================
// Engagement parsing
// ============================================================

function parseEngagement(engagementAfter: unknown): number {
  if (!engagementAfter || typeof engagementAfter !== 'object') return 0
  const obj = engagementAfter as Record<string, unknown>
  const likes = typeof obj.likes === 'number' ? obj.likes : 0
  const retweets = typeof obj.retweets === 'number' ? obj.retweets : 0
  const replies = typeof obj.replies === 'number' ? obj.replies : 0
  return likes + retweets + replies
}

// ============================================================
// Quality score calculation
// ============================================================

function computeQualityScore(
  avgEngagement: number,
  responseRate: number,
  lastRepliedAt: string,
  totalReplies: number,
): number {
  const normalizedEngagement = Math.min(avgEngagement / 10, 1.0)
  const daysSinceLastReply = (Date.now() - new Date(lastRepliedAt).getTime()) / (1000 * 60 * 60 * 24)
  const recencyBonus = Math.exp(-daysSinceLastReply / 30)
  const volumeBonus = Math.min(totalReplies / 20, 1.0)

  return 0.4 * normalizedEngagement + 0.3 * responseRate + 0.2 * recencyBonus + 0.1 * volumeBonus
}

// ============================================================
// Best strategy finder
// ============================================================

function findBestStrategy(rows: readonly ThreadRow[]): string | null {
  const strategyEngagement = new Map<string, { total: number; count: number }>()

  for (const row of rows) {
    if (!row.strategy_used) continue
    const engagement = parseEngagement(row.engagement_after)
    const existing = strategyEngagement.get(row.strategy_used) ?? { total: 0, count: 0 }
    strategyEngagement.set(row.strategy_used, {
      total: existing.total + engagement,
      count: existing.count + 1,
    })
  }

  let bestStrategy: string | null = null
  let bestAvg = -1

  Array.from(strategyEngagement.entries()).forEach(([strategy, stats]) => {
    const avg = stats.total / stats.count
    if (avg > bestAvg) {
      bestAvg = avg
      bestStrategy = strategy
    }
  })

  return bestStrategy
}

// ============================================================
// Profile builder
// ============================================================

function buildProfile(username: string, rows: readonly ThreadRow[]): AuthorQualityProfile {
  const totalReplies = rows.length

  const totalEngagement = rows.reduce((sum, row) => sum + parseEngagement(row.engagement_after), 0)
  const avgEngagement = totalReplies > 0 ? totalEngagement / totalReplies : 0

  const deepReplies = rows.filter(r => r.depth_level > 1).length
  const avgResponseRate = totalReplies > 0 ? deepReplies / totalReplies : 0

  const bestStrategyUsed = findBestStrategy(rows)

  const lastRepliedAt = rows.reduce((latest, row) => {
    return row.posted_at > latest ? row.posted_at : latest
  }, rows[0].posted_at)

  const qualityScore = computeQualityScore(avgEngagement, avgResponseRate, lastRepliedAt, totalReplies)

  return {
    authorUsername: username,
    totalReplies,
    avgEngagement,
    avgResponseRate,
    bestStrategyUsed,
    lastRepliedAt,
    qualityScore,
  }
}

// ============================================================
// Public API
// ============================================================

export async function getAuthorQualityProfile(username: string): Promise<AuthorQualityProfile | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('x_conversation_threads')
    .select('root_author_username, engagement_after, depth_level, strategy_used, posted_at')
    .eq('root_author_username', username)
    .not('reply_tweet_id', 'is', null)

  if (error) {
    process.stdout.write(`Author Quality Tracker: Error fetching profile for ${username}: ${error.message}\n`)
    return null
  }

  if (!data || data.length === 0) return null

  return buildProfile(username, data as readonly ThreadRow[])
}

export async function getTopAuthors(limit: number): Promise<readonly AuthorQualityProfile[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('x_conversation_threads')
    .select('root_author_username, engagement_after, depth_level, strategy_used, posted_at')
    .not('reply_tweet_id', 'is', null)

  if (error) {
    process.stdout.write(`Author Quality Tracker: Error fetching top authors: ${error.message}\n`)
    return []
  }

  if (!data || data.length === 0) return []

  // Group rows by author
  const authorRows = new Map<string, ThreadRow[]>()
  for (const row of data as ThreadRow[]) {
    const username = row.root_author_username
    const existing = authorRows.get(username) ?? []
    authorRows.set(username, [...existing, row])
  }

  // Filter to authors with 3+ replies and build profiles
  const profiles: AuthorQualityProfile[] = []
  Array.from(authorRows.entries()).forEach(([username, rows]) => {
    if (rows.length >= 3) {
      profiles.push(buildProfile(username, rows))
    }
  })

  return profiles
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, limit)
}

export async function getAuthorBoostMap(): Promise<ReadonlyMap<string, number>> {
  const topAuthors = await getTopAuthors(100)
  const boostMap = new Map<string, number>()

  if (topAuthors.length === 0) return boostMap

  const top25Index = Math.floor(topAuthors.length * 0.25)
  const top50Index = Math.floor(topAuthors.length * 0.5)

  for (let i = 0; i < topAuthors.length; i++) {
    const author = topAuthors[i]
    if (i < top25Index) {
      boostMap.set(author.authorUsername, 0.3)
    } else if (i < top50Index) {
      boostMap.set(author.authorUsername, 0.15)
    } else {
      boostMap.set(author.authorUsername, 0)
    }
  }

  return boostMap
}

export async function getAuthorBoostScore(username: string): Promise<number> {
  const boostMap = await getAuthorBoostMap()
  return boostMap.get(username) ?? 0
}

export async function updateAuthorProfiles(): Promise<void> {
  try {
    const topAuthors = await getTopAuthors(100)
    const totalAuthors = topAuthors.length
    const avgScore = totalAuthors > 0
      ? topAuthors.reduce((sum, a) => sum + a.qualityScore, 0) / totalAuthors
      : 0

    const top3 = topAuthors.slice(0, 3).map(a => `@${a.authorUsername}(${a.qualityScore.toFixed(2)})`).join(', ')

    process.stdout.write(
      `Author Quality Tracker: ${totalAuthors} authors tracked, avg score ${avgScore.toFixed(3)}, top: ${top3 || 'none'}\n`,
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Author Quality Tracker: Error updating profiles: ${msg}\n`)
  }
}
