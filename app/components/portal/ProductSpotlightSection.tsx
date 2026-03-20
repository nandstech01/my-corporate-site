'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useMode } from './ModeContext'
import { useTheme } from './ThemeContext'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

interface ProductCard {
  id: string
  title: string
  subtitle: string
  badges: string[]
  ctaText: string
  ctaHref: string
  accentGradient: string
  accentColor: string
  iconSvg: React.ReactNode
}

const SYSTEM_DEV_CARD: ProductCard = {
  id: 'product-system-dev',
  title: 'AI搭載システム開発',
  subtitle: '費用最大70%OFF・IT導入補助金対応',
  badges: ['無料AIシミュレーション', '要件定義〜納品一貫', 'IT補助金対応'],
  ctaText: '無料シミュレーション',
  ctaHref: '/system-dev-lp',
  accentGradient: 'linear-gradient(135deg, #0A1628 0%, #0F172A 50%, #1E293B 100%)',
  accentColor: '#06B6D4',
  iconSvg: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
}

const CLAVI_CARD: ProductCard = {
  id: 'product-clavi',
  title: 'CLAVI - AI検索最適化',
  subtitle: 'ChatGPT・Gemini・Perplexityに見つかる鍵',
  badges: ['14日間無料', 'Schema.org 16.0準拠', 'ダッシュボード付き'],
  ctaText: '今すぐ無料分析',
  ctaHref: '/clavi',
  accentGradient: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E293B 100%)',
  accentColor: '#2563EB',
  iconSvg: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
}

export default function ProductSpotlightSection() {
  const { isIndividual } = useMode()
  const { theme } = useTheme()

  const cards = isIndividual
    ? [CLAVI_CARD, SYSTEM_DEV_CARD]
    : [SYSTEM_DEV_CARD, CLAVI_CARD]

  return (
    <section
      className="py-24 sm:py-32"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #0A1628 0%, #0D1117 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      }}
      aria-label="プロダクト"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-4"
            style={{ color: theme === 'dark' ? '#06B6D4' : '#0891b2' }}
          >
            Products
          </p>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            {isIndividual ? 'AIで差をつける' : 'ビジネスを加速する'}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            {isIndividual
              ? 'AI検索で見つかるサイトと、コスト最適化されたシステム開発'
              : 'IT補助金対応のシステム開発と、AI検索時代のデジタル戦略'}
          </p>
        </motion.div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isIndividual ? 'individual' : 'corporate'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* PC: 2-column grid */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
              {cards.map((card) => (
                <SpotlightCard key={card.id} card={card} theme={theme} />
              ))}
            </div>

            {/* Mobile: Swiper slider */}
            <div className="lg:hidden">
              <Swiper
                modules={[Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                pagination={{ clickable: true }}
                className="product-swiper"
                style={{ paddingBottom: '50px' }}
              >
                {cards.map((card) => (
                  <SwiperSlide key={card.id}>
                    <SpotlightCard card={card} theme={theme} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <style jsx global>{`
              .product-swiper .swiper-pagination-bullet {
                background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
                opacity: 1;
              }
              .product-swiper .swiper-pagination-bullet-active {
                background: ${theme === 'dark' ? '#06B6D4' : '#0891b2'};
              }
            `}</style>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

interface SpotlightCardProps {
  card: ProductCard
  theme: 'light' | 'dark'
}

function SpotlightCard({ card, theme }: SpotlightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: theme === 'dark' ? card.accentGradient : '#ffffff',
        border: theme === 'dark'
          ? `1px solid ${card.accentColor}20`
          : '1px solid #e5e7eb',
        boxShadow: theme === 'dark'
          ? `0 0 40px ${card.accentColor}08, 0 25px 50px -12px rgba(0, 0, 0, 0.4)`
          : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${card.accentColor}, transparent)`,
        }}
      />

      <div className="p-8 lg:p-10 flex flex-col h-full">
        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: theme === 'dark'
                ? `${card.accentColor}15`
                : `${card.accentColor}10`,
              border: `1px solid ${card.accentColor}30`,
            }}
          >
            {card.iconSvg}
          </div>
          <div>
            <h3
              className="text-2xl lg:text-3xl font-bold leading-tight"
              style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
            >
              {card.title}
            </h3>
            <p
              className="text-base mt-1"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              {card.subtitle}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-8">
          {card.badges.map((badge) => (
            <span
              key={badge}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: theme === 'dark'
                  ? `${card.accentColor}15`
                  : `${card.accentColor}08`,
                color: card.accentColor,
                border: `1px solid ${card.accentColor}30`,
              }}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Link
            href={card.ctaHref}
            className="group inline-flex items-center justify-center w-full px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${card.accentColor}, ${card.accentColor}cc)`,
              color: '#ffffff',
              boxShadow: `0 4px 15px ${card.accentColor}40`,
            }}
          >
            {card.ctaText}
            <svg
              className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
