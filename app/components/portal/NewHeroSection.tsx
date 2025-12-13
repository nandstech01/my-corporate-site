'use client'

import { motion } from 'framer-motion'
import VectorLinkBackground from './VectorLinkBackground'
import HeroImageSlider from './HeroImageSlider'
import HeroBlogCardSlider from './HeroBlogCardSlider'
import { useTheme } from './ThemeContext'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail_url: string | null
  created_at: string
  table_type: 'posts' | 'chatgpt_posts'
}

interface YouTubeShort {
  id: number
  videoId: string
  url: string
  embedUrl: string
  title: string
  hookText?: string
  fragmentId: string
  completeUri?: string
}

interface NewHeroSectionProps {
  posts?: BlogPost[]
  youtubeShorts?: YouTubeShort[]
}

/**
 * NewHeroSection
 * "Hybrid Architecture" デザイン - Apple流の引き算 × 魂のメッセージ
 * 
 * 特徴:
 * - 深海グラデーション背景（ダーク）/ 白グラデーション（ライト）
 * - THE SWITCH（個人/法人切り替え）- ヘッダー下に固定
 * - メインビジュアルスライダー（1400×480px・左右ピーク表示）
 *   ※最初のスライドに「AIを『使う側』から『操る人』へ」メッセージを配置
 * - ブログカードスライダー（メインビジュアルに被る）
 * - セマンティックサンドイッチ構造（H1はsr-only）
 */
export default function NewHeroSection({ posts = [], youtubeShorts = [] }: NewHeroSectionProps) {
  const { theme } = useTheme()
  
  return (
    <section 
      id="hero" 
      className="relative overflow-hidden"
      style={{
        background: theme === 'dark' 
          ? `linear-gradient(180deg, #0A1628 0%, #1A2332 40%, #0D1B2A 70%, #050A14 100%)`
          : `linear-gradient(180deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)`
      }}
      aria-label="メインビジュアル"
    >
      {/* 背景アニメーション（ダークモードのみ） */}
      <VectorLinkBackground 
        particleCount={60} 
        connectionDistance={120} 
      />
      
      {/* グラデーションオーバーレイ（控えめ・プレミアム） */}
      {theme === 'dark' && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(30, 58, 138, 0.15), transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 100%, rgba(6, 78, 92, 0.1), transparent 50%)
            `
          }}
          aria-hidden="true"
        />
      )}
      
      {/* H1（SEO用・非表示） */}
      <h1 className="sr-only">
        NANDS TECH - AIアーキテクトによる企業OS設計とレリバンスエンジニアリング | 個人向けリスキリング・法人向けAI顧問
      </h1>

      {/* メインビジュアルスライダー */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 w-full pt-16"
      >
        <HeroImageSlider youtubeShorts={youtubeShorts} />
      </motion.div>

      {/* ブログ記事カードスライダー（メインビジュアルに被る） */}
      {posts && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-20"
        >
          <HeroBlogCardSlider posts={posts} />
        </motion.div>
      )}

      {/* スクロール誘導 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span 
            className="text-xs tracking-wider"
            style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
          >
            SCROLL
          </span>
          <svg 
            className="w-5 h-5"
            style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* 下部フェード */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0A1628, transparent)'
        }}
        aria-hidden="true"
      />
    </section>
  )
}

