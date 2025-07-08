import React from 'react';
import { getReviewStats } from '@/lib/supabase/client';

/**
 * ChatbotHeroSectionSSR.tsx
 * チャットボット開発サービス専用ヒーローセクション
 * Mike King理論準拠・レビュー表示・構造化データ対応
 */

export default async function ChatbotHeroSectionSSR() {
  const reviewStats = await getReviewStats('chatbot-development');
  
  // フォールバック値
  const displayRating = reviewStats?.averageRating || 4.7;
  const displayCount = reviewStats?.totalReviews || 13;

  return (
    <section 
      id="chatbot-hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32"
    >
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
      
      {/* 装飾的な背景要素 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左側: メインコンテンツ */}
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                チャットボット開発
              </span>
              <br />
              <span className="text-white">
                高性能AI対話システム
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              GPT-4を活用した高性能チャットボット開発で、カスタマーサポート業務を完全自動化。
              多言語対応・高精度応答により、顧客満足度向上と大幅な工数削減を実現します。
            </p>

            {/* レビュー表示 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <div className="flex items-center mr-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(displayRating)
                          ? 'text-yellow-400'
                          : star === Math.ceil(displayRating) && displayRating % 1 !== 0
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white font-semibold text-lg">
                  {displayRating}/5.0
                </span>
                <span className="text-blue-200 ml-2">
                  ({displayCount}件のレビュー)
                </span>
              </div>

              <div className="text-left">
                <blockquote className="text-blue-100 italic mb-2">
                  "GPT-4を活用したカスタマーサポートボットにより、24時間対応が実現し、顧客満足度が大幅に向上しました。"
                </blockquote>
                <cite className="text-blue-300 text-sm">
                  - 製造業A社 情報システム部長
                </cite>
              </div>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#consultation-section"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                無料相談・お問い合わせ
              </a>
              <a
                href="#services-section"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                サービス詳細を見る
              </a>
              <a
                href="/reviews"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                レビューを見る
              </a>
            </div>
          </div>

          {/* 右側: 視覚的要素 */}
          <div className="hidden lg:block">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                主要機能
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100">GPT-4統合</span>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100">多言語対応</span>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100">24時間自動対応</span>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100">高精度応答・学習機能</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="text-center">
                  <p className="text-blue-200 text-sm mb-2">開発実績</p>
                  <p className="text-3xl font-bold text-white">50+</p>
                  <p className="text-blue-200 text-sm">チャットボット構築プロジェクト</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 構造化データ: レビュー */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AggregateRating",
            "itemReviewed": {
              "@type": "SoftwareApplication",
              "name": "チャットボット開発サービス",
              "description": "GPT-4・Claude統合による高性能チャットボット開発サービス。24時間365日自動応答、多言語対応、ベクトルRAG活用でカスタマーサポート業務を完全自動化。業界特化型カスタマイズ対応。",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Any",
              "provider": {
                "@type": "Organization",
                "@id": "https://nands.tech/#organization",
                "name": "株式会社エヌアンドエス"
              },
              "offers": {
                "@type": "Offer",
                "priceCurrency": "JPY",
                "price": "500000",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "priceCurrency": "JPY",
                  "minPrice": "500000",
                  "maxPrice": "5000000"
                },
                "description": "GPT-4統合チャットボット開発パッケージ（基本機能・多言語対応・24時間サポート含む）",
                "availability": "https://schema.org/InStock",
                "validFrom": "2024-01-01"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": displayRating,
                "bestRating": 5,
                "worstRating": 1,
                "ratingCount": displayCount
              }
            },
            "ratingValue": displayRating,
            "bestRating": 5,
            "worstRating": 1,
            "ratingCount": displayCount,
            "reviewCount": displayCount
          }, null, 2)
        }}
      />
    </section>
  );
} 