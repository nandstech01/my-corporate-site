/**
 * X Account Monitor
 *
 * 30分毎に公式アカウントの新規ツイートをポーリングし、
 * 引用RT機会をスコアリングして x_quote_opportunities テーブルに保存する。
 */

import { createClient } from '@supabase/supabase-js'
import { getUserTimeline, resolveUserId } from '../x-api/client'
import { scrapeUserTimeline, scrapeUserId } from '../x-playwright/scrapers/profile-scraper'
import { closePlaywright, bufferApiFallback, flushApiFallbackNotifications } from '../x-playwright'
import { rankOpportunity } from './opportunity-ranker'
import type { MonitoredAccountRow } from './types'

// ============================================================
// Supabase Client
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
// Minimum opportunity score threshold
// ============================================================

const MIN_OPPORTUNITY_SCORE = 0.4

// ============================================================
// Primary Source URL Extraction
// ============================================================

/** Extract non-Twitter URLs from tweet text (docs, blog posts, announcements) */
function extractPrimarySourceUrl(text: string): string | null {
  const urlPattern = /https?:\/\/[^\s)]+/g
  const urls = text.match(urlPattern)
  if (!urls) return null

  // Filter out x.com/twitter.com links and t.co shortened links
  const externalUrls = urls.filter((url) =>
    !url.includes('x.com/') &&
    !url.includes('twitter.com/') &&
    !url.includes('t.co/'),
  )

  // Prefer official documentation / blog URLs
  const priorityDomains = [
    'anthropic.com', 'code.claude.com', 'claude.ai',
    'openai.com', 'ai.google', 'deepmind.google',
    'github.com', 'arxiv.org',
  ]

  const priorityUrl = externalUrls.find((url) =>
    priorityDomains.some((domain) => url.includes(domain)),
  )

  return priorityUrl ?? externalUrls[0] ?? null
}

// ============================================================
// Resolve missing account IDs
// ============================================================

async function resolveAccountIds(): Promise<void> {
  const supabase = getSupabase()

  const { data: unresolved, error } = await supabase
    .from('x_monitored_accounts')
    .select('id, username, x_user_id')
    .eq('is_active', true)
    .or('x_user_id.eq.,x_user_id.is.null')

  if (error) {
    throw new Error(`Failed to fetch unresolved accounts: ${error.message}`)
  }

  if (!unresolved || unresolved.length === 0) return

  for (const account of unresolved) {
    // Playwright first, API fallback
    const scraped = await scrapeUserId(account.username)
    const result = scraped.id
      ? scraped
      : await resolveUserId(account.username)

    if (result.id) {
      await supabase
        .from('x_monitored_accounts')
        .update({ x_user_id: result.id })
        .eq('id', account.id)

      process.stdout.write(
        `Monitor: Resolved @${account.username} → ${result.id}${scraped.id ? ' (Playwright)' : ' (API fallback)'}\n`,
      )
    } else {
      process.stdout.write(
        `Monitor: Failed to resolve @${account.username}: ${result.error}\n`,
      )
    }
  }
}

// ============================================================
// Process single account
// ============================================================

async function processAccount(
  account: MonitoredAccountRow,
): Promise<number> {
  if (!account.x_user_id) {
    process.stdout.write(
      `Monitor: Skipping @${account.username} (no x_user_id)\n`,
    )
    return 0
  }

  const supabase = getSupabase()

  // Playwright first, API fallback
  const scraped = await scrapeUserTimeline(account.username, { maxResults: 10 })

  // If Playwright succeeded and returned tweets, use them
  // Otherwise fall back to API
  let usedPlaywright = false
  let tweets: readonly {
    readonly id: string
    readonly text: string
    readonly createdAt?: string
    readonly likes: number
    readonly retweets: number
    readonly replies: number
  }[]

  if (!scraped.error && scraped.tweets.length > 0) {
    usedPlaywright = true
    // Filter by sinceId if provided
    const sinceId = account.last_checked_tweet_id
    tweets = scraped.tweets
      .filter((t) => !sinceId || t.id > sinceId)
      .map((t) => ({
        id: t.id,
        text: t.text,
        createdAt: t.createdAt,
        likes: t.metrics.likes,
        retweets: t.metrics.retweets,
        replies: t.metrics.replies,
      }))
  } else {
    // API fallback — notify
    bufferApiFallback({
      consumer: 'x-account-monitor',
      reason: scraped.error ?? 'No tweets from Playwright',
      detail: `@${account.username}`,
    })

    const timeline = await getUserTimeline(account.x_user_id, {
      sinceId: account.last_checked_tweet_id ?? undefined,
      maxResults: 10,
    })

    if (timeline.error) {
      process.stdout.write(
        `Monitor: Error fetching @${account.username}: ${timeline.error}\n`,
      )
      return 0
    }

    tweets = timeline.tweets.map((t) => ({
      id: t.id,
      text: t.text,
      createdAt: t.createdAt,
      likes: t.publicMetrics?.likeCount ?? 0,
      retweets: t.publicMetrics?.retweetCount ?? 0,
      replies: t.publicMetrics?.replyCount ?? 0,
    }))
  }

  if (tweets.length === 0) {
    return 0
  }

  if (usedPlaywright) {
    process.stdout.write(`Monitor: @${account.username} fetched via Playwright\n`)
  }

  let insertedCount = 0
  let latestTweetId = account.last_checked_tweet_id

  for (const tweet of tweets) {
    // Track latest tweet ID for pagination
    if (!latestTweetId || tweet.id > latestTweetId) {
      latestTweetId = tweet.id
    }

    // Calculate age in minutes
    const tweetTime = tweet.createdAt
      ? new Date(tweet.createdAt).getTime()
      : Date.now()
    const ageMinutes = Math.max((Date.now() - tweetTime) / 60_000, 1)

    const score = rankOpportunity(
      {
        text: tweet.text,
        likes: tweet.likes,
        retweets: tweet.retweets,
        replies: tweet.replies,
      },
      account.monitor_priority,
      ageMinutes,
    )

    // Only insert if score meets threshold
    if (score.composite >= MIN_OPPORTUNITY_SCORE) {
      // Extract primary source URLs from tweet text (docs, blog posts, announcements)
      const sourceUrl = extractPrimarySourceUrl(tweet.text)

      const { error: insertError } = await supabase
        .from('x_quote_opportunities')
        .upsert(
          {
            original_tweet_id: tweet.id,
            original_author_id: account.x_user_id,
            original_author_username: account.username,
            original_text: tweet.text,
            original_likes: tweet.likes,
            original_retweets: tweet.retweets,
            original_replies: tweet.replies,
            detected_at: tweet.createdAt ?? new Date().toISOString(),
            opportunity_score: score.composite,
            freshness_score: score.freshness,
            relevance_score: score.topicRelevance,
            engagement_velocity: score.engagementVelocity,
            source_url: sourceUrl,
            status: 'pending',
          },
          { onConflict: 'original_tweet_id' },
        )

      if (insertError) {
        process.stdout.write(
          `Monitor: Insert error for tweet ${tweet.id}: ${insertError.message}\n`,
        )
      } else {
        insertedCount++
      }
    }
  }

  // Update last_checked_tweet_id
  if (latestTweetId) {
    await supabase
      .from('x_monitored_accounts')
      .update({
        last_checked_tweet_id: latestTweetId,
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', account.id)
  }

  return insertedCount
}

// ============================================================
// Expire stale opportunities
// ============================================================

async function expireStaleOpportunities(): Promise<void> {
  const supabase = getSupabase()

  // Expire opportunities older than 6 hours that haven't been processed
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

  await supabase
    .from('x_quote_opportunities')
    .update({ status: 'expired', skip_reason: 'Expired: older than 6 hours' })
    .eq('status', 'pending')
    .lt('detected_at', sixHoursAgo)
}

// ============================================================
// Main entry point
// ============================================================

export async function runAccountMonitor(): Promise<void> {
  process.stdout.write('X Account Monitor: Starting\n')

  // Step 1: Resolve any unresolved account IDs
  try {
    await resolveAccountIds()
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Monitor: resolveAccountIds failed: ${msg}\n`)
  }

  // Step 2: Fetch active monitored accounts
  const supabase = getSupabase()
  const { data: accounts, error } = await supabase
    .from('x_monitored_accounts')
    .select('*')
    .eq('is_active', true)
    .order('monitor_priority', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch monitored accounts: ${error.message}`)
  }

  if (!accounts || accounts.length === 0) {
    process.stdout.write('Monitor: No active monitored accounts\n')
    return
  }

  // Step 3: Process each account
  let totalInserted = 0
  for (const account of accounts as MonitoredAccountRow[]) {
    try {
      const count = await processAccount(account)
      if (count > 0) {
        process.stdout.write(
          `Monitor: @${account.username} → ${count} new opportunities\n`,
        )
      }
      totalInserted += count
    } catch (accountError) {
      const msg = accountError instanceof Error ? accountError.message : 'Unknown error'
      process.stdout.write(
        `Monitor: Error processing @${account.username}: ${msg}\n`,
      )
    }
  }

  // Step 4: Expire stale opportunities
  try {
    await expireStaleOpportunities()
  } catch {
    // Best-effort
  }

  // Close Playwright browser (saves updated cookies to Supabase)
  await closePlaywright()

  // Flush batched API fallback notifications as single summary
  await flushApiFallbackNotifications()

  process.stdout.write(
    `X Account Monitor: Complete. ${totalInserted} new opportunities from ${accounts.length} accounts\n`,
  )
}
