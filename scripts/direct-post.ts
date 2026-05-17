/**
 * テキストをそのまま直接投稿するスクリプト
 * 環境変数: POST_TEXT
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { postTweet, isTwitterConfigured } from '../lib/x-api/client'

async function main() {
  const text = process.env.POST_TEXT
  if (!text) throw new Error('POST_TEXT is required')

  // When TWITTER_USE_PLAYWRIGHT=true, the X API credentials aren't required
  // (Playwright uses the session cookie instead).
  const usePlaywright = process.env.TWITTER_USE_PLAYWRIGHT === 'true'
  if (!usePlaywright && !isTwitterConfigured()) {
    throw new Error('Twitter API credentials not configured (and TWITTER_USE_PLAYWRIGHT is not enabled)')
  }

  console.log(`Posting directly (${text.length} chars, via ${usePlaywright ? 'Playwright' : 'API'})...`)
  const result = await postTweet(text, { longForm: true })
  if (!result.success) throw new Error(`Post failed: ${result.error}`)
  console.log(`Posted! ${result.tweetUrl ?? '(no URL captured)'}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
