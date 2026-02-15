/**
 * LinkedIn トークン有効期限チェック
 *
 * LinkedIn アクセストークンは60日で失効。
 * cron で毎日チェックし、残り7日で Slack 警告を送信。
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

/**
 * LINKEDIN_TOKEN_EXPIRES_AT 環境変数（ISO 8601）からトークンの残り日数を計算。
 * 環境変数が未設定の場合は valid: true, daysRemaining: -1 を返す（チェック不能）。
 */
export function checkTokenExpiry(): TokenStatus {
  const expiresAt = process.env.LINKEDIN_TOKEN_EXPIRES_AT
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

/**
 * トークン有効期限を確認し、残り7日以下なら Slack に警告を送信。
 */
export async function warnIfTokenExpiringSoon(): Promise<void> {
  const status = checkTokenExpiry()

  // チェック不能（環境変数未設定）の場合はスキップ
  if (status.daysRemaining === -1) return

  const channel = process.env.SLACK_DEFAULT_CHANNEL
  if (!channel) return

  if (status.daysRemaining <= 0) {
    await sendMessage({
      channel,
      text: ':rotating_light: *LinkedIn Access Token has EXPIRED!*\nPlease re-authenticate via OAuth to get a new token.',
    })
  } else if (status.daysRemaining <= 7) {
    await sendMessage({
      channel,
      text: `:warning: *LinkedIn Access Token expires in ${status.daysRemaining} days.*\nPlease renew it before it expires.`,
    })
  }
}
