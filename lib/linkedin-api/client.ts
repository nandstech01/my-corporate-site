/**
 * LinkedIn API クライアント
 *
 * LinkedIn Posts API (v2) で投稿を作成。
 * 環境変数: LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_ID
 */

// ============================================================
// 型定義
// ============================================================

export interface LinkedInPostResult {
  readonly success: boolean
  readonly postId?: string
  readonly postUrl?: string
  readonly error?: string
}

interface LinkedInPostBody {
  readonly author: string
  readonly commentary: string
  readonly visibility: string
  readonly distribution: {
    readonly feedDistribution: string
    readonly targetEntities: readonly string[]
    readonly thirdPartyDistributionChannels: readonly string[]
  }
  readonly lifecycleState: string
  readonly isReshareDisabledByAuthor: boolean
}

// ============================================================
// メイン
// ============================================================

export function isLinkedInConfigured(): boolean {
  return !!(
    process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_PERSON_ID
  )
}

export async function postToLinkedIn(options: {
  readonly text: string
  readonly visibility?: 'PUBLIC' | 'CONNECTIONS'
}): Promise<LinkedInPostResult> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN
  const personId = process.env.LINKEDIN_PERSON_ID

  if (!accessToken || !personId) {
    return {
      success: false,
      error: 'LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_ID are required',
    }
  }

  if (!options.text || options.text.trim().length === 0) {
    return { success: false, error: 'Post text is empty' }
  }

  const body: LinkedInPostBody = {
    author: `urn:li:person:${personId}`,
    commentary: options.text,
    visibility: options.visibility === 'CONNECTIONS' ? 'CONNECTIONS' : 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let response: Response
  try {
    response = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202602',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (response.status === 201) {
    // LinkedIn returns the post URN in the x-restli-id header
    const postUrn = response.headers.get('x-restli-id') ?? ''
    const postId = postUrn.replace('urn:li:share:', '')
    const postUrl = postId
      ? `https://www.linkedin.com/feed/update/urn:li:share:${postId}/`
      : undefined

    return { success: true, postId, postUrl }
  }

  const errorText = await response.text().catch(() => 'Unknown error')
  return {
    success: false,
    error: `LinkedIn API error (${response.status}): ${errorText}`,
  }
}
