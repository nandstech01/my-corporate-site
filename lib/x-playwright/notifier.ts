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
 * API fallback発動をSlack通知（即時送信 — レガシー互換）
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

// ============================================================
// Batched API fallback notifications
// ============================================================

interface FallbackEntry {
  readonly consumer: string
  readonly reason: string
  readonly detail?: string
  readonly timestamp: string
}

const _fallbackBuffer: FallbackEntry[] = []

/**
 * API fallback発動をバッファに蓄積（即時送信しない）。
 * cronラン末尾で flushApiFallbackNotifications() を呼び出してサマリー1通にまとめる。
 */
export function bufferApiFallback(params: {
  readonly consumer: string
  readonly reason: string
  readonly detail?: string
}): void {
  _fallbackBuffer.push({
    ...params,
    timestamp: new Date().toISOString(),
  })
}

/**
 * バッファに蓄積されたAPI fallback通知をサマリー1通にまとめてSlack送信。
 * バッファが空の場合は何もしない。送信後バッファをクリアする。
 */
export async function flushApiFallbackNotifications(): Promise<void> {
  if (_fallbackBuffer.length === 0) return

  const channel = getGeneralChannel()
  if (!channel) {
    _fallbackBuffer.length = 0
    return
  }

  // Group by consumer
  const byConsumer: Record<string, FallbackEntry[]> = {}
  for (const entry of _fallbackBuffer) {
    const existing = byConsumer[entry.consumer]
    if (existing) {
      existing.push(entry)
    } else {
      byConsumer[entry.consumer] = [entry]
    }
  }

  const lines = [
    `:arrows_counterclockwise: *X Playwright → API fallback サマリー* (${_fallbackBuffer.length}件)`,
    '',
  ]

  for (const [consumer, entries] of Object.entries(byConsumer)) {
    lines.push(`*${consumer}:* ${entries.length}件`)
    const reason = entries[0].reason
    lines.push(`  理由: ${reason}`)
    if (entries.length <= 3) {
      for (const e of entries) {
        if (e.detail) lines.push(`  • ${e.detail}`)
      }
    } else {
      for (const e of entries.slice(0, 2)) {
        if (e.detail) lines.push(`  • ${e.detail}`)
      }
      lines.push(`  • ...他 ${entries.length - 2}件`)
    }
  }

  _fallbackBuffer.length = 0

  try {
    await sendMessage({ channel, text: lines.join('\n') })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    process.stdout.write(`Playwright notifier: failed to send batched fallback notification: ${msg}\n`)
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
