'use client'

/**
 * HeroBlogCardSlider
 * 固定4記事の高品質カードスライダー
 * シンプル・上質・プレミアムなデザイン
 */

import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from './ThemeContext'

// Swiper styles
import 'swiper/css'
import 'swiper/css/free-mode'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail_url: string | null
  created_at: string
  table_type: 'posts' | 'chatgpt_posts'
}

interface HeroBlogCardSliderProps {
  posts: BlogPost[]
}

// 🎯 slug → カスタムラベル・カラーのマッピング
const CARD_CONFIG: Record<string, { 
  label: string; 
  darkGradient: string; 
  lightGradient: string;
  accentColor: string;
  lightAccentColor: string;
}> = {
  'ai--949889': {
    label: 'AIキャリア',
    darkGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e3a8a 100%)',
    lightGradient: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 40%, #f1f5f9 100%)',
    accentColor: '#3b82f6',
    lightAccentColor: '#3b82f6'
  },
  'ai-950781': {
    label: 'レリバンス\nエンジニアリング',
    darkGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    lightGradient: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 40%, #f1f5f9 100%)',
    accentColor: '#06b6d4',
    lightAccentColor: '#0891b2'
  },
  '-571903': {
    label: 'ベクトルリンク',
    darkGradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
    lightGradient: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 40%, #f1f5f9 100%)',
    accentColor: '#22d3ee',
    lightAccentColor: '#0e7490'
  },
  'ai-ai20251000-097498': {
    label: 'AIアーキテクト',
    darkGradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #4a1d6a 100%)',
    lightGradient: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 40%, #f1f5f9 100%)',
    accentColor: '#a855f7',
    lightAccentColor: '#7c3aed'
  }
}

export default function HeroBlogCardSlider({ posts }: HeroBlogCardSliderProps) {
  const { theme } = useTheme()

  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 mt-6 relative z-10">
      <Swiper
        modules={[FreeMode]}
        spaceBetween={24}
        slidesPerView={1.2}
        centeredSlides={false}
        freeMode={true}
        breakpoints={{
          640: { slidesPerView: 2.2, spaceBetween: 20 },
          1024: { slidesPerView: 3.5, spaceBetween: 24 },
          1400: { slidesPerView: 4, spaceBetween: 28 },
        }}
        className="hero-blog-swiper"
      >
        {posts.map((post, index) => {
          const config = CARD_CONFIG[post.slug] || {
            label: 'Article',
            darkGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            lightGradient: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
            accentColor: '#3b82f6',
            lightAccentColor: '#1e40af'
          }

          const currentGradient = theme === 'dark' ? config.darkGradient : config.lightGradient
          const currentAccentColor = theme === 'dark' ? config.accentColor : config.lightAccentColor

          return (
            <SwiperSlide key={post.id}>
              <Link 
                href={`/posts/${post.slug}`}
                className="block group"
              >
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.03] group-hover:-translate-y-1"
                  style={{
                    aspectRatio: '4/3',
                    background: currentGradient,
                    boxShadow: theme === 'dark'
                      ? `0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px ${config.accentColor}30`
                      : '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
                    border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.06)' : 'none'
                  }}
                >
                  {/* 背景パターン */}
                  {theme === 'dark' && (
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)
                        `
                      }}
                    />
                  )}

                  {/* ホバー時のシャイン効果 */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, transparent 100%)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 50%, transparent 100%)'
                    }}
                  />

                  {/* コンテンツ（完全中央揃え） */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center">
                      {/* ラベル */}
                      <h3 
                        className="text-lg sm:text-xl md:text-2xl font-bold leading-snug whitespace-pre-line tracking-wide"
                        style={{
                          color: theme === 'dark' ? '#ffffff' : '#374151',
                          textShadow: theme === 'dark' 
                            ? '0 2px 20px rgba(0,0,0,0.5)' 
                            : 'none',
                          fontFamily: "'Noto Sans JP', sans-serif",
                          letterSpacing: '0.05em'
                        }}
                      >
                        {config.label}
                      </h3>

                      {/* アンダーライン（アクセント） */}
                      <div 
                        className="mx-auto mt-3 h-0.5 w-12 rounded-full group-hover:w-20 transition-all duration-500"
                        style={{ 
                          background: currentAccentColor,
                          opacity: theme === 'dark' ? 0.6 : 0.8
                        }}
                      />
                    </div>
                  </div>

                  {/* 下部のグラデーションライン */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{
                      background: theme === 'dark'
                        ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)'
                        : `linear-gradient(to right, transparent, ${currentAccentColor}40, transparent)`
                    }}
                  />
                </motion.article>
              </Link>
            </SwiperSlide>
          )
        })}
      </Swiper>

      {/* カスタムスタイル */}
      <style jsx global>{`
        .hero-blog-swiper {
          padding: 20px 0 40px 0;
          overflow: visible;
        }

        .hero-blog-swiper .swiper-slide {
          height: auto;
        }
      `}</style>
    </div>
  )
}
