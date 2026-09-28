import type { CtaBlock } from '@/app/posts/_lib/guide-blocks'
import { isExternalUrl } from './format'
import { CONTACT_ERROR_MESSAGE, CONTACT_SENT_MESSAGE } from './contact-messages'
import GuideContactForm from './GuideContactForm'
import { Phrases } from './phrases'

/** ガイドの相談フォームの送信元 (inquiries.source)。例: guide:claude-code-guide */
export function guideContactSource(slug: string): string {
  return `guide:${slug}`
}

interface ConsultCtaProps {
  readonly block: CtaBlock
  /** 記事の slug。無いとき (記事以外での描画) はフォームを出さない */
  readonly slug?: string
  /**
   * inline = 区画の中 (見出しはその区画の h2 なので、導線の題は見出しにしない) /
   * end = どの h2 の下にも無い導線 (独立した区画・題を h2 にする)
   */
  readonly placement?: 'end' | 'inline'
  /** end の見出しの id (例: guide-consult)。ページ内で重複しないときだけ渡される */
  readonly anchor?: string
}

const linkProps = (href: string) => (isExternalUrl(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})

/**
 * 相談の導線 (本文中 1 回・最後 1 回を想定)。左揃え、操作は主 1 つ (button かフォームの送信) と副 1 つ (secondary)。
 * 見た目は guide.css の .guide-cta*
 */
export default function ConsultCta({ block, slug, placement = 'inline', anchor }: ConsultCtaProps) {
  const showForm = block.form === true && Boolean(slug)
  const Title = placement === 'end' ? 'h2' : 'p'
  const secondary = block.secondary ? { label: block.secondary.label, href: block.secondary.href } : undefined
  return (
    <section
      className="guide-cta"
      data-guide-block="cta"
      data-placement={placement}
      data-form={showForm ? '' : undefined}
      aria-label={block.title}
    >
      <Title className="guide-cta__title" {...(placement === 'end' && anchor ? { id: anchor } : {})}>
        <Phrases text={block.title} />
      </Title>
      {block.body && (
        <p className="guide-cta__body">
          <Phrases text={block.body} />
        </p>
      )}
      {showForm && slug ? (
        <GuideContactForm
          source={guideContactSource(slug)}
          secondary={secondary}
          messages={{ sent: <Phrases text={CONTACT_SENT_MESSAGE} />, error: <Phrases text={CONTACT_ERROR_MESSAGE} /> }}
        />
      ) : (
        <div className="guide-actions">
          {block.button && (
            <a className="guide-button" data-kind="primary" href={block.button.href} {...linkProps(block.button.href)}>
              {block.button.label}
            </a>
          )}
          {secondary && (
            <a className="guide-button" data-kind="secondary" href={secondary.href} {...linkProps(secondary.href)}>
              {secondary.label}
            </a>
          )}
        </div>
      )}
    </section>
  )
}
