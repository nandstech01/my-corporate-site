import './guide.css'
import { parseGuideBlock } from '@/app/posts/_lib/guide-blocks'
import { warnServer } from '@/app/posts/_lib/server-log'
import BarChart from './BarChart'
import Callout from './Callout'
import ConsultCta from './ConsultCta'
import DecisionHelper from './DecisionHelper'
import FlowDiagram from './FlowDiagram'
import SourceList from './SourceList'
import StatCards from './StatCards'
import UpdateLog from './UpdateLog'

export interface GuideRenderContext {
  /** 記事の slug (相談フォームの source: guide:<slug> に使う) */
  readonly slug: string
  /** 相談の導線の置き場所 (本文の最後の独立した区画か、本文の途中か)。guide-markdown が決める */
  readonly placement?: 'end' | 'inline'
}

interface GuideBlockProps {
  /** フェンスの言語名 (nands-*) */
  readonly lang: string
  /** フェンスの中身 (1 行の JSON) */
  readonly raw: string
  readonly context?: GuideRenderContext
}

/**
 * 本文中の ```nands-* ブロックを検査して描く (サーバー部品)。
 * 検査に通らないブロックは何も描かず、サーバーのログに警告を残す (JSON の文字をそのまま出さない)。
 * nands-hero はページの冒頭 (GuideHero) でだけ描くので、本文中では描かない。
 */
export default function GuideBlock({ lang, raw, context }: GuideBlockProps) {
  const parsed = parseGuideBlock(lang, raw)
  if (!parsed.ok) {
    warnServer('[guide-block] 検査に通らないブロックを描画しませんでした', {
      lang,
      slug: context?.slug ?? null,
      error: parsed.error,
    })
    return null
  }

  const { block } = parsed
  switch (block.type) {
    case 'nands-stats':
      return <StatCards block={block.data} />
    case 'nands-chart':
      return <BarChart block={block.data} />
    case 'nands-callout':
      return <Callout block={block.data} />
    case 'nands-decide':
      return <DecisionHelper block={block.data} />
    case 'nands-diagram':
      return <FlowDiagram block={block.data} />
    case 'nands-changelog':
      return <UpdateLog block={block.data} />
    case 'nands-sources':
      return <SourceList block={block.data} />
    case 'nands-cta':
      return <ConsultCta block={block.data} slug={context?.slug} placement={context?.placement} />
    case 'nands-hero':
      warnServer('[guide-block] nands-hero は本文の先頭の 1 つだけをページの冒頭に描きます。本文中のものは描画しません', {
        slug: context?.slug ?? null,
      })
      return null
  }
}
