import type { GuideTocItem } from '@/app/posts/_lib/post-text'
import './guide.css'

/**
 * ガイドの目次。常に全部を表示し、素の <a href="#id"> で飛ぶ (JS でスクロールしない・折りたたまない)。
 * Google の「ページ内リンク」(Read more) が見出しに付くための条件に合わせる。
 * h3 は直前の h2 の下に入れ子で並べる。
 */
export default function GuideToc({ items }: { items: readonly GuideTocItem[] }) {
  if (items.length === 0) return null

  const groups = items.reduce<Array<{ item: GuideTocItem; children: GuideTocItem[] }>>((acc, item) => {
    if (item.level === 3 && acc.length > 0) {
      const last = acc[acc.length - 1]
      return [...acc.slice(0, -1), { ...last, children: [...last.children, item] }]
    }
    return [...acc, { item, children: [] }]
  }, [])

  return (
    <nav className="guide-toc" aria-labelledby="guide-toc-title">
      <p id="guide-toc-title" className="guide-toc__title">
        目次
      </p>
      <ol className="guide-toc__list">
        {groups.map(({ item, children }) => (
          <li className="guide-toc__item" data-level={item.level} key={item.id}>
            <a className="guide-toc__link" href={`#${encodeURIComponent(item.id)}`}>
              {item.text}
            </a>
            {children.length > 0 && (
              <ol className="guide-toc__sublist">
                {children.map((child) => (
                  <li className="guide-toc__item" data-level={3} key={child.id}>
                    <a className="guide-toc__link" href={`#${encodeURIComponent(child.id)}`}>
                      {child.text}
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
