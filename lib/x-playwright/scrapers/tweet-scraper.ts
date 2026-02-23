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

    const metricsData = await tweetEl.evaluate((el) => {
      const likeBtn = el.querySelector('[data-testid="like"]') ?? el.querySelector('[data-testid="unlike"]')
      const retweetBtn = el.querySelector('[data-testid="retweet"]') ?? el.querySelector('[data-testid="unretweet"]')
      const replyBtn = el.querySelector('[data-testid="reply"]')
      const bookmarkBtn = el.querySelector('[data-testid="bookmark"]') ?? el.querySelector('[data-testid="removeBookmark"]')

      function extractCount(btn: Element | null): number {
        if (!btn) return 0
        const aria = btn.getAttribute('aria-label') ?? ''
        const match = aria.match(/([\d,]+)/)
        return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0
      }

      return {
        likes: extractCount(likeBtn),
        retweets: extractCount(retweetBtn),
        replies: extractCount(replyBtn),
        bookmarks: extractCount(bookmarkBtn),
      }
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
