'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Shield } from 'lucide-react'

interface EmailGateProps {
  onSubmit: (email: string) => Promise<void>
  onSkip: () => void
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      staggerChildren: 0.1,
    },
  },
}

const childVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-lg mx-auto"
    >
      <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg border border-sdlp-border text-center">
        <motion.div
          variants={childVariants}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sdlp-primary/10 mb-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Mail className="h-7 w-7 text-sdlp-primary" />
          </motion.div>
        </motion.div>

        <motion.h2
          variants={childVariants}
          className="text-xl font-bold text-sdlp-text mb-2"
        >
          提案書の全文をご覧いただけます
        </motion.h2>

        <motion.p
          variants={childVariants}
          className="text-sm text-sdlp-text-secondary mb-6"
        >
          メールアドレスをご入力いただくと、完全な開発提案書とAIチャット相談をご利用いただけます。
        </motion.p>

        <motion.div variants={childVariants}>
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
            className="w-full rounded-xl border-2 border-sdlp-border px-4 py-3 text-sm text-sdlp-text placeholder:text-gray-400 focus:border-sdlp-primary focus:outline-none focus:ring-1 focus:ring-sdlp-primary mb-4 transition-colors"
          />
        </motion.div>

        <motion.div variants={childVariants}>
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!isValidEmail || submitting}
            whileHover={isValidEmail && !submitting ? { scale: 1.02 } : {}}
            whileTap={isValidEmail && !submitting ? { scale: 0.98 } : {}}
            className="w-full rounded-xl bg-sdlp-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-sdlp-primary/20"
          >
            {submitting ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                送信中...
              </motion.span>
            ) : (
              <>
                提案書の全文を見る
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </motion.div>

        <motion.div variants={childVariants} className="mt-4 space-y-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-sdlp-text-secondary hover:text-sdlp-text transition-colors"
          >
            メールアドレスなしで結果を見る
          </button>
          <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400">
            <Shield className="h-3 w-3" />
            <span>ご入力いただいた情報は厳重に管理されます</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
