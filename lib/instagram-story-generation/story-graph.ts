/**
 * LangGraph Instagram ストーリー生成パイプライン
 *
 * ブログ記事 → ストーリーキャプション3候補 → スコアリング → ベスト選定
 *
 * START → analyzeBlogContent → generateStoryCaption → scoreCandidates → selectBest → END
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { INSTAGRAM_RULES } from '../prompts/sns/instagram'

// ============================================================
// 型定義
// ============================================================

export interface StoryGraphInput {
  readonly blogTitle: string
  readonly blogSlug: string
  readonly blogContent: string
  readonly blogExcerpt?: string
  readonly blogTags?: readonly string[]
}

export interface StoryCandidateScore {
  readonly index: number
  readonly emotionalAppeal: number
  readonly hashtagQuality: number
  readonly ctaClarity: number
  readonly lengthFit: number
  readonly visualLanguage: number
  readonly total: number
}

export interface StoryGraphOutput {
  readonly caption: string
  readonly hashtags: readonly string[]
  readonly ctaUrl: string
  readonly imagePrompt: string
  readonly scores: readonly StoryCandidateScore[]
  readonly allCandidates: readonly string[]
}

// ============================================================
// State定義
// ============================================================

const StoryGraphState = Annotation.Root({
  // 入力
  blogTitle: Annotation<string>,
  blogSlug: Annotation<string>,
  blogContent: Annotation<string>,
  blogExcerpt: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  blogTags: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  // 中間
  keyPoints: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  candidates: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  scores: Annotation<StoryCandidateScore[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  hashtags: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  imagePrompt: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // 出力
  finalCaption: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  error: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
})

type GraphStateType = typeof StoryGraphState.State

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
// ノード1: analyzeBlogContent
// ============================================================

async function analyzeBlogContent(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel(0.2)

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはコンテンツ分析の専門家です。ブログ記事から以下を抽出してください:
1. キーポイント3-5個（各1行）
2. 画像生成プロンプト（英語、1080x1920ポートレート向け、ブランドカラー: ネイビー×ゴールド）
3. ハッシュタグ15-20個（ニッチ+ビッグタグ混合）

JSON形式で出力:
{"keyPoints":["..."],"imagePrompt":"...","hashtags":["#tag1","#tag2"]}`,
    },
    {
      role: 'user' as const,
      content: `タイトル: ${state.blogTitle}\n\n記事:\n${state.blogContent.slice(0, 4000)}`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : String(response.content)

  const AnalysisSchema = z.object({
    keyPoints: z.array(z.string()),
    imagePrompt: z.string(),
    hashtags: z.array(z.string()),
  })

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { error: 'Failed to parse blog analysis' }
    }

    const parsed = AnalysisSchema.parse(JSON.parse(jsonMatch[0]))
    return {
      keyPoints: parsed.keyPoints,
      imagePrompt: parsed.imagePrompt,
      hashtags: parsed.hashtags,
    }
  } catch {
    return { error: 'Blog analysis parsing failed' }
  }
}

// ============================================================
// ノード2: generateStoryCaption
// ============================================================

async function generateStoryCaption(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel(0.7)

  const keyPointsStr = state.keyPoints.join('\n- ')
  const utmUrl = `https://nands.tech/system-dev-lp?utm_source=instagram&utm_medium=story&utm_campaign=blog_${state.blogSlug}`

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはInstagramストーリーの専門家です。以下のルールに従い、ストーリーキャプションを3候補作成してください。

${INSTAGRAM_RULES}

ブログ記事のキーポイント:
- ${keyPointsStr}

ランディングページURL: ${utmUrl}

重要:
- 3候補を「---」で区切って出力。候補のみ、説明不要
- 各候補は300-800文字目標
- ハッシュタグは本文の最後にまとめる
- プロフィールリンクへのCTA誘導を必ず含める
- 「プロフィールのリンクから詳細を読めます」を含める
- 感情に訴えるストーリー形式
- 絵文字を効果的に使用`,
    },
    {
      role: 'user' as const,
      content: `タイトル: ${state.blogTitle}\n\n概要: ${state.blogExcerpt ?? state.blogContent.slice(0, 500)}`,
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
      content: `あなたはInstagramストーリーの品質評価者です。以下の候補を5基準で評価してください。各0-10点。

基準:
1. emotionalAppeal: 感情訴求力（共感・ストーリー性）
2. hashtagQuality: ハッシュタグの品質（数・ニッチ×ビッグバランス）
3. ctaClarity: CTA（行動喚起）の明確性
4. lengthFit: 文字数適合度（300-800文字）
5. visualLanguage: ビジュアル言語表現（絵文字・段落分け・視覚的訴求）

JSON配列のみ出力:
[
  {"index":0,"emotionalAppeal":8,"hashtagQuality":9,"ctaClarity":7,"lengthFit":9,"visualLanguage":8,"total":41},
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

  const ScoreSchema = z.array(
    z.object({
      index: z.number(),
      emotionalAppeal: z.number().default(5),
      hashtagQuality: z.number().default(5),
      ctaClarity: z.number().default(5),
      lengthFit: z.number().default(5),
      visualLanguage: z.number().default(5),
      total: z.number().default(25),
    }),
  )

  const scores = jsonMatch
    ? ScoreSchema.parse(JSON.parse(jsonMatch[0]))
    : state.candidates.map((_, i) => ({
        index: i,
        emotionalAppeal: 5,
        hashtagQuality: 5,
        ctaClarity: 5,
        lengthFit: 5,
        visualLanguage: 5,
        total: 25,
      }))

  return { scores }
}

// ============================================================
// ノード4: selectBest
// ============================================================

function selectBest(state: GraphStateType): Partial<GraphStateType> {
  if (state.candidates.length === 0 || state.scores.length === 0) {
    return { error: 'No candidates or scores available' }
  }

  const sortedScores = [...state.scores].sort((a, b) => b.total - a.total)
  const bestIndex = sortedScores[0].index
  const bestCandidate = state.candidates[bestIndex] ?? state.candidates[0]

  return { finalCaption: bestCandidate }
}

// ============================================================
// 条件分岐
// ============================================================

function shouldContinueAfterAnalysis(
  state: GraphStateType,
): 'generateStoryCaption' | typeof END {
  return state.error ? END : 'generateStoryCaption'
}

function shouldContinueAfterGeneration(
  state: GraphStateType,
): 'scoreCandidates' | typeof END {
  return state.error ? END : 'scoreCandidates'
}

function shouldContinueAfterScoring(
  state: GraphStateType,
): 'selectBest' | typeof END {
  return state.error ? END : 'selectBest'
}

// ============================================================
// グラフ構築
// ============================================================

function buildStoryGraph() {
  const graph = new StateGraph(StoryGraphState)
    .addNode('analyzeBlogContent', analyzeBlogContent)
    .addNode('generateStoryCaption', generateStoryCaption)
    .addNode('scoreCandidates', scoreCandidates)
    .addNode('selectBest', selectBest)
    .addEdge(START, 'analyzeBlogContent')
    .addConditionalEdges('analyzeBlogContent', shouldContinueAfterAnalysis)
    .addConditionalEdges('generateStoryCaption', shouldContinueAfterGeneration)
    .addConditionalEdges('scoreCandidates', shouldContinueAfterScoring)
    .addEdge('selectBest', END)

  return graph.compile()
}

// ============================================================
// エクスポート関数
// ============================================================

const compiledGraph = buildStoryGraph()

export async function generateInstagramStory(
  input: StoryGraphInput,
): Promise<StoryGraphOutput> {
  const result = await compiledGraph.invoke({
    blogTitle: input.blogTitle,
    blogSlug: input.blogSlug,
    blogContent: input.blogContent,
    blogExcerpt: input.blogExcerpt ?? null,
    blogTags: input.blogTags ? [...input.blogTags] : [],
  })

  if (result.error) {
    throw new Error(result.error)
  }

  if (!result.finalCaption) {
    throw new Error('Story generation produced no output')
  }

  const ctaUrl = `https://nands.tech/system-dev-lp?utm_source=instagram&utm_medium=story&utm_campaign=blog_${input.blogSlug}`

  return {
    caption: result.finalCaption,
    hashtags: result.hashtags,
    ctaUrl,
    imagePrompt: result.imagePrompt ?? '',
    scores: result.scores,
    allCandidates: result.candidates,
  }
}
