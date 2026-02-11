/**
 * LangGraph X投稿生成パイプライン
 *
 * CLI (scripts/post-to-x.ts) と Admin UI (API route) の両方から
 * 呼び出せる共通エンジン。
 *
 * パイプライン:
 *   START → analyzeContent → selectPattern → generateCandidates
 *         → scoreCandidates → formatFinal → END
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import {
  patternTemplates,
  TONE_GUIDELINES,
  type PatternTemplate,
} from './pattern-templates'
import { TagGenerator } from './tag-generator'
import { X_TWITTER_RULES } from '../prompts/sns/x-twitter'

// ============================================================
// 型定義
// ============================================================

export interface ContentAnalysis {
  keywords: string[]
  tone: string
  recommendedPatternId: string
  summary: string
}

export interface CandidateScore {
  index: number
  practitionerVoice: number
  accuracy: number
  discussionPotential: number
  lengthFit: number
  originality: number
  total: number
}

export interface PostGraphInput {
  mode: 'article' | 'research'
  content: string
  title?: string
  slug?: string
  topic?: string
  tags?: string[]
}

export interface PostGraphOutput {
  finalPost: string
  patternUsed: string
  tags: string[]
  scores: CandidateScore[]
  allCandidates: string[]
  promptTokens: number
  completionTokens: number
}

// ============================================================
// State定義
// ============================================================

const PostGraphState = Annotation.Root({
  // 入力
  mode: Annotation<'article' | 'research'>,
  content: Annotation<string>,
  title: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  slug: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  topic: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  tags: Annotation<string[] | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // 中間
  analysis: Annotation<ContentAnalysis | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  selectedPatternId: Annotation<string | null>({
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
  scores: Annotation<CandidateScore[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  // 出力
  finalPost: Annotation<string | null>({
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

type GraphStateType = typeof PostGraphState.State

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

function formatToneGuidelines(): string {
  return [
    '【口調ガイドライン】',
    `推奨表現: ${TONE_GUIDELINES.good_expressions.join('、')}`,
    `避ける表現: ${TONE_GUIDELINES.avoid_expressions.join('、')}`,
    `基本方針: ${TONE_GUIDELINES.principles.join('、')}`,
  ].join('\n')
}

// ============================================================
// ノード1: analyzeContent
// ============================================================

async function analyzeContent(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel(0.2)

  const patternList = patternTemplates
    .map((p) => `- ${p.id}: ${p.name} (${p.description})`)
    .join('\n')

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_techのAI実装者の視点を持つ投稿設計者です。
与えられたコンテンツを分析し、以下のJSON形式で結果を返してください。

利用可能なパターンID:
${patternList}

JSONのみ出力してください:
{
  "keywords": ["キーワード1", "キーワード2", ...],
  "tone": "推奨トーン（実装者目線/設計者目線/経営者目線/探究者目線）",
  "recommendedPatternId": "最適なパターンID",
  "summary": "コンテンツの30文字要約"
}`,
    },
    {
      role: 'user' as const,
      content: `モード: ${state.mode}\n${state.title ? `タイトル: ${state.title}\n` : ''}${state.topic ? `トピック: ${state.topic}\n` : ''}\nコンテンツ（先頭2000文字）:\n${state.content.slice(0, 2000)}`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { error: 'Failed to parse content analysis JSON' }
  }

  const ContentAnalysisSchema = z.object({
    keywords: z.array(z.string()).default([]),
    tone: z.string().default('実装者目線'),
    recommendedPatternId: z.string().default('practitioner_take'),
    summary: z.string().default(''),
  })

  const analysis: ContentAnalysis = ContentAnalysisSchema.parse(
    JSON.parse(jsonMatch[0]),
  )
  const usage = response.usage_metadata

  return {
    analysis,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード2: selectPattern（純粋関数、LLM不要）
// ============================================================

function selectPattern(state: GraphStateType): Partial<GraphStateType> {
  const recommendedId = state.analysis?.recommendedPatternId ?? 'practitioner_take'
  const matched = patternTemplates.find((p) => p.id === recommendedId)
  const selectedId = matched ? recommendedId : 'practitioner_take'

  // TagGeneratorでハッシュタグ生成（0-1個）
  const tagGenerator = new TagGenerator()
  const tagResult = tagGenerator.generateTags({
    patternId: selectedId,
    content: state.content.slice(0, 1000),
    ragSources: [],
    maxTags: 1,
  })

  return {
    selectedPatternId: selectedId,
    generatedTags: tagResult.all,
  }
}

// ============================================================
// ノード3: generateCandidates
// ============================================================

async function generateCandidates(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel(0.8)
  const toneText = formatToneGuidelines()
  const pattern = patternTemplates.find(
    (p) => p.id === state.selectedPatternId,
  ) as PatternTemplate

  const isArticle = state.mode === 'article'

  const charConstraint = isArticle
    ? '1000-2000文字の長文投稿'
    : '280文字以内の投稿'

  const modeInstructions = isArticle
    ? `- 記事の内容を実務家視点で語る長文投稿を作成
- URLは本文に含めないこと（リプライで自動投稿される）
- 構成: 自分の経験から入る → 記事のポイントを実務家視点で解説 → 問いかけで締める
- ハッシュタグ0-1個
- ※長文投稿なので280文字制限は適用しない。1000-2000文字で書くこと。`
    : `- ${X_TWITTER_RULES}
- ハッシュタグ0-1個（入れなくてよい）
- 280文字以内厳守
- URLは絶対に本文に含めるな（リプライで自動投稿される）
- [URL]や{url}などのプレースホルダーは絶対に使うな
- 「〜を発表」「詳細は👉」で始めるな。実務家の独自視点で語れ`

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech本人として投稿を書く。AI実装者・RAG設計者・経営者。
以下のパターンに従い、${charConstraint}を3候補作成してください。

パターン: ${pattern.name} - ${pattern.description}

要件:
${modeInstructions}

${toneText}

3候補を「---」で区切って出力してください。候補のみ出力し、説明は不要です。`,
    },
    {
      role: 'user' as const,
      content: `${state.title ? `タイトル: ${state.title}\n` : ''}${state.topic ? `トピック: ${state.topic}\n` : ''}${state.tags ? `タグ: ${state.tags.join(', ')}\n` : ''}\nコンテンツ:\n${state.content.slice(0, 6000)}`,
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

  const usage = response.usage_metadata

  return {
    candidates,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード4: scoreCandidates
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

  const isArticle = state.mode === 'article'
  const targetLength = isArticle ? '1000-2000文字' : '280文字以内'

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはX投稿の品質評価者です。@nands_tech（AI実務家）の投稿として適切か評価してください。
以下の候補を5基準で評価してください。各0-10点。

基準:
1. practitionerVoice: 実務家の声として自然か（URLが本文内にある → -5点、ニュース口調「〜を発表」→ 0点）
2. accuracy: 情報の正確性
3. discussionPotential: 議論を生む力（問いかけなし → 低スコア）
4. lengthFit: 文字数適合度（目標: ${targetLength}）
5. originality: 独自の視点・切り口（ハッシュタグ2個以上 → -3点、煽り表現「ヤバい」「致命的」「🚨🔥」→ -5点）

JSON配列のみ出力:
[
  {"index":0,"practitionerVoice":8,"accuracy":9,"discussionPotential":7,"lengthFit":9,"originality":8,"total":41},
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
    // フォールバック: 最初の候補を選定
    const fallbackScores: CandidateScore[] = state.candidates.map((_, i) => ({
      index: i,
      practitionerVoice: 5,
      accuracy: 5,
      discussionPotential: 5,
      lengthFit: 5,
      originality: 5,
      total: 25,
    }))
    return {
      scores: fallbackScores,
      promptTokens: response.usage_metadata?.input_tokens ?? 0,
      completionTokens: response.usage_metadata?.output_tokens ?? 0,
    }
  }

  const CandidateScoreSchema = z.array(
    z.object({
      index: z.number(),
      practitionerVoice: z.number().default(5),
      accuracy: z.number().default(5),
      discussionPotential: z.number().default(5),
      lengthFit: z.number().default(5),
      originality: z.number().default(5),
      total: z.number().default(25),
    }),
  )

  const scores: CandidateScore[] = CandidateScoreSchema.parse(
    JSON.parse(jsonMatch[0]),
  )
  const usage = response.usage_metadata

  return {
    scores,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード5: formatFinal（純粋関数）
// ============================================================

function formatFinal(state: GraphStateType): Partial<GraphStateType> {
  if (state.candidates.length === 0 || state.scores.length === 0) {
    return { error: 'No candidates or scores available' }
  }

  // 最高スコア候補を選定
  const sortedScores = [...state.scores].sort(
    (a, b) => b.total - a.total,
  )
  const bestIndex = sortedScores[0].index
  const bestCandidate =
    state.candidates[bestIndex] ?? state.candidates[0]

  // タグ付与（0-1個のみ）
  const tag = state.generatedTags[0]
  const hasTagInCandidate = tag
    ? bestCandidate.includes(tag)
    : true

  const withTag =
    !hasTagInCandidate && tag
      ? `${bestCandidate}\n\n${tag}`
      : bestCandidate

  // 文字数最終チェック（researchモードのみ）
  const finalPost =
    state.mode === 'research' && withTag.length > 280
      ? bestCandidate.length <= 280
        ? bestCandidate
        : withTag.slice(0, 277) + '...'
      : withTag

  return { finalPost }
}

// ============================================================
// 条件分岐
// ============================================================

function shouldContinueAfterAnalysis(
  state: GraphStateType,
): 'selectPattern' | typeof END {
  return state.error ? END : 'selectPattern'
}

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

function buildPostGraph() {
  const graph = new StateGraph(PostGraphState)
    .addNode('analyzeContent', analyzeContent)
    .addNode('selectPattern', selectPattern)
    .addNode('generateCandidates', generateCandidates)
    .addNode('scoreCandidates', scoreCandidates)
    .addNode('formatFinal', formatFinal)
    .addEdge(START, 'analyzeContent')
    .addConditionalEdges('analyzeContent', shouldContinueAfterAnalysis)
    .addEdge('selectPattern', 'generateCandidates')
    .addConditionalEdges('generateCandidates', shouldContinueAfterCandidates)
    .addConditionalEdges('scoreCandidates', shouldContinueAfterScoring)
    .addEdge('formatFinal', END)

  return graph.compile()
}

// ============================================================
// エクスポート関数
// ============================================================

const compiledGraph = buildPostGraph()

export async function generateXPost(
  input: PostGraphInput,
): Promise<PostGraphOutput> {
  const app = compiledGraph

  const result = await app.invoke({
    mode: input.mode,
    content: input.content,
    title: input.title ?? null,
    slug: input.slug ?? null,
    topic: input.topic ?? null,
    tags: input.tags ?? null,
  })

  if (result.error) {
    throw new Error(result.error)
  }

  if (!result.finalPost) {
    throw new Error('Post generation produced no output')
  }

  return {
    finalPost: result.finalPost,
    patternUsed: result.selectedPatternId ?? 'practitioner_take',
    tags: result.generatedTags,
    scores: result.scores,
    allCandidates: result.candidates,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
  }
}
