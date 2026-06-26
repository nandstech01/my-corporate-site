/**
 * Compute data-driven SEO & demand-prediction opportunities from accumulated
 * GSC (+ GA4) metrics. Gracefully returns empty insights when no data yet.
 */

import { createClient } from '@supabase/supabase-js'
import type { GscQueryRow, SeoInsights, SeoOpportunity } from './types'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

interface QueryAgg {
  query: string
  impressions: number
  clicks: number
  posSum: number // impression-weighted
  pagePath: string | null
  recentImp: number // last 7d
  priorImp: number // 7-14d ago
}

// Small-site calibrated. Raise these as traffic grows. (Override with SEO_MIN_IMP.)
const MIN_IMP = Number(process.env.SEO_MIN_IMP || 3)

export async function computeSeoInsights(): Promise<SeoInsights> {
  const generatedAt = new Date().toISOString()
  const sb = getSupabase()
  if (!sb) return { opportunities: [], demandQueries: [], generatedAt }

  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)
  const { data, error } = await sb
    .from('gsc_page_metrics')
    .select('page_path,date,queries')
    .gte('date', since)
  if (error || !data || data.length === 0) {
    return { opportunities: [], demandQueries: [], generatedAt }
  }

  const sevenAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)
  const agg = new Map<string, QueryAgg>()

  for (const row of data) {
    const path = row.page_path as string
    const date = row.date as string
    const queries = (row.queries as GscQueryRow[] | null) ?? []
    for (const q of queries) {
      const cur =
        agg.get(q.query) ??
        ({ query: q.query, impressions: 0, clicks: 0, posSum: 0, pagePath: path, recentImp: 0, priorImp: 0 } as QueryAgg)
      cur.impressions += q.impressions
      cur.clicks += q.clicks
      cur.posSum += q.position * (q.impressions || 1)
      if (date >= sevenAgo) cur.recentImp += q.impressions
      else cur.priorImp += q.impressions
      // keep the page with most impressions as representative
      if (q.impressions > 0 && (!cur.pagePath || cur.impressions === q.impressions)) cur.pagePath = path
      agg.set(q.query, cur)
    }
  }

  const opportunities: SeoOpportunity[] = []
  for (const a of agg.values()) {
    if (a.impressions < MIN_IMP) continue
    const position = a.posSum / (a.impressions || 1)
    const ctr = a.clicks / (a.impressions || 1)

    // strike-distance: 5〜20位 = あと一押しで上位化
    if (position >= 5 && position <= 20) {
      opportunities.push({
        kind: 'strike_distance', query: a.query, pagePath: a.pagePath,
        impressions: a.impressions, position, ctr,
        score: Math.min(1, (a.impressions / 20) * (1 - Math.abs(position - 8) / 20)),
        reason: `順位${position.toFixed(1)}位・imp${a.impressions}＝上位化の好機`,
      })
    }
    // low CTR at decent position = タイトル/メタ改善
    if (position <= 10 && ctr < 0.02 && a.impressions >= 8) {
      opportunities.push({
        kind: 'low_ctr', query: a.query, pagePath: a.pagePath,
        impressions: a.impressions, position, ctr,
        score: Math.min(1, a.impressions / 30),
        reason: `順位${position.toFixed(1)}位なのにCTR${(ctr * 100).toFixed(1)}%＝タイトル改善余地`,
      })
    }
    // rising demand = 需要予測（伸びるテーマ）
    if (a.recentImp > a.priorImp * 1.5 && a.recentImp >= 5) {
      opportunities.push({
        kind: 'rising_demand', query: a.query, pagePath: null,
        impressions: a.impressions, position, ctr,
        score: Math.min(1, a.recentImp / 20),
        reason: `直近impが${a.priorImp}→${a.recentImp}に上昇＝需要増`,
      })
    }
  }
  opportunities.sort((x, y) => y.score - x.score)

  // 需要の高いクエリ（トピック計画用）: impression順 + 上昇分を加点
  const demandQueries = [...agg.values()]
    .filter((a) => a.impressions >= MIN_IMP)
    .sort((a, b) => b.impressions + (b.recentImp - b.priorImp) - (a.impressions + (a.recentImp - a.priorImp)))
    .slice(0, 30)
    .map((a) => a.query)

  return { opportunities: opportunities.slice(0, 50), demandQueries, generatedAt }
}
