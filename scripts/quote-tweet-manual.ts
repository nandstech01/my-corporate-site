/**
 * 手動引用ツイート投稿スクリプト
 * 環境変数: QUOTE_TEXT, QUOTE_TWEET_ID
 */
import { quoteTweet, isTwitterConfigured } from '../lib/x-api/client'

async function main() {
  const text = process.env.QUOTE_TEXT
  const tweetId = process.env.QUOTE_TWEET_ID

  if (!text || !tweetId) {
    throw new Error('QUOTE_TEXT and QUOTE_TWEET_ID are required')
  }

  if (!isTwitterConfigured()) {
    throw new Error('Twitter API credentials not configured')
  }

  console.log(`Posting quote tweet...`)
  console.log(`Text: ${text}`)
  console.log(`Quoting: ${tweetId}`)

  const result = await quoteTweet(text, tweetId)

  if (!result.success) {
    throw new Error(`Quote tweet failed: ${result.error}`)
  }

  console.log(`Posted! ${result.tweetUrl}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
