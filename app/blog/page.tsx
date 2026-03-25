import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Database } from '@/lib/database.types'
import { BUSINESS_CATEGORIES, BusinessCategory, Category } from './metadata'
import Image from 'next/image'
import './blog.css'
import PostsGrid from '@/components/common/PostsGrid'
import { createClient } from '@/utils/supabase/server'

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string | null;
  featured_image?: string | null;
  category?: {
    name: string;
    slug: string;
  };
  created_at?: string;
};

export const metadata: Metadata = {
  title: 'ブログ | NANDS AIソリューション',
  description: 'NANDSのブログでは、AI技術やリスキリング、副業に関する最新情報をお届けします。',
  keywords: '生成AI,ChatGPT,副業支援,リスキリング,AI導入,DX推進,キャリアアップ,AI活用,NANDS',
  alternates: {
    canonical: 'https://nands.tech/blog'
  },
  openGraph: {
    title: 'NANDSブログ | 生成AI時代の総合情報メディア',
    description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
    url: 'https://nands.tech/blog',
    siteName: 'NANDS',
    locale: 'ja_JP',
    type: 'website',
  }
}

export const revalidate = 3600 // 1時間ごとに再検証

async function getBlogPosts(): Promise<Post[]> {
  const supabase = createClient()
  const allPosts: Post[] = []

  try {
    // 1. chatgpt_posts テーブル（レガシー）
    const { data: legacyPosts } = await supabase
      .from('chatgpt_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        thumbnail_url,
        featured_image,
        created_at,
        categories (
          name,
          slug
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (legacyPosts) {
      for (const post of legacyPosts) {
        const imageUrl = post.thumbnail_url || post.featured_image
        const finalImageUrl = imageUrl
          ? imageUrl.startsWith('http')
            ? imageUrl
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
          : null

        allPosts.push({
          id: `legacy-${post.id}`,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          thumbnail_url: finalImageUrl,
          featured_image: finalImageUrl,
          category: post.categories?.[0],
          created_at: post.created_at,
        })
      }
    }

    // 2. posts テーブル（新規）
    const { data: newPosts } = await supabase
      .from('posts')
      .select('id, title, slug, content, thumbnail_url, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (newPosts) {
      for (const post of newPosts) {
        // slugの重複チェック（chatgpt_postsと同じ記事を除外）
        if (allPosts.some((p) => p.slug === post.slug)) continue

        const imageUrl = post.thumbnail_url
          ? post.thumbnail_url.startsWith('http')
            ? post.thumbnail_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.thumbnail_url}`
          : null

        // contentから最初の200文字を抜粋として使用
        const excerpt = post.content
          ? post.content.replace(/^#+\s.*/gm, '').replace(/\n+/g, ' ').trim().slice(0, 200)
          : ''

        allPosts.push({
          id: String(post.id),
          title: post.title,
          slug: post.slug,
          excerpt,
          thumbnail_url: imageUrl,
          category: undefined,
          created_at: post.created_at,
        })
      }
    }

    // created_at降順でソート
    allPosts.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

    return allPosts
  } catch (error) {
    console.error('Error in getBlogPosts:', error)
    return []
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">ブログ記事一覧</h1>
      <PostsGrid initialPosts={posts} />
    </div>
  )
} 