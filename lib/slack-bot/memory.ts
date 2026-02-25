/**
 * Slack Bot メモリ層
 *
 * 会話履歴 + 学習メモリ + 分析データの CRUD
 * + 会話コンパクション (Phase 2)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { ChatOpenAI } from '@langchain/openai'
import type {
  SlackConversation,
  SlackBotMemory,
  SlackPendingAction,
  XPostAnalytics,
  LinkedInPostAnalytics,
} from './types'

// ============================================================
// Supabase Client
// ============================================================

let cachedSupabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (cachedSupabase) return cachedSupabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  cachedSupabase = createClient(url, key)
  return cachedSupabase
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
  resolvedBy?: string,
): Promise<SlackPendingAction> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('slack_pending_actions')
    .update({
      status,
      resolved_at: new Date().toISOString(),
      ...(resolvedBy ? { resolved_by: resolvedBy } : {}),
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
  // Fetch extra to allow re-ranking
  const fetchLimit = Math.min(limit * 3, 50)

  let query = supabase
    .from('slack_bot_memory')
    .select('*')
    .eq('slack_user_id', params.slackUserId)
    .order('importance', { ascending: false })
    .order('last_accessed_at', { ascending: false })
    .limit(fetchLimit)

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

  const memories = (data ?? []) as SlackBotMemory[]

  // Weighted re-ranking: importance * 0.4 + validation_score * 0.3 + recency * 0.3
  const now = Date.now()
  const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days

  const scored = memories.map((m) => {
    const importance = m.importance ?? 0.5
    const validationScore = (m as any).validation_score ?? 0
    const lastAccessed = m.last_accessed_at
      ? new Date(m.last_accessed_at).getTime()
      : new Date(m.created_at).getTime()
    const age = now - lastAccessed
    const recencyBonus = Math.max(0, 1 - age / maxAge)

    const weightedScore =
      importance * 0.4 + validationScore * 0.3 + recencyBonus * 0.3
    return { memory: m, weightedScore }
  })

  const ranked = [...scored]
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, limit)
    .map((s) => s.memory)

  // Update last_accessed_at for returned memories
  if (ranked.length > 0) {
    const ids = ranked.map((m) => m.id)
    await supabase
      .from('slack_bot_memory')
      .update({
        last_accessed_at: new Date().toISOString(),
      })
      .in('id', ids)
  }

  return ranked as readonly SlackBotMemory[]
}

// ============================================================
// Edit フロー (pending action の編集リクエスト管理)
// ============================================================

/**
 * pending action に editRequested フラグを立てる
 */
export async function markPendingActionForEdit(
  actionId: string,
): Promise<SlackPendingAction | null> {
  const supabase = getSupabase()

  const action = await getPendingAction(actionId)
  if (!action || action.status !== 'pending') return null

  const updatedPayload = {
    ...action.payload,
    editRequested: true,
  }

  const { data, error } = await supabase
    .from('slack_pending_actions')
    .update({ payload: updatedPayload })
    .eq('id', actionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to mark action for edit: ${error.message}`)
  }

  return data as SlackPendingAction
}

/**
 * スレッドに紐づく編集待ちの pending action を取得
 */
export async function getPendingEditForThread(params: {
  readonly slackChannelId: string
  readonly slackThreadTs: string
}): Promise<SlackPendingAction | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('slack_pending_actions')
    .select('*')
    .eq('slack_channel_id', params.slackChannelId)
    .eq('slack_thread_ts', params.slackThreadTs)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    throw new Error(`Failed to get pending edit: ${error.message}`)
  }

  // editRequested フラグが立っているものを探す
  const editAction = (data ?? []).find(
    (a) =>
      a.payload &&
      typeof a.payload === 'object' &&
      (a.payload as Record<string, unknown>).editRequested === true,
  )

  return (editAction as SlackPendingAction) ?? null
}

// ============================================================
// 会話コンパクション (Phase 2)
// ============================================================

const COMPACTION_THRESHOLD = 20
const RECENT_KEEP_COUNT = 5

/**
 * 会話履歴が閾値を超えたら古いメッセージをLLMでサマリー化。
 * OpenClaw の Pre-Compaction Memory Flush パターン。
 */
export async function compactConversationIfNeeded(params: {
  readonly slackChannelId: string
  readonly slackUserId: string
  readonly slackThreadTs: string | null
}): Promise<void> {
  const history = await getConversationHistory({
    slackChannelId: params.slackChannelId,
    slackThreadTs: params.slackThreadTs,
    limit: 100,
  })

  if (history.length < COMPACTION_THRESHOLD) return

  const oldMessages = history.slice(0, -RECENT_KEEP_COUNT)
  const oldText = oldMessages
    .map((m) => `[${m.role}]: ${m.content.slice(0, 300)}`)
    .join('\n')

  // LLM でサマリー生成
  const model = new ChatOpenAI({
    modelName: 'gpt-5-mini',
    apiKey: process.env.OPENAI_API_KEY,
  })

  const summaryResponse = await model.invoke([
    {
      role: 'system',
      content:
        '以下の会話履歴を日本語で3-5行に要約して。重要な決定事項、ツール実行結果、ユーザーの要望を優先的に含めて。',
    },
    { role: 'user', content: oldText },
  ])

  const summary =
    typeof summaryResponse.content === 'string'
      ? summaryResponse.content
      : JSON.stringify(summaryResponse.content)

  // Pre-Compaction Memory Flush: 重要情報をメモリに保存
  await preCompactionMemoryFlush(params.slackUserId, oldMessages)

  // 古いメッセージを削除してサマリーに置換
  const supabase = getSupabase()
  const oldIds = oldMessages.map((m) => m.id)

  await supabase.from('slack_conversations').delete().in('id', oldIds)

  await saveConversationMessage({
    slackChannelId: params.slackChannelId,
    slackUserId: params.slackUserId,
    slackThreadTs: params.slackThreadTs,
    role: 'system',
    content: `[Conversation Summary]: ${summary}`,
    metadata: {
      compacted: true,
      originalCount: oldMessages.length,
      compactedAt: new Date().toISOString(),
    },
  })
}

/**
 * コンパクション前に重要な情報をメモリとして永続化。
 * ツール結果やユーザーの決定事項を失わないようにする。
 */
async function preCompactionMemoryFlush(
  slackUserId: string,
  messages: readonly SlackConversation[],
): Promise<void> {
  // ツール結果を含むメッセージから重要情報を抽出
  const toolResults = messages
    .filter((m) => m.role === 'tool')
    .map((m) => m.content.slice(0, 200))

  if (toolResults.length === 0) return

  const model = new ChatOpenAI({
    modelName: 'gpt-5-mini',
    apiKey: process.env.OPENAI_API_KEY,
  })

  const extractResponse = await model.invoke([
    {
      role: 'system',
      content:
        '以下のツール実行結果から、今後も役立つ事実や学びを1-3個抽出して。各項目は1行で、JSONの配列で返して。例: ["AIニュース: GPT-5が2026年に発表された", "ユーザーは短い投稿を好む"]',
    },
    { role: 'user', content: toolResults.join('\n---\n') },
  ])

  const extractText =
    typeof extractResponse.content === 'string'
      ? extractResponse.content
      : JSON.stringify(extractResponse.content)

  try {
    const facts: string[] = JSON.parse(extractText)
    for (const fact of facts.slice(0, 3)) {
      await saveMemory({
        slackUserId,
        memoryType: 'fact',
        content: fact,
        importance: 0.6,
        context: { source: 'pre_compaction_flush' },
      })
    }
  } catch {
    // JSON パース失敗時はスキップ（best-effort）
  }
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
  readonly postType?: 'original' | 'quote' | 'thread' | 'reply' | 'repost' | 'article'
  readonly quotedTweetId?: string
  readonly threadPosition?: number
  readonly threadRootId?: string
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
      post_type: params.postType ?? 'original',
      quoted_tweet_id: params.quotedTweetId ?? null,
      thread_position: params.threadPosition ?? null,
      thread_root_id: params.threadRootId ?? null,
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
): Promise<readonly { tweet_id: string; post_text: string; pattern_used: string | null }[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .select('tweet_id, post_text, pattern_used')
    .gte('posted_at', since)

  if (error) {
    throw new Error(`Failed to get recent tweet IDs: ${error.message}`)
  }

  return (data ?? []) as readonly { tweet_id: string; post_text: string; pattern_used: string | null }[]
}

// ============================================================
// LinkedIn投稿分析
// ============================================================

export async function saveLinkedInPostAnalytics(params: {
  readonly linkedinPostId: string
  readonly postUrl?: string
  readonly postText: string
  readonly sourceType?: string
  readonly sourceUrl?: string
  readonly patternUsed?: string
  readonly tags?: string[]
  readonly mlFeatures?: Record<string, number>
  readonly mlPrediction?: number
  readonly mlConfidence?: number
  readonly mlModelVersion?: string
}): Promise<LinkedInPostAnalytics> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('linkedin_post_analytics')
    .insert({
      linkedin_post_id: params.linkedinPostId,
      post_url: params.postUrl ?? null,
      post_text: params.postText,
      source_type: params.sourceType ?? null,
      source_url: params.sourceUrl ?? null,
      pattern_used: params.patternUsed ?? null,
      posted_at: new Date().toISOString(),
      tags: params.tags ?? null,
      ml_features: params.mlFeatures ?? null,
      ml_prediction: params.mlPrediction ?? null,
      ml_confidence: params.mlConfidence ?? null,
      ml_model_version: params.mlModelVersion ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save LinkedIn post analytics: ${error.message}`)
  }

  return data as LinkedInPostAnalytics
}

export async function getLinkedInPostAnalytics(params: {
  readonly days?: number
  readonly limit?: number
}): Promise<readonly LinkedInPostAnalytics[]> {
  const supabase = getSupabase()
  const days = params.days ?? 7
  const limit = params.limit ?? 50
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('linkedin_post_analytics')
    .select('*')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get LinkedIn post analytics: ${error.message}`)
  }

  return (data ?? []) as readonly LinkedInPostAnalytics[]
}

export async function getRecentLinkedInPostIds(
  hours: number = 48,
): Promise<readonly { linkedin_post_id: string; post_text: string }[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('linkedin_post_analytics')
    .select('linkedin_post_id, post_text')
    .gte('posted_at', since)

  if (error) {
    throw new Error(`Failed to get recent LinkedIn post IDs: ${error.message}`)
  }

  return (data ?? []) as readonly { linkedin_post_id: string; post_text: string }[]
}

/** X自動投稿用: 直近N日間に投稿されたX投稿のテキストを取得（重複排除用） */
export async function getRecentXPostTexts(
  days: number = 7,
): Promise<readonly string[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('x_post_analytics')
    .select('post_text')
    .gte('posted_at', since)

  if (error) {
    throw new Error(`Failed to get recent X post texts: ${error.message}`)
  }

  return (data ?? [])
    .map((row) => row.post_text as string)
    .filter((text) => text.length > 0)
}

export async function getRecentlyPostedSourceUrls(
  days: number = 7,
): Promise<readonly string[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('linkedin_post_analytics')
    .select('source_url')
    .gte('posted_at', since)
    .not('source_url', 'is', null)

  if (error) {
    throw new Error(`Failed to get recently posted source URLs: ${error.message}`)
  }

  return (data ?? [])
    .map((row) => row.source_url as string)
    .filter((url) => url.length > 0)
}

export async function updateLinkedInPostEngagement(
  linkedinPostId: string,
  engagement: {
    readonly reactions: number
    readonly comments: number
    readonly reshares: number
    readonly impressions: number
  },
): Promise<void> {
  const supabase = getSupabase()

  const totalEngagement =
    engagement.reactions + engagement.comments + engagement.reshares
  const engagementRate =
    engagement.impressions > 0
      ? totalEngagement / engagement.impressions
      : 0

  const { error } = await supabase
    .from('linkedin_post_analytics')
    .update({
      likes: engagement.reactions,
      comments: engagement.comments,
      reposts: engagement.reshares,
      impressions: engagement.impressions,
      engagement_rate: engagementRate,
      fetched_at: new Date().toISOString(),
    })
    .eq('linkedin_post_id', linkedinPostId)

  if (error) {
    throw new Error(`Failed to update LinkedIn engagement: ${error.message}`)
  }
}

// ============================================================
// Threads Post Analytics
// ============================================================

export async function saveThreadsPostAnalytics(params: {
  readonly threadsMediaId: string
  readonly postUrl?: string
  readonly postText: string
  readonly sourceUrl?: string
  readonly patternUsed?: string
  readonly tags?: string[]
  readonly scores?: unknown
  readonly hookUsed?: string
  readonly sourceType?: string
  readonly candidateCount?: number
}): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('threads_post_analytics')
    .insert({
      threads_media_id: params.threadsMediaId,
      post_url: params.postUrl ?? null,
      post_text: params.postText,
      source_url: params.sourceUrl ?? null,
      pattern_used: params.patternUsed ?? null,
      posted_at: new Date().toISOString(),
      tags: params.tags ?? null,
      scores: params.scores ?? null,
      hook_used: params.hookUsed ?? null,
      source_type: params.sourceType ?? null,
      candidate_count: params.candidateCount ?? 0,
    })

  if (error) {
    throw new Error(`Failed to save Threads post analytics: ${error.message}`)
  }
}

export async function getRecentThreadsPostIds(
  hours: number = 48,
): Promise<readonly { threads_media_id: string; post_text: string }[]> {
  const supabase = getSupabase()
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('threads_post_analytics')
    .select('threads_media_id, post_text')
    .gte('posted_at', since)

  if (error) {
    throw new Error(`Failed to get recent Threads post IDs: ${error.message}`)
  }

  return (data ?? []) as readonly { threads_media_id: string; post_text: string }[]
}

export async function getThreadsPostAnalytics(params: {
  readonly days?: number
  readonly limit?: number
}): Promise<readonly import('./types').ThreadsPostAnalytics[]> {
  const supabase = getSupabase()
  const days = params.days ?? 7
  const limit = params.limit ?? 50
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('threads_post_analytics')
    .select('*')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get Threads post analytics: ${error.message}`)
  }

  return (data ?? []) as readonly import('./types').ThreadsPostAnalytics[]
}

export async function updateThreadsPostEngagement(
  threadsMediaId: string,
  engagement: {
    readonly likes: number
    readonly replies: number
    readonly reposts: number
    readonly quotes: number
    readonly views: number
  },
): Promise<void> {
  const supabase = getSupabase()

  const totalEngagement =
    engagement.likes + engagement.replies + engagement.reposts + engagement.quotes
  const engagementRate =
    engagement.views > 0
      ? totalEngagement / engagement.views
      : 0

  const { error } = await supabase
    .from('threads_post_analytics')
    .update({
      likes: engagement.likes,
      replies: engagement.replies,
      reposts: engagement.reposts,
      quotes: engagement.quotes,
      views: engagement.views,
      engagement_rate: engagementRate,
      fetched_at: new Date().toISOString(),
    })
    .eq('threads_media_id', threadsMediaId)

  if (error) {
    throw new Error(`Failed to update Threads engagement: ${error.message}`)
  }
}
