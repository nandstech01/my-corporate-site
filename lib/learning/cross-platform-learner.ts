/**
 * クロスプラットフォーム学習 (Bayesian Transfer)
 *
 * Bayesian prior transfer across platforms.
 * Uses platform similarity to scale the strength of transferred priors.
 * Monitors divergence to adaptively adjust transfer strength.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyLearningEvent } from '../ai-judge/slack-notifier'
import type { Platform } from '../ai-judge/types'
import {
  calculateTransferPrior,
  klDivergenceBeta,
  adaptiveTransferStrength,
  getPlatformSimilarity,
  DEFAULT_TRANSFER_CONFIG,
} from './bayesian-transfer'
import type { TransferConfig } from './bayesian-transfer'

// ============================================================
// Constants
// ============================================================

const MAX_TRANSFERS_PER_RUN = 5
const DIVERGENCE_THRESHOLD = 0.5
const MIN_TARGET_USES_FOR_DIVERGENCE = 5
const MAX_TARGET_USES_FOR_PRIOR = 10

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

interface BayesianTransferResult {
  readonly patternId: string
  readonly sourcePlatform: Platform
  readonly targetPlatform: Platform
  readonly priorAlpha: number
  readonly priorBeta: number
  readonly isUpdate: boolean
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
// Transfer Patterns with Bayesian Prior
// ============================================================

async function transferPatternsWithBayesianPrior(
  allStats: readonly PatternPerformanceRow[],
  config: TransferConfig = DEFAULT_TRANSFER_CONFIG,
): Promise<readonly BayesianTransferResult[]> {
  const supabase = getSupabase()
  const platforms: readonly Platform[] = ['x', 'linkedin', 'threads', 'instagram']
  const results: BayesianTransferResult[] = []

  // Group by pattern_id
  const patternMap = new Map<string, readonly PatternPerformanceRow[]>()
  for (const stat of allStats) {
    const existing = patternMap.get(stat.pattern_id) ?? []
    patternMap.set(stat.pattern_id, [...existing, stat])
  }

  for (const sourcePlatform of platforms) {
    // Get patterns with enough uses on source platform
    const sourcePatterns = allStats.filter(
      (s) =>
        s.platform === sourcePlatform &&
        s.total_uses >= config.minSourceUses,
    )

    for (const sourceRow of sourcePatterns) {
      const successRate = sourceRow.successes / sourceRow.total_uses
      if (successRate < config.minSourceSuccessRate) continue

      for (const targetPlatform of platforms) {
        if (targetPlatform === sourcePlatform) continue
        if (results.length >= MAX_TRANSFERS_PER_RUN) break

        const similarity = getPlatformSimilarity(sourcePlatform, targetPlatform)
        if (similarity <= 0) continue

        // Calculate Bayesian prior from source performance
        const sourceAlpha = sourceRow.successes + 1
        const sourceBeta = sourceRow.failures + 1
        const prior = calculateTransferPrior({
          sourceAlpha,
          sourceBeta,
          transferStrength: config.transferStrength,
          platformSimilarity: similarity,
          maxPriorUses: config.maxPriorUses,
        })

        // Check if pattern already exists on target
        const existingStats = (patternMap.get(sourceRow.pattern_id) ?? [])
          .find((s) => s.platform === targetPlatform)

        const now = new Date().toISOString()

        if (existingStats && existingStats.total_uses < MAX_TARGET_USES_FOR_PRIOR
            && !existingStats.cross_platform_source) {
          // Add Bayesian prior to existing successes/failures
          const updatedSuccesses = existingStats.successes + (prior.alpha - 1)
          const updatedFailures = existingStats.failures + (prior.beta - 1)
          const updatedTotalUses = updatedSuccesses + updatedFailures

          const { error: updateError } = await supabase
            .from('pattern_performance')
            .update({
              successes: Math.round(updatedSuccesses),
              failures: Math.round(updatedFailures),
              total_uses: Math.round(updatedTotalUses),
              cross_platform_source: sourcePlatform,
            })
            .eq('pattern_id', sourceRow.pattern_id)
            .eq('platform', targetPlatform)

          if (updateError) {
            process.stdout.write(
              `Bayesian Transfer: Update error for ${sourceRow.pattern_id} on ${targetPlatform}: ${updateError.message}\n`,
            )
            continue
          }

          results.push({
            patternId: sourceRow.pattern_id,
            sourcePlatform,
            targetPlatform,
            priorAlpha: prior.alpha,
            priorBeta: prior.beta,
            isUpdate: true,
          })
        } else if (!existingStats) {
          // Create new entry with transferred prior
          const { error: insertError } = await supabase
            .from('pattern_performance')
            .insert({
              pattern_id: sourceRow.pattern_id,
              platform: targetPlatform,
              successes: Math.round(prior.alpha - 1),
              failures: Math.round(prior.beta - 1),
              total_uses: Math.round(prior.alpha + prior.beta - 2),
              avg_engagement: 0,
              last_used_at: now,
              cross_platform_source: sourcePlatform,
            })

          if (insertError) {
            process.stdout.write(
              `Bayesian Transfer: Insert error for ${sourceRow.pattern_id} on ${targetPlatform}: ${insertError.message}\n`,
            )
            continue
          }

          results.push({
            patternId: sourceRow.pattern_id,
            sourcePlatform,
            targetPlatform,
            priorAlpha: prior.alpha,
            priorBeta: prior.beta,
            isUpdate: false,
          })
        }

        // Record transfer event
        try {
          await supabase.from('learning_pipeline_events').insert({
            event_type: 'bayesian_transfer',
            platform: targetPlatform,
            post_id: `transfer:${sourceRow.pattern_id}`,
            data: {
              patternId: sourceRow.pattern_id,
              sourcePlatform,
              targetPlatform,
              priorAlpha: prior.alpha,
              priorBeta: prior.beta,
              sourceSuccessRate: successRate,
              similarity,
              transferStrength: config.transferStrength,
            },
          })
        } catch {
          // Best-effort
        }
      }

      if (results.length >= MAX_TRANSFERS_PER_RUN) break
    }

    if (results.length >= MAX_TRANSFERS_PER_RUN) break
  }

  return results
}

// ============================================================
// Check Divergence for Previously Transferred Patterns
// ============================================================

async function checkTransferDivergence(
  allStats: readonly PatternPerformanceRow[],
  config: TransferConfig = DEFAULT_TRANSFER_CONFIG,
): Promise<void> {
  const supabase = getSupabase()

  // Find patterns that were transferred and have enough observation on target
  const transferredPatterns = allStats.filter(
    (s) =>
      s.cross_platform_source !== null &&
      s.total_uses >= MIN_TARGET_USES_FOR_DIVERGENCE,
  )

  for (const targetRow of transferredPatterns) {
    const sourcePlatform = targetRow.cross_platform_source as Platform
    const targetPlatform = targetRow.platform as Platform

    // Find source stats
    const sourceRow = allStats.find(
      (s) =>
        s.pattern_id === targetRow.pattern_id &&
        s.platform === sourcePlatform,
    )

    if (!sourceRow) continue

    // Transferred prior (what we expected)
    const similarity = getPlatformSimilarity(sourcePlatform, targetPlatform)
    const prior = calculateTransferPrior({
      sourceAlpha: sourceRow.successes + 1,
      sourceBeta: sourceRow.failures + 1,
      transferStrength: config.transferStrength,
      platformSimilarity: similarity,
      maxPriorUses: config.maxPriorUses,
    })

    // Observed posterior on target
    const observedAlpha = targetRow.successes + 1
    const observedBeta = targetRow.failures + 1

    // KL divergence between transferred prior and observed posterior
    const divergence = klDivergenceBeta(
      observedAlpha,
      observedBeta,
      prior.alpha,
      prior.beta,
    )

    // Adapt transfer strength
    const adjustedStrength = adaptiveTransferStrength(
      config.transferStrength,
      divergence,
      DIVERGENCE_THRESHOLD,
    )

    const strengthChanged = Math.abs(adjustedStrength - config.transferStrength) > 0.001

    if (strengthChanged) {
      process.stdout.write(
        `Bayesian Transfer: Divergence for ${targetRow.pattern_id} (${sourcePlatform}->${targetPlatform}): ` +
          `KL=${divergence.toFixed(4)}, strength ${config.transferStrength.toFixed(2)} -> ${adjustedStrength.toFixed(2)}\n`,
      )
    }

    // Log divergence check to pipeline events
    try {
      await supabase.from('learning_pipeline_events').insert({
        event_type: 'bayesian_transfer',
        platform: targetPlatform,
        post_id: `divergence:${targetRow.pattern_id}`,
        data: {
          action: 'divergence_check',
          patternId: targetRow.pattern_id,
          sourcePlatform,
          targetPlatform,
          klDivergence: divergence,
          currentStrength: config.transferStrength,
          adjustedStrength,
          observedAlpha,
          observedBeta,
          priorAlpha: prior.alpha,
          priorBeta: prior.beta,
        },
      })
    } catch {
      // Best-effort
    }
  }
}

// ============================================================
// Main: Run Cross-Platform Learner
// ============================================================

export async function runCrossPlatformLearner(): Promise<void> {
  process.stdout.write('Cross-Platform Learner: Starting (Bayesian transfer)...\n')

  const allStats = await fetchAllPatternPerformance()

  if (allStats.length === 0) {
    process.stdout.write('Cross-Platform Learner: No pattern data available\n')
    return
  }

  // Phase 1: Transfer patterns with Bayesian priors
  const transferResults = await transferPatternsWithBayesianPrior(allStats)

  if (transferResults.length === 0) {
    process.stdout.write('Cross-Platform Learner: No Bayesian transfer candidates found\n')
  } else {
    for (const result of transferResults) {
      process.stdout.write(
        `Cross-Platform Learner: Bayesian transfer "${result.patternId}" ` +
          `${result.sourcePlatform}->${result.targetPlatform} ` +
          `(alpha=${result.priorAlpha.toFixed(2)}, beta=${result.priorBeta.toFixed(2)}, ` +
          `${result.isUpdate ? 'updated' : 'new'})\n`,
      )
    }
  }

  // Phase 2: Check divergence for previously transferred patterns
  await checkTransferDivergence(allStats)

  // Notify if any transfers occurred
  if (transferResults.length > 0) {
    try {
      const summaryItems = transferResults.map(
        (r) =>
          `${r.sourcePlatform}->${r.targetPlatform}: "${r.patternId}" ` +
          `(a=${r.priorAlpha.toFixed(2)}, b=${r.priorBeta.toFixed(2)})`,
      )

      await notifyLearningEvent({
        eventType: 'cross_platform_transfer',
        summary: `Bayesian移転: ${transferResults.length}件のパターンを移転\n${summaryItems.join('\n')}`,
        details: {
          transferred: transferResults.length,
          results: transferResults,
        },
      })
    } catch {
      // Best-effort
    }
  }

  process.stdout.write(
    `Cross-Platform Learner: ${transferResults.length} Bayesian transfer(s) completed\n`,
  )
}
