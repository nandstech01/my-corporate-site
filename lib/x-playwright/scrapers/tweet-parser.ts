/**
 * Shared Tweet DOM Parser
 *
 * tweet要素からテキスト・メトリクス・IDを抽出する共通ロジック。
 * profile-scraper と search-scraper で共有。
 */

import type { Locator } from 'playwright'
import type { ScrapedTweet, ScrapedMetrics } from '../types'

/**
 * data-testid="tweet" 要素からツイートデータを抽出する。
 */
export async function parseTweetElement(
  element: Locator,
): Promise<ScrapedTweet | null> {
  const data = await element.evaluate((el) => {
    // Extract tweet text
    const textEl = el.querySelector('[data-testid="tweetText"]')
    const text = textEl?.textContent ?? ''

    // Extract tweet ID from link
    const timeLink = el.querySelector('a[href*="/status/"] time')?.parentElement
    const href = timeLink?.getAttribute('href') ?? ''
    const idMatch = href.match(/\/status\/(\d+)/)
    const id = idMatch ? idMatch[1] : ''

    // Extract time
    const timeEl = el.querySelector('time')
    const createdAt = timeEl?.getAttribute('datetime') ?? undefined

    // Extract author username
    const authorLink = el.querySelector('[data-testid="User-Name"] a')
    const authorHref = authorLink?.getAttribute('href') ?? ''
    const authorUsername = authorHref.replace(/^\//, '')

    // Extract metrics from aria-labels on action buttons
    const likeBtn =
      el.querySelector('[data-testid="like"]') ??
      el.querySelector('[data-testid="unlike"]')
    const retweetBtn =
      el.querySelector('[data-testid="retweet"]') ??
      el.querySelector('[data-testid="unretweet"]')
    const replyBtn = el.querySelector('[data-testid="reply"]')
    const bookmarkBtn =
      el.querySelector('[data-testid="bookmark"]') ??
      el.querySelector('[data-testid="removeBookmark"]')

    function extractCount(btn: Element | null): number {
      if (!btn) return 0
      const aria = btn.getAttribute('aria-label') ?? ''
      const match = aria.match(/([\d,]+)/)
      return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0
    }

    return {
      id,
      text,
      createdAt,
      authorUsername,
      likes: extractCount(likeBtn),
      retweets: extractCount(retweetBtn),
      replies: extractCount(replyBtn),
      bookmarks: extractCount(bookmarkBtn),
    }
  })

  if (!data.id || !data.text) return null

  const metrics: ScrapedMetrics = {
    likes: data.likes,
    retweets: data.retweets,
    replies: data.replies,
    bookmarks: data.bookmarks,
    impressions: 0,
  }

  return {
    id: data.id,
    text: data.text,
    authorUsername: data.authorUsername || undefined,
    createdAt: data.createdAt,
    metrics,
  }
}
