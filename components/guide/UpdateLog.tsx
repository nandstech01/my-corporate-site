import type { ChangelogBlock } from '@/app/posts/_lib/guide-blocks'
import { isExternalUrl } from './format'
import { Phrases } from './phrases'

/** 更新履歴 (新しい順)。仕様書の改訂履歴のように「日付・何が変わったか・根拠」の 3 列。見た目は guide.css の .guide-changelog* */
export default function UpdateLog({ block }: { block: ChangelogBlock }) {
  const entries = [...block.entries].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <ol className="guide-changelog" data-guide-block="changelog">
      {entries.map((entry, index) => (
        <li className="guide-changelog__entry" key={index}>
          <time className="guide-changelog__date" dateTime={entry.date}>
            {entry.date}
          </time>
          <span className="guide-changelog__change">
            <Phrases text={entry.change} />
          </span>
          {(entry.basis || entry.url) && (
            <span className="guide-changelog__basis">
              根拠:{' '}
              {entry.url ? (
                <a
                  href={entry.url}
                  {...(isExternalUrl(entry.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <Phrases text={entry.basis ?? '出典'} />
                </a>
              ) : (
                <Phrases text={entry.basis ?? ''} />
              )}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
