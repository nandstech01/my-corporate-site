/**
 * LangGraph X投稿生成パイプライン
 *
 * CLI (scripts/post-to-x.ts) と Admin UI (API route) の両方から
 * 呼び出せる共通エンジン。
 *
 * パイプライン (8段階):
 *   START → analyzeContent → selectPattern → generateCandidates
 *         → validateHook → scoreCandidates → critiqueAndRevise → finalScore → formatFinal → END
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
  hookStrength: number        // 1行目のスクロール停止力
  voiceAuthenticity: number   // AI感のなさ、実務家の声
  engagementTrigger: number   // リプライ・RT誘発力（質問より大胆な主張）
  platformFit: number         // 文字数・フォーマット適合
  factualGrounding: number    // ソースへの忠実さ
  total: number
}

export interface PostGraphInput {
  mode: 'article' | 'research' | 'thread'
  content: string
  title?: string
  slug?: string
  topic?: string
  tags?: string[]
  recentPostTexts?: readonly string[]
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
  recentPostTexts: Annotation<string[] | null>({
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
      ? '3セグメントのスレッド（各セグメント50-500文字）'
      : '200-500文字の分析投稿（120文字制限なし。X Premiumで長文対応。深い洞察を書け）'

  const modeInstructions = isArticle
    ? `- バズるX有料記事スタイルの長文投稿（3000-8000文字）を作成せよ
- URLは本文に含めないこと（リプライで自動投稿される）
- 構成:
  冒頭: 以下のオープニング戦略からランダムに1つ選べ（毎回変えろ）:
    a) 共感フック: 読者の悩みリスト → 番号付き具体例3-5個
    b) データ起点: 衝撃的な数字・事実から入る
    c) エピソード: 自分の体験談から始める
    d) 問いかけ: 読者への根本的な問い
    e) 結論先出し: 結論を最初に宣言して理由を展開
  接続: 個人的な体験との接続（定型表現を避けろ）
  結論先出し: 結論を宣言
  本文: 8-12の番号付きセクション（各: 概念→個人体験→実例）
  各セクションにカジュアルな独り言・ツッコミを挟む（「(いや、これマジで？w)」）
  「やりがちなミス」「よくある誤解」セクションを1-2個入れる
  まとめ: 箇条書き5-7個
  締め: 哲学的テイクアウェイ
- 語り口: 解説系インフルエンサーのカジュアルなトーン（「〜していく」「ぶっちゃけ」「〜なと。」）
- 語尾NG: 「〜なんだよね」「〜だよね」「〜よね」は使うな。言い切れ
- ハッシュタグ0-1個
- Markdown記号（#, ##, **, ---, ___）は使うな。プレーンテキストで書け。見出しは改行と番号で表現しろ
- ※長文投稿なので280文字制限は適用しない。3000-8000文字で書くこと。`
    : isThread
      ? `- 3セグメントのスレッドを作成
- 各セグメントは50-500文字（内容に応じて調整）
- セグメント区切りは「===」を使用
- 1st: フック（注意を引く最重要の一言）
- 2nd: 本論（核心情報・分析）
- 3rd: CTA（問いかけ or アクション促進）
- URLは入れるな
- ハッシュタグは3rdセグメントにのみ0-1個`
      : `- 200-500文字を目標に書け（X Premiumは25,000文字まで対応。120文字に収める必要はない）
- 具体的な分析・考察・体験談を盛り込め。表面的な一言で終わるな
- 「なぜそうなのか」「実務でどう影響するか」「自分はどう思うか」を必ず含めろ
- URLは入れるな
- [URL]や{url}プレースホルダー禁止`

  const trendingTopics = await recallTrendingTopics()
  const trendingSection = trendingTopics
    ? `\n## 今AIコミュニティで話題のトピック（関連性を持たせろ）\n${trendingTopics}\n`
    : ''

  const recentPostsSection = state.recentPostTexts && state.recentPostTexts.length > 0
    ? `\n## 直近に投稿済み（同じトピック・切り口は避けろ。新しい視点を提供しろ）\n${state.recentPostTexts.slice(0, 5).map((t, i) => `${i + 1}. ${t.slice(0, 80)}`).join('\n')}\n`
    : ''

  const bestPractices = `
## 投稿のベストプラクティス
- 1行目で読者の注意を引くフック
- 締め方: 毎回疑問形にするな。考えさせる余韻（断定・含み・独白）で終わらせてもいい
- ハッシュタグ0-1個
- 抽象分析より具体的な実務価値
- 実体験ベースの語り口`

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。以下のルールに従い、${charConstraint}を${isArticle ? '1候補' : '3候補'}作成。

${isArticle ? '' : X_TWITTER_RULES}

${voiceProfile}

${modeInstructions}
${trendingSection}
${recentPostsSection}
${bestPractices}

${isArticle ? '1つの長文記事を出力せよ。3000文字以上は絶対に守れ。候補のみ、説明不要。' : '3候補を「---」で区切って出力。候補のみ、説明不要。'}`,
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

  // 記事モード: 全文を1候補として扱う（分割しない）
  // 短文/スレッド: ---で3候補に分割
  let candidates: string[]
  if (isArticle) {
    candidates = [text.trim()]
  } else {
    candidates = text
      .split('---')
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
  }

  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    candidates,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

// ============================================================
// ノード3.5: validateHook（フック品質バリデーション）
// ============================================================

function validateHook(state: GraphStateType): Partial<GraphStateType> {
  if (state.mode === 'article') return {}

  const genericStarters = ['今日は', '本日は', 'このたび', 'さて、', 'それでは']
  const validated = state.candidates.filter(candidate => {
    const firstLine = candidate.split('\n')[0].trim()
    if (firstLine.length > 120) return false  // 1行目が長すぎる
    if (genericStarters.some(s => firstLine.startsWith(s))) return false
    return true
  })

  return { candidates: validated.length > 0 ? validated : state.candidates }
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
  const targetLength = isArticle ? '3000-8000文字' : '内容に最適な長さ（50-2000文字）'

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはX投稿の品質評価者です。@nands_tech（AI実務家）の投稿として適切か評価してください。
以下の候補を5基準で評価してください。各0-10点。

基準:
1. hookStrength: 1行目のスクロール停止力（好奇心・驚きを生むか。汎用的な書き出し「最近の」「現在の」→ 低スコア）
2. voiceAuthenticity: AI感のなさ、実務家の声（URLが本文内 → -5点、ニュース口調「〜を発表」→ 0点、元のニュース内容と無関係な架空体験 → 0点）
3. engagementTrigger: リプライ・RT・ブックマークを誘う力。
高スコア: 大胆な断定、実務経験に基づく具体的意見、逆張り、反論を呼ぶ主張
低スコア: 空虚な質問「〜でしょうか？」、無難な感想、一般論
Xアルゴリズム: リプライ13.5x、RT20x、ブックマーク10x。質問より大胆な主張が効果的。
4. platformFit: 文字数・フォーマット適合度（目標: ${targetLength}。ハッシュタグ2個以上 → -3点、煽り表現「ヤバい」「致命的」「🚨🔥」→ -5点）
5. factualGrounding: ソースへの忠実さ（方向性が合っていれば高め。議論を呼ぶ主張はOK）

重み付きスコア計算:
total = hookStrength*0.20 + voiceAuthenticity*0.30 + engagementTrigger*0.20 + platformFit*0.10 + factualGrounding*0.20
（totalは0-10のスケールで出力）

JSON配列のみ出力:
[
  {"index":0,"hookStrength":8,"voiceAuthenticity":9,"engagementTrigger":7,"platformFit":9,"factualGrounding":8,"total":8.05},
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
      hookStrength: 5,
      voiceAuthenticity: 5,
      engagementTrigger: 5,
      platformFit: 5,
      factualGrounding: 5,
      total: 5,
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
      hookStrength: z.number().default(5),
      voiceAuthenticity: z.number().default(5),
      engagementTrigger: z.number().default(5),
      platformFit: z.number().default(5),
      factualGrounding: z.number().default(5),
      total: z.number().default(5),
    }),
  )

  const parsed = CandidateScoreSchema.parse(JSON.parse(jsonMatch[0]))

  // Recalculate weighted total server-side to ensure correctness
  const scores: CandidateScore[] = parsed.map((s) => ({
    index: s.index,
    hookStrength: s.hookStrength,
    voiceAuthenticity: s.voiceAuthenticity,
    engagementTrigger: s.engagementTrigger,
    platformFit: s.platformFit,
    factualGrounding: s.factualGrounding,
    total:
      s.hookStrength * 0.20 +
      s.voiceAuthenticity * 0.30 +
      s.engagementTrigger * 0.20 +
      s.platformFit * 0.10 +
      s.factualGrounding * 0.20,
  }))
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
    // Article mode: Markdown除去 + タイトル・キーポイント抽出
    if (state.mode === 'article') {
      const cleaned = stripMarkdown(state.revisedCandidate)
      const lines = cleaned.split('\n').filter((l) => l.trim().length > 0)
      const articleTitle = lines[0]?.trim() ?? null
      const numberedLines = lines.filter((l) => /^\d+[\.\)、]\s*/.test(l.trim()))
      const keyPoints = numberedLines
        .slice(0, 3)
        .map((l) => l.trim().replace(/^\d+[\.\)、]\s*/, ''))
      return {
        critiqueResult: revisedCritique,
        finalPost: cleaned,
        articleTitle,
        articleKeyPoints: keyPoints.length > 0 ? keyPoints : null,
      }
    }
    return {
      critiqueResult: revisedCritique,
      finalPost: state.revisedCandidate,
    }
  }

  // 原文の勝ち → revisedCandidateをクリア
  return { revisedCandidate: null }
}

// ============================================================
// ヘルパー: 記事テキストからMarkdown記号を除去
// ============================================================

function stripMarkdown(text: string): string {
  return text
    // 見出し記号: # ## ### など（行頭）
    .replace(/^#{1,6}\s+/gm, '')
    // 太字: **text** → text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // 斜体: *text* → text
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1')
    // 水平線: --- のみの行を空行に
    .replace(/^-{3,}$/gm, '')
    // 連続空行を1つに
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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

  // Thread mode: split segments (no forced truncation — Premium supports long posts)
  if (state.mode === 'thread') {
    const segments = withTag.split('===').map((s) => s.trim()).filter((s) => s.length > 0)
    return { finalPost: segments.join('\n===\n') }
  }

  // Research mode: no truncation (X Premium supports up to 25,000 chars)
  // longForm flag is set in x-auto-post.ts to ensure X API accepts the post

  // Article mode: Markdown除去 + 最低3000文字チェック + タイトル・キーポイント抽出
  if (state.mode === 'article') {
    const cleaned = stripMarkdown(withTag)
    if (cleaned.length < 3000) {
      return { error: `Article too short: ${cleaned.length} chars (min 3000)` }
    }
    const lines = cleaned.split('\n').filter((l) => l.trim().length > 0)
    const articleTitle = lines[0]?.trim() ?? null
    const numberedLines = lines.filter((l) => /^\d+[\.\)、]\s*/.test(l.trim()))
    const articleKeyPoints = numberedLines
      .slice(0, 3)
      .map((l) => l.trim().replace(/^\d+[\.\)、]\s*/, ''))
    return {
      finalPost: cleaned,
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
): 'validateHook' | typeof END {
  return state.error ? END : 'validateHook'
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
    .addNode('validateHook', validateHook)
    .addNode('scoreCandidates', scoreCandidates)
    .addNode('critiqueAndRevise', critiqueAndRevise)
    .addNode('finalScore', finalScore)
    .addNode('formatFinal', formatFinal)
    .addEdge(START, 'analyzeContent')
    .addConditionalEdges('analyzeContent', shouldContinueAfterAnalysis)
    .addEdge('selectPattern', 'generateCandidates')
    .addConditionalEdges('generateCandidates', shouldContinueAfterCandidates)
    .addEdge('validateHook', 'scoreCandidates')
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
      recentPostTexts: input.recentPostTexts ? [...input.recentPostTexts] : null,
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
