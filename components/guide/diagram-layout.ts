/**
 * 図解 (nands-diagram) の配置を決める純関数。LLM は「型 + ノード + 矢印」だけを書き、
 * 座標・折り返し・矢印の経路はここで決める (自由な SVG は受け付けない)。
 *
 * - flow: 上から下へ段ごとに並べる。段 = そのノードに届く最長の経路。段の中は親の位置の重心で並べる。
 *         矢印は段の間の隙間だけを通り、出どころごとに別の横線 (lane) を使う (別々の矢印が重なって見えない)。
 *         入る先が複数の矢印は相手の上辺に間隔をあけて入る。2 段以上飛ぶ矢印は右端の通路を回す
 * - timeline: 左の縦線に沿って上から順に
 * - cards: 2 列の格子 (1 つだけなら 1 列)
 * どの型でも箱どうしは重ならない (tests/unit/site/guide-diagram-layout.test.ts)。
 */
import { flowEdges, flowLayers, type DiagramBlock } from '@/app/posts/_lib/guide-blocks'
import { textUnits, wrapText } from './text-wrap'

export const DIAGRAM_WIDTH = 640

const LABEL_SIZE = 14
const LABEL_LINE = 20
const SUB_SIZE = 12
const SUB_LINE = 18
const PAD = 12
const MARGIN = 4

export interface LaidOutNode {
  readonly id: string
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly label: readonly string[]
  readonly sub: readonly string[]
}

export interface LaidOutEdge {
  readonly from: string
  readonly to: string
  /** SVG の path の d */
  readonly path: string
  readonly label?: EdgeLabel
}

/** 矢印のラベル。線の上に中央ぞろえで置き、背景の四角で線を隠す */
export interface EdgeLabel {
  readonly text: string
  /** 文字の中央 */
  readonly x: number
  /** 文字の下端 (baseline) */
  readonly y: number
  /** 背景の四角 (文字の見積もり幅 + 余白) */
  readonly box: { readonly x: number; readonly y: number; readonly w: number; readonly h: number }
}

export interface DiagramLayout {
  readonly kind: DiagramBlock['kind']
  readonly width: number
  readonly height: number
  readonly nodes: readonly LaidOutNode[]
  readonly edges: readonly LaidOutEdge[]
  /** timeline の縦線 */
  readonly axis?: { readonly x: number; readonly y1: number; readonly y2: number }
}

const EDGE_LABEL_SIZE = 12

export const DIAGRAM_TEXT = { LABEL_SIZE, LABEL_LINE, SUB_SIZE, SUB_LINE, PAD, EDGE_LABEL_SIZE } as const

/** 線の x に中央ぞろえ。図の端からはみ出すなら内側へずらす */
function edgeLabel(text: string, x: number, baseline: number): EdgeLabel {
  const w = Math.ceil(textUnits(text) * EDGE_LABEL_SIZE) + 8
  const cx = Math.min(Math.max(x, MARGIN + w / 2), DIAGRAM_WIDTH - MARGIN - w / 2)
  return { text, x: cx, y: baseline, box: { x: cx - w / 2, y: baseline - 12, w, h: 16 } }
}

function textBlock(label: string, sub: string | undefined, innerWidth: number) {
  const labelLines = wrapText(label, innerWidth / LABEL_SIZE)
  const subLines = sub ? wrapText(sub, innerWidth / SUB_SIZE) : []
  const height = labelLines.length * LABEL_LINE + (subLines.length > 0 ? 4 + subLines.length * SUB_LINE : 0)
  return { labelLines, subLines, height }
}

export function layoutDiagram(block: DiagramBlock): DiagramLayout {
  if (block.kind === 'timeline') return layoutTimeline(block)
  if (block.kind === 'cards') return layoutCards(block)
  return layoutFlow(block)
}

// ---------------------------------------------------------------------------
// flow
// ---------------------------------------------------------------------------

const FLOW_GAP_X = 24
const FLOW_MAX_BOX = 280
const GUTTER_STEP = 10
/** 段の隙間: 上下の端から横線 (lane) までの余白。ここに矢印のラベルが入る */
const LANE_PAD = 26
const LANE_STEP = 8
const MIN_GAP = 44

type Edge = ReturnType<typeof flowEdges>[number]

/**
 * 段の中の並び順。上の段の親の位置の平均 (重心) で並べ、矢印の交差を減らす。
 * 同じ重心なら書いた順
 */
function orderLayers(ids: readonly string[], layers: readonly number[], edges: readonly Edge[]): string[][] {
  const layerCount = Math.max(...layers) + 1
  const layerOf = new Map(ids.map((id, index) => [id, layers[index]]))
  const order: string[][] = []
  for (let layer = 0; layer < layerCount; layer += 1) {
    const members = ids.filter((_, index) => layers[index] === layer)
    const barycenter = (id: string) => {
      const positions = edges
        .filter((edge) => edge.to === id)
        .map((edge) => {
          const row = order[layerOf.get(edge.from) ?? 0] ?? []
          return row.length > 1 ? row.indexOf(edge.from) / (row.length - 1) : 0.5
        })
      return positions.length > 0 ? positions.reduce((sum, value) => sum + value, 0) / positions.length : 0.5
    }
    order.push(layer === 0 ? members : [...members].sort((a, b) => barycenter(a) - barycenter(b) || ids.indexOf(a) - ids.indexOf(b)))
  }
  return order
}

function layoutFlow(block: DiagramBlock): DiagramLayout {
  const ids = block.nodes.map((node) => node.id)
  const edges = flowEdges(block.nodes, block.edges)
  const layers = flowLayers(block.nodes, block.edges) ?? ids.map((_, index) => index)
  const layerOf = new Map(ids.map((id, index) => [id, layers[index]]))
  const order = orderLayers(ids, layers, edges)
  const skipEdges = edges.filter((edge) => (layerOf.get(edge.to) ?? 0) - (layerOf.get(edge.from) ?? 0) > 1)
  const gutter = skipEdges.length > 0 ? 12 + skipEdges.length * GUTTER_STEP : 0
  const usable = DIAGRAM_WIDTH - MARGIN * 2 - gutter

  // 段の隙間ごとの横線: 出ていく矢印を持つノード 1 つにつき 1 本 + 2 段以上先から入ってくる矢印 1 本につき 1 本
  const gapSources = order.map((row) => row.filter((id) => edges.some((edge) => edge.from === id)))
  const gapEntries = order.map((_, gap) => skipEdges.filter((edge) => layerOf.get(edge.to) === gap + 1))
  const laneCount = (gap: number) => gapSources[gap].length + gapEntries[gap].length
  const gapHeight = (gap: number) => Math.max(MIN_GAP, LANE_PAD * 2 + Math.max(0, laneCount(gap) - 1) * LANE_STEP)

  const nodes: LaidOutNode[] = []
  const gapTops: number[] = []
  let top = MARGIN
  order.forEach((row, layer) => {
    const boxW = Math.min(FLOW_MAX_BOX, Math.floor((usable - (row.length - 1) * FLOW_GAP_X) / row.length))
    const specs = row.map((id) => block.nodes[ids.indexOf(id)])
    const texts = specs.map((node) => textBlock(node.label, node.sub, boxW - PAD * 2))
    const boxH = Math.max(...texts.map((text) => text.height)) + PAD * 2
    const rowW = row.length * boxW + (row.length - 1) * FLOW_GAP_X
    const left = MARGIN + Math.floor((usable - rowW) / 2)
    specs.forEach((node, index) => {
      nodes.push({ id: node.id, x: left + index * (boxW + FLOW_GAP_X), y: top, w: boxW, h: boxH, label: texts[index].labelLines, sub: texts[index].subLines })
    })
    gapTops.push(top + boxH)
    top += boxH + (layer < order.length - 1 ? gapHeight(layer) : 0)
  })
  const height = top + MARGIN

  const byId = new Map(nodes.map((node) => [node.id, node]))
  const center = (id: string) => {
    const node = byId.get(id) as LaidOutNode
    return node.x + node.w / 2
  }
  const laneY = (gap: number, lane: number) => {
    const count = laneCount(gap)
    const first = gapTops[gap] + (count === 1 ? Math.round(gapHeight(gap) / 2) : LANE_PAD)
    return first + lane * LANE_STEP
  }
  /** 入ってくる矢印が複数あれば、相手の上辺に左から (出どころの x の順に) 間隔をあけて並べる */
  const inPort = (edge: Edge) => {
    const target = byId.get(edge.to) as LaidOutNode
    const incoming = edges.filter((e) => e.to === edge.to).sort((a, b) => center(a.from) - center(b.from))
    return Math.round(target.x + (target.w * (incoming.indexOf(edge) + 1)) / (incoming.length + 1))
  }

  const laidEdges = edges.map((edge): LaidOutEdge => {
    const source = byId.get(edge.from) as LaidOutNode
    const target = byId.get(edge.to) as LaidOutNode
    const sourceGap = layerOf.get(edge.from) ?? 0
    const sx = Math.round(center(edge.from))
    const sy = source.y + source.h
    const tx = inPort(edge)
    const ty = target.y
    const outLane = laneY(sourceGap, gapSources[sourceGap].indexOf(edge.from))
    const skipIndex = skipEdges.indexOf(edge)
    let path: string
    if (skipIndex >= 0) {
      const targetGap = (layerOf.get(edge.to) ?? 1) - 1
      const inLane = laneY(targetGap, gapSources[targetGap].length + gapEntries[targetGap].indexOf(edge))
      const laneX = DIAGRAM_WIDTH - MARGIN - 6 - skipIndex * GUTTER_STEP
      path = `M${sx} ${sy} V${outLane} H${laneX} V${inLane} H${tx} V${ty}`
    } else {
      path = sx === tx ? `M${sx} ${sy} V${ty}` : `M${sx} ${sy} V${outLane} H${tx} V${ty}`
    }
    if (!edge.label) return { from: edge.from, to: edge.to, path }

    // ラベルは、その矢印だけが通る縦の線の上に置く: 入る先への矢印が 1 本だけなら相手の上、合流する矢印は出どころの下
    const targetSide =
      edges.filter((e) => e.to === edge.to).length === 1 || edges.filter((e) => e.from === edge.from).length > 1
    return {
      from: edge.from,
      to: edge.to,
      path,
      label: targetSide ? edgeLabel(edge.label, tx, ty - 12) : edgeLabel(edge.label, sx, sy + 18),
    }
  })

  return { kind: 'flow', width: DIAGRAM_WIDTH, height, nodes, edges: laidEdges }
}

// ---------------------------------------------------------------------------
// timeline
// ---------------------------------------------------------------------------

const AXIS_X = 12
const TIMELINE_TEXT_X = 36
const TIMELINE_GAP = 20

function layoutTimeline(block: DiagramBlock): DiagramLayout {
  const width = DIAGRAM_WIDTH - TIMELINE_TEXT_X - MARGIN
  let top = MARGIN
  const nodes = block.nodes.map((node): LaidOutNode => {
    // timeline では sub (時期) を先に、label (出来事) を後に出す
    const subLines = node.sub ? wrapText(node.sub, width / SUB_SIZE) : []
    const labelLines = wrapText(node.label, width / LABEL_SIZE)
    const h = (subLines.length > 0 ? subLines.length * SUB_LINE + 2 : 0) + labelLines.length * LABEL_LINE
    const laid = { id: node.id, x: TIMELINE_TEXT_X, y: top, w: width, h, label: labelLines, sub: subLines }
    top += h + TIMELINE_GAP
    return laid
  })
  const height = top - TIMELINE_GAP + MARGIN
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  return {
    kind: 'timeline',
    width: DIAGRAM_WIDTH,
    height,
    nodes,
    edges: [],
    axis: { x: AXIS_X, y1: first.y + 9, y2: last.y + 9 },
  }
}

// ---------------------------------------------------------------------------
// cards
// ---------------------------------------------------------------------------

const CARD_GAP = 16

function layoutCards(block: DiagramBlock): DiagramLayout {
  const columns = block.nodes.length > 1 ? 2 : 1
  const cardW = Math.floor((DIAGRAM_WIDTH - MARGIN * 2 - (columns - 1) * CARD_GAP) / columns)
  const texts = block.nodes.map((node) => textBlock(node.label, node.sub, cardW - PAD * 2))
  const nodes: LaidOutNode[] = []
  let top = MARGIN
  for (let start = 0; start < block.nodes.length; start += columns) {
    const rowTexts = texts.slice(start, start + columns)
    const rowH = Math.max(...rowTexts.map((text) => text.height)) + PAD * 2
    rowTexts.forEach((text, offset) => {
      const node = block.nodes[start + offset]
      nodes.push({
        id: node.id,
        x: MARGIN + offset * (cardW + CARD_GAP),
        y: top,
        w: cardW,
        h: rowH,
        label: text.labelLines,
        sub: text.subLines,
      })
    })
    top += rowH + CARD_GAP
  }
  return { kind: 'cards', width: DIAGRAM_WIDTH, height: top - CARD_GAP + MARGIN, nodes, edges: [] }
}
