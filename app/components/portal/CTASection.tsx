'use client'

/**
 * CTASection - 行動喚起セクション
 * 
 * Apple風カード2枚デザイン
 * 個人/法人モードに応じて異なるCTAを表示
 * PC: 横並び2カラム / スマホ: スライド表示
 */

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useMode } from './ModeContext'
import { useTheme } from './ThemeContext'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

export default function CTASection() {
  const { mode, isIndividual } = useMode()
  const { theme } = useTheme()

  return (
    <section 
      className="py-24 sm:py-32"
      style={{
        background: theme === 'dark' ? '#0A1628' : '#ffffff'
      }}
      aria-label="次のステップへ"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションタイトル（中央揃え） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p 
            className="text-sm font-semibold tracking-widest uppercase mb-4"
            style={{ color: theme === 'dark' ? '#a855f7' : '#7c3aed' }}
          >
            Next Step
          </p>
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            次のステップへ
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            {isIndividual 
              ? 'ブログでは言えない「生存戦略ロードマップ」をLINE限定で配布中。'
              : '御社のAI課題を、技術者が直接ヒアリングします。'}
          </p>
        </motion.div>

        {/* カード2枚 */}
        <AnimatePresence mode="wait">
          {isIndividual ? (
            <IndividualCTACards key="individual" />
          ) : (
            <CorporateCTACards key="corporate" />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/**
 * 個人向けCTAカード（2枚）
 */
function IndividualCTACards() {
  const { theme } = useTheme()
  
  const cards = [
    {
      label: "LINE限定",
      title: "裏カリキュラム",
      subtitle: "無料配布中",
      description: "ブログでは言えない「生存戦略ロードマップ」をLINE限定で配布。AIアーキテクトへの最短ルートを公開します。",
      features: [
        '生存戦略ロードマップ',
        '最新AI動向アップデート',
        '質問し放題サポート'
      ],
      ctaText: "LINEで受け取る",
      ctaUrl: "https://lin.ee/s5dmFuD",
      accentColor: theme === 'dark' ? '#22c55e' : '#16a34a',
      isExternal: true
    },
    {
      label: "個別相談",
      title: "キャリア相談",
      subtitle: "無料",
      description: "2026年を生き残るためのキャリア戦略を、AIアーキテクトが直接アドバイス。あなたに合った学習ロードマップを作成します。",
      features: [
        '現状スキルの棚卸し',
        '最適な学習プラン提案',
        'AI時代のキャリア設計'
      ],
      ctaText: "無料で相談する",
      ctaUrl: "https://lin.ee/s5dmFuD",
      accentColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
      isExternal: true
    }
  ]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* PC版: 横並び2カラム */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
        {cards.map((card, index) => (
          <CTACard key={index} theme={theme} {...card} />
        ))}
      </div>

      {/* スマホ版: スライダー */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="cta-swiper"
          style={{ paddingBottom: '50px' }}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <CTACard theme={theme} {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .cta-swiper .swiper-pagination-bullet {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          opacity: 1;
        }
        .cta-swiper .swiper-pagination-bullet-active {
          background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
        }
      `}</style>
    </motion.div>
  )
}

/**
 * 法人向けCTAカード（2枚）
 */
function CorporateCTACards() {
  const { theme } = useTheme()
  
  const cards = [
    {
      label: "技術相談",
      title: "AIアーキテクト",
      subtitle: "直接対応",
      description: "御社のAI課題を、営業マンではなく技術者が直接ヒアリング。技術的な本質を議論し、最適なソリューションを提案します。",
      features: [
        '現状課題のヒアリング',
        '技術的な解決策の提案',
        '概算見積もりの作成'
      ],
      ctaText: "すぐに無料相談",
      ctaUrl: "https://lin.ee/s5dmFuD",
      accentColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
      isExternal: true
    },
    {
      label: "資料請求",
      title: "サービス資料",
      subtitle: "無料",
      description: "AI導入事例、料金プラン、助成金活用方法などをまとめた資料をお送りします。社内検討にお役立てください。",
      features: [
        'AI導入事例集',
        '料金プラン詳細',
        '助成金活用ガイド'
      ],
      ctaText: "無料で資料請求",
      ctaUrl: "https://nands.tech/dm-form",
      accentColor: theme === 'dark' ? '#22d3ee' : '#0891b2',
      isExternal: true
    }
  ]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* PC版: 横並び2カラム */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
        {cards.map((card, index) => (
          <CTACard key={index} theme={theme} {...card} />
        ))}
      </div>

      {/* スマホ版: スライダー */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="cta-swiper"
          style={{ paddingBottom: '50px' }}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <CTACard theme={theme} {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .cta-swiper .swiper-pagination-bullet {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          opacity: 1;
        }
        .cta-swiper .swiper-pagination-bullet-active {
          background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
        }
      `}</style>
    </motion.div>
  )
}

/**
 * 再利用可能なCTAカードコンポーネント（Apple風）
 */
interface CTACardProps {
  theme: 'light' | 'dark'
  label: string
  title: string
  subtitle: string
  description: string
  features: string[]
  ctaText: string
  ctaUrl: string
  accentColor: string
  isExternal?: boolean
}

function CTACard({
  theme,
  label,
  title,
  subtitle,
  description,
  features,
  ctaText,
  ctaUrl,
  accentColor,
  isExternal = false
}: CTACardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-3xl p-8 lg:p-10
        ${theme === 'dark' 
          ? 'bg-gray-900/50 border border-gray-800' 
          : 'bg-gray-50 border border-gray-200'
        }
        shadow-xl hover:shadow-2xl transition-all duration-300
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
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105"
          style={{ 
            background: accentColor,
            color: '#ffffff'
          }}
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
    </motion.div>
  )
}
