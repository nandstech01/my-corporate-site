import type { CalloutBlock } from '@/app/posts/_lib/guide-blocks'

const TONE_LABEL: Record<CalloutBlock['tone'], string> = {
  note: '補足',
  tip: 'ポイント',
  warning: '注意',
  unverified: '未確認',
}

/** 補足・注意・未確認事項。見た目は guide.css の .guide-callout[data-tone] */
export default function Callout({ block }: { block: CalloutBlock }) {
  return (
    <aside className="guide-callout" data-guide-block="callout" data-tone={block.tone}>
      <p className="guide-callout__title">
        <span className="guide-callout__tone">{TONE_LABEL[block.tone]}</span>
        {block.title && <span className="guide-callout__heading">{block.title}</span>}
      </p>
      {block.body.split('\n').map((paragraph, index) =>
        paragraph.trim() ? (
          <p className="guide-callout__body" key={index}>
            {paragraph}
          </p>
        ) : null
      )}
    </aside>
  )
}
