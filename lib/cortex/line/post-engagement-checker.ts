/**
 * Post Engagement Checker
 *
 * Cron job that checks engagement for posts made via LINE CORTEX,
 * records pattern outcomes for learning, and notifies user via LINE + Discord.
 */

import { getSupabaseAdmin } from '../discord/context-builder'
import { recordPatternOutcome } from '../../learning/pattern-bandit'
import { pushToLine } from './webhook-handler'
import { forwardToDiscord } from './discord-bridge'
import type { Platform } from '../../learning/pattern-bandit'

// ============================================================
// Types
// ============================================================

interface PendingPost {
  readonly id: string
  readonly platform: string
  readonly post_id: string | null
  readonly post_url: string | null
  readonly post_text: string | null
  readonly pattern_used: string | null
  readonly posted_at: string
  readonly user_id: string
}

interface EngagementMetrics {
  readonly likes: number
  readonly retweets: number
  readonly replies: number
  readonly impressions: number
}

// ============================================================
// Constants
// ============================================================

const CHECK_WINDOW_MIN_HOURS = 2
const CHECK_WINDOW_MAX_HOURS = 4

/** Weighted engagement formula (X-optimized weights) */
const WEIGHT_LIKES = 1
const WEIGHT_RETWEETS = 20
const WEIGHT_REPLIES = 13.5

/** Minimum weighted engagement to consider a post successful */
const SUCCESS_THRESHOLD = 5

// ============================================================
// Metrics Fetchers
// ============================================================

async function fetchXMetrics(postId: string): Promise<EngagementMetrics | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .select('likes, retweets, replies, impressions')
    .eq('tweet_id', postId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null

  return {
    likes: (data.likes as number) ?? 0,
    retweets: (data.retweets as number) ?? 0,
    replies: (data.replies as number) ?? 0,
    impressions: (data.impressions as number) ?? 0,
  }
}

async function fetchLinkedInMetrics(postId: string): Promise<EngagementMetrics | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('linkedin_post_analytics')
    .select('likes, retweets, replies, impressions')
    .eq('post_id', postId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null

  return {
    likes: (data.likes as number) ?? 0,
    retweets: (data.retweets as number) ?? 0,
    replies: (data.replies as number) ?? 0,
    impressions: (data.impressions as number) ?? 0,
  }
}

async function fetchThreadsMetrics(postId: string): Promise<EngagementMetrics | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('threads_post_analytics')
    .select('likes, retweets, replies, impressions')
    .eq('post_id', postId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null

  return {
    likes: (data.likes as number) ?? 0,
    retweets: (data.retweets as number) ?? 0,
    replies: (data.replies as number) ?? 0,
    impressions: (data.impressions as number) ?? 0,
  }
}

function fetchMetricsForPlatform(
  platform: string,
  postId: string,
): Promise<EngagementMetrics | null> {
  switch (platform) {
    case 'x':
      return fetchXMetrics(postId)
    case 'linkedin':
      return fetchLinkedInMetrics(postId)
    case 'threads':
      return fetchThreadsMetrics(postId)
    default:
      return Promise.resolve(null)
  }
}

// ============================================================
// Engagement Calculation
// ============================================================

function calculateWeightedEngagement(metrics: EngagementMetrics): number {
  return (
    metrics.likes * WEIGHT_LIKES +
    metrics.retweets * WEIGHT_RETWEETS +
    metrics.replies * WEIGHT_REPLIES
  )
}

// ============================================================
// Notifications
// ============================================================

async function sendLineNotification(
  userId: string,
  platform: string,
  metrics: EngagementMetrics,
  patternUsed: string | null,
  success: boolean,
): Promise<void> {
  const statusEmoji = success ? '✅' : '📉'
  const lines = [
    `📊 投稿結果 [${platform.toUpperCase()}]`,
    '',
    `❤️ いいね: ${metrics.likes}`,
    `🔄 リポスト: ${metrics.retweets}`,
    `💬 リプライ: ${metrics.replies}`,
    `👁️ インプレッション: ${metrics.impressions}`,
    '',
    `🎯 パターン: ${patternUsed || 'N/A'}`,
    `${statusEmoji} 結果: ${success ? '成功' : '改善余地あり'}`,
  ]

  await pushToLine(userId, [{ type: 'text', text: lines.join('\n') }])
}

async function sendDiscordNotification(
  platform: string,
  metrics: EngagementMetrics,
  patternUsed: string | null,
  success: boolean,
  userId: string,
): Promise<void> {
  const engagement = calculateWeightedEngagement(metrics)
  const statusLabel = success ? 'SUCCESS' : 'NEEDS_IMPROVEMENT'

  await forwardToDiscord({
    userId,
    requestType: 'engagement_report',
    content: [
      `Platform: ${platform}`,
      `Likes: ${metrics.likes} | RT: ${metrics.retweets} | Replies: ${metrics.replies} | Imp: ${metrics.impressions}`,
      `Weighted Engagement: ${engagement.toFixed(1)}`,
      `Pattern: ${patternUsed || 'N/A'}`,
      `Result: ${statusLabel}`,
    ].join('\n'),
  })
}

// ============================================================
// Main: Run Post Engagement Check
// ============================================================

export async function runPostEngagementCheck(): Promise<{ checked: number; learned: number }> {
  const supabase = getSupabaseAdmin()
  const now = Date.now()
  const minAge = new Date(now - CHECK_WINDOW_MAX_HOURS * 60 * 60 * 1000).toISOString()
  const maxAge = new Date(now - CHECK_WINDOW_MIN_HOURS * 60 * 60 * 1000).toISOString()

  // Fetch posts that were posted 2-4 hours ago and haven't been checked
  const { data: posts, error: queryError } = await supabase
    .from('cortex_pending_posts')
    .select('id, platform, post_id, post_url, post_text, pattern_used, posted_at, user_id')
    .eq('status', 'posted')
    .eq('engagement_checked', false)
    .gte('posted_at', minAge)
    .lte('posted_at', maxAge)

  if (queryError) {
    console.error('[engagement-checker] Query error:', queryError.message)
    return { checked: 0, learned: 0 }
  }

  if (!posts || posts.length === 0) {
    return { checked: 0, learned: 0 }
  }

  let checked = 0
  let learned = 0

  for (const post of posts as readonly PendingPost[]) {
    try {
      // Skip if no post_id to look up metrics
      if (!post.post_id) {
        await supabase
          .from('cortex_pending_posts')
          .update({ engagement_checked: true })
          .eq('id', post.id)
        checked++
        continue
      }

      const metrics = await fetchMetricsForPlatform(post.platform, post.post_id)

      if (!metrics) {
        // No metrics found yet - mark as checked to avoid re-processing
        await supabase
          .from('cortex_pending_posts')
          .update({ engagement_checked: true })
          .eq('id', post.id)
        checked++
        continue
      }

      // Record pattern outcome if pattern was used
      if (post.pattern_used) {
        const engagement = calculateWeightedEngagement(metrics)
        const success = engagement > SUCCESS_THRESHOLD
        await recordPatternOutcome(
          post.pattern_used,
          post.platform as Platform,
          success,
          engagement,
        )
        learned++

        // Notify via LINE
        await sendLineNotification(
          post.user_id,
          post.platform,
          metrics,
          post.pattern_used,
          success,
        )

        // Notify via Discord
        await sendDiscordNotification(
          post.platform,
          metrics,
          post.pattern_used,
          success,
          post.user_id,
        )
      }

      // Mark as engagement-checked
      await supabase
        .from('cortex_pending_posts')
        .update({ engagement_checked: true })
        .eq('id', post.id)

      checked++
    } catch (err) {
      console.error(
        `[engagement-checker] Error processing post ${post.id}:`,
        err instanceof Error ? err.message : String(err),
      )
    }
  }

  process.stdout.write(
    `[engagement-checker] Checked ${checked} posts, recorded ${learned} pattern outcomes\n`,
  )

  return { checked, learned }
}
