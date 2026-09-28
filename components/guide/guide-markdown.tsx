/**
 * ガイド (category_tags に guide) の本文の描き方 (react-markdown の部品の対応表と rehype の処理)。
 * 通常の記事の描き方 (components/blog/MarkdownContent の buildComponents) には影響しない。
 *
 * - 本文を h2 ごとの区画 (section) に分け、左の列 (rail) に節の番号を置く。番号は目次 (GuideToc) と同じ
 * - 本文の最後の ```nands-cta は独立した区画にする (見出しは h2、左揃えの相談の導線)
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
import { withPhrases } from './phrases'

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

/** 本文の最後の要素が ```nands-cta なら、その要素 (と後ろの空白) を返す */
function trailingCta(nodes: readonly RootContent[]): number {
  let index = nodes.length - 1
  while (index >= 0 && isBlank(nodes[index])) index -= 1
  const last = nodes[index]
  return last && last.type === 'element' && last.tagName === 'pre' && guideFence(last)?.lang === 'nands-cta' ? index : -1
}

/**
 * rehype: 本文を h2 ごとの区画にまとめる。
 * <section class="guide-band guide-section"><div class="guide-frame guide-grid"><div class="guide-rail">番号</div><div class="guide-main">…</div></div></section>
 * 番号は id のある h2 だけに振る (目次に載るものと同じ)
 */
export function rehypeGuideSections() {
  return (tree: Root) => {
    const groups: Array<{ heading?: Element; nodes: RootContent[] }> = [{ nodes: [] }]
    for (const child of tree.children) {
      if (child.type === 'element' && child.tagName === 'h2') groups.push({ heading: child, nodes: [child] })
      else groups[groups.length - 1].nodes.push(child)
    }

    const last = groups[groups.length - 1]
    const ctaIndex = trailingCta(last.nodes)
    const cta = ctaIndex >= 0 ? (last.nodes[ctaIndex] as Element) : null
    if (cta) last.nodes = last.nodes.slice(0, ctaIndex)

    const seen = new Set<string>()
    let number = 0
    const sections = groups
      .filter((group) => group.nodes.some((node) => !isBlank(node)))
      .map((group) => {
        const id = group.heading ? parseHeadingText(textOf(group.heading)).id : ''
        const numbered = Boolean(id) && !seen.has(id)
        if (numbered) {
          seen.add(id)
          number += 1
        }
        const rail = numbered
          ? [element('span', { className: ['guide-rail__num'], ariaHidden: 'true' }, [{ type: 'text', value: String(number) }])]
          : []
        return element(
          'section',
          { className: ['guide-band', 'guide-section'], ...(numbered ? { ariaLabelledBy: id, dataSection: String(number) } : {}) },
          [
            element('div', { className: ['guide-frame', 'guide-grid'] }, [
              element('div', { className: ['guide-rail'] }, rail),
              element('div', { className: ['guide-main'] }, group.nodes as ElementContent[]),
            ]),
          ]
        )
      })

    if (cta) {
      const placed = element('pre', { ...cta.properties, dataPlacement: 'end' }, cta.children)
      sections.push(
        element('section', { className: ['guide-band', 'guide-section'], dataKind: 'cta' }, [
          element('div', { className: ['guide-frame', 'guide-grid'] }, [
            element('div', { className: ['guide-rail'] }, []),
            element('div', { className: ['guide-main'] }, [placed]),
          ]),
        ])
      )
    }
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

/** 段落・リスト・表のセルに残った {#id} を消す */
function stripFragmentIds(node: ReactNode): ReactNode {
  if (typeof node === 'string') return node.replace(/\s*\{#[^}]+\}\s*/g, ' ').trim()
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
        return <GuideBlock lang={fence.lang} raw={fence.raw} context={{ ...guide, placement }} />
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
    table({ children }) {
      return (
        <div className="guide-table">
          <table>{children}</table>
        </div>
      )
    },
    th({ children, style }) {
      return <th style={style}>{withPhrases(stripFragmentIds(children))}</th>
    },
    td({ children, style }) {
      return <td style={style}>{withPhrases(stripFragmentIds(children))}</td>
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
