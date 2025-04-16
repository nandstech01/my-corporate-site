import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
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

type Props = {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: post } = await supabase
    .from('chatgpt_posts')
    .select(`
      title, 
      excerpt, 
      thumbnail_url, 
      featured_image,
      seo_keywords,
      created_at,
      updated_at,
      categories(name, slug)
    `)
    .eq('slug', decodeURIComponent(params.slug))
    .single()

  if (!post) {
    return {
      title: 'Not Found',
      description: 'ページが見つかりませんでした。'
    }
  }

  const categoryName = post.categories && post.categories.length > 0 ? post.categories[0].name : '';
  const imageUrl = post.thumbnail_url || post.featured_image || '/images/default-ogp.jpg';
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`;
  const keywords = post.seo_keywords || [];

  return {
    title: `${post.title} | 株式会社エヌアンドエス`,
    description: post.excerpt || undefined,
    keywords: keywords.join(','),
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      url: `https://nands.tech/posts/${params.slug}`,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ],
      siteName: '株式会社エヌアンドエス',
      locale: 'ja_JP',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: ['株式会社エヌアンドエス'],
      tags: [...keywords, categoryName].filter(Boolean)
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nands_tech',
      creator: '@nands_tech',
      title: post.title,
      description: post.excerpt || '',
      images: [fullImageUrl]
    },
    alternates: {
      canonical: `https://nands.tech/posts/${params.slug}`
    }
  }
}

export default async function PostPage({ params }: Props) {
  const { data: post } = await supabase
    .from('chatgpt_posts')
    .select(`
      *,
      category:categories(
        name,
        slug
      )
    `)
    .eq('slug', decodeURIComponent(params.slug))
    .single()

  if (!post) {
    notFound()
  }

  // 記事の構造化データを作成
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || "",
    "image": post.thumbnail_url || post.featured_image || "",
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
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://nands.tech/posts/${params.slug}`
    },
    "keywords": post.seo_keywords || [],
    "articleSection": post.category?.[0]?.name || "",
    "inLanguage": "ja"
  };

  // パンくずリストのアイテムを作成
  const breadcrumbItems: BreadcrumbItem[] = [
    // { name: 'ホーム', path: '/' }, // Remove the initial Home item here
    { name: '記事一覧', path: '/posts' }
  ];
  
  // カテゴリ名があれば追加
  if (post.category && post.category.length > 0) {
    breadcrumbItems.push({ name: post.category[0].name, path: `/categories/${post.category[0].slug}` });
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
        {/* Move Category Tag section before the Back link */}
        {/* Check if category exists and has a name before accessing */}
        {post.category && post.category[0]?.name && (
          <div className="mb-4"> {/* Adjusted margin-bottom slightly */}
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {post.category[0].name}
            </span>
          </div>
        )}

        {/* Back link section */}
        {/* 
        <div className="mb-4"> 
          <Link
            href="/posts"
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            記事一覧に戻る
          </Link>
        </div> 
        */}
        
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
        {post.seo_keywords && post.seo_keywords.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.seo_keywords.map((keyword: string, index: number) => (
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