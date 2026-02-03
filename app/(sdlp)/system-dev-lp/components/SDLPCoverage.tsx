'use client'

import { useId } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Globe,
  Bot,
  Briefcase,
  Cloud,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

const services = [
  {
    icon: Globe,
    title: 'ホームページ制作',
    description:
      'プロ品質のホームページをリーズナブルに。レスポンシブ対応、お問い合わせフォーム標準装備。',
    price: '10万円〜',
    duration: '最短1週間',
    features: ['レスポンシブ対応', 'お問い合わせフォーム', 'CMS搭載', 'スマホ最適化'],
    demoUrl: '#',
    featured: true,
    gradient: 'from-blue-500 to-cyan-400',
    iconBg: 'from-blue-600 to-cyan-500',
    stripGradient: 'from-blue-500 via-cyan-400 to-blue-500',
  },
  {
    icon: Bot,
    title: 'AI搭載ホームページ制作',
    description:
      'AIチャットボットを標準実装。訪問者の質問に24時間自動対応し、問い合わせ数を大幅アップ。',
    price: '30万円〜',
    duration: '最短2週間',
    features: ['AIチャットボット', 'CMS搭載', 'レスポンシブ対応', 'AI自動応答'],
    highlightFeature: 'AIチャットボット',
    demoUrl: 'https://careerbridge-jp.vercel.app/monitor-program',
    featured: false,
    gradient: 'from-purple-500 to-blue-500',
    iconBg: 'from-purple-600 to-blue-500',
    stripGradient: 'from-purple-500 via-blue-500 to-purple-500',
    image: '/images/sdlp-ai-homepage-preview.png',
    imageContain: true,
  },
  {
    icon: Briefcase,
    title: 'AI求人サイト',
    description:
      'AIマッチングで求職者と企業を最適につなぐ求人プラットフォーム。応募管理・企業ダッシュボード完備。',
    price: '80万円〜',
    duration: '約2ヶ月',
    features: ['AIマッチング', '応募管理', '企業ダッシュボード', 'レスポンシブ対応'],
    demoUrl: 'https://careerbridge-jp.vercel.app/',
    featured: false,
    gradient: 'from-cyan-500 to-green-400',
    iconBg: 'from-cyan-500 to-emerald-500',
    stripGradient: 'from-cyan-500 via-emerald-400 to-cyan-500',
    image: '/images/sdlp-careerbridge-preview.png',
    imageContain: true,
  },
  {
    icon: Cloud,
    title: 'AI SaaSプラットフォーム',
    description:
      'サブスクリプション管理、ユーザー分析、課金システムを一括構築。スケーラブルなSaaS基盤をAIで強化。',
    price: '150万円〜',
    duration: '約3ヶ月',
    features: ['サブスク管理', 'AI分析', '課金システム', 'マルチテナント'],
    demoUrl: 'https://nands.tech/clavi',
    featured: false,
    gradient: 'from-blue-500 to-purple-500',
    iconBg: 'from-blue-600 to-purple-600',
    stripGradient: 'from-blue-500 via-purple-500 to-blue-500',
    image: '/images/sdlp-saas-preview.png',
    imageContain: true,
  },
]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function DotPattern({ patternId }: { patternId: string }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.2)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

export default function SDLPCoverage() {
  const id = useId()

  return (
    <section className="relative py-24 bg-white overflow-hidden" id="coverage">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-50 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-50 opacity-40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <div className="mb-4 inline-flex items-center rounded-full border border-sdlp-primary/10 bg-sdlp-primary/5 px-4 py-1.5 text-sm font-medium text-sdlp-primary">
            サービス一覧
          </div>
          <h2 className="text-3xl font-bold text-sdlp-text mb-4">
            AI{' '}
            <span className="bg-gradient-to-r from-sdlp-primary to-sdlp-accent bg-clip-text text-transparent">
              &times;
            </span>{' '}
            対応領域
          </h2>
          <p className="text-sdlp-text-secondary max-w-2xl mx-auto">
            すべてのシステムにAI機能を標準搭載。以下は代表的なサービスの一例です。
          </p>
        </motion.div>

        {/* Cards grid with stagger */}
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              className={`group relative rounded-2xl bg-white border overflow-hidden transition-all duration-300 ${
                service.featured
                  ? 'ring-2 ring-sdlp-accent/30 shadow-lg shadow-cyan-500/5 border-slate-200/80 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-15px_rgba(6,182,212,0.15)]'
                  : 'border-slate-200/80 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
              }`}
              variants={cardVariants}
            >
              {/* Top gradient stripe */}
              <div
                className={`h-[3px] bg-gradient-to-r ${service.stripGradient}`}
              />

              {/* Featured badge - corner tab */}
              {service.featured && (
                <div className="absolute top-0 right-0 z-10 rounded-bl-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 text-sm font-bold text-white shadow-sm">
                  おすすめ
                </div>
              )}

              {/* Image area */}
              {'image' in service && service.image ? (
                <div className={`relative overflow-hidden ${'imageContain' in service && service.imageContain ? 'aspect-[5/3] bg-white' : 'aspect-[2/1] bg-slate-100'}`}>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className={`${'imageContain' in service && service.imageContain ? 'object-contain' : `object-cover ${'imagePosition' in service && service.imagePosition ? service.imagePosition : 'object-top'}`}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div
                  className={`relative aspect-[2/1] bg-gradient-to-br ${service.gradient} flex items-center justify-center overflow-hidden`}
                >
                  <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                  <div className="absolute bottom-1/4 right-1/3 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
                  <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
                  <DotPattern patternId={`${id}-dots-${i}`} />
                  <div className="relative">
                    <div className="absolute inset-0 scale-150 rounded-full bg-white/10 blur-xl" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-sm">
                      <service.icon className="h-10 w-10 text-white" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Title row with gradient icon badge */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${service.iconBg} text-white shadow-sm`}
                  >
                    <service.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sdlp-text">
                      {service.title}
                    </h3>
                    <p className="text-sm text-sdlp-text-secondary mt-1 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Price block - independent container */}
                <div
                  className={`rounded-xl p-4 mb-5 ${
                    service.featured
                      ? 'bg-gradient-to-r from-sdlp-primary/5 to-sdlp-accent/5 border border-cyan-100'
                      : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs font-medium tracking-wider text-sdlp-text-secondary">
                        費用目安
                      </span>
                      {service.featured ? (
                        <div className="text-3xl font-extrabold bg-gradient-to-r from-sdlp-primary to-sdlp-accent bg-clip-text text-transparent">
                          {service.price}
                        </div>
                      ) : (
                        <div className="text-3xl font-extrabold text-sdlp-text">
                          {service.price}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium tracking-wider text-sdlp-text-secondary">
                        納期目安
                      </span>
                      <div className="text-base font-bold text-sdlp-text">
                        {service.duration}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.features.map((f) => (
                    <span
                      key={f}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        'highlightFeature' in service &&
                        service.highlightFeature === f
                          ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-sdlp-primary/5 group-hover:text-sdlp-primary'
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/system-dev-lp/questionnaire"
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition-all ${
                      service.featured
                        ? 'bg-gradient-to-r from-sdlp-accent to-cyan-400 shadow-cyan-500/25 hover:shadow-md hover:shadow-cyan-500/30 hover:from-cyan-400 hover:to-cyan-500'
                        : 'bg-gradient-to-r from-sdlp-primary to-blue-700 shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/30 hover:from-blue-500 hover:to-blue-600'
                    }`}
                  >
                    この種類で見積もる
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={service.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-sdlp-primary/20 bg-sdlp-primary/5 px-5 py-3 text-sm font-bold text-sdlp-primary shadow-sm transition-all hover:border-sdlp-primary/40 hover:bg-sdlp-primary/10 hover:shadow-md hover:shadow-blue-500/10"
                  >
                    デモサイトを見る
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
