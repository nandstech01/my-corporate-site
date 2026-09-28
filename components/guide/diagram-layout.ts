/**
 * 図解 (nands-diagram の flow) の配置を決める純関数。LLM は「型 + ノード + 矢印」だけを書き、
 * 箱の位置・大きさ・折り返し・線の経路はここで決める (自由な SVG は受け付けない)。
 *
 * 描き方 (FlowDiagram): 箱と文字は HTML、線だけ SVG。どちらもここで決めた同じ座標から描くので、
 * 線は必ず箱の実際の縁から出て縁に入る。文字は 1 行ずつ nowrap で描くので、ブラウザが別の位置で折り返さない。
 *
 * - 箱の高さは図の中ですべて同じ (いちばん文字の多い箱に合わせ、文字は上下の真ん中)
 * - 段 = そのノードに届く最長の経路。段の中は親の位置の重心で並べる (交差を減らす)
 * - 向き: lr = 段を左から右へ (PC の広い図) / tb = 段を上から下へ (スマホ、または段が多い図)
 * - 線は段の間の隙間だけを通り、出どころごとに別の通り道 (lane) を使う。2 段以上飛ぶ線は外側の通路を回す
 * - 矢印のラベル (チップ) は、その線だけが通る区間の上に置く
 * 箱・チップが重ならない、線が箱を横切らないことは tests/unit/site/guide-diagram-layout.test.ts で検査する。
 */
import { flowEdges, flowLayers, type DiagramBlock } from '@/app/posts/_lib/guide-blocks'
import { textUnits, wrapText } from './text-wrap'

export type FlowOrientation = 'tb' | 'lr'

/** 図の中の文字と余白の大きさ (図の座標 1 = 表示倍率 1 のときの 1px)。CSS にも同じ値を渡す */
export interface FlowMetrics {
  readonly label: number
  readonly labelLine: number
  readonly sub: number
  readonly subLine: number
  readonly padX: number
  readonly padY: number
  readonly chip: number
  readonly chipH: number
  readonly chipPadX: number
}

export const WIDE_METRICS: FlowMetrics = {
  label: 15,
  labelLine: 22,
  sub: 13,
  subLine: 20,
  padX: 14,
  padY: 12,
  chip: 12.5,
  chipH: 22,
  chipPadX: 7,
}

export const NARROW_METRICS: FlowMetrics = {
  label: 14,
  labelLine: 20,
  sub: 12.5,
  subLine: 18,
  padX: 10,
  padY: 9,
  chip: 12,
  chipH: 20,
  chipPadX: 6,
}

export interface FlowVariant {
  readonly orientation: FlowOrientation
  /** 図の座標の幅 (表示倍率 1 のときの px) */
  readonly width: number
  readonly metrics: FlowMetrics
}

/** 左から右に並べるのは段が 4 つまで (それ以上は箱が細くなるので上から下) */
export const MAX_LR_LAYERS = 4

export const FLOW_VARIANTS = {
  /** PC: 本文の列からはみ出して区画の幅いっぱいに置く横長の図 */
  wideLr: { orientation: 'lr', width: 960, metrics: WIDE_METRICS },
  /** PC: 段が多い図は本文の列の中に縦に */
  wideTb: { orientation: 'tb', width: 720, metrics: WIDE_METRICS },
  /** スマホ: 390px の画面で文字が 14px のまま読める幅 */
  narrow: { orientation: 'tb', width: 312, metrics: NARROW_METRICS },
} as const satisfies Record<string, FlowVariant>

export interface Box {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
}

export interface FlowNode extends Box {
  readonly id: string
  readonly label: readonly string[]
  readonly sub: readonly string[]
  readonly emphasis: boolean
}

export type Point = readonly [number, number]

export interface FlowChip extends Box {
  readonly text: string
  /** チップの行 (狭い図では 2 行以上に折ることがある) */
  readonly lines: readonly string[]
}

interface ChipShape {
  readonly lines: readonly string[]
  readonly w: number
  readonly h: number
}

export interface FlowEdge {
  readonly from: string
  readonly to: string
  /** 折れ線の頂点 (始点 = 出どころの縁、終点 = 行き先の縁) */
  readonly points: readonly Point[]
  readonly chip?: FlowChip
}

export interface FlowLayout {
  readonly orientation: FlowOrientation
  readonly width: number
  readonly height: number
  readonly metrics: FlowMetrics
  readonly nodes: readonly FlowNode[]
  readonly edges: readonly FlowEdge[]
}

const MARGIN = 4
/** 同じ段の箱どうしの間隔 (段に直交する向き)。lr は縦に並ぶので広め */
const GAP_CROSS = 24
const GAP_CROSS_LR = 40
/** tb の箱の最大の幅 */
const MAX_BOX_TB = 280
/** lr の箱の最大の幅 */
const MAX_BOX_LR = 240
/** 段の間の隙間: 箱の縁から通り道 (lane) までの最小の余白 */
const LANE_PAD = 20
const LANE_STEP = 8
const MIN_GAP = 44
/** チップの前後の余白 (線の区間の中に収める) */
const CHIP_GAP = 6
const GUTTER_STEP = 10
const GUTTER_OFFSET = 14

type Edge = ReturnType<typeof flowEdges>[number]

/** 図の説明 (読み上げ用の 1 文) */
export function describeFlow(block: DiagramBlock): string {
  const names = new Map(block.nodes.map((node) => [node.id, node.label]))
  const edges = flowEdges(block.nodes, block.edges).map(
    (edge) => `${names.get(edge.from)} から ${names.get(edge.to)}${edge.label ? ` (${edge.label})` : ''}`
  )
  return `${block.title}: ${edges.join('、')}`
}

/** 段の中の並び順。上流の親の位置の平均 (重心) で並べ、線の交差を減らす。同じ重心なら書いた順 */
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

/** 段の数 (lr にできるかの判定に使う) */
export function flowLayerCount(block: DiagramBlock): number {
  const layers = flowLayers(block.nodes, block.edges) ?? block.nodes.map((_, index) => index)
  return Math.max(...layers) + 1
}

/** 論理座標 (u = 段に直交する向き、v = 段の進む向き) の箱 */
interface LogicalBox {
  u: number
  v: number
  cu: number
  cv: number
}

export function layoutFlow(block: DiagramBlock, variant: FlowVariant): FlowLayout {
  const { orientation, width, metrics: m } = variant
  const ids = block.nodes.map((node) => node.id)
  const edges = flowEdges(block.nodes, block.edges)
  const layers = flowLayers(block.nodes, block.edges) ?? ids.map((_, index) => index)
  const layerOf = new Map(ids.map((id, index) => [id, layers[index]]))
  const order = orderLayers(ids, layers, edges)
  const layerCount = order.length
  const lr = orientation === 'lr'

  const incoming = (id: string) => edges.filter((edge) => edge.to === id)
  const outgoing = (id: string) => edges.filter((edge) => edge.from === id)
  const skipEdges = edges.filter((edge) => (layerOf.get(edge.to) ?? 0) - (layerOf.get(edge.from) ?? 0) > 1)

  // チップ: 行き先の側 (その行き先に入る線が 1 本だけ、または出どころが枝分かれする) か出どころの側
  const targetSide = (edge: Edge) => incoming(edge.to).length === 1 || outgoing(edge.from).length > 1
  const chipGap = (edge: Edge) => (targetSide(edge) ? (layerOf.get(edge.to) ?? 1) - 1 : layerOf.get(edge.from) ?? 0)
  const gutter = skipEdges.length > 0 ? GUTTER_OFFSET + skipEdges.length * GUTTER_STEP : 0

  // tb の箱の幅は段の隙間に依らないので先に決める (チップの幅の上限に使う)
  const tbUsable = width - MARGIN * 2 - gutter
  const tbBoxWidth = (layer: number) =>
    Math.min(MAX_BOX_TB, Math.floor((tbUsable - (order[layer].length - 1) * GAP_CROSS) / order[layer].length))

  /**
   * チップの大きさ。tb ではチップの幅を、チップが乗る側の箱の幅までにする (隣の箱に入る線を隠さない)。
   * 入り切らないラベルは文節で 2 行以上に折る
   */
  const chipLine = Math.round(m.chip * 1.3)
  const chipOf = (edge: Edge): ChipShape => {
    const text = edge.label as string
    const natural = Math.ceil(textUnits(text) * m.chip) + m.chipPadX * 2
    const sideLayer = targetSide(edge) ? layerOf.get(edge.to) ?? 0 : layerOf.get(edge.from) ?? 0
    const limit = lr ? Infinity : tbBoxWidth(sideLayer) - 4
    if (natural <= limit) return { lines: [text], w: natural, h: m.chipH }
    const lines = wrapText(text, (limit - m.chipPadX * 2) / m.chip)
    const w = Math.ceil(Math.max(...lines.map((line) => textUnits(line))) * m.chip) + m.chipPadX * 2
    return { lines, w, h: m.chipH + (lines.length - 1) * chipLine }
  }
  const chipPrimary = (edge: Edge) => (lr ? chipOf(edge).w : chipOf(edge).h)

  // 段の隙間ごとの通り道: 出ていく線を持つノード 1 つにつき 1 本 + 2 段以上先から入ってくる線 1 本につき 1 本
  const gapSources = order.map((row) => row.filter((id) => outgoing(id).length > 0))
  const gapEntries = order.map((_, gap) => skipEdges.filter((edge) => layerOf.get(edge.to) === gap + 1))
  const laneCount = (gap: number) => gapSources[gap].length + gapEntries[gap].length
  const gapShape = order.slice(0, -1).map((_, gap) => {
    const labelled = edges.filter((edge) => edge.label && chipGap(edge) === gap)
    const need = (side: boolean) =>
      Math.max(0, ...labelled.filter((edge) => targetSide(edge) === side).map((edge) => chipPrimary(edge) + CHIP_GAP * 2))
    const head = Math.max(LANE_PAD, need(false))
    const tail = Math.max(LANE_PAD, need(true))
    const lanes = Math.max(0, laneCount(gap) - 1) * LANE_STEP
    const size = Math.max(MIN_GAP, head + lanes + tail)
    return { head, tail, size, single: laneCount(gap) <= 1 }
  })

  const texts = new Map<string, { label: string[]; sub: string[]; height: number }>()
  const measure = (id: string, boxWidth: number) => {
    const node = block.nodes[ids.indexOf(id)]
    const inner = boxWidth - m.padX * 2 - 2
    const label = wrapText(node.label, inner / m.label)
    const sub = node.sub ? wrapText(node.sub, inner / m.sub) : []
    texts.set(id, { label, sub, height: label.length * m.labelLine + sub.length * m.subLine })
    return label.length * m.labelLine + sub.length * m.subLine
  }

  // 箱の位置 (論理座標)
  const boxes = new Map<string, LogicalBox>()
  const layerStart: number[] = []
  const layerEnd: number[] = []
  let crossTotal = 0
  let primaryTotal = 0

  // 箱の高さは図の中ですべて同じ (いちばん文字の多い箱に合わせる)。文字は箱の上下の真ん中 (CSS)
  if (!lr) {
    const cv = Math.max(...order.flatMap((row, layer) => row.map((id) => measure(id, tbBoxWidth(layer))))) + m.padY * 2
    let v = MARGIN
    order.forEach((row, layer) => {
      const cu = tbBoxWidth(layer)
      const rowW = row.length * cu + (row.length - 1) * GAP_CROSS
      const left = MARGIN + Math.floor((tbUsable - rowW) / 2)
      row.forEach((id, index) => boxes.set(id, { u: left + index * (cu + GAP_CROSS), v, cu, cv }))
      layerStart.push(v)
      layerEnd.push(v + cv)
      v += cv + (layer < layerCount - 1 ? gapShape[layer].size : 0)
    })
    crossTotal = width
    primaryTotal = v + MARGIN
  } else {
    const gaps = gapShape.reduce((sum, gap) => sum + gap.size, 0)
    const cv = Math.min(MAX_BOX_LR, Math.floor((width - MARGIN * 2 - gaps) / layerCount))
    const used = layerCount * cv + gaps
    let v = MARGIN + Math.floor((width - MARGIN * 2 - used) / 2)
    const cu = Math.max(...ids.map((id) => measure(id, cv))) + m.padY * 2
    const columns = order.map((row) => ({ row, span: row.length * cu + (row.length - 1) * GAP_CROSS_LR }))
    const tallest = Math.max(...columns.map((column) => column.span))
    columns.forEach(({ row, span }, layer) => {
      const top = MARGIN + (tallest - span) / 2
      row.forEach((id, index) => boxes.set(id, { u: top + index * (cu + GAP_CROSS_LR), v, cu, cv }))
      layerStart.push(v)
      layerEnd.push(v + cv)
      v += cv + (layer < layerCount - 1 ? gapShape[layer].size : 0)
    })
    crossTotal = MARGIN + tallest + gutter + MARGIN
    primaryTotal = width
  }

  const box = (id: string) => boxes.get(id) as LogicalBox
  const centerU = (id: string) => box(id).u + box(id).cu / 2

  /**
   * 隙間 gap の lane 番目の通り道の位置 (v)。通り道は頭側の余白の後ろに LANE_STEP ずつ並ぶ。
   * 1 本だけでチップも無い隙間は真ん中
   */
  const lanePosition = (gap: number, lane: number) => {
    const shape = gapShape[gap]
    const hasChip = shape.head > LANE_PAD || shape.tail > LANE_PAD
    if (shape.single && !hasChip) return layerEnd[gap] + Math.round(shape.size / 2)
    return layerEnd[gap] + shape.head + lane * LANE_STEP
  }

  /** 入ってくる線が複数あれば、相手の縁に (出どころの位置の順に) 間隔をあけて並べる */
  /**
   * 入口の位置: 入ってくる線が複数あれば、相手の縁に (出どころの位置の順に) 間隔をあけて並べる。
   * すぐ上流の段の別の箱の出口と同じ位置 (u) だと、その出口の線と入口の線が 1 本の線に重なるので、縁の上でずらす
   */
  const PORT_CLEAR = 6
  const ports = new Map<Edge, number>()
  const inPort = (edge: Edge) => {
    const known = ports.get(edge)
    if (known !== undefined) return known
    const target = box(edge.to)
    const list = incoming(edge.to).sort((a, b) => centerU(a.from) - centerU(b.from))
    const gap = (layerOf.get(edge.to) ?? 1) - 1
    const taken: number[] = []
    list.forEach((item, index) => {
      const exits = gapSources[gap].filter((id) => id !== item.from).map((id) => centerU(id))
      const preferred = target.u + (target.cu * (index + 1)) / (list.length + 1)
      const candidates = [preferred, ...[4, 3, 5, 2, 6, 1, 7].map((k) => target.u + (target.cu * k) / 8)]
      const free = candidates.find(
        (u) => exits.every((x) => Math.abs(u - x) > PORT_CLEAR) && taken.every((t) => Math.abs(u - t) > PORT_CLEAR * 2)
      )
      const port = free ?? preferred
      taken.push(port)
      ports.set(item, port)
    })
    return ports.get(edge) as number
  }

  /** 2 段以上飛ぶ線の外側の通路 (tb は右端、lr は下端)。k 本目ほど内側 */
  const gutterU = (k: number) =>
    lr ? crossTotal - MARGIN - gutter + GUTTER_OFFSET + k * GUTTER_STEP : width - MARGIN - 6 - k * GUTTER_STEP
  const toXY = (u: number, v: number): Point => (lr ? [round(v), round(u)] : [round(u), round(v)])

  const laid = edges.map((edge) => {
    const source = box(edge.from)
    const target = box(edge.to)
    const sourceGap = layerOf.get(edge.from) ?? 0
    const su = centerU(edge.from)
    const sv = source.v + source.cv
    // 出口とほぼ同じ位置の入口は、出口の位置にそろえて真っすぐにする (わずかな斜めの線を描かない)
    const port = inPort(edge)
    const tu = Math.abs(su - port) < 0.5 ? su : port
    const tv = target.v
    const outLane = lanePosition(sourceGap, gapSources[sourceGap].indexOf(edge.from))
    const skipIndex = skipEdges.indexOf(edge)
    let logical: Array<[number, number]>
    let entryFrom: number
    if (skipIndex >= 0) {
      const targetGap = (layerOf.get(edge.to) ?? 1) - 1
      const inLane = lanePosition(targetGap, gapSources[targetGap].length + gapEntries[targetGap].indexOf(edge))
      const around = gutterU(skipIndex)
      logical = [[su, sv], [su, outLane], [around, outLane], [around, inLane], [tu, inLane], [tu, tv]]
      entryFrom = inLane
    } else if (Math.abs(su - tu) < 0.5) {
      logical = [[su, sv], [tu, tv]]
      entryFrom = sv
    } else {
      logical = [[su, sv], [su, outLane], [tu, outLane], [tu, tv]]
      entryFrom = outLane
    }
    const points = logical.map(([u, v]) => toXY(u, v))

    let chip: FlowChip | undefined
    if (edge.label) {
      const size = chipOf(edge)
      const cuSize = lr ? size.h : size.w
      const cvSize = lr ? size.w : size.h
      let cu: number
      let cv: number
      if (targetSide(edge)) {
        // 行き先の縁の手前: 通り道の最後 (または出どころの縁) から行き先までの区間の真ん中
        const gap = (layerOf.get(edge.to) ?? 1) - 1
        const from = Math.max(entryFrom, layerEnd[gap] + gapShape[gap].size - gapShape[gap].tail)
        cv = (from + tv) / 2 - cvSize / 2
        cu = tu - cuSize / 2
        // 行き先の箱の幅の中に寄せる (隣の箱に入る線にかからない)。線の位置はチップの中に残す
        if (cuSize <= target.cu) cu = Math.min(Math.max(cu, target.u), target.u + target.cu - cuSize)
      } else {
        cv = (sv + outLane) / 2 - cvSize / 2
        cu = su - cuSize / 2
      }
      // 図の外にはみ出さない (端の近くの線のチップ)。線の位置はチップの中に残る
      cu = Math.min(Math.max(cu, 0), crossTotal - cuSize)
      const [x, y] = lr ? [cv, cu] : [cu, cv]
      chip = { text: edge.label, lines: size.lines, x: round(x), y: round(y), w: lr ? cvSize : cuSize, h: lr ? cuSize : cvSize }
    }
    return { from: edge.from, to: edge.to, points, ...(chip ? { chip } : {}) }
  })

  const nodes: FlowNode[] = ids.map((id) => {
    const b = box(id)
    const text = texts.get(id) as { label: string[]; sub: string[] }
    const [x, y] = toXY(b.u, b.v)
    const node = block.nodes[ids.indexOf(id)]
    return {
      id,
      x,
      y,
      w: round(lr ? b.cv : b.cu),
      h: round(lr ? b.cu : b.cv),
      label: text.label,
      sub: text.sub,
      emphasis: node.emphasis === true,
    }
  })

  return {
    orientation,
    width: round(lr ? primaryTotal : crossTotal),
    height: round(lr ? crossTotal : primaryTotal),
    metrics: m,
    nodes,
    edges: laid,
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
