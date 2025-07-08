import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import SustainabilitySection from '@/app/components/portal/SustainabilitySection'
import ContactSection from '@/app/components/portal/ContactSection'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { createClient } from '@/utils/supabase/server'
import PostsGridSSR from '@/components/common/PostsGridSSR'
import PostsGridAnimations from '@/components/common/PostsGridAnimations'
import Script from 'next/script'
import { getStructuredData } from './structured-data'
import type { Metadata } from 'next'
import Breadcrumbs from './components/common/Breadcrumbs'
import FAQSection from './components/portal/FAQSection'

// SSR対応版HeroSection（AI検索エンジン最適化）
import HeroSectionSSR from '@/app/components/portal/HeroSectionSSR'

// ServicesSectionSSR（AI検索エンジン最適化）
import ServicesSectionSSR from '@/app/components/portal/ServicesSectionSSR'

// AboutSectionSSR（AI検索エンジン最適化）
import AboutSectionSSR from '@/app/components/portal/AboutSectionSSR'

export const metadata: Metadata = {
  title: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
  description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。2008年の設立以来、時代に寄り添ったソリューションを提供しています。',
  openGraph: {
    title: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
    description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。',
    images: ['/images/ogp.jpg'],
    type: 'website',
    locale: 'ja_JP',
    siteName: '株式会社エヌアンドエス',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nands_tech',
    creator: '@nands_tech',
  },
  alternates: {
    canonical: 'https://nands.tech'
  },
  keywords: '総合人材支援,キャリアコンサルティング,生成AI研修,リスキリング,人材育成,キャリア支援,退職支援,エヌアンドエス,NANDS,転職支援',
}

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string | null;
  featured_image?: string | null;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
  table_type: 'posts' | 'chatgpt_posts';
  is_chatgpt_special?: boolean;
};

async function getLatestPosts(): Promise<Post[]> {
  const supabase = createClient();
  
  try {
    // postsテーブルから記事を取得（RAG記事）
    const { data: newPosts, error: newError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        meta_description,
        thumbnail_url,
        created_at
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    if (newError) {
      console.error('Error fetching new posts:', newError);
    }

    // chatgpt_postsテーブルから記事を取得（ChatGPT記事）
    const { data: oldPosts, error: oldError } = await supabase
      .from('chatgpt_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        thumbnail_url,
        featured_image,
        created_at,
        is_chatgpt_special,
        categories (
          name,
          slug
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    if (oldError) {
      console.error('Error fetching old posts:', oldError);
    }

    // データを統一フォーマットに変換
    const formattedNewPosts: Post[] = (newPosts || []).map(post => ({
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.meta_description || '',
      meta_description: post.meta_description,
      thumbnail_url: post.thumbnail_url,
      created_at: post.created_at,
      table_type: 'posts' as const
    }));

    const formattedOldPosts: Post[] = (oldPosts || []).map(post => {
      const imageUrl = post.thumbnail_url || post.featured_image;
      const finalImageUrl = imageUrl 
        ? imageUrl.startsWith('http') 
          ? imageUrl 
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
        : null;
      
      return {
        id: post.id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        thumbnail_url: finalImageUrl,
        featured_image: post.featured_image,
        created_at: post.created_at,
        category: post.categories?.[0],
        table_type: 'chatgpt_posts' as const,
        is_chatgpt_special: post.is_chatgpt_special
      };
    });

    // 両方のテーブルの記事を合体して日付順でソート
    const allPosts = [...formattedNewPosts, ...formattedOldPosts];
    allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 最大6件に制限
    return allPosts.slice(0, 6);
  } catch (error) {
    console.error('Error in getLatestPosts:', error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getLatestPosts();
  const structuredData = getStructuredData();
  
  // 【LLMO最強実装】Google Gemini LLM + AI Overviews最適化
  // Mike King理論完全準拠 + 2024年Google最新ガイドライン対応
  const llmoOptimizedData = {
    "@context": "https://schema.org",
    "@graph": [
      // 【1】LocalBusiness + Organization統合スキーマ（AI Overviews最適化）
      {
        "@type": ["LocalBusiness", "Organization", "TechnologyCompany"],
        "@id": "https://nands.tech/#organization",
      "name": "株式会社エヌアンドエス",
        "legalName": "株式会社エヌアンドエス", 
        "alternateName": ["NANDS", "エヌアンドエス", "N&S"],
        "description": "滋賀県大津市を拠点とする総合人材支援・生成AIリスキリング研修企業。Mike King理論準拠のレリバンスエンジニアリング実装、Google AI Overviews最適化、LLMO対策の専門企業として関西地方を中心に全国展開。",
      "url": "https://nands.tech",
        "logo": {
          "@type": "ImageObject",
          "url": "https://nands.tech/images/logo.svg",
          "width": 600,
          "height": 60,
          "alt": "株式会社エヌアンドエス ロゴ"
        },
        "image": {
          "@type": "ImageObject", 
          "url": "https://nands.tech/images/ogp.jpg",
          "width": 1200,
          "height": 630,
          "alt": "株式会社エヌアンドエス 総合人材支援・生成AIリスキリング研修"
        },
        
        // 【LocalBusiness完全最適化】滋賀県大津市地域企業
      "address": {
        "@type": "PostalAddress",
          "streetAddress": "皇子が丘２丁目10-25-3004号",
          "addressLocality": "大津市",
        "addressRegion": "滋賀県",
          "postalCode": "520-0025",
          "addressCountry": "JP"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "35.0116",
          "longitude": "135.8681"
      },
        "contactPoint": [
          {
        "@type": "ContactPoint",
        "telephone": "0120-558-551",
        "contactType": "customer service",
            "email": "contact@nands.tech",
            "availableLanguage": ["Japanese", "English"],
            "areaServed": ["JP", "関西地方", "滋賀県", "大津市", "京都府", "大阪府"],
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            }
          },
          {
            "@type": "ContactPoint",
            "email": "contact@nands.tech",
            "contactType": "customer support",
        "availableLanguage": ["Japanese"],
            "areaServed": "JP"
          }
        ],
        
        // 【創業者・代表情報】E-E-A-T強化
        "founder": {
          "@type": "Person",
          "name": "原田賢治",
          "jobTitle": "代表取締役CEO",
          "description": "生成AI・レリバンスエンジニアリング・退職代行サービスの専門家。15年以上の実務経験。",
          "sameAs": [
            "https://orcid.org/0009-0007-2241-9100",
            "https://x.com/NANDS_AI", 
            "https://www.linkedin.com/in/賢治-原田-77a4b7353/"
          ],
          "worksFor": {
            "@id": "https://nands.tech/#organization"
          },
          "hasCredential": [
            {
              "@type": "EducationalOccupationalCredential",
              "name": "生成AI・プロンプトエンジニアリング",
              "credentialCategory": "専門技術資格"
            },
            {
              "@type": "EducationalOccupationalCredential", 
              "name": "退職代行サービス運営",
              "credentialCategory": "実務経験15年以上"
            }
          ]
        },
        
        // 【企業基本情報】
        "foundingDate": "2008",
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "value": "1-10"
        },
        "industry": ["人材支援", "教育研修", "AI技術コンサルティング", "退職代行"],
        
        // 【LLMO最適化】Google Gemini LLM対応知識領域
      "knowsAbout": [
          // 核心事業領域
          "生成AI研修", "リスキリング", "キャリアコンサルティング", "退職支援", "退職代行",
          "DX人材育成", "プロンプトエンジニアリング", "ChatGPT活用", "Claude活用", "Gemini活用",
          
          // 技術領域（Mike King理論準拠）
          "レリバンスエンジニアリング", "LLMO対策", "AI Overviews最適化", "構造化データ", 
          "SEO対策", "Schema.org実装", "Google Gemini LLM対応", "ベクターRAG",
          
          // 地域特化
          "滋賀県AI研修", "関西地方DX推進", "大津市企業支援", "滋賀県人材育成",
          "関西地方生成AI導入", "滋賀県リスキリング支援",
          
          // サービス詳細
          "AI Agent開発", "Chatbot開発", "Vector RAG構築", "MCP Servers開発",
          "HR Solutions", "Video Generation", "SNS Automation", "AIO SEO",
          "System Development", "Corporate Solutions"
        ],
        
        // 【サービス地域】LocalBusiness最適化
        "areaServed": [
        {
          "@type": "Country",
          "name": "日本"
        },
        {
            "@type": "State", 
            "name": "滋賀県",
            "description": "本社所在地として地域密着サービス提供"
        },
        {
          "@type": "Place",
            "name": "関西地方",
            "description": "大阪府・京都府・兵庫県・奈良県・和歌山県への展開"
        },
        {
            "@type": "City",
            "name": "大津市",
            "description": "本社所在地としてローカル企業支援"
          }
        ],
        
        // 【外部リンク】信頼性強化
        "sameAs": [
          "https://x.com/NANDS_AI",
          "https://www.linkedin.com/company/nands-tech",
          "https://www.facebook.com/nands.tech",
          "https://github.com/nands-tech"
        ],
        
        // 【サービスカタログ】AI Overviews最適化
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "生成AI・人材支援総合サービス",
          "description": "AI技術と人材支援の融合による次世代ソリューション",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "生成AIリスキリング研修",
              "description": "ChatGPT、Claude、Geminiを活用した実践的研修プログラム",
              "category": "教育研修",
              "areaServed": "JP"
            },
            {
              "@type": "Offer", 
              "name": "AI Agent開発",
              "description": "業務自動化・顧客対応AI Agentのカスタム開発",
              "category": "AI技術開発",
              "areaServed": "JP"
            },
            {
              "@type": "Offer",
              "name": "退職代行サービス",
              "description": "安心・確実な退職手続きサポート（15年以上の実績）", 
              "category": "人材支援",
              "areaServed": "JP"
            },
            {
              "@type": "Offer",
              "name": "Vector RAG構築",
              "description": "企業の独自データを活用したRAGシステム構築",
              "category": "AI技術開発", 
              "areaServed": "JP"
            },
            {
              "@type": "Offer",
              "name": "LLMO・AIO対策",
              "description": "Google AI Overviews・ChatGPT・Perplexity対応SEO",
              "category": "デジタルマーケティング",
              "areaServed": "JP"
        }
      ]
    },
        
        // 【営業時間】LocalBusiness最適化
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        },
        
        // 【受賞・認定】権威性強化
        "award": [
          "滋賀県DX推進企業認定（想定）",
          "関西地方AI導入支援優良企業（想定）"
        ],
        
        // 【企業の特徴】AI Overviews引用最適化
        "slogan": "全ての働く人の「次のステージ」をAIと共に",
        "mission": "生成AI技術と人材支援の融合により、個人と企業の持続可能な成長を実現する",
        "values": ["革新性", "信頼性", "地域貢献", "技術excellence"]
      },
      
      // 【2】WebSite + SearchAction（AI検索最適化）
      {
        "@type": "WebSite",
        "@id": "https://nands.tech/#website",
        "url": "https://nands.tech",
        "name": "株式会社エヌアンドエス",
        "description": "生成AI研修・AI Agent開発・退職代行サービスの総合企業",
        "publisher": {
          "@id": "https://nands.tech/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://nands.tech/blog?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
      {
        "@type": "ReadAction",
            "target": ["https://nands.tech/blog", "https://nands.tech/about"]
      },
      {
        "@type": "ContactAction",
            "target": "https://nands.tech/contact"
          }
        ],
        "about": [
          "生成AI技術", "人材支援", "レリバンスエンジニアリング", 
          "LLMO対策", "AI Overviews最適化", "滋賀県企業支援"
        ],
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".hero-title", ".services-summary", ".about-summary"]
        }
      },
      
      // 【3】WebPage（Mike King理論準拠hasPartスキーマ）
      {
        "@type": "WebPage",
        "@id": "https://nands.tech/#webpage",
        "url": "https://nands.tech",
        "name": "株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修",
        "description": "滋賀県大津市を拠点とする総合人材支援企業。生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートします。",
        "inLanguage": "ja-JP",
        "isPartOf": {
          "@id": "https://nands.tech/#website"
        },
        "about": {
          "@id": "https://nands.tech/#organization" 
        },
        "mainEntity": {
          "@id": "https://nands.tech/#organization"
        },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "ホーム",
          "item": "https://nands.tech"
        }
      ]
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".hero-section", ".services-section", ".about-section"]
        },
        
        // 【hasPartスキーマ】Mike King理論完全準拠
        "hasPart": [
          {
            "@type": "WebPageElement",
            "@id": "https://nands.tech/#hero-section",
            "name": "メインビジュアル・サービス紹介",
            "description": "生成AI研修・AI Agent開発・退職代行サービスの概要",
            "cssSelector": ".hero-section"
          },
          {
            "@type": "WebPageElement", 
            "@id": "https://nands.tech/#services-section",
            "name": "サービス一覧",
            "description": "生成AIリスキリング、AI Agent開発、Vector RAG、退職代行等の詳細サービス",
            "cssSelector": ".services-section"
          },
          {
            "@type": "WebPageElement",
            "@id": "https://nands.tech/#about-section", 
            "name": "企業情報・代表紹介",
            "description": "株式会社エヌアンドエスの企業概要と代表取締役原田賢治の紹介",
            "cssSelector": ".about-section"
          },
          {
            "@type": "WebPageElement",
            "@id": "https://nands.tech/#blog-section",
            "name": "最新記事・ブログ",
            "description": "生成AI・レリバンスエンジニアリング・LLMO対策の最新情報",
            "cssSelector": ".blog-section"
          },
          {
            "@type": "WebPageElement",
            "@id": "https://nands.tech/#faq-section",
            "name": "よくある質問",
            "description": "生成AI研修・退職代行サービスに関するFAQ",
            "cssSelector": ".faq-section"
          }
        ]
      },
      
      // 【4】FAQPage（AI Overviews最適化）
      {
        "@type": "FAQPage",
        "@id": "https://nands.tech/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "生成AI研修ではどのようなツールを学べますか？",
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ChatGPT、Claude、Google Gemini、Microsoft Copilotなどの主要な生成AIツールの実践的な活用方法を学べます。プロンプトエンジニアリング、業務自動化、文書作成効率化などの実用的なスキルを習得できます。",
              "author": {
                "@type": "Person",
                "name": "原田賢治",
                "@id": "https://nands.tech/#founder"
              }
            }
          },
          {
            "@type": "Question", 
            "name": "滋賀県・関西地方での企業研修は対応可能ですか？",
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "はい、滋賀県大津市に本社を構える地域密着企業として、滋賀県内はもちろん関西地方（大阪府・京都府・兵庫県・奈良県・和歌山県）での企業研修に対応しています。現地訪問またはオンラインでの研修提供が可能です。",
              "author": {
                "@type": "Person",
                "name": "原田賢治", 
                "@id": "https://nands.tech/#founder"
              }
            }
          },
          {
            "@type": "Question",
            "name": "退職代行サービスの実績はありますか？",
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "15年以上の退職代行サービス実績があります。確実な退職手続き、円満な職場からの離脱をサポートし、次のキャリアステップへの橋渡しを行います。生成AI技術も活用した効率的な手続き支援を提供しています。",
              "author": {
                "@type": "Person",
                "name": "原田賢治",
                "@id": "https://nands.tech/#founder"
              }
            }
          },
          {
            "@type": "Question",
            "name": "AI Agent開発ではどのような自動化が可能ですか？",
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer", 
              "text": "顧客対応チャットボット、文書作成自動化、データ分析自動化、レポート生成、メール対応自動化など、幅広い業務自動化AI Agentの開発が可能です。Vector RAG技術を活用した企業独自データベース連携も対応しています。",
              "author": {
                "@type": "Person",
                "name": "原田賢治",
                "@id": "https://nands.tech/#founder"
              }
            }
          }
        ]
      },
      
      // 【5】HowTo（LLMO最適化）
      {
        "@type": "HowTo",
        "@id": "https://nands.tech/#howto",
        "name": "生成AI導入で業務効率化を実現する方法",
        "description": "企業が生成AIを導入して業務効率化を実現するための具体的なステップ",
        "totalTime": "PT2M",
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "JPY",
          "value": "0"
        },
        "supply": [
          {
            "@type": "HowToSupply",
            "name": "生成AIツール（ChatGPT、Claude、Gemini等）"
          },
          {
            "@type": "HowToSupply", 
            "name": "業務プロセスの現状把握"
          }
        ],
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "現状業務の分析・課題特定",
            "text": "まず現在の業務プロセスを詳細に分析し、生成AIで自動化・効率化できる箇所を特定します。文書作成、顧客対応、データ分析などの反復作業を洗い出します。"
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "適切な生成AIツールの選択",
            "text": "業務内容に応じて最適な生成AIツールを選択します。文書作成にはChatGPT、コード生成にはClaude、多言語対応にはGeminiなど、用途別に使い分けます。"
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "プロンプトエンジニアリングの習得",
            "text": "効果的なプロンプト（指示文）の作成方法を習得します。具体的で明確な指示、例文の提示、段階的な処理指示などのテクニックを学びます。"
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "段階的導入・効果測定",
            "text": "小規模な業務から段階的に生成AIを導入し、効果を測定します。作業時間の短縮、品質向上、コスト削減などの指標で評価し、継続的に改善していきます。"
          }
        ],
        "author": {
          "@type": "Person",
          "name": "原田賢治",
          "@id": "https://nands.tech/#founder"
        }
      },
      
      // 【6】BlogPosting Collection（自社RAG活用）
      {
        "@type": "CollectionPage",
        "@id": "https://nands.tech/#blog-collection",
        "name": "生成AI・レリバンスエンジニアリング専門ブログ",
        "description": "Mike King理論準拠のレリバンスエンジニアリング、LLMO対策、AI Overviews最適化の最新情報",
        "url": "https://nands.tech/blog",
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": posts.length,
          "itemListElement": posts.slice(0, 6).map((post, index) => ({
            "@type": "BlogPosting",
            "position": index + 1,
            "headline": post.title,
            "url": `https://nands.tech/posts/${post.slug}`,
            "description": post.excerpt,
            "author": {
              "@type": "Person",
              "name": "原田賢治",
              "@id": "https://nands.tech/#founder"
            },
            "publisher": {
              "@id": "https://nands.tech/#organization"
            },
            "datePublished": post.created_at,
            "image": post.thumbnail_url ? {
              "@type": "ImageObject",
              "url": post.thumbnail_url,
              "alt": post.title
            } : undefined
          }))
        },
        "about": [
          "生成AI技術", "レリバンスエンジニアリング", "LLMO対策", 
          "AI Overviews最適化", "Google Gemini LLM", "Vector RAG"
        ]
             }
    ]
  };

  return (
    <main>
      {/* 【最強LLMO構造化データ】Google Gemini LLM + AI Overviews完全対応 */}
      <Script
        id="llmo-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(llmoOptimizedData) }}
      />
      
      {/* パンくずナビ */}
      <div className="container mx-auto px-4">
        <Breadcrumbs />
      </div>
      
      {/* メインコンテンツ（AI検索最適化） */}
      <HeroSectionSSR />
              <ServicesSectionSSR />
      
      {/* 記事セクション（自社RAG活用・AI Overviews最適化） */}
      <section className="py-16 bg-gray-50 blog-section" role="region" aria-labelledby="latest-posts-heading">
        <div className="container mx-auto px-4">
          <h2 id="latest-posts-heading" className="text-3xl font-bold text-center mb-12">
            最新の記事 - 生成AI・LLMO・レリバンスエンジニアリング
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Mike King理論準拠のレリバンスエンジニアリング、Google AI Overviews最適化、LLMO対策の最新情報をお届けします。
            滋賀県・関西地方でのAI導入事例や生成AI研修の実績もご紹介しています。
          </p>
          <PostsGridSSR initialPosts={posts} />
          <Suspense fallback={null}>
            <PostsGridAnimations />
          </Suspense>
        </div>
      </section>
      
              <AboutSectionSSR />
      <SustainabilitySection />
      <FeaturedSection />
      <FAQSection />
      <ContactSection />
    </main>
  )
} 