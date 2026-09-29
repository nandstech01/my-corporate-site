import type { SourcesBlock } from '@/app/posts/_lib/guide-blocks'
import { isExternalUrl } from './format'
import { Phrases } from './phrases'

/** 出典の一覧 (番号付き)。発行元と確認日は小さく。見た目は guide.css の .guide-sources* */
export default function SourceList({ block }: { block: SourcesBlock }) {
  return (
    <ol className="guide-sources" data-guide-block="sources">
      {block.items.map((item, index) => (
        <li className="guide-sources__item" key={index}>
          <a
            className="guide-sources__link"
            href={item.url}
            {...(isExternalUrl(item.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <Phrases text={item.title} />
          </a>
          {(item.publisher || item.accessed) && (
            <span className="guide-sources__meta">
              {item.publisher && (
                <span className="guide-sources__publisher">
                  <Phrases text={item.publisher} />
                </span>
              )}
              {item.accessed && (
                <span className="guide-sources__accessed">
                  <time dateTime={item.accessed}>{item.accessed}</time> に確認
                </span>
              )}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
