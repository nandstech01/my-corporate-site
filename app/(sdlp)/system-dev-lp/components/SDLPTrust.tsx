'use client'

import { motion } from 'framer-motion'
import { Building2, Star, Quote } from 'lucide-react'

const clientBadges = [
  { industry: '製造業大手', count: '3社' },
  { industry: 'IT・通信', count: '5社' },
  { industry: '不動産', count: '2社' },
  { industry: '人材サービス', count: '4社' },
  { industry: '小売・EC', count: '3社' },
  { industry: '医療・介護', count: '2社' },
]

const testimonials = [
  {
    quote:
      'AIチャットボット導入で問い合わせ対応コストが月30万円削減。導入から2ヶ月で投資回収できました。',
    role: '情報システム部 部長',
    industry: 'IT・通信企業',
    result: '対応コスト月30万円削減',
  },
  {
    quote:
      '他社の半額以下で同等以上のクオリティ。納品後の修正対応も迅速で、安心して任せられます。',
    role: '経営企画室 マネージャー',
    industry: '製造業',
    result: '開発費用60%削減',
  },
  {
    quote:
      '社内のExcel業務をAIで自動化。月40時間以上の工数削減に成功し、社員の残業も大幅に減りました。',
    role: '総務部 課長',
    industry: '人材サービス企業',
    result: '月40時間の工数削減',
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SDLPTrust() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <div className="mb-4 inline-flex items-center rounded-full border border-sdlp-primary/10 bg-sdlp-primary/5 px-4 py-1.5 text-sm font-medium text-sdlp-primary">
            導入実績
          </div>
          <h2 className="text-3xl font-bold text-sdlp-text mb-4">
            多業種の企業様にご利用いただいています
          </h2>
        </motion.div>

        {/* Client industry badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ staggerChildren: 0.08 }}
        >
          {clientBadges.map((badge) => (
            <motion.div
              key={badge.industry}
              className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-5 py-3"
              variants={fadeInUp}
            >
              <Building2 className="h-4 w-4 text-sdlp-primary" />
              <span className="text-sm font-medium text-sdlp-text">
                {badge.industry}
              </span>
              <span className="text-xs text-sdlp-text-secondary bg-sdlp-primary/5 rounded-full px-2 py-0.5">
                {badge.count}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ staggerChildren: 0.15 }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.role}
              className="relative rounded-2xl bg-sdlp-bg-card p-7 border border-sdlp-border"
              variants={fadeInUp}
            >
              <Quote className="absolute top-5 right-5 h-8 w-8 text-sdlp-primary/10" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-sdlp-text leading-relaxed mb-5">
                {t.quote}
              </p>
              <div className="border-t border-sdlp-border pt-4">
                <div className="text-xs text-sdlp-text-secondary">
                  {t.industry}
                </div>
                <div className="text-sm font-medium text-sdlp-text">
                  {t.role}
                </div>
                <div className="mt-2 inline-flex rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
                  {t.result}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
