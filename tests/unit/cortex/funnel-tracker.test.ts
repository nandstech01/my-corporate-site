import { describe, it, expect } from 'vitest'
import { generateLineAddUrl, embedLineCTA } from '../../../lib/cortex/line/funnel-tracker'

describe('generateLineAddUrl', () => {
  it('includes utm_source parameter from platform', () => {
    const url = generateLineAddUrl({ platform: 'x' })
    const parsed = new URL(url)
    expect(parsed.searchParams.get('utm_source')).toBe('x')
  })

  it('includes utm_campaign when campaign is provided', () => {
    const url = generateLineAddUrl({ platform: 'linkedin', campaign: 'spring_2026' })
    const parsed = new URL(url)
    expect(parsed.searchParams.get('utm_campaign')).toBe('spring_2026')
  })

  it('does not include utm_campaign when campaign is omitted', () => {
    const url = generateLineAddUrl({ platform: 'threads' })
    const parsed = new URL(url)
    expect(parsed.searchParams.has('utm_campaign')).toBe(false)
  })

  it('includes utm_content when topic is provided', () => {
    const url = generateLineAddUrl({ platform: 'x', topic: 'claude-code' })
    const parsed = new URL(url)
    expect(parsed.searchParams.get('utm_content')).toBe('claude-code')
  })

  it('includes redirect parameter pointing to LINE friend add URL', () => {
    const url = generateLineAddUrl({ platform: 'x' })
    const parsed = new URL(url)
    const redirect = parsed.searchParams.get('redirect')
    expect(redirect).toContain('https://line.me/R/ti/p/')
  })

  it('uses nands.tech redirect base URL', () => {
    const url = generateLineAddUrl({ platform: 'x' })
    expect(url).toContain('https://nands.tech/api/cortex/line-redirect')
  })
})

describe('embedLineCTA', () => {
  it('adds CTA to posts longer than 200 characters', () => {
    const longPost = 'A'.repeat(201)
    const result = embedLineCTA(longPost, 'x')
    expect(result).toContain('LINEで最新AI情報を受け取る')
    expect(result.length).toBeGreaterThan(longPost.length)
  })

  it('does not modify posts shorter than 200 characters', () => {
    const shortPost = 'This is a short post about AI.'
    const result = embedLineCTA(shortPost, 'x')
    expect(result).toBe(shortPost)
  })

  it('does not modify posts with exactly 199 characters', () => {
    const post = 'A'.repeat(199)
    const result = embedLineCTA(post, 'x')
    expect(result).toBe(post)
  })

  it('adds CTA to posts with exactly 200 characters', () => {
    const post = 'A'.repeat(200)
    const result = embedLineCTA(post, 'x')
    // 200 chars is not < 200, so CTA IS added (boundary: >= 200 gets CTA)
    expect(result).toContain('LINE')
    expect(result).not.toBe(post)
  })

  it('adds CTA to posts with 201 characters', () => {
    const post = 'A'.repeat(201)
    const result = embedLineCTA(post, 'x')
    expect(result).toContain('LINE')
    expect(result).not.toBe(post)
  })

  it('includes platform-specific tracking in CTA URL', () => {
    const longPost = 'A'.repeat(250)
    const result = embedLineCTA(longPost, 'linkedin')
    expect(result).toContain('utm_source=linkedin')
  })

  it('includes sns_funnel campaign in CTA URL', () => {
    const longPost = 'A'.repeat(250)
    const result = embedLineCTA(longPost, 'x')
    expect(result).toContain('utm_campaign=sns_funnel')
  })
})
