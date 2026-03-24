/**
 * Tweet Reactor CLI Entry Point
 *
 * Usage: npx tsx scripts/tweet-reactor.ts
 *
 * Monitors @AnthropicAI for new tweets and generates reaction threads.
 */

import { runAnthropicReactor } from '../lib/tweet-reactor/anthropic-reactor'

async function main() {
  process.stdout.write('Starting Tweet Reactor...\n')

  try {
    await runAnthropicReactor()
    process.stdout.write('Tweet Reactor completed successfully.\n')
    process.exit(0)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stderr.write(`Tweet Reactor failed: ${message}\n`)
    process.exit(1)
  }
}

main()
