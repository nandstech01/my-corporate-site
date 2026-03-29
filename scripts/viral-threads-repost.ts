/**
 * viral-threads-repost.ts
 *
 * 海外AIインフルエンサーのバズツイート（動画・画像付き）を見つけて、
 * ネイティブメディア付きでThreadsにリポストするスクリプト。
 *
 * Usage:
 *   npx tsx scripts/viral-threads-repost.ts
 *   npx tsx scripts/viral-threads-repost.ts --dry-run
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { resolveUserId, getTwitterClient } from '../lib/x-api/client'
import { postToThreads, isThreadsPostingEnabled } from '../lib/threads-api/client'

// ---------------------------------------------------------------------------
// Config — same influencers & cache as viral-ai-repost.ts
// ---------------------------------------------------------------------------

const INFLUENCERS = [
  'figure_robot', 'BostonDynamics', 'TheHumanoidHub', 'RunwayML', 'adcock_brett',
  'AnthropicAI', 'cursor_ai', 'OpenAI', 'DrJimFan',
  'rowancheung', 'deedydas', 'AlphaSignalAI', 'GoogleDeepMind', 'rohanpaul_ai',
] as const

const USER_ID_CACHE: Record<string, string> = {
  figure_robot: '1602443956888817665',
  BostonDynamics: '517473207',
  TheHumanoidHub: '1682127524963426304',
  RunwayML: '1001114465692200960',
  adcock_brett: '3222018178',
  AnthropicAI: '1353836358901501952',
  cursor_ai: '1695890961094909952',
  OpenAI: '4398626122',
  DrJimFan: '1007413134',
  rowancheung: '1314686042',
  deedydas: '361044311',
  AlphaSignalAI: '114783808',
  GoogleDeepMind: '4783690002',
  rohanpaul_ai: '2588345408',
}

const MIN_IMPRESSIONS = 50_000
const MIN_LIKES = 500
const THREADS_CHAR_LIMIT = 500

// ---------------------------------------------------------------------------
// Topic detection (reused from viral-ai-repost)
// ---------------------------------------------------------------------------

const TOPIC_KEYWORDS: readonly { readonly pattern: RegExp; readonly hint: string }[] = [
  { pattern: /robot(ic)?s?|humanoid/i, hint: 'ヒューマノイドロボット' },
  { pattern: /Seedance|Sora|Veo|video\s*(gen|model|diffusion)/i, hint: '動画生成AI' },
  { pattern: /Midjourney|Flux|image\s*(gen|model)|Stable\s*Diffusion/i, hint: '画像生成AI' },
  { pattern: /Claude\s*Code|Codex|Cursor|coding\s*agent/i, hint: 'AIコーディング' },
  { pattern: /Claude/i, hint: 'Claude' },
  { pattern: /GPT-?[45]/i, hint: 'GPT' },
  { pattern: /Gemini/i, hint: 'Gemini' },
  { pattern: /agent|agentic|MCP/i, hint: 'AIエージェント' },
  { pattern: /chip|GPU|NVIDIA|semiconductor/i, hint: 'GPU・半導体' },
  { pattern: /China|DeepSeek|Qwen/i, hint: '中国AI' },
  { pattern: /self[- ]?driv|autonom.*vehicle|Tesla\s*FSD|Waymo/i, hint: '自動運転' },
  { pattern: /LLM|language\s*model/i, hint: 'LLM' },
]

function detectTopicHint(text: string): string {
  for (const { pattern, hint } of TOPIC_KEYWORDS) {
    if (pattern.test(text)) return hint
  }
  return 'AI'
}

// ---------------------------------------------------------------------------
// Threads commentary templates (longer than X — up to 500 chars)
// ---------------------------------------------------------------------------

const THREADS_TEMPLATES = [
  'えっ、{topic}ここまで来てる…？\n\n{context}。\n\n海外ではすでに大きな話題。日本ではまだあまり知られてない。\n\n📹 @{username}',
  'これ見た？\n\n{context}。\n\n{topic}のレベル、ちょっと前まで想像もできなかった。\n\n📹 @{username}',
  '{topic}、ついにこのレベル。\n\n{context}。\n\n海外勢の反応もすごい。日本でももっと注目されるべき。\n\n📹 @{username}',
  'まだ日本で話題になってないけど、これはやばい。\n\n{context}。\n\nこれが当たり前になる未来、もうすぐそこ。\n\n📹 @{username}',
  '{context}。\n\n{topic}の進化スピードが本当にえぐい。見れば一発でわかる。\n\n📹 @{username}',
  '海外でバズってるこれ。\n\n{context}。\n\nこのレベルの{topic}、もう映画の世界じゃない。\n\n📹 @{username}',
] as const

function generateContext(tweetText: string): string {
  // Extract key details from tweet to build Japanese context
  const details = extractDetails(tweetText)
  const parts: string[] = []

  if (details.company && details.product) {
    parts.push(`${details.company}の${details.product}`)
  } else if (details.product) {
    parts.push(details.product)
  } else if (details.company) {
    parts.push(`${details.company}の最新技術`)
  }

  if (details.number) {
    parts.push(`${details.number}という数字が話題`)
  }

  if (parts.length === 0) {
    // Fallback: extract key English phrases
    const cleaned = tweetText.replace(/https?:\/\/\S+/g, '').replace(/\n+/g, ' ').trim()
    const snippet = cleaned.length > 80 ? cleaned.slice(0, 80) + '…' : cleaned
    if (snippet.length > 10) parts.push(snippet)
  }

  return parts.join('。') || '最新のAI技術デモ'
}

interface TweetDetails {
  readonly company?: string
  readonly product?: string
  readonly number?: string
}

function extractDetails(text: string): TweetDetails {
  const companyMatch = text.match(/\b(OpenAI|Google|Meta|Microsoft|NVIDIA|Apple|Amazon|Anthropic|DeepSeek|ByteDance|Mistral|xAI|Stability\s*AI|Hugging\s*Face|Figure|Boston\s*Dynamics|Runway)\b/i)
  const productMatch = text.match(/\b(GPT-?[45]o?|Claude\s*(?:Code)?(?:\s*[0-9.]+)?|Gemini\s*[0-9.]*|Sora\s*[0-9.]*|Seedance\s*[0-9.]*|Helix\s*0?[0-9]|Atlas|Figure\s*0?[0-9]|Gen-?[0-9]|Runway\s*(?:Gen|Act)[- ]?[0-9]*|Spot|Optimus|Digit)\b/i)
  const numMatch = text.match(/\b(\d+(?:\.\d+)?)\s*([xX%]|times|faster|cheaper|billion|million)/i)
  return {
    company: companyMatch?.[1],
    product: productMatch?.[1]?.trim(),
    number: numMatch ? `${numMatch[1]}${numMatch[2].toLowerCase()}` : undefined,
  }
}

// Username-based context when extraction fails
const USERNAME_CONTEXT: Record<string, string> = {
  figure_robot: 'Figure AIのヒューマノイドロボット、最新デモ映像',
  BostonDynamics: 'Boston DynamicsのAtlas、最新動作デモ',
  TheHumanoidHub: 'ヒューマノイドロボットの最新映像',
  RunwayML: 'Runwayの最新AI動画生成デモ',
  adcock_brett: 'Figure AI CEOが公開した最新ロボット映像',
  AnthropicAI: 'Anthropicの最新AI技術',
  cursor_ai: 'Cursor AIの最新アップデート',
  OpenAI: 'OpenAIの最新発表',
  DrJimFan: 'NVIDIAのAIエージェント研究、最新デモ',
  GoogleDeepMind: 'Google DeepMindの最新AI研究',
}

function pickThreadsComment(tweetText: string, tweetId: string, username: string): string {
  const topic = detectTopicHint(tweetText)
  let context = generateContext(tweetText)
  // If context is just raw English, use username-based fallback
  if (/^[A-Za-z\s,.'":;\-!?@#$%^&*()]+$/.test(context) || context === '最新のAI技術デモ') {
    context = USERNAME_CONTEXT[username] || `${username}が公開した最新AI映像`
  }
  const seed = tweetId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const index = (new Date().getHours() + seed) % THREADS_TEMPLATES.length

  let comment = THREADS_TEMPLATES[index]
    .replace('{topic}', topic)
    .replace('{context}', context)
    .replace('{username}', username)

  // Trim to Threads limit
  if (comment.length > THREADS_CHAR_LIMIT) {
    comment = comment.slice(0, THREADS_CHAR_LIMIT - 3) + '…'
  }
  return comment
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function isAlreadyPosted(originalTweetId: string): Promise<boolean> {
  const { count } = await supabase
    .from('x_post_analytics')
    .select('id', { count: 'exact', head: true })
    .eq('pattern_used', 'viral_threads_repost')
    .ilike('post_text', `%${originalTweetId}%`)

  return (count ?? 0) > 0
}

async function savePost(postText: string, threadsMediaId: string, permalinkUrl: string): Promise<void> {
  const { error } = await supabase.from('x_post_analytics').insert({
    post_text: postText,
    tweet_id: threadsMediaId,
    tweet_url: permalinkUrl,
    pattern_used: 'viral_threads_repost',
    posted_at: new Date().toISOString(),
    likes: 0, retweets: 0, replies: 0, impressions: 0, engagement_rate: 0,
  })
  if (error) console.error('[savePost] DB error:', error.message)
}

// ---------------------------------------------------------------------------
// Media extraction from X API
// ---------------------------------------------------------------------------

interface MediaInfo {
  readonly type: 'video' | 'image'
  readonly url: string
}

interface XMediaVariant {
  readonly bit_rate?: number
  readonly content_type: string
  readonly url: string
}

function extractBestMediaUrl(media: {
  readonly type: string
  readonly url?: string
  readonly preview_image_url?: string
  readonly variants?: readonly XMediaVariant[]
}): MediaInfo | null {
  if (media.type === 'video' || media.type === 'animated_gif') {
    const mp4Variants = (media.variants ?? [])
      .filter((v) => v.content_type === 'video/mp4' && v.bit_rate !== undefined)
      .sort((a, b) => (b.bit_rate ?? 0) - (a.bit_rate ?? 0))
    const best = mp4Variants[0]
    if (best) return { type: 'video', url: best.url }
    return null
  }

  if (media.type === 'photo' && media.url) {
    return { type: 'image', url: media.url }
  }

  return null
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface ViralMediaTweet {
  readonly id: string
  readonly text: string
  readonly username: string
  readonly likeCount: number
  readonly impressionCount: number
  readonly media: MediaInfo
}

async function fetchWithRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    const msg = String(err)
    if (msg.includes('429') || msg.includes('Too Many')) {
      console.error(`[429] ${label} — waiting 60s`)
      await new Promise((r) => setTimeout(r, 60_000))
      return fn()
    }
    throw err
  }
}

async function findViralMediaTweets(): Promise<ViralMediaTweet[]> {
  const candidates: ViralMediaTweet[] = []

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
          'media.fields': ['type', 'url', 'preview_image_url', 'variants'],
        }),
        `getUserTimeline(@${username})`,
      )

      // Build media map: media_key -> MediaInfo
      const mediaMap = new Map<string, MediaInfo>()
      for (const m of timeline.includes?.media ?? []) {
        const info = extractBestMediaUrl(m as never)
        if (info) mediaMap.set(m.media_key, info)
      }

      for (const tweet of timeline.data?.data ?? []) {
        const metrics = tweet.public_metrics
        if (!metrics) continue

        const isViral =
          (metrics.impression_count ?? 0) >= MIN_IMPRESSIONS || (metrics.like_count ?? 0) >= MIN_LIKES
        if (!isViral) continue
        if (tweet.text.startsWith('RT @')) continue

        // Must have media
        const mediaKeys = tweet.attachments?.media_keys ?? []
        const firstMedia = mediaKeys.map((k: string) => mediaMap.get(k)).find(Boolean)
        if (!firstMedia) continue

        const alreadyPosted = await isAlreadyPosted(tweet.id)
        if (alreadyPosted) continue

        candidates.push({
          id: tweet.id,
          text: tweet.text,
          username,
          likeCount: metrics.like_count ?? 0,
          impressionCount: metrics.impression_count ?? 0,
          media: firstMedia,
        })
      }
    } catch (err) {
      console.error(`Timeline error @${username}: ${err}`)
      continue
    }
  }

  // Sort: video > image, then by likes. Visual accounts get 1.5x boost.
  const VISUAL_ACCOUNTS = new Set(['figure_robot', 'BostonDynamics', 'TheHumanoidHub', 'RunwayML', 'adcock_brett'])
  return [...candidates].sort((a, b) => {
    const aScore = a.likeCount * (a.media.type === 'video' ? 2 : 1) * (VISUAL_ACCOUNTS.has(a.username) ? 1.5 : 1)
    const bScore = b.likeCount * (b.media.type === 'video' ? 2 : 1) * (VISUAL_ACCOUNTS.has(b.username) ? 1.5 : 1)
    return bScore - aScore
  })
}

export async function runViralThreadsRepost(dryRun = false): Promise<{
  success: boolean
  permalinkUrl?: string
  originalTweetId?: string
  comment?: string
  mediaType?: string
  error?: string
}> {
  if (!dryRun && !isThreadsPostingEnabled()) {
    return { success: false, error: 'THREADS_POSTING_ENABLED is not true' }
  }

  const viralTweets = await findViralMediaTweets()

  if (viralTweets.length === 0) {
    return { success: false, error: 'メディア付きバズツイートが見つかりませんでした' }
  }

  const best = viralTweets[0]
  const comment = pickThreadsComment(best.text, best.id, best.username)

  if (dryRun) {
    console.log(JSON.stringify({
      success: true, dryRun: true, comment,
      originalAuthor: `@${best.username}`, originalTweetId: best.id,
      mediaType: best.media.type, mediaUrl: best.media.url,
      likes: best.likeCount, impressions: best.impressionCount,
      commentLength: comment.length, candidateCount: viralTweets.length,
    }, null, 2))
    return { success: true, comment, originalTweetId: best.id, mediaType: best.media.type }
  }

  const postOptions = best.media.type === 'video'
    ? { text: comment, videoUrl: best.media.url }
    : { text: comment, imageUrl: best.media.url }

  const result = await postToThreads(postOptions)

  if (result.success && result.mediaId) {
    // Embed original tweet ID in post_text for dedup
    const postTextForDb = `${comment}\n\n[original:${best.id}]`
    await savePost(postTextForDb, result.mediaId, result.permalinkUrl ?? '')
    return {
      success: true,
      permalinkUrl: result.permalinkUrl,
      originalTweetId: best.id,
      comment,
      mediaType: best.media.type,
    }
  }

  return { success: false, error: result.error ?? '投稿に失敗しました', originalTweetId: best.id, comment }
}

// CLI entry point
if (require.main === module || process.argv[1]?.includes('viral-threads-repost')) {
  const dryRun = process.argv.includes('--dry-run')
  runViralThreadsRepost(dryRun)
    .then((r) => { if (!dryRun) console.log(JSON.stringify(r)) })
    .catch((err) => {
      console.log(JSON.stringify({ success: false, error: String(err) }))
      process.exit(1)
    })
}
