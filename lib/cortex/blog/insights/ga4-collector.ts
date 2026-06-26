/**
 * GA4 (Analytics Data API v1beta) daily collector. Fetches /posts/* traffic &
 * engagement and upserts into `ga4_page_metrics`. Read-only via service account.
 * Requires GA4_PROPERTY_ID (numeric) + the SA added as a Viewer on the property.
 */

import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'
import { getGoogleAuth, hasGoogleCredentials, GA4_SCOPE } from './google-auth'
import type { Ga4PageMetric } from './types'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function targetDate(daysAgo = 1): string {
  return new Date(Date.now() - daysAgo * 864e5).toISOString().slice(0, 10)
}

export async function collectGa4(daysAgo = 1): Promise<{ pages: number; date: string; error?: string }> {
  const date = targetDate(daysAgo)
  const propertyId = process.env.GA4_PROPERTY_ID
  if (!hasGoogleCredentials() || !propertyId) {
    return { pages: 0, date, error: 'GSC_CREDENTIALS_JSON / GA4_PROPERTY_ID 未設定' }
  }
  const sb = getSupabase()
  if (!sb) return { pages: 0, date, error: 'Supabase 未設定' }

  try {
    const auth = getGoogleAuth([GA4_SCOPE])
    const ga = google.analyticsdata({ version: 'v1beta', auth })

    const res = await ga.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: date, endDate: date }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'engagementRate' },
          { name: 'userEngagementDuration' },
        ],
        dimensionFilter: {
          filter: { fieldName: 'pagePath', stringFilter: { matchType: 'CONTAINS', value: '/posts/' } },
        },
        limit: '5000',
      },
    })

    const rows = res.data.rows ?? []
    if (rows.length === 0) {
      process.stdout.write(`[ga4] No data for ${date}\n`)
      return { pages: 0, date }
    }

    let upserted = 0
    for (const r of rows) {
      const path = r.dimensionValues?.[0]?.value ?? ''
      if (!path.startsWith('/posts/')) continue
      const m = (r.metricValues ?? []).map((v) => Number(v.value ?? 0))
      const sessions = m[0] ?? 0
      const engaged = m[1] ?? 0
      const rate = m[2] ?? 0
      const engDuration = m[3] ?? 0
      const row: Ga4PageMetric = {
        page_path: path,
        date,
        sessions,
        engaged_sessions: engaged,
        engagement_rate: rate,
        avg_engagement_time: sessions > 0 ? engDuration / sessions : 0,
        conversions: 0,
      }
      const { error } = await sb.from('ga4_page_metrics').upsert(row, { onConflict: 'page_path,date' })
      if (error) process.stdout.write(`[ga4] upsert ${path} failed: ${error.message}\n`)
      else upserted++
    }

    process.stdout.write(`[ga4] ${upserted} pages for ${date}\n`)
    return { pages: upserted, date }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    process.stdout.write(`[ga4] error: ${msg}\n`)
    return { pages: 0, date, error: msg }
  }
}
