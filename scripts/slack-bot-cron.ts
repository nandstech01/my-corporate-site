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
import { runXModelRetrainer } from '../lib/slack-bot/proactive/x-model-retrainer'
import { runBlogRSSMonitor } from '../lib/blog-generation/rss-blog-monitor'
import { runInstagramEngagementLearner } from '../lib/slack-bot/proactive/instagram-engagement-learner'
import { findUnstoriedBlogs } from '../lib/instagram-story-generation/trigger'
import { runXAutoPost } from '../lib/slack-bot/proactive/x-auto-post'
import { runCalibrator } from '../lib/ai-judge/calibrator'
import { runBuzzCollector } from '../lib/buzz-db/buzz-collector'
import { checkModelDrift } from '../lib/learning/drift-detector'
import { runSafetyEventScanner } from '../lib/safety/pre-generation-guard'
import { runCrossPlatformLearner } from '../lib/learning/cross-platform-learner'
import { runEmailSequences } from '../lib/lead-pipeline/email-sequence-runner'
import { runAccountMonitor } from '../lib/x-account-monitor/monitor'
import { runConversationBuilder } from '../lib/x-conversation/conversation-builder'
import { runGrowthTracker } from '../lib/x-growth/growth-tracker'
import { runThreadsAutoPost } from '../lib/slack-bot/proactive/threads-auto-post'
import { runThreadsEngagementLearner } from '../lib/slack-bot/proactive/threads-engagement-learner'
import { runProactiveDiscussion } from '../lib/x-conversation/proactive-discussion-runner'
import { collectXEngagement } from '../lib/slack-bot/proactive/x-engagement-collector'
import { applyPatternDecay } from '../lib/learning/pattern-bandit'
import { runViralRepost } from '../lib/slack-bot/proactive/viral-repost'
import { runCrossPostEngagementCollector } from '../lib/cross-post/cross-post-engagement-collector'
import { runDailyBuzzThread } from '../lib/daily-buzz/runner'
import { runAnthropicReactor } from '../lib/tweet-reactor/anthropic-reactor'
import { runViralAiRepost } from './viral-ai-repost'
import { runViralThreadsRepost } from './viral-threads-repost'
import { runAutoCarouselPipeline } from '../lib/instagram-carousel/pipeline'
import { runHybridCarouselPipeline } from '../lib/instagram-carousel/hybrid-carousel-pipeline'

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
  | 'x-auto-post'
  | 'ai-judge-calibrator'
  | 'buzz-collector'
  | 'ai-judge-drift-monitor'
  | 'safety-event-scanner'
  | 'cross-platform-learner'
  | 'lead-email-sequences'
  | 'x-account-monitor'
  | 'x-conversation-builder'
  | 'x-growth-tracker'
  | 'threads-auto-post'
  | 'threads-engagement-learner'
  | 'x-proactive-discussion'
  | 'x-engagement-collector'
  | 'x-model-retrainer'
  | 'pattern-decay'
  | 'viral-repost'
  | 'cross-post-engagement-collector'
  | 'daily-buzz-global'
  | 'daily-buzz-claude-code'
  | 'daily-buzz-japan'
  | 'anthropic-tweet-reactor'
  | 'viral-ai-repost'
  | 'viral-threads-repost'
  | 'instagram-carousel-auto-post'
  | 'instagram-hybrid-carousel-auto-post'

const SCHEDULE_TO_JOB: Record<string, JobName> = {
  '0 0 * * *': 'daily-suggestion',
  '0 23,7 * * *': 'linkedin-auto-post',
  '0 1 * * 1': 'weekly-report',
  '0 21,5,13 * * *': 'linkedin-source-collector',
  '0 2 * * *': 'trending-collector',
  '0 7 * * *': 'trending-collector',
  '0 14 * * *': 'trending-collector',
  '0 15 * * *': 'linkedin-engagement-learner',
  '0 16 * * *': 'engagement-learner',
  '0 18 * * *': 'linkedin-model-retrainer',
  '30 15 * * *': 'instagram-engagement-learner',
  '0 3 * * *': 'instagram-story-auto-check',
  '0 4,10,20 * * *': 'blog-rss-monitor',
  '30 21,3,9 * * *': 'x-auto-post',
  '0 17 * * *': 'ai-judge-calibrator',
  '0 21,3,9 * * *': 'buzz-collector',
  '0 19 * * 0': 'ai-judge-drift-monitor',
  '0 19 * * 3': 'cross-platform-learner',
  '30 3,9,15,21 * * *': 'safety-event-scanner',
  '30 0,6,12,18 * * *': 'lead-email-sequences',
  '15 0-14 * * *': 'x-account-monitor',
  '0 3,8,11 * * *': 'x-conversation-builder',
  '0 20 * * *': 'x-growth-tracker',
  '30 23,4,10 * * *': 'threads-auto-post',
  '30 16 * * *': 'threads-engagement-learner',
  '30 0,3,5,7,9,11 * * *': 'x-proactive-discussion',
  '0 22,10 * * *': 'x-engagement-collector',
  '30 18 * * *': 'x-model-retrainer',
  '0 12 * * *': 'viral-repost',
  '0 13 * * *': 'cross-post-engagement-collector',
  '0 23 * * *': 'daily-buzz-global',
  '30 4 * * *': 'daily-buzz-claude-code',
  '0 11 * * *': 'daily-buzz-japan',
  '*/15 0-14 * * *': 'anthropic-tweet-reactor',
  '0 23,5,11 * * *': 'viral-ai-repost',
  '30 23,5,11 * * *': 'viral-threads-repost',
  '45 22 * * 0,2,4,6': 'instagram-carousel-auto-post',
  '45 22 * * 1,3,5': 'instagram-hybrid-carousel-auto-post',
}

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
    explicit === 'blog-rss-monitor' ||
    explicit === 'x-auto-post' ||
    explicit === 'ai-judge-calibrator' ||
    explicit === 'buzz-collector' ||
    explicit === 'ai-judge-drift-monitor' ||
    explicit === 'safety-event-scanner' ||
    explicit === 'cross-platform-learner' ||
    explicit === 'lead-email-sequences' ||
    explicit === 'x-account-monitor' ||
    explicit === 'x-conversation-builder' ||
    explicit === 'x-growth-tracker' ||
    explicit === 'threads-auto-post' ||
    explicit === 'threads-engagement-learner' ||
    explicit === 'x-proactive-discussion' ||
    explicit === 'x-engagement-collector' ||
    explicit === 'x-model-retrainer' ||
    explicit === 'pattern-decay' ||
    explicit === 'cross-post-engagement-collector' ||
    explicit === 'daily-buzz-global' ||
    explicit === 'daily-buzz-claude-code' ||
    explicit === 'daily-buzz-japan' ||
    explicit === 'anthropic-tweet-reactor' ||
    explicit === 'viral-ai-repost' ||
    explicit === 'viral-threads-repost' ||
    explicit === 'instagram-carousel-auto-post' ||
    explicit === 'instagram-hybrid-carousel-auto-post'
  ) {
    return explicit
  }

  // CRON_SCHEDULE から判定（GitHub Actions scheduled trigger）
  const schedule = process.env.CRON_SCHEDULE
  if (schedule) {
    const mapped = SCHEDULE_TO_JOB[schedule]
    if (mapped) {
      process.stdout.write(`detectJob: resolved '${mapped}' from CRON_SCHEDULE='${schedule}'\n`)
      return mapped
    }
    process.stdout.write(`detectJob: unknown CRON_SCHEDULE='${schedule}', falling back to time-based\n`)
  }

  // Auto-detect based on current time (UTC)
  const now = new Date()
  const utcHour = now.getUTCHours()
  const utcMinute = now.getUTCMinutes()
  const dayOfWeek = now.getUTCDay()

  // JST 9:00 = UTC 0:00 → daily suggestion
  if (utcHour === 0) {
    return 'daily-suggestion'
  }

  // JST 10:00 = UTC 1:00 Monday → weekly report
  if (utcHour === 1 && dayOfWeek === 1) {
    return 'weekly-report'
  }

  // JST 14,22 = UTC 5,13 → LinkedIn source collector (fallback for non-shared hours)
  // Note: UTC 21 is shared with buzz-collector and x-auto-post; resolved via CRON_SCHEDULE
  if ((utcHour === 5 && dayOfWeek !== 1) || utcHour === 13) {
    return 'linkedin-source-collector'
  }

  // JST 8-22 every 2h = UTC 23,1,3,5,7,9,11,13 → LinkedIn auto-post
  const linkedinAutoPostHours = [23, 7]
  if (linkedinAutoPostHours.includes(utcHour)) {
    return 'linkedin-auto-post'
  }

  // UTC 13 → source collector (JST 22) or auto-post
  // Source collector takes priority at UTC 13
  if (utcHour === 13) {
    return 'linkedin-source-collector'
  }

  // JST 11:00, 16:00, 23:00 = UTC 2:00, 7:00, 14:00 → trending collector (3x/day)
  if (utcHour === 2 || utcHour === 7 || utcHour === 14) {
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
  // Note: UTC 3 is shared with buzz-collector (:00) and x-auto-post (:30)
  // Primary resolution via CRON_SCHEDULE; this fallback is deprioritized
  // instagram-story-auto-check resolved via explicit CRON_JOB or CRON_SCHEDULE

  // JST 03:00 = UTC 18:00 → LinkedIn ML model retrainer
  if (utcHour === 18 && utcMinute < 30) {
    return 'linkedin-model-retrainer'
  }

  // JST 03:30 = UTC 18:30 → X ML model retrainer
  if (utcHour === 18 && utcMinute >= 30) {
    return 'x-model-retrainer'
  }

  // JST 6:30,12:30,18:30 = UTC 21:30,3:30,9:30 → X auto-post (1日3回)
  // Primary resolution via CRON_SCHEDULE; fallback uses minute >= 30 to disambiguate
  if ((utcHour === 21 || utcHour === 3 || utcHour === 9) && utcMinute >= 30) {
    return 'x-auto-post'
  }

  // JST 02:00 = UTC 17:00 → AI Judge calibrator
  if (utcHour === 17) {
    return 'ai-judge-calibrator'
  }

  // JST 04:00 Sunday = UTC 19:00 Sunday → drift monitor
  if (utcHour === 19 && dayOfWeek === 0) {
    return 'ai-judge-drift-monitor'
  }

  // JST 04:00 Wednesday = UTC 19:00 Wednesday → cross-platform learner
  if (utcHour === 19 && dayOfWeek === 3) {
    return 'cross-platform-learner'
  }

  // JST 6:00,12:00,18:00 = UTC 21:00,3:00,9:00 → buzz collector (1日3回)
  // Primary resolution via CRON_SCHEDULE; fallback uses minute < 30 to disambiguate from x-auto-post
  if ((utcHour === 21 || utcHour === 3 || utcHour === 9) && utcMinute < 30) {
    return 'buzz-collector'
  }

  // JST 13,19,5 = UTC 4,10,20 → Blog RSS monitor
  // Note: shifted from UTC 2,8 to UTC 4,10 to avoid GitHub Actions cron collision
  if (utcHour === 4 || utcHour === 10 || utcHour === 20) {
    return 'blog-rss-monitor'
  }

  // JST 05:00 = UTC 20:00 → X growth tracker
  if (utcHour === 20 && dayOfWeek !== -1) {
    // Only if not already matched to blog-rss-monitor
    // This is handled by CRON_SCHEDULE mapping, so only reaches here as fallback
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
  'x-auto-post': runXAutoPost,
  'ai-judge-calibrator': runCalibrator,
  'buzz-collector': async () => { await runBuzzCollector() },
  'ai-judge-drift-monitor': async () => {
    for (const platform of ['x', 'linkedin', 'threads'] as const) {
      const drift = await checkModelDrift(platform)
      process.stdout.write(
        `Drift check [${platform}]: drifted=${drift.drifted}, shouldRetrain=${drift.shouldRetrain}, rollingMAE=${drift.rollingMae}\n`,
      )

      // Auto-retrain if drift threshold exceeded
      if (drift.shouldRetrain) {
        process.stdout.write(`[drift-monitor] Auto-retraining triggered for ${platform}\n`)
        try {
          if (platform === 'linkedin') {
            await runLinkedInModelRetrainer()
          } else if (platform === 'x') {
            await runXModelRetrainer()
          } else {
            await runEngagementLearner()
          }
          // Notify via Slack
          try {
            const { sendMessage } = await import('../lib/slack-bot/slack-client')
            const channel = process.env.SLACK_DEFAULT_CHANNEL
            if (channel) {
              await sendMessage({
                channel,
                text: `:brain: *自動再学習を実行* [${platform}]\nMAE: ${drift.rollingMae.toFixed(3)} (training baseline: ${drift.trainingMae.toFixed(3)})\n${drift.consecutiveDriftDays}日連続ドリフト検出`,
              })
            }
          } catch { /* best-effort notification */ }
        } catch (e) {
          process.stdout.write(`[drift-monitor] Retrain failed for ${platform}: ${e instanceof Error ? e.message : e}\n`)
        }
      }
    }
    // Weekly cross-platform learning (runs with drift monitor on Sundays)
    await runCrossPlatformLearner()
  },
  'safety-event-scanner': runSafetyEventScanner,
  'cross-platform-learner': runCrossPlatformLearner,
  'lead-email-sequences': runEmailSequences,
  'x-account-monitor': runAccountMonitor,
  'x-conversation-builder': runConversationBuilder,
  'x-growth-tracker': runGrowthTracker,
  'threads-auto-post': runThreadsAutoPost,
  'threads-engagement-learner': runThreadsEngagementLearner,
  'x-proactive-discussion': runProactiveDiscussion,
  'x-engagement-collector': collectXEngagement,
  'x-model-retrainer': runXModelRetrainer,
  'pattern-decay': async () => {
    const updated = await applyPatternDecay()
    process.stdout.write(`Pattern decay complete: ${updated} patterns updated\n`)
  },
  'viral-repost': runViralRepost,
  'cross-post-engagement-collector': runCrossPostEngagementCollector,
  'daily-buzz-global': async () => { await runDailyBuzzThread('global-ai-news') },
  'daily-buzz-claude-code': async () => { await runDailyBuzzThread('claude-code') },
  'daily-buzz-japan': async () => { await runDailyBuzzThread('ai-tech-japan') },
  'anthropic-tweet-reactor': runAnthropicReactor,
  'viral-ai-repost': async () => {
    const result = await runViralAiRepost()
    process.stdout.write(`Viral AI repost: ${JSON.stringify(result)}\n`)
  },
  'viral-threads-repost': async () => {
    const result = await runViralThreadsRepost()
    process.stdout.write(`Viral Threads repost: ${JSON.stringify(result)}\n`)
  },
  'instagram-carousel-auto-post': async () => {
    const delay = Math.floor(Math.random() * 10 * 60 * 1000)
    process.stdout.write(`Instagram carousel: ${Math.round(delay / 60000)}min delay\n`)
    await new Promise((r) => setTimeout(r, delay))
    const result = await runAutoCarouselPipeline(false)
    process.stdout.write(`Instagram carousel: ${JSON.stringify(result)}\n`)
  },
  'instagram-hybrid-carousel-auto-post': async () => {
    const delay = Math.floor(Math.random() * 10 * 60 * 1000)
    process.stdout.write(`Instagram hybrid: ${Math.round(delay / 60000)}min delay\n`)
    await new Promise((r) => setTimeout(r, delay))
    const result = await runHybridCarouselPipeline(false)
    process.stdout.write(`Instagram hybrid: ${JSON.stringify(result)}\n`)
  },
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
    process.exit(0)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stderr.write(`Job ${jobName} failed: ${message}\n`)
    process.exit(1)
  }
}

main()
