'use client'

import { motion } from 'framer-motion'
import { BadgeJapaneseYen, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const benefits = [
  '開発費用の最大50%を補助（上限450万円）',
  '補助金申請サポート付き（無料）',
  'ホームページ制作・システム開発どちらも対象',
  '採択率を高める要件定義書をNANDSが作成',
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SDLPSubsidy() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-2xl bg-white p-8 sm:p-12 shadow-lg border border-green-200 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-bl-full" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <BadgeJapaneseYen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-green-600 uppercase tracking-wider">
                  IT導入補助金対応
                </div>
                <h2 className="text-2xl font-bold text-sdlp-text">
                  開発費用を最大50%削減
                </h2>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              {/* Left: Benefits */}
              <div className="space-y-3">
                {benefits.map((b) => (
                  <div key={b} className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-sdlp-text leading-relaxed">
                      {b}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right: Example calculation */}
              <div className="rounded-xl bg-green-50 border border-green-200 p-6">
                <div className="text-sm font-medium text-green-700 mb-4">
                  活用例：AI搭載ホームページ制作
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sdlp-text-secondary">
                      開発費用
                    </span>
                    <span className="font-medium text-sdlp-text">
                      300,000円
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>補助金（50%）</span>
                    <span className="font-medium">-150,000円</span>
                  </div>
                  <div className="border-t border-green-200 pt-2 flex justify-between">
                    <span className="font-bold text-sdlp-text">実質負担額</span>
                    <span className="text-xl font-extrabold text-green-600">
                      150,000円
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/system-dev-lp/questionnaire"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-base font-bold text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
            >
              補助金込みで無料見積もりを確認
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
