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

/** 図の範囲・箱どうし・矢印のラベルと箱の重なり・文字の幅を検査する */
function expectClean(layout: DiagramLayout) {
  const { LABEL_SIZE, SUB_SIZE, PAD, EDGE_LABEL_SIZE } = DIAGRAM_TEXT
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
  for (const edge of layout.edges) {
    if (!edge.label) continue
    const w = textUnits(edge.label.text) * EDGE_LABEL_SIZE
    const box = {
      x: edge.label.anchor === 'start' ? edge.label.x : edge.label.x - w,
      y: edge.label.y - EDGE_LABEL_SIZE,
      w,
      h: EDGE_LABEL_SIZE,
    }
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.w).toBeLessThanOrEqual(layout.width)
    for (const node of layout.nodes) {
      expect(intersects(box, node), `矢印のラベル「${edge.label.text}」が ${node.id} に重なる`).toBe(false)
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
