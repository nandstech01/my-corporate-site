import { describe, expect, it } from 'vitest'
import { classifyChannel, detectAiEngine, normalizeSource } from '@/lib/cortex/metrics/traffic-channel'

describe('normalizeSource', () => {
  it('extracts hostnames from URLs and strips www', () => {
    expect(normalizeSource('https://www.google.com/search?q=x')).toBe('google.com')
    expect(normalizeSource('chatgpt.com')).toBe('chatgpt.com')
  })
  it('treats GA4 placeholders as empty', () => {
    expect(normalizeSource('(direct)')).toBe('')
    expect(normalizeSource('(not set)')).toBe('')
    expect(normalizeSource(null)).toBe('')
  })
})

describe('classifyChannel', () => {
  it.each([
    ['chatgpt.com', 'ai'],
    ['https://chat.openai.com/c/abc', 'ai'],
    ['perplexity.ai', 'ai'],
    ['claude.ai', 'ai'],
    ['gemini.google.com', 'ai'],
    ['copilot.microsoft.com', 'ai'],
    ['felo.ai', 'ai'],
    ['you.com', 'ai'],
    ['google', 'search'],
    ['https://www.google.co.jp/', 'search'],
    ['bing', 'search'],
    ['yahoo', 'search'],
    ['t.co', 'x'],
    ['https://x.com/foo', 'x'],
    ['linkedin.com', 'linkedin'],
    ['lnkd.in', 'linkedin'],
    ['qiita.com', 'crosspost'],
    ['zenn.dev', 'crosspost'],
    ['note.com', 'crosspost'],
    ['(direct)', 'direct'],
    ['', 'direct'],
    ['example.org', 'other'],
  ] as const)('%s → %s', (src, expected) => {
    expect(classifyChannel(src)).toBe(expected)
  })

  it('does not confuse google search with gemini', () => {
    expect(detectAiEngine('google.com')).toBeNull()
    expect(detectAiEngine('gemini.google.com')).toBe('gemini')
  })
})
