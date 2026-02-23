/**
 * Playwright Browser Management
 *
 * Chromiumの起動・終了とanti-detection設定を管理。
 * セッションcookieを注入してログイン状態を再現する。
 */

import { chromium, type Browser, type BrowserContext } from 'playwright'
import { loadSessionCookies, saveSessionCookies, isLoginWall, isErrorPage } from './session'
import { notifySessionExpired, notifyErrorPage } from './notifier'
import type { PlaywrightContext } from './types'

let _sharedContext: PlaywrightContext | null = null

/** login wall検知後にtrueにしてシングルトンを無効化。以降のscraper即fallback。 */
let _sessionInvalid = false

/**
 * Playwright BrowserContextを取得する（シングルトン）。
 * cron job内で複数scraperが使う場合、同一contextを共有してリソース節約。
 * セッション切れの場合はnullを返す。
 */
export async function getPlaywrightContext(): Promise<PlaywrightContext | null> {
  if (_sessionInvalid) {
    return null
  }

  if (_sharedContext) return _sharedContext

  const cookies = await loadSessionCookies()
  if (!cookies) {
    process.stdout.write('Playwright: no session cookies available\n')
    return null
  }

  try {
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    })

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
    })

    // Anti-detection: webdriver flag をfalseに
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      })
    })

    // セッションcookieを注入
    await context.addCookies([...cookies])

    _sharedContext = { browser, context }
    return _sharedContext
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Playwright: browser launch failed: ${msg}\n`)
    return null
  }
}

/**
 * ブラウザを閉じてリソースを解放。Cookie更新をSupabaseに書き戻す。
 */
export async function closePlaywright(): Promise<void> {
  if (!_sharedContext) {
    _sessionInvalid = false
    return
  }

  try {
    // Cookie更新を書き戻し（自動リフレッシュ）— セッション無効時はスキップ
    if (!_sessionInvalid) {
      const cookies = await _sharedContext.context.cookies()
      if (cookies.length > 0) {
        await saveSessionCookies(cookies)
      }
    }
  } catch {
    // Best-effort
  }

  try {
    await _sharedContext.context.close()
    await _sharedContext.browser.close()
  } catch {
    // Best-effort
  }

  _sharedContext = null
  _sessionInvalid = false
}

/**
 * ページを開いてログイン状態を検証。
 * login wallが検出された場合はnullを返す。
 */
export async function openPage(
  url: string,
): Promise<import('playwright').Page | null> {
  const ctx = await getPlaywrightContext()
  if (!ctx) return null

  const page = await ctx.context.newPage()

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })

    // Login wall check
    const pageUrl = page.url()
    const pageTitle = await page.title()
    if (isLoginWall(pageUrl, pageTitle)) {
      process.stdout.write(
        `Playwright: login wall detected at ${pageUrl}\n`,
      )
      _sessionInvalid = true
      await page.close()
      // Best-effort notification
      notifySessionExpired({
        detectedAt: new Date().toISOString(),
        pageUrl,
      }).catch(() => {})
      return null
    }

    // Error page check
    const errorType = isErrorPage(pageUrl, pageTitle)
    if (errorType) {
      process.stdout.write(
        `Playwright: error page detected (${errorType}) at ${pageUrl}\n`,
      )
      await page.close()
      // Best-effort notification
      notifyErrorPage({ pageUrl, errorType }).catch(() => {})
      return null
    }

    return page
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Playwright: page navigation failed: ${msg}\n`)
    await page.close()
    return null
  }
}
