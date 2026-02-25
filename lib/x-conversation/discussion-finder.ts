/**
 * Discussion Finder
 *
 * 他人の会話で価値ある返信の機会を発見する。
 * buzz_posts + x_quote_opportunities テーブルから
 * 活発な議論を抽出し、スコアリングする。
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================
// Types
// ============================================================

export interface DiscussionCandidate {
  readonly tweetId: string
  readonly tweetText: string
  readonly authorUsername: string
  readonly metrics: {
    readonly likes: number
    readonly retweets: number
    readonly replies: number
  }
  readonly relevanceScore: number
  readonly topicMatch: string
  readonly source: 'buzz_posts' | 'quote_opportunities'
}

// ============================================================
// Supabase
// ============================================================

let cachedSupabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (cachedSupabase) return cachedSupabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  cachedSupabase = createClient(url, key)
  return cachedSupabase
}

// ============================================================
// Constants
// ============================================================

const MIN_REPLIES_FOR_ACTIVE = 3
const MAX_AGE_HOURS = 24
const MAX_CANDIDATES = 10

const AI_TOPIC_KEYWORDS = [
  'AI', 'LLM', 'GPT', 'Claude', 'RAG', 'agent', 'エージェント',
  '生成AI', 'プロンプト', 'ファインチューニング', 'embedding',
  'transformer', 'diffusion', 'OpenAI', 'Anthropic', 'Google',
  'チャットボット', '自動化', 'ML', '機械学習', 'deep learning',
]

// ============================================================
// Main function
// ============================================================

export async function findRelevantDiscussions(): Promise<readonly DiscussionCandidate[]> {
  const supabase = getSupabase()
  const cutoff = new Date(Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000).toISOString()
  const myUsername = process.env.X_USERNAME ?? 'nands_tech'

  // 1. Query buzz_posts for active discussions
  const { data: buzzPosts } = await supabase
    .from('buzz_posts')
    .select('tweet_id, text, author_username, likes, retweets, replies, topic_relevance_score, matched_topic')
    .gte('detected_at', cutoff)
    .gte('replies', MIN_REPLIES_FOR_ACTIVE)
    .neq('author_username', myUsername)
    .order('topic_relevance_score', { ascending: false })
    .limit(20)

  // 2. Query x_quote_opportunities for relevant discussions
  const { data: quoteOpps } = await supabase
    .from('x_quote_opportunities')
    .select('original_tweet_id, original_text, original_author_username, original_likes, original_retweets, original_replies, relevance_score')
    .gte('detected_at', cutoff)
    .gte('original_replies', MIN_REPLIES_FOR_ACTIVE)
    .neq('original_author_username', myUsername)
    .order('relevance_score', { ascending: false })
    .limit(20)

  // 3. Check which tweets we've already replied to
  const allTweetIds = [
    ...(buzzPosts ?? []).map(p => p.tweet_id as string),
    ...(quoteOpps ?? []).map(p => p.original_tweet_id as string),
  ]

  const { data: existingReplies } = await supabase
    .from('x_conversation_threads')
    .select('root_tweet_id')
    .in('root_tweet_id', allTweetIds)

  const repliedSet = new Set((existingReplies ?? []).map(r => r.root_tweet_id as string))

  // 4. Build candidates
  const candidates: DiscussionCandidate[] = []

  for (const post of buzzPosts ?? []) {
    const tweetId = post.tweet_id as string
    if (repliedSet.has(tweetId)) continue

    const text = post.text as string
    const relevanceScore = (post.topic_relevance_score as number) ?? 0
    const topicMatch = calculateTopicMatch(text)

    if (relevanceScore < 0.3 && !topicMatch) continue

    candidates.push({
      tweetId,
      tweetText: text,
      authorUsername: post.author_username as string,
      metrics: {
        likes: (post.likes as number) ?? 0,
        retweets: (post.retweets as number) ?? 0,
        replies: (post.replies as number) ?? 0,
      },
      relevanceScore: Math.max(relevanceScore, topicMatch ? 0.5 : 0),
      topicMatch: (post.matched_topic as string) ?? topicMatch ?? 'general_ai',
      source: 'buzz_posts',
    })
  }

  for (const opp of quoteOpps ?? []) {
    const tweetId = opp.original_tweet_id as string
    if (repliedSet.has(tweetId)) continue

    const text = opp.original_text as string
    const relevanceScore = (opp.relevance_score as number) ?? 0
    const topicMatch = calculateTopicMatch(text)

    if (relevanceScore < 0.3 && !topicMatch) continue

    candidates.push({
      tweetId,
      tweetText: text,
      authorUsername: opp.original_author_username as string,
      metrics: {
        likes: (opp.original_likes as number) ?? 0,
        retweets: (opp.original_retweets as number) ?? 0,
        replies: (opp.original_replies as number) ?? 0,
      },
      relevanceScore: Math.max(relevanceScore, topicMatch ? 0.5 : 0),
      topicMatch: topicMatch ?? 'general_ai',
      source: 'quote_opportunities',
    })
  }

  // 5. Deduplicate and sort by relevance
  const seen = new Set<string>()
  const unique = candidates.filter(c => {
    if (seen.has(c.tweetId)) return false
    seen.add(c.tweetId)
    return true
  })

  return unique
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, MAX_CANDIDATES)
}

function calculateTopicMatch(text: string): string | null {
  const lower = text.toLowerCase()
  for (const keyword of AI_TOPIC_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) return keyword
  }
  return null
}
