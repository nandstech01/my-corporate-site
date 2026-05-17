import { config } from 'dotenv'
config({ path: '.env.local' })

import { composeAndPostTweet, shutdownTweetComposer } from '../lib/x-playwright/composers/tweet-composer'

async function main(): Promise<void> {
  console.log('=== Tweet Composer Dry-Run ===')
  const result = await composeAndPostTweet({
    text: `Playwright dry-run テスト ${new Date().toISOString()}`,
    dryRun: true,
  })
  console.log(JSON.stringify(result, null, 2))
  await shutdownTweetComposer()
}

main().catch(async (err) => {
  console.error('FAIL:', err)
  await shutdownTweetComposer().catch(() => null)
  process.exit(1)
})
