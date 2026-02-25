/**
 * Trend Watcher — aggregates opportunities from 3 existing sources:
 *
 * 1. buzz_posts (buzz_score > 200 in last 2h) → breaking
 * 2. x_quote_opportunities (status='pending', opportunity_score > 0.7) → trending
 * 3. slack_bot_memory trending_topics → standard
 *
 * Deduplicates against recently processed topics (last 24h from x_post_analytics).
 * Returns TrendingOpportunity[] sorted by priority score.
 */

import { createClient } from '@supabase/supabase-js'
import {
  type TrendingOpportunity,
  type TrendingPriorityQueue,
  createQueue,
  addOpportunity,
  pruneExpired,
  calculatePriorityScore,
} from './priority-queue'

// ============================================================
// Supabase Helper
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
// Source 1: buzz_posts (breaking)
// ============================================================

const BUZZ_SCORE_THRESHOLD = 200
const BUZZ_LOOKBACK_HOURS = 2
const BUZZ_EXPIRY_HOURS = 6

async function fetchBreakingBuzzPosts(): Promise<readonly TrendingOpportunity[]> {
  const supabase = getSupabase()
  const since = new Date(
    Date.now() - BUZZ_LOOKBACK_HOURS * 60 * 60 * 1000,
  ).toISOString()

  const { data, error } = await supabase
    .from('buzz_posts')
    .select('id, post_text, buzz_score, platform, created_at')
    .gte('buzz_score', BUZZ_SCORE_THRESHOLD)
    .gte('created_at', since)
    .order('buzz_score', { ascending: false })
    .limit(10)

  if (error) {
    process.stdout.write(
      `trend-watcher: buzz_posts query failed: ${error.message}\n`,
    )
    return []
  }

  if (!data || data.length === 0) return []

  return data.map((row) => {
    const detectedAt = new Date(row.created_at as string)
    const score = calculatePriorityScore(
      normalizeScore(row.buzz_score as number, 200, 1000),
      'breaking',
      detectedAt,
    )

    return {
      id: `buzz_${row.id}`,
      source: 'buzz_posts' as const,
      topic: (row.post_text as string).slice(0, 200),
      urgency: 'breaking' as const,
      score,
      detectedAt,
      expiresAt: new Date(detectedAt.getTime() + BUZZ_EXPIRY_HOURS * 60 * 60 * 1000),
      metadata: {
        buzzScore: row.buzz_score,
        platform: row.platform,
      },
    }
  })
}

// ============================================================
// Source 2: x_quote_opportunities (trending)
// ============================================================

const QUOTE_SCORE_THRESHOLD = 0.7
const QUOTE_EXPIRY_HOURS = 6

async function fetchTrendingQuoteOpportunities(): Promise<
  readonly TrendingOpportunity[]
> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('x_quote_opportunities')
    .select(
      'id, original_text, original_author_username, opportunity_score, created_at',
    )
    .eq('status', 'pending')
    .gte('opportunity_score', QUOTE_SCORE_THRESHOLD)
    .order('opportunity_score', { ascending: false })
    .limit(10)

  if (error) {
    process.stdout.write(
      `trend-watcher: x_quote_opportunities query failed: ${error.message}\n`,
    )
    return []
  }

  if (!data || data.length === 0) return []

  return data.map((row) => {
    const detectedAt = new Date(row.created_at as string)
    const score = calculatePriorityScore(
      row.opportunity_score as number,
      'trending',
      detectedAt,
    )

    return {
      id: `quote_${row.id}`,
      source: 'x_quote_opportunities' as const,
      topic: `@${row.original_author_username}: ${(row.original_text as string).slice(0, 180)}`,
      urgency: 'trending' as const,
      score,
      detectedAt,
      expiresAt: new Date(
        detectedAt.getTime() + QUOTE_EXPIRY_HOURS * 60 * 60 * 1000,
      ),
      metadata: {
        originalAuthor: row.original_author_username,
        opportunityScore: row.opportunity_score,
      },
    }
  })
}

// ============================================================
// Source 3: slack_bot_memory trending_topics (standard)
// ============================================================

const MEMORY_LOOKBACK_HOURS = 24
const MEMORY_EXPIRY_HOURS = 12
const MEMORY_RELEVANCE_SCORE = 0.7

async function fetchStandardTrendingTopics(): Promise<
  readonly TrendingOpportunity[]
> {
  const supabase = getSupabase()
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
  if (!userId) return []

  const since = new Date(
    Date.now() - MEMORY_LOOKBACK_HOURS * 60 * 60 * 1000,
  ).toISOString()

  const { data, error } = await supabase
    .from('slack_bot_memory')
    .select('id, content, created_at')
    .eq('slack_user_id', userId)
    .eq('context->>source', 'trending_topics')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    process.stdout.write(
      `trend-watcher: slack_bot_memory query failed: ${error.message}\n`,
    )
    return []
  }

  if (!data || data.length === 0) return []

  return data.map((row) => {
    const detectedAt = new Date(row.created_at as string)
    const score = calculatePriorityScore(
      MEMORY_RELEVANCE_SCORE,
      'standard',
      detectedAt,
    )

    return {
      id: `memory_${row.id}`,
      source: 'slack_bot_memory' as const,
      topic: (row.content as string).slice(0, 200),
      urgency: 'standard' as const,
      score,
      detectedAt,
      expiresAt: new Date(
        detectedAt.getTime() + MEMORY_EXPIRY_HOURS * 60 * 60 * 1000,
      ),
    }
  })
}

// ============================================================
// Deduplication
// ============================================================

const DEDUP_LOOKBACK_HOURS = 24

async function getRecentlyPostedTopics(): Promise<ReadonlySet<string>> {
  const supabase = getSupabase()
  const since = new Date(
    Date.now() - DEDUP_LOOKBACK_HOURS * 60 * 60 * 1000,
  ).toISOString()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .select('post_text')
    .gte('posted_at', since)

  if (error || !data) return new Set()

  const topics = new Set<string>()
  for (const row of data) {
    const text = (row.post_text as string | null) ?? ''
    // Extract first 100 chars as dedup key (lowercased)
    if (text.length > 0) {
      topics.add(text.slice(0, 100).toLowerCase())
    }
  }
  return topics
}

function isDuplicateTopic(
  topic: string,
  recentTopics: ReadonlySet<string>,
): boolean {
  const normalized = topic.slice(0, 100).toLowerCase()
  const recentArray = Array.from(recentTopics)
  for (const recent of recentArray) {
    // Check for substring overlap (either direction)
    if (
      normalized.includes(recent.slice(0, 50)) ||
      recent.includes(normalized.slice(0, 50))
    ) {
      return true
    }
  }
  return false
}

// ============================================================
// Utility
// ============================================================

function normalizeScore(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(1.0, Math.max(0, (value - min) / (max - min)))
}

// ============================================================
// Main: watchTrends
// ============================================================

export async function watchTrends(): Promise<readonly TrendingOpportunity[]> {
  // Fetch from all 3 sources in parallel
  const [buzzPosts, quoteOpps, memoryTopics] = await Promise.all([
    fetchBreakingBuzzPosts().catch(() => [] as readonly TrendingOpportunity[]),
    fetchTrendingQuoteOpportunities().catch(
      () => [] as readonly TrendingOpportunity[],
    ),
    fetchStandardTrendingTopics().catch(
      () => [] as readonly TrendingOpportunity[],
    ),
  ])

  process.stdout.write(
    `trend-watcher: sources — buzz=${buzzPosts.length}, quotes=${quoteOpps.length}, memory=${memoryTopics.length}\n`,
  )

  // Dedup against recently posted topics
  let recentTopics: ReadonlySet<string>
  try {
    recentTopics = await getRecentlyPostedTopics()
  } catch {
    recentTopics = new Set()
  }

  // Build priority queue
  const allOpportunities = [...buzzPosts, ...quoteOpps, ...memoryTopics]
  let queue: TrendingPriorityQueue = createQueue()

  for (const opp of allOpportunities) {
    if (!isDuplicateTopic(opp.topic, recentTopics)) {
      queue = addOpportunity(queue, opp)
    }
  }

  // Prune expired items
  queue = pruneExpired(queue)

  process.stdout.write(
    `trend-watcher: ${queue.items.length} opportunities after dedup/pruning\n`,
  )

  return queue.items
}
