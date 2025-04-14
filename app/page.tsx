import HeroSection from '@/app/components/portal/HeroSection'
import ServicesSection from '@/app/components/portal/ServicesSection'
import SustainabilitySection from '@/app/components/portal/SustainabilitySection'
import ContactSection from '@/app/components/portal/ContactSection'
import AboutSection from '@/app/components/portal/AboutSection'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { createClient } from '@/utils/supabase/server'
import PostsGrid from '@/components/common/PostsGrid'
import Script from 'next/script'
import { getStructuredData } from './structured-data'
import type { Metadata } from 'next'
import Breadcrumbs from './components/common/Breadcrumbs'
import FAQSection from './components/portal/FAQSection'

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
  
  // ホームページ用に追加の構造化データを設定
  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修",
    "description": "生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートします。",
    "url": "https://nands.tech",
    "isPartOf": structuredData,
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
    ]
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
      <HeroSection />
      <ServicesSection />
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">最新の記事</h2>
          <PostsGrid initialPosts={posts} />
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