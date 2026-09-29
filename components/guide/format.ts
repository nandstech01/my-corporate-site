/** ガイドの部品で共通に使う小さな関数 */

const numberFormat = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 2 })

/** 数値の表記 (3 桁区切り・小数は 2 桁まで) */
export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

/** 米ドルとして書く単位 (表示は $0.50) */
const USD_UNIT = /^(?:\$|USD|US\$|ドル|米ドル)$/i

export type UnitKind = 'usd' | 'percent' | 'other' | 'none'

export function unitKind(unit?: string): UnitKind {
  if (!unit) return 'none'
  if (USD_UNIT.test(unit.trim())) return 'usd'
  if (unit.trim() === '%' || unit.trim() === '％') return 'percent'
  return 'other'
}

/**
 * 同じ並び (グラフの全行など) で揃える小数の桁数。
 * ドルは小数のある値が 1 つでもあれば全部 2 桁 ($0.50 と $2.93 を同じ桁で)、無ければ 0 桁。そのほかは揃えない (undefined)
 */
export function sharedFractionDigits(values: readonly number[], unit?: string): number | undefined {
  if (unitKind(unit) !== 'usd') return undefined
  return values.some((value) => !Number.isInteger(value)) ? 2 : 0
}

export interface AmountParts {
  /** 数字の前に付ける記号 ($) */
  readonly prefix: string
  /** 3 桁区切りの数字 */
  readonly number: string
  /** 数字の後ろの単位 (% や 秒。ドルは prefix なので無い) */
  readonly unit: string
  /** 数字と単位の間を空けるか (31 秒 は空ける、45% は空けない) */
  readonly spaced: boolean
}

/**
 * 数値 + 単位を、本文の表と同じ書き方に分ける (グラフ・要点の数字で共通)。
 * digits = 小数の桁数 (sharedFractionDigits)。省略時は 2 桁まで必要なだけ
 */
export function amountParts(value: number, unit?: string, digits?: number): AmountParts {
  const format =
    digits === undefined
      ? numberFormat
      : new Intl.NumberFormat('ja-JP', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  const kind = unitKind(unit)
  if (kind === 'usd') {
    const sign = value < 0 ? '-' : ''
    return { prefix: `${sign}$`, number: format.format(Math.abs(value)), unit: '', spaced: false }
  }
  const number = format.format(value)
  if (kind === 'none' || !unit) return { prefix: '', number, unit: '', spaced: false }
  return { prefix: '', number, unit: unit.trim(), spaced: kind !== 'percent' }
}

/** 数値 + 単位の文字列 (例: $0.50 / 45% / 31 秒 / 1,200 tokens)。文字列の値はそのまま (単位は空白を空けて後ろに) */
export function formatValue(value: number | string, unit?: string, digits?: number): string {
  if (typeof value === 'string') return unit ? `${value} ${unit}` : value
  const parts = amountParts(value, unit, digits)
  return `${parts.prefix}${parts.number}${parts.spaced ? ' ' : ''}${parts.unit}`
}

/** 外部リンクか (https で始まる絶対 URL) */
export function isExternalUrl(href: string): boolean {
  return href.startsWith('https://')
}
