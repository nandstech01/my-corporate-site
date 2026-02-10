/**
 * Slack Bot メモリ層
 *
 * 会話履歴 + 学習メモリ + 分析データの CRUD
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  SlackConversation,
  SlackBotMemory,
  SlackPendingAction,
  XPostAnalytics,
} from './types'

// ============================================================
// Supabase Client
// ============================================================

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  return createClient(url, key)
}

// ============================================================
// 会話履歴
// ============================================================

export async function saveConversationMessage(params: {
  readonly slackChannelId: string
  readonly slackUserId: string
  readonly slackThreadTs: string | null
  readonly role: SlackConversation['role']
  readonly content: string
  readonly toolCalls?: Record<string, unknown>[]
  readonly metadata?: Record<string, unknown>
}): Promise<SlackConversation> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('slack_conversations')
    .insert({
      slack_channel_id: params.slackChannelId,
      slack_user_id: params.slackUserId,
      slack_thread_ts: params.slackThreadTs,
      role: params.role,
      content: params.content,
      tool_calls: params.toolCalls ?? null,
      metadata: params.metadata ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save conversation: ${error.message}`)
  }

  return data as SlackConversation
}

export async function getConversationHistory(params: {
  readonly slackChannelId: string
  readonly slackThreadTs?: string | null
  readonly limit?: number
}): Promise<readonly SlackConversation[]> {
  const supabase = getSupabase()
  const limit = params.limit ?? 20

  let query = supabase
    .from('slack_conversations')
    .select('*')
    .eq('slack_channel_id', params.slackChannelId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (params.slackThreadTs) {
    query = query.eq('slack_thread_ts', params.slackThreadTs)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get conversation history: ${error.message}`)
  }

  return (data ?? []) as readonly SlackConversation[]
}

// ============================================================
// 承認待ちアクション (HITL)
// ============================================================

export async function createPendingAction(params: {
  readonly slackChannelId: string
  readonly slackUserId: string
  readonly slackThreadTs: string | null
  readonly actionType: SlackPendingAction['action_type']
  readonly payload: Record<string, unknown>
  readonly previewText?: string
}): Promise<SlackPendingAction> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('slack_pending_actions')
    .insert({
      slack_channel_id: params.slackChannelId,
      slack_user_id: params.slackUserId,
      slack_thread_ts: params.slackThreadTs,
      action_type: params.actionType,
      payload: params.payload,
      preview_text: params.previewText ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create pending action: ${error.message}`)
  }

  return data as SlackPendingAction
}

export async function resolvePendingAction(
  actionId: string,
  status: 'approved' | 'rejected',
): Promise<SlackPendingAction> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('slack_pending_actions')
    .update({
      status,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', actionId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to resolve pending action: ${error.message}`)
  }

  return data as SlackPendingAction
}

export async function getPendingAction(
  actionId: string,
): Promise<SlackPendingAction | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('slack_pending_actions')
    .select('*')
    .eq('id', actionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to get pending action: ${error.message}`)
  }

  return data as SlackPendingAction
}

// ============================================================
// 学習メモリ
// ============================================================

export async function saveMemory(params: {
  readonly slackUserId: string
  readonly memoryType: SlackBotMemory['memory_type']
  readonly content: string
  readonly context?: Record<string, unknown>
  readonly importance?: number
}): Promise<SlackBotMemory> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('slack_bot_memory')
    .insert({
      slack_user_id: params.slackUserId,
      memory_type: params.memoryType,
      content: params.content,
      context: params.context ?? null,
      importance: params.importance ?? 0.5,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save memory: ${error.message}`)
  }

  return data as SlackBotMemory
}

export async function recallMemories(params: {
  readonly slackUserId: string
  readonly query?: string
  readonly memoryType?: SlackBotMemory['memory_type']
  readonly limit?: number
}): Promise<readonly SlackBotMemory[]> {
  const supabase = getSupabase()
  const limit = params.limit ?? 10

  let query = supabase
    .from('slack_bot_memory')
    .select('*')
    .eq('slack_user_id', params.slackUserId)
    .order('importance', { ascending: false })
    .order('last_accessed_at', { ascending: false })
    .limit(limit)

  if (params.memoryType) {
    query = query.eq('memory_type', params.memoryType)
  }

  if (params.query) {
    query = query.ilike('content', `%${params.query}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to recall memories: ${error.message}`)
  }

  // Update last_accessed_at for returned memories
  if (data && data.length > 0) {
    const ids = data.map((m) => m.id)
    await supabase
      .from('slack_bot_memory')
      .update({
        last_accessed_at: new Date().toISOString(),
      })
      .in('id', ids)
  }

  return (data ?? []) as readonly SlackBotMemory[]
}

// ============================================================
// X投稿分析
// ============================================================

export async function savePostAnalytics(params: {
  readonly tweetId: string
  readonly tweetUrl?: string
  readonly postText: string
  readonly postMode?: XPostAnalytics['post_mode']
  readonly patternUsed?: string
  readonly tags?: string[]
}): Promise<XPostAnalytics> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .insert({
      tweet_id: params.tweetId,
      tweet_url: params.tweetUrl ?? null,
      post_text: params.postText,
      post_mode: params.postMode ?? null,
      pattern_used: params.patternUsed ?? null,
      posted_at: new Date().toISOString(),
      tags: params.tags ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save post analytics: ${error.message}`)
  }

  return data as XPostAnalytics
}

export async function getPostAnalytics(params: {
  readonly days?: number
  readonly limit?: number
}): Promise<readonly XPostAnalytics[]> {
  const supabase = getSupabase()
  const days = params.days ?? 7
  const limit = params.limit ?? 50
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .select('*')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get post analytics: ${error.message}`)
  }

  return (data ?? []) as readonly XPostAnalytics[]
}

export async function updatePostEngagement(
  tweetId: string,
  engagement: {
    readonly likes: number
    readonly retweets: number
    readonly replies: number
    readonly impressions: number
  },
): Promise<void> {
  const supabase = getSupabase()

  const totalEngagement =
    engagement.likes + engagement.retweets + engagement.replies
  const engagementRate =
    engagement.impressions > 0
      ? totalEngagement / engagement.impressions
      : 0

  const { error } = await supabase
    .from('x_post_analytics')
    .update({
      likes: engagement.likes,
      retweets: engagement.retweets,
      replies: engagement.replies,
      impressions: engagement.impressions,
      engagement_rate: engagementRate,
      fetched_at: new Date().toISOString(),
    })
    .eq('tweet_id', tweetId)

  if (error) {
    throw new Error(`Failed to update engagement: ${error.message}`)
  }
}

export async function getRecentTweetIds(
  hours: number = 24,
): Promise<readonly { tweet_id: string; post_text: string }[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .select('tweet_id, post_text')
    .gte('posted_at', since)

  if (error) {
    throw new Error(`Failed to get recent tweet IDs: ${error.message}`)
  }

  return (data ?? []) as readonly { tweet_id: string; post_text: string }[]
}
