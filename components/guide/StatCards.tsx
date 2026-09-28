import type { StatsBlock } from '@/app/posts/_lib/guide-blocks'
import { amountParts } from './format'
import { Phrases } from './phrases'

type StatItem = StatsBlock['items'][number]

/** 数字 (大きく) と単位 (小さく)。数値はグラフ・本文の表と同じ書き方 ($0.15 / 30 秒 / 45%) */
/** 文字列で書かれた「数字 + 単位」(0.49 倍 / 150 秒)。数字と単位に分けて、単位を小さく描く */
const NUMBER_WITH_UNIT = /^([+-]?\d[\d,]*(?:\.\d+)?)[ \u00a0]([^\s\d][^\s]{0,5})$/

function StatValue({ item }: { item: StatItem }) {
  if (typeof item.value === 'string') {
    const match = item.unit ? null : item.value.match(NUMBER_WITH_UNIT)
    if (match) {
      return (
        <>
          {match[1]}
          <span className="guide-stats__unit" data-spaced="">
            {match[2]}
          </span>
        </>
      )
    }
    return (
      <>
        <Phrases text={item.value} />
        {item.unit && (
          <span className="guide-stats__unit" data-spaced="">
            {item.unit}
          </span>
        )}
      </>
    )
  }
  const parts = amountParts(item.value, item.unit)
  return (
    <>
      {parts.prefix}
      {parts.number}
      {parts.unit && (
        <span className="guide-stats__unit" data-spaced={parts.spaced ? '' : undefined}>
          {parts.unit}
        </span>
      )}
    </>
  )
}

/**
 * 要点の数字 (dl)。仕様書の表の 1 行のように罫線で区切って並べる (カードにしない)。
 * 数字は大きく、単位は小さく。ラベルの行数が違っても、同じ段の数字は同じ高さに揃える (CSS の subgrid)。
 * 見た目は guide.css の .guide-stats*
 */
export default function StatCards({ block }: { block: StatsBlock }) {
  return (
    <figure className="guide-stats" data-guide-block="stats">
      {block.caption && (
        <figcaption className="guide-caption">
          <Phrases text={block.caption} />
        </figcaption>
      )}
      <dl className="guide-stats__list">
        {block.items.map((item, index) => (
          <div className="guide-stats__item" key={index}>
            <dt className="guide-stats__label">
              <Phrases text={item.label} />
            </dt>
            <dd className="guide-stats__value">
              <StatValue item={item} />
            </dd>
            {item.note && (
              <dd className="guide-stats__note">
                <Phrases text={item.note} />
              </dd>
            )}
          </div>
        ))}
      </dl>
    </figure>
  )
}
