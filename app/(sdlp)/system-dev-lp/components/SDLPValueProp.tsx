'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Award, Clock, Shield, ArrowRight } from 'lucide-react'
import { SdlpValuePropPlayer } from '@/components/sdlp/SdlpValuePropPlayer'

const badges = [
  { icon: Award, label: '開発実績500件以上', color: 'text-sdlp-primary' },
  { icon: Clock, label: 'AI活用で最短1ヶ月納品', color: 'text-sdlp-accent' },
  { icon: Shield, label: '納品後1ヶ月無料修正保証', color: 'text-green-500' },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SDLPValueProp() {
  return (
    <section className="py-20 bg-sdlp-bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ staggerChildren: 0.1 }}
        >
          {badges.map((badge) => (
            <motion.div
              key={badge.label}
              className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-sm border border-sdlp-border"
              variants={fadeInUp}
            >
              <badge.icon className={`h-6 w-6 ${badge.color}`} />
              <span className="font-semibold text-sdlp-text">
                {badge.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Quick estimate form */}
          <motion.div
            className="rounded-2xl bg-white p-8 shadow-lg border border-sdlp-border"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-sdlp-text mb-2">
              AI搭載システムの概算見積もり
            </h2>
            <p className="text-sdlp-text-secondary mb-6">
              5つの質問に答えるだけでAI込みの概算費用をお出しします
            </p>
            <div className="space-y-4 mb-6">
              {[
                'システムの種類を選ぶ',
                '必要な機能を選ぶ',
                '規模感を入力',
                '希望納期を選ぶ',
                '概算見積もりを確認',
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sdlp-primary/10 text-sm font-bold text-sdlp-primary">
                    {i + 1}
                  </div>
                  <span className="text-sm text-sdlp-text">{step}</span>
                </div>
              ))}
            </div>
            <Link
              href="/system-dev-lp/questionnaire"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-sdlp-primary px-6 py-4 text-base font-bold text-white hover:bg-sdlp-primary-hover transition-colors"
            >
              無料シミュレーションを始める
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>

          {/* Right: Video / illustration placeholder */}
          <motion.div
            className="rounded-2xl bg-gradient-to-br from-sdlp-primary/5 to-sdlp-accent/5 p-8 border border-sdlp-border"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
          >
            <div className="aspect-video rounded-xl overflow-hidden">
              <SdlpValuePropPlayer />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">30%</div>
                <div className="text-xs text-sdlp-text-secondary">
                  AI活用でコスト削減
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">2週間</div>
                <div className="text-xs text-sdlp-text-secondary">
                  最短見積り
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">98%</div>
                <div className="text-xs text-sdlp-text-secondary">
                  継続率
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
