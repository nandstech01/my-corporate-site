'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, User } from 'lucide-react'
import type { BusinessType } from '../lib/types'

const SdlpHeroPlayer = dynamic(
  () => import('@/components/sdlp/SdlpHeroPlayer').then((m) => m.SdlpHeroPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] rounded-2xl bg-[#0F172A]/50 animate-pulse" />
    ),
  },
)

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
}

export default function SDLPHero() {
  const [businessType, setBusinessType] = useState<BusinessType>('corporate')

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Dark ocean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0F172A] to-[#1E293B]" />
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[length:24px_24px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="text-white">
            {/* Business type toggle */}
            <motion.div
              className="inline-flex rounded-full bg-white/10 backdrop-blur-sm p-1 mb-8 border border-white/10"
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeInUp}
            >
              <button
                type="button"
                onClick={() => setBusinessType('corporate')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  businessType === 'corporate'
                    ? 'bg-white text-sdlp-primary shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Building2 className="h-4 w-4" />
                企業の方
              </button>
              <button
                type="button"
                onClick={() => setBusinessType('individual')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  businessType === 'individual'
                    ? 'bg-white text-sdlp-primary shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <User className="h-4 w-4" />
                個人の方
              </button>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeInUp}
            >
              {businessType === 'corporate' ? (
                <>
                  <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
                    AI実装
                  </span>
                  の業務システムを
                  <br />
                  圧倒的コスパで実現
                </>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
                    AI搭載
                  </span>
                  のプロダクトで
                  <br />
                  アイデアをカタチに
                </>
              )}
            </motion.h1>

            <motion.p
              className="text-lg text-white/70 mb-8 max-w-lg"
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeInUp}
            >
              {businessType === 'corporate'
                ? 'AI活用の設計から開発・納品まで一貫対応。ChatGPT連携、データ分析の自動化、AIチャットボットなど、御社の業務をインテリジェントに変革します。'
                : 'AI機能を組み込んだWebサービス・アプリを手軽に。初めてのAI導入でも安心の伴走型サポートで、競合に差をつけるプロダクトを実現します。'}
            </motion.p>

            {/* Badges */}
            <motion.div
              className="flex flex-wrap gap-3 mb-10"
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeInUp}
            >
              {['AI導入相談無料', '見積もり無料', '最短即日対応'].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white/90 border border-white/10"
                >
                  {badge}
                </span>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeInUp}
            >
              <Link
                href="/system-dev-lp/questionnaire"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-bold text-white hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-900/30"
              >
                無料シミュレーション
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Remotion Player */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <SdlpHeroPlayer />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient transition: dark → white */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white" />
    </section>
  )
}
