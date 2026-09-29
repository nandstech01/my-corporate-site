import { gstaticUrl } from '@/components/guide/guide-font'
import { warnServer } from '@/app/posts/_lib/server-log'
import { UPSTREAM_TIMEOUT_MS, plainResponse } from '../upstream'

/**
 * ガイドの書体のファイルを自社のドメインから配る (/api/guide-font の CSS が指す先)。
 * 取りに行くのは fonts.gstatic.com の決まった形の道だけ (components/guide/guide-font の gstaticUrl)。
 * URL に書体の版と鍵が入っていて中身が変わらないので、ずっと置かせる
 */
export const dynamic = 'force-dynamic'

/** 1 ページの部分集合は 1 ファイル 40KB 前後、小分けのファイルは最大 100KB 程度。これより大きい応答は受け取らない */
const MAX_FONT_BYTES = 2 * 1024 * 1024
const FONT_TYPES = new Set(['font/woff2', 'font/woff', 'font/ttf', 'font/sfnt'])

export async function GET(request: Request): Promise<Response> {
  const upstream = gstaticUrl(new URL(request.url).searchParams.get('u'))
  if (!upstream) return plainResponse('bad request', 400)
  try {
    const res = await fetch(upstream, { cache: 'no-store', signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) })
    if (!res.ok) throw new Error(`書体のファイルが ${res.status}`)
    const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
    if (!FONT_TYPES.has(type)) throw new Error(`書体でない応答 (${type || '種類なし'})`)
    const body = await res.arrayBuffer()
    if (body.byteLength > MAX_FONT_BYTES) throw new Error(`書体のファイルが大きすぎます (${body.byteLength} バイト)`)
    return new Response(body, {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    })
  } catch (error) {
    warnServer('[guide-font] 書体のファイルを取れませんでした (ページは既定の書体で出ます)', {
      error: error instanceof Error ? error.message : String(error),
    })
    return plainResponse('font unavailable', 502)
  }
}
