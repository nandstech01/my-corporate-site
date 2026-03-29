/**
 * Instagram Carousel 投稿クライアント
 *
 * Graph API のカルーセル投稿フロー:
 * 1. 各画像の子コンテナ作成 (is_carousel_item=true)
 * 2. 各子コンテナのステータスポーリング
 * 3. 親カルーセルコンテナ作成 (media_type=CAROUSEL, children=ID列)
 * 4. 親コンテナのステータスポーリング
 * 5. 公開 (media_publish)
 *
 * 環境変数: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

// ============================================================
// 型定義
// ============================================================

export interface CarouselPostResult {
  readonly success: boolean
  readonly mediaId?: string
  readonly error?: string
}

interface ContainerStatusResponse {
  readonly status_code:
    | 'EXPIRED'
    | 'ERROR'
    | 'FINISHED'
    | 'IN_PROGRESS'
    | 'PUBLISHED'
  readonly id: string
}

// ============================================================
// API ヘルパー
// ============================================================

const GRAPH_API_BASE = 'https://graph.instagram.com/v21.0'

async function graphApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) {
    throw new Error('INSTAGRAM_ACCESS_TOKEN is required')
  }

  const url = `${GRAPH_API_BASE}${path}`
  const separator = path.includes('?') ? '&' : '?'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const resp = await fetch(`${url}${separator}access_token=${token}`, {
      ...options,
      signal: controller.signal,
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => 'Unknown error')
      throw new Error(`Instagram API ${resp.status}: ${text}`)
    }

    return (await resp.json()) as Promise<T>
  } finally {
    clearTimeout(timeout)
  }
}

// ============================================================
// コンテナポーリング
// ============================================================

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 30

async function pollContainerStatus(containerId: string): Promise<void> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    const status = await graphApiFetch<ContainerStatusResponse>(
      `/${containerId}?fields=status_code`,
    )

    if (status.status_code === 'FINISHED') {
      return
    }

    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      throw new Error(
        `Container ${containerId} failed with status: ${status.status_code}`,
      )
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  throw new Error(
    `Container ${containerId} polling timeout after ${POLL_MAX_ATTEMPTS} attempts`,
  )
}

// ============================================================
// 子コンテナ作成
// ============================================================

async function createChildContainer(imageUrl: string): Promise<string> {
  const userId = process.env.INSTAGRAM_USER_ID
  if (!userId) {
    throw new Error('INSTAGRAM_USER_ID is required')
  }

  const params = new URLSearchParams({
    image_url: imageUrl,
    is_carousel_item: 'true',
  })

  const result = await graphApiFetch<{ id: string }>(
    `/${userId}/media?${params.toString()}`,
    { method: 'POST' },
  )

  return result.id
}

// ============================================================
// 親カルーセルコンテナ作成
// ============================================================

async function createCarouselContainer(
  childIds: readonly string[],
  caption: string,
): Promise<string> {
  const userId = process.env.INSTAGRAM_USER_ID
  if (!userId) {
    throw new Error('INSTAGRAM_USER_ID is required')
  }

  const params = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption,
  })

  const result = await graphApiFetch<{ id: string }>(
    `/${userId}/media?${params.toString()}`,
    { method: 'POST' },
  )

  return result.id
}

// ============================================================
// 公開
// ============================================================

async function publishCarousel(containerId: string): Promise<string> {
  const userId = process.env.INSTAGRAM_USER_ID
  if (!userId) {
    throw new Error('INSTAGRAM_USER_ID is required')
  }

  const result = await graphApiFetch<{ id: string }>(
    `/${userId}/media_publish?creation_id=${containerId}`,
    { method: 'POST' },
  )

  return result.id
}

// ============================================================
// メインエクスポート
// ============================================================

/**
 * 複数画像をInstagramカルーセルとして投稿する。
 *
 * @param imageUrls 公開アクセス可能な画像URLの配列（2-10枚）
 * @param caption 投稿キャプション
 */
export async function postInstagramCarousel(
  imageUrls: string[],
  caption: string,
): Promise<CarouselPostResult> {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.INSTAGRAM_USER_ID) {
    return {
      success: false,
      error: 'INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID are required',
    }
  }

  if (imageUrls.length < 2 || imageUrls.length > 10) {
    return {
      success: false,
      error: `Carousel requires 2-10 images, got ${imageUrls.length}`,
    }
  }

  try {
    // Step 1: Create child containers for each image
    process.stdout.write(
      `Creating ${imageUrls.length} child containers...\n`,
    )
    const childIds: string[] = []

    for (let i = 0; i < imageUrls.length; i++) {
      const childId = await createChildContainer(imageUrls[i])
      process.stdout.write(`  Child ${i + 1}/${imageUrls.length}: ${childId}\n`)
      childIds.push(childId)
    }

    // Step 2: Poll each child container until FINISHED
    process.stdout.write('Polling child containers...\n')
    for (let i = 0; i < childIds.length; i++) {
      await pollContainerStatus(childIds[i])
      process.stdout.write(`  Child ${i + 1}/${childIds.length} ready\n`)
    }

    // Step 3: Create parent carousel container
    process.stdout.write('Creating carousel container...\n')
    const carouselId = await createCarouselContainer(childIds, caption)
    process.stdout.write(`  Carousel container: ${carouselId}\n`)

    // Step 4: Poll parent container
    process.stdout.write('Polling carousel container...\n')
    await pollContainerStatus(carouselId)

    // Step 5: Publish
    process.stdout.write('Publishing carousel...\n')
    const mediaId = await publishCarousel(carouselId)
    process.stdout.write(`  Published: ${mediaId}\n`)

    return { success: true, mediaId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}
