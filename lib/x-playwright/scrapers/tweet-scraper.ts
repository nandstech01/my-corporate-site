/**
 * Tweet Metrics Scraper
 *
 * singleTweet metrics取得のPlaywright置換。
 * engagement-learner が使用する個別ツイートのメトリクスを取得する。
 */

import { openPage } from '../browser'
import type { ScrapedMetrics } from '../types'

/**
 * 個別ツイートのメトリクスをスクレイピングする。
 * client.v2.singleTweet(tweetId, { 'tweet.fields': ['public_metrics'] }) の置換。
 */
export async function scrapeTweetMetrics(
  tweetId: string,
): Promise<{
  readonly metrics?: ScrapedMetrics
  readonly error?: string
}> {
  const page = await openPage(`https://x.com/i/web/status/${tweetId}`)
  if (!page) {
    return { error: 'Playwright: failed to open tweet page' }
  }

  try {
    // Wait for the tweet to render
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 15_000 })

    // The first tweet element on the status page is the main tweet
    const tweetEl = page.locator('[data-testid="tweet"]').first()

    // NOTE: no inner function declarations here — tsx/esbuild (keepNames)
    // wraps named in-page functions with a __name() helper that doesn't exist
    // in the browser context ("__name is not defined" broke every scrape).
    const metricsData = await tweetEl.evaluate((el) => {
      const pairs: Array<[string, string | null]> = [
        ['[data-testid="like"]', '[data-testid="unlike"]'],
        ['[data-testid="retweet"]', '[data-testid="unretweet"]'],
        ['[data-testid="reply"]', null],
        ['[data-testid="bookmark"]', '[data-testid="removeBookmark"]'],
      ]
      const counts: number[] = []
      for (const [a, b] of pairs) {
        const btn = el.querySelector(a) || (b ? el.querySelector(b) : null)
        const aria = btn ? btn.getAttribute('aria-label') || '' : ''
        const m = aria.match(/([\d,]+)/)
        counts.push(m ? parseInt(m[1].replace(/,/g, ''), 10) : 0)
      }
      return { likes: counts[0], retweets: counts[1], replies: counts[2], bookmarks: counts[3] }
    })

    return {
      metrics: {
        ...metricsData,
        impressions: 0,
      },
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { error: `Playwright scrape failed: ${msg}` }
  } finally {
    await page.close()
  }
}
