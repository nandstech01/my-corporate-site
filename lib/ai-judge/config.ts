/**
 * AI Judge 設定
 *
 * 信頼度閾値・モデル設定・プラットフォーム固有制限
 */

import type { Platform } from './types'

// ============================================================
// モデル設定
// ============================================================

export const AI_JUDGE_MODEL = 'claude-sonnet-4-20250514'
export const AI_JUDGE_MAX_TOKENS = 1024

// ============================================================
// 信頼度閾値
// ============================================================

/** 閾値以上のconfidenceで自動承認 */
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.75

/** 引用RT用の厳格な信頼度閾値 */
export const QUOTE_TWEET_CONFIDENCE_THRESHOLD = 0.80

/** AI関連トピックの最低関連度 */
export const TOPIC_RELEVANCE_THRESHOLD = 0.5

/** 自動停止トリガー: 連続ゼロエンゲージメント件数 */
export const AUTO_STOP_ZERO_ENGAGEMENT_COUNT = 3

/** 自動停止時間（ms） — 12時間 */
export const AUTO_STOP_DURATION_MS = 12 * 60 * 60 * 1000

// ============================================================
// プラットフォーム固有の文字数制限
// ============================================================

const PLATFORM_CHAR_LIMITS: Record<Platform, { readonly min: number; readonly max: number }> = {
  x: { min: 10, max: 25000 },  // X Premium (25,000文字)
  linkedin: { min: 50, max: 3000 },
  instagram: { min: 10, max: 2200 },
  threads: { min: 10, max: 500 },
}

export function getCharLimits(platform: Platform): { readonly min: number; readonly max: number } {
  return PLATFORM_CHAR_LIMITS[platform]
}

// ============================================================
// 投稿レート制限
// ============================================================

const DAILY_POST_LIMITS: Record<Platform, number> = {
  x: 8,
  linkedin: 4,
  instagram: 2,
  threads: 3,
}

export function getDailyPostLimit(platform: Platform): number {
  return DAILY_POST_LIMITS[platform]
}

// ============================================================
// 動的信頼度閾値（Phase 3 で拡張）
// ============================================================

export function getDynamicThreshold(
  platform: Platform,
  todayPostCount: number,
): number {
  const base = DEFAULT_CONFIDENCE_THRESHOLD

  // 当日投稿数が多いほど保守的に（+0.03/post、最大+0.15）
  const postCountPenalty = Math.min(todayPostCount * 0.03, 0.15)

  // プラットフォーム別補正
  const platformAdjustment: Record<Platform, number> = {
    x: 0,
    linkedin: 0.02, // LinkedInはよりフォーマルなため少し厳しく
    instagram: 0.01,
    threads: 0,
  }

  return Math.min(base + postCountPenalty + platformAdjustment[platform], 0.95)
}

// ============================================================
// AI Judge システム有効判定
// ============================================================

export function isAiJudgeEnabled(): boolean {
  return process.env.AI_JUDGE_ENABLED === 'true'
}
