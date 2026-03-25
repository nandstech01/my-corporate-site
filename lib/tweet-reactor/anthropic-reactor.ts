/**
 * Anthropic Tweet Reactor
 *
 * Monitors @AnthropicAI tweets via Brave Search + oembed,
 * generates CEO-perspective reaction threads with infographics,
 * and posts them as chain threads on X.
 *
 * Extensible: source_account field allows adding OpenAI, Google etc. later.
 */

import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { braveWebSearch } from '../web-search/brave'
import { uploadMediaToX } from '../x-api/media'
import { getTwitterClient, getTwitterWeightedLength } from '../x-api/client'
import { savePostAnalytics } from '../slack-bot/memory'

// ============================================================
// Types
// ============================================================

interface SourceTweet {
  readonly id: string
  readonly url: string
  readonly text: string
  readonly authorName: string
}

interface ReactionContent {
  readonly mainTweet: string
  readonly replies: readonly string[]
  readonly infographicTitle: string
  readonly infographicPoints: readonly string[]
}

interface ReactorConfig {
  readonly account: string
  readonly searchQuery: string
  readonly infographicAccent: string
  readonly infographicGradient: string
}

// ============================================================
// Configuration
// ============================================================

const REACTOR_CONFIGS: Readonly<Record<string, ReactorConfig>> = {
  AnthropicAI: {
    account: 'AnthropicAI',
    searchQuery: 'x.com AnthropicAI status',
    infographicAccent: '#D97757',
    infographicGradient: '#1a1a2e to #0f3460',
  },
}

// ============================================================
// Supabase Client
// ============================================================

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

// ============================================================
// Step 1: Fetch Recent Tweets via Brave Search + oembed
// ============================================================

async function fetchRecentTweets(config: ReactorConfig): Promise<readonly SourceTweet[]> {
  const tweets: SourceTweet[] = []
  const seenIds = new Set<string>()

  try {
    const results = await braveWebSearch(config.searchQuery, {
      count: 10,
      freshness: 'pd',
    })

    const tweetResults = results.filter(
      (r) => r.url.includes('x.com/') && r.url.includes('/status/'),
    )

    for (const result of tweetResults) {
      const idMatch = result.url.match(/\/status\/(\d+)/)
      if (!idMatch) continue

      const tweetId = idMatch[1]
      if (seenIds.has(tweetId)) continue
      seenIds.add(tweetId)

      const tweet = await fetchTweetOembed(tweetId, result.url, result.description)
      if (tweet) {
        tweets.push(tweet)
      }

      // Rate limit buffer between oembed calls
      await new Promise((r) => setTimeout(r, 300))
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    process.stdout.write(`[reactor] Brave search failed: ${msg}\n`)
  }

  process.stdout.write(`[reactor] Found ${tweets.length} recent tweets from @${config.account}\n`)
  return tweets
}

async function fetchTweetOembed(
  tweetId: string,
  url: string,
  fallbackText: string,
): Promise<SourceTweet | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
      const response = await fetch(oembedUrl, { signal: controller.signal })

      if (response.ok) {
        const data = (await response.json()) as { html?: string; author_name?: string }
        const textMatch = data.html?.match(/<p[^>]*>([\s\S]*?)<\/p>/)
        const text = textMatch
          ? textMatch[1]
              .replace(/<[^>]+>/g, '')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .trim()
          : fallbackText

        return {
          id: tweetId,
          url,
          text: text || fallbackText,
          authorName: data.author_name ?? '@AnthropicAI',
        }
      }
    } finally {
      clearTimeout(timeout)
    }
  } catch {
    // oembed failed, use fallback
  }

  return {
    id: tweetId,
    url,
    text: fallbackText,
    authorName: '@AnthropicAI',
  }
}

// ============================================================
// Step 2: Check if Already Reacted (Supabase)
// ============================================================

async function filterUnreactedTweets(
  account: string,
  tweets: readonly SourceTweet[],
): Promise<readonly SourceTweet[]> {
  if (tweets.length === 0) return []

  const supabase = getSupabaseClient()
  const tweetIds = tweets.map((t) => t.id)

  const { data: existing, error } = await supabase
    .from('tweet_reactions')
    .select('source_tweet_id')
    .eq('source_account', account)
    .in('source_tweet_id', tweetIds)

  if (error) {
    process.stdout.write(`[reactor] Supabase query failed: ${error.message}\n`)
    return []
  }

  const reactedIds = new Set((existing ?? []).map((r) => r.source_tweet_id))
  const unreacted = tweets.filter((t) => !reactedIds.has(t.id))

  process.stdout.write(
    `[reactor] ${unreacted.length} unreacted tweet(s) out of ${tweets.length}\n`,
  )
  return unreacted
}

// ============================================================
// Step 3: Generate Reaction Content (Claude)
// ============================================================

async function generateReactionContent(
  tweet: SourceTweet,
): Promise<ReactionContent> {
  const anthropic = new Anthropic()

  const prompt = `あなたはAIスタートアップのCEOです。以下の@AnthropicAIのツイートに対するリアクションスレッドを生成してください。

## 元ツイート
@${tweet.authorName}: ${tweet.text}
URL: ${tweet.url}

## 指示
1. メインツイート: フック＋CEO視点のリアクション（元ツイートURLを含める）
2. リプライ1: より深い分析・技術的洞察
3. リプライ2: 自社システムとの関連・今後の展望

## トーンガイド
- プロフェッショナルなCEOトーン
- 絵文字は1文ごとに最大1つ
- ▪️ や → などで構造化
- 時々【注目】【朗報🔥】スタイルのヘッダーを使用
- カジュアルな語尾（だよね、なんだよね）は禁止
- 「だ・である」調
- 各ツイートは280加重文字以内（日本語は2文字換算）

## 出力フォーマット（JSONのみ）
{
  "mainTweet": "メインツイートテキスト（元ツイートURL込み、ハッシュタグ #Anthropic #AI 込み）",
  "replies": [
    "リプライ1テキスト（深い分析）",
    "リプライ2テキスト（展望・自社との関連）"
  ],
  "infographicTitle": "インフォグラフィックのタイトル（15文字以内）",
  "infographicPoints": ["ポイント1（20文字以内）", "ポイント2", "ポイント3"]
}

## 重要
- メインツイートに元ツイートURL（${tweet.url}）を必ず含めること
- JSONのみ出力（他のテキスト不要）`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content.find(
    (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
  )

  const raw = text?.text ?? '{}'
  const jsonMatch = raw.match(/\{[\s\S]*\}/)

  try {
    const data = JSON.parse(jsonMatch?.[0] ?? '{}')
    return {
      mainTweet: data.mainTweet ?? '',
      replies: data.replies ?? [],
      infographicTitle: data.infographicTitle ?? 'Anthropic最新情報',
      infographicPoints: data.infographicPoints ?? [],
    }
  } catch {
    throw new Error(`Failed to parse Claude response: ${raw.slice(0, 200)}`)
  }
}

// ============================================================
// Step 4: Generate Infographic (Gemini)
// ============================================================

async function generateInfographic(
  config: ReactorConfig,
  content: ReactionContent,
): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    process.stdout.write('[reactor] GOOGLE_AI_API_KEY not set, skipping infographic\n')
    return null
  }

  const today = new Date()
  const dateLabel = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`

  const pointsBlock = content.infographicPoints
    .map((p, i) => `${i + 1}. ${p}`)
    .join('\n')

  const prompt = `以下の情報を元に、1200x630pxの図解インフォグラフィックを1枚生成してください。

【テーマ】
${content.infographicTitle}

【内容】
${pointsBlock}

【デザイン指示】
- 背景: ダークグラデーション（${config.infographicGradient}）
- テキスト色: 白 #FFFFFF
- アクセントカラー: ${config.infographicAccent}
- 上部タイトル「${content.infographicTitle}」
- 下部に「${dateLabel}」
- ゴシック体、太字、視認性最優先
- クリーン＆モダン
- 日本語メイン
- 写真やイラスト不要`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 8192,
      } as any,
    })

    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    for (const part of parts) {
      const p = part as { inlineData?: { mimeType: string; data: string } }
      if (p.inlineData?.mimeType?.startsWith('image/')) {
        return Buffer.from(p.inlineData.data, 'base64')
      }
    }

    process.stdout.write('[reactor] Gemini did not return an image\n')
    return null
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    process.stdout.write(`[reactor] Infographic generation failed: ${msg}\n`)
    return null
  }
}

async function uploadToSupabaseStorage(buffer: Buffer): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  try {
    const supabase = createClient(url, key)
    const ts = Date.now()
    const rand = Math.random().toString(36).substring(2, 8)
    const filePath = `images/x-article/reactor-${ts}-${rand}.png`

    const { error } = await supabase.storage
      .from('blog')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) {
      process.stdout.write(`[reactor] Supabase upload failed: ${error.message}\n`)
      return null
    }

    return supabase.storage.from('blog').getPublicUrl(filePath).data.publicUrl
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    process.stdout.write(`[reactor] Supabase upload error: ${msg}\n`)
    return null
  }
}

// ============================================================
// Step 5: Post Thread
// ============================================================

async function postReactionThread(
  content: ReactionContent,
  mainMediaId: string | null,
): Promise<{ readonly parentId: string; readonly threadUrl: string } | null> {
  const client = getTwitterClient()

  const parentParams: Record<string, unknown> = { text: content.mainTweet }
  if (mainMediaId) {
    parentParams.media = { media_ids: [mainMediaId] }
  }

  const parentResult = await client.v2.tweet(parentParams)
  const parentId = parentResult.data.id
  process.stdout.write(`[reactor] Parent: https://twitter.com/i/web/status/${parentId}\n`)

  let lastId = parentId
  for (let i = 0; i < content.replies.length; i++) {
    await new Promise((r) => setTimeout(r, 3000))

    const replyText = content.replies[i]
    const weighted = getTwitterWeightedLength(replyText)

    if (weighted > 25000) {
      process.stdout.write(`[reactor] Reply ${i + 1} SKIP: ${weighted} chars exceeds limit\n`)
      continue
    }

    try {
      const result = await client.v2.tweet({
        text: replyText,
        reply: { in_reply_to_tweet_id: lastId },
      })
      lastId = result.data.id
      process.stdout.write(`[reactor] Reply ${i + 1}: https://twitter.com/i/web/status/${lastId}\n`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      process.stdout.write(`[reactor] Reply ${i + 1} failed: ${msg}\n`)
    }
  }

  const threadUrl = `https://twitter.com/i/web/status/${parentId}`
  return { parentId, threadUrl }
}

// ============================================================
// Step 6: Save Reaction to Supabase
// ============================================================

async function saveReaction(
  account: string,
  sourceTweet: SourceTweet,
  reactionTweetId: string,
  reactionTweetUrl: string,
): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('tweet_reactions').insert({
    source_account: account,
    source_tweet_id: sourceTweet.id,
    source_text: sourceTweet.text.slice(0, 1000),
    reaction_tweet_id: reactionTweetId,
    reaction_tweet_url: reactionTweetUrl,
  })

  if (error) {
    process.stdout.write(`[reactor] Failed to save reaction: ${error.message}\n`)
  }
}

// ============================================================
// Main Export
// ============================================================

export async function runAnthropicReactor(): Promise<void> {
  const account = 'AnthropicAI'
  const config = REACTOR_CONFIGS[account]
  if (!config) {
    throw new Error(`No config found for account: ${account}`)
  }

  process.stdout.write(`\n=== Tweet Reactor: @${account} ===\n`)

  // Step 1: Fetch recent tweets
  process.stdout.write('[step 1] Fetching recent tweets via Brave Search...\n')
  const recentTweets = await fetchRecentTweets(config)

  if (recentTweets.length === 0) {
    process.stdout.write('[done] No recent tweets found. Skipping.\n')
    return
  }

  // Step 2: Filter out already-reacted tweets
  process.stdout.write('[step 2] Checking for already-reacted tweets...\n')
  const unreactedTweets = await filterUnreactedTweets(account, recentTweets)

  if (unreactedTweets.length === 0) {
    process.stdout.write('[done] All tweets already reacted to. Skipping.\n')
    return
  }

  // Process only the first unreacted tweet (to avoid spamming)
  const targetTweet = unreactedTweets[0]
  process.stdout.write(`[target] Reacting to: ${targetTweet.url}\n`)
  process.stdout.write(`[target] Text: ${targetTweet.text.slice(0, 100)}...\n`)

  // Step 3: Generate reaction content
  process.stdout.write('[step 3] Generating reaction content via Claude...\n')
  const content = await generateReactionContent(targetTweet)

  if (!content.mainTweet) {
    process.stdout.write('[done] Content generation returned empty. Skipping.\n')
    return
  }

  // Step 4: Generate infographic
  process.stdout.write('[step 4] Generating infographic via Gemini...\n')
  const imageBuffer = await generateInfographic(config, content)

  let mainMediaId: string | null = null
  if (imageBuffer) {
    const publicUrl = await uploadToSupabaseStorage(imageBuffer)
    if (publicUrl) {
      process.stdout.write(`[infographic] Archived: ${publicUrl}\n`)
    }

    mainMediaId = await uploadMediaToX(imageBuffer, 'image/png')
    if (mainMediaId) {
      process.stdout.write('[infographic] Uploaded to X\n')
    }
  }

  // Step 5: Post thread
  process.stdout.write('[step 5] Posting reaction thread...\n')
  const result = await postReactionThread(content, mainMediaId)

  if (result) {
    process.stdout.write(`[done] Thread posted: ${result.threadUrl}\n`)

    // Step 6: Save reaction record
    await saveReaction(account, targetTweet, result.parentId, result.threadUrl)

    // Save analytics
    try {
      await savePostAnalytics({
        tweetId: result.parentId,
        tweetUrl: result.threadUrl,
        postText: content.mainTweet,
        postMode: 'pattern',
        postType: 'thread',
        tags: ['tweet-reactor', account],
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      process.stdout.write(`[analytics] Failed to save: ${msg}\n`)
    }
  } else {
    process.stdout.write('[done] Thread posting failed\n')
  }
}
