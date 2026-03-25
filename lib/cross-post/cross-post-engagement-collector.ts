/**
 * Cross-Post Engagement Collector
 *
 * Orchestrates engagement data collection from Zenn and Qiita.
 * Runs daily via cron.
 */

import { collectZennEngagement } from './zenn-engagement-collector'
import { collectQiitaEngagement } from './qiita-engagement-collector'

export async function runCrossPostEngagementCollector(): Promise<void> {
  process.stdout.write('[cross-post-engagement] Starting collection...\n')

  const [zennCount, qiitaCount] = await Promise.all([
    collectZennEngagement().catch((e) => {
      process.stdout.write(`[cross-post-engagement] Zenn failed: ${e instanceof Error ? e.message : e}\n`)
      return 0
    }),
    collectQiitaEngagement().catch((e) => {
      process.stdout.write(`[cross-post-engagement] Qiita failed: ${e instanceof Error ? e.message : e}\n`)
      return 0
    }),
  ])

  process.stdout.write(
    `[cross-post-engagement] Complete: Zenn=${zennCount}, Qiita=${qiitaCount} articles updated\n`,
  )
}
