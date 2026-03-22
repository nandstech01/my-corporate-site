/**
 * Brave Search API wrapper for weekly news research.
 */

interface BraveSearchResult {
  readonly title: string
  readonly url: string
  readonly description: string
}

export async function braveWebSearch(
  query: string,
  options?: { count?: number; freshness?: string },
): Promise<readonly BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY
  if (!apiKey) throw new Error('BRAVE_API_KEY is required')

  const params = new URLSearchParams({
    q: query,
    count: String(options?.count ?? 10),
    ...(options?.freshness && { freshness: options.freshness }),
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          Accept: 'application/json',
          'X-Subscription-Token': apiKey,
        },
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      throw new Error(`Brave search failed: ${response.status}`)
    }

    const data = (await response.json()) as {
      web?: { results?: readonly { title: string; url: string; description: string }[] }
    }

    return (data.web?.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      description: r.description,
    }))
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Search multiple queries and deduplicate results.
 */
export async function multiSearch(
  queries: readonly string[],
  options?: { count?: number; freshness?: string },
): Promise<readonly BraveSearchResult[]> {
  const allResults: BraveSearchResult[] = []
  const seenUrls = new Set<string>()

  for (const query of queries) {
    try {
      const results = await braveWebSearch(query, options)
      for (const r of results) {
        if (!seenUrls.has(r.url)) {
          seenUrls.add(r.url)
          allResults.push(r)
        }
      }
    } catch (e) {
      process.stdout.write(`[search] Query "${query}" failed: ${e}\n`)
    }
    // Rate limit buffer
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return allResults
}
