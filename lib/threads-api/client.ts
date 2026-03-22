/**
 * Threads Graph API クライアント
 *
 * コンテナモデル（Instagram同様）の3ステップ方式:
 * 1. POST /{user-id}/threads — コンテナ作成
 * 2. GET /{container-id}?fields=status — ステータスポーリング
 * 3. POST /{user-id}/threads_publish — 公開
 *
 * 環境変数:
 *   THREADS_ACCESS_TOKEN, THREADS_USER_ID,
 *   THREADS_POSTING_ENABLED (default: false)
 */

import type { ThreadsMediaType, ThreadsPostResult } from './types'

// ============================================================
// 設定チェック
// ============================================================

export function isThreadsConfigured(): boolean {
  return !!(
    process.env.THREADS_ACCESS_TOKEN && process.env.THREADS_USER_ID
  )
}

export function isThreadsPostingEnabled(): boolean {
  return (
    isThreadsConfigured() &&
    process.env.THREADS_POSTING_ENABLED?.trim().toLowerCase() === 'true'
  )
}

// ============================================================
// API ヘルパー
// ============================================================

const GRAPH_API_BASE = 'https://graph.threads.net/v1.0'

async function graphApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = process.env.THREADS_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('THREADS_ACCESS_TOKEN is required')
  }

  const separator = path.includes('?') ? '&' : '?'
  const url = `${GRAPH_API_BASE}${path}${separator}access_token=${accessToken}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`Threads API error (${response.status}): ${errorText}`)
    }

    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

// ============================================================
// コンテナ作成 → ポーリング → 公開
// ============================================================

async function createMediaContainer(options: {
  readonly text: string
  readonly imageUrl?: string
  readonly mediaType: ThreadsMediaType
  readonly replyToId?: string
}): Promise<string> {
  const userId = process.env.THREADS_USER_ID!

  const params = new URLSearchParams({
    media_type: options.mediaType,
    text: options.text,
  })

  if (options.imageUrl && options.mediaType === 'IMAGE') {
    params.set('image_url', options.imageUrl)
  }

  if (options.replyToId) {
    params.set('reply_to_id', options.replyToId)
  }

  const result = await graphApiFetch<{ id: string }>(
    `/${userId}/threads?${params.toString()}`,
    { method: 'POST' },
  )

  return result.id
}

interface ContainerStatusResponse {
  readonly status: 'EXPIRED' | 'ERROR' | 'FINISHED' | 'IN_PROGRESS' | 'PUBLISHED'
  readonly id: string
}

async function pollContainerStatus(
  containerId: string,
  maxAttempts = 10,
): Promise<ContainerStatusResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await graphApiFetch<ContainerStatusResponse>(
      `/${containerId}?fields=status`,
    )

    if (status.status === 'FINISHED') {
      return status
    }

    if (status.status === 'ERROR' || status.status === 'EXPIRED') {
      throw new Error(`Container status: ${status.status}`)
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  throw new Error('Container polling timeout')
}

async function publishMedia(containerId: string): Promise<{
  readonly id: string
  readonly permalink?: string
}> {
  const userId = process.env.THREADS_USER_ID!

  const result = await graphApiFetch<{ id: string; permalink?: string }>(
    `/${userId}/threads_publish?creation_id=${containerId}`,
    { method: 'POST' },
  )

  return result
}

// ============================================================
// メイン公開関数
// ============================================================

export async function postToThreads(options: {
  readonly text: string
  readonly imageUrl?: string
}): Promise<ThreadsPostResult> {
  if (!isThreadsConfigured()) {
    return {
      success: false,
      error: 'THREADS_ACCESS_TOKEN and THREADS_USER_ID are required',
      status: 'failed',
    }
  }

  if (!options.text || options.text.trim().length === 0) {
    return {
      success: false,
      error: 'Post text is required',
      status: 'failed',
    }
  }

  // 投稿を保留
  if (!isThreadsPostingEnabled()) {
    return {
      success: true,
      status: 'ready',
      error: 'Content prepared. Posting is disabled (THREADS_POSTING_ENABLED=false).',
    }
  }

  try {
    const mediaType: ThreadsMediaType = options.imageUrl ? 'IMAGE' : 'TEXT'

    const containerId = await createMediaContainer({
      text: options.text,
      imageUrl: options.imageUrl,
      mediaType,
    })

    await pollContainerStatus(containerId)
    const published = await publishMedia(containerId)

    return {
      success: true,
      mediaId: published.id,
      permalinkUrl: published.permalink,
      status: 'posted',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message, status: 'failed' }
  }
}

// ============================================================
// リプライ（スレッド/チェーン投稿）
// ============================================================

/**
 * 既存のThreads投稿にリプライする
 */
export async function replyToThreads(options: {
  readonly text: string
  readonly replyToId: string
  readonly imageUrl?: string
}): Promise<ThreadsPostResult> {
  if (!isThreadsConfigured() || !isThreadsPostingEnabled()) {
    return { success: false, error: 'Threads not configured or disabled', status: 'failed' }
  }

  try {
    const mediaType: ThreadsMediaType = options.imageUrl ? 'IMAGE' : 'TEXT'

    const containerId = await createMediaContainer({
      text: options.text,
      imageUrl: options.imageUrl,
      mediaType,
      replyToId: options.replyToId,
    })

    await pollContainerStatus(containerId)
    const published = await publishMedia(containerId)

    return {
      success: true,
      mediaId: published.id,
      permalinkUrl: published.permalink,
      status: 'posted',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message, status: 'failed' }
  }
}

/**
 * チェーン型スレッドを投稿する（親 → 子1 → 子2 → ...）
 */
export async function postThreadsChain(options: {
  readonly parentText: string
  readonly parentImageUrl?: string
  readonly replies: readonly string[]
}): Promise<{
  readonly parentUrl?: string
  readonly replyCount: number
  readonly errors: readonly string[]
}> {
  const errors: string[] = []

  // Parent post
  const parentResult = await postToThreads({
    text: options.parentText,
    imageUrl: options.parentImageUrl,
  })

  if (!parentResult.success || !parentResult.mediaId) {
    return { replyCount: 0, errors: [parentResult.error ?? 'Parent post failed'] }
  }

  process.stdout.write(`[threads] Parent: ${parentResult.permalinkUrl ?? parentResult.mediaId}\n`)

  // Chain replies
  let lastMediaId = parentResult.mediaId
  let replyCount = 0

  for (let i = 0; i < options.replies.length; i++) {
    // Threads API rate limit buffer
    await new Promise((r) => setTimeout(r, 3000))

    const replyResult = await replyToThreads({
      text: options.replies[i],
      replyToId: lastMediaId,
    })

    if (replyResult.success && replyResult.mediaId) {
      lastMediaId = replyResult.mediaId
      replyCount++
      process.stdout.write(`[threads] Reply ${i + 1}: ${replyResult.permalinkUrl ?? replyResult.mediaId}\n`)
    } else {
      errors.push(`Reply ${i + 1}: ${replyResult.error}`)
      process.stdout.write(`[threads] Reply ${i + 1} FAILED: ${replyResult.error}\n`)
    }
  }

  return {
    parentUrl: parentResult.permalinkUrl,
    replyCount,
    errors,
  }
}

// ============================================================
// Threads Insights (エンゲージメント取得)
// ============================================================

export interface ThreadsPostMetrics {
  readonly views: number
  readonly likes: number
  readonly replies: number
  readonly reposts: number
  readonly quotes: number
}

export async function fetchThreadsPostMetrics(
  mediaId: string,
): Promise<ThreadsPostMetrics | null> {
  if (!isThreadsConfigured()) return null

  try {
    const result = await graphApiFetch<{
      data: readonly { name: string; values: readonly { value: number }[] }[]
    }>(
      `/${mediaId}/insights?metric=views,likes,replies,reposts,quotes`,
    )

    const metrics: Record<string, number> = {}
    for (const metric of result.data) {
      metrics[metric.name] = metric.values[0]?.value ?? 0
    }

    return {
      views: metrics['views'] ?? 0,
      likes: metrics['likes'] ?? 0,
      replies: metrics['replies'] ?? 0,
      reposts: metrics['reposts'] ?? 0,
      quotes: metrics['quotes'] ?? 0,
    }
  } catch {
    return null
  }
}
