/**
 * キャリブレーション連動閾値
 *
 * prediction_accuracy テーブルのMAEデータを信頼度閾値に反映。
 * 精度良好 → より許容的、精度悪化 → より保守的。
 */

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_CONFIDENCE_THRESHOLD } from './config'
import type { Platform } from './types'

// ============================================================
// Constants
// ============================================================

const ROLLING_WINDOW_DAYS = 7
const MIN_SAMPLES_FOR_CALIBRATION = 5
const MAE_GOOD_THRESHOLD = 0.15
const MAE_POOR_THRESHOLD = 0.30
const MAE_GOOD_ADJUSTMENT = -0.03
const MAE_POOR_ADJUSTMENT = 0.05
const THRESHOLD_MIN = 0.60
const THRESHOLD_MAX = 0.95

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
// Fetch Rolling MAE
// ============================================================

async function fetchRollingMae(platform: Platform): Promise<{
  readonly mae: number
  readonly sampleCount: number
}> {
  const supabase = getSupabase()
  const since = new Date()
  since.setDate(since.getDate() - ROLLING_WINDOW_DAYS)

  const { data, error } = await supabase
    .from('prediction_accuracy')
    .select('absolute_error')
    .eq('platform', platform)
    .gte('measured_at', since.toISOString())

  if (error) {
    throw new Error(`Failed to fetch rolling MAE: ${error.message}`)
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
// Main: Calibrated Threshold
// ============================================================

export async function getCalibratedThreshold(
  platform: Platform,
  todayPostCount: number,
): Promise<number> {
  // 1. Base threshold (same logic as getDynamicThreshold)
  const base = DEFAULT_CONFIDENCE_THRESHOLD
  const postCountPenalty = Math.min(todayPostCount * 0.03, 0.15)

  const platformAdjustment: Record<Platform, number> = {
    x: 0,
    linkedin: 0.02,
    instagram: 0.01,
  }

  const baseThreshold = base + postCountPenalty + platformAdjustment[platform]

  // 2. Fetch MAE data for calibration
  let calibrationAdjustment = 0

  try {
    const { mae, sampleCount } = await fetchRollingMae(platform)

    // Only calibrate with sufficient samples
    if (sampleCount >= MIN_SAMPLES_FOR_CALIBRATION) {
      if (mae < MAE_GOOD_THRESHOLD) {
        // Good accuracy → more permissive
        calibrationAdjustment = MAE_GOOD_ADJUSTMENT
      } else if (mae > MAE_POOR_THRESHOLD) {
        // Poor accuracy → more conservative
        calibrationAdjustment = MAE_POOR_ADJUSTMENT
      }
    }
  } catch {
    // Best-effort: use base threshold on failure
  }

  // 3. Clamp to [THRESHOLD_MIN, THRESHOLD_MAX]
  const finalThreshold = baseThreshold + calibrationAdjustment

  return Math.max(THRESHOLD_MIN, Math.min(THRESHOLD_MAX, finalThreshold))
}
