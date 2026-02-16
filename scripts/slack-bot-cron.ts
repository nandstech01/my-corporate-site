/**
 * Slack Bot Cron Jobs Runner
 *
 * GitHub Actions から実行されるエントリーポイント。
 * CRON_JOB 環境変数またはスケジュールに基づいてジョブを選択。
 */

import { runDailySuggestion } from '../lib/slack-bot/proactive/daily-suggestion'
import { runWeeklyReport } from '../lib/slack-bot/proactive/weekly-report'
import { runEngagementLearner } from '../lib/slack-bot/proactive/engagement-learner'
import { runLinkedInEngagementLearner } from '../lib/slack-bot/proactive/linkedin-engagement-learner'
import { runTrendingCollector } from '../lib/x-trending-collector/trending-collector'
import { runLinkedInSourceCollector } from '../lib/linkedin-source-collector/source-collector'
import { runLinkedInAutoPost } from '../lib/slack-bot/proactive/linkedin-auto-post'
import { runLinkedInModelRetrainer } from '../lib/slack-bot/proactive/linkedin-model-retrainer'

type JobName =
  | 'daily-suggestion'
  | 'weekly-report'
  | 'engagement-learner'
  | 'linkedin-engagement-learner'
  | 'trending-collector'
  | 'linkedin-source-collector'
  | 'linkedin-auto-post'
  | 'linkedin-model-retrainer'

function detectJob(): JobName {
  const explicit = process.env.CRON_JOB
  if (
    explicit === 'daily-suggestion' ||
    explicit === 'weekly-report' ||
    explicit === 'engagement-learner' ||
    explicit === 'linkedin-engagement-learner' ||
    explicit === 'trending-collector' ||
    explicit === 'linkedin-source-collector' ||
    explicit === 'linkedin-auto-post' ||
    explicit === 'linkedin-model-retrainer'
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

  // JST 10:00 = UTC 1:00 Monday → weekly report
  if (utcHour === 1 && dayOfWeek === 1) {
    return 'weekly-report'
  }

  // JST 6,14,22 = UTC 21,5,13 → LinkedIn source collector (1日3回)
  if (utcHour === 21 || (utcHour === 5 && dayOfWeek !== 1)) {
    return 'linkedin-source-collector'
  }

  // JST 8-22 every 2h = UTC 23,1,3,5,7,9,11,13 → LinkedIn auto-post
  const linkedinAutoPostHours = [23, 1, 3, 7, 9, 11]
  if (linkedinAutoPostHours.includes(utcHour)) {
    return 'linkedin-auto-post'
  }

  // UTC 13 → source collector (JST 22) or auto-post
  // Source collector takes priority at UTC 13
  if (utcHour === 13) {
    return 'linkedin-source-collector'
  }

  // JST 23:00 = UTC 14:00 → trending collector
  if (utcHour === 14) {
    return 'trending-collector'
  }

  // JST 00:00 = UTC 15:00 → LinkedIn engagement learner
  if (utcHour === 15) {
    return 'linkedin-engagement-learner'
  }

  // JST 01:00 = UTC 16:00 → X engagement learner
  if (utcHour === 16) {
    return 'engagement-learner'
  }

  // JST 03:00 = UTC 18:00 → LinkedIn ML model retrainer
  if (utcHour === 18) {
    return 'linkedin-model-retrainer'
  }

  return 'daily-suggestion'
}

const jobRunners: Record<JobName, () => Promise<void>> = {
  'daily-suggestion': runDailySuggestion,
  'weekly-report': runWeeklyReport,
  'engagement-learner': runEngagementLearner,
  'linkedin-engagement-learner': runLinkedInEngagementLearner,
  'trending-collector': runTrendingCollector,
  'linkedin-source-collector': runLinkedInSourceCollector,
  'linkedin-auto-post': runLinkedInAutoPost,
  'linkedin-model-retrainer': runLinkedInModelRetrainer,
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
