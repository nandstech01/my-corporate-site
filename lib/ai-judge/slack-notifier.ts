/**
 * AI Judge Slack通知
 *
 * 投稿結果・学習イベント・安全イベントを #general チャンネルに通知
 */

import { sendMessage } from '../slack-bot/slack-client'
import type {
  LearningEventType,
  NotifyLearningParams,
  NotifyPostParams,
  NotifySafetyParams,
  Platform,
  SafetyEventSeverity,
} from './types'

// ============================================================
// Channel
// ============================================================

const getGeneralChannel = (): string =>
  process.env.SLACK_GENERAL_CHANNEL_ID || process.env.SLACK_DEFAULT_CHANNEL || ''

// ============================================================
// Platform Display
// ============================================================

const PLATFORM_DISPLAY: Record<Platform, string> = {
  x: 'X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  threads: 'Threads',
}

// ============================================================
// 投稿完了通知
// ============================================================

export async function notifyPostPublished(params: NotifyPostParams): Promise<void> {
  const channel = getGeneralChannel()
  if (!channel) return

  const platformLabel = PLATFORM_DISPLAY[params.platform]
  const truncatedText =
    params.postText.length > 200
      ? `${params.postText.slice(0, 200)}...`
      : params.postText

  const lines = [
    `:rocket: *${platformLabel}投稿しました*`,
    `> ${truncatedText}`,
    `判断: ${params.verdict.decision} | 信頼度: ${params.verdict.confidence.toFixed(2)} | 理由: ${params.verdict.reasoning}`,
  ]

  if (params.postUrl) {
    lines.push(`:link: ${params.postUrl}`)
  }

  try {
    await sendMessage({
      channel,
      text: lines.join('\n'),
    })
  } catch (error) {
    throw new Error(
      `Failed to send post published notification: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// 投稿却下通知
// ============================================================

export async function notifyPostRejected(params: {
  readonly platform: Platform
  readonly postText: string
  readonly verdict: NotifyPostParams['verdict']
}): Promise<void> {
  const channel = getGeneralChannel()
  if (!channel) return

  const platformLabel = PLATFORM_DISPLAY[params.platform]
  const text = [
    `:warning: *投稿を却下しました*`,
    `Platform: ${platformLabel} | 信頼度: ${params.verdict.confidence.toFixed(2)}`,
    `理由: ${params.verdict.reasoning}`,
  ].join('\n')

  try {
    await sendMessage({ channel, text })
  } catch (error) {
    throw new Error(
      `Failed to send post rejected notification: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// 学習イベント通知
// ============================================================

const LEARNING_EVENT_EMOJI: Record<LearningEventType, string> = {
  high_performer: ':chart_with_upwards_trend:',
  low_performer: ':bulb:',
  pattern_learned: ':brain:',
  model_retrained: ':gear:',
  drift_detected: ':warning:',
  cross_platform_transfer: ':arrows_counterclockwise:',
}

const LEARNING_EVENT_LABEL: Record<LearningEventType, string> = {
  high_performer: '高パフォーマンス投稿',
  low_performer: '低パフォーマンス投稿',
  pattern_learned: 'パターン学習',
  model_retrained: 'モデル再訓練',
  drift_detected: 'ドリフト検出',
  cross_platform_transfer: 'クロスプラットフォーム学習',
}

export async function notifyLearningEvent(params: NotifyLearningParams): Promise<void> {
  const channel = getGeneralChannel()
  if (!channel) return

  const emoji = LEARNING_EVENT_EMOJI[params.eventType]
  const label = LEARNING_EVENT_LABEL[params.eventType]

  const text = [
    `${emoji} *${label}*`,
    params.summary,
  ].join('\n')

  try {
    await sendMessage({ channel, text })
  } catch (error) {
    throw new Error(
      `Failed to send learning event notification: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// 安全イベント通知
// ============================================================

const SAFETY_SEVERITY_EMOJI: Record<SafetyEventSeverity, string> = {
  critical: ':rotating_light:',
  high: ':warning:',
  medium: ':information_source:',
}

export async function notifySafetyEvent(params: NotifySafetyParams): Promise<void> {
  const channel = getGeneralChannel()
  if (!channel) return

  const emoji = SAFETY_SEVERITY_EMOJI[params.severity]

  const text = [
    `${emoji} *安全イベント: ${params.eventType}*`,
    params.summary,
  ].join('\n')

  try {
    await sendMessage({ channel, text })
  } catch (error) {
    throw new Error(
      `Failed to send safety event notification: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// ブログ自動承認通知
// ============================================================

export async function notifyBlogAutoGeneration(params: {
  readonly topic: string
  readonly confidence: number
  readonly reasons: readonly string[]
  readonly sourceUrl?: string
}): Promise<void> {
  const channel = getGeneralChannel()
  if (!channel) return

  const reasonList = params.reasons.length > 0
    ? params.reasons.map((r) => `• ${r}`).join('\n')
    : '(理由なし)'

  const lines = [
    `:pencil: *ブログ自動承認*`,
    `トピック: ${params.topic}`,
    `信頼度: ${params.confidence.toFixed(2)}`,
    `理由:\n${reasonList}`,
  ]

  if (params.sourceUrl) {
    lines.push(`:link: ${params.sourceUrl}`)
  }

  try {
    await sendMessage({ channel, text: lines.join('\n') })
  } catch (error) {
    throw new Error(
      `Failed to send blog auto-generation notification: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
