import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import MarkdownContent from '@/components/blog/MarkdownContent'
import Script from 'next/script'
import Breadcrumbs from '@/app/components/common/Breadcrumbs'
import { RefreshCw } from 'lucide-react'

// BreadcrumbItemの型定義
interface BreadcrumbItem {
  name: string;
  path: string;
}

// 型定義
interface Post {
  id: number | string
  title: string
  content: string
  slug: string
  business_id?: number
  category_id?: number
  thumbnail_url?: string
  featured_image?: string
  meta_description?: string
  meta_keywords?: string[]
  canonical_url?: string
  status: string
  published_at: string
  created_at: string
  updated_at: string
  author_id?: number
  section_id?: number
  categories?: any[]
  excerpt?: string
  tags?: string[]
  seo_keywords?: string[]
}

interface PageProps {
  params: {
    slug: string
  }
}

async function getPost(slug: string): Promise<Post | null> {
  const supabase = createClient()
  
  console.log('検索するslug:', slug)
  
  // デコードされたslugで検索
  const decodedSlug = decodeURIComponent(slug)
  
  // まずpostsテーブルから検索
  const { data: newPost, error: newError } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', decodedSlug)
    .eq('status', 'published')
    .single()
  
  console.log('postsテーブル検索結果:', newPost, newError)
  
  if (newPost && !newError) {
    return newPost
  }
  
  // postsテーブルに見つからない場合は、chatgpt_postsテーブルから検索
  const { data: oldPost, error: oldError } = await supabase
    .from('chatgpt_posts')
    .select(`
      *,
      categories:category_id(name, slug)
    `)
    .eq('slug', decodedSlug)
    .eq('status', 'published')
    .single()
  
  if (oldPost && !oldError) {
    return oldPost
  }
  
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: '記事が見つかりません | 株式会社エヌアンドエス',
      description: 'お探しの記事が見つかりませんでした。'
    }
  }
  
  const title = post.title
  const description = post.meta_description || post.excerpt || `${post.content.substring(0, 160)}...`
  const keywords = post.meta_keywords || post.seo_keywords || []
  const imageUrl = post.thumbnail_url || post.featured_image || '/images/default-post.jpg'
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
  
  return {
    title: `${title} | 株式会社エヌアンドエス`,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: `${title} | 株式会社エヌアンドエス`,
      description,
      type: 'article',
      url: `https://nands.tech/posts/${params.slug}`,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      siteName: '株式会社エヌアンドエス',
      locale: 'ja_JP',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: ['株式会社エヌアンドエス'],
      tags: ['AI', 'ビジネス', 'テクノロジー', ...keywords].filter(Boolean)
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nands_tech',
      creator: '@nands_tech',
      title: `${title} | 株式会社エヌアンドエス`,
      description,
      images: [fullImageUrl]
    },
    alternates: {
      canonical: `https://nands.tech/posts/${params.slug}`
    }
  }
}

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  // 記事の構造化データを作成
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.meta_description || post.excerpt || `${post.content.substring(0, 160)}...`,
    "image": post.thumbnail_url || post.featured_image || "/images/default-post.jpg",
    "author": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "url": "https://nands.tech"
    },
    "publisher": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nands.tech/logo.png"
      }
    },
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://nands.tech/posts/${params.slug}`
    },
    "keywords": post.meta_keywords || post.seo_keywords || [],
    "articleSection": post.categories?.[0]?.name || "記事",
    "inLanguage": "ja"
  };
  
  // パンくずリストのアイテムを作成
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: '記事一覧', path: '/posts' }
  ];
  
  // カテゴリーがあれば追加
  if (post.categories && post.categories.length > 0) {
    breadcrumbItems.push({ 
      name: post.categories[0].name, 
      path: `/categories/${post.categories[0].slug}` 
    });
  }
  
  // 現在の記事を追加
  breadcrumbItems.push({ name: post.title, path: `/posts/${params.slug}` });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Script
        id="structured-data-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mt-16">
        <Breadcrumbs customItems={breadcrumbItems} />
      </div>
      
      <article className="max-w-4xl mx-auto">
        {/* カテゴリタグ */}
        {post.categories && post.categories.length > 0 && (
          <div className="mb-4">
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {post.categories[0].name}
            </span>
          </div>
        )}

        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">{post.title}</h1>
        
        {(post.thumbnail_url || post.featured_image) && (
          <div className="relative mb-8">
            <Image
              src={post.thumbnail_url || post.featured_image || ''}
              alt={post.title}
              width={800}
              height={400}
              className="rounded-lg shadow-md w-full"
              unoptimized={true}
              priority={true}
            />
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
              <RefreshCw size={12} />
              <span>
                {new Date(post.updated_at || post.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>
        )}

        {post.content && (
          <div className="mt-8">
            <MarkdownContent content={post.content} />
          </div>
        )}
        
        {/* 記事タグがあれば表示 */}
        {(post.meta_keywords || post.seo_keywords) && (post.meta_keywords || post.seo_keywords)!.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {(post.meta_keywords || post.seo_keywords)!.map((keyword: string, index: number) => (
              <Link 
                key={index} 
                href={`/search?keyword=${encodeURIComponent(keyword)}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
              >
                #{keyword}
              </Link>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
