/** ガイドの部品で共通に使う小さな関数 */

const numberFormat = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 2 })

/** 数値 + 単位。単位が英字で始まるときだけ間を空ける (例: 45% / 12秒 / 1,200 tokens) */
export function formatValue(value: number | string, unit?: string): string {
  const text = typeof value === 'number' ? numberFormat.format(value) : value
  if (!unit) return text
  return /^[A-Za-z]/.test(unit) ? `${text} ${unit}` : `${text}${unit}`
}

/** 同じページに同じ部品が複数あっても衝突しない、内容から決まる id (SVG の title・marker 用) */
export function stableId(prefix: string, seed: string): string {
  let hash = 5381
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) + hash + seed.charCodeAt(index)) | 0
  }
  return `${prefix}-${(hash >>> 0).toString(36)}`
}

/** 外部リンクか (https で始まる絶対 URL) */
export function isExternalUrl(href: string): boolean {
  return href.startsWith('https://')
}
