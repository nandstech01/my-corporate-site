/**
 * AI Judge Core Engine
 *
 * Claude API (Tool Use) を使った投稿品質審査。
 * 1. 決定論的セーフティチェック
 * 2. コンテキスト取得（エンゲージメント・パターン）
 * 3. LLM判定
 * 4. DB記録
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { AI_JUDGE_MAX_TOKENS, AI_JUDGE_MODEL, TOPIC_RELEVANCE_THRESHOLD } from './config'
import { runSafetyChecks } from './safety-checks'
import type { JudgeVerdict, Platform, PostCandidate } from './types'
import { recallMemories } from '../slack-bot/memory'

// ============================================================
// Supabase Client
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  return createClient(url, key)
}

// ============================================================
// Anthropic Client
// ============================================================

function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required')
  return new Anthropic({ apiKey })
}

// ============================================================
// Post Context (engagement data + patterns)
// ============================================================

interface PostContext {
  readonly avgEngagementRate: number | null
  readonly topPatterns: readonly string[]
  readonly recentPostCount: number
}

async function getPostContext(platform: Platform): Promise<PostContext> {
  try {
    const supabase = getSupabase()
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const tableMap: Record<Platform, string> = {
      x: 'x_post_analytics',
      linkedin: 'linkedin_post_analytics',
      instagram: 'instagram_post_analytics',
      threads: 'threads_post_analytics',
    }
    const table = tableMap[platform]

    const { data, error } = await supabase
      .from(table)
      .select('engagement_rate, pattern_used, posted_at')
      .gte('posted_at', since)
      .order('posted_at', { ascending: false })
      .limit(50)

    if (error || !data || data.length === 0) {
      return { avgEngagementRate: null, topPatterns: [], recentPostCount: 0 }
    }

    const postsWithEngagement = data.filter(
      (row: { engagement_rate: number | null }) => row.engagement_rate !== null,
    )

    const avgEngagementRate =
      postsWithEngagement.length > 0
        ? postsWithEngagement.reduce(
            (sum: number, row: { engagement_rate: number | null }) =>
              sum + (row.engagement_rate ?? 0),
            0,
          ) / postsWithEngagement.length
        : null

    const patternCounts = new Map<string, number>()
    for (const row of data) {
      const pattern = (row as { pattern_used: string | null }).pattern_used
      if (pattern) {
        const count = patternCounts.get(pattern) ?? 0
        patternCounts.set(pattern, count + 1)
      }
    }

    const topPatterns = Array.from(patternCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pattern]) => pattern)

    return {
      avgEngagementRate,
      topPatterns,
      recentPostCount: data.length,
    }
  } catch {
    return { avgEngagementRate: null, topPatterns: [], recentPostCount: 0 }
  }
}

// ============================================================
// Claude API Tool Definition
// ============================================================

const SUBMIT_VERDICT_TOOL: Anthropic.Messages.Tool = {
  name: 'submit_verdict',
  description: 'Submit the evaluation verdict for the post',
  input_schema: {
    type: 'object' as const,
    properties: {
      decision: {
        type: 'string',
        enum: ['approve', 'edit', 'reject'],
        description: 'The evaluation decision',
      },
      confidence: {
        type: 'number',
        description: 'Confidence level between 0 and 1',
      },
      reasoning: {
        type: 'string',
        description: 'Judgment reasoning in Japanese',
      },
      edit_suggestion: {
        type: 'string',
        description: 'Suggested edit if decision is edit',
      },
      safety_flags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Safety flags found during evaluation',
      },
      topic_relevance: {
        type: 'number',
        description: 'Topic relevance score between 0 and 1',
      },
    },
    required: ['decision', 'confidence', 'reasoning', 'safety_flags', 'topic_relevance'],
  },
}

// ============================================================
// High Performer Learnings (学習ループ閉鎖)
// ============================================================

async function getHighPerformerSummary(platform: Platform): Promise<string | null> {
  try {
    const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
    if (!userId) return null

    const memories = await recallMemories({
      slackUserId: userId,
      query: `${platform} high performing post`,
      memoryType: 'fact',
      limit: 5,
    })

    const platformMemories = memories.filter((m) => {
      const ctx = m.context as Record<string, unknown> | undefined
      return ctx?.platform === platform
    })

    if (platformMemories.length === 0) return null

    return platformMemories
      .map((m) => `- ${m.content.slice(0, 150)}`)
      .join('\n')
  } catch {
    return null
  }
}

// ============================================================
// System Prompt Builder
// ============================================================

function buildSystemPrompt(platform: Platform, context: PostContext, learnings?: string | null): string {
  const platformGuidelines: Record<Platform, string> = {
    x: '- 標準280文字 / Premium最大25,000文字\n- ハッシュタグは0-1個推奨\n- 議論を促すフックがあると良い\n- リンクは短縮URLを推奨',
    linkedin:
      '- プロフェッショナルなトーン\n- 3000文字以内\n- インサイトや学びを含める\n- CTAを含めるとエンゲージメント向上',
    instagram:
      '- ビジュアルコンテンツとの一貫性\n- 2200文字以内\n- ハッシュタグは5-10個推奨\n- ストーリー性のある構成',
    threads:
      '- 会話型・カジュアルなトーン\n- 500文字以内\n- 問いかけや意見でスレッドを誘発\n- ハッシュタグは1-2個推奨',
  }

  const contextLines: string[] = []

  if (context.avgEngagementRate !== null) {
    contextLines.push(
      `過去30日間の平均エンゲージメント率: ${(context.avgEngagementRate * 100).toFixed(2)}%`,
    )
  }

  if (context.topPatterns.length > 0) {
    contextLines.push(`高パフォーマンスパターン: ${context.topPatterns.join(', ')}`)
  }

  if (context.recentPostCount > 0) {
    contextLines.push(`直近30日間の投稿数: ${context.recentPostCount}件`)
  }

  // 高パフォーマンス投稿の特徴を注入（学習ループ閉鎖）
  if (learnings) {
    contextLines.push(`過去の高パフォーマンス投稿の特徴:\n${learnings}`)
  }

  const contextSection =
    contextLines.length > 0
      ? `\n\nパフォーマンスコンテキスト:\n${contextLines.join('\n')}`
      : ''

  return `あなたはnands.techのSNS投稿品質審査AIです。
nands.techはAI/LLM/自動化に特化した技術メディアです。

評価基準:
1. ブランド安全性 - nands.techのブランドに適切か
2. コンテンツ品質 - 内容が正確で価値があるか
3. AI関連度 - AI/LLM/自動化のトピックに関連しているか (${TOPIC_RELEVANCE_THRESHOLD}未満は自動却下)
4. エンゲージメント可能性 - 議論を促す構造になっているか
5. ソース信頼性 - 引用元が信頼できるか

${platform}での投稿を評価してください。

プラットフォームガイドライン (${platform}):
${platformGuidelines[platform]}${contextSection}

submit_verdict ツールを使って評価結果を返してください。判断理由は日本語で記述してください。`
}

// ============================================================
// User Prompt Builder
// ============================================================

function buildUserPrompt(
  post: PostCandidate,
  safetyFlags: readonly string[],
): string {
  // 投稿タイプを明示（AI Judgeが適切な基準で評価するため）
  const postTypeLabels: string[] = []
  if (post.longForm) postTypeLabels.push('Premium長文記事（25,000文字まで許容）')
  if (post.quoteTweetId) postTypeLabels.push(`引用RT（元ツイート: ${post.quoteTweetId}）`)
  if (post.threadSegments) postTypeLabels.push(`スレッド（${post.threadSegments.length}ツイート）`)

  const parts: string[] = []

  if (postTypeLabels.length > 0) {
    parts.push(`投稿タイプ: ${postTypeLabels.join(' + ')}`)
  }

  parts.push(`投稿テキスト:\n${post.text}`)

  if (post.sourceUrl) {
    parts.push(`ソースURL: ${post.sourceUrl}`)
  }

  if (post.sourceTitle) {
    parts.push(`ソースタイトル: ${post.sourceTitle}`)
  }

  if (post.patternUsed) {
    parts.push(`使用パターン: ${post.patternUsed}`)
  }

  if (post.tags && post.tags.length > 0) {
    parts.push(`タグ: ${post.tags.join(', ')}`)
  }

  if (safetyFlags.length > 0) {
    parts.push(`セーフティチェック結果:\n${safetyFlags.map((f) => `- ${f}`).join('\n')}`)
  }

  parts.push('この投稿を評価し、submit_verdictツールで結果を返してください。')

  return parts.join('\n\n')
}

// ============================================================
// Parse Verdict from Claude Response
// ============================================================

function parseVerdictFromResponse(response: Anthropic.Messages.Message): JudgeVerdict {
  const toolUseBlock = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use',
  )

  if (!toolUseBlock || toolUseBlock.name !== 'submit_verdict') {
    throw new Error('Claude did not return a submit_verdict tool call')
  }

  const input = toolUseBlock.input as {
    decision: 'approve' | 'edit' | 'reject'
    confidence: number
    reasoning: string
    edit_suggestion?: string
    safety_flags: string[]
    topic_relevance: number
  }

  return {
    decision: input.decision,
    confidence: Math.max(0, Math.min(1, input.confidence)),
    reasoning: input.reasoning,
    editSuggestion: input.edit_suggestion,
    safetyFlags: input.safety_flags,
    topicRelevance: Math.max(0, Math.min(1, input.topic_relevance)),
  }
}

// ============================================================
// DB Logging
// ============================================================

async function logDecision(
  post: PostCandidate,
  verdict: JudgeVerdict,
  latencyMs: number,
): Promise<void> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('ai_judge_decisions').insert({
      pending_action_id: post.pendingActionId ?? null,
      platform: post.platform,
      post_text: post.text,
      decision: verdict.decision,
      confidence: verdict.confidence,
      reasoning: verdict.reasoning,
      safety_flags: verdict.safetyFlags,
      edit_suggestion: verdict.editSuggestion ?? null,
      topic_relevance: verdict.topicRelevance,
      auto_resolved: false,
      model_used: AI_JUDGE_MODEL,
      latency_ms: latencyMs,
    })
    if (error) {
      process.stderr.write(`[AI Judge] logDecision error: ${error.message}\n`)
    }
  } catch (err) {
    process.stderr.write(
      `[AI Judge] logDecision exception: ${err instanceof Error ? err.message : String(err)}\n`,
    )
  }
}

// ============================================================
// Main Entry Point
// ============================================================

export async function judgePost(post: PostCandidate): Promise<JudgeVerdict> {
  const startTime = Date.now()

  // 1. Run deterministic safety checks
  const safetyResult = await runSafetyChecks(post)

  // 2. If hard-blocked by safety, return early
  if (safetyResult.blockedReason) {
    const verdict: JudgeVerdict = {
      decision: 'reject',
      confidence: 0.95,
      reasoning: `セーフティチェックにより拒否: ${safetyResult.blockedReason}`,
      safetyFlags: [...safetyResult.flags],
      topicRelevance: 0,
    }
    const latencyMs = Date.now() - startTime
    await logDecision(post, verdict, latencyMs)
    return verdict
  }

  // 3. Fetch context data + learnings (best-effort)
  const [context, learnings] = await Promise.all([
    getPostContext(post.platform),
    getHighPerformerSummary(post.platform).catch(() => null),
  ])

  // 4. Call Claude API
  const anthropic = getAnthropic()
  const systemPrompt = buildSystemPrompt(post.platform, context, learnings)
  const userPrompt = buildUserPrompt(post, safetyResult.flags)

  const response = await anthropic.messages.create({
    model: AI_JUDGE_MODEL,
    max_tokens: AI_JUDGE_MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    tools: [SUBMIT_VERDICT_TOOL],
    tool_choice: { type: 'tool', name: 'submit_verdict' },
  })

  const verdict = parseVerdictFromResponse(response)

  // 5. Log decision to DB
  const latencyMs = Date.now() - startTime
  await logDecision(post, verdict, latencyMs)

  // 6. Return verdict
  return verdict
}
