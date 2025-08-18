import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import MarkdownContent from '@/components/blog/MarkdownContent'
import Script from 'next/script'
import Breadcrumbs from '@/app/components/common/Breadcrumbs'
import { RefreshCw } from 'lucide-react'
import { UnifiedStructuredDataSystem } from '@/lib/structured-data'
import { AutoTOCSystem } from '@/lib/structured-data/auto-toc-system'
import { HowToFAQSchemaSystem } from '@/lib/structured-data/howto-faq-schema'

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
  
  // URLデコードを安全に実行
  let decodedSlug: string;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (error) {
    console.error('URL decode error:', error);
    decodedSlug = slug; // デコードに失敗した場合は元のslugを使用
  }
  
  console.log('デコード後のslug:', decodedSlug);
  console.log('元のslugの長さ:', slug.length);
  console.log('デコード後slugの長さ:', decodedSlug.length);
  
  // 長いslugの場合は部分検索も試行（URL エンコード前後両方チェック）
  const isLongSlug = decodedSlug.length > 50 || slug.length > 100;
  console.log('長いslug判定:', isLongSlug);
  
  // 長いslugの場合は直接フォールバック検索を実行
  if (isLongSlug) {
    console.log('⚠️ 長いslugを検出、直接フォールバック検索を実行');
    return await performFallbackSearch(supabase, decodedSlug);
  }

  try {
    // 通常の長さのslugの場合のみ直接検索を実行
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
    const { data: oldPosts, error: oldError } = await supabase
      .from('chatgpt_posts')
      .select(`
        *,
        categories:category_id(name, slug)
      `)
      .eq('slug', decodedSlug)
      .eq('status', 'published');
    
    if (oldError) {
      console.error('chatgpt_posts検索エラー:', oldError);
      return null;
    }
    
    if (oldPosts && oldPosts.length > 0) {
      return oldPosts[0];
    }
    
  } catch (queryError) {
    console.error('Database query error:', queryError);
    return await performFallbackSearch(supabase, decodedSlug);
  }
  
  return null;
}

// フォールバック検索関数
async function performFallbackSearch(supabase: any, decodedSlug: string): Promise<Post | null> {
  try {
    console.log('🔄 フォールバック: 全記事検索を実行');
    const { data: allPosts, error: allError } = await supabase
      .from('chatgpt_posts')
      .select(`
        *,
        categories:category_id(name, slug)
      `)
      .eq('status', 'published');
    
    if (allError) {
      console.error('全記事取得エラー:', allError);
      return null;
    }
    
    // JavaScriptで完全一致検索
    const matchedPost = allPosts?.find((post: any) => post.slug === decodedSlug);
    if (matchedPost) {
      console.log('✅ フォールバック検索で記事を発見');
      return matchedPost;
    }
      
  } catch (fallbackError) {
    console.error('フォールバック検索エラー:', fallbackError);
  }
  
  return null;
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

// 🚀 SSG（Static Site Generation）設定
// 全記事のslugを事前生成し、ビルド時に静的HTMLを作成
export async function generateStaticParams() {
  const supabase = createClient()
  
  try {
    // postsテーブルから公開済み記事のslugを取得
    const { data: newPosts } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    // chatgpt_postsテーブルから公開済み記事のslugを取得
    const { data: oldPosts } = await supabase
      .from('chatgpt_posts')
      .select('slug')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    // 全slugを結合（重複除去）
    const allSlugs = [
      ...(newPosts || []).map(post => ({ slug: post.slug })),
      ...(oldPosts || []).map(post => ({ slug: post.slug }))
    ]
    
    // 重複するslugを除去
    const uniqueSlugs = allSlugs.filter((item, index, self) => 
      index === self.findIndex(t => t.slug === item.slug)
    )
    
    console.log(`🔄 SSG: ${uniqueSlugs.length}件の記事をビルド時に静的生成`)
    return uniqueSlugs
    
  } catch (error) {
    console.error('SSG generateStaticParams error:', error)
    return []
  }
}

// 🔄 ISR（Incremental Static Regeneration）設定
// 5分間隔でキャッシュ更新し、新記事や更新も自動反映
export const revalidate = 300

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  // Mike King理論準拠: 統合構造化データシステム初期化
  const structuredDataSystem = new UnifiedStructuredDataSystem('https://nands.tech')
  const autoTOCSystem = new AutoTOCSystem()
  const howToFAQSystem = new HowToFAQSchemaSystem()

  // 記事内容からTOC抽出（見出し分析）
  const tocData = autoTOCSystem.generateTOCFromHTML(post.content)
  const hasFragmentIds = tocData.toc.length > 0

  // 記事内容からFAQ・HOW TO自動抽出
  const faqData = howToFAQSystem.extractFAQFromContent(post.content)
  const howToData = howToFAQSystem.extractHowToFromContent(post.content, post.title)

  // パンくずリスト構造化データ
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: '記事一覧', path: '/posts' }
  ];
  
  if (post.categories && post.categories.length > 0) {
    breadcrumbItems.push({ 
      name: post.categories[0].name, 
      path: `/categories/${post.categories[0].slug}` 
    });
  }
  
  breadcrumbItems.push({ name: post.title, path: `/posts/${params.slug}` });

  // BreadcrumbList構造化データ
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://nands.tech${item.path}`
    }))
  }

  // 著者情報（Google E-E-A-T準拠・ORCID対応）
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://nands.tech/author/harada-kenji",
    "name": "原田賢治",
    "givenName": "賢治",
    "familyName": "原田",
    "jobTitle": "代表取締役・AI技術責任者",
    "description": "Mike King理論に基づくレリバンスエンジニアリング専門家。生成AI検索最適化、ChatGPT・Perplexity対応のGEO実装、企業向けAI研修を手がける。15年以上のAI・システム開発経験を持つ。",
    "knowsAbout": [
      "Relevance Engineering",
      "Mike King Theory",
      "AI Search Optimization", 
      "ChatGPT Optimization",
      "Perplexity Optimization",
      "GEO (Generative Engine Optimization)",
      "Vector RAG Systems",
      "AI Agent Development",
      "企業AI研修",
      "生成AI活用コンサルティング",
      "退職代行サービス",
      "AI技術コンサルティング"
    ],
    "affiliation": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization",
      "name": "株式会社エヌアンドエス"
    },
    "worksFor": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization",
      "name": "株式会社エヌアンドエス"
    },
    "url": "https://nands.tech/about",
    "image": "https://nands.tech/images/author/harada-kenji.jpg",
    "sameAs": [
      "https://orcid.org/0009-0007-2241-9100",
      "https://x.com/NANDS_AI",
      "https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353/"
    ],
    "expertise": "AI Search Optimization, Relevance Engineering, Generative AI Business Integration, 退職代行サービス",
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "name": "AI・システム開発15年以上の実務経験"
      }
    ],
    "nationality": {
      "@type": "Country",
      "name": "日本"
    },
    "knowsLanguage": ["ja", "en"]
  }

  // Mike King理論準拠: BlogPosting + hasPart + AIO LLMO最適化（Google 2024年ガイドライン対応）
  const enhancedStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `https://nands.tech/posts/${params.slug}#article`,
    "headline": post.title,
    "alternativeHeadline": post.meta_description || `${post.content.substring(0, 100)}...`,
    "description": post.meta_description || post.excerpt || `${post.content.substring(0, 160)}...`,
    "abstract": post.meta_description || post.excerpt || `${post.content.substring(0, 200)}...`,
    "image": {
      "@type": "ImageObject",
      "url": post.thumbnail_url || post.featured_image || "https://nands.tech/images/default-post.jpg",
      "width": 1200,
      "height": 630,
      "caption": post.title,
      "alt": post.title
    },
    
    // 著者情報強化（E-E-A-T対策）
    "author": authorSchema,
    "publisher": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization",
      "name": "株式会社エヌアンドエス",
      "legalName": "株式会社エヌアンドエス",
      "url": "https://nands.tech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nands.tech/logo.png",
        "width": 600,
        "height": 60
      },
      "foundingDate": "2008",
      "description": "Mike King理論準拠のレリバンスエンジニアリング実装企業。AI技術コンサルティング、退職代行サービス、生成AI最適化を提供。",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "皇子が丘２丁目10-25-3004号",
        "addressLocality": "大津市",
        "addressRegion": "滋賀県",
        "postalCode": "520-0025",
        "addressCountry": "JP"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@nands.tech",
        "contactType": "customer service",
        "availableLanguage": ["Japanese", "English"]
      },
      "areaServed": {
        "@type": "Country",
        "name": "日本"
      },
      "serviceArea": {
        "@type": "Country",
        "name": "日本"
      }
    },
    
    // 日時情報
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "dateCreated": post.created_at,
    
    // ページ情報
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://nands.tech/posts/${params.slug}`,
      "url": `https://nands.tech/posts/${params.slug}`,
      "name": post.title,
      "description": post.meta_description || post.excerpt,
      "inLanguage": "ja-JP",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://nands.tech/#website",
        "name": "株式会社エヌアンドエス"
      }
    },

    // SEO & トピカルカバレッジ
    "keywords": post.meta_keywords || post.seo_keywords || [],
    "about": [
      {
        "@type": "Thing",
        "name": post.categories?.[0]?.name || "AI・ビジネス・テクノロジー"
      }
    ],
    "mentions": [
      {
        "@type": "Organization",
        "name": "OpenAI",
        "sameAs": "https://openai.com"
      },
      {
        "@type": "Organization", 
        "name": "ChatGPT",
        "sameAs": "https://chat.openai.com"
      }
    ],

    // 言語・地域情報
    "inLanguage": "ja-JP",
    "contentLocation": {
      "@type": "Place",
      "name": "日本"
    },
    "spatialCoverage": {
      "@type": "Place", 
      "name": "日本"
    },

    // カテゴリ・セクション
    "articleSection": post.categories?.[0]?.name || "記事",
    "genre": "Business Technology",
    "audience": {
      "@type": "Audience",
      "audienceType": "Business Professional",
      "geographicArea": {
        "@type": "Place",
        "name": "日本"
      }
    },

    // Word Count & Reading Time
    "wordCount": post.content.split(/\s+/).length,
    "timeRequired": `PT${Math.ceil(post.content.split(/\s+/).length / 200)}M`,

    // Mike King理論: hasPartスキーマ（GEO最適化）
    ...(hasFragmentIds && {
      "hasPart": tocData.toc.map((item: any, index: number) => ({
        "@type": "WebPageElement",
        "@id": `https://nands.tech/posts/${params.slug}#${item.anchor || item.id}`,
        "name": item.title,
        "description": `${post.title}の第${index + 1}セクション: ${item.title}`,
        "url": `https://nands.tech/posts/${params.slug}#${item.anchor || item.id}`,
        "position": index + 1,
        "mainContentOfPage": false,
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [`#${item.anchor || item.id}`]
        }
      }))
    }),

    // AIO LLMO: FAQ構造化データ（自動抽出）
    ...(faqData.length > 0 && {
      "mainEntity": faqData.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
          "author": {
            "@type": "Person",
            "name": "原田賢治"
          }
        }
      }))
    }),

    // Google音声検索最適化
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "h2", ".faq-section"]
    },

    // Googleニュース最適化
    "isAccessibleForFree": true,
    "isPartOf": {
      "@type": "WebSite",
      "@id": "https://nands.tech/#website"
    }
  }

  // HOW TO構造化データ（別スキーマ）
  const howToSchema = howToData.steps.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `https://nands.tech/posts/${params.slug}#howto`,
    "name": `${post.title} - 実装ガイド`,
    "description": `${post.title}の具体的な実装手順をステップバイステップで解説`,
    "image": post.thumbnail_url || post.featured_image || "https://nands.tech/images/default-post.jpg",
    "totalTime": `PT${howToData.steps.length * 5}M`,
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "JPY", 
      "value": "0"
    },
    "step": howToData.steps.map((step: any, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
      "url": `https://nands.tech/posts/${params.slug}#step-${index + 1}`
    }))
  } : null
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mike King理論準拠: 統合構造化データ */}
      <Script
        id="structured-data-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(enhancedStructuredData) }}
      />
      
      <Script
        id="structured-data-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Script
        id="structured-data-author"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      {howToSchema && (
        <Script
          id="structured-data-howto"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}

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
        
        {/* 記事メタ情報 */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <RefreshCw size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">最終更新: </span>
            <span className="sm:hidden">更新: </span>
            <span className="hidden sm:inline">{new Date(post.updated_at || post.created_at).toLocaleDateString('ja-JP')}</span>
            <span className="sm:hidden">{new Date(post.updated_at || post.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
          </div>
          <div>
            <span className="hidden sm:inline">読了時間: 約</span>
            <span className="sm:hidden">読了: 約</span>
            {Math.ceil(post.content.replace(/\s+/g, '').length / 400)}分
          </div>
          <div>
            <span className="hidden sm:inline">文字数: </span>
            <span className="sm:hidden">字数: </span>
            {post.content.replace(/\s+/g, '').length.toLocaleString()}文字
          </div>
        </div>
        
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
            </div>
        )}

        {/* TOC表示（Fragment ID付き） */}
        {tocData.toc.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">目次</h2>
            <ul className="space-y-2">
              {tocData.toc.map((item: any, index: number) => (
                <li key={index} style={{ marginLeft: `${(item.level - 1) * 1.5}rem` }}>
                  <a 
                    href={`#${item.anchor || item.id}`}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {post.content && (
          <div className="mt-8">
            <MarkdownContent content={post.content} />
          </div>
        )}

        {/* FAQ表示（自動抽出） - 重複防止のため無効化（記事本文内FAQを使用） */}
        {/* {faqData.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 faq-section">
            <h2 className="text-xl font-bold mb-6 text-blue-900">よくある質問</h2>
            <div className="space-y-6">
              {faqData.map((faq: any, index: number) => (
                <div key={index} className="border-b border-blue-200 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-blue-800 mb-2">Q. {faq.question}</h3>
                  <p className="text-blue-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* HOW TO表示（自動抽出） - 非表示に変更 */}
        {/* {howToData.steps.length > 0 && (
          <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-green-900">実装ガイド</h2>
            <div className="space-y-4">
              {howToData.steps.map((step: any, index: number) => (
                <div key={index} className="flex gap-4" id={`step-${index + 1}`}>
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">{step.title}</h3>
                    <p className="text-green-700">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* 著者セクション */}
        <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">著者について</h2>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <Image
                src="/images/author/harada-kenji.jpg"
                alt="原田賢治"
                width={80}
                height={80}
                className="rounded-full border-2 border-gray-300"
                unoptimized={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">原田賢治</h3>
              <p className="text-sm text-gray-600 mb-3">代表取締役・AI技術責任者</p>
              <p className="text-gray-700 mb-4">
                Mike King理論に基づくレリバンスエンジニアリング専門家。生成AI検索最適化、ChatGPT・Perplexity対応のGEO実装、企業向けAI研修を手がける。
                15年以上のAI・システム開発経験を持ち、全国で企業のDX・AI活用、退職代行サービスを支援。
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <a 
                  href="https://x.com/NANDS_AI" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </a>
                <a 
                  href="https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a 
                  href="/about" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  詳細プロフィール
                </a>
              </div>
            </div>
          </div>
        </div>
        
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
