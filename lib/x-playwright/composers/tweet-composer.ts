/**
 * Tweet Composer — post to X via Playwright browser automation.
 *
 * Replaces the API-based `postTweet` path to avoid X Pay-per-use charges
 * (HTTP 402 CreditsDepleted). Uses the existing authenticated Playwright
 * context + session cookies (see `lib/x-playwright/browser.ts`,
 * `lib/x-playwright/session.ts`).
 *
 * Selectors confirmed via `scripts/inspect-x-compose.ts` (2026-05-17):
 *   - textarea: [data-testid="tweetTextarea_0"]
 *   - post button: [data-testid="tweetButtonInline"]
 */

import { closePlaywright, getPlaywrightContext, openPage } from '../browser'
import { isLoginWall, isErrorPage } from '../session'
import { bufferApiFallback, notifySessionExpired, notifyErrorPage } from '../notifier'

export interface ComposeTweetInput {
  readonly text: string
  /** If true, navigate and fill the textarea but stop before clicking POST. */
  readonly dryRun?: boolean
}

export interface ComposeTweetResult {
  readonly success: boolean
  readonly tweetId?: string
  readonly tweetUrl?: string
  readonly error?: string
  readonly via: 'playwright'
  readonly durationMs: number
}

const COMPOSE_URL = 'https://x.com/compose/post'
const TEXTAREA_SELECTOR = '[data-testid="tweetTextarea_0"]'
// On /compose/post the active button is `tweetButton`. `tweetButtonInline`
// belongs to the always-present inline composer in the side column and
// stays disabled.
const POST_BUTTON_SELECTOR = '[data-testid="tweetButton"]'
// X uses /i/web/status/<id> or username/status/<id> after post
const POST_SUCCESS_URL_RE = /\/status\/(\d{6,})/

const HUMAN_DELAY_MIN_MS = 250
const HUMAN_DELAY_MAX_MS = 600

function randomDelay(): number {
  return HUMAN_DELAY_MIN_MS + Math.floor(Math.random() * (HUMAN_DELAY_MAX_MS - HUMAN_DELAY_MIN_MS))
}

/**
 * Compose and post a tweet via the X.com web UI.
 *
 * Failure modes covered:
 *   - No session cookies / login wall → notifySessionExpired + fail
 *   - Page returns an error page → notifyErrorPage + fail
 *   - Compose UI never loads → fail with timeout
 *   - Post button stays disabled (text rejected) → fail with reason
 *   - Post succeeds but no redirect detected → return without tweetId
 */
export async function composeAndPostTweet(input: ComposeTweetInput): Promise<ComposeTweetResult> {
  const start = Date.now()
  const text = input.text.trim()

  if (!text) {
    return { success: false, error: 'Empty tweet text', via: 'playwright', durationMs: 0 }
  }

  const ctx = await getPlaywrightContext()
  if (!ctx) {
    await notifySessionExpired({ detectedAt: new Date().toISOString() }).catch(() => null)
    return {
      success: false,
      error: 'No Playwright context (session expired or cookies missing)',
      via: 'playwright',
      durationMs: Date.now() - start,
    }
  }

  const page = await openPage(COMPOSE_URL)
  if (!page) {
    return {
      success: false,
      error: 'openPage returned null (login wall or error page)',
      via: 'playwright',
      durationMs: Date.now() - start,
    }
  }

  try {
    // Let the compose UI settle
    await page.waitForTimeout(randomDelay() + 1000)

    // Login wall check (in case the cookie was good enough for the redirect
    // but the page itself bounced us to login)
    const currentUrl = page.url()
    const currentTitle = await page.title().catch(() => '')
    if (isLoginWall(currentUrl, currentTitle)) {
      await notifySessionExpired({ detectedAt: new Date().toISOString(), pageUrl: currentUrl }).catch(() => null)
      return { success: false, error: `Login wall: ${currentUrl}`, via: 'playwright', durationMs: Date.now() - start }
    }

    const errorState = isErrorPage(currentUrl, currentTitle)
    if (errorState) {
      await notifyErrorPage({ pageUrl: currentUrl, errorType: errorState }).catch(() => null)
      return { success: false, error: `Error page: ${errorState}`, via: 'playwright', durationMs: Date.now() - start }
    }

    // Wait for the textarea
    const textarea = page.locator(TEXTAREA_SELECTOR).first()
    await textarea.waitFor({ state: 'visible', timeout: 15_000 })
    await page.waitForTimeout(randomDelay())

    // Focus the textarea by clicking it
    await textarea.click()
    await page.waitForTimeout(randomDelay())

    // Type the text. pressSequentially fires real keyboard events so React's
    // controlled state (used by X's draft editor) picks up the change and
    // enables the post button. `keyboard.type()` does the same here.
    await page.keyboard.type(text, { delay: 15 + Math.floor(Math.random() * 25) })

    // X uses Draft.js / Lexical — the post button transitions enabled
    // ~500-1500ms after the last keystroke. Give it ample time.
    await page.waitForTimeout(1500)

    // Sanity check: read back textarea content to confirm input landed
    const actualText = await textarea.innerText().catch(() => '')
    if (!actualText || !actualText.trim().startsWith(text.slice(0, 20))) {
      return {
        success: false,
        error: `Text did not land in textarea. Expected prefix: "${text.slice(0, 20)}", got: "${actualText.slice(0, 40)}"`,
        via: 'playwright',
        durationMs: Date.now() - start,
      }
    }

    if (input.dryRun === true) {
      return {
        success: true,
        tweetId: 'dry-run',
        via: 'playwright',
        durationMs: Date.now() - start,
      }
    }

    // Click the post button
    const postButton = page.locator(POST_BUTTON_SELECTOR).first()
    await postButton.waitFor({ state: 'visible', timeout: 8000 })

    // Wait for the button to become enabled (X uses Draft.js / controlled
    // state — the button transitions from disabled to enabled some time
    // after the last keystroke). Poll up to 5 seconds.
    let enabled = false
    for (let i = 0; i < 10; i++) {
      const disabled = await postButton.isDisabled().catch(() => true)
      if (!disabled) { enabled = true; break }
      await page.waitForTimeout(500)
    }
    if (!enabled) {
      return {
        success: false,
        error: 'Post button stayed disabled for 5s (text not registered or rejected)',
        via: 'playwright',
        durationMs: Date.now() - start,
      }
    }

    // Capture the CreateTweet GraphQL response so we can extract the tweet ID
    // even when X stays on /compose/ after a successful post (no URL redirect).
    let capturedTweetId: string | undefined
    const responseHandler = (resp: { url(): string; ok(): boolean; json(): Promise<unknown> }): void => {
      const url = resp.url()
      if (!url.includes('/graphql/') || !/CreateTweet|CreateNoteTweet/i.test(url)) return
      if (!resp.ok()) return
      resp
        .json()
        .then((json) => {
          const id = extractTweetIdFromCreateResponse(json)
          if (id) capturedTweetId = id
        })
        .catch(() => null)
    }
    page.on('response', responseHandler)

    try {
      await postButton.click()

      // Wait for either:
      //  1) URL redirect to /status/<id>
      //  2) Compose URL no longer present (modal dismissed → returned to home)
      //  3) Captured a CreateTweet response
      //  4) Timeout (treat as best-effort success)
      const deadline = Date.now() + 15_000
      while (Date.now() < deadline) {
        if (capturedTweetId) break
        const currentUrl = page.url()
        if (POST_SUCCESS_URL_RE.test(currentUrl) || !currentUrl.includes('/compose/')) break
        await page.waitForTimeout(250)
      }
    } finally {
      page.off('response', responseHandler)
    }

    const finalUrl = page.url()

    // Prefer the captured ID from the GraphQL response (most reliable)
    if (capturedTweetId) {
      return {
        success: true,
        tweetId: capturedTweetId,
        tweetUrl: `https://x.com/i/web/status/${capturedTweetId}`,
        via: 'playwright',
        durationMs: Date.now() - start,
      }
    }

    // Fallback: URL pattern
    const idMatch = finalUrl.match(POST_SUCCESS_URL_RE)
    if (idMatch) {
      return {
        success: true,
        tweetId: idMatch[1],
        tweetUrl: finalUrl,
        via: 'playwright',
        durationMs: Date.now() - start,
      }
    }

    // Modal closed without status URL — most likely posted but ID lost.
    if (!finalUrl.includes('/compose/')) {
      return {
        success: true,
        via: 'playwright',
        durationMs: Date.now() - start,
      }
    }

    // Still on compose page → the post almost certainly failed.
    return {
      success: false,
      error: `Stayed on compose URL after click: ${finalUrl}`,
      via: 'playwright',
      durationMs: Date.now() - start,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    bufferApiFallback({ consumer: 'tweet-composer', reason: 'playwright_exception', detail: message })
    return {
      success: false,
      error: message,
      via: 'playwright',
      durationMs: Date.now() - start,
    }
  } finally {
    await page.close().catch(() => null)
  }
}

/**
 * Convenience: close the shared Playwright context after a batch of posts.
 * Call this from scripts that finish their work (cron entry points).
 */
export async function shutdownTweetComposer(): Promise<void> {
  await closePlaywright().catch(() => null)
}

/**
 * Walk an unknown JSON tree (X's GraphQL CreateTweet response) and find the
 * `rest_id` field on the created tweet. Resilient to X tweaking the shape.
 */
function extractTweetIdFromCreateResponse(json: unknown): string | undefined {
  const stack: unknown[] = [json]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || typeof current !== 'object') continue
    const obj = current as Record<string, unknown>
    // Common path: data.create_tweet.tweet_results.result.rest_id
    if (typeof obj.rest_id === 'string' && /^\d{6,}$/.test(obj.rest_id)) {
      // Only return if this object also looks like a tweet (has typename "Tweet" or "TweetWithVisibilityResults")
      const typename = obj.__typename
      if (typeof typename === 'string' && /Tweet/.test(typename)) {
        return obj.rest_id
      }
    }
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') stack.push(v)
    }
  }
  return undefined
}
