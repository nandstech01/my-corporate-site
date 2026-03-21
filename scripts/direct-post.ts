/**
 * テキストをそのまま直接投稿するスクリプト
 * 環境変数: POST_TEXT
 */
import { postTweet, isTwitterConfigured } from '../lib/x-api/client'

async function main() {
  const text = process.env.POST_TEXT
  if (!text) throw new Error('POST_TEXT is required')
  if (!isTwitterConfigured()) throw new Error('Twitter API credentials not configured')

  console.log(`Posting directly (${text.length} chars)...`)
  const result = await postTweet(text, { longForm: true })
  if (!result.success) throw new Error(`Post failed: ${result.error}`)
  console.log(`Posted! ${result.tweetUrl}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
