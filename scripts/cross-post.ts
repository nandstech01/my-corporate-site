/**
 * Cross-Post CLI Script
 *
 * Distributes nands.tech blog articles to Zenn, Qiita, and note.
 *
 * Usage: npx tsx scripts/cross-post.ts
 * Environment Variables:
 *   CROSS_POST_SLUG      - Article slug (required)
 *   CROSS_POST_PLATFORMS  - Comma-separated platforms: zenn,qiita,note (default: all)
 *   DRY_RUN              - "true" to skip actual posting
 */

import { appendFileSync } from 'fs'
import { crossPostArticle } from '../lib/cross-post/pipeline'
import type { CrossPostPlatform } from '../lib/cross-post/types'

// ============================================================
// Args Parsing
// ============================================================

const VALID_PLATFORMS = new Set<CrossPostPlatform>(['zenn', 'qiita', 'note'])

function parseArgs(): {
  readonly slug: string
  readonly platforms: readonly CrossPostPlatform[]
  readonly dryRun: boolean
} {
  const slug = process.env.CROSS_POST_SLUG
  if (!slug) {
    throw new Error('CROSS_POST_SLUG is required')
  }

  const platformsRaw = process.env.CROSS_POST_PLATFORMS || 'zenn,qiita,note'
  const platforms = platformsRaw
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter((p): p is CrossPostPlatform => VALID_PLATFORMS.has(p as CrossPostPlatform))

  if (platforms.length === 0) {
    throw new Error(`No valid platforms specified. Use: zenn, qiita, note`)
  }

  const dryRun = process.env.DRY_RUN === 'true'

  return { slug, platforms, dryRun }
}

// ============================================================
// GitHub Actions Summary
// ============================================================

function writeSummary(content: string): void {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY
  if (summaryFile) {
    appendFileSync(summaryFile, content + '\n')
  }
}

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  const args = parseArgs()
  process.stdout.write(
    `Cross-post: slug="${args.slug}", platforms=[${args.platforms.join(',')}], dryRun=${args.dryRun}\n`,
  )

  const results = await crossPostArticle({
    slug: args.slug,
    platforms: [...args.platforms],
    dryRun: args.dryRun,
  })

  // GitHub Actions summary
  const summaryLines = [
    '## Cross-Post Results',
    '',
    `**Article:** ${args.slug}`,
    `**Platforms:** ${args.platforms.join(', ')}`,
    `**Dry Run:** ${args.dryRun}`,
    '',
    '| Platform | Status | URL |',
    '|----------|--------|-----|',
    ...results.map((r) => {
      const status = r.success ? 'OK' : 'FAIL'
      const url = r.url ?? r.error ?? '-'
      return `| ${r.platform} | ${status} | ${url} |`
    }),
  ]
  writeSummary(summaryLines.join('\n'))

  // Exit with error if any platform failed
  const hasFailure = results.some((r) => !r.success)
  if (hasFailure) {
    process.exit(1)
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error'
  process.stderr.write(`Fatal error: ${message}\n`)
  process.exit(1)
})
