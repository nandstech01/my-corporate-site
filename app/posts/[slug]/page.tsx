import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import MarkdownContent from '@/components/blog/MarkdownContent'
import Script from 'next/script'
import Breadcrumbs from '@/app/components/common/Breadcrumbs'

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
  const imageUrl = post.thumbnail_url || '/images/default-post.jpg'
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
    "image": post.thumbnail_url || "/images/default-post.jpg",
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
    "inLanguage": "ja",
    "about": {
      "@type": "Thing",
      "name": "AI・テクノロジー",
      "description": "最新のAI技術とビジネス活用"
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Script
        id="structured-data-post"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mt-16">
          <Breadcrumbs customItems={breadcrumbItems} />
        </div>
        
        <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 記事種別バッジ */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-semibold">
                {post.business_id ? '🤖 RAG記事' : '🧠 ChatGPT記事'}
              </span>
              {post.categories && post.categories.length > 0 && (
                <>
                  <span className="text-white text-sm">•</span>
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {post.categories[0].name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* メイン画像 */}
          {post.thumbnail_url && (
            <div className="relative h-64 md:h-80">
              <Image
                src={post.thumbnail_url}
                alt={post.title}
                fill
                className="object-cover"
                unoptimized={true}
                priority={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* 記事コンテンツ */}
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 leading-tight">
              {post.title}
            </h1>
            
            {(post.meta_description || post.excerpt) && (
              <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed">{post.meta_description || post.excerpt}</p>
              </div>
            )}

            {/* 記事メタ情報 */}
            <div className="flex items-center space-x-4 mb-8 text-sm text-gray-600 border-b pb-4">
              <span>📅 {new Date(post.published_at).toLocaleDateString('ja-JP')}</span>
              {post.updated_at && post.updated_at !== post.published_at && (
                <span>🔄 {new Date(post.updated_at).toLocaleDateString('ja-JP')} 更新</span>
              )}
            </div>

            {/* 記事内容 */}
            <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-800">
              <MarkdownContent content={post.content || ''} />
            </div>

            {/* 関連情報セクション */}
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-bold mb-4 text-gray-800">🔗 関連情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/posts"
                  className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h3 className="font-semibold text-blue-800 mb-2">記事一覧</h3>
                  <p className="text-sm text-gray-600">最新の記事をチェック</p>
                </Link>
                <Link
                  href="/admin/content-generation"
                  className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <h3 className="font-semibold text-purple-800 mb-2">コンテンツ生成</h3>
                  <p className="text-sm text-gray-600">AIを活用した記事作成</p>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
} 