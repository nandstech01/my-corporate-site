/**
 * viral-ai-repost.ts
 *
 * 海外AIインフルエンサーのバズツイートを見つけて、
 * カジュアルな日本語コメント付きでリポストするスクリプト。
 *
 * Usage:
 *   npx tsx scripts/viral-ai-repost.ts
 *   npx tsx scripts/viral-ai-repost.ts --dry-run
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import {
  resolveUserId,
  postTweet,
  getTwitterWeightedLength,
  getTwitterClient,
} from '../lib/x-api/client'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// --- 映像インパクト系（ロボット、動画生成、デモ） ---
// --- 開発者ツール系（Claude Code、Cursor、AIツール） ---
// --- AIニュース・分析系 ---
const INFLUENCERS = [
  // 映像インパクト系
  'figure_robot',      // Figure AI ヒューマノイドロボット
  'BostonDynamics',    // Atlas ロボット
  'TheHumanoidHub',    // ロボットニュースまとめ
  'RunwayML',          // 動画生成AI
  'adcock_brett',      // Figure CEO
  // 開発者ツール系
  'AnthropicAI',       // Claude / Claude Code
  'cursor_ai',         // Cursor AI
  'OpenAI',            // GPT / Codex
  'DrJimFan',          // NVIDIA AIエージェント研究
  // AIニュース・分析系
  'rowancheung',       // AI news curator
  'deedydas',          // tech/AI commentary
  'AlphaSignalAI',     // AI research news
  'GoogleDeepMind',    // Gemini / AI研究
  'rohanpaul_ai',      // AI engineering
] as const

// Cached user IDs to avoid resolveUserId API calls (IDs are permanent)
const USER_ID_CACHE: Record<string, string> = {
  // 映像インパクト系
  figure_robot: '1602443956888817665',
  BostonDynamics: '517473207',
  TheHumanoidHub: '1682127524963426304',
  RunwayML: '1001114465692200960',
  adcock_brett: '3222018178',
  // 開発者ツール系
  AnthropicAI: '1353836358901501952',
  cursor_ai: '1695890961094909952',
  OpenAI: '4398626122',
  DrJimFan: '1007413134',
  // AIニュース・分析系
  rowancheung: '1314686042',
  deedydas: '361044311',
  AlphaSignalAI: '114783808',
  GoogleDeepMind: '4783690002',
  rohanpaul_ai: '2588345408',
}

const MIN_IMPRESSIONS = 50_000
const MIN_LIKES = 500

// ---------------------------------------------------------------------------
// Comment templates & topic detection
// ---------------------------------------------------------------------------

const TOPIC_KEYWORDS: readonly { readonly pattern: RegExp; readonly hint: string }[] = [
  { pattern: /robot(ic)?s?|humanoid/i, hint: 'ヒューマノイドロボット' },
  { pattern: /Seedance|Sora|Veo|video\s*(gen|model|diffusion)/i, hint: '動画生成AI' },
  { pattern: /Midjourney|Flux|image\s*(gen|model)|Stable\s*Diffusion/i, hint: '画像生成AI' },
  { pattern: /open\s*source|Apache|MIT\s*license/i, hint: 'オープンソースAI' },
  { pattern: /Claude\s*Code|Codex|Cursor|coding\s*agent/i, hint: 'AIコーディング' },
  { pattern: /Claude/i, hint: 'Claude' },
  { pattern: /GPT-?[45]/i, hint: 'GPT' },
  { pattern: /Gemini/i, hint: 'Gemini' },
  { pattern: /agent|agentic|MCP/i, hint: 'AIエージェント' },
  { pattern: /chip|GPU|NVIDIA|AMD|semiconductor|H100|B200/i, hint: 'GPU・半導体' },
  { pattern: /China|Chinese|Baidu|ByteDance|DeepSeek|Qwen/i, hint: '中国AI' },
  { pattern: /self[- ]?driv|autonom.*vehicle|Tesla\s*FSD|Waymo/i, hint: '自動運転' },
  { pattern: /funding|valuation|IPO|billion|million|\$\d/i, hint: 'AI投資' },
  { pattern: /reasoning|o[1-9]|thinking/i, hint: '推論AI' },
  { pattern: /LLM|language\s*model/i, hint: 'LLM' },
  { pattern: /Apple|Google|Microsoft|Meta|Amazon|OpenAI/i, hint: 'ビッグテックAI' },
]

// Templates when we have extracted details (company/product/number)
const DETAIL_TEMPLATES = [
  '{product}がここまで来たか…',
  '{company}の{product}、これは次元が違う',
  'まだ日本で話題になってないけど{product}すごいことになってる',
  '{product}、海外勢の評価がえぐい',
  '{company}が{product}出してきた。要チェック',
  '{product}…{number}って本当？',
  'えっ、{product}…？これはやばい',
] as const

// Fallback when extraction finds nothing
const GENERIC_TEMPLATES = [
  'えっ、{topic_hint}ここまできてる…？',
  'おおー、{topic_hint}やばい',
  'これ見た？{topic_hint}',
  '海外でバズってるこれ。{topic_hint}',
  '{topic_hint}、ついにこのレベルか…',
  'まだ日本で話題になってないけど、{topic_hint}すごいことになってる',
  '{topic_hint}、これは追っといた方がいい',
] as const

function detectTopicHint(text: string): string {
  for (const { pattern, hint } of TOPIC_KEYWORDS) {
    if (pattern.test(text)) return hint
  }
  return 'AI'
}

interface TweetDetails {
  readonly company?: string
  readonly product?: string
  readonly number?: string
}

function extractDetails(text: string): TweetDetails {
  // Company extraction
  const companyMatch = text.match(/\b(OpenAI|Google|Meta|Microsoft|NVIDIA|Apple|Amazon|Anthropic|DeepSeek|ByteDance|Mistral|xAI|Stability\s*AI|Hugging\s*Face)\b/i)
  const company = companyMatch?.[1]

  // Product+version extraction
  const productMatch = text.match(/\b(GPT-?[45]o?|Claude\s*(?:Code)?(?:\s*[0-9.]+)?|Gemini\s*[0-9.]*|Llama\s*[0-9.]*|Sora\s*[0-9.]*|Seedance\s*[0-9.]*|Midjourney\s*v?[0-9.]*|Cursor\s*[0-9.]*|Codex|Qwen[\w.-]*|Flux[\w.-]*|Veo\s*[0-9.]*|Grok\s*[0-9.]*|Atlas|Figure\s*0?[0-9]|Gen-?[0-9]|Runway\s*(?:Gen|Act)[- ]?[0-9]*|Helix|Spot|Optimus|Digit)\b/i)
  const product = productMatch?.[1]?.trim()

  // Number extraction (impressive metrics)
  const numMatch = text.match(/\b(\d+(?:\.\d+)?)\s*([xX%]|times|faster|cheaper|smaller|billion|million|trillion)/i)
  const number = numMatch ? `${numMatch[1]}${numMatch[2].toLowerCase()}` : undefined

  return { company, product, number }
}

function pickComment(tweetText: string, tweetId: string): string {
  const details = extractDetails(tweetText)
  const hint = detectTopicHint(tweetText)
  const hourSeed = new Date().getHours()
  const idSeed = tweetId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)

  // Use detail templates if we have product or company
  if (details.product || details.company) {
    const index = (hourSeed + idSeed) % DETAIL_TEMPLATES.length
    let comment: string = DETAIL_TEMPLATES[index]
    comment = comment.replace('{product}', details.product || details.company || hint)
    comment = comment.replace('{company}', details.company || '')
    comment = comment.replace('{number}', details.number || '')
    // Clean up empty placeholders and double spaces
    comment = comment.replace(/\{[^}]+\}/g, '').replace(/\s{2,}/g, ' ').trim()
    // Remove trailing punctuation issues from empty replacements
    comment = comment.replace(/、$/, '').replace(/^、/, '').trim()
    if (comment.length > 0) return comment
  }

  // Fallback to generic templates
  const index = (hourSeed + idSeed) % GENERIC_TEMPLATES.length
  return GENERIC_TEMPLATES[index].replace('{topic_hint}', hint)
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function isAlreadyPosted(tweetUrl: string): Promise<boolean> {
  const { count } = await supabase
    .from('x_post_analytics')
    .select('id', { count: 'exact', head: true })
    .ilike('post_text', `%${tweetUrl}%`)

  return (count ?? 0) > 0
}

async function savePost(postText: string, tweetId: string, tweetUrl: string): Promise<void> {
  const { error } = await supabase.from('x_post_analytics').insert({
    post_text: postText,
    tweet_id: tweetId,
    tweet_url: tweetUrl,
    pattern_used: 'viral_repost',
    posted_at: new Date().toISOString(),
    likes: 0, retweets: 0, replies: 0, impressions: 0, engagement_rate: 0,
  })
  if (error) console.error('[savePost] DB error:', error.message)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface ViralTweet {
  readonly id: string
  readonly text: string
  readonly username: string
  readonly likeCount: number
  readonly impressionCount: number
  readonly url: string
  readonly hasVideo: boolean
}

async function fetchWithRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    const msg = String(err)
    if (msg.includes('429') || msg.includes('Too Many')) {
      console.error(`[429] ${label} — waiting 60s`)
      await new Promise(r => setTimeout(r, 60_000))
      return fn()
    }
    throw err
  }
}

async function findViralTweets(): Promise<ViralTweet[]> {
  const candidates: ViralTweet[] = []

  for (const username of INFLUENCERS) {
    const cachedId = USER_ID_CACHE[username]
    const resolved = cachedId ? { id: cachedId } : await resolveUserId(username)
    const userId = resolved.id
    if (!userId) {
      console.error(`Skip @${username}: could not resolve user ID`)
      continue
    }

    try {
      const client = getTwitterClient()
      const timeline = await fetchWithRetry(
        () => client.v2.userTimeline(userId, {
          max_results: 10,
          'tweet.fields': ['public_metrics', 'attachments'],
          expansions: ['attachments.media_keys'],
          'media.fields': ['type'],
        }),
        `getUserTimeline(@${username})`,
      )

      // Build set of video media keys
      const videoKeys = new Set<string>()
      for (const m of timeline.includes?.media ?? []) {
        if (m.type === 'video' || m.type === 'animated_gif') videoKeys.add(m.media_key)
      }

      for (const tweet of timeline.data?.data ?? []) {
        const metrics = tweet.public_metrics
        if (!metrics) continue

        const isViral =
          (metrics.impression_count ?? 0) >= MIN_IMPRESSIONS || (metrics.like_count ?? 0) >= MIN_LIKES
        if (!isViral) continue

        if (tweet.text.startsWith('RT @')) continue

        const tweetUrl = `https://x.com/${username}/status/${tweet.id}`
        const alreadyPosted = await isAlreadyPosted(tweetUrl)
        if (alreadyPosted) continue

        const hasVideo = (tweet.attachments?.media_keys ?? []).some((k: string) => videoKeys.has(k))

        candidates.push({
          id: tweet.id,
          text: tweet.text,
          username,
          likeCount: metrics.like_count ?? 0,
          impressionCount: metrics.impression_count ?? 0,
          url: tweetUrl,
          hasVideo,
        })
      }
    } catch (err) {
      console.error(`Timeline error @${username}: ${err}`)
      continue
    }
  }

  // Sort by likes with video boost (2x) and visual-impact account boost (1.5x)
  const VISUAL_ACCOUNTS = new Set(['figure_robot', 'BostonDynamics', 'TheHumanoidHub', 'RunwayML', 'adcock_brett'])
  return [...candidates].sort((a, b) => {
    const aScore = a.likeCount * (a.hasVideo ? 2 : 1) * (VISUAL_ACCOUNTS.has(a.username) ? 1.5 : 1)
    const bScore = b.likeCount * (b.hasVideo ? 2 : 1) * (VISUAL_ACCOUNTS.has(b.username) ? 1.5 : 1)
    return bScore - aScore
  })
}

export async function runViralAiRepost(dryRun = false): Promise<{ success: boolean; tweetUrl?: string; originalTweetUrl?: string; comment?: string; error?: string }> {

  const viralTweets = await findViralTweets()

  if (viralTweets.length === 0) {
    return { success: false, error: 'バズツイートが見つかりませんでした' }
  }

  const best = viralTweets[0]
  const comment = pickComment(best.text, best.id)

  const textWithoutUrl = comment + '\n\n'
  const urlWeight = 23
  const textWeight = getTwitterWeightedLength(textWithoutUrl)

  if (textWeight + urlWeight > 280) {
    return { success: false, error: `コメントが長すぎます (weighted: ${textWeight + urlWeight}/280)` }
  }

  const fullText = textWithoutUrl + best.url

  if (dryRun) {
    console.log(JSON.stringify({
      success: true, dryRun: true, comment,
      originalTweetUrl: best.url, originalAuthor: `@${best.username}`,
      likes: best.likeCount, impressions: best.impressionCount,
      fullText, weightedLength: textWeight + urlWeight, candidateCount: viralTweets.length,
    }))
    return { success: true, comment, originalTweetUrl: best.url }
  }

  const result = await postTweet(fullText)

  if (result.success && result.tweetId && result.tweetUrl) {
    await savePost(fullText, result.tweetId, result.tweetUrl)
    return { success: true, tweetUrl: result.tweetUrl, originalTweetUrl: best.url, comment }
  }
  return { success: false, error: result.error ?? '投稿に失敗しました', originalTweetUrl: best.url, comment }
}

// CLI entry point
if (require.main === module || process.argv[1]?.includes('viral-ai-repost')) {
  const dryRun = process.argv.includes('--dry-run')
  runViralAiRepost(dryRun)
    .then((r) => console.log(JSON.stringify(r)))
    .catch((err) => {
      console.log(JSON.stringify({ success: false, error: String(err) }))
      process.exit(1)
    })
}
