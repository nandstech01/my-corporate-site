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
 * ProblemSection
 * 課題提起セクション - Apple風カードデザイン
 * モード（個人/法人）で内容が切り替わる
 * 2枚のカードを横並びで表示（PC）/ スライド表示（スマホ）
 */
export default function ProblemSection() {
  const { mode, isIndividual } = useMode()
  const { theme } = useTheme()

  return (
    <section 
      className="py-24 sm:py-32"
      style={{
        background: theme === 'dark' ? '#0A1628' : '#ffffff'
      }}
      aria-label="課題提起"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatePresence mode="wait">
          {isIndividual ? (
            <IndividualProblemCards key="individual" />
          ) : (
            <CorporateProblemCards key="corporate" />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/**
 * 個人向け課題提起カード（2枚）
 */
function IndividualProblemCards() {
  const { theme } = useTheme()
  
  const cards = [
    {
      title: "2026年、そのコードは",
      subtitle: "AIが1秒で書く。",
      description: "GitHub Copilot、Devin、Claude... 「作る」だけのエンジニアの価値は暴落しています。今必要なのは、AIを部下として指揮し、システム全体を俯瞰する「設計力」です。",
      highlight: "あなたのライバルは人間ではなく、月額20ドルのAIです。",
      linkUrl: "https://nands.tech/posts/ai--949889",
      linkText: "AIキャリアを読む",
      gradient: theme === 'dark' ? 'from-purple-900/20 to-cyan-900/20' : 'from-purple-50 to-cyan-50',
      accentColor: theme === 'dark' ? '#ef4444' : '#dc2626'
    },
    {
      title: "AIは「質問」に答えるのではなく",
      subtitle: "「意図」に応える。",
      description: "検索から対話へ。AIが理解するのは「キーワード」ではなく「Context（文脈）」です。レリバンスエンジニアリングなしに、AIの真価は引き出せません。",
      highlight: "AIに「正しく質問する」時代は終わりました。",
      linkUrl: "https://nands.tech/posts/ai-950781",
      linkText: "レリバンスエンジニアリングを読む",
      gradient: theme === 'dark' ? 'from-cyan-900/20 to-blue-900/20' : 'from-cyan-50 to-blue-50',
      accentColor: theme === 'dark' ? '#22d3ee' : '#0891b2'
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
          <ProblemCard key={index} theme={theme} {...card} />
        ))}
      </div>

      {/* スマホ版: スライダー */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="problem-swiper"
          style={{ paddingBottom: '50px' }}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <ProblemCard theme={theme} {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .problem-swiper .swiper-pagination-bullet {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          opacity: 1;
        }
        .problem-swiper .swiper-pagination-bullet-active {
          background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
        }
      `}</style>
    </motion.div>
  )
}

/**
 * 法人向け課題提起カード（2枚）
 */
function CorporateProblemCards() {
  const { theme } = useTheme()
  
  const cards = [
    {
      title: "RAGを入れたのに、なぜ御社のAIは",
      subtitle: "「バカ」なのか？",
      description: "ChatGPTにPDFを読ませただけのRAGは、ただの「検索窓」です。AIはファイルを読みません。データの「意味（Context）」を読みます。構造なきデータは、AIにとってノイズでしかありません。",
      highlight: "必要なのは「ベクトルリンク」による構造化です。",
      linkUrl: "https://nands.tech/posts/-571903",
      linkText: "ベクトルリンクを読む",
      gradient: theme === 'dark' ? 'from-red-900/20 to-orange-900/20' : 'from-red-50 to-orange-50',
      accentColor: theme === 'dark' ? '#ef4444' : '#dc2626'
    },
    {
      title: "社員を雇うのではなく",
      subtitle: "AIを構築する時代。",
      description: "AIアーキテクトは、システム全体を俯瞰し、AIを「部品」として組み込む設計者です。もはやコードは書きません。MCP、RAG、Agentsを統合し、企業OS全体を設計します。",
      highlight: "2026年、エンジニアは「作る人」から「設計する人」へ。",
      linkUrl: "https://nands.tech/posts/ai-ai20251000-097498",
      linkText: "AIアーキテクトを読む",
      gradient: theme === 'dark' ? 'from-purple-900/20 to-indigo-900/20' : 'from-purple-50 to-indigo-50',
      accentColor: theme === 'dark' ? '#a855f7' : '#7c3aed'
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
          <ProblemCard key={index} theme={theme} {...card} />
        ))}
      </div>

      {/* スマホ版: スライダー */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="problem-swiper"
          style={{ paddingBottom: '50px' }}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <ProblemCard theme={theme} {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .problem-swiper .swiper-pagination-bullet {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          opacity: 1;
        }
        .problem-swiper .swiper-pagination-bullet-active {
          background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
        }
      `}</style>
    </motion.div>
  )
}

/**
 * 再利用可能なカードコンポーネント（Apple風）
 */
interface ProblemCardProps {
  theme: 'light' | 'dark'
  title: string
  subtitle: string
  description: string
  highlight: string
  linkUrl: string
  linkText: string
  gradient: string
  accentColor: string
}

function ProblemCard({
  theme,
  title,
  subtitle,
  description,
  highlight,
  linkUrl,
  linkText,
  gradient,
  accentColor
}: ProblemCardProps) {
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
        {/* タイトル */}
        <h3 
          className="text-2xl lg:text-3xl font-bold mb-2 leading-tight"
          style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
        >
          {title}
        </h3>
        
        {/* サブタイトル（強調） */}
        <p 
          className="text-3xl lg:text-4xl font-black mb-6 leading-tight"
          style={{ color: accentColor }}
        >
          {subtitle}
        </p>

        {/* 説明文 */}
        <p 
          className="text-base lg:text-lg leading-relaxed mb-6 flex-grow"
          style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
        >
          {description}
        </p>

        {/* ハイライトボックス */}
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

        {/* リンク */}
        <Link
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm lg:text-base font-semibold hover:underline transition-colors"
          style={{ color: accentColor }}
        >
          {linkText}
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  )
}
