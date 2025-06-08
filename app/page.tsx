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

// 重いコンポーネントを動的インポート（SSR無効化）
const HeroSection = dynamic(() => import('@/app/components/portal/HeroSection'), {
  ssr: false,
  loading: () => (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden hero-fallback">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
          AIとともに未来を切り拓く
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          株式会社エヌアンドエス
        </p>
        <div className="loading-stars" />
      </div>
    </section>
  )
})

const ServicesSection = dynamic(() => import('@/app/components/portal/ServicesSection'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-white" />
})

const AboutSection = dynamic(() => import('@/app/components/portal/AboutSection'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50" />
})

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
  featured_image: string | null;
  category?: {
    name: string;
    slug: string;
  };
};

async function getLatestPosts(): Promise<Post[]> {
  const supabase = createClient();
  
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
      .limit(6);

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
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
        featured_image: post.featured_image,
        category: post.categories?.[0]
      };
    });
  } catch (error) {
    console.error('Error in getLatestPosts:', error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getLatestPosts();
  const structuredData = getStructuredData();
  
  // ホームページ用に追加の構造化データを設定（レリバンスエンジニアリング強化）
  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修",
    "description": "生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートします。",
    "url": "https://nands.tech",
    "isPartOf": structuredData,
    "mainEntity": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "alternateName": "NANDS",
      "url": "https://nands.tech",
      "logo": "https://nands.tech/images/logo.png",
      "description": "総合人材支援・生成AIリスキリング研修を提供する企業",
      "foundingDate": "2008",
      "industry": "人材支援・教育研修",
      "knowsAbout": [
        "生成AI研修",
        "リスキリング",
        "キャリアコンサルティング",
        "退職支援",
        "DX人材育成",
        "プロンプトエンジニアリング",
        "ChatGPT活用",
        "SEO対策",
        "レリバンスエンジニアリング"
      ],
      "serviceArea": {
        "@type": "Country",
        "name": "日本"
      }
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
      <HeroSection />
      <ServicesSection />
      
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
      
      <AboutSection />
      <SustainabilitySection />
      <FeaturedSection />
      <FAQSection />
      <ContactSection />
    </main>
  )
} 