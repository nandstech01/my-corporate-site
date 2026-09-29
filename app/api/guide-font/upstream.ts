/** app/api/guide-font の CSS とファイルの道が共有する取り寄せの設定 */

/** Google Fonts は UA で形式を選ぶ。woff2 を返させるため今の Chrome の UA で取りに行く */
export const GOOGLE_FONTS_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'

export const UPSTREAM_TIMEOUT_MS = 8000

/** 取れなかった・受け付けなかった応答 (CDN にもブラウザにも置かせない) */
export function plainResponse(body: string, status: number, contentType = 'text/plain; charset=utf-8'): Response {
  return new Response(body, { status, headers: { 'Content-Type': contentType, 'Cache-Control': 'no-store' } })
}
