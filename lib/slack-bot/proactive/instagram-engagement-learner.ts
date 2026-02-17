/**
 * Instagram エンゲージメント学習 (Engagement Learner)
 *
 * 1. 直近48時間に投稿した Instagram Story のIDを取得
 * 2. Instagram Insights API でメトリクスを取得
 * 3. instagram_post_analytics を更新
 * 4. 高パフォーマンスストーリーの特徴を slack_bot_memory に保存
 */

import {
  fetchStoryMetrics,
  isInstagramAnalyticsConfigured,
  type InstagramStoryMetrics,
} from '@/lib/instagram-api/analytics'
import { createClient } from '@supabase/supabase-js'
import { saveMemory } from '../memory'

// ============================================================
// Supabase ヘルパー
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

// ============================================================
// 高パフォーマンス判定
// ============================================================

interface StoryResult {
  readonly instagramMediaId: string
  readonly caption: string
  readonly metrics: InstagramStoryMetrics
}

function identifyHighPerformers(
  results: readonly StoryResult[],
): readonly StoryResult[] {
  if (results.length === 0) return []

  const avgEngagement =
    results.reduce(
      (sum, r) => sum + r.metrics.replies + r.metrics.taps_back,
      0,
    ) / results.length

  return results.filter((r) => {
    const engagement = r.metrics.replies + r.metrics.taps_back
    return engagement > avgEngagement * 1.5
  })
}

// ============================================================
// メイン
// ============================================================

export async function runInstagramEngagementLearner(): Promise<void> {
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
  if (!userId) {
    throw new Error('SLACK_ALLOWED_USER_IDS is required')
  }

  if (!isInstagramAnalyticsConfigured()) {
    process.stdout.write(
      'Instagram Analytics: not configured or token expired — skipping\n',
    )
    return
  }

  const supabase = getSupabase()

  // 直近48時間の投稿を取得
  const fortyEightHoursAgo = new Date(
    Date.now() - 48 * 60 * 60 * 1000,
  ).toISOString()

  const { data: recentPosts } = await supabase
    .from('instagram_post_analytics')
    .select('instagram_media_id, caption')
    .gte('posted_at', fortyEightHoursAgo)

  if (!recentPosts || recentPosts.length === 0) {
    process.stdout.write('Instagram Engagement Learner: no recent posts\n')
    return
  }

  process.stdout.write(
    `Instagram Engagement Learner: checking ${recentPosts.length} story(ies)\n`,
  )

  // Fetch metrics and update DB
  const results: StoryResult[] = []

  for (const post of recentPosts) {
    const metrics = await fetchStoryMetrics(post.instagram_media_id)
    if (metrics) {
      await supabase
        .from('instagram_post_analytics')
        .update({
          reach: metrics.reach,
          impressions: metrics.impressions,
          taps_forward: metrics.taps_forward,
          taps_back: metrics.taps_back,
          exits: metrics.exits,
          replies: metrics.replies,
          engagement_rate:
            metrics.reach > 0
              ? (metrics.replies + metrics.taps_back) / metrics.reach
              : 0,
          fetched_at: new Date().toISOString(),
        })
        .eq('instagram_media_id', post.instagram_media_id)

      results.push({
        instagramMediaId: post.instagram_media_id,
        caption: post.caption,
        metrics,
      })

      process.stdout.write(
        `  ${post.instagram_media_id}: ${metrics.reach} reach, ${metrics.impressions} impressions, ${metrics.replies} replies, ${metrics.exits} exits\n`,
      )
    }
  }

  if (results.length === 0) {
    process.stdout.write(
      'Instagram Engagement Learner: no metrics retrieved\n',
    )
    return
  }

  // Identify high performers and save learnings
  const highPerformers = identifyHighPerformers(results)

  for (const hp of highPerformers) {
    const isExceptional =
      hp.metrics.reach > 1000 || hp.metrics.replies > 10
    const importance = isExceptional ? 0.9 : 0.8

    const characteristics = [
      `High performing Instagram story (${hp.metrics.reach} reach, ${hp.metrics.impressions} impressions, ${hp.metrics.replies} replies, ${hp.metrics.taps_back} taps back)`,
      `Caption preview: "${hp.caption.slice(0, 80)}..."`,
      `Length: ${hp.caption.length} chars`,
      `Exit rate: ${hp.metrics.reach > 0 ? ((hp.metrics.exits / hp.metrics.reach) * 100).toFixed(1) : 0}%`,
      isExceptional ? 'Exceptional engagement' : null,
    ]
      .filter(Boolean)
      .join('. ')

    await saveMemory({
      slackUserId: userId,
      memoryType: 'fact',
      content: characteristics,
      importance,
    })

    process.stdout.write(
      `  Saved learning for ${hp.instagramMediaId} (importance: ${importance})\n`,
    )
  }

  process.stdout.write(
    `Instagram Engagement Learner: ${results.length} updated, ${highPerformers.length} high performers saved\n`,
  )
}
