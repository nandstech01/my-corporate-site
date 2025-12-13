'use client'

/**
 * AISiteShowcaseSection - AIサイト紹介セクション
 * 
 * Apple風カード2枚デザイン
 * NANDSのAIサイトの特徴をシンプルに洗練されたスタイルで表示
 * ライト/ダークモード対応
 * PC: 横並び2カラム / スマホ: スライド表示
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

export default function AISiteShowcaseSection() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // localStorageからテーマを読み取り
    const savedTheme = localStorage.getItem('nands-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // システムのテーマを検出
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    // テーマ変更イベントをリッスン
    const handleThemeChange = (e: CustomEvent) => {
      setTheme(e.detail.theme)
    }
    window.addEventListener('nands-theme-change', handleThemeChange as EventListener)
    
    return () => {
      window.removeEventListener('nands-theme-change', handleThemeChange as EventListener)
    }
  }, [])

  const cards = [
    {
      label: "AI引用最適化",
      title: "AIに見つけられる",
      subtitle: "設計",
      description: "ChatGPT・Claude・Perplexityが正確に理解し、引用する価値のあるデジタル資産として設計されたWebサイト。",
      features: [
        'Fragment ID自動付与',
        '構造化データ標準搭載',
        'Mike King理論準拠設計'
      ],
      ctaText: "AIサイトを見る",
      ctaUrl: "/ai-site#ai-site-overview",
      accentColor: theme === 'dark' ? '#22d3ee' : '#0891b2'
    },
    {
      label: "自動運転",
      title: "24時間365日",
      subtitle: "無人営業",
      description: "Triple RAG × 自動ベクトルブログ × 構造化データ。人手を増やさず、成果だけ増やすサイト。",
      features: [
        'Triple RAGシステム',
        '自動ベクトルブログ生成',
        'IT補助金活用可能'
      ],
      ctaText: "詳細を見る",
      ctaUrl: "/ai-site#mechanism",
      accentColor: theme === 'dark' ? '#a855f7' : '#7c3aed'
    }
  ]

  return (
    <section 
      id="ai-site-showcase" 
      className="py-24 sm:py-32 scroll-mt-20 relative"
      style={{
        background: theme === 'dark' ? '#0A1628' : '#ffffff'
      }}
      role="region" 
      aria-labelledby="ai-site-heading"
    >
      {/* AIサイト関連Fragment ID - スクロール機能有効化 */}
      <div id="nands-ai-site" className="absolute -top-20" aria-hidden="true" />
      <div id="ai-site-features" className="absolute -top-20" aria-hidden="true" />
      <div id="ai-site-technology" className="absolute -top-20" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションタイトル（中央揃え） */}
        <div className="text-center mb-16">
          <p 
            className="text-sm font-semibold tracking-widest uppercase mb-4"
            style={{ color: theme === 'dark' ? '#22d3ee' : '#0891b2' }}
          >
            Special Topic
          </p>
          <h2 
            id="ai-site-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            NANDSのAIサイト
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            AIに引用されるサイト — すべてが資産になる。
          </p>
        </div>

        {/* カード2枚 */}
        {/* PC版: 横並び2カラム */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <AISiteCard key={index} theme={theme} {...card} />
          ))}
        </div>

        {/* スマホ版: スライダー */}
        <div className="lg:hidden">
          <Swiper
            modules={[Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            pagination={{ clickable: true }}
            className="aisite-swiper"
            style={{ paddingBottom: '50px' }}
          >
            {cards.map((card, index) => (
              <SwiperSlide key={index}>
                <AISiteCard theme={theme} {...card} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <style jsx global>{`
          .aisite-swiper .swiper-pagination-bullet {
            background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
            opacity: 1;
          }
          .aisite-swiper .swiper-pagination-bullet-active {
            background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
          }
        `}</style>
      </div>
    </section>
  )
}

/**
 * 再利用可能なAIサイトカードコンポーネント（Apple風）
 */
interface AISiteCardProps {
  theme: 'light' | 'dark'
  label: string
  title: string
  subtitle: string
  description: string
  features: string[]
  ctaText: string
  ctaUrl: string
  accentColor: string
}

function AISiteCard({
  theme,
  label,
  title,
  subtitle,
  description,
  features,
  ctaText,
  ctaUrl,
  accentColor
}: AISiteCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl p-8 lg:p-10
        ${theme === 'dark' 
          ? 'bg-gray-900/50 border border-gray-800' 
          : 'bg-gray-50 border border-gray-200'
        }
        shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1
      `}
    >
      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col h-full">
        {/* ラベル */}
        <p 
          className="text-xs font-bold tracking-widest uppercase mb-4"
          style={{ color: accentColor }}
        >
          {label}
        </p>

        {/* タイトル */}
        <div className="mb-6">
          <h3 
            className="text-3xl lg:text-4xl font-bold leading-tight"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            {title}
          </h3>
          <p 
            className="text-xl lg:text-2xl font-semibold"
            style={{ color: accentColor }}
          >
            {subtitle}
          </p>
        </div>

        {/* 説明文 */}
        <p 
          className="text-base lg:text-lg leading-relaxed mb-6"
          style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
        >
          {description}
        </p>

        {/* 機能リスト */}
        <ul className="space-y-3 mb-8 flex-grow">
          {features.map((feature, i) => (
            <li 
              key={i}
              className="flex items-start gap-3 text-base"
              style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            >
              <span style={{ color: accentColor }}>✓</span>
              {feature}
            </li>
          ))}
        </ul>

        {/* CTAボタン */}
        <Link
          href={ctaUrl}
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 text-white"
          style={{ background: accentColor }}
        >
          {ctaText}
          <svg 
            className="ml-2 w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}
