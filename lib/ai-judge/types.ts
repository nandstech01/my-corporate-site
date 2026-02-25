/**
 * AI Judge 型定義
 *
 * 投稿の自動判断・安全性チェック・通知に使用する全型
 */

// ============================================================
// Judge Verdict (コア判断結果)
// ============================================================

export interface JudgeVerdict {
  readonly decision: 'approve' | 'edit' | 'reject'
  readonly confidence: number // 0.0 - 1.0
  readonly reasoning: string // 日本語で判断理由
  readonly editSuggestion?: string
  readonly safetyFlags: readonly string[]
  readonly topicRelevance: number // AI関連トピックとの関連度 0-1
}

// ============================================================
// Safety Check Results
// ============================================================

export interface SafetyCheckResult {
  readonly passed: boolean
  readonly flags: readonly string[]
  readonly blockedReason?: string
  readonly ngWordsFound: readonly string[]
  readonly characterCountValid: boolean
  readonly urlsValid: boolean
  readonly topicRelevant: boolean
}

export interface NgWord {
  readonly id: string
  readonly word: string
  readonly severity: 'block' | 'flag'
  readonly category: 'profanity' | 'competitor' | 'legal' | 'sensitivity'
  readonly platform: readonly string[]
  readonly active: boolean
}

// ============================================================
// Platform Types
// ============================================================

export type Platform = 'x' | 'linkedin' | 'instagram' | 'threads'

export interface PostCandidate {
  readonly platform: Platform
  readonly text: string
  readonly sourceUrl?: string
  readonly sourceTitle?: string
  readonly patternUsed?: string
  readonly tags?: readonly string[]
  readonly mediaIds?: readonly string[]
  readonly pendingActionId?: string
  readonly quoteTweetId?: string
  readonly threadSegments?: readonly string[]
  readonly longForm?: boolean
}

// ============================================================
// Auto-Resolve Types
// ============================================================

export interface AutoResolveResult {
  readonly success: boolean
  readonly postId?: string
  readonly postUrl?: string
  readonly error?: string
  readonly verdict: JudgeVerdict
  readonly platform: Platform
}

// ============================================================
// Notification Types
// ============================================================

export type NotifyPostParams = {
  readonly platform: Platform
  readonly postText: string
  readonly postUrl?: string
  readonly verdict: JudgeVerdict
  readonly sourceUrl?: string
}

export type LearningEventType =
  | 'high_performer'
  | 'low_performer'
  | 'pattern_learned'
  | 'model_retrained'
  | 'drift_detected'
  | 'cross_platform_transfer'

export type NotifyLearningParams = {
  readonly eventType: LearningEventType
  readonly summary: string
  readonly details: Record<string, unknown>
}

export type SafetyEventType =
  | 'kill_switch'
  | 'anomaly'
  | 'content_rejected'
  | 'disaster_pause'

export type SafetyEventSeverity = 'critical' | 'high' | 'medium'

export type NotifySafetyParams = {
  readonly eventType: SafetyEventType
  readonly severity: SafetyEventSeverity
  readonly summary: string
}

// ============================================================
// Kill Switch Types
// ============================================================

export interface KillSwitchStatus {
  readonly active: boolean
  readonly reason?: string
  readonly activatedAt?: string
  readonly activatedBy: 'manual' | 'auto' | 'api' | 'slack'
  readonly expiresAt?: string
}

// ============================================================
// AI Judge Decision Record (DB型)
// ============================================================

export interface AiJudgeDecisionRecord {
  readonly id: string
  readonly pending_action_id: string | null
  readonly platform: Platform
  readonly post_text: string
  readonly decision: 'approve' | 'edit' | 'reject'
  readonly confidence: number
  readonly reasoning: string
  readonly safety_flags: readonly string[]
  readonly edit_suggestion: string | null
  readonly topic_relevance: number | null
  readonly auto_resolved: boolean
  readonly model_used: string
  readonly latency_ms: number | null
  readonly was_posted: boolean
  readonly post_id: string | null
  readonly actual_engagement: Record<string, unknown> | null
  readonly prediction_error: number | null
  readonly created_at: string
  readonly posted_at: string | null
  readonly engagement_fetched_at: string | null
}

// ============================================================
// Safety Event Record (DB型)
// ============================================================

export interface SafetyEventRecord {
  readonly id: string
  readonly event_type: 'disaster' | 'controversy' | 'platform_outage' | 'manual_pause'
  readonly description: string
  readonly severity: SafetyEventSeverity
  readonly platforms_affected: readonly string[]
  readonly keywords: readonly string[]
  readonly active: boolean
  readonly created_by: string
  readonly created_at: string
  readonly expires_at: string | null
  readonly resolved_at: string | null
}
