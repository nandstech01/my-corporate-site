import type { ChangelogBlock } from '@/app/posts/_lib/guide-blocks'
import { isExternalUrl } from './format'

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return `${year}年${month}月${day}日`
}

/** 更新履歴 (新しい順)。日付・何が変わったか・根拠。見た目は guide.css の .guide-changelog* */
export default function UpdateLog({ block }: { block: ChangelogBlock }) {
  const entries = [...block.entries].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <ol className="guide-changelog" data-guide-block="changelog">
      {entries.map((entry, index) => (
        <li className="guide-changelog__entry" key={index}>
          <time className="guide-changelog__date" dateTime={entry.date}>
            {formatDate(entry.date)}
          </time>
          <span className="guide-changelog__change">{entry.change}</span>
          {(entry.basis || entry.url) && (
            <span className="guide-changelog__basis">
              根拠:{' '}
              {entry.url ? (
                <a
                  href={entry.url}
                  {...(isExternalUrl(entry.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {entry.basis ?? '出典'}
                </a>
              ) : (
                entry.basis
              )}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
