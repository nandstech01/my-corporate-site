/**
 * Pattern Bandit (Multi-Armed Bandit)
 *
 * Uses Thompson Sampling to optimize pattern selection.
 * Each pattern is modeled as a Beta distribution parameterized by
 * successes and failures from the pattern_performance table.
 * Selects the pattern with the highest sampled value.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyLearningEvent } from '../ai-judge/slack-notifier'
import type { Platform } from '../ai-judge/types'

// ============================================================
// Types
// ============================================================

export interface PatternStats {
  readonly patternId: string
  readonly platform: Platform
  readonly successes: number
  readonly failures: number
  readonly totalUses: number
  readonly avgEngagement: number
  readonly lastUsedAt: string | null
}

interface PatternPerformanceRow {
  readonly id: string
  readonly pattern_id: string
  readonly platform: string
  readonly successes: number
  readonly failures: number
  readonly total_uses: number
  readonly avg_engagement: number
  readonly last_used_at: string | null
  readonly updated_at: string | null
}

// ============================================================
// Constants
// ============================================================

const PATTERN_LEARNED_THRESHOLD = 5

// ============================================================
// Supabase Client
// ============================================================

let cachedSupabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
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
// Gamma Distribution Sampling (Marsaglia & Tsang method)
// ============================================================

function gammaSample(shape: number): number {
  // For shape < 1, use Ahrens-Dieter method
  if (shape < 1) {
    const u = Math.random()
    return gammaSample(shape + 1) * Math.pow(u, 1 / shape)
  }

  // Marsaglia & Tsang's method for shape >= 1
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)

  for (;;) {
    let x: number
    let v: number

    do {
      x = normalSample()
      v = 1 + c * x
    } while (v <= 0)

    v = v * v * v
    const u = Math.random()

    if (u < 1 - 0.0331 * (x * x) * (x * x)) {
      return d * v
    }

    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v
    }
  }
}

// ============================================================
// Standard Normal Sample (Box-Muller transform)
// ============================================================

function normalSample(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

// ============================================================
// Beta Distribution Sampling
// ============================================================

function betaSample(alpha: number, beta: number): number {
  const gammaA = gammaSample(alpha)
  const gammaB = gammaSample(beta)

  if (gammaA + gammaB === 0) {
    return 0.5
  }

  return gammaA / (gammaA + gammaB)
}

// ============================================================
// Fetch Pattern Performance
// ============================================================

async function fetchPatternPerformance(
  platform: Platform,
): Promise<readonly PatternStats[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('pattern_performance')
    .select('*')
    .eq('platform', platform)

  if (error) {
    throw new Error(`Failed to fetch pattern performance: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  return (data as readonly PatternPerformanceRow[]).map((row) => ({
    patternId: row.pattern_id,
    platform: row.platform as Platform,
    successes: row.successes,
    failures: row.failures,
    totalUses: row.total_uses,
    avgEngagement: row.avg_engagement,
    lastUsedAt: row.last_used_at,
  }))
}

// ============================================================
// Main: Select Pattern by Thompson Sampling
// ============================================================

export async function selectPatternByBandit(
  candidates: readonly string[],
  platform: Platform,
): Promise<string> {
  if (candidates.length === 0) {
    throw new Error('No candidate patterns provided')
  }

  if (candidates.length === 1) {
    return candidates[0]
  }

  try {
    const allStats = await fetchPatternPerformance(platform)

    // Build lookup map
    const statsMap = new Map<string, PatternStats>()
    allStats.forEach((stat) => {
      statsMap.set(stat.patternId, stat)
    })

    // Check if any candidates have data
    const hasAnyData = candidates.some((id) => statsMap.has(id))

    // Cold start: return random candidate
    if (!hasAnyData) {
      const randomIndex = Math.floor(Math.random() * candidates.length)
      return candidates[randomIndex]
    }

    // Thompson Sampling: sample from Beta(successes+1, failures+1)
    let bestPattern = candidates[0]
    let bestSample = -1

    candidates.forEach((patternId) => {
      const stats = statsMap.get(patternId)
      const alpha = stats ? stats.successes + 1 : 1
      const beta = stats ? stats.failures + 1 : 1
      const sample = betaSample(alpha, beta)

      if (sample > bestSample) {
        bestSample = sample
        bestPattern = patternId
      }
    })

    return bestPattern
  } catch {
    // Fallback to random on any error
    const randomIndex = Math.floor(Math.random() * candidates.length)
    return candidates[randomIndex]
  }
}

// ============================================================
// Record Pattern Outcome
// ============================================================

export async function recordPatternOutcome(
  patternId: string,
  platform: Platform,
  success: boolean,
  engagement: number,
  _retryCount = 0,
): Promise<void> {
  const supabase = getSupabase()

  try {
    // Fetch current stats for the pattern
    const { data: existing, error: fetchError } = await supabase
      .from('pattern_performance')
      .select('*')
      .eq('pattern_id', patternId)
      .eq('platform', platform)
      .limit(1)

    if (fetchError) {
      throw new Error(`Failed to fetch pattern stats: ${fetchError.message}`)
    }

    const now = new Date().toISOString()

    if (existing && existing.length > 0) {
      const current = existing[0] as PatternPerformanceRow
      const newSuccesses = current.successes + (success ? 1 : 0)
      const newFailures = current.failures + (success ? 0 : 1)
      const newTotalUses = current.total_uses + 1
      const newAvgEngagement =
        (current.avg_engagement * current.total_uses + engagement) / newTotalUses

      // Optimistic locking: include updated_at condition to detect concurrent writes
      // If updated_at is null (new record without DB default), skip locking for this update
      let updateQuery = supabase
        .from('pattern_performance')
        .update({
          successes: newSuccesses,
          failures: newFailures,
          total_uses: newTotalUses,
          avg_engagement: newAvgEngagement,
          last_used_at: now,
          updated_at: now,
        })
        .eq('pattern_id', patternId)
        .eq('platform', platform)

      if (current.updated_at) {
        updateQuery = updateQuery.eq('updated_at', current.updated_at)
      }

      const { data: updateResult, error: updateError } = await updateQuery.select('id')

      if (updateError) {
        throw new Error(`Failed to update pattern performance: ${updateError.message}`)
      }

      // If no rows updated, a concurrent write occurred — retry with limit
      if (!updateResult || updateResult.length === 0) {
        if (_retryCount >= 2) {
          process.stdout.write(
            `Pattern bandit: giving up after 3 attempts for "${patternId}" on ${platform}\n`,
          )
          return
        }
        process.stdout.write(
          `Pattern bandit: optimistic lock conflict for "${patternId}" on ${platform}, retrying (${_retryCount + 1}/3)\n`,
        )
        await recordPatternOutcome(patternId, platform, success, engagement, _retryCount + 1)
        return
      }

      // Notify if pattern is learned (success + enough data)
      if (success && newTotalUses > PATTERN_LEARNED_THRESHOLD) {
        try {
          await notifyLearningEvent({
            eventType: 'pattern_learned',
            summary: `Pattern "${patternId}" performing well on ${platform}: ${newSuccesses}/${newTotalUses} success rate, avg engagement=${newAvgEngagement.toFixed(3)}`,
            details: {
              patternId,
              platform,
              successes: newSuccesses,
              failures: newFailures,
              totalUses: newTotalUses,
              avgEngagement: newAvgEngagement,
            },
          })
        } catch {
          // Best-effort notification
        }
      }
    } else {
      // Insert new pattern record
      const { error: insertError } = await supabase.from('pattern_performance').insert({
        pattern_id: patternId,
        platform,
        successes: success ? 1 : 0,
        failures: success ? 0 : 1,
        total_uses: 1,
        avg_engagement: engagement,
        last_used_at: now,
      })

      if (insertError) {
        throw new Error(`Failed to insert pattern performance: ${insertError.message}`)
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to record pattern outcome: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// Admin: Get Pattern Stats
// ============================================================

export async function getPatternStats(
  platform: Platform,
): Promise<readonly PatternStats[]> {
  return fetchPatternPerformance(platform)
}
