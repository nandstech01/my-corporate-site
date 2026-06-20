/**
 * CORTEX 運用プレイブック（戦略層 / 頭脳）
 *
 * 既存エンジン（生成パイプライン・パターンバンディット・配信・学習）は一切壊さず、
 * その上に「優れたX運用者のフルファネル」を載せる戦略設定。
 *
 * - 10領域（リサーチ→ネタ→バズ→セールス→収益化→ストック→自己添削→再現性→エンゲージ→フォロワー増）
 * - 各領域を「既存パターンID群 / 投稿mode / 意図文(JP) / 出現頻度 / タグ」にマッピング
 * - selectPlaybookArea(): value-first の重み付きローテ（売り込み系は約10%に抑制）
 * - formatPlaybookForPrompt(): 生成プロンプトへ注入する意図ブロック
 * - applyPlaybookBias(): x-auto-post の配信重みを領域modeへ微調整（純関数）
 * - hookTypeToPatternId(): cortex_viral_analysis.hook_type → 既存pattern_id 対応（再現性ブリッジ）
 *
 * 純config + 純関数。副作用なし。
 */

export type PlaybookAreaId =
  | 'research'
  | 'ideation'
  | 'buzz'
  | 'sales'
  | 'monetization'
  | 'stock'
  | 'planning'
  | 'buzz_analysis'
  | 'engagement'
  | 'follower_growth'

export type PostMode = 'research' | 'thread' | 'article'

export interface PlaybookArea {
  readonly id: PlaybookAreaId
  /** Discord/ログ表示用の日本語ラベル */
  readonly label: string
  /** この領域で使ってよい既存パターンID（pattern-templates.ts のサブセット） */
  readonly eligiblePatternIds: readonly string[]
  /** 投稿フォーマット */
  readonly mode: PostMode
  /** 生成プロンプトへ注入する意図（日本語・簡潔） */
  readonly intentInstruction: string
  /** ローテーション重み（合計1.0、value-first） */
  readonly cadenceWeight: number
  /** x_post_analytics.tags に付与するタグ */
  readonly tag: string
}

export const PLAYBOOK_AREAS: readonly PlaybookArea[] = [
  {
    id: 'research',
    label: 'リサーチ・分析',
    eligiblePatternIds: ['practitioner_take', 'build_log', 'design_decision', 'layered_analysis'],
    mode: 'research',
    intentInstruction:
      'トレンド・競合・バズ要因を実務家視点で言語化する。具体ツール名・数値・一次情報を必ず含め、「なぜ今これが重要か」を一言で刺す。',
    cadenceWeight: 0.15,
    tag: 'playbook:research',
  },
  {
    id: 'ideation',
    label: 'ネタ探し・市場理解',
    eligiblePatternIds: ['contrarian_view', 'future_bet', 'internal_debate', 'rapid_hot_takes'],
    mode: 'research',
    intentInstruction:
      '市場で「何が受けていて何が足りないか」を突く切り口。逆張り・未来予測・抜けている論点を提示し、読者の「確かに」を引き出す。',
    cadenceWeight: 0.12,
    tag: 'playbook:ideation',
  },
  {
    id: 'buzz',
    label: 'バズポスト生成（核）',
    eligiblePatternIds: ['buzz_breaking', 'buzz_daily_recap', 'buzz_save_list', 'live_reaction'],
    mode: 'research',
    intentInstruction:
      '1行目で結論/驚きを置きスクロールを止める。保存版リスト・速報・今日のまとめ等で保存とRTを最大化。中身のない煽りは禁止、必ず具体で裏付ける。',
    cadenceWeight: 0.18,
    tag: 'playbook:buzz',
  },
  {
    id: 'sales',
    label: 'セールス（CTA）',
    eligiblePatternIds: ['diagnostic_cta', 'risk_reduction', 'sales_cta_line'],
    mode: 'research',
    intentInstruction:
      '読者のペイン→ベネフィットを言語化し、自然な一言CTAで締める。売り込み感を排除し、価値提供の延長として誘導する。多用しない。',
    cadenceWeight: 0.05,
    tag: 'playbook:sales',
  },
  {
    id: 'monetization',
    label: '収益化（X→LINE/LP）',
    eligiblePatternIds: ['sales_cta_line', 'diagnostic_cta', 'buzz_save_list'],
    mode: 'research',
    intentInstruction:
      'LINE誘導CTAを文末に自然に組み込む（generateLineAddUrl のURLを使用）。価値→次の一歩、の流れ。直接的な売込みは避ける。多用しない。',
    cadenceWeight: 0.05,
    tag: 'playbook:monetization',
  },
  {
    id: 'stock',
    label: 'ストックコンテンツ（note/Brain）',
    eligiblePatternIds: ['future_bet', 'contrarian_view', 'internal_debate', 'failure_story', 'thread_deep_dive'],
    mode: 'thread',
    intentInstruction:
      '後から見返したくなる体系的な知見をスレッドで。失敗談・深掘り分析でストック型の価値を作り、必要なら長文記事(note)への布石にする。',
    cadenceWeight: 0.10,
    tag: 'playbook:stock',
  },
  {
    id: 'planning',
    label: 'プランニング・自己添削（プロ視点）',
    eligiblePatternIds: ['layered_analysis', 'internal_debate', 'correction_apology'],
    mode: 'research',
    intentInstruction:
      'プロの視点で構成・感情・キャラの一貫性を整える。一貫したペルソナで、ターゲットに刺さる言葉を選ぶ。誇張を削り精度を上げる。',
    cadenceWeight: 0.10,
    tag: 'playbook:planning',
  },
  {
    id: 'buzz_analysis',
    label: 'バズ分析・再現性（超重要）',
    eligiblePatternIds: ['live_reaction', 'observation_reaction', 'single_thought'],
    mode: 'research',
    intentInstruction:
      'なぜ伸びたか/伸びなかったかを構成・心理で分解し、再現できる「型」として言語化する。学びを次の投稿に転用する視点で書く。',
    cadenceWeight: 0.10,
    tag: 'playbook:buzz_analysis',
  },
  {
    id: 'engagement',
    label: 'エンゲージメント',
    eligiblePatternIds: ['question_thread', 'raw_rant', 'observation_reaction', 'single_thought'],
    mode: 'research',
    intentInstruction:
      'リプ・引用が増える問いかけ/共感/適度な論点提示。答えやすい質問や「わかる」を誘発する観察で、会話と話題を作る。',
    cadenceWeight: 0.10,
    tag: 'playbook:engagement',
  },
  {
    id: 'follower_growth',
    label: 'フォロワー増加',
    eligiblePatternIds: ['practitioner_take', 'build_log', 'buzz_save_list'],
    mode: 'research',
    intentInstruction:
      'プロフを見て「フォローしたい」と思わせる一貫した専門性・実績の提示。保存される実用知見で新規流入の入口を作る。',
    cadenceWeight: 0.05,
    tag: 'playbook:follower_growth',
  },
]

const AREA_BY_ID: ReadonlyMap<PlaybookAreaId, PlaybookArea> = new Map(
  PLAYBOOK_AREAS.map((a) => [a.id, a]),
)

export function getPlaybookArea(id: PlaybookAreaId): PlaybookArea | undefined {
  return AREA_BY_ID.get(id)
}

/**
 * value-first の重み付きで領域を1つ選ぶ。直近領域は除外して連続を避ける。
 */
export function selectPlaybookArea(
  excludeAreaIds: readonly PlaybookAreaId[] = [],
): PlaybookArea {
  const pool = PLAYBOOK_AREAS.filter((a) => !excludeAreaIds.includes(a.id))
  const areas = pool.length > 0 ? pool : PLAYBOOK_AREAS
  const total = areas.reduce((s, a) => s + a.cadenceWeight, 0)
  let roll = Math.random() * total
  for (const a of areas) {
    roll -= a.cadenceWeight
    if (roll <= 0) return a
  }
  return areas[areas.length - 1]
}

/**
 * 生成プロンプトへ注入する意図ブロック（8行以内）。
 */
export function formatPlaybookForPrompt(area: PlaybookArea): string {
  return [
    `## 今回の運用フォーカス: ${area.label}`,
    area.intentInstruction,
    `推奨フォーマット: ${area.mode}`,
    `優先パターン候補: ${area.eligiblePatternIds.join(', ')}`,
  ].join('\n')
}

const MIN_WEIGHT = 0.05

/**
 * x-auto-post の配信重みを、領域のmodeに合わせて微調整（上書きでなくnudge）。
 * 純関数：新しいオブジェクトを返し、合計1.0へ正規化。未知キーはそのまま。
 */
export function applyPlaybookBias(
  weights: Readonly<Record<string, number>>,
  areaId: PlaybookAreaId,
): Record<string, number> {
  const area = AREA_BY_ID.get(areaId)
  const next: Record<string, number> = { ...weights }
  if (!area) return next

  // modeに対応する配信バケットを+50%ブースト
  const boostKey =
    area.mode === 'thread'
      ? 'thread'
      : area.mode === 'article'
        ? 'article'
        : 'original'
  if (typeof next[boostKey] === 'number') {
    next[boostKey] = next[boostKey] * 1.5
  }

  // 下限を確保しつつ正規化
  for (const k of Object.keys(next)) {
    if (next[k] < MIN_WEIGHT) next[k] = MIN_WEIGHT
  }
  const sum = Object.values(next).reduce((s, v) => s + v, 0)
  if (sum > 0) {
    for (const k of Object.keys(next)) next[k] = next[k] / sum
  }
  return next
}

/**
 * 再現性ブリッジ: cortex_viral_analysis.hook_type を既存 pattern_id に対応付ける。
 * 不明なら null（シグナルを注入しない）。
 */
export function hookTypeToPatternId(hookType: string | null | undefined): string | null {
  if (!hookType) return null
  const h = hookType.toLowerCase()
  if (/(breaking|速報|speed|news)/.test(h)) return 'buzz_breaking'
  if (/(list|numbered|save|保存|まとめリスト|選)/.test(h)) return 'buzz_save_list'
  if (/(recap|daily|summary|まとめ|総括)/.test(h)) return 'buzz_daily_recap'
  if (/(reaction|live|反応|速報反応)/.test(h)) return 'live_reaction'
  if (/(analysis|layered|分析|考察)/.test(h)) return 'layered_analysis'
  if (/(build|engineering|実装|開発)/.test(h)) return 'build_log'
  if (/(question|discussion|問い|議論)/.test(h)) return 'question_thread'
  if (/(opinion|contrarian|逆張り|主張)/.test(h)) return 'contrarian_view'
  if (/(story|failure|体験|失敗)/.test(h)) return 'failure_story'
  return null
}
