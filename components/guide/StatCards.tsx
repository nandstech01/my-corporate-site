import type { StatsBlock } from '@/app/posts/_lib/guide-blocks'
import { formatValue } from './format'

/** 要点の数字 (dl)。見た目は guide.css の .guide-stats* */
export default function StatCards({ block }: { block: StatsBlock }) {
  return (
    <figure className="guide-stats" data-guide-block="stats">
      {block.caption && <figcaption className="guide-stats__caption">{block.caption}</figcaption>}
      <dl className="guide-stats__list">
        {block.items.map((item, index) => (
          <div className="guide-stats__item" key={index}>
            <dt className="guide-stats__label">{item.label}</dt>
            <dd className="guide-stats__value">{formatValue(item.value, item.unit)}</dd>
            {item.note && <dd className="guide-stats__note">{item.note}</dd>}
          </div>
        ))}
      </dl>
    </figure>
  )
}
