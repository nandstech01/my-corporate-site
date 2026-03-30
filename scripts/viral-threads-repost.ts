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

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { resolveUserId, getTwitterClient } from '../lib/x-api/client'
import { postToThreads, isThreadsPostingEnabled } from '../lib/threads-api/client'
import { formatVoiceProfileForPrompt } from '../lib/prompts/voice-profile'

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
// AI Comment Generation (Claude Haiku 4.5 + voice-profile)
// ---------------------------------------------------------------------------

// Fallback templates (used only when API fails)
const THREADS_FALLBACK_TEMPLATES = [
  'これはチェックしておいた方がいい\n\n📹 @{username}',
  'この進化スピード、体感してみないとわからない\n\n📹 @{username}',
  'お、これは面白い展開になってきた\n\n📹 @{username}',
  'ほんとこのペースで来られると追いつけなくなる\n\n📹 @{username}',
] as const

async function fetchRecentThreadsComments(): Promise<readonly string[]> {
  try {
    const { data } = await supabase
      .from('x_post_analytics')
      .select('post_text')
      .eq('pattern_used', 'viral_threads_repost')
      .order('posted_at', { ascending: false })
      .limit(10)
    return (data ?? []).map((r: { post_text: string }) =>
      r.post_text.replace(/https?:\/\/\S+/g, '').replace(/\[original:\w+\]/g, '').replace(/\n+/g, ' ').trim(),
    ).filter((t: string) => t.length > 0)
  } catch {
    return []
  }
}

async function generateThreadsComment(tweet: ViralMediaTweet): Promise<string> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

    const anthropic = new Anthropic({ apiKey })
    const recentComments = await fetchRecentThreadsComments()
    const voiceProfile = formatVoiceProfileForPrompt('threads')

    const recentBlock = recentComments.length > 0
      ? `\n\n## 最近使ったコメント（これらと表現が被らないこと）\n${recentComments.map(c => `- 「${c}」`).join('\n')}`
      : ''

    const mediaNote = tweet.media.type === 'video'
      ? 'このツイートには動画が添付されている。動画の内容にも言及してよい。'
      : 'このツイートには画像が添付されている。'

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `以下の海外バズツイートに対するThreads用の日本語コメントを1つだけ生成してください。

## 元ツイート
著者: @${tweet.username}
いいね: ${tweet.likeCount.toLocaleString()}
インプレッション: ${tweet.impressionCount.toLocaleString()}
メディア: ${mediaNote}
本文:
${tweet.text}

## ルール
- コメントのみ出力（引用符不要、説明不要）
- 最大400文字（末尾に「📹 @${tweet.username}」を付けるので余裕を残す）
- ツイートの内容を正確に理解した上でコメントすること
- 「AIエンジニアが本音で感想を書いてる」ような自然な文章
- 会社名と製品名の関係を間違えるな（ClaudeはAnthropic、GPTはOpenAI、GeminiはGoogle）
- 改行を使って読みやすく構成してよい（2-3段落）
- テンプレっぽい表現禁止: 「ここまで来てる」「次元が違う」「海外でバズってる」「映画の世界じゃない」「もうすぐそこ」
- 絵文字は最小限（0-2個）
${recentBlock}

${voiceProfile}

コメントのみを出力:`,
      }],
    })

    const text = response.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
    )?.text?.trim()
      ?.replace(/^[「『"""]|[」』"""]$/g, '').trim()

    if (text && text.length > 0) {
      // Don't double-add attribution if model already included it
      const hasAttribution = text.includes(`@${tweet.username}`)
      if (hasAttribution) {
        const trimmed = text.length > THREADS_CHAR_LIMIT ? text.slice(0, THREADS_CHAR_LIMIT - 1) + '…' : text
        return trimmed
      }
      const attribution = `\n\n📹 @${tweet.username}`
      const maxLen = THREADS_CHAR_LIMIT - attribution.length
      const trimmed = text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text
      return trimmed + attribution
    }
  } catch (err) {
    process.stderr.write(`[generateThreadsComment] API error, falling back: ${err}\n`)
  }

  // Fallback
  const seed = new Date().getHours() + tweet.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return THREADS_FALLBACK_TEMPLATES[seed % THREADS_FALLBACK_TEMPLATES.length]
    .replace('{username}', tweet.username)
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
  readonly previewImageUrl?: string
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
    if (best) return { type: 'video', url: best.url, previewImageUrl: media.preview_image_url }
    // Fallback to preview image if no video variants
    if (media.preview_image_url) return { type: 'image', url: media.preview_image_url }
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
  const comment = await generateThreadsComment(best)

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

  let result: { success: boolean; mediaId?: string; permalinkUrl?: string; error?: string }
  let tempStoragePath: string | null = null

  if (best.media.type === 'video') {
    // Download video from X CDN → upload to Supabase Storage → post to Threads → delete
    try {
      console.error('[Threads] Downloading video from X CDN...')
      const videoResponse = await fetch(best.media.url)
      if (!videoResponse.ok) throw new Error(`Download failed: ${videoResponse.status}`)
      const videoBuffer = Buffer.from(await videoResponse.arrayBuffer())

      const fileName = `threads-temp-${Date.now()}.mp4`
      tempStoragePath = `temp/${fileName}`
      const { error: uploadError } = await supabase.storage
        .from('video-jobs')
        .upload(tempStoragePath, videoBuffer, { contentType: 'video/mp4', upsert: true })
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { data: urlData } = supabase.storage.from('video-jobs').getPublicUrl(tempStoragePath)
      const publicVideoUrl = urlData.publicUrl
      console.error('[Threads] Video uploaded to Supabase, posting to Threads...')

      result = await postToThreads({ text: comment, videoUrl: publicVideoUrl })
    } catch (err) {
      console.error('[Threads] Video proxy failed:', err)
      result = { success: false, error: String(err) }
    }

    // Fallback to preview image if video still fails
    if (!result!.success && best.media.previewImageUrl) {
      console.error('[Threads] Video failed, falling back to preview image')
      result = await postToThreads({ text: comment, imageUrl: best.media.previewImageUrl })
    }

    // Delete temp video from Supabase Storage
    if (tempStoragePath) {
      await supabase.storage.from('video-jobs').remove([tempStoragePath])
      console.error('[Threads] Temp video deleted from storage')
    }
  } else {
    result = await postToThreads({ text: comment, imageUrl: best.media.url })
  }

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
