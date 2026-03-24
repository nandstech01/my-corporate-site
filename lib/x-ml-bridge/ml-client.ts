/**
 * Python ML subprocess ブリッジ (X / Twitter)
 *
 * child_process.execFile で Python CLI を呼び出し、JSON を返す。
 * Python未インストール or エラー時は null（graceful degradation）。
 */

import { execFile } from 'child_process'
import * as path from 'path'
import type { MlPrediction, MlInsights, MlTrainResult } from './types'

const ML_SERVICE_DIR = path.resolve(__dirname, '../../services/x-ml')
const TIMEOUT_MS = 30_000
const MAX_TEXT_LENGTH = 10_000

interface RawPredictionResult {
  readonly predicted_engagement: number
  readonly confidence: number
  readonly top_features: readonly { name: string; importance: number }[]
  readonly model_version: string
  readonly features: Record<string, number>
}

interface RawInsightsResult {
  readonly top_features: readonly { name: string; importance: number }[]
  readonly model_version: string
  readonly training_size: number
}

function runPythonCommand(
  command: string,
  args: readonly string[],
): Promise<string | null> {
  return new Promise((resolve) => {
    const fullArgs = ['-m', 'x_ml', command, ...args]

    execFile(
      'python3',
      fullArgs,
      {
        cwd: ML_SERVICE_DIR,
        timeout: TIMEOUT_MS,
        env: { ...process.env, PYTHONPATH: ML_SERVICE_DIR },
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          const isTimeout = error.killed && error.signal === 'SIGTERM'
          const label = isTimeout ? 'TIMEOUT' : 'ERROR'
          process.stdout.write(
            `X ML bridge ${label} (${command}): ${error.message}\n`,
          )
          if (stderr && !isTimeout) {
            process.stdout.write(`X ML stderr: ${stderr}\n`)
          }
          resolve(null)
          return
        }
        resolve(stdout.trim())
      },
    )
  })
}

export async function predictXEngagement(
  text: string,
  metadata: {
    readonly dayOfWeek: number
    readonly hour: number
    readonly postType?: string
    readonly hasMedia?: boolean
  },
): Promise<MlPrediction | null> {
  if (!text || text.length === 0) {
    return null
  }

  if (text.length > MAX_TEXT_LENGTH) {
    process.stdout.write(
      `X ML bridge: text too long (${text.length} > ${MAX_TEXT_LENGTH}), skipping\n`,
    )
    return null
  }

  const inputJson = JSON.stringify({
    text,
    day_of_week: Math.max(0, Math.min(6, metadata.dayOfWeek)),
    hour: Math.max(0, Math.min(23, metadata.hour)),
    post_type: metadata.postType ?? 'original',
    has_media: metadata.hasMedia ?? false,
  })

  const output = await runPythonCommand('predict', [
    '--input-json',
    inputJson,
  ])
  if (!output) return null

  try {
    const raw: RawPredictionResult = JSON.parse(output)
    if ('error' in raw) {
      process.stdout.write(`X ML prediction error: ${(raw as { error: string }).error}\n`)
      return null
    }

    return {
      predictedEngagement: raw.predicted_engagement,
      confidence: raw.confidence,
      topFeatures: raw.top_features,
      modelVersion: raw.model_version,
      features: raw.features ?? {},
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown parse error'
    process.stdout.write(`X ML output parse error: ${message}\n`)
    return null
  }
}

export async function getXInsights(): Promise<MlInsights | null> {
  const output = await runPythonCommand('insights', [])
  if (!output) return null

  try {
    const raw: RawInsightsResult = JSON.parse(output)
    return {
      topFeatures: raw.top_features,
      modelVersion: raw.model_version,
      trainingSize: raw.training_size,
    }
  } catch {
    return null
  }
}

interface RawTrainResult {
  readonly success: boolean
  readonly model_version: string
  readonly training_size: number
  readonly mae: number
  readonly rmse: number
  readonly skipped: boolean
  readonly reason?: string
}

export async function trainXModel(): Promise<MlTrainResult | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    process.stdout.write('X ML train: Supabase credentials not configured\n')
    return null
  }

  const output = await runPythonCommand('train', [
    '--supabase-url',
    supabaseUrl,
    '--supabase-key',
    supabaseKey,
  ])
  if (!output) return null

  try {
    const raw: RawTrainResult = JSON.parse(output)
    return {
      success: raw.success,
      modelVersion: raw.model_version,
      trainingSize: raw.training_size,
      mae: raw.mae,
      rmse: raw.rmse,
      skipped: raw.skipped,
      reason: raw.reason,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown parse error'
    process.stdout.write(`X ML train output parse error: ${message}\n`)
    return null
  }
}
