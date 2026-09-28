import type { CSSProperties } from 'react'
import type { ChartBlock } from '@/app/posts/_lib/guide-blocks'
import { formatValue } from './format'
import { Phrases } from './phrases'
import { textUnits } from './text-wrap'

/** 値の文字の大きさ (px)。値の文字の置き場所 (棒の右の余白) の見積もりに使う。CSS の .guide-chart__value と同じ */
export const VALUE_FONT = 15
const VALUE_GAP = 8

export interface ChartScale {
  /** 棒の 100% に当たる値 */
  readonly max: number
  /** 目盛りの値 (0 から) */
  readonly ticks: readonly number[]
  /** 表示する値の文字 */
  readonly values: readonly string[]
  /** 棒の右に空けておく幅 (px): いちばん長い値の文字 + 間隔 */
  readonly reserve: number
}

/** 目盛りの間隔 (1・2・5 × 10 のべき乗) */
function niceStep(rough: number): number {
  if (rough <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(rough))
  const fraction = rough / power
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return nice * power
}

/**
 * 横棒グラフの目盛りと棒の基準 (純関数)。棒の長さは max に対する比。
 * 値の文字は棒の右の予約した余白に入るので、どの画面幅でも図からはみ出さない
 */
export function chartScale(block: ChartBlock): ChartScale {
  const values = block.rows.map((row) => formatValue(row.value, block.unit))
  const largest = Math.max(...block.rows.map((row) => row.value))
  const step = niceStep(largest / 4)
  const max = largest > 0 ? largest : 1
  const ticks: number[] = []
  for (let tick = 0; tick <= max + 1e-9; tick += step) ticks.push(Number(tick.toPrecision(12)))
  const reserve = Math.ceil(Math.max(...values.map((value) => textUnits(value) * VALUE_FONT))) + VALUE_GAP + 4
  return { max, ticks, values, reserve }
}

const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties

/**
 * 横棒グラフ。棒も数字も HTML の表 (th = 項目、td = 値) なので、読み上げ・検索・スマホの幅でも文字が小さくならない。
 * 見た目は guide.css の .guide-chart* (紺の地に、主役の行だけアクセント色)
 */
export default function BarChart({ block }: { block: ChartBlock }) {
  const scale = chartScale(block)
  return (
    <figure
      className="guide-chart"
      data-guide-block="chart"
      style={cssVars({ '--max': scale.max, '--reserve': `${scale.reserve}px` })}
    >
      <figcaption className="guide-caption guide-chart__title">
        <Phrases text={block.title} />
        {block.unit && <span className="guide-chart__unit">単位: {block.unit}</span>}
      </figcaption>
      <div className="guide-chart__plot">
        <div className="guide-chart__axis" aria-hidden="true">
          {scale.ticks.map((tick) => (
            <span className="guide-chart__tick" key={tick} style={cssVars({ '--t': tick })}>
              <b>{formatValue(tick)}</b>
            </span>
          ))}
        </div>
        <table className="guide-chart__table">
          <caption className="guide-sr">
            {block.title}
            {block.unit ? ` (単位: ${block.unit})` : ''}
          </caption>
          <colgroup>
            <col className="guide-chart__col-label" />
            <col />
          </colgroup>
          <tbody>
            {block.rows.map((row, index) => (
              <tr
                className="guide-chart__row"
                key={index}
                data-highlight={row.highlight ? '' : undefined}
              >
                <th scope="row" className="guide-chart__label">
                  <span className="guide-chart__name">
                    <Phrases text={row.label} />
                  </span>
                  {row.note && (
                    <span className="guide-chart__sub">
                      <Phrases text={row.note} />
                    </span>
                  )}
                </th>
                <td className="guide-chart__cell" data-value={row.value}>
                  <span className="guide-chart__track">
                    <span className="guide-chart__bar" style={cssVars({ '--v': row.value })} />
                    <span className="guide-chart__value" style={cssVars({ '--v': row.value })}>
                      {scale.values[index]}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(block.note || block.source) && (
        <div className="guide-chart__foot">
          {block.note && (
            <p className="guide-chart__note">
              <Phrases text={block.note} />
            </p>
          )}
          {block.source && (
            <p className="guide-chart__source">
              出典: <Phrases text={block.source} />
            </p>
          )}
        </div>
      )}
    </figure>
  )
}
