/**
 * 問い合わせの送信元 (inquiries.source)。例: 'corporate' / 'guide:<記事の slug>' (ガイドの相談フォーム)。
 * 文字列以外は捨て、制御文字と先頭の数式記号を除いて 200 文字で切る (記録・通知・シートにそのまま使うため)。
 * route.ts には Next の決まったもの以外を export できないので、ここに分けている。
 */
export function normalizeContactSource(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    // スプレッドシート (USER_ENTERED) で数式として解釈されないよう、先頭の = + - @ を落とす
    .replace(/^[=+\-@]+/, '')
    .slice(0, 200)
}

/** 通知メールの件名。ガイドの相談フォームからのものは分かるようにする */
export function contactMailSubject(source: string): string {
  return source.startsWith('guide:')
    ? '【ガイド】ご相談がありました'
    : '【AI副業セミナー】お問い合わせがありました'
}

const GUIDE_PREFIX = 'guide:'

export interface GuideReturnPaths {
  /** 送信できたとき */
  readonly sent: string
  /** 送信できなかったとき */
  readonly failed: string
}

/**
 * JS が動かないガイドの相談フォーム (form の POST) の送信後の戻り先。
 * source が guide:<slug> のときだけ、その記事の #guide-contact-sent / #guide-contact-error (それ以外は null = 従来どおり JSON)。
 * アンカーは components/guide/contact-messages.ts の GUIDE_CONTACT_SENT_ID / GUIDE_CONTACT_ERROR_ID と同じ。
 * slug はエンコードしてパスに入れるので、別のホストや別のパスへは飛ばない
 */
export function guideReturnPaths(source: string): GuideReturnPaths | null {
  if (!source.startsWith(GUIDE_PREFIX)) return null
  const slug = source.slice(GUIDE_PREFIX.length).trim()
  if (!slug) return null
  const article = `/posts/${encodeURIComponent(slug)}`
  return { sent: `${article}#guide-contact-sent`, failed: `${article}#guide-contact-error` }
}

/**
 * フォームの POST が別のサイトから来ていないか (Origin があればホストが同じこと)。
 * ブラウザは form の POST に Origin を付ける。付いていない (古いブラウザ・サーバー間) ときは通す
 */
export function isSameOriginPost(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (origin === null) return true
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}
