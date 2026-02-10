/**
 * 週次パフォーマンスレポート (Weekly Report)
 *
 * GitHub Actions cron (毎週月曜 01:00 UTC = JST 10:00) で実行
 *
 * 1. x_post_analytics から直近7日間のデータ集計
 * 2. ベスト投稿、ワースト投稿を特定
 * 3. 時間帯別エンゲージメント分析
 * 4. 学習内容を slack_bot_memory に保存
 * 5. Slack DM でレポート送信
 */

import { getPostAnalytics, saveMemory } from '../memory'
import { sendMessage, buildAnalyticsBlocks } from '../slack-client'
import type { XPostAnalytics } from '../types'

interface WeeklyStats {
  readonly postCount: number
  readonly totalImpressions: number
  readonly totalLikes: number
  readonly totalRetweets: number
  readonly totalReplies: number
  readonly avgEngagementRate: number
  readonly bestPost: XPostAnalytics | null
  readonly worstPost: XPostAnalytics | null
}

function computeStats(
  analytics: readonly XPostAnalytics[],
): WeeklyStats {
  if (analytics.length === 0) {
    return {
      postCount: 0,
      totalImpressions: 0,
      totalLikes: 0,
      totalRetweets: 0,
      totalReplies: 0,
      avgEngagementRate: 0,
      bestPost: null,
      worstPost: null,
    }
  }

  const sorted = [...analytics].sort(
    (a, b) => b.engagement_rate - a.engagement_rate,
  )

  return {
    postCount: analytics.length,
    totalImpressions: analytics.reduce((s, a) => s + a.impressions, 0),
    totalLikes: analytics.reduce((s, a) => s + a.likes, 0),
    totalRetweets: analytics.reduce((s, a) => s + a.retweets, 0),
    totalReplies: analytics.reduce((s, a) => s + a.replies, 0),
    avgEngagementRate:
      analytics.reduce((s, a) => s + a.engagement_rate, 0) / analytics.length,
    bestPost: sorted[0] ?? null,
    worstPost: sorted[sorted.length - 1] ?? null,
  }
}

function analyzeTimingPatterns(
  analytics: readonly XPostAnalytics[],
): string {
  if (analytics.length < 3) return 'Not enough data for timing analysis.'

  const hourBuckets: Record<number, { count: number; totalRate: number }> = {}

  for (const post of analytics) {
    const hour = new Date(post.posted_at).getUTCHours()
    const jstHour = (hour + 9) % 24
    const existing = hourBuckets[jstHour] ?? { count: 0, totalRate: 0 }
    hourBuckets[jstHour] = {
      count: existing.count + 1,
      totalRate: existing.totalRate + post.engagement_rate,
    }
  }

  const bestHourEntry = Object.entries(hourBuckets)
    .map(([hour, data]) => ({
      hour: parseInt(hour, 10),
      avgRate: data.totalRate / data.count,
      count: data.count,
    }))
    .sort((a, b) => b.avgRate - a.avgRate)[0]

  if (!bestHourEntry) return 'No timing patterns detected.'

  return `Best posting time: JST ${bestHourEntry.hour}:00 (avg engagement: ${(bestHourEntry.avgRate * 100).toFixed(1)}%)`
}

function formatReport(stats: WeeklyStats, timing: string): string {
  const lines: string[] = []

  lines.push(`*Posts:* ${stats.postCount}`)
  lines.push(`*Total Impressions:* ${stats.totalImpressions.toLocaleString()}`)
  lines.push(
    `*Total Engagement:* ${(stats.totalLikes + stats.totalRetweets + stats.totalReplies).toLocaleString()}`,
  )
  lines.push(
    `*Avg Engagement Rate:* ${(stats.avgEngagementRate * 100).toFixed(2)}%`,
  )

  if (stats.bestPost) {
    lines.push('')
    lines.push(':trophy: *Best Post:*')
    lines.push(`> ${stats.bestPost.post_text.slice(0, 100)}...`)
    lines.push(
      `> Likes: ${stats.bestPost.likes} | RT: ${stats.bestPost.retweets} | Replies: ${stats.bestPost.replies}`,
    )
  }

  lines.push('')
  lines.push(`:chart_with_upwards_trend: *Insights:*`)
  lines.push(`- ${timing}`)

  return lines.join('\n')
}

export async function runWeeklyReport(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error(
      'SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required',
    )
  }

  const analytics = await getPostAnalytics({ days: 7, limit: 50 })
  const stats = computeStats(analytics)
  const timing = analyzeTimingPatterns(analytics)

  if (stats.postCount === 0) {
    await sendMessage({
      channel,
      text: ':robot_face: :chart_with_upwards_trend: Weekly Report: No posts this week.',
    })
    return
  }

  // Save learnings to memory
  const learnings: string[] = []

  if (stats.bestPost) {
    learnings.push(
      `Best performing post pattern: ${stats.bestPost.pattern_used ?? 'unknown'}`,
    )
  }
  learnings.push(timing)
  learnings.push(`Weekly avg engagement rate: ${(stats.avgEngagementRate * 100).toFixed(2)}%`)

  await saveMemory({
    slackUserId: userId,
    memoryType: 'fact',
    content: `Weekly report learnings: ${learnings.join('. ')}`,
    importance: 0.7,
  })

  const reportBody = formatReport(stats, timing)

  const now = new Date()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const title = `:chart_with_upwards_trend: Weekly X Report (${weekStart.toLocaleDateString('ja-JP')} - ${now.toLocaleDateString('ja-JP')})`

  const blocks = buildAnalyticsBlocks({
    title,
    body: reportBody,
  })

  await sendMessage({
    channel,
    text: 'Weekly X Performance Report',
    blocks,
  })
}
