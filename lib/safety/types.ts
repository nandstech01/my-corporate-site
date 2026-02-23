/**
 * Safety層 共有型定義
 *
 * L1(事前生成ガード)・L2(コンテンツ検証)・L4(投稿後監視)で使用する型
 */

export interface PreGenerationCheckResult {
  readonly safe: boolean
  readonly pauseReason?: string
  readonly detectedEvents: readonly DetectedSafetyEvent[]
}

export interface DetectedSafetyEvent {
  readonly eventType: 'disaster' | 'controversy' | 'platform_outage'
  readonly title: string
  readonly url: string
  readonly severity: 'critical' | 'high' | 'medium'
  readonly keywords: readonly string[]
}

export interface ContentValidationResult {
  readonly passed: boolean
  readonly brandVoiceScore: number      // 0-1
  readonly factCheckPassed: boolean
  readonly factCheckDetails?: string
  readonly flags: readonly string[]
}

export interface PostPublishCheckResult {
  readonly anomalyDetected: boolean
  readonly anomalies: readonly EngagementAnomaly[]
  readonly shouldActivateKillSwitch: boolean
}

export interface EngagementAnomaly {
  readonly postId: string
  readonly platform: string
  readonly anomalyType: 'negative_spike' | 'engagement_cliff' | 'sentiment_negative'
  readonly severity: 'critical' | 'high' | 'medium' | 'low'
  readonly details: Record<string, unknown>
}
