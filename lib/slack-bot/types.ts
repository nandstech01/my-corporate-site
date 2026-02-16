/**
 * Slack Bot 型定義
 */

// ============================================================
// Supabase テーブル型
// ============================================================

export interface SlackConversation {
  readonly id: string
  readonly slack_channel_id: string
  readonly slack_user_id: string
  readonly slack_thread_ts: string | null
  readonly role: 'user' | 'assistant' | 'system' | 'tool'
  readonly content: string
  readonly tool_calls: Record<string, unknown>[] | null
  readonly metadata: Record<string, unknown> | null
  readonly created_at: string
}

export interface SlackPendingAction {
  readonly id: string
  readonly slack_channel_id: string
  readonly slack_user_id: string
  readonly slack_thread_ts: string | null
  readonly action_type: 'post_x' | 'post_x_long' | 'trigger_blog' | 'post_linkedin'
  readonly payload: Record<string, unknown>
  readonly preview_text: string | null
  readonly status: 'pending' | 'approved' | 'rejected' | 'expired'
  readonly created_at: string
  readonly resolved_at: string | null
}

export interface SlackBotMemory {
  readonly id: string
  readonly slack_user_id: string
  readonly memory_type: 'preference' | 'feedback' | 'fact' | 'style' | 'timing'
  readonly content: string
  readonly context: Record<string, unknown> | null
  readonly importance: number
  readonly access_count: number
  readonly last_accessed_at: string
  readonly created_at: string
}

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
  readonly fetched_at: string
  readonly tags: string[] | null
}

// ============================================================
// Slack Event 型
// ============================================================

export interface SlackEvent {
  readonly type: string
  readonly user: string
  readonly text: string
  readonly channel: string
  readonly ts: string
  readonly thread_ts?: string
  readonly channel_type?: string
  readonly bot_id?: string
}

export interface SlackEventPayload {
  readonly type: string
  readonly challenge?: string
  readonly event?: SlackEvent
  readonly token?: string
}

export interface SlackInteractionPayload {
  readonly type: string
  readonly user: { readonly id: string }
  readonly channel: { readonly id: string }
  readonly message: { readonly ts: string; readonly thread_ts?: string }
  readonly actions: ReadonlyArray<{
    readonly action_id: string
    readonly value: string
  }>
  readonly trigger_id: string
}

// ============================================================
// Agent State 型
// ============================================================

export interface AgentContext {
  readonly slackChannelId: string
  readonly slackUserId: string
  readonly slackThreadTs: string | null
}

// ============================================================
// Tool Input 型
// ============================================================

export interface GenerateXPostInput {
  readonly topic?: string
  readonly slug?: string
  readonly mode: 'article' | 'research'
}

export interface PostToXInput {
  readonly text: string
  readonly longForm?: boolean
}

export interface SearchArticlesInput {
  readonly query: string
}

export interface ResearchTopicInput {
  readonly topic: string
  readonly url?: string
}

export interface TriggerBlogGenInput {
  readonly title: string
  readonly outline: string
}

export interface RecallMemoryInput {
  readonly query: string
}

export interface SaveMemoryInput {
  readonly content: string
  readonly type: 'preference' | 'feedback' | 'fact' | 'style' | 'timing'
  readonly importance?: number
}

export interface FetchXAnalyticsInput {
  readonly days?: number
}

// ============================================================
// LinkedIn 型
// ============================================================

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
  readonly engagement_rate: number
  readonly fetched_at: string
  readonly tags: string[] | null
}
