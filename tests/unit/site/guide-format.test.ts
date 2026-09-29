import { describe, expect, it } from 'vitest'
import { amountParts, formatValue, sharedFractionDigits, unitKind } from '@/components/guide/format'

describe('数値 + 単位の書き方 (グラフ・要点の数字・本文の表で同じ)', () => {
  it.each([
    [0.5, 'ドル', 2, '$0.50'],
    [2.93, 'USD', undefined, '$2.93'],
    [20, '$', undefined, '$20'],
    [31, '秒', undefined, '31 秒'],
    [1234.5, '秒', undefined, '1,234.5 秒'],
    [45, '%', undefined, '45%'],
    [1200, 'tokens', undefined, '1,200 tokens'],
    [62, undefined, undefined, '62'],
  ])('%s %s → %s', (value, unit, digits, expected) => {
    expect(formatValue(value, unit, digits)).toBe(expected)
  })

  it('文字列の値はそのまま (単位は空白を空けて後ろ)', () => {
    expect(formatValue('12/12')).toBe('12/12')
    expect(formatValue('約 4', '割')).toBe('約 4 割')
  })

  it('ドルは小数のある値が 1 つでもあれば全部 2 桁。ほかの単位は揃えない', () => {
    expect(sharedFractionDigits([0.5, 0.57, 2.93], 'ドル')).toBe(2)
    expect(sharedFractionDigits([1, 2], 'ドル')).toBe(0)
    expect(sharedFractionDigits([31, 1234.5], '秒')).toBeUndefined()
  })

  it('部品に分ける (要点の数字は数字を大きく、単位を小さく描く)', () => {
    expect(amountParts(0.15, 'ドル')).toEqual({ prefix: '$', number: '0.15', unit: '', spaced: false })
    expect(amountParts(30, '秒')).toEqual({ prefix: '', number: '30', unit: '秒', spaced: true })
    expect(amountParts(45, '%')).toEqual({ prefix: '', number: '45', unit: '%', spaced: false })
    expect(unitKind('米ドル')).toBe('usd')
  })
})
