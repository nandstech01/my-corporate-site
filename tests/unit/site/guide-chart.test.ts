import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { chartSchema } from '@/app/posts/_lib/guide-blocks'

// vitest の esbuild は tsconfig の jsx: preserve により classic 変換 (React.createElement) になる
vi.stubGlobal('React', React)

import BarChart, { VALUE_FONT, chartLegend, chartScale } from '@/components/guide/BarChart'
import { textUnits } from '@/components/guide/text-wrap'

const block = chartSchema.parse({
  title: '1 回あたりの時間の中央値',
  unit: '秒',
  note: '水色が Opus 5.5 です。',
  source: '当社の検証記録',
  rows: [
    { label: 'Opus 5.5', note: 'high', value: 31, highlight: true },
    { label: 'Opus 5', note: 'high', value: 62 },
    { label: 'なし', value: 0 },
    { label: 'Team', value: 1234.5 },
  ],
})

describe('横棒グラフ (HTML の表を棒の形に描く)', () => {
  const html = renderToStaticMarkup(React.createElement(BarChart, { block }))

  it('目盛りは 1・2・5 × 10 のべき乗の間隔で 0 から最大値まで。棒の基準は最大値', () => {
    const scale = chartScale(block)
    expect(scale.max).toBe(1234.5)
    expect(scale.ticks).toEqual([0, 500, 1000])
    expect(chartScale(chartSchema.parse({ title: 't', rows: [{ label: 'a', value: 62 }] })).ticks).toEqual([0, 20, 40, 60])
    expect(chartScale(chartSchema.parse({ title: 't', rows: [{ label: 'a', value: 0 }] })).max).toBe(1)
  })

  it('値の文字は棒の右の予約した余白に入る (いちばん長い値の幅 + 間隔)。本文の表と同じ「31 秒」の書き方', () => {
    const scale = chartScale(block)
    expect(scale.values).toEqual(['31 秒', '62 秒', '0 秒', '1,234.5 秒'])
    expect(scale.reserve).toBeGreaterThanOrEqual(textUnits('1,234.5 秒') * VALUE_FONT + 8)
    expect(html).toContain('--reserve:')
  })

  it('項目は th (行見出し)、値は td。棒の長さは CSS の --v / --max。SVG の文字は使わない', () => {
    expect(html).not.toContain('<svg')
    // 製品名は改行しない空白 (U+00A0) でつなぐ。強調した行は読み上げにも凡例の意味を付ける
    expect(html).toContain(
      '<th scope="row" class="guide-chart__label"><span class="guide-chart__name">Opus\u00a05.5<span class="guide-sr">（Opus 5.5）</span></span><span class="guide-chart__sub">high</span></th>'
    )
    expect(html).toContain('<td class="guide-chart__cell" data-value="1234.5">')
    expect(html).toContain('<span class="guide-chart__value" style="--v:1234.5">1,234.5 秒</span>')
    expect(html).toContain('<caption class="guide-sr">1 回あたりの時間の中央値 (単位: 秒)</caption>')
  })

  it('主役の行 (highlight) だけ印を付け (CSS でシアン)、凡例を出す。legend が無ければ強調した行の名前', () => {
    expect((html.match(/data-highlight=""/g) ?? []).length).toBe(1)
    expect(html).toContain('<span class="guide-chart__legend"><span class="guide-chart__swatch" aria-hidden="true"></span>Opus\u00a05.5</span>')
    expect(chartLegend(chartSchema.parse({ title: 't', legend: '既定の設定', rows: [{ label: 'a', value: 1, highlight: true }] }))).toBe('既定の設定')
    expect(chartLegend(chartSchema.parse({ title: 't', rows: [{ label: 'a', value: 1 }] }))).toBeNull()
    const three = chartSchema.parse({ title: 't', rows: ['a', 'b', 'c'].map((label) => ({ label, value: 1, highlight: true })) })
    expect(chartLegend(three)).toBe('強調した項目')
    // 強調が無ければ凡例は出さない
    const plain = renderToStaticMarkup(React.createElement(BarChart, { block: chartSchema.parse({ title: 't', rows: [{ label: 'a', value: 1 }] }) }))
    expect(plain).not.toContain('guide-chart__legend')
  })

  it('ドルは $ を前に付け、小数のある値が 1 つでもあれば全行 2 桁 ($0.50)。目盛りも $', () => {
    const usd = chartSchema.parse({
      title: '費用',
      unit: 'ドル',
      rows: [
        { label: 'a', value: 0.5 },
        { label: 'b', value: 0.57 },
        { label: 'c', value: 2.93 },
      ],
    })
    const scale = chartScale(usd)
    expect(scale.values).toEqual(['$0.50', '$0.57', '$2.93'])
    expect(scale.tickLabels).toEqual(['$0', '$1', '$2'])
    expect(chartScale(chartSchema.parse({ title: 't', unit: 'USD', rows: [{ label: 'a', value: 20 }] })).values).toEqual(['$20'])
    expect(chartScale(chartSchema.parse({ title: 't', unit: '%', rows: [{ label: 'a', value: 45 }] })).values).toEqual(['45%'])
  })

  it('注記と出典はグラフの下に文章で', () => {
    expect(html).toContain('<p class="guide-chart__note">水色が<wbr/> Opus\u00a05.5\u00a0です。</p>')
    expect(html).toContain('<p class="guide-chart__source">出典: 当社の<wbr/>検証記録</p>')
  })
})
