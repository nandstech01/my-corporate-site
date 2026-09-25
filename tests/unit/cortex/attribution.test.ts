import { describe, expect, it } from 'vitest'
import { parseAttribution, readGaClientId, readGaSessionId } from '@/lib/cortex/metrics/attribution'

const cookie = (obj: Record<string, string>) => `foo=1; nands_ft=${encodeURIComponent(JSON.stringify(obj))}; bar=2`

describe('parseAttribution', () => {
  it('classifies an AI referrer', () => {
    const a = parseAttribution(cookie({ p: '/posts/claude-code-hooks', r: 'https://chatgpt.com/' }))
    expect(a).toMatchObject({ landing_path: '/posts/claude-code-hooks', channel: 'ai', ai_engine: 'chatgpt' })
  })
  it('prefers utm_source over referrer', () => {
    const a = parseAttribution(cookie({ p: '/', r: 'https://t.co/x', us: 'linkedin', um: 'social', uc: 'launch' }))
    expect(a).toMatchObject({ channel: 'linkedin', utm_medium: 'social', utm_campaign: 'launch' })
  })
  it('returns direct when cookie is missing or broken', () => {
    expect(parseAttribution(null).channel).toBe('direct')
    expect(parseAttribution('nands_ft=%7Bbroken').channel).toBe('direct')
  })
  it('truncates oversized values', () => {
    const a = parseAttribution(cookie({ p: `/${'a'.repeat(900)}` }))
    expect(a.landing_path?.length).toBe(500)
  })
})

describe('readGaClientId', () => {
  it('extracts the client id', () => {
    expect(readGaClientId('_ga=GA1.1.123456789.1700000000')).toBe('123456789.1700000000')
  })
  it('returns null when absent', () => {
    expect(readGaClientId('x=1')).toBeNull()
  })
})

describe('readGaSessionId', () => {
  it('reads the new GS2 format', () => {
    expect(readGaSessionId('_ga_GLG263SVMM=GS2.1.s1790356706$o3$g1$t1790356800$j0$l0$h0', 'G-GLG263SVMM')).toBe('1790356706')
  })
  it('reads the old GS1 format', () => {
    expect(readGaSessionId('x=1; _ga_GLG263SVMM=GS1.1.1700000000.3.1.1700000100.0.0.0', 'G-GLG263SVMM')).toBe('1700000000')
  })
  it('returns null for another property or no cookie', () => {
    expect(readGaSessionId('_ga_OTHER=GS2.1.s1$o1', 'G-GLG263SVMM')).toBeNull()
    expect(readGaSessionId(null, 'G-GLG263SVMM')).toBeNull()
  })
})
