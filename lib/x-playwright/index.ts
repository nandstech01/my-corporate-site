/**
 * X Playwright Module
 *
 * X (Twitter) のREAD操作をPlaywright経由で実行する。
 * API呼び出しを削減してコスト最適化する。
 *
 * エクスポート:
 * - browser: getPlaywrightContext, closePlaywright, openPage
 * - session: loadSessionCookies, saveSessionCookies
 * - types: ScrapedTweet, ScrapedProfile, etc.
 *
 * Scrapers は個別インポート:
 * - lib/x-playwright/scrapers/profile-scraper
 * - lib/x-playwright/scrapers/tweet-scraper
 * - lib/x-playwright/scrapers/search-scraper
 */

export { getPlaywrightContext, closePlaywright, openPage } from './browser'
export { loadSessionCookies, saveSessionCookies } from './session'
export {
  notifySessionExpired,
  notifyApiFallback,
  notifyErrorPage,
} from './notifier'
export type {
  ScrapedTweet,
  ScrapedMetrics,
  ScrapedProfile,
  ScrapedUserId,
  PlaywrightContext,
  SessionData,
} from './types'
