/**
 * ブログ自動承認 AI Judge
 *
 * buzz_score高 + AI関連 + 高信頼度 → 自動生成承認。
 * 1日1件まで。
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { AI_JUDGE_MODEL, AI_JUDGE_MAX_TOKENS } from './config'
import { notifyBlogAutoGeneration } from './slack-notifier'

// ============================================================
// Constants
// ============================================================

const MAX_BLOGS_PER_DAY = 1
const BLOG_BUZZ_SCORE_THRESHOLD = 45
const BLOG_JUDGE_CONFIDENCE_THRESHOLD = 0.9

// ============================================================
// Supabase Client
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
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
// Daily Blog Count
// ============================================================

async function getTodayBlogCount(): Promise<number> {
  const supabase = getSupabase()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('blog_topic_queue')
    .select('id', { count: 'exact', head: true })
    .not('auto_approved_at', 'is', null)
    .gte('auto_approved_at', todayStart.toISOString())

  if (error) {
    throw new Error(`Failed to get today's blog count: ${error.message}`)
  }

  return count ?? 0
}

// ============================================================
// AI Relevance Check (simplified)
// ============================================================

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'deep learning',
  'llm', 'large language model', 'gpt', 'claude', 'anthropic', 'openai',
  'transformer', 'neural', 'generative', 'chatbot', 'agent',
  '人工知能', '機械学習', '深層学習', '生成ai', 'rag',
]

function isAiRelevant(title: string, topic?: string): boolean {
  const text = `${title} ${topic ?? ''}`.toLowerCase()
  const matchCount = AI_KEYWORDS.filter((kw) => text.includes(kw)).length
  return matchCount >= 1
}

// ============================================================
// Claude Tool Definition
// ============================================================

const SUBMIT_BLOG_VERDICT_TOOL: Anthropic.Messages.Tool = {
  name: 'submit_blog_verdict',
  description: 'Submit the evaluation verdict for the blog topic',
  input_schema: {
    type: 'object' as const,
    properties: {
      decision: {
        type: 'string',
        enum: ['approve', 'reject'],
        description: 'Whether to approve this topic for blog generation',
      },
      confidence: {
        type: 'number',
        description: 'Confidence level between 0 and 1',
      },
      reasons: {
        type: 'array',
        items: { type: 'string' },
        description: 'Reasons for the decision in Japanese',
      },
    },
    required: ['decision', 'confidence', 'reasons'],
  },
}

// ============================================================
// Judge Blog Topic
// ============================================================

interface BlogTopicRow {
  readonly id: string
  readonly source_title: string
  readonly source_url: string
  readonly source_feed: string
  readonly suggested_topic: string | null
  readonly suggested_keyword: string | null
  readonly buzz_score: number
}

interface BlogVerdict {
  readonly decision: 'approve' | 'reject'
  readonly confidence: number
  readonly reasons: readonly string[]
}

async function judgeBlogTopic(topic: BlogTopicRow): Promise<BlogVerdict> {
  const anthropic = getAnthropic()

  const systemPrompt = `あなたはnands.techのブログトピック審査AIです。
nands.techはAI/LLM/自動化に特化した技術メディアです。

以下の基準でトピックを評価してください:
1. AI/LLM/自動化との関連度
2. 読者への価値と新規性
3. ソースの信頼性
4. ブログ記事としての適切性

submit_blog_verdict ツールを使って評価結果を返してください。`

  const userPrompt = [
    `ソースタイトル: ${topic.source_title}`,
    `ソースフィード: ${topic.source_feed}`,
    `ソースURL: ${topic.source_url}`,
    `推奨トピック: ${topic.suggested_topic ?? 'N/A'}`,
    `推奨キーワード: ${topic.suggested_keyword ?? 'N/A'}`,
    `バズスコア: ${topic.buzz_score}/100`,
    '',
    'このトピックでブログ記事を自動生成すべきか評価してください。',
  ].join('\n')

  const response = await anthropic.messages.create({
    model: AI_JUDGE_MODEL,
    max_tokens: AI_JUDGE_MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    tools: [SUBMIT_BLOG_VERDICT_TOOL],
    tool_choice: { type: 'tool', name: 'submit_blog_verdict' },
  })

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use',
  )

  if (!toolUseBlock || toolUseBlock.name !== 'submit_blog_verdict') {
    throw new Error('Claude did not return a submit_blog_verdict tool call')
  }

  const input = toolUseBlock.input as {
    decision: 'approve' | 'reject'
    confidence: number
    reasons: string[]
  }

  return {
    decision: input.decision,
    confidence: Math.max(0, Math.min(1, input.confidence)),
    reasons: input.reasons,
  }
}

// ============================================================
// Main: Evaluate and Auto-Approve Blog
// ============================================================

export async function evaluateAndAutoApproveBlog(
  topic: BlogTopicRow,
): Promise<boolean> {
  // 1. Daily limit check
  const todayCount = await getTodayBlogCount()
  if (todayCount >= MAX_BLOGS_PER_DAY) {
    process.stdout.write(`Blog Judge: Daily limit reached (${todayCount}/${MAX_BLOGS_PER_DAY})\n`)
    return false
  }

  // 2. Buzz score check
  if (topic.buzz_score < BLOG_BUZZ_SCORE_THRESHOLD) {
    process.stdout.write(`Blog Judge: Buzz score too low (${topic.buzz_score} < ${BLOG_BUZZ_SCORE_THRESHOLD})\n`)
    return false
  }

  // 3. AI relevance check
  if (!isAiRelevant(topic.source_title, topic.suggested_topic ?? undefined)) {
    process.stdout.write(`Blog Judge: Topic not AI-relevant: "${topic.source_title}"\n`)
    return false
  }

  // 4. Claude evaluation
  const verdict = await judgeBlogTopic(topic)

  // 5. Record verdict in DB
  const supabase = getSupabase()

  await supabase
    .from('blog_topic_queue')
    .update({
      judge_action: verdict.decision,
      judge_confidence: verdict.confidence,
      judge_reasons: verdict.reasons,
    })
    .eq('id', topic.id)

  // 6. Auto-approve if confidence meets threshold
  if (verdict.decision === 'approve' && verdict.confidence >= BLOG_JUDGE_CONFIDENCE_THRESHOLD) {
    await supabase
      .from('blog_topic_queue')
      .update({
        status: 'approved',
        auto_approved_at: new Date().toISOString(),
      })
      .eq('id', topic.id)

    // Notify Slack
    try {
      await notifyBlogAutoGeneration({
        topic: topic.source_title,
        confidence: verdict.confidence,
        reasons: verdict.reasons,
        sourceUrl: topic.source_url,
      })
    } catch {
      // Best-effort notification
    }

    process.stdout.write(`Blog Judge: Auto-approved "${topic.source_title}" (confidence: ${verdict.confidence.toFixed(2)})\n`)
    return true
  }

  process.stdout.write(`Blog Judge: Not auto-approved "${topic.source_title}" (${verdict.decision}, confidence: ${verdict.confidence.toFixed(2)})\n`)
  return false
}
