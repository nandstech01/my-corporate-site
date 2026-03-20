/**
 * Threads投稿パターンテンプレート
 *
 * Threads特化の会話型テンプレート8種。
 * Xとは異なり、200-400文字の会話的トーンを最適化。
 */

// ============================================================
// 型定義
// ============================================================

export interface ThreadsPatternTemplate {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly template: string
  readonly category: string
  readonly optimalLength: { readonly min: number; readonly max: number }
  readonly conversationCloser: string
  readonly features: readonly string[]
}

// ============================================================
// パターンテンプレート
// ============================================================

export const threadsPatternTemplates: readonly ThreadsPatternTemplate[] = [
  {
    id: 'insight_narrative',
    name: '洞察ストーリー',
    description: '観察から分析、問いへ。Threads版の思考共有',
    template: `{observation}

{analysis_and_context}

{open_ended_question}`,
    category: 'perspective',
    optimalLength: { min: 200, max: 400 },
    conversationCloser: 'ここが分水嶺になる気がしている',
    features: ['観察ベース', '分析共有', '問いかけ'],
  },
  {
    id: 'build_story',
    name: '実装物語',
    description: '作って学んだナラティブ。体験から発見、共有へ',
    template: `{what_i_built_and_why}

{discovery_during_build}

{sharing_the_lesson}`,
    category: 'engineering',
    optimalLength: { min: 200, max: 400 },
    conversationCloser: '結局、手を動かさないと何も見えてこない',
    features: ['実装体験', '発見共有', 'ナラティブ'],
  },
  {
    id: 'hot_take',
    name: '逆張り考察',
    description: '通説への反論と根拠。「みんなXって言うけど実はY」',
    template: `{common_assumption}

{contrarian_evidence}

{nuanced_position}`,
    category: 'analysis',
    optimalLength: { min: 200, max: 400 },
    conversationCloser: '正解かどうかはまだ分からない。ただ、現場の肌感はそう言っている',
    features: ['通説への疑問', '根拠提示', '議論喚起'],
  },
  {
    id: 'question_thread',
    name: '問いかけ投稿',
    description: '挑発的な観察からコミュニティへの問い',
    template: `{provocative_observation}

{context_for_question}

{direct_question_to_community}`,
    category: 'discussion',
    optimalLength: { min: 150, max: 350 },
    conversationCloser: '答えを持ってる人がいたら聞きたい',
    features: ['議論喚起', 'コミュニティ参加', '問いかけ'],
  },
  {
    id: 'trend_commentary',
    name: 'トレンド解説',
    description: '最新ニュースへの実務家コメント。現場目線の解説',
    template: `{trend_summary}

{practitioner_perspective}

{practical_implication}`,
    category: 'commentary',
    optimalLength: { min: 200, max: 400 },
    conversationCloser: '影響が出始めるのは、たぶんもう少し先',
    features: ['トレンド分析', '実務家目線', '実用的示唆'],
  },
  {
    id: 'data_story',
    name: 'データで語る',
    description: '数字や統計からリードし、文脈と影響を議論',
    template: `{data_point_lead}

{context_and_interpretation}

{implications_for_discussion}`,
    category: 'data',
    optimalLength: { min: 200, max: 400 },
    conversationCloser: '数字は嘘をつかない。ただ、文脈は語ってくれない',
    features: ['データドリブン', '文脈付与', '影響議論'],
  },
  {
    id: 'future_signal',
    name: '未来シグナル',
    description: '弱いシグナルから予測。「注目してるのは...」',
    template: `{weak_signal_spotted}

{why_this_matters}

{prediction_and_bet}`,
    category: 'forecast',
    optimalLength: { min: 200, max: 400 },
    conversationCloser: 'まだ誰も確信を持てていない。だから面白い',
    features: ['シグナル検出', '未来予測', '先読み'],
  },
  {
    id: 'controversy_take',
    name: '議論提起',
    description: '両面提示から自分の立場を示し、意見を募集',
    template: `{both_sides_presented}

{my_position_and_reasoning}

{invitation_to_debate}`,
    category: 'debate',
    optimalLength: { min: 250, max: 450 },
    conversationCloser: 'どっちが正しいかより、どっちを選ぶか',
    features: ['両面提示', '立場表明', '意見募集'],
  },
  {
    id: 'risk_warning',
    name: 'リスク警告',
    description: 'AI導入の落とし穴を実務家の視点で語り、対策を共有',
    template: `{risk_scenario_observation}

{what_goes_wrong_in_practice}

{practical_mitigation}`,
    category: 'risk',
    optimalLength: { min: 200, max: 400 },
    conversationCloser: '知ってれば避けられた。でも知らなかった',
    features: ['リスク提示', '実務ベース', '対策共有'],
  },
  {
    id: 'failure_reflection',
    name: '失敗振り返り',
    description: '実際の失敗体験から得た率直な学びを共有',
    template: `{what_i_tried_and_expected}

{reality_and_failure}

{honest_lesson}`,
    category: 'experience',
    optimalLength: { min: 200, max: 400 },
    conversationCloser: '失敗しないと到達できない理解がある',
    features: ['失敗共有', '率直さ', '共感'],
  },
  {
    id: 'diagnostic_check',
    name: '診断チェック',
    description: '読者の課題を診断する問いかけで専門性を示しつつ会話を誘発',
    template: `{diagnostic_scenario}

{common_patterns_observed}

{self_check_invitation}`,
    category: 'cta',
    optimalLength: { min: 200, max: 400 },
    conversationCloser: '全部当てはまった人は、そろそろ本気で向き合うタイミング',
    features: ['診断型', '専門性', 'ソフトCTA'],
  },
] as const

// ============================================================
// トーンガイドライン（Threads特化）
// ============================================================

export const THREADS_TONE_GUIDELINES = {
  good_expressions: [
    '最近気づいたんだけど',
    '正直なところ',
    'ちょっと面白い話なんですが',
    '現場の感覚としては',
    'ぶっちゃけ',
    '個人的に注目してるのは',
    '意外だったのが',
    'これ共感する人いるかな',
    '経験的に言うと',
    '率直に言って',
  ],

  avoid_expressions: [
    '本日は',
    'お知らせです',
    '是非ご覧ください',
    '詳しくはリンクから',
    '拡散希望',
    '知らないと損',
    '緊急',
    '速報',
    '革命的',
    '世界が変わる',
    '信じられない',
    '驚愕の',
  ],

  principles: [
    '友人に話すようなカジュアルさ',
    '締め方は余韻重視 — 考えさせる断定・含み・独白で終わらせる（問いかけは時々でOK）',
    '語尾NG: 「〜なんだよね」「〜だよね」「〜よね」は禁止。言い切れ',
    '実体験ベースの信頼性',
    'ハッシュタグは0-1個',
    '200-400文字を目安に',
    '返信したくなる余白を残す',
  ],
} as const

// ============================================================
// パターンID一覧
// ============================================================

export const THREADS_PATTERN_IDS = threadsPatternTemplates.map(
  (t) => t.id,
) as readonly string[]

// ============================================================
// ヘルパー関数
// ============================================================

export function getThreadsPatternById(
  id: string,
): ThreadsPatternTemplate | undefined {
  return threadsPatternTemplates.find((t) => t.id === id)
}

export function getThreadsPatternsByCategory(
  category: string,
): readonly ThreadsPatternTemplate[] {
  return threadsPatternTemplates.filter((t) => t.category === category)
}
