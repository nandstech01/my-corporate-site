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
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <RefreshCw size={12} />
            <span>最終更新: {new Date(post.updated_at || post.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
          <div>読了時間: 約{Math.ceil(post.content.replace(/\s+/g, '').length / 400)}分</div>
          <div>文字数: {post.content.replace(/\s+/g, '').length.toLocaleString()}文字</div>
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

        {/* FAQ表示（自動抽出） */}
        {faqData.length > 0 && (
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
        )}

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
              <div className="flex gap-2">
                <a href="https://x.com/NANDS_AI" className="text-indigo-600 hover:text-indigo-800 text-sm">
                  X (Twitter)
                </a>
                <a href="https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353/" className="text-indigo-600 hover:text-indigo-800 text-sm">
                  LinkedIn
                </a>
                <a href="/about" className="text-indigo-600 hover:text-indigo-800 text-sm">
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
