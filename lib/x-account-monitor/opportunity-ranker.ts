/**
 * Opportunity Ranker
 *
 * ツイートの引用RT価値をスコアリングする。
 * engagementVelocity × topicRelevance × freshness × accountPriority
 */

import type { OpportunityScore } from './types'

// AI関連キーワード（既存 safety-checks.ts のトピック判定ロジックと同等）
const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'ml',
  'llm', 'gpt', 'claude', 'gemini', 'openai', 'anthropic',
  'deep learning', 'neural', 'transformer', 'rag',
  'agent', 'embedding', 'fine-tune', 'prompt',
  'diffusion', 'multimodal', 'reasoning',
  '人工知能', '機械学習', '深層学習', '大規模言語モデル',
]

function computeTopicRelevance(text: string): number {
  const lowerText = text.toLowerCase()
  let matchCount = 0
  for (const keyword of AI_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      matchCount++
    }
  }
  // Normalize: 3+ keywords → 1.0
  return Math.min(matchCount / 3, 1.0)
}

const PRIORITY_WEIGHTS: Record<number, number> = {
  1: 1.0,
  2: 0.7,
  3: 0.4,
}

/**
 * ツイートの引用RT機会をスコアリングする
 *
 * @param tweet ツイート情報
 * @param accountPriority モニタリング対象アカウントの優先度 (1-3)
 * @param ageMinutes ツイートの経過時間（分）
 */
export function rankOpportunity(
  tweet: {
    readonly text: string
    readonly likes: number
    readonly retweets: number
    readonly replies: number
  },
  accountPriority: number,
  ageMinutes: number,
): OpportunityScore {
  // Engagement velocity: weighted interactions per minute
  const safeAge = Math.max(ageMinutes, 1)
  const rawVelocity = (tweet.likes * 1 + tweet.retweets * 20 + tweet.replies * 13.5) / safeAge
  const engagementVelocity = Math.min(rawVelocity, 100) / 100 // normalize to 0-1

  // Topic relevance: AI keyword density
  const topicRelevance = computeTopicRelevance(tweet.text)

  // Freshness: exponential decay with 2-hour half-life
  const ageHours = ageMinutes / 60
  const freshness = Math.exp(-ageHours / 2)

  // Account priority weight
  const accountPriorityScore = PRIORITY_WEIGHTS[accountPriority] ?? 0.4

  // Weighted composite score
  const composite =
    engagementVelocity * 0.30 +
    topicRelevance * 0.25 +
    freshness * 0.30 +
    accountPriorityScore * 0.15

  return {
    engagementVelocity,
    topicRelevance,
    freshness,
    accountPriority: accountPriorityScore,
    composite,
  }
}
