/**
 * LangGraph Threads投稿生成パイプライン
 *
 * 7段階パイプラインでThreads向け会話型投稿を生成。
 *
 * パイプライン:
 *   START -> analyzeContent -> selectPattern -> generateCandidates
 *         -> scoreCandidates -> critiqueAndRevise -> finalScore -> formatFinal -> END
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { selectThreadsPattern } from './threads-bandit'
import {
  threadsPatternTemplates,
  THREADS_PATTERN_IDS,
  THREADS_TONE_GUIDELINES,
} from './threads-templates'
import type { ThreadsPatternTemplate } from './threads-templates'
import {
  ThreadsCandidateScoreSchema,
  type ThreadsCandidateScore,
} from './threads-scoring'
import { VIRAL_HOOK_PATTERNS } from '../viral-hooks/hook-templates'
import type { HookPattern } from '../viral-hooks/hook-templates'
import { getThreadsLearnings } from '../slack-bot/proactive/threads-learnings'
import { critiquePost, revisePost } from '../content-critique/critique-engine'
import { formatVoiceProfileForPrompt } from '../prompts/voice-profile'
import { researchTopic } from '../x-post-generation/data-fetchers'
import { createClient } from '@supabase/supabase-js'
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

interface ContentAnalysis {
  readonly keywords: readonly string[]
  readonly tone: string
  readonly recommendedPatternId: string
  readonly narrativeArc: string
  readonly summary: string
}

export interface ThreadsGraphInput {
  readonly content: string
  readonly topic?: string
  readonly sourceUrl?: string
  readonly trendingContext?: string
}

export interface ThreadsGraphOutput {
  readonly finalPost: string
  readonly patternUsed: string
  readonly tags: readonly string[]
  readonly scores?: readonly ThreadsCandidateScore[]
  readonly hookUsed?: string
  readonly critiqueResult?: CritiqueResult
  readonly revisedCandidate?: string
}

// ============================================================
// State定義
// ============================================================

const ThreadsPostState = Annotation.Root({
  // Input
  content: Annotation<string>,
  topic: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  sourceUrl: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  trendingContext: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // Intermediate
  analysis: Annotation<ContentAnalysis | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  selectedPatternId: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  selectedHookId: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  researchContext: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  candidates: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  scores: Annotation<ThreadsCandidateScore[]>({
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

  // Output
  finalPost: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  error: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
})

type GraphStateType = typeof ThreadsPostState.State

// ============================================================
// ヘルパー
// ============================================================

function createModel() {
  return new ChatOpenAI({
    modelName: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

function selectHook(keywords: readonly string[]): HookPattern | null {
  const candidates = VIRAL_HOOK_PATTERNS.filter(
    (h) => h.target_audience === 'developer' || h.target_audience === 'all',
  )

  if (candidates.length === 0) return null

  const lowerKeywords = keywords.map((k) => k.toLowerCase())

  const scored = candidates.map((hook) => {
    const keywordHits = hook.use_cases.filter((uc) =>
      lowerKeywords.some((kw) => uc.toLowerCase().includes(kw)),
    ).length
    return { hook, score: keywordHits + hook.effectiveness_score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].hook
}

// ============================================================
// ノード1: analyzeContent (LLM)
// ============================================================

async function analyzeContent(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel()

  const patternList = threadsPatternTemplates
    .map((p) => `- ${p.id}: ${p.name} (${p.description})`)
    .join('\n')

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_techのThreads投稿設計者です。
与えられたコンテンツを分析し、以下のJSON形式で結果を返してください。

利用可能なパターンID:
${patternList}

JSONのみ出力してください:
{
  "keywords": ["キーワード1", "キーワード2", ...],
  "tone": "推奨トーン（実務家目線/思考リーダー/カジュアル共有/逆張り考察）",
  "recommendedPatternId": "最適なパターンID",
  "narrativeArc": "観察→分析→問い / 体験→発見→共有 / 主張→根拠→議論",
  "summary": "コンテンツの30文字要約"
}`,
    },
    {
      role: 'user' as const,
      content: `${state.topic ? `トピック: ${state.topic}\n` : ''}コンテンツ（先頭2000文字）:\n${state.content.slice(0, 2000)}`,
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
    tone: z.string().default('実務家目線'),
    recommendedPatternId: z.string().default('insight_narrative'),
    narrativeArc: z.string().default('観察→分析→問い'),
    summary: z.string().default(''),
  })

  try {
    const analysis = ContentAnalysisSchema.parse(
      JSON.parse(jsonMatch[0]),
    ) as ContentAnalysis
    return { analysis }
  } catch {
    return { error: 'Content analysis JSON validation failed' }
  }
}

// ============================================================
// ノード2: selectPattern（純粋関数、LLM不要）
// ============================================================

async function selectPattern(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  // Bandit selection
  let selectedId: string
  try {
    const banditTemplate = await selectThreadsPattern()
    selectedId = banditTemplate.id
    process.stdout.write(`Threads pattern selected by bandit: ${selectedId}\n`)
  } catch {
    // Fallback to LLM-recommended pattern
    const recommendedId =
      state.analysis?.recommendedPatternId ?? 'insight_narrative'
    const matched = threadsPatternTemplates.find(
      (p) => p.id === recommendedId,
    )
    selectedId = matched ? recommendedId : 'insight_narrative'
  }

  // Hook selection based on content keywords
  const keywords = state.analysis?.keywords ?? []
  const hook = selectHook(keywords)

  return {
    selectedPatternId: selectedId,
    selectedHookId: hook?.id ?? null,
  }
}

// ============================================================
// ノード2a: researchPrimarySources（Brave Search一次情報リサーチ）
// ============================================================

function getThreadsResearchSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function researchPrimarySources(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  try {
    const topic = state.topic ?? state.content.slice(0, 100)

    // Check cache (6h)
    const sb = getThreadsResearchSupabase()
    if (sb) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      const { data: cached } = await sb
        .from('slack_bot_memory')
        .select('context')
        .eq('memory_type', 'fact')
        .like('content', `%research_cache:${topic.slice(0, 30)}%`)
        .gte('created_at', sixHoursAgo)
        .limit(1)
        .single()

      if (cached?.context?.research_results) {
        process.stdout.write(`Threads research: cache hit for "${topic.slice(0, 30)}"\n`)
        return { researchContext: cached.context.research_results as string }
      }
    }

    const research = await researchTopic(topic, state.sourceUrl || undefined)
    const formatted = research.searchResults.length > 0
      ? '■ 一次情報リサーチ結果:\n' + research.searchResults.slice(0, 5).map(r =>
          `- ${r.title}: ${r.description} (${r.url})`
        ).join('\n')
      : null

    // Cache result
    if (formatted && sb) {
      await sb.from('slack_bot_memory').insert({
        user_id: 'system-pipeline',
        memory_type: 'fact' as const,
        content: `research_cache:${topic.slice(0, 30)}`,
        context: { type: 'research_cache', topic: topic.slice(0, 50), research_results: formatted },
        importance: 0.3,
      }).catch(() => {})
    }

    process.stdout.write(`Threads research: ${research.searchResults.length} results found\n`)
    return { researchContext: formatted }
  } catch (e) {
    process.stdout.write(`Threads research failed, continuing without: ${e}\n`)
    return { researchContext: null }
  }
}

// ============================================================
// ノード3: generateCandidates (LLM)
// ============================================================

async function generateCandidates(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel()

  // Selected pattern info
  const pattern: ThreadsPatternTemplate | undefined =
    threadsPatternTemplates.find((p) => p.id === state.selectedPatternId)
  const patternSection = pattern
    ? `## 選択パターン: ${pattern.name}
テンプレート:
${pattern.template}
会話の締め方の参考: ${pattern.conversationCloser}`
    : ''

  // Hook info
  const hookPattern: HookPattern | undefined = state.selectedHookId
    ? VIRAL_HOOK_PATTERNS.find((h) => h.id === state.selectedHookId)
    : undefined
  const hookSection = hookPattern
    ? `## 冒頭フック参考
パターン: ${hookPattern.template}
例: ${hookPattern.example}`
    : ''

  // Trending context
  const trendingSection = state.trendingContext
    ? `## 今AIコミュニティで話題のトピック（関連があれば自然に織り込め）
${state.trendingContext}`
    : ''

  // Learnings injection
  let learningsSection = ''
  try {
    const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
    if (userId) {
      const learnings = await getThreadsLearnings(userId)
      if (learnings) {
        learningsSection = `## 過去の高パフォーマンス投稿の特徴
${learnings.highPerformerSummary}`
      }
    }
  } catch {
    // Learnings fetch failure should not block generation
  }

  // Voice profile
  const voiceProfile = formatVoiceProfileForPrompt('threads')

  // Tone guidelines
  const goodExpressions = THREADS_TONE_GUIDELINES.good_expressions
    .slice(0, 5)
    .join('」「')
  const avoidExpressions = THREADS_TONE_GUIDELINES.avoid_expressions
    .slice(0, 5)
    .join('」「')

  // Narrative arc hint
  const narrativeArc = state.analysis?.narrativeArc ?? ''
  const narrativeSection = narrativeArc
    ? `## 推奨ナラティブ構成: ${narrativeArc}`
    : ''

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。以下のルールに従い、Threads向け投稿を3候補作成。

## Threadsプラットフォームルール
- 500文字以内（厳守）
- 会話調トーン（「です・ます」ではなく「〜と思う」「ぶっちゃけ」のカジュアルさ）
- 語尾NG: 「〜なんだよね」「〜だよね」「〜よね」は禁止。言い切れ
- 締め方: 問いかけだけでなく、考えさせる余韻で終わらせてもいい（断定・含み・独白）
  - 例: 「〜についてどう思う？」も良いが、毎回ではなく、「ここが分水嶺になる」「答えは出てない」のような余韻も使え
- ハッシュタグは最大1個（付けなくてもOK）
- リンクURLは本文に含めない
- 絵文字は控えめに（0-2個）

## 投稿スタイル
- 1行目でフック（注目を引く一言）
- 具体的な数字やファクトを1つ以上含める
- 自分の考え・実体験を軸に語る
- 最後に問いかけで会話を誘発
- 200-400文字が最適範囲

${voiceProfile}

## 良い表現例
「${goodExpressions}」

## 避ける表現
「${avoidExpressions}」

## NGパターン
- ニュースbot的な「〜を発表」口調
- 煽り表現（「ヤバい」「致命的」等）
- 抽象的すぎる感想（「すごい」「画期的」のみ）
- URL/リンクプレースホルダー

${patternSection}
${hookSection}
${narrativeSection}
${trendingSection}
${learningsSection}
${state.researchContext ? `\n## 一次情報リサーチ結果（引用に活用）\n${state.researchContext}` : ''}

3候補を「---」で区切って出力。候補のみ、説明不要。`,
    },
    {
      role: 'user' as const,
      content: `${state.topic ? `トピック: ${state.topic}\n` : ''}コンテンツ:\n${state.content.slice(0, 4000)}`,
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

  if (candidates.length === 0) {
    return { error: 'Threads post generation produced no candidates' }
  }

  return { candidates }
}

// ============================================================
// ノード4: scoreCandidates (LLM)
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

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはThreads投稿の品質評価者です。@nands_tech（AI実務家）の投稿として適切か評価してください。
以下の候補を5基準で評価してください。各0-10点。

基準:
1. narrativeDepth: ストーリー性（体験ベースの語りになっているか）
2. accuracy: 事実正確性（元のコンテンツに忠実か）
3. conversationPotential: リプライ誘発力（問いかけなし -> 低スコア、答えたくなる問い -> 高スコア）
4. lengthFit: 200-400文字の最適範囲に収まっているか（500文字超過 -> 0点）
5. hookStrength: 冒頭の引き（1行目で読み手の注意を引けるか）

JSON配列のみ出力:
[
  {"index":0,"narrativeDepth":8,"accuracy":9,"conversationPotential":7,"lengthFit":9,"hookStrength":8,"total":41},
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
    // Fallback: equal scores for all candidates
    const fallbackScores: ThreadsCandidateScore[] = state.candidates.map(
      (_, i) => ({
        index: i,
        narrativeDepth: 5,
        accuracy: 5,
        conversationPotential: 5,
        lengthFit: 5,
        hookStrength: 5,
        total: 25,
      }),
    )
    return { scores: fallbackScores }
  }

  try {
    const scores = ThreadsCandidateScoreSchema.parse(
      JSON.parse(jsonMatch[0]),
    ) as ThreadsCandidateScore[]
    return { scores }
  } catch {
    const fallbackScores: ThreadsCandidateScore[] = state.candidates.map(
      (_, i) => ({
        index: i,
        narrativeDepth: 5,
        accuracy: 5,
        conversationPotential: 5,
        lengthFit: 5,
        hookStrength: 5,
        total: 25,
      }),
    )
    return { scores: fallbackScores }
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
    platform: 'threads',
    mode: 'threads',
    sourceContent: state.content.slice(0, 1000),
  })

  process.stdout.write(
    `Threads critique: score=${critique.overallScore}/50, passed=${critique.passed}\n`,
  )

  // Adaptive exit: 高品質ならスキップ
  if (critique.passed) {
    return { critiqueResult: critique }
  }

  // 改訂版生成
  const revised = await revisePost({
    originalText: bestCandidate,
    critique,
    platform: 'threads',
    mode: 'threads',
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
  const revisedCritique = await critiquePost({
    text: state.revisedCandidate,
    platform: 'threads',
    mode: 'threads',
    sourceContent: state.content.slice(0, 1000),
  })

  process.stdout.write(
    `Threads finalScore: original=${state.critiqueResult.overallScore}, revised=${revisedCritique.overallScore}\n`,
  )

  // Knockout: 高い方を採用
  if (revisedCritique.overallScore > state.critiqueResult.overallScore) {
    return {
      critiqueResult: revisedCritique,
      finalPost: state.revisedCandidate,
    }
  }

  // 原文の勝ち
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

  // Pick highest-scoring candidate
  const sortedScores = [...state.scores].sort((a, b) => b.total - a.total)
  const bestIndex = sortedScores[0].index
  const bestCandidate = state.candidates[bestIndex] ?? state.candidates[0]

  // Enforce 500 char limit
  const finalPost =
    bestCandidate.length > 500
      ? bestCandidate.slice(0, 497) + '...'
      : bestCandidate

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
): 'critiqueAndRevise' | typeof END {
  return state.error ? END : 'critiqueAndRevise'
}

function shouldRevise(
  state: GraphStateType,
): 'finalScore' | 'formatFinal' {
  if (!state.critiqueResult || state.critiqueResult.passed) return 'formatFinal'
  if (!state.revisedCandidate) return 'formatFinal'
  return 'finalScore'
}

// ============================================================
// グラフ構築
// ============================================================

function buildThreadsPostGraph() {
  const graph = new StateGraph(ThreadsPostState)
    .addNode('analyzeContent', analyzeContent)
    .addNode('selectPattern', selectPattern)
    .addNode('researchPrimarySources', researchPrimarySources)
    .addNode('generateCandidates', generateCandidates)
    .addNode('scoreCandidates', scoreCandidates)
    .addNode('critiqueAndRevise', critiqueAndRevise)
    .addNode('finalScore', finalScore)
    .addNode('formatFinal', formatFinal)
    .addEdge(START, 'analyzeContent')
    .addConditionalEdges('analyzeContent', shouldContinueAfterAnalysis)
    .addEdge('selectPattern', 'researchPrimarySources')
    .addEdge('researchPrimarySources', 'generateCandidates')
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

const compiledGraph = buildThreadsPostGraph()

export async function generateThreadsPost(
  input: ThreadsGraphInput,
): Promise<ThreadsGraphOutput> {
  const result = await compiledGraph.invoke(
    {
      content: input.content,
      topic: input.topic ?? null,
      sourceUrl: input.sourceUrl ?? null,
      trendingContext: input.trendingContext ?? null,
    },
    {
      runName: 'threads-post',
      tags: ['threads-post'],
    },
  )

  if (result.error) {
    throw new Error(result.error)
  }

  if (!result.finalPost) {
    throw new Error('Threads post generation produced no output')
  }

  // Extract hashtags from final post
  const tagMatch = result.finalPost.match(/#[\w\u3000-\u9FFF]+/g)
  const tags = tagMatch ? tagMatch.slice(0, 1) : []

  // Determine hook used
  const hookUsed = result.selectedHookId
    ? VIRAL_HOOK_PATTERNS.find((h) => h.id === result.selectedHookId)?.name
    : undefined

  return {
    finalPost: result.finalPost,
    patternUsed: result.selectedPatternId ?? 'insight_narrative',
    tags,
    scores: result.scores.length > 0 ? result.scores : undefined,
    hookUsed,
    ...(result.critiqueResult ? { critiqueResult: result.critiqueResult } : {}),
    ...(result.revisedCandidate ? { revisedCandidate: result.revisedCandidate } : {}),
  }
}
