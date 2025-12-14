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
 * SolutionBentoGrid
 * Apple風カード2枚デザインでソリューションを提示
 * モード（個人/法人）で内容が切り替わる
 * PC: 横並び2カラム / スマホ: スライド表示
 */
export default function SolutionBentoGrid() {
  const { isIndividual } = useMode()
  const { theme } = useTheme()

  return (
    <section 
      className="py-24 sm:py-32"
      style={{
        background: theme === 'dark' ? '#0A1628' : '#ffffff'
      }}
      aria-label="ソリューション"
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
            Solution
          </p>
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            {isIndividual ? (
              <>「操る側」への転換</>
            ) : (
              <>企業OSの設計</>
            )}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            {isIndividual 
              ? 'AIアーキテクトへのキャリアシフトを実現する実践カリキュラム'
              : 'データ構造化から業務自動化まで、三層構造のAIアーキテクチャ'}
          </p>
        </motion.div>

        {/* カード2枚 */}
        <AnimatePresence mode="wait">
          {isIndividual ? (
            <IndividualSolutionCards key="individual" />
          ) : (
            <CorporateSolutionCards key="corporate" />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/**
 * 個人向けソリューションカード（2枚）
 */
function IndividualSolutionCards() {
  const { theme } = useTheme()
  
  const cards = [
    {
      id: 'solution-individual-step1',
      label: "STEP 1",
      title: "Cursor 2.0",
      subtitle: "完全習得",
      features: [
        'AIペアプログラミング環境で効率10倍',
        'Claude・GPT-4統合によるコード生成',
        'Composer機能でプロジェクト全体を操る',
        '6ヶ月で実務レベルに到達'
      ],
      highlight: "もう「書く」時代は終わりました。",
      linkUrl: "https://nands.tech/posts/ai-ai20251000-097498",
      linkText: "AIアーキテクト記事を読む",
      accentColor: theme === 'dark' ? '#a855f7' : '#7c3aed',
      fragmentTitle: 'STEP 1: Cursor 2.0 完全習得 - AIペアプログラミング',
      fragmentDescription: 'AIペアプログラミング環境で効率10倍。Claude・GPT-4統合によるコード生成。Composer機能でプロジェクト全体を操る。6ヶ月で実務レベルに到達。もう書く時代は終わりました。'
    },
    {
      id: 'solution-individual-step2',
      label: "STEP 2",
      title: "AIアーキテクト",
      subtitle: "養成プログラム",
      features: [
        'Vector Link構造化設計',
        'Mastra Frameworkによるエージェント開発',
        'MCP統合でツール連携',
        'システム全体を俯瞰するアーキテクト思考'
      ],
      highlight: "「使う側」から「操る側」へ。",
      linkUrl: "https://nands.tech/posts/ai--949889",
      linkText: "AIキャリア記事を読む",
      accentColor: theme === 'dark' ? '#22d3ee' : '#0891b2',
      fragmentTitle: 'STEP 2: AIアーキテクト養成プログラム - Vector Link & Mastra',
      fragmentDescription: 'Vector Link構造化設計、Mastra Frameworkによるエージェント開発、MCP統合でツール連携。システム全体を俯瞰するアーキテクト思考を習得。使う側から操る側へ。'
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
          <SolutionCard key={index} theme={theme} {...card} />
        ))}
      </div>

      {/* スマホ版: スライダー */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="solution-swiper"
          style={{ paddingBottom: '50px' }}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <SolutionCard theme={theme} {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .solution-swiper .swiper-pagination-bullet {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          opacity: 1;
        }
        .solution-swiper .swiper-pagination-bullet-active {
          background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
        }
      `}</style>
    </motion.div>
  )
}

/**
 * 法人向けソリューションカード（2枚）
 */
function CorporateSolutionCards() {
  const { theme } = useTheme()
  
  const cards = [
    {
      id: 'solution-corporate-layer1',
      label: "LAYER 1",
      title: "Brain",
      subtitle: "構造化基盤",
      features: [
        'Vector Linkによるデータ再構築',
        'RAGの「正しい」使い方を設計',
        'コンテキストをAIに正確に伝える',
        '構造なきデータはノイズでしかない'
      ],
      highlight: "AIは「ファイル」を読まない。「意味」を読む。",
      linkUrl: "https://nands.tech/posts/-571903",
      linkText: "ベクトルリンク記事を読む",
      accentColor: theme === 'dark' ? '#a855f7' : '#7c3aed',
      fragmentTitle: 'LAYER 1: Brain 構造化基盤 - Vector Link & RAG',
      fragmentDescription: 'Vector Linkによるデータ再構築。RAGの正しい使い方を設計。コンテキストをAIに正確に伝える。構造なきデータはノイズでしかない。AIはファイルを読まず、意味を読む。'
    },
    {
      id: 'solution-corporate-layer2',
      label: "LAYER 2-3",
      title: "Agent & Output",
      subtitle: "業務自動化",
      features: [
        '問い合わせ対応・調査・要約の自動化',
        'マーケティング施策の自動実行',
        'SNS・動画・記事の自動生成',
        '人間は「設計」に集中できる'
      ],
      highlight: "社員を雇うのではなく、AIを構築する時代。",
      linkUrl: "https://nands.tech/posts/ai-ai20251000-097498",
      linkText: "AIアーキテクト記事を読む",
      accentColor: theme === 'dark' ? '#22d3ee' : '#0891b2',
      fragmentTitle: 'LAYER 2-3: Agent & Output 業務自動化 - マーケティング自動実行',
      fragmentDescription: '問い合わせ対応・調査・要約の自動化。マーケティング施策の自動実行。SNS・動画・記事の自動生成。人間は設計に集中できる。社員を雇うのではなく、AIを構築する時代。'
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
          <SolutionCard key={index} theme={theme} {...card} />
        ))}
      </div>

      {/* スマホ版: スライダー */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="solution-swiper"
          style={{ paddingBottom: '50px' }}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <SolutionCard theme={theme} {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .solution-swiper .swiper-pagination-bullet {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          opacity: 1;
        }
        .solution-swiper .swiper-pagination-bullet-active {
          background: ${theme === 'dark' ? '#00d4ff' : '#0066cc'};
        }
      `}</style>
    </motion.div>
  )
}

/**
 * 再利用可能なソリューションカードコンポーネント（Apple風）
 */
interface SolutionCardProps {
  theme: 'light' | 'dark'
  id: string
  label: string
  title: string
  subtitle: string
  features: string[]
  highlight: string
  linkUrl: string
  linkText: string
  accentColor: string
  fragmentTitle: string
  fragmentDescription: string
}

function SolutionCard({
  theme,
  id,
  label,
  title,
  subtitle,
  features,
  highlight,
  linkUrl,
  linkText,
  accentColor,
  fragmentTitle,
  fragmentDescription
}: SolutionCardProps) {
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

        {/* タイトル */}
        <h3 
          className="text-3xl lg:text-4xl font-bold mb-2 leading-tight"
          style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
        >
          {title}
        </h3>
        
        {/* サブタイトル */}
        <p 
          className="text-xl lg:text-2xl font-semibold mb-6"
          style={{ color: accentColor }}
        >
          {subtitle}
        </p>

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

        {/* リンク */}
        <Link
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-base font-semibold hover:underline transition-colors"
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
