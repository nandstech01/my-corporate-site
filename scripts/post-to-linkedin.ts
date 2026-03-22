/**
 * LinkedIn Direct Post Script
 *
 * Usage: npx tsx scripts/post-to-linkedin.ts
 * Environment Variables:
 *   POST_TEXT - Text to post (required)
 *   LINKEDIN_ACCESS_TOKEN - LinkedIn API token
 *   LINKEDIN_PERSON_ID - LinkedIn person URN ID
 */

import { postToLinkedIn } from '../lib/linkedin-api/client'

async function main(): Promise<void> {
  const text = process.env.POST_TEXT
  if (!text) {
    throw new Error('POST_TEXT is required')
  }

  process.stdout.write(`Posting to LinkedIn (${text.length} chars)...\n`)

  const result = await postToLinkedIn({ text })

  if (!result.success) {
    throw new Error(`LinkedIn post failed: ${result.error}`)
  }

  process.stdout.write(`Posted! ${result.postUrl ?? result.postId}\n`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error'
  process.stderr.write(`Fatal error: ${message}\n`)
  process.exit(1)
})
