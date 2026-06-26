/**
 * Command-center metrics aggregation (司令塔ページ用).
 * Returns today's auto-post count, views (GA4 sessions + GSC impressions),
 * inquiry count, plus 7-day daily series for charts. All JST-bucketed.
 * Read-only over Supabase. Safe to call from an API route.
 */

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

const DAY = 864e5
function jstDay(iso: string | null): string {
  if (!iso) return ''
  return new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 10)
}
function todayJst(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10)
}
function last7Days(): string[] {
  const out: string[] = []
  const base = Date.now() + 9 * 3600_000
  for (let i = 6; i >= 0; i--) out.push(new Date(base - i * DAY).toISOString().slice(0, 10))
  return out
}

export interface CommandMetrics {
  readonly today: string
  readonly postsToday: { total: number; x: number; threads: number; blog: number; crosspost: number }
  readonly viewsLatest: { date: string; ga4Sessions: number; gscImpressions: number; gscClicks: number; total: number }
  readonly inquiriesToday: number
  readonly series: {
    days: string[]
    posts: number[]
    views: number[] // GA4 sessions + GSC impressions per day
    inquiries: number[]
  }
  readonly totals7d: { posts: number; views: number; inquiries: number }
  readonly generatedAt: string
}

function bucketByDay(rows: { ts: string | null }[], days: string[]): number[] {
  const map = new Map(days.map((d) => [d, 0]))
  for (const r of rows) {
    const d = jstDay(r.ts)
    if (map.has(d)) map.set(d, (map.get(d) ?? 0) + 1)
  }
  return days.map((d) => map.get(d) ?? 0)
}

export async function computeCommandMetrics(): Promise<CommandMetrics> {
  const generatedAt = new Date().toISOString()
  const today = todayJst()
  const days = last7Days()
  const sinceISO = new Date(Date.now() - 8 * DAY).toISOString()
  const sinceDate = days[0]

  const empty: CommandMetrics = {
    today,
    postsToday: { total: 0, x: 0, threads: 0, blog: 0, crosspost: 0 },
    viewsLatest: { date: '', ga4Sessions: 0, gscImpressions: 0, gscClicks: 0, total: 0 },
    inquiriesToday: 0,
    series: { days, posts: [0,0,0,0,0,0,0], views: [0,0,0,0,0,0,0], inquiries: [0,0,0,0,0,0,0] },
    totals7d: { posts: 0, views: 0, inquiries: 0 },
    generatedAt,
  }
  const sb = getSupabase()
  if (!sb) return empty

  // Posts (last ~8d) across platforms
  const [xR, thR, blogR, cpR, gaR, gscR, inqR] = await Promise.all([
    sb.from('x_post_analytics').select('posted_at').gte('posted_at', sinceISO),
    sb.from('threads_post_analytics').select('posted_at').gte('posted_at', sinceISO),
    sb.from('posts').select('published_at').eq('status', 'published').gte('published_at', sinceISO),
    sb.from('cross_post_analytics').select('posted_at,status').eq('status', 'posted').gte('posted_at', sinceISO),
    sb.from('ga4_page_metrics').select('date,sessions').gte('date', sinceDate),
    sb.from('gsc_page_metrics').select('date,impressions,clicks').gte('date', sinceDate),
    sb.from('inquiries').select('created_at').gte('created_at', sinceISO),
  ])

  const xRows = (xR.data ?? []).map((r) => ({ ts: r.posted_at as string }))
  const thRows = (thR.data ?? []).map((r) => ({ ts: r.posted_at as string }))
  const blogRows = (blogR.data ?? []).map((r) => ({ ts: r.published_at as string }))
  const cpRows = (cpR.data ?? []).map((r) => ({ ts: r.posted_at as string }))
  const inqRows = (inqR.data ?? []).map((r) => ({ ts: r.created_at as string }))

  // Per-day post counts (sum of all platforms)
  const xByDay = bucketByDay(xRows, days)
  const thByDay = bucketByDay(thRows, days)
  const blogByDay = bucketByDay(blogRows, days)
  const cpByDay = bucketByDay(cpRows, days)
  const postsByDay = days.map((_, i) => xByDay[i] + thByDay[i] + blogByDay[i] + cpByDay[i])
  const inquiriesByDay = bucketByDay(inqRows, days)

  // Views per day = GA4 sessions + GSC impressions
  const gaByDay = new Map(days.map((d) => [d, 0]))
  for (const r of gaR.data ?? []) { const d = r.date as string; if (gaByDay.has(d)) gaByDay.set(d, (gaByDay.get(d) ?? 0) + (Number(r.sessions) || 0)) }
  const gscImpByDay = new Map(days.map((d) => [d, 0]))
  const gscClkByDay = new Map(days.map((d) => [d, 0]))
  for (const r of gscR.data ?? []) {
    const d = r.date as string
    if (gscImpByDay.has(d)) gscImpByDay.set(d, (gscImpByDay.get(d) ?? 0) + (Number(r.impressions) || 0))
    if (gscClkByDay.has(d)) gscClkByDay.set(d, (gscClkByDay.get(d) ?? 0) + (Number(r.clicks) || 0))
  }
  const viewsByDay = days.map((d) => (gaByDay.get(d) ?? 0) + (gscImpByDay.get(d) ?? 0))

  // viewsLatest = most recent day that has any GA4/GSC data
  let viewsLatest = empty.viewsLatest
  for (let i = days.length - 1; i >= 0; i--) {
    const d = days[i]
    const ga = gaByDay.get(d) ?? 0
    const imp = gscImpByDay.get(d) ?? 0
    if (ga > 0 || imp > 0) {
      viewsLatest = { date: d, ga4Sessions: ga, gscImpressions: imp, gscClicks: gscClkByDay.get(d) ?? 0, total: ga + imp }
      break
    }
  }

  const idxToday = days.indexOf(today)
  const at = (arr: number[]) => (idxToday >= 0 ? arr[idxToday] : 0)

  return {
    today,
    postsToday: {
      total: at(postsByDay), x: at(xByDay), threads: at(thByDay), blog: at(blogByDay), crosspost: at(cpByDay),
    },
    viewsLatest,
    inquiriesToday: at(inquiriesByDay),
    series: { days, posts: postsByDay, views: viewsByDay, inquiries: inquiriesByDay },
    totals7d: {
      posts: postsByDay.reduce((a, b) => a + b, 0),
      views: viewsByDay.reduce((a, b) => a + b, 0),
      inquiries: inquiriesByDay.reduce((a, b) => a + b, 0),
    },
    generatedAt,
  }
}
