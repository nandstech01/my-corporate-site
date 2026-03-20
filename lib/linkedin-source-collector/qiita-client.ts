/**
 * Qiita API クライアント
 *
 * Qiita API v2 から AI/LLM 関連の最新記事を取得。
 * QIITA_ACCESS_TOKEN 環境変数が設定されていればレート制限を緩和。
 */

// ============================================================
// 型定義
// ============================================================

export interface QiitaArticle {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly likesCount: number
  readonly createdAt: string
  readonly url: string
  readonly userName: string
  readonly tags: readonly string[]
}

interface QiitaApiArticle {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly likes_count: number
  readonly created_at: string
  readonly url: string
  readonly user: {
    readonly id: string
  }
  readonly tags: readonly { readonly name: string }[]
}

// ============================================================
// 設定
// ============================================================

const QIITA_API_BASE = 'https://qiita.com/api/v2/items'

const TAGS = [
  'AI',
  'LLM',
  'Claude',
  'GPT',
  'RAG',
  '機械学習',
  'ChatGPT',
] as const

const FRESHNESS_HOURS = 48

// ============================================================
// メイン
// ============================================================

export async function fetchQiitaArticles(): Promise<readonly QiitaArticle[]> {
  const since = new Date(Date.now() - FRESHNESS_HOURS * 60 * 60 * 1000)
  const sinceDate = since.toISOString().slice(0, 10) // YYYY-MM-DD

  const token = process.env.QIITA_ACCESS_TOKEN
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const seen = new Set<string>()
  const articles: QiitaArticle[] = []

  const results = await Promise.allSettled(
    TAGS.map(async (tag) => {
      const query = encodeURIComponent(`tag:${tag} created:>=${sinceDate}`)
      const url = `${QIITA_API_BASE}?query=${query}&per_page=20`
      const res = await fetch(url, { headers })
      if (!res.ok) return []
      return (await res.json()) as QiitaApiArticle[]
    }),
  )

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const article of result.value) {
      if (seen.has(article.id)) continue
      seen.add(article.id)

      articles.push({
        id: article.id,
        title: article.title,
        body: article.body.slice(0, 500),
        likesCount: article.likes_count,
        createdAt: article.created_at,
        url: article.url,
        userName: article.user.id,
        tags: article.tags.map((t) => t.name),
      })
    }
  }

  // Sort by likes descending
  return articles.sort((a, b) => b.likesCount - a.likesCount)
}
