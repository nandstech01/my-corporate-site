import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { chartSchema } from '@/app/posts/_lib/guide-blocks'

// vitest の esbuild は tsconfig の jsx: preserve により classic 変換 (React.createElement) になる
vi.stubGlobal('React', React)

import BarChartSvg, { CHART_WIDTH, chartGeometry } from '@/components/guide/BarChartSvg'

const block = chartSchema.parse({
  title: 'プラン別の月額',
  unit: 'ドル',
  source: '公式の料金ページ',
  rows: [
    { label: '無料', value: 0 },
    { label: 'Pro', value: 20, note: '個人向け' },
    { label: 'Max', value: 200 },
    { label: 'Team', value: 1234.5 },
  ],
})

describe('横棒グラフの SVG', () => {
  const html = renderToStaticMarkup(React.createElement(BarChartSvg, { block }))

  it('棒の長さは最大値に比例し、0 は 0、値の文字は図の中に収まる', () => {
    const geometry = chartGeometry(block)
    const widths = geometry.bars.map((bar) => bar.barWidth)
    expect(widths[0]).toBe(0)
    expect(widths[3]).toBe(Math.max(...widths))
    expect(widths[2] / widths[3]).toBeCloseTo(200 / 1234.5, 2)
    for (const bar of geometry.bars) expect(bar.valueX).toBeGreaterThan(bar.barWidth)
    expect(geometry.height).toBe(4 * 44)
    expect(CHART_WIDTH).toBe(geometry.width)
  })

  it('読み上げ: role=img と、title・desc を aria-labelledby で指す', () => {
    const labelledBy = html.match(/<svg[^>]*aria-labelledby="([^"]+)"/)?.[1] ?? ''
    const [titleId, descId] = labelledBy.split(' ')
    expect(html).toMatch(/<svg[^>]*role="img"/)
    expect(html).toContain(`<title id="${titleId}">プラン別の月額</title>`)
    expect(html).toContain(`<desc id="${descId}">無料: 0ドル、Pro: 20ドル、Max: 200ドル、Team: 1,234.5ドル</desc>`)
  })

  it('SVG と同じ数字を表でも出す (見出しセル・単位・補足・出典)', () => {
    expect((html.match(/<rect /g) ?? []).length).toBe(4)
    expect(html).toContain('<caption class="guide-chart__table-caption">プラン別の月額 (単位: ドル)</caption>')
    expect(html).toContain('<th scope="row">Team</th><td data-value="1234.5">1,234.5ドル</td><td></td>')
    expect(html).toContain('<td>個人向け</td>')
    expect(html).toContain('出典: 公式の料金ページ')
  })

  it('同じ id を 2 回使わない (ページに複数のグラフがあっても衝突しない)', () => {
    const other = chartSchema.parse({ ...block, title: '別のグラフ' })
    const ids = [html, renderToStaticMarkup(React.createElement(BarChartSvg, { block: other }))].map((markup) => markup.match(/<title id="([^"]+)"/)?.[1])
    expect(ids[0]).not.toBe(ids[1])
  })
})
