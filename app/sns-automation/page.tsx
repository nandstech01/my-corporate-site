import React, { Suspense } from 'react';
import { Metadata } from 'next'
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration'
import { supabase } from '@/lib/supabase/supabase'
import SNSHeroSectionSSR from './components/SNSHeroSectionSSR';
import SNSServicesSection from './components/SNSServicesSection';
import SNSTechStack from './components/SNSTechStack';
import SNSShowcase from './components/SNSShowcase';
import SNSPricingSection from './components/SNSPricingSection';
import SNSContactSectionSSR from './components/SNSContactSectionSSR';
import ClientSideAnchorEnhancer from '@/components/ai-search/ClientSideAnchorEnhancer';

import TableOfContents from '@/components/common/TableOfContents';
import ClickRecoveryBanner from '@/components/ai-search/ClickRecoveryBanner';

export const metadata: Metadata = {
  title: 'SNS自動化システム開発サービス | X・Instagram・Facebook対応AI投稿管理 | 株式会社エヌアンドエス',
  description: 'X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、マーケティング効果を最大化するシステムを開発。AI分析、スケジューリング、エンゲージメント300%向上の実績。7プラットフォーム対応。',
  keywords: [
    'SNS自動化',
    'X自動化',
    'Twitter自動化',
    'Instagram自動化',
    'Facebook自動化',
    'SNSマーケティング',
    'API連携',
    '投稿自動化',
    'エンゲージメント分析',
    'トレンドリサーチ',
    'スケジューリング機能'
  ],
  openGraph: {
    title: 'SNS自動化システム開発サービス | X・Instagram・Facebook対応AI投稿管理',
    description: 'X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、マーケティング効果を最大化するシステムを開発。AI分析、スケジューリング、エンゲージメント300%向上の実績。7プラットフォーム対応。',
    url: 'https://nands.tech/sns-automation',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: 'https://nands.tech/images/sns-automation-og.jpg',
        width: 1200,
        height: 630,
        alt: 'SNS自動化システム開発サービス',
      }
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SNS自動化システム開発サービス | X・Instagram・Facebook対応AI投稿管理',
    description: 'X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、マーケティング効果を最大化するシステムを開発。',
    images: ['https://nands.tech/images/sns-automation-og.jpg'],
  },
  alternates: {
    canonical: 'https://nands.tech/sns-automation',
  }
}

const pageContext = {
  pageSlug: 'sns-automation',
  pageName: 'sns-automation',
  pageTitle: 'SNS自動化システム開発サービス',
  businessDomain: 'デジタルマーケティング',
  serviceType: 'SNS自動化システム開発',
  category: 'デジタルマーケティング',
  keywords: [
    'SNS自動化', 'X自動化', 'Twitter自動化', 'Instagram自動化', 'Facebook自動化',
    'SNSマーケティング', 'API連携', '投稿自動化', 'エンゲージメント分析',
    'トレンドリサーチ', 'スケジューリング機能'
  ],
  primaryKeywords: [
    'SNS自動化', 'X自動化', 'Twitter自動化', 'Instagram自動化', 'Facebook自動化',
    'SNSマーケティング', 'API連携', '投稿自動化', 'エンゲージメント分析'
  ],
  targetAudience: ['SNSマーケティング担当者', 'デジタルマーケター', 'ソーシャルメディア管理者', 'コンテンツマーケター'],
  painPoints: [
    '複数SNSの手動投稿負荷',
    'マルチプラットフォーム管理の複雑性',
    'エンゲージメント分析の困難さ',
    '最適投稿タイミングの判断'
  ],
  solutions: [
    '7プラットフォーム同時投稿自動化',
    'AI分析によるエンゲージメント最適化',
    'トレンドリサーチ機能搭載',
    'スケジューリング自動管理'
  ],
  benefits: [
    '300%エンゲージメント向上',
    '100%完全自動化対応',
    '7プラットフォーム統合管理',
    'ROI分析・レポート自動生成'
  ]
}

export default async function SNSAutomationPage() {
  // 統合データ生成
  const unifiedData = await generateUnifiedPageData(pageContext)
  
  // 目次データ（手動定義）
  const tableOfContents = [
    { id: 'sns-hero', title: 'SNS自動化システム概要', level: 2, anchor: '#sns-hero' },
    { id: 'services-section', title: 'サービス一覧', level: 2, anchor: '#services-section' },
    { id: 'tech-stack-section', title: '技術スタック', level: 2, anchor: '#tech-stack-section' },
    { id: 'showcase-section', title: '導入事例', level: 2, anchor: '#showcase-section' },
    { id: 'pricing-section', title: '料金プラン', level: 2, anchor: '#pricing-section' },
    { id: 'contact', title: 'お問い合わせ', level: 2, anchor: '#contact' }
  ];
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* AI検索流入クリック回復バナー */}
      <ClickRecoveryBanner />
      
      {/* 統一目次機能（ヘッダー直下） */}
      <div className="bg-black py-4 border-b border-gray-800 pt-20">
        <div className="container mx-auto px-4">
          <div className="sns-automation-toc-container">
            <TableOfContents items={tableOfContents} compact={true} />
          </div>
        </div>
      </div>

      {/* 統一構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            unifiedData.structuredData.service,
            unifiedData.structuredData.softwareApplication,
            unifiedData.structuredData.breadcrumbs,
            unifiedData.structuredData.faq,
          ].filter(Boolean))
        }}
      />

      {/* Jump-Link CTA強化システム（Googleガイドライン100%準拠） */}
      <ClientSideAnchorEnhancer 
        enableAIDetection={true}
        enhancementDelay={800}
        scrollBehavior="smooth"
        trackingEnabled={true}
      />

      {/* ヒーローセクション */}
      <section id="hero-section">
        <SNSHeroSectionSSR />
      </section>

      {/* サービス紹介セクション */}
      <section id="services-section">
        <SNSServicesSection />
      </section>

      {/* 技術スタックセクション */}
      <section id="tech-stack-section">
        <SNSTechStack />
      </section>

      {/* 実績ショーケースセクション */}
      <section id="showcase-section">
        <SNSShowcase />
      </section>

      {/* 料金プランセクション */}
      <section id="pricing-section">
        <SNSPricingSection />
      </section>

      {/* セマンティック内部リンクセクション */}
      {unifiedData.semanticLinks.length > 0 && (
        <section className="py-16 bg-gray-800/50 border-t border-gray-700/50" id="related-services-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              関連マーケティング・開発サービス
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unifiedData.semanticLinks.slice(0, 6).map((link, index) => (
                <div key={index} className="bg-gray-900/60 border border-gray-700/50 p-6 hover:shadow-lg hover:border-blue-500/30 transition-all backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    <a href={link.url} className="hover:text-blue-400 transition-colors">
                      {link.title}
                    </a>
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {link.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-400 font-medium">
                      関連度: {Math.round(link.relevanceScore * 100)}%
                    </span>
                    <a
                      href={link.url}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      詳細を見る →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* お問い合わせセクション */}
      <section id="contact">
        <SNSContactSectionSSR />
      </section>
    </main>
  )
} 