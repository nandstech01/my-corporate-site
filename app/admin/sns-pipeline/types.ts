export interface XPostAnalytics {
  readonly id: string
  readonly tweet_id: string
  readonly tweet_url: string | null
  readonly post_text: string
  readonly post_mode: 'article' | 'research' | 'pattern' | null
  readonly pattern_used: string | null
  readonly posted_at: string
  readonly likes: number
  readonly retweets: number
  readonly replies: number
  readonly impressions: number
  readonly engagement_rate: number
  readonly fetched_at: string | null
  readonly tags: string[] | null
}

export interface LinkedInPostAnalytics {
  readonly id: string
  readonly linkedin_post_id: string
  readonly post_url: string | null
  readonly post_text: string
  readonly source_type: string | null
  readonly source_url: string | null
  readonly pattern_used: string | null
  readonly posted_at: string
  readonly likes: number
  readonly comments: number
  readonly reposts: number
  readonly impressions: number
  readonly tags: string[] | null
  readonly ml_prediction: number | null
  readonly ml_confidence: number | null
}

export interface InstagramPostAnalytics {
  readonly id: string
  readonly instagram_media_id: string
  readonly media_type: string | null
  readonly post_url: string | null
  readonly caption: string
  readonly blog_slug: string | null
  readonly posted_at: string
  readonly reach: number
  readonly impressions: number
  readonly taps_forward: number
  readonly taps_back: number
  readonly exits: number
  readonly replies: number
  readonly likes: number
  readonly comments: number
  readonly saves: number
  readonly shares: number
  readonly engagement_rate: number
  readonly fetched_at: string | null
  readonly hashtags: string[] | null
  readonly utm_campaign: string | null
}

export interface InstagramStoryQueue {
  readonly id: string
  readonly blog_slug: string
  readonly blog_title: string | null
  readonly caption: string
  readonly image_url: string | null
  readonly image_prompt: string | null
  readonly hashtags: string[] | null
  readonly cta_url: string | null
  readonly status: 'draft' | 'pending_approval' | 'approved' | 'ready_to_post' | 'posted' | 'rejected'
  readonly score: number
  readonly all_candidates: unknown
  readonly scores: unknown
  readonly created_at: string
  readonly approved_at: string | null
  readonly posted_at: string | null
}

export interface ThreadsPostAnalytics {
  readonly id: string
  readonly threads_media_id: string
  readonly post_url: string | null
  readonly post_text: string
  readonly pattern_used: string | null
  readonly posted_at: string
  readonly likes: number
  readonly replies: number
  readonly reposts: number
  readonly quotes: number
  readonly views: number
  readonly engagement_rate: number
  readonly tags: string[] | null
}

export interface BlogTopicQueue {
  readonly id: string
  readonly source_feed: string
  readonly source_url: string
  readonly source_title: string
  readonly source_published_at: string | null
  readonly suggested_topic: string | null
  readonly suggested_keyword: string | null
  readonly buzz_score: number
  readonly buzz_breakdown: Record<string, number> | null
  readonly status: 'new' | 'notified' | 'approved' | 'dismissed'
  readonly slack_message_ts: string | null
  readonly created_at: string
}

export interface SlackPendingAction {
  readonly id: string
  readonly slack_channel_id: string
  readonly slack_user_id: string
  readonly slack_thread_ts: string | null
  readonly action_type: 'post_x' | 'post_x_long' | 'trigger_blog' | 'post_linkedin' | 'post_instagram_story' | 'post_threads'
  readonly payload: Record<string, unknown>
  readonly preview_text: string | null
  readonly status: 'pending' | 'approved' | 'rejected' | 'expired'
  readonly created_at: string
  readonly resolved_at: string | null
}

export interface SnsData {
  readonly xPosts: readonly XPostAnalytics[]
  readonly linkedinPosts: readonly LinkedInPostAnalytics[]
  readonly instagramPosts: readonly InstagramPostAnalytics[]
  readonly threadsPosts: readonly ThreadsPostAnalytics[]
  readonly storyQueue: readonly InstagramStoryQueue[]
  readonly blogTopics: readonly BlogTopicQueue[]
  readonly pendingActions: readonly SlackPendingAction[]
  readonly loading: boolean
  readonly error: string | null
}

export interface CronJobConfig {
  readonly name: string
  readonly platform: 'x' | 'linkedin' | 'instagram' | 'blog' | 'threads' | 'all'
  readonly schedule: string
  readonly jstDescription: string
  readonly cronUtc: string
}

// Learning System types
export interface PatternPerformanceRow {
  readonly id: string
  readonly pattern_id: string
  readonly platform: string | null
  readonly successes: number
  readonly failures: number
  readonly total_uses: number
  readonly avg_engagement: number
  readonly last_used_at: string | null
  readonly cross_platform_source: string | null
}

export interface PredictionAccuracyRow {
  readonly id: string
  readonly platform: string
  readonly post_id: string | null
  readonly predicted_engagement: number
  readonly actual_engagement: number
  readonly absolute_error: number
  readonly percentage_error: number | null
  readonly model_version: string | null
  readonly pattern_used: string | null
  readonly posted_at: string
  readonly measured_at: string
}

export interface LearningPipelineEventRow {
  readonly id: string
  readonly event_type: string
  readonly platform: string | null
  readonly post_id: string | null
  readonly data: unknown
  readonly created_at: string
}

export interface ModelDriftLogRow {
  readonly id: string
  readonly platform: string
  readonly model_version: string | null
  readonly date: string
  readonly rolling_mae: number
  readonly training_mae: number
  readonly sample_count: number
  readonly is_drifted: boolean
  readonly retrain_triggered: boolean
}

// Operations types
export interface XConversationThreadRow {
  readonly id: string
  readonly root_tweet_id: string | null
  readonly root_tweet_text: string | null
  readonly reply_type: string | null
  readonly depth_level: number | null
  readonly engagement_before: Record<string, number> | null
  readonly engagement_after: Record<string, number> | null
  readonly strategy_used: string | null
  readonly created_at: string
}

export interface BuzzPostRow {
  readonly id: string
  readonly platform: string | null
  readonly post_text: string
  readonly buzz_score: number
  readonly relevance_score: number | null
  readonly hook_pattern: string | null
  readonly collected_at: string
}

export interface SafetyEventRow {
  readonly id: string
  readonly event_type: string
  readonly description: string | null
  readonly severity: string
  readonly platforms_affected: string[] | null
  readonly active: boolean
  readonly created_at: string
  readonly expires_at: string | null
  readonly resolved_at: string | null
}

export interface XGrowthMetricRow {
  readonly id: string
  readonly date: string
  readonly followers_count: number
  readonly daily_follower_change: number
  readonly daily_posts_count: number
  readonly avg_engagement_rate: number
}

export const PLATFORM_COLORS = {
  x: '#FFFFFF',
  linkedin: '#0077B5',
  instagram: '#E1306C',
  threads: '#000000',
  blogRss: '#F97316',
  accent: '#06B6D4',
} as const

export const CRON_JOBS: readonly CronJobConfig[] = [
  { name: 'daily-suggestion', platform: 'x', schedule: '0 0 * * *', jstDescription: '毎日 9:00', cronUtc: '0 0 * * *' },
  { name: 'trending-collector', platform: 'x', schedule: '0 2,7,14 * * *', jstDescription: '1日3回 (11,16,23時)', cronUtc: '0 2,7,14 * * *' },
  { name: 'engagement-learner (X)', platform: 'x', schedule: '0 16 * * *', jstDescription: '毎日 01:00', cronUtc: '0 16 * * *' },
  { name: 'x-auto-post', platform: 'x', schedule: '30 21,3,9 * * *', jstDescription: '1日3回 (6:30,12:30,18:30)', cronUtc: '30 21,3,9 * * *' },
  { name: 'x-account-monitor', platform: 'x', schedule: '15 0-14 * * *', jstDescription: '毎時15分 (9-23時)', cronUtc: '15 0-14 * * *' },
  { name: 'x-conversation-builder', platform: 'x', schedule: '0 3,8,11 * * *', jstDescription: '1日3回 (12,17,20時)', cronUtc: '0 3,8,11 * * *' },
  { name: 'x-growth-tracker', platform: 'x', schedule: '0 20 * * *', jstDescription: '毎日 05:00', cronUtc: '0 20 * * *' },
  { name: 'x-proactive-discussion', platform: 'x', schedule: '30 0,3,5,7,9,11 * * *', jstDescription: '6回/日', cronUtc: '30 0,3,5,7,9,11 * * *' },
  { name: 'x-engagement-collector', platform: 'x', schedule: '0 22,10 * * *', jstDescription: '1日2回 (7,19時)', cronUtc: '0 22,10 * * *' },
  { name: 'linkedin-auto-post', platform: 'linkedin', schedule: '0 23,7 * * *', jstDescription: '1日2回 (8,16時)', cronUtc: '0 23,7 * * *' },
  { name: 'linkedin-source-collector', platform: 'linkedin', schedule: '0 21,5,13 * * *', jstDescription: '1日3回 (6,14,22時)', cronUtc: '0 21,5,13 * * *' },
  { name: 'linkedin-engagement-learner', platform: 'linkedin', schedule: '0 15 * * *', jstDescription: '毎日 00:00', cronUtc: '0 15 * * *' },
  { name: 'linkedin-model-retrainer', platform: 'linkedin', schedule: '0 18 * * *', jstDescription: '毎日 03:00', cronUtc: '0 18 * * *' },
  { name: 'instagram-engagement-learner', platform: 'instagram', schedule: '30 15 * * *', jstDescription: '毎日 00:30', cronUtc: '30 15 * * *' },
  { name: 'story-auto-check', platform: 'instagram', schedule: '0 3 * * *', jstDescription: '毎日 12:00', cronUtc: '0 3 * * *' },
  { name: 'blog-rss-monitor', platform: 'blog', schedule: '0 4,10,20 * * *', jstDescription: '1日3回 (13,19,5時)', cronUtc: '0 4,10,20 * * *' },
  { name: 'threads-auto-post', platform: 'threads', schedule: '30 23,4,10 * * *', jstDescription: '1日3回 (8:30,13:30,19:30)', cronUtc: '30 23,4,10 * * *' },
  { name: 'threads-engagement-learner', platform: 'threads', schedule: '30 16 * * *', jstDescription: '毎日 01:30', cronUtc: '30 16 * * *' },
  { name: 'ai-judge-calibrator', platform: 'all', schedule: '0 17 * * *', jstDescription: '毎日 02:00', cronUtc: '0 17 * * *' },
  { name: 'ai-judge-drift-monitor', platform: 'all', schedule: '0 19 * * 0', jstDescription: '日曜 04:00', cronUtc: '0 19 * * 0' },
  { name: 'buzz-collector', platform: 'all', schedule: '0 21,3,9 * * *', jstDescription: '1日3回', cronUtc: '0 21,3,9 * * *' },
  { name: 'safety-event-scanner', platform: 'all', schedule: '30 3,9,15,21 * * *', jstDescription: '6時間間隔', cronUtc: '30 3,9,15,21 * * *' },
  { name: 'cross-platform-learner', platform: 'all', schedule: '0 19 * * 0', jstDescription: '日曜 04:00', cronUtc: '0 19 * * 0' },
  { name: 'pattern-decay', platform: 'all', schedule: '0 18 * * *', jstDescription: '毎日 03:00', cronUtc: '0 18 * * *' },
  { name: 'lead-email-sequences', platform: 'all', schedule: '30 0,6,12,18 * * *', jstDescription: '6時間間隔', cronUtc: '30 0,6,12,18 * * *' },
  { name: 'weekly-report', platform: 'all', schedule: '0 1 * * 1', jstDescription: '月曜 10:00', cronUtc: '0 1 * * 1' },
] as const
