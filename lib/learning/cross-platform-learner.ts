/**
 * クロスプラットフォーム学習
 *
 * X↔LinkedInのパターン成功移転。
 * 成功率 > 60% + 使用回数 > 5 + 他プラットフォームで使用 < 3 → 移転候補。
 */

import { createClient } from '@supabase/supabase-js'
import { notifyLearningEvent } from '../ai-judge/slack-notifier'
import type { Platform } from '../ai-judge/types'

// ============================================================
// Constants
// ============================================================

const MAX_CROSS_PATTERNS_PER_RUN = 3
const MIN_SUCCESS_RATE = 0.6
const MIN_TOTAL_USES = 5
const MAX_TARGET_USES = 3

// ============================================================
// Types
// ============================================================

interface PatternPerformanceRow {
  readonly id: string
  readonly pattern_id: string
  readonly platform: string
  readonly successes: number
  readonly failures: number
  readonly total_uses: number
  readonly avg_engagement: number
  readonly last_used_at: string | null
  readonly cross_platform_source: string | null
}

interface CrossPatternCandidate {
  readonly patternId: string
  readonly sourcePlatform: Platform
  readonly targetPlatform: Platform
  readonly successRate: number
  readonly totalUses: number
  readonly avgEngagement: number
}

// ============================================================
// Supabase Client
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

// ============================================================
// Fetch All Pattern Performance
// ============================================================

async function fetchAllPatternPerformance(): Promise<readonly PatternPerformanceRow[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('pattern_performance')
    .select('*')

  if (error) {
    throw new Error(`Failed to fetch pattern performance: ${error.message}`)
  }

  return (data ?? []) as PatternPerformanceRow[]
}

// ============================================================
// Identify Cross-Platform Candidates
// ============================================================

function identifyCrossPatternCandidates(
  allStats: readonly PatternPerformanceRow[],
): readonly CrossPatternCandidate[] {
  const candidates: CrossPatternCandidate[] = []

  // Group by pattern_id
  const patternMap = new Map<string, PatternPerformanceRow[]>()
  for (const stat of allStats) {
    const existing = patternMap.get(stat.pattern_id) ?? []
    patternMap.set(stat.pattern_id, [...existing, stat])
  }

  const platforms: readonly Platform[] = ['x', 'linkedin']

  for (const [patternId, stats] of Array.from(patternMap.entries())) {
    for (const sourcePlatform of platforms) {
      const sourceStats = stats.find((s: PatternPerformanceRow) => s.platform === sourcePlatform)
      if (!sourceStats) continue

      // Check source meets criteria
      if (sourceStats.total_uses < MIN_TOTAL_USES) continue
      const successRate = sourceStats.successes / sourceStats.total_uses
      if (successRate < MIN_SUCCESS_RATE) continue

      // Check target platform usage
      for (const targetPlatform of platforms) {
        if (targetPlatform === sourcePlatform) continue

        const targetStats = stats.find((s: PatternPerformanceRow) => s.platform === targetPlatform)
        const targetUses = targetStats?.total_uses ?? 0

        if (targetUses < MAX_TARGET_USES) {
          candidates.push({
            patternId,
            sourcePlatform,
            targetPlatform,
            successRate,
            totalUses: sourceStats.total_uses,
            avgEngagement: sourceStats.avg_engagement,
          })
        }
      }
    }
  }

  // Sort by success rate (highest first) and limit
  return candidates
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, MAX_CROSS_PATTERNS_PER_RUN)
}

// ============================================================
// Transfer Pattern
// ============================================================

async function transferPattern(
  candidate: CrossPatternCandidate,
): Promise<boolean> {
  const supabase = getSupabase()

  // Check if warm-start already exists
  const { data: existing } = await supabase
    .from('pattern_performance')
    .select('id')
    .eq('pattern_id', candidate.patternId)
    .eq('platform', candidate.targetPlatform)
    .limit(1)

  if (existing && existing.length > 0) {
    // Already has data on target platform, skip
    return false
  }

  // Insert warm-start prior
  const now = new Date().toISOString()
  const { error: insertError } = await supabase
    .from('pattern_performance')
    .insert({
      pattern_id: candidate.patternId,
      platform: candidate.targetPlatform,
      successes: 1,
      failures: 0,
      total_uses: 1,
      avg_engagement: 0,
      last_used_at: now,
      cross_platform_source: candidate.sourcePlatform,
    })

  if (insertError) {
    process.stdout.write(`Cross-Platform: Insert error for ${candidate.patternId}: ${insertError.message}\n`)
    return false
  }

  // Record learning pipeline event
  try {
    await supabase.from('learning_pipeline_events').insert({
      event_type: 'cross_platform_transfer',
      platform: candidate.targetPlatform,
      data: {
        patternId: candidate.patternId,
        sourcePlatform: candidate.sourcePlatform,
        targetPlatform: candidate.targetPlatform,
        successRate: candidate.successRate,
        totalUses: candidate.totalUses,
        avgEngagement: candidate.avgEngagement,
      },
    })
  } catch {
    // Best-effort
  }

  return true
}

// ============================================================
// Main: Run Cross-Platform Learner
// ============================================================

export async function runCrossPlatformLearner(): Promise<void> {
  process.stdout.write('Cross-Platform Learner: Starting...\n')

  const allStats = await fetchAllPatternPerformance()

  if (allStats.length === 0) {
    process.stdout.write('Cross-Platform Learner: No pattern data available\n')
    return
  }

  const candidates = identifyCrossPatternCandidates(allStats)

  if (candidates.length === 0) {
    process.stdout.write('Cross-Platform Learner: No transfer candidates found\n')
    return
  }

  process.stdout.write(`Cross-Platform Learner: ${candidates.length} candidate(s) found\n`)

  let transferred = 0

  for (const candidate of candidates) {
    const success = await transferPattern(candidate)
    if (success) {
      transferred++
      process.stdout.write(
        `Cross-Platform Learner: Transferred "${candidate.patternId}" from ${candidate.sourcePlatform} to ${candidate.targetPlatform} (success rate: ${(candidate.successRate * 100).toFixed(0)}%)\n`,
      )
    }
  }

  // Notify if any transfers occurred
  if (transferred > 0) {
    try {
      const summaryItems = candidates
        .slice(0, transferred)
        .map((c) => `${c.sourcePlatform}→${c.targetPlatform}: "${c.patternId}" (${(c.successRate * 100).toFixed(0)}%)`)

      await notifyLearningEvent({
        eventType: 'cross_platform_transfer',
        summary: `クロス学習: ${transferred}件のパターンを移転\n${summaryItems.join('\n')}`,
        details: {
          transferred,
          candidates: candidates.length,
        },
      })
    } catch {
      // Best-effort
    }
  }

  process.stdout.write(`Cross-Platform Learner: ${transferred} pattern(s) transferred\n`)
}
