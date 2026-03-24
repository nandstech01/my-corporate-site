/**
 * Daily Buzz Thread Runner
 *
 * Thin wrapper to run the daily-buzz-thread script from the cron system.
 * Sets BUZZ_CATEGORY and delegates to the main script logic.
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

type BuzzCategory = 'global-ai-news' | 'claude-code' | 'ai-tech-japan'

interface BuzzTweet {
  readonly url: string
  readonly authorName: string
  readonly text: string
}

interface BuzzThreadContent {
  readonly mainTweet: string
  readonly replies: readonly string[]
  readonly infographicTitle: string
  readonly infographicPoints: readonly string[]
}

interface CategoryConfig {
  readonly searchQueries: readonly string[]
  readonly hashtags: string
  readonly infographicAccent: string
  readonly infographicGradient: string
  readonly tags: readonly string[]
}

// ============================================================
// Category Configuration
// ============================================================

function getCategoryConfig(category: BuzzCategory): CategoryConfig {
  const year = new Date().getFullYear()

  switch (category) {
    case 'global-ai-news':
      return {
        searchQueries: [
          `site:x.com (OpenAI OR Google AI OR NVIDIA OR Anthropic OR SoftBank) ${year}`,
          `site:x.com AI news breakthrough ${year}`,
          `site:x.com (GPT OR Gemini OR Claude) announcement ${year}`,
        ],
        hashtags: '#AI #AINews #テック',
        infographicAccent: '#4A9EFF',
        infographicGradient: '#0a0a1a to #1a0a2e',
        tags: ['daily-buzz', 'global-ai-news'],
      }
    case 'claude-code':
      return {
        searchQueries: [
          `site:x.com Claude Code ${year}`,
          `site:x.com "Claude Code" tips OR tricks OR workflow ${year}`,
          `site:x.com Anthropic Claude developer ${year}`,
        ],
        hashtags: '#ClaudeCode #Anthropic #AI',
        infographicAccent: '#D97757',
        infographicGradient: '#1a1a2e to #0f3460',
        tags: ['daily-buzz', 'claude-code'],
      }
    case 'ai-tech-japan':
      return {
        searchQueries: [
          `site:x.com (AI OR 人工知能 OR Claude OR ChatGPT) lang:ja ${year}`,
          `site:x.com (生成AI OR LLM OR プロンプト) lang:ja ${year}`,
          `site:x.com (AIエージェント OR Cursor OR Claude Code) lang:ja ${year}`,
        ],
        hashtags: '#AI #生成AI #テック',
        infographicAccent: '#26C6DA',
        infographicGradient: '#0f0c29 to #302b63',
        tags: ['daily-buzz', 'ai-tech-japan'],
      }
  }
}

// ============================================================
// Buzz Collection
// ============================================================

async function collectBuzzTweets(category: BuzzCategory): Promise<readonly BuzzTweet[]> {
  const config = getCategoryConfig(category)
  const tweets: BuzzTweet[] = []
  const seenUrls = new Set<string>()

  for (const query of config.searchQueries) {
    try {
      const results = await braveWebSearch(query, { count: 10, freshness: 'pw' })

      const tweetResults = results.filter((r) =>
        r.url.includes('x.com/') && r.url.includes('/status/'),
      )

      for (const result of tweetResults) {
        if (seenUrls.has(result.url)) continue
        seenUrls.add(result.url)

        const tweet = await fetchTweetOembed(result.url, result.title, result.description)
        if (tweet) {
          tweets.push(tweet)
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      process.stdout.write(`[search] Query failed: ${msg}\n`)
    }

    await new Promise((r) => setTimeout(r, 500))
  }

  process.stdout.write(`[collect] Found ${tweets.length} buzz tweets for ${category}\n`)
  return tweets
}

async function fetchTweetOembed(
  url: string,
  fallbackTitle: string,
  fallbackDescription: string,
): Promise<BuzzTweet | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(
        `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`,
        { signal: controller.signal },
      )

      if (response.ok) {
        const data = (await response.json()) as { html?: string; author_name?: string }
        const textMatch = data.html?.match(/<p[^>]*>([\s\S]*?)<\/p>/)
        const text = textMatch
          ? textMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
          : fallbackDescription

        return {
          url,
          authorName: data.author_name ?? extractAuthorFromUrl(url),
          text: text || fallbackDescription,
        }
      }
    } finally {
      clearTimeout(timeout)
    }
  } catch {
    // Oembed failed, use fallback
  }

  return {
    url,
    authorName: extractAuthorFromUrl(url),
    text: fallbackDescription || fallbackTitle,
  }
}

function extractAuthorFromUrl(url: string): string {
  const match = url.match(/x\.com\/([^/]+)\/status/)
  return match ? `@${match[1]}` : 'unknown'
}

// ============================================================
// Content Generation
// ============================================================

async function generateThreadContent(
  category: BuzzCategory,
  tweets: readonly BuzzTweet[],
): Promise<BuzzThreadContent> {
  const config = getCategoryConfig(category)
  const anthropic = new Anthropic()

  const categoryLabel =
    category === 'global-ai-news' ? 'グローバルAIニュース' :
    category === 'claude-code' ? 'Claude Code最新情報' :
    'AI技術（日本語圏）'

  const tweetSummaries = tweets
    .slice(0, 10)
    .map((t, i) => `[${i + 1}] ${t.authorName}: ${t.text.slice(0, 200)}\nURL: ${t.url}`)
    .join('\n\n')

  const prompt = `あなたはAIスタートアップのCEOです。以下のバズツイートを分析し、Xスレッド用のコンテンツを生成してください。

## カテゴリ
${categoryLabel}

## 収集したバズツイート
${tweetSummaries}

## 指示
1. 最も面白い・多様な5件のツイートを選定
2. メインツイート（概要＋フック）を作成
3. 選定した5件それぞれにCEO視点のコメント付きリプライを作成

## トーンガイド
- プロフェッショナルなCEOトーン
- 絵文字は1文ごとに最大1つ
- ▪️ や ① などで構造化
- 時々【朗報🔥】【注目】スタイルのヘッダーを使用
- カジュアルな語尾（だよね、なんだよね）は禁止
- 「です・ます」調ではなく「だ・である」調

## 出力フォーマット（JSONのみ）
{
  "mainTweet": "メインツイートテキスト（280加重文字以内、ハッシュタグ込み）",
  "replies": [
    "リプライ1テキスト（選定ツイートへのコメント＋URL埋め込み）",
    "リプライ2テキスト",
    "リプライ3テキスト",
    "リプライ4テキスト",
    "リプライ5テキスト"
  ],
  "infographicTitle": "インフォグラフィックのタイトル（15文字以内）",
  "infographicPoints": ["ポイント1（20文字以内）", "ポイント2", "ポイント3", "ポイント4", "ポイント5"],
  "selectedTweetUrls": ["url1", "url2", "url3", "url4", "url5"]
}

## 重要
- 各リプライの末尾に対応するツイートURLを含めること
- メインツイートの末尾にハッシュタグ: ${config.hashtags}
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
      infographicTitle: data.infographicTitle ?? categoryLabel,
      infographicPoints: data.infographicPoints ?? [],
    }
  } catch {
    throw new Error(`Failed to parse Claude response: ${raw.slice(0, 200)}`)
  }
}

// ============================================================
// Infographic Generation
// ============================================================

async function generateInfographic(
  category: BuzzCategory,
  content: BuzzThreadContent,
): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    process.stdout.write('[infographic] GOOGLE_AI_API_KEY not set, skipping\n')
    return null
  }

  const config = getCategoryConfig(category)
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

    process.stdout.write('[infographic] Gemini did not return an image\n')
    return null
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    process.stdout.write(`[infographic] Generation failed: ${msg}\n`)
    return null
  }
}

// ============================================================
// Supabase Upload
// ============================================================

async function uploadToSupabase(buffer: Buffer, prefix: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  try {
    const supabase = createClient(url, key)
    const ts = Date.now()
    const rand = Math.random().toString(36).substring(2, 8)
    const filePath = `images/x-article/${prefix}-${ts}-${rand}.png`

    const { error } = await supabase.storage
      .from('blog')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) {
      process.stdout.write(`[supabase] Upload failed: ${error.message}\n`)
      return null
    }

    return supabase.storage.from('blog').getPublicUrl(filePath).data.publicUrl
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    process.stdout.write(`[supabase] Upload error: ${msg}\n`)
    return null
  }
}

// ============================================================
// Thread Posting
// ============================================================

async function postBuzzThread(
  content: BuzzThreadContent,
  mainMediaId: string | null,
): Promise<string | null> {
  const client = getTwitterClient()

  const parentParams: Record<string, unknown> = { text: content.mainTweet }
  if (mainMediaId) {
    parentParams.media = { media_ids: [mainMediaId] }
  }

  const parentResult = await client.v2.tweet(parentParams)
  const parentId = parentResult.data.id
  process.stdout.write(`[parent] https://twitter.com/i/web/status/${parentId}\n`)

  let lastId = parentId
  for (let i = 0; i < content.replies.length; i++) {
    await new Promise((r) => setTimeout(r, 3000))

    const replyText = content.replies[i]
    const weighted = getTwitterWeightedLength(replyText)

    if (weighted > 25000) {
      process.stdout.write(`[reply ${i + 1}] SKIP: ${weighted} chars exceeds limit\n`)
      continue
    }

    try {
      const result = await client.v2.tweet({
        text: replyText,
        reply: { in_reply_to_tweet_id: lastId },
      })
      lastId = result.data.id
      process.stdout.write(`[reply ${i + 1}] https://twitter.com/i/web/status/${lastId}\n`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      process.stdout.write(`[reply ${i + 1}] Failed: ${msg}\n`)
    }
  }

  return `https://twitter.com/i/web/status/${parentId}`
}

// ============================================================
// Main Export
// ============================================================

export async function runDailyBuzzThread(category: BuzzCategory): Promise<void> {
  process.stdout.write(`\n=== Daily Buzz Thread: ${category} ===\n`)

  // Step 1: Collect buzz tweets
  process.stdout.write('[step 1] Collecting buzz tweets...\n')
  const tweets = await collectBuzzTweets(category)

  if (tweets.length < 3) {
    process.stdout.write(`[done] Only ${tweets.length} tweet(s) found. Need at least 3. Skipping.\n`)
    return
  }

  // Step 2: Generate thread content
  process.stdout.write('[step 2] Generating thread content...\n')
  const content = await generateThreadContent(category, tweets)

  if (!content.mainTweet || content.replies.length === 0) {
    process.stdout.write('[done] Content generation returned empty. Skipping.\n')
    return
  }

  // Step 3: Generate infographic
  process.stdout.write('[step 3] Generating infographic...\n')
  const imageBuffer = await generateInfographic(category, content)

  let mainMediaId: string | null = null
  if (imageBuffer) {
    const publicUrl = await uploadToSupabase(imageBuffer, `buzz-${category}`)
    if (publicUrl) {
      process.stdout.write(`[infographic] Archived: ${publicUrl}\n`)
    }

    mainMediaId = await uploadMediaToX(imageBuffer, 'image/png')
    if (mainMediaId) {
      process.stdout.write('[infographic] Uploaded to X\n')
    }
  }

  // Step 4: Post thread
  process.stdout.write('[step 4] Posting thread...\n')
  const threadUrl = await postBuzzThread(content, mainMediaId)

  if (threadUrl) {
    process.stdout.write(`[done] Thread posted: ${threadUrl}\n`)

    // Save analytics
    try {
      const parentId = threadUrl.split('/status/')[1]
      if (parentId) {
        await savePostAnalytics({
          tweetId: parentId,
          tweetUrl: threadUrl,
          postText: content.mainTweet,
          postMode: 'pattern',
          postType: 'thread',
          tags: ['daily-buzz', category],
        })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      process.stdout.write(`[analytics] Failed to save: ${msg}\n`)
    }
  } else {
    process.stdout.write('[done] Thread posting failed\n')
  }
}
