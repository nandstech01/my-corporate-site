/**
 * GSC (Google Search Console) daily collector — TS port of the Python
 * blog-worker collector. Fetches /posts/* [page, query] metrics and upserts
 * into the existing `gsc_page_metrics` table (page_path,date,clicks,impressions,
 * ctr,position,queries[]). Read-only API via service account.
 */

import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'
import { getGoogleAuth, hasGoogleCredentials, GSC_SCOPE, SITE_URL } from './google-auth'
import type { GscPageMetric, GscQueryRow } from './types'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/** YYYY-MM-DD for N days ago (GSC has ~2-3 day lag → default 3). */
function targetDate(daysAgo = 3): string {
  return new Date(Date.now() - daysAgo * 864e5).toISOString().slice(0, 10)
}

export async function collectGsc(daysAgo = 3): Promise<{ pages: number; date: string; error?: string }> {
  const date = targetDate(daysAgo)
  if (!hasGoogleCredentials()) {
    return { pages: 0, date, error: 'GSC_CREDENTIALS_JSON 未設定' }
  }
  const sb = getSupabase()
  if (!sb) return { pages: 0, date, error: 'Supabase 未設定' }

  try {
    const auth = getGoogleAuth([GSC_SCOPE])
    const sc = google.searchconsole({ version: 'v1', auth })

    const res = await sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: date,
        endDate: date,
        dimensions: ['page', 'query'],
        dimensionFilterGroups: [
          { filters: [{ dimension: 'page', operator: 'contains', expression: '/posts/' }] },
        ],
        rowLimit: 5000,
      },
    })

    const rows = res.data.rows ?? []
    if (rows.length === 0) {
      process.stdout.write(`[gsc] No data for ${date}\n`)
      return { pages: 0, date }
    }

    // Group by page path
    const byPage = new Map<string, GscPageMetric & { _posSum: number }>()
    for (const r of rows) {
      const pageUrl = r.keys?.[0] ?? ''
      const query = r.keys?.[1] ?? ''
      // Works for both domain (sc-domain:) and URL-prefix properties:
      // the `page` dimension is always a full URL → take the pathname.
      let path: string
      try { path = new URL(pageUrl).pathname } catch { path = pageUrl.replace(SITE_URL, '') }
      if (!path.startsWith('/posts/')) continue

      const cur =
        byPage.get(path) ??
        ({ page_path: path, date, clicks: 0, impressions: 0, ctr: 0, position: 0, queries: [] as GscQueryRow[], _posSum: 0 })
      const imp = r.impressions ?? 0
      cur.clicks += r.clicks ?? 0
      ;(cur as GscPageMetric).impressions += imp
      cur._posSum += (r.position ?? 0) * (imp || 1)
      cur.queries.push({ query, clicks: r.clicks ?? 0, impressions: imp, ctr: r.ctr ?? 0, position: r.position ?? 0 })
      byPage.set(path, cur)
    }

    let upserted = 0
    for (const [, pd] of byPage) {
      const totalImp = pd.impressions || 1
      const row: GscPageMetric = {
        page_path: pd.page_path,
        date: pd.date,
        clicks: pd.clicks,
        impressions: pd.impressions,
        ctr: pd.clicks / totalImp,
        position: pd._posSum / totalImp,
        queries: pd.queries.sort((a, b) => b.clicks - a.clicks).slice(0, 20),
      }
      const { error } = await sb.from('gsc_page_metrics').upsert(row, { onConflict: 'page_path,date' })
      if (error) process.stdout.write(`[gsc] upsert ${pd.page_path} failed: ${error.message}\n`)
      else upserted++
    }

    process.stdout.write(`[gsc] ${upserted} pages for ${date}\n`)
    return { pages: upserted, date }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    process.stdout.write(`[gsc] error: ${msg}\n`)
    return { pages: 0, date, error: msg }
  }
}
