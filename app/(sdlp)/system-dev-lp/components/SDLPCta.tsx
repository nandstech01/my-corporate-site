'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface SDLPCtaProps {
  variant?: 'default' | 'gradient'
}

export default function SDLPCta({ variant = 'default' }: SDLPCtaProps) {
  const isGradient = variant === 'gradient'

  return (
    <section
      className={`py-16 relative overflow-hidden ${
        isGradient
          ? 'bg-gradient-to-br from-[#0A1628] to-[#0F172A]'
          : 'bg-sdlp-bg-card'
      }`}
      id="contact"
    >
      {/* Cyan glow decoration for gradient variant */}
      {isGradient && (
        <>
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl" />
        </>
      )}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
            AI搭載システムの無料シミュレーション
          </h2>
          <p
            className={`mb-8 max-w-xl mx-auto ${
              isGradient ? 'text-white/85' : 'text-sdlp-text-secondary'
            }`}
          >
            5つの質問に答えるだけで、AI機能込みの概算費用と開発期間がわかります。
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
          </div>
        </motion.div>
      </div>
    </section>
  )
}
