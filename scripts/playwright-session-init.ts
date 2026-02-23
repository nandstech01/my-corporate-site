/**
 * Playwright Session Init
 *
 * ローカルでXにログインし、cookieをエクスポートするスクリプト。
 * 出力されたcookieをGitHub Secretsに X_PLAYWRIGHT_SESSION として設定する。
 *
 * Usage:
 *   npx tsx scripts/playwright-session-init.ts
 *
 * 1. Chromiumが起動してX.comのログインページを開く
 * 2. ユーザーが手動でログインする
 * 3. ログイン完了後にEnterを押す
 * 4. cookieがJSON形式でstdoutに出力される
 */

import { chromium } from 'playwright'
import * as readline from 'readline'

async function main() {
  process.stdout.write('Starting Playwright Session Init...\n\n')

  const browser = await chromium.launch({
    headless: false, // ユーザーが手動ログインするので headful
  })

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
  })

  const page = await context.newPage()
  await page.goto('https://x.com/login')

  process.stdout.write('Browser opened at https://x.com/login\n')
  process.stdout.write('Please log in manually in the browser window.\n')
  process.stdout.write('After login is complete, press Enter here to export cookies.\n\n')

  // Wait for user to press Enter
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  await new Promise<void>((resolve) => {
    rl.question('Press Enter after login is complete...', () => {
      rl.close()
      resolve()
    })
  })

  // Export cookies
  const cookies = await context.cookies()

  // Filter to X-related cookies only
  const xCookies = cookies.filter(
    (c) => c.domain.includes('x.com') || c.domain.includes('twitter.com'),
  )

  const cookieJson = JSON.stringify(xCookies, null, 2)

  process.stdout.write('\n=== Cookie JSON (set as X_PLAYWRIGHT_SESSION secret) ===\n')
  process.stdout.write(cookieJson)
  process.stdout.write('\n=== End of Cookie JSON ===\n')
  process.stdout.write(`\nExported ${xCookies.length} cookies.\n`)
  process.stdout.write(
    'Copy the JSON above and set it as the X_PLAYWRIGHT_SESSION GitHub Secret.\n',
  )

  // Optionally save to Supabase if env vars are available
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    try {
      const { saveSessionCookies } = await import('../lib/x-playwright/session')
      await saveSessionCookies(xCookies)
      process.stdout.write('Cookies also saved to Supabase x_playwright_sessions table.\n')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`Failed to save to Supabase: ${msg}\n`)
    }
  }

  await browser.close()
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n`)
  process.exit(1)
})
