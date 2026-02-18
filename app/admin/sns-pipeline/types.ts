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
  readonly action_type: 'post_x' | 'post_x_long' | 'trigger_blog' | 'post_linkedin' | 'post_instagram_story'
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
  readonly storyQueue: readonly InstagramStoryQueue[]
  readonly blogTopics: readonly BlogTopicQueue[]
  readonly pendingActions: readonly SlackPendingAction[]
  readonly loading: boolean
  readonly error: string | null
}

export interface CronJobConfig {
  readonly name: string
  readonly platform: 'x' | 'linkedin' | 'instagram' | 'blog' | 'all'
  readonly schedule: string
  readonly jstDescription: string
  readonly cronUtc: string
}

export const PLATFORM_COLORS = {
  x: '#FFFFFF',
  linkedin: '#0077B5',
  instagram: '#E1306C',
  blogRss: '#F97316',
  accent: '#06B6D4',
} as const

export const CRON_JOBS: readonly CronJobConfig[] = [
  { name: 'daily-suggestion', platform: 'x', schedule: '0 0 * * *', jstDescription: '毎日 9:00', cronUtc: '0 0 * * *' },
  { name: 'trending-collector', platform: 'x', schedule: '0 14 * * *', jstDescription: '毎日 23:00', cronUtc: '0 14 * * *' },
  { name: 'engagement-learner (X)', platform: 'x', schedule: '0 16 * * *', jstDescription: '毎日 01:00', cronUtc: '0 16 * * *' },
  { name: 'linkedin-auto-post', platform: 'linkedin', schedule: '0 23,1,3,5,7,9,11,13 * * *', jstDescription: '2時間間隔 (8-22時)', cronUtc: '0 23,1,3,5,7,9,11,13 * * *' },
  { name: 'linkedin-source-collector', platform: 'linkedin', schedule: '0 21,5,13 * * *', jstDescription: '1日3回 (6,14,22時)', cronUtc: '0 21,5,13 * * *' },
  { name: 'engagement-learner (LinkedIn)', platform: 'linkedin', schedule: '0 15 * * *', jstDescription: '毎日 00:00', cronUtc: '0 15 * * *' },
  { name: 'model-retrainer', platform: 'linkedin', schedule: '0 18 * * *', jstDescription: '毎日 03:00', cronUtc: '0 18 * * *' },
  { name: 'engagement-learner (Instagram)', platform: 'instagram', schedule: '30 15 * * *', jstDescription: '毎日 00:30', cronUtc: '30 15 * * *' },
  { name: 'story-auto-check', platform: 'instagram', schedule: '0 3 * * *', jstDescription: '毎日 12:00', cronUtc: '0 3 * * *' },
  { name: 'blog-rss-monitor', platform: 'blog', schedule: '0 4,10,20 * * *', jstDescription: '1日3回 (13,19,5時)', cronUtc: '0 4,10,20 * * *' },
  { name: 'weekly-report', platform: 'all', schedule: '0 1 * * 1', jstDescription: '月曜 10:00', cronUtc: '0 1 * * 1' },
] as const
