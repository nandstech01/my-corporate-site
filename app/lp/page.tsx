import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LPHeader from '@/components/lp/LPHeader'
import LPHeroSectionSSR from '@/components/lp/LPHeroSectionSSR'
import ProblemsSectionSSR from '@/components/lp/ProblemsSectionSSR'
import SubsidySectionSSR from '@/components/lp/SubsidySectionSSR'
import TechResultsSectionSSR from '@/components/lp/TechResultsSectionSSR'
import ServicesSectionSSR from '@/components/lp/ServicesSectionSSR'
import ContactSectionSSR from '@/components/lp/ContactSectionSSR'
// LP専用フッターは共通フッターと重複するため削除
import PostsGridSSR from '@/components/common/PostsGridSSR'
import PostsGridAnimations from '@/components/common/PostsGridAnimations'
// import { createClient } from '@/utils/supabase/server'
import dynamic from 'next/dynamic'
import ROICalculator from '@/components/corporate/ROICalculator'
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration'
import { getUnifiedSupabaseClient } from '@/lib/supabase/unified-client'

// ISR 設定（5分ごとに再検証）
export const revalidate = 600 // 10分間隔でISR実行（キャッシュ効率向上）

// タイプライター（クライアント）
const TextType = dynamic(() => import('@/components/common/TextType'), { ssr: false })

export const metadata: Metadata = {
  metadataBase: new URL('https://nands.tech'),
  title: '人材開発支援助成金75%還付でAIモードも怖くない | 株式会社エヌアンドエス',
  description: '人材開発支援助成金で75%還付！SNS自動運用＆コンサル・システム開発で実証済み。AIモードも怖くない、94%SNS運用効率化実績あり。',
  keywords: '人材開発支援助成金,リスキリング,AI研修,SNS自動運用,コンサル,システム開発,AI対策,75%還付',

  openGraph: {
    title: '人材開発支援助成金75%還付でAIモードも怖くない',
    description: '75%還付でSNS自動運用を実現。94%SNS運用効率化の実証済み技術',
    url: 'https://nands.tech/lp',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/og-lp.jpg',
        width: 1200,
        height: 630,
        alt: '人材開発支援助成金75%還付でAIモードも怖くない',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '人材開発支援助成金75%還付でAIモードも怖くない',
    description: '75%還付でSNS自動運用を実現。94%SNS運用効率化の実証済み技術',
    images: ['/og-lp.jpg'],
  },
  alternates: {
    canonical: 'https://nands.tech/lp',
    languages: {
      'ja-JP': 'https://nands.tech/lp'
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// 構造化データ
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '株式会社エヌアンドエス',
  url: 'https://nands.tech',
  logo: 'https://nands.tech/logo.png',
  sameAs: [
    'https://twitter.com/nands_tech',
    'https://www.linkedin.com/company/nands-tech'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '0120-558-551',
    contactType: 'customer service',
    availableLanguage: 'Japanese'
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '皇子が丘２丁目10−25−3004号',
    addressLocality: '大津市',
    addressRegion: '滋賀県',
    addressCountry: 'JP'
  }
}

// Corporateページと同等の記事型
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  meta_description?: string;
  thumbnail_url: string | null;
  featured_image?: string | null;
  created_at: string;
  category?: { name: string; slug: string };
  table_type: 'posts' | 'chatgpt_posts';
  is_chatgpt_special?: boolean;
};

async function getLatestPosts(): Promise<Post[]> {
  const supabase = getUnifiedSupabaseClient();
  try {
    // 🚀 パフォーマンス最適化: 並列クエリ実行
    const [newPostsResult, oldPostsResult] = await Promise.all([
      // postsテーブル（RAG記事）- 最小限のフィールドのみ
      supabase
        .from('posts')
        .select('id, title, slug, meta_description, thumbnail_url, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6), // 最初から6件に制限

      // chatgpt_postsテーブル（ChatGPT記事）- 最小限のフィールドのみ  
      supabase
        .from('chatgpt_posts')
        .select('id, title, slug, excerpt, thumbnail_url, featured_image, created_at, is_chatgpt_special, categories(name, slug)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6) // 最初から6件に制限
    ]);

    const { data: newPosts } = newPostsResult;
    const { data: oldPosts } = oldPostsResult;

    const formattedNew: Post[] = (newPosts || []).map(p => ({
      id: p.id.toString(),
      title: p.title,
      slug: p.slug,
      excerpt: p.meta_description || '',
      meta_description: p.meta_description,
      thumbnail_url: p.thumbnail_url,
      created_at: p.created_at,
      table_type: 'posts'
    }));

    const formattedOld: Post[] = (oldPosts || []).map(p => {
      const imageUrl = p.thumbnail_url || p.featured_image;
      const final = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`) : null;
      return {
        id: p.id.toString(),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || '',
        thumbnail_url: final,
        featured_image: p.featured_image,
        created_at: p.created_at,
        category: p.categories?.[0],
        table_type: 'chatgpt_posts',
        is_chatgpt_special: p.is_chatgpt_special
      };
    });

    const all = [...formattedNew, ...formattedOld].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return all.slice(0, 6);
  } catch (e) {
    console.error('getLatestPosts error (lp):', e);
    return [];
  }
}

export default async function LPPage() {
  const posts = await getLatestPosts();

  // 🚀 条件付き構造化データ生成（開発環境では軽量化）
  let pageData = null;
  if (process.env.NODE_ENV === 'production') {
    // 統一構造化データ（Mike King理論準拠）- 本番環境のみ
    pageData = await generateUnifiedPageData({
      pageSlug: 'lp',
      pageTitle: '人材開発支援助成金75%還付でAIモードも怖くない',
      keywords: [
        '人材開発支援助成金',
        'AI研修',
        'リスキリング',
        'SNS自動運用',
        'レリバンスエンジニアリング',
        'GEO最適化',
        'AI検索表示率向上',
      ],
      category: '法人向けAI研修',
      enableAISearchDetection: true,
      enableTrustSignals: true,
    });
  }

  // LP固有の教育プログラムスキーマ（表示は変えず、検索向けに情報付与）
  const lpProgramSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: 'keita×NANDS 法人リスキリング3コースパッケージ',
    description: 'AI検索時代に最適化されたレリバンスエンジニアリング、SNS自動化、AI駆動開発の3コースを統合した法人向けプログラム。人材開発支援助成金で最大75%還付に対応。',
    provider: { '@type': 'Organization', '@id': 'https://nands.tech/#organization' },
    educationalProgramMode: ['オンライン研修', '対面研修', 'ハイブリッド研修'],
    timeToComplete: 'P6W',
    occupationalCategory: ['AI活用推進担当者', 'DX推進リーダー', 'SNS運用責任者'],
    hasCourse: [
      {
        '@type': 'Course',
        name: 'レリバンスエンジニアリング講座',
        description: 'AI検索時代に適合するためのプロンプト戦略と文書最適化（レリバンスエンジニアリング）を体系的に学ぶ講座。検索可視性と引用率の最大化に直結する実践的手法を習得します。',
        provider: { '@type': 'Organization', '@id': 'https://nands.tech/#organization' },
        offers: {
          '@type': 'Offer',
          price: 300000,
          priceCurrency: 'JPY',
          availability: 'https://schema.org/InStock',
          url: 'https://nands.tech/lp'
        },
        hasCourseInstance: [
          {
            '@type': 'CourseInstance',
            courseMode: 'online',
            location: { '@type': 'VirtualLocation', url: 'https://nands.tech/lp' }
          }
        ]
      },
      {
        '@type': 'Course',
        name: 'SNS自動化講座',
        description: '最新のAIとオートメーションでSNS運用を半自動化。戦略設計から運用テンプレート、ワークフローまで、成果に直結する運用基盤を構築します。',
        provider: { '@type': 'Organization', '@id': 'https://nands.tech/#organization' },
        offers: {
          '@type': 'Offer',
          price: 300000,
          priceCurrency: 'JPY',
          availability: 'https://schema.org/InStock',
          url: 'https://nands.tech/lp'
        },
        hasCourseInstance: [
          {
            '@type': 'CourseInstance',
            courseMode: 'online',
            location: { '@type': 'VirtualLocation', url: 'https://nands.tech/lp' }
          }
        ]
      },
      {
        '@type': 'Course',
        name: 'AI駆動開発講座',
        description: 'bolt.new をはじめとしたAI駆動開発の導入・実践。要件定義からプロトタイピング、運用まで、開発生産性を大幅に引き上げる手法を身につけます。',
        provider: { '@type': 'Organization', '@id': 'https://nands.tech/#organization' },
        offers: {
          '@type': 'Offer',
          price: 300000,
          priceCurrency: 'JPY',
          availability: 'https://schema.org/InStock',
          url: 'https://nands.tech/lp'
        },
        hasCourseInstance: [
          {
            '@type': 'CourseInstance',
            courseMode: 'online',
            location: { '@type': 'VirtualLocation', url: 'https://nands.tech/lp' }
          }
        ]
      },
    ],
  };

  return (
    <>
      {/* Organization スキーマ（既存 jsonLd を出力） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
      />

      {/* 🚀 条件付きScript読み込み（開発環境では軽量化） */}
      {process.env.NODE_ENV === 'production' && (
        <>
          {/* 統一構造化データ */}
          {pageData?.structuredData && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.structuredData, null, 2) }}
            />
          )}

          {/* GEO最適化 hasPart（AI検索対策） */}
          {pageData?.geoOptimizedHasPart && (
            <script
              id="geo-optimized-haspart-lp"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.geoOptimizedHasPart.jsonLd, null, 2) }}
            />
          )}
        </>
      )}

      {/* LP固有の教育プログラム スキーマ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lpProgramSchema, null, 2) }}
      />

      {/* 🚀 開発環境用軽量スキーマ */}
      {process.env.NODE_ENV === 'development' && (
        <script
          id="dev-minimal-lp-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "人材開発支援助成金75%還付でAIモードも怖くない",
              "url": "https://nands.tech/lp",
              "description": "人材開発支援助成金で75%還付！SNS自動運用＆コンサル・システム開発で実証済み。"
            }, null, 2)
          }}
        />
      )}

      <main className="relative min-h-screen overflow-hidden">
      {/* Fragment ID for Entity Map - Hidden from users */}
      <div id="service" style={{ display: 'none' }} aria-hidden="true" />
      
      {/* LPページ専用 背景グリッド（他ページへ影響なし） */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f3b] via-[#0a1b33] to-[#08152a]" />
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
      </div>
      <LPHeader />
      <LPHeroSectionSSR />
      <ProblemsSectionSSR />
      <SubsidySectionSSR />
      <TechResultsSectionSSR />
      <ServicesSectionSSR />
      {/* ROI計算ツール（ブログセクションの直前に配置） */}
      <section id="roi-calculator" className="py-20 bg-gradient-to-b from-gray-900 via-slate-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">AI研修導入効果計算ツール</h2>
            <ROICalculator hideCTA />
          </div>
        </div>
      </section>
      {/* ブログ記事セクション（問い合わせ直前に配置） */}
      <section id="latest-blog-posts" className="relative py-20 bg-gradient-to-b from-gray-900 via-slate-900 to-black blog-section" role="region" aria-labelledby="latest-posts-heading">
        <div className="container mx-auto px-4">
          <h2 id="latest-posts-heading" className="text-3xl font-bold text-center mb-12 text-white">
            <TextType
              text="最新の記事 - 生成AI・企業研修・技術情報"
              className="text-white"
              typingSpeed={70}
              showCursor={false}
              startOnVisible={true}
              loop={false}
              initialDelay={0}
              as="span"
            />
          </h2>
          <p className="text-center text-slate-300 mb-8 max-w-3xl mx-auto">
            AI活用事例、企業研修の実績、最新技術情報など、法人のAI導入に役立つ情報をお届けします。
            業界別の活用事例や導入効果についても詳しく解説しています。
          </p>
          <PostsGridSSR initialPosts={posts} />
          <Suspense fallback={null}>
            <PostsGridAnimations />
          </Suspense>
                  {/* ほのかなグロー */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.12),transparent_60%)]" />
          </div>
        </div>
       </section>
      <ContactSectionSSR />
    </main>
    </>
  )
} 