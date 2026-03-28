/**
 * CORTEX Temporal Pattern Miner
 *
 * Mines posting time patterns from actual engagement data across X, LinkedIn, and Threads.
 * Every recommendation is backed by statistical confidence intervals.
 *
 * Answers: "When should we post what?" with data, not guesses.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { confidenceInterval } from '@/lib/learning/statistics'
import { sendMessage } from '@/lib/slack-bot/slack-client'

// ============================================================
// Constants
// ============================================================

const LOOKBACK_DAYS = 90
const MIN_SAMPLE_COUNT = 3
const TOP_SLOTS_COUNT = 10

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const TOPIC_KEYWORDS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['Claude Code', ['claude-code', 'claudecode']],
  ['AI', ['ai', 'llm', 'gpt', 'claude', 'gemini']],
  ['Business', ['business', 'startup', 'saas']],
] as const

// ============================================================
// Types
// ============================================================

interface RawPostRecord {
  readonly posted_at: string
  readonly likes: number
  readonly impressions: number | null
  readonly engagement_rate: number | null
  readonly post_type: string | null
  readonly pattern_used: string | null
  readonly tags: string[] | null
  readonly replies: number | null
  readonly retweets: number | null
  readonly reposts: number | null
  readonly comments: number | null
  readonly views: number | null
}

interface EnrichedPost {
  readonly platform: string
  readonly day_of_week: number
  readonly hour_jst: number
  readonly topic_category: string
  readonly content_type: string
  readonly engagement_rate: number
  readonly likes: number
  readonly impressions: number
}

interface GroupKey {
  readonly platform: string
  readonly day_of_week: number
  readonly hour_jst: number
  readonly topic_category: string
  readonly content_type: string
}

interface GroupStats {
  readonly key: GroupKey
  readonly sample_count: number
  readonly avg_engagement_rate: number
  readonly avg_likes: number
  readonly avg_impressions: number
  readonly max_engagement_rate: number
  readonly std_dev: number
  readonly confidence_interval_lower: number
  readonly confidence_interval_upper: number
  readonly recommendation_score: number
}

// ============================================================
// Supabase Client
// ============================================================

let cachedSupabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (cachedSupabase) return cachedSupabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  cachedSupabase = createClient(url, key)
  return cachedSupabase
}

// ============================================================
// JST Conversion
// ============================================================

function toJST(postedAt: string): { dayOfWeek: number; hourJST: number } {
  const jstDate = new Date(new Date(postedAt).getTime() + 9 * 60 * 60 * 1000)
  return {
    dayOfWeek: jstDate.getUTCDay(),
    hourJST: jstDate.getUTCHours(),
  }
}

// ============================================================
// Topic Inference
// ============================================================

function inferTopic(tags: readonly string[] | null): string {
  if (!tags || tags.length === 0) return 'Tech'

  const lowerTags = tags.map((t) => t.toLowerCase())

  for (const [category, keywords] of TOPIC_KEYWORDS) {
    if (keywords.some((kw) => lowerTags.some((t) => t.includes(kw)))) {
      return category
    }
  }

  return 'Tech'
}

// ============================================================
// Group Key
// ============================================================

function makeGroupKey(post: EnrichedPost): string {
  return `${post.platform}|${post.day_of_week}|${post.hour_jst}|${post.topic_category}|${post.content_type}`
}

function parseGroupKey(key: string): GroupKey {
  const [platform, dayOfWeek, hourJst, topicCategory, contentType] = key.split('|')
  return {
    platform,
    day_of_week: Number(dayOfWeek),
    hour_jst: Number(hourJst),
    topic_category: topicCategory,
    content_type: contentType,
  }
}

// ============================================================
// Data Fetching
// ============================================================

async function fetchXPosts(since: string): Promise<readonly EnrichedPost[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .select('posted_at, likes, retweets, replies, impressions, engagement_rate, post_type, pattern_used, tags')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })

  if (error) {
    console.log(`[temporal-miner] Failed to fetch X posts: ${error.message}`)
    return []
  }

  return (data ?? []).map((row: RawPostRecord) => {
    const jst = toJST(row.posted_at)
    return {
      platform: 'x',
      day_of_week: jst.dayOfWeek,
      hour_jst: jst.hourJST,
      topic_category: inferTopic(row.tags),
      content_type: row.post_type ?? 'original',
      engagement_rate: row.engagement_rate ?? 0,
      likes: row.likes ?? 0,
      impressions: row.impressions ?? 0,
    }
  })
}

async function fetchLinkedInPosts(since: string): Promise<readonly EnrichedPost[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('linkedin_post_analytics')
    .select('posted_at, likes, comments, reposts, impressions, engagement_rate')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })

  if (error) {
    console.log(`[temporal-miner] Failed to fetch LinkedIn posts: ${error.message}`)
    return []
  }

  return (data ?? []).map((row: RawPostRecord) => {
    const jst = toJST(row.posted_at)
    return {
      platform: 'linkedin',
      day_of_week: jst.dayOfWeek,
      hour_jst: jst.hourJST,
      topic_category: 'Tech',
      content_type: 'original',
      engagement_rate: row.engagement_rate ?? 0,
      likes: row.likes ?? 0,
      impressions: row.impressions ?? 0,
    }
  })
}

async function fetchThreadsPosts(since: string): Promise<readonly EnrichedPost[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('threads_post_analytics')
    .select('posted_at, likes, replies, reposts, views, engagement_rate')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })

  if (error) {
    console.log(`[temporal-miner] Failed to fetch Threads posts: ${error.message}`)
    return []
  }

  return (data ?? []).map((row: RawPostRecord) => {
    const jst = toJST(row.posted_at)
    return {
      platform: 'threads',
      day_of_week: jst.dayOfWeek,
      hour_jst: jst.hourJST,
      topic_category: 'Tech',
      content_type: 'original',
      engagement_rate: row.engagement_rate ?? 0,
      likes: row.likes ?? 0,
      impressions: row.views ?? 0,
    }
  })
}

// ============================================================
// Statistical Calculations
// ============================================================

function calculateStdDev(values: readonly number[], mean: number): number {
  if (values.length < 2) return 0
  const sumSquaredDiff = values.reduce((sum, v) => sum + (v - mean) ** 2, 0)
  return Math.sqrt(sumSquaredDiff / (values.length - 1))
}

function calculateGroupStats(
  groups: ReadonlyMap<string, readonly EnrichedPost[]>,
): readonly GroupStats[] {
  const rawStats: Array<{
    key: GroupKey
    sample_count: number
    avg_engagement_rate: number
    avg_likes: number
    avg_impressions: number
    max_engagement_rate: number
    std_dev: number
    confidence_interval_lower: number
    confidence_interval_upper: number
    raw_score: number
  }> = []

  for (const [keyStr, posts] of Array.from(groups)) {
    const key = parseGroupKey(keyStr)
    const sampleCount = posts.length

    const engagementRates = posts.map((p) => p.engagement_rate)
    const likes = posts.map((p) => p.likes)
    const impressions = posts.map((p) => p.impressions)

    const avgEngagement = engagementRates.reduce((s, v) => s + v, 0) / sampleCount
    const avgLikes = likes.reduce((s, v) => s + v, 0) / sampleCount
    const avgImpressions = impressions.reduce((s, v) => s + v, 0) / sampleCount
    const maxEngagement = Math.max(...engagementRates)

    const stdDev = calculateStdDev(engagementRates, avgEngagement)

    const [ciLower, ciUpper] = confidenceInterval(avgEngagement, stdDev, sampleCount, 0.05)

    const rawScore = sampleCount >= MIN_SAMPLE_COUNT ? sampleCount * avgEngagement : 0

    rawStats.push({
      key,
      sample_count: sampleCount,
      avg_engagement_rate: avgEngagement,
      avg_likes: avgLikes,
      avg_impressions: avgImpressions,
      max_engagement_rate: maxEngagement,
      std_dev: stdDev,
      confidence_interval_lower: ciLower,
      confidence_interval_upper: ciUpper,
      raw_score: rawScore,
    })
  }

  // Normalize recommendation scores to 0-1 range
  const maxRawScore = Math.max(...rawStats.map((s) => s.raw_score), 1)

  return rawStats.map((s) => ({
    key: s.key,
    sample_count: s.sample_count,
    avg_engagement_rate: s.avg_engagement_rate,
    avg_likes: s.avg_likes,
    avg_impressions: s.avg_impressions,
    max_engagement_rate: s.max_engagement_rate,
    std_dev: s.std_dev,
    confidence_interval_lower: s.confidence_interval_lower,
    confidence_interval_upper: s.confidence_interval_upper,
    recommendation_score: s.raw_score / maxRawScore,
  }))
}

// ============================================================
// Database Operations
// ============================================================

async function deleteExistingPatterns(periodStart: string, periodEnd: string): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('cortex_temporal_patterns')
    .delete()
    .gte('period_start', periodStart)
    .lte('period_end', periodEnd)

  if (error) {
    console.log(`[temporal-miner] Warning: failed to delete old patterns: ${error.message}`)
  }
}

async function insertPatterns(
  stats: readonly GroupStats[],
  periodStart: string,
  periodEnd: string,
): Promise<number> {
  const supabase = getSupabase()
  const now = new Date().toISOString()

  const rows = stats.map((s) => ({
    platform: s.key.platform,
    day_of_week: s.key.day_of_week,
    hour_jst: s.key.hour_jst,
    topic_category: s.key.topic_category,
    content_type: s.key.content_type,
    sample_count: s.sample_count,
    avg_engagement_rate: s.avg_engagement_rate,
    avg_likes: s.avg_likes,
    avg_impressions: s.avg_impressions,
    max_engagement_rate: s.max_engagement_rate,
    std_dev: s.std_dev,
    confidence_interval_lower: s.confidence_interval_lower,
    confidence_interval_upper: s.confidence_interval_upper,
    recommendation_score: s.recommendation_score,
    period_start: periodStart,
    period_end: periodEnd,
    calculated_at: now,
  }))

  // Insert in batches of 100 to avoid payload limits
  let insertedCount = 0
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)
    const { error } = await supabase.from('cortex_temporal_patterns').insert(batch)

    if (error) {
      console.log(`[temporal-miner] Failed to insert batch ${i / 100 + 1}: ${error.message}`)
    } else {
      insertedCount += batch.length
    }
  }

  return insertedCount
}

// ============================================================
// Summary Generation
// ============================================================

function formatTopSlotsSummary(stats: readonly GroupStats[]): string {
  const topSlots = [...stats]
    .filter((s) => s.recommendation_score > 0)
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, TOP_SLOTS_COUNT)

  if (topSlots.length === 0) {
    return 'No posting slots with sufficient data (minimum 3 samples required).'
  }

  const lines = topSlots.map((slot, i) => {
    const day = DAY_LABELS[slot.key.day_of_week] ?? `Day${slot.key.day_of_week}`
    const hour = String(slot.key.hour_jst).padStart(2, '0')
    const avgER = (slot.avg_engagement_rate * 100).toFixed(2)
    const ciL = (slot.confidence_interval_lower * 100).toFixed(2)
    const ciU = (slot.confidence_interval_upper * 100).toFixed(2)

    return (
      `${i + 1}. ${slot.key.platform.toUpperCase()} | ${day} ${hour}:00 JST | ` +
      `${slot.key.topic_category}/${slot.key.content_type} | ` +
      `avg ER: ${avgER}% (95% CI: [${ciL}%, ${ciU}%]) | ` +
      `n=${slot.sample_count}, score=${slot.recommendation_score.toFixed(3)}`
    )
  })

  return `Top ${topSlots.length} Posting Slots (last ${LOOKBACK_DAYS} days):\n${lines.join('\n')}`
}

async function saveToSlackBotMemory(summary: string): Promise<void> {
  const supabase = getSupabase()
  const now = new Date().toISOString()

  const { error } = await supabase.from('slack_bot_memory').insert({
    memory_type: 'timing',
    importance: 0.9,
    content: summary,
    context: {
      source: 'cortex_temporal_miner',
      period: '90d',
      calculated_at: now,
    },
  })

  if (error) {
    console.log(`[temporal-miner] Failed to save to slack_bot_memory: ${error.message}`)
  }
}

async function sendSlackNotification(summary: string): Promise<void> {
  const channel = process.env.SLACK_GENERAL_CHANNEL_ID || process.env.SLACK_DEFAULT_CHANNEL

  if (!channel) {
    console.log('[temporal-miner] No Slack channel configured, skipping notification')
    return
  }

  try {
    await sendMessage({
      channel,
      text: `:bar_chart: *Temporal Pattern Mining Complete*\n\n${summary}`,
    })
  } catch (error) {
    console.log(`[temporal-miner] Failed to send Slack notification: ${error}`)
  }
}

// ============================================================
// Main Entry Point
// ============================================================

export async function runTemporalPatternMiner(): Promise<void> {
  console.log('[temporal-miner] Starting temporal pattern mining...')

  const now = new Date()
  const periodEnd = now.toISOString()
  const periodStart = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  console.log(`[temporal-miner] Period: ${periodStart.slice(0, 10)} to ${periodEnd.slice(0, 10)}`)

  // Step 1: Fetch posts from all platforms in parallel
  console.log('[temporal-miner] Fetching post data from all platforms...')

  const [xPosts, linkedInPosts, threadsPosts] = await Promise.all([
    fetchXPosts(periodStart),
    fetchLinkedInPosts(periodStart),
    fetchThreadsPosts(periodStart),
  ])

  const allPosts: readonly EnrichedPost[] = [...xPosts, ...linkedInPosts, ...threadsPosts]

  console.log(
    `[temporal-miner] Fetched ${allPosts.length} posts ` +
    `(X: ${xPosts.length}, LinkedIn: ${linkedInPosts.length}, Threads: ${threadsPosts.length})`,
  )

  if (allPosts.length === 0) {
    console.log('[temporal-miner] No posts found in the period. Aborting.')
    return
  }

  // Step 2: Group posts by (platform, day, hour, topic, content_type)
  console.log('[temporal-miner] Grouping posts by temporal dimensions...')

  const groups = new Map<string, EnrichedPost[]>()

  for (const post of allPosts) {
    const key = makeGroupKey(post)
    const existing = groups.get(key)
    if (existing) {
      groups.set(key, [...existing, post])
    } else {
      groups.set(key, [post])
    }
  }

  console.log(`[temporal-miner] Created ${groups.size} unique groups`)

  // Step 3: Calculate statistics for each group
  console.log('[temporal-miner] Calculating statistics with confidence intervals...')

  const stats = calculateGroupStats(groups)

  const qualifiedCount = stats.filter((s) => s.recommendation_score > 0).length
  console.log(`[temporal-miner] ${qualifiedCount}/${stats.length} groups meet minimum sample threshold`)

  // Step 4: Delete old patterns and insert new ones
  console.log('[temporal-miner] Updating cortex_temporal_patterns table...')

  await deleteExistingPatterns(periodStart, periodEnd)
  const insertedCount = await insertPatterns(stats, periodStart, periodEnd)

  console.log(`[temporal-miner] Inserted ${insertedCount} pattern records`)

  // Step 5: Generate summary and save to memory
  const summary = formatTopSlotsSummary(stats)
  console.log(`[temporal-miner] Summary:\n${summary}`)

  await saveToSlackBotMemory(summary)
  console.log('[temporal-miner] Saved summary to slack_bot_memory')

  // Step 6: Send Slack notification
  await sendSlackNotification(summary)

  console.log('[temporal-miner] Temporal pattern mining complete.')
}
