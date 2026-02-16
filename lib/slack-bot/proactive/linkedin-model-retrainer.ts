/**
 * LinkedIn ML モデル再学習ジョブ
 *
 * Supabase の実データで XGBoost を再学習し、Slack に結果を通知。
 * UTC 18:00 (JST 3:00) に毎日実行。
 */

import { trainModel, getInsights } from '../../linkedin-ml-bridge/ml-client'
import { sendMessage } from '../slack-client'

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

  await sendMessage({
    channel,
    text: [
      `:robot_face: *LinkedIn ML再学習完了*`,
      `- モデル: \`${result.modelVersion}\``,
      `- 学習データ: ${result.trainingSize}件`,
      `- MAE: ${result.mae.toFixed(2)} / RMSE: ${result.rmse.toFixed(2)}`,
      `- 重要特徴量: ${topFeaturesText}`,
    ].join('\n'),
  })

  process.stdout.write(
    `LinkedIn Model Retrainer: completed (${result.trainingSize} samples, MAE=${result.mae})\n`,
  )
}
