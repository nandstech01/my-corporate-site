import { googleCssUrl, rewriteGuideFontCss } from '@/components/guide/guide-font'
import { warnServer } from '@/app/posts/_lib/server-log'
import { GOOGLE_FONTS_UA, UPSTREAM_TIMEOUT_MS, plainResponse } from './upstream'

/**
 * ガイドの書体 (IBM Plex Sans JP) の CSS を自社のドメインから配る。
 * 本番の CSP (vercel.json) が Google Fonts を止めるため、サーバーが Google の CSS を取り、
 * 検査した @font-face だけで組み立て直し、書体のファイルの URL を /api/guide-font/file に向ける。
 * 中身は text= で決まるので CDN に長く置かせる。失敗は置かせない (ページは既定の書体で出る)
 */
export const dynamic = 'force-dynamic'

const CACHE = 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400'
/** 小分けの CSS (約 230KB) より十分大きい。これより大きい応答は受け取らない */
const MAX_CSS_CHARS = 1_000_000

export async function GET(request: Request): Promise<Response> {
  const upstream = googleCssUrl(new URL(request.url).searchParams.get('text'))
  if (!upstream) return plainResponse('bad request', 400)
  try {
    const res = await fetch(upstream, {
      headers: { 'User-Agent': GOOGLE_FONTS_UA },
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`Google Fonts の CSS が ${res.status}`)
    const upstreamCss = await res.text()
    if (upstreamCss.length > MAX_CSS_CHARS) throw new Error(`Google Fonts の CSS が大きすぎます (${upstreamCss.length} 字)`)
    const css = rewriteGuideFontCss(upstreamCss)
    if (!css) throw new Error('Google Fonts の CSS に使える @font-face がありません')
    return new Response(css, {
      headers: { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': CACHE, 'X-Content-Type-Options': 'nosniff' },
    })
  } catch (error) {
    warnServer('[guide-font] 書体の CSS を取れませんでした (ページは既定の書体で出ます)', {
      error: error instanceof Error ? error.message : String(error),
    })
    return plainResponse('/* font unavailable */', 502, 'text/css; charset=utf-8')
  }
}
