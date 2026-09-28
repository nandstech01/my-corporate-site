/**
 * 特設「完全保存版」ページ (ガイド) の型付きブロック。
 *
 * 記事の Markdown に、言語名が `nands-*` のコードフェンスとして 1 行の JSON を置く:
 *
 *   ```nands-stats
 *   {"items":[{"label":"月額","value":"$20"}]}
 *   ```
 *
 * ここの zod スキーマがブロックの唯一の定義。サイトの描画 (components/guide) と
 * コンテンツのパイプライン (生成・検査) の両方がこのファイルを使うので、React やサーバー専用の
 * モジュールには依存させない。
 *
 * 安全のための約束:
 * - 文字列に '<' を入れない (HTML として解釈される余地を残さない)
 * - URL は https か、サイト内の相対パス ('/' 始まり、'//' は不可)
 * - 知らないキーは拒否する (.strict)。数値は有限、件数には上限
 * - 図は「型 + データ」だけ。自由な SVG は受け付けない (レイアウトはサーバーが決める)
 */
import { z } from 'zod'
import { scanMarkdownFences } from '@/lib/structured-data/markdown-fences'

// ---------------------------------------------------------------------------
// 共通の部品
// ---------------------------------------------------------------------------

/** 1 ブロックの JSON の上限 (文字数) */
export const MAX_BLOCK_JSON_LENGTH = 20_000

const NO_LT_MESSAGE = "'<' は使えません"

/** '<' と制御文字を含まない、前後の空白を除いた文字列 */
export function safeText(min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((value) => !value.includes('<'), NO_LT_MESSAGE)
    .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value), '制御文字は使えません')
}

/** https の絶対 URL か、サイト内の相対パス ('/' 始まり、'//' '/\' は不可) */
export function isSafeUrl(value: string): boolean {
  if (value.includes('<') || /\s/.test(value)) return false
  if (value.startsWith('/')) return !value.startsWith('//') && !value.startsWith('/\\')
  try {
    return new URL(value).protocol === 'https:' && value.toLowerCase().startsWith('https://')
  } catch {
    return false
  }
}

const safeUrl = z.string().trim().min(1).max(2000).refine(isSafeUrl, 'URL は https か / 始まりのサイト内パスだけです')

/** YYYY-MM-DD の実在する日付 */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD です')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, '存在しない日付です')

const finiteNumber = z.number().finite()

// ---------------------------------------------------------------------------
// ブロックごとのスキーマ
// ---------------------------------------------------------------------------

/** 冒頭の答え (3〜5 行)・AI 利用の明記・ヒーロー画像。最終更新日と著者はページが入れる */
export const heroSchema = z
  .object({
    answer: z.array(safeText(1, 200)).min(1).max(5),
    aiNote: safeText(1, 200).optional(),
    image: z
      .object({
        src: safeUrl,
        alt: safeText(1, 160),
        width: z.number().int().min(1).max(4000),
        height: z.number().int().min(1).max(4000),
      })
      .strict()
      .optional(),
  })
  .strict()

/** 要点の数字カード */
export const statsSchema = z
  .object({
    caption: safeText(1, 120).optional(),
    items: z
      .array(
        z
          .object({
            label: safeText(1, 40),
            value: z.union([finiteNumber, safeText(1, 24)]),
            unit: safeText(1, 12).optional(),
            note: safeText(1, 120).optional(),
          })
          .strict()
      )
      .min(1)
      .max(6),
  })
  .strict()

export const MAX_CHART_ROWS = 12

/** 横棒グラフ。数字は事実表から入れる (LLM に数字を作らせない) */
export const chartSchema = z
  .object({
    title: safeText(1, 80),
    unit: safeText(1, 16).optional(),
    source: safeText(1, 160).optional(),
    rows: z
      .array(
        z
          .object({
            label: safeText(1, 40),
            value: finiteNumber.min(0),
            note: safeText(1, 80).optional(),
          })
          .strict()
      )
      .min(1)
      .max(MAX_CHART_ROWS),
  })
  .strict()

export const CALLOUT_TONES = ['note', 'tip', 'warning', 'unverified'] as const

/** 注意・補足・未確認事項 */
export const calloutSchema = z
  .object({
    tone: z.enum(CALLOUT_TONES),
    title: safeText(1, 60).optional(),
    body: safeText(1, 800),
  })
  .strict()

export interface DecideResult {
  title: string
  body?: string
  href?: string
}

export interface DecideOption {
  label: string
  result?: DecideResult
  next?: DecideNode
}

export interface DecideNode {
  question: string
  options: DecideOption[]
}

export const MAX_DECIDE_DEPTH = 3

const decideResultSchema = z
  .object({
    title: safeText(1, 60),
    body: safeText(1, 200).optional(),
    href: safeUrl.optional(),
  })
  .strict()

const decideNodeSchema: z.ZodType<DecideNode> = z.lazy(() =>
  z
    .object({
      question: safeText(1, 80),
      options: z
        .array(
          z
            .object({
              label: safeText(1, 40),
              result: decideResultSchema.optional(),
              next: decideNodeSchema.optional(),
            })
            .strict()
            .refine((option) => (option.result === undefined) !== (option.next === undefined), {
              message: '選択肢には result か next のどちらか 1 つを書きます',
            })
        )
        .min(2)
        .max(4),
    })
    .strict()
)

function decideDepth(node: DecideNode): number {
  return 1 + Math.max(0, ...node.options.map((option) => (option.next ? decideDepth(option.next) : 0)))
}

/** 選び方チャート (JS なしの入れ子の <details>)。結論はページに文章でも出す */
export const decideSchema = z
  .object({
    title: safeText(1, 80).optional(),
    root: decideNodeSchema,
  })
  .strict()
  .refine((value) => decideDepth(value.root) <= MAX_DECIDE_DEPTH, {
    message: `質問の深さは ${MAX_DECIDE_DEPTH} 段までです`,
  })

export const DIAGRAM_KINDS = ['flow', 'timeline', 'cards'] as const
export const MAX_DIAGRAM_NODES = 8
/** flow の 1 段に横に並べられる数 */
export const MAX_FLOW_NODES_PER_LAYER = 4

export interface DiagramNodeSpec {
  id: string
  label: string
  sub?: string
}

export interface DiagramEdgeSpec {
  from: string
  to: string
  label?: string
}

/**
 * flow の段 (上から 0, 1, ...)。各ノードの段 = そのノードに届く最長の経路の長さ。
 * 閉路があれば null。edges が空なら書いた順の一本道として扱う。
 */
export function flowLayers(nodes: readonly DiagramNodeSpec[], edges: readonly DiagramEdgeSpec[]): number[] | null {
  const ids = nodes.map((node) => node.id)
  const effective = flowEdges(nodes, edges)
  const layer = ids.map(() => 0)
  const indegree = ids.map((id) => effective.filter((edge) => edge.to === id).length)
  const queue = ids.map((_, index) => index).filter((index) => indegree[index] === 0)
  let visited = 0

  while (queue.length > 0) {
    const current = queue.shift() as number
    visited += 1
    for (const edge of effective.filter((e) => e.from === ids[current])) {
      const target = ids.indexOf(edge.to)
      layer[target] = Math.max(layer[target], layer[current] + 1)
      indegree[target] -= 1
      if (indegree[target] === 0) queue.push(target)
    }
  }
  return visited === ids.length ? layer : null
}

/** flow で実際に描く矢印 (edges が空なら書いた順につなぐ) */
export function flowEdges(nodes: readonly DiagramNodeSpec[], edges: readonly DiagramEdgeSpec[]): DiagramEdgeSpec[] {
  if (edges.length > 0) return [...edges]
  return nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id }))
}

/** 図解。flow = 手順・分岐 / timeline = 時系列 / cards = 並列の項目 */
export const diagramSchema = z
  .object({
    kind: z.enum(DIAGRAM_KINDS),
    title: safeText(1, 60),
    nodes: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,23}$/, 'id は英小文字・数字・_- の 24 文字まで'),
            label: safeText(1, 40),
            sub: safeText(1, 60).optional(),
          })
          .strict()
      )
      .min(1)
      .max(MAX_DIAGRAM_NODES),
    edges: z
      .array(
        z
          .object({
            from: z.string(),
            to: z.string(),
            // 矢印のラベルは線の上に置くので短く (隣の矢印と重ならない幅)
            label: safeText(1, 12).optional(),
          })
          .strict()
      )
      .max(16)
      .default([]),
  })
  .strict()
  .superRefine((value, ctx) => {
    const ids = value.nodes.map((node) => node.id)
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ノードの id が重複しています', path: ['nodes'] })
      return
    }
    if (value.kind !== 'flow' && value.edges.length > 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${value.kind} には edges を書きません`, path: ['edges'] })
      return
    }
    const badEdges = value.edges.filter((edge, index) => {
      const message = !ids.includes(edge.from) || !ids.includes(edge.to)
        ? '存在しないノードへの矢印です'
        : edge.from === edge.to
          ? '自分自身への矢印は書けません'
          : null
      if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: ['edges', index] })
      return message !== null
    })
    const pairs = value.edges.map((edge) => `${edge.from}\u0000${edge.to}`)
    pairs.forEach((pair, index) => {
      if (pairs.indexOf(pair) !== index) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: '同じ矢印が 2 回あります', path: ['edges', index] })
      }
    })
    if (value.kind !== 'flow' || badEdges.length > 0) return
    const layers = flowLayers(value.nodes, value.edges)
    if (layers === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'flow に循環があります', path: ['edges'] })
      return
    }
    const widest = Math.max(...layers.map((layer) => layers.filter((l) => l === layer).length))
    if (widest > MAX_FLOW_NODES_PER_LAYER) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `flow の 1 段に並ぶのは ${MAX_FLOW_NODES_PER_LAYER} つまでです`,
        path: ['edges'],
      })
    }
  })

/** 更新履歴 (日付・何が変わったか・根拠)。最新の日付が dateModified になる */
export const changelogSchema = z
  .object({
    entries: z
      .array(
        z
          .object({
            date: isoDate,
            change: safeText(1, 200),
            basis: safeText(1, 200).optional(),
            url: safeUrl.optional(),
          })
          .strict()
      )
      .min(1)
      .max(50),
  })
  .strict()

/** 出典 */
export const sourcesSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            title: safeText(1, 160),
            url: safeUrl,
            publisher: safeText(1, 60).optional(),
            accessed: isoDate.optional(),
          })
          .strict()
      )
      .min(1)
      .max(30),
  })
  .strict()

/** 相談の導線。form: true でページ内の相談フォーム (source: guide:<slug>) を出す */
export const ctaSchema = z
  .object({
    title: safeText(1, 60),
    body: safeText(1, 300).optional(),
    button: z
      .object({
        label: safeText(1, 30),
        href: safeUrl,
      })
      .strict()
      .optional(),
    form: z.boolean().optional(),
  })
  .strict()
  .refine((value) => value.button !== undefined || value.form === true, {
    message: 'button か form: true のどちらかが要ります',
  })

export const GUIDE_BLOCK_SCHEMAS = {
  'nands-hero': heroSchema,
  'nands-stats': statsSchema,
  'nands-chart': chartSchema,
  'nands-callout': calloutSchema,
  'nands-decide': decideSchema,
  'nands-diagram': diagramSchema,
  'nands-changelog': changelogSchema,
  'nands-sources': sourcesSchema,
  'nands-cta': ctaSchema,
} as const

export type GuideBlockLang = keyof typeof GUIDE_BLOCK_SCHEMAS

export type HeroBlock = z.infer<typeof heroSchema>
export type StatsBlock = z.infer<typeof statsSchema>
export type ChartBlock = z.infer<typeof chartSchema>
export type CalloutBlock = z.infer<typeof calloutSchema>
export type DecideBlock = z.infer<typeof decideSchema>
export type DiagramBlock = z.infer<typeof diagramSchema>
export type ChangelogBlock = z.infer<typeof changelogSchema>
export type SourcesBlock = z.infer<typeof sourcesSchema>
export type CtaBlock = z.infer<typeof ctaSchema>

export type GuideBlock = {
  [K in GuideBlockLang]: { type: K; data: z.infer<(typeof GUIDE_BLOCK_SCHEMAS)[K]> }
}[GuideBlockLang]

export const GUIDE_BLOCK_PREFIX = 'nands-'

/** `nands-` で始まる言語名か (未知の型も含む。未知の型は描画しない) */
export function isGuideFenceLang(lang: string): boolean {
  return lang.startsWith(GUIDE_BLOCK_PREFIX)
}

export function isGuideBlockLang(lang: string): lang is GuideBlockLang {
  return Object.prototype.hasOwnProperty.call(GUIDE_BLOCK_SCHEMAS, lang)
}

export type GuideBlockParseResult =
  | { ok: true; block: GuideBlock }
  | { ok: false; error: string }

/**
 * フェンスの言語名と中身から 1 つのブロックを検査して取り出す。
 * 中身は 1 行の JSON (前後の空白・改行は無視する)。
 */
export function parseGuideBlock(lang: string, raw: string): GuideBlockParseResult {
  if (!isGuideBlockLang(lang)) return { ok: false, error: `未知のブロックです: ${lang}` }
  const source = raw.trim()
  if (source.length === 0) return { ok: false, error: '中身が空です' }
  if (source.length > MAX_BLOCK_JSON_LENGTH) return { ok: false, error: `JSON が長すぎます (${source.length} 文字)` }
  if (source.includes('\n')) return { ok: false, error: 'JSON は 1 行で書きます' }

  let json: unknown
  try {
    json = JSON.parse(source)
  } catch (error) {
    return { ok: false, error: `JSON として読めません: ${error instanceof Error ? error.message : String(error)}` }
  }
  if (json === null || typeof json !== 'object' || Array.isArray(json)) {
    return { ok: false, error: 'JSON はオブジェクトで書きます' }
  }

  const parsed = GUIDE_BLOCK_SCHEMAS[lang].safeParse(json)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    return { ok: false, error: issues.join(' / ') }
  }
  return { ok: true, block: { type: lang, data: parsed.data } as GuideBlock }
}

export interface ExtractedGuideBlock {
  readonly lang: string
  /** Markdown 上の開きフェンスの行番号 (1 始まり) */
  readonly line: number
  readonly result: GuideBlockParseResult
}

/** 本文にある `nands-*` のブロックを順に取り出して検査する (パイプラインの検査にも使う) */
export function extractGuideBlocks(markdown: string): ExtractedGuideBlock[] {
  return scanMarkdownFences(markdown).flatMap((segment) =>
    segment.kind === 'fence' && isGuideFenceLang(segment.lang)
      ? [{ lang: segment.lang, line: segment.line, result: parseGuideBlock(segment.lang, segment.body) }]
      : []
  )
}

/**
 * 更新履歴の最新の日付 (YYYY-MM-DD)。無ければ null。
 * 未来の日付 (書き間違い) は dateModified にしないので除く。
 */
export function latestChangelogDate(markdown: string, now: Date = new Date()): string | null {
  const today = jstDate(now)
  const dates = extractGuideBlocks(markdown).flatMap((extracted) =>
    extracted.result.ok && extracted.result.block.type === 'nands-changelog'
      ? extracted.result.block.data.entries.map((entry) => entry.date)
      : []
  )
  const valid = dates.filter((date) => date <= today).sort()
  return valid.length > 0 ? valid[valid.length - 1] : null
}

/** 日本時間の日付 (YYYY-MM-DD) */
export function jstDate(date: Date): string {
  return new Date(date.getTime() + 9 * 3600_000).toISOString().slice(0, 10)
}

export interface SplitHero {
  /** 本文の最初の ```nands-hero (検査に通ったもの)。無い・通らなければ null */
  readonly hero: HeroBlock | null
  /** その hero のフェンスを除いた本文 */
  readonly body: string
  /** hero が検査に通らなかったときの理由 */
  readonly error?: string
}

/** ガイドのページ冒頭に出す hero を本文から取り出す (2 つ目以降の hero は本文に残る) */
export function splitGuideHero(markdown: string): SplitHero {
  const segments = scanMarkdownFences(markdown)
  const index = segments.findIndex((segment) => segment.kind === 'fence' && segment.lang === 'nands-hero')
  if (index < 0) return { hero: null, body: markdown }

  const fence = segments[index]
  const body = segments
    .filter((_, i) => i !== index)
    .map((segment) => (segment.kind === 'text' ? segment.text : segment.raw))
    .join('\n')
  const result = parseGuideBlock('nands-hero', fence.kind === 'fence' ? fence.body : '')
  if (!result.ok) return { hero: null, body, error: result.error }
  return { hero: result.block.type === 'nands-hero' ? result.block.data : null, body }
}
