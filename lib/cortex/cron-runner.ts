/**
 * CORTEX Cron Runner
 *
 * Entry point for scheduled CORTEX jobs.
 * Called from GitHub Actions with job name as argument.
 *
 * Usage: npx tsx lib/cortex/cron-runner.ts <job-name>
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

const JOB_NAME = process.argv[2]

async function main() {
  console.log(`[cortex-cron] Starting job: ${JOB_NAME}`)
  const startTime = Date.now()

  try {
    switch (JOB_NAME) {
      case 'cortex-platform-rule-collector': {
        const { runPlatformRuleCollector } = await import('./knowledge/platform-rule-collector')
        await runPlatformRuleCollector()
        break
      }
      case 'cortex-viral-structure-analyzer': {
        const { runViralStructureAnalyzer } = await import('./knowledge/viral-structure-analyzer')
        await runViralStructureAnalyzer()
        break
      }
      case 'cortex-temporal-pattern-miner': {
        const { runTemporalPatternMiner } = await import('./knowledge/temporal-pattern-miner')
        await runTemporalPatternMiner()
        break
      }
      case 'cortex-deep-trend-researcher': {
        const { runDeepTrendResearcher } = await import('./knowledge/deep-trend-researcher')
        await runDeepTrendResearcher()
        break
      }
      case 'cortex-auto-improver': {
        const { runAutoImprover } = await import('./discord/auto-improver')
        await runAutoImprover()
        break
      }
      case 'cortex-unified-learner': {
        const { runUnifiedLearner } = await import('./learning/unified-orchestrator')
        await runUnifiedLearner()
        break
      }
      case 'cortex-cross-channel-intelligence': {
        const { runCrossChannelIntelligence } = await import('./learning/cross-channel-intelligence')
        await runCrossChannelIntelligence()
        break
      }
      case 'cortex-line-harness-sync': {
        const { runLineHarnessSync } = await import('./line-harness/data-sync')
        await runLineHarnessSync()
        break
      }
      case 'cortex-line-scoring-bridge': {
        const { runScoringBridge } = await import('./line-harness/scoring-bridge')
        await runScoringBridge()
        break
      }
      case 'cortex-line-buzz-broadcast': {
        const { runBuzzBroadcast } = await import('./line-harness/buzz-broadcaster')
        await runBuzzBroadcast()
        break
      }
      case 'cortex-line-engagement-check': {
        const { runPostEngagementCheck } = await import('./line/post-engagement-checker')
        await runPostEngagementCheck()
        break
      }
      default:
        console.error(`[cortex-cron] Unknown job: ${JOB_NAME}`)
        process.exit(1)
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[cortex-cron] Job ${JOB_NAME} completed in ${elapsed}s`)
  } catch (error) {
    console.error(`[cortex-cron] Job ${JOB_NAME} failed:`, error)
    process.exit(1)
  }
}

main()
