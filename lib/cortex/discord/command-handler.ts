/**
 * CORTEX Command Handler
 *
 * Handles commands from Discord (Claude Code) with DATA-BACKED responses.
 * Every answer cites specific data from CORTEX tables.
 * This is the "brain" that makes CORTEX unique.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import type {
  Platform,
  CortexPlatformRule,
  CortexViralAnalysis,
  CortexTemporalPattern,
  PatternPerformanceSummary,
  ContentReviewResult,
  TrendResearchResult,
  TemporalRecommendation,
} from '../types'

// ============================================================
// Additional Types
// ============================================================

interface PerformanceReport {
  period: { start: string; end: string }
  platforms: {
    platform: string
    total_posts: number
    avg_engagement_rate: number
    best_post: { text: string; engagement_rate: number }
    worst_post: { text: string; engagement_rate: number }
  }[]
  pattern_analysis: {
    pattern_id: string
    success_rate: number
    trend: 'improving' | 'stable' | 'declining'
  }[]
  timing_analysis: {
    best_slots: { day: number; hour: number; avg_er: number }[]
    worst_slots: { day: number; hour: number; avg_er: number }[]
  }
  ml_health: {
    is_drifted: boolean
    latest_mae: number
  }
  executive_summary: string
  wins: string[]
  improvements: string[]
  next_week_recommendations: string[]
}

interface GuidelineReport {
  platform: string
  active_rules: CortexPlatformRule[]
  recent_changes: CortexPlatformRule[]
  unverified_rules: CortexPlatformRule[]
  summary: string
}

interface PostAnalyticsRow {
  readonly post_text: string
  readonly posted_at: string
  readonly likes: number
  readonly impressions: number
  readonly engagement_rate: number
  readonly pattern_used: string | null
}

interface ModelDriftRow {
  readonly id: string
  readonly mae: number
  readonly is_drifted: boolean
  readonly checked_at: string
}

// ============================================================
// Supabase Client
// ============================================================

let cachedSupabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (cachedSupabase) return cachedSupabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  cachedSupabase = createClient(url, key)
  return cachedSupabase
}

// ============================================================
// Anthropic Client
// ============================================================

let cachedAnthropic: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (cachedAnthropic) return cachedAnthropic

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required')
  }

  cachedAnthropic = new Anthropic({ apiKey })
  return cachedAnthropic
}

// ============================================================
// Helpers
// ============================================================

const LOG_PREFIX = '[command-handler]'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function dayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] ?? `Day${dayOfWeek}`
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function parseJsonFromLLM<T>(text: string): T {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON object found in LLM response')
  }
  return JSON.parse(jsonMatch[0]) as T
}

// ============================================================
// 1. Content Review
// ============================================================

export async function handleContentReview(
  postText: string,
  platform: Platform,
): Promise<ContentReviewResult> {
  const supabase = getSupabase()
  const anthropic = getAnthropic()

  // a. Fetch platform rules (active, matching platform)
  const { data: rulesData, error: rulesError } = await supabase
    .from('cortex_platform_rules')
    .select('*')
    .eq('platform', platform)
    .is('deprecated_at', null)
    .order('confidence', { ascending: false })

  if (rulesError) {
    throw new Error(`Failed to fetch platform rules: ${rulesError.message}`)
  }

  const rules = (rulesData ?? []) as CortexPlatformRule[]

  // b. Fetch similar viral analyses (same platform, last 30 days)
  const { data: viralData, error: viralError } = await supabase
    .from('cortex_viral_analysis')
    .select('*')
    .eq('platform', platform)
    .gte('analyzed_at', daysAgo(30))
    .order('replicability_score', { ascending: false })
    .limit(15)

  if (viralError) {
    throw new Error(`Failed to fetch viral analysis: ${viralError.message}`)
  }

  const viralAnalyses = (viralData ?? []) as CortexViralAnalysis[]

  // c. Get temporal recommendations (matching platform)
  const { data: temporalData, error: temporalError } = await supabase
    .from('cortex_temporal_patterns')
    .select('*')
    .eq('platform', platform)
    .order('recommendation_score', { ascending: false })
    .limit(10)

  if (temporalError) {
    throw new Error(
      `Failed to fetch temporal patterns: ${temporalError.message}`,
    )
  }

  const temporalPatterns = (temporalData ?? []) as CortexTemporalPattern[]

  // d. Get pattern performance
  const { data: perfData, error: perfError } = await supabase
    .from('pattern_performance')
    .select(
      'pattern_id, platform, successes, failures, total_uses, avg_engagement',
    )
    .eq('platform', platform)
    .order('avg_engagement', { ascending: false })

  if (perfError) {
    throw new Error(
      `Failed to fetch pattern performance: ${perfError.message}`,
    )
  }

  const patternPerformance = (perfData ?? []).map((row) => ({
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
  })) as PatternPerformanceSummary[]

  // e. Use Anthropic Claude to generate comprehensive review
  const systemPrompt = buildContentReviewSystemPrompt(
    platform,
    rules,
    viralAnalyses,
    temporalPatterns,
    patternPerformance,
  )

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Review this ${platform} post draft and provide a comprehensive, data-backed analysis.

Post text:
"""
${postText}
"""

Return a JSON object with these exact fields:
{
  "overall_score": number (0-100),
  "platform_compliance": [
    { "rule_title": "string", "status": "pass" | "warn" | "fail", "detail": "string (MUST reference data source)" }
  ],
  "viral_potential": {
    "score": number (0-100),
    "similar_high_performers": ["string (reference specific viral analysis data)"],
    "improvement_suggestions": ["string (MUST cite source e.g. 'Based on cortex_platform_rules: ...' or 'Based on cortex_viral_analysis: ...')"]
  },
  "timing_recommendation": {
    "platform": "${platform}",
    "recommended_slots": [
      { "day_of_week": number, "hour_jst": number, "avg_engagement_rate": number, "sample_count": number, "confidence": "95% CI: [x, y]" }
    ],
    "avoid_slots": [
      { "day_of_week": number, "hour_jst": number, "reason": "string" }
    ]
  },
  "evidence_sources": ["string (list all CORTEX tables used)"]
}

Return ONLY the JSON object, no markdown fences.`,
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from LLM for content review')
  }

  const parsed = parseJsonFromLLM<ContentReviewResult>(textBlock.text)

  return {
    overall_score: parsed.overall_score ?? 50,
    platform_compliance: Array.isArray(parsed.platform_compliance)
      ? parsed.platform_compliance
      : [],
    viral_potential: {
      score: parsed.viral_potential?.score ?? 50,
      similar_high_performers: Array.isArray(
        parsed.viral_potential?.similar_high_performers,
      )
        ? parsed.viral_potential.similar_high_performers
        : [],
      improvement_suggestions: Array.isArray(
        parsed.viral_potential?.improvement_suggestions,
      )
        ? parsed.viral_potential.improvement_suggestions
        : [],
    },
    timing_recommendation: parsed.timing_recommendation ?? {
      platform,
      recommended_slots: [],
      avoid_slots: [],
    },
    evidence_sources: Array.isArray(parsed.evidence_sources)
      ? parsed.evidence_sources
      : [
          'cortex_platform_rules',
          'cortex_viral_analysis',
          'cortex_temporal_patterns',
          'pattern_performance',
        ],
  }
}

function buildContentReviewSystemPrompt(
  platform: string,
  rules: readonly CortexPlatformRule[],
  viralAnalyses: readonly CortexViralAnalysis[],
  temporalPatterns: readonly CortexTemporalPattern[],
  patternPerformance: readonly PatternPerformanceSummary[],
): string {
  const sections: string[] = [
    'You are the CORTEX content review engine. You analyze social media post drafts using REAL DATA from the CORTEX knowledge base.',
    'Every suggestion you make MUST cite the specific data source (table name + relevant data point).',
    '',
    `## Platform Rules (from cortex_platform_rules, platform=${platform})`,
  ]

  if (rules.length === 0) {
    sections.push('No rules found for this platform.')
  } else {
    for (const rule of rules) {
      const verified = rule.verified_by_data ? ' [DATA-VERIFIED]' : ''
      sections.push(
        `- [${rule.rule_category}] ${rule.rule_title}${verified} (confidence: ${rule.confidence})`,
      )
      sections.push(`  ${rule.rule_description}`)
    }
  }

  sections.push('')
  sections.push(
    `## Viral Analysis Data (from cortex_viral_analysis, platform=${platform}, last 30 days)`,
  )

  if (viralAnalyses.length === 0) {
    sections.push('No viral analysis data available.')
  } else {
    for (const v of viralAnalyses.slice(0, 10)) {
      const er = (v.engagement_rate * 100).toFixed(2)
      sections.push(
        `- hook: ${v.hook_type ?? 'unknown'} | structure: ${v.structure_type ?? 'unknown'} | ER: ${er}% | replicability: ${v.replicability_score ?? 'N/A'}`,
      )
      sections.push(
        `  buzz_factor: ${v.primary_buzz_factor ?? 'unknown'} | emotion: ${v.emotional_trigger ?? 'unknown'}`,
      )
      if (v.anti_patterns && v.anti_patterns.length > 0) {
        sections.push(`  anti_patterns: ${v.anti_patterns.join(', ')}`)
      }
    }
  }

  sections.push('')
  sections.push(
    `## Temporal Patterns (from cortex_temporal_patterns, platform=${platform})`,
  )

  if (temporalPatterns.length === 0) {
    sections.push('No temporal pattern data available.')
  } else {
    for (const t of temporalPatterns.slice(0, 5)) {
      const day = dayLabel(t.day_of_week)
      const avgER = (t.avg_engagement_rate * 100).toFixed(2)
      sections.push(
        `- ${day} ${t.hour_jst}:00 JST | avg ER: ${avgER}% | samples: ${t.sample_count} | rec_score: ${t.recommendation_score}`,
      )
    }
  }

  sections.push('')
  sections.push(
    `## Pattern Performance (from pattern_performance, platform=${platform})`,
  )

  if (patternPerformance.length === 0) {
    sections.push('No pattern performance data available.')
  } else {
    for (const p of patternPerformance) {
      const successRate = (p.success_rate * 100).toFixed(1)
      sections.push(
        `- ${p.pattern_id}: ${successRate}% success (${p.successes}/${p.total_uses}) | avg_engagement: ${p.avg_engagement.toFixed(4)}`,
      )
    }
  }

  return sections.join('\n')
}

// ============================================================
// 2. Trend Query
// ============================================================

export async function handleTrendQuery(): Promise<{
  trends: TrendResearchResult[]
  recommendations: string[]
}> {
  const supabase = getSupabase()
  const anthropic = getAnthropic()

  // a. Fetch latest buzz_posts (24h, top 10 by buzz_score)
  const { data: buzzData, error: buzzError } = await supabase
    .from('buzz_posts')
    .select('post_text, buzz_score, platform, post_date, created_at')
    .gte('created_at', daysAgo(1))
    .order('buzz_score', { ascending: false })
    .limit(10)

  if (buzzError) {
    throw new Error(`Failed to fetch buzz posts: ${buzzError.message}`)
  }

  const buzzPosts = buzzData ?? []

  // b. Fetch latest cortex_viral_analysis (7 days, top 10 by replicability_score)
  const { data: viralData, error: viralError } = await supabase
    .from('cortex_viral_analysis')
    .select('*')
    .gte('analyzed_at', daysAgo(7))
    .order('replicability_score', { ascending: false })
    .limit(10)

  if (viralError) {
    throw new Error(`Failed to fetch viral analysis: ${viralError.message}`)
  }

  const viralAnalyses = (viralData ?? []) as CortexViralAnalysis[]

  // c. Fetch latest trends from slack_bot_memory
  const { data: trendData, error: trendError } = await supabase
    .from('slack_bot_memory')
    .select('content, context, created_at')
    .eq('memory_type', 'trending_topics')
    .order('created_at', { ascending: false })
    .limit(5)

  if (trendError) {
    throw new Error(`Failed to fetch trends from memory: ${trendError.message}`)
  }

  const memoryTrends = trendData ?? []

  // d. Use Claude to synthesize
  const buzzSummary = buzzPosts
    .map(
      (p) =>
        `[buzz_score: ${p.buzz_score}, platform: ${p.platform}] ${(p.post_text as string).slice(0, 150)}`,
    )
    .join('\n')

  const viralSummary = viralAnalyses
    .map(
      (v) =>
        `[${v.platform}, replicability: ${v.replicability_score}, hook: ${v.hook_type}] buzz_factor: ${v.primary_buzz_factor} | emotion: ${v.emotional_trigger}`,
    )
    .join('\n')

  const memorySummary = memoryTrends
    .map((t) => `[${(t.created_at as string).slice(0, 16)}] ${t.content}`)
    .join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system:
      'You are the CORTEX trend analysis engine. You synthesize data from multiple CORTEX tables to identify actionable content opportunities. Every recommendation must cite the data source.',
    messages: [
      {
        role: 'user',
        content: `Synthesize the following CORTEX data into actionable trend insights.

## buzz_posts (last 24h, top 10 by buzz_score)
${buzzSummary || 'No buzz posts found.'}

## cortex_viral_analysis (last 7 days, top 10 by replicability_score)
${viralSummary || 'No viral analyses found.'}

## slack_bot_memory (trending_topics)
${memorySummary || 'No trending topics found.'}

Return a JSON object with these fields:
{
  "trends": [
    {
      "topic": "string",
      "maturity": "emerging" | "growing" | "saturated",
      "unexplored_angles": ["string", "string", "string"],
      "japan_specific_angle": "string",
      "freshness_score": number (0-1, how fresh/timely),
      "recommended_content_types": ["Quote RT" | "Original" | "Thread"],
      "supporting_data": [
        { "source": "table_name", "relevance": number (0-1), "summary": "string" }
      ]
    }
  ],
  "recommendations": [
    "string (specific actionable recommendation citing data source)"
  ]
}

Requirements:
- Return exactly 3 trends (top 3 actionable topics)
- Each trend must have 3 content options with specific hook suggestions
- Include freshness estimate (hours until stale) in supporting_data
- Include platform-specific recommendations in the recommendations array

Return ONLY the JSON object, no markdown fences.`,
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from LLM for trend query')
  }

  const parsed = parseJsonFromLLM<{
    trends: TrendResearchResult[]
    recommendations: string[]
  }>(textBlock.text)

  return {
    trends: Array.isArray(parsed.trends) ? parsed.trends.slice(0, 5) : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [],
  }
}

// ============================================================
// 3. Performance Review
// ============================================================

export async function handlePerformanceReview(
  days: number = 7,
): Promise<PerformanceReport> {
  const supabase = getSupabase()
  const anthropic = getAnthropic()

  const periodStart = daysAgo(days)
  const periodEnd = new Date().toISOString()

  // a. Fetch analytics for all platforms
  const [xAnalytics, linkedinAnalytics, threadsAnalytics] = await Promise.all([
    fetchPlatformAnalytics(supabase, 'x_post_analytics', periodStart),
    fetchPlatformAnalytics(supabase, 'linkedin_post_analytics', periodStart),
    fetchPlatformAnalytics(supabase, 'threads_post_analytics', periodStart),
  ])

  // b. Fetch pattern performance
  const { data: perfData, error: perfError } = await supabase
    .from('pattern_performance')
    .select(
      'pattern_id, platform, successes, failures, total_uses, avg_engagement',
    )
    .order('avg_engagement', { ascending: false })

  if (perfError) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to fetch pattern performance: ${perfError.message}\n`,
    )
  }

  const patternPerformance = (perfData ?? []).map((row) => ({
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
  }))

  // c. Fetch temporal patterns
  const { data: temporalData, error: temporalError } = await supabase
    .from('cortex_temporal_patterns')
    .select('*')
    .order('recommendation_score', { ascending: false })

  if (temporalError) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to fetch temporal patterns: ${temporalError.message}\n`,
    )
  }

  const temporalPatterns = (temporalData ?? []) as CortexTemporalPattern[]

  // d. Fetch model drift log
  const { data: driftData, error: driftError } = await supabase
    .from('model_drift_log')
    .select('id, mae, is_drifted, checked_at')
    .order('checked_at', { ascending: false })
    .limit(1)

  if (driftError) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to fetch model drift log: ${driftError.message}\n`,
    )
  }

  const latestDrift = (driftData?.[0] ?? null) as ModelDriftRow | null

  // e. Calculate per-platform stats
  const platformStats = buildPlatformStats([
    { name: 'x', posts: xAnalytics },
    { name: 'linkedin', posts: linkedinAnalytics },
    { name: 'threads', posts: threadsAnalytics },
  ])

  // Calculate timing analysis
  const timingAnalysis = buildTimingAnalysis(temporalPatterns)

  // Build pattern analysis
  const patternAnalysis = patternPerformance.map((p) => ({
    pattern_id: p.pattern_id,
    success_rate: p.success_rate,
    trend: inferTrend(p.success_rate) as 'improving' | 'stable' | 'declining',
  }))

  const mlHealth = {
    is_drifted: latestDrift?.is_drifted ?? false,
    latest_mae: latestDrift?.mae ?? 0,
  }

  // f. Use Claude to generate executive summary
  const dataSummary = buildPerformanceDataSummary(
    platformStats,
    patternAnalysis,
    timingAnalysis,
    mlHealth,
    days,
  )

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system:
      'You are the CORTEX performance analysis engine. Generate an executive summary based on real performance data. Be specific and actionable. Reference the data sources.',
    messages: [
      {
        role: 'user',
        content: `Generate a performance review summary based on this CORTEX data.

${dataSummary}

Return a JSON object with:
{
  "executive_summary": "string (3 sentences max, key takeaways)",
  "wins": ["string (top 3 wins, cite specific numbers from the data)"],
  "improvements": ["string (top 3 improvements needed with specific actions)"],
  "next_week_recommendations": ["string (specific, actionable, data-backed)"]
}

Return ONLY the JSON object, no markdown fences.`,
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from LLM for performance review')
  }

  const parsed = parseJsonFromLLM<{
    executive_summary: string
    wins: string[]
    improvements: string[]
    next_week_recommendations: string[]
  }>(textBlock.text)

  return {
    period: { start: periodStart, end: periodEnd },
    platforms: platformStats,
    pattern_analysis: patternAnalysis,
    timing_analysis: timingAnalysis,
    ml_health: mlHealth,
    executive_summary: parsed.executive_summary ?? 'No summary available.',
    wins: Array.isArray(parsed.wins) ? parsed.wins.slice(0, 3) : [],
    improvements: Array.isArray(parsed.improvements)
      ? parsed.improvements.slice(0, 3)
      : [],
    next_week_recommendations: Array.isArray(parsed.next_week_recommendations)
      ? parsed.next_week_recommendations.slice(0, 5)
      : [],
  }
}

async function fetchPlatformAnalytics(
  supabase: SupabaseClient,
  tableName: string,
  since: string,
): Promise<readonly PostAnalyticsRow[]> {
  const { data, error } = await supabase
    .from(tableName)
    .select('post_text, posted_at, likes, impressions, engagement_rate, pattern_used')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })

  if (error) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to fetch ${tableName}: ${error.message}\n`,
    )
    return []
  }

  return (data ?? []) as readonly PostAnalyticsRow[]
}

function buildPlatformStats(
  platforms: readonly {
    name: string
    posts: readonly PostAnalyticsRow[]
  }[],
): PerformanceReport['platforms'] {
  return platforms
    .filter((p) => p.posts.length > 0)
    .map((p) => {
      const totalPosts = p.posts.length
      const avgER =
        p.posts.reduce((sum, post) => sum + (post.engagement_rate ?? 0), 0) /
        totalPosts

      const sorted = [...p.posts].sort(
        (a, b) => (b.engagement_rate ?? 0) - (a.engagement_rate ?? 0),
      )

      const best = sorted[0]
      const worst = sorted[sorted.length - 1]

      return {
        platform: p.name,
        total_posts: totalPosts,
        avg_engagement_rate: avgER,
        best_post: {
          text: best?.post_text?.slice(0, 100) ?? '',
          engagement_rate: best?.engagement_rate ?? 0,
        },
        worst_post: {
          text: worst?.post_text?.slice(0, 100) ?? '',
          engagement_rate: worst?.engagement_rate ?? 0,
        },
      }
    })
}

function buildTimingAnalysis(
  patterns: readonly CortexTemporalPattern[],
): PerformanceReport['timing_analysis'] {
  const sorted = [...patterns].sort(
    (a, b) => b.avg_engagement_rate - a.avg_engagement_rate,
  )

  const best = sorted.slice(0, 5).map((p) => ({
    day: p.day_of_week,
    hour: p.hour_jst,
    avg_er: p.avg_engagement_rate,
  }))

  const worst = sorted
    .slice(-5)
    .reverse()
    .map((p) => ({
      day: p.day_of_week,
      hour: p.hour_jst,
      avg_er: p.avg_engagement_rate,
    }))

  return { best_slots: best, worst_slots: worst }
}

function inferTrend(
  successRate: number,
): 'improving' | 'stable' | 'declining' {
  if (successRate >= 0.7) return 'improving'
  if (successRate >= 0.4) return 'stable'
  return 'declining'
}

function buildPerformanceDataSummary(
  platforms: PerformanceReport['platforms'],
  patterns: PerformanceReport['pattern_analysis'],
  timing: PerformanceReport['timing_analysis'],
  mlHealth: PerformanceReport['ml_health'],
  days: number,
): string {
  const sections: string[] = [
    `## Performance Data (last ${days} days)`,
    '',
    '### Per-Platform Stats (from x_post_analytics, linkedin_post_analytics, threads_post_analytics)',
  ]

  if (platforms.length === 0) {
    sections.push('No post analytics data found.')
  } else {
    for (const p of platforms) {
      const avgER = (p.avg_engagement_rate * 100).toFixed(2)
      sections.push(`**${p.platform}**: ${p.total_posts} posts, avg ER: ${avgER}%`)
      sections.push(
        `  Best: "${p.best_post.text}..." (${(p.best_post.engagement_rate * 100).toFixed(2)}% ER)`,
      )
      sections.push(
        `  Worst: "${p.worst_post.text}..." (${(p.worst_post.engagement_rate * 100).toFixed(2)}% ER)`,
      )
    }
  }

  sections.push('')
  sections.push('### Pattern Analysis (from pattern_performance)')

  if (patterns.length === 0) {
    sections.push('No pattern data found.')
  } else {
    for (const p of patterns) {
      sections.push(
        `- ${p.pattern_id}: ${(p.success_rate * 100).toFixed(1)}% success rate (${p.trend})`,
      )
    }
  }

  sections.push('')
  sections.push('### Timing Analysis (from cortex_temporal_patterns)')

  if (timing.best_slots.length > 0) {
    sections.push('Best slots:')
    for (const s of timing.best_slots) {
      sections.push(
        `  - ${dayLabel(s.day)} ${s.hour}:00 JST (${(s.avg_er * 100).toFixed(2)}% ER)`,
      )
    }
  }

  if (timing.worst_slots.length > 0) {
    sections.push('Worst slots:')
    for (const s of timing.worst_slots) {
      sections.push(
        `  - ${dayLabel(s.day)} ${s.hour}:00 JST (${(s.avg_er * 100).toFixed(2)}% ER)`,
      )
    }
  }

  sections.push('')
  sections.push('### ML Health (from model_drift_log)')
  sections.push(`Drifted: ${mlHealth.is_drifted ? 'YES' : 'No'}`)
  sections.push(`Latest MAE: ${mlHealth.latest_mae}`)

  return sections.join('\n')
}

// ============================================================
// 4. Guideline Check
// ============================================================

export async function handleGuidelineCheck(
  platform: Platform,
): Promise<GuidelineReport> {
  const supabase = getSupabase()

  // a. Fetch ALL rules for platform (including deprecated for history)
  const { data: allRulesData, error: allRulesError } = await supabase
    .from('cortex_platform_rules')
    .select('*')
    .eq('platform', platform)
    .order('updated_at', { ascending: false })

  if (allRulesError) {
    throw new Error(
      `Failed to fetch platform rules: ${allRulesError.message}`,
    )
  }

  const allRules = (allRulesData ?? []) as CortexPlatformRule[]

  // b. Separate active vs deprecated
  const activeRules = allRules.filter((r) => r.deprecated_at === null)

  // c. Check for recent changes (updated in last 7 days)
  const sevenDaysAgo = daysAgo(7)
  const recentChanges = allRules.filter(
    (r) => r.updated_at >= sevenDaysAgo,
  )

  // d. Find unverified rules
  const unverifiedRules = activeRules.filter((r) => !r.verified_by_data)

  // Build summary
  const summaryParts: string[] = [
    `Platform: ${platform}`,
    `Active rules: ${activeRules.length}`,
    `Recent changes (7d): ${recentChanges.length}`,
    `Unverified rules: ${unverifiedRules.length}`,
  ]

  if (recentChanges.length > 0) {
    summaryParts.push(
      `Latest change: "${recentChanges[0]?.rule_title}" (${recentChanges[0]?.updated_at.slice(0, 10)})`,
    )
  }

  const verifiedCount = activeRules.filter((r) => r.verified_by_data).length
  const verificationRate =
    activeRules.length > 0
      ? ((verifiedCount / activeRules.length) * 100).toFixed(0)
      : '0'
  summaryParts.push(`Verification rate: ${verificationRate}%`)

  return {
    platform,
    active_rules: activeRules,
    recent_changes: recentChanges,
    unverified_rules: unverifiedRules,
    summary: summaryParts.join(' | '),
  }
}
