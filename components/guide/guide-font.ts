/**
 * ガイドの書体 (IBM Plex Sans JP の 400 と 700) の読み込み先。
 *
 * Google Fonts の text= で、そのページで使う文字だけの書体を作らせる (1 ページ 2 ファイル・約 80KB)。
 * text= を付けないと和文は unicode-range の小分け (約 50 ファイル・約 440KB、CSS も約 230KB) になる。
 * Google は text= が長すぎると黙って小分けの CSS を返す (約 800 字までは効き、1,500 字では効かない) ので、
 * 上限を超える長いページは最初から小分けの CSS にする (見た目は同じ、重いだけ)。
 */

const BASE = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@400;700&display=swap'

/** text= に入れる文字の上限 (エンコード後の長さ)。Google が text= を無視し始める長さより十分短く */
export const MAX_TEXT_PARAM = 7000

/**
 * ガイドの部品が本文とは別に画面に出す文字 (見出しの語・ボタン・フォーム・送信後の文・パンくず・CSS の「図」)。
 * 部品に文字を足したらここにも足す (tests/unit/site/guide-font.test.ts が部品のソースと照合する)
 */
export const GUIDE_UI_TEXT = [
  '最終更新 書いた人 AI の使い方 検証の環境 この記事の作成には生成 AI を利用しています。',
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

/** ページの文字 (重複なし・並べ替え済み)。改行などの制御文字は除く */
export function guideFontCharacters(texts: readonly string[]): string {
  const all = Array.from(ASCII + '\u00a0' + GUIDE_UI_TEXT + texts.join(''))
  const printable = all.filter((char) => {
    const code = char.codePointAt(0) ?? 0
    return code >= 0x20 && code !== 0x7f
  })
  return Array.from(new Set(printable)).sort().join('')
}

/** ガイドの書体の CSS の URL (ページの文字だけの書体。長すぎるページは小分けの CSS) */
export function guideFontHref(texts: readonly string[]): string {
  const text = encodeURIComponent(guideFontCharacters(texts))
  return text.length <= MAX_TEXT_PARAM ? `${BASE}&text=${text}` : BASE
}
