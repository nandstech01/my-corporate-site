/**
 * LinkedIn エンゲージメント学習 (Engagement Learner)
 *
 * 1. 直近48時間に投稿した LinkedIn 投稿のIDを取得
 * 2. LinkedIn Analytics API でメトリクスを取得
 * 3. linkedin_post_analytics を更新
 * 4. 高パフォーマンス投稿の特徴を slack_bot_memory に保存
 */

import { createClient } from '@supabase/supabase-js'
import {
  fetchLinkedInPostMetrics,
  isLinkedInAnalyticsConfigured,
  type LinkedInPostMetrics,
} from '@/lib/linkedin-api/analytics'
import { notifyLearningEvent } from '../../ai-judge/slack-notifier'
import { recordPatternOutcome } from '@/lib/learning/pattern-bandit'
import {
  getRecentLinkedInPostIds,
  updateLinkedInPostEngagement,
  saveMemory,
} from '../memory'

// ============================================================
// 高パフォーマンス判定
// ============================================================

interface PostResult {
  readonly linkedinPostId: string
  readonly postText: string
  readonly patternUsed: string | null
  readonly metrics: LinkedInPostMetrics
}

function identifyHighPerformers(
  results: readonly PostResult[],
): readonly PostResult[] {
  if (results.length === 0) return []

  const avgEngagement =
    results.reduce(
      (sum, r) =>
        sum + r.metrics.reactions + r.metrics.comments + r.metrics.reshares,
      0,
    ) / results.length

  return results.filter((r) => {
    const engagement =
      r.metrics.reactions + r.metrics.comments + r.metrics.reshares
    return engagement > avgEngagement * 1.5
  })
}

function identifyLowPerformers(
  results: readonly PostResult[],
): readonly PostResult[] {
  if (results.length === 0) return []

  const avgEngagement =
    results.reduce(
      (sum, r) =>
        sum + r.metrics.reactions + r.metrics.comments + r.metrics.reshares,
      0,
    ) / results.length

  return results.filter((r) => {
    const engagement =
      r.metrics.reactions + r.metrics.comments + r.metrics.reshares
    return engagement < avgEngagement * 0.5
  })
}

// ============================================================
// メイン
// ============================================================

export async function runLinkedInEngagementLearner(): Promise<void> {
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
  if (!userId) {
    throw new Error('SLACK_ALLOWED_USER_IDS is required')
  }

  if (!isLinkedInAnalyticsConfigured()) {
    process.stdout.write(
      'LinkedIn Analytics: not configured or token expired — skipping\n',
    )
    return
  }

  const recentPosts = await getRecentLinkedInPostIds(48)

  if (recentPosts.length === 0) {
    process.stdout.write('LinkedIn Engagement Learner: no recent posts\n')
    return
  }

  process.stdout.write(
    `LinkedIn Engagement Learner: checking ${recentPosts.length} post(s)\n`,
  )

  // Fetch metrics and update DB
  const results: PostResult[] = []

  for (const post of recentPosts) {
    const metrics = await fetchLinkedInPostMetrics(post.linkedin_post_id)
    if (metrics) {
      await updateLinkedInPostEngagement(post.linkedin_post_id, metrics)
      results.push({
        linkedinPostId: post.linkedin_post_id,
        postText: post.post_text,
        patternUsed: post.pattern_used,
        metrics,
      })
      process.stdout.write(
        `  ${post.linkedin_post_id}: ${metrics.reactions} reactions, ${metrics.comments} comments, ${metrics.reshares} reshares, ${metrics.impressions} impressions\n`,
      )
    }
  }

  const skippedCount = recentPosts.length - results.length
  if (skippedCount > 0) {
    process.stdout.write(`LinkedIn Engagement Learner: ${skippedCount} post(s) skipped (invalid ID or no metrics)\n`)
  }

  if (results.length === 0) {
    process.stdout.write(
      'LinkedIn Engagement Learner: no metrics retrieved\n',
    )
    return
  }

  // Record pattern outcomes for Thompson Sampling (bandit learning)
  const avgEngagement =
    results.reduce(
      (sum, r) =>
        sum + r.metrics.reactions + r.metrics.comments * 2 + r.metrics.reshares,
      0,
    ) / results.length

  for (const r of results) {
    if (r.patternUsed) {
      const totalEngagement =
        r.metrics.reactions + r.metrics.comments * 2 + r.metrics.reshares
      const isSuccess = totalEngagement > avgEngagement * 0.8
      try {
        await recordPatternOutcome(
          r.patternUsed,
          'linkedin',
          isSuccess,
          totalEngagement,
        )
      } catch { /* best-effort */ }
    }
  }

  // Identify high performers and save learnings
  const highPerformers = identifyHighPerformers(results)

  for (const hp of highPerformers) {
    const isExceptional =
      hp.metrics.reactions > 30 || hp.metrics.impressions > 3000
    const importance = isExceptional ? 0.9 : 0.8

    const characteristics = [
      `High performing LinkedIn post (${hp.metrics.reactions} reactions, ${hp.metrics.comments} comments, ${hp.metrics.reshares} reshares, ${hp.metrics.impressions} impressions)`,
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
        linkedinPostId: hp.linkedinPostId,
        metrics: hp.metrics,
        exceptional: isExceptional,
        platform: 'linkedin',
      },
      importance,
    })

    process.stdout.write(
      `  Saved learning for ${hp.linkedinPostId} (importance: ${importance})\n`,
    )
  }

  // Negative learning: identify low performers
  const lowPerformers = identifyLowPerformers(results)

  for (const lp of lowPerformers) {
    await saveMemory({
      slackUserId: userId,
      memoryType: 'feedback',
      content: `Low performing LinkedIn post (${lp.metrics.reactions} reactions, ${lp.metrics.comments} comments, ${lp.metrics.reshares} reshares, ${lp.metrics.impressions} impressions). Text preview: "${lp.postText.slice(0, 80)}...". Length: ${lp.postText.length} chars. Avoid similar patterns.`,
      context: {
        linkedinPostId: lp.linkedinPostId,
        metrics: lp.metrics,
        platform: 'linkedin',
        sentiment: 'negative',
      },
      importance: 0.7,
    })
  }

  // Update ai_judge_decisions actual engagement for prediction tracking
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
            reactions: r.metrics.reactions,
            comments: r.metrics.comments,
            reshares: r.metrics.reshares,
            impressions: r.metrics.impressions,
          },
          engagement_fetched_at: new Date().toISOString(),
        })
        .eq('post_id', r.linkedinPostId)
        .eq('platform', 'linkedin')
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
        platform: 'linkedin',
        post_id: hp.linkedinPostId,
        data: {
          metrics: hp.metrics,
          textPreview: hp.postText.slice(0, 100),
        },
      })
    }
    for (const lp of lowPerformers) {
      await supabase.from('learning_pipeline_events').insert({
        event_type: 'low_performer',
        platform: 'linkedin',
        post_id: lp.linkedinPostId,
        data: {
          metrics: lp.metrics,
          textPreview: lp.postText.slice(0, 100),
        },
      })
    }
  } catch { /* best-effort */ }

  // Notify #general about learning results
  if (highPerformers.length > 0 || lowPerformers.length > 0) {
    try {
      await notifyLearningEvent({
        eventType: highPerformers.length > 0 ? 'high_performer' : 'low_performer',
        summary: `LinkedIn学習完了: ${results.length}件分析、${highPerformers.length}件高パフォーマンス、${lowPerformers.length}件低パフォーマンス`,
        details: {
          totalAnalyzed: results.length,
          highPerformers: highPerformers.length,
          lowPerformers: lowPerformers.length,
        },
      })
    } catch { /* best-effort */ }
  }

  process.stdout.write(
    `LinkedIn Engagement Learner: ${results.length} updated, ${highPerformers.length} high performers, ${lowPerformers.length} low performers saved\n`,
  )
}
