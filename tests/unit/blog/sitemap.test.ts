import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PublishedPostSummary } from '@/app/posts/_lib/public-client'

const db = vi.hoisted(() => ({
  posts: [] as PublishedPostSummary[],
  categories: { data: [] as { slug: string | null; updated_at: string | null }[] | null, error: null as { message: string } | null },
}))

vi.mock('@/app/posts/_lib/public-client', () => ({
  listPublishedPosts: vi.fn(async () => db.posts),
  getPublicSupabase: () => ({
    from: (table: string) => {
      if (table !== 'categories') throw new Error(`unexpected table ${table}`)
      return { select: () => ({ order: async () => db.categories }) }
    },
  }),
}))

import sitemap, { revalidate } from '@/app/sitemap'
import { AUTHOR, postUrl } from '@/lib/structured-data/site-entities'

const summary = (overrides: Partial<PublishedPostSummary>): PublishedPostSummary => ({
  id: 1,
  slug: 'slug',
  title: 'title',
  meta_description: null,
  excerpt: null,
  published_at: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: null,
  thumbnail_url: null,
  image_url: null,
  source: 'posts',
  ...overrides,
})

beforeEach(() => {
  db.posts = [
    summary({ slug: 'self-healing-rag', updated_at: '2026-07-24T00:15:17.666702+00:00', published_at: '2026-07-24T00:15:17.658+00:00' }),
    summary({ slug: 'edited-later', published_at: '2026-01-01T00:00:00Z', updated_at: '2026-08-01T12:00:00Z' }),
    summary({ slug: 'ragとは-仕組み', source: 'chatgpt_posts', created_at: '2025-06-01T03:00:00Z' }),
  ]
  db.categories = {
    data: [
      { slug: 'seo-writing', updated_at: '2025-02-01T12:22:30.252864+00:00' },
      { slug: 'data-analysis', updated_at: '2025-02-01T12:22:30.252864+00:00' },
      { slug: 'ai-news', updated_at: null },
      { slug: 'data-analysis', updated_at: '2025-03-01T00:00:00Z' },
      { slug: null, updated_at: null },
    ],
    error: null,
  }
})

const byUrl = async () => new Map((await sitemap()).map((entry) => [entry.url, entry]))

describe('sitemap', () => {
  it('regenerates hourly instead of rendering on every request', () => {
    expect(revalidate).toBe(3600)
  })

  it('gives lastModified only to posts, the post list and categories (never "now" for fixed pages)', async () => {
    const entries = await sitemap()
    const dated = entries.filter((entry) => entry.lastModified !== undefined).map((entry) => entry.url)
    for (const url of dated) {
      expect(url.startsWith('https://nands.tech/posts') || url.startsWith('https://nands.tech/categories/')).toBe(true)
    }
    const fixed = entries.filter((entry) => !entry.url.includes('/posts') && !entry.url.includes('/categories/'))
    expect(fixed.length).toBeGreaterThan(20)
    expect(fixed.every((entry) => entry.lastModified === undefined)).toBe(true)
  })

  it('adds /posts (lastmod = newest post update) and the author page', async () => {
    const entries = await byUrl()
    expect((entries.get('https://nands.tech/posts')?.lastModified as Date).toISOString()).toBe('2026-08-01T12:00:00.000Z')
    expect(entries.get(AUTHOR.url)).toBeDefined()
    expect(entries.get(AUTHOR.url)?.lastModified).toBeUndefined()
  })

  it('drops the 404 pages /special and /chatgpt-special', async () => {
    const entries = await byUrl()
    expect(entries.has('https://nands.tech/special')).toBe(false)
    expect(entries.has('https://nands.tech/chatgpt-special')).toBe(false)
    expect(entries.has('https://nands.tech/corporate')).toBe(true)
  })

  it('percent-encodes post slugs like the canonical and keeps the per-table priority', async () => {
    const entries = await byUrl()
    const japanese = entries.get(postUrl('ragとは-仕組み'))
    expect(postUrl('ragとは-仕組み')).toMatch(/^https:\/\/nands\.tech\/posts\/rag%E3%81%A8/)
    expect(japanese?.priority).toBe(0.6)
    expect((japanese?.lastModified as Date).toISOString()).toBe('2025-06-01T03:00:00.000Z') // updated/published 無し → created_at
    const post = entries.get('https://nands.tech/posts/self-healing-rag')
    expect(post?.priority).toBe(0.7)
    expect((post?.lastModified as Date).toISOString()).toBe('2026-07-24T00:15:17.666Z')
    expect(Array.from(entries.keys()).some((url) => /[^\x21-\x7e]/.test(url))).toBe(false)
  })

  it('leaves out category slugs that appear more than once (their page 404s) and empty slugs', async () => {
    const entries = await byUrl()
    const categories = Array.from(entries.keys()).filter((url) => url.includes('/categories/'))
    expect(categories).toEqual(['https://nands.tech/categories/seo-writing', 'https://nands.tech/categories/ai-news'])
    expect(entries.get('https://nands.tech/categories/ai-news')?.lastModified).toBeUndefined()
  })

  it('never lists the same URL twice', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('throws on a database error so ISR keeps serving the last good sitemap', async () => {
    db.categories = { data: null, error: { message: 'boom' } }
    await expect(sitemap()).rejects.toThrow('boom')
  })
})
