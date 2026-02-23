/**
 * X Account Monitor 型定義
 *
 * 公式アカウント監視・引用RT機会検出に使用する型
 */

export interface MonitoredAccount {
  readonly id: string
  readonly xUserId: string
  readonly username: string
  readonly displayName: string | null
  readonly category: 'ai_company' | 'researcher' | 'competitor' | 'ceo'
  readonly monitorPriority: 1 | 2 | 3
  readonly lastCheckedTweetId: string | null
  readonly lastCheckedAt: string | null
  readonly isActive: boolean
}

export interface TweetOpportunity {
  readonly originalTweetId: string
  readonly originalAuthorId: string
  readonly originalAuthorUsername: string
  readonly text: string
  readonly likes: number
  readonly retweets: number
  readonly replies: number
  readonly detectedAt: string
  readonly opportunityScore: number
  readonly status: 'pending' | 'generating' | 'ready' | 'posted' | 'expired' | 'skipped'
}

export interface OpportunityScore {
  readonly engagementVelocity: number
  readonly topicRelevance: number
  readonly freshness: number
  readonly accountPriority: number
  readonly composite: number
}

export interface MonitoredAccountRow {
  readonly id: string
  readonly x_user_id: string
  readonly username: string
  readonly display_name: string | null
  readonly category: string
  readonly monitor_priority: number
  readonly last_checked_tweet_id: string | null
  readonly last_checked_at: string | null
  readonly is_active: boolean
}
