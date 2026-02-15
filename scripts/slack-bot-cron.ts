/**
 * Slack Bot Cron Jobs Runner
 *
 * GitHub Actions から実行されるエントリーポイント。
 * CRON_JOB 環境変数またはスケジュールに基づいてジョブを選択。
 */

import { runDailySuggestion } from '../lib/slack-bot/proactive/daily-suggestion'
import { runWeeklyReport } from '../lib/slack-bot/proactive/weekly-report'
import { runEngagementLearner } from '../lib/slack-bot/proactive/engagement-learner'
import { runTrendingCollector } from '../lib/x-trending-collector/trending-collector'
import { runLinkedInSourceCollector } from '../lib/linkedin-source-collector/source-collector'
import { runLinkedInSuggestion } from '../lib/slack-bot/proactive/linkedin-suggestion'

type JobName =
  | 'daily-suggestion'
  | 'weekly-report'
  | 'engagement-learner'
  | 'trending-collector'
  | 'linkedin-source-collector'
  | 'linkedin-suggestion'

function detectJob(): JobName {
  const explicit = process.env.CRON_JOB
  if (
    explicit === 'daily-suggestion' ||
    explicit === 'weekly-report' ||
    explicit === 'engagement-learner' ||
    explicit === 'trending-collector' ||
    explicit === 'linkedin-source-collector' ||
    explicit === 'linkedin-suggestion'
  ) {
    return explicit
  }

  // Auto-detect based on current time (UTC)
  const now = new Date()
  const utcHour = now.getUTCHours()
  const dayOfWeek = now.getUTCDay()

  // JST 9:00 = UTC 0:00 → daily suggestion
  if (utcHour === 0) {
    return 'daily-suggestion'
  }

  // JST 10:00 = UTC 1:00
  if (utcHour === 1) {
    // Monday → weekly report
    if (dayOfWeek === 1) {
      return 'weekly-report'
    }
    // Tue-Sun → LinkedIn suggestion
    return 'linkedin-suggestion'
  }

  // JST 22:00 = UTC 13:00 → LinkedIn source collector
  if (utcHour === 13) {
    return 'linkedin-source-collector'
  }

  // JST 23:00 = UTC 14:00 → trending collector
  if (utcHour === 14) {
    return 'trending-collector'
  }

  // JST 00:00 = UTC 15:00 → engagement learner
  if (utcHour === 15) {
    return 'engagement-learner'
  }

  return 'daily-suggestion'
}

const jobRunners: Record<JobName, () => Promise<void>> = {
  'daily-suggestion': runDailySuggestion,
  'weekly-report': runWeeklyReport,
  'engagement-learner': runEngagementLearner,
  'trending-collector': runTrendingCollector,
  'linkedin-source-collector': runLinkedInSourceCollector,
  'linkedin-suggestion': runLinkedInSuggestion,
}

async function main() {
  const jobName = detectJob()
  const runner = jobRunners[jobName]

  process.stdout.write(`Running job: ${jobName}\n`)

  try {
    await runner()
    process.stdout.write(`Job ${jobName} completed successfully\n`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stderr.write(`Job ${jobName} failed: ${message}\n`)
    process.exit(1)
  }
}

main()
