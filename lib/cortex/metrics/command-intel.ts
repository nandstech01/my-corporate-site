/**
 * Command-center "brain" intel (Phase 1): cron health, next-action, and the
 * fastest-in-Japan official Claude Code news signal. Read-only over Supabase +
 * a light GitHub changelog fetch. Safe to call from a (cached) API route.
 *
 *  - cronHealth:     per-channel last-success derived from source-table timestamps
 *                    vs the job schedule → healthy / stale / unknown.
 *  - nextAction:     top SEO opportunity (computeSeoInsights) + pending-post count.
 *  - claudeCodeNews: latest official CHANGELOG version, with an `isNew` flag that
 *                    stays true for ~24h after a new version first appears
 *                    (persisted in cortex_kv across invocations).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { fetchChangelog } from '../knowledge/claude-code-watcher'
import { computeSeoInsights } from '../blog/insights/seo-insights'

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export interface CronJob {
  readonly name: string
  readonly label: string
  readonly lastSuccess: string | null
  readonly ageHours: number | null
  readonly status: 'healthy' | 'stale' | 'unknown'
}

export interface CommandIntel {
  readonly cronHealth: CronJob[]
  readonly nextAction: {
    topOpportunity: { kind: string; query: string; reason: string; score: number } | null
    pendingPosts: number
    demandQueries: string[]
  }
  readonly claudeCodeNews: {
    version: string | null
    title: string
    summary: string
    sourceUrl: string
    isNew: boolean
  } | null
  readonly generatedAt: string
}

const HOUR = 3600_000

/** Tracked channels → which table/column proves the job ran, and the staleness budget. */
const TRACKED: ReadonlyArray<{
  name: string; label: string; table: string; col: string; isDate?: boolean; budgetH: number
}> = [
  { name: 'x', label: 'X 自動投稿', table: 'x_post_analytics', col: 'posted_at', budgetH: 30 },
  { name: 'threads', label: 'Threads', table: 'threads_post_analytics', col: 'posted_at', budgetH: 30 },
  { name: 'blog', label: 'ブログ公開', table: 'posts', col: 'published_at', budgetH: 84 },
  { name: 'crosspost', label: 'クロス投稿', table: 'cross_post_analytics', col: 'posted_at', budgetH: 84 },
  // GSC reports data with a ~2-3 day lag, so max(date) trails even when healthy.
  { name: 'seo', label: 'SEO収集', table: 'gsc_page_metrics', col: 'date', isDate: true, budgetH: 120 },
]

async function lastTs(sb: SupabaseClient, table: string, col: string, isDate?: boolean): Promise<string | null> {
  try {
    const { data, error } = await sb.from(table).select(col).not(col, 'is', null).order(col, { ascending: false }).limit(1)
    if (error || !data || !data[0]) return null
    const raw = (data[0] as Record<string, unknown>)[col]
    if (!raw) return null
    return isDate ? new Date(`${String(raw)}T00:00:00Z`).toISOString() : String(raw)
  } catch {
    return null
  }
}

async function computeCronHealth(sb: SupabaseClient): Promise<CronJob[]> {
  const now = Date.now()
  const jobs = await Promise.all(
    TRACKED.map(async (t): Promise<CronJob> => {
      const ts = await lastTs(sb, t.table, t.col, t.isDate)
      if (!ts) return { name: t.name, label: t.label, lastSuccess: null, ageHours: null, status: 'unknown' }
      const ageHours = Math.max(0, (now - new Date(ts).getTime()) / HOUR)
      return {
        name: t.name, label: t.label, lastSuccess: ts,
        ageHours: Math.round(ageHours),
        status: ageHours <= t.budgetH ? 'healthy' : 'stale',
      }
    }),
  )
  return jobs
}

async function computeNextAction(sb: SupabaseClient): Promise<CommandIntel['nextAction']> {
  const [insights, pending] = await Promise.all([
    computeSeoInsights().catch(() => ({ opportunities: [], demandQueries: [], generatedAt: '' })),
    sb.from('cortex_pending_posts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])
  const top = insights.opportunities?.[0]
  return {
    topOpportunity: top
      ? { kind: top.kind, query: top.query, reason: top.reason, score: top.score }
      : null,
    pendingPosts: pending.count ?? 0,
    demandQueries: (insights.demandQueries ?? []).slice(0, 4),
  }
}

async function computeClaudeCodeNews(sb: SupabaseClient): Promise<CommandIntel['claudeCodeNews']> {
  let latest
  try {
    const cl = await fetchChangelog(1)
    latest = cl?.[0]
  } catch {
    latest = undefined
  }
  if (!latest) return null

  // Persisted last-seen version → isNew stays true for ~24h after a new version appears.
  let firstSeenAt = new Date().toISOString()
  try {
    const { data } = await sb.from('cortex_kv').select('value').eq('key', 'cc_last_version').limit(1)
    const stored = data?.[0]?.value as { version?: string; firstSeenAt?: string } | undefined
    if (stored?.version === latest.version && stored?.firstSeenAt) {
      firstSeenAt = stored.firstSeenAt
    } else {
      await sb.from('cortex_kv').upsert({
        key: 'cc_last_version',
        value: { version: latest.version, firstSeenAt },
        updated_at: new Date().toISOString(),
      })
    }
  } catch {
    /* best-effort: if KV unavailable, treat as not-new to avoid false alerts */
  }
  const isNew = Date.now() - new Date(firstSeenAt).getTime() < 24 * HOUR

  return {
    version: latest.version,
    title: latest.title,
    summary: latest.summary,
    sourceUrl: latest.sourceUrl,
    isNew,
  }
}

export async function computeCommandIntel(): Promise<CommandIntel> {
  const generatedAt = new Date().toISOString()
  const sb = getSupabase()
  if (!sb) {
    return { cronHealth: [], nextAction: { topOpportunity: null, pendingPosts: 0, demandQueries: [] }, claudeCodeNews: null, generatedAt }
  }
  const [cronHealth, nextAction, claudeCodeNews] = await Promise.all([
    computeCronHealth(sb),
    computeNextAction(sb),
    computeClaudeCodeNews(sb),
  ])
  return { cronHealth, nextAction, claudeCodeNews, generatedAt }
}
