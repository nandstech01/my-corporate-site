/**
 * RSS フィード収集クライアント
 *
 * 公式 AI 企業ブログの RSS フィードを監視し、
 * 直近 24 時間の記事を取得する。
 */

import RssParser from 'rss-parser'

// ============================================================
// 型定義
// ============================================================

export interface FeedArticle {
  readonly id: string
  readonly feedName: string
  readonly title: string
  readonly description: string
  readonly url: string
  readonly publishedAt: string
}

// ============================================================
// 監視対象フィード
// ============================================================

interface FeedSource {
  readonly name: string
  readonly url: string
}

const FEED_SOURCES: readonly FeedSource[] = [
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' },
  { name: 'Anthropic News', url: 'https://www.anthropic.com/rss.xml' },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/' },
  { name: 'Meta AI Blog', url: 'https://ai.meta.com/blog/rss/' },
  { name: 'Microsoft AI Blog', url: 'https://blogs.microsoft.com/ai/feed/' },
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'LangChain Blog', url: 'https://blog.langchain.dev/rss/' },
] as const

const FRESHNESS_HOURS = 24
const FETCH_TIMEOUT_MS = 10_000

// ============================================================
// フィード取得
// ============================================================

async function fetchSingleFeed(
  source: FeedSource,
  cutoff: Date,
): Promise<readonly FeedArticle[]> {
  const parser = new RssParser({
    timeout: FETCH_TIMEOUT_MS,
    headers: {
      'User-Agent': 'LinkedInAutoPost/1.0 (RSS Reader)',
    },
  })

  const feed = await parser.parseURL(source.url)

  return (feed.items ?? [])
    .filter((item: any) => {
      if (!item.pubDate) return false
      const published = new Date(item.pubDate)
      return published >= cutoff
    })
    .map((item: any) => ({
      id: `rss_${source.name.toLowerCase().replace(/\s+/g, '_')}_${Buffer.from(item.link ?? item.title ?? '').toString('base64url').slice(0, 20)}`,
      feedName: source.name,
      title: item.title ?? 'Untitled',
      description: (item.contentSnippet ?? item.content ?? '').slice(0, 500),
      url: item.link ?? '',
      publishedAt: item.pubDate ?? new Date().toISOString(),
    }))
}

// ============================================================
// メインエクスポート
// ============================================================

export async function fetchRSSFeeds(): Promise<readonly FeedArticle[]> {
  const cutoff = new Date(Date.now() - FRESHNESS_HOURS * 60 * 60 * 1000)

  const results = await Promise.allSettled(
    FEED_SOURCES.map((source) => fetchSingleFeed(source, cutoff)),
  )

  const articles: FeedArticle[] = []

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
    } else {
      process.stdout.write(
        `RSS feed "${FEED_SOURCES[i].name}" failed: ${result.reason}\n`,
      )
    }
  }

  return articles
}
