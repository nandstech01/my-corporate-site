'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Lock } from 'lucide-react'
import type { ProposalResult } from '../lib/ai/types'
import { formatPrice } from '../lib/estimateCalculator'

interface ProposalTeaserProps {
  proposal: ProposalResult
  onUnlock: () => void
}

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      staggerChildren: 0.15,
    },
  },
}

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export default function ProposalTeaser({
  proposal,
  onUnlock,
}: ProposalTeaserProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-2xl bg-white shadow-lg border border-sdlp-border overflow-hidden">
        {/* Header */}
        <motion.div
          variants={childVariants}
          className="bg-gradient-to-r from-sdlp-primary to-sdlp-accent p-6 text-white text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-sm font-medium text-white/80 mb-1"
          >
            AI開発提案書
          </motion.div>
          <h2 className="text-xl font-bold mb-2">
            あなた専用の提案書が完成しました
          </h2>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
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

        {/* Teaser Content */}
        <motion.div variants={childVariants} className="p-6 relative">
          <div className="prose prose-sm max-w-none text-sdlp-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {proposal.teaser}
            </ReactMarkdown>
          </div>

          {/* Blur overlay with gradient fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none"
          />
        </motion.div>

        {/* Unlock CTA */}
        <motion.div
          variants={childVariants}
          className="px-6 pb-6 text-center -mt-10 relative z-10"
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 text-xs text-sdlp-text-secondary mb-3 bg-gray-50 rounded-full px-3 py-1">
              <Lock className="h-3 w-3" />
              <span>詳細な技術スタック・開発計画・リスク分析を含む完全版</span>
            </div>
          </motion.div>
          <motion.button
            type="button"
            onClick={onUnlock}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-sdlp-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors shadow-md shadow-sdlp-primary/20"
          >
            メールアドレスを入力して全文を見る
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
