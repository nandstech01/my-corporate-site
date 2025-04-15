import React from "react";
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import CaseStudiesSection from './components/CaseStudiesSection';
import FaqSection from './components/FaqSection';
import ContactSection from './components/ContactSection';
import { createClient } from '@/utils/supabase/server';
import PostsGrid from '@/components/common/PostsGrid';
import CorporateProblems from './components/CorporateProblems';
import CorporateMerits from './components/CorporateMerits';
import CorporateFlow from './components/CorporateFlow';
import { Post } from '../../types/post';
import type { Metadata } from 'next';
import Script from 'next/script';
import Breadcrumbs from '../components/common/Breadcrumbs';

export const metadata: Metadata = {
  title: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
  description: '法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、人材育成を通じて企業の競争力を高めます。企業規模や業種に合わせたカスタマイズ研修で、組織全体のAIリテラシー向上を実現します。',
  keywords: '法人向けAIリスキリング,企業向けAI研修,業務効率化,生成AI活用,人材育成,組織変革,デジタルトランスフォーメーション,DX推進,AI導入支援,AI活用コンサルティング',
  openGraph: {
    title: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
    description: '法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、人材育成を通じて企業の競争力を高めます。',
    url: 'https://nands.tech/corporate',
    siteName: '株式会社エヌアンドエス',
    images: ['/images/corporate-ogp.jpg'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nands_tech',
    creator: '@nands_tech',
  },
  alternates: {
    canonical: 'https://nands.tech/corporate'
  },
}

export default async function CorporatePage() {
  const supabase = createClient();

  // 構造化データ
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "法人向けAIリスキリング研修・業務効率化支援",
    "description": "法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、人材育成を通じて企業の競争力を高めます。",
    "provider": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "sameAs": "https://nands.tech"
    },
    "serviceType": "企業向けAIリスキリング研修",
    "offers": {
      "@type": "Offer",
      "category": "法人向けAIソリューション",
      "priceCurrency": "JPY"
    },
    "areaServed": {
      "@type": "Country",
      "name": "日本"
    }
  };
  
  try {
    // 記事の取得
    const { data: postsData, error: postsError } = await supabase
      .from('chatgpt_posts')
      .select('id, title, slug, excerpt, thumbnail_url, featured_image, seo_keywords, category:categories(name, slug)')
      .eq('status', 'published')
      .eq('business_id', 3) // 法人向けリスキリング（ID: 3）の記事のみを取得
      .order('created_at', { ascending: false })
      .limit(6);

    // カテゴリの取得
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .eq('business_id', 3) // 法人向けリスキリング（ID: 3）のカテゴリのみを取得
      .order('created_at', { ascending: true });

    if (postsError || categoriesError) {
      console.error('Error fetching data:', postsError || categoriesError);
      return (
        <main className="min-h-screen">
          <Script
            id="structured-data-corporate"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          <div className="container mx-auto px-4">
            <Breadcrumbs customItems={[
              { name: 'ホーム', path: '/' },
              { name: '法人向けAIリスキリング', path: '/corporate' }
            ]} />
          </div>
          <HeroSection />
          <CorporateProblems />
          <ServicesSection />
          <CorporateMerits />
          <CaseStudiesSection />
          <CorporateFlow />
          <FaqSection />
          <ContactSection />
        </main>
      );
    }

    const posts = (postsData || []).map((post: any) => {
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
        excerpt: post.excerpt,
        thumbnail_url: finalImageUrl,
        featured_image: finalImageUrl,
        category: post.category?.[0] ? {
          name: post.category[0].name,
          slug: post.category[0].slug
        } : undefined,
        seo_keywords: post.seo_keywords || []
      };
    });

    const categories = categoriesData || [];

    return (
      <main className="min-h-screen">
        <Script
          id="structured-data-corporate"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="container mx-auto px-4">
          <Breadcrumbs customItems={[
            { name: 'ホーム', path: '/' },
            { name: '法人向けAIリスキリング', path: '/corporate' }
          ]} />
        </div>
        <HeroSection />
        <CorporateProblems />
        <ServicesSection />
        <CorporateMerits />
        <CaseStudiesSection />
        {/* 業界別カテゴリセクション */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">業界別ソリューション</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-video">
                    <img
                      src={`/images/industries/${category.slug}.jpg`}
                      alt={`${category.name}のイメージ`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{category.name}</h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <a
                      href={`/categories/${category.slug}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
                    >
                      詳しく見る
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <CorporateFlow />
        <FaqSection />
        <ContactSection />
        {/* 最新の記事セクション */}
        <section className="py-16 px-4 bg-black text-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">最新の記事</h2>
            <PostsGrid initialPosts={posts} />
          </div>
        </section>
        {/* タグセクション */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">人気のキーワード</h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {Array.from(new Set(posts.flatMap(post => post.seo_keywords || []))).map((keyword, index) => (
                <a
                  key={index}
                  href={`/search?keyword=${encodeURIComponent(keyword)}`}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                >
                  <span className="text-sm font-medium">{keyword}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {posts.filter(post => post.seo_keywords?.includes(keyword)).length}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Error in CorporatePage:', error);
    return (
      <main className="min-h-screen">
        <Script
          id="structured-data-corporate"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="container mx-auto px-4">
          <Breadcrumbs customItems={[
            { name: 'ホーム', path: '/' },
            { name: '法人向けAIリスキリング', path: '/corporate' }
          ]} />
        </div>
        <HeroSection />
        <CorporateProblems />
        <ServicesSection />
        <CorporateMerits />
        <CaseStudiesSection />
        <CorporateFlow />
        <FaqSection />
        <ContactSection />
      </main>
    );
  }
}
