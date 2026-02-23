/**
 * LangGraph 引用RT生成パイプライン
 *
 * 元ツイートを分析し、「要約」ではなく「実務家としての独自意見」を生成する。
 *
 * パイプライン:
 *   START → analyzeOriginal → formOpinion → generateCandidates
 *         → scoreCandidates → formatFinal → END
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { createClient } from '@supabase/supabase-js'
import { selectOpinionTemplate } from './opinion-templates'
import { getTwitterWeightedLength } from '../x-api/client'
import { X_TWITTER_RULES } from '../prompts/sns/x-twitter'

// ============================================================
// LangChain usage_metadata type helper
// ============================================================

interface LangChainUsageMetadata {
  readonly input_tokens: number
  readonly output_tokens: number
  readonly total_tokens: number
}

// ============================================================
// 型定義
// ============================================================

export interface QuoteGraphInput {
  readonly originalTweetId: string
  readonly originalText: string
  readonly originalAuthor: string
}

export interface QuoteGraphOutput {
  readonly quoteText: string
  readonly opinionTemplateUsed: string
  readonly scores: readonly QuoteCandidateScore[]
  readonly allCandidates: readonly string[]
  readonly promptTokens: number
  readonly completionTokens: number
}

interface QuoteCandidateScore {
  readonly index: number
  readonly practitionerVoice: number
  readonly accuracy: number
  readonly originality: number
  readonly discussionPotential: number
  readonly engagementPotential: number
  readonly total: number
}

// ============================================================
// State定義
// ============================================================

const QuoteGraphState = Annotation.Root({
  // Input
  originalTweetId: Annotation<string>,
  originalText: Annotation<string>,
  originalAuthor: Annotation<string>,

  // Intermediate
  analysis: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  opinion: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  opinionTemplateId: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  candidates: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  scores: Annotation<QuoteCandidateScore[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  highPerformerPatterns: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // Output
  quoteText: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  promptTokens: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),
  completionTokens: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),
  error: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
})

type GraphState = typeof QuoteGraphState.State

// ============================================================
// ヘルパー
// ============================================================

function createModel() {
  return new ChatOpenAI({
    modelName: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

async function recallHighPerformerPatterns(): Promise<string> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return ''

    const supabase = createClient(url, key)
    const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
    if (!userId) return ''

    const { data } = await supabase
      .from('slack_bot_memory')
      .select('content')
      .eq('slack_user_id', userId)
      .eq('memory_type', 'fact')
      .contains('context', { platform: 'x' })
      .order('importance', { ascending: false })
      .limit(3)

    if (!data || data.length === 0) return ''
    return data.map((m) => m.content).join('\n')
  } catch {
    return ''
  }
}

// ============================================================
// ノード1: analyzeOriginal
// ============================================================

async function analyzeOriginal(state: GraphState): Promise<Partial<GraphState>> {
  const model = createModel()

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `元ツイートを分析し、以下を特定してください:
1. 主張の核心（1文で）
2. 同意/反論できるポイント
3. 実務家として補足できる角度
4. 議論を深められる切り口

簡潔に分析結果を返してください。`,
    },
    {
      role: 'user' as const,
      content: `@${state.originalAuthor} のツイート:\n"${state.originalText}"`,
    },
  ])

  const text = typeof response.content === 'string'
    ? response.content
    : String(response.content)

  // Recall high performer patterns
  const patterns = await recallHighPerformerPatterns()

  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    analysis: text,
    highPerformerPatterns: patterns || null,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード2: formOpinion
// ============================================================

async function formOpinion(state: GraphState): Promise<Partial<GraphState>> {
  const model = createModel()
  const template = selectOpinionTemplate()

  const highPerformerSection = state.highPerformerPatterns
    ? `\n## 過去の高パフォーマンス投稿パターン（参考にせよ）\n${state.highPerformerPatterns}\n`
    : ''

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。AI実務家として独自意見を形成する。

## 意見形成アプローチ: ${template.name}
${template.promptGuidance}

## 禁止事項
- 元ツイートの「要約」や「感想」は禁止
- 「〜ですね」「興味深い」など空虚なコメント禁止
- ニュースキャスター口調禁止
${highPerformerSection}
## タスク
元ツイートの分析結果に基づき、独自の意見・視点を形成してください。
2-3文で、具体的かつ断定的に。`,
    },
    {
      role: 'user' as const,
      content: `元ツイート (@${state.originalAuthor}):\n"${state.originalText}"\n\n分析:\n${state.analysis}`,
    },
  ])

  const text = typeof response.content === 'string'
    ? response.content
    : String(response.content)

  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    opinion: text,
    opinionTemplateId: template.id,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード3: generateCandidates
// ============================================================

async function generateCandidates(state: GraphState): Promise<Partial<GraphState>> {
  const model = createModel()

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。以下の意見を元に引用RT本文を3候補作成。

${X_TWITTER_RULES}

## 引用RT固有ルール
- 日本語120文字以内厳守（CJK=2カウント、280カウント上限）
- 元ツイートは自動で引用表示されるため、元の内容の繰り返し不要
- 「自分の意見・視点」だけを本文に書く
- URLは入れない
- ハッシュタグ0-1個

3候補を「---」で区切って出力。候補のみ、説明不要。`,
    },
    {
      role: 'user' as const,
      content: `形成した意見:\n${state.opinion}\n\n元ツイート (@${state.originalAuthor}):\n"${state.originalText}"`,
    },
  ])

  const text = typeof response.content === 'string'
    ? response.content
    : String(response.content)

  const candidates = text
    .split('---')
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    candidates,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード4: scoreCandidates
// ============================================================

async function scoreCandidates(state: GraphState): Promise<Partial<GraphState>> {
  if (state.candidates.length === 0) {
    return { error: 'No candidates to score' }
  }

  const model = createModel()

  const candidateList = state.candidates
    .map((c, i) => `【候補${i + 1}】\n${c}`)
    .join('\n\n')

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `引用RT候補を5基準で評価。各0-10点。

基準:
1. practitionerVoice: 実務家の声として自然か（要約口調 → 0点）
2. accuracy: 元ツイートに対する正確な理解
3. originality: 独自の視点・切り口
4. discussionPotential: 議論を生む力
5. engagementPotential: いいね・RT・リプライを誘う力

JSON配列のみ出力:
[{"index":0,"practitionerVoice":8,"accuracy":9,"originality":8,"discussionPotential":7,"engagementPotential":8,"total":40}]`,
    },
    {
      role: 'user' as const,
      content: `元ツイート: "${state.originalText.slice(0, 200)}"\n\n${candidateList}`,
    },
  ])

  const text = typeof response.content === 'string'
    ? response.content
    : String(response.content)

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    const fallbackScores: QuoteCandidateScore[] = state.candidates.map((_, i) => ({
      index: i,
      practitionerVoice: 5,
      accuracy: 5,
      originality: 5,
      discussionPotential: 5,
      engagementPotential: 5,
      total: 25,
    }))
    const fallbackUsage = response.usage_metadata as LangChainUsageMetadata | undefined
    return {
      scores: fallbackScores,
      promptTokens: fallbackUsage?.input_tokens ?? 0,
      completionTokens: fallbackUsage?.output_tokens ?? 0,
    }
  }

  const ScoreSchema = z.array(
    z.object({
      index: z.number(),
      practitionerVoice: z.number().default(5),
      accuracy: z.number().default(5),
      originality: z.number().default(5),
      discussionPotential: z.number().default(5),
      engagementPotential: z.number().default(5),
      total: z.number().default(25),
    }),
  )

  const scores: QuoteCandidateScore[] = ScoreSchema.parse(JSON.parse(jsonMatch[0])) as QuoteCandidateScore[]

  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    scores,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード5: formatFinal
// ============================================================

function formatFinal(state: GraphState): Partial<GraphState> {
  if (state.candidates.length === 0 || state.scores.length === 0) {
    return { error: 'No candidates or scores available' }
  }

  const sortedScores = [...state.scores].sort((a, b) => b.total - a.total)
  const bestIndex = sortedScores[0].index
  const bestCandidate = state.candidates[bestIndex] ?? state.candidates[0]

  // Character limit check (weighted count)
  const WEIGHTED_LIMIT = 280
  if (getTwitterWeightedLength(bestCandidate) > WEIGHTED_LIMIT) {
    let truncated = bestCandidate
    while (getTwitterWeightedLength(truncated) > WEIGHTED_LIMIT - 3 && truncated.length > 0) {
      truncated = truncated.slice(0, -1)
    }
    return { quoteText: truncated + '...' }
  }

  return { quoteText: bestCandidate }
}

// ============================================================
// 条件分岐
// ============================================================

function shouldContinue(state: GraphState): string {
  return state.error ? '__end__' : 'continue'
}

// ============================================================
// グラフ構築
// ============================================================

function buildQuoteGraph() {
  const graph = new StateGraph(QuoteGraphState)
    .addNode('analyzeOriginal', analyzeOriginal)
    .addNode('formOpinion', formOpinion)
    .addNode('generateCandidates', generateCandidates)
    .addNode('scoreCandidates', scoreCandidates)
    .addNode('formatFinal', formatFinal)
    .addEdge(START, 'analyzeOriginal')
    .addConditionalEdges('analyzeOriginal', shouldContinue, {
      continue: 'formOpinion',
      __end__: END,
    })
    .addConditionalEdges('formOpinion', shouldContinue, {
      continue: 'generateCandidates',
      __end__: END,
    })
    .addConditionalEdges('generateCandidates', shouldContinue, {
      continue: 'scoreCandidates',
      __end__: END,
    })
    .addConditionalEdges('scoreCandidates', shouldContinue, {
      continue: 'formatFinal',
      __end__: END,
    })
    .addEdge('formatFinal', END)

  return graph.compile()
}

// ============================================================
// エクスポート関数
// ============================================================

const compiledGraph = buildQuoteGraph()

export async function generateQuoteTweet(
  input: QuoteGraphInput,
): Promise<QuoteGraphOutput> {
  const result = await compiledGraph.invoke(
    {
      originalTweetId: input.originalTweetId,
      originalText: input.originalText,
      originalAuthor: input.originalAuthor,
    },
    {
      runName: 'x-quote-tweet',
      tags: ['x-quote', 'quote-rt'],
    },
  )

  if (result.error) {
    throw new Error(result.error)
  }

  if (!result.quoteText) {
    throw new Error('Quote tweet generation produced no output')
  }

  return {
    quoteText: result.quoteText,
    opinionTemplateUsed: result.opinionTemplateId ?? 'unknown',
    scores: result.scores,
    allCandidates: result.candidates,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
  }
}
