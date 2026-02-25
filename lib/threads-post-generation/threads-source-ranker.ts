/**
 * Threads ソースランキング
 *
 * 収集されたソース候補をThreads向けに最適化されたスコアで順位付け。
 * 会話ポテンシャルを最重視 (40%)、鮮度 (30%)、関連性 (30%)。
 */

import type { ThreadsSourceCandidate } from './threads-source-collector'

// ============================================================
// 会話ポテンシャル計算
// ============================================================

const TRENDING_KEYWORDS = [
  'ai', 'llm', 'claude', 'gpt', 'openai', 'anthropic', 'gemini',
  'copilot', 'chatgpt', 'midjourney', 'stable diffusion', 'sora',
  'transformer', 'rag', 'agent', 'multimodal', 'foundation model',
] as const

export function computeConversationPotential(title: string, body: string): number {
  const combined = `${title} ${body}`.toLowerCase()
  let score = 0

  // Contains question? +0.3
  if (/[?\uff1f]/.test(combined)) {
    score += 0.3
  }

  // Contains controversial/debate topic? +0.2
  const debatePatterns = /\b(vs\.?|versus|debate|controversy|disagree|opinion|hot take|unpopular)\b/i
  if (debatePatterns.test(combined)) {
    score += 0.2
  }

  // Contains numbers/data? +0.2
  if (/\d+%|\d+[kmb]\b|\$\d|\d{3,}/i.test(combined)) {
    score += 0.2
  }

  // Has trending keyword? +0.2
  const hasTrending = TRENDING_KEYWORDS.some((kw) => combined.includes(kw))
  if (hasTrending) {
    score += 0.2
  }

  // Is short enough for Threads discussion? +0.1
  if (body.length <= 500) {
    score += 0.1
  }

  return Math.min(score, 1)
}

// ============================================================
// 鮮度スコア (0-1)
// ============================================================

function computeFreshnessScore(hoursAgo: number): number {
  // 0h = 1.0, 6h = 0.75, 24h = 0.5, 48h = 0.0
  if (hoursAgo <= 0) return 1
  if (hoursAgo >= 48) return 0
  return Math.max(0, 1 - hoursAgo / 48)
}

// ============================================================
// メインランキング
// ============================================================

export function rankThreadsSources(
  sources: readonly ThreadsSourceCandidate[],
  recentUrls: ReadonlySet<string>,
): readonly ThreadsSourceCandidate[] {
  // 1. Filter out duplicates (URLs already posted in 7-day window)
  const deduped = sources.filter((s) => {
    if (!s.url) return true
    return !recentUrls.has(s.url)
  })

  // 2. Filter AI relevance (keep only relevanceScore > 0.2)
  const relevant = deduped.filter((s) => s.relevanceScore > 0.2)

  if (relevant.length === 0) {
    return []
  }

  // 3. Score each using weighted formula
  //    freshness x 0.3 + relevanceScore x 0.3 + conversationPotential x 0.4
  const scored = relevant.map((s) => {
    const freshnessNorm = computeFreshnessScore(s.freshness)
    const convPotential = computeConversationPotential(s.title, s.body)
    const totalScore =
      freshnessNorm * 0.3 +
      s.relevanceScore * 0.3 +
      convPotential * 0.4

    return { source: s, totalScore }
  })

  // 4. Sort descending
  scored.sort((a, b) => b.totalScore - a.totalScore)

  // 5. Return top 5
  return scored.slice(0, 5).map((item) => item.source)
}
