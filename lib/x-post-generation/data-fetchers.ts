/**
 * X投稿生成用データ取得ヘルパー
 *
 * scripts/post-to-x.ts と app/api/generate-x-post-pattern/route.ts の
 * 両方から利用する共通モジュール。
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// 型定義
// ============================================================

export interface Article {
  title: string
  slug: string
  content: string
  meta_description: string | null
  category_tags: string[] | null
}

export interface SearchResult {
  title: string
  description: string
  url: string
}

export interface ResearchData {
  topic: string
  searchResults: SearchResult[]
  urlContent: string | null
}

// ============================================================
// Supabase: 記事取得
// ============================================================

function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function fetchArticle(slug: string): Promise<Article> {
  const supabase = getSupabaseClient()

  // postsテーブルから検索
  const { data: newPost, error: newError } = await supabase
    .from('posts')
    .select('title, slug, content, meta_description, category_tags')
    .eq('status', 'published')
    .eq('slug', slug)
    .single()

  if (newPost) {
    return newPost as Article
  }

  if (newError && newError.code !== 'PGRST116') {
    console.error('postsテーブル検索エラー:', newError)
  }

  // chatgpt_postsテーブルにフォールバック（category_tagsカラムなし）
  const { data: oldPost, error: oldError } = await supabase
    .from('chatgpt_posts')
    .select('title, slug, content, meta_description')
    .eq('status', 'published')
    .eq('slug', slug)
    .single()

  if (oldPost) {
    return { ...oldPost, category_tags: null } as Article
  }

  if (oldError && oldError.code !== 'PGRST116') {
    console.error('chatgpt_postsテーブル検索エラー:', oldError)
  }

  throw new Error(`Article not found: ${slug}`)
}

// ============================================================
// Brave Search: 最新情報収集
// ============================================================

export async function searchBrave(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY
  if (!apiKey) {
    throw new Error('BRAVE_API_KEY is required for research mode')
  }

  const params = new URLSearchParams({
    q: query,
    count: '10',
    freshness: 'pw',
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let response: Response
  try {
    response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          Accept: 'application/json',
          'X-Subscription-Token': apiKey,
        },
        signal: controller.signal,
      },
    )
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new Error(
      `Brave Search API error: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.json()
  const results: SearchResult[] = (data.web?.results || [])
    .slice(0, 5)
    .map((r: { title: string; description: string; url: string }) => ({
      title: r.title,
      description: r.description,
      url: r.url,
    }))

  return results
}

export async function fetchUrlContent(url: string): Promise<string> {
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs are supported')
  }
  const blockedHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '169.254.169.254',
    '[::1]',
  ]
  const isBlockedHost =
    blockedHosts.some((h) => parsed.hostname === h) ||
    parsed.hostname.endsWith('.internal') ||
    parsed.hostname.endsWith('.local') ||
    /^10\./.test(parsed.hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(parsed.hostname) ||
    /^192\.168\./.test(parsed.hostname)
  if (isBlockedHost) {
    throw new Error('Internal/private URLs are not allowed')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NandsTechBot/1.0)',
      },
      signal: controller.signal,
      redirect: 'error',
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new Error(
      `URL fetch error: ${response.status} ${response.statusText}`,
    )
  }

  const html = await response.text()

  // script, style除去 → テキスト抽出
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.slice(0, 3000)
}

export async function researchTopic(
  topic: string,
  url?: string,
): Promise<ResearchData> {
  const searchResults = topic ? await searchBrave(topic) : []
  const urlContent = url ? await fetchUrlContent(url) : null

  return { topic: topic || url || '', searchResults, urlContent }
}
