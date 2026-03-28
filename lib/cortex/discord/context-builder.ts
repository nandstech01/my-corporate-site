/**
 * CORTEX Context Builder
 *
 * Assembles a full CortexContext from multiple data sources
 * for use in Discord/LINE intelligence layer.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  CortexContext,
  CortexPlatformRule,
  CortexViralAnalysis,
  CortexTemporalPattern,
  PatternPerformanceSummary,
  TrendSummary,
  RecentPostSummary,
  Platform,
} from '../types'

// ============================================================
// Supabase Client
// ============================================================

let cachedSupabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (cachedSupabase) return cachedSupabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  cachedSupabase = createClient(url, key)
  return cachedSupabase
}

/** Alias for LINE integration compatibility */
export const getSupabaseAdmin = getSupabase

// ============================================================
// Day-of-week label helper
// ============================================================

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function dayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] ?? `Day${dayOfWeek}`
}

// ============================================================
// Data Fetchers
// ============================================================

async function fetchPlatformRules(
  platform?: Platform,
): Promise<readonly CortexPlatformRule[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('cortex_platform_rules')
    .select('*')
    .is('deprecated_at', null)
    .order('confidence', { ascending: false })

  if (platform) {
    query = query.eq('platform', platform)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch platform rules: ${error.message}`)
  }

  return (data ?? []) as readonly CortexPlatformRule[]
}

async function fetchViralInsights(
  platform?: string,
): Promise<readonly CortexViralAnalysis[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('cortex_viral_analysis')
    .select('*')
    .gte('analyzed_at', since)
    .order('replicability_score', { ascending: false })
    .limit(20)

  if (platform) {
    query = query.eq('platform', platform)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch viral analysis: ${error.message}`)
  }

  return (data ?? []) as readonly CortexViralAnalysis[]
}

async function fetchTemporalPatterns(
  platform?: string,
): Promise<readonly CortexTemporalPattern[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('cortex_temporal_patterns')
    .select('*')
    .order('recommendation_score', { ascending: false })

  if (platform) {
    query = query.eq('platform', platform)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch temporal patterns: ${error.message}`)
  }

  return (data ?? []) as readonly CortexTemporalPattern[]
}

async function fetchPatternPerformance(
  platform?: string,
): Promise<readonly PatternPerformanceSummary[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('pattern_performance')
    .select('pattern_id, platform, successes, failures, total_uses, avg_engagement')
    .order('avg_engagement', { ascending: false })

  if (platform) {
    query = query.eq('platform', platform)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch pattern performance: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    pattern_id: row.pattern_id as string,
    platform: row.platform as string,
    successes: (row.successes as number) ?? 0,
    failures: (row.failures as number) ?? 0,
    total_uses: (row.total_uses as number) ?? 0,
    avg_engagement: (row.avg_engagement as number) ?? 0,
    success_rate:
      (row.total_uses as number) > 0
        ? (row.successes as number) / (row.total_uses as number)
        : 0,
  })) as readonly PatternPerformanceSummary[]
}

async function fetchRecentTrends(): Promise<readonly TrendSummary[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('slack_bot_memory')
    .select('content, context, created_at')
    .eq('memory_type', 'trending_topics')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    throw new Error(`Failed to fetch recent trends: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    content: row.content as string,
    context: (row.context as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  })) as readonly TrendSummary[]
}

async function fetchRecentPosts(
  platform?: string,
): Promise<readonly RecentPostSummary[]> {
  const supabase = getSupabase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRows = (rows: any[], plat: string): RecentPostSummary[] =>
    rows.map((row) => ({
      post_text: row.post_text as string,
      platform: plat,
      posted_at: row.posted_at as string,
      likes: (row.likes as number) ?? 0,
      impressions: (row.impressions ?? row.views ?? 0) as number,
      engagement_rate: (row.engagement_rate as number) ?? 0,
      pattern_used: (row.pattern_used as string) ?? null,
    }))

  if (platform === 'linkedin') {
    const { data } = await supabase
      .from('linkedin_post_analytics')
      .select('post_text, posted_at, likes, impressions, engagement_rate, pattern_used')
      .order('posted_at', { ascending: false })
      .limit(20)
    return mapRows(data ?? [], 'linkedin')
  }

  if (platform === 'threads') {
    const { data } = await supabase
      .from('threads_post_analytics')
      .select('post_text, posted_at, likes, views, engagement_rate, pattern_used')
      .order('posted_at', { ascending: false })
      .limit(20)
    return mapRows(data ?? [], 'threads')
  }

  if (platform === 'x') {
    const { data } = await supabase
      .from('x_post_analytics')
      .select('post_text, posted_at, likes, impressions, engagement_rate, pattern_used')
      .order('posted_at', { ascending: false })
      .limit(20)
    return mapRows(data ?? [], 'x')
  }

  // No platform specified: query all 3 and merge
  const [xRes, liRes, thRes] = await Promise.all([
    supabase.from('x_post_analytics')
      .select('post_text, posted_at, likes, impressions, engagement_rate, pattern_used')
      .order('posted_at', { ascending: false }).limit(10),
    supabase.from('linkedin_post_analytics')
      .select('post_text, posted_at, likes, impressions, engagement_rate, pattern_used')
      .order('posted_at', { ascending: false }).limit(10),
    supabase.from('threads_post_analytics')
      .select('post_text, posted_at, likes, views, engagement_rate, pattern_used')
      .order('posted_at', { ascending: false }).limit(10),
  ])

  const all = [
    ...mapRows(xRes.data ?? [], 'x'),
    ...mapRows(liRes.data ?? [], 'linkedin'),
    ...mapRows(thRes.data ?? [], 'threads'),
  ].sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())

  return all.slice(0, 20)
}

// ============================================================
// Main: Build CORTEX Context
// ============================================================

export async function buildCortexContext(
  platform?: Platform,
): Promise<CortexContext> {
  const [
    platformRules,
    viralInsights,
    temporalPatterns,
    patternPerformance,
    recentTrends,
    recentPosts,
  ] = await Promise.all([
    fetchPlatformRules(platform),
    fetchViralInsights(platform),
    fetchTemporalPatterns(platform),
    fetchPatternPerformance(platform),
    fetchRecentTrends(),
    fetchRecentPosts(platform),
  ])

  return {
    platformRules: [...platformRules],
    viralInsights: [...viralInsights],
    temporalPatterns: [...temporalPatterns],
    patternPerformance: [...patternPerformance],
    recentTrends: [...recentTrends],
    recentPosts: [...recentPosts],
  }
}

// ============================================================
// Context Summary (for LLM consumption)
// ============================================================

export function buildContextSummary(context: CortexContext): string {
  const sections: string[] = []

  // --- Platform Rules ---
  sections.push('## Platform Rules')
  if (context.platformRules.length === 0) {
    sections.push('No platform rules loaded.\n')
  } else {
    context.platformRules.forEach((rule) => {
      const verified = rule.verified_by_data ? ' [DATA-VERIFIED]' : ''
      const source = rule.source_type ? ` (${rule.source_type})` : ''
      sections.push(
        `- **${rule.platform}/${rule.rule_category}**: ${rule.rule_title}${verified}${source}`,
      )
      sections.push(`  ${rule.rule_description} (confidence: ${rule.confidence})`)
    })
    sections.push('')
  }

  // --- Viral Insights ---
  sections.push('## Viral Insights (30 days)')
  if (context.viralInsights.length === 0) {
    sections.push('No viral analysis data available.\n')
  } else {
    context.viralInsights.forEach((insight) => {
      const engRate = (insight.engagement_rate * 100).toFixed(2)
      sections.push(
        `- **${insight.platform}** | hook: ${insight.hook_type ?? 'unknown'} | structure: ${insight.structure_type ?? 'unknown'} | replicability: ${insight.replicability_score ?? 'N/A'}`,
      )
      sections.push(
        `  ${insight.likes} likes, ${insight.impressions} impressions (${engRate}% ER) | buzz factor: ${insight.primary_buzz_factor ?? 'unknown'}`,
      )
      if (insight.anti_patterns && insight.anti_patterns.length > 0) {
        sections.push(`  Anti-patterns: ${insight.anti_patterns.join(', ')}`)
      }
    })
    sections.push('')
  }

  // --- Best Posting Times ---
  sections.push('## Best Posting Times')
  if (context.temporalPatterns.length === 0) {
    sections.push('No temporal pattern data available.\n')
  } else {
    const topSlots = context.temporalPatterns.slice(0, 10)
    topSlots.forEach((slot) => {
      const day = dayLabel(slot.day_of_week)
      const avgER = (slot.avg_engagement_rate * 100).toFixed(2)
      const ci = `95% CI: [${(slot.confidence_interval_lower * 100).toFixed(2)}%, ${(slot.confidence_interval_upper * 100).toFixed(2)}%]`
      sections.push(
        `- **${slot.platform}** ${day} ${slot.hour_jst}:00 JST | avg ER: ${avgER}% | samples: ${slot.sample_count} | ${ci}`,
      )
    })
    sections.push('')
  }

  // --- Pattern Performance ---
  sections.push('## Pattern Performance')
  if (context.patternPerformance.length === 0) {
    sections.push('No pattern performance data available.\n')
  } else {
    context.patternPerformance.forEach((pp) => {
      const successRate = (pp.success_rate * 100).toFixed(1)
      const avgEng = pp.avg_engagement.toFixed(4)
      sections.push(
        `- **${pp.pattern_id}** (${pp.platform}): ${successRate}% success (${pp.successes}/${pp.total_uses}) | avg engagement: ${avgEng}`,
      )
    })
    sections.push('')
  }

  // --- Recent Trends ---
  sections.push('## Recent Trends')
  if (context.recentTrends.length === 0) {
    sections.push('No recent trend data available.\n')
  } else {
    context.recentTrends.forEach((trend) => {
      const date = trend.created_at.slice(0, 10)
      sections.push(`- [${date}] ${trend.content}`)
    })
    sections.push('')
  }

  // --- Recent Post Performance ---
  sections.push('## Recent Post Performance')
  if (context.recentPosts.length === 0) {
    sections.push('No recent post data available.\n')
  } else {
    context.recentPosts.forEach((post) => {
      const date = post.posted_at?.slice(0, 10) ?? 'unknown'
      const engRate = (post.engagement_rate * 100).toFixed(2)
      const preview = post.post_text.slice(0, 60).replace(/\n/g, ' ')
      const pattern = post.pattern_used ? ` | pattern: ${post.pattern_used}` : ''
      sections.push(
        `- [${date}] "${preview}..." | ${post.likes} likes, ${post.impressions} imp (${engRate}% ER)${pattern}`,
      )
    })
    sections.push('')
  }

  return sections.join('\n')
}
