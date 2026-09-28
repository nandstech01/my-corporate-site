import type { SourcesBlock } from '@/app/posts/_lib/guide-blocks'
import { isExternalUrl } from './format'

/** 出典の一覧。見た目は guide.css の .guide-sources* */
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
            {item.title}
          </a>
          {item.publisher && <span className="guide-sources__publisher">{item.publisher}</span>}
          {item.accessed && (
            <span className="guide-sources__accessed">
              (<time dateTime={item.accessed}>{item.accessed}</time> 確認)
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
