import { describe, expect, it } from 'vitest'
import { parseAttribution, readGaClientId } from '@/lib/cortex/metrics/attribution'

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
