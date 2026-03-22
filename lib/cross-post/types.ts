/**
 * Cross-Post System Types
 *
 * nands.tech -> Zenn / Qiita / note multi-platform distribution.
 */

// ============================================================
// Platform Types
// ============================================================

export type CrossPostPlatform = 'zenn' | 'qiita' | 'note'

// ============================================================
// Request / Result
// ============================================================

export interface CrossPostRequest {
  readonly slug: string
  readonly platforms: readonly CrossPostPlatform[]
  readonly dryRun?: boolean
}

export interface CrossPostResult {
  readonly platform: CrossPostPlatform
  readonly success: boolean
  readonly url?: string
  readonly error?: string
}

// ============================================================
// Rewritten Content
// ============================================================

export interface RewrittenArticle {
  readonly platform: CrossPostPlatform
  readonly title: string
  readonly body: string
  readonly tags: readonly string[]
  readonly emoji?: string // Zenn only
  readonly canonicalUrl: string
}

// ============================================================
// Thumbnail
// ============================================================

export interface CrossPostThumbnail {
  readonly platform: CrossPostPlatform
  readonly imageUrl: string
  readonly imageBuffer: Buffer
}

export interface ThumbnailSpec {
  readonly width: number
  readonly height: number
  readonly style: string
}

export const THUMBNAIL_SPECS: Readonly<Record<CrossPostPlatform, ThumbnailSpec>> = {
  zenn: { width: 800, height: 800, style: 'emoji + title card' },
  qiita: { width: 1200, height: 630, style: 'OGP technical design' },
  note: { width: 1280, height: 670, style: 'casual readable banner' },
}

// ============================================================
// Analytics DB Row
// ============================================================

export interface CrossPostAnalyticsRow {
  readonly post_id: number
  readonly platform: CrossPostPlatform
  readonly external_url: string | null
  readonly external_id: string | null
  readonly status: 'pending' | 'posted' | 'failed'
  readonly posted_at: string | null
  readonly error_message: string | null
}
