/**
 * Model Drift Detector
 *
 * Monitors prediction accuracy over rolling 7-day windows.
 * Triggers retraining when rolling MAE exceeds 2x training baseline
 * for 3 consecutive days.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyLearningEvent } from '../ai-judge/slack-notifier'
import type { Platform } from '../ai-judge/types'

// ============================================================
// Types
// ============================================================

export interface DriftCheckResult {
  readonly drifted: boolean
  readonly shouldRetrain: boolean
  readonly rollingMae: number
  readonly trainingMae: number
  readonly consecutiveDriftDays: number
  readonly shortTermMae: number
  readonly longTermMae: number
  readonly shortTermDrift: boolean
}

interface DriftLogRow {
  readonly id: string
  readonly platform: string
  readonly model_version: string
  readonly date: string
  readonly rolling_mae: number
  readonly training_mae: number
  readonly sample_count: number
  readonly is_drifted: boolean
  readonly retrain_triggered: boolean
}

// ============================================================
// Constants
// ============================================================

const ROLLING_WINDOW_DAYS = 7
const SHORT_WINDOW_DAYS = 7
const LONG_WINDOW_DAYS = 30
const DRIFT_MULTIPLIER = 2
const CONSECUTIVE_DRIFT_THRESHOLD = 3
const DEFAULT_MODEL_VERSION = 'v1.0'
const DEFAULT_TRAINING_MAE = 0.15

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
// Calculate Rolling MAE
// ============================================================

async function calculateRollingMae(platform: Platform, days: number = ROLLING_WINDOW_DAYS): Promise<{
  readonly mae: number
  readonly sampleCount: number
}> {
  const supabase = getSupabase()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('prediction_accuracy')
    .select('absolute_error')
    .eq('platform', platform)
    .gte('measured_at', since.toISOString())

  if (error) {
    throw new Error(`Failed to calculate rolling MAE: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return { mae: 0, sampleCount: 0 }
  }

  const totalError = data.reduce(
    (sum: number, row: { readonly absolute_error: number }) => sum + row.absolute_error,
    0,
  )

  return {
    mae: totalError / data.length,
    sampleCount: data.length,
  }
}

// ============================================================
// Get Training Baseline MAE
// ============================================================

async function getTrainingBaselineMae(platform: Platform): Promise<number> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('model_drift_log')
    .select('training_mae')
    .eq('platform', platform)
    .eq('is_drifted', false)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(`Failed to get training baseline: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return DEFAULT_TRAINING_MAE
  }

  return (data[0] as { readonly training_mae: number }).training_mae
}

// ============================================================
// Count Consecutive Drift Days
// ============================================================

async function countConsecutiveDriftDays(platform: Platform): Promise<number> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('model_drift_log')
    .select('is_drifted, date')
    .eq('platform', platform)
    .order('date', { ascending: false })
    .limit(CONSECUTIVE_DRIFT_THRESHOLD + 1)

  if (error) {
    throw new Error(`Failed to count consecutive drift days: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return 0
  }

  let consecutive = 0
  const rows = data as unknown as readonly Pick<DriftLogRow, 'is_drifted' | 'date'>[]

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].is_drifted) {
      consecutive++
    } else {
      break
    }
  }

  return consecutive
}

// ============================================================
// Insert Drift Log Entry
// ============================================================

async function insertDriftLogEntry(params: {
  readonly platform: Platform
  readonly rollingMae: number
  readonly trainingMae: number
  readonly sampleCount: number
  readonly isDrifted: boolean
  readonly retrainTriggered: boolean
}): Promise<void> {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('model_drift_log').upsert(
    {
      platform: params.platform,
      model_version: DEFAULT_MODEL_VERSION,
      date: today,
      rolling_mae: params.rollingMae,
      training_mae: params.trainingMae,
      sample_count: params.sampleCount,
      is_drifted: params.isDrifted,
      retrain_triggered: params.retrainTriggered,
    },
    { onConflict: 'platform,model_version,date' },
  )

  if (error) {
    throw new Error(`Failed to insert drift log: ${error.message}`)
  }
}

// ============================================================
// Main: Check Model Drift
// ============================================================

export async function checkModelDrift(platform: Platform): Promise<DriftCheckResult> {
  try {
    const [{ mae: rollingMae, sampleCount }, trainingMae] = await Promise.all([
      calculateRollingMae(platform),
      getTrainingBaselineMae(platform),
    ])

    // Not enough data to evaluate drift
    if (sampleCount === 0) {
      return {
        drifted: false,
        shouldRetrain: false,
        rollingMae: 0,
        trainingMae,
        consecutiveDriftDays: 0,
        shortTermMae: 0,
        longTermMae: 0,
        shortTermDrift: false,
      }
    }

    const isDrifted = rollingMae > trainingMae * DRIFT_MULTIPLIER

    // Record today's drift status
    await insertDriftLogEntry({
      platform,
      rollingMae,
      trainingMae,
      sampleCount,
      isDrifted,
      retrainTriggered: false,
    })

    // Count consecutive drift days (including today's entry)
    const consecutiveDriftDays = await countConsecutiveDriftDays(platform)
    const shouldRetrain = consecutiveDriftDays >= CONSECUTIVE_DRIFT_THRESHOLD

    // Mark retrain triggered if applicable
    if (shouldRetrain) {
      const supabase = getSupabase()
      const today = new Date().toISOString().split('T')[0]

      try {
        await supabase
          .from('model_drift_log')
          .update({ retrain_triggered: true })
          .eq('platform', platform)
          .eq('model_version', DEFAULT_MODEL_VERSION)
          .eq('date', today)
      } catch {
        // Best-effort update
      }
    }

    // Send notification if drifted
    if (isDrifted) {
      try {
        await notifyLearningEvent({
          eventType: 'drift_detected',
          summary: shouldRetrain
            ? `Model drift detected for ${platform}: ${consecutiveDriftDays} consecutive days. Retraining recommended. Rolling MAE=${rollingMae.toFixed(3)} vs Training MAE=${trainingMae.toFixed(3)}`
            : `Model drift warning for ${platform}: Rolling MAE=${rollingMae.toFixed(3)} exceeds ${DRIFT_MULTIPLIER}x training MAE=${trainingMae.toFixed(3)} (day ${consecutiveDriftDays}/${CONSECUTIVE_DRIFT_THRESHOLD})`,
          details: {
            platform,
            rollingMae,
            trainingMae,
            driftMultiplier: DRIFT_MULTIPLIER,
            sampleCount,
            consecutiveDriftDays,
            shouldRetrain,
          },
        })
      } catch {
        // Best-effort notification
      }
    }

    // Two-stage drift: short-term (7d) vs long-term (30d) comparison
    const [shortTerm, longTerm] = await Promise.all([
      calculateRollingMae(platform, SHORT_WINDOW_DAYS),
      calculateRollingMae(platform, LONG_WINDOW_DAYS),
    ])

    const shortTermDrift =
      longTerm.sampleCount >= 5 &&
      shortTerm.sampleCount >= 3 &&
      shortTerm.mae > longTerm.mae * 1.5

    if (shortTermDrift) {
      process.stdout.write(
        `Short-term drift [${platform}]: 7d MAE=${shortTerm.mae.toFixed(3)} vs 30d MAE=${longTerm.mae.toFixed(3)}\n`,
      )
    }

    return {
      drifted: isDrifted,
      shouldRetrain,
      rollingMae,
      trainingMae,
      consecutiveDriftDays,
      shortTermMae: shortTerm.mae,
      longTermMae: longTerm.mae,
      shortTermDrift,
    }
  } catch (error) {
    throw new Error(
      `Drift detection failed for ${platform}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// Record Training Baseline
// ============================================================

export async function recordTrainingBaseline(
  platform: Platform,
  mae: number,
  modelVersion: string,
): Promise<void> {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('model_drift_log').insert({
    platform,
    model_version: modelVersion,
    date: today,
    rolling_mae: mae,
    training_mae: mae,
    sample_count: 0,
    is_drifted: false,
    retrain_triggered: false,
  })

  if (error) {
    throw new Error(`Failed to record training baseline: ${error.message}`)
  }
}
