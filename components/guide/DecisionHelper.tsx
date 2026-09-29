import type { CSSProperties } from 'react'
import type { DecideBlock, DecideNode, DecideResult } from '@/app/posts/_lib/guide-blocks'
import { isExternalUrl } from './format'
import { Phrases } from './phrases'

/** 質問の番号 (上から読む順: Q1, Q2, ...) */
export function numberQuestions(root: DecideNode): Map<DecideNode, number> {
  const numbers = new Map<DecideNode, number>()
  const visit = (node: DecideNode) => {
    numbers.set(node, numbers.size + 1)
    node.options.forEach((option) => option.next && visit(option.next))
  }
  visit(root)
  return numbers
}

function Result({ result }: { result: DecideResult }) {
  return (
    <div className="guide-decide__result">
      <p className="guide-decide__result-title">
        <Phrases text={result.title} />
      </p>
      {result.body && (
        <p className="guide-decide__result-body">
          <Phrases text={result.body} />
        </p>
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
    </div>
  )
}

function Question({ node, depth, numbers }: { node: DecideNode; depth: number; numbers: Map<DecideNode, number> }) {
  return (
    <div className="guide-decide__node">
      <p className="guide-decide__question">
        <span className="guide-decide__q">Q{numbers.get(node)}</span>
        <span className="guide-decide__question-text">
          <Phrases text={node.question} />
        </span>
      </p>
      <ul className="guide-decide__branches" style={{ '--d': depth } as CSSProperties}>
        {node.options.map((option, index) => (
          <li className="guide-decide__branch" data-kind={option.result ? 'result' : 'next'} key={index}>
            <span className="guide-decide__answer">
              <span className="guide-decide__label">
                <Phrases text={option.label} />
              </span>
              {option.result && <span className="guide-decide__arrow" aria-hidden="true" />}
            </span>
            {option.result ? (
              <Result result={option.result} />
            ) : (
              option.next && <Question node={option.next} depth={depth + 1} numbers={numbers} />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * 選び方チャート。質問 → 答え → 結論を、図の線 (点線・矢じり) でつないだ木として常に全部見せる
 * (折りたたみに結論を隠さない: 検索エンジン・AI・読み上げに全文が届く。JS は使わない)。
 * PC では結論の箱を同じ位置に揃えて読める幅を取り、スマホでは答えの下に結論を置く。見た目は guide.css の .guide-decide*
 */
export default function DecisionHelper({ block }: { block: DecideBlock }) {
  return (
    <figure className="guide-decide" data-guide-block="decide">
      {block.title && (
        <figcaption className="guide-caption guide-decide__title">
          <Phrases text={block.title} />
        </figcaption>
      )}
      <div className="guide-decide__tree">
        <Question node={block.root} depth={1} numbers={numberQuestions(block.root)} />
      </div>
    </figure>
  )
}
