import type { CtaBlock } from '@/app/posts/_lib/guide-blocks'
import { isExternalUrl } from './format'
import GuideContactForm from './GuideContactForm'

/** ガイドの相談フォームの送信元 (inquiries.source)。例: guide:claude-code-guide */
export function guideContactSource(slug: string): string {
  return `guide:${slug}`
}

interface ConsultCtaProps {
  readonly block: CtaBlock
  /** 記事の slug。無いとき (記事以外での描画) はフォームを出さない */
  readonly slug?: string
}

/** 相談の導線 (本文中 1 回・最後 1 回を想定)。見た目は guide.css の .guide-cta* */
export default function ConsultCta({ block, slug }: ConsultCtaProps) {
  const showForm = block.form === true && Boolean(slug)
  return (
    <section className="guide-cta" data-guide-block="cta" aria-label={block.title}>
      <p className="guide-cta__title">{block.title}</p>
      {block.body && <p className="guide-cta__body">{block.body}</p>}
      {block.button && (
        <a
          className="guide-cta__button"
          href={block.button.href}
          {...(isExternalUrl(block.button.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {block.button.label}
        </a>
      )}
      {showForm && slug && <GuideContactForm source={guideContactSource(slug)} />}
    </section>
  )
}
