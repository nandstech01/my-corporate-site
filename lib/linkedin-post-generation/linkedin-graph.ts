/**
 * LangGraph LinkedIn 投稿生成パイプライン
 *
 * 既存 post-graph.ts と同じパターン:
 *   START → analyzeSource → selectPattern → generateCandidates
 *         → scoreCandidates → formatFinal → END
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { linkedInTemplates, findTemplateForSourceType } from './linkedin-templates'
import { generateLinkedInTags } from './linkedin-tag-generator'
import { LINKEDIN_BUZZ_RULES } from '../prompts/sns/linkedin-buzz'
import { getLinkedInLearnings } from '../slack-bot/proactive/linkedin-learnings'

// ============================================================
// 型定義
// ============================================================

export interface LinkedInGraphInput {
  readonly sourceData: string
  readonly sourceType: 'practitioner_experience' | 'new_release' | 'trend_analysis' | 'official_announcement'
  readonly sourceUrl: string
  readonly sourceAuthor?: string
  readonly japanAngle?: string
}

export interface LinkedInCandidateScore {
  readonly index: number
  readonly professionalTone: number
  readonly sourceAttribution: number
  readonly japanRelevance: number
  readonly lengthFit: number
  readonly discussionPotential: number
  readonly total: number
}

export interface LinkedInGraphOutput {
  readonly finalPost: string
  readonly patternUsed: string
  readonly tags: readonly string[]
  readonly scores: readonly LinkedInCandidateScore[]
  readonly allCandidates: readonly string[]
}

// ============================================================
// State定義
// ============================================================

const LinkedInGraphState = Annotation.Root({
  // 入力
  sourceData: Annotation<string>,
  sourceType: Annotation<'practitioner_experience' | 'new_release' | 'trend_analysis' | 'official_announcement'>,
  sourceUrl: Annotation<string>,
  sourceAuthor: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  japanAngle: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // 中間
  selectedTemplateId: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  generatedTags: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  candidates: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  scores: Annotation<LinkedInCandidateScore[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  // 出力
  finalPost: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  error: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
})

type GraphStateType = typeof LinkedInGraphState.State

// ============================================================
// ヘルパー
// ============================================================

function createModel(temperature = 0.3) {
  return new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature,
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// ノード1: analyzeSource
// ============================================================

function analyzeSource(state: GraphStateType): Partial<GraphStateType> {
  const template = findTemplateForSourceType(state.sourceType)
  const tags = generateLinkedInTags(state.sourceData)

  return {
    selectedTemplateId: template.id,
    generatedTags: [...tags.all],
  }
}

// ============================================================
// ノード2: generateCandidates
// ============================================================

async function generateCandidates(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel(0.7)

  const template = linkedInTemplates.find((t) => t.id === state.selectedTemplateId)
  const templateInfo = template
    ? `テンプレート: ${template.name}\n構成: ${template.structure}`
    : ''

  const japanAngleHint = state.japanAngle
    ? `\n日本市場の切り口ヒント: ${state.japanAngle}`
    : ''

  // 学習データの注入（コールドスタート時はスキップ）
  let learningsHint = ''
  try {
    const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
    if (userId) {
      const learnings = await getLinkedInLearnings(userId)
      if (learnings) {
        learningsHint = `\n\n過去のエンゲージメント分析から学んだ高パフォーマンス投稿の特徴:\n${learnings.highPerformerSummary}\nこれらの特徴を参考に、バズりやすい投稿を生成してください。`
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`LinkedIn learnings fetch skipped: ${message}\n`)
  }

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはLinkedInバズ投稿の専門家です。以下のルールに従い、LinkedIn投稿を3候補作成してください。

${LINKEDIN_BUZZ_RULES}

${templateInfo}

元ソースタイプ: ${state.sourceType}
元ソースURL: ${state.sourceUrl}
${state.sourceAuthor ? `元ソース著者: ${state.sourceAuthor}` : ''}
${japanAngleHint}${learningsHint}

ハッシュタグ候補: ${state.generatedTags.join(' ')}

重要:
- 3候補を「---」で区切って出力。候補のみ、説明不要
- 各候補は1000-1500文字目標
- 原典帰属を必ず含める
- 日本市場への示唆を必ず含める
- 「です・ます」調で統一`,
    },
    {
      role: 'user' as const,
      content: `ソースデータ:\n${state.sourceData.slice(0, 4000)}`,
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

  return { candidates }
}

// ============================================================
// ノード3: scoreCandidates
// ============================================================

async function scoreCandidates(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (state.candidates.length === 0) {
    return { error: 'No candidates to score' }
  }

  const model = createModel(0.1)

  const candidateList = state.candidates
    .map((c, i) => `【候補${i + 1}】\n${c}`)
    .join('\n\n')

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはLinkedIn投稿の品質評価者です。以下の候補を5基準で評価してください。各0-10点。

基準:
1. professionalTone: ビジネスSNSとして適切なトーンか（「です・ます」調、煽り表現なし）
2. sourceAttribution: 原典への正確な帰属があるか
3. japanRelevance: 日本市場への示唆の深さ・具体性
4. lengthFit: 文字数適合度（目標1000-1500文字、800-2000文字許容）
5. discussionPotential: 議論を生む力（問いかけがあるか、コメントしたくなるか）

JSON配列のみ出力:
[
  {"index":0,"professionalTone":8,"sourceAttribution":9,"japanRelevance":7,"lengthFit":9,"discussionPotential":8,"total":41},
  ...
]`,
    },
    {
      role: 'user' as const,
      content: candidateList,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : String(response.content)

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    const fallbackScores: LinkedInCandidateScore[] = state.candidates.map((_, i) => ({
      index: i,
      professionalTone: 5,
      sourceAttribution: 5,
      japanRelevance: 5,
      lengthFit: 5,
      discussionPotential: 5,
      total: 25,
    }))
    return { scores: fallbackScores }
  }

  const ScoreSchema = z.array(
    z.object({
      index: z.number(),
      professionalTone: z.number().default(5),
      sourceAttribution: z.number().default(5),
      japanRelevance: z.number().default(5),
      lengthFit: z.number().default(5),
      discussionPotential: z.number().default(5),
      total: z.number().default(25),
    }),
  )

  const scores = ScoreSchema.parse(JSON.parse(jsonMatch[0]))
  return { scores }
}

// ============================================================
// ノード4: formatFinal
// ============================================================

function formatFinal(state: GraphStateType): Partial<GraphStateType> {
  if (state.candidates.length === 0 || state.scores.length === 0) {
    return { error: 'No candidates or scores available' }
  }

  const sortedScores = [...state.scores].sort((a, b) => b.total - a.total)
  const bestIndex = sortedScores[0].index
  const bestCandidate = state.candidates[bestIndex] ?? state.candidates[0]

  // タグが候補に含まれていなければ追加
  const existingTags = state.generatedTags.filter((tag) =>
    bestCandidate.includes(tag),
  )
  const missingTags = state.generatedTags.filter(
    (tag) => !existingTags.includes(tag),
  )

  const finalPost =
    missingTags.length > 0
      ? `${bestCandidate}\n\n${missingTags.join(' ')}`
      : bestCandidate

  return { finalPost }
}

// ============================================================
// 条件分岐
// ============================================================

function shouldContinueAfterCandidates(
  state: GraphStateType,
): 'scoreCandidates' | typeof END {
  return state.error ? END : 'scoreCandidates'
}

function shouldContinueAfterScoring(
  state: GraphStateType,
): 'formatFinal' | typeof END {
  return state.error ? END : 'formatFinal'
}

// ============================================================
// グラフ構築
// ============================================================

function buildLinkedInGraph() {
  const graph = new StateGraph(LinkedInGraphState)
    .addNode('analyzeSource', analyzeSource)
    .addNode('generateCandidates', generateCandidates)
    .addNode('scoreCandidates', scoreCandidates)
    .addNode('formatFinal', formatFinal)
    .addEdge(START, 'analyzeSource')
    .addEdge('analyzeSource', 'generateCandidates')
    .addConditionalEdges('generateCandidates', shouldContinueAfterCandidates)
    .addConditionalEdges('scoreCandidates', shouldContinueAfterScoring)
    .addEdge('formatFinal', END)

  return graph.compile()
}

// ============================================================
// エクスポート関数
// ============================================================

const compiledGraph = buildLinkedInGraph()

export async function generateLinkedInPost(
  input: LinkedInGraphInput,
): Promise<LinkedInGraphOutput> {
  const result = await compiledGraph.invoke({
    sourceData: input.sourceData,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    sourceAuthor: input.sourceAuthor ?? null,
    japanAngle: input.japanAngle ?? null,
  })

  if (result.error) {
    throw new Error(result.error)
  }

  if (!result.finalPost) {
    throw new Error('LinkedIn post generation produced no output')
  }

  return {
    finalPost: result.finalPost,
    patternUsed: result.selectedTemplateId ?? 'overseas_experience_commentary',
    tags: result.generatedTags,
    scores: result.scores,
    allCandidates: result.candidates,
  }
}
