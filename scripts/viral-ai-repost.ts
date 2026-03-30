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

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import {
  resolveUserId,
  postTweet,
  getTwitterWeightedLength,
  getTwitterClient,
} from '../lib/x-api/client'
import { formatVoiceProfileForPrompt } from '../lib/prompts/voice-profile'

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
// AI Comment Generation (Claude Haiku 4.5 + voice-profile)
// ---------------------------------------------------------------------------

// Fallback templates (used only when API fails)
// Fallback: skip posting rather than post generic text
const FALLBACK_TEMPLATES: readonly string[] = []

async function fetchRecentComments(): Promise<readonly string[]> {
  try {
    const { data } = await supabase
      .from('x_post_analytics')
      .select('post_text')
      .eq('pattern_used', 'viral_repost')
      .order('posted_at', { ascending: false })
      .limit(10)
    return (data ?? []).map((r: { post_text: string }) =>
      r.post_text.replace(/https?:\/\/\S+/g, '').replace(/\n+/g, ' ').trim(),
    ).filter((t: string) => t.length > 0)
  } catch {
    return []
  }
}

async function generateComment(tweet: ViralTweet): Promise<string> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

    const anthropic = new Anthropic({ apiKey })
    const recentComments = await fetchRecentComments()
    const voiceProfile = formatVoiceProfileForPrompt('short')

    const recentBlock = recentComments.length > 0
      ? `\n\n## 最近使ったコメント（これらと表現が被らないこと）\n${recentComments.map(c => `- 「${c}」`).join('\n')}`
      : ''

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `以下の海外バズツイートに対する短い日本語コメントを1つだけ生成してください。

## 元ツイート
著者: @${tweet.username}
いいね: ${tweet.likeCount.toLocaleString()}
インプレッション: ${tweet.impressionCount.toLocaleString()}
本文:
${tweet.text}

## ルール
- コメントのみ出力（URL不要、引用符不要、説明不要）
- ツイートの内容を正確に理解した上でコメントすること
- 「AIエンジニアが本音でつぶやく感想・反応」を書け
- 会社名と製品名の関係を間違えるな（ClaudeはAnthropic、GPTはOpenAI、GeminiはGoogle）
- 絵文字は使うな
- 「やばい」「すごい」だけで終わるな。何がどうすごいのか具体的に書け
- テンプレっぽい表現禁止: 「ここまで来てる」「次元が違う」「海外でバズってる」「追っといた方がいい」

## 文字数制限（厳守）
Twitter投稿なので日本語は最大120文字まで（これにURLが追加される）。絶対に120文字を超えるな。

## 文章スタイル（ランダムに選べ）
以下の2パターンからランダムに1つ選んでコメントを書け:
A) 解説型（2〜3文、120文字以内）— 何が起きているか、なぜ重要かを簡潔に説明。具体的な数字や技術名を入れる
B) 考察型（1〜2文、100文字以内）— 技術的な意味合いや業界への影響を分析。自分の視点を入れる

※ 絶対に「感想だけ」で終わるな。1つ以上の具体的情報（数字、技術名、比較）を含めること
${recentBlock}

${voiceProfile}

コメントのみを出力:`,
      }],
    })

    const text = response.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
    )?.text?.trim()
      // Strip quotes/brackets the model might wrap around
      ?.replace(/^[「『"""]|[」』"""]$/g, '').trim()

    if (text && text.length > 0) {
      // Truncate to 120 chars max (URL adds ~25 weighted chars)
      if (text.length <= 120) return text
      return text.slice(0, 117) + '…'
    }
  } catch (err) {
    process.stderr.write(`[generateComment] API error, falling back: ${err}\n`)
  }

  // No fallback — skip posting rather than post generic text
  return ''
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
  const comment = await generateComment(best)

  if (!comment) {
    return { success: false, error: 'コメント生成失敗（フォールバック無効化済み）' }
  }

  // Quality gate: reject generic one-liners
  const commentOnly = comment.replace(/https?:\/\/[^\s)>\]]+/g, '').trim()
  const GENERIC_PATTERNS = [/^(これ見た|海外でバズ|えっ、|おおー|やばい|すごい|ここまで来た|ついにこの|マジか)/, /^.{0,15}[…。？！]+$/]
  if (commentOnly.length < 30 || GENERIC_PATTERNS.some(p => p.test(commentOnly))) {
    return { success: false, error: `品質ゲート不通過: コメントが短すぎるか汎用的 (${commentOnly.length}文字: "${commentOnly.slice(0, 40)}...")` }
  }

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
