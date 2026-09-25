import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/app/posts/_lib/public-client', () => ({
  listPublishedPosts: vi.fn(async () => [
    { slug: 'self-healing-rag-design-jua09i' },
    { slug: 'seoからllmoへ' },
  ]),
}))

import { GET as getSingle, POST as postUrls } from '@/app/api/indexnow/route'
import { GET as getSubmitAll } from '@/app/api/indexnow/submit-all/route'

const fetchMock = vi.fn()

function request(path: string, init: { method?: string; secret?: string; body?: unknown } = {}) {
  const headers = new Headers()
  if (init.secret !== undefined) headers.set('x-indexnow-secret', init.secret)
  if (init.body !== undefined) headers.set('content-type', 'application/json')
  return new NextRequest(`https://nands.tech${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
}

function sentUrlList(): string[] {
  const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
  return JSON.parse(String(init.body)).urlList
}

beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(new Response(null, { status: 202 }))
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('INDEXNOW_KEY', 'test-key-123')
  vi.stubEnv('INDEXNOW_SUBMIT_SECRET', 'route-secret')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('/api/indexnow の認証', () => {
  const calls = {
    'POST /api/indexnow': (secret?: string) =>
      postUrls(request('/api/indexnow', { method: 'POST', secret, body: { urls: ['https://nands.tech/posts'] } })),
    'GET /api/indexnow': (secret?: string) =>
      getSingle(request('/api/indexnow?url=https://nands.tech/posts', { secret })),
    'GET /api/indexnow/submit-all': (secret?: string) =>
      getSubmitAll(request('/api/indexnow/submit-all', { secret })),
  }

  for (const [name, call] of Object.entries(calls)) {
    it(`${name}: ヘッダ無し・不一致は 401 で、IndexNow に送らない`, async () => {
      expect((await call()).status).toBe(401)
      expect((await call('wrong')).status).toBe(401)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it(`${name}: INDEXNOW_SUBMIT_SECRET 未設定なら 503 で、IndexNow に送らない`, async () => {
      vi.stubEnv('INDEXNOW_SUBMIT_SECRET', '')
      expect((await call('route-secret')).status).toBe(503)
      expect((await call('')).status).toBe(503)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it(`${name}: 正しいシークレットなら送信する`, async () => {
      const response = await call('route-secret')
      expect(response.status).toBe(200)
      expect(await response.json()).toMatchObject({ success: true, status: 202 })
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock.mock.calls[0][0]).toBe('https://api.indexnow.org/indexnow')
    })
  }
})

describe('POST /api/indexnow', () => {
  it('urls が文字列の配列でなければ 400', async () => {
    for (const body of [{}, { urls: [] }, { urls: 'https://nands.tech/' }, { urls: [1] }]) {
      const response = await postUrls(request('/api/indexnow', { method: 'POST', secret: 'route-secret', body }))
      expect(response.status).toBe(400)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('IndexNow のエラーステータスをそのまま返す', async () => {
    fetchMock.mockResolvedValue(new Response('rate limited', { status: 429 }))
    const response = await postUrls(
      request('/api/indexnow', { method: 'POST', secret: 'route-secret', body: { urls: ['https://nands.tech/posts'] } })
    )
    expect(response.status).toBe(429)
    expect(await response.json()).toMatchObject({ success: false, status: 429, error: 'rate limited' })
  })

  it('IndexNow に届かなければ 500', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))
    const response = await getSingle(request('/api/indexnow?url=https://nands.tech/posts', { secret: 'route-secret' }))
    expect(response.status).toBe(500)
  })
})

describe('GET /api/indexnow/submit-all', () => {
  it('404 の /special・/chatgpt-special を含めず、記事 URL は postUrl でエンコードする', async () => {
    const response = await getSubmitAll(request('/api/indexnow/submit-all', { secret: 'route-secret' }))
    expect(response.status).toBe(200)

    const urlList = sentUrlList()
    expect(urlList).not.toContain('https://nands.tech/special')
    expect(urlList).not.toContain('https://nands.tech/chatgpt-special')
    expect(urlList).toContain('https://nands.tech')
    expect(urlList).toContain('https://nands.tech/posts')
    expect(urlList).toContain('https://nands.tech/posts/self-healing-rag-design-jua09i')
    expect(urlList).toContain(
      'https://nands.tech/posts/seo%E3%81%8B%E3%82%89llmo%E3%81%B8'
    )
    expect(urlList.some((url) => /[^\x21-\x7e]/.test(url))).toBe(false)
    expect(new Set(urlList).size).toBe(urlList.length)
    expect(urlList.every((url) => url === 'https://nands.tech' || url.startsWith('https://nands.tech/'))).toBe(true)
  })

  it('記事一覧の取得に失敗したら 500 で、IndexNow に送らない', async () => {
    const { listPublishedPosts } = await import('@/app/posts/_lib/public-client')
    vi.mocked(listPublishedPosts).mockRejectedValueOnce(new Error('db down'))

    const response = await getSubmitAll(request('/api/indexnow/submit-all', { secret: 'route-secret' }))
    expect(response.status).toBe(500)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
