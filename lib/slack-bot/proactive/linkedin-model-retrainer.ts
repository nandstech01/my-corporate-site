/**
 * LinkedIn ML モデル再学習ジョブ
 *
 * Supabase の実データで XGBoost を再学習し、Slack に結果を通知。
 * UTC 18:00 (JST 3:00) に毎日実行。
 */

import { trainModel, getInsights } from '../../linkedin-ml-bridge/ml-client'
import { sendMessage } from '../slack-client'
import {
  checkModelDrift,
  recordTrainingBaseline,
} from '../../learning/drift-detector'
import { notifyLearningEvent } from '../../ai-judge/slack-notifier'

export async function runLinkedInModelRetrainer(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  if (!channel) {
    throw new Error('SLACK_DEFAULT_CHANNEL is required')
  }

  process.stdout.write('LinkedIn Model Retrainer: starting...\n')

  const result = await trainModel()

  if (!result) {
    process.stdout.write('LinkedIn Model Retrainer: Python bridge failed\n')
    return
  }

  if (result.skipped) {
    process.stdout.write(
      `LinkedIn Model Retrainer: skipped — ${result.reason}\n`,
    )
    await sendMessage({
      channel,
      text: `:robot_face: *LinkedIn ML再学習*: データ不足のためスキップ (${result.trainingSize}件 < 30件)。投稿が増えるまでbaselineモデルで運用します。`,
    })
    return
  }

  // Get updated insights after training
  const insights = await getInsights()
  const topFeaturesText = insights
    ? insights.topFeatures
        .slice(0, 3)
        .map((f) => `${f.name} (${(f.importance * 100).toFixed(0)}%)`)
        .join(', ')
    : 'N/A'

  // Build Slack message lines
  const messageLines = [
    `:robot_face: *LinkedIn ML再学習完了*`,
    `- モデル: \`${result.modelVersion}\``,
    `- 学習データ: ${result.trainingSize}件`,
    `- MAE: ${result.mae.toFixed(2)} / RMSE: ${result.rmse.toFixed(2)}`,
  ]

  // Phase 2: Append validation metrics if available
  if (result.validationMae != null && result.validationRmse != null) {
    const valSizeLabel =
      result.validationSize != null ? ` (${result.validationSize}件)` : ''
    const holdoutLabel =
      result.holdoutDays != null ? ` [${result.holdoutDays}日holdout]` : ''
    messageLines.push(
      `- 検証MAE: ${result.validationMae.toFixed(2)} / 検証RMSE: ${result.validationRmse.toFixed(2)}${valSizeLabel}${holdoutLabel}`,
    )
  }

  messageLines.push(`- 重要特徴量: ${topFeaturesText}`)

  // Phase 2: Drift detection (best-effort)
  let driftStatusText = ''
  try {
    await recordTrainingBaseline(
      'linkedin',
      result.mae,
      result.modelVersion,
    )

    const drift = await checkModelDrift('linkedin')

    if (drift.drifted) {
      driftStatusText = `:warning: ドリフト検出 (rolling MAE=${drift.rollingMae.toFixed(3)} vs training MAE=${drift.trainingMae.toFixed(3)}, ${drift.consecutiveDriftDays}日連続)`

      try {
        await notifyLearningEvent({
          eventType: 'drift_detected',
          summary: `LinkedIn model drift after retraining: rolling MAE=${drift.rollingMae.toFixed(3)} exceeds training MAE=${drift.trainingMae.toFixed(3)} (${drift.consecutiveDriftDays} consecutive days)`,
          details: {
            platform: 'linkedin',
            modelVersion: result.modelVersion,
            rollingMae: drift.rollingMae,
            trainingMae: drift.trainingMae,
            consecutiveDriftDays: drift.consecutiveDriftDays,
            shouldRetrain: drift.shouldRetrain,
          },
        })
      } catch {
        // Best-effort notification
      }
    } else {
      driftStatusText = ':white_check_mark: ドリフトなし'
    }
  } catch {
    // Best-effort drift detection — do not block retrainer notification
    driftStatusText = ':grey_question: ドリフト検出スキップ'
  }

  if (driftStatusText) {
    messageLines.push(`- ドリフト: ${driftStatusText}`)
  }

  await sendMessage({
    channel,
    text: messageLines.join('\n'),
  })

  process.stdout.write(
    `LinkedIn Model Retrainer: completed (${result.trainingSize} samples, MAE=${result.mae})\n`,
  )
}
