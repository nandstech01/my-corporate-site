/**
 * Instagram Insights API クライアント
 *
 * Story・フィード投稿のメトリクスを取得。
 * 必要スコープ: instagram_basic
 */

import { checkTokenExpiry } from './token-store'

// ============================================================
// 型定義
// ============================================================

export interface InstagramStoryMetrics {
  readonly reach: number
  readonly impressions: number
  readonly taps_forward: number
  readonly taps_back: number
  readonly exits: number
  readonly replies: number
}

export interface InstagramFeedMetrics {
  readonly reach: number
  readonly impressions: number
  readonly likes: number
  readonly comments: number
  readonly saves: number
  readonly shares: number
}

// ============================================================
// 設定チェック
// ============================================================

export function isInstagramAnalyticsConfigured(): boolean {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return false

  const status = checkTokenExpiry()
  return status.valid
}

// ============================================================
// メトリクス取得
// ============================================================

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'

async function fetchInsights(
  mediaId: string,
  metrics: readonly string[],
): Promise<Record<string, number>> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!accessToken) return {}

  const metricsStr = metrics.join(',')
  const url = `${GRAPH_API_BASE}/${mediaId}/insights?metric=${metricsStr}&access_token=${accessToken}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, { signal: controller.signal })

    if (!response.ok) {
      process.stdout.write(
        `Instagram Insights: ${response.status} for ${mediaId}\n`,
      )
      return {}
    }

    const data = (await response.json()) as {
      data: readonly { name: string; values: readonly { value: number }[] }[]
    }

    const result: Record<string, number> = {}
    for (const metric of data.data) {
      result[metric.name] = metric.values[0]?.value ?? 0
    }

    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Instagram Insights fetch failed: ${message}\n`)
    return {}
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchStoryMetrics(
  mediaId: string,
): Promise<InstagramStoryMetrics | null> {
  if (!isInstagramAnalyticsConfigured()) return null

  const metrics = await fetchInsights(mediaId, [
    'reach',
    'impressions',
    'taps_forward',
    'taps_back',
    'exits',
    'replies',
  ])

  if (Object.keys(metrics).length === 0) return null

  return {
    reach: metrics.reach ?? 0,
    impressions: metrics.impressions ?? 0,
    taps_forward: metrics.taps_forward ?? 0,
    taps_back: metrics.taps_back ?? 0,
    exits: metrics.exits ?? 0,
    replies: metrics.replies ?? 0,
  }
}

export async function fetchFeedMetrics(
  mediaId: string,
): Promise<InstagramFeedMetrics | null> {
  if (!isInstagramAnalyticsConfigured()) return null

  const metrics = await fetchInsights(mediaId, [
    'reach',
    'impressions',
    'likes',
    'comments',
    'saved',
    'shares',
  ])

  if (Object.keys(metrics).length === 0) return null

  return {
    reach: metrics.reach ?? 0,
    impressions: metrics.impressions ?? 0,
    likes: metrics.likes ?? 0,
    comments: metrics.comments ?? 0,
    saves: metrics.saved ?? 0,
    shares: metrics.shares ?? 0,
  }
}
