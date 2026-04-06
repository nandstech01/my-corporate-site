/**
 * Viral Repost Detector
 *
 * Monitors key AI accounts via Brave Search for recent viral tweets,
 * generates Japanese quote-tweet drafts with infographic,
 * and sends to Slack for approval.
 *
 * Zero additional cost — uses existing Brave Search API + Claude API.
 *
 * Flow:
 *   1. Brave Search for recent tweets from key AI accounts
 *   2. Filter by engagement signals (viral indicators in descriptions)
 *   3. Claude generates Japanese quote-tweet draft
 *   4. Gemini generates infographic
 *   5. Slack notification for human approval
 *   6. On approval → quote tweet via X API
 */

import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { braveWebSearch } from '../../web-search/brave'
import { uploadMediaToX } from '../../x-api/media'
import { getTwitterClient } from '../../x-api/client'

// ============================================================
// Target Accounts & Keywords
// ============================================================

const TARGET_QUERIES = [
  // Key individual accounts
  'site:x.com/sama AI',
  'site:x.com/kaborosky Claude',
  'site:x.com/DrJimFan AI agent',
  'site:x.com/karpathy AI',
  'site:x.com/AndrewYNg AI',
  // Company accounts
  'site:x.com/OpenAI',
  'site:x.com/AnthropicAI',
  'site:x.com/GoogleDeepMind',
  'site:x.com/nvidia AI',
  // Viral AI content
  'site:x.com "Claude Code" viral',
  'site:x.com AI agent demo amazing',
  'site:x.com LLM breakthrough',
]

// ============================================================
// Types
// ============================================================

interface ViralCandidate {
  readonly tweetUrl: string
  readonly authorHandle: string
  readonly title: string
  readonly description: string
}

interface RepostDraft {
  readonly quoteText: string
  readonly tweetUrl: string
  readonly authorHandle: string
  readonly originalTitle: string
  readonly infographicPrompt: string
}

// ============================================================
// Supabase helpers
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key)
}

async function getRecentRepostUrls(days: number = 30): Promise<ReadonlySet<string>> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('x_post_analytics')
    .select('source_url')
    .gte('posted_at', since)
    .not('source_url', 'is', null)

  return new Set((data ?? []).map((r) => r.source_url as string).filter(Boolean))
}

async function hasAlreadyRepostedToday(): Promise<boolean> {
  const supabase = getSupabase()
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('slack_pending_actions')
    .select('id')
    .eq('action_type', 'viral_repost')
    .gte('created_at', todayStart.toISOString())
    .limit(1)

  return (data?.length ?? 0) > 0
}

// ============================================================
// Step 1: Search for viral tweets
// ============================================================

async function findViralCandidates(): Promise<readonly ViralCandidate[]> {
  const candidates: ViralCandidate[] = []
  const seenUrls = new Set<string>()
  const recentUrls = await getRecentRepostUrls(30)

  // Rotate through queries (pick 3-4 random ones per run to stay within API limits)
  const shuffled = [...TARGET_QUERIES].sort(() => Math.random() - 0.5)
  const selectedQueries = shuffled.slice(0, 4)

  for (const query of selectedQueries) {
    try {
      const results = await braveWebSearch(query, { count: 5, freshness: 'pd' })

      for (const r of results) {
        // Only X/Twitter URLs
        if (!r.url.includes('x.com/') && !r.url.includes('twitter.com/')) continue
        // Skip if already reposted
        if (recentUrls.has(r.url)) continue
        if (seenUrls.has(r.url)) continue
        seenUrls.add(r.url)

        // Extract author handle from URL
        const handleMatch = r.url.match(/(?:x\.com|twitter\.com)\/([^/]+)\/status/)
        if (!handleMatch) continue

        candidates.push({
          tweetUrl: r.url,
          authorHandle: handleMatch[1],
          title: r.title,
          description: r.description,
        })
      }
    } catch {
      // Best-effort per query
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return candidates
}

// ============================================================
// Step 2: Rank candidates by viral potential
// ============================================================

async function rankCandidates(
  candidates: readonly ViralCandidate[],
): Promise<readonly ViralCandidate[]> {
  if (candidates.length === 0) return []

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const candidateList = candidates
    .map((c, i) => `[${i}] @${c.authorHandle}: ${c.title}\n${c.description}\nURL: ${c.tweetUrl}`)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `以下のツイート候補から、日本のAI/テック層にとって最もインパクトがある上位3つを選んでください。

選定基準:
- 新しい発見・デモ・発表であること（既知の情報は除外）
- 驚きやインパクトがあること
- 日本のエンジニアが「これすごい」と思うこと

候補:
${candidateList}

回答は番号のみ（カンマ区切り）: 例 "0,3,5"`,
    }],
  })

  const text = response.content.find((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
  const indices = (text?.text ?? '')
    .match(/\d+/g)
    ?.map(Number)
    .filter((i) => i >= 0 && i < candidates.length) ?? []

  return indices.map((i) => candidates[i])
}

// ============================================================
// Step 3: Generate Japanese quote-tweet draft
// ============================================================

async function generateRepostDraft(
  candidate: ViralCandidate,
): Promise<RepostDraft> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `以下の海外AIツイートを、日本のテック層向けに引用ツイートするドラフトを作成してください。

元ツイート:
著者: @${candidate.authorHandle}
内容: ${candidate.title}
${candidate.description}

ルール:
- 日本語で書く
- 120文字以内（Xの加重文字数制限対応。日本語は2文字カウント）
- 単なる翻訳ではなく「なぜこれが重要か」「何が変わるのか」を具体的に書く
- 技術的な洞察や独自の視点を1つ以上入れる
- カジュアルだが知的なトーン。ラフで自然な日本語
- ハッシュタグ不要
- 絵文字は控えめに（最大1個）

NG例（こういう投稿は絶対禁止。情報価値ゼロでエンゲージメント0%になる）:
- 「これ見た？ヒューマノイドロボット」← 何がすごいか不明
- 「海外でバズってるこれ。AI」← 中身ゼロ
- 「えっ、Cursor…？これはやばい」← 何がやばいか書け
- 「AI、ついにこのレベルか…」← どのレベルだよ
- 「ここまで来たか…」← 何がどこまで来たか書け

OK例:
- 「Gemini 3.1、マルチモーダル推論がネイティブ統合されてAPIも即日公開か。開発者視点だとfunction callingの精度が実用になるかが勝負だな」
- 「OpenAIのSora API終了、推論コストが現実的じゃなかったと。動画生成AIは経済性の壁がまだ高い」

また、図解インフォグラフィック用のプロンプトも作成してください（正方形1080x1080、ダーク背景、日本語、要点を3-4個）。

JSON形式で回答:
{
  "quote_text": "引用ツイートの本文",
  "infographic_prompt": "図解生成プロンプト（日本語）"
}`,
    }],
  })

  const text = response.content.find((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
  const jsonMatch = (text?.text ?? '').match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch?.[0] ?? '{}')

  return {
    quoteText: parsed.quote_text ?? '',
    tweetUrl: candidate.tweetUrl,
    authorHandle: candidate.authorHandle,
    originalTitle: candidate.title,
    infographicPrompt: parsed.infographic_prompt ?? '',
  }
}

// ============================================================
// Step 4: Generate infographic
// ============================================================

async function generateInfographic(prompt: string): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) return null

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' })

    const fullPrompt = `${prompt}

デザイン指示:
- 1080x1080px正方形
- ダークグラデーション背景
- 白テキスト、アクセントカラー
- ゴシック体、太字、視認性最優先
- 日本語メイン
- 写真やイラスト不要`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
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
  } catch (e) {
    process.stdout.write(`[viral-repost] Infographic generation failed: ${e}\n`)
  }
  return null
}

async function uploadToSupabase(buffer: Buffer): Promise<string> {
  const supabase = getSupabase()
  const ts = Date.now()
  const rand = Math.random().toString(36).substring(2, 8)
  const path = `images/viral-repost/repost-${ts}-${rand}.png`

  const { error } = await supabase.storage
    .from('blog')
    .upload(path, buffer, { contentType: 'image/png', cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)

  return supabase.storage.from('blog').getPublicUrl(path).data.publicUrl
}

// ============================================================
// Step 5: Send to Slack for approval
// ============================================================

async function sendToSlackForApproval(
  draft: RepostDraft,
  imageUrl?: string,
  mediaId?: string,
): Promise<void> {
  const supabase = getSupabase()

  // Save as pending action
  const { data: inserted, error } = await supabase.from('slack_pending_actions').insert({
    slack_user_id: process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0] ?? 'system',
    action_type: 'viral_repost',
    payload: {
      quoteText: draft.quoteText,
      quoteTweetUrl: draft.tweetUrl,
      authorHandle: draft.authorHandle,
      originalTitle: draft.originalTitle,
      imageUrl,
      mediaIds: mediaId ? [mediaId] : [],
    },
    status: 'pending',
  }).select('id').single()

  if (error || !inserted) {
    process.stdout.write(`[viral-repost] Failed to save pending action: ${error?.message ?? 'no data'}\n`)
    return
  }

  const actionId = inserted.id as string

  // Post to Slack
  const slackToken = process.env.SLACK_BOT_TOKEN
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  if (!slackToken || !channel) return

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🔥 *バイラルリポスト候補*\n\n*元ツイート:* @${draft.authorHandle}\n${draft.originalTitle}\n${draft.tweetUrl}\n\n*引用ドラフト:*\n${draft.quoteText}`,
      },
    },
    ...(imageUrl ? [{
      type: 'image',
      image_url: imageUrl,
      alt_text: 'Infographic',
    }] : []),
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✅ 投稿する' },
          action_id: 'approve_viral_repost',
          value: actionId,
          style: 'primary',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '❌ スキップ' },
          action_id: 'reject_viral_repost',
          value: actionId,
          style: 'danger',
        },
      ],
    },
  ]

  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${slackToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel, blocks }),
  })
}

// ============================================================
// Main Export
// ============================================================

export async function runViralRepost(): Promise<void> {
  process.stdout.write('[viral-repost] Starting...\n')

  // Check if already reposted today
  if (await hasAlreadyRepostedToday()) {
    process.stdout.write('[viral-repost] Already reposted today, skipping\n')
    return
  }

  // Step 1: Find candidates
  process.stdout.write('[viral-repost] Searching for viral tweets...\n')
  const candidates = await findViralCandidates()
  process.stdout.write(`[viral-repost] Found ${candidates.length} candidates\n`)

  if (candidates.length === 0) {
    process.stdout.write('[viral-repost] No candidates found\n')
    return
  }

  // Step 2: Rank by viral potential
  process.stdout.write('[viral-repost] Ranking candidates...\n')
  const ranked = await rankCandidates(candidates)

  if (ranked.length === 0) {
    process.stdout.write('[viral-repost] No candidates passed ranking\n')
    return
  }

  const topCandidate = ranked[0]
  process.stdout.write(`[viral-repost] Top: @${topCandidate.authorHandle} — ${topCandidate.title}\n`)

  // Step 3: Generate quote-tweet draft
  process.stdout.write('[viral-repost] Generating draft...\n')
  const draft = await generateRepostDraft(topCandidate)

  if (!draft.quoteText) {
    process.stdout.write('[viral-repost] Draft generation failed\n')
    return
  }

  // Step 4: Generate infographic (best-effort)
  let imageUrl: string | undefined
  let mediaId: string | undefined

  if (draft.infographicPrompt) {
    process.stdout.write('[viral-repost] Generating infographic...\n')
    const imageBuffer = await generateInfographic(draft.infographicPrompt)

    if (imageBuffer) {
      imageUrl = await uploadToSupabase(imageBuffer)
      const uploaded = await uploadMediaToX(imageBuffer, 'image/png')
      if (uploaded) mediaId = uploaded
      process.stdout.write(`[viral-repost] Infographic: ${imageUrl}\n`)
    }
  }

  // Step 5: Send to Slack for approval
  process.stdout.write('[viral-repost] Sending to Slack for approval...\n')
  await sendToSlackForApproval(draft, imageUrl, mediaId)
  process.stdout.write('[viral-repost] Done! Waiting for approval in Slack.\n')
}
