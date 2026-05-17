/**
 * Phase 0: Inspect X.com compose page DOM via Playwright locators (no in-page eval).
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { getPlaywrightContext, closePlaywright, openPage } from '../lib/x-playwright/browser'

async function probe(page: any, label: string, selector: string): Promise<void> {
  const count = await page.locator(selector).count()
  console.log(`  [${label}] ${selector} -> count=${count}`)
  if (count > 0 && count <= 5) {
    for (let i = 0; i < count; i++) {
      const el = page.locator(selector).nth(i)
      const testId = await el.getAttribute('data-testid').catch(() => null)
      const ariaLabel = await el.getAttribute('aria-label').catch(() => null)
      const role = await el.getAttribute('role').catch(() => null)
      const placeholder = await el.getAttribute('placeholder').catch(() => null)
      const tag = await el.evaluate((n: Element) => n.tagName.toLowerCase()).catch(() => 'unknown')
      console.log(`     [${i}] tag=${tag} testid=${testId ?? '-'} aria=${ariaLabel ?? '-'} role=${role ?? '-'} placeholder=${placeholder ?? '-'}`)
    }
  }
}

async function main(): Promise<void> {
  const ctx = await getPlaywrightContext()
  if (!ctx) {
    console.error('FAIL: no Playwright context')
    process.exit(1)
  }

  const page = await openPage('https://x.com/compose/post')
  if (!page) {
    console.error('FAIL: openPage returned null')
    await closePlaywright()
    process.exit(1)
  }

  await page.waitForTimeout(4000)
  console.log(`\nfinal URL: ${page.url()}`)
  console.log(`title: ${await page.title()}`)
  console.log('')

  console.log('--- Textareas / editable ---')
  await probe(page, 'contenteditable', '[contenteditable="true"]')
  await probe(page, 'role=textbox', '[role="textbox"]')
  await probe(page, 'testid prefix tweetTextarea', '[data-testid^="tweetTextarea"]')

  console.log('')
  console.log('--- Likely post buttons ---')
  await probe(page, 'testid prefix tweetButton', '[data-testid^="tweetButton"]')
  await probe(page, 'testid postBtn', '[data-testid="postButton"]')
  await probe(page, 'testid inline', '[data-testid="tweetButtonInline"]')

  await page.close()
  await closePlaywright()
}

main().catch(async (err) => {
  console.error('Fatal:', err)
  await closePlaywright().catch(() => null)
  process.exit(1)
})
