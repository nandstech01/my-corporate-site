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
