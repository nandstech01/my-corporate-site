/**
 * Trending Thumbnails Research
 *
 * Fetches trending articles from Zenn and Qiita for thumbnail prompt improvement.
 * This is a research/reference module - not required for the main pipeline.
 */

// ============================================================
// Types
// ============================================================

export interface TrendingArticle {
  readonly title: string
  readonly url: string
  readonly tags: readonly string[]
  readonly likes: number
}

interface ZennArticleResponse {
  readonly articles: ReadonlyArray<{
    readonly title: string
    readonly slug: string
    readonly path: string
    readonly liked_count: number
    readonly topics?: ReadonlyArray<{ readonly name: string }>
  }>
}

interface QiitaItemResponse {
  readonly title: string
  readonly url: string
  readonly likes_count: number
  readonly tags: ReadonlyArray<{ readonly name: string }>
}

// ============================================================
// Zenn Trending
// ============================================================

async function fetchZennTrending(): Promise<readonly TrendingArticle[]> {
  try {
    const response = await fetch('https://zenn.dev/api/articles?order=daily')

    if (!response.ok) {
      process.stdout.write(`Zenn API returned ${response.status}\n`)
      return []
    }

    const data = (await response.json()) as ZennArticleResponse
    const articles = data.articles ?? []

    return articles.slice(0, 10).map((article) => ({
      title: article.title,
      url: `https://zenn.dev${article.path}`,
      tags: (article.topics ?? []).map((t) => t.name),
      likes: article.liked_count,
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Failed to fetch Zenn trending: ${message}\n`)
    return []
  }
}

// ============================================================
// Qiita Trending
// ============================================================

async function fetchQiitaTrending(): Promise<readonly TrendingArticle[]> {
  try {
    const response = await fetch(
      'https://qiita.com/api/v2/items?query=stocks:>50&per_page=10',
    )

    if (!response.ok) {
      process.stdout.write(`Qiita API returned ${response.status}\n`)
      return []
    }

    const data = (await response.json()) as ReadonlyArray<QiitaItemResponse>

    return data.map((item) => ({
      title: item.title,
      url: item.url,
      tags: item.tags.map((t) => t.name),
      likes: item.likes_count,
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Failed to fetch Qiita trending: ${message}\n`)
    return []
  }
}

// ============================================================
// Main Export
// ============================================================

export async function fetchTrendingArticles(): Promise<{
  readonly zenn: readonly TrendingArticle[]
  readonly qiita: readonly TrendingArticle[]
}> {
  process.stdout.write('Fetching trending articles from Zenn and Qiita...\n')

  const [zenn, qiita] = await Promise.all([
    fetchZennTrending(),
    fetchQiitaTrending(),
  ])

  process.stdout.write(
    `Trending results: ${zenn.length} Zenn articles, ${qiita.length} Qiita articles\n`,
  )

  return { zenn, qiita }
}
