import { config } from 'dotenv'
config({ path: '.env.local' })

import { getPlaywrightContext, closePlaywright, openPage } from '../lib/x-playwright/browser'

async function main(): Promise<void> {
  const ctx = await getPlaywrightContext()
  if (!ctx) { console.error('no ctx'); process.exit(1) }

  const page = await openPage('https://x.com/compose/post')
  if (!page) { console.error('no page'); await closePlaywright(); process.exit(1) }

  await page.waitForTimeout(4000)
  console.log('URL after open:', page.url())

  const textarea = page.locator('[data-testid="tweetTextarea_0"]').first()
  await textarea.waitFor({ state: 'visible', timeout: 10_000 })
  await textarea.click()
  await page.waitForTimeout(400)
  await page.keyboard.type(`デバッグテスト ${Date.now()}`, { delay: 30 })
  await page.waitForTimeout(2000)

  const text = await textarea.innerText().catch(() => '(failed)')
  console.log('textarea innerText:', JSON.stringify(text))

  const button = page.locator('[data-testid="tweetButtonInline"]').first()
  const buttonExists = await button.count()
  console.log('tweetButtonInline count:', buttonExists)
  if (buttonExists > 0) {
    const disabled = await button.isDisabled()
    const visible = await button.isVisible()
    const ariaDisabled = await button.getAttribute('aria-disabled')
    const html = await button.innerHTML().catch(() => '(err)')
    console.log('  disabled:', disabled, '| visible:', visible, '| aria-disabled:', ariaDisabled)
    console.log('  innerHTML (head):', html.slice(0, 200))
  }

  // Try the other button
  const button2 = page.locator('[data-testid="tweetButton"]').first()
  const c2 = await button2.count()
  console.log('tweetButton count:', c2)
  if (c2 > 0) {
    const disabled = await button2.isDisabled()
    const visible = await button2.isVisible()
    const ariaDisabled = await button2.getAttribute('aria-disabled')
    console.log('  disabled:', disabled, '| visible:', visible, '| aria-disabled:', ariaDisabled)
  }

  await page.screenshot({ path: '/tmp/x-compose-debug.png', fullPage: false })
  console.log('screenshot: /tmp/x-compose-debug.png')

  await page.close()
  await closePlaywright()
}

main().catch(async (e) => { console.error(e); await closePlaywright().catch(() => null); process.exit(1) })
