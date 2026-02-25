/**
 * Reply Engagement Tracker
 *
 * 返信のエンゲージメントを追跡し、パターンBanditにフィードバック。
 * engagement-learner.ts から呼び出される。
 */

import { createClient } from '@supabase/supabase-js'
import { scrapeTweetMetrics } from '../x-playwright/scrapers/tweet-scraper'
import { notifyApiFallback } from '../x-playwright'
import { getTwitterClient, isTwitterConfigured } from '../x-api/client'
import { recordPatternOutcome } from '../learning/pattern-bandit'
import { notifyLearningEvent } from '../ai-judge/slack-notifier'

// ============================================================
// Types
// ============================================================

interface ReplyMetrics {
  readonly likes: number
  readonly retweets: number
  readonly replies: number
  readonly impressions: number
}

interface TrackedReply {
  readonly id: string
  readonly replyTweetId: string
  readonly replyText: string
  readonly replyType: string
  readonly strategyUsed: string | null
  readonly rootTweetId: string
  readonly postedAt: string
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
// Metrics fetching
// ============================================================

async function fetchReplyMetrics(tweetId: string): Promise<ReplyMetrics | null> {
  // Playwright first
  try {
    const scraped = await scrapeTweetMetrics(tweetId)
    if (scraped.metrics) {
      return {
        likes: scraped.metrics.likes,
        retweets: scraped.metrics.retweets,
        replies: scraped.metrics.replies,
        impressions: 0,
      }
    }
    notifyApiFallback({
      consumer: 'reply-engagement-tracker',
      reason: scraped.error ?? 'No metrics from Playwright',
      detail: `reply tweet ${tweetId}`,
    }).catch(() => {})
  } catch {
    notifyApiFallback({
      consumer: 'reply-engagement-tracker',
      reason: 'Playwright exception',
      detail: `reply tweet ${tweetId}`,
    }).catch(() => {})
  }

  // API fallback
  if (!isTwitterConfigured()) return null

  try {
    const client = getTwitterClient()
    const tweet = await client.v2.singleTweet(tweetId, {
      'tweet.fields': ['public_metrics'],
    })
    const metrics = tweet.data.public_metrics
    if (!metrics) return null
    return {
      likes: metrics.like_count ?? 0,
      retweets: metrics.retweet_count ?? 0,
      replies: metrics.reply_count ?? 0,
      impressions: metrics.impression_count ?? 0,
    }
  } catch {
    return null
  }
}

// ============================================================
// Main tracking function
// ============================================================

export async function trackReplyEngagement(): Promise<void> {
  process.stdout.write('Reply Engagement Tracker: Starting\n')

  const supabase = getSupabase()
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  // 1. Get recent replies from x_conversation_threads
  const { data: recentReplies } = await supabase
    .from('x_conversation_threads')
    .select('id, reply_tweet_id, reply_text, reply_type, strategy_used, root_tweet_id, posted_at')
    .gte('posted_at', cutoff)
    .not('reply_tweet_id', 'is', null)

  if (!recentReplies || recentReplies.length === 0) {
    process.stdout.write('Reply Engagement Tracker: No recent replies to track\n')
    return
  }

  process.stdout.write(`Reply Engagement Tracker: Tracking ${recentReplies.length} replies\n`)

  const tracked: TrackedReply[] = recentReplies.map(r => ({
    id: r.id as string,
    replyTweetId: r.reply_tweet_id as string,
    replyText: r.reply_text as string,
    replyType: r.reply_type as string,
    strategyUsed: r.strategy_used as string | null,
    rootTweetId: r.root_tweet_id as string,
    postedAt: r.posted_at as string,
  }))

  // 2. Fetch metrics for each reply
  let totalTracked = 0
  let strategiesRecorded = 0

  for (const reply of tracked) {
    const metrics = await fetchReplyMetrics(reply.replyTweetId)
    if (!metrics) continue

    totalTracked++
    const totalEngagement = metrics.likes + metrics.retweets + metrics.replies

    // 3. Update engagement_after in x_conversation_threads
    await supabase
      .from('x_conversation_threads')
      .update({
        engagement_after: {
          likes: metrics.likes,
          retweets: metrics.retweets,
          replies: metrics.replies,
          impressions: metrics.impressions,
        },
      })
      .eq('id', reply.id)

    // 4. Record learning pipeline event
    await supabase.from('learning_pipeline_events').insert({
      event_type: 'reply_engagement',
      platform: 'x',
      post_id: reply.replyTweetId,
      data: {
        replyType: reply.replyType,
        strategyUsed: reply.strategyUsed,
        metrics,
        totalEngagement,
        rootTweetId: reply.rootTweetId,
      },
    }).then(() => {}).catch(() => {})

    // 5. Feed pattern bandit if strategy was tracked
    if (reply.strategyUsed) {
      const patternId = reply.strategyUsed.startsWith('reply_')
        ? reply.strategyUsed
        : `reply_${reply.strategyUsed}`
      const isSuccess = totalEngagement >= 2 // Low bar for replies (getting any engagement is good)
      try {
        await recordPatternOutcome(patternId, 'x', isSuccess, totalEngagement)
        strategiesRecorded++
      } catch { /* best-effort */ }
    }
  }

  // 6. Notify learning event
  try {
    await notifyLearningEvent({
      eventType: 'reply_engagement',
      summary: `返信エンゲージメント追跡: ${totalTracked}件追跡、${strategiesRecorded}件戦略記録`,
      details: {
        totalTracked,
        strategiesRecorded,
        totalReplies: tracked.length,
      },
    })
  } catch { /* best-effort */ }

  process.stdout.write(
    `Reply Engagement Tracker: Complete. ${totalTracked} tracked, ${strategiesRecorded} strategies recorded\n`
  )
}
