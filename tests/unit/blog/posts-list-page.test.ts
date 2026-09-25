import React, { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { PublishedPostSummary } from '@/app/posts/_lib/public-client'

const summary = (overrides: Partial<PublishedPostSummary>): PublishedPostSummary => ({
  id: 1,
  slug: 'ascii-slug',
  title: 'タイトル',
  meta_description: null,
  excerpt: null,
  published_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: null,
  thumbnail_url: null,
  image_url: null,
  source: 'posts',
  ...overrides,
})

// listPublishedPosts は並べ替え済みの配列を返す契約 (並べ替え自体は public-client.test.ts で検証)
const POSTS: PublishedPostSummary[] = [
  summary({ id: 7, slug: 'ascii-slug', title: 'A </script><script>alert(1)</script>', excerpt: '抜粋' }),
  summary({ id: 7, slug: 'seoから始める', title: '日本語 slug', source: 'chatgpt_posts', image_url: 'https://example.com/a.png' }),
]

vi.mock('@/app/posts/_lib/public-client', () => ({
  listPublishedPosts: vi.fn(async () => POSTS),
}))

// vitest の esbuild は tsconfig の jsx: preserve により classic 変換 (React.createElement) になる
vi.stubGlobal('React', React)

import PostsPage, { metadata, revalidate } from '@/app/posts/page'

function findElements(node: ReactNode, match: (el: ReactElement) => boolean): ReactElement[] {
  if (Array.isArray(node)) return node.flatMap((child) => findElements(child, match))
  if (!isValidElement(node)) return []
  const el = node as ReactElement<{ children?: ReactNode }>
  return [...(match(el) ? [el] : []), ...findElements(el.props.children, match)]
}

async function renderTree() {
  return (await PostsPage()) as ReactElement
}

describe('app/posts/page (記事一覧)', () => {
  it('ISR: revalidate を持ち、title は社名なし (layout の template が付ける)', () => {
    expect(revalidate).toBe(300)
    expect(metadata.title).toBe('記事一覧')
    expect(metadata.alternates?.canonical).toBe('https://nands.tech/posts')
    expect(metadata.alternates?.types).toEqual({ 'application/rss+xml': '/feed.xml' })
  })

  it('JSON-LD は素の <script> 1 つで、</script> を抜けられない', async () => {
    const scripts = findElements(await renderTree(), (el) => el.type === 'script')
    expect(scripts).toHaveLength(1)
    const props = scripts[0].props as { type: string; dangerouslySetInnerHTML: { __html: string } }
    expect(props.type).toBe('application/ld+json')
    expect(props.dangerouslySetInnerHTML.__html).not.toContain('</script>')
    expect(props.dangerouslySetInnerHTML.__html).not.toContain('<')
  })

  it('@graph = CollectionPage (publisher は Organization 参照) + BreadcrumbList + Organization', async () => {
    const [script] = findElements(await renderTree(), (el) => el.type === 'script')
    const graph = JSON.parse(
      (script.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML.__html
    )['@graph'] as Record<string, any>[]

    expect(graph.map((node) => node['@type'])).toEqual(['CollectionPage', 'BreadcrumbList', 'Organization'])
    const [page, breadcrumb, organization] = graph

    expect(page.publisher).toEqual({ '@id': 'https://nands.tech/#organization' })
    expect(organization['@id']).toBe('https://nands.tech/#organization')
    expect(organization.logo.url).toBe('https://nands.tech/images/logo.svg')
    expect(page.breadcrumb).toEqual({ '@id': breadcrumb['@id'] })

    expect(page.mainEntity.numberOfItems).toBe(2)
    expect(page.mainEntity.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, url: 'https://nands.tech/posts/ascii-slug', name: POSTS[0].title },
      {
        '@type': 'ListItem',
        position: 2,
        url: `https://nands.tech/posts/${encodeURIComponent('seoから始める')}`,
        name: '日本語 slug',
      },
    ])

    expect(breadcrumb.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://nands.tech/' },
      { '@type': 'ListItem', position: 2, name: '記事一覧', item: 'https://nands.tech/posts' },
    ])
  })

  it('パンくずは「ホーム」を渡さず (Breadcrumbs が付ける)、Breadcrumbs 側の JSON-LD は止める', async () => {
    const [breadcrumbs] = findElements(
      await renderTree(),
      (el) => typeof el.type === 'function' && 'customItems' in (el.props as object)
    )
    expect(breadcrumbs.props).toMatchObject({
      customItems: [{ name: '記事一覧', path: '/posts' }],
      withSchema: false,
    })
  })

  it('カードは受け取った順で、id が同じでも key が衝突しない', async () => {
    const links = findElements(
      await renderTree(),
      (el) => typeof (el.props as { href?: unknown }).href === 'string'
    )
    expect(links.map((el) => el.key)).toEqual(['posts_7', 'chatgpt_posts_7'])
    expect(links.map((el) => (el.props as { href: string }).href)).toEqual([
      '/posts/ascii-slug',
      '/posts/seoから始める',
    ])
  })
})
