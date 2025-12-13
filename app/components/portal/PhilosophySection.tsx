'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from './ThemeContext'

/**
 * PhilosophySection
 * 原田賢治の哲学・マニフェストセクション
 * Apple風のシンプルで洗練されたデザイン
 * 
 * Fragment ID: #philosophy
 */
export default function PhilosophySection() {
  const { theme } = useTheme()
  
  return (
    <section 
      id="philosophy"
      className="py-24 sm:py-32 relative overflow-hidden scroll-mt-20"
      style={{
        background: theme === 'dark'
          ? '#0A1628'
          : '#ffffff'
      }}
      aria-label="フィロソフィー"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
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
            style={{ color: theme === 'dark' ? '#22d3ee' : '#0891b2' }}
          >
            Philosophy
          </p>
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
          >
            Relevance Engineering
          </h2>
        </motion.div>

        {/* メインカード */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`
            relative rounded-3xl p-8 sm:p-12 lg:p-16
            ${theme === 'dark' 
              ? 'bg-gray-900/50 border border-gray-800' 
              : 'bg-gray-50 border border-gray-200'
            }
          `}
        >
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-16 items-start">
            
            {/* 左: 写真（小さく） */}
            <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-4">
                <Image
                  src="/images/team/kenji-harada.png"
                  alt="原田賢治 - AI Architect"
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              </div>
              <p 
                className="text-lg font-semibold"
                style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
              >
                原田賢治
              </p>
              <p 
                className="text-sm"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                AI Architect / Founder
              </p>
            </div>

            {/* 右: メッセージ */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* キーメッセージ */}
              <div>
                <p 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#1a1a1a' }}
                >
                  私はAIを使わない。
                </p>
                <p 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight"
                  style={{ color: theme === 'dark' ? '#22d3ee' : '#0891b2' }}
                >
                  AIが私を使う構造を設計する。
                </p>
              </div>

              {/* 説明 */}
              <p 
                className="text-lg leading-relaxed"
                style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
              >
                世の中の9割は「プロンプト」で解決しようとします。しかし、AIの回答精度を決めるのはプロンプトではなく「データの渡し方（コンテキスト）」です。これができる人間を、私は「AIアーキテクト」と呼びます。
              </p>

              {/* 引用（シンプル） */}
              <blockquote 
                className="pl-6 border-l-2"
                style={{ borderColor: theme === 'dark' ? '#22d3ee' : '#0891b2' }}
              >
                <p 
                  className="text-lg italic leading-relaxed"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  "あなたが次に書くコードが、単なる処理ではなく、未来のAIへの『手紙』になることを願っています。"
                </p>
              </blockquote>

              {/* リンク */}
              <Link
                href="https://nands.tech/posts/ai-950781"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-base font-semibold hover:underline transition-colors"
                style={{ color: theme === 'dark' ? '#22d3ee' : '#0891b2' }}
              >
                レリバンスエンジニアリングを読む
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

