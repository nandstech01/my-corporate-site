/**
 * Threads エンゲージメント学習 (Engagement Learner)
 *
 * 1. 直近48時間に投稿した Threads 投稿のIDを取得
 * 2. Threads Insights API でメトリクスを取得
 * 3. threads_post_analytics を更新
 * 4. 高パフォーマンス投稿の特徴を slack_bot_memory に保存
 * 5. パターン成果を pattern_performance に記録
 */

import { createClient } from '@supabase/supabase-js'
import {
  fetchThreadsPostMetrics,
  isThreadsConfigured,
} from '../../threads-api/client'
import type { ThreadsPostMetrics } from '../../threads-api/client'
import { notifyLearningEvent } from '../../ai-judge/slack-notifier'
import { recordPatternOutcome } from '../../learning/pattern-bandit'
import {
  getRecentThreadsPostIds,
  updateThreadsPostEngagement,
  saveMemory,
} from '../memory'

// ============================================================
// 高パフォーマンス判定
// ============================================================

interface PostResult {
  readonly threadsMediaId: string
  readonly postText: string
  readonly metrics: ThreadsPostMetrics
  readonly patternUsed?: string
}

function computeEngagement(metrics: ThreadsPostMetrics): number {
  // Threads = conversation platform: replies weighted 2x
  return metrics.likes + metrics.replies * 2 + metrics.reposts + metrics.quotes
}

function identifyHighPerformers(
  results: readonly PostResult[],
): readonly PostResult[] {
  if (results.length === 0) return []

  const avgEngagement =
    results.reduce((sum, r) => sum + computeEngagement(r.metrics), 0) /
    results.length

  return results.filter(
    (r) => computeEngagement(r.metrics) > avgEngagement * 1.5,
  )
}

function identifyLowPerformers(
  results: readonly PostResult[],
): readonly PostResult[] {
  if (results.length === 0) return []

  const avgEngagement =
    results.reduce((sum, r) => sum + computeEngagement(r.metrics), 0) /
    results.length

  return results.filter(
    (r) => computeEngagement(r.metrics) < avgEngagement * 0.5,
  )
}

// ============================================================
// メイン
// ============================================================

export async function runThreadsEngagementLearner(): Promise<void> {
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
  if (!userId) {
    throw new Error('SLACK_ALLOWED_USER_IDS is required')
  }

  if (!isThreadsConfigured()) {
    process.stdout.write(
      'Threads Analytics: not configured — skipping\n',
    )
    return
  }

  const recentPosts = await getRecentThreadsPostIds(48)

  if (recentPosts.length === 0) {
    process.stdout.write('Threads Engagement Learner: no recent posts\n')
    return
  }

  process.stdout.write(
    `Threads Engagement Learner: checking ${recentPosts.length} post(s)\n`,
  )

  // Fetch metrics and update DB
  const results: PostResult[] = []

  for (const post of recentPosts) {
    const metrics = await fetchThreadsPostMetrics(post.threads_media_id)
    if (metrics) {
      await updateThreadsPostEngagement(post.threads_media_id, metrics)
      results.push({
        threadsMediaId: post.threads_media_id,
        postText: post.post_text,
        metrics,
      })
      process.stdout.write(
        `  ${post.threads_media_id}: ${metrics.likes} likes, ${metrics.replies} replies, ${metrics.reposts} reposts, ${metrics.views} views\n`,
      )
    }
  }

  if (results.length === 0) {
    process.stdout.write(
      'Threads Engagement Learner: no metrics retrieved\n',
    )
    return
  }

  // Identify high performers and save learnings
  const highPerformers = identifyHighPerformers(results)

  for (const hp of highPerformers) {
    const engagement = computeEngagement(hp.metrics)
    const isExceptional = hp.metrics.likes > 20 || hp.metrics.views > 2000

    const characteristics = [
      `High performing Threads post (${hp.metrics.likes} likes, ${hp.metrics.replies} replies, ${hp.metrics.reposts} reposts, ${hp.metrics.views} views)`,
      `Text preview: "${hp.postText.slice(0, 80)}..."`,
      `Length: ${hp.postText.length} chars`,
      isExceptional ? 'Exceptional engagement' : null,
    ]
      .filter(Boolean)
      .join('. ')

    await saveMemory({
      slackUserId: userId,
      memoryType: 'fact',
      content: characteristics,
      context: {
        threadsMediaId: hp.threadsMediaId,
        metrics: hp.metrics,
        exceptional: isExceptional,
        platform: 'threads',
      },
      importance: isExceptional ? 0.9 : 0.8,
    })

    // Record pattern outcome for bandit learning
    if (hp.patternUsed) {
      try {
        await recordPatternOutcome(hp.patternUsed, 'threads', true, engagement)
      } catch {
        // Best-effort
      }
    }
  }

  // Negative learning: identify low performers
  const lowPerformers = identifyLowPerformers(results)

  for (const lp of lowPerformers) {
    await saveMemory({
      slackUserId: userId,
      memoryType: 'feedback',
      content: `Low performing Threads post (${lp.metrics.likes} likes, ${lp.metrics.replies} replies, ${lp.metrics.reposts} reposts, ${lp.metrics.views} views). Text preview: "${lp.postText.slice(0, 80)}...". Length: ${lp.postText.length} chars. Avoid similar patterns.`,
      context: {
        threadsMediaId: lp.threadsMediaId,
        metrics: lp.metrics,
        platform: 'threads',
        sentiment: 'negative',
      },
      importance: 0.7,
    })

    // Record negative pattern outcome
    if (lp.patternUsed) {
      try {
        await recordPatternOutcome(lp.patternUsed, 'threads', false, computeEngagement(lp.metrics))
      } catch {
        // Best-effort
      }
    }
  }

  // Update ai_judge_decisions actual engagement
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars missing')
    const supabase = createClient(supabaseUrl, supabaseKey)

    for (const r of results) {
      await supabase
        .from('ai_judge_decisions')
        .update({
          actual_engagement: {
            likes: r.metrics.likes,
            replies: r.metrics.replies,
            reposts: r.metrics.reposts,
            quotes: r.metrics.quotes,
            views: r.metrics.views,
          },
          engagement_fetched_at: new Date().toISOString(),
        })
        .eq('post_id', r.threadsMediaId)
        .eq('platform', 'threads')
    }
  } catch { /* best-effort */ }

  // Record learning pipeline events
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars missing')
    const supabase = createClient(supabaseUrl, supabaseKey)

    for (const hp of highPerformers) {
      await supabase.from('learning_pipeline_events').insert({
        event_type: 'high_performer',
        platform: 'threads',
        post_id: hp.threadsMediaId,
        data: {
          metrics: hp.metrics,
          textPreview: hp.postText.slice(0, 100),
        },
      })
    }
    for (const lp of lowPerformers) {
      await supabase.from('learning_pipeline_events').insert({
        event_type: 'low_performer',
        platform: 'threads',
        post_id: lp.threadsMediaId,
        data: {
          metrics: lp.metrics,
          textPreview: lp.postText.slice(0, 100),
        },
      })
    }
  } catch { /* best-effort */ }

  // Notify results
  if (highPerformers.length > 0 || lowPerformers.length > 0) {
    try {
      await notifyLearningEvent({
        eventType: highPerformers.length > 0 ? 'high_performer' : 'low_performer',
        summary: `Threads学習完了: ${results.length}件分析、${highPerformers.length}件高パフォーマンス、${lowPerformers.length}件低パフォーマンス`,
        details: {
          totalAnalyzed: results.length,
          highPerformers: highPerformers.length,
          lowPerformers: lowPerformers.length,
        },
      })
    } catch { /* best-effort */ }
  }

  process.stdout.write(
    `Threads Engagement Learner: ${results.length} updated, ${highPerformers.length} high performers, ${lowPerformers.length} low performers saved\n`,
  )
}
