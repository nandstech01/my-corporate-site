import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Database } from '@/lib/supabase/database.types'
import React from 'react'
import Image from 'next/image'
import { convertMarkdownImages } from '@/lib/utils/markdown'

type Props = {
  params: {
    business: string
    category: string
    article: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  )
  
  console.log('Params received:', params)
  const decodedSlug = decodeURIComponent(params.article)
  console.log('Decoded slug:', decodedSlug)
  
  // まずビジネスを取得
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.business)
    .single()

  // カテゴリーを取得
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.category)
    .single()

  if (!business || !category) {
    return {
      title: 'Not Found',
      description: 'ページが見つかりませんでした。',
    }
  }

  // 記事を取得
  const { data: post, error: postError } = await supabase
    .from('chatgpt_posts')
    .select('*')
    .eq('slug', decodedSlug)
    .eq('business_id', business.id)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .single()

  console.log('Post query:', { 
    post, 
    error: postError, 
    slug: decodedSlug,
    businessId: business.id,
    categoryId: category.id,
    query: `SELECT * FROM chatgpt_posts WHERE slug = '${decodedSlug}' AND business_id = ${business.id} AND category_id = ${category.id} AND status = 'published'`
  })

  if (!post) {
    return {
      title: 'Not Found',
      description: 'ページが見つかりませんでした。',
    }
  }

  return {
    title: `${post.title} | ${category.name} | ${business.name} | NANDS TECH`,
    description: post.meta_description || post.excerpt || `${post.title}に関する記事です。`,
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  )
  
  console.log('Page params received:', params)
  const decodedSlug = decodeURIComponent(params.article)
  console.log('Page decoded slug:', decodedSlug)
  
  // まずビジネスを取得
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.business)
    .single()

  // カテゴリーを取得
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.category)
    .single()

  if (!business || !category) {
    notFound()
  }

  // 記事を取得
  const { data: post, error: postError } = await supabase
    .from('chatgpt_posts')
    .select('*')
    .eq('slug', decodedSlug)
    .eq('business_id', business.id)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .single()

  console.log('Page post query:', { 
    post, 
    error: postError, 
    slug: decodedSlug,
    businessId: business.id,
    categoryId: category.id,
    query: `SELECT * FROM chatgpt_posts WHERE slug = '${decodedSlug}' AND business_id = ${business.id} AND category_id = ${category.id} AND status = 'published'`
  })

  if (!post) {
    notFound()
  }

  // コンテンツ内の画像を変換
  const processedContent = convertMarkdownImages(post.content)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/blog/${business.slug}/${category.slug}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← {category.name}の記事一覧に戻る
        </Link>
      </div>

      <article className="prose prose-indigo max-w-none">
        <h1 className="text-3xl font-bold mb-8">{post.title}</h1>
        
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}

        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </article>
    </div>
  )
} 