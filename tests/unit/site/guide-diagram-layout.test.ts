import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { diagramSchema, type DiagramBlock } from '@/app/posts/_lib/guide-blocks'
import {
  FLOW_VARIANTS,
  MAX_LR_LAYERS,
  flowLayerCount,
  layoutFlow,
  type Box,
  type FlowLayout,
  type FlowVariant,
} from '@/components/guide/diagram-layout'
import { textUnits, wrapText } from '@/components/guide/text-wrap'

// vitest の esbuild は tsconfig の jsx: preserve により classic 変換 (React.createElement) になる
vi.stubGlobal('React', React)

import FlowDiagram from '@/components/guide/FlowDiagram'

const intersects = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

/** flow の箱に書ける最長 (24 字) のラベル */
const LONG = '長いラベルが折り返されても箱からはみ出さない'

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

/** 折れ線を線分に分ける (すべて縦か横) */
function segments(layout: FlowLayout): Segment[] {
  return layout.edges.flatMap((edge, index) =>
    edge.points.slice(1).map(([x, y], k): Segment => {
      const [px, py] = edge.points[k]
      const vertical = px === x
      expect(vertical || py === y, `斜めの線分 ${px},${py} → ${x},${y}`).toBe(true)
      return vertical
        ? { edge: index, from: edge.from, vertical, at: x, lo: Math.min(py, y), hi: Math.max(py, y) }
        : { edge: index, from: edge.from, vertical, at: y, lo: Math.min(px, x), hi: Math.max(px, x) }
    })
  )
}

const segmentHitsBox = (segment: Segment, box: Box) =>
  segment.vertical
    ? segment.at > box.x && segment.at < box.x + box.w && segment.lo < box.y + box.h && segment.hi > box.y
    : segment.at > box.y && segment.at < box.y + box.h && segment.lo < box.x + box.w && segment.hi > box.x

/** 点が箱の縁の上にあるか */
const onEdge = ([x, y]: readonly [number, number], box: Box) => {
  const inX = x >= box.x - 0.01 && x <= box.x + box.w + 0.01
  const inY = y >= box.y - 0.01 && y <= box.y + box.h + 0.01
  const onV = Math.abs(x - box.x) < 0.01 || Math.abs(x - box.x - box.w) < 0.01
  const onH = Math.abs(y - box.y) < 0.01 || Math.abs(y - box.y - box.h) < 0.01
  return inX && inY && (onV || onH)
}

/**
 * 図の検査: 範囲内 / 箱どうしが重ならない / 文字が箱の幅に収まる / 線の端が箱の縁にある / 線が箱を横切らない /
 * 別の出どころの線どうしが同じ線の上で重ならない / チップどうし・チップと箱・チップとほかの線が重ならない
 */
function expectClean(layout: FlowLayout) {
  const m = layout.metrics
  const byId = new Map(layout.nodes.map((node) => [node.id, node]))
  for (const node of layout.nodes) {
    expect(node.x, node.id).toBeGreaterThanOrEqual(0)
    expect(node.y, node.id).toBeGreaterThanOrEqual(0)
    expect(node.x + node.w, node.id).toBeLessThanOrEqual(layout.width + 0.01)
    expect(node.y + node.h, node.id).toBeLessThanOrEqual(layout.height + 0.01)
    const inner = node.w - m.padX * 2 - 2
    for (const line of node.label) expect(textUnits(line) * m.label, line).toBeLessThanOrEqual(inner + 0.5)
    for (const line of node.sub) expect(textUnits(line) * m.sub, line).toBeLessThanOrEqual(inner + 0.5)
    const textHeight = node.label.length * m.labelLine + node.sub.length * m.subLine
    expect(textHeight + m.padY * 2, `${node.id} の文字の高さ`).toBeLessThanOrEqual(node.h + 0.01)
  }
  layout.nodes.forEach((a, i) =>
    layout.nodes.slice(i + 1).forEach((b) => expect(intersects(a, b), `${a.id} と ${b.id} が重なる`).toBe(false))
  )
  // 箱の高さは図の中ですべて同じ (いちばん文字の多い箱に合わせる)
  const heights = new Set(layout.nodes.map((node) => node.h))
  expect(heights.size, `箱の高さがそろわない ${[...heights].join(', ')}`).toBe(1)
  const tallestText = Math.max(...layout.nodes.map((node) => node.label.length * m.labelLine + node.sub.length * m.subLine))
  expect(layout.nodes[0].h).toBeCloseTo(tallestText + m.padY * 2, 1)

  for (const edge of layout.edges) {
    expect(onEdge(edge.points[0], byId.get(edge.from)!), `${edge.from}→${edge.to} の始点`).toBe(true)
    expect(onEdge(edge.points[edge.points.length - 1], byId.get(edge.to)!), `${edge.from}→${edge.to} の終点`).toBe(true)
  }

  const segs = segments(layout)
  for (const segment of segs) {
    for (const node of layout.nodes) {
      expect(segmentHitsBox(segment, node), `線 ${JSON.stringify(layout.edges[segment.edge].points)} が ${node.id} を横切る`).toBe(false)
    }
    for (const other of segs) {
      if (other.edge <= segment.edge || other.from === segment.from || other.vertical !== segment.vertical) continue
      const overlap = other.at === segment.at && Math.min(other.hi, segment.hi) - Math.max(other.lo, segment.lo) > 1
      expect(overlap, `線 ${segment.edge} と ${other.edge} が同じ線の上で重なる`).toBe(false)
    }
  }

  const chips = layout.edges.flatMap((edge, index) => (edge.chip ? [{ index, box: edge.chip, text: edge.chip.text }] : []))
  for (const chip of chips) {
    expect(chip.box.x).toBeGreaterThanOrEqual(0)
    expect(chip.box.y).toBeGreaterThanOrEqual(0)
    expect(chip.box.x + chip.box.w).toBeLessThanOrEqual(layout.width + 0.01)
    expect(chip.box.y + chip.box.h).toBeLessThanOrEqual(layout.height + 0.01)
    // チップは自分の線の上にある (線が通る)
    expect(segs.some((segment) => segment.edge === chip.index && segmentHitsBox(segment, chip.box)), `チップ「${chip.text}」が線の上にない`).toBe(true)
    for (const node of layout.nodes) {
      expect(intersects(chip.box, node), `チップ「${chip.text}」が ${node.id} に重なる`).toBe(false)
    }
    for (const other of chips) {
      if (other.index !== chip.index) expect(intersects(chip.box, other.box), `チップ「${chip.text}」と「${other.text}」が重なる`).toBe(false)
    }
    for (const segment of segs) {
      if (segment.edge !== chip.index) {
        expect(segmentHitsBox(segment, chip.box), `チップ「${chip.text}」の上を線 ${segment.edge} が通る`).toBe(false)
      }
    }
  }
}

/** 実際に使う配置すべて: PC (段が 4 つまでなら左から右、それ以上は上から下) とスマホ */
function variantsFor(block: DiagramBlock): Array<[string, FlowVariant]> {
  const wide: Array<[string, FlowVariant]> =
    flowLayerCount(block) <= MAX_LR_LAYERS ? [['wideLr', FLOW_VARIANTS.wideLr]] : []
  return [...wide, ['wideTb', FLOW_VARIANTS.wideTb], ['narrow', FLOW_VARIANTS.narrow]]
}

function expectCleanEverywhere(block: DiagramBlock): Record<string, FlowLayout> {
  const layouts: Record<string, FlowLayout> = {}
  for (const [name, variant] of variantsFor(block)) {
    const layout = layoutFlow(block, variant)
    expect(layout.width, name).toBe(variant.width)
    expectClean(layout)
    layouts[name] = layout
  }
  return layouts
}

describe('図のレイアウト (flow): PC の横長・縦長・スマホのどれでも重ならない', () => {
  it.each([1, 2, 4, 5, 8])('一本道 (%i ノード、edges 省略)', (n) => {
    const block = diagram({ kind: 'flow', title: 't', nodes: nodes(n) })
    const layouts = expectCleanEverywhere(block)
    expect(layouts.narrow.edges).toHaveLength(n - 1)
  })

  it('分岐と合流 (1 段に 3 つ + ラベル付きの線)', () => {
    const block = diagram({
      kind: 'flow',
      title: 't',
      nodes: nodes(7, (i) => (i === 3 ? LONG : `手順 ${i + 1}`)),
      edges: [
        { from: 'n0', to: 'n1', label: 'はい' },
        { from: 'n0', to: 'n2', label: 'いいえ' },
        { from: 'n0', to: 'n3', label: 'あとで判断する' },
        { from: 'n1', to: 'n4' },
        { from: 'n2', to: 'n4' },
        { from: 'n3', to: 'n5' },
        { from: 'n4', to: 'n6' },
        { from: 'n5', to: 'n6' },
      ],
    })
    const layouts = expectCleanEverywhere(block)
    expect(new Set(layouts.narrow.nodes.map((node) => node.y)).size).toBe(4)
    expect(new Set(layouts.wideLr.nodes.map((node) => node.x)).size).toBe(4)
  })

  it('2 段以上飛ぶ線は外側の通路を通り、途中の箱を横切らない (ラベルは出どころ側)', () => {
    const block = diagram({
      kind: 'flow',
      title: 't',
      nodes: ['r', 'a', 'b', 'c', 's', 'e'].map((id) => ({ id, label: `手順 ${id}` })),
      edges: [
        { from: 'r', to: 'a' },
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
        { from: 's', to: 'c', label: '近道' },
        { from: 'c', to: 'e' },
      ],
    })
    const layouts = expectCleanEverywhere(block)
    const skip = layouts.narrow.edges.find((edge) => edge.from === 's' && edge.to === 'c')!
    const laneX = skip.points[2][0]
    for (const node of layouts.narrow.nodes) expect(node.x + node.w).toBeLessThan(laneX)
    expect(skip.chip?.text).toBe('近道')
  })

  it('分岐する箱から合流する箱への線にはラベルを付けられない (その線だけの区間が無い)', () => {
    const result = diagramSchema.safeParse({
      kind: 'flow',
      title: 't',
      nodes: ['a', 'b', 'c'].map((id) => ({ id, label: id })),
      edges: [
        { from: 'a', to: 'b' },
        { from: 'a', to: 'c', label: '近道' },
        { from: 'b', to: 'c' },
      ],
    })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('分岐の先')
  })

  it('合流する線のラベルは出どころ側に置き、重ならない (a,b,c → d)', () => {
    expectCleanEverywhere(
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
  })

  it('長いラベルの分岐 (1 段に 3 つ) でもラベルが重ならない', () => {
    expectCleanEverywhere(
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
  })

  it('交差する線は段の中の並びを入れ替えて交差をなくす (a→d, b→c)', () => {
    const layouts = expectCleanEverywhere(
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
    const x = (id: string) => layouts.narrow.nodes.find((node) => node.id === id)!.x
    expect(x('d')).toBeLessThan(x('c'))
    expect(layouts.narrow.edges.every((edge) => edge.points.length === 2)).toBe(true)
  })

  it('同じ相手へ 2 段以上飛ぶ線が 2 本でも線が重ならない (b→e, a→e)', () => {
    expectCleanEverywhere(
      diagram({
        kind: 'flow',
        title: 't',
        nodes: ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, label: id.toUpperCase() })),
        edges: [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'c' },
          { from: 'c', to: 'd' },
          { from: 'd', to: 'e', label: '通常' },
          { from: 'b', to: 'e' },
          { from: 'a', to: 'e' },
        ],
      })
    )
  })

  it('英大文字の長いラベルも箱に収まる (スマホの 1 段に 3 つでも)', () => {
    expectCleanEverywhere(
      diagram({
        kind: 'flow',
        title: 't',
        nodes: [{ id: 'a', label: 'AWS MANAGEMENT CONSOLE W' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }, { id: 'd', label: LONG }],
        edges: [{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }, { from: 'a', to: 'd' }],
      })
    )
  })

  it('見本の図 (Claude Code と MCP): PC は左から右、スマホは上から下の 2 列', () => {
    const block = diagram({
      kind: 'flow',
      title: 't',
      nodes: [
        { id: 'you', label: 'あなた', sub: 'ターミナルや IDE で依頼' },
        { id: 'cc', label: 'Claude Code', sub: 'MCP クライアントを内蔵', emphasis: true },
        { id: 'local', label: 'MCP サーバー', sub: '手元で動くプロセス' },
        { id: 'remote', label: 'MCP サーバー', sub: '提供元がネットで公開' },
        { id: 'ltool', label: '手元の道具', sub: 'ブラウザや DB' },
        { id: 'rtool', label: 'SaaS のデータ', sub: 'Sentry や Notion' },
      ],
      edges: [
        { from: 'you', to: 'cc' },
        { from: 'cc', to: 'local', label: 'stdio' },
        { from: 'cc', to: 'remote', label: 'HTTP' },
        { from: 'local', to: 'ltool' },
        { from: 'remote', to: 'rtool' },
      ],
    })
    const { wideLr, narrow } = expectCleanEverywhere(block)
    // PC: 段は左から右 (x が 4 通り)、スマホ: 段は上から下 (y が 4 通り)
    expect(new Set(wideLr.nodes.map((node) => node.x)).size).toBe(4)
    expect(new Set(narrow.nodes.map((node) => node.y)).size).toBe(4)
    expect(wideLr.nodes.find((node) => node.id === 'cc')?.emphasis).toBe(true)
    // スマホでも箱の文字は 14px のまま (箱の幅は 1 段に 2 つで 130px 以上)
    for (const node of narrow.nodes) expect(node.w).toBeGreaterThanOrEqual(130)
  })
})

describe('FlowDiagram の HTML', () => {
  const block = diagram({
    kind: 'flow',
    title: '導入の流れ',
    nodes: [
      { id: 'a', label: 'インストール' },
      { id: 'b', label: 'ログイン' },
    ],
    edges: [{ from: 'a', to: 'b', label: '次に' }],
  })
  const html = renderToStaticMarkup(React.createElement(FlowDiagram, { block }))

  it('箱の文字は HTML、線だけ SVG (PC 用とスマホ用の 2 つの配置)。読み上げは role=img の説明で', () => {
    expect((html.match(/class="guide-flow"/g) ?? []).length).toBe(2)
    expect(html).toContain('data-variant="wide"')
    expect(html).toContain('data-variant="narrow"')
    expect(html).toMatch(/<div class="guide-flow__node"[^>]*data-node="a"[^>]*><span class="guide-flow__label"><span class="guide-flow__text">インストール<\/span>/)
    expect(html).not.toMatch(/<text[\s>]/)
    expect(html).toContain('aria-label="導入の流れ: インストール から ログイン (次に)"')
    expect(html).toMatch(/<svg class="guide-flow__lines"[^>]*aria-hidden="true"/)
    expect(html).toContain('<span class="guide-flow__chip"')
    expect(html).toContain('<figcaption class="guide-caption guide-diagram__title">導入の<wbr/>流れ</figcaption>')
  })

  it('timeline と cards は座標を使わない HTML のリスト', () => {
    const timeline = renderToStaticMarkup(
      React.createElement(FlowDiagram, {
        block: diagram({ kind: 'timeline', title: 't', nodes: [{ id: 'a', label: '初版を公開', sub: '2026-09-20' }] }),
      })
    )
    expect(timeline).toContain('<ol class="guide-timeline">')
    expect(timeline).toContain('<span class="guide-timeline__when">2026-09-20</span>')
    const cards = renderToStaticMarkup(
      React.createElement(FlowDiagram, { block: diagram({ kind: 'cards', title: 't', nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] }) })
    )
    expect(cards).toContain('<ul class="guide-cells" data-count="2">')
    expect(cards).not.toContain('<svg')
  })
})

describe('文字の折り返し (図の箱)', () => {
  it('幅に収め、日本語の語の途中で切らず、行頭に約物を置かない', () => {
    const lines = wrapText('インストールする前に、設定ファイルを確認します。', 10)
    for (const line of lines) expect(textUnits(line)).toBeLessThanOrEqual(10)
    expect(lines.join('')).toBe('インストールする前に、設定ファイルを確認します。')
    expect(lines.some((line) => /^[、。]/.test(line))).toBe(false)
    expect(lines).not.toContain('ル')
  })

  it('文節の区切りで折る (「ターミナルや IDE で依頼」は「ターミナルや」の後)', () => {
    // 「IDE で」は改行しない空白でつながる (行頭に助詞を置かない)
    expect(wrapText('ターミナルや IDE で依頼', 8)).toEqual(['ターミナルや', 'IDE\u00a0で依頼'])
  })

  it('1 語が幅より長ければ文字単位で切る', () => {
    const lines = wrapText('a'.repeat(30), 5)
    for (const line of lines) expect(textUnits(line)).toBeLessThanOrEqual(5)
    expect(lines.join('')).toBe('a'.repeat(30))
  })
})

describe('図のレイアウト (flow): 乱数で作った図でも重ならない', () => {
  /** 再現できる乱数 (mulberry32) */
  function random(seed: number) {
    let a = seed
    return () => {
      a |= 0
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  const LABELS = ['はい', 'いいえ', '個人', '会社', 'stdio', 'HTTP', '条件 A のとき', 'とても長いラベル十二字', '近道', 'API']
  const NAMES = ['インストール', 'ログイン', 'MCP サーバー', 'Claude Code', '小さな作業で試す', LONG, 'AWS MANAGEMENT CONSOLE W', '結果を確かめる']

  it.each(Array.from({ length: 120 }, (_, i) => i + 1))('seed %i', (seed) => {
    const rand = random(seed)
    const count = 2 + Math.floor(rand() * 7)
    const list = Array.from({ length: count }, (_, i) => ({
      id: `n${i}`,
      label: NAMES[Math.floor(rand() * NAMES.length)],
      ...(rand() < 0.5 ? { sub: '補足の説明が入ります' } : {}),
    }))
    const edges: Array<{ from: string; to: string; label?: string }> = []
    for (let to = 1; to < count; to += 1) {
      const from = Math.floor(rand() * to)
      edges.push({ from: `n${from}`, to: `n${to}`, ...(rand() < 0.4 ? { label: LABELS[Math.floor(rand() * LABELS.length)] } : {}) })
      if (rand() < 0.25 && to > 1) {
        const other = Math.floor(rand() * to)
        if (other !== from) edges.push({ from: `n${other}`, to: `n${to}` })
      }
    }
    const parsed = diagramSchema.safeParse({ kind: 'flow', title: 't', nodes: list, edges })
    // 1 段に 4 つ以上になる図は検査で落ちる (描かない) ので対象外
    if (!parsed.success) return
    expectCleanEverywhere(parsed.data)
  })
})
