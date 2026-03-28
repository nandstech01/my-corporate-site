/**
 * CORTEX Auto-Improver
 *
 * Weekly auto-improvement engine that analyzes performance data
 * and generates structured improvement proposals for review.
 * Does NOT directly modify files — creates proposals only.
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { sendMessage } from '@/lib/slack-bot/slack-client'
import { VIRAL_HOOK_PATTERNS } from '@/lib/viral-hooks/hook-templates'

// ============================================================
// Types
// ============================================================

export interface ImprovementProposal {
  readonly category:
    | 'new_pattern'
    | 'threshold_adjustment'
    | 'schedule_change'
    | 'pattern_deprecation'
  readonly title: string
  readonly description: string
  readonly evidence: string
  readonly affected_files: readonly string[]
  readonly risk_level: 'low' | 'medium' | 'high'
  readonly expected_impact: string
  readonly implementation_notes: string
}

export interface AutoImprovementReport {
  readonly analyzed_at: string
  readonly data_period_days: number
  readonly pattern_analysis: {
    readonly underperforming: readonly {
      readonly pattern_id: string
      readonly success_rate: number
      readonly uses: number
    }[]
    readonly high_performing: readonly {
      readonly pattern_id: string
      readonly success_rate: number
      readonly uses: number
    }[]
    readonly new_candidates: readonly {
      readonly hook_type: string
      readonly replicability: number
      readonly source: string
    }[]
  }
  readonly threshold_analysis: {
    readonly current_approval_rate: number
    readonly false_positive_rate: number
    readonly false_negative_rate: number
    readonly recommended_adjustment: string
  }
  readonly schedule_gaps: {
    readonly underutilized: readonly {
      readonly day: number
      readonly hour: number
      readonly recommendation_score: number
      readonly current_posts: number
    }[]
    readonly oversaturated: readonly {
      readonly day: number
      readonly hour: number
      readonly current_posts: number
    }[]
  }
  readonly proposals: readonly ImprovementProposal[]
  readonly executive_summary: string
}

// ============================================================
// Internal row types (for SELECT results)
// ============================================================

interface PatternPerformanceRow {
  readonly pattern_id: string
  readonly platform: string
  readonly successes: number
  readonly failures: number
  readonly total_uses: number
  readonly avg_engagement: number
}

interface JudgeDecisionRow {
  readonly id: string
  readonly decision: string
  readonly confidence: number
  readonly prediction_error: number | null
  readonly actual_engagement: Record<string, unknown> | null
  readonly was_posted: boolean | null
  readonly created_at: string
}

interface TemporalPatternRow {
  readonly day_of_week: number
  readonly hour_jst: number
  readonly recommendation_score: number
  readonly sample_count: number
  readonly platform: string
}

interface ViralAnalysisRow {
  readonly hook_type: string | null
  readonly replicability_score: number | null
  readonly platform: string
  readonly original_text: string
}

// ============================================================
// Constants
// ============================================================

const DATA_PERIOD_DAYS = 30
const LOG_PREFIX = '[auto-improver]'
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'
const MAX_SYNTHESIS_TOKENS = 4096

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

function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required')
  return new Anthropic({ apiKey })
}

// ============================================================
// Step 1: Pattern Performance Analysis
// ============================================================

interface PatternAnalysisResult {
  readonly underperforming: readonly {
    readonly pattern_id: string
    readonly success_rate: number
    readonly uses: number
  }[]
  readonly high_performing: readonly {
    readonly pattern_id: string
    readonly success_rate: number
    readonly uses: number
  }[]
  readonly new_candidates: readonly {
    readonly hook_type: string
    readonly replicability: number
    readonly source: string
  }[]
}

async function analyzePatternPerformance(): Promise<PatternAnalysisResult> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - DATA_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // Fetch pattern performance and viral analysis in parallel
  const [perfResult, viralResult] = await Promise.all([
    supabase
      .from('pattern_performance')
      .select('pattern_id, platform, successes, failures, total_uses, avg_engagement'),
    supabase
      .from('cortex_viral_analysis')
      .select('hook_type, replicability_score, platform, original_text')
      .gte('analyzed_at', since)
      .order('replicability_score', { ascending: false }),
  ])

  if (perfResult.error) {
    throw new Error(`Failed to fetch pattern_performance: ${perfResult.error.message}`)
  }
  if (viralResult.error) {
    throw new Error(`Failed to fetch cortex_viral_analysis: ${viralResult.error.message}`)
  }

  const perfRows = (perfResult.data ?? []) as readonly PatternPerformanceRow[]
  const viralRows = (viralResult.data ?? []) as readonly ViralAnalysisRow[]

  // Compute success rates and categorize
  const withRates = perfRows.map((row) => ({
    pattern_id: row.pattern_id,
    success_rate: row.total_uses > 0 ? row.successes / row.total_uses : 0,
    uses: row.total_uses,
  }))

  const underperforming = withRates.filter(
    (p) => p.success_rate < 0.4 && p.uses >= 10,
  )

  const high_performing = withRates.filter(
    (p) => p.success_rate > 0.7 && p.uses >= 5,
  )

  // Find new pattern candidates: high replicability + hook_type not in existing patterns
  const existingHookTypes = new Set(
    VIRAL_HOOK_PATTERNS.map((p) => p.type),
  )

  const new_candidates = viralRows
    .filter(
      (v) =>
        v.replicability_score !== null &&
        v.replicability_score > 0.7 &&
        v.hook_type !== null &&
        !existingHookTypes.has(v.hook_type as never),
    )
    .map((v) => ({
      hook_type: v.hook_type!,
      replicability: v.replicability_score!,
      source: v.platform,
    }))

  // Deduplicate candidates by hook_type, keeping highest replicability
  const candidateMap = new Map<string, { hook_type: string; replicability: number; source: string }>()
  for (const c of new_candidates) {
    const existing = candidateMap.get(c.hook_type)
    if (!existing || c.replicability > existing.replicability) {
      candidateMap.set(c.hook_type, c)
    }
  }

  return {
    underperforming,
    high_performing,
    new_candidates: Array.from(candidateMap.values()),
  }
}

// ============================================================
// Step 2: Threshold Analysis
// ============================================================

interface ThresholdAnalysisResult {
  readonly current_approval_rate: number
  readonly false_positive_rate: number
  readonly false_negative_rate: number
  readonly recommended_adjustment: string
}

async function analyzeThresholds(): Promise<ThresholdAnalysisResult> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - DATA_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('ai_judge_decisions')
    .select('id, decision, confidence, prediction_error, actual_engagement, was_posted, created_at')
    .gte('created_at', since)

  if (error) {
    throw new Error(`Failed to fetch ai_judge_decisions: ${error.message}`)
  }

  const rows = (data ?? []) as readonly JudgeDecisionRow[]

  if (rows.length === 0) {
    return {
      current_approval_rate: 0,
      false_positive_rate: 0,
      false_negative_rate: 0,
      recommended_adjustment: 'Insufficient data for threshold analysis',
    }
  }

  const approved = rows.filter((r) => r.decision === 'approve')
  const rejected = rows.filter((r) => r.decision === 'reject')
  const approvalRate = rows.length > 0 ? approved.length / rows.length : 0

  // False positives: approved but low actual engagement
  const approvedWithEngagement = approved.filter(
    (r) => r.actual_engagement !== null && r.was_posted === true,
  )
  const falsePositives = approvedWithEngagement.filter((r) => {
    const engagement = r.actual_engagement as Record<string, unknown>
    const engRate = typeof engagement?.engagement_rate === 'number' ? engagement.engagement_rate : 0
    return engRate < 0.01 // Below 1% engagement rate = low
  })
  const falsePositiveRate =
    approvedWithEngagement.length > 0
      ? falsePositives.length / approvedWithEngagement.length
      : 0

  // False negative rate: estimated from rejected count vs approval rate
  // True false negatives are hard to measure; use rejection rate as proxy
  const falseNegativeRate = rejected.length > 0 ? rejected.length / rows.length : 0

  // Determine recommended adjustment
  let recommended_adjustment = 'No adjustment needed'
  if (falsePositiveRate > 0.3) {
    recommended_adjustment = 'Increase approval threshold — too many false positives (>30%)'
  } else if (approvalRate < 0.3) {
    recommended_adjustment = 'Decrease approval threshold — approval rate too low (<30%)'
  } else if (falsePositiveRate < 0.1 && approvalRate < 0.5) {
    recommended_adjustment = 'Consider lowering threshold slightly — low false positive rate suggests room for more approvals'
  }

  return {
    current_approval_rate: approvalRate,
    false_positive_rate: falsePositiveRate,
    false_negative_rate: falseNegativeRate,
    recommended_adjustment,
  }
}

// ============================================================
// Step 3: Content Strategy Gaps
// ============================================================

interface ScheduleGapsResult {
  readonly underutilized: readonly {
    readonly day: number
    readonly hour: number
    readonly recommendation_score: number
    readonly current_posts: number
  }[]
  readonly oversaturated: readonly {
    readonly day: number
    readonly hour: number
    readonly current_posts: number
  }[]
}

async function analyzeScheduleGaps(): Promise<ScheduleGapsResult> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('cortex_temporal_patterns')
    .select('day_of_week, hour_jst, recommendation_score, sample_count, platform')
    .order('recommendation_score', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch cortex_temporal_patterns: ${error.message}`)
  }

  const rows = (data ?? []) as readonly TemporalPatternRow[]

  if (rows.length === 0) {
    return { underutilized: [], oversaturated: [] }
  }

  // Identify underutilized: high recommendation but low sample count (proxy for low post count)
  const underutilized = rows
    .filter((r) => r.recommendation_score > 0.7 && r.sample_count < 5)
    .map((r) => ({
      day: r.day_of_week,
      hour: r.hour_jst,
      recommendation_score: r.recommendation_score,
      current_posts: r.sample_count,
    }))

  // Identify oversaturated: high sample count but low recommendation score
  const oversaturated = rows
    .filter((r) => r.sample_count > 20 && r.recommendation_score < 0.3)
    .map((r) => ({
      day: r.day_of_week,
      hour: r.hour_jst,
      current_posts: r.sample_count,
    }))

  return { underutilized, oversaturated }
}

// ============================================================
// Step 4: Generate Improvement Proposals via Claude
// ============================================================

async function synthesizeProposals(
  patternAnalysis: PatternAnalysisResult,
  thresholdAnalysis: ThresholdAnalysisResult,
  scheduleGaps: ScheduleGapsResult,
): Promise<{ readonly proposals: readonly ImprovementProposal[]; readonly executive_summary: string }> {
  const anthropic = getAnthropic()

  const prompt = `You are an AI content strategy analyst. Analyze the following performance data and generate concrete improvement proposals.

## Pattern Performance Data

### Underperforming Patterns (success_rate < 0.4, uses >= 10):
${JSON.stringify(patternAnalysis.underperforming, null, 2)}

### High-Performing Patterns (success_rate > 0.7, uses >= 5):
${JSON.stringify(patternAnalysis.high_performing, null, 2)}

### New Pattern Candidates (from viral analysis, replicability > 0.7):
${JSON.stringify(patternAnalysis.new_candidates, null, 2)}

## AI Judge Threshold Analysis

- Approval rate: ${(thresholdAnalysis.current_approval_rate * 100).toFixed(1)}%
- False positive rate: ${(thresholdAnalysis.false_positive_rate * 100).toFixed(1)}%
- False negative rate: ${(thresholdAnalysis.false_negative_rate * 100).toFixed(1)}%
- Recommended adjustment: ${thresholdAnalysis.recommended_adjustment}

## Schedule Gaps

### Underutilized Time Slots:
${JSON.stringify(scheduleGaps.underutilized, null, 2)}

### Oversaturated Time Slots:
${JSON.stringify(scheduleGaps.oversaturated, null, 2)}

## Instructions

Generate a JSON response with:
1. "proposals": An array of improvement proposals. Each proposal must have:
   - "category": one of "new_pattern", "threshold_adjustment", "schedule_change", "pattern_deprecation"
   - "title": concise title
   - "description": what to change
   - "evidence": data backing this proposal
   - "affected_files": array of file paths that would need changes (use paths like "lib/viral-hooks/hook-templates.ts", "lib/ai-judge/config.ts", etc.)
   - "risk_level": "low", "medium", or "high"
   - "expected_impact": expected outcome
   - "implementation_notes": how to implement

2. "executive_summary": A concise 2-3 sentence summary of the overall findings and top recommendations.

Focus on actionable, data-driven proposals. Only propose changes backed by evidence. Respond with valid JSON only.`

  const message = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: MAX_SYNTHESIS_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude API')
  }

  // Extract JSON from response (handle markdown code blocks)
  const rawText = textBlock.text.trim()
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawText

  const parsed = JSON.parse(jsonStr) as {
    proposals: ImprovementProposal[]
    executive_summary: string
  }

  return {
    proposals: parsed.proposals ?? [],
    executive_summary: parsed.executive_summary ?? 'No summary generated.',
  }
}

// ============================================================
// Step 5: Save Results
// ============================================================

async function saveResults(
  report: AutoImprovementReport,
): Promise<void> {
  const supabase = getSupabase()

  // Collect all affected files from proposals
  const allAffectedFiles = Array.from(
    new Set(report.proposals.flatMap((p) => p.affected_files)),
  )

  const { error } = await supabase.from('cortex_conversation_log').insert({
    channel: 'slack',
    conversation_type: 'strategy_update',
    summary: report.executive_summary,
    key_decisions: report.proposals.map((p) => `[${p.category}] ${p.title}`),
    action_items: {
      proposals: report.proposals,
      pattern_analysis: report.pattern_analysis,
      threshold_analysis: report.threshold_analysis,
      schedule_gaps: report.schedule_gaps,
    },
    affected_files: allAffectedFiles,
    priority: 'medium',
    status: 'pending',
  })

  if (error) {
    throw new Error(`Failed to save conversation log: ${error.message}`)
  }

  process.stdout.write(`${LOG_PREFIX} Saved improvement report to cortex_conversation_log\n`)
}

async function sendSlackNotification(report: AutoImprovementReport): Promise<void> {
  const channel = process.env.SLACK_GENERAL_CHANNEL_ID || process.env.SLACK_DEFAULT_CHANNEL

  if (!channel) {
    process.stdout.write(`${LOG_PREFIX} No Slack channel configured, skipping notification\n`)
    return
  }

  const proposalLines = report.proposals.map(
    (p) => `  - [${p.risk_level.toUpperCase()}] ${p.title} (${p.category})`,
  )

  const text = [
    `:brain: *CORTEX Auto-Improvement Report*`,
    ``,
    `*Period:* Last ${report.data_period_days} days`,
    `*Analyzed at:* ${report.analyzed_at}`,
    ``,
    `*Pattern Analysis:*`,
    `  Underperforming: ${report.pattern_analysis.underperforming.length}`,
    `  High-performing: ${report.pattern_analysis.high_performing.length}`,
    `  New candidates: ${report.pattern_analysis.new_candidates.length}`,
    ``,
    `*Threshold Analysis:*`,
    `  Approval rate: ${(report.threshold_analysis.current_approval_rate * 100).toFixed(1)}%`,
    `  False positive rate: ${(report.threshold_analysis.false_positive_rate * 100).toFixed(1)}%`,
    ``,
    `*Proposals (${report.proposals.length}):*`,
    ...proposalLines,
    ``,
    `*Summary:* ${report.executive_summary}`,
  ].join('\n')

  try {
    await sendMessage({ channel, text })
  } catch (error) {
    process.stdout.write(
      `${LOG_PREFIX} Failed to send Slack notification: ${error instanceof Error ? error.message : String(error)}\n`,
    )
  }
}

// ============================================================
// Main: Run Auto-Improver
// ============================================================

export async function runAutoImprover(): Promise<AutoImprovementReport> {
  process.stdout.write(`${LOG_PREFIX} Starting auto-improvement analysis...\n`)

  // Step 1-3: Run analyses in parallel
  const [patternAnalysis, thresholdAnalysis, scheduleGaps] = await Promise.all([
    analyzePatternPerformance(),
    analyzeThresholds(),
    analyzeScheduleGaps(),
  ])

  process.stdout.write(
    `${LOG_PREFIX} Analysis complete: ${patternAnalysis.underperforming.length} underperforming, ` +
    `${patternAnalysis.high_performing.length} high-performing, ` +
    `${patternAnalysis.new_candidates.length} new candidates\n`,
  )

  // Step 4: Generate proposals via Claude
  const { proposals, executive_summary } = await synthesizeProposals(
    patternAnalysis,
    thresholdAnalysis,
    scheduleGaps,
  )

  process.stdout.write(`${LOG_PREFIX} Generated ${proposals.length} improvement proposals\n`)

  // Build report
  const report: AutoImprovementReport = {
    analyzed_at: new Date().toISOString(),
    data_period_days: DATA_PERIOD_DAYS,
    pattern_analysis: patternAnalysis,
    threshold_analysis: thresholdAnalysis,
    schedule_gaps: scheduleGaps,
    proposals,
    executive_summary,
  }

  // Step 5: Save results and notify (in parallel)
  await Promise.all([
    saveResults(report),
    sendSlackNotification(report),
  ])

  process.stdout.write(`${LOG_PREFIX} Auto-improvement analysis complete.\n`)

  return report
}
