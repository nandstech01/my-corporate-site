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
};

export const metadata: Metadata = {
  title: 'ブログ | NANDS AIソリューション',
  description: 'NANDSのブログでは、AI技術やリスキリング、副業に関する最新情報をお届けします。',
  keywords: '生成AI,ChatGPT,副業支援,リスキリング,AI導入,DX推進,キャリアアップ,AI活用,NANDS',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/blog` : undefined
  },
  openGraph: {
    title: 'NANDSブログ | 生成AI時代の総合情報メディア',
    description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
    url: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/blog` : undefined,
    siteName: 'NANDS',
    locale: 'ja_JP',
    type: 'website',
  }
}

export const revalidate = 3600 // 1時間ごとに再検証

async function getBlogPosts(): Promise<Post[]> {
  const supabase = createClient()
  
  try {
    const { data: posts, error } = await supabase
      .from('chatgpt_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        thumbnail_url,
        featured_image,
        categories (
          name,
          slug
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }

    return (posts || []).map(post => {
      // Log the image URLs for debugging
      console.log('Post image URLs:', {
        id: post.id,
        title: post.title,
        thumbnail_url: post.thumbnail_url,
        featured_image: post.featured_image
      });
      
      // Ensure the image URLs are absolute
      const imageUrl = post.thumbnail_url || post.featured_image;
      const finalImageUrl = imageUrl 
        ? imageUrl.startsWith('http') 
          ? imageUrl 
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
        : null;
      
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        thumbnail_url: finalImageUrl,
        featured_image: finalImageUrl,
        category: post.categories?.[0]
      };
    });
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    return [];
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