import { describe, it, expect } from 'vitest'
import crypto from 'crypto'
import { verifyLineSignature } from '../../../lib/cortex/line/webhook-handler'

describe('verifyLineSignature', () => {
  it('returns false when LINE_CHANNEL_SECRET is not set', () => {
    const original = process.env.LINE_CHANNEL_SECRET
    delete process.env.LINE_CHANNEL_SECRET
    expect(verifyLineSignature('body', 'signature')).toBe(false)
    if (original) process.env.LINE_CHANNEL_SECRET = original
  })

  it('returns true for valid signature', () => {
    const secret = 'test-secret-key'
    process.env.LINE_CHANNEL_SECRET = secret
    const body = '{"events":[]}'
    const hash = crypto.createHmac('SHA256', secret).update(body).digest('base64')
    expect(verifyLineSignature(body, hash)).toBe(true)
    delete process.env.LINE_CHANNEL_SECRET
  })

  it('returns false for invalid signature', () => {
    process.env.LINE_CHANNEL_SECRET = 'test-secret-key'
    expect(verifyLineSignature('body', 'invalid-signature')).toBe(false)
    delete process.env.LINE_CHANNEL_SECRET
  })

  it('returns false for tampered body', () => {
    const secret = 'test-secret-key'
    process.env.LINE_CHANNEL_SECRET = secret
    const originalBody = '{"events":[]}'
    const hash = crypto.createHmac('SHA256', secret).update(originalBody).digest('base64')
    // Tampered body should not match the original signature
    expect(verifyLineSignature('{"events":[{"type":"message"}]}', hash)).toBe(false)
    delete process.env.LINE_CHANNEL_SECRET
  })

  it('produces consistent results for same input', () => {
    const secret = 'consistent-secret'
    process.env.LINE_CHANNEL_SECRET = secret
    const body = '{"events":[{"type":"follow"}]}'
    const hash = crypto.createHmac('SHA256', secret).update(body).digest('base64')
    expect(verifyLineSignature(body, hash)).toBe(true)
    expect(verifyLineSignature(body, hash)).toBe(true)
    delete process.env.LINE_CHANNEL_SECRET
  })
})
