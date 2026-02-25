/**
 * エンゲージメント学習 (Engagement Learner)
 *
 * GitHub Actions cron (毎日 15:00 UTC = JST 00:00) で実行
 *
 * X + LinkedIn 両プラットフォームのエンゲージメントを学習:
 * 1. 直近48時間の投稿メトリクスを取得
 * 2. analytics テーブルを更新
 * 3. 高パフォーマンス投稿の特徴を slack_bot_memory に保存
 */

import { createClient } from '@supabase/supabase-js'
import { getTwitterClient, isTwitterConfigured } from '../../x-api/client'
import { scrapeTweetMetrics } from '../../x-playwright/scrapers/tweet-scraper'
import { closePlaywright, bufferApiFallback, flushApiFallbackNotifications } from '../../x-playwright'
import { notifyLearningEvent } from '../../ai-judge/slack-notifier'
import {
  getRecentTweetIds,
  updatePostEngagement,
  saveMemory,
} from '../memory'
import { runLinkedInEngagementLearner } from './linkedin-engagement-learner'
import { recordPatternOutcome } from '../../learning/pattern-bandit'
import { trackReplyEngagement } from '../../x-conversation/reply-engagement-tracker'

interface TweetMetrics {
  readonly likes: number
  readonly retweets: number
  readonly replies: number
  readonly impressions: number
}

async function fetchTweetMetrics(
  tweetId: string,
): Promise<TweetMetrics | null> {
  // Playwright first
  try {
    const scraped = await scrapeTweetMetrics(tweetId)
    if (scraped.metrics) {
      return {
        likes: scraped.metrics.likes,
        retweets: scraped.metrics.retweets,
        replies: scraped.metrics.replies,
        impressions: 0, // Not available via Playwright
      }
    }
    // Playwright returned no metrics — fall through
    bufferApiFallback({
      consumer: 'engagement-learner',
      reason: scraped.error ?? 'No metrics from Playwright',
      detail: `tweet ${tweetId}`,
    })
  } catch {
    // Fall through to API
    bufferApiFallback({
      consumer: 'engagement-learner',
      reason: 'Playwright exception',
      detail: `tweet ${tweetId}`,
    })
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

function identifyHighPerformers(
  results: readonly {
    tweetId: string
    postText: string
    metrics: TweetMetrics
  }[],
): readonly {
  tweetId: string
  postText: string
  metrics: TweetMetrics
}[] {
  if (results.length === 0) return []

  const avgEngagement =
    results.reduce(
      (sum, r) =>
        sum + r.metrics.likes + r.metrics.retweets + r.metrics.replies,
      0,
    ) / results.length

  return results.filter((r) => {
    const engagement =
      r.metrics.likes + r.metrics.retweets + r.metrics.replies
    return engagement > avgEngagement * 1.5
  })
}

function identifyLowPerformers(
  results: readonly {
    tweetId: string
    postText: string
    metrics: TweetMetrics
  }[],
): readonly {
  tweetId: string
  postText: string
  metrics: TweetMetrics
}[] {
  if (results.length === 0) return []

  const avgEngagement =
    results.reduce(
      (sum, r) =>
        sum + r.metrics.likes + r.metrics.retweets + r.metrics.replies,
      0,
    ) / results.length

  return results.filter((r) => {
    const engagement =
      r.metrics.likes + r.metrics.retweets + r.metrics.replies
    return engagement < avgEngagement * 0.5
  })
}

async function runXEngagementLearner(): Promise<void> {
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
  if (!userId) {
    throw new Error('SLACK_ALLOWED_USER_IDS is required')
  }

  // Get recent tweets (last 48h to catch any missed)
  const recentTweets = await getRecentTweetIds(48)

  if (recentTweets.length === 0) {
    return
  }

  // Fetch metrics for each tweet
  const results: {
    tweetId: string
    postText: string
    metrics: TweetMetrics
  }[] = []

  for (const tweet of recentTweets) {
    const metrics = await fetchTweetMetrics(tweet.tweet_id)
    if (metrics) {
      await updatePostEngagement(tweet.tweet_id, metrics)
      results.push({
        tweetId: tweet.tweet_id,
        postText: tweet.post_text,
        metrics,
      })
    }
  }

  // Record pattern outcomes for Thompson Sampling bandit learning
  try {
    const avgEngagement = results.length > 0
      ? results.reduce(
          (sum, r) => sum + r.metrics.likes + r.metrics.retweets + r.metrics.replies,
          0,
        ) / results.length
      : 0

    for (const r of results) {
      const tweet = recentTweets.find((t) => t.tweet_id === r.tweetId)
      if (tweet?.pattern_used) {
        const totalEngagement = r.metrics.likes + r.metrics.retweets + r.metrics.replies
        const isSuccess = totalEngagement > avgEngagement * 0.8
        await recordPatternOutcome(tweet.pattern_used, 'x', isSuccess, totalEngagement)
      }
    }
  } catch { /* best-effort: bandit learning failure should not break engagement learner */ }

  // Identify high performers and save learnings
  const highPerformers = identifyHighPerformers(results)

  for (const hp of highPerformers) {
    const isExceptional =
      hp.metrics.likes > 50 || hp.metrics.impressions > 5000
    const importance = isExceptional ? 0.9 : 0.8

    const characteristics = [
      `High performing post (${hp.metrics.likes} likes, ${hp.metrics.retweets} RT, ${hp.metrics.impressions} imp)`,
      `Text preview: "${hp.postText.slice(0, 80)}..."`,
      `Length: ${hp.postText.length} chars`,
      isExceptional ? 'Exceptional engagement' : null,
    ]
      .filter(Boolean)
      .join('. ')

    await saveMemory({
      slackUserId: userId,
      memoryType: 'fact',
      content: characteristics,
      context: {
        tweetId: hp.tweetId,
        metrics: hp.metrics,
        exceptional: isExceptional,
        platform: 'x',
      },
      importance,
    })
  }

  // Negative learning: identify low performers
  const lowPerformers = identifyLowPerformers(results)

  for (const lp of lowPerformers) {
    await saveMemory({
      slackUserId: userId,
      memoryType: 'feedback',
      content: `Low performing X post (${lp.metrics.likes} likes, ${lp.metrics.retweets} RT, ${lp.metrics.impressions} imp). Text preview: "${lp.postText.slice(0, 80)}...". Length: ${lp.postText.length} chars. Avoid similar patterns.`,
      context: {
        tweetId: lp.tweetId,
        metrics: lp.metrics,
        platform: 'x',
        sentiment: 'negative',
      },
      importance: 0.7,
    })
  }

  // Update ai_judge_decisions actual engagement for prediction tracking
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars missing')
    const supabase = createClient(supabaseUrl, supabaseKey)

    for (const r of results) {
      await supabase
        .from('ai_judge_decisions')
        .update({
          actual_engagement: {
            likes: r.metrics.likes,
            retweets: r.metrics.retweets,
            replies: r.metrics.replies,
            impressions: r.metrics.impressions,
          },
          engagement_fetched_at: new Date().toISOString(),
        })
        .eq('post_id', r.tweetId)
        .eq('platform', 'x')
    }
  } catch { /* best-effort */ }

  // Record learning pipeline events
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars missing')
    const supabase = createClient(supabaseUrl, supabaseKey)

    for (const hp of highPerformers) {
      await supabase.from('learning_pipeline_events').insert({
        event_type: 'high_performer',
        platform: 'x',
        post_id: hp.tweetId,
        data: {
          metrics: hp.metrics,
          textPreview: hp.postText.slice(0, 100),
        },
      })
    }
    for (const lp of lowPerformers) {
      await supabase.from('learning_pipeline_events').insert({
        event_type: 'low_performer',
        platform: 'x',
        post_id: lp.tweetId,
        data: {
          metrics: lp.metrics,
          textPreview: lp.postText.slice(0, 100),
        },
      })
    }
  } catch { /* best-effort */ }

  // Analyze performance by post type (quote/thread/reply/original)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

      const { data: typedPosts } = await supabase
        .from('x_post_analytics')
        .select('post_type, likes, retweets, replies')
        .gte('posted_at', twoDaysAgo)

      if (typedPosts && typedPosts.length > 0) {
        const typeStats: Record<string, { count: number; totalEng: number }> = {}
        for (const post of typedPosts) {
          const pType = (post.post_type as string) ?? 'original'
          if (!typeStats[pType]) {
            typeStats[pType] = { count: 0, totalEng: 0 }
          }
          typeStats[pType].count++
          typeStats[pType].totalEng +=
            ((post.likes as number) ?? 0) +
            ((post.retweets as number) ?? 0) +
            ((post.replies as number) ?? 0)
        }

        const typeReport = Object.entries(typeStats)
          .map(([type, stats]) => `${type}: ${stats.count}件, avg engagement ${(stats.totalEng / stats.count).toFixed(1)}`)
          .join('; ')

        process.stdout.write(`X engagement by type: ${typeReport}\n`)

        // Save type-level learnings
        if (userId) {
          await saveMemory({
            slackUserId: userId,
            memoryType: 'fact',
            content: `X post type performance (48h): ${typeReport}`,
            context: { source: 'engagement_learner', typeStats, platform: 'x' },
            importance: 0.7,
          })
        }
      }
    }
  } catch { /* best-effort */ }

  // Notify #general about learning results
  if (highPerformers.length > 0 || lowPerformers.length > 0) {
    try {
      await notifyLearningEvent({
        eventType: highPerformers.length > 0 ? 'high_performer' : 'low_performer',
        summary: `X学習完了: ${results.length}件分析、${highPerformers.length}件高パフォーマンス、${lowPerformers.length}件低パフォーマンス`,
        details: {
          totalAnalyzed: results.length,
          highPerformers: highPerformers.length,
          lowPerformers: lowPerformers.length,
        },
      })
    } catch { /* best-effort */ }
  }

  // Close Playwright browser (saves updated cookies to Supabase)
  await closePlaywright()

  // Flush batched API fallback notifications as single summary
  await flushApiFallbackNotifications()
}

export async function runEngagementLearner(): Promise<void> {
  try {
    await runXEngagementLearner()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X engagement learner failed: ${message}\n`)
  }

  // Reply engagement tracking
  try {
    await trackReplyEngagement()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Reply engagement tracker failed: ${message}\n`)
  }

  try {
    await runLinkedInEngagementLearner()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`LinkedIn engagement learner failed: ${message}\n`)
  }

  // A/B experiment auto-evaluation
  try {
    const { autoEvaluateAll } = await import('../../learning/experiment-tracker')
    const experimentResults = await autoEvaluateAll()
    const significant = experimentResults.filter((r) => r.isSignificant)
    if (significant.length > 0) {
      process.stdout.write(
        `A/B experiments: ${significant.length} reached significance out of ${experimentResults.length} evaluated\n`,
      )
    }
  } catch {
    // Best-effort: experiment evaluation failure should not break engagement learner
  }

  // L4: Post-publish anomaly monitoring
  try {
    const { runPostPublishMonitor } = await import('../../safety/post-publish-monitor')
    await runPostPublishMonitor('x')
    await runPostPublishMonitor('linkedin')
  } catch {
    // Best-effort: L4 failure should not break engagement learner
  }
}
