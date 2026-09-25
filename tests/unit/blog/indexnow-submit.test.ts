import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  INDEXNOW_ENDPOINT,
  checkSubmitSecret,
  getIndexNowKey,
  submitToIndexNow,
} from '@/lib/indexnow/submit'

const fetchMock = vi.fn()

function lastRequest() {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit]
  return { url, init, body: JSON.parse(String(init.body)) }
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('INDEXNOW_KEY', 'test-key-123')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('submitToIndexNow', () => {
  it('api.indexnow.org に host / key / keyLocation / urlList を POST し、202 を ok として返す', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))

    const result = await submitToIndexNow([
      'https://nands.tech/posts/a',
      'https://nands.tech/posts/%E6%97%A5%E6%9C%AC',
      'https://nands.tech/posts/a',
    ])

    expect(result).toEqual({ ok: true, status: 202 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const { url, init, body } = lastRequest()
    expect(url).toBe('https://api.indexnow.org/indexnow')
    expect(url).toBe(INDEXNOW_ENDPOINT)
    expect(init.method).toBe('POST')
    expect(new Headers(init.headers).get('content-type')).toBe('application/json; charset=utf-8')
    expect(body).toEqual({
      host: 'nands.tech',
      key: 'test-key-123',
      keyLocation: 'https://nands.tech/test-key-123.txt',
      urlList: ['https://nands.tech/posts/a', 'https://nands.tech/posts/%E6%97%A5%E6%9C%AC'],
    })
  })

  it('200 も ok', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 200 }))
    await expect(submitToIndexNow(['https://nands.tech/'])).resolves.toEqual({ ok: true, status: 200 })
  })

  it('INDEXNOW_KEY が未設定なら公開済みキーファイルと同じキーを使う', async () => {
    vi.stubEnv('INDEXNOW_KEY', '')
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))

    await submitToIndexNow(['https://nands.tech/posts'])

    const { body } = lastRequest()
    expect(getIndexNowKey()).toBe('b247e7b751dc4d84164c134151ee0814')
    expect(body.key).toBe('b247e7b751dc4d84164c134151ee0814')
    expect(body.keyLocation).toBe('https://nands.tech/b247e7b751dc4d84164c134151ee0814.txt')
  })

  it('IndexNow のエラー (422 など) はステータスと本文を返し、throw しない', async () => {
    fetchMock.mockResolvedValue(new Response('URLs do not belong to the host', { status: 422 }))

    await expect(submitToIndexNow(['https://example.com/x'])).resolves.toEqual({
      ok: false,
      status: 422,
      error: 'URLs do not belong to the host',
    })
  })

  it('通信エラーは status 0 で返し、throw しない', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    await expect(submitToIndexNow(['https://nands.tech/posts'])).resolves.toEqual({
      ok: false,
      status: 0,
      error: 'fetch failed',
    })
  })

  it('URL が 0 件なら送信しない', async () => {
    const result = await submitToIndexNow([])
    expect(result.ok).toBe(false)
    expect(result.status).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('checkSubmitSecret', () => {
  it('INDEXNOW_SUBMIT_SECRET が未設定 (空文字含む) なら 503 で閉じる', () => {
    expect(checkSubmitSecret('anything', undefined)).toMatchObject({ ok: false, status: 503 })
    expect(checkSubmitSecret('', '')).toMatchObject({ ok: false, status: 503 })
  })

  it('既定では env INDEXNOW_SUBMIT_SECRET と比べる', () => {
    vi.stubEnv('INDEXNOW_SUBMIT_SECRET', 's3cret')
    expect(checkSubmitSecret('s3cret')).toEqual({ ok: true })
    expect(checkSubmitSecret('nope')).toMatchObject({ ok: false, status: 401 })
  })

  it('ヘッダ無し・不一致・前方一致・長すぎは 401', () => {
    for (const provided of [null, undefined, '', 's3cre', 's3cret!', 'S3CRET', 'x'.repeat(6)]) {
      expect(checkSubmitSecret(provided, 's3cret')).toMatchObject({ ok: false, status: 401 })
    }
  })

  it('一致すれば ok', () => {
    expect(checkSubmitSecret('s3cret', 's3cret')).toEqual({ ok: true })
  })
})
