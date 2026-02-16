/**
 * LinkedIn エンゲージメント学習 (Engagement Learner)
 *
 * 1. 直近48時間に投稿した LinkedIn 投稿のIDを取得
 * 2. LinkedIn Analytics API でメトリクスを取得
 * 3. linkedin_post_analytics を更新
 * 4. 高パフォーマンス投稿の特徴を slack_bot_memory に保存
 */

import {
  fetchLinkedInPostMetrics,
  isLinkedInAnalyticsConfigured,
  type LinkedInPostMetrics,
} from '@/lib/linkedin-api/analytics'
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
        metrics,
      })
      process.stdout.write(
        `  ${post.linkedin_post_id}: ${metrics.reactions} reactions, ${metrics.comments} comments, ${metrics.reshares} reshares, ${metrics.impressions} impressions\n`,
      )
    }
  }

  if (results.length === 0) {
    process.stdout.write(
      'LinkedIn Engagement Learner: no metrics retrieved\n',
    )
    return
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

  process.stdout.write(
    `LinkedIn Engagement Learner: ${results.length} updated, ${highPerformers.length} high performers saved\n`,
  )
}
