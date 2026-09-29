import type { GuideTocItem } from '@/app/posts/_lib/post-text'
import './guide.css'
import { Phrases } from './phrases'

/**
 * ガイドの目次。常に全部を表示し、素の <a href="#id"> で飛ぶ (JS でスクロールしない・折りたたまない)。
 * Google の「ページ内リンク」(Read more) が見出しに付くための条件に合わせる。
 * h2 の番号は本文の各節の番号 (GuideSections の rail) と同じ。h3 は直前の h2 の下に入れ子で並べる。
 *
 * スマホ (760px 以下) だけは最初の節まで早く届くように、閉じた <details> の「目次 (節の数)」で折りたたむ。
 * 一覧は <details> のすぐ後ろの兄弟 (1 つだけ) で、CSS の details:not([open]) + ol で隠す。
 * 開け閉めはブラウザの <details> (JS なし・キーボードで操作できる)。PC では <details> を出さず、一覧は常に見える
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
    <nav className="guide-band guide-toc" aria-labelledby="guide-toc-title">
      <div className="guide-frame guide-grid">
        <div className="guide-rail">
          <p id="guide-toc-title" className="guide-toc__title">
            目次
          </p>
        </div>
        <div className="guide-main guide-toc__main">
          <details className="guide-toc__fold">
            <summary className="guide-toc__summary">{`目次 (${groups.length})`}</summary>
          </details>
          <ol className="guide-toc__list">
            {groups.map(({ item, children }, index) => (
              <li className="guide-toc__item" data-level={item.level} key={item.id}>
                <a className="guide-toc__link" href={`#${encodeURIComponent(item.id)}`}>
                  <span className="guide-toc__num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="guide-toc__text">
                    <Phrases text={item.text} />
                  </span>
                </a>
                {children.length > 0 && (
                  <ol className="guide-toc__sublist">
                    {children.map((child) => (
                      <li className="guide-toc__item" data-level={3} key={child.id}>
                        <a className="guide-toc__link" href={`#${encodeURIComponent(child.id)}`}>
                          <span className="guide-toc__text">
                            <Phrases text={child.text} />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  )
}
