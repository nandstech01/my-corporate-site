/**
 * LangGraph X投稿生成パイプライン
 *
 * CLI (scripts/post-to-x.ts) と Admin UI (API route) の両方から
 * 呼び出せる共通エンジン。
 *
 * パイプライン (7段階):
 *   START → analyzeContent → selectPattern → generateCandidates
 *         → scoreCandidates → critiqueAndRevise → finalScore → formatFinal → END
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { createClient } from '@supabase/supabase-js'
import {
  patternTemplates,
} from './pattern-templates'
import { selectPatternByBandit } from '../learning/pattern-bandit'
import { TagGenerator } from './tag-generator'
import { X_TWITTER_RULES } from '../prompts/sns/x-twitter'
import { formatVoiceProfileForPrompt } from '../prompts/voice-profile'
import { getTwitterWeightedLength } from '../x-api/client'
import { critiquePost, revisePost } from '../content-critique/critique-engine'
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
  mode: 'article' | 'research' | 'thread'
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
  readonly articleTitle?: string
  readonly articleKeyPoints?: readonly string[]
  readonly critiqueResult?: CritiqueResult
  readonly revisedCandidate?: string
}

// ============================================================
// State定義
// ============================================================

const PostGraphState = Annotation.Root({
  // 入力
  mode: Annotation<'article' | 'research' | 'thread'>,
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

  // Critique stage
  critiqueResult: Annotation<CritiqueResult | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  revisedCandidate: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // 出力
  finalPost: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  articleTitle: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  articleKeyPoints: Annotation<string[] | null>({
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

function createModel() {
  return new ChatOpenAI({
    modelName: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// ノード1: analyzeContent
// ============================================================

async function analyzeContent(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel()

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
  ) as ContentAnalysis
  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    analysis,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード2: selectPattern（純粋関数、LLM不要）
// ============================================================

async function selectPattern(state: GraphStateType): Promise<Partial<GraphStateType>> {
  // Try bandit pattern selection first
  let selectedId: string
  try {
    const allPatternIds = patternTemplates.map((p) => p.id)
    const banditChoice = await selectPatternByBandit(allPatternIds, 'x')
    const matched = patternTemplates.find((p) => p.id === banditChoice)
    selectedId = matched ? banditChoice : (state.analysis?.recommendedPatternId ?? 'practitioner_take')
    process.stdout.write(`X pattern selected by bandit: ${selectedId}\n`)
  } catch {
    // Fallback to LLM-recommended pattern
    const recommendedId = state.analysis?.recommendedPatternId ?? 'practitioner_take'
    const matched = patternTemplates.find((p) => p.id === recommendedId)
    selectedId = matched ? recommendedId : 'practitioner_take'
  }

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
// トレンドトピック取得
// ============================================================

async function recallTrendingTopics(): Promise<string> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return ''

    const supabase = createClient(url, key)
    const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
    if (!userId) return ''

    const twoDaysAgo = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000,
    ).toISOString()

    const { data } = await supabase
      .from('slack_bot_memory')
      .select('content')
      .eq('slack_user_id', userId)
      .eq('memory_type', 'fact')
      .contains('context', { source: 'trending_topics' })
      .gte('created_at', twoDaysAgo)
      .order('created_at', { ascending: false })
      .limit(3)

    if (!data || data.length === 0) return ''

    return data.map((m) => m.content).join('\n')
  } catch {
    return ''
  }
}

// ============================================================
// ノード3: generateCandidates
// ============================================================

async function generateCandidates(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel()

  const isArticle = state.mode === 'article'
  const isThread = state.mode === 'thread'

  const voiceProfile = formatVoiceProfileForPrompt(isArticle ? 'article' : 'short')

  const charConstraint = isArticle
    ? '3000-8000文字の有料記事スタイル長文投稿'
    : isThread
      ? '3セグメントのスレッド（各セグメント日本語120文字以内）'
      : '日本語120文字以内の投稿（X APIはCJK文字を2カウント換算。280カウント上限のため日本語は実質140文字が限界。余裕を持って120文字以内で）'

  const modeInstructions = isArticle
    ? `- バズるX有料記事スタイルの長文投稿（3000-8000文字）を作成せよ
- URLは本文に含めないこと（リプライで自動投稿される）
- 構成:
  冒頭: 共感フック（「こんな経験ありませんか？」→ 番号付き具体例3-5個）
  接続: 「全部、〇〇前の自分。」のような個人接続
  結論先出し: 太字で結論を宣言
  本文: 8-12の番号付きセクション（各: 概念→個人体験→実例）
  各セクションにカジュアルな独り言・ツッコミを挟む（「(いや、これマジで？w)」）
  「やりがちなミス」「よくある誤解」セクションを1-2個入れる
  まとめ: 箇条書き5-7個
  締め: 哲学的テイクアウェイ
- 語り口: 解説系インフルエンサーのカジュアルなトーン（「〜していく」「〜なんだよね」「ぶっちゃけ」）
- ハッシュタグ0-1個
- ※長文投稿なので280文字制限は適用しない。3000-8000文字で書くこと。`
    : isThread
      ? `- 3セグメントのスレッドを作成
- 各セグメントは日本語120文字以内（CJK=2カウント、280カウント上限）
- セグメント区切りは「===」を使用
- 1st: フック（注意を引く最重要の一言）
- 2nd: 本論（核心情報・分析）
- 3rd: CTA（問いかけ or アクション促進）
- URLは入れるな
- ハッシュタグは3rdセグメントにのみ0-1個`
      : `- 日本語120文字以内厳守（X APIはCJK=2カウント。280カウント上限のため日本語テキストは120文字以内で書け）
- URLは入れるな
- [URL]や{url}プレースホルダー禁止`

  const trendingTopics = await recallTrendingTopics()
  const trendingSection = trendingTopics
    ? `\n## 今AIコミュニティで話題のトピック（関連性を持たせろ）\n${trendingTopics}\n`
    : ''

  const bestPractices = `
## 投稿のベストプラクティス
- 1行目で読者の注意を引くフック
- 議論を呼ぶ問いかけで締める
- ハッシュタグ0-1個
- 抽象分析より具体的な実務価値
- 実体験ベースの語り口`

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。以下のルールに従い、${charConstraint}を3候補作成。

${X_TWITTER_RULES}

${voiceProfile}

${modeInstructions}
${trendingSection}
${bestPractices}

3候補を「---」で区切って出力。候補のみ、説明不要。`,
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

async function scoreCandidates(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (state.candidates.length === 0) {
    return { error: 'No candidates to score' }
  }

  const model = createModel()

  const candidateList = state.candidates
    .map((c, i) => `【候補${i + 1}】\n${c}`)
    .join('\n\n')

  const isArticle = state.mode === 'article'
  const targetLength = isArticle ? '3000-8000文字' : '日本語120文字以内（280加重カウント以内）'

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはX投稿の品質評価者です。@nands_tech（AI実務家）の投稿として適切か評価してください。
以下の候補を5基準で評価してください。各0-10点。

基準:
1. practitionerVoice: 実務家の声として自然か（URLが本文内 → -5点、ニュース口調「〜を発表」→ 0点、元のニュース内容と無関係な架空体験 → 0点）
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
  ) as CandidateScore[]
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

  // Determine mode for constitution
  const critiqueMode = state.mode === 'article' ? 'article' : 'short'

  // 5次元評価
  const critique = await critiquePost({
    text: bestCandidate,
    platform: 'x',
    mode: critiqueMode,
    sourceContent: state.content.slice(0, 1000),
  })

  process.stdout.write(
    `X critique: score=${critique.overallScore}/50, passed=${critique.passed}\n`,
  )

  // Adaptive exit: 高品質ならスキップ
  if (critique.passed) {
    return { critiqueResult: critique }
  }

  // 改訂版生成
  const revised = await revisePost({
    originalText: bestCandidate,
    critique,
    platform: 'x',
    mode: critiqueMode,
  })

  return {
    critiqueResult: critique,
    revisedCandidate: revised,
  }
}

// ============================================================
// ノード6: finalScore（Knockout）
// ============================================================

async function finalScore(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.revisedCandidate || !state.critiqueResult) {
    return {}
  }

  // 改訂版を再スコアリング
  const critiqueMode = state.mode === 'article' ? 'article' : 'short'
  const revisedCritique = await critiquePost({
    text: state.revisedCandidate,
    platform: 'x',
    mode: critiqueMode,
    sourceContent: state.content.slice(0, 1000),
  })

  process.stdout.write(
    `X finalScore: original=${state.critiqueResult.overallScore}, revised=${revisedCritique.overallScore}\n`,
  )

  // Knockout: 高い方を採用
  if (revisedCritique.overallScore > state.critiqueResult.overallScore) {
    // 改訂版の勝ち → finalPostに設定
    return {
      critiqueResult: revisedCritique,
      finalPost: state.revisedCandidate,
    }
  }

  // 原文の勝ち → revisedCandidateをクリア
  return { revisedCandidate: null }
}

// ============================================================
// ノード7: formatFinal（純粋関数）
// ============================================================

function formatFinal(state: GraphStateType): Partial<GraphStateType> {
  // finalScore で改訂版が採用済みの場合はスキップ
  if (state.finalPost) {
    return {}
  }

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

  // Thread mode: validate each segment independently
  const WEIGHTED_LIMIT = 280
  if (state.mode === 'thread') {
    const segments = withTag.split('===').map((s) => s.trim()).filter((s) => s.length > 0)
    const validatedSegments = segments.map((segment) => {
      if (getTwitterWeightedLength(segment) <= WEIGHTED_LIMIT) return segment
      let truncated = segment
      while (getTwitterWeightedLength(truncated) > WEIGHTED_LIMIT - 3 && truncated.length > 0) {
        truncated = truncated.slice(0, -1)
      }
      return truncated + '...'
    })
    return { finalPost: validatedSegments.join('\n===\n') }
  }

  // 文字数最終チェック（researchモードのみ、Twitter加重カウント使用）
  if (state.mode === 'research' && getTwitterWeightedLength(withTag) > WEIGHTED_LIMIT) {
    // タグなし版が制限内ならタグを除去
    if (getTwitterWeightedLength(bestCandidate) <= WEIGHTED_LIMIT) {
      return { finalPost: bestCandidate }
    }
    // それでも超過する場合は切り詰め
    let truncated = withTag
    while (getTwitterWeightedLength(truncated) > WEIGHTED_LIMIT - 3 && truncated.length > 0) {
      truncated = truncated.slice(0, -1)
    }
    return { finalPost: truncated + '...' }
  }

  // Article mode: extract title and key points
  if (state.mode === 'article') {
    const lines = withTag.split('\n').filter((l) => l.trim().length > 0)
    const articleTitle = lines[0]?.trim() ?? null
    const numberedLines = lines.filter((l) => /^\d+[\.\)、]\s*/.test(l.trim()))
    const articleKeyPoints = numberedLines
      .slice(0, 3)
      .map((l) => l.trim().replace(/^\d+[\.\)、]\s*/, ''))
    return {
      finalPost: withTag,
      articleTitle,
      articleKeyPoints: articleKeyPoints.length > 0 ? articleKeyPoints : null,
    }
  }

  return { finalPost: withTag }
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
): 'critiqueAndRevise' | typeof END {
  return state.error ? END : 'critiqueAndRevise'
}

function shouldRevise(
  state: GraphStateType,
): 'finalScore' | 'formatFinal' {
  // Adaptive exit: 高品質 or 改訂版なし → スキップ
  if (!state.critiqueResult || state.critiqueResult.passed) return 'formatFinal'
  if (!state.revisedCandidate) return 'formatFinal'
  return 'finalScore'
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
    .addNode('critiqueAndRevise', critiqueAndRevise)
    .addNode('finalScore', finalScore)
    .addNode('formatFinal', formatFinal)
    .addEdge(START, 'analyzeContent')
    .addConditionalEdges('analyzeContent', shouldContinueAfterAnalysis)
    .addEdge('selectPattern', 'generateCandidates')
    .addConditionalEdges('generateCandidates', shouldContinueAfterCandidates)
    .addConditionalEdges('scoreCandidates', shouldContinueAfterScoring)
    .addConditionalEdges('critiqueAndRevise', shouldRevise)
    .addEdge('finalScore', 'formatFinal')
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

  const result = await app.invoke(
    {
      mode: input.mode,
      content: input.content,
      title: input.title ?? null,
      slug: input.slug ?? null,
      topic: input.topic ?? null,
      tags: input.tags ?? null,
    },
    {
      runName: `x-post-${input.mode}`,
      tags: ['x-post', input.mode],
      metadata: {
        mode: input.mode,
        slug: input.slug ?? null,
      },
    },
  )

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
    ...(result.articleTitle ? { articleTitle: result.articleTitle } : {}),
    ...(result.articleKeyPoints ? { articleKeyPoints: result.articleKeyPoints } : {}),
    ...(result.critiqueResult ? { critiqueResult: result.critiqueResult } : {}),
    ...(result.revisedCandidate ? { revisedCandidate: result.revisedCandidate } : {}),
  }
}
