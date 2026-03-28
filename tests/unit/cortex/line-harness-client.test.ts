import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@line-harness/sdk', () => ({
  LineHarness: vi.fn().mockImplementation((config) => ({
    friends: {},
    tags: {},
    scenarios: {},
    broadcasts: {},
    richMenus: {},
    trackedLinks: {},
    forms: {},
    adPlatforms: {},
    staff: {},
    _config: config,
  })),
}))

// Must import after mock declaration
const { getLineHarnessClient, isLineHarnessConfigured, getLineHarnessClientSafe } =
  await import('@/lib/cortex/line-harness/client')

describe('LINE Harness Client', () => {
  beforeEach(() => {
    // Reset the cached singleton between tests
    vi.resetModules()
    delete process.env.LINE_HARNESS_API_URL
    delete process.env.LINE_HARNESS_API_KEY
    delete process.env.LINE_HARNESS_ACCOUNT_ID
  })

  describe('getLineHarnessClient', () => {
    it('throws when env vars not set', () => {
      expect(() => getLineHarnessClient()).toThrow(
        'LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY are required',
      )
    })

    it('returns LineHarness instance when configured', async () => {
      process.env.LINE_HARNESS_API_URL = 'https://api.line-harness.test'
      process.env.LINE_HARNESS_API_KEY = 'test-api-key'
      process.env.LINE_HARNESS_ACCOUNT_ID = 'test-account'

      // Re-import to get a fresh module with no cached instance
      const { getLineHarnessClient: freshGet } = await import(
        '@/lib/cortex/line-harness/client'
      )

      const client = freshGet()
      expect(client).toBeDefined()
      expect(client._config).toEqual({
        apiUrl: 'https://api.line-harness.test',
        apiKey: 'test-api-key',
        lineAccountId: 'test-account',
        timeout: 10000,
      })
    })
  })

  describe('isLineHarnessConfigured', () => {
    it('returns false without env vars', () => {
      expect(isLineHarnessConfigured()).toBe(false)
    })

    it('returns true with env vars', () => {
      process.env.LINE_HARNESS_API_URL = 'https://api.line-harness.test'
      process.env.LINE_HARNESS_API_KEY = 'test-api-key'

      expect(isLineHarnessConfigured()).toBe(true)
    })

    it('returns false when only API URL is set', () => {
      process.env.LINE_HARNESS_API_URL = 'https://api.line-harness.test'

      expect(isLineHarnessConfigured()).toBe(false)
    })

    it('returns false when only API key is set', () => {
      process.env.LINE_HARNESS_API_KEY = 'test-api-key'

      expect(isLineHarnessConfigured()).toBe(false)
    })
  })

  describe('getLineHarnessClientSafe', () => {
    it('returns null without env vars', () => {
      const client = getLineHarnessClientSafe()
      expect(client).toBeNull()
    })

    it('returns client instance when configured', async () => {
      process.env.LINE_HARNESS_API_URL = 'https://api.line-harness.test'
      process.env.LINE_HARNESS_API_KEY = 'test-api-key'

      const { getLineHarnessClientSafe: freshGetSafe } = await import(
        '@/lib/cortex/line-harness/client'
      )

      const client = freshGetSafe()
      expect(client).not.toBeNull()
      expect(client).toBeDefined()
    })
  })

  describe('Singleton pattern', () => {
    it('returns same instance on multiple calls', async () => {
      process.env.LINE_HARNESS_API_URL = 'https://api.line-harness.test'
      process.env.LINE_HARNESS_API_KEY = 'test-api-key'

      const { getLineHarnessClient: freshGet } = await import(
        '@/lib/cortex/line-harness/client'
      )

      const client1 = freshGet()
      const client2 = freshGet()

      expect(client1).toBe(client2)
    })
  })
})
