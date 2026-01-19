'use client'

/**
 * HeroImageSlider
 * 1400×480pxの横長画像スライダー
 * 左右に次/前の画像が少し見える（ピークデザイン）
 * - 最初のスライド: 「AIを『使う側』から『操る人』へ」メッセージ
 * - 4枚目のスライド: SNS自動化動画（モーダル再生）
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, EffectCoverflow, FreeMode } from 'swiper/modules'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeContext'
import { useMode } from './ModeContext'

// Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'
import 'swiper/css/free-mode'

// メディアクエリフック
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

interface HeroSlide {
  id: string
  image: string
  alt: string
}

// 固定のYouTubeショート動画（4本のみ）
const FIXED_YOUTUBE_SHORTS = [
  {
    id: 1,
    videoId: '3wYTrqoVCm4',
    title: '年収は設計で決まる時代',
  },
  {
    id: 2,
    videoId: 'XQpu0t9mc-Y',
    title: 'SNS自動化の成果事例',
  },
  {
    id: 3,
    videoId: '4dSjOqkQ5zE',
    title: 'AI活用で業務効率化',
  },
  {
    id: 4,
    videoId: 'U4yeXpjm-10',
    title: '香り事故=設計の欠如',
  },
]

// メインスライド画像
const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image: '/images/hero-slide-1.jpg', // 1枚目は背景画像あり
    alt: 'NANDS TECH - AIを操る人へ'
  },
  {
    id: 'slide-2',
    image: '', // テキストベースなので画像なし
    alt: 'NANDS TECH - 法人リスキリング'
  },
  {
    id: 'slide-3',
    image: '', // テキストベースなので画像なし
    alt: 'NANDS TECH - AI駆動開発'
  },
  {
    id: 'slide-4',
    image: '', // YouTubeショート用
    alt: 'SNS自動化動画コレクション'
  }
]

interface HeroImageSliderProps {
  slides?: HeroSlide[]
  youtubeShorts?: any[] // 互換性のため残す（使用しない）
}

export default function HeroImageSlider({ slides = HERO_SLIDES }: HeroImageSliderProps) {
  const { theme } = useTheme()
  const { mode, isIndividual } = useMode()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  // デバッグログ
  useEffect(() => {
    console.log('🎬 HeroImageSlider: mode =', mode, 'isIndividual =', isIndividual)
  }, [mode, isIndividual])

  // クライアントサイドでのみポータルを使用
  useEffect(() => {
    setMounted(true)
  }, [])

  // モーダルを開く
  const openVideoModal = (videoId: string) => {
    setSelectedVideo(videoId)
  }

  // モーダルを閉じる
  const closeVideoModal = () => {
    setSelectedVideo(null)
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 relative">
      <Swiper
        modules={[Pagination, Autoplay, EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        spaceBetween={200}
        initialSlide={0}
        coverflowEffect={{
          rotate: 0,
          stretch: -150,
          depth: 50,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={false}
        className="hero-swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} style={{ width: '1400px', maxWidth: '90vw' }}>
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                width: '100%',
                height: isMobile ? '80vh' : '480px',
                minHeight: isMobile ? '650px' : '480px',
                boxShadow: theme === 'dark'
                  ? '0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 40px rgba(59, 130, 246, 0.08), 0 25px 80px -20px rgba(0, 0, 0, 0.6)'
                  : '0 0 0 1px rgba(0, 0, 0, 0.03), 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* プレースホルダー背景 */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #1a2332 0%, #0d1b2a 100%)'
                    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  boxShadow: theme === 'dark'
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    : 'inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              >
                {/* スライド内容の分岐 */}
                {index === 0 ? (
                  /* 1枚目：メインコピー（背景画像付き） */
                  <>
                    {/* 背景画像（PC版とスマホ版で切り替え） */}
                    <Image
                      src={isMobile ? '/images/hero-slide-1-mobile.jpg' : slide.image}
                      alt={slide.alt}
                      fill
                      className={isMobile ? "object-cover object-center" : "object-cover"}
                      priority
                      sizes="(max-width: 768px) 90vw, 1400px"
                      quality={90}
                    />
                    {/* テキストコンテンツ（左上配置）+ ボタン（左下配置） */}
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={mode}
                        className="relative z-20 w-full h-full flex flex-col justify-between px-6 sm:px-10 pt-8 sm:pt-12 pb-8 sm:pb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* 上部：テキスト */}
                        <div className="text-left">
                        {/* 2026年...を上に */}
                        <p 
                          className="text-base sm:text-base mb-3"
                          style={{ color: '#1a1a1a' }}
                        >
                          {isIndividual ? (
                            <>
                              2026年、生き残るのは
                              <span className="font-medium">「書く人」</span>
                              ではなく
                              <span 
                                className="font-bold"
                                style={{ color: '#0066cc' }}
                              >
                                「設計する人」
                              </span>
                              だ。
                            </>
                          ) : (
                            <>
                              2026年、勝ち残る企業は
                              <span className="font-medium">「人を増やす」</span>
                              のではなく
                              <span 
                                className="font-bold"
                                style={{ color: '#0066cc' }}
                              >
                                「AIを極める」
                              </span>
                              会社だ。
                            </>
                          )}
                        </p>
                        {/* AIを...をその下に */}
                        <h2
                          className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight"
                          style={{
                            fontFamily: "'Noto Sans JP', sans-serif",
                            color: '#1a1a1a',
                            letterSpacing: '-0.02em'
                          }}
                        >
                          {isIndividual ? (
                            <>
                              <span className="block">
                                AIを
                                <span
                                  className="text-transparent bg-clip-text bg-gradient-to-r mx-1 animate-gradient-text"
                                  style={{
                                    backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 20%, #22d3ee 50%, #06b6d4 70%, #a855f7 100%)',
                                    backgroundSize: '200% 200%'
                                  }}
                                >
                                  『使う側』
                                </span>
                                から
                              </span>
                              <span className="block mt-1">
                                <span
                                  className="text-transparent bg-clip-text bg-gradient-to-r animate-gradient-text"
                                  style={{
                                    backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 20%, #22d3ee 50%, #06b6d4 70%, #a855f7 100%)',
                                    backgroundSize: '200% 200%'
                                  }}
                                >
                                  『操る人』
                                </span>
                                へ
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="block">
                                社員を
                                <span
                                  className="text-transparent bg-clip-text bg-gradient-to-r mx-1 animate-gradient-text"
                                  style={{
                                    backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 20%, #22d3ee 50%, #06b6d4 70%, #a855f7 100%)',
                                    backgroundSize: '200% 200%'
                                  }}
                                >
                                  『雇う』
                                </span>
                                から
                              </span>
                              <span className="block mt-1">
                                AIを
                                <span
                                  className="text-transparent bg-clip-text bg-gradient-to-r mx-1 animate-gradient-text"
                                  style={{
                                    backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 20%, #22d3ee 50%, #06b6d4 70%, #a855f7 100%)',
                                    backgroundSize: '200% 200%'
                                  }}
                                >
                                  『構築する』
                                </span>
                                へ
                              </span>
                            </>
                          )}
                        </h2>
                      </div>

                      {/* 下部：CTAボタン（横並び） */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link
                          href="https://lin.ee/s5dmFuD"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-shimmer inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-base sm:text-base transition-all duration-300 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)',
                            color: '#ffffff',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25), 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 rgba(255, 255, 255, 0.15) inset'
                          }}
                        >
                          すぐに無料相談する
                        </Link>
                        <Link
                          href="https://nands.tech/dm-form"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-base sm:text-base transition-all duration-300 hover:scale-105"
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            color: '#1a1a1a',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                          }}
                        >
                          無料で資料請求する
                        </Link>
                      </div>
                    </motion.div>
                    </AnimatePresence>
                  </>
                ) : index === 3 ? (
                  /* 4枚目：SNS自動化（レスポンシブレイアウト） */
                  <div 
                    className="relative z-20 w-full h-full"
                    style={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)'
                    }}
                  >
                    {/* スマホ版レイアウト（~768px）: 縦並び */}
                    <div className="md:hidden flex flex-col justify-between h-full px-6 py-8">
                      {/* 上部：タイトル */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                      >
                        <p 
                          className="text-sm mb-2"
                          style={{ 
                            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                          }}
                        >
                          バズらない成果の出し方
                        </p>
                        <h3
                          className="text-3xl sm:text-2xl font-black leading-tight"
                          style={{ 
                            fontFamily: "'Noto Sans JP', sans-serif",
                            color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
                          }}
                        >
                          <span className="block">SNSを自動化して</span>
                          <span className="block mt-1">
                            <span 
                              className="text-transparent bg-clip-text bg-gradient-to-r"
                              style={{
                                backgroundImage: theme === 'dark'
                                  ? 'linear-gradient(to right, #a855f7, #22d3ee, #a855f7)'
                                  : 'linear-gradient(to right, #7c3aed, #0891b2, #7c3aed)'
                              }}
                            >
                              圧倒的な成果
                            </span>
                            を生む
                          </span>
                        </h3>
                      </motion.div>

                      {/* 中央：動画スライダー */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full"
                      >
                        <Swiper
                          modules={[FreeMode]}
                          spaceBetween={16}
                          slidesPerView={1.8}
                          freeMode={true}
                          className="youtube-shorts-swiper"
                        >
                          {FIXED_YOUTUBE_SHORTS.map((short) => (
                            <SwiperSlide key={short.id}>
                              <button
                                onClick={() => openVideoModal(short.videoId)}
                                className="block group cursor-pointer w-full"
                                aria-label={`${short.title}を再生`}
                              >
                                <div
                                  className="rounded-xl overflow-hidden transition-all duration-300 group-active:scale-95"
                                  style={{
                                    padding: '2px',
                                    background: theme === 'dark'
                                      ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(6, 182, 212, 0.6))'
                                      : 'linear-gradient(135deg, rgba(30, 64, 175, 0.2), rgba(8, 145, 178, 0.2))',
                                    boxShadow: theme === 'dark'
                                      ? '0 4px 15px rgba(0, 0, 0, 0.3)'
                                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                                  }}
                                >
                                  <div
                                    className="relative rounded-[10px] overflow-hidden"
                                    style={{
                                      aspectRatio: '9/16',
                                      width: '100%'
                                    }}
                                  >
                                    <Image
                                      src={`https://img.youtube.com/vi/${short.videoId}/sddefault.jpg`}
                                      alt={short.title}
                                      fill
                                      className="object-cover"
                                      loading="lazy"
                                      sizes="(max-width: 768px) 40vw, 160px"
                                      quality={100}
                                      unoptimized
                                    />
                                    
                                    {/* 再生ボタン */}
                                    <div className="absolute top-2 right-2 z-10">
                                      <div 
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{
                                          background: 'rgba(0, 0, 0, 0.7)',
                                          border: '1.5px solid rgba(255, 255, 255, 0.4)'
                                        }}
                                      >
                                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </div>
                                    </div>

                                    {/* 下部グラデーション */}
                                    <div 
                                      className="absolute bottom-0 left-0 right-0 h-12"
                                      style={{
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                                      }}
                                    />
                                    
                                    {/* タイトル */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2">
                                      <p 
                                        className="text-xs font-medium line-clamp-2 leading-tight"
                                        style={{ color: '#ffffff' }}
                                      >
                                        {short.title}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </motion.div>

                      {/* 下部：ボタン縦並び */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col gap-3"
                      >
                        <Link
                          href="https://lin.ee/s5dmFuD"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-base transition-all duration-300 active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)',
                            color: '#ffffff',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25), 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 rgba(255, 255, 255, 0.15) inset'
                          }}
                        >
                          すぐに無料相談する
                        </Link>
                        <Link
                          href="https://nands.tech/dm-form"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-base transition-all duration-300 active:scale-95"
                          style={{
                            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                            color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                            border: '2px solid #1e3a8a',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          無料で資料請求する
                        </Link>
                      </motion.div>
                    </div>

                    {/* PC版レイアウト（768px~）: 左右分割（現状維持） */}
                    <div className="hidden md:flex items-center h-full px-10">
                      {/* 左側：テキスト + ボタン */}
                      <div className="flex-1 pr-8">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.8 }}
                          className="text-left"
                        >
                          <p 
                            className="text-sm sm:text-base mb-3"
                            style={{ 
                              color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
                            }}
                          >
                            バズらない成果の出し方
                          </p>
                          
                          <h3
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-8"
                            style={{ 
                              fontFamily: "'Noto Sans JP', sans-serif",
                              color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
                            }}
                          >
                            <span className="block">SNSを自動化し</span>
                            <span className="block mt-1">
                              <span 
                                className="text-transparent bg-clip-text bg-gradient-to-r"
                                style={{
                                  backgroundImage: theme === 'dark'
                                    ? 'linear-gradient(to right, #a855f7, #22d3ee, #a855f7)'
                                    : 'linear-gradient(to right, #7c3aed, #0891b2, #7c3aed)'
                                }}
                              >
                                『圧倒的な成果』
                              </span>
                              を生む
                            </span>
                          </h3>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="flex flex-row gap-3"
                          >
                            <Link
                              href="https://lin.ee/s5dmFuD"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105"
                              style={{
                                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)',
                                color: '#ffffff',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25), 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 rgba(255, 255, 255, 0.15) inset'
                              }}
                            >
                              すぐに無料相談する
                            </Link>
                            <Link
                              href="https://nands.tech/dm-form"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105"
                              style={{
                                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                              }}
                            >
                              無料で資料請求する
                            </Link>
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* 右側：4枚の動画を横並び */}
                      <div className="flex-1 flex justify-center items-center">
                        <div className="flex gap-3">
                          {FIXED_YOUTUBE_SHORTS.map((short, shortIndex) => (
                            <button
                              key={short.id}
                              onClick={() => openVideoModal(short.videoId)}
                              className="block group cursor-pointer"
                              aria-label={`${short.title}を再生`}
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: shortIndex * 0.1 }}
                                className="rounded-xl overflow-hidden transition-all duration-500 group-hover:scale-105"
                                style={{
                                  padding: '2px',
                                  background: theme === 'dark'
                                    ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(6, 182, 212, 0.6), rgba(30, 58, 138, 0.6))'
                                    : 'linear-gradient(135deg, rgba(30, 64, 175, 0.2), rgba(8, 145, 178, 0.2), rgba(30, 64, 175, 0.2))',
                                  boxShadow: theme === 'dark'
                                    ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                                    : '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                <div
                                  className="relative rounded-[10px] overflow-hidden"
                                  style={{
                                    width: '160px',
                                    height: '285px'
                                  }}
                                >
                                  <Image
                                    src={`https://img.youtube.com/vi/${short.videoId}/sddefault.jpg`}
                                    alt={short.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                    sizes="320px"
                                    quality={100}
                                    unoptimized
                                  />
                                  
                                  <div className="absolute top-2 right-2 z-10">
                                    <div 
                                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                      style={{
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        border: '1.5px solid rgba(255, 255, 255, 0.4)'
                                      }}
                                    >
                                      <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                  </div>

                                  <div 
                                    className="absolute bottom-0 left-0 right-0 h-16"
                                    style={{
                                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                                    }}
                                  />
                                  
                                  <div className="absolute bottom-0 left-0 right-0 p-2">
                                    <p 
                                      className="text-xs font-medium line-clamp-2 leading-tight"
                                      style={{ color: '#ffffff' }}
                                    >
                                      {short.title}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : index === 1 ? (
                  /* 2枚目：法人リスキリング（レスポンシブレイアウト） */
                  <div className="relative z-20 w-full h-full">
                    {/* スマホ版レイアウト（~1024px）: テキスト → アイコン → ボタン */}
                    <div className="lg:hidden flex flex-col justify-between h-full px-6 py-8">
                      {/* 上部：テキスト */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                      >
                        <p 
                          className="text-sm mb-2"
                          style={{ 
                            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                          }}
                        >
                          社員の
                        </p>
                        
                        <h3
                          className="text-3xl sm:text-2xl font-black leading-tight mb-2"
                          style={{ 
                            fontFamily: "'Noto Sans JP', sans-serif",
                            color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
                          }}
                        >
                          <span 
                            className="text-transparent bg-clip-text bg-gradient-to-r"
                            style={{
                              backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 20%, #22d3ee 50%, #06b6d4 70%, #a855f7 100%)'
                            }}
                          >
                            法人リスキリング
                          </span>
                        </h3>
                        
                        <p 
                          className="text-base mb-2"
                          style={{ 
                            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                          }}
                        >
                          カスタマイズ研修可能
                        </p>
                        
                        <p 
                          className="text-lg sm:text-lg mb-1"
                          style={{ 
                            color: theme === 'dark' ? '#ffffff' : '#1a1a1a'
                          }}
                        >
                          1人1日333円から
                        </p>
                        
                        <p 
                          className="text-base font-semibold"
                          style={{ 
                            color: '#a855f7'
                          }}
                        >
                          AIを基礎から学習
                        </p>
                      </motion.div>

                      {/* 中央：LLMアイコン */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
                          {/* ChatGPT */}
                          <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #10a37f 0%, #1a7f64 100%)', boxShadow: '0 6px 20px rgba(16, 163, 127, 0.3)' }}>
                                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07z"/>
                                </svg>
                              </div>
                              <span className="text-[10px] font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>ChatGPT</span>
                            </motion.div>
                          </a>

                          {/* Gemini */}
                          <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #4285f4 0%, #ea4335 50%, #fbbc05 100%)', boxShadow: '0 6px 20px rgba(66, 133, 244, 0.3)' }}>
                                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 3.6c4.64 0 8.4 3.76 8.4 8.4s-3.76 8.4-8.4 8.4-8.4-3.76-8.4-8.4 3.76-8.4 8.4-8.4z"/>
                                </svg>
                              </div>
                              <span className="text-[10px] font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Gemini</span>
                            </motion.div>
                          </a>

                          {/* Claude */}
                          <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #cc785c 0%, #d4a574 100%)', boxShadow: '0 6px 20px rgba(204, 120, 92, 0.3)' }}>
                                <span className="text-xl font-bold text-white">C</span>
                              </div>
                              <span className="text-[10px] font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Claude</span>
                            </motion.div>
                          </a>

                          {/* Genspark */}
                          <a href="https://www.genspark.ai/" target="_blank" rel="noopener noreferrer">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)' }}>
                                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                              </div>
                              <span className="text-[10px] font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Genspark</span>
                            </motion.div>
                          </a>

                          {/* Manus */}
                          <a href="https://manus.im/" target="_blank" rel="noopener noreferrer">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', boxShadow: '0 6px 20px rgba(14, 165, 233, 0.3)' }}>
                                <span className="text-xl font-bold text-white">M</span>
                              </div>
                              <span className="text-[10px] font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Manus</span>
                            </motion.div>
                          </a>
                        </div>
                        
                        <p className="text-center text-xs max-w-xs" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                          ChatGPT・Gemini・Claude など<br /><span className="font-semibold" style={{ color: '#a855f7' }}>LLMの基礎から学習</span>
                        </p>
                      </motion.div>

                      {/* 下部：ボタン縦並び */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col gap-3"
                      >
                        <Link href="https://lin.ee/s5dmFuD" target="_blank" rel="noopener noreferrer">
                          <motion.div
                            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-bold text-base transition-all duration-300"
                            style={{
                              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)',
                              color: '#ffffff',
                              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25), 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 rgba(255, 255, 255, 0.15) inset'
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            すぐに無料相談する
                          </motion.div>
                        </Link>
                        <Link href="https://nands.tech/dm-form" target="_blank" rel="noopener noreferrer">
                          <motion.div
                            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-bold text-base transition-all duration-300"
                            style={{
                              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            無料で資料請求する
                          </motion.div>
                        </Link>
                      </motion.div>
                    </div>

                    {/* PC版レイアウト（1024px~）: 左右分割（現状維持） */}
                    <div className="hidden lg:flex items-center justify-between h-full px-10">
                      {/* 左側：テキストコンテンツ */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-left w-1/2 pr-8"
                      >
                        <p className="text-sm sm:text-base mb-3" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>社員の</p>
                        
                        <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4"
                          style={{ fontFamily: "'Noto Sans JP', sans-serif", color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r"
                            style={{ backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 20%, #22d3ee 50%, #06b6d4 70%, #a855f7 100%)' }}>
                            法人リスキリング
                          </span>
                          <span className="block mt-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl">1人1日333円から</span>
                        </h3>
                        
                        <p className="text-base sm:text-lg mb-2" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)' }}>
                          カスタマイズ研修可能
                        </p>
                        <p className="text-lg sm:text-xl font-semibold mb-8" style={{ color: '#a855f7' }}>
                          AIを基礎から学習
                        </p>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                          className="flex flex-row gap-3 sm:gap-4">
                          <Link href="https://lin.ee/s5dmFuD" target="_blank" rel="noopener noreferrer">
                            <motion.div className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-300"
                              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)', color: '#ffffff', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25), 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 rgba(255, 255, 255, 0.15) inset' }}
                              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)" }} whileTap={{ scale: 0.95 }}>
                              すぐに無料相談する
                            </motion.div>
                          </Link>
                          <Link href="https://nands.tech/dm-form" target="_blank" rel="noopener noreferrer">
                            <motion.div className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-300"
                              style={{ background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)', color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '2px solid #1e3a8a', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
                              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }} whileTap={{ scale: 0.95 }}>
                              無料で資料請求する
                            </motion.div>
                          </Link>
                        </motion.div>
                      </motion.div>

                      {/* 右側：LLMアイコンビジュアル */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-1/2 flex flex-col items-center justify-center"
                      >
                        {/* LLMアイコン群 */}
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
                          {/* ChatGPT */}
                          <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer" className="block">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #10a37f 0%, #1a7f64 100%)', boxShadow: '0 10px 30px rgba(16, 163, 127, 0.3)' }}>
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07z"/>
                                </svg>
                              </div>
                              <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>ChatGPT</span>
                            </motion.div>
                          </a>

                          {/* Gemini */}
                          <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="block">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #4285f4 0%, #ea4335 50%, #fbbc05 100%)', boxShadow: '0 10px 30px rgba(66, 133, 244, 0.3)' }}>
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 3.6c4.64 0 8.4 3.76 8.4 8.4s-3.76 8.4-8.4 8.4-8.4-3.76-8.4-8.4 3.76-8.4 8.4-8.4z"/>
                                </svg>
                              </div>
                              <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Gemini</span>
                            </motion.div>
                          </a>

                          {/* Claude */}
                          <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer" className="block">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #cc785c 0%, #d4a574 100%)', boxShadow: '0 10px 30px rgba(204, 120, 92, 0.3)' }}>
                                <span className="text-2xl sm:text-3xl font-bold text-white">C</span>
                              </div>
                              <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Claude</span>
                            </motion.div>
                          </a>

                          {/* Genspark */}
                          <a href="https://www.genspark.ai/" target="_blank" rel="noopener noreferrer" className="block">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}>
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                              </div>
                              <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Genspark</span>
                            </motion.div>
                          </a>

                          {/* Manus */}
                          <a href="https://manus.im/" target="_blank" rel="noopener noreferrer" className="block">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)' }}>
                                <span className="text-2xl sm:text-3xl font-bold text-white">M</span>
                              </div>
                              <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Manus</span>
                            </motion.div>
                          </a>
                        </div>

                        {/* 説明テキスト */}
                        <p className="text-center text-sm sm:text-base max-w-sm"
                          style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)' }}>
                          ChatGPT・Gemini・Claude・Genspark・Manus など<br />
                          <span className="font-semibold" style={{ color: '#a855f7' }}>LLMの基礎から学習</span>できます
                        </p>
                      </motion.div>
                    </div>
                  </div>
                ) : index === 2 ? (
                  /* 3枚目：AI駆動開発（レスポンシブレイアウト） */
                  <div className="relative z-20 w-full h-full">
                    {/* スマホ版レイアウト（~1024px）: テキスト → アイコン → ボタン */}
                    <div className="lg:hidden flex flex-col justify-between h-full px-6 py-8">
                      {/* 上部：テキスト */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                      >
                        <p className="text-sm mb-2" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                          全自動化を目指すなら
                        </p>
                        <h3 className="text-3xl sm:text-2xl font-black leading-tight mb-2"
                          style={{ fontFamily: "'Noto Sans JP', sans-serif", color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r"
                            style={{ backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 20%, #22d3ee 50%, #06b6d4 70%, #a855f7 100%)' }}>
                            AI駆動開発
                          </span>
                        </h3>
                        <p className="text-base mb-2" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                          カスタマイズ研修可能
                        </p>
                        <p className="text-base font-semibold" style={{ color: '#a855f7' }}>
                          全自動化AIアーキテクト
                        </p>
                      </motion.div>

                      {/* 中央：AI開発ツールアイコン */}
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col items-center">
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
                          {/* Cursor */}
                          <a href="https://cursor.sh/" target="_blank" rel="noopener noreferrer">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)' }}>
                                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#22d3ee" strokeWidth="2"/>
                                  <path d="M7 8h10M7 12h6M7 16h8" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </div>
                              <span className="text-[10px] font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Cursor</span>
                            </motion.div>
                          </a>

                          {/* MCP */}
                          <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-lg"
                              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)' }}>
                              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="3" fill="#3b82f6"/>
                                <circle cx="12" cy="4" r="2" fill="#22d3ee"/>
                                <circle cx="12" cy="20" r="2" fill="#22d3ee"/>
                                <circle cx="4" cy="12" r="2" fill="#22d3ee"/>
                                <circle cx="20" cy="12" r="2" fill="#22d3ee"/>
                                <path d="M12 6v3M12 15v3M6 12h3M15 12h3" stroke="#3b82f6" strokeWidth="2"/>
                              </svg>
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>MCP</span>
                          </motion.div>

                          {/* Mastra */}
                          <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-lg"
                              style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', boxShadow: '0 6px 20px rgba(168, 85, 247, 0.3)' }}>
                              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#a855f7"/>
                                <path d="M2 17l10 5 10-5" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M2 12l10 5 10-5" stroke="#e879f9" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Mastra</span>
                          </motion.div>

                          {/* Akool */}
                          <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 shadow-lg"
                              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', boxShadow: '0 6px 20px rgba(236, 72, 153, 0.3)' }}>
                              <span className="text-lg font-bold text-white">Ak</span>
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Akool</span>
                          </motion.div>
                        </div>
                        <p className="text-center text-xs max-w-xs" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                          Cursor・MCP・Mastra など<br /><span className="font-semibold" style={{ color: '#a855f7' }}>最新AI開発ツール</span>を活用
                        </p>
                      </motion.div>

                      {/* 下部：ボタン縦並び */}
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col gap-3">
                        <Link href="https://lin.ee/s5dmFuD" target="_blank" rel="noopener noreferrer">
                          <motion.div className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-bold text-base transition-all duration-300"
                            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)', color: '#ffffff', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25), 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 rgba(255, 255, 255, 0.15) inset' }}
                            whileTap={{ scale: 0.95 }}>
                            すぐに無料相談する
                          </motion.div>
                        </Link>
                        <Link href="https://nands.tech/dm-form" target="_blank" rel="noopener noreferrer">
                          <motion.div className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-bold text-base transition-all duration-300"
                            style={{ background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)', color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '2px solid #1e3a8a', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
                            whileTap={{ scale: 0.95 }}>
                            無料で資料請求する
                          </motion.div>
                        </Link>
                      </motion.div>
                    </div>

                    {/* PC版レイアウト（1024px~）: 左右分割（現状維持） */}
                    <div className="hidden lg:flex items-center justify-between h-full px-10">
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
                        className="text-left w-1/2 pr-8">
                        <p className="text-sm sm:text-base mb-3" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>全自動化を目指すなら</p>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4"
                          style={{ fontFamily: "'Noto Sans JP', sans-serif", color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r"
                            style={{ backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 20%, #22d3ee 50%, #06b6d4 70%, #a855f7 100%)' }}>AI駆動開発</span>
                        </h3>
                        <p className="text-base sm:text-lg mb-2" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)' }}>カスタマイズ研修可能</p>
                        <p className="text-lg sm:text-xl font-semibold mb-8" style={{ color: '#a855f7' }}>全自動化AIアーキテクト</p>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-row gap-3 sm:gap-4">
                          <Link href="https://lin.ee/s5dmFuD" target="_blank" rel="noopener noreferrer">
                            <motion.div className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-300"
                              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)', color: '#ffffff', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25), 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 rgba(255, 255, 255, 0.15) inset' }}
                              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)" }} whileTap={{ scale: 0.95 }}>
                              すぐに無料相談する
                            </motion.div>
                          </Link>
                          <Link href="https://nands.tech/dm-form" target="_blank" rel="noopener noreferrer">
                            <motion.div className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-300"
                              style={{ background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)', color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '2px solid #1e3a8a', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
                              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }} whileTap={{ scale: 0.95 }}>
                              無料で資料請求する
                            </motion.div>
                          </Link>
                        </motion.div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-1/2 flex flex-col items-center justify-center">
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
                          <a href="https://cursor.sh/" target="_blank" rel="noopener noreferrer" className="block">
                            <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center cursor-pointer">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }}>
                                <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none">
                                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#22d3ee" strokeWidth="2"/>
                                  <path d="M7 8h10M7 12h6M7 16h8" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </div>
                              <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Cursor</span>
                            </motion.div>
                          </a>
                          <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}>
                              <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="3" fill="#3b82f6"/>
                                <circle cx="12" cy="4" r="2" fill="#22d3ee"/>
                                <circle cx="12" cy="20" r="2" fill="#22d3ee"/>
                                <circle cx="4" cy="12" r="2" fill="#22d3ee"/>
                                <circle cx="20" cy="12" r="2" fill="#22d3ee"/>
                                <path d="M12 6v3M12 15v3M6 12h3M15 12h3" stroke="#3b82f6" strokeWidth="2"/>
                              </svg>
                            </div>
                            <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>MCP</span>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                              style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)' }}>
                              <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#a855f7"/>
                                <path d="M2 17l10 5 10-5" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M2 12l10 5 10-5" stroke="#e879f9" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Mastra</span>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex flex-col items-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)' }}>
                              <span className="text-xl sm:text-2xl font-bold text-white">Ak</span>
                            </div>
                            <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}>Akool</span>
                          </motion.div>
                        </div>
                        <p className="text-center text-sm sm:text-base max-w-sm" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)' }}>
                          Cursor・MCP・Mastra・Akool など<br /><span className="font-semibold" style={{ color: '#a855f7' }}>最新AI開発ツール</span>を活用
                        </p>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  /* プレースホルダー */
                  <div className="text-center">
                    <div 
                      className="text-6xl mb-4"
                      style={{ opacity: 0.3 }}
                    >
                      🖼️
                    </div>
                    <p 
                      className="text-lg font-mono"
                      style={{ 
                        color: theme === 'dark' ? '#6b7280' : '#9ca3af'
                      }}
                    >
                      1400 × 480px
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Swiper用カスタムスタイル */}
      <style jsx global>{`
        .hero-swiper {
          padding: 40px 0;
          overflow: visible;
        }

        .hero-swiper .swiper-slide {
          opacity: 1;
          transition: transform 0.3s ease;
        }

        .hero-swiper .swiper-pagination {
          bottom: 0;
        }

        .hero-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: ${theme === 'dark' ? '#ffffff' : '#1a1a1a'};
          opacity: 0.3;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .hero-swiper .swiper-pagination-bullet-active {
          width: 24px;
          opacity: 1;
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        /* YouTube Shorts スワイパー用スタイル */
        .youtube-shorts-swiper {
          padding: 0;
          overflow: visible;
        }

        .youtube-shorts-swiper .swiper-slide {
          height: auto;
        }
      `}</style>

      {/* 動画モーダル（最前面・Portalでbodyに直接レンダリング） */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 999999 }}
              onClick={closeVideoModal}
            >
            {/* 背景オーバーレイ */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(8px)'
              }}
            />

            {/* 動画コンテナ */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* YouTube埋め込み（Shorts用縦長） */}
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  aspectRatio: '9/16',
                  background: '#000'
                }}
              >
                {/* 閉じるボタン（動画内側の右上） */}
                <button
                  onClick={closeVideoModal}
                  className="absolute top-3 right-3 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  aria-label="閉じる"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&loop=1&playlist=${selectedVideo}&controls=1&rel=0&modestbranding=1`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  )
}

