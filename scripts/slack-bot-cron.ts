/**
 * Slack Bot Cron Jobs Runner
 *
 * GitHub Actions から実行されるエントリーポイント。
 * CRON_JOB 環境変数またはスケジュールに基づいてジョブを選択。
 */

import { traceable } from 'langsmith/traceable'
import { runDailySuggestion } from '../lib/slack-bot/proactive/daily-suggestion'
import { runWeeklyReport } from '../lib/slack-bot/proactive/weekly-report'
import { runEngagementLearner } from '../lib/slack-bot/proactive/engagement-learner'
import { runLinkedInEngagementLearner } from '../lib/slack-bot/proactive/linkedin-engagement-learner'
import { runTrendingCollector } from '../lib/x-trending-collector/trending-collector'
import { runLinkedInSourceCollector } from '../lib/linkedin-source-collector/source-collector'
import { runLinkedInAutoPost } from '../lib/slack-bot/proactive/linkedin-auto-post'
import { runLinkedInModelRetrainer } from '../lib/slack-bot/proactive/linkedin-model-retrainer'
import { runBlogRSSMonitor } from '../lib/blog-generation/rss-blog-monitor'
import { runInstagramEngagementLearner } from '../lib/slack-bot/proactive/instagram-engagement-learner'
import { findUnstoriedBlogs } from '../lib/instagram-story-generation/trigger'

async function runInstagramStoryAutoCheck(): Promise<void> {
  const unstoriedBlogs = await findUnstoriedBlogs()
  if (unstoriedBlogs.length === 0) {
    process.stdout.write('Instagram Story Auto-Check: all blogs have stories\n')
    return
  }
  process.stdout.write(
    `Instagram Story Auto-Check: ${unstoriedBlogs.length} blog(s) without stories:\n`,
  )
  for (const blog of unstoriedBlogs) {
    process.stdout.write(`  - ${blog.slug}: ${blog.title}\n`)
  }
  // Notification only — actual generation is triggered via Slack bot
  const { sendMessage } = await import('../lib/slack-bot/slack-client')
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  if (channel && unstoriedBlogs.length > 0) {
    const slugList = unstoriedBlogs
      .slice(0, 5)
      .map((b) => `• ${b.title} (\`${b.slug}\`)`)
      .join('\n')
    await sendMessage({
      channel,
      text: `:camera: *未ストーリー化ブログ ${unstoriedBlogs.length}件*\n${slugList}\n\n\`generate_instagram_story\` で生成できます`,
    })
  }
}

type JobName =
  | 'daily-suggestion'
  | 'weekly-report'
  | 'engagement-learner'
  | 'linkedin-engagement-learner'
  | 'instagram-engagement-learner'
  | 'instagram-story-auto-check'
  | 'trending-collector'
  | 'linkedin-source-collector'
  | 'linkedin-auto-post'
  | 'linkedin-model-retrainer'
  | 'blog-rss-monitor'

function detectJob(): JobName {
  const explicit = process.env.CRON_JOB
  if (
    explicit === 'daily-suggestion' ||
    explicit === 'weekly-report' ||
    explicit === 'engagement-learner' ||
    explicit === 'linkedin-engagement-learner' ||
    explicit === 'instagram-engagement-learner' ||
    explicit === 'instagram-story-auto-check' ||
    explicit === 'trending-collector' ||
    explicit === 'linkedin-source-collector' ||
    explicit === 'linkedin-auto-post' ||
    explicit === 'linkedin-model-retrainer' ||
    explicit === 'blog-rss-monitor'
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

  // JST 00:30 = UTC 15:30 → Instagram engagement learner
  // (shares UTC 15 slot, run after LinkedIn if minute >= 30)
  // In practice, use explicit CRON_JOB=instagram-engagement-learner

  // JST 01:00 = UTC 16:00 → X engagement learner
  if (utcHour === 16) {
    return 'engagement-learner'
  }

  // JST 12:00 = UTC 03:00 → Instagram story auto-check
  if (utcHour === 3) {
    return 'instagram-story-auto-check'
  }

  // JST 03:00 = UTC 18:00 → LinkedIn ML model retrainer
  if (utcHour === 18) {
    return 'linkedin-model-retrainer'
  }

  // JST 13,19,5 = UTC 4,10,20 → Blog RSS monitor
  // Note: shifted from UTC 2,8 to UTC 4,10 to avoid GitHub Actions cron collision
  if (utcHour === 4 || utcHour === 10 || utcHour === 20) {
    return 'blog-rss-monitor'
  }

  // Fallback: 明示的な CRON_JOB が指定されていない場合で
  // どの時間帯にもマッチしない場合はエラーにする（重複投稿防止）
  throw new Error(
    `No job matched for UTC hour ${utcHour} (day ${dayOfWeek}). Set CRON_JOB explicitly.`,
  )
}

const jobRunners: Record<JobName, () => Promise<void>> = {
  'daily-suggestion': runDailySuggestion,
  'weekly-report': runWeeklyReport,
  'engagement-learner': runEngagementLearner,
  'linkedin-engagement-learner': runLinkedInEngagementLearner,
  'instagram-engagement-learner': runInstagramEngagementLearner,
  'instagram-story-auto-check': runInstagramStoryAutoCheck,
  'trending-collector': runTrendingCollector,
  'linkedin-source-collector': runLinkedInSourceCollector,
  'linkedin-auto-post': runLinkedInAutoPost,
  'linkedin-model-retrainer': runLinkedInModelRetrainer,
  'blog-rss-monitor': runBlogRSSMonitor,
}

function createTracedCronJob(jobName: JobName) {
  return traceable(
    async (jobFn: () => Promise<void>): Promise<void> => {
      await jobFn()
    },
    {
      name: `cron-${jobName}`,
      tags: ['cron', jobName],
      metadata: { jobName },
    },
  )
}

async function main() {
  const jobName = detectJob()
  const runner = jobRunners[jobName]

  process.stdout.write(`Running job: ${jobName}\n`)

  try {
    const runCronJob = createTracedCronJob(jobName)
    await runCronJob(runner)
    process.stdout.write(`Job ${jobName} completed successfully\n`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stderr.write(`Job ${jobName} failed: ${message}\n`)
    process.exit(1)
  }
}

main()
