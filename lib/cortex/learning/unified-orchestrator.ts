/**
 * CORTEX Unified Learning Orchestrator
 *
 * Unifies all learning signals (engagement data from all platforms,
 * viral analysis, temporal patterns, conversation feedback) into
 * a single learning cycle. Runs daily after individual engagement learners.
 */

import Anthropic from '@anthropic-ai/sdk'
import { getSupabase } from '../discord/context-builder'
import { sendMessage } from '@/lib/slack-bot/slack-client'

// ============================================================
// Constants
// ============================================================

const LOG_PREFIX = '[CORTEX Unified Learner]'
const LOOKBACK_DAYS = 7

// ============================================================
// Types
// ============================================================

export interface UnifiedLearningReport {
  readonly period: { readonly start: string; readonly end: string }
  readonly cross_platform_patterns: readonly {
    readonly hook_type: string
    readonly platforms: readonly string[]
    readonly avg_engagement_rate: number
    readonly sample_count: number
  }[]
  readonly platform_specific: readonly {
    readonly platform: string
    readonly unique_pattern: string
    readonly evidence: string
  }[]
  readonly timing_insights: {
    readonly best_slots: readonly {
      readonly day: number
      readonly hour: number
      readonly platform: string
      readonly avg_er: number
    }[]
    readonly missed_opportunities: readonly {
      readonly day: number
      readonly hour: number
      readonly recommendation_score: number
    }[]
  }
  readonly trajectory: {
    readonly direction: 'improving' | 'stable' | 'declining'
    readonly this_week_avg_er: number
    readonly last_week_avg_er: number
    readonly change_percent: number
  }
  readonly executive_summary: string
}

interface PlatformEngagementSummary {
  readonly platform: string
  readonly post_count: number
  readonly avg_er: number
  readonly best_er: number
  readonly worst_er: number
}

interface ViralGrouping {
  readonly key: string
  readonly dimension: string
  readonly avg_engagement_rate: number
  readonly count: number
  readonly platforms: readonly string[]
}

interface TemporalMismatch {
  readonly day: number
  readonly hour: number
  readonly recommendation_score: number
}

interface ConversationDecisionSummary {
  readonly summary: string
  readonly decisions: readonly string[]
  readonly affected_platforms: readonly string[]
}

// ============================================================
// Step 1: Collect Cross-Platform Engagement Summaries
// ============================================================

async function collectEngagementSummaries(): Promise<readonly PlatformEngagementSummary[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const results: PlatformEngagementSummary[] = []

  const tables = [
    { table: 'x_post_analytics', platform: 'x', dateCol: 'posted_at' },
    { table: 'linkedin_post_analytics', platform: 'linkedin', dateCol: 'posted_at' },
    { table: 'threads_post_analytics', platform: 'threads', dateCol: 'posted_at' },
  ] as const

  for (const { table, platform, dateCol } of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('engagement_rate')
        .gte(dateCol, since)

      if (error) {
        process.stdout.write(`${LOG_PREFIX} Failed to fetch ${table}: ${error.message}\n`)
        continue
      }

      if (!data || data.length === 0) {
        results.push({
          platform,
          post_count: 0,
          avg_er: 0,
          best_er: 0,
          worst_er: 0,
        })
        continue
      }

      const rates = data.map((row) => (row.engagement_rate as number) ?? 0)
      const avg = rates.reduce((sum, r) => sum + r, 0) / rates.length
      const best = Math.max(...rates)
      const worst = Math.min(...rates)

      results.push({
        platform,
        post_count: data.length,
        avg_er: avg,
        best_er: best,
        worst_er: worst,
      })
    } catch (err) {
      process.stdout.write(
        `${LOG_PREFIX} Error fetching ${table}: ${err instanceof Error ? err.message : String(err)}\n`,
      )
    }
  }

  return results
}

// ============================================================
// Step 2: Correlate with Viral Analysis
// ============================================================

async function correlateViralAnalysis(): Promise<readonly ViralGrouping[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('cortex_viral_analysis')
    .select('hook_type, emotional_trigger, structure_type, engagement_rate, platform')
    .gte('analyzed_at', since)

  if (error) {
    process.stdout.write(`${LOG_PREFIX} Failed to fetch viral analysis: ${error.message}\n`)
    return []
  }

  if (!data || data.length === 0) return []

  const groupings: ViralGrouping[] = []

  // Group by each dimension
  const dimensions = ['hook_type', 'emotional_trigger', 'structure_type'] as const

  for (const dimension of dimensions) {
    const groups = new Map<string, { total_er: number; count: number; platforms: Set<string> }>()

    for (const row of data) {
      const key = (row[dimension] as string) ?? 'unknown'
      const existing = groups.get(key) ?? { total_er: 0, count: 0, platforms: new Set<string>() }
      groups.set(key, {
        total_er: existing.total_er + ((row.engagement_rate as number) ?? 0),
        count: existing.count + 1,
        platforms: existing.platforms.add((row.platform as string) ?? 'unknown'),
      })
    }

    for (const [key, value] of Array.from(groups)) {
      groupings.push({
        key,
        dimension,
        avg_engagement_rate: value.count > 0 ? value.total_er / value.count : 0,
        count: value.count,
        platforms: Array.from(value.platforms),
      })
    }
  }

  // Sort by avg engagement rate descending
  return [...groupings].sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate)
}

// ============================================================
// Step 3: Correlate with Temporal Patterns
// ============================================================

async function correlateTemporalPatterns(
  engagementSummaries: readonly PlatformEngagementSummary[],
): Promise<{
  readonly bestSlots: readonly { day: number; hour: number; platform: string; avg_er: number }[]
  readonly missedOpportunities: readonly TemporalMismatch[]
}> {
  const supabase = getSupabase()

  const { data: temporalData, error: temporalError } = await supabase
    .from('cortex_temporal_patterns')
    .select('platform, day_of_week, hour_jst, recommendation_score, avg_engagement_rate')
    .order('recommendation_score', { ascending: false })

  if (temporalError) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to fetch temporal patterns: ${temporalError.message}\n`,
    )
    return { bestSlots: [], missedOpportunities: [] }
  }

  if (!temporalData || temporalData.length === 0) {
    return { bestSlots: [], missedOpportunities: [] }
  }

  // Best slots: top 5 by recommendation_score
  const bestSlots = temporalData.slice(0, 5).map((row) => ({
    day: row.day_of_week as number,
    hour: row.hour_jst as number,
    platform: row.platform as string,
    avg_er: (row.avg_engagement_rate as number) ?? 0,
  }))

  // Missed opportunities: high recommendation slots on platforms with 0 posts
  const zeroPlatforms = new Set(
    engagementSummaries.filter((s) => s.post_count === 0).map((s) => s.platform),
  )

  const missedOpportunities: TemporalMismatch[] = temporalData
    .filter(
      (row) =>
        zeroPlatforms.has(row.platform as string) &&
        (row.recommendation_score as number) > 0.7,
    )
    .slice(0, 5)
    .map((row) => ({
      day: row.day_of_week as number,
      hour: row.hour_jst as number,
      recommendation_score: row.recommendation_score as number,
    }))

  return { bestSlots, missedOpportunities }
}

// ============================================================
// Step 4: Process Conversation Feedback
// ============================================================

async function processConversationFeedback(): Promise<readonly ConversationDecisionSummary[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('cortex_conversation_log')
    .select('summary, key_decisions, affected_platforms')
    .eq('status', 'completed')
    .gte('created_at', since)

  if (error) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to fetch conversation log: ${error.message}\n`,
    )
    return []
  }

  if (!data || data.length === 0) return []

  return data
    .filter((row) => row.key_decisions && (row.key_decisions as string[]).length > 0)
    .map((row) => ({
      summary: row.summary as string,
      decisions: (row.key_decisions as string[]) ?? [],
      affected_platforms: (row.affected_platforms as string[]) ?? [],
    }))
}

// ============================================================
// Step 5: Generate Unified Insights via Claude
// ============================================================

async function generateUnifiedInsights(
  engagementSummaries: readonly PlatformEngagementSummary[],
  viralGroupings: readonly ViralGrouping[],
  temporalData: {
    readonly bestSlots: readonly { day: number; hour: number; platform: string; avg_er: number }[]
    readonly missedOpportunities: readonly TemporalMismatch[]
  },
  conversationDecisions: readonly ConversationDecisionSummary[],
  trajectory: {
    readonly direction: 'improving' | 'stable' | 'declining'
    readonly this_week_avg_er: number
    readonly last_week_avg_er: number
    readonly change_percent: number
  },
): Promise<{
  readonly cross_platform_patterns: UnifiedLearningReport['cross_platform_patterns']
  readonly platform_specific: UnifiedLearningReport['platform_specific']
  readonly executive_summary: string
}> {
  const anthropic = new Anthropic()

  const prompt = `You are a social media analytics expert. Analyze the following data and produce insights.

## Engagement Summaries (last 7 days)
${JSON.stringify(engagementSummaries, null, 2)}

## Viral Pattern Groupings (by hook_type, emotional_trigger, structure_type)
${JSON.stringify(viralGroupings.slice(0, 20), null, 2)}

## Best Posting Times
${JSON.stringify(temporalData.bestSlots, null, 2)}

## Missed Opportunities (high-value slots with 0 posts)
${JSON.stringify(temporalData.missedOpportunities, null, 2)}

## Conversation Decisions Acted Upon
${JSON.stringify(conversationDecisions, null, 2)}

## Trajectory
${JSON.stringify(trajectory, null, 2)}

Respond with ONLY valid JSON (no markdown fences) in this exact format:
{
  "cross_platform_patterns": [
    {
      "hook_type": "string (the pattern identifier)",
      "platforms": ["x", "linkedin"],
      "avg_engagement_rate": 0.05,
      "sample_count": 10
    }
  ],
  "platform_specific": [
    {
      "platform": "x",
      "unique_pattern": "short description",
      "evidence": "data point supporting this"
    }
  ],
  "executive_summary": "2-3 sentence overall assessment"
}

Rules:
- cross_platform_patterns: Top 3 patterns that work across 2+ platforms
- platform_specific: Insights unique to one platform only
- executive_summary: Concise, actionable, includes trajectory direction`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const parsed = JSON.parse(text) as {
      cross_platform_patterns: UnifiedLearningReport['cross_platform_patterns']
      platform_specific: UnifiedLearningReport['platform_specific']
      executive_summary: string
    }
    return parsed
  } catch {
    process.stdout.write(`${LOG_PREFIX} Failed to parse Claude response, using fallback\n`)
    return {
      cross_platform_patterns: [],
      platform_specific: [],
      executive_summary: 'Unable to generate insights due to parsing error.',
    }
  }
}

// ============================================================
// Step 6: Calculate Trajectory
// ============================================================

async function calculateTrajectory(): Promise<{
  readonly direction: 'improving' | 'stable' | 'declining'
  readonly this_week_avg_er: number
  readonly last_week_avg_er: number
  readonly change_percent: number
}> {
  const supabase = getSupabase()
  const now = Date.now()
  const thisWeekStart = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
  const lastWeekStart = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString()

  const fetchAvgER = async (since: string, until: string): Promise<number> => {
    const allRates: number[] = []

    const tables = [
      { table: 'x_post_analytics', dateCol: 'posted_at' },
      { table: 'linkedin_post_analytics', dateCol: 'posted_at' },
      { table: 'threads_post_analytics', dateCol: 'posted_at' },
    ] as const

    for (const { table, dateCol } of tables) {
      try {
        const { data } = await supabase
          .from(table)
          .select('engagement_rate')
          .gte(dateCol, since)
          .lt(dateCol, until)

        if (data) {
          for (const row of data) {
            const er = row.engagement_rate as number
            if (typeof er === 'number') allRates.push(er)
          }
        }
      } catch {
        // Best-effort per table
      }
    }

    if (allRates.length === 0) return 0
    return allRates.reduce((sum, r) => sum + r, 0) / allRates.length
  }

  const thisWeekAvg = await fetchAvgER(thisWeekStart, new Date(now).toISOString())
  const lastWeekAvg = await fetchAvgER(lastWeekStart, thisWeekStart)

  let changePercent = 0
  if (lastWeekAvg > 0) {
    changePercent = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100
  }

  let direction: 'improving' | 'stable' | 'declining'
  if (changePercent > 5) {
    direction = 'improving'
  } else if (changePercent < -5) {
    direction = 'declining'
  } else {
    direction = 'stable'
  }

  return {
    direction,
    this_week_avg_er: thisWeekAvg,
    last_week_avg_er: lastWeekAvg,
    change_percent: changePercent,
  }
}

// ============================================================
// Step 7: Save Results
// ============================================================

async function saveResults(report: UnifiedLearningReport): Promise<void> {
  const supabase = getSupabase()

  // Save to slack_bot_memory
  try {
    await supabase.from('slack_bot_memory').insert({
      memory_type: 'fact',
      content: report.executive_summary,
      importance: 0.9,
      context: {
        source: 'cortex_unified_learner',
        period: report.period,
        trajectory: report.trajectory,
        cross_platform_patterns: report.cross_platform_patterns,
        platform_specific: report.platform_specific,
      },
    })
  } catch (err) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to save to slack_bot_memory: ${err instanceof Error ? err.message : String(err)}\n`,
    )
  }

  // Save to cortex_conversation_log
  try {
    await supabase.from('cortex_conversation_log').insert({
      channel: 'slack',
      conversation_type: 'learning_report',
      summary: report.executive_summary,
      key_decisions: report.cross_platform_patterns.map(
        (p) => `${p.hook_type}: avg ER ${(p.avg_engagement_rate * 100).toFixed(2)}% across ${p.platforms.join(', ')}`,
      ),
      affected_platforms: Array.from(new Set(report.cross_platform_patterns.flatMap((p) => Array.from(p.platforms)))),
      priority: 'medium',
      status: 'completed',
    })
  } catch (err) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to save to cortex_conversation_log: ${err instanceof Error ? err.message : String(err)}\n`,
    )
  }

  process.stdout.write(`${LOG_PREFIX} Saved results to slack_bot_memory and cortex_conversation_log\n`)
}

// ============================================================
// Step 8: Send Slack Notification
// ============================================================

async function sendSlackNotification(report: UnifiedLearningReport): Promise<void> {
  const channel = process.env.SLACK_GENERAL_CHANNEL_ID || process.env.SLACK_DEFAULT_CHANNEL

  if (!channel) {
    process.stdout.write(`${LOG_PREFIX} No Slack channel configured, skipping notification\n`)
    return
  }

  const trajectoryEmoji =
    report.trajectory.direction === 'improving'
      ? ':chart_with_upwards_trend:'
      : report.trajectory.direction === 'declining'
        ? ':chart_with_downwards_trend:'
        : ':left_right_arrow:'

  const patternLines = report.cross_platform_patterns.map(
    (p) =>
      `  - ${p.hook_type}: ${(p.avg_engagement_rate * 100).toFixed(2)}% ER (${p.platforms.join(', ')}, n=${p.sample_count})`,
  )

  const text = [
    `:brain: *CORTEX Unified Learning Report*`,
    ``,
    `*Period:* ${report.period.start} - ${report.period.end}`,
    ``,
    `${trajectoryEmoji} *Trajectory:* ${report.trajectory.direction} (${report.trajectory.change_percent >= 0 ? '+' : ''}${report.trajectory.change_percent.toFixed(1)}%)`,
    `  This week avg ER: ${(report.trajectory.this_week_avg_er * 100).toFixed(2)}%`,
    `  Last week avg ER: ${(report.trajectory.last_week_avg_er * 100).toFixed(2)}%`,
    ``,
    `*Cross-Platform Patterns:*`,
    ...patternLines,
    ``,
    `*Summary:* ${report.executive_summary}`,
  ].join('\n')

  try {
    await sendMessage({ channel, text })
  } catch (err) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to send Slack notification: ${err instanceof Error ? err.message : String(err)}\n`,
    )
  }
}

// ============================================================
// Main: Run Unified Learner
// ============================================================

export async function runUnifiedLearner(): Promise<UnifiedLearningReport> {
  process.stdout.write(`${LOG_PREFIX} Starting unified learning cycle...\n`)

  const now = new Date()
  const periodEnd = now.toISOString().slice(0, 10)
  const periodStart = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  // Step 1: Collect engagement summaries
  const engagementSummaries = await collectEngagementSummaries()
  process.stdout.write(
    `${LOG_PREFIX} Collected engagement from ${engagementSummaries.length} platforms\n`,
  )

  // Step 2: Correlate viral analysis
  const viralGroupings = await correlateViralAnalysis()
  process.stdout.write(
    `${LOG_PREFIX} Found ${viralGroupings.length} viral pattern groupings\n`,
  )

  // Step 3: Correlate temporal patterns
  const temporalData = await correlateTemporalPatterns(engagementSummaries)
  process.stdout.write(
    `${LOG_PREFIX} Best slots: ${temporalData.bestSlots.length}, missed opportunities: ${temporalData.missedOpportunities.length}\n`,
  )

  // Step 4: Process conversation feedback
  const conversationDecisions = await processConversationFeedback()
  process.stdout.write(
    `${LOG_PREFIX} Processed ${conversationDecisions.length} conversation decision sets\n`,
  )

  // Step 5: Calculate trajectory
  const trajectory = await calculateTrajectory()
  process.stdout.write(
    `${LOG_PREFIX} Trajectory: ${trajectory.direction} (${trajectory.change_percent.toFixed(1)}%)\n`,
  )

  // Step 6: Generate unified insights via Claude
  const insights = await generateUnifiedInsights(
    engagementSummaries,
    viralGroupings,
    temporalData,
    conversationDecisions,
    trajectory,
  )

  const report: UnifiedLearningReport = {
    period: { start: periodStart, end: periodEnd },
    cross_platform_patterns: insights.cross_platform_patterns,
    platform_specific: insights.platform_specific,
    timing_insights: {
      best_slots: temporalData.bestSlots,
      missed_opportunities: temporalData.missedOpportunities,
    },
    trajectory,
    executive_summary: insights.executive_summary,
  }

  // Step 7: Save results
  await saveResults(report)

  // Step 8: Send Slack notification
  await sendSlackNotification(report)

  process.stdout.write(`${LOG_PREFIX} Unified learning cycle complete\n`)

  return report
}
