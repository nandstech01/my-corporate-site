/**
 * トレンド記事取得クライアント
 *
 * HN Algolia API + Dev.to API から AI/LLM 関連のトレンド記事を取得。
 * SDK不要、APIキー不要、完全無料。
 */

// ============================================================
// 型定義
// ============================================================

export interface TrendingStory {
  readonly id: string
  readonly source: 'hackernews' | 'devto'
  readonly title: string
  readonly url: string | null
  readonly points: number
  readonly comments: number
  readonly createdAt: string
  readonly searchQuery: string
}

// ============================================================
// 検索クエリ
// ============================================================

const SEARCH_QUERIES: readonly string[] = [
  'AI agent',
  'LLM',
  'Claude',
  'RAG',
  'GPT',
]

// ============================================================
// HN Algolia API
// ============================================================

interface HNHit {
  readonly objectID: string
  readonly title?: string
  readonly url?: string | null
  readonly points?: number
  readonly num_comments?: number
  readonly created_at?: string
}

async function fetchHNStories(
  query: string,
): Promise<readonly TrendingStory[]> {
  const twoDaysAgo = Math.floor(
    (Date.now() - 48 * 60 * 60 * 1000) / 1000,
  )

  const params = new URLSearchParams({
    query,
    tags: 'story',
    numericFilters: `points>50,created_at_i>${twoDaysAgo}`,
    hitsPerPage: '10',
  })

  const res = await fetch(
    `https://hn.algolia.com/api/v1/search?${params.toString()}`,
  )

  if (!res.ok) return []

  const json = (await res.json()) as { hits?: HNHit[] }
  const hits = json.hits ?? []

  return hits
    .filter(
      (h): h is HNHit & { title: string } =>
        typeof h.title === 'string' && h.title.length > 0,
    )
    .map((h) => ({
      id: `hn_${h.objectID}`,
      source: 'hackernews' as const,
      title: h.title,
      url: h.url ?? null,
      points: h.points ?? 0,
      comments: h.num_comments ?? 0,
      createdAt: h.created_at ?? new Date().toISOString(),
      searchQuery: query,
    }))
}

// ============================================================
// Dev.to API
// ============================================================

interface DevtoArticle {
  readonly id: number
  readonly title?: string
  readonly url?: string
  readonly positive_reactions_count?: number
  readonly comments_count?: number
  readonly published_at?: string
}

async function fetchDevtoStories(): Promise<readonly TrendingStory[]> {
  const params = new URLSearchParams({
    tag: 'ai',
    top: '1',
    per_page: '10',
  })

  const res = await fetch(
    `https://dev.to/api/articles?${params.toString()}`,
  )

  if (!res.ok) return []

  const articles = (await res.json()) as DevtoArticle[]

  return articles
    .filter(
      (a): a is DevtoArticle & { title: string } =>
        typeof a.title === 'string' && a.title.length > 0,
    )
    .map((a) => ({
      id: `devto_${a.id}`,
      source: 'devto' as const,
      title: a.title,
      url: a.url ?? null,
      points: a.positive_reactions_count ?? 0,
      comments: a.comments_count ?? 0,
      createdAt: a.published_at ?? new Date().toISOString(),
      searchQuery: 'ai',
    }))
}

// ============================================================
// メイン取得関数
// ============================================================

export async function fetchTrendingStories(): Promise<
  readonly TrendingStory[]
> {
  const hnPromises = SEARCH_QUERIES.map((q) => fetchHNStories(q))
  const devtoPromise = fetchDevtoStories()

  const results = await Promise.allSettled([...hnPromises, devtoPromise])

  const allStories: TrendingStory[] = []
  const seenTitles = new Set<string>()

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const story of result.value) {
        const key = story.title.toLowerCase().trim()
        if (!seenTitles.has(key)) {
          seenTitles.add(key)
          allStories.push(story)
        }
      }
    }
  }

  return allStories.sort((a, b) => b.points - a.points)
}
