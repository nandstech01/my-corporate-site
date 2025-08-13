import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LPHeader from '@/components/lp/LPHeader'
import LPHeroSection from '@/components/lp/LPHeroSection'
import ProblemsSection from '@/components/lp/ProblemsSection'
import SubsidySection from '@/components/lp/SubsidySection'
import TechResultsSection from '@/components/lp/TechResultsSection'
import ServicesSection from '@/components/lp/ServicesSection'
import ContactSection from '@/components/lp/ContactSection'
// LP専用フッターは共通フッターと重複するため削除
import PostsGridSSR from '@/components/common/PostsGridSSR'
import PostsGridAnimations from '@/components/common/PostsGridAnimations'
import { createClient } from '@/utils/supabase/server'
import dynamic from 'next/dynamic'

// タイプライター（クライアント）
const TextType = dynamic(() => import('@/components/common/TextType'), { ssr: false })

export const metadata: Metadata = {
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
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
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
  const supabase = createClient();
  try {
    const { data: newPosts } = await supabase
      .from('posts')
      .select('id,title,slug,meta_description,thumbnail_url,created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: oldPosts } = await supabase
      .from('chatgpt_posts')
      .select(`
        id,title,slug,excerpt,thumbnail_url,featured_image,created_at,is_chatgpt_special,
        categories ( name, slug )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

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
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* LPページ専用 背景グリッド（他ページへ影響なし） */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f3b] via-[#0a1b33] to-[#08152a]" />
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
      </div>
      <LPHeader />
      <LPHeroSection />
      <ProblemsSection />
      <SubsidySection />
      <TechResultsSection />
      <ServicesSection />
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
      <ContactSection />
    </main>
  )
} 