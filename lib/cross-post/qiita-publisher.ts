/**
 * Qiita Publisher
 *
 * Posts articles to Qiita via API v2.
 * Rate limit: 1000 requests/hour (authenticated).
 *
 * Account: 原田賢治 (個人アカウント)
 */

import type { RewrittenArticle, CrossPostResult } from './types'

// ============================================================
// Constants
// ============================================================

const QIITA_API_BASE = 'https://qiita.com/api/v2'
const QIITA_MAX_TAGS = 5

// ============================================================
// Types
// ============================================================

interface QiitaTag {
  readonly name: string
}

interface QiitaItemPayload {
  readonly title: string
  readonly body: string
  readonly tags: readonly QiitaTag[]
  readonly private: boolean
  readonly canonical_url?: string
}

interface QiitaItemResponse {
  readonly id: string
  readonly url: string
  readonly title: string
}

// ============================================================
// Helpers
// ============================================================

function getQiitaToken(): string {
  const token = process.env.QIITA_ACCESS_TOKEN
  if (!token) {
    throw new Error('QIITA_ACCESS_TOKEN is not configured')
  }
  return token
}

/**
 * Map article tags to Qiita tag format (max 5 tags).
 */
function toQiitaTags(tags: readonly string[]): readonly QiitaTag[] {
  return tags.slice(0, QIITA_MAX_TAGS).map((name) => ({ name }))
}

/**
 * Extract rate limit info from response headers.
 */
function logRateLimit(headers: Headers): void {
  const remaining = headers.get('rate-remaining')
  const limit = headers.get('rate-limit')
  if (remaining && limit) {
    process.stdout.write(`[qiita] Rate limit: ${remaining}/${limit} remaining\n`)
  }
}

// ============================================================
// Main Export
// ============================================================

export async function publishToQiita(
  article: RewrittenArticle,
): Promise<CrossPostResult> {
  try {
    const token = getQiitaToken()

    const payload: QiitaItemPayload = {
      title: article.title,
      body: article.body,
      tags: toQiitaTags(article.tags),
      private: false,
      ...(article.canonicalUrl ? { canonical_url: article.canonicalUrl } : {}),
    }

    process.stdout.write(`[qiita] Publishing: ${article.title}\n`)

    const response = await fetch(`${QIITA_API_BASE}/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    logRateLimit(response.headers)

    if (!response.ok) {
      const errorData = (await response.json()) as { readonly message?: string; readonly type?: string }
      const detail = errorData.message ?? `HTTP ${response.status}`
      throw new Error(`Qiita API error: ${detail}`)
    }

    const data = (await response.json()) as QiitaItemResponse

    process.stdout.write(`[qiita] Published: ${data.url}\n`)

    return {
      platform: 'qiita',
      success: true,
      url: data.url,
      externalId: data.id,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`[qiita] Failed: ${message}\n`)

    return {
      platform: 'qiita',
      success: false,
      error: message,
    }
  }
}
