/**
 * Conversation Scorer
 *
 * 会話機会のスコアリング。ヒューリスティックベース。
 * ML移行はデータ30件蓄積後。
 */

// ============================================================
// Types
// ============================================================

export interface ConversationScoreInput {
  readonly tweetText: string
  readonly authorFollowerCount: number
  readonly currentReplyCount: number
  readonly currentLikes: number
  readonly tweetAgeHours: number
}

export interface ConversationScore {
  readonly engagementPotential: number
  readonly conversationDepthPotential: number
  readonly authorInfluenceScore: number
  readonly topicRelevanceScore: number
  readonly totalScore: number
}

// ============================================================
// Constants
// ============================================================

const AI_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'rag', 'agent', 'エージェント',
  '生成ai', 'プロンプト', 'ファインチューニング', 'embedding',
  'transformer', 'openai', 'anthropic', 'chatgpt',
  'チャットボット', '自動化', 'ml', '機械学習',
  'langchain', 'langgraph', 'mcp', 'tool use',
]

// ============================================================
// Scoring function
// ============================================================

export function scoreConversation(input: ConversationScoreInput): ConversationScore {
  // 1. Engagement potential (0.3 weight)
  // Based on likes/replies ratio - more replies relative to likes = more conversational
  const likesReplyRatio = input.currentLikes > 0
    ? input.currentReplyCount / input.currentLikes
    : input.currentReplyCount > 0 ? 1 : 0
  const engagementPotential = Math.min(likesReplyRatio * 10, 10) * 0.3

  // 2. Conversation depth potential (0.2 weight)
  // More replies + topic complexity = deeper potential conversation
  const replyDepthScore = Math.min(input.currentReplyCount / 10, 1) * 5
  const complexityScore = estimateTopicComplexity(input.tweetText) * 5
  const conversationDepthPotential = (replyDepthScore + complexityScore) * 0.2 / 10

  // 3. Author influence score (0.2 weight)
  // Log-scaled follower count
  const logFollowers = input.authorFollowerCount > 0
    ? Math.log10(input.authorFollowerCount)
    : 0
  const authorInfluenceScore = Math.min(logFollowers / 6, 1) * 10 * 0.2 // 6 = log10(1M)

  // 4. Topic relevance score (0.3 weight)
  // AI/LLM keyword overlap
  const lowerText = input.tweetText.toLowerCase()
  let keywordMatches = 0
  for (const keyword of AI_KEYWORDS) {
    if (lowerText.includes(keyword)) keywordMatches++
  }
  const topicRelevanceScore = Math.min(keywordMatches / 3, 1) * 10 * 0.3

  // 5. Freshness penalty
  const freshnessPenalty = input.tweetAgeHours > 12 ? 0.8 : 1.0

  const totalScore = (engagementPotential + conversationDepthPotential + authorInfluenceScore + topicRelevanceScore) * freshnessPenalty

  return {
    engagementPotential: Math.round(engagementPotential * 100) / 100,
    conversationDepthPotential: Math.round(conversationDepthPotential * 100) / 100,
    authorInfluenceScore: Math.round(authorInfluenceScore * 100) / 100,
    topicRelevanceScore: Math.round(topicRelevanceScore * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
  }
}

function estimateTopicComplexity(text: string): number {
  // Simple heuristic: longer text + question marks + technical terms = more complex
  const lengthScore = Math.min(text.length / 500, 1) * 0.3
  const questionScore = (text.match(/[？?]/g)?.length ?? 0) > 0 ? 0.3 : 0
  const technicalScore = AI_KEYWORDS.filter(k => text.toLowerCase().includes(k)).length > 2 ? 0.4 : 0.2
  return lengthScore + questionScore + technicalScore
}
