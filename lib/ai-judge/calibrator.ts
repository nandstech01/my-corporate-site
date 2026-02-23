/**
 * AI Judge Calibrator
 *
 * Daily prediction accuracy tracking and threshold auto-adjustment.
 * Compares predicted confidence vs actual engagement outcomes for recent posts.
 * Calculates MAE, triggers drift warnings when accuracy degrades.
 * cron: UTC 17:00 (JST 02:00)
 */

import { createClient } from '@supabase/supabase-js'
import { notifyLearningEvent } from './slack-notifier'
import type { AiJudgeDecisionRecord, Platform } from './types'

// ============================================================
// Types
// ============================================================

export interface CalibrationReport {
  readonly mae: number
  readonly samples: number
  readonly accuracy: number
  readonly trend: 'improving' | 'stable' | 'degrading'
}

interface PredictionRecord {
  readonly judgeDecisionId: string
  readonly platform: Platform
  readonly postId: string
  readonly confidence: number
  readonly actualEngagement: Record<string, unknown>
  readonly postedAt: string
}

// ============================================================
// Constants
// ============================================================

const MAE_WARNING_THRESHOLD = 0.25
const DEFAULT_REPORT_DAYS = 7
const MODEL_VERSION = 'v1.0'

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
// Engagement Score Extraction
// ============================================================

function computeEngagementScore(engagement: Record<string, unknown>): number {
  const likes = typeof engagement.likes === 'number' ? engagement.likes : 0
  const reposts = typeof engagement.reposts === 'number' ? engagement.reposts : 0
  const replies = typeof engagement.replies === 'number' ? engagement.replies : 0
  const impressions = typeof engagement.impressions === 'number' ? engagement.impressions : 1

  if (impressions <= 0) {
    return 0
  }

  return (likes + reposts * 2 + replies * 3) / impressions
}

// ============================================================
// Fetch Uncalibrated Decisions
// ============================================================

async function fetchUncalibratedDecisions(): Promise<readonly PredictionRecord[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('ai_judge_decisions')
    .select('id, platform, post_id, confidence, actual_engagement, posted_at')
    .eq('was_posted', true)
    .not('engagement_fetched_at', 'is', null)
    .is('prediction_error', null)
    .not('post_id', 'is', null)
    .not('actual_engagement', 'is', null)

  if (error) {
    throw new Error(`Failed to fetch uncalibrated decisions: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map((row: AiJudgeDecisionRecord) => ({
    judgeDecisionId: row.id,
    platform: row.platform,
    postId: row.post_id ?? '',
    confidence: row.confidence,
    actualEngagement: (row.actual_engagement ?? {}) as Record<string, unknown>,
    postedAt: row.posted_at ?? row.created_at,
  }))
}

// ============================================================
// Save Prediction Accuracy Record
// ============================================================

async function savePredictionAccuracy(params: {
  readonly judgeDecisionId: string
  readonly platform: Platform
  readonly postId: string
  readonly predictedEngagement: number
  readonly actualEngagement: number
  readonly absoluteError: number
  readonly percentageError: number
  readonly patternUsed: string | null
  readonly postedAt: string
}): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase.from('prediction_accuracy').insert({
    judge_decision_id: params.judgeDecisionId,
    platform: params.platform,
    post_id: params.postId,
    predicted_engagement: params.predictedEngagement,
    actual_engagement: params.actualEngagement,
    absolute_error: params.absoluteError,
    percentage_error: params.percentageError,
    model_version: MODEL_VERSION,
    pattern_used: params.patternUsed,
    posted_at: params.postedAt,
  })

  if (error) {
    throw new Error(`Failed to save prediction accuracy: ${error.message}`)
  }
}

// ============================================================
// Update Decision with Prediction Error
// ============================================================

async function updateDecisionPredictionError(
  decisionId: string,
  predictionError: number,
): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('ai_judge_decisions')
    .update({ prediction_error: predictionError })
    .eq('id', decisionId)

  if (error) {
    throw new Error(`Failed to update prediction error: ${error.message}`)
  }
}

// ============================================================
// Calculate MAE for Recent Period
// ============================================================

async function calculateRecentMae(days: number): Promise<{
  readonly mae: number
  readonly samples: number
}> {
  const supabase = getSupabase()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('prediction_accuracy')
    .select('absolute_error')
    .gte('measured_at', since.toISOString())

  if (error) {
    throw new Error(`Failed to calculate MAE: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return { mae: 0, samples: 0 }
  }

  const totalError = data.reduce(
    (sum: number, row: { readonly absolute_error: number }) => sum + row.absolute_error,
    0,
  )

  return {
    mae: totalError / data.length,
    samples: data.length,
  }
}

// ============================================================
// Calculate Trend
// ============================================================

async function calculateTrend(): Promise<'improving' | 'stable' | 'degrading'> {
  const supabase = getSupabase()
  const now = new Date()

  const recentStart = new Date(now)
  recentStart.setDate(recentStart.getDate() - 7)

  const previousStart = new Date(now)
  previousStart.setDate(previousStart.getDate() - 14)

  const [recentResult, previousResult] = await Promise.all([
    supabase
      .from('prediction_accuracy')
      .select('absolute_error')
      .gte('measured_at', recentStart.toISOString()),
    supabase
      .from('prediction_accuracy')
      .select('absolute_error')
      .gte('measured_at', previousStart.toISOString())
      .lt('measured_at', recentStart.toISOString()),
  ])

  if (recentResult.error || previousResult.error) {
    return 'stable'
  }

  const recentData = recentResult.data ?? []
  const previousData = previousResult.data ?? []

  if (recentData.length === 0 || previousData.length === 0) {
    return 'stable'
  }

  const recentMae =
    recentData.reduce(
      (sum: number, r: { readonly absolute_error: number }) => sum + r.absolute_error,
      0,
    ) / recentData.length

  const previousMae =
    previousData.reduce(
      (sum: number, r: { readonly absolute_error: number }) => sum + r.absolute_error,
      0,
    ) / previousData.length

  const changeRatio = (recentMae - previousMae) / (previousMae || 1)

  if (changeRatio < -0.1) {
    return 'improving'
  }
  if (changeRatio > 0.1) {
    return 'degrading'
  }
  return 'stable'
}

// ============================================================
// Main: Run Calibrator
// ============================================================

export async function runCalibrator(): Promise<void> {
  try {
    const uncalibrated = await fetchUncalibratedDecisions()

    if (uncalibrated.length === 0) {
      return
    }

    // Process each uncalibrated decision
    const processingPromises = uncalibrated.map(async (record) => {
      try {
        const actualScore = computeEngagementScore(record.actualEngagement)
        const absoluteError = Math.abs(record.confidence - actualScore)
        const percentageError =
          actualScore > 0 ? absoluteError / actualScore : absoluteError > 0 ? 1 : 0

        await savePredictionAccuracy({
          judgeDecisionId: record.judgeDecisionId,
          platform: record.platform,
          postId: record.postId,
          predictedEngagement: record.confidence,
          actualEngagement: actualScore,
          absoluteError,
          percentageError,
          patternUsed: null,
          postedAt: record.postedAt,
        })

        await updateDecisionPredictionError(record.judgeDecisionId, absoluteError)
      } catch {
        // Best-effort: individual record failure should not block others
      }
    })

    await Promise.all(processingPromises)

    // Calculate overall MAE for last 7 days
    const { mae, samples } = await calculateRecentMae(DEFAULT_REPORT_DAYS)

    // Warn if MAE exceeds threshold
    if (mae > MAE_WARNING_THRESHOLD && samples > 0) {
      try {
        await notifyLearningEvent({
          eventType: 'drift_detected',
          summary: `Prediction accuracy degraded: MAE=${mae.toFixed(3)} (threshold=${MAE_WARNING_THRESHOLD}), ${samples} samples over ${DEFAULT_REPORT_DAYS} days`,
          details: {
            mae,
            threshold: MAE_WARNING_THRESHOLD,
            samples,
            days: DEFAULT_REPORT_DAYS,
          },
        })
      } catch {
        // Best-effort notification
      }
    }

    // Summary notification
    try {
      await notifyLearningEvent({
        eventType: 'model_retrained',
        summary: `Prediction accuracy report: MAE=${mae.toFixed(3)}, ${samples} samples`,
        details: {
          mae,
          samples,
          newRecordsProcessed: uncalibrated.length,
          days: DEFAULT_REPORT_DAYS,
        },
      })
    } catch {
      // Best-effort notification
    }
  } catch (error) {
    throw new Error(
      `Calibrator failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// Admin API: Get Calibration Report
// ============================================================

export async function getCalibrationReport(
  days: number = DEFAULT_REPORT_DAYS,
): Promise<CalibrationReport> {
  const { mae, samples } = await calculateRecentMae(days)
  const trend = await calculateTrend()

  const accuracy = samples > 0 ? Math.max(0, 1 - mae) : 0

  return {
    mae,
    samples,
    accuracy,
    trend,
  }
}
