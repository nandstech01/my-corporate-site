/**
 * ガイド (category_tags に guide) の本文の描き方 (react-markdown の部品の対応表と rehype の処理)。
 * 通常の記事の描き方 (components/blog/MarkdownContent の buildComponents) には影響しない。
 *
 * - 本文を h2 ごとの区画 (section) に分け、左の列 (rail) に節の番号と短い名前 (h2 から作る) を置く。番号は目次 (GuideToc) と同じ。
 *   独立した相談の区画は番号なしで「相談」
 * - ```nands-cta は置かれた区画の中に描く (その区画の h2 が見出し。導線は見出しを増やさない)。
 *   独立した区画 (導線の題を h2、id guide-consult) にするのは、どの節にも属さない相談だけ:
 *   最初の h2 より前にある相談と、本文の最後の相談のうち、その節が「h2 + 段落 + 相談」(相談を紹介する節) ではないもの
 *   (例: 更新履歴の表の後ろに置いた、ページを締める相談)
 * - 4 列以上の表は、スマホでは行ごとの組 (列名: 値) に組み替える (td の data-label)
 * - 見出し・段落・表・リストの日本語は文節の区切りに <wbr> (components/guide/phrases)
 * - 要素は意味のある HTML とクラス名 (.guide-*) だけ。Tailwind のクラスや装飾を付けない
 */
import React, { type ReactNode } from 'react'
import type { Components } from 'react-markdown'
import type { Element, ElementContent, Root, RootContent } from 'hast'
import MarkdownImage from '@/components/blog/MarkdownImage'
import { isGuideFenceLang } from '@/app/posts/_lib/guide-blocks'
import { parseHeadingText } from '@/app/posts/_lib/post-text'
import GuideBlock, { type GuideRenderContext } from './GuideBlock'
import { bindSpaces, phrases, withPhrases } from './phrases'
import { railLabel } from './rail-label'

export function textOf(node: Element | ElementContent | RootContent): string {
  if (node.type === 'text') return node.value
  if (node.type === 'element') return node.children.map(textOf).join('')
  return ''
}

/** <pre> の中の ```nands-* のコード要素 (無ければ null) */
export function guideFence(node: Element | undefined): { lang: string; raw: string } | null {
  const code = node?.children.find((child): child is Element => child.type === 'element' && child.tagName === 'code')
  const className = code?.properties?.className
  const classes = Array.isArray(className) ? className.map(String) : []
  const lang = classes.find((name) => name.startsWith('language-'))?.slice('language-'.length)
  return code && lang && isGuideFenceLang(lang) ? { lang, raw: textOf(code) } : null
}

const element = (tagName: string, properties: Element['properties'], children: ElementContent[]): Element => ({
  type: 'element',
  tagName,
  properties,
  children,
})

const isBlank = (node: RootContent) => node.type === 'text' && node.value.trim() === ''

/** 要素の並びの最後 (後ろの空白を除く) が ```nands-cta なら、その位置。無ければ -1 */
function trailingCta(nodes: readonly RootContent[]): number {
  let index = nodes.length - 1
  while (index >= 0 && isBlank(nodes[index])) index -= 1
  const last = nodes[index]
  return last && last.type === 'element' && last.tagName === 'pre' && guideFence(last)?.lang === 'nands-cta' ? index : -1
}

/** 独立した相談の区画の見出しの id (ページ内のリンク #guide-consult の行き先)。本文の見出しが同じ id を使っていれば付けない */
export const CONSULT_ANCHOR = 'guide-consult'

/** 木の中のすべての要素 (深さ優先) */
function* elementsOf(node: Root | Element): Generator<Element> {
  for (const child of node.children) {
    if (child.type !== 'element') continue
    yield child
    yield* elementsOf(child)
  }
}

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

/** 表の見出しの文字を、本文の各セルに data-label として持たせる (スマホで「列名: 値」に組み替えるため) */
function labelTableCells(table: Element): void {
  const children = (tag: string, parent: Element) =>
    parent.children.filter((child): child is Element => child.type === 'element' && child.tagName === tag)
  const [head] = children('thead', table)
  const headRow = head ? children('tr', head)[0] : undefined
  const labels = headRow ? children('th', headRow).map((cell) => textOf(cell).replace(/\s*\{#[^}]+\}\s*/g, ' ').trim()) : []
  table.properties = { ...table.properties, dataCols: String(labels.length) }
  for (const body of children('tbody', table)) {
    for (const row of children('tr', body)) {
      children('td', row).forEach((cell, index) => {
        if (labels[index]) cell.properties = { ...cell.properties, dataLabel: labels[index] }
      })
    }
  }
}

/** 文字列を文節の区切りに <wbr> を入れた hast の子にする (phraseNodes の hast 版) */
function phraseChildren(text: string): ElementContent[] {
  return phrases(bindSpaces(text)).flatMap((part, index): ElementContent[] =>
    index === 0 ? [{ type: 'text', value: part }] : [element('wbr', {}, []), { type: 'text', value: part }]
  )
}

/** 独立した相談の区画の左の列の名前 (目次に載らないので番号は付けない) */
export const CONSULT_RAIL_LABEL = '相談'

/** 左の列 (番号と短い名前)。number が null なら名前だけ (独立した相談の区画) */
function rail(number: number | null, label: string): Element {
  return element('div', { className: ['guide-rail'], ariaHidden: 'true' }, [
    ...(number === null ? [] : [element('span', { className: ['guide-rail__num'] }, [{ type: 'text', value: String(number) }])]),
    ...(label ? [element('span', { className: ['guide-rail__label'] }, phraseChildren(label))] : []),
  ])
}

function band(side: Element, nodes: ElementContent[], properties: Element['properties']): Element {
  return element('section', { className: ['guide-band', 'guide-section'], ...properties }, [
    element('div', { className: ['guide-frame', 'guide-grid'] }, [side, element('div', { className: ['guide-main'] }, nodes)]),
  ])
}

type Group = { heading?: Element; nodes: RootContent[] }

/**
 * 区画の最後の相談を、独立した区画に出すか。
 * 見出しの無い区画 (最初の h2 より前) の相談は出す。本文の最後の区画の相談は、その区画が h2 と段落と相談だけ
 * (「〜を相談するには？」のように相談を紹介する節) なら区画の中に残し、ほかの中身 (更新履歴・出典の一覧など) があれば出す
 */
function liftsTrailingCta(group: Group, isLast: boolean, ctaIndex: number): boolean {
  if (ctaIndex < 0) return false
  if (!group.heading) return true
  if (!isLast) return false
  const others = group.nodes.slice(0, ctaIndex).filter((node) => !isBlank(node) && node !== group.heading)
  return !others.every((node) => node.type === 'element' && node.tagName === 'p')
}

/**
 * rehype: 本文を h2 ごとの区画にまとめる。
 * <section class="guide-band guide-section"><div class="guide-frame guide-grid"><div class="guide-rail">番号 名前</div><div class="guide-main">…</div></div></section>
 * 番号と名前は id のある h2 だけに付ける (目次に載るものと同じ)。
 * 相談の導線 (```nands-cta) は置かれた区画の中に描く。どの節にも属さない相談だけ独立した区画にする (liftsTrailingCta)
 */
export function rehypeGuideSections() {
  return (tree: Root) => {
    const headingIds = new Set<string>()
    for (const node of elementsOf(tree)) {
      if (HEADING_TAGS.has(node.tagName)) headingIds.add(parseHeadingText(textOf(node)).id)
      if (node.tagName === 'table') labelTableCells(node)
    }

    const groups: Group[] = [{ nodes: [] }]
    for (const child of tree.children) {
      if (child.type === 'element' && child.tagName === 'h2') groups.push({ heading: child, nodes: [child] })
      else groups[groups.length - 1].nodes.push(child)
    }

    const seen = new Set<string>()
    let number = 0
    const sections = groups.flatMap((group, groupIndex) => {
      const ctaIndex = trailingCta(group.nodes)
      const cta = liftsTrailingCta(group, groupIndex === groups.length - 1, ctaIndex) ? (group.nodes[ctaIndex] as Element) : null
      const nodes = cta ? group.nodes.slice(0, ctaIndex) : group.nodes

      const out: Element[] = []
      if (nodes.some((node) => !isBlank(node))) {
        const heading = group.heading ? parseHeadingText(textOf(group.heading)) : null
        const numbered = Boolean(heading?.id) && !seen.has(heading?.id ?? '')
        if (numbered && heading) {
          seen.add(heading.id)
          number += 1
        }
        out.push(
          band(
            numbered && heading ? rail(number, railLabel(heading.text)) : element('div', { className: ['guide-rail'] }, []),
            nodes as ElementContent[],
            numbered && heading ? { ariaLabelledBy: heading.id, dataSection: String(number) } : {}
          )
        )
      }
      if (cta) {
        const anchor = headingIds.has(CONSULT_ANCHOR) ? {} : { dataAnchor: CONSULT_ANCHOR }
        const placed = element('pre', { ...cta.properties, dataPlacement: 'end', ...anchor }, cta.children)
        out.push(band(rail(null, CONSULT_RAIL_LABEL), [placed], { dataKind: 'cta' }))
      }
      return out
    })
    tree.children = sections
  }
}

/** 見出しの末尾の {#id} を消す (太字・コードなどのインラインの装飾はそのまま残す) */
function stripTrailingFragment(children: ReactNode): ReactNode {
  const list = React.Children.toArray(children)
  const last = list[list.length - 1]
  if (typeof last !== 'string') return list
  return [...list.slice(0, -1), last.replace(/\s*\{#[^}]+\}\s*$/, '')]
}

/**
 * 段落・リスト・表のセルに残った {#id} を消す。消した所だけ詰め、ほかの空白は残す
 * (リンクやコードの前後の空白 "出典: [リンク]" を消さない)
 */
function stripFragmentIds(node: ReactNode): ReactNode {
  if (typeof node === 'string') return node.replace(/\s*\{#[^}]+\}/g, '')
  if (Array.isArray(node)) return node.map(stripFragmentIds)
  return node
}

/** Storage のパス (http で始まらない) は Supabase Storage の公開 URL にする */
function resolveImageSrc(src: string): string {
  if (src.startsWith('http') || src.startsWith('/')) return src
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/${src}` : src
}

function imageSize(title: string | undefined): { width: number; height: number } | undefined {
  const match = title?.match(/^\s*(\d{2,4})x(\d{2,4})\s*$/)
  return match ? { width: Number(match[1]), height: Number(match[2]) } : undefined
}

const isExternal = (href: string | undefined) => Boolean(href && /^https?:\/\//.test(href) && !href.startsWith('https://nands.tech'))

/**
 * ガイドの本文の部品。h2・h3 の関数は MarkdownContent の collectHeadings が目次を作るのに使うので、
 * 対応表の中の同じ関数を返す (見出しの id は parseHeadingText = 通常の記事と同じ規則)
 */
export function buildGuideComponents(guide: GuideRenderContext): Components {
  return {
    pre({ node, children }) {
      const fence = guideFence(node)
      if (fence) {
        const placement = node?.properties?.dataPlacement === 'end' ? 'end' : 'inline'
        const anchor = typeof node?.properties?.dataAnchor === 'string' ? node.properties.dataAnchor : undefined
        return <GuideBlock lang={fence.lang} raw={fence.raw} context={{ ...guide, placement, anchor }} />
      }
      return <pre className="guide-code">{children}</pre>
    },
    code({ className, children }) {
      return <code className={className}>{children}</code>
    },
    h1() {
      return null
    },
    h2({ node, children }) {
      const { id } = parseHeadingText(node ? textOf(node) : '')
      return (
        <h2 id={id || undefined} className="guide-h2">
          {withPhrases(stripTrailingFragment(children))}
        </h2>
      )
    },
    h3({ node, children }) {
      const { id } = parseHeadingText(node ? textOf(node) : '')
      return (
        <h3 id={id || undefined} className="guide-h3">
          {withPhrases(stripTrailingFragment(children))}
        </h3>
      )
    },
    h4({ node, children }) {
      const heading = parseHeadingText(node ? textOf(node) : '')
      const { faqIndex } = (node?.data ?? {}) as { faqIndex?: number }
      const id = faqIndex !== undefined ? `faq-${faqIndex}` : heading.id
      return (
        <h4 id={id || undefined} className="guide-h4">
          {withPhrases(stripTrailingFragment(children))}
        </h4>
      )
    },
    p({ children }) {
      return <p>{withPhrases(stripFragmentIds(children))}</p>
    },
    li({ children }) {
      return <li>{withPhrases(stripFragmentIds(children))}</li>
    },
    table({ node, children }) {
      const cols = Number(node?.properties?.dataCols ?? 0)
      return (
        <div className="guide-table" data-cols={cols || undefined} data-reflow={cols >= 4 ? '' : undefined}>
          <table>{children}</table>
        </div>
      )
    },
    th({ children, style }) {
      return <th style={style}>{withPhrases(stripFragmentIds(children))}</th>
    },
    td({ node, children, style }) {
      const label = node?.properties?.dataLabel
      return (
        <td style={style} data-label={typeof label === 'string' ? label : undefined}>
          {withPhrases(stripFragmentIds(children))}
        </td>
      )
    },
    strong({ children }) {
      return <strong>{withPhrases(children)}</strong>
    },
    em({ children }) {
      return <em>{withPhrases(children)}</em>
    },
    a({ href, children }) {
      return (
        <a href={href} {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {withPhrases(children)}
        </a>
      )
    },
    img({ src, alt, title }) {
      if (!src) return null
      const size = imageSize(title)
      return (
        <span className="guide-image">
          <MarkdownImage src={resolveImageSrc(src)} alt={alt || ''} width={size?.width} height={size?.height} />
          {alt && <span className="guide-image__caption">{withPhrases(alt)}</span>}
        </span>
      )
    },
  }
}
