'use client'

/**
 * KnowledgeInsightsSection - Netflix風カテゴリ別記事セクション
 * 
 * スマホ版: 横スクロールスライド（Swiper）
 * PC版: グリッド表示
 * ライト/ダークモード対応
 */

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Pagination } from 'swiper/modules'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/pagination'

interface Post {
  id: number | string
  title: string
  slug: string
  excerpt?: string
  thumbnail_url?: string | null
  featured_image?: string | null
  created_at: string
  table_type?: 'posts' | 'chatgpt_posts'
}

interface KnowledgeInsightsSectionProps {
  aiNewsPosts: Post[]        // AIニュース・トレンド
  careerPosts: Post[]         // 転職・キャリア
  itReskillPosts: Post[]      // IT・ソフトウェア業界向けリスキリング
  marketingReskillPosts: Post[] // 広告・マーケティング業界向けリスキリング
}

interface CategoryRow {
  id: string
  title: string
  posts: Post[]
}

export default function KnowledgeInsightsSection({ 
  aiNewsPosts, 
  careerPosts, 
  itReskillPosts, 
  marketingReskillPosts 
}: KnowledgeInsightsSectionProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // モバイル判定
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // localStorageからテーマを読み取り
    const savedTheme = localStorage.getItem('nands-top-page-theme') as 'light' | 'dark' | null
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
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('nands-theme-change', handleThemeChange as EventListener)
    }
  }, [])

  // カテゴリ行の定義
  const categoryRows: CategoryRow[] = [
    {
      id: 'ai-news',
      title: 'AIニュース・トレンド',
      posts: aiNewsPosts
    },
    {
      id: 'career',
      title: '転職・キャリア',
      posts: careerPosts
    },
    {
      id: 'it-reskill',
      title: 'IT・ソフトウェア業界向けリスキリング',
      posts: itReskillPosts
    },
    {
      id: 'marketing-reskill',
      title: '広告・マーケティング業界向けリスキリング',
      posts: marketingReskillPosts
    }
  ]

  // 記事カードコンポーネント（以前のデザイン）
  const PostCard = ({ post }: { post: Post }) => {
    const imageUrl = post.thumbnail_url || post.featured_image
    
    return (
      <article
        className="overflow-hidden hover:border-[#00CFFF] transition-all duration-300 flex flex-col shadow-lg"
        style={{
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
        }}
      >
        <Link 
          href={`/posts/${post.slug}`} 
          className="block flex flex-col flex-grow"
        >
          {/* 画像セクション */}
          {imageUrl && (
            <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <Image
                src={imageUrl}
                alt={`${post.title}のサムネイル画像`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          
          {/* コンテンツセクション */}
          <div className="p-6 flex flex-col flex-grow">
            {/* タイトル */}
            <h3 
              className="text-xl font-semibold mb-2 line-clamp-2 transition-colors duration-200"
              style={{ 
                color: theme === 'dark' ? '#f3f4f6' : '#1a1a1a',
              }}
            >
              {post.title}
            </h3>
            
            {/* 抜粋 */}
            {post.excerpt && (
              <p 
                className="text-sm line-clamp-3 mb-4 flex-grow"
                style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
              >
                {post.excerpt}
              </p>
            )}
            
            {/* CTA ボタン */}
            <div className="mt-auto">
              <span
                className="inline-block px-6 py-3 font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                style={{
                  border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
                }}
              >
                続きを読む →
              </span>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  // カテゴリ行コンポーネント
  const CategoryRowComponent = ({ row }: { row: CategoryRow }) => {
    if (row.posts.length === 0) return null

    return (
      <div className="mb-12 last:mb-0">
        {/* カテゴリタイトル */}
        <h3 
          className="text-xl sm:text-2xl font-bold mb-4 px-4"
          style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
        >
          {row.title}
        </h3>

        {/* スマホ: Swiperスライド / PC: グリッド */}
        {isMobile ? (
          <Swiper
            modules={[FreeMode, Pagination]}
            spaceBetween={16}
            slidesPerView={1.2}
            freeMode={true}
            className="!px-4"
          >
            {row.posts.map((post) => (
              <SwiperSlide key={post.id}>
                <PostCard post={post} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {row.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <section 
      id="knowledge-insights" 
      className="py-20 sm:py-28 scroll-mt-20 relative overflow-hidden" 
      role="region" 
      aria-labelledby="latest-posts-heading"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(180deg, #0D1B2A 0%, #0A1628 100%)' 
          : 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)'
      }}
    >
      <div className="container mx-auto relative z-10">
        {/* セクションタイトル */}
        <div className="text-center mb-16 px-4">
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

        {/* カテゴリ別記事行 */}
        {categoryRows.map((row) => (
          <CategoryRowComponent key={row.id} row={row} />
        ))}

        {/* 全ての記事を見るボタン */}
        <div className="mt-16 text-center px-4">
          <h3 
            className="text-2xl sm:text-3xl font-bold mb-8"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            全ての記事
          </h3>
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
