/**
 * Instagram トークン有効期限チェック + リフレッシュ
 *
 * Instagram Long-Lived Token は60日で失効。
 * 7日前に Slack 警告を送信。
 */

import { sendMessage } from '../slack-bot/slack-client'

// ============================================================
// 型定義
// ============================================================

export interface TokenStatus {
  readonly valid: boolean
  readonly daysRemaining: number
}

// ============================================================
// メイン
// ============================================================

export function checkTokenExpiry(): TokenStatus {
  const expiresAt = process.env.INSTAGRAM_TOKEN_EXPIRES_AT
  if (!expiresAt) {
    return { valid: true, daysRemaining: -1 }
  }

  const expiryDate = new Date(expiresAt)
  const now = new Date()
  const diffMs = expiryDate.getTime() - now.getTime()
  const daysRemaining = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  return {
    valid: daysRemaining > 0,
    daysRemaining,
  }
}

// ============================================================
// リフレッシュ
// ============================================================

export async function refreshLongLivedToken(): Promise<string | null> {
  const currentToken = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!currentToken) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
    const response = await fetch(url, { signal: controller.signal })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      process.stdout.write(
        `Instagram token refresh failed (${response.status}): ${errorText}\n`,
      )
      return null
    }

    const data = (await response.json()) as {
      access_token: string
      token_type: string
      expires_in: number
    }

    return data.access_token
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Instagram token refresh error: ${message}\n`)
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ============================================================
// 警告送信
// ============================================================

export async function warnIfTokenExpiringSoon(): Promise<void> {
  const status = checkTokenExpiry()

  if (status.daysRemaining === -1) return

  const channel = process.env.SLACK_DEFAULT_CHANNEL
  if (!channel) return

  if (status.daysRemaining <= 0) {
    await sendMessage({
      channel,
      text: ':rotating_light: *Instagram Access Token has EXPIRED!*\nPlease re-authenticate via Meta Developer Console to get a new token.',
    })
  } else if (status.daysRemaining <= 7) {
    await sendMessage({
      channel,
      text: `:warning: *Instagram Access Token expires in ${status.daysRemaining} days.*\nPlease renew it before it expires.`,
    })
  }
}
