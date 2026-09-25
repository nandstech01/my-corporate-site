import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PublishedPostSummary } from '@/app/posts/_lib/public-client'

const listPublishedPosts = vi.hoisted(() => vi.fn<(options?: { limit?: number }) => Promise<PublishedPostSummary[]>>())

vi.mock('@/app/posts/_lib/public-client', () => ({ listPublishedPosts }))

import * as feedRoute from '@/app/feed.xml/route'
import * as llmsRoute from '@/app/llms.txt/route'

const post: PublishedPostSummary = {
  id: 1,
  slug: 'self-healing-rag',
  title: '自己修復するRAG設計術',
  meta_description: '説明',
  excerpt: '説明',
  published_at: '2026-07-24T00:15:17.658+00:00',
  created_at: '2026-07-24T00:15:17.666702+00:00',
  updated_at: '2026-07-24T00:15:17.666702+00:00',
  thumbnail_url: null,
  image_url: null,
  source: 'posts',
}

beforeEach(() => {
  listPublishedPosts.mockReset()
  listPublishedPosts.mockResolvedValue([post])
})

describe('GET /feed.xml', () => {
  it('serves RSS with the rss+xml content type from the latest 50 posts, revalidated hourly', async () => {
    const response = await feedRoute.GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/rss+xml; charset=utf-8')
    expect(listPublishedPosts).toHaveBeenCalledWith({ limit: 50 })
    const body = await response.text()
    expect(body).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/)
    expect(body).toContain('<link>https://nands.tech/posts/self-healing-rag</link>')
    expect(feedRoute.revalidate).toBe(3600)
  })

  it('propagates database errors instead of caching an empty feed', async () => {
    listPublishedPosts.mockRejectedValue(new Error('db down'))
    await expect(feedRoute.GET()).rejects.toThrow('db down')
  })
})

describe('GET /llms.txt', () => {
  it('serves markdown as text/plain with every published post, revalidated hourly', async () => {
    const response = await llmsRoute.GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(listPublishedPosts).toHaveBeenCalledWith()
    const body = await response.text()
    expect(body.startsWith('# 株式会社エヌアンドエス\n')).toBe(true)
    expect(body).toContain('- [自己修復するRAG設計術](https://nands.tech/posts/self-healing-rag): 説明')
    expect(llmsRoute.revalidate).toBe(3600)
  })

  it('propagates database errors instead of caching a list without posts', async () => {
    listPublishedPosts.mockRejectedValue(new Error('db down'))
    await expect(llmsRoute.GET()).rejects.toThrow('db down')
  })
})
