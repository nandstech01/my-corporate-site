'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'

interface SDLPCtaProps {
  variant?: 'default' | 'gradient'
}

export default function SDLPCta({ variant = 'default' }: SDLPCtaProps) {
  const isGradient = variant === 'gradient'

  return (
    <section
      className={`py-16 ${
        isGradient
          ? 'bg-gradient-to-r from-sdlp-primary to-sdlp-accent'
          : 'bg-sdlp-bg-card'
      }`}
      id="contact"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 ${
              isGradient ? 'text-white' : 'text-sdlp-text'
            }`}
          >
            まずは無料シミュレーションから
          </h2>
          <p
            className={`mb-8 max-w-xl mx-auto ${
              isGradient ? 'text-white/85' : 'text-sdlp-text-secondary'
            }`}
          >
            5つの質問に答えるだけで、概算費用と開発期間の目安がわかります。
            もちろん無料で、営業電話は一切いたしません。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/system-dev-lp/questionnaire"
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-colors shadow-lg ${
                isGradient
                  ? 'bg-white text-sdlp-primary hover:bg-gray-50'
                  : 'bg-sdlp-primary text-white hover:bg-sdlp-primary-hover'
              }`}
            >
              無料シミュレーション
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="tel:0120-407-638"
              className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 px-8 py-4 text-base font-bold transition-colors ${
                isGradient
                  ? 'border-white/40 text-white hover:bg-white/10'
                  : 'border-sdlp-border text-sdlp-text hover:bg-gray-50'
              }`}
            >
              <Phone className="h-5 w-5" />
              電話で相談する
            </a>
          </div>

          <p
            className={`mt-4 text-sm ${
              isGradient ? 'text-white/60' : 'text-sdlp-text-secondary'
            }`}
          >
            受付時間: 平日 9:00〜18:00 / 土日祝休み
          </p>
        </motion.div>
      </div>
    </section>
  )
}
