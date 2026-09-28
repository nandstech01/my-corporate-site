import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { chartSchema } from '@/app/posts/_lib/guide-blocks'

// vitest の esbuild は tsconfig の jsx: preserve により classic 変換 (React.createElement) になる
vi.stubGlobal('React', React)

import BarChart, { VALUE_FONT, chartScale } from '@/components/guide/BarChart'
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

  it('値の文字は棒の右の予約した余白に入る (いちばん長い値の幅 + 間隔)', () => {
    const scale = chartScale(block)
    expect(scale.values).toEqual(['31秒', '62秒', '0秒', '1,234.5秒'])
    expect(scale.reserve).toBeGreaterThanOrEqual(textUnits('1,234.5秒') * VALUE_FONT + 8)
    expect(html).toContain('--reserve:')
  })

  it('項目は th (行見出し)、値は td。棒の長さは CSS の --v / --max。SVG の文字は使わない', () => {
    expect(html).not.toContain('<svg')
    // 製品名は改行しない空白 (U+00A0) でつなぐ
    expect(html).toContain('<th scope="row" class="guide-chart__label"><span class="guide-chart__name">Opus\u00a05.5</span><span class="guide-chart__sub">high</span></th>')
    expect(html).toContain('<td class="guide-chart__cell" data-value="1234.5">')
    expect(html).toContain('<span class="guide-chart__value" style="--v:1234.5">1,234.5秒</span>')
    expect(html).toContain('<caption class="guide-sr">1 回あたりの時間の中央値 (単位: 秒)</caption>')
  })

  it('主役の行 (highlight) だけ印を付ける (CSS でアクセント色)', () => {
    expect((html.match(/data-highlight=""/g) ?? []).length).toBe(1)
  })

  it('注記と出典はグラフの下に文章で', () => {
    expect(html).toContain('<p class="guide-chart__note">水色が<wbr/> Opus\u00a05.5\u00a0です。</p>')
    expect(html).toContain('<p class="guide-chart__source">出典: 当社の<wbr/>検証記録</p>')
  })
})
