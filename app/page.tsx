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
        table_type: 'chatgpt_posts' as const
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
  
  // ホームページ用に追加の構造化データを設定（滋賀県詳細・レリバンスエンジニアリング強化）
  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修",
    "description": "滋賀県大津市を拠点とする総合人材支援企業。生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートします。",
    "url": "https://nands.tech",
    "isPartOf": structuredData,
    "mainEntity": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "alternateName": "NANDS",
      "url": "https://nands.tech",
      "logo": "https://nands.tech/images/logo.png",
      "description": "滋賀県大津市皇子が丘に本社を構える総合人材支援・生成AIリスキリング研修企業",
      "foundingDate": "2008",
      "industry": "人材支援・教育研修",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "JP",
        "addressRegion": "滋賀県",
        "addressLocality": "大津市",
        "streetAddress": "皇子が丘2丁目10番25-3004号",
        "postalCode": "520-0025"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "0120-558-551",
        "contactType": "customer service",
        "availableLanguage": ["Japanese"],
        "areaServed": ["JP", "関西地方", "滋賀県"]
      },
      "knowsAbout": [
        "生成AI研修",
        "リスキリング",
        "キャリアコンサルティング",
        "退職支援",
        "DX人材育成",
        "プロンプトエンジニアリング",
        "ChatGPT活用",
        "SEO対策",
        "レリバンスエンジニアリング",
        "滋賀県AI研修",
        "関西地方DX推進",
        "大津市企業支援"
      ],
      "serviceArea": [
        {
          "@type": "Country",
          "name": "日本"
        },
        {
          "@type": "Place",
          "name": "関西地方"
        },
        {
          "@type": "Place",
          "name": "滋賀県"
        },
        {
          "@type": "Place",
          "name": "大津市"
        }
      ]
    },
    "potentialAction": [
      {
        "@type": "ReadAction",
        "target": [
          "https://nands.tech/blog"
        ]
      },
      {
        "@type": "ContactAction",
        "target": [
          "https://nands.tech/contact"
        ]
      }
    ],
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
    }
  };

  return (
    <main>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageStructuredData) }}
      />
      <div className="container mx-auto px-4">
        <Breadcrumbs />
      </div>
      
      {/* 重いコンポーネントは遅延ロード */}
      <HeroSectionSSR />
              <ServicesSectionSSR />
      
      {/* 記事セクションはSSR化（SEO強化） */}
      <section className="py-16 bg-gray-50" role="region" aria-labelledby="latest-posts-heading">
        <div className="container mx-auto px-4">
          <h2 id="latest-posts-heading" className="text-3xl font-bold text-center mb-12">最新の記事</h2>
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