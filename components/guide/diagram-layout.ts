/**
 * 図解 (nands-diagram) の配置を決める純関数。LLM は「型 + ノード + 矢印」だけを書き、
 * 座標・折り返し・矢印の経路はここで決める (自由な SVG は受け付けない)。
 *
 * - flow: 上から下へ段ごとに並べる。段 = そのノードに届く最長の経路。矢印は段の間の隙間だけを通る。
 *         2 段以上飛ぶ矢印は右端の通路を回す (途中の箱を横切らない)
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

export interface EdgeLabel {
  readonly text: string
  readonly x: number
  /** 文字の下端 (baseline) */
  readonly y: number
  readonly anchor: 'start' | 'end'
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

/** 矢印のラベルを x の右に置く。図の右端からはみ出すなら左に置く */
function edgeLabel(text: string, x: number, y: number): EdgeLabel {
  const width = textUnits(text) * EDGE_LABEL_SIZE
  return x + 8 + width <= DIAGRAM_WIDTH - MARGIN
    ? { text, x: x + 8, y, anchor: 'start' }
    : { text, x: x - 8, y, anchor: 'end' }
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

function layoutFlow(block: DiagramBlock): DiagramLayout {
  const edges = flowEdges(block.nodes, block.edges)
  const layers = flowLayers(block.nodes, block.edges) ?? block.nodes.map((_, index) => index)
  const layerOf = new Map(block.nodes.map((node, index) => [node.id, layers[index]]))
  const skipEdges = edges.filter((edge) => (layerOf.get(edge.to) ?? 0) - (layerOf.get(edge.from) ?? 0) > 1)
  const gutter = skipEdges.length > 0 ? 12 + skipEdges.length * GUTTER_STEP : 0
  const usable = DIAGRAM_WIDTH - MARGIN * 2 - gutter
  const gapY = edges.some((edge) => edge.label) ? 60 : 44
  const layerCount = Math.max(...layers) + 1

  const nodes: LaidOutNode[] = []
  let top = MARGIN
  for (let layer = 0; layer < layerCount; layer += 1) {
    const members = block.nodes.filter((_, index) => layers[index] === layer)
    const boxW = Math.min(FLOW_MAX_BOX, Math.floor((usable - (members.length - 1) * FLOW_GAP_X) / members.length))
    const texts = members.map((node) => textBlock(node.label, node.sub, boxW - PAD * 2))
    const boxH = Math.max(...texts.map((text) => text.height)) + PAD * 2
    const rowW = members.length * boxW + (members.length - 1) * FLOW_GAP_X
    const left = MARGIN + Math.floor((usable - rowW) / 2)
    members.forEach((node, index) => {
      nodes.push({
        id: node.id,
        x: left + index * (boxW + FLOW_GAP_X),
        y: top,
        w: boxW,
        h: boxH,
        label: texts[index].labelLines,
        sub: texts[index].subLines,
      })
    })
    top += boxH + gapY
  }
  const height = top - gapY + MARGIN

  const byId = new Map(nodes.map((node) => [node.id, node]))
  const laidEdges = edges.map((edge): LaidOutEdge => {
    const source = byId.get(edge.from) as LaidOutNode
    const target = byId.get(edge.to) as LaidOutNode
    const skipIndex = skipEdges.indexOf(edge)
    return skipIndex >= 0
      ? gutterEdge(edge, source, target, DIAGRAM_WIDTH - MARGIN - 6 - skipIndex * GUTTER_STEP)
      : adjacentEdge(edge, source, target)
  })

  return { kind: 'flow', width: DIAGRAM_WIDTH, height, nodes, edges: laidEdges }
}

/** 隣の段への矢印: 下辺の中央 → 段の隙間の中ほどで横へ → 上辺の中央 */
function adjacentEdge(edge: { from: string; to: string; label?: string }, source: LaidOutNode, target: LaidOutNode): LaidOutEdge {
  const sx = source.x + source.w / 2
  const sy = source.y + source.h
  const tx = target.x + target.w / 2
  const ty = target.y
  const midY = Math.round(sy + (ty - sy) / 2)
  const straight = sx === tx
  const path = straight ? `M${sx} ${sy} V${ty}` : `M${sx} ${sy} V${midY} H${tx} V${ty}`
  return {
    from: edge.from,
    to: edge.to,
    path,
    ...(edge.label ? { label: edgeLabel(edge.label, tx, straight ? midY + 4 : midY + 16) } : {}),
  }
}

/**
 * 2 段以上先への矢印。途中の段の箱を横切らないよう、
 * 下辺の中央 → すぐ下の隙間で右端の通路へ → 通路を下る → 相手のすぐ上の隙間で戻る → 上辺の中央
 */
function gutterEdge(edge: { from: string; to: string; label?: string }, source: LaidOutNode, target: LaidOutNode, laneX: number): LaidOutEdge {
  const sx = source.x + source.w / 2
  const sy = source.y + source.h
  const tx = target.x + target.w / 2
  const ty = target.y
  const yOut = sy + 12
  const yIn = ty - 12
  const path = `M${sx} ${sy} V${yOut} H${laneX} V${yIn} H${tx} V${ty}`
  return {
    from: edge.from,
    to: edge.to,
    path,
    ...(edge.label ? { label: { text: edge.label, x: laneX - 6, y: yOut + 14, anchor: 'end' as const } } : {}),
  }
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
