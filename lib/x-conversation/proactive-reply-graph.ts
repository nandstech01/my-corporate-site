/**
 * LangGraph プロアクティブ返信パイプライン
 *
 * 他人の会話に価値ある返信で参加するための生成エンジン。
 * 通常の reply-graph.ts とは異なり、まず「参加すべきか」を判断し、
 * より厳格な安全チェックを適用する。
 *
 * パイプライン (5段階):
 *   START → assessOpportunity → generateReplyCandidate → scoreReply
 *         → safetyCheck → formatFinal → END
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { formatVoiceProfileForPrompt } from '../prompts/voice-profile'
import { getTwitterWeightedLength } from '../x-api/client'
import { critiquePost } from '../content-critique/critique-engine'

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

export interface OpportunityAssessment {
  readonly shouldEngage: boolean
  readonly engagementAngle: string
  readonly brandFit: number
  readonly topicRelevance: number
  readonly visibilityScore: number
}

export interface ProactiveReplyScore {
  readonly conversationalNaturalness: number
  readonly topicRelevance: number
  readonly valueAdd: number
  readonly lengthFit: number
  readonly nonPromotional: number
  readonly total: number
}

// ============================================================
// Constants
// ============================================================

/** Safety threshold: 0.85 * 50 = 42.5 on the 50-point critique scale */
const SAFETY_SCORE_THRESHOLD = 42.5

// ============================================================
// State定義
// ============================================================

const ProactiveReplyState = Annotation.Root({
  tweetText: Annotation<string>,
  authorUsername: Annotation<string>,
  topicMatch: Annotation<string>,

  opportunityAssessment: Annotation<OpportunityAssessment | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  replyCandidate: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  replyScore: Annotation<ProactiveReplyScore | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  safetyPassed: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),
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

type GraphStateType = typeof ProactiveReplyState.State

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
// ノード1: assessOpportunity
// ============================================================

async function assessOpportunity(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel()

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech（AI実務家）のブランドコンサルタントです。
以下のツイートに対して「プロアクティブに返信すべきか」を評価してください。

## 評価基準
1. brandFit (0-10): @nands_techのAI実務家ブランドに合うか
2. topicRelevance (0-10): AI/テック/実務の話題との関連性
3. visibilityScore (0-10): 返信による露出・成長効果

## 参加すべき条件（すべて満たす）
- AI/テック/実務に関連する話題
- 実務家として具体的な価値を提供できる
- 宣伝やスパムにならない自然な参加が可能
- 相手の議論に対する敬意を保てる

## 参加すべきでない条件（1つでも該当したらNG）
- 政治・宗教・炎上案件
- 自分の製品やサービスの宣伝になる
- 相手の議論の文脈を理解できない
- 浅いコメントしかできないトピック

JSONのみ出力:
{
  "shouldEngage": true/false,
  "engagementAngle": "具体的にどういう角度で参加するか（50文字以内）",
  "brandFit": 8,
  "topicRelevance": 9,
  "visibilityScore": 7
}`,
    },
    {
      role: 'user' as const,
      content: `ツイート (@${state.authorUsername}):\n"${state.tweetText}"\n\nトピックマッチ: ${state.topicMatch}`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      opportunityAssessment: {
        shouldEngage: false,
        engagementAngle: '',
        brandFit: 0,
        topicRelevance: 0,
        visibilityScore: 0,
      },
    }
  }

  const AssessmentSchema = z.object({
    shouldEngage: z.boolean().default(false),
    engagementAngle: z.string().default(''),
    brandFit: z.number().min(0).max(10).default(0),
    topicRelevance: z.number().min(0).max(10).default(0),
    visibilityScore: z.number().min(0).max(10).default(0),
  })

  const parsed = AssessmentSchema.parse(JSON.parse(jsonMatch[0]))
  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    opportunityAssessment: parsed as OpportunityAssessment,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード2: generateReplyCandidate
// ============================================================

async function generateReplyCandidate(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel()
  const voiceProfile = formatVoiceProfileForPrompt('short')
  const angle = state.opportunityAssessment?.engagementAngle ?? ''

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。他人のツイートに自然に参加する返信を1つ作成。

${voiceProfile}

## 参加アングル
${angle}

## ルール
- 日本語120文字以内厳守（X APIはCJK=2カウント。280カウント上限のため日本語は120文字以内で）
- URLは入れるな
- ハッシュタグ不要
- 自然な会話参加。スパム感・宣伝感ゼロ
- 相手の主張を認めた上で、実務家としての知見を1つ追加
- 「いいね」だけの空虚な返信NG
- 自分語りしすぎない（相手の話題がメイン）

返信文のみ出力。説明不要。`,
    },
    {
      role: 'user' as const,
      content: `ツイート (@${state.authorUsername}):\n"${state.tweetText}"`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content.trim()
      : String(response.content).trim()

  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    replyCandidate: text,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード3: scoreReply
// ============================================================

async function scoreReply(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.replyCandidate) {
    return { error: 'No reply candidate to score' }
  }

  const model = createModel()

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはX返信の品質評価者です。@nands_tech（AI実務家）が他人の会話にプロアクティブに参加する返信として適切か評価してください。

5基準で評価。各0-10点。

基準:
1. conversationalNaturalness: 会話の自然さ（押し付けがましくないか）
2. topicRelevance: 元の話題との関連性
3. valueAdd: 追加価値（実務知見・新しい視点を提供しているか）
4. lengthFit: 120文字以内適合
5. nonPromotional: 非宣伝的（スパム感・自己PR感のなさ）

JSONのみ出力:
{"conversationalNaturalness":8,"topicRelevance":9,"valueAdd":7,"lengthFit":9,"nonPromotional":8,"total":41}`,
    },
    {
      role: 'user' as const,
      content: `元ツイート (@${state.authorUsername}):\n"${state.tweetText}"\n\n返信候補:\n"${state.replyCandidate}"`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : String(response.content)

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    const fallbackScore: ProactiveReplyScore = {
      conversationalNaturalness: 5,
      topicRelevance: 5,
      valueAdd: 5,
      lengthFit: 5,
      nonPromotional: 5,
      total: 25,
    }
    const fallbackUsage = response.usage_metadata as LangChainUsageMetadata | undefined
    return {
      replyScore: fallbackScore,
      promptTokens: fallbackUsage?.input_tokens ?? 0,
      completionTokens: fallbackUsage?.output_tokens ?? 0,
    }
  }

  const ScoreSchema = z.object({
    conversationalNaturalness: z.number().default(5),
    topicRelevance: z.number().default(5),
    valueAdd: z.number().default(5),
    lengthFit: z.number().default(5),
    nonPromotional: z.number().default(5),
    total: z.number().default(25),
  })

  const score = ScoreSchema.parse(JSON.parse(jsonMatch[0]))
  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    replyScore: score as ProactiveReplyScore,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード4: safetyCheck
// ============================================================

async function safetyCheck(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.replyCandidate) {
    return { safetyPassed: false, finalReply: null }
  }

  // 5次元 critique (mode: 'reply')
  const critique = await critiquePost({
    text: state.replyCandidate,
    platform: 'x',
    mode: 'reply',
    sourceContent: state.tweetText,
  })

  process.stdout.write(
    `Proactive reply safety: score=${critique.overallScore}/50, threshold=${SAFETY_SCORE_THRESHOLD}\n`,
  )

  if (critique.overallScore < SAFETY_SCORE_THRESHOLD) {
    process.stdout.write(
      `Proactive reply safety: FAILED (${critique.overallScore} < ${SAFETY_SCORE_THRESHOLD})\n`,
    )
    return { safetyPassed: false, finalReply: null }
  }

  return { safetyPassed: true }
}

// ============================================================
// ノード5: formatFinal
// ============================================================

function formatFinal(state: GraphStateType): Partial<GraphStateType> {
  if (!state.safetyPassed || !state.replyCandidate) {
    return { finalReply: null }
  }

  const WEIGHTED_LIMIT = 280
  if (getTwitterWeightedLength(state.replyCandidate) <= WEIGHTED_LIMIT) {
    return { finalReply: state.replyCandidate }
  }

  // Truncate if over limit
  let truncated = state.replyCandidate
  while (getTwitterWeightedLength(truncated) > WEIGHTED_LIMIT - 3 && truncated.length > 0) {
    truncated = truncated.slice(0, -1)
  }
  return { finalReply: truncated + '...' }
}

// ============================================================
// 条件分岐
// ============================================================

function shouldEngageAfterAssessment(
  state: GraphStateType,
): 'generateReplyCandidate' | typeof END {
  if (state.error) return END
  if (!state.opportunityAssessment?.shouldEngage) return END
  return 'generateReplyCandidate'
}

function shouldContinueAfterCandidate(
  state: GraphStateType,
): 'scoreReply' | typeof END {
  return state.error ? END : 'scoreReply'
}

function shouldContinueAfterScore(
  state: GraphStateType,
): 'safetyCheck' | typeof END {
  return state.error ? END : 'safetyCheck'
}

// ============================================================
// グラフ構築
// ============================================================

function buildProactiveReplyGraph() {
  const graph = new StateGraph(ProactiveReplyState)
    .addNode('assessOpportunity', assessOpportunity)
    .addNode('generateReplyCandidate', generateReplyCandidate)
    .addNode('scoreReply', scoreReply)
    .addNode('safetyCheck', safetyCheck)
    .addNode('formatFinal', formatFinal)
    .addEdge(START, 'assessOpportunity')
    .addConditionalEdges('assessOpportunity', shouldEngageAfterAssessment)
    .addConditionalEdges('generateReplyCandidate', shouldContinueAfterCandidate)
    .addConditionalEdges('scoreReply', shouldContinueAfterScore)
    .addEdge('safetyCheck', 'formatFinal')
    .addEdge('formatFinal', END)

  return graph.compile()
}

// ============================================================
// エクスポート関数
// ============================================================

const compiledGraph = buildProactiveReplyGraph()

export async function generateProactiveReply(input: {
  readonly tweetText: string
  readonly authorUsername: string
  readonly topicMatch: string
}): Promise<{
  readonly finalReply: string | null
  readonly assessment: OpportunityAssessment
  readonly score: ProactiveReplyScore | null
} | null> {
  const app = compiledGraph

  const result = await app.invoke(
    {
      tweetText: input.tweetText,
      authorUsername: input.authorUsername,
      topicMatch: input.topicMatch,
    },
    {
      runName: 'x-proactive-reply',
      tags: ['x-proactive-reply'],
      metadata: {
        authorUsername: input.authorUsername,
        topicMatch: input.topicMatch,
      },
    },
  )

  if (!result.opportunityAssessment) {
    return null
  }

  return {
    finalReply: result.finalReply,
    assessment: result.opportunityAssessment,
    score: result.replyScore,
  }
}
