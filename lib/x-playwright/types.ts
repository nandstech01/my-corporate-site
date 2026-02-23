/**
 * X Playwright Scraper Types
 *
 * Playwright経由でスクレイピングしたX (Twitter) データの型定義。
 * API型とは分離し、scraper層でのみ使用する。
 */

export interface ScrapedTweet {
  readonly id: string
  readonly text: string
  readonly authorUsername?: string
  readonly createdAt?: string
  readonly metrics: ScrapedMetrics
}

export interface ScrapedMetrics {
  readonly likes: number
  readonly retweets: number
  readonly replies: number
  readonly bookmarks: number
  /** Playwright経由では取得不可（公開ページに非表示）。常に0。 */
  readonly impressions: 0
}

export interface ScrapedProfile {
  readonly username: string
  readonly displayName?: string
  readonly followersCount: number
  readonly followingCount: number
  readonly tweetCount: number
}

export interface ScrapedUserId {
  readonly id: string
  readonly username: string
}

export interface PlaywrightContext {
  readonly browser: import('playwright').Browser
  readonly context: import('playwright').BrowserContext
}

export interface SessionData {
  readonly cookies_json: string
  readonly updated_at: string
}
