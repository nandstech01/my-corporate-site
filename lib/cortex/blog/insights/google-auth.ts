/**
 * Shared Google service-account auth for GSC + GA4 (read-only).
 * Reads GSC_CREDENTIALS_JSON (the service account JSON, same env as the Python
 * blog-worker). Returns a GoogleAuth usable by googleapis clients.
 */

import { google } from 'googleapis'

export const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
export const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'

export function hasGoogleCredentials(): boolean {
  return Boolean(process.env.GSC_CREDENTIALS_JSON?.trim())
}

/** Build a GoogleAuth from the service-account JSON in GSC_CREDENTIALS_JSON. */
export function getGoogleAuth(scopes: readonly string[]) {
  const raw = process.env.GSC_CREDENTIALS_JSON
  if (!raw) throw new Error('GSC_CREDENTIALS_JSON is required (service account JSON)')
  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(raw)
  } catch {
    throw new Error('GSC_CREDENTIALS_JSON is not valid JSON')
  }
  return new google.auth.GoogleAuth({ credentials, scopes: [...scopes] })
}

export const SITE_URL = process.env.GSC_SITE_URL || 'https://nands.tech'
