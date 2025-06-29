import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
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

type Props = {
  params: {
    slug: string
  }
}

// 動的メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
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
      chatgpt_sections(name, slug)
    `)
    .eq('slug', decodeURIComponent(params.slug))
    .eq('is_chatgpt_special', true)
    .single()

  if (!post) {
    return {
      title: 'ChatGPT記事が見つかりません | 株式会社エヌアンドエス',
      description: 'お探しのChatGPT記事が見つかりませんでした。'
    }
  }

  const sectionName = post.chatgpt_sections && post.chatgpt_sections.length > 0 ? post.chatgpt_sections[0].name : 'ChatGPT特集';
  const imageUrl = post.thumbnail_url || post.featured_image || '/images/default-post.jpg';
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`;
  const keywords = post.seo_keywords || [];

  return {
    title: `${post.title} | ChatGPT特集 | 株式会社エヌアンドエス`,
    description: post.excerpt || `${sectionName}のChatGPT活用術とビジネス応用について詳しく解説します。`,
    keywords: ['ChatGPT', 'AI活用', 'ビジネス応用', 'DX推進', ...keywords].join(','),
    openGraph: {
      title: `${post.title} | ChatGPT特集`,
      description: post.excerpt || `${sectionName}のChatGPT活用術とビジネス応用について詳しく解説します。`,
      type: 'article',
      url: `https://nands.jp/special/chatgpt/${params.slug}`,
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
      tags: ['ChatGPT', 'AI活用', 'ビジネス応用', ...keywords, sectionName].filter(Boolean)
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nands_tech',
      creator: '@nands_tech',
      title: `${post.title} | ChatGPT特集`,
      description: post.excerpt || `${sectionName}のChatGPT活用術とビジネス応用について詳しく解説します。`,
      images: [fullImageUrl]
    },
    alternates: {
      canonical: `https://nands.jp/special/chatgpt/${params.slug}`
    }
  }
}

export default async function ChatGPTArticlePage({ params }: Props) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from('chatgpt_posts')
    .select(`
      *,
      section:chatgpt_sections(
        name,
        slug
      )
    `)
    .eq('slug', decodeURIComponent(params.slug))
    .eq('is_chatgpt_special', true)
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
    "image": post.thumbnail_url || post.featured_image || "/images/default-post.jpg",
    "author": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "url": "https://nands.jp"
    },
    "publisher": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nands.jp/logo.png"
      }
    },
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://nands.jp/special/chatgpt/${params.slug}`
    },
    "keywords": post.seo_keywords || [],
    "articleSection": post.section?.[0]?.name || "ChatGPT特集",
    "inLanguage": "ja",
    "about": {
      "@type": "Thing",
      "name": "ChatGPT",
      "description": "OpenAIが開発した対話型AI言語モデル"
    }
  };

  // パンくずリストのアイテムを作成
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'ChatGPT特集', path: '/special/chatgpt' }
  ];
  
  // セクション名があれば追加
  if (post.section && post.section.length > 0) {
    breadcrumbItems.push({ name: post.section[0].name, path: `/special/chatgpt/${post.section[0].slug}` });
  }
  
  // 現在の記事を追加
  breadcrumbItems.push({ name: post.title, path: `/special/chatgpt/${params.slug}` });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Script
        id="structured-data-chatgpt-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mt-16">
          <Breadcrumbs customItems={breadcrumbItems} />
        </div>
        
        <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* ChatGPT特集バッジ */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-semibold">🤖 ChatGPT特集</span>
              {post.section && post.section[0]?.name && (
                <>
                  <span className="text-white text-sm">•</span>
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {post.section[0].name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* メイン画像 */}
          {(post.thumbnail_url || post.featured_image) && (
            <div className="relative h-64 md:h-80">
              <Image
                src={post.thumbnail_url || post.featured_image || ''}
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
            
            {post.excerpt && (
              <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed">{post.excerpt}</p>
              </div>
            )}

            {/* 記事メタ情報 */}
            <div className="flex items-center space-x-4 mb-8 text-sm text-gray-600 border-b pb-4">
              <span>📅 {new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
              {post.updated_at && post.updated_at !== post.created_at && (
                <span>🔄 {new Date(post.updated_at).toLocaleDateString('ja-JP')} 更新</span>
              )}
            </div>

            {/* 記事内容 */}
            <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-800">
              <MarkdownContent content={post.content || ''} />
            </div>

            {/* 関連記事セクション */}
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-bold mb-4 text-gray-800">🔗 関連情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/special/chatgpt"
                  className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h3 className="font-semibold text-blue-800 mb-2">ChatGPT特集トップ</h3>
                  <p className="text-sm text-gray-600">ChatGPTの基本から応用まで</p>
                </Link>
                <Link
                  href="/ai-agents"
                  className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <h3 className="font-semibold text-purple-800 mb-2">AIエージェント開発</h3>
                  <p className="text-sm text-gray-600">ChatGPTを活用したAIエージェント</p>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
} 