/**
 * ガイドの書体 (IBM Plex Sans JP の 400 と 700) の読み込み先。
 *
 * Google Fonts の text= で、そのページで使う文字だけの書体を作らせる (1 ページ 2 ファイル・約 80KB)。
 * text= を付けないと和文は unicode-range の小分け (約 50 ファイル・約 440KB、CSS も約 230KB) になる。
 * Google は text= が長すぎると黙って小分けの CSS を返す (約 800 字までは効き、1,500 字では効かない) ので、
 * 上限を超える長いページは最初から小分けの CSS にする (見た目は同じ、重いだけ)。
 *
 * 本番の CSP (vercel.json の style-src・font-src は 'self' だけ) は Google Fonts を止めるので、
 * CSS も書体のファイルも自社のドメインから配る (app/api/guide-font)。ブラウザは Google に接続しない。
 * Google の CSS はそのまま流さず、検査した @font-face の値だけで組み立て直す。
 */

/** Google Fonts の CSS (サーバーだけが取りに行く) */
export const GOOGLE_CSS_BASE = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@400;700&display=swap'
const GSTATIC_ORIGIN = 'https://fonts.gstatic.com'

/** 自社のドメインの CSS と書体のファイルの道 (app/api/guide-font) */
const CSS_PATH = '/api/guide-font'
const FILE_PATH = '/api/guide-font/file'

/** text= に入れる文字の上限 (エンコード後の長さ)。Google が text= を無視し始める長さより十分短く */
export const MAX_TEXT_PARAM = 7000

/**
 * ガイドの部品が本文とは別に画面に出す文字 (見出しの語・ボタン・フォーム・送信後の文・パンくず・CSS の「図」)。
 * 部品に文字を足したらここにも足す (tests/unit/site/guide-font.test.ts が部品のソースと照合する)
 */
export const GUIDE_UI_TEXT = [
  '最終更新 書いた人',
  '目次 図 単位: 出典: 根拠: に確認',
  '補足 ポイント 注意 未確認 詳しく読む 強調した項目 ｜',
  // 改行で割らない語 (components/guide/phrases の UNBREAKABLE)。本文に出るときに書体に無いと困るので入れておく
  '完全ガイド 完全保存版',
  'お名前 メールアドレス 会社名 (任意) ご相談の内容 相談を送る 送信しています',
  'ご相談を受け付けました。内容を確認のうえ、担当者からメールでご連絡します。',
  '送信できませんでした。時間をおいてもう一度お試しいただくか、contact@nands.tech へメールでご連絡ください。',
  '詳しいプロフィール ホーム 記事一覧',
].join('')

/** 英数字と記号は常に入れる (日付・数値・URL・コード以外の英語) */
const ASCII = Array.from({ length: 0x7f - 0x20 }, (_, i) => String.fromCharCode(0x20 + i)).join('')

const isControl = (char: string): boolean => {
  const code = char.codePointAt(0) ?? 0
  return code < 0x20 || code === 0x7f
}

/** ページの文字 (重複なし・並べ替え済み)。改行などの制御文字は除く */
export function guideFontCharacters(texts: readonly string[]): string {
  const printable = Array.from(ASCII + ' ' + GUIDE_UI_TEXT + texts.join('')).filter((char) => !isControl(char))
  return Array.from(new Set(printable)).sort().join('')
}

/** ガイドの書体の CSS の URL (自社のドメイン。ページの文字だけの書体、長すぎるページは小分けの CSS) */
export function guideFontHref(texts: readonly string[]): string {
  const text = encodeURIComponent(guideFontCharacters(texts))
  return text.length <= MAX_TEXT_PARAM ? `${CSS_PATH}?text=${text}` : CSS_PATH
}

/** 自社の CSS の道の text= (デコード後) から Google の CSS の URL を作る。無い・空なら小分けの CSS。長すぎる・制御文字を含むなら null */
export function googleCssUrl(text: string | null): string | null {
  if (!text) return GOOGLE_CSS_BASE
  const encoded = encodeURIComponent(text)
  if (encoded.length > MAX_TEXT_PARAM || Array.from(text).some(isControl)) return null
  return `${GOOGLE_CSS_BASE}&text=${encoded}`
}

/**
 * fonts.gstatic.com で取りに行ってよい道 (text= の部分集合 / 小分けのファイル)。これ以外は取らない。
 * 部分集合の kit は文字の組を中に持つので長い (Google が初めて見る組は、text= の上限の 759 字で約 3,000 字。見たことのある組は 50 字前後)
 */
const GSTATIC_PATHS = [
  /^\/l\/font\?kit=[A-Za-z0-9_-]{8,8192}&skey=[0-9a-f]{8,32}&v=v\d{1,3}$/,
  /^\/s\/ibmplexsansjp\/v\d{1,3}\/[A-Za-z0-9_-]{8,256}\.\d{1,3}\.woff2$/,
]

/** 自社の書体のファイルの道の u= (fonts.gstatic.com の道と引数) から取り寄せ先の URL を作る。決まった形でなければ null */
export function gstaticUrl(u: string | null): string | null {
  if (!u || !GSTATIC_PATHS.some((pattern) => pattern.test(u))) return null
  return GSTATIC_ORIGIN + u
}

const FONT_FACE = /@font-face\s*\{([^{}]*)\}/g
const SRC = /^url\(https:\/\/fonts\.gstatic\.com(\/[^)\s'"]+)\) format\('(woff2|woff|truetype)'\)$/
const UNICODE_RANGE = /^U\+[0-9A-Fa-f?]{1,6}(?:-[0-9A-Fa-f]{1,6})?(?:, U\+[0-9A-Fa-f?]{1,6}(?:-[0-9A-Fa-f]{1,6})?)*$/

/** 1 つの @font-face の中身を検査して組み立て直す (値の決まった宣言だけ。ほかの宣言は捨てる)。使えなければ null */
function fontFace(body: string): string | null {
  const declarations = new Map(
    body
      .split(';')
      .map((part) => part.trim())
      .filter((part) => part.includes(':'))
      .map((part) => [part.slice(0, part.indexOf(':')).trim().toLowerCase(), part.slice(part.indexOf(':') + 1).trim()] as const)
  )
  const style = declarations.get('font-style')
  const weight = declarations.get('font-weight')
  const src = SRC.exec(declarations.get('src') ?? '')
  const range = declarations.get('unicode-range')
  if (declarations.get('font-family') !== "'IBM Plex Sans JP'") return null
  if (style !== 'normal' && style !== 'italic') return null
  if (!weight || !/^[1-9]00$/.test(weight)) return null
  if (!src || !gstaticUrl(src[1])) return null
  if (range !== undefined && !UNICODE_RANGE.test(range)) return null
  const lines = [
    "font-family: 'IBM Plex Sans JP';",
    `font-style: ${style};`,
    `font-weight: ${weight};`,
    'font-display: swap;',
    `src: url(${FILE_PATH}?u=${encodeURIComponent(src[1])}) format('${src[2]}');`,
    ...(range ? [`unicode-range: ${range};`] : []),
  ]
  return `@font-face {\n  ${lines.join('\n  ')}\n}`
}

/**
 * Google の CSS を、検査した @font-face だけで組み立て直す (書体のファイルは自社の道へ)。
 * Google の応答をそのまま流さないので、よその URL や余計な CSS は入らない。使える @font-face が無ければ null
 */
export function rewriteGuideFontCss(css: string): string | null {
  const faces = Array.from(css.matchAll(FONT_FACE), (match) => fontFace(match[1])).filter((face): face is string => face !== null)
  return faces.length > 0 ? `${faces.join('\n')}\n` : null
}
