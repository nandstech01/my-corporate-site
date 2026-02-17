/**
 * クロスプラットフォーム分析
 *
 * x_post_analytics + linkedin_post_analytics + instagram_post_analytics を統合クエリ。
 * 全プラットフォームのパフォーマンスを一元的に分析。
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================
// 型定義
// ============================================================

export interface PlatformSummary {
  readonly platform: 'x' | 'linkedin' | 'instagram'
  readonly postCount: number
  readonly totalImpressions: number
  readonly totalEngagement: number
  readonly avgEngagementRate: number
  readonly topPost: {
    readonly text: string
    readonly engagementRate: number
    readonly postedAt: string
  } | null
}

export interface CrossPlatformReport {
  readonly period: { readonly start: string; readonly end: string }
  readonly platforms: readonly PlatformSummary[]
  readonly funnelMetrics: FunnelMetrics | null
  readonly totalReach: number
  readonly totalEngagement: number
}

export interface FunnelMetrics {
  readonly instagramReach: number
  readonly blogPV: number
  readonly lpVisits: number
  readonly conversionRate: number
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
// プラットフォーム別集計
// ============================================================

async function getXSummary(
  since: string,
): Promise<PlatformSummary> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('x_post_analytics')
    .select('*')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })

  const posts = data ?? []

  if (posts.length === 0) {
    return {
      platform: 'x',
      postCount: 0,
      totalImpressions: 0,
      totalEngagement: 0,
      avgEngagementRate: 0,
      topPost: null,
    }
  }

  const totalImpressions = posts.reduce((s, p) => s + (p.impressions ?? 0), 0)
  const totalEngagement = posts.reduce(
    (s, p) => s + (p.likes ?? 0) + (p.retweets ?? 0) + (p.replies ?? 0),
    0,
  )

  const sorted = [...posts].sort(
    (a, b) => (b.engagement_rate ?? 0) - (a.engagement_rate ?? 0),
  )

  return {
    platform: 'x',
    postCount: posts.length,
    totalImpressions,
    totalEngagement,
    avgEngagementRate:
      posts.reduce((s, p) => s + (p.engagement_rate ?? 0), 0) / posts.length,
    topPost: sorted[0]
      ? {
          text: sorted[0].post_text?.slice(0, 100) ?? '',
          engagementRate: sorted[0].engagement_rate ?? 0,
          postedAt: sorted[0].posted_at ?? '',
        }
      : null,
  }
}

async function getLinkedInSummary(
  since: string,
): Promise<PlatformSummary> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('linkedin_post_analytics')
    .select('*')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })

  const posts = data ?? []

  if (posts.length === 0) {
    return {
      platform: 'linkedin',
      postCount: 0,
      totalImpressions: 0,
      totalEngagement: 0,
      avgEngagementRate: 0,
      topPost: null,
    }
  }

  const totalImpressions = posts.reduce((s, p) => s + (p.impressions ?? 0), 0)
  const totalEngagement = posts.reduce(
    (s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.reposts ?? 0),
    0,
  )

  const engagementRates = posts.map((p) => {
    const impressions = p.impressions ?? 0
    const engagement = (p.likes ?? 0) + (p.comments ?? 0) + (p.reposts ?? 0)
    return impressions > 0 ? engagement / impressions : 0
  })

  const sorted = posts
    .map((p, i) => ({ ...p, calcRate: engagementRates[i] }))
    .sort((a, b) => b.calcRate - a.calcRate)

  return {
    platform: 'linkedin',
    postCount: posts.length,
    totalImpressions,
    totalEngagement,
    avgEngagementRate:
      engagementRates.reduce((s, r) => s + r, 0) / engagementRates.length,
    topPost: sorted[0]
      ? {
          text: sorted[0].post_text?.slice(0, 100) ?? '',
          engagementRate: sorted[0].calcRate,
          postedAt: sorted[0].posted_at ?? '',
        }
      : null,
  }
}

async function getInstagramSummary(
  since: string,
): Promise<PlatformSummary> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('instagram_post_analytics')
    .select('*')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })

  const posts = data ?? []

  if (posts.length === 0) {
    return {
      platform: 'instagram',
      postCount: 0,
      totalImpressions: 0,
      totalEngagement: 0,
      avgEngagementRate: 0,
      topPost: null,
    }
  }

  const totalImpressions = posts.reduce((s, p) => s + (p.impressions ?? 0), 0)
  const totalEngagement = posts.reduce(
    (s, p) =>
      s +
      (p.likes ?? 0) +
      (p.comments ?? 0) +
      (p.saves ?? 0) +
      (p.shares ?? 0) +
      (p.replies ?? 0),
    0,
  )

  const sorted = [...posts].sort(
    (a, b) => (b.engagement_rate ?? 0) - (a.engagement_rate ?? 0),
  )

  return {
    platform: 'instagram',
    postCount: posts.length,
    totalImpressions,
    totalEngagement,
    avgEngagementRate:
      posts.reduce((s, p) => s + (p.engagement_rate ?? 0), 0) / posts.length,
    topPost: sorted[0]
      ? {
          text: sorted[0].caption?.slice(0, 100) ?? '',
          engagementRate: sorted[0].engagement_rate ?? 0,
          postedAt: sorted[0].posted_at ?? '',
        }
      : null,
  }
}

// ============================================================
// 統合レポート
// ============================================================

export async function generateCrossPlatformReport(
  days = 7,
): Promise<CrossPlatformReport> {
  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString()

  const [xSummary, linkedinSummary, instagramSummary] = await Promise.all([
    getXSummary(since),
    getLinkedInSummary(since),
    getInstagramSummary(since),
  ])

  const platforms = [xSummary, linkedinSummary, instagramSummary]
  const totalReach = platforms.reduce((s, p) => s + p.totalImpressions, 0)
  const totalEngagement = platforms.reduce(
    (s, p) => s + p.totalEngagement,
    0,
  )

  return {
    period: {
      start: since,
      end: new Date().toISOString(),
    },
    platforms,
    funnelMetrics: null, // Will be populated when GA integration is added
    totalReach,
    totalEngagement,
  }
}

/**
 * Slackレポート用のマークダウンフォーマット
 */
export function formatCrossPlatformReport(
  report: CrossPlatformReport,
): string {
  const lines: string[] = []

  lines.push(`*Total Reach:* ${report.totalReach.toLocaleString()}`)
  lines.push(
    `*Total Engagement:* ${report.totalEngagement.toLocaleString()}`,
  )
  lines.push('')

  for (const platform of report.platforms) {
    const emoji =
      platform.platform === 'x'
        ? ':bird:'
        : platform.platform === 'linkedin'
          ? ':briefcase:'
          : ':camera:'

    lines.push(`${emoji} *${platform.platform.toUpperCase()}*`)
    lines.push(`  Posts: ${platform.postCount}`)
    lines.push(
      `  Impressions: ${platform.totalImpressions.toLocaleString()}`,
    )
    lines.push(
      `  Engagement: ${platform.totalEngagement.toLocaleString()}`,
    )
    lines.push(
      `  Avg Rate: ${(platform.avgEngagementRate * 100).toFixed(2)}%`,
    )

    if (platform.topPost) {
      lines.push(`  :trophy: "${platform.topPost.text}..."`)
    }

    lines.push('')
  }

  return lines.join('\n')
}
