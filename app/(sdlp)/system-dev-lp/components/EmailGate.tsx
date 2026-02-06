'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'

interface EmailGateProps {
  onSubmit: (email: string) => Promise<void>
  onSkip: () => void
}

export default function EmailGate({ onSubmit, onSkip }: EmailGateProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async () => {
    if (!isValidEmail) return
    setSubmitting(true)
    try {
      await onSubmit(email)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg border border-sdlp-border text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sdlp-primary/10 mb-4">
          <Mail className="h-7 w-7 text-sdlp-primary" />
        </div>
        <h2 className="text-xl font-bold text-sdlp-text mb-2">
          提案書の全文をご覧いただけます
        </h2>
        <p className="text-sm text-sdlp-text-secondary mb-6">
          メールアドレスをご入力いただくと、完全な開発提案書とAIチャット相談をご利用いただけます。
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isValidEmail) {
              handleSubmit()
            }
          }}
          placeholder="example@company.co.jp"
          className="w-full rounded-xl border-2 border-sdlp-border px-4 py-3 text-sm text-sdlp-text placeholder:text-gray-400 focus:border-sdlp-primary focus:outline-none focus:ring-1 focus:ring-sdlp-primary mb-4"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValidEmail || submitting}
          className="w-full rounded-xl bg-sdlp-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            '送信中...'
          ) : (
            <>
              提案書の全文を見る
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 text-sm text-sdlp-text-secondary hover:text-sdlp-text transition-colors"
        >
          メールアドレスなしで結果を見る
        </button>
      </div>
    </motion.div>
  )
}
