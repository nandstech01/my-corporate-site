'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ServiceTabs from './ServiceTabs'
import { SERVICE_CONFIGS } from '@/lib/services/config'
import type { ServiceType } from '@/lib/services/types'

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

const SERVICE_HEADLINES: Record<ServiceType, { title: React.ReactNode; description: string; badges: string[] }> = {
  homepage: {
    title: (
      <>
        <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
          集客力
        </span>
        のあるHPを
        <br />
        <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
          70%OFF
        </span>
        で制作。
      </>
    ),
    description: 'AI活用で高品質なホームページを短納期・低コストで制作。SEO対策、レスポンシブ対応、CMS搭載が標準。',
    badges: ['SEO対策込み', 'スマホ対応', 'CMS搭載'],
  },
  efficiency: {
    title: (
      <>
        業務の
        <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
          ムダ
        </span>
        を削減。
        <br />
        AI×
        <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
          自動化
        </span>
        で生産性UP。
      </>
    ),
    description: 'Excel管理や手作業から脱却。AI×ワークフロー自動化で月間数十時間の工数を削減。',
    badges: ['工数50%削減', '既存ツール連携', 'データ一元化'],
  },
  'custom-dev': {
    title: (
      <>
        費用
        <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
          70%OFF
        </span>
        、納期
        <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
          3倍速
        </span>
        。
        <br />
        AI開発の新常識。
      </>
    ),
    description: 'AI×少数精鋭で中間マージンを完全排除。ChatGPT連携・業務自動化・AIチャットボットを標準搭載。設計から納品まで一気通貫。',
    badges: ['AI実装が標準搭載', '追加費用なし', '見積もり即日無料'],
  },
  'ai-integration': {
    title: (
      <>
        <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
          AI
        </span>
        で業務を革新。
        <br />
        導入から運用まで
        <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
          伴走
        </span>
        。
      </>
    ),
    description: 'ChatGPT・Claude等の最新AIを業務に導入。チャットボット構築、文書自動化、データ分析をPoCから本番まで支援。',
    badges: ['PoC対応', 'カスタムAI構築', 'ROI最大化'],
  },
}

export default function SDLPHero() {
  const [serviceType, setServiceType] = useState<ServiceType>('custom-dev')
  const headline = SERVICE_HEADLINES[serviceType]

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
            {/* Service type tabs */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeInUp}
              className="mb-8"
            >
              <ServiceTabs
                selected={serviceType}
                onSelect={setServiceType}
              />
            </motion.div>

            <motion.h1
              key={serviceType}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {headline.title}
            </motion.h1>

            {/* Mobile-only: Remotion Player below heading */}
            <motion.div
              className="lg:hidden mb-8 rounded-2xl overflow-hidden border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <SdlpHeroPlayer />
            </motion.div>

            <motion.p
              key={`desc-${serviceType}`}
              className="text-lg text-white/70 mb-8 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {headline.description}
            </motion.p>

            {/* Badges */}
            <motion.div
              key={`badges-${serviceType}`}
              className="flex flex-wrap gap-3 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {headline.badges.map((badge) => (
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
                href={`/system-dev-lp/questionnaire/${serviceType}`}
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
