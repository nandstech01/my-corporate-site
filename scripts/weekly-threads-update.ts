/**
 * Weekly Threads Thread — Claude Code Update + AI News
 *
 * Same research as X version, but optimized for Threads audience:
 * - More casual, conversational tone
 * - Longer text allowed (500 chars per post)
 * - Emoji-rich, visual-friendly
 * - Chain-style self-replies
 *
 * Usage: npx dotenv-cli -e .env.local -- npx tsx scripts/weekly-threads-update.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { postThreadsChain } from '../lib/threads-api/client'
import { multiSearch } from '../lib/web-search/brave'

// ============================================================
// Date Helpers
// ============================================================

function getThisWeekRange(): { start: string; end: string; label: string } {
  const now = new Date()
  // Always look at the most recently completed Mon-Fri week
  // Go back to find last Friday, then derive Monday from that
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
// Research with Claude (Threads-optimized output)
// ============================================================

async function searchAndCollect(
  type: 'claude-code' | 'ai-news',
  weekRange: { start: string; end: string },
): Promise<string> {
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
        'AI startup funding acquisition March 2026',
      ]

  const results = await multiSearch(queries, { count: 10, freshness: 'pw' })
  process.stdout.write(`[search] Found ${results.length} results\n`)

  // Format search results for Claude
  const searchContext = results
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.description}`)
    .join('\n\n')

  return searchContext
}

async function researchForThreads(
  type: 'claude-code' | 'ai-news',
  weekRange: { start: string; end: string },
): Promise<string> {
  // Step 1: Web search for real-time data
  const searchContext = await searchAndCollect(type, weekRange)

  if (!searchContext) {
    return '{}'
  }

  // Step 2: Claude summarizes search results
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const topicInstruction = type === 'claude-code'
    ? `以下のWeb検索結果から、Claude Codeの今週（${weekRange.start}〜${weekRange.end}）のアップデート情報を抽出してまとめてください。`
    : `以下のWeb検索結果から、今週（${weekRange.start}〜${weekRange.end}）のAI業界の重大ニュースTOP5を抽出してまとめてください。
条件: 検索結果に含まれる情報のみ使用。推測や古い情報は絶対に混ぜないこと。各ニュースのソースURLを必ず含めること。`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `${topicInstruction}

## Web検索結果
${searchContext}

---

**Threads向けに最適化した出力をお願いします。**

Threadsの特徴:
- 1投稿500文字まで
- カジュアルで親しみやすいトーン
- 絵文字を自然に使う
- 専門用語は噛み砕く
- 「へぇ〜」「これすごい」的な驚きを演出

以下のJSON形式で出力（JSONのみ、他のテキストは不要）:

{
  "parent_text": "最初の投稿（図解画像と一緒に投稿される、150文字以内、キャッチーに）",
  "replies": [
    "各トピックの詳細（1投稿400文字以内、カジュアルなトーン、ソースURL付き）"
  ],
  "opinion": "個人的な所感（200文字以内、エンジニアの本音っぽく）",
  "infographic_title": "図解のタイトル（15文字以内）",
  "infographic_items": [
    {"label": "短見出し（10文字以内）", "desc": "補足（15文字以内）"}
  ]
}`,
    }],
  })

  const text = response.content.find((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
  return text?.text ?? '{}'
}

// ============================================================
// Gemini Infographic
// ============================================================

async function generateInfographic(title: string, items: readonly { label: string; desc: string }[], accentColor: string): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' })

  const itemBlocks = items.map((item, i) => `${i + 1}. ${item.label}\n${item.desc}`).join('\n\n')

  const prompt = `以下の情報を元に、1080x1080pxの正方形インフォグラフィックを生成してください。
（Threads/Instagram向けの正方形フォーマット）

【タイトル】${title}

【内容】
${itemBlocks}

【デザイン指示】
- 背景: ダークグラデーション
- テキスト色: 白
- アクセントカラー: ${accentColor}
- ゴシック体、太字、視認性最優先
- モダン＆クリーン
- 日本語メイン
- 写真やイラスト不要
- 正方形（1:1）アスペクト比`

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
  throw new Error('No image from Gemini')
}

async function uploadToSupabase(buffer: Buffer, prefix: string): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')

  const supabase = createClient(url, key)
  const ts = Date.now()
  const rand = Math.random().toString(36).substring(2, 8)
  const filePath = `images/threads/${prefix}-${ts}-${rand}.png`

  const { error } = await supabase.storage
    .from('blog')
    .upload(filePath, buffer, { contentType: 'image/png', cacheControl: '31536000', upsert: false })
  if (error) throw new Error(`Supabase: ${error.message}`)

  return supabase.storage.from('blog').getPublicUrl(filePath).data.publicUrl
}

// ============================================================
// Main
// ============================================================

async function postThread(
  type: 'claude-code' | 'ai-news',
  week: ReturnType<typeof getThisWeekRange>,
): Promise<void> {
  const label = type === 'claude-code' ? 'Claude Code Update' : 'AI News'
  process.stdout.write(`\n=== Threads: ${label} ===\n`)

  // Research
  process.stdout.write('[research] Fetching...\n')
  const raw = await researchForThreads(type, week)

  let data: any
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    data = JSON.parse(jsonMatch?.[0] ?? '{}')
  } catch {
    process.stdout.write(`[research] Parse failed: ${raw.slice(0, 200)}\n`)
    return
  }

  if (!data.replies?.length) {
    process.stdout.write('[research] No content\n')
    return
  }

  // Infographic
  const accentColor = type === 'claude-code' ? '#D97757' : '#4A9EFF'
  const infraTitle = data.infographic_title ?? label
  const infraItems = data.infographic_items ?? [{ label: label, desc: week.label }]

  process.stdout.write('[infographic] Generating...\n')
  const imageBuffer = await generateInfographic(infraTitle, infraItems, accentColor)
  const imageUrl = await uploadToSupabase(imageBuffer, `threads-${type}`)
  process.stdout.write(`[infographic] ${imageUrl}\n`)

  // Build replies with opinion at end
  const replies = [...data.replies]
  if (data.opinion) {
    replies.push(`💭 ${data.opinion}`)
  }

  // Post chain
  const result = await postThreadsChain({
    parentText: data.parent_text,
    parentImageUrl: imageUrl,
    replies,
  })

  process.stdout.write(`[done] Parent: ${result.parentUrl ?? 'N/A'}, Replies: ${result.replyCount}\n`)
  if (result.errors.length > 0) {
    process.stdout.write(`[errors] ${result.errors.join('; ')}\n`)
  }
}

async function main(): Promise<void> {
  const type = process.env.WEEKLY_POST_TYPE || 'both'
  const week = getThisWeekRange()
  process.stdout.write(`Week: ${week.label}, Type: ${type}\n`)

  if (type === 'claude-code' || type === 'both') {
    await postThread('claude-code', week)
  }

  if (type === 'ai-news' || type === 'both') {
    await postThread('ai-news', week)
  }
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e instanceof Error ? e.message : e}\n`)
  process.exit(1)
})
