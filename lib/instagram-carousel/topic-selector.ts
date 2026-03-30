/**
 * Instagram Carousel Topic Selector
 *
 * 3つのデータソースからカルーセルに最適なトピックを自動選定:
 * 1. buzz_posts — 直近48hのバズ投稿
 * 2. cortex_viral_analysis — トレンド分析（emerging/growing）
 * 3. posts — 自社ブログ記事（30日以内）
 *
 * 過去14日のカルーセル投稿と重複排除した上で、最高スコアのトピックを返す。
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================
// Types
// ============================================================

export interface TopicCandidate {
  readonly topic: string
  readonly source: 'buzz' | 'cortex' | 'blog'
  readonly score: number
  readonly metadata: {
    readonly buzzScore?: number
    readonly noveltyScore?: number
    readonly unexploredAngles?: readonly string[]
    readonly keyDataPoints?: readonly string[]
    readonly blogSlug?: string
    readonly blogContent?: string
    readonly maturity?: string
  }
}

// ============================================================
// Supabase
// ============================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ============================================================
// AI/Tech keywords for topic extraction
// ============================================================

const TOPIC_KEYWORDS = [
  'claude', 'claude code', 'gpt', 'chatgpt', 'gemini', 'llm',
  'ai agent', 'rag', 'openai', 'anthropic', 'google', 'copilot',
  'cursor', 'mcp', 'windsurf', 'devin', 'perplexity',
  'fine-tuning', 'prompt', 'sora', 'midjourney',
] as const

// ============================================================
// Evergreen fallback topics
// ============================================================

const EVERGREEN_TOPICS = [
  'Claude Code 実践活用術',
  'AIエージェント開発の始め方',
  'プロンプトエンジニアリング基礎',
  'RAG構築の実践ガイド',
  'LLMアプリケーション設計パターン',
  'AI自動化で業務効率10倍',
  'MCP（Model Context Protocol）入門',
  'AIコーディングツール徹底比較',
] as const

// ============================================================
// Source 1: Buzz Posts (48h, score > 80)
// ============================================================

async function fetchBuzzCandidates(): Promise<TopicCandidate[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('buzz_posts')
    .select('post_text, buzz_score, relevance_score')
    .gte('created_at', since)
    .gt('buzz_score', 80)
    .order('buzz_score', { ascending: false })
    .limit(50)

  if (error || !data?.length) return []

  // Group by detected topic keyword
  const topicGroups = new Map<string, { totalScore: number; count: number; texts: string[] }>()

  for (const post of data) {
    const text = (post.post_text as string).toLowerCase()
    for (const keyword of TOPIC_KEYWORDS) {
      if (text.includes(keyword)) {
        const existing = topicGroups.get(keyword) || { totalScore: 0, count: 0, texts: [] }
        existing.totalScore += (post.buzz_score as number) * (post.relevance_score as number || 0.5)
        existing.count += 1
        existing.texts.push(post.post_text as string)
        topicGroups.set(keyword, existing)
        break // one topic per post
      }
    }
  }

  return Array.from(topicGroups.entries())
    .map(([keyword, group]) => ({
      topic: `${keyword} 最新動向と活用法`,
      source: 'buzz' as const,
      score: Math.min(100, group.totalScore / group.count),
      metadata: { buzzScore: group.totalScore / group.count },
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

// ============================================================
// Source 2: CORTEX Viral Analysis (7d, emerging/growing)
// ============================================================

async function fetchCortexCandidates(): Promise<TopicCandidate[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('cortex_viral_analysis')
    .select('topic, novelty_score, replicability_score, original_text, maturity')
    .gte('created_at', since)
    .in('maturity', ['emerging', 'growing'])
    .order('novelty_score', { ascending: false })
    .limit(10)

  if (error || !data?.length) return []

  return data.map((row) => {
    // Parse original_text for structured data if available
    let unexploredAngles: string[] = []
    let keyDataPoints: string[] = []
    try {
      const parsed = typeof row.original_text === 'string' ? JSON.parse(row.original_text) : row.original_text
      unexploredAngles = parsed?.unexplored_angles || []
      keyDataPoints = parsed?.key_data_points || []
    } catch { /* not JSON */ }

    return {
      topic: row.topic as string,
      source: 'cortex' as const,
      score: Math.min(100, ((row.novelty_score as number) || 0) * ((row.replicability_score as number) || 0) * 100),
      metadata: {
        noveltyScore: row.novelty_score as number,
        unexploredAngles,
        keyDataPoints,
        maturity: row.maturity as string,
      },
    }
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

// ============================================================
// Source 3: Blog Posts (30d, published)
// ============================================================

async function fetchBlogCandidates(): Promise<TopicCandidate[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('posts')
    .select('slug, title, content, category_tags, created_at')
    .eq('status', 'published')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error || !data?.length) {
    // Try legacy table
    const { data: legacy } = await supabase
      .from('chatgpt_posts')
      .select('slug, title, content, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!legacy?.length) return []

    return legacy.map((post) => ({
      topic: `${post.title}`,
      source: 'blog' as const,
      score: 50, // base score for blog posts
      metadata: {
        blogSlug: post.slug as string,
        blogContent: (post.content as string)?.slice(0, 3000),
      },
    }))
  }

  return data.map((post) => {
    // Score based on keyword relevance
    const titleLower = (post.title as string).toLowerCase()
    const tags = (post.category_tags as string[] || []).join(' ').toLowerCase()
    const combined = `${titleLower} ${tags}`

    let relevance = 30
    for (const keyword of TOPIC_KEYWORDS) {
      if (combined.includes(keyword)) {
        relevance += 15
        break
      }
    }
    // Freshness boost
    const daysAgo = (Date.now() - new Date(post.created_at as string).getTime()) / (1000 * 60 * 60 * 24)
    const freshness = daysAgo <= 7 ? 20 : daysAgo <= 14 ? 10 : 0

    return {
      topic: post.title as string,
      source: 'blog' as const,
      score: Math.min(100, relevance + freshness),
      metadata: {
        blogSlug: post.slug as string,
        blogContent: (post.content as string)?.slice(0, 3000),
      },
    }
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

// ============================================================
// Deduplication against recent carousels
// ============================================================

async function getRecentCarouselTopics(): Promise<string[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('x_post_analytics')
    .select('post_text')
    .eq('pattern_used', 'instagram_carousel_v2')
    .gte('posted_at', since)

  return (data || []).map((r) => (r.post_text as string).toLowerCase())
}

function isDuplicate(topic: string, recentTopics: string[]): boolean {
  const topicLower = topic.toLowerCase()
  return recentTopics.some((recent) => {
    // Simple keyword overlap check
    const topicWords = topicLower.split(/\s+/)
    const matchCount = topicWords.filter((w) => w.length > 2 && recent.includes(w)).length
    return matchCount >= 2
  })
}

// ============================================================
// Main Export
// ============================================================

export async function selectCarouselTopic(): Promise<TopicCandidate> {
  process.stdout.write('  Fetching candidates from 3 sources...\n')

  const [buzzCandidates, cortexCandidates, blogCandidates, recentTopics] = await Promise.all([
    fetchBuzzCandidates().catch(() => [] as TopicCandidate[]),
    fetchCortexCandidates().catch(() => [] as TopicCandidate[]),
    fetchBlogCandidates().catch(() => [] as TopicCandidate[]),
    getRecentCarouselTopics().catch(() => [] as string[]),
  ])

  process.stdout.write(`  Buzz: ${buzzCandidates.length}, CORTEX: ${cortexCandidates.length}, Blog: ${blogCandidates.length}\n`)

  // Merge and deduplicate
  const allCandidates = [...buzzCandidates, ...cortexCandidates, ...blogCandidates]
    .filter((c) => !isDuplicate(c.topic, recentTopics))
    .sort((a, b) => b.score - a.score)

  if (allCandidates.length === 0) {
    // Fallback to evergreen topic
    const idx = Math.floor(Math.random() * EVERGREEN_TOPICS.length)
    process.stdout.write(`  No candidates found, using evergreen: ${EVERGREEN_TOPICS[idx]}\n`)
    return {
      topic: EVERGREEN_TOPICS[idx],
      source: 'blog',
      score: 30,
      metadata: {},
    }
  }

  return allCandidates[0]
}
