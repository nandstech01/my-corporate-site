/**
 * Publisher: resolve category/business, generate slug, insert into `posts`.
 * Minimal render-required fields only (structured-data is SEO-only, skipped).
 */

import { createClient } from '@supabase/supabase-js'
import type { GeneratedArticle, PublishResult } from './types'

const SITE_BASE = process.env.BLOG_SITE_BASE || 'https://nands.tech'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key)
}

async function resolveCategory(slug: string): Promise<{ categoryId: number; businessId: number }> {
  const sb = getSupabase()
  const { data } = await sb.from('categories').select('id, business_id').eq('slug', slug).single()
  if (data?.id) return { categoryId: data.id as number, businessId: (data.business_id as number) ?? 1 }
  // Fallback to first available category if the slug is missing.
  const { data: first } = await sb.from('categories').select('id, business_id').limit(1).single()
  return { categoryId: (first?.id as number) ?? 1, businessId: (first?.business_id as number) ?? 1 }
}

export async function publishPost(
  article: GeneratedArticle,
  categorySlug: string,
  thumbnailUrl: string | null,
  publish: boolean,
): Promise<PublishResult> {
  const sb = getSupabase()
  const { categoryId, businessId } = await resolveCategory(categorySlug)

  const rand = Math.random().toString(36).slice(2, 8)
  const slug = `${article.slugBase}-${rand}`.slice(0, 90)
  const status = publish ? 'published' : 'draft'

  const row: Record<string, unknown> = {
    title: article.title,
    content: article.markdown,
    slug,
    business_id: businessId,
    category_id: categoryId,
    status,
    meta_description: article.metaDescription || article.title,
    meta_keywords: article.metaKeywords,
    category_tags: article.categoryTags, // required by crossPostArticle/fetchArticle
    thumbnail_url: thumbnailUrl,
  }
  if (publish) row.published_at = new Date().toISOString()

  const { error } = await sb.from('posts').insert(row)
  if (error) throw new Error(`posts insert failed: ${error.message}`)

  return { slug, status, url: `${SITE_BASE}/posts/${slug}`, thumbnailUrl }
}
