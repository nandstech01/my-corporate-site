import { readFileSync } from 'fs'
import path from 'path'
import React, { isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PublishedPost } from '@/app/posts/_lib/public-client'

const FIXTURE = readFileSync(path.join(__dirname, '../site/fixtures/guide-sample.md'), 'utf8')

const getPublishedPostBySlug = vi.fn<(slug: string) => Promise<PublishedPost | null>>()

/** 動画の取得 (company_youtube_shorts) は空で返す。どのメソッドをつないでも最後に await できる */
function emptyQuery(): unknown {
  const target = {
    then: (resolve: (value: { data: unknown[]; error: null }) => void) => resolve({ data: [], error: null }),
  }
  return new Proxy(target, {
    get: (object, key) => (key === 'then' ? object.then : () => emptyQuery()),
  })
}

// react の cache は Next 同梱の React (canary) にだけある。テストでは素通しにする
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, default: actual, cache: <T,>(fn: T) => fn }
})

vi.mock('@/app/posts/_lib/public-client', () => ({
  getPublishedPostBySlug: (slug: string) => getPublishedPostBySlug(slug),
  getPublicSupabase: () => ({ from: () => emptyQuery() }),
}))

// vitest の esbuild は tsconfig の jsx: preserve により classic 変換 (React.createElement) になる
vi.stubGlobal('React', React)

import PostPage, { generateMetadata, generateStaticParams, revalidate } from '@/app/posts/[slug]/page'
import GuideHero from '@/components/guide/GuideHero'
import GuideToc from '@/components/guide/GuideToc'
import MarkdownContent, { MarkdownFrame } from '@/components/blog/MarkdownContent'
import TOCComponent from '@/components/blog/TOCComponent'

function post(overrides: Partial<PublishedPost>): PublishedPost {
  return {
    id: 1,
    slug: 'claude-code-guide',
    title: 'Claude Code 完全ガイド',
    content: '## はじめに {#intro}\n\n本文',
    status: 'published',
    meta_description: '説明',
    thumbnail_url: 'https://example.com/banner.png',
    canonical_url: null,
    category_id: null,
    business_id: null,
    published_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-28T05:00:00Z',
    category_tags: [],
    source: 'posts',
    ...overrides,
  }
}

function findAll(node: ReactNode, match: (el: ReactElement) => boolean): ReactElement[] {
  if (Array.isArray(node)) return node.flatMap((child) => findAll(child, match))
  if (!isValidElement(node)) return []
  const el = node as ReactElement<{ children?: ReactNode }>
  return [...(match(el) ? [el] : []), ...findAll(el.props.children, match)]
}

async function renderPage(): Promise<ReactElement> {
  return (await PostPage({ params: { slug: 'claude-code-guide' } })) as ReactElement
}

function jsonLd(tree: ReactElement) {
  const [script] = findAll(tree, (el) => el.type === 'script')
  const html = (script.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML.__html
  return JSON.parse(html)['@graph'][0] as Record<string, unknown>
}

beforeEach(() => {
  getPublishedPostBySlug.mockReset()
})

describe('app/posts/[slug]: ISR の設定は変えない', () => {
  it('revalidate = 300、generateStaticParams は空配列', async () => {
    expect(revalidate).toBe(300)
    expect(await generateStaticParams()).toEqual([])
  })

  it('DB エラーは throw する (404 をキャッシュしない)', async () => {
    getPublishedPostBySlug.mockRejectedValue(new Error('posts の記事取得に失敗しました'))
    await expect(renderPage()).rejects.toThrow('記事取得に失敗')
  })
})

describe("category_tags に 'guide' があればガイドの描き方", () => {
  it('GuideHero (冒頭の答え) + 常に見える目次 + ブロック付きの本文。dateModified = 更新履歴の最新日', async () => {
    getPublishedPostBySlug.mockResolvedValue(post({ content: FIXTURE, category_tags: ['guide', 'claude-code'] }))
    const tree = await renderPage()

    const [article] = findAll(tree, (el) => el.type === 'article')
    expect((article.props as Record<string, unknown>)['data-layout']).toBe('guide')

    const [hero] = findAll(tree, (el) => el.type === GuideHero)
    const heroProps = hero.props as React.ComponentProps<typeof GuideHero>
    expect(heroProps.hero?.answer).toHaveLength(3)
    expect(heroProps.modifiedAt).toBe('2026-09-27T00:00:00+09:00')
    expect(heroProps.fallbackImage).toMatchObject({ src: 'https://example.com/banner.png', width: 1200, height: 630 })

    const [toc] = findAll(tree, (el) => el.type === GuideToc)
    expect((toc.props as React.ComponentProps<typeof GuideToc>).items.map((item) => item.id)).toEqual([
      'summary', 'pricing', 'flow', 'code-example', 'choose', 'history', 'changelog', 'sources',
    ])
    expect(findAll(tree, (el) => el.type === TOCComponent)).toHaveLength(0)
    // ページの h1 は GuideHero だけ
    expect(findAll(tree, (el) => el.type === 'h1')).toHaveLength(0)

    // 本文は 1 回だけ解析し、目次と同じ描画結果を MarkdownFrame に入れる
    expect(findAll(tree, (el) => el.type === MarkdownContent)).toHaveLength(0)
    const [frame] = findAll(tree, (el) => el.type === MarkdownFrame)
    const body = renderToStaticMarkup(frame)
    for (const id of ['summary', 'pricing', 'changelog']) expect(body).toContain(`id="${id}"`)
    expect(body).toContain('data-source="guide:claude-code-guide"')
    expect(body).not.toContain('data-guide-block="hero"')
    expect(body).not.toContain('lin.ee')

    const article2 = jsonLd(tree)
    expect(article2.dateModified).toBe('2026-09-27T00:00:00+09:00')
    expect(article2.datePublished).toBe('2026-09-01T00:00:00Z')
  })

  it('og:modifiedTime も同じ日付', async () => {
    getPublishedPostBySlug.mockResolvedValue(post({ content: FIXTURE, category_tags: ['guide'] }))
    const metadata = await generateMetadata({ params: { slug: 'claude-code-guide' } })
    expect((metadata.openGraph as { modifiedTime?: string }).modifiedTime).toBe('2026-09-27T00:00:00+09:00')
  })
})

describe('通常の記事は従来の描き方のまま', () => {
  it('従来の h1・目次 (TOCComponent)。読了時間と文字数はブロックの JSON を数えない', async () => {
    const block = '\n\n```nands-stats\n{"items":[{"label":"とても長い見本のラベル","value":1}]}\n```'
    getPublishedPostBySlug.mockResolvedValue(post({ content: `## はじめに {#intro}\n\nあいうえお${block}` }))
    const tree = await renderPage()

    expect(findAll(tree, (el) => el.type === GuideHero)).toHaveLength(0)
    expect(findAll(tree, (el) => el.type === TOCComponent)).toHaveLength(1)
    const [h1] = findAll(tree, (el) => el.type === 'h1')
    expect((h1.props as { id: string }).id).toBe('main-title')
    const [content] = findAll(tree, (el) => el.type === MarkdownContent)
    expect((content.props as React.ComponentProps<typeof MarkdownContent>).guide).toBeUndefined()

    const text = JSON.stringify(findAll(tree, (el) => el.type === 'div').map((el) => (el.props as { children?: unknown }).children))
    const chars = '##はじめに{#intro}あいうえお'.length
    expect(text).toContain(`"${chars}","文字"`)

    expect(jsonLd(tree).dateModified).toBe('2026-09-28T05:00:00Z')
  })
})
