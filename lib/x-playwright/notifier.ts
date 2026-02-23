/**
 * X Playwright Slack Notifier
 *
 * Playwright関連イベントをSlackに通知する。
 * - セッション切れ検知
 * - API fallback発動
 * - エラーページ検知
 */

import { sendMessage } from '../slack-bot/slack-client'

const getGeneralChannel = (): string =>
  process.env.SLACK_GENERAL_CHANNEL_ID || process.env.SLACK_DEFAULT_CHANNEL || ''

/**
 * セッション切れ検知をSlack通知
 */
export async function notifySessionExpired(params: {
  readonly detectedAt: string
  readonly pageUrl?: string
}): Promise<void> {
  const channel = getGeneralChannel()
  if (!channel) return

  const lines = [
    ':warning: *X Playwright: セッション切れ検知*',
    `検知日時: ${params.detectedAt}`,
  ]

  if (params.pageUrl) {
    lines.push(`URL: ${params.pageUrl}`)
  }

  lines.push('対応: 手動で再ログインしてcookieを更新してください')

  try {
    await sendMessage({ channel, text: lines.join('\n') })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    process.stdout.write(`Playwright notifier: failed to send session expired notification: ${msg}\n`)
  }
}

/**
 * API fallback発動をSlack通知
 */
export async function notifyApiFallback(params: {
  readonly consumer: string
  readonly reason: string
  readonly detail?: string
}): Promise<void> {
  const channel = getGeneralChannel()
  if (!channel) return

  const lines = [
    ':arrows_counterclockwise: *X Playwright → API fallback*',
    `モジュール: ${params.consumer}`,
    `理由: ${params.reason}`,
  ]

  if (params.detail) {
    lines.push(`詳細: ${params.detail}`)
  }

  try {
    await sendMessage({ channel, text: lines.join('\n') })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    process.stdout.write(`Playwright notifier: failed to send API fallback notification: ${msg}\n`)
  }
}

/**
 * エラーページ検知をSlack通知
 */
export async function notifyErrorPage(params: {
  readonly pageUrl: string
  readonly errorType: string
}): Promise<void> {
  const channel = getGeneralChannel()
  if (!channel) return

  const text = [
    ':rotating_light: *X Playwright: エラーページ検知*',
    `URL: ${params.pageUrl}`,
    `エラー種別: ${params.errorType}`,
  ].join('\n')

  try {
    await sendMessage({ channel, text })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    process.stdout.write(`Playwright notifier: failed to send error page notification: ${msg}\n`)
  }
}
