import { LineHarness } from '@line-harness/sdk'

let cached: LineHarness | null = null

export function getLineHarnessClient(): LineHarness {
  if (cached) return cached

  const apiUrl = process.env.LINE_HARNESS_API_URL
  const apiKey = process.env.LINE_HARNESS_API_KEY

  if (!apiUrl || !apiKey) {
    throw new Error('LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY are required')
  }

  cached = new LineHarness({
    apiUrl,
    apiKey,
    lineAccountId: process.env.LINE_HARNESS_ACCOUNT_ID,
    timeout: 10000,
  })

  return cached
}

// Check if LINE Harness is configured (env vars present)
export function isLineHarnessConfigured(): boolean {
  return !!(process.env.LINE_HARNESS_API_URL && process.env.LINE_HARNESS_API_KEY)
}

// Safe wrapper - returns null instead of throwing when not configured
export function getLineHarnessClientSafe(): LineHarness | null {
  try {
    return getLineHarnessClient()
  } catch {
    return null
  }
}
