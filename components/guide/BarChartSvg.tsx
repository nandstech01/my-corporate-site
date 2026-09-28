import type { ChartBlock } from '@/app/posts/_lib/guide-blocks'
import { formatValue, stableId } from './format'
import { textUnits } from './text-wrap'

export const CHART_WIDTH = 640
const LABEL_SIZE = 14
const ROW_HEIGHT = 44
const BAR_HEIGHT = 14
const VALUE_GAP = 8
const VALUE_SIZE = 13

export interface ChartBarGeometry {
  readonly label: string
  readonly value: string
  /** 文字のベースライン */
  readonly labelY: number
  readonly barY: number
  readonly barWidth: number
  readonly valueX: number
  readonly valueY: number
}

export interface ChartGeometry {
  readonly width: number
  readonly height: number
  readonly bars: readonly ChartBarGeometry[]
}

/**
 * 横棒グラフの配置 (純関数)。行ごとに「ラベルの行 → 棒」の 2 段にして、
 * 長い日本語のラベルでも棒の横幅を削らない。棒の長さは最大値に対する比。
 */
export function chartGeometry(block: ChartBlock): ChartGeometry {
  const values = block.rows.map((row) => formatValue(row.value, block.unit))
  const valueSpace = Math.max(...values.map((value) => textUnits(value) * VALUE_SIZE)) + VALUE_GAP + 4
  const barMax = CHART_WIDTH - valueSpace
  const max = Math.max(...block.rows.map((row) => row.value))

  const bars = block.rows.map((row, index): ChartBarGeometry => {
    const top = index * ROW_HEIGHT
    const barWidth = max > 0 ? Math.max(row.value > 0 ? 2 : 0, Math.round((row.value / max) * barMax)) : 0
    return {
      label: row.label,
      value: values[index],
      labelY: top + LABEL_SIZE + 2,
      barY: top + LABEL_SIZE + 8,
      barWidth,
      valueX: barWidth + VALUE_GAP,
      valueY: top + LABEL_SIZE + 8 + BAR_HEIGHT - 2,
    }
  })
  return { width: CHART_WIDTH, height: block.rows.length * ROW_HEIGHT, bars }
}

/**
 * 横棒グラフ: 読み上げ可能なインライン SVG (title + desc) と、同じ数字の表。
 * 見た目は components/guide/guide.css の .guide-chart* で決める (ここは構造だけ)。
 */
export default function BarChartSvg({ block }: { block: ChartBlock }) {
  const geometry = chartGeometry(block)
  const id = stableId('guide-chart', JSON.stringify(block))
  const description = geometry.bars.map((bar) => `${bar.label}: ${bar.value}`).join('、')

  return (
    <figure className="guide-chart" data-guide-block="chart">
      <figcaption className="guide-chart__title">{block.title}</figcaption>
      <svg
        className="guide-chart__svg"
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        width="100%"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        preserveAspectRatio="xMinYMin meet"
      >
        <title id={`${id}-title`}>{block.title}</title>
        <desc id={`${id}-desc`}>{description}</desc>
        {geometry.bars.map((bar, index) => (
          <g className="guide-chart__row" key={index}>
            <text className="guide-chart__label" x={0} y={bar.labelY} fontSize={LABEL_SIZE} fill="currentColor">
              {bar.label}
            </text>
            <rect
              className="guide-chart__bar"
              x={0}
              y={bar.barY}
              width={bar.barWidth}
              height={BAR_HEIGHT}
              fill="currentColor"
            />
            <text className="guide-chart__value" x={bar.valueX} y={bar.valueY} fontSize={VALUE_SIZE} fill="currentColor">
              {bar.value}
            </text>
          </g>
        ))}
      </svg>
      <table className="guide-chart__table">
        <caption className="guide-chart__table-caption">
          {block.title}
          {block.unit ? ` (単位: ${block.unit})` : ''}
        </caption>
        <thead>
          <tr>
            <th scope="col">項目</th>
            <th scope="col">値</th>
            {block.rows.some((row) => row.note) && <th scope="col">補足</th>}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, index) => (
            <tr key={index}>
              <th scope="row">{row.label}</th>
              <td data-value={row.value}>{geometry.bars[index].value}</td>
              {block.rows.some((r) => r.note) && <td>{row.note ?? ''}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {block.source && <p className="guide-chart__source">出典: {block.source}</p>}
    </figure>
  )
}
