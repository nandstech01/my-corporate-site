import type { DecideBlock, DecideNode, DecideResult } from '@/app/posts/_lib/guide-blocks'
import { isExternalUrl } from './format'
import { Phrases } from './phrases'

interface Conclusion {
  readonly path: readonly string[]
  readonly result: DecideResult
}

/** 木のすべての行き先 (選んだ順の道のり + 結論)。結論を文章でも出すために使う */
export function decideConclusions(node: DecideNode, path: readonly string[] = []): Conclusion[] {
  return node.options.flatMap((option) => {
    const next = [...path, option.label]
    if (option.result) return [{ path: next, result: option.result }]
    return option.next ? decideConclusions(option.next, next) : []
  })
}

function ResultText({ result }: { result: DecideResult }) {
  return (
    <>
      <strong className="guide-decide__result-title">
        <Phrases text={result.title} />
      </strong>
      {result.body && (
        <span className="guide-decide__result-body">
          <Phrases text={result.body} />
        </span>
      )}
      {result.href && (
        <a
          className="guide-decide__result-link"
          href={result.href}
          {...(isExternalUrl(result.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          詳しく読む
        </a>
      )}
    </>
  )
}

function Question({ node, depth }: { node: DecideNode; depth: number }) {
  return (
    <div className="guide-decide__node" data-depth={depth}>
      <p className="guide-decide__question">
        <Phrases text={node.question} />
      </p>
      {node.options.map((option, index) => (
        <details className="guide-decide__option" key={index}>
          <summary className="guide-decide__label">
            <Phrases text={option.label} />
          </summary>
          {option.result ? (
            <p className="guide-decide__result">
              <ResultText result={option.result} />
            </p>
          ) : (
            option.next && <Question node={option.next} depth={depth + 1} />
          )}
        </details>
      ))}
    </div>
  )
}

/**
 * 選び方チャート。JS を使わない入れ子の <details> と、すべての結論の一覧 (常に表示) を出す。
 * 結論を折りたたみの中だけに置かない (検索エンジン・AI・読み上げに全文が届くように)。
 */
export default function DecisionHelper({ block }: { block: DecideBlock }) {
  const conclusions = decideConclusions(block.root)
  return (
    <div className="guide-decide" data-guide-block="decide">
      {block.title && (
        <p className="guide-caption guide-decide__title">
          <Phrases text={block.title} />
        </p>
      )}
      <div className="guide-decide__grid">
        <div className="guide-decide__tree">
          <Question node={block.root} depth={1} />
        </div>
        <div className="guide-decide__summary">
          <p className="guide-decide__summary-title">結論の一覧</p>
          <ul className="guide-decide__summary-list">
            {conclusions.map((conclusion, index) => (
              <li className="guide-decide__summary-item" key={index}>
                <span className="guide-decide__path">{conclusion.path.join(' → ')}</span>
                <span className="guide-decide__outcome">
                  <ResultText result={conclusion.result} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
