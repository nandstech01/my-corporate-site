/**
 * 投稿時間最適化
 *
 * 全プラットフォームの過去データから最適投稿時間帯を予測。
 * JST時間帯ごとのエンゲージメント率を分析。
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================
// 型定義
// ============================================================

export interface TimeSlotPerformance {
  readonly hourJst: number
  readonly dayOfWeek: number
  readonly avgEngagementRate: number
  readonly postCount: number
  readonly platform: 'x' | 'linkedin' | 'instagram'
}

export interface OptimalPostingTime {
  readonly platform: 'x' | 'linkedin' | 'instagram'
  readonly bestHourJst: number
  readonly bestDayOfWeek: number
  readonly avgEngagementRate: number
  readonly confidence: 'high' | 'medium' | 'low'
}

// ============================================================
// Supabase ヘルパー
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
// 時間帯分析
// ============================================================

function analyzeTimeSlots(
  posts: readonly { posted_at: string; engagement_rate: number }[],
  platform: 'x' | 'linkedin' | 'instagram',
): readonly TimeSlotPerformance[] {
  const buckets: Record<
    string,
    { totalRate: number; count: number }
  > = {}

  for (const post of posts) {
    const date = new Date(post.posted_at)
    const jstHour = (date.getUTCHours() + 9) % 24
    const dayOfWeek = date.getUTCDay()
    const key = `${dayOfWeek}_${jstHour}`

    const existing = buckets[key] ?? { totalRate: 0, count: 0 }
    buckets[key] = {
      totalRate: existing.totalRate + post.engagement_rate,
      count: existing.count + 1,
    }
  }

  return Object.entries(buckets).map(([key, data]) => {
    const [day, hour] = key.split('_').map(Number)
    return {
      hourJst: hour,
      dayOfWeek: day,
      avgEngagementRate: data.count > 0 ? data.totalRate / data.count : 0,
      postCount: data.count,
      platform,
    }
  })
}

function findOptimalTime(
  slots: readonly TimeSlotPerformance[],
  platform: 'x' | 'linkedin' | 'instagram',
): OptimalPostingTime | null {
  if (slots.length === 0) return null

  const minPostsForConfidence = { high: 10, medium: 5, low: 2 }
  const sorted = [...slots].sort(
    (a, b) => b.avgEngagementRate - a.avgEngagementRate,
  )

  const best = sorted[0]
  const totalPosts = slots.reduce((s, sl) => s + sl.postCount, 0)

  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (totalPosts >= minPostsForConfidence.high) {
    confidence = 'high'
  } else if (totalPosts >= minPostsForConfidence.medium) {
    confidence = 'medium'
  }

  return {
    platform,
    bestHourJst: best.hourJst,
    bestDayOfWeek: best.dayOfWeek,
    avgEngagementRate: best.avgEngagementRate,
    confidence,
  }
}

// ============================================================
// メイン
// ============================================================

export async function getOptimalPostingTimes(
  days = 90,
): Promise<readonly OptimalPostingTime[]> {
  const supabase = getSupabase()
  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString()

  const [xResult, linkedinResult, instagramResult] = await Promise.all([
    supabase
      .from('x_post_analytics')
      .select('posted_at, engagement_rate')
      .gte('posted_at', since)
      .gt('impressions', 0),
    supabase
      .from('linkedin_post_analytics')
      .select('posted_at, impressions, likes, comments, reposts')
      .gte('posted_at', since)
      .gt('impressions', 0),
    supabase
      .from('instagram_post_analytics')
      .select('posted_at, engagement_rate')
      .gte('posted_at', since)
      .gt('impressions', 0),
  ])

  const results: OptimalPostingTime[] = []

  // X
  if (xResult.data && xResult.data.length > 0) {
    const xSlots = analyzeTimeSlots(xResult.data, 'x')
    const xOptimal = findOptimalTime(xSlots, 'x')
    if (xOptimal) results.push(xOptimal)
  }

  // LinkedIn (engagement_rate を動的計算)
  if (linkedinResult.data && linkedinResult.data.length > 0) {
    const linkedinPosts = linkedinResult.data.map((p) => ({
      posted_at: p.posted_at,
      engagement_rate:
        p.impressions > 0
          ? ((p.likes ?? 0) + (p.comments ?? 0) + (p.reposts ?? 0)) /
            p.impressions
          : 0,
    }))
    const linkedinSlots = analyzeTimeSlots(linkedinPosts, 'linkedin')
    const linkedinOptimal = findOptimalTime(linkedinSlots, 'linkedin')
    if (linkedinOptimal) results.push(linkedinOptimal)
  }

  // Instagram
  if (instagramResult.data && instagramResult.data.length > 0) {
    const igSlots = analyzeTimeSlots(instagramResult.data, 'instagram')
    const igOptimal = findOptimalTime(igSlots, 'instagram')
    if (igOptimal) results.push(igOptimal)
  }

  return results
}

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土']

export function formatOptimalTimes(
  times: readonly OptimalPostingTime[],
): string {
  if (times.length === 0) return 'Not enough data for timing optimization.'

  return times
    .map((t) => {
      const dayName = DAY_NAMES[t.dayOfWeek]
      const confidenceEmoji =
        t.confidence === 'high'
          ? ':white_check_mark:'
          : t.confidence === 'medium'
            ? ':large_yellow_circle:'
            : ':white_circle:'
      return `${confidenceEmoji} ${t.platform.toUpperCase()}: ${dayName}曜 JST ${t.bestHourJst}:00 (avg ${(t.avgEngagementRate * 100).toFixed(1)}%)`
    })
    .join('\n')
}
