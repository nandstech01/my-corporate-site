'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Mail, Download, ExternalLink, MessageCircle } from 'lucide-react'
import type { LeadScoring, FollowUpStrategy } from '../lib/ai/types'
import CalendlyBooking from './CalendlyBooking'
import { fadeInUp, staggerContainer } from '@/lib/motion'

interface ConversionCTAsProps {
  leadScoring: LeadScoring | null
  followUpStrategy: FollowUpStrategy | null
  onStartChat: () => void
  email?: string
}

export default function ConversionCTAs({
  leadScoring,
  followUpStrategy,
  onStartChat,
  email,
}: ConversionCTAsProps) {
  const [showCalendly, setShowCalendly] = useState(false)
  const tier = leadScoring?.tier ?? 'cold'
  const calendlyUrl = followUpStrategy?.ctaUrl ?? process.env.NEXT_PUBLIC_CALENDLY_URL ?? ''

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Primary CTA based on lead tier */}
      {tier === 'hot' && calendlyUrl && (
        <motion.div variants={fadeInUp}>
          <button
            type="button"
            onClick={() => setShowCalendly(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-base font-bold text-white hover:from-orange-400 hover:to-red-400 transition-all shadow-lg shadow-red-500/25"
          >
            <Calendar className="h-5 w-5" />
            {followUpStrategy?.cta ?? '今すぐ無料相談を予約（30分）'}
          </button>
          {followUpStrategy?.message && (
            <p className="text-xs text-sdlp-text-secondary text-center mt-2">
              {followUpStrategy.message}
            </p>
          )}
        </motion.div>
      )}

      {tier === 'warm' && (
        <motion.div variants={fadeInUp}>
          <a
            href={`mailto:contact@nands.tech?subject=${encodeURIComponent(followUpStrategy?.emailSubject ?? '詳細資料のご請求')}`}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-base font-bold text-white hover:from-blue-400 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25"
          >
            <Mail className="h-5 w-5" />
            {followUpStrategy?.cta ?? '詳細資料をメールで受け取る'}
          </a>
          {followUpStrategy?.message && (
            <p className="text-xs text-sdlp-text-secondary text-center mt-2">
              {followUpStrategy.message}
            </p>
          )}
        </motion.div>
      )}

      {tier === 'cold' && (
        <motion.div variants={fadeInUp}>
          <a
            href={`mailto:contact@nands.tech?subject=${encodeURIComponent(followUpStrategy?.emailSubject ?? '事例集のご請求')}`}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sdlp-primary to-sdlp-accent px-8 py-4 text-base font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-sdlp-primary/25"
          >
            <Download className="h-5 w-5" />
            {followUpStrategy?.cta ?? '事例集をダウンロード'}
          </a>
          {followUpStrategy?.message && (
            <p className="text-xs text-sdlp-text-secondary text-center mt-2">
              {followUpStrategy.message}
            </p>
          )}
        </motion.div>
      )}

      {/* Chat CTA (always available) */}
      <motion.div variants={fadeInUp}>
        <button
          type="button"
          onClick={onStartChat}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-sdlp-border bg-white px-6 py-3 text-sm font-bold text-sdlp-text hover:border-sdlp-primary hover:text-sdlp-primary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          AIコンサルタントに相談する
        </button>
      </motion.div>

      {/* Secondary: direct contact */}
      <motion.div variants={fadeInUp} className="text-center">
        <a
          href="mailto:contact@nands.tech"
          className="inline-flex items-center gap-1 text-sm text-sdlp-text-secondary hover:text-sdlp-primary transition-colors"
        >
          NANDSに直接問い合わせる
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </motion.div>

      {/* Lead score badge (subtle) */}
      {leadScoring && (
        <motion.div variants={fadeInUp} className="text-center">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            tier === 'hot'
              ? 'bg-red-50 text-red-600'
              : tier === 'warm'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-gray-50 text-gray-500'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              tier === 'hot'
                ? 'bg-red-500'
                : tier === 'warm'
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
            }`} />
            マッチ度: {leadScoring.score}%
          </span>
        </motion.div>
      )}

      {/* Calendly Modal */}
      {showCalendly && calendlyUrl && (
        <CalendlyBooking
          url={calendlyUrl}
          prefill={{ email: email ?? undefined }}
          onClose={() => setShowCalendly(false)}
        />
      )}
    </motion.div>
  )
}
