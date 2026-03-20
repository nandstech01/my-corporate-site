/**
 * Zenn API クライアント
 *
 * Zenn の公開 API から AI/LLM 関連の最新記事を取得。
 * 48 時間以内の記事のみフィルタリング。
 */

// ============================================================
// 型定義
// ============================================================

export interface ZennArticle {
  readonly id: number
  readonly title: string
  readonly slug: string
  readonly bodyLettersCount: number
  readonly likedCount: number
  readonly publishedAt: string
  readonly url: string
  readonly userName: string
}

interface ZennApiArticle {
  readonly id: number
  readonly title: string
  readonly slug: string
  readonly body_letters_count: number
  readonly liked_count: number
  readonly published_at: string
  readonly user: {
    readonly username: string
  }
}

interface ZennApiResponse {
  readonly articles: readonly ZennApiArticle[]
}

// ============================================================
// 設定
// ============================================================

const ZENN_API_BASE = 'https://zenn.dev/api/articles'

const TOPICS = [
  'ai',
  'llm',
  'claude',
  'openai',
  'rag',
  'langchain',
  'machine-learning',
] as const

const FRESHNESS_HOURS = 48

// ============================================================
// メイン
// ============================================================

export async function fetchZennArticles(): Promise<readonly ZennArticle[]> {
  const cutoff = new Date(Date.now() - FRESHNESS_HOURS * 60 * 60 * 1000)
  const seen = new Set<number>()
  const articles: ZennArticle[] = []

  const results = await Promise.allSettled(
    TOPICS.map(async (topic) => {
      const url = `${ZENN_API_BASE}?topicname=${topic}&order=latest`
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) return []
      const data = (await res.json()) as ZennApiResponse
      return data.articles ?? []
    }),
  )

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const article of result.value) {
      if (seen.has(article.id)) continue
      seen.add(article.id)

      const publishedAt = new Date(article.published_at)
      if (publishedAt < cutoff) continue

      articles.push({
        id: article.id,
        title: article.title,
        slug: article.slug,
        bodyLettersCount: article.body_letters_count,
        likedCount: article.liked_count,
        publishedAt: article.published_at,
        url: `https://zenn.dev/${article.user.username}/articles/${article.slug}`,
        userName: article.user.username,
      })
    }
  }

  // Sort by likes descending
  return articles.sort((a, b) => b.likedCount - a.likedCount)
}
