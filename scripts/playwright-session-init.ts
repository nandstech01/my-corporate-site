/**
 * Playwright Session Init
 *
 * 既存のChromeプロファイルを使ってX.comのcookieをエクスポートするスクリプト。
 * 出力されたcookieをGitHub Secretsに X_PLAYWRIGHT_SESSION として設定する。
 *
 * Usage:
 *   npx tsx scripts/playwright-session-init.ts
 *
 * 1. 既存Chromeプロファイルでブラウザが起動（ログイン済み状態）
 * 2. x.comに自動アクセスしてcookieを取得
 * 3. cookieがJSON形式でstdoutに出力される + Supabaseに保存
 */

import { chromium } from 'playwright'
import * as readline from 'readline'
import * as path from 'path'
import * as os from 'os'

async function main() {
  process.stdout.write('Starting Playwright Session Init...\n\n')

  // 一時プロファイルで実際のChromeバイナリを使う
  // channel: 'chrome' でシステムChromeを利用（Google OAuthブロック回避）
  const tmpProfileDir = path.join(os.tmpdir(), 'playwright-session-init')
  const context = await chromium.launchPersistentContext(tmpProfileDir, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1280, height: 720 },
    args: [
      '--disable-blink-features=AutomationControlled',
    ],
  })

  const page = context.pages()[0] ?? await context.newPage()
  await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 30_000 })

  process.stdout.write('Browser opened at https://x.com/home (using existing Chrome profile)\n')
  process.stdout.write('If you are logged in, press Enter to export cookies.\n')
  process.stdout.write('If not logged in, log in manually then press Enter.\n\n')

  // Wait for user to press Enter
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  await new Promise<void>((resolve) => {
    rl.question('Press Enter to export cookies...', () => {
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

  await context.close()
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n`)
  process.exit(1)
})
