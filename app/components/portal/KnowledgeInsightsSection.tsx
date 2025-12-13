'use client'

/**
 * KnowledgeInsightsSection - 最新記事・専門情報セクション
 * 
 * レリバンスエンジニアリング・AI最適化の最新情報を表示
 * ライト/ダークモード対応
 * 最新6件の記事を表示
 */

import { useEffect, useState } from 'react'
import PostsGridSSR from '@/components/common/PostsGridSSR'
import PostsGridAnimations from '@/components/common/PostsGridAnimations'
import { Suspense } from 'react'
import Link from 'next/link'

interface KnowledgeInsightsSectionProps {
  initialPosts: any[]
}

export default function KnowledgeInsightsSection({ initialPosts }: KnowledgeInsightsSectionProps) {
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

  return (
    <section 
      id="knowledge-insights" 
      className="py-20 sm:py-28 blog-section scroll-mt-20 relative overflow-hidden" 
      role="region" 
      aria-labelledby="latest-posts-heading"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1628 100%)' 
          : 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)'
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* セクションタイトル */}
        <div className="text-center mb-16">
          <p 
            className="text-sm font-semibold tracking-widest uppercase mb-4"
            style={{ color: theme === 'dark' ? '#22d3ee' : '#0891b2' }}
          >
            Insights & Knowledge
          </p>
          <h2 
            id="latest-posts-heading" 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            レリバンスエンジニアリング
            <br />
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: theme === 'dark'
                  ? 'linear-gradient(to right, #22d3ee, #a855f7)'
                  : 'linear-gradient(to right, #0891b2, #7c3aed)'
              }}
            >
              最新知見
            </span>
          </h2>
          <p 
            className="text-lg max-w-3xl mx-auto leading-relaxed"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            AI検索最適化、構造化データ戦略、最新テクノロジーの実践的な知見を発信。
            <br />
            Mike King理論準拠のアプローチで、あなたのビジネスをAI時代へ。
          </p>
        </div>

        {/* 記事グリッド */}
        <PostsGridSSR initialPosts={initialPosts} />
        <Suspense fallback={null}>
          <PostsGridAnimations />
        </Suspense>

        {/* 全ての記事を見るボタン */}
        <div className="mt-12 text-center">
          <Link
            href="/posts"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 text-white"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)'
                : 'linear-gradient(135deg, #0891b2 0%, #7c3aed 100%)',
              boxShadow: theme === 'dark'
                ? '0 4px 15px rgba(34, 211, 238, 0.4)'
                : '0 4px 15px rgba(8, 145, 178, 0.4)'
            }}
          >
            全ての記事を見る
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

