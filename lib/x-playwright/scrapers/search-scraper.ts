/**
 * Search Scraper
 *
 * buzz-collector の v2.search 置換。
 * X の検索ページからツイートを取得する。
 */

import { openPage } from '../browser'
import { parseTweetElement } from './tweet-parser'
import type { ScrapedTweet } from '../types'

/**
 * X検索をスクレイピングする。
 * buzz-collector が使用する v2.search の置換。
 */
export async function scrapeSearch(
  query: string,
  options?: { maxResults?: number },
): Promise<{
  readonly tweets: readonly ScrapedTweet[]
  readonly error?: string
}> {
  const maxResults = options?.maxResults ?? 10
  const encodedQuery = encodeURIComponent(query)
  const page = await openPage(
    `https://x.com/search?q=${encodedQuery}&src=typed_query&f=live`,
  )
  if (!page) {
    return { tweets: [], error: 'Playwright: failed to open search page' }
  }

  try {
    // Wait for search results
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 15_000 })

    // Scroll to load more if needed
    let scrollAttempts = 0
    while (scrollAttempts < 3) {
      const tweetCount = await page.locator('[data-testid="tweet"]').count()
      if (tweetCount >= maxResults) break
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
    return { tweets: [], error: `Playwright search scrape failed: ${msg}` }
  } finally {
    await page.close()
  }
}
