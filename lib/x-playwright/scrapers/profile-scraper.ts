/**
 * Profile & Timeline Scraper
 *
 * getUserTimeline, resolveUserId, getMyProfile のPlaywright置換。
 * data-testid属性（2年以上安定）でDOM解析する。
 */

import { openPage } from '../browser'
import { parseTweetElement } from './tweet-parser'
import type { ScrapedTweet, ScrapedProfile } from '../types'

/**
 * ユーザーのタイムラインをスクレイピングする。
 * getUserTimeline() の置換。
 */
export async function scrapeUserTimeline(
  username: string,
  options?: { maxResults?: number },
): Promise<{
  readonly tweets: readonly ScrapedTweet[]
  readonly error?: string
}> {
  const maxResults = options?.maxResults ?? 10
  const page = await openPage(`https://x.com/${username}`)
  if (!page) {
    return { tweets: [], error: 'Playwright: failed to open profile page' }
  }

  try {
    // Wait for tweets to load
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 15_000 })

    // Scroll to load more tweets if needed
    const targetCount = Math.min(maxResults, 20)
    let scrollAttempts = 0
    while (scrollAttempts < 3) {
      const tweetCount = await page.locator('[data-testid="tweet"]').count()
      if (tweetCount >= targetCount) break
      await page.evaluate(() => window.scrollBy(0, 800))
      await page.waitForTimeout(1500)
      scrollAttempts++
    }

    const tweetElements = page.locator('[data-testid="tweet"]')
    const count = Math.min(await tweetElements.count(), maxResults)

    const tweets: ScrapedTweet[] = []

    for (let i = 0; i < count; i++) {
      const tweet = tweetElements.nth(i)
      try {
        const parsedTweet = await parseTweetElement(tweet)
        if (parsedTweet) {
          tweets.push(parsedTweet)
        }
      } catch {
        // Skip unparseable tweets
      }
    }

    return { tweets }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { tweets: [], error: `Playwright scrape failed: ${msg}` }
  } finally {
    await page.close()
  }
}

/**
 * ユーザー名からユーザーIDをスクレイピングで解決する。
 * resolveUserId() の置換。
 *
 * X の公開ページではuser IDが直接表示されないが、
 * プロフィール画像URLやAPIコールのレスポンスヘッダから取得可能。
 * ここではページ内の内部リンクやJSONデータから抽出する。
 */
export async function scrapeUserId(
  username: string,
): Promise<{ readonly id?: string; readonly error?: string }> {
  const page = await openPage(`https://x.com/${username}`)
  if (!page) {
    return { error: 'Playwright: failed to open profile page' }
  }

  try {
    // Wait for page to load
    await page.waitForSelector('[data-testid="UserName"]', { timeout: 15_000 })

    // Method 1: Extract from __NEXT_DATA__ or React props
    const userId = await page.evaluate(() => {
      // Try to find user ID from internal state
      const scripts = Array.from(document.querySelectorAll('script'))
      for (const script of scripts) {
        const text = script.textContent ?? ''
        // Look for user ID pattern in embedded JSON
        const match = text.match(/"rest_id"\s*:\s*"(\d+)"/)
        if (match) return match[1]
      }

      return null
    })

    if (userId) {
      return { id: userId }
    }

    return { error: `Could not extract user ID for @${username}` }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { error: `Playwright scrape failed: ${msg}` }
  } finally {
    await page.close()
  }
}

/**
 * 自分のプロフィール情報をスクレイピングする。
 * getMyProfile() の置換。
 */
export async function scrapeProfile(
  username: string,
): Promise<{
  readonly profile?: ScrapedProfile
  readonly error?: string
}> {
  const page = await openPage(`https://x.com/${username}`)
  if (!page) {
    return { error: 'Playwright: failed to open profile page' }
  }

  try {
    await page.waitForSelector('[data-testid="UserName"]', { timeout: 15_000 })

    const profile = await page.evaluate((uname: string) => {
      // Extract display name
      const nameEl = document.querySelector('[data-testid="UserName"]')
      const displayName = nameEl?.querySelector('span')?.textContent ?? uname

      // Extract follower/following counts from profile header links
      const links = Array.from(document.querySelectorAll('a[href*="/followers"], a[href*="/following"], a[href*="/verified_followers"]'))
      let followersCount = 0
      let followingCount = 0

      for (const link of links) {
        const href = link.getAttribute('href') ?? ''
        const text = link.textContent ?? ''
        const numMatch = text.match(/([\d,.]+[KMB]?)\s/)
        if (!numMatch) continue

        const num = parseCount(numMatch[1])
        if (href.includes('/followers')) {
          followersCount = num
        } else if (href.includes('/following')) {
          followingCount = num
        }
      }

      // Extract tweet count from header (if visible)
      // The tweet count appears in the header area, e.g. "1,234 posts"
      const headerElements = Array.from(document.querySelectorAll('h2[role="heading"]'))
      let tweetCount = 0
      for (const h of headerElements) {
        const text = h.textContent ?? ''
        const postMatch = text.match(/([\d,.]+)\s*(?:posts?|ポスト)/)
        if (postMatch) {
          tweetCount = parseInt(postMatch[1].replace(/,/g, ''), 10)
        }
      }

      function parseCount(str: string): number {
        const cleaned = str.replace(/,/g, '')
        if (cleaned.endsWith('K')) return Math.round(parseFloat(cleaned) * 1_000)
        if (cleaned.endsWith('M')) return Math.round(parseFloat(cleaned) * 1_000_000)
        if (cleaned.endsWith('B')) return Math.round(parseFloat(cleaned) * 1_000_000_000)
        return parseInt(cleaned, 10) || 0
      }

      return {
        username: uname,
        displayName,
        followersCount,
        followingCount,
        tweetCount,
      }
    }, username)

    return { profile }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { error: `Playwright scrape failed: ${msg}` }
  } finally {
    await page.close()
  }
}

