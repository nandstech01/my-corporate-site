/**
 * ブログの公開データ取得専用の Supabase クライアント (cookie を使わない anon)。
 *
 * utils/supabase/server.ts は cookies() を呼ぶためページが動的描画になり ISR が効かない。
 * 記事・一覧・feed・llms.txt はこちらを使い、route の `revalidate` で静的再生成させる。
 * RLS: posts / chatgpt_posts とも anon の SELECT は status='published' の行だけ (2026-09-26 pg_policies で確認)。
 * それでも下のクエリは status='published' を明示し、RLS だけに依存しない。
 *
 * DB エラーは throw する。null を返すと ISR が 404 を revalidate 秒間キャッシュしてしまうため
 * (throw なら Next は直前の正常なページを出し続ける)。
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { decodePostSlug } from '@/lib/structured-data/site-entities'

export type PostSource = 'posts' | 'chatgpt_posts'

/** posts → chatgpt_posts の順。同じ slug があれば posts を採用する (詳細・一覧・sitemap で共通) */
const SOURCES: readonly PostSource[] = ['posts', 'chatgpt_posts']

/** select('*') の結果。両テーブル共通の列 + 片方にしかない列は optional */
export interface PublishedPost {
  id: number
  slug: string
  title: string
  content: string
  status: string | null
  meta_description: string | null
  thumbnail_url: string | null
  canonical_url: string | null
  category_id: number | null
  business_id: number | null
  published_at: string | null
  created_at: string
  updated_at: string | null
  // posts のみ
  meta_keywords?: string[] | null
  category_tags?: string[] | null
  youtube_script_id?: number | null
  youtube_script_status?: string | null
  // chatgpt_posts のみ
  excerpt?: string | null
  featured_image?: string | null
  seo_keywords?: string[] | null
  is_indexable?: boolean | null
  author_slug?: string | null
  source: PostSource
}

export interface PublishedPostSummary {
  id: number
  slug: string
  title: string
  meta_description: string | null
  /** 一覧用の抜粋。posts は meta_description、chatgpt_posts は excerpt (無ければ meta_description) */
  excerpt: string | null
  published_at: string | null
  created_at: string
  updated_at: string | null
  thumbnail_url: string | null
  /** 表示用の絶対 URL。thumbnail_url → featured_image (chatgpt_posts) の順 */
  image_url: string | null
  source: PostSource
}

export interface SummaryRow {
  id: number
  slug: string
  title: string
  meta_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string | null
  thumbnail_url: string | null
  excerpt?: string | null
  featured_image?: string | null
}

const SUMMARY_COLUMNS: Record<PostSource, string> = {
  posts: 'id,slug,title,meta_description,published_at,created_at,updated_at,thumbnail_url',
  chatgpt_posts:
    'id,slug,title,meta_description,excerpt,featured_image,published_at,created_at,updated_at,thumbnail_url',
}

/** PostgREST の max-rows (既定 1000) を超えても取りこぼさないためのページ幅 */
const PAGE_SIZE = 1000

let publicClient: SupabaseClient | null = null

export function getPublicSupabase(): SupabaseClient {
  if (publicClient) return publicClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です')
  }

  publicClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    // 呼び出し時に global fetch を解決し、Next が差し替えた fetch (Data Cache / ISR) を必ず通す
    global: { fetch: (...args: Parameters<typeof fetch>) => fetch(...args) },
  })
  return publicClient
}

/**
 * 公開済み記事を slug の完全一致で 1 件取得する (posts → chatgpt_posts)。部分一致はしない。
 * slug は DB の生の値でも、パーセントエンコードされた params.slug でもよい。
 */
export async function getPublishedPostBySlug(slug: string): Promise<PublishedPost | null> {
  const exactSlug = decodePostSlug(slug)
  if (!exactSlug) return null

  for (const source of SOURCES) {
    const { data, error } = await getPublicSupabase()
      .from(source)
      .select('*')
      .eq('status', 'published')
      .eq('slug', exactSlug)
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(`${source} の記事取得に失敗しました: ${error.message}`)
    }
    if (data) {
      return { ...(data as Omit<PublishedPost, 'source'>), source }
    }
  }
  return null
}

async function fetchSummaryRows(source: PostSource): Promise<SummaryRow[]> {
  const fetchPage = async (from: number): Promise<{ rows: SummaryRow[]; total: number }> => {
    const { data, error, count } = await getPublicSupabase()
      .from(source)
      .select(SUMMARY_COLUMNS[source], { count: 'exact' })
      .eq('status', 'published')
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      throw new Error(`${source} の記事一覧取得に失敗しました: ${error.message}`)
    }
    const rows = (data ?? []) as unknown as SummaryRow[]
    return { rows, total: count ?? rows.length }
  }

  const first = await fetchPage(0)
  let collected = first.rows
  while (collected.length < first.total) {
    const next = await fetchPage(collected.length)
    if (next.rows.length === 0) break
    collected = [...collected, ...next.rows]
  }
  return collected
}

function toAbsoluteImageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  // 一覧ページ (app/posts/page.tsx) と同じ解決方法。相対パスは Storage の public バケット
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
}

function toSummary(row: SummaryRow, source: PostSource): PublishedPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    meta_description: row.meta_description ?? null,
    excerpt:
      source === 'posts'
        ? row.meta_description ?? null
        : row.excerpt ?? row.meta_description ?? null,
    published_at: row.published_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at ?? null,
    thumbnail_url: row.thumbnail_url ?? null,
    image_url: toAbsoluteImageUrl(row.thumbnail_url || row.featured_image),
    source,
  }
}

function publishedTime(post: PublishedPostSummary): number {
  const time = Date.parse(post.published_at ?? post.created_at)
  return Number.isNaN(time) ? 0 : time
}

/**
 * posts と chatgpt_posts の行を 1 本にまとめる (純関数)。
 * slug が重複したら先に来た posts 側を残し、公開日 (published_at ?? created_at) の新しい順に並べる。
 */
export function mergePublishedPosts(
  postsRows: readonly SummaryRow[],
  chatgptRows: readonly SummaryRow[],
  limit?: number
): PublishedPostSummary[] {
  const candidates = [
    ...postsRows.map((row) => toSummary(row, 'posts')),
    ...chatgptRows.map((row) => toSummary(row, 'chatgpt_posts')),
  ]
  const bySlug = new Map<string, PublishedPostSummary>()
  for (const post of candidates) {
    if (post.slug && !bySlug.has(post.slug)) bySlug.set(post.slug, post)
  }
  const sorted = Array.from(bySlug.values()).sort(
    (a, b) => publishedTime(b) - publishedTime(a) || a.slug.localeCompare(b.slug)
  )
  return limit === undefined ? sorted : sorted.slice(0, Math.max(0, Math.floor(limit)))
}

/**
 * 公開済み記事の一覧 (posts + chatgpt_posts、slug で重複排除、公開日の新しい順)。
 * 公開日の並べ替えに published_at ?? created_at が要るため全件を取ってから limit で切る (現状 124 件)。
 */
export async function listPublishedPosts(
  options: { limit?: number } = {}
): Promise<PublishedPostSummary[]> {
  const [postsRows, chatgptRows] = await Promise.all([
    fetchSummaryRows('posts'),
    fetchSummaryRows('chatgpt_posts'),
  ])
  return mergePublishedPosts(postsRows, chatgptRows, options.limit)
}
