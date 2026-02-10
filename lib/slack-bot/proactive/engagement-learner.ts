/**
 * エンゲージメント学習 (Engagement Learner)
 *
 * GitHub Actions cron (毎日 15:00 UTC = JST 00:00) で実行
 *
 * 1. 直近24時間に投稿したツイートのIDを取得
 * 2. X API v2 で最新のエンゲージメント数を取得
 * 3. x_post_analytics を更新
 * 4. 高パフォーマンス投稿の特徴を slack_bot_memory に保存
 */

import { getTwitterClient, isTwitterConfigured } from '@/lib/x-api/client'
import {
  getRecentTweetIds,
  updatePostEngagement,
  saveMemory,
} from '../memory'

interface TweetMetrics {
  readonly likes: number
  readonly retweets: number
  readonly replies: number
  readonly impressions: number
}

async function fetchTweetMetrics(
  tweetId: string,
): Promise<TweetMetrics | null> {
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

export async function runEngagementLearner(): Promise<void> {
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

  // Identify high performers and save learnings
  const highPerformers = identifyHighPerformers(results)

  for (const hp of highPerformers) {
    const characteristics = [
      `High performing post (${hp.metrics.likes} likes, ${hp.metrics.retweets} RT)`,
      `Text preview: "${hp.postText.slice(0, 80)}..."`,
      `Length: ${hp.postText.length} chars`,
    ].join('. ')

    await saveMemory({
      slackUserId: userId,
      memoryType: 'fact',
      content: characteristics,
      context: {
        tweetId: hp.tweetId,
        metrics: hp.metrics,
      },
      importance: 0.8,
    })
  }
}
