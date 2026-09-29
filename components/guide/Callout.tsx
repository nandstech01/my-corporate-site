import type { CalloutBlock } from '@/app/posts/_lib/guide-blocks'
import { Phrases } from './phrases'

const TONE_LABEL: Record<CalloutBlock['tone'], string> = {
  note: '補足',
  tip: 'ポイント',
  warning: '注意',
  unverified: '未確認',
}

/**
 * 補足・注意・未確認事項。色の箱にせず、左の罫線の種類と見出しの語で区別する
 * (未確認 = 破線、ポイント = アクセント色、注意 = 太い紺)。見た目は guide.css の .guide-callout[data-tone]
 */
export default function Callout({ block }: { block: CalloutBlock }) {
  return (
    <aside className="guide-callout" data-guide-block="callout" data-tone={block.tone}>
      <p className="guide-callout__title">
        <span className="guide-callout__tone">{TONE_LABEL[block.tone]}</span>
        {block.title && (
          <span className="guide-callout__heading">
            <Phrases text={block.title} />
          </span>
        )}
      </p>
      {block.body.split('\n').map((paragraph, index) =>
        paragraph.trim() ? (
          <p className="guide-callout__body" key={index}>
            <Phrases text={paragraph} />
          </p>
        ) : null
      )}
    </aside>
  )
}
