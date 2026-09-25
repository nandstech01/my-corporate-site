import { describe, expect, it, vi } from 'vitest'

// PostgREST の代わり: status=published の行を返し、1 リクエスト最大 MAX_ROWS 行 (サーバーの max-rows) に切る
const MAX_ROWS = 700
const TABLES: Record<string, { slug: string; status: string }[]> = {
  posts: Array.from({ length: 2500 }, (_, i) => ({ slug: `p-${i}`, status: i % 10 === 0 ? 'draft' : 'published' })),
  chatgpt_posts: [{ slug: 'p-1', status: 'published' }, { slug: '日本語', status: 'published' }],
}
const requests: string[] = []

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => {
      const filters: Record<string, string> = {}
      const rowsFor = () =>
        TABLES[table]
          .map((r, i) => ({ id: i + 1, title: r.slug, meta_description: null, published_at: null, created_at: `2026-01-01T00:00:${String(i % 60).padStart(2, '0')}Z`, updated_at: null, thumbnail_url: null, ...r }))
          .filter((r) => Object.entries(filters).every(([k, v]) => (r as Record<string, unknown>)[k] === v))
      const builder = {
        select: () => builder,
        eq: (col: string, val: string) => ((filters[col] = val), builder),
        order: () => builder,
        limit: () => builder,
        maybeSingle: async () => ({ data: rowsFor()[0] ?? null, error: null }),
        range: async (from: number, to: number) => {
          requests.push(`${table}:${from}`)
          const rows = rowsFor()
          return { data: rows.slice(from, Math.min(to + 1, from + MAX_ROWS)), error: null, count: rows.length }
        },
      }
      return builder
    },
  }),
}))

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

import {
  getPublishedPostBySlug,
  listPublishedPosts,
  mergePublishedPosts,
  type SummaryRow,
} from '@/app/posts/_lib/public-client'

describe('listPublishedPosts / getPublishedPostBySlug (mocked PostgREST)', () => {
  it('pages past the server max-rows cap without dropping or duplicating rows', async () => {
    const all = await listPublishedPosts()
    // posts: 2500 行中 draft 250 行を除く 2250 行 + chatgpt_posts の '日本語' (p-1 は posts と重複)
    expect(all).toHaveLength(2251)
    expect(new Set(all.map((p) => p.slug)).size).toBe(2251)
    expect(all.find((p) => p.slug === 'p-1')?.source).toBe('posts')
    expect(requests.filter((r) => r.startsWith('posts:'))).toEqual(['posts:0', 'posts:700', 'posts:1400', 'posts:2100'])
  })

  it('looks up posts first, then chatgpt_posts, and accepts a percent-encoded slug', async () => {
    expect(await getPublishedPostBySlug('p-1')).toMatchObject({ slug: 'p-1', source: 'posts' })
    expect(await getPublishedPostBySlug(encodeURIComponent('日本語'))).toMatchObject({ slug: '日本語', source: 'chatgpt_posts' })
    expect(await getPublishedPostBySlug('p-10')).toBeNull() // draft
    expect(await getPublishedPostBySlug('')).toBeNull()
  })
})

const row = (over: Partial<SummaryRow> & Pick<SummaryRow, 'id' | 'slug'>): SummaryRow => ({
  title: over.slug,
  meta_description: null,
  published_at: null,
  created_at: '2026-01-01T00:00:00+00:00',
  updated_at: null,
  thumbnail_url: null,
  ...over,
})

describe('mergePublishedPosts', () => {
  it('keeps the posts row when both tables have the same slug', () => {
    const merged = mergePublishedPosts(
      [row({ id: 1, slug: 'dup', title: 'from posts' })],
      [row({ id: 1, slug: 'dup', title: 'from chatgpt' }), row({ id: 2, slug: '日本語' })]
    )
    expect(merged).toHaveLength(2)
    expect(merged.find((p) => p.slug === 'dup')).toMatchObject({ title: 'from posts', source: 'posts' })
    expect(merged.find((p) => p.slug === '日本語')).toMatchObject({ source: 'chatgpt_posts' })
  })

  it('sorts by published_at, falling back to created_at, newest first, then applies limit', () => {
    const merged = mergePublishedPosts(
      [
        row({ id: 1, slug: 'old', published_at: '2025-01-01T00:00:00+00:00' }),
        row({ id: 2, slug: 'null-published', created_at: '2026-03-01T00:00:00+00:00' }),
      ],
      [row({ id: 3, slug: 'mid', published_at: '2025-06-01T00:00:00+00:00' })],
      2
    )
    expect(merged.map((p) => p.slug)).toEqual(['null-published', 'mid'])
  })

  it('builds excerpt and image_url the same way the list page does', () => {
    const [p, c] = mergePublishedPosts(
      [row({ id: 1, slug: 'p', meta_description: 'desc', thumbnail_url: 'https://cdn/x.png', created_at: '2026-02-01T00:00:00+00:00' })],
      [row({ id: 2, slug: 'c', excerpt: 'ex', featured_image: 'https://cdn/y.png' })]
    )
    expect(p).toMatchObject({ excerpt: 'desc', image_url: 'https://cdn/x.png' })
    expect(c).toMatchObject({ excerpt: 'ex', meta_description: null, thumbnail_url: null, image_url: 'https://cdn/y.png' })
  })

  it('does not mutate its inputs', () => {
    const posts = [row({ id: 1, slug: 'a' }), row({ id: 2, slug: 'b', published_at: '2027-01-01T00:00:00+00:00' })]
    const before = JSON.stringify(posts)
    mergePublishedPosts(posts, [], 1)
    expect(JSON.stringify(posts)).toBe(before)
  })
})

