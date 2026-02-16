/**
 * LinkedIn 学習データ取得ユーティリティ
 *
 * 過去のエンゲージメントデータから高パフォーマンス投稿のパターンを抽出し、
 * LLMプロンプトに注入するためのサマリーテキストを生成。
 */

import { recallMemories, getLinkedInPostAnalytics } from '../memory'
import type { LinkedInPostAnalytics } from '../types'

// ============================================================
// 型定義
// ============================================================

export interface LinkedInLearnings {
  readonly highPerformerSummary: string
  readonly topPatterns: readonly string[]
  readonly avgEngagement: number
}

// ============================================================
// ヘルパー
// ============================================================

function computeEngagement(post: LinkedInPostAnalytics): number {
  return post.likes + post.comments + post.reposts
}

function aggregateByPattern(
  posts: readonly LinkedInPostAnalytics[],
): readonly { pattern: string; avgEngagement: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>()

  for (const post of posts) {
    const pattern = post.pattern_used ?? 'unknown'
    const existing = map.get(pattern) ?? { total: 0, count: 0 }
    map.set(pattern, {
      total: existing.total + computeEngagement(post),
      count: existing.count + 1,
    })
  }

  return Array.from(map.entries())
    .map(([pattern, { total, count }]) => ({
      pattern,
      avgEngagement: count > 0 ? total / count : 0,
      count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
}

// ============================================================
// メイン
// ============================================================

export async function getLinkedInLearnings(
  userId: string,
): Promise<LinkedInLearnings | null> {
  // 1. メモリから LinkedIn の高パフォーマンスファクトを取得
  const memories = await recallMemories({
    slackUserId: userId,
    query: 'LinkedIn post',
    limit: 10,
  })

  const linkedInMemories = memories.filter(
    (m) =>
      m.context &&
      (m.context as Record<string, unknown>).platform === 'linkedin',
  )

  // 2. 過去30日の投稿データを取得
  const posts = await getLinkedInPostAnalytics({ days: 30, limit: 50 })

  // データがなければ null（コールドスタート）
  if (linkedInMemories.length === 0 && posts.length === 0) {
    return null
  }

  // 3. パターン別にエンゲージメント集計
  const postsWithEngagement = posts.filter(
    (p) => computeEngagement(p) > 0,
  )

  if (postsWithEngagement.length === 0 && linkedInMemories.length === 0) {
    return null
  }

  const patternStats = aggregateByPattern(postsWithEngagement)
  const topPatterns = patternStats.slice(0, 3).map((p) => p.pattern)

  const totalEngagement = postsWithEngagement.reduce(
    (sum, p) => sum + computeEngagement(p),
    0,
  )
  const avgEngagement =
    postsWithEngagement.length > 0
      ? totalEngagement / postsWithEngagement.length
      : 0

  // 4. サマリーテキストを構築
  const summaryParts: string[] = []

  if (patternStats.length > 0) {
    const patternSummary = patternStats
      .slice(0, 3)
      .map(
        (p) =>
          `- ${p.pattern}: 平均エンゲージメント ${p.avgEngagement.toFixed(1)} (${p.count}件)`,
      )
      .join('\n')
    summaryParts.push(
      `パターン別パフォーマンス:\n${patternSummary}`,
    )
  }

  if (linkedInMemories.length > 0) {
    const memoryInsights = linkedInMemories
      .slice(0, 5)
      .map((m) => `- ${m.content.slice(0, 120)}`)
      .join('\n')
    summaryParts.push(`過去の高パフォーマンス投稿の特徴:\n${memoryInsights}`)
  }

  if (postsWithEngagement.length > 0) {
    summaryParts.push(
      `過去30日の統計: ${postsWithEngagement.length}件の投稿, 平均エンゲージメント ${avgEngagement.toFixed(1)}`,
    )
  }

  return {
    highPerformerSummary: summaryParts.join('\n\n'),
    topPatterns,
    avgEngagement,
  }
}
