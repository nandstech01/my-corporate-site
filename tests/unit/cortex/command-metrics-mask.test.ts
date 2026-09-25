import { describe, expect, it } from 'vitest'
import { maskName } from '@/lib/cortex/metrics/command-metrics'

describe('maskName', () => {
  it('keeps only the first character', () => {
    expect(maskName('原田賢治')).toBe('原＊＊ 様')
    expect(maskName('  Alice ')).toBe('A＊＊ 様')
  })
  it('handles surrogate pairs as one character', () => {
    expect(maskName('𠮷田')).toBe('𠮷＊＊ 様')
  })
  it('returns null for empty or non-string input', () => {
    expect(maskName('')).toBeNull()
    expect(maskName('   ')).toBeNull()
    expect(maskName(null)).toBeNull()
    expect(maskName(42)).toBeNull()
  })
})
