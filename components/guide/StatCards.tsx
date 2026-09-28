import type { StatsBlock } from '@/app/posts/_lib/guide-blocks'
import { formatNumber } from './format'
import { Phrases } from './phrases'

/**
 * 要点の数字 (dl)。仕様書の表の 1 行のように罫線で区切って並べる (カードにしない)。
 * 数字は大きく、単位は小さく。見た目は guide.css の .guide-stats*
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
              {typeof item.value === 'number' ? formatNumber(item.value) : <Phrases text={item.value} />}
              {item.unit && (
                <span className="guide-stats__unit" data-latin={/^[A-Za-z]/.test(item.unit) ? '' : undefined}>
                  {item.unit}
                </span>
              )}
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
