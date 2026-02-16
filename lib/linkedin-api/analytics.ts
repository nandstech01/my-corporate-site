/**
 * LinkedIn Analytics API クライアント
 *
 * memberCreatorPostAnalytics API でリアクション・コメント・リシェア・インプレッションを取得。
 * 必要スコープ: r_member_postAnalytics
 */

import { checkTokenExpiry } from './token-store'

// ============================================================
// 型定義
// ============================================================

export interface LinkedInPostMetrics {
  readonly reactions: number
  readonly comments: number
  readonly reshares: number
  readonly impressions: number
}

// ============================================================
// 設定チェック
// ============================================================

export function isLinkedInAnalyticsConfigured(): boolean {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  if (!token) return false

  const status = checkTokenExpiry()
  return status.valid
}

// ============================================================
// メトリクス取得
// ============================================================

async function fetchSingleMetric(
  shareUrn: string,
  queryType: string,
  accessToken: string,
): Promise<number> {
  const encodedEntity = encodeURIComponent(shareUrn)
  const url = `https://api.linkedin.com/rest/memberCreatorPostAnalytics?q=entity&entity=${encodedEntity}&queryType=${queryType}&aggregation=TOTAL`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': '202602',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      signal: controller.signal,
    })

    if (response.status === 403) {
      process.stdout.write(
        `LinkedIn Analytics: 403 for ${queryType} — r_member_postAnalytics scope may be missing\n`,
      )
      return 0
    }

    if (!response.ok) {
      process.stdout.write(
        `LinkedIn Analytics: ${response.status} for ${queryType}\n`,
      )
      return 0
    }

    const data = await response.json()
    const elements = data?.elements ?? []
    if (elements.length === 0) return 0

    return elements[0]?.totalCount ?? elements[0]?.total ?? 0
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(
      `LinkedIn Analytics fetch failed (${queryType}): ${message}\n`,
    )
    return 0
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchLinkedInPostMetrics(
  postId: string,
): Promise<LinkedInPostMetrics | null> {
  if (!isLinkedInAnalyticsConfigured()) return null

  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN!
  const shareUrn = `urn:li:share:${postId}`

  const [reactions, comments, reshares, impressions] = await Promise.all([
    fetchSingleMetric(shareUrn, 'REACTION', accessToken),
    fetchSingleMetric(shareUrn, 'COMMENT', accessToken),
    fetchSingleMetric(shareUrn, 'RESHARE', accessToken),
    fetchSingleMetric(shareUrn, 'IMPRESSION', accessToken),
  ])

  return { reactions, comments, reshares, impressions }
}
