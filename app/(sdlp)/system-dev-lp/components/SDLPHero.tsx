'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, User } from 'lucide-react'
import type { BusinessType } from '../lib/types'

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
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sdlp-primary via-blue-500 to-sdlp-accent" />
      {/* Overlay pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[length:24px_24px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="text-white">
            {/* Business type toggle */}
            <motion.div
              className="inline-flex rounded-full bg-white/15 backdrop-blur-sm p-1 mb-8"
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
                    : 'text-white/80 hover:text-white'
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
                    : 'text-white/80 hover:text-white'
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
                  業務システム開発を
                  <br />
                  <span className="text-cyan-300">圧倒的コスパ</span>で実現
                </>
              ) : (
                <>
                  あなたのアイデアを
                  <br />
                  <span className="text-cyan-300">カタチ</span>にします
                </>
              )}
            </motion.h1>

            <motion.p
              className="text-lg text-white/85 mb-8 max-w-lg"
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeInUp}
            >
              {businessType === 'corporate'
                ? '要件定義から設計・開発・納品まで一貫対応。ホームページ制作から業務システムまで、御社のDX推進をサポートします。'
                : 'Webサービス・アプリ開発を手軽に。初めての開発でも安心の伴走型サポートで、あなたのビジネスアイデアを実現します。'}
            </motion.p>

            {/* Badges */}
            <motion.div
              className="flex flex-wrap gap-3 mb-10"
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeInUp}
            >
              {['相談無料', '見積もり無料', '最短即日対応'].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white border border-white/20"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-sdlp-primary hover:bg-gray-50 transition-colors shadow-lg"
              >
                無料シミュレーション
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="tel:0120-407-638"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-colors"
              >
                電話で相談する
              </a>
            </motion.div>
          </div>

          {/* Right: Floating card */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="relative">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                    <span className="text-white/90 text-sm">
                      プロジェクト進行中
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: '要件定義', progress: 100 },
                      { label: '設計', progress: 100 },
                      { label: '開発', progress: 75 },
                      { label: 'テスト', progress: 30 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm text-white/80 mb-1">
                          <span>{item.label}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/20">
                          <div
                            className="h-full rounded-full bg-cyan-300 transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/15">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">98%</div>
                        <div className="text-xs text-white/60">顧客満足度</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          500+
                        </div>
                        <div className="text-xs text-white/60">開発実績</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating decorations */}
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-2xl bg-cyan-400/20 backdrop-blur-sm border border-cyan-300/20 animate-pulse" />
              <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-xl bg-blue-400/20 backdrop-blur-sm border border-blue-300/20 animate-pulse [animation-delay:1s]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
