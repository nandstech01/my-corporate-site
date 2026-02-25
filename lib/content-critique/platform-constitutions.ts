/**
 * プラットフォーム別「品質憲法」
 *
 * ポジティブ行動原則 + アンチパターン定義。
 * critique-engine.ts から参照される。
 */

import type { Platform } from '../ai-judge/types'
import { VOICE_PROFILE } from '../prompts/voice-profile'

// ============================================================
// 型定義
// ============================================================

export interface PlatformConstitution {
  readonly platform: Platform
  readonly mode: string
  readonly principles: readonly string[]
  readonly antiPatterns: readonly string[]
  readonly scoringPrompt: string
}

// ============================================================
// 共通アンチパターン
// ============================================================

const COMMON_ANTI_PATTERNS: readonly string[] = [
  'ニュースbot口調（「〜を発表しました」「〜がリリースされました」のみ）',
  '煽り表現（「ヤバい」「致命的」「🚨🔥」）',
  '抽象的すぎる感想（「すごい」「画期的」のみ）',
  'URL/リンクプレースホルダー（[URL]や{url}）',
  '過度な絵文字使用（3個以上）',
]

// ============================================================
// AI臭アンチパターン
// ============================================================

const AI_SMELL_ANTI_PATTERNS: readonly string[] = [
  ...VOICE_PROFILE.aiSmellPatterns.map((p) => `AI感表現: 「${p}」`),
  'AI感のある均一な段落構成（全段落が同じ長さ・構造）',
  '個人的な体験・感情表現の欠如',
]

// ============================================================
// X 標準投稿（100-500文字、Premium対応）
// ============================================================

const X_SHORT_CONSTITUTION: PlatformConstitution = {
  platform: 'x',
  mode: 'short',
  principles: [
    '1行目で好奇心か驚きを生み、スクロールを止める',
    '実務家が実体験を語る口調で、ニュースbot調を避ける',
    '具体的なツール名・数字・事実を1つ以上含む',
    '問いかけや議論を誘う締め方をする',
    'カジュアルな日本語（〜なんだよね、〜していく）を使う',
    'Premium枠を活かし100-500文字で要点を伝える（280制限にとらわれない）',
  ],
  antiPatterns: [...COMMON_ANTI_PATTERNS, ...AI_SMELL_ANTI_PATTERNS],
  scoringPrompt: `以下の5次元で投稿を0-10点で評価せよ:
1. hookStrength: 1行目のスクロール停止力（好奇心・驚き）
2. voiceAuthenticity: bot感・AI感のなさ（AI特有の汎用表現を使っていないか、実務家の体験談口調か）
3. engagementTrigger: 問いかけ・議論誘発力
4. platformFit: 100-500文字の適正範囲、フォーマット適合
5. factualGrounding: ソースコンテンツへの忠実さ、具体的ファクト

JSON形式のみ出力:
{"hookStrength":N,"voiceAuthenticity":N,"engagementTrigger":N,"platformFit":N,"factualGrounding":N,"overallScore":N,"strengths":["..."],"weaknesses":["..."],"revision":"改善案テキスト（弱点がある場合）"}`,
}

// ============================================================
// X 長文記事（1500-3000文字）
// ============================================================

const X_ARTICLE_CONSTITUTION: PlatformConstitution = {
  platform: 'x',
  mode: 'article',
  principles: [
    '冒頭に共感フック（読者の悩みリスト）を置く',
    '番号付き実践セクション（8-12項目）で構造化する',
    '各セクションに個人の体験を織り込む',
    '括弧内の独り言・ツッコミを5回以上挟む',
    '「やりがちなミス」「よくある誤解」セクションを1-2個入れる',
    '「〜なと。」「ぶっちゃけ」「控えめに言って」等の署名表現を自然に使う',
    'なぜ重要かの分析で締め、議論を誘発する',
  ],
  antiPatterns: [...COMMON_ANTI_PATTERNS, ...AI_SMELL_ANTI_PATTERNS],
  scoringPrompt: `以下の5次元で長文記事を0-10点で評価せよ:
1. hookStrength: 冒頭の共感フック力（読者の悩みに刺さるか）
2. voiceAuthenticity: bot感・AI感のなさ（AI特有の汎用表現を使っていないか、独り言・ツッコミが自然に挟まれているか）
3. engagementTrigger: 議論誘発力（締めの問いかけ品質）
4. platformFit: 3000-8000文字の範囲、番号付きセクション構造
5. factualGrounding: ソース情報への忠実さ、事実正確性

JSON形式のみ出力:
{"hookStrength":N,"voiceAuthenticity":N,"engagementTrigger":N,"platformFit":N,"factualGrounding":N,"overallScore":N,"strengths":["..."],"weaknesses":["..."],"revision":"改善案テキスト（弱点がある場合）"}`,
}

// ============================================================
// Threads（200-400文字）
// ============================================================

const THREADS_CONSTITUTION: PlatformConstitution = {
  platform: 'threads',
  mode: 'threads',
  principles: [
    '1行目のフックで会話を始める（「〜って知ってた？」「最近〜で気づいたんだけど」）',
    '具体的な数字やファクトを1つ以上含める',
    '自分の考え・体験を軸に語り、共感を呼ぶ',
    '最後に答えたくなる問いかけでリプライを誘発する',
    '200-400文字の最適範囲に収める',
  ],
  antiPatterns: [...COMMON_ANTI_PATTERNS, ...AI_SMELL_ANTI_PATTERNS],
  scoringPrompt: `以下の5次元でThreads投稿を0-10点で評価せよ:
1. hookStrength: 1行目の会話開始力（フックの自然さ）
2. voiceAuthenticity: bot感・AI感のなさ（AI特有の汎用表現を使っていないか、カジュアルな語り口か）
3. engagementTrigger: リプライ誘発力（問いかけの答えやすさ）
4. platformFit: 200-400文字の最適範囲、Threadsのトーン適合
5. factualGrounding: 具体的な数字・ファクトの含有

JSON形式のみ出力:
{"hookStrength":N,"voiceAuthenticity":N,"engagementTrigger":N,"platformFit":N,"factualGrounding":N,"overallScore":N,"strengths":["..."],"weaknesses":["..."],"revision":"改善案テキスト（弱点がある場合）"}`,
}

// ============================================================
// LinkedIn（500-1500文字）
// ============================================================

const LINKEDIN_CONSTITUTION: PlatformConstitution = {
  platform: 'linkedin',
  mode: 'linkedin',
  principles: [
    '1行目で専門的な洞察を提示し、プロフェッショナルの注目を引く',
    'ビジネスインパクトの観点で語り、実務への影響を明確にする',
    '具体的な事例・データ・経験を含める',
    '読み手に思考を促す問いかけで締める',
    '500-1500文字でインサイトを伝える',
  ],
  antiPatterns: [
    ...COMMON_ANTI_PATTERNS,
    ...AI_SMELL_ANTI_PATTERNS,
    '過度にカジュアルな口調（LinkedInはプロフェッショナルプラットフォーム）',
  ],
  scoringPrompt: `以下の5次元でLinkedIn投稿を0-10点で評価せよ:
1. hookStrength: 1行目の専門家コミュニティでの注目喚起力
2. voiceAuthenticity: bot感・AI感のなさ（AI特有の汎用表現を使っていないか、プロフェッショナルかつ実務家の語り口か）
3. engagementTrigger: コメント・議論誘発力
4. platformFit: 500-1500文字の適正範囲、LinkedIn文化適合
5. factualGrounding: データ・事例の具体性

JSON形式のみ出力:
{"hookStrength":N,"voiceAuthenticity":N,"engagementTrigger":N,"platformFit":N,"factualGrounding":N,"overallScore":N,"strengths":["..."],"weaknesses":["..."],"revision":"改善案テキスト（弱点がある場合）"}`,
}

// ============================================================
// 憲法取得
// ============================================================

const CONSTITUTION_MAP: ReadonlyMap<string, PlatformConstitution> = new Map([
  ['x:short', X_SHORT_CONSTITUTION],
  ['x:research', X_SHORT_CONSTITUTION],
  ['x:article', X_ARTICLE_CONSTITUTION],
  ['x:thread', X_SHORT_CONSTITUTION],
  ['threads:threads', THREADS_CONSTITUTION],
  ['linkedin:linkedin', LINKEDIN_CONSTITUTION],
])

export function getConstitution(
  platform: Platform,
  mode: string,
): PlatformConstitution {
  const key = `${platform}:${mode}`
  return CONSTITUTION_MAP.get(key) ?? CONSTITUTION_MAP.get(`${platform}:short`) ?? X_SHORT_CONSTITUTION
}
