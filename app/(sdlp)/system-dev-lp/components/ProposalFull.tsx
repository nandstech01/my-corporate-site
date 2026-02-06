'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageCircle, ExternalLink } from 'lucide-react'
import type { ProposalResult } from '../lib/ai/types'
import { formatPrice } from '../lib/estimateCalculator'
import { fadeInUp, staggerContainer, DURATION, EASE } from '@/lib/motion'

interface ProposalFullProps {
  proposal: ProposalResult
  onStartChat: () => void
}

export default function ProposalFull({
  proposal,
  onStartChat,
}: ProposalFullProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-2xl bg-white shadow-lg border border-sdlp-border overflow-hidden">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="bg-gradient-to-r from-sdlp-primary to-sdlp-accent p-6 text-white text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: DURATION.normal, ease: EASE }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 mb-3"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <div className="text-sm font-medium text-white/80 mb-1">
            AI開発提案書
          </div>
          <h2 className="text-xl font-bold mb-2">あなた専用の開発提案書</h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: DURATION.normal, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm"
          >
            <span>複雑度:</span>
            <span className="font-bold">{proposal.complexityTier}</span>
            <span className="mx-1">|</span>
            <span>概算:</span>
            <span className="font-bold">
              {formatPrice(proposal.formulaEstimate.minPrice)} 〜{' '}
              {formatPrice(proposal.formulaEstimate.maxPrice)}
            </span>
          </motion.div>
        </motion.div>

        {/* Full Proposal Content */}
        <motion.div variants={fadeInUp} className="p-6 sm:p-8">
          <div className="prose prose-sm max-w-none text-sdlp-text prose-headings:text-sdlp-text prose-h1:text-xl prose-h1:font-bold prose-h2:text-lg prose-h2:font-bold prose-h2:border-b prose-h2:border-sdlp-border prose-h2:pb-2 prose-h2:mb-4 prose-h2:mt-8 prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6 prose-table:text-sm prose-th:bg-sdlp-bg-card prose-th:px-3 prose-th:py-2 prose-th:text-left prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-sdlp-border/50 prose-ul:space-y-1 prose-li:text-sdlp-text-secondary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {proposal.fullMarkdown}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="mx-6 border-t border-sdlp-border/50" />

        {/* Chat CTA */}
        <motion.div
          variants={fadeInUp}
          className="p-6 text-center bg-gradient-to-b from-sdlp-bg-card to-white"
        >
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sdlp-primary/10 mb-3">
            <MessageCircle className="h-5 w-5 text-sdlp-primary" />
          </div>
          <p className="text-sm font-medium text-sdlp-text mb-1">
            提案内容について質問がありますか？
          </p>
          <p className="text-xs text-sdlp-text-secondary mb-4">
            AIコンサルタントがリアルタイムでお答えします
          </p>
          <motion.button
            type="button"
            onClick={onStartChat}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-xl bg-sdlp-primary px-6 py-3 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors shadow-md shadow-sdlp-primary/20"
          >
            <MessageCircle className="h-4 w-4" />
            AIコンサルタントに相談する
          </motion.button>
        </motion.div>

        {/* Divider */}
        <div className="mx-6 border-t border-sdlp-border/50" />

        {/* Contact CTA */}
        <motion.div
          variants={fadeInUp}
          className="p-6 text-center"
        >
          <p className="text-xs text-sdlp-text-secondary mb-3">
            具体的なご相談はこちらから
          </p>
          <motion.a
            href="mailto:contact@nands.tech"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sdlp-primary to-sdlp-accent px-8 py-3.5 text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-sdlp-primary/25"
          >
            NANDSに問い合わせる
            <ExternalLink className="h-3.5 w-3.5" />
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  )
}
