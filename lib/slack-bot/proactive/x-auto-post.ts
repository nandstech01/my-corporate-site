/**
 * X 自動投稿生成ジョブ
 *
 * GitHub Actions cron (UTC 2,6,12 = JST 11,15,21) で実行。
 * スパム検出回避のため、実行時に 0~5 分のランダム遅延を挟む。
 *
 * 1. ランダム遅延 (0~5分)
 * 2. slack_bot_memory から直近の linkedin_sources を recall (共有ソース)
 * 3. フォールバック: trending_topics メモリ recall
 * 4. 重複排除 (直近7日のX投稿テキスト + pending actions sourceUrl)
 * 5. トップ1件の候補を選定
 * 6. generateXPost({ mode:'research' }) で投稿生成
 * 7. fetchMediaForPost() でメディア取得 (best-effort)
 * 8. createPendingAction + buildApprovalBlocks で Slack 承認フロー
 */

import { createClient } from '@supabase/supabase-js'
import { createPendingAction, getRecentXPostTexts, getRecentXSourceUrls, getRecentXMediaUrls } from '../memory'
import { sendMessage, buildApprovalBlocks } from '../slack-client'
import { generateXPost } from '../../x-post-generation/post-graph'
import { generateQuoteTweet } from '../../x-quote-generation/quote-graph'
import { fetchMediaForPost } from '../../x-api/media'
import { retweetPost } from '../../x-api/client'
import { savePostAnalytics } from '../memory'
import { isAiJudgeEnabled } from '../../ai-judge/config'
import { autoResolvePost } from '../../ai-judge/auto-resolver'
import { calculateCharacterOverlap } from '../../ai-judge/safety-checks'
import { uploadMediaToX } from '../../x-api/media'
import { generateArticleThumbnail } from '../../x-article/thumbnail-generator'
import { watchTrends } from '../../trending/trend-watcher'
import type { TrendingOpportunity } from '../../trending/priority-queue'
import type { LinkedInTopicCandidate } from '../../linkedin-source-collector/source-analyzer'

// ============================================================
// ランダム遅延（スパム検出回避）
// ============================================================

const MAX_DELAY_MINUTES = 5

async function randomDelay(): Promise<void> {
  const delayMs = Math.floor(Math.random() * MAX_DELAY_MINUTES * 60 * 1000)
  const delayMin = Math.round(delayMs / 60_000)
  process.stdout.write(`X auto-post: Random delay ${delayMin} min before execution\n`)
  await new Promise((resolve) => setTimeout(resolve, delayMs))
}

// ============================================================
// ソースメモリの取得
// ============================================================

interface MemoryRow {
  readonly content: string
  readonly context: Record<string, unknown> | null
}

interface MemoryContext {
  readonly source?: string
  readonly candidates?: readonly LinkedInTopicCandidate[]
}

async function recallSourceMemories(
  slackUserId: string,
  sourceType: string,
  limit: number,
): Promise<readonly MemoryRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  const supabase = createClient(url, key)

  // Only recall memories from the last 7 days to prevent stale content
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('slack_bot_memory')
    .select('*')
    .eq('slack_user_id', slackUserId)
    .eq('context->>source', sourceType)
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to recall ${sourceType} memories: ${error.message}`)
  }

  return (data ?? []) as readonly MemoryRow[]
}

// ============================================================
// 候補抽出
// ============================================================

function extractCandidatesFromMemories(
  memories: readonly MemoryRow[],
): readonly LinkedInTopicCandidate[] {
  const allCandidates: LinkedInTopicCandidate[] = []
  const seen = new Set<string>()

  for (const memory of memories) {
    const ctx = memory.context as MemoryContext | null
    if (ctx?.candidates && Array.isArray(ctx.candidates)) {
      for (const candidate of ctx.candidates) {
        // URL or title-based dedup across memory rows
        const key = candidate.sourceUrl || candidate.title
        if (key && !seen.has(key)) {
          seen.add(key)
          allCandidates.push(candidate)
        }
      }
    }
  }

  return allCandidates
}

// ============================================================
// 重複排除
// ============================================================

async function getRecentPendingSourceUrls(): Promise<ReadonlySet<string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return new Set()

  const supabase = createClient(url, key)
  // Extend dedup window to 30 days to prevent stale content resurfacing
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('slack_pending_actions')
    .select('payload')
    .in('action_type', ['post_x', 'post_x_long'])
    .gte('created_at', since)

  if (!data) return new Set()

  const urls = new Set<string>()
  for (const row of data) {
    const payload = row.payload as Record<string, unknown> | null
    if (payload?.sourceUrl && typeof payload.sourceUrl === 'string') {
      urls.add(payload.sourceUrl)
    }
  }
  return urls
}

/** pending actionsから直近使用済みの画像URLを取得 */
async function getRecentPendingImageUrls(): Promise<ReadonlySet<string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return new Set()

  const supabase = createClient(url, key)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('slack_pending_actions')
    .select('payload')
    .in('action_type', ['post_x', 'post_x_long'])
    .gte('created_at', since)

  if (!data) return new Set()

  const urls = new Set<string>()
  for (const row of data) {
    const payload = row.payload as Record<string, unknown> | null
    if (payload?.mediaUrl && typeof payload.mediaUrl === 'string') {
      urls.add(payload.mediaUrl)
    }
  }
  return urls
}

const TITLE_SIMILARITY_THRESHOLD = 0.35

/**
 * タイトルからキーワードを抽出（助詞・一般語を除去）
 */
function extractTitleKeywords(title: string): readonly string[] {
  return title
    .toLowerCase()
    .replace(/[（）()「」『』【】\[\]]/g, ' ')
    .split(/[\s、,・:：\-—]+/)
    .filter((w) => w.length >= 2)
    .filter((w) => !['the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'has', 'have', 'its', 'about', 'into', 'new', 'how'].includes(w))
}

function deduplicateCandidates(
  candidates: readonly LinkedInTopicCandidate[],
  recentPostTexts: readonly string[],
  recentPendingUrls: ReadonlySet<string>,
  recentPostedUrls: ReadonlySet<string>,
): readonly LinkedInTopicCandidate[] {
  return candidates.filter((candidate) => {
    // 1. pending action URL一致 → 除外（空URLはスキップ）
    if (candidate.sourceUrl && recentPendingUrls.has(candidate.sourceUrl)) return false
    // 2. 投稿済みソースURL一致 → 除外（空URLはスキップ）
    if (candidate.sourceUrl && recentPostedUrls.has(candidate.sourceUrl)) return false
    // 3. タイトル類似度チェック (substring + bigram Jaccard + keyword overlap)
    const titleLower = candidate.title.toLowerCase()
    const titleKeywords = extractTitleKeywords(candidate.title)
    for (const text of recentPostTexts) {
      const textLower = text.toLowerCase()
      // 3a. タイトルが投稿テキストに含まれる
      if (textLower.includes(titleLower)) return false
      // 3b. bigram Jaccard類似度（しきい値を下げて検出力向上）
      if (calculateCharacterOverlap(titleLower, textLower) >= TITLE_SIMILARITY_THRESHOLD) return false
      // 3c. キーワード一致率: タイトルのキーワードの60%以上が投稿テキストに含まれる → 同トピック
      if (titleKeywords.length >= 2) {
        const matchCount = titleKeywords.filter((kw) => textLower.includes(kw)).length
        if (matchCount / titleKeywords.length >= 0.6) return false
      }
    }
    return true
  })
}

// ============================================================
// Quote RT Opportunity
// ============================================================

async function tryQuoteRTOpportunity(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  const supabase = createClient(url, key)

  // Find top pending opportunity
  const { data: opportunity } = await supabase
    .from('x_quote_opportunities')
    .select('*')
    .eq('status', 'pending')
    .order('opportunity_score', { ascending: false })
    .limit(1)
    .single()

  if (!opportunity) return false

  // Mark as generating
  await supabase
    .from('x_quote_opportunities')
    .update({ status: 'generating' })
    .eq('id', opportunity.id)

  try {
    // Generate quote tweet
    const quoteResult = await generateQuoteTweet({
      originalTweetId: opportunity.original_tweet_id,
      originalText: opportunity.original_text,
      originalAuthor: opportunity.original_author_username,
    })

    // Post via AI Judge
    const result = await autoResolvePost({
      platform: 'x',
      text: quoteResult.quoteText,
      quoteTweetId: opportunity.original_tweet_id,
      patternUsed: `quote_${quoteResult.opinionTemplateUsed}`,
    })

    if (result.success) {
      await supabase
        .from('x_quote_opportunities')
        .update({
          status: 'posted',
          generated_quote_text: quoteResult.quoteText,
          quote_tweet_id: result.postId,
          posted_at: new Date().toISOString(),
        })
        .eq('id', opportunity.id)
      return true
    }

    await supabase
      .from('x_quote_opportunities')
      .update({
        status: 'skipped',
        generated_quote_text: quoteResult.quoteText,
        skip_reason: result.error ?? 'AI Judge rejected',
      })
      .eq('id', opportunity.id)
    return false
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    await supabase
      .from('x_quote_opportunities')
      .update({ status: 'skipped', skip_reason: msg })
      .eq('id', opportunity.id)
    return false
  }
}

// ============================================================
// Adaptive Content Distribution
// ============================================================

const DEFAULT_WEIGHTS: Record<string, number> = {
  repost: 0.10,
  quote: 0.20,
  viral_article: 0.10,
  thread: 0.10,
  article: 0.10,
  original: 0.40,
} as const

const MIN_WEIGHT = 0.05
const MIN_DATA_POINTS = 5
const LOOKBACK_DAYS = 14

async function getAdaptiveContentDistribution(): Promise<Record<string, number>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { ...DEFAULT_WEIGHTS }

  const supabase = createClient(url, key)
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .select('post_type, engagement_rate')
    .gte('posted_at', since)
    .not('post_type', 'is', null)

  if (error || !data || data.length === 0) {
    return { ...DEFAULT_WEIGHTS }
  }

  // Group by post_type, calculate average engagement_rate
  const grouped: Record<string, { sum: number; count: number }> = {}
  for (const row of data) {
    const rawType = (row.post_type as string) ?? 'original'
    const type = rawType === 'reply' ? 'original' : rawType
    if (!grouped[type]) {
      grouped[type] = { sum: 0, count: 0 }
    }
    grouped[type].sum += (row.engagement_rate as number) ?? 0
    grouped[type].count += 1
  }

  // Build weights: use engagement data if enough data points, else default
  const allTypes = Object.keys(DEFAULT_WEIGHTS)
  const weights: Record<string, number> = {}

  for (const type of allTypes) {
    const group = grouped[type]
    if (group && group.count >= MIN_DATA_POINTS) {
      weights[type] = group.sum / group.count
    } else {
      weights[type] = DEFAULT_WEIGHTS[type]
    }
  }

  // Normalize: convert to relative weights summing to 1.0
  const totalEngagement = Object.values(weights).reduce((sum, w) => sum + w, 0)
  if (totalEngagement <= 0) return { ...DEFAULT_WEIGHTS }

  for (const type of allTypes) {
    weights[type] = weights[type] / totalEngagement
  }

  // Enforce minimum weight per type for exploration
  let deficit = 0
  let surplus = 0
  for (const type of allTypes) {
    if (weights[type] < MIN_WEIGHT) {
      deficit += MIN_WEIGHT - weights[type]
      weights[type] = MIN_WEIGHT
    } else {
      surplus += weights[type] - MIN_WEIGHT
    }
  }

  // Redistribute deficit proportionally from types above minimum
  if (deficit > 0 && surplus > 0) {
    for (const type of allTypes) {
      if (weights[type] > MIN_WEIGHT) {
        const aboveMin = weights[type] - MIN_WEIGHT
        weights[type] = MIN_WEIGHT + aboveMin * (1 - deficit / surplus)
      }
    }
  }

  // Final normalization to exactly 1.0
  const finalSum = Object.values(weights).reduce((sum, w) => sum + w, 0)
  for (const type of allTypes) {
    weights[type] = weights[type] / finalSum
  }

  process.stdout.write(
    `X auto-post: Adaptive weights: ${allTypes.map((t) => `${t}=${(weights[t] * 100).toFixed(1)}%`).join(', ')}\n`,
  )

  return weights
}

// ============================================================
// Repost (Retweet) Opportunity
// ============================================================

const REPOST_SCORE_THRESHOLD = 0.7

async function tryRepostOpportunity(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  const supabase = createClient(url, key)

  // Find high-scoring pending opportunity for repost
  const { data: opportunity } = await supabase
    .from('x_quote_opportunities')
    .select('*')
    .eq('status', 'pending')
    .gte('opportunity_score', REPOST_SCORE_THRESHOLD)
    .order('opportunity_score', { ascending: false })
    .limit(1)
    .single()

  if (!opportunity) return false

  try {
    const result = await retweetPost(opportunity.original_tweet_id)

    if (result.success) {
      await supabase
        .from('x_quote_opportunities')
        .update({
          status: 'retweeted',
          posted_at: new Date().toISOString(),
        })
        .eq('id', opportunity.id)

      // Save analytics
      try {
        await savePostAnalytics({
          tweetId: opportunity.original_tweet_id,
          tweetUrl: result.tweetUrl,
          postText: `[RT] ${opportunity.original_text.slice(0, 200)}`,
          postType: 'repost',
        })
      } catch {
        // Best-effort
      }

      process.stdout.write(
        `X auto-post: Retweeted @${opportunity.original_author_username} (score: ${opportunity.opportunity_score.toFixed(2)})\n`,
      )
      return true
    }

    return false
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X auto-post: Repost failed: ${msg}\n`)
    return false
  }
}

// ============================================================
// Viral Quote Article (海外バズ投稿を引用RT + 長文記事)
// ============================================================

async function tryViralQuoteArticle(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  const supabase = createClient(url, key)

  // Find high-engagement English tweets about AI coding tools (last 3 days)
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  const { data: viralPosts } = await supabase
    .from('buzz_posts')
    .select('*')
    .eq('platform', 'x')
    .eq('language', 'en')
    .gte('buzz_score', 100)
    .gte('post_date', threeDaysAgo)
    .order('buzz_score', { ascending: false })
    .limit(5)

  if (!viralPosts || viralPosts.length === 0) return false

  // Dedup: skip tweets we've already quoted
  const recentTexts = await getRecentXPostTexts(30)

  const candidate = viralPosts.find((post) => {
    const tweetId = post.external_post_id as string | null
    if (!tweetId) return false
    return !recentTexts.some((text) => text.includes(tweetId))
  })

  if (!candidate || !candidate.external_post_id) return false

  process.stdout.write(
    `X auto-post: Generating viral quote article for @${candidate.author_handle}: "${(candidate.post_text as string).slice(0, 80)}..."\n`,
  )

  // Generate long-form article about this viral post
  const postResult = await generateXPost({
    mode: 'article',
    content: candidate.post_text as string,
    topic: `Viral AI coding post by @${candidate.author_handle}`,
  })

  // Post as quote tweet + long-form article
  const result = await autoResolvePost({
    platform: 'x',
    text: postResult.finalPost,
    quoteTweetId: candidate.external_post_id as string,
    longForm: true,
    sourceTitle: (candidate.post_text as string).slice(0, 100),
    patternUsed: postResult.patternUsed,
    tags: [...postResult.tags, 'viral_quote_article'],
  })

  // Fallback: if quote tweet fails (403 = quoting restricted), post as regular long-form article
  if (!result.success && result.error?.includes('403')) {
    process.stdout.write(
      `X auto-post (viral quote article): Quote tweet 403, falling back to regular article\n`,
    )
    const fallbackResult = await autoResolvePost({
      platform: 'x',
      text: postResult.finalPost,
      longForm: true,
      sourceTitle: (candidate.post_text as string).slice(0, 100),
      patternUsed: postResult.patternUsed,
      tags: [...postResult.tags, 'viral_quote_article', 'quote_fallback'],
    })
    process.stdout.write(
      `X auto-post (viral quote article fallback): @${candidate.author_handle} → ${fallbackResult.success ? 'posted' : 'rejected'}\n`,
    )
    return fallbackResult.success
  }

  process.stdout.write(
    `X auto-post (viral quote article): @${candidate.author_handle} → ${result.success ? 'posted' : 'rejected'}${result.error ? ` (${result.error})` : ''}\n`,
  )

  return result.success
}

// ============================================================
// Trending Reactive Post
// ============================================================

const TRENDING_SCORE_THRESHOLD = 0.7

async function tryTrendingReactive(): Promise<boolean> {
  try {
    const opportunities = await watchTrends()
    if (opportunities.length === 0) return false

    const top = opportunities[0]
    if (top.score < TRENDING_SCORE_THRESHOLD) {
      process.stdout.write(
        `X auto-post: Top trend score ${top.score.toFixed(2)} below threshold ${TRENDING_SCORE_THRESHOLD}\n`,
      )
      return false
    }

    if (top.urgency !== 'breaking' && top.urgency !== 'trending') {
      return false
    }

    process.stdout.write(
      `X auto-post: Trending reactive — ${top.urgency} opportunity (score=${top.score.toFixed(2)}): "${top.topic.slice(0, 80)}..."\n`,
    )

    return await generateTrendingPost(top)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X auto-post: Trending check failed: ${msg}\n`)
    return false
  }
}

async function generateTrendingPost(
  opportunity: TrendingOpportunity,
): Promise<boolean> {
  let trendingRecentTexts: readonly string[] = []
  try { trendingRecentTexts = await getRecentXPostTexts(30) } catch { /* best-effort */ }

  const postResult = await generateXPost({
    mode: 'research',
    content: opportunity.topic,
    topic: opportunity.topic.slice(0, 100),
    recentPostTexts: trendingRecentTexts,
  })

  if (!isAiJudgeEnabled()) {
    process.stdout.write('X auto-post (trending_reactive): AI Judge disabled, skipping\n')
    return false
  }

  const result = await autoResolvePost({
    platform: 'x',
    text: postResult.finalPost,
    longForm: true,
    patternUsed: postResult.patternUsed,
    tags: [...postResult.tags, 'trending_reactive', opportunity.urgency],
  })

  process.stdout.write(
    `X auto-post (trending_reactive): ${result.success ? 'posted' : 'rejected'} — urgency=${opportunity.urgency}, source=${opportunity.source}\n`,
  )

  return result.success
}

// ============================================================
// メイン
// ============================================================

const PREVIEW_CHAR_LIMIT = 500

export async function runXAutoPost(): Promise<void> {
  try {
    await runXAutoPostInner()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X auto-post critical failure: ${message}\n`)
    try {
      const channel = process.env.SLACK_DEFAULT_CHANNEL
      if (channel) {
        await sendMessage({
          channel,
          text: `:rotating_light: X自動投稿でクリティカルエラー: ${message}`,
        })
      }
    } catch { /* Slack通知自体の失敗は無視 */ }
  }
}

async function runXAutoPostInner(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error(
      'SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required',
    )
  }

  // 1. ランダム遅延（スパム検出回避）
  await randomDelay()

  // 1.1. 直近投稿テキスト + URLセット + 画像URLを早期取得（重複排除用）
  let recentTexts: readonly string[] = []
  let recentPendingUrls: ReadonlySet<string> = new Set()
  let recentPostedUrls: ReadonlySet<string> = new Set()
  let recentImageUrls: ReadonlySet<string> = new Set()
  try {
    const [texts, pending, posted, mediaUrls, pendingImageUrls] = await Promise.all([
      getRecentXPostTexts(30),
      getRecentPendingSourceUrls(),
      getRecentXSourceUrls(14),
      getRecentXMediaUrls(14),
      getRecentPendingImageUrls(),
    ])
    recentTexts = texts
    recentPendingUrls = pending
    recentPostedUrls = new Set(posted)
    // 画像URLは analytics + pending actions の両方からマージ
    const allImageUrls = new Set(mediaUrls)
    for (const u of pendingImageUrls) allImageUrls.add(u)
    recentImageUrls = allImageUrls
  } catch { /* best-effort */ }

  // 1.5. Check for high-priority trending opportunities before content distribution
  const trendingResult = await tryTrendingReactive()
  if (trendingResult) {
    process.stdout.write('X auto-post: Trending reactive post completed\n')
    return
  }

  // 1.6. Fresh high-value quote RT gets priority over distribution roll
  if (isAiJudgeEnabled() && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const urgentSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: urgentQuote } = await urgentSupabase
      .from('x_quote_opportunities')
      .select('*')
      .eq('status', 'pending')
      .gte('opportunity_score', 0.7)
      .gte('detected_at', oneHourAgo)
      .order('opportunity_score', { ascending: false })
      .limit(1)
      .single()

    if (urgentQuote) {
      const quoted = await tryQuoteRTOpportunity()
      if (quoted) {
        process.stdout.write('X auto-post: Urgent quote RT posted (< 1 hour old)\n')
        return
      }
    }
  }

  // 2. Adaptive content distribution based on engagement data
  let weights: Record<string, number>
  try {
    weights = await getAdaptiveContentDistribution()
  } catch {
    weights = { ...DEFAULT_WEIGHTS }
  }

  const roll = Math.random()
  let cumulative = 0

  cumulative += weights.repost
  if (roll < cumulative) {
    // Try repost (retweet) for very high engagement posts
    try {
      const reposted = await tryRepostOpportunity()
      if (reposted) {
        process.stdout.write('X auto-post: Repost completed successfully\n')
        return
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Repost attempt failed: ${msg}\n`)
    }
  }

  cumulative += weights.quote
  if (roll >= cumulative - weights.quote && roll < cumulative && isAiJudgeEnabled()) {
    // Try quote RT
    try {
      const quoted = await tryQuoteRTOpportunity()
      if (quoted) {
        process.stdout.write('X auto-post: Quote RT posted successfully\n')
        return
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Quote RT attempt failed: ${msg}\n`)
    }
  }

  cumulative += weights.viral_article
  if (roll >= cumulative - weights.viral_article && roll < cumulative && isAiJudgeEnabled()) {
    // Try viral quote article — 海外バズ投稿を引用RT + 長文記事
    try {
      const viralQuoted = await tryViralQuoteArticle()
      if (viralQuoted) {
        process.stdout.write('X auto-post: Viral quote article posted successfully\n')
        return
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Viral quote article attempt failed: ${msg}\n`)
    }
    // Falls through to original post if no viral candidates
  }

  cumulative += weights.thread
  if (roll >= cumulative - weights.thread && roll < cumulative && isAiJudgeEnabled()) {
    // Try thread generation
    try {
      const threadMemories = await recallSourceMemories(userId, 'linkedin_sources', 3)
      if (threadMemories.length > 0) {
        const rawThreadCandidates = extractCandidatesFromMemories(threadMemories)
        const threadCandidates = deduplicateCandidates(
          rawThreadCandidates, recentTexts, recentPendingUrls, recentPostedUrls,
        )
        if (threadCandidates.length > 0) {
          const topCandidate = threadCandidates[0]
          const postResult = await generateXPost({
            mode: 'thread',
            content: topCandidate.sourceBody,
            recentPostTexts: recentTexts,
            topic: topCandidate.title,
          })
          const segments = postResult.finalPost
            .split('\n===\n')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
          if (segments.length >= 2) {
            const result = await autoResolvePost({
              platform: 'x',
              text: segments[0],
              longForm: true,
              threadSegments: segments,
              sourceUrl: topCandidate.sourceUrl,
              sourceTitle: topCandidate.title,
              patternUsed: postResult.patternUsed,
              tags: postResult.tags,
            })
            process.stdout.write(
              `X auto-post (thread): "${topCandidate.title}" → ${result.success ? 'posted' : 'rejected'}${result.error ? ` (${result.error})` : ''}\n`,
            )
            return
          }
          process.stdout.write(`X auto-post: Thread had only ${segments.length} segment(s), falling through to original\n`)
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Thread attempt failed: ${msg}\n`)
    }
    // Falls through to original post if thread generation fails
  }

  cumulative += weights.article
  if (roll >= cumulative - weights.article && roll < cumulative && isAiJudgeEnabled()) {
    // Try article (long-form) generation
    try {
      const articleMemories = await recallSourceMemories(userId, 'linkedin_sources', 3)
      if (articleMemories.length > 0) {
        const rawArticleCandidates = extractCandidatesFromMemories(articleMemories)
        const articleCandidates = deduplicateCandidates(
          rawArticleCandidates, recentTexts, recentPendingUrls, recentPostedUrls,
        )
        if (articleCandidates.length > 0) {
          const topCandidate = articleCandidates[0]
          const postResult = await generateXPost({
            mode: 'article',
            content: topCandidate.sourceBody,
            topic: topCandidate.title,
            recentPostTexts: recentTexts,
          })

          // Generate thumbnail (best-effort)
          let thumbnailMediaId: string | undefined
          try {
            const thumbnail = await generateArticleThumbnail({
              title: postResult.articleTitle ?? topCandidate.title,
              keyPoints: postResult.articleKeyPoints,
            })
            if (thumbnail) {
              const mediaId = await uploadMediaToX(thumbnail.imageBuffer, 'image/png')
              if (mediaId) {
                thumbnailMediaId = mediaId
                process.stdout.write(`X auto-post (article): thumbnail uploaded (${thumbnail.imageUrl})\n`)
              }
            }
          } catch {
            // Best-effort: thumbnail failure should not block posting
          }

          const result = await autoResolvePost({
            platform: 'x',
            text: postResult.finalPost,
            longForm: true,
            mediaIds: thumbnailMediaId ? [thumbnailMediaId] : undefined,
            sourceUrl: topCandidate.sourceUrl,
            sourceTitle: topCandidate.title,
            patternUsed: postResult.patternUsed,
            tags: postResult.tags,
          })
          process.stdout.write(
            `X auto-post (article): "${topCandidate.title}" → ${result.success ? 'posted' : 'rejected'}${result.error ? ` (${result.error})` : ''}${thumbnailMediaId ? ' (with thumbnail)' : ''}\n`,
          )
          return
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      process.stdout.write(`X auto-post: Article attempt failed: ${msg}\n`)
    }
    // Falls through to original post if article generation fails
  }

  // 2. linkedin_sources メモリを取得 (LinkedIn collector が収集済みのソースを共有)
  let memories = await recallSourceMemories(userId, 'linkedin_sources', 5)

  // フォールバック: trending_topics
  if (memories.length === 0) {
    process.stdout.write('X auto-post: No linkedin_sources, falling back to trending_topics\n')
    memories = await recallSourceMemories(userId, 'trending_topics', 3)
  }

  if (memories.length === 0) {
    await sendMessage({
      channel,
      text: ':bird: X auto-post: No source data available. Run source collector or trending collector first.',
    })
    return
  }

  // 2. メモリから候補を抽出
  const allCandidates = extractCandidatesFromMemories(memories)

  // trending_topics にはcandidates配列がない場合、content から簡易候補を生成
  if (allCandidates.length === 0 && memories.length > 0) {
    const trendingContent = memories[0].content
    if (trendingContent) {
      process.stdout.write('X auto-post: Using trending content directly as topic\n')

      try {
        const postResult = await generateXPost({
          mode: 'research',
          content: trendingContent,
          topic: 'tech trends',
        })

        // AI Judge 自動投稿モード
        if (isAiJudgeEnabled()) {
          const result = await autoResolvePost({
            platform: 'x',
            text: postResult.finalPost,
            longForm: true,
            patternUsed: postResult.patternUsed,
            tags: postResult.tags,
          })
          process.stdout.write(
            `X auto-post (trending, AI Judge): ${result.success ? 'posted' : 'rejected'} - ${result.verdict.reasoning}\n`,
          )
          return
        }

        const action = await createPendingAction({
          slackChannelId: channel,
          slackUserId: userId,
          slackThreadTs: null,
          actionType: 'post_x',
          payload: {
            text: postResult.finalPost,
            patternUsed: postResult.patternUsed,
            tags: postResult.tags,
          },
          previewText: postResult.finalPost,
        })

        const approvalBlocks = buildApprovalBlocks({
          title: ':bird: *X Post Preview (from trending)*',
          previewText: postResult.finalPost.slice(0, PREVIEW_CHAR_LIMIT),
          actionId: action.id,
          actionType: 'post',
        })

        await sendMessage({
          channel,
          text: 'X auto-post preview (trending)',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':mega: *X投稿を自動生成しました！確認お願いします*',
              },
            },
            { type: 'divider' },
            ...approvalBlocks,
          ],
        })

        process.stdout.write('X auto-post: Sent trending-based approval request\n')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        process.stdout.write(`X auto-post: Trending post generation failed: ${message}\n`)
        await sendMessage({
          channel,
          text: `:bird: X auto-post: Post generation failed - ${message}`,
        })
      }
      return
    }

    await sendMessage({
      channel,
      text: ':bird: X auto-post: Source data found but no structured candidates.',
    })
    return
  }

  // 3. 重複排除（URLセットは早期取得済み）
  let candidates: readonly LinkedInTopicCandidate[] = allCandidates
  try {
    const deduped = deduplicateCandidates(
      allCandidates,
      recentTexts,
      recentPendingUrls,
      recentPostedUrls,
    )

    if (deduped.length < allCandidates.length) {
      process.stdout.write(
        `X auto-post dedup: ${allCandidates.length - deduped.length} duplicate(s) removed\n`,
      )
    }

    if (deduped.length === 0) {
      process.stdout.write('X auto-post: All linkedin_sources candidates are duplicates. Falling back to trending_topics.\n')

      // フォールバック: trending_topicsから新しいトピックで投稿生成
      try {
        const trendingMemories = await recallSourceMemories(userId, 'trending_topics', 3)
        if (trendingMemories.length > 0) {
          const trendingContent = trendingMemories[0].content
          if (trendingContent) {
            const postResult = await generateXPost({
              mode: 'research',
              content: trendingContent,
              topic: 'tech trends',
              recentPostTexts: recentTexts,
            })

            if (isAiJudgeEnabled()) {
              const result = await autoResolvePost({
                platform: 'x',
                text: postResult.finalPost,
                longForm: true,
                patternUsed: postResult.patternUsed,
                tags: postResult.tags,
              })
              process.stdout.write(
                `X auto-post (dedup fallback, AI Judge): ${result.success ? 'posted' : 'rejected'}\n`,
              )
              return
            }
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        process.stdout.write(`X auto-post: Dedup fallback failed: ${msg}\n`)
      }

      process.stdout.write('X auto-post: No fallback sources available. Skipping.\n')
      return
    }
    candidates = deduped
  } catch {
    // Dedup failure should not block the pipeline
  }

  // 4. トップ1件を選定
  const topCandidate = candidates[0]
  process.stdout.write(`X auto-post: Generating post for "${topCandidate.title}"\n`)

  // 5. generateXPost で投稿生成
  let postResult
  try {
    postResult = await generateXPost({
      mode: 'research',
      content: topCandidate.sourceBody,
      topic: topCandidate.title,
      recentPostTexts: recentTexts,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X auto-post: Post generation failed: ${message}\n`)
    await sendMessage({
      channel,
      text: `:bird: X auto-post: Post generation failed for "${topCandidate.title}" - ${message}`,
    })
    return
  }

  // 6. メディア取得 (best-effort, 画像重複排除あり)
  let mediaIds: string[] | undefined
  let mediaUrl: string | undefined
  try {
    const media = await fetchMediaForPost({
      sourceUrl: topCandidate.sourceUrl,
      topic: topCandidate.title,
      recentImageUrls,
    })
    if (media?.mediaId) {
      mediaIds = [media.mediaId]
      mediaUrl = media.imageUrl
      process.stdout.write(`X auto-post: Media attached${media.imageUrl ? ` (${media.imageUrl.slice(0, 80)})` : ''}\n`)
    }
  } catch {
    // メディア取得失敗はテキストのみ投稿で続行
    process.stdout.write('X auto-post: Media fetch failed, proceeding with text only\n')
  }

  // 7. AI Judge 自動投稿 or Slack 承認フロー
  try {
    // AI Judge 自動投稿モード
    if (isAiJudgeEnabled()) {
      const result = await autoResolvePost({
        platform: 'x',
        text: postResult.finalPost,
        longForm: true,
        sourceUrl: topCandidate.sourceUrl,
        sourceTitle: topCandidate.title,
        patternUsed: postResult.patternUsed,
        tags: postResult.tags,
        mediaIds,
        mediaUrl,
      })
      process.stdout.write(
        `X auto-post (AI Judge): "${topCandidate.title}" → ${result.success ? 'posted' : 'rejected'}${result.error ? ` (${result.error})` : ''}\n`,
      )
      return
    }

    // レガシー: Slack 承認フロー
    const action = await createPendingAction({
      slackChannelId: channel,
      slackUserId: userId,
      slackThreadTs: null,
      actionType: 'post_x',
      payload: {
        text: postResult.finalPost,
        sourceUrl: topCandidate.sourceUrl,
        patternUsed: postResult.patternUsed,
        tags: postResult.tags,
        ...(mediaIds ? { mediaIds } : {}),
        ...(mediaUrl ? { mediaUrl } : {}),
      },
      previewText: postResult.finalPost,
    })

    const approvalBlocks = buildApprovalBlocks({
      title: ':bird: *X Post Preview*',
      previewText: postResult.finalPost.slice(0, PREVIEW_CHAR_LIMIT),
      actionId: action.id,
      actionType: 'post',
    })

    const scoreTotal = postResult.scores.length > 0
      ? Math.round(
          postResult.scores.reduce((sum, s) => sum + s.total, 0) /
            postResult.scores.length,
        )
      : 0

    const infoLines = [
      `:newspaper: *ソース:* ${topCandidate.title}`,
      `:link: *URL:* ${topCandidate.sourceUrl}`,
      `:bar_chart: *スコア:* ${scoreTotal}/50`,
      `:memo: *パターン:* ${postResult.patternUsed}`,
      ...(mediaIds ? [':camera: *メディア:* 添付済み'] : []),
    ]

    await sendMessage({
      channel,
      text: `X auto-post preview: ${topCandidate.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':mega: *X投稿を自動生成しました！確認お願いします*',
          },
        },
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: infoLines.join('\n'),
          },
        },
        ...approvalBlocks,
      ],
    })

    process.stdout.write(
      `X auto-post: Sent approval request for "${topCandidate.title}"\n`,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`X auto-post: Failed to send approval: ${message}\n`)
    await sendMessage({
      channel,
      text: `:bird: X auto-post: Failed to send approval - ${message}`,
    })
  }
}

// ============================================================
// イベント駆動トリガー（RSS検出時に即座にX投稿ドラフト生成）
// ============================================================

export interface SourceTriggerParams {
  readonly title: string
  readonly sourceUrl: string
  readonly description?: string
  readonly sourceFeed: string
  readonly buzzScore: number
}

/**
 * 公式ソース（OpenAI, Anthropic等）の新記事検出時に即座にX投稿を生成し、
 * Slack #general に承認ボタン付きで送信する。
 * blog-rss-monitor から呼ばれる。
 */
export async function triggerXPostFromSource(
  params: SourceTriggerParams,
): Promise<boolean> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) return false

  // 重複チェック: 同じsourceUrlのpending action or 投稿済みがあるか
  try {
    const [pendingUrls, postedUrls] = await Promise.all([
      getRecentPendingSourceUrls(),
      getRecentXSourceUrls(14),
    ])
    if (pendingUrls.has(params.sourceUrl)) {
      process.stdout.write(
        `X auto-post trigger: Skipping "${params.title}" (already pending)\n`,
      )
      return false
    }
    if (postedUrls.includes(params.sourceUrl)) {
      process.stdout.write(
        `X auto-post trigger: Skipping "${params.title}" (already posted)\n`,
      )
      return false
    }
  } catch {
    // 重複チェック失敗は続行
  }

  // X投稿生成
  let triggerRecentTexts: readonly string[] = []
  try { triggerRecentTexts = await getRecentXPostTexts(30) } catch { /* best-effort */ }

  const content = params.description
    ? `${params.title}\n\n${params.description}`
    : params.title

  const postResult = await generateXPost({
    mode: 'research',
    content,
    topic: params.title,
    recentPostTexts: triggerRecentTexts,
  })

  // メディア取得 (best-effort, 画像重複排除あり)
  let mediaIds: string[] | undefined
  let triggerMediaUrl: string | undefined
  try {
    let triggerRecentImageUrls: ReadonlySet<string> = new Set()
    try {
      const mediaUrls = await getRecentXMediaUrls(14)
      triggerRecentImageUrls = new Set(mediaUrls)
    } catch { /* best-effort */ }

    const media = await fetchMediaForPost({
      sourceUrl: params.sourceUrl,
      topic: params.title,
      recentImageUrls: triggerRecentImageUrls,
    })
    if (media?.mediaId) {
      mediaIds = [media.mediaId]
      triggerMediaUrl = media.imageUrl
    }
  } catch {
    // テキストのみで続行
  }

  // AI Judge 自動投稿モード
  if (isAiJudgeEnabled()) {
    const result = await autoResolvePost({
      platform: 'x',
      text: postResult.finalPost,
      longForm: true,
      sourceUrl: params.sourceUrl,
      sourceTitle: params.title,
      patternUsed: postResult.patternUsed,
      tags: postResult.tags,
      mediaIds,
      mediaUrl: triggerMediaUrl,
    })
    process.stdout.write(
      `X auto-post trigger (AI Judge): "${params.title}" → ${result.success ? 'posted' : 'rejected'}\n`,
    )
    return result.success
  }

  // レガシー: Slack 承認フロー
  const action = await createPendingAction({
    slackChannelId: channel,
    slackUserId: userId,
    slackThreadTs: null,
    actionType: 'post_x',
    payload: {
      text: postResult.finalPost,
      sourceUrl: params.sourceUrl,
      patternUsed: postResult.patternUsed,
      tags: postResult.tags,
      triggeredBy: 'rss-monitor',
      sourceFeed: params.sourceFeed,
      ...(mediaIds ? { mediaIds } : {}),
    },
    previewText: postResult.finalPost,
  })

  const approvalBlocks = buildApprovalBlocks({
    title: ':bird: *X Post Preview*',
    previewText: postResult.finalPost.slice(0, PREVIEW_CHAR_LIMIT),
    actionId: action.id,
    actionType: 'post',
  })

  await sendMessage({
    channel,
    text: `X auto-post (breaking): ${params.title}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:zap: *公式ソースから速報X投稿を自動生成しました！*`,
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [
            `:newspaper: *ソース:* ${params.title}`,
            `:link: *URL:* ${params.sourceUrl}`,
            `:satellite: *フィード:* ${params.sourceFeed}`,
            `:fire: *バズスコア:* ${params.buzzScore}/100`,
            ...(mediaIds ? [':camera: *メディア:* 添付済み'] : []),
          ].join('\n'),
        },
      },
      ...approvalBlocks,
    ],
  })

  process.stdout.write(
    `X auto-post trigger: Sent approval for "${params.title}" (${params.sourceFeed})\n`,
  )
  return true
}
