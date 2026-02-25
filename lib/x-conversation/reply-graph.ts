/**
 * LangGraph X返信生成パイプライン
 *
 * 会話ビルダー (conversation-builder.ts) から呼び出される
 * 返信専用の生成エンジン。
 *
 * パイプライン (6段階):
 *   START → analyzeContext → selectReplyStrategy → generateReplyCandidates
 *         → scoreReplyCandidates → critiqueAndRevise → formatFinal → END
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { selectPatternByBandit } from '../learning/pattern-bandit'
import { formatVoiceProfileForPrompt } from '../prompts/voice-profile'
import { getTwitterWeightedLength } from '../x-api/client'
import { critiquePost } from '../content-critique/critique-engine'
import type { CritiqueResult } from '../content-critique/critique-engine'

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

export interface ReplyContextAnalysis {
  readonly sentiment: 'positive' | 'neutral' | 'negative' | 'question'
  readonly topicKeywords: readonly string[]
  readonly conversationTone: string
  readonly suggestedApproach: string
}

export interface ReplyCandidateScore {
  readonly index: number
  readonly conversationalNaturalness: number
  readonly topicRelevance: number
  readonly valueAdd: number
  readonly lengthFit: number
  readonly continuationPotential: number
  readonly total: number
}

// ============================================================
// 返信戦略 (Bandit選択用)
// ============================================================

const REPLY_STRATEGIES = [
  { id: 'deepen_with_data', name: 'データで深掘り', instruction: '具体的な数字やデータを追加して議論を深める' },
  { id: 'share_experience', name: '実体験共有', instruction: '自分の実体験を共有して共感と信頼を構築' },
  { id: 'acknowledge_and_extend', name: '認めて発展', instruction: '相手のポイントを認めた上で新しい視点を追加' },
  { id: 'respectful_counter', name: '丁寧な反論', instruction: '敬意を持って異なる視点を提示し議論を活性化' },
  { id: 'ask_back', name: '質問返し', instruction: '相手の知見を引き出す質問で会話を継続' },
  { id: 'practical_tip', name: '実務Tip共有', instruction: '即座に使える実務的なTipを共有して価値提供' },
] as const

// ============================================================
// State定義
// ============================================================

const ReplyGraphState = Annotation.Root({
  // 入力
  originalPostText: Annotation<string>,
  userReplyText: Annotation<string>,
  conversationHistory: Annotation<readonly string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  replyType: Annotation<'reply_to_user' | 'self_thread' | 'follow_up'>,

  // 中間
  contextAnalysis: Annotation<ReplyContextAnalysis | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  selectedStrategyId: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  candidates: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  scores: Annotation<ReplyCandidateScore[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  // Critique
  critiqueResult: Annotation<CritiqueResult | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // 出力
  finalReply: Annotation<string | null>({
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

type GraphStateType = typeof ReplyGraphState.State

// ============================================================
// ヘルパー
// ============================================================

function createModel() {
  return new ChatOpenAI({
    modelName: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// ノード1: analyzeContext
// ============================================================

async function analyzeContext(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel()

  const historySection = state.conversationHistory.length > 0
    ? `\n会話履歴:\n${state.conversationHistory.join('\n')}`
    : ''

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはX上の会話分析者です。
与えられた会話コンテキストを分析し、以下のJSON形式で結果を返してください。

JSONのみ出力:
{
  "sentiment": "positive" | "neutral" | "negative" | "question",
  "topicKeywords": ["キーワード1", "キーワード2"],
  "conversationTone": "会話のトーン（カジュアル/フォーマル/議論的/友好的 等）",
  "suggestedApproach": "推奨返信アプローチの30文字要約"
}`,
    },
    {
      role: 'user' as const,
      content: `元投稿:\n"${state.originalPostText}"\n\nリプライ:\n"${state.userReplyText}"${historySection}`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { error: 'Failed to parse context analysis JSON' }
  }

  const ContextAnalysisSchema = z.object({
    sentiment: z.enum(['positive', 'neutral', 'negative', 'question']).default('neutral'),
    topicKeywords: z.array(z.string()).default([]),
    conversationTone: z.string().default('カジュアル'),
    suggestedApproach: z.string().default(''),
  })

  const analysis = ContextAnalysisSchema.parse(
    JSON.parse(jsonMatch[0]),
  ) as ReplyContextAnalysis
  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    contextAnalysis: analysis,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード2: selectReplyStrategy（Bandit選択）
// ============================================================

async function selectReplyStrategy(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const allStrategyIds = REPLY_STRATEGIES.map((s) => `reply_${s.id}`)

  let selectedId: string
  try {
    const banditChoice = await selectPatternByBandit(allStrategyIds, 'x')
    const matched = REPLY_STRATEGIES.find((s) => `reply_${s.id}` === banditChoice)
    selectedId = matched ? banditChoice : 'reply_acknowledge_and_extend'
    process.stdout.write(`Reply strategy selected by bandit: ${selectedId}\n`)
  } catch {
    selectedId = 'reply_acknowledge_and_extend'
    process.stdout.write(`Reply strategy fallback: ${selectedId}\n`)
  }

  return { selectedStrategyId: selectedId }
}

// ============================================================
// ノード3: generateReplyCandidates
// ============================================================

async function generateReplyCandidates(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel()

  const strategyRawId = (state.selectedStrategyId ?? 'reply_acknowledge_and_extend').replace('reply_', '')
  const strategy = REPLY_STRATEGIES.find((s) => s.id === strategyRawId)
  const strategyInstruction = strategy?.instruction ?? '相手のポイントを認めた上で新しい視点を追加'

  const voiceProfile = formatVoiceProfileForPrompt('short')

  const contextSection = state.contextAnalysis
    ? `\n## 会話分析結果\nセンチメント: ${state.contextAnalysis.sentiment}\nトーン: ${state.contextAnalysis.conversationTone}\nキーワード: ${state.contextAnalysis.topicKeywords.join(', ')}\n推奨アプローチ: ${state.contextAnalysis.suggestedApproach}`
    : ''

  const replyTypeInstruction = state.replyType === 'self_thread'
    ? '自分の投稿にフォローアップを追加する（深掘り・追加情報・新しい問いかけ）'
    : state.replyType === 'follow_up'
      ? '会話の流れに沿ったフォローアップを追加する'
      : '相手のリプライに対して会話を深める返信を作る'

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。以下のルールに従い、返信候補を3つ作成。

## 返信タイプ
${replyTypeInstruction}

## 返信戦略
${strategyInstruction}

${voiceProfile}
${contextSection}

## ルール
- 日本語120文字以内厳守（X APIはCJK=2カウント。280カウント上限のため日本語は120文字以内で）
- URLは入れるな
- ハッシュタグ不要
- 会話の流れに自然に乗る
- 相手のポイントを認めた上で追加情報を提供
- 実務家の具体的知見を1つ以上含む

3候補を「---」で区切って出力。候補のみ、説明不要。`,
    },
    {
      role: 'user' as const,
      content: `元投稿:\n"${state.originalPostText}"\n\nリプライ:\n"${state.userReplyText}"`,
    },
  ])

  const text =
    typeof response.content === 'string'
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
// ノード4: scoreReplyCandidates
// ============================================================

async function scoreReplyCandidates(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (state.candidates.length === 0) {
    return { error: 'No reply candidates to score' }
  }

  const model = createModel()

  const candidateList = state.candidates
    .map((c, i) => `【候補${i + 1}】\n${c}`)
    .join('\n\n')

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはX返信の品質評価者です。@nands_tech（AI実務家）の返信として適切か評価してください。
以下の候補を5基準で評価してください。各0-10点。

基準:
1. conversationalNaturalness: 会話の自然さ（流れに乗っているか）
2. topicRelevance: 元の話題との関連性
3. valueAdd: 追加価値（新情報・視点・経験を提供しているか）
4. lengthFit: 120文字以内適合
5. continuationPotential: 会話継続力（相手が返信したくなるか）

JSON配列のみ出力:
[
  {"index":0,"conversationalNaturalness":8,"topicRelevance":9,"valueAdd":7,"lengthFit":9,"continuationPotential":8,"total":41},
  ...
]`,
    },
    {
      role: 'user' as const,
      content: `元投稿:\n"${state.originalPostText}"\n\nリプライ:\n"${state.userReplyText}"\n\n${candidateList}`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : String(response.content)

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    const fallbackScores: ReplyCandidateScore[] = state.candidates.map((_, i) => ({
      index: i,
      conversationalNaturalness: 5,
      topicRelevance: 5,
      valueAdd: 5,
      lengthFit: 5,
      continuationPotential: 5,
      total: 25,
    }))
    const fallbackUsage = response.usage_metadata as LangChainUsageMetadata | undefined
    return {
      scores: fallbackScores,
      promptTokens: fallbackUsage?.input_tokens ?? 0,
      completionTokens: fallbackUsage?.output_tokens ?? 0,
    }
  }

  const CandidateScoreSchema = z.array(
    z.object({
      index: z.number(),
      conversationalNaturalness: z.number().default(5),
      topicRelevance: z.number().default(5),
      valueAdd: z.number().default(5),
      lengthFit: z.number().default(5),
      continuationPotential: z.number().default(5),
      total: z.number().default(25),
    }),
  )

  const scores = CandidateScoreSchema.parse(
    JSON.parse(jsonMatch[0]),
  ) as ReplyCandidateScore[]
  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    scores,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード5: critiqueAndRevise（Self-Refine）
// ============================================================

async function critiqueAndRevise(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (state.candidates.length === 0 || state.scores.length === 0) {
    return {}
  }

  // 最高スコア候補を取得
  const sortedScores = [...state.scores].sort((a, b) => b.total - a.total)
  const bestIndex = sortedScores[0].index
  const bestCandidate = state.candidates[bestIndex] ?? state.candidates[0]

  // 5次元評価
  const critique = await critiquePost({
    text: bestCandidate,
    platform: 'x',
    mode: 'reply',
    sourceContent: state.originalPostText,
  })

  process.stdout.write(
    `Reply critique: score=${critique.overallScore}/50, passed=${critique.passed}\n`,
  )

  // Adaptive exit: 高品質ならスキップ
  if (critique.passed) {
    return { critiqueResult: critique }
  }

  // 改訂版がcritiqueに含まれていればそれを最終返信に
  if (critique.revision && critique.revision.length > 5) {
    return {
      critiqueResult: critique,
      finalReply: critique.revision,
    }
  }

  return { critiqueResult: critique }
}

// ============================================================
// ノード6: formatFinal（純粋関数）
// ============================================================

function formatFinal(state: GraphStateType): Partial<GraphStateType> {
  // critiqueAndRevise で改訂版が設定済みの場合
  if (state.finalReply) {
    // 長さチェックのみ
    const WEIGHTED_LIMIT = 280
    if (getTwitterWeightedLength(state.finalReply) <= WEIGHTED_LIMIT) {
      return {}
    }
    let truncated = state.finalReply
    while (getTwitterWeightedLength(truncated) > WEIGHTED_LIMIT - 3 && truncated.length > 0) {
      truncated = truncated.slice(0, -1)
    }
    return { finalReply: truncated + '...' }
  }

  if (state.candidates.length === 0 || state.scores.length === 0) {
    return { error: 'No candidates or scores available' }
  }

  // 最高スコア候補を選定
  const sortedScores = [...state.scores].sort((a, b) => b.total - a.total)
  const bestIndex = sortedScores[0].index
  const bestCandidate = state.candidates[bestIndex] ?? state.candidates[0]

  // 文字数最終チェック（Twitter加重カウント使用）
  const WEIGHTED_LIMIT = 280
  if (getTwitterWeightedLength(bestCandidate) <= WEIGHTED_LIMIT) {
    return { finalReply: bestCandidate }
  }

  // 切り詰め
  let truncated = bestCandidate
  while (getTwitterWeightedLength(truncated) > WEIGHTED_LIMIT - 3 && truncated.length > 0) {
    truncated = truncated.slice(0, -1)
  }
  return { finalReply: truncated + '...' }
}

// ============================================================
// 条件分岐
// ============================================================

function shouldContinueAfterAnalysis(
  state: GraphStateType,
): 'selectReplyStrategy' | typeof END {
  return state.error ? END : 'selectReplyStrategy'
}

function shouldContinueAfterCandidates(
  state: GraphStateType,
): 'scoreReplyCandidates' | typeof END {
  return state.error ? END : 'scoreReplyCandidates'
}

function shouldContinueAfterScoring(
  state: GraphStateType,
): 'critiqueAndRevise' | typeof END {
  return state.error ? END : 'critiqueAndRevise'
}

// ============================================================
// グラフ構築
// ============================================================

function buildReplyGraph() {
  const graph = new StateGraph(ReplyGraphState)
    .addNode('analyzeContext', analyzeContext)
    .addNode('selectReplyStrategy', selectReplyStrategy)
    .addNode('generateReplyCandidates', generateReplyCandidates)
    .addNode('scoreReplyCandidates', scoreReplyCandidates)
    .addNode('critiqueAndRevise', critiqueAndRevise)
    .addNode('formatFinal', formatFinal)
    .addEdge(START, 'analyzeContext')
    .addConditionalEdges('analyzeContext', shouldContinueAfterAnalysis)
    .addEdge('selectReplyStrategy', 'generateReplyCandidates')
    .addConditionalEdges('generateReplyCandidates', shouldContinueAfterCandidates)
    .addConditionalEdges('scoreReplyCandidates', shouldContinueAfterScoring)
    .addEdge('critiqueAndRevise', 'formatFinal')
    .addEdge('formatFinal', END)

  return graph.compile()
}

// ============================================================
// エクスポート関数
// ============================================================

const compiledGraph = buildReplyGraph()

export async function generateReplyWithPipeline(input: {
  readonly originalPostText: string
  readonly userReplyText: string
  readonly conversationHistory?: readonly string[]
  readonly replyType: 'reply_to_user' | 'self_thread' | 'follow_up'
}): Promise<{
  readonly finalReply: string
  readonly strategyUsed: string
  readonly scores: readonly ReplyCandidateScore[]
}> {
  const app = compiledGraph

  const result = await app.invoke(
    {
      originalPostText: input.originalPostText,
      userReplyText: input.userReplyText,
      conversationHistory: input.conversationHistory ?? [],
      replyType: input.replyType,
    },
    {
      runName: `x-reply-${input.replyType}`,
      tags: ['x-reply', input.replyType],
      metadata: {
        replyType: input.replyType,
      },
    },
  )

  if (result.error) {
    throw new Error(result.error)
  }

  if (!result.finalReply) {
    throw new Error('Reply generation produced no output')
  }

  return {
    finalReply: result.finalReply,
    strategyUsed: result.selectedStrategyId ?? 'reply_acknowledge_and_extend',
    scores: result.scores,
  }
}
