/**
 * Python ML subprocess ブリッジ
 *
 * child_process.execFile で Python CLI を呼び出し、JSON を返す。
 * Python未インストール or エラー時は null（graceful degradation）。
 */

import { execFile } from 'child_process'
import * as path from 'path'
import type { MlPrediction, MlInsights } from './types'

const ML_SERVICE_DIR = path.resolve(__dirname, '../../services/linkedin-ml')
const TIMEOUT_MS = 30_000
const MAX_TEXT_LENGTH = 10_000

interface RawPredictionResult {
  readonly predicted_engagement: number
  readonly confidence: number
  readonly top_features: readonly { name: string; importance: number }[]
  readonly model_version: string
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
    const fullArgs = ['-m', 'linkedin_ml', command, ...args]

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
            `ML bridge ${label} (${command}): ${error.message}\n`,
          )
          if (stderr && !isTimeout) {
            process.stdout.write(`ML stderr: ${stderr}\n`)
          }
          resolve(null)
          return
        }
        resolve(stdout.trim())
      },
    )
  })
}

export async function predictEngagement(
  text: string,
  metadata: { readonly dayOfWeek: number; readonly hour: number },
): Promise<MlPrediction | null> {
  if (!text || text.length === 0) {
    return null
  }

  if (text.length > MAX_TEXT_LENGTH) {
    process.stdout.write(
      `ML bridge: text too long (${text.length} > ${MAX_TEXT_LENGTH}), skipping\n`,
    )
    return null
  }

  const inputJson = JSON.stringify({
    text,
    day_of_week: Math.max(0, Math.min(6, metadata.dayOfWeek)),
    hour: Math.max(0, Math.min(23, metadata.hour)),
  })

  const output = await runPythonCommand('predict', [
    '--input-json',
    inputJson,
  ])
  if (!output) return null

  try {
    const raw: RawPredictionResult = JSON.parse(output)
    if ('error' in raw) {
      process.stdout.write(`ML prediction error: ${(raw as { error: string }).error}\n`)
      return null
    }

    return {
      predictedEngagement: raw.predicted_engagement,
      confidence: raw.confidence,
      topFeatures: raw.top_features,
      modelVersion: raw.model_version,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown parse error'
    process.stdout.write(`ML output parse error: ${message}\n`)
    return null
  }
}

export async function getInsights(): Promise<MlInsights | null> {
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
