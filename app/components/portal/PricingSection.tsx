'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useMode } from './ModeContext'
import { useTheme } from './ThemeContext'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

/**
 * PricingSection
 * 価格・助成金セクション - Apple風カード2枚デザイン
 * モード（個人/法人）で内容が切り替わる
 * PC: 横並び2カラム / スマホ: スライド表示
 */
export default function PricingSection() {
  const { isIndividual } = useMode()
  const { theme } = useTheme()

  return (
    <section 
      className="py-24 sm:py-32"
      style={{
        background: theme === 'dark' ? '#0A1628' : '#ffffff'
      }}
      aria-label="価格・プラン"
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
            style={{ color: theme === 'dark' ? '#22c55e' : '#16a34a' }}
          >
            Pricing
          </p>
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            {isIndividual ? '生存戦略プラン' : '法人導入プラン'}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            {isIndividual 
              ? '1日333円で、一生食いっぱぐれない「設計力」を。'
              : '人材開発助成金で、国が75%負担。1人1日333円から。'}
          </p>
        </motion.div>

        {/* カード2枚 */}
        <AnimatePresence mode="wait">
          {isIndividual ? (
            <IndividualPricingCards key="individual" />
          ) : (
            <CorporatePricingCards key="corporate" />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/**
 * 個人向け価格カード（2枚）
 */
function IndividualPricingCards() {
  const { theme } = useTheme()
  
  const cards = [
    {
      id: 'pricing-individual-main',
      label: "MAIN PLAN",
      title: "1日 333円",
      subtitle: "生存戦略プラン",
      price: "180,000",
      priceUnit: "円（税込）",
      priceNote: "18ヶ月分割で1日333円",
      features: [
        'Cursor 2.0 完全習得',
        'AIアーキテクト養成',
        'Vector Link構造化設計',
        '6ヶ月で実務レベル到達'
      ],
      highlight: "コーダーからアーキテクトへ。",
      ctaText: "LINEで無料相談",
      ctaUrl: "https://lin.ee/s5dmFuD",
      accentColor: theme === 'dark' ? '#22c55e' : '#16a34a',
      fragmentTitle: '個人向けメインプラン - 1日333円で生存戦略',
      fragmentDescription: 'Cursor 2.0完全習得、AIアーキテクト養成、Vector Link構造化設計。6ヶ月で実務レベル到達。1日333円で、一生食いっぱぐれない設計力を。コーダーからアーキテクトへ。'
    },
    {
      id: 'pricing-individual-bonus',
      label: "BONUS",
      title: "裏カリキュラム",
      subtitle: "LINE限定特典",
      price: "無料",
      priceUnit: "",
      priceNote: "友だち追加で即時配布",
      features: [
        '生存戦略ロードマップ',
        'ブログでは言えない本音',
        '最新AI動向アップデート',
        '質問し放題サポート'
      ],
      highlight: "2026年を生き残るための全て。",
      ctaText: "特典を受け取る",
      ctaUrl: "https://lin.ee/s5dmFuD",
      accentColor: theme === 'dark' ? '#a855f7' : '#7c3aed',
      fragmentTitle: '個人向け裏カリキュラム - LINE限定特典（無料）',
      fragmentDescription: '生存戦略ロードマップ、ブログでは言えない本音、最新AI動向アップデート、質問し放題サポート。2026年を生き残るための全て。LINE友だち追加で即時配布。'
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
          <PricingCard key={index} theme={theme} {...card} />
        ))}
      </div>

      {/* スマホ版: スライダー */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="pricing-swiper"
          style={{ paddingBottom: '50px' }}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <PricingCard theme={theme} {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .pricing-swiper .swiper-pagination-bullet {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          opacity: 1;
        }
        .pricing-swiper .swiper-pagination-bullet-active {
          background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
        }
      `}</style>
    </motion.div>
  )
}

/**
 * 法人向け価格カード（2枚）
 */
function CorporatePricingCards() {
  const { theme } = useTheme()
  
  const cards = [
    {
      id: 'pricing-corporate-main',
      label: "🏛️ 人材開発助成金対象",
      title: "実質1人1日 333円",
      subtitle: "6ヶ月コース",
      price: "60,000",
      priceUnit: "円/人（税込）",
      priceNote: "正規240,000円 → 国が75%負担",
      features: [
        '国が認めたプログラム',
        '人材開発助成金プログラム',
        '助成金申請サポート付き',
        '社員のAIリスキリング',
        '法人向けカスタマイズ可能'
      ],
      highlight: "1日333円で社員をAIアーキテクトに。",
      ctaText: "無料で資料請求",
      ctaUrl: "https://nands.tech/dm-form",
      accentColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
      fragmentTitle: '法人向けメインプラン - 実質1人1日333円（助成金活用）',
      fragmentDescription: '人材開発助成金対象。正規240,000円→国が75%負担で実質60,000円/人。国が認めたプログラム。助成金申請サポート付き。社員のAIリスキリング、法人向けカスタマイズ可能。1日333円で社員をAIアーキテクトに。'
    },
    {
      id: 'pricing-corporate-support',
      label: "SUPPORT",
      title: "AIアーキテクト",
      subtitle: "直接対応",
      price: "無料",
      priceUnit: "技術相談",
      priceNote: "営業マンではなく技術者が対応",
      features: [
        '企業OS設計コンサルティング',
        'Vector Link導入支援',
        'RAG・Agent構築サポート',
        '継続的な技術顧問'
      ],
      highlight: "設計から運用まで伴走します。",
      ctaText: "すぐに無料相談",
      ctaUrl: "https://lin.ee/s5dmFuD",
      accentColor: theme === 'dark' ? '#22d3ee' : '#0891b2',
      fragmentTitle: '法人向けサポート - AIアーキテクト直接対応（無料相談）',
      fragmentDescription: '企業OS設計コンサルティング、Vector Link導入支援、RAG・Agent構築サポート、継続的な技術顧問。営業マンではなく技術者が対応。設計から運用まで伴走します。無料技術相談。'
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
          <PricingCard key={index} theme={theme} {...card} />
        ))}
      </div>

      {/* スマホ版: スライダー */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="pricing-swiper"
          style={{ paddingBottom: '50px' }}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <PricingCard theme={theme} {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .pricing-swiper .swiper-pagination-bullet {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          opacity: 1;
        }
        .pricing-swiper .swiper-pagination-bullet-active {
          background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
        }
      `}</style>
    </motion.div>
  )
}

/**
 * 再利用可能な価格カードコンポーネント（Apple風）
 */
interface PricingCardProps {
  theme: 'light' | 'dark'
  id: string
  label: string
  title: string
  subtitle: string
  price: string
  priceUnit: string
  priceNote: string
  features: string[]
  highlight: string
  ctaText: string
  ctaUrl: string
  accentColor: string
  fragmentTitle: string
  fragmentDescription: string
}

function PricingCard({
  theme,
  id,
  label,
  title,
  subtitle,
  price,
  priceUnit,
  priceNote,
  features,
  highlight,
  ctaText,
  ctaUrl,
  accentColor,
  fragmentTitle,
  fragmentDescription
}: PricingCardProps) {
  return (
    <motion.div
      id={id}
      data-fragment-id={id}
      data-fragment-title={fragmentTitle}
      data-fragment-description={fragmentDescription}
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

        {/* 価格 */}
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

        {/* 価格詳細 */}
        <div 
          className={`
            p-4 rounded-lg mb-6
            ${theme === 'dark' 
              ? 'bg-gray-800/50' 
              : 'bg-white border border-gray-200'
            }
          `}
        >
          <p 
            className="text-2xl font-bold"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            {price}<span className="text-sm font-normal" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>{priceUnit}</span>
          </p>
          <p 
            className="text-sm"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            {priceNote}
          </p>
        </div>

        {/* 機能リスト */}
        <ul className="space-y-3 mb-6 flex-grow">
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

        {/* ハイライト */}
        <div 
          className={`
            p-4 rounded-lg mb-6
            ${theme === 'dark' 
              ? 'bg-gray-800/80 border border-gray-700' 
              : 'bg-white border border-gray-200'
            }
          `}
        >
          <p 
            className="text-sm lg:text-base font-semibold"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            💡 {highlight}
          </p>
        </div>

        {/* CTAボタン */}
        <Link
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105"
          style={{ 
            background: accentColor,
            color: '#ffffff'
          }}
        >
          {ctaText}
        </Link>
      </div>
    </motion.div>
  )
}
