/**
 * X Engagement Collector
 *
 * x_post_analytics テーブルに投稿されたツイートのエンゲージメントを収集する。
 * posted_at が 24-48h 前で、まだ取得されていない投稿を対象にする。
 * GitHub Actions cron (0 22,10 * * * = JST 7:00, 19:00) で実行。
 */

import { createClient } from '@supabase/supabase-js'
import { scrapeTweetMetrics } from '../../x-playwright/scrapers/tweet-scraper'
import { closePlaywright, bufferApiFallback, flushApiFallbackNotifications } from '../../x-playwright'

interface PostRow {
  readonly id: string
  readonly tweet_id: string
  readonly tweet_url: string | null
  readonly likes: number
  readonly retweets: number
  readonly replies: number
  readonly impressions: number
  readonly posted_at: string
  readonly fetched_at: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  return createClient(url, key)
}

export async function collectXEngagement(): Promise<void> {
  process.stdout.write('X Engagement Collector: Starting\n')

  const supabase = getSupabase()
  const now = Date.now()
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const fortyEightHoursAgo = new Date(now - 48 * 60 * 60 * 1000).toISOString()

  // Query posts that were posted 24-48h ago and have not been fetched yet
  const { data: posts, error: queryError } = await supabase
    .from('x_post_analytics')
    .select('id, tweet_id, tweet_url, likes, retweets, replies, impressions, posted_at, fetched_at')
    .gte('posted_at', fortyEightHoursAgo)
    .lte('posted_at', twentyFourHoursAgo)
    .or('fetched_at.eq.posted_at,and(likes.eq.0,retweets.eq.0,replies.eq.0)')
    .limit(20)

  if (queryError) {
    process.stdout.write(`X Engagement Collector: query error: ${queryError.message}\n`)
    return
  }

  if (!posts || posts.length === 0) {
    process.stdout.write('X Engagement Collector: No posts to collect\n')
    return
  }

  process.stdout.write(`X Engagement Collector: Found ${posts.length} posts to collect\n`)

  const typedPosts = posts as PostRow[]
  let collected = 0
  let failed = 0

  try {
    for (const post of typedPosts) {
      try {
        const scraped = await scrapeTweetMetrics(post.tweet_id)

        if (!scraped.metrics) {
          bufferApiFallback({
            consumer: 'x-engagement-collector',
            reason: scraped.error ?? 'No metrics from Playwright',
            detail: `tweet ${post.tweet_id}`,
          })
          failed++
          process.stdout.write(`  [SKIP] ${post.tweet_id}: ${scraped.error ?? 'no metrics'}\n`)
          continue
        }

        const { likes, retweets, replies } = scraped.metrics
        const impressions = post.impressions > 0 ? post.impressions : 0
        const rawEngagement = likes + retweets + replies
        const engagementRate = impressions > 0
          ? (likes + retweets * 2 + replies * 3) / impressions
          : rawEngagement > 0
            ? rawEngagement / 1000 // Fallback: normalize raw score
            : 0

        const { error: updateError } = await supabase
          .from('x_post_analytics')
          .update({
            likes,
            retweets,
            replies,
            engagement_rate: engagementRate,
            fetched_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        if (updateError) {
          process.stdout.write(`  [ERROR] ${post.tweet_id}: update failed: ${updateError.message}\n`)
          failed++
          continue
        }

        collected++
        process.stdout.write(
          `  [OK] ${post.tweet_id}: ${likes} likes, ${retweets} RT, ${replies} replies (rate=${engagementRate.toFixed(4)})\n`,
        )
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        process.stdout.write(`  [ERROR] ${post.tweet_id}: ${msg}\n`)
        failed++
      }
    }
  } finally {
    await closePlaywright()
    await flushApiFallbackNotifications()
  }

  process.stdout.write(
    `X Engagement Collector: Complete. ${collected} collected, ${failed} failed out of ${typedPosts.length}\n`,
  )
}
