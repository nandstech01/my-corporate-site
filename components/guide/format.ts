/** ガイドの部品で共通に使う小さな関数 */

const numberFormat = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 2 })

/** 数値の表記 (3 桁区切り・小数は 2 桁まで) */
export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

/** 数値 + 単位。単位が英字で始まるときだけ間を空ける (例: 45% / 12秒 / 1,200 tokens) */
export function formatValue(value: number | string, unit?: string): string {
  const text = typeof value === 'number' ? numberFormat.format(value) : value
  if (!unit) return text
  return /^[A-Za-z]/.test(unit) ? `${text} ${unit}` : `${text}${unit}`
}

/** 外部リンクか (https で始まる絶対 URL) */
export function isExternalUrl(href: string): boolean {
  return href.startsWith('https://')
}
