/**
 * Instagram Graph API クライアント
 *
 * Content Publishing API の3ステップコンテナ方式:
 * 1. POST /{ig-user-id}/media — コンテナ作成
 * 2. GET /{container-id}?fields=status_code — ステータスポーリング
 * 3. POST /{ig-user-id}/media_publish — 公開
 *
 * 環境変数:
 *   INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID,
 *   INSTAGRAM_POSTING_ENABLED (default: false)
 */

// ============================================================
// 型定義
// ============================================================

export interface InstagramPostResult {
  readonly success: boolean
  readonly mediaId?: string
  readonly error?: string
  readonly status: 'posted' | 'ready' | 'failed'
}

interface ContainerStatusResponse {
  readonly status_code: 'EXPIRED' | 'ERROR' | 'FINISHED' | 'IN_PROGRESS' | 'PUBLISHED'
  readonly id: string
}

// ============================================================
// 設定チェック
// ============================================================

export function isInstagramConfigured(): boolean {
  return !!(
    process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID
  )
}

export function isInstagramPostingEnabled(): boolean {
  return (
    isInstagramConfigured() &&
    process.env.INSTAGRAM_POSTING_ENABLED?.trim().toLowerCase() === 'true'
  )
}

// ============================================================
// API ヘルパー
// ============================================================

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'

async function graphApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('INSTAGRAM_ACCESS_TOKEN is required')
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
      throw new Error(`Instagram API error (${response.status}): ${errorText}`)
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
  readonly imageUrl: string
  readonly caption: string
  readonly mediaType: 'STORIES' | 'IMAGE' | 'REELS'
}): Promise<string> {
  const userId = process.env.INSTAGRAM_USER_ID!

  const params = new URLSearchParams({
    image_url: options.imageUrl,
    caption: options.caption,
    media_type: options.mediaType,
  })

  const result = await graphApiFetch<{ id: string }>(
    `/${userId}/media?${params.toString()}`,
    { method: 'POST' },
  )

  return result.id
}

async function pollContainerStatus(
  containerId: string,
  maxAttempts = 10,
): Promise<ContainerStatusResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await graphApiFetch<ContainerStatusResponse>(
      `/${containerId}?fields=status_code`,
    )

    if (status.status_code === 'FINISHED') {
      return status
    }

    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      throw new Error(`Container status: ${status.status_code}`)
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  throw new Error('Container polling timeout')
}

async function publishMedia(containerId: string): Promise<string> {
  const userId = process.env.INSTAGRAM_USER_ID!

  const result = await graphApiFetch<{ id: string }>(
    `/${userId}/media_publish?creation_id=${containerId}`,
    { method: 'POST' },
  )

  return result.id
}

// ============================================================
// メイン
// ============================================================

export async function postInstagramStory(options: {
  readonly imageUrl: string
  readonly caption: string
}): Promise<InstagramPostResult> {
  if (!isInstagramConfigured()) {
    return {
      success: false,
      error: 'INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID are required',
      status: 'failed',
    }
  }

  if (!options.imageUrl || !options.caption) {
    return {
      success: false,
      error: 'imageUrl and caption are required',
      status: 'failed',
    }
  }

  // Akool連携までは投稿を保留
  if (!isInstagramPostingEnabled()) {
    return {
      success: true,
      status: 'ready',
      error: 'Content prepared. Posting is disabled (INSTAGRAM_POSTING_ENABLED=false).',
    }
  }

  try {
    const containerId = await createMediaContainer({
      imageUrl: options.imageUrl,
      caption: options.caption,
      mediaType: 'STORIES',
    })

    await pollContainerStatus(containerId)
    const mediaId = await publishMedia(containerId)

    return { success: true, mediaId, status: 'posted' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message, status: 'failed' }
  }
}
