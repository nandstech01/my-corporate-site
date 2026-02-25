/**
 * X Growth Tracker
 *
 * 日次でフォロワー数・投稿パフォーマンスを追跡し、
 * 投稿タイプ別の相関分析とWeekly Slackレポートを行う。
 */

import { createClient } from '@supabase/supabase-js'
import { getMyProfile } from '../x-api/client'
import { scrapeProfile } from '../x-playwright/scrapers/profile-scraper'
import { closePlaywright, bufferApiFallback, flushApiFallbackNotifications } from '../x-playwright'
import { sendMessage } from '../slack-bot/slack-client'

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
// Daily metrics snapshot
// ============================================================

async function saveDailyMetrics(params: {
  readonly followersCount: number
  readonly followingCount: number
  readonly tweetCount: number
}): Promise<void> {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  // Get yesterday's followers for daily change calculation
  const { data: yesterday } = await supabase
    .from('x_growth_metrics')
    .select('followers_count')
    .lt('date', today)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const dailyFollowerChange = yesterday
    ? params.followersCount - yesterday.followers_count
    : 0

  // Count today's posts by type
  const todayStart = `${today}T00:00:00Z`
  const todayEnd = `${today}T23:59:59Z`

  const { data: todayPosts } = await supabase
    .from('x_post_analytics')
    .select('post_type')
    .gte('posted_at', todayStart)
    .lte('posted_at', todayEnd)

  const postCounts = {
    total: 0,
    quotes: 0,
    replies: 0,
    threads: 0,
  }

  if (todayPosts) {
    postCounts.total = todayPosts.length
    for (const post of todayPosts) {
      const postType = (post as { post_type?: string }).post_type
      if (postType === 'quote') postCounts.quotes++
      else if (postType === 'reply') postCounts.replies++
      else if (postType === 'thread') postCounts.threads++
    }
  }

  // Find top performing post today
  const { data: topPost } = await supabase
    .from('x_post_analytics')
    .select('tweet_id, likes, retweets, replies')
    .gte('posted_at', todayStart)
    .lte('posted_at', todayEnd)
    .order('likes', { ascending: false })
    .limit(1)
    .single()

  const topPostEngagement = topPost
    ? ((topPost.likes as number) ?? 0) +
      ((topPost.retweets as number) ?? 0) +
      ((topPost.replies as number) ?? 0)
    : 0

  // Calculate average engagement rate
  const { data: engagementData } = await supabase
    .from('x_post_analytics')
    .select('likes, retweets, replies')
    .gte('posted_at', todayStart)
    .lte('posted_at', todayEnd)

  let avgEngagementRate = 0
  if (engagementData && engagementData.length > 0 && params.followersCount > 0) {
    const totalEngagement = engagementData.reduce(
      (sum, p) =>
        sum +
        ((p.likes as number) ?? 0) +
        ((p.retweets as number) ?? 0) +
        ((p.replies as number) ?? 0),
      0,
    )
    avgEngagementRate = totalEngagement / engagementData.length / params.followersCount
  }

  // Upsert daily metrics
  await supabase.from('x_growth_metrics').upsert(
    {
      date: today,
      followers_count: params.followersCount,
      following_count: params.followingCount,
      tweet_count: params.tweetCount,
      daily_follower_change: dailyFollowerChange,
      daily_posts_count: postCounts.total,
      daily_quotes_count: postCounts.quotes,
      daily_replies_count: postCounts.replies,
      daily_threads_count: postCounts.threads,
      avg_engagement_rate: avgEngagementRate,
      top_post_tweet_id: topPost?.tweet_id ?? null,
      top_post_engagement: topPostEngagement,
    },
    { onConflict: 'date' },
  )
}

// ============================================================
// Weekly Slack Report (Sunday)
// ============================================================

async function sendWeeklyReport(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  if (!channel) return

  const supabase = getSupabase()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const { data: weekData } = await supabase
    .from('x_growth_metrics')
    .select('*')
    .gte('date', sevenDaysAgo)
    .order('date', { ascending: true })

  if (!weekData || weekData.length === 0) return

  const latestDay = weekData[weekData.length - 1]
  const firstDay = weekData[0]

  const weeklyFollowerChange =
    (latestDay.followers_count as number) - (firstDay.followers_count as number)
  const totalPosts = weekData.reduce(
    (sum, d) => sum + ((d.daily_posts_count as number) ?? 0),
    0,
  )
  const totalQuotes = weekData.reduce(
    (sum, d) => sum + ((d.daily_quotes_count as number) ?? 0),
    0,
  )
  const totalReplies = weekData.reduce(
    (sum, d) => sum + ((d.daily_replies_count as number) ?? 0),
    0,
  )
  const totalThreads = weekData.reduce(
    (sum, d) => sum + ((d.daily_threads_count as number) ?? 0),
    0,
  )
  const avgEngagement =
    weekData.reduce(
      (sum, d) => sum + ((d.avg_engagement_rate as number) ?? 0),
      0,
    ) / weekData.length

  // Post type correlation analysis
  const typeCorrelation = analyzeTypeCorrelation(weekData)

  const lines = [
    ':chart_with_upwards_trend: *X Weekly Growth Report*',
    '',
    `*フォロワー数:* ${latestDay.followers_count?.toLocaleString()} (${weeklyFollowerChange >= 0 ? '+' : ''}${weeklyFollowerChange})`,
    `*投稿数:* ${totalPosts}件 (original: ${totalPosts - totalQuotes - totalReplies - totalThreads}, quote: ${totalQuotes}, reply: ${totalReplies}, thread: ${totalThreads})`,
    `*平均エンゲージメント率:* ${(avgEngagement * 100).toFixed(3)}%`,
    '',
    '*投稿タイプ別パフォーマンス:*',
    ...typeCorrelation,
    '',
    `*年末10万人目標まで:* ${Math.max(100000 - ((latestDay.followers_count as number) ?? 0), 0).toLocaleString()}人`,
  ]

  await sendMessage({
    channel,
    text: lines.join('\n'),
  })
}

function analyzeTypeCorrelation(
  weekData: readonly Record<string, unknown>[],
): readonly string[] {
  // Simple correlation: which days with more of X type had better follower growth
  const lines: string[] = []

  const daysWithQuotes = weekData.filter(
    (d) => ((d.daily_quotes_count as number) ?? 0) > 0,
  )
  const daysWithoutQuotes = weekData.filter(
    (d) => ((d.daily_quotes_count as number) ?? 0) === 0,
  )

  if (daysWithQuotes.length > 0 && daysWithoutQuotes.length > 0) {
    const avgGrowthWithQuotes =
      daysWithQuotes.reduce(
        (sum, d) => sum + ((d.daily_follower_change as number) ?? 0),
        0,
      ) / daysWithQuotes.length
    const avgGrowthWithout =
      daysWithoutQuotes.reduce(
        (sum, d) => sum + ((d.daily_follower_change as number) ?? 0),
        0,
      ) / daysWithoutQuotes.length

    const diff = avgGrowthWithQuotes - avgGrowthWithout
    lines.push(
      `• 引用RT日: ${diff >= 0 ? '+' : ''}${diff.toFixed(1)} followers/day vs 非引用RT日`,
    )
  }

  return lines
}

// ============================================================
// Main entry point
// ============================================================

export async function runGrowthTracker(): Promise<void> {
  process.stdout.write('Growth Tracker: Starting\n')

  // 1. Get current profile metrics (Playwright first, API fallback)
  const myUsername = process.env.X_USERNAME ?? 'nands_tech'
  let profileData: {
    followersCount: number
    followingCount: number
    tweetCount: number
  } | null = null

  // Try Playwright first
  const scraped = await scrapeProfile(myUsername)
  if (scraped.profile && scraped.profile.followersCount > 0) {
    profileData = {
      followersCount: scraped.profile.followersCount,
      followingCount: scraped.profile.followingCount,
      tweetCount: scraped.profile.tweetCount,
    }
    process.stdout.write('Growth Tracker: Profile fetched via Playwright\n')
  }

  // API fallback
  if (!profileData) {
    bufferApiFallback({
      consumer: 'growth-tracker',
      reason: scraped.error ?? 'Playwright returned no profile data',
    })

    const profile = await getMyProfile()
    if (profile.error || !profile.followersCount) {
      process.stdout.write(
        `Growth Tracker: Failed to get profile: ${profile.error}\n`,
      )
      await closePlaywright()
      return
    }
    profileData = {
      followersCount: profile.followersCount ?? 0,
      followingCount: profile.followingCount ?? 0,
      tweetCount: profile.tweetCount ?? 0,
    }
  }

  process.stdout.write(
    `Growth Tracker: Followers=${profileData.followersCount}, Following=${profileData.followingCount}, Tweets=${profileData.tweetCount}\n`,
  )

  // 2. Save daily snapshot
  try {
    await saveDailyMetrics({
      followersCount: profileData.followersCount,
      followingCount: profileData.followingCount,
      tweetCount: profileData.tweetCount,
    })
    process.stdout.write('Growth Tracker: Daily metrics saved\n')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Growth Tracker: Failed to save metrics: ${msg}\n`)
  }

  // 3. Weekly report on Sundays
  const dayOfWeek = new Date().getUTCDay()
  if (dayOfWeek === 0) {
    try {
      await sendWeeklyReport()
      process.stdout.write('Growth Tracker: Weekly report sent\n')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`Growth Tracker: Weekly report failed: ${msg}\n`)
    }
  }

  // Close Playwright browser (saves updated cookies to Supabase)
  await closePlaywright()

  // Flush batched API fallback notifications as single summary
  await flushApiFallbackNotifications()

  process.stdout.write('Growth Tracker: Complete\n')
}
