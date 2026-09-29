import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET as getCss } from '@/app/api/guide-font/route'
import { GET as getFile } from '@/app/api/guide-font/file/route'
import { GOOGLE_CSS_BASE } from '@/components/guide/guide-font'

const SUBSET_400 = '/l/font?kit=Z9XNDn9KbTDf6_f7dISNqYf_tvPT1C_4jtJ_jSJeMjdBvTA8nXyfgNcJtxx0Mb_ZUiVCUT-Ga4RpWgXy-d-stzI&skey=72bca9e466ce144b&v=v7'
const GOOGLE_CSS = `@font-face {
  font-family: 'IBM Plex Sans JP';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com${SUBSET_400}) format('woff2');
  unicode-range: U+20, U+5b8c;
}
`

const request = (pathAndQuery: string) => new Request(`https://nands.tech${pathAndQuery}`)

const stubFetch = (response: Response) => {
  const fetchMock = vi.fn(async () => response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('GET /api/guide-font (書体の CSS を自社のドメインから)', () => {
  it('Google の CSS を woff2 を返す UA で取り、組み立て直して CDN に長く置かせる', async () => {
    const fetchMock = stubFetch(new Response(GOOGLE_CSS, { headers: { 'Content-Type': 'text/css; charset=utf-8' } }))
    const res = await getCss(request(`/api/guide-font?text=${encodeURIComponent('完全ガイド')}`))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/css; charset=utf-8')
    expect(res.headers.get('Cache-Control')).toMatch(/public/)
    expect(res.headers.get('Cache-Control')).toMatch(/s-maxage=\d+/)
    const body = await res.text()
    expect(body).toContain(`url(/api/guide-font/file?u=${encodeURIComponent(SUBSET_400)})`)
    expect(body).not.toContain('fonts.gstatic.com')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`${GOOGLE_CSS_BASE}&text=${encodeURIComponent('完全ガイド')}`)
    expect(new Headers(init.headers).get('User-Agent')).toMatch(/Chrome\/\d+/)
  })

  it('text= が無ければ小分けの CSS を取る', async () => {
    const fetchMock = stubFetch(new Response(GOOGLE_CSS))
    await getCss(request('/api/guide-font'))
    expect(fetchMock.mock.calls[0]?.[0]).toBe(GOOGLE_CSS_BASE)
  })

  it('不正な text= は取りに行かずに 400 (キャッシュさせない)', async () => {
    const fetchMock = stubFetch(new Response(GOOGLE_CSS))
    const res = await getCss(request(`/api/guide-font?text=${encodeURIComponent('あ'.repeat(3000))}`))
    expect(res.status).toBe(400)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('Google の失敗・@font-face の無い応答は 502 (キャッシュさせない。ページは既定の書体で出る)', async () => {
    vi.spyOn(globalThis.console, 'warn').mockImplementation(() => undefined)
    stubFetch(new Response('oops', { status: 500 }))
    const failed = await getCss(request('/api/guide-font?text=abc'))
    expect(failed.status).toBe(502)
    expect(failed.headers.get('Cache-Control')).toBe('no-store')

    stubFetch(new Response('<html>blocked</html>'))
    const empty = await getCss(request('/api/guide-font?text=abc'))
    expect(empty.status).toBe(502)
  })
})

describe('GET /api/guide-font/file (書体のファイルを自社のドメインから)', () => {
  const font = new Uint8Array([0x77, 0x4f, 0x46, 0x32, 1, 2, 3])

  it('fonts.gstatic.com の決まった形のファイルだけを取り、ずっと置かせる', async () => {
    const fetchMock = stubFetch(new Response(font, { headers: { 'Content-Type': 'font/woff2' } }))
    const res = await getFile(request(`/api/guide-font/file?u=${encodeURIComponent(SUBSET_400)}`))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('font/woff2')
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable')
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(font)
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`https://fonts.gstatic.com${SUBSET_400}`)
  })

  it('決まった形でない u= は取りに行かずに 400', async () => {
    const fetchMock = stubFetch(new Response(font, { headers: { 'Content-Type': 'font/woff2' } }))
    for (const u of ['', '//evil.example/x.woff2', 'https://evil.example/x', '/s/ibmplexsansjp/v7/../../x.0.woff2']) {
      const res = await getFile(request(`/api/guide-font/file?u=${encodeURIComponent(u)}`))
      expect(res.status).toBe(400)
      expect(res.headers.get('Cache-Control')).toBe('no-store')
    }
    const missing = await getFile(request('/api/guide-font/file'))
    expect(missing.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('書体でない応答・大きすぎる応答・Google の失敗は 502', async () => {
    vi.spyOn(globalThis.console, 'warn').mockImplementation(() => undefined)
    const url = `/api/guide-font/file?u=${encodeURIComponent(SUBSET_400)}`
    stubFetch(new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } }))
    expect((await getFile(request(url))).status).toBe(502)

    stubFetch(new Response(new Uint8Array(3 * 1024 * 1024), { headers: { 'Content-Type': 'font/woff2' } }))
    expect((await getFile(request(url))).status).toBe(502)

    stubFetch(new Response('nope', { status: 404 }))
    const failed = await getFile(request(url))
    expect(failed.status).toBe(502)
    expect(failed.headers.get('Cache-Control')).toBe('no-store')
  })
})
