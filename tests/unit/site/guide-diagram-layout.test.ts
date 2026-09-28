import { describe, expect, it } from 'vitest'
import { diagramSchema, type DiagramBlock } from '@/app/posts/_lib/guide-blocks'
import { DIAGRAM_TEXT, layoutDiagram, type DiagramLayout } from '@/components/guide/diagram-layout'
import { textUnits, wrapText } from '@/components/guide/text-wrap'

interface Box {
  x: number
  y: number
  w: number
  h: number
}

const intersects = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

const LONG = '長いラベルが折り返されても箱からはみ出さないことを確かめる'

function diagram(value: unknown): DiagramBlock {
  return diagramSchema.parse(value)
}

const nodes = (n: number, label = (i: number) => `手順 ${i + 1}`) =>
  Array.from({ length: n }, (_, i) => ({ id: `n${i}`, label: label(i), sub: i % 2 === 0 ? `補足の説明 ${i + 1}` : undefined }))

interface Segment {
  edge: number
  from: string
  vertical: boolean
  /** 縦なら x、横なら y */
  at: number
  lo: number
  hi: number
}

/** path の d (M x y / V y / H x だけ) を線分に分ける */
function segments(layout: DiagramLayout): Segment[] {
  return layout.edges.flatMap((edge, index) => {
    const tokens = edge.path.match(/[MVH][^MVH]*/g) ?? []
    let x = 0
    let y = 0
    const out: Segment[] = []
    for (const token of tokens) {
      const values = token.slice(1).trim().split(/\s+/).map(Number)
      if (token[0] === 'M') [x, y] = values
      else if (token[0] === 'V') {
        out.push({ edge: index, from: edge.from, vertical: true, at: x, lo: Math.min(y, values[0]), hi: Math.max(y, values[0]) })
        y = values[0]
      } else {
        out.push({ edge: index, from: edge.from, vertical: false, at: y, lo: Math.min(x, values[0]), hi: Math.max(x, values[0]) })
        x = values[0]
      }
    }
    return out
  })
}

const segmentHitsBox = (segment: Segment, box: Box) =>
  segment.vertical
    ? segment.at > box.x && segment.at < box.x + box.w && segment.lo < box.y + box.h && segment.hi > box.y
    : segment.at > box.y && segment.at < box.y + box.h && segment.lo < box.x + box.w && segment.hi > box.x

/**
 * 図の検査: 範囲内 / 箱どうしが重ならない / 文字が箱の幅に収まる / 矢印が箱を横切らない /
 * 別の出どころの矢印どうしが同じ線の上で重ならない / ラベルどうし・ラベルと箱・ラベルとほかの矢印が重ならない
 */
function expectClean(layout: DiagramLayout) {
  const { LABEL_SIZE, SUB_SIZE, PAD } = DIAGRAM_TEXT
  for (const node of layout.nodes) {
    expect(node.x, node.id).toBeGreaterThanOrEqual(0)
    expect(node.y, node.id).toBeGreaterThanOrEqual(0)
    expect(node.x + node.w, node.id).toBeLessThanOrEqual(layout.width)
    expect(node.y + node.h, node.id).toBeLessThanOrEqual(layout.height)
    const inner = layout.kind === 'timeline' ? node.w : node.w - PAD * 2
    for (const line of node.label) expect(textUnits(line) * LABEL_SIZE, line).toBeLessThanOrEqual(inner + 0.5)
    for (const line of node.sub) expect(textUnits(line) * SUB_SIZE, line).toBeLessThanOrEqual(inner + 0.5)
  }
  layout.nodes.forEach((a, i) =>
    layout.nodes.slice(i + 1).forEach((b) => expect(intersects(a, b), `${a.id} と ${b.id} が重なる`).toBe(false))
  )

  const segs = segments(layout)
  for (const segment of segs) {
    for (const node of layout.nodes) {
      expect(segmentHitsBox(segment, node), `矢印 ${layout.edges[segment.edge].path} が ${node.id} を横切る`).toBe(false)
    }
    for (const other of segs) {
      if (other.edge <= segment.edge || other.from === segment.from || other.vertical !== segment.vertical) continue
      const overlap = other.at === segment.at && Math.min(other.hi, segment.hi) - Math.max(other.lo, segment.lo) > 1
      expect(overlap, `${layout.edges[segment.edge].path} と ${layout.edges[other.edge].path} が同じ線の上で重なる`).toBe(false)
    }
  }

  const labels = layout.edges.flatMap((edge, index) => (edge.label ? [{ index, box: edge.label.box, text: edge.label.text }] : []))
  for (const label of labels) {
    expect(label.box.x).toBeGreaterThanOrEqual(0)
    expect(label.box.x + label.box.w).toBeLessThanOrEqual(layout.width)
    for (const node of layout.nodes) {
      expect(intersects(label.box, node), `ラベル「${label.text}」が ${node.id} に重なる`).toBe(false)
    }
    for (const other of labels) {
      if (other.index !== label.index) expect(intersects(label.box, other.box), `ラベル「${label.text}」と「${other.text}」が重なる`).toBe(false)
    }
    for (const segment of segs) {
      if (segment.edge !== label.index) {
        expect(segmentHitsBox(segment, label.box), `ラベル「${label.text}」の上を ${layout.edges[segment.edge].path} が通る`).toBe(false)
      }
    }
  }
}

describe('図のレイアウト: 8 ノードまで重ならない', () => {
  it.each([1, 2, 5, 8])('flow の一本道 (%i ノード、edges 省略)', (n) => {
    const layout = layoutDiagram(diagram({ kind: 'flow', title: 't', nodes: nodes(n) }))
    expect(layout.edges).toHaveLength(n - 1)
    expectClean(layout)
  })

  it('flow の分岐と合流 (1 段に 4 つ + ラベル付きの矢印)', () => {
    const block = diagram({
      kind: 'flow',
      title: 't',
      nodes: nodes(8, (i) => (i === 3 ? LONG : `手順 ${i + 1}`)),
      edges: [
        { from: 'n0', to: 'n1', label: 'はい' },
        { from: 'n0', to: 'n2', label: 'いいえ' },
        { from: 'n0', to: 'n3', label: 'あとで判断する' },
        { from: 'n0', to: 'n4', label: 'その他' },
        { from: 'n1', to: 'n5' },
        { from: 'n2', to: 'n5' },
        { from: 'n3', to: 'n6' },
        { from: 'n4', to: 'n6' },
        { from: 'n5', to: 'n7' },
        { from: 'n6', to: 'n7' },
      ],
    })
    const layout = layoutDiagram(block)
    expect(new Set(layout.nodes.map((node) => node.y)).size).toBe(4)
    expectClean(layout)
  })

  it('flow の 2 段以上飛ぶ矢印は右端の通路を通り、途中の箱を横切らない', () => {
    const block = diagram({
      kind: 'flow',
      title: 't',
      nodes: nodes(5),
      edges: [
        { from: 'n0', to: 'n1' },
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
        { from: 'n0', to: 'n3', label: '近道' },
        { from: 'n3', to: 'n4' },
      ],
    })
    const layout = layoutDiagram(block)
    expectClean(layout)
    const skip = layout.edges.find((edge) => edge.from === 'n0' && edge.to === 'n3')
    const lane = Number(skip?.path.match(/H(\d+) V/)?.[1])
    for (const node of layout.nodes) expect(node.x + node.w).toBeLessThan(lane)
  })

  it('合流する矢印のラベルは出どころ側に置き、重ならない (a,b,c → d)', () => {
    const layout = layoutDiagram(
      diagram({
        kind: 'flow',
        title: 't',
        nodes: ['a', 'b', 'c', 'd'].map((id) => ({ id, label: id.toUpperCase() })),
        edges: [
          { from: 'a', to: 'd', label: '条件 A のとき' },
          { from: 'b', to: 'd' },
          { from: 'c', to: 'd', label: '条件 C のとき' },
        ],
      })
    )
    expectClean(layout)
  })

  it('長いラベルの分岐 (1 段に 3 つ) でもラベルが重ならない', () => {
    const layout = layoutDiagram(
      diagram({
        kind: 'flow',
        title: 't',
        nodes: ['r', 'a', 'b', 'c'].map((id) => ({ id, label: `手順 ${id}` })),
        edges: [
          { from: 'r', to: 'a', label: 'とても長いラベル十二字' },
          { from: 'r', to: 'b', label: 'とても長いラベル十二字' },
          { from: 'r', to: 'c', label: 'とても長いラベル十二字' },
        ],
      })
    )
    expectClean(layout)
  })

  it('交差する矢印は段の中の並びを入れ替えて交差をなくす (a→d, b→c)', () => {
    const layout = layoutDiagram(
      diagram({
        kind: 'flow',
        title: 't',
        nodes: ['a', 'b', 'c', 'd'].map((id) => ({ id, label: id.toUpperCase() })),
        edges: [
          { from: 'a', to: 'd' },
          { from: 'b', to: 'c' },
        ],
      })
    )
    expectClean(layout)
    const x = (id: string) => layout.nodes.find((node) => node.id === id)!.x
    expect(x('d')).toBeLessThan(x('c'))
    expect(layout.edges.every((edge) => /^M\S+ \S+ V\S+$/.test(edge.path))).toBe(true)
  })

  it('同じ相手へ 2 段以上飛ぶ矢印が 2 本でも線が重ならない (b→e, d→e)', () => {
    const layout = layoutDiagram(
      diagram({
        kind: 'flow',
        title: 't',
        nodes: ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, label: id.toUpperCase() })),
        edges: [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'c' },
          { from: 'c', to: 'd' },
          { from: 'd', to: 'e', label: '通常' },
          { from: 'b', to: 'e', label: '近道' },
          { from: 'a', to: 'e' },
        ],
      })
    )
    expectClean(layout)
  })

  it('英大文字の長いラベルも箱に収まる', () => {
    const layout = layoutDiagram(
      diagram({ kind: 'flow', title: 't', nodes: [{ id: 'a', label: 'AWS MANAGEMENT CONSOLE WWW MMM' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }, { id: 'd', label: 'D' }], edges: [{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }, { from: 'a', to: 'd' }] })
    )
    expectClean(layout)
  })

  it.each([3, 8])('timeline (%i ノード、長い文)', (n) => {
    const layout = layoutDiagram(diagram({ kind: 'timeline', title: 't', nodes: nodes(n, () => LONG) }))
    expect(layout.axis).toBeDefined()
    expectClean(layout)
  })

  it.each([1, 7, 8])('cards (%i ノード)', (n) => {
    const layout = layoutDiagram(diagram({ kind: 'cards', title: 't', nodes: nodes(n, (i) => (i % 3 === 0 ? LONG : `項目 ${i}`)) }))
    expectClean(layout)
  })
})

describe('文字の折り返し', () => {
  it('幅に収め、日本語の語の途中で切らず、行頭に約物を置かない', () => {
    const lines = wrapText('インストールする前に、設定ファイルを確認します。', 10)
    for (const line of lines) expect(textUnits(line)).toBeLessThanOrEqual(10)
    expect(lines.join('')).toBe('インストールする前に、設定ファイルを確認します。')
    expect(lines.some((line) => /^[、。]/.test(line))).toBe(false)
    expect(lines).not.toContain('ル')
  })

  it('1 語が幅より長ければ文字単位で切る', () => {
    const lines = wrapText('a'.repeat(30), 5)
    for (const line of lines) expect(textUnits(line)).toBeLessThanOrEqual(5)
    expect(lines.join('')).toBe('a'.repeat(30))
  })
})
