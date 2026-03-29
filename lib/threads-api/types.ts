/**
 * Threads API 型定義
 */

export type ThreadsMediaType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL'

export interface ThreadsPostResult {
  readonly success: boolean
  readonly mediaId?: string
  readonly permalinkUrl?: string
  readonly error?: string
  readonly status: 'posted' | 'ready' | 'failed'
}
