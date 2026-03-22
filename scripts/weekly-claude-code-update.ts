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

// ============================================================
// Date Helpers
// ============================================================

function getThisWeekRange(): { start: string; end: string; label: string } {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diffToMonday)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)

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

async function researchClaudeCodeUpdates(weekRange: { start: string; end: string }): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `Claude Codeの今週（${weekRange.start}〜${weekRange.end}）のアップデート情報をまとめてください。

以下のソースを確認してください:
- https://docs.anthropic.com/en/docs/claude-code/changelog
- https://github.com/anthropics/claude-code/releases
- https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md

以下の形式で出力してください（JSON）:

{
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
}

注意:
- 今週のリリースのみ含めること（先週以前のものは除外）
- 各バージョンのハイライトは日本語で簡潔に（各15文字以内）
- 情報が見つからない場合は versions を空配列にして summary に「今週はリリースなし」と記載`,
    }],
  })

  const text = response.content.find((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
  return text?.text ?? '{}'
}

// ============================================================
// Research AI Industry News with Claude (web search)
// ============================================================

async function researchAINews(weekRange: { start: string; end: string }): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `今週（${weekRange.start}〜${weekRange.end}）のAI業界の重大ニュースTOP5をまとめてください。

条件:
- 必ず今週発表・公開された情報のみ（古い情報は絶対に混ぜない）
- 公式発表、プレスリリース、信頼できるニュースソースに基づくこと
- 可能であればX(Twitter)の公式アカウントの投稿URLを含める
- バズりやすい（議論を呼ぶ、驚き、影響が大きい）ニュースを優先

以下の形式で出力してください（JSON）:

{
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
    {
      "label": "短い見出し（10文字以内）",
      "description": "補足説明（15文字以内）"
    }
  ]
}

注意:
- 日付の正確性が最重要。今週以外の情報を含めたら致命的
- OpenAI, Google, Anthropic, Meta, NVIDIA等の大手の動向を優先
- 日本のテック層に刺さる内容を優先`,
    }],
  })

  const text = response.content.find((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
  return text?.text ?? '{}'
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

  const threadUrl = await postChainThread(parentText, replies, mediaId)
  process.stdout.write(`[done] ${threadUrl}\n`)
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

  const threadUrl = await postChainThread(parentText, replies, mediaId)
  process.stdout.write(`[done] ${threadUrl}\n`)
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e instanceof Error ? e.message : e}\n`)
  process.exit(1)
})
