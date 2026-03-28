/**
 * Weekly Claude Code Update Thread
 *
 * Researches this week's Claude Code changelog, generates an infographic,
 * and posts a chain-style thread to X.
 *
 * Usage: npx dotenv-cli -e .env.local -- npx tsx scripts/weekly-claude-code-update.ts
 * GitHub Actions: Runs every Saturday at a configured time (JST)
 */

import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { uploadMediaToX } from '../lib/x-api/media'
import { getTwitterClient, getTwitterWeightedLength } from '../lib/x-api/client'
import { multiSearch } from '../lib/web-search/brave'

// ============================================================
// Date Helpers
// ============================================================

function getThisWeekRange(): { start: string; end: string; label: string } {
  const now = new Date()
  // Always look at the most recently completed Mon-Fri week
  const daysBack = now.getDay() === 0 ? 2 : now.getDay() === 6 ? 1 : now.getDay()
  const friday = new Date(now)
  friday.setDate(now.getDate() - daysBack)
  const monday = new Date(friday)
  monday.setDate(friday.getDate() - 4)

  const fmt = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  const fmtShort = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`

  return {
    start: fmt(monday),
    end: fmt(friday),
    label: `${fmtShort(monday)}-${fmtShort(friday)}`,
  }
}

// ============================================================
// Research with Claude
// ============================================================

async function webSearchAndSummarize(
  type: 'claude-code' | 'ai-news',
  weekRange: { start: string; end: string },
  outputFormat: string,
): Promise<string> {
  // Step 1: Web search for real-time data
  process.stdout.write('[search] Running web searches...\n')

  const queries = type === 'claude-code'
    ? [
        `Claude Code changelog ${weekRange.start}`,
        'Claude Code update release notes site:anthropic.com OR site:github.com',
        'Claude Code new features this week',
      ]
    : [
        `AI news ${weekRange.start} ${weekRange.end}`,
        'AI industry news this week OpenAI Google Anthropic NVIDIA',
        'AI ニュース 今週 2026年3月',
        'biggest AI announcements March 2026',
      ]

  const results = await multiSearch(queries, { count: 10, freshness: 'pw' })
  process.stdout.write(`[search] Found ${results.length} results\n`)

  if (results.length === 0) return '{}'

  const searchContext = results
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.description}`)
    .join('\n\n')

  // Step 2: Claude summarizes
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const instruction = type === 'claude-code'
    ? `以下のWeb検索結果から、Claude Codeの今週（${weekRange.start}〜${weekRange.end}）のアップデート情報を抽出してまとめてください。`
    : `以下のWeb検索結果から、今週（${weekRange.start}〜${weekRange.end}）のAI業界の重大ニュースTOP5を抽出してまとめてください。
条件: 検索結果に含まれる情報のみ使用。推測や古い情報は絶対に混ぜないこと。各ニュースのソースURLを必ず含めること。`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `${instruction}

## Web検索結果
${searchContext}

---

JSONのみ出力してください（他のテキスト不要）:

${outputFormat}`,
    }],
  })

  const text = response.content.find((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
  return text?.text ?? '{}'
}

async function researchClaudeCodeUpdates(weekRange: { start: string; end: string }): Promise<string> {
  return webSearchAndSummarize('claude-code', weekRange, `{
  "versions": [
    {
      "version": "v2.1.XX",
      "date": "YYYY-MM-DD",
      "highlights": ["機能1", "機能2", "機能3"],
      "one_liner": "このバージョンの一言まとめ"
    }
  ],
  "summary": "今週全体の一言まとめ（バズるキャッチーな表現で）",
  "opinion": "エンジニアとしての個人的な意見・感想（1-2文）",
  "source_urls": ["公式ソースURL1", "公式ソースURL2"]
}`)
}

async function researchAINews(weekRange: { start: string; end: string }): Promise<string> {
  return webSearchAndSummarize('ai-news', weekRange, `{
  "stories": [
    {
      "headline": "キャッチーな見出し（20文字以内）",
      "body": "ツイート本文（100文字以内、インパクト重視）",
      "source_url": "公式ソースURL（X投稿URLが望ましい）",
      "company": "関連企業名"
    }
  ],
  "summary": "今週のAI業界を一言で（バズるキャッチーな表現で）",
  "opinion": "エンジニアとしての個人的な意見・感想（1-2文）",
  "infographic_items": [
    {"label": "短い見出し（10文字以内）", "description": "補足説明（15文字以内）"}
  ]
}`)
}

// ============================================================
// Gemini Infographic Generation
// ============================================================

async function generateInfographic(prompt: string): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not set')

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
    if ((part as any).inlineData?.mimeType?.startsWith('image/')) {
      return Buffer.from((part as any).inlineData.data, 'base64')
    }
  }
  throw new Error('No image returned from Gemini')
}

async function uploadToSupabase(buffer: Buffer, prefix: string): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')

  const supabase = createClient(url, key)
  const ts = Date.now()
  const rand = Math.random().toString(36).substring(2, 8)
  const filePath = `images/x-article/${prefix}-${ts}-${rand}.png`

  const { error } = await supabase.storage
    .from('blog')
    .upload(filePath, buffer, { contentType: 'image/png', cacheControl: '31536000', upsert: false })
  if (error) throw new Error(`Supabase: ${error.message}`)

  return supabase.storage.from('blog').getPublicUrl(filePath).data.publicUrl
}

// ============================================================
// X Thread Posting (Chain Style)
// ============================================================

async function postChainThread(
  parentText: string,
  replies: readonly string[],
  mediaId?: string,
): Promise<string> {
  const client = getTwitterClient()

  // Parent tweet
  const parentParams: Record<string, unknown> = { text: parentText }
  if (mediaId) parentParams.media = { media_ids: [mediaId] }

  const parentResult = await client.v2.tweet(parentParams)
  const parentId = parentResult.data.id
  process.stdout.write(`[parent] https://twitter.com/i/web/status/${parentId}\n`)

  // Chain replies
  let lastId = parentId
  for (let i = 0; i < replies.length; i++) {
    await new Promise((r) => setTimeout(r, 2000))

    const text = replies[i]
    const weighted = getTwitterWeightedLength(text)

    if (weighted > 280) {
      process.stdout.write(`[reply ${i + 1}] SKIP: ${weighted} chars exceeds 280\n`)
      continue
    }

    const result = await client.v2.tweet({
      text,
      reply: { in_reply_to_tweet_id: lastId },
    })
    lastId = result.data.id
    process.stdout.write(`[reply ${i + 1}] https://twitter.com/i/web/status/${lastId}\n`)
  }

  return `https://twitter.com/i/web/status/${parentId}`
}

// ============================================================
// Main: Determine which type to post
// ============================================================

async function main(): Promise<void> {
  const type = process.env.WEEKLY_POST_TYPE || 'both'
  const week = getThisWeekRange()
  process.stdout.write(`Week: ${week.label}\n`)
  process.stdout.write(`Type: ${type}\n`)

  if (type === 'claude-code' || type === 'both') {
    await postClaudeCodeUpdate(week)
  }

  if (type === 'ai-news' || type === 'both') {
    await postAINews(week)
  }
}

async function postClaudeCodeUpdate(week: ReturnType<typeof getThisWeekRange>): Promise<void> {
  process.stdout.write('\n=== Claude Code Weekly Update ===\n')

  // Research
  process.stdout.write('[research] Fetching Claude Code updates...\n')
  const raw = await researchClaudeCodeUpdates(week)

  let data: any
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    data = JSON.parse(jsonMatch?.[0] ?? '{}')
  } catch {
    process.stdout.write(`[research] Failed to parse: ${raw.slice(0, 200)}\n`)
    return
  }

  if (!data.versions?.length) {
    process.stdout.write('[research] No updates this week\n')
    return
  }

  // Build infographic prompt
  const versionBlocks = data.versions.map((v: any) =>
    `■ ${v.version}（${v.date}）\n${v.highlights.map((h: string) => `・${h}`).join('\n')}`
  ).join('\n\n')

  const infraPrompt = `以下の情報を元に、1200x630pxの図解インフォグラフィックを1枚生成してください。

【テーマ】
Claude Code 週間アップデート（${week.label}）

【内容】
${versionBlocks}

【デザイン指示】
- 背景: ダークグラデーション（#1a1a2e → #0f3460）
- テキスト色: 白 #FFFFFF
- アクセントカラー: #D97757（Claudeオレンジ）
- 上部タイトル「Claude Code 週間アップデート」
- 下部に「${week.label}」
- ゴシック体、太字、視認性最優先
- クリーン＆モダン
- 日本語メイン
- 写真やイラスト不要`

  process.stdout.write('[infographic] Generating...\n')
  const imageBuffer = await generateInfographic(infraPrompt)
  await uploadToSupabase(imageBuffer, 'cc-weekly')

  const mediaId = await uploadMediaToX(imageBuffer, 'image/png')
  if (!mediaId) throw new Error('Media upload failed')

  // Build tweets
  const parentText = `🔥 Claude Code 週間アップデート (${week.label})\n\n${data.summary}\n\n図解で詳細チェック👇\n#ClaudeCode #AI #Anthropic`

  const replies: string[] = []
  for (const v of data.versions) {
    const highlights = v.highlights.map((h: string) => `・${h}`).join('\n')
    replies.push(`${v.version} (${v.date})\n\n${highlights}\n\n${v.one_liner}`)
  }

  // Add opinion as last reply
  if (data.opinion) {
    const opinionText = `💭 個人的な所感\n\n${data.opinion}\n\n${data.source_urls?.[0] ?? ''}`
    replies.push(opinionText)
  }

  // CORTEX Review: 重複排除 + ナレッジ最適化
  try {
    const { cortexReview } = await import('../lib/cortex/review/pre-post-reviewer')
    const candidates = [
      { text: parentText, platform: 'x' },
      ...replies.map(r => ({ text: r, platform: 'x' })),
    ]
    const reviewed = await cortexReview(candidates)
    const dominated = reviewed.filter(r => r.duplicate_of || r.is_stale)
    if (dominated.length > reviewed.length / 2) {
      process.stdout.write(`[cortex] ${dominated.length}/${reviewed.length} candidates rejected, skipping post\n`)
      return
    }
    process.stdout.write(`[cortex] Review passed: ${reviewed.length - dominated.length}/${reviewed.length} approved\n`)
  } catch (e) {
    process.stdout.write(`[cortex] Review failed (continuing anyway): ${e instanceof Error ? e.message : e}\n`)
  }

  const threadUrl = await postChainThread(parentText, replies, mediaId)
  process.stdout.write(`[done] ${threadUrl}\n`)

  // Record analytics
  try {
    const { savePostAnalytics } = await import('../lib/slack-bot/memory')
    const parentId = threadUrl.split('/status/')[1]
    if (parentId) {
      await savePostAnalytics({
        tweetId: parentId,
        tweetUrl: threadUrl,
        postText: parentText,
        postMode: 'pattern',
        postType: 'thread',
        tags: ['weekly-update', 'claude-code'],
      })
    }
  } catch (e) {
    process.stdout.write(`[analytics] Failed to save: ${e instanceof Error ? e.message : e}\n`)
  }
}

async function postAINews(week: ReturnType<typeof getThisWeekRange>): Promise<void> {
  process.stdout.write('\n=== AI Industry Weekly News ===\n')

  // Research
  process.stdout.write('[research] Fetching AI news...\n')
  const raw = await researchAINews(week)

  let data: any
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    data = JSON.parse(jsonMatch?.[0] ?? '{}')
  } catch {
    process.stdout.write(`[research] Failed to parse: ${raw.slice(0, 200)}\n`)
    return
  }

  if (!data.stories?.length) {
    process.stdout.write('[research] No stories found\n')
    return
  }

  // Build infographic
  const itemBlocks = (data.infographic_items ?? data.stories).map((item: any, i: number) =>
    `${i + 1}. ${item.label ?? item.headline}\n${item.description ?? item.company}`
  ).join('\n\n')

  const infraPrompt = `以下の情報を元に、1200x630pxの図解インフォグラフィックを1枚生成してください。

【テーマ】
AI業界 週間ニュース TOP5（${week.label}）

【内容】
${itemBlocks}

【デザイン指示】
- 背景: ダークグラデーション（#0a0a1a → #1a0a2e）
- テキスト色: 白 #FFFFFF
- アクセントカラー: #4A9EFF（青）と #FF4A6E（赤）
- 上部タイトル「AI業界 週間ニュース TOP5」
- 下部に「${week.label}」
- ゴシック体、太字、視認性最優先
- モダンなニュースメディア風
- 日本語メイン
- 写真やイラスト不要`

  process.stdout.write('[infographic] Generating...\n')
  const imageBuffer = await generateInfographic(infraPrompt)
  await uploadToSupabase(imageBuffer, 'ai-news-weekly')

  const mediaId = await uploadMediaToX(imageBuffer, 'image/png')
  if (!mediaId) throw new Error('Media upload failed')

  // Build tweets
  const parentText = `🔥 AI業界 今週のニュースTOP5 (${week.label})\n\n${data.summary}\n\n図解でまとめました👇\n#AI #人工知能 #テック`

  const replies: string[] = []
  for (const story of data.stories) {
    const url = story.source_url ? `\n\n${story.source_url}` : ''
    replies.push(`${story.headline}\n\n${story.body}${url}`)
  }

  // Add opinion as last reply
  if (data.opinion) {
    replies.push(`💭 個人的な所感\n\n${data.opinion}`)
  }

  // CORTEX Review: 重複排除 + ナレッジ最適化
  try {
    const { cortexReview } = await import('../lib/cortex/review/pre-post-reviewer')
    const candidates = [
      { text: parentText, platform: 'x' },
      ...replies.map(r => ({ text: r, platform: 'x', sourceUrl: r.match(/https?:\/\/\S+/)?.[0] })),
    ]
    const reviewed = await cortexReview(candidates)
    const dominated = reviewed.filter(r => r.duplicate_of || r.is_stale)
    if (dominated.length > reviewed.length / 2) {
      process.stdout.write(`[cortex] ${dominated.length}/${reviewed.length} candidates rejected, skipping post\n`)
      return
    }
    process.stdout.write(`[cortex] Review passed: ${reviewed.length - dominated.length}/${reviewed.length} approved\n`)
  } catch (e) {
    process.stdout.write(`[cortex] Review failed (continuing anyway): ${e instanceof Error ? e.message : e}\n`)
  }

  const threadUrl = await postChainThread(parentText, replies, mediaId)
  process.stdout.write(`[done] ${threadUrl}\n`)

  // Record analytics
  try {
    const { savePostAnalytics } = await import('../lib/slack-bot/memory')
    const parentId = threadUrl.split('/status/')[1]
    if (parentId) {
      await savePostAnalytics({
        tweetId: parentId,
        tweetUrl: threadUrl,
        postText: parentText,
        postMode: 'pattern',
        postType: 'thread',
        tags: ['weekly-update', 'ai-news'],
      })
    }
  } catch (e) {
    process.stdout.write(`[analytics] Failed to save: ${e instanceof Error ? e.message : e}\n`)
  }
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e instanceof Error ? e.message : e}\n`)
  process.exit(1)
})
