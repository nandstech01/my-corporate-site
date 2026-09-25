import { afterEach, describe, expect, it, vi } from 'vitest'

// DB が常にエラーを返すクライアント
vi.mock('@supabase/supabase-js', () => {
  const failing = {
    select: () => failing, eq: () => failing, order: () => failing, limit: () => failing,
    range: async () => ({ data: null, error: { message: 'db down' }, count: null }),
    maybeSingle: async () => ({ data: null, error: { message: 'db down' } }),
  }
  return { createClient: () => ({ from: () => failing }) }
})

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'

import { isBuildPhase, listPublishedPosts } from '@/app/posts/_lib/public-client'

describe('listPublishedPosts and the build phase', () => {
  afterEach(() => { delete process.env.NEXT_PHASE })

  it('throws at runtime so ISR keeps serving the last good page', async () => {
    expect(isBuildPhase()).toBe(false)
    await expect(listPublishedPosts()).rejects.toThrow('db down')
  })

  it('returns [] during next build so a DB outage does not fail the deploy', async () => {
    process.env.NEXT_PHASE = 'phase-production-build'
    expect(isBuildPhase()).toBe(true)
    await expect(listPublishedPosts()).resolves.toEqual([])
  })
})
