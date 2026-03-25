/**
 * Zenn Engagement Collector
 *
 * Fetches engagement data (likes, comments) for published Zenn articles
 * using Zenn's public API.
 */

import { createClient } from '@supabase/supabase-js'

const ZENN_API_BASE = 'https://zenn.dev/api/articles'

interface ZennArticleResponse {
  readonly article: {
    readonly liked_count: number
    readonly comments_count: number
    readonly slug: string
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key)
}

export async function collectZennEngagement(): Promise<number> {
  const supabase = getSupabase()

  // Get all Zenn posts with an external_id (slug)
  const { data: posts, error } = await supabase
    .from('cross_post_analytics')
    .select('id, external_id, external_url')
    .eq('platform', 'zenn')
    .eq('status', 'posted')
    .not('external_id', 'is', null)

  if (error || !posts) {
    process.stdout.write(`[zenn-engagement] Query error: ${error?.message}\n`)
    return 0
  }

  let updated = 0

  for (const post of posts) {
    try {
      const slug = post.external_id as string
      const response = await fetch(`${ZENN_API_BASE}/${slug}`)

      if (!response.ok) {
        process.stdout.write(`[zenn-engagement] Failed to fetch ${slug}: HTTP ${response.status}\n`)
        continue
      }

      const data = (await response.json()) as ZennArticleResponse

      const { error: updateError } = await supabase
        .from('cross_post_analytics')
        .update({
          likes: data.article.liked_count,
          comments: data.article.comments_count,
          engagement_fetched_at: new Date().toISOString(),
        })
        .eq('id', post.id)

      if (!updateError) {
        updated++
        process.stdout.write(
          `[zenn-engagement] ${slug}: ${data.article.liked_count} likes, ${data.article.comments_count} comments\n`,
        )
      }

      // Rate limiting: 500ms between requests
      await new Promise((r) => setTimeout(r, 500))
    } catch (e) {
      process.stdout.write(`[zenn-engagement] Error: ${e instanceof Error ? e.message : e}\n`)
    }
  }

  return updated
}
