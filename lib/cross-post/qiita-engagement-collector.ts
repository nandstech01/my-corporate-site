/**
 * Qiita Engagement Collector
 *
 * Fetches engagement data (likes, stocks, views) for published Qiita articles
 * using Qiita API v2.
 */

import { createClient } from '@supabase/supabase-js'

const QIITA_API_BASE = 'https://qiita.com/api/v2'

interface QiitaItemResponse {
  readonly likes_count: number
  readonly stocks_count: number
  readonly page_views_count: number | null
  readonly comments_count: number
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key)
}

export async function collectQiitaEngagement(): Promise<number> {
  const token = process.env.QIITA_ACCESS_TOKEN
  if (!token) {
    process.stdout.write('[qiita-engagement] QIITA_ACCESS_TOKEN not set, skipping\n')
    return 0
  }

  const supabase = getSupabase()

  // Get all Qiita posts with an external_id
  const { data: posts, error } = await supabase
    .from('cross_post_analytics')
    .select('id, external_id, external_url')
    .eq('platform', 'qiita')
    .eq('status', 'posted')
    .not('external_id', 'is', null)

  if (error || !posts) {
    process.stdout.write(`[qiita-engagement] Query error: ${error?.message}\n`)
    return 0
  }

  let updated = 0

  for (const post of posts) {
    try {
      const itemId = post.external_id as string
      const response = await fetch(`${QIITA_API_BASE}/items/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        process.stdout.write(`[qiita-engagement] Failed to fetch ${itemId}: HTTP ${response.status}\n`)
        continue
      }

      const data = (await response.json()) as QiitaItemResponse

      const { error: updateError } = await supabase
        .from('cross_post_analytics')
        .update({
          likes: data.likes_count,
          comments: data.comments_count,
          stocks: data.stocks_count,
          views: data.page_views_count ?? 0,
          engagement_fetched_at: new Date().toISOString(),
        })
        .eq('id', post.id)

      if (!updateError) {
        updated++
        process.stdout.write(
          `[qiita-engagement] ${itemId}: ${data.likes_count} likes, ${data.stocks_count} stocks, ${data.page_views_count ?? 0} views\n`,
        )
      }

      // Rate limiting: 500ms between requests
      await new Promise((r) => setTimeout(r, 500))
    } catch (e) {
      process.stdout.write(`[qiita-engagement] Error: ${e instanceof Error ? e.message : e}\n`)
    }
  }

  return updated
}
