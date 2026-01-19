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
      
      {/* グラデーションオーバーレイ（洗練された複数レイヤー） */}
      {theme === 'dark' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 20% 0%, rgba(59, 130, 246, 0.08), transparent 50%),
              radial-gradient(ellipse 80% 60% at 80% 20%, rgba(168, 85, 247, 0.06), transparent 45%),
              radial-gradient(ellipse 100% 50% at 50% 100%, rgba(6, 182, 212, 0.05), transparent 40%)
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

      {/* スクロール誘導（洗練されたミニマルデザイン） */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-3"
        >
          <span
            className="text-[10px] font-medium tracking-[0.2em] uppercase"
            style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)' }}
          >
            Scroll
          </span>
          {/* 縦線のグラデーションフェード */}
          <div
            className="w-[1px] h-8"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0))'
                : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0))'
            }}
          />
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

