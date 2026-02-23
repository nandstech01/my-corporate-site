/**
 * BuzzSumo / Brave Search クライアント
 *
 * AI業界のトレンドコンテンツを検索。
 * Brave Search APIで「AI」「LLM」等のキーワードでバズコンテンツを取得。
 */

// ============================================================
// Types
// ============================================================

export interface TrendingContent {
  readonly title: string
  readonly url: string
  readonly description: string
  readonly age?: string
  readonly source?: string
}

interface BraveWebResult {
  readonly title?: string
  readonly url?: string
  readonly description?: string
  readonly age?: string
  readonly profile?: { readonly name?: string }
}

interface BraveSearchResponse {
  readonly web?: {
    readonly results?: readonly BraveWebResult[]
  }
}

// ============================================================
// Constants
// ============================================================

const BRAVE_SEARCH_ENDPOINT =
  'https://api.search.brave.com/res/v1/web/search'

const TRENDING_QUERIES: readonly string[] = [
  'AI エージェント 最新',
  'LLM 実装 トレンド',
  'generative AI news',
  'Claude GPT 新機能',
  'AI 自動化 ビジネス',
]

const REQUEST_TIMEOUT_MS = 15_000

// ============================================================
// Helpers
// ============================================================

function getBraveApiKey(): string {
  const key = process.env.BRAVE_API_KEY
  if (!key) {
    throw new Error(
      'BRAVE_API_KEY is not configured. Get one at https://api.search.brave.com/register',
    )
  }
  return key
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return 'unknown'
  }
}

/**
 * Date-based query rotation.
 * Uses the day-of-year to deterministically pick a query index.
 */
function getRotatedQueryIndex(queryCount: number): number {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return dayOfYear % queryCount
}

// ============================================================
// Core: Brave Search wrapper
// ============================================================

export async function searchBuzzContent(
  query: string,
  options?: { readonly count?: number },
): Promise<readonly TrendingContent[]> {
  const apiKey = getBraveApiKey()
  const count = options?.count ?? 10

  const params = new URLSearchParams({
    q: query,
    count: String(count),
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${BRAVE_SEARCH_ENDPOINT}?${params}`, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown')
    throw new Error(
      `Brave Search API error: ${response.status} - ${errorText}`,
    )
  }

  const data: BraveSearchResponse = await response.json()
  const rawResults = data.web?.results ?? []

  return rawResults.map(
    (r): TrendingContent => ({
      title: r.title ?? '',
      url: r.url ?? '',
      description: r.description ?? '',
      age: r.age,
      source: r.profile?.name ?? extractDomain(r.url ?? ''),
    }),
  )
}

// ============================================================
// Trending AI content (rotated query)
// ============================================================

export async function searchTrendingAIContent(
  options?: { readonly language?: 'ja' | 'en'; readonly limit?: number },
): Promise<readonly TrendingContent[]> {
  const limit = options?.limit ?? 10

  const queryIndex = getRotatedQueryIndex(TRENDING_QUERIES.length)
  const query = TRENDING_QUERIES[queryIndex]

  try {
    const results = await searchBuzzContent(query, { count: limit })
    return results
  } catch (error) {
    // Best-effort: return empty on failure so the pipeline continues
    process.stdout.write(
      `[buzzsumo-client] searchTrendingAIContent failed: ${error instanceof Error ? error.message : String(error)}\n`,
    )
    return []
  }
}
