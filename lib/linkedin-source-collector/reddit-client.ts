/**
 * Reddit API クライアント
 *
 * OAuth2 client_credentials で「使ってみた」系の投稿を収集。
 * 対象 subreddit: LocalLLaMA, ChatGPT, artificial, MachineLearning, ClaudeAI
 */

// ============================================================
// 型定義
// ============================================================

export interface RedditPost {
  readonly id: string
  readonly subreddit: string
  readonly title: string
  readonly selftext: string
  readonly score: number
  readonly numComments: number
  readonly author: string
  readonly createdUtc: number
  readonly permalink: string
}

interface RedditTokenResponse {
  readonly access_token: string
  readonly token_type: string
  readonly expires_in: number
}

interface RedditSearchChild {
  readonly data: {
    readonly id: string
    readonly subreddit: string
    readonly title: string
    readonly selftext: string
    readonly score: number
    readonly num_comments: number
    readonly author: string
    readonly created_utc: number
    readonly permalink: string
  }
}

// ============================================================
// 定数
// ============================================================

const TARGET_SUBREDDITS = 'LocalLLaMA+ChatGPT+artificial+MachineLearning+ClaudeAI'
const SEARCH_QUERY = 'tried OR tested OR built OR implemented OR migrated'
const MIN_SCORE = 20
const MIN_SELFTEXT_LENGTH = 100

// ============================================================
// OAuth2 トークン取得
// ============================================================

async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'NandsTechBot/1.0',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Reddit OAuth failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as RedditTokenResponse
  return data.access_token
}

// ============================================================
// メイン: 「使ってみた」投稿を収集
// ============================================================

export async function fetchRedditPractitionerPosts(): Promise<readonly RedditPost[]> {
  const token = await getRedditAccessToken()

  const params = new URLSearchParams({
    q: SEARCH_QUERY,
    sort: 'top',
    t: 'day',
    limit: '50',
    restrict_sr: 'true',
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let response: Response
  try {
    response = await fetch(
      `https://oauth.reddit.com/r/${TARGET_SUBREDDITS}/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'NandsTechBot/1.0',
        },
        signal: controller.signal,
      },
    )
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new Error(`Reddit search failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const children: RedditSearchChild[] = data?.data?.children ?? []

  return children
    .map((child) => ({
      id: child.data.id,
      subreddit: child.data.subreddit,
      title: child.data.title,
      selftext: child.data.selftext,
      score: child.data.score,
      numComments: child.data.num_comments,
      author: child.data.author,
      createdUtc: child.data.created_utc,
      permalink: `https://reddit.com${child.data.permalink}`,
    }))
    .filter(
      (post) =>
        post.score >= MIN_SCORE && post.selftext.length >= MIN_SELFTEXT_LENGTH,
    )
}
