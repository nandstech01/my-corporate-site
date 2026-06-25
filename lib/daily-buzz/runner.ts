/**
 * Daily Buzz Thread Runner
 *
 * Thin wrapper to run the daily-buzz-thread script from the cron system.
 * Sets BUZZ_CATEGORY and delegates to the main script logic.
 */

import { createAnthropicCompatible } from '@/lib/llm/claude-cli'
import { generateNeonThumbnail } from '@/lib/ai-image/openai-image'
import { createClient } from '@supabase/supabase-js'
import { braveWebSearch } from '../web-search/brave'
import { calculateCharacterOverlap } from '../ai-judge/safety-checks'
import { uploadMediaToX } from '../x-api/media'
import { getTwitterClient, getTwitterWeightedLength, postThread } from '../x-api/client'
import { createTypefullyDraft, uploadTypefullyMedia, isTypefullyConfigured } from '../typefully/client'
import { savePostAnalytics, getRecentXPostTexts } from '../slack-bot/memory'

// ============================================================
// Types
// ============================================================

type BuzzCategory = 'global-ai-news' | 'claude-code' | 'ai-tech-japan'

interface BuzzTweet {
  readonly url: string
  readonly authorName: string
  readonly authorHandle: string
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
          `x.com status OpenAI ${year}`,
          `x.com status Google AI NVIDIA Anthropic ${year}`,
          `x.com status GPT Gemini Claude announcement ${year}`,
        ],
        hashtags: '#AI #AINews #テック',
        infographicAccent: '#4A9EFF',
        infographicGradient: '#0a0a1a to #1a0a2e',
        tags: ['daily-buzz', 'global-ai-news'],
      }
    case 'claude-code':
      return {
        searchQueries: [
          `x.com status "Claude Code" ${year}`,
          `x.com status Claude Code tips workflow ${year}`,
          `x.com status Anthropic Claude developer ${year}`,
        ],
        hashtags: '#ClaudeCode #Anthropic #AI',
        infographicAccent: '#D97757',
        infographicGradient: '#1a1a2e to #0f3460',
        tags: ['daily-buzz', 'claude-code'],
      }
    case 'ai-tech-japan':
      return {
        searchQueries: [
          `x.com status AI 人工知能 ChatGPT ${year}`,
          `x.com status 生成AI LLM プロンプト ${year}`,
          `x.com status AIエージェント Claude Code ${year}`,
        ],
        hashtags: '#AI #生成AI #テック',
        infographicAccent: '#26C6DA',
        infographicGradient: '#0f0c29 to #302b63',
        tags: ['daily-buzz', 'ai-tech-japan'],
      }
  }
}

// ============================================================
// Dedup: 過去に使用済みのツイートURLを取得
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/** 過去14日間のバズスレッドで使用済みのツイートURLを取得 */
async function getRecentlyUsedBuzzUrls(): Promise<ReadonlySet<string>> {
  const supabase = getSupabase()
  if (!supabase) return new Set()

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const urls = new Set<string>()

  // 1. x_post_analytics の post_text からツイートURLを抽出（daily-buzzタグ付き）
  try {
    const { data } = await supabase
      .from('x_post_analytics')
      .select('post_text')
      .contains('tags', ['daily-buzz'])
      .gte('posted_at', since)

    if (data) {
      for (const row of data) {
        const text = row.post_text as string
        // x.com/*/status/* パターンのURLを抽出
        const matches = text.match(/https?:\/\/x\.com\/\w+\/status\/\d+/g)
        if (matches) {
          for (const m of matches) urls.add(m)
        }
      }
    }
  } catch { /* best-effort */ }

  // 2. tweet_reactions テーブルからも取得
  try {
    const { data } = await supabase
      .from('tweet_reactions')
      .select('source_tweet_id, source_account')
      .gte('created_at', since)

    if (data) {
      for (const row of data) {
        urls.add(`https://x.com/${row.source_account}/status/${row.source_tweet_id}`)
      }
    }
  } catch { /* best-effort */ }

  // 3. 直近の投稿テキスト全体からもURLを抽出（タグなしの手動投稿も含む）
  try {
    const recentTexts = await getRecentXPostTexts(14)
    for (const text of recentTexts) {
      const matches = text.match(/https?:\/\/x\.com\/\w+\/status\/\d+/g)
      if (matches) {
        for (const m of matches) urls.add(m)
      }
    }
  } catch { /* best-effort */ }

  if (urls.size > 0) {
    process.stdout.write(`[dedup] ${urls.size} previously used tweet URLs loaded\n`)
  }

  return urls
}

/** 過去7日間にメンションしたアカウントを取得（同じ人に繰り返しメンションしない） */
async function getRecentlyMentionedAccounts(): Promise<ReadonlySet<string>> {
  const accounts = new Set<string>()

  try {
    const recentTexts = await getRecentXPostTexts(7)
    for (const text of recentTexts) {
      // @handle パターンを抽出（.@handle も含む）
      const matches = text.match(/\.?@([a-zA-Z0-9_]+)/g)
      if (matches) {
        for (const m of matches) {
          const handle = m.replace(/^\.?@/, '').toLowerCase()
          if (handle) accounts.add(handle)
        }
      }
    }
  } catch { /* best-effort */ }

  if (accounts.size > 0) {
    process.stdout.write(`[dedup] ${accounts.size} recently mentioned accounts loaded\n`)
  }

  return accounts
}

// ============================================================
// Buzz Collection
// ============================================================

async function collectBuzzTweets(category: BuzzCategory): Promise<readonly BuzzTweet[]> {
  const config = getCategoryConfig(category)
  const tweets: BuzzTweet[] = []
  const seenUrls = new Set<string>()

  // 過去に使用済みのURLを取得して除外
  const usedUrls = await getRecentlyUsedBuzzUrls()
  for (const url of usedUrls) seenUrls.add(url)

  // 過去7日間にメンション済みのアカウントを取得
  const mentionedAccounts = await getRecentlyMentionedAccounts()

  // X auto-postとのコンテンツ重複を防ぐため、直近の投稿テキストを取得
  let recentPostTexts: readonly string[] = []
  try {
    recentPostTexts = await getRecentXPostTexts(7)
  } catch { /* best-effort */ }

  for (const query of config.searchQueries) {
    try {
      const results = await braveWebSearch(query, { count: 10 })

      const tweetResults = results.filter((r) =>
        r.url.includes('x.com/') && r.url.includes('/status/'),
      )

      for (const result of tweetResults) {
        if (seenUrls.has(result.url)) {
          process.stdout.write(`[dedup] Skipping already used URL: ${result.url.slice(0, 60)}\n`)
          continue
        }
        seenUrls.add(result.url)

        // 最近メンション済みのアカウントの投稿はスキップ
        const handle = extractHandleFromUrl(result.url).toLowerCase()
        if (handle && mentionedAccounts.has(handle)) {
          process.stdout.write(`[dedup] Skipping recently mentioned account: @${handle}\n`)
          continue
        }

        // コンテンツ類似度チェック（X auto-postとの重複防止）
        const titleLower = (result.title || '').toLowerCase()
        if (titleLower && recentPostTexts.some((text) => {
          const textLower = text.toLowerCase()
          return textLower.includes(titleLower) ||
            calculateCharacterOverlap(titleLower, textLower) >= 0.35
        })) {
          process.stdout.write(`[dedup] Skipping similar content: ${result.title?.slice(0, 50)}\n`)
          continue
        }

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

  process.stdout.write(`[collect] Found ${tweets.length} new buzz tweets for ${category}\n`)
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
          authorHandle: extractHandleFromUrl(url),
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
    authorHandle: extractHandleFromUrl(url),
    text: fallbackDescription || fallbackTitle,
  }
}

function extractAuthorFromUrl(url: string): string {
  const match = url.match(/x\.com\/([^/]+)\/status/)
  return match ? `@${match[1]}` : 'unknown'
}

function extractHandleFromUrl(url: string): string {
  const match = url.match(/x\.com\/([^/]+)\/status/)
  return match ? match[1] : ''
}

// ============================================================
// Content Generation
// ============================================================

async function generateThreadContent(
  category: BuzzCategory,
  tweets: readonly BuzzTweet[],
): Promise<BuzzThreadContent> {
  const config = getCategoryConfig(category)
  const anthropic = createAnthropicCompatible()

  const categoryLabel =
    category === 'global-ai-news' ? 'グローバルAIニュース' :
    category === 'claude-code' ? 'Claude Code最新情報' :
    'AI技術（日本語圏）'

  const tweetSummaries = tweets
    .slice(0, 10)
    .map((t, i) => `[${i + 1}] ${t.authorName} (@${t.authorHandle}): ${t.text.slice(0, 200)}\nURL: ${t.url}`)
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
- 各リプライの冒頭または本文中に元投稿者のメンション（.@handle形式）を自然に入れること（先頭に.を付けてフォロワー全員に表示させる）
- 各リプライの末尾に対応するツイートURLを含めること
- メインツイートの末尾にハッシュタグ: ${config.hashtags}
- メンションは1リプライにつき1つまで
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
  try {
    const result = await generateNeonThumbnail(
      {
        title: content.infographicTitle,
        keywords: content.infographicPoints.slice(0, 5) as string[],
        theme: `daily buzz infographic: ${category}`,
        saveBadge: true,
      },
      { quality: 'high', size: '1536x1024' },
    )

    if (result.error || !result.buffer) {
      process.stdout.write(`[infographic] OpenAI did not return an image: ${result.error ?? 'no buffer'}\n`)
      return null
    }

    return result.buffer
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

  // Step 1-2: Build thread content.
  // claude-code は公式CHANGELOGベースの「教科書」解説スレッド（watcher→generator）。
  // それ以外は従来のバズまとめ（他人の投稿をメンションして集約）。
  let content: BuzzThreadContent
  if (category === 'claude-code') {
    process.stdout.write('[step 1-2] Generating Claude Code explainer thread from official changelog...\n')
    const { generateClaudeCodeThread } = await import('../cortex/posting/claude-code-thread')
    const generated = await generateClaudeCodeThread()
    if (!generated || !generated.mainTweet || generated.replies.length === 0) {
      process.stdout.write('[done] Claude Code thread generation empty. Skipping.\n')
      return
    }
    content = {
      mainTweet: generated.mainTweet,
      replies: generated.replies,
      infographicTitle: generated.infographicTitle,
      infographicPoints: generated.infographicPoints,
    }
  } else {
    // Step 1: Collect buzz tweets
    process.stdout.write('[step 1] Collecting buzz tweets...\n')
    const tweets = await collectBuzzTweets(category)

    if (tweets.length < 3) {
      process.stdout.write(`[done] Only ${tweets.length} tweet(s) found. Need at least 3. Skipping.\n`)
      return
    }

    // Step 2: Generate thread content
    process.stdout.write('[step 2] Generating thread content...\n')
    content = await generateThreadContent(category, tweets)

    if (!content.mainTweet || content.replies.length === 0) {
      process.stdout.write('[done] Content generation returned empty. Skipping.\n')
      return
    }
  }

  // claude-code は稼働中のテキスト経路(postThread→Typefully/Playwright)で投稿する。
  // 画像/ネイティブ引用は X API 有料枠が必要(現状402 CreditsDepleted)のため、
  // 確実に出るテキストスレッドを優先する。
  if (category === 'claude-code') {
    const segments = [content.mainTweet, ...content.replies].filter((s) => s && s.trim().length > 0)

    // 重複チェック
    try {
      const recentTexts = await getRecentXPostTexts(14)
      const generatedText = segments.join(' ').toLowerCase()
      for (const recentText of recentTexts) {
        if (calculateCharacterOverlap(generatedText, recentText.toLowerCase()) >= 0.30) {
          process.stdout.write('[dedup] Generated thread too similar to recent post. Skipping.\n')
          return
        }
      }
    } catch { /* best-effort */ }

    // CORTEX review（重複排除 + 鮮度）
    try {
      const { cortexReview } = await import('../cortex/review/pre-post-reviewer')
      const reviewed = await cortexReview(segments.map((s) => ({ text: s, platform: 'x' })))
      const rejected = reviewed.filter((r) => r.duplicate_of || r.is_stale)
      if (rejected.length > reviewed.length / 2) {
        process.stdout.write(`[cortex] ${rejected.length}/${reviewed.length} rejected by CORTEX, skipping\n`)
        return
      }
    } catch (e) {
      process.stdout.write(`[cortex] Review skipped: ${e instanceof Error ? e.message : e}\n`)
    }

    // 画像(OpenAI GPT Image)を生成し Typefully にアップロードして添付する。
    // X API有料枠は不要(Typefullyのメディアフロー)。失敗してもテキストで続行。
    let mediaIds: string[] | undefined
    try {
      const imageBuffer = await generateInfographic(category, content)
      if (imageBuffer) {
        // アーカイブ(best-effort)
        try { await uploadToSupabase(imageBuffer, 'buzz-claude-code') } catch { /* best-effort */ }
        if (isTypefullyConfigured()) {
          const up = await uploadTypefullyMedia(
            new Uint8Array(imageBuffer),
            `claude-code-${Date.now()}.png`,
          )
          if (up.mediaId) {
            mediaIds = [up.mediaId]
            process.stdout.write('[infographic] Uploaded to Typefully\n')
          } else {
            process.stdout.write(`[infographic] Typefully upload skipped: ${up.error}\n`)
          }
        }
      }
    } catch (e) {
      process.stdout.write(`[infographic] Skipped: ${e instanceof Error ? e.message : e}\n`)
    }

    // 投稿: 画像付きは Typefully ドラフト経由、未設定/失敗時はテキストの postThread にフォールバック。
    process.stdout.write('[step 4] Posting Claude Code thread...\n')
    let postedUrl: string | undefined
    let postedId: string | undefined
    if (isTypefullyConfigured()) {
      const draft = await createTypefullyDraft(segments.join('\n\n\n\n'), {
        mediaIds,
        share: true,
        scheduleDate: process.env.TYPEFULLY_SCHEDULE_DATE || 'next-free-slot',
        draftTitle: 'Claude Code update',
      })
      if (draft.success) {
        postedUrl = draft.shareUrl
        postedId = draft.draftId
        process.stdout.write(`[done] Posted via Typefully: ${postedUrl} (image=${Boolean(mediaIds)})\n`)
      } else {
        process.stdout.write(`[typefully] Draft failed: ${draft.error}. Falling back to postThread.\n`)
      }
    }
    if (!postedUrl) {
      const result = await postThread(segments)
      if (!result.success) {
        process.stdout.write(`[done] Claude Code thread post failed: ${result.error}\n`)
        return
      }
      postedUrl = result.tweetUrl
      postedId = result.tweetId
      process.stdout.write(`[done] Posted via text path: ${postedUrl}\n`)
    }

    try {
      const tid = postedId ?? (postedUrl?.split('/status/')[1] ?? postedUrl ?? '')
      if (tid) {
        await savePostAnalytics({
          tweetId: tid,
          tweetUrl: postedUrl,
          postText: segments.join('\n---\n'),
          postMode: 'pattern',
          postType: 'thread',
          tags: ['daily-buzz', 'claude-code'],
        })
      }
    } catch (e) {
      process.stdout.write(`[analytics] Failed to save: ${e instanceof Error ? e.message : e}\n`)
    }
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

  // Step 3.5: Post-generation content similarity check (prevent topic-level duplicates)
  try {
    const recentTexts = await getRecentXPostTexts(14)
    const generatedText = [content.mainTweet, ...content.replies].join(' ').toLowerCase()

    for (const recentText of recentTexts) {
      const overlap = calculateCharacterOverlap(generatedText, recentText.toLowerCase())
      if (overlap >= 0.30) {
        process.stdout.write(
          `[dedup] Generated thread too similar to recent post (overlap=${overlap.toFixed(2)}). Skipping.\n`,
        )
        return
      }
    }
    process.stdout.write(`[dedup] Content similarity check passed (checked ${recentTexts.length} recent posts)\n`)
  } catch {
    // best-effort: proceed if dedup check fails
  }

  // Step 3.5: CORTEX Review — 重複排除 + ナレッジ最適化
  try {
    const { cortexReview } = await import('../cortex/review/pre-post-reviewer')
    const candidates = [
      { text: content.mainTweet, platform: 'x' },
      ...content.replies.map((r: string) => ({ text: r, platform: 'x' })),
    ]
    const reviewed = await cortexReview(candidates)
    const rejected = reviewed.filter(r => r.duplicate_of || r.is_stale)
    if (rejected.length > reviewed.length / 2) {
      process.stdout.write(`[cortex] ${rejected.length}/${reviewed.length} rejected by CORTEX, skipping\n`)
      return
    }
    process.stdout.write(`[cortex] Review: ${reviewed.length - rejected.length}/${reviewed.length} approved\n`)
  } catch (e) {
    process.stdout.write(`[cortex] Review skipped: ${e instanceof Error ? e.message : e}\n`)
  }

  // Step 4: Post thread
  process.stdout.write('[step 4] Posting thread...\n')
  const threadUrl = await postBuzzThread(content, mainMediaId)

  if (threadUrl) {
    process.stdout.write(`[done] Thread posted: ${threadUrl}\n`)

    // Save analytics — メイン投稿 + 全リプライのテキストを結合して保存
    // リプライに含まれるソースURLが次回のdedup対象になる
    try {
      const parentId = threadUrl.split('/status/')[1]
      if (parentId) {
        const fullText = [content.mainTweet, ...content.replies].join('\n---\n')
        await savePostAnalytics({
          tweetId: parentId,
          tweetUrl: threadUrl,
          postText: fullText,
          postMode: 'pattern',
          postType: 'thread',
          tags: ['daily-buzz', category],
        })
        process.stdout.write(`[analytics] Saved with ${content.replies.length} reply URLs for dedup\n`)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      process.stdout.write(`[analytics] Failed to save: ${msg}\n`)
    }
  } else {
    process.stdout.write('[done] Thread posting failed\n')
  }
}
