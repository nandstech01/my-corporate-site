/**
 * Buzz Post Collector
 *
 * X API v2 + Brave Search でAI業界バズ投稿を毎日収集。
 * cron: 毎日 UTC 20:00 (JST 05:00)
 */

import { createClient } from '@supabase/supabase-js'
import { getTwitterClient, isTwitterConfigured } from '@/lib/x-api/client'
import { notifyLearningEvent } from '@/lib/ai-judge/slack-notifier'
import { searchTrendingAIContent, type TrendingContent } from './buzzsumo-client'

// ============================================================
// Types
// ============================================================

interface CollectedPost {
  readonly platform: 'x' | 'linkedin'
  readonly external_post_id: string | null
  readonly author_handle: string | null
  readonly post_text: string
  readonly language: string
  readonly likes: number
  readonly reposts: number
  readonly replies: number
  readonly impressions: number
  readonly engagement_rate: number
  readonly buzz_score: number
  readonly relevance_score: number
  readonly post_date: string | null
}

interface CollectionSummary {
  readonly xPosts: number
  readonly enViralPosts: number
  readonly webPosts: number
  readonly errors: readonly string[]
}

interface TwitterSearchTweet {
  readonly id: string
  readonly text: string
  readonly author_id?: string
  readonly created_at?: string
  readonly public_metrics?: {
    readonly like_count: number
    readonly retweet_count: number
    readonly reply_count: number
    readonly impression_count?: number
  }
}

interface TwitterSearchUser {
  readonly id: string
  readonly username: string
}

// ============================================================
// Supabase
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
// Buzz Score Calculation
// ============================================================

function calculateBuzzScore(
  likes: number,
  retweets: number,
  replies: number,
): number {
  return likes * 2 + retweets * 3 + replies * 1
}

// ============================================================
// Relevance Score (keyword matching)
// ============================================================

const RELEVANCE_KEYWORDS: readonly string[] = [
  'ai',
  'llm',
  'gpt',
  'claude',
  'gemini',
  'openai',
  'anthropic',
  'エージェント',
  '生成ai',
  '大規模言語モデル',
  'rag',
  'fine-tuning',
  'ファインチューニング',
  'プロンプト',
  'chatgpt',
  'copilot',
]

function calculateRelevanceScore(text: string): number {
  const lower = text.toLowerCase()
  let matchCount = 0
  RELEVANCE_KEYWORDS.forEach((kw) => {
    if (lower.includes(kw)) {
      matchCount += 1
    }
  })
  return Math.min(matchCount / 5, 1.0)
}

// ============================================================
// X API: Collect buzz posts
// ============================================================

const X_SEARCH_QUERY =
  '(AI OR LLM OR エージェント OR Claude OR GPT) lang:ja -is:retweet'

const EN_VIRAL_SEARCH_QUERY =
  '(Claude Code OR Cursor AI OR AI coding OR Copilot OR Windsurf) lang:en -is:retweet'

// min_faves は Twitter API Free/Basic tier で使用不可のため、
// クライアントサイドで buzz_score フィルタリングを行う
const MIN_BUZZ_SCORE_JA = 50   // likes*2 + retweets*3 + replies*1
const MIN_BUZZ_SCORE_EN = 50

async function collectXBuzzPosts(): Promise<readonly CollectedPost[]> {
  if (!isTwitterConfigured()) {
    process.stdout.write(
      '[buzz-collector] Twitter not configured, skipping X collection\n',
    )
    return []
  }

  try {
    const client = getTwitterClient()

    const result = await client.v2.search(X_SEARCH_QUERY, {
      max_results: 100,
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      'user.fields': ['username'],
      expansions: ['author_id'],
    })

    const tweets: readonly TwitterSearchTweet[] =
      (result.data?.data as unknown as TwitterSearchTweet[]) ?? []
    const users: readonly TwitterSearchUser[] =
      (result.includes?.users as unknown as TwitterSearchUser[]) ?? []

    const userMap = new Map<string, string>()
    users.forEach((u) => {
      userMap.set(u.id, u.username)
    })

    const posts = tweets.map((tweet): CollectedPost => {
      const metrics = tweet.public_metrics
      const likes = metrics?.like_count ?? 0
      const retweets = metrics?.retweet_count ?? 0
      const replies = metrics?.reply_count ?? 0
      const impressions = metrics?.impression_count ?? 0

      const engagementRate =
        impressions > 0
          ? (likes + retweets + replies) / impressions
          : 0

      return {
        platform: 'x',
        external_post_id: tweet.id,
        author_handle: userMap.get(tweet.author_id ?? '') ?? null,
        post_text: tweet.text,
        language: 'ja',
        likes,
        reposts: retweets,
        replies,
        impressions,
        engagement_rate: engagementRate,
        buzz_score: calculateBuzzScore(likes, retweets, replies),
        relevance_score: calculateRelevanceScore(tweet.text),
        post_date: tweet.created_at ?? null,
      }
    })

    // Client-side filtering: min_faves not available on Free/Basic tier
    return posts.filter((p) => p.buzz_score >= MIN_BUZZ_SCORE_JA)
  } catch (error) {
    process.stdout.write(
      `[buzz-collector] X API error: ${error instanceof Error ? error.message : String(error)}\n`,
    )
    return []
  }
}

// ============================================================
// X API: Collect English viral posts (AI coding tools)
// ============================================================

async function collectEnglishViralPosts(): Promise<readonly CollectedPost[]> {
  if (!isTwitterConfigured()) {
    process.stdout.write(
      '[buzz-collector] Twitter not configured, skipping English viral collection\n',
    )
    return []
  }

  try {
    const client = getTwitterClient()

    const result = await client.v2.search(EN_VIRAL_SEARCH_QUERY, {
      max_results: 100,
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      'user.fields': ['username'],
      expansions: ['author_id'],
    })

    const tweets: readonly TwitterSearchTweet[] =
      (result.data?.data as unknown as TwitterSearchTweet[]) ?? []
    const users: readonly TwitterSearchUser[] =
      (result.includes?.users as unknown as TwitterSearchUser[]) ?? []

    const userMap = new Map<string, string>()
    users.forEach((u) => {
      userMap.set(u.id, u.username)
    })

    const posts = tweets.map((tweet): CollectedPost => {
      const metrics = tweet.public_metrics
      const likes = metrics?.like_count ?? 0
      const retweets = metrics?.retweet_count ?? 0
      const replies = metrics?.reply_count ?? 0
      const impressions = metrics?.impression_count ?? 0

      const engagementRate =
        impressions > 0
          ? (likes + retweets + replies) / impressions
          : 0

      return {
        platform: 'x',
        external_post_id: tweet.id,
        author_handle: userMap.get(tweet.author_id ?? '') ?? null,
        post_text: tweet.text,
        language: 'en',
        likes,
        reposts: retweets,
        replies,
        impressions,
        engagement_rate: engagementRate,
        buzz_score: calculateBuzzScore(likes, retweets, replies),
        relevance_score: calculateRelevanceScore(tweet.text),
        post_date: tweet.created_at ?? null,
      }
    })

    // Client-side filtering: min_faves not available on Free/Basic tier
    const filtered = posts.filter((p) => p.buzz_score >= MIN_BUZZ_SCORE_EN)
    process.stdout.write(
      `[buzz-collector] English viral: ${tweets.length} found, ${filtered.length} above threshold\n`,
    )
    return filtered
  } catch (error) {
    process.stdout.write(
      `[buzz-collector] English viral collection error: ${error instanceof Error ? error.message : String(error)}\n`,
    )
    return []
  }
}

// ============================================================
// Web (Brave Search): Collect buzz content
// ============================================================

function webContentToCollectedPost(
  content: TrendingContent,
): CollectedPost {
  return {
    platform: 'linkedin',
    external_post_id: content.url,
    author_handle: content.source ?? null,
    post_text: `${content.title}\n\n${content.description}`,
    language: 'ja',
    likes: 0,
    reposts: 0,
    replies: 0,
    impressions: 0,
    engagement_rate: 0,
    buzz_score: 0,
    relevance_score: calculateRelevanceScore(
      `${content.title} ${content.description}`,
    ),
    post_date: null,
  }
}

async function collectWebBuzzContent(): Promise<readonly CollectedPost[]> {
  try {
    const results = await searchTrendingAIContent({ language: 'ja', limit: 15 })
    return results.map(webContentToCollectedPost)
  } catch (error) {
    process.stdout.write(
      `[buzz-collector] Web collection error: ${error instanceof Error ? error.message : String(error)}\n`,
    )
    return []
  }
}

// ============================================================
// Save to DB (deduplicate by external_post_id)
// ============================================================

async function savePosts(
  posts: readonly CollectedPost[],
): Promise<number> {
  if (posts.length === 0) return 0

  const supabase = getSupabase()
  let savedCount = 0

  // Process sequentially to handle dedup per-row
  for (const post of posts) {
    try {
      // Skip if already collected (deduplicate)
      if (post.external_post_id) {
        const { data: existing } = await supabase
          .from('buzz_posts')
          .select('id')
          .eq('external_post_id', post.external_post_id)
          .limit(1)
          .maybeSingle()

        if (existing) continue
      }

      const { error } = await supabase.from('buzz_posts').insert({
        platform: post.platform,
        external_post_id: post.external_post_id,
        author_handle: post.author_handle,
        post_text: post.post_text,
        language: post.language,
        likes: post.likes,
        reposts: post.reposts,
        replies: post.replies,
        impressions: post.impressions,
        engagement_rate: post.engagement_rate,
        buzz_score: post.buzz_score,
        relevance_score: post.relevance_score,
        post_date: post.post_date,
      })

      if (error) {
        process.stdout.write(
          `[buzz-collector] DB insert error: ${error.message}\n`,
        )
      } else {
        savedCount += 1
      }
    } catch (error) {
      process.stdout.write(
        `[buzz-collector] Save error: ${error instanceof Error ? error.message : String(error)}\n`,
      )
    }
  }

  return savedCount
}

// ============================================================
// Main entry point
// ============================================================

export async function runBuzzCollector(): Promise<CollectionSummary> {
  process.stdout.write('[buzz-collector] Starting daily buzz collection\n')

  const errors: string[] = []

  // Collect from X (JP), X (EN viral), and Web in parallel
  const [xPosts, enViralPosts, webPosts] = await Promise.all([
    collectXBuzzPosts().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`X: ${msg}`)
      return [] as readonly CollectedPost[]
    }),
    collectEnglishViralPosts().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`EN Viral: ${msg}`)
      return [] as readonly CollectedPost[]
    }),
    collectWebBuzzContent().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Web: ${msg}`)
      return [] as readonly CollectedPost[]
    }),
  ])

  // Save to DB
  const xSaved = await savePosts(xPosts)
  const enViralSaved = await savePosts(enViralPosts)
  const webSaved = await savePosts(webPosts)

  const summary: CollectionSummary = {
    xPosts: xSaved,
    enViralPosts: enViralSaved,
    webPosts: webSaved,
    errors,
  }

  process.stdout.write(
    `[buzz-collector] Done: X=${xSaved}, EN Viral=${enViralSaved}, Web=${webSaved}, errors=${errors.length}\n`,
  )

  // Notify via Slack
  try {
    await notifyLearningEvent({
      eventType: 'pattern_learned',
      summary: `Buzz収集完了: X ${xSaved}件, EN Viral ${enViralSaved}件, Web ${webSaved}件${errors.length > 0 ? ` (エラー: ${errors.length}件)` : ''}`,
      details: {
        xCollected: xPosts.length,
        xSaved,
        enViralCollected: enViralPosts.length,
        enViralSaved,
        webCollected: webPosts.length,
        webSaved,
        errors,
      },
    })
  } catch (notifyError) {
    process.stdout.write(
      `[buzz-collector] Slack notification failed: ${notifyError instanceof Error ? notifyError.message : String(notifyError)}\n`,
    )
  }

  return summary
}
