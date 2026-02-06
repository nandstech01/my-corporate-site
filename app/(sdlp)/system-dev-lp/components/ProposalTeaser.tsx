'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ProposalResult } from '../lib/ai/types'
import { formatPrice } from '../lib/estimateCalculator'

interface ProposalTeaserProps {
  proposal: ProposalResult
  onUnlock: () => void
}

export default function ProposalTeaser({
  proposal,
  onUnlock,
}: ProposalTeaserProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-2xl bg-white shadow-lg border border-sdlp-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sdlp-primary to-sdlp-accent p-6 text-white text-center">
          <div className="text-sm font-medium text-white/80 mb-1">
            AI開発提案書
          </div>
          <h2 className="text-xl font-bold mb-2">
            あなた専用の提案書が完成しました
          </h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm">
            <span>複雑度:</span>
            <span className="font-bold">{proposal.complexityTier}</span>
            <span className="mx-1">|</span>
            <span>概算:</span>
            <span className="font-bold">
              {formatPrice(proposal.formulaEstimate.minPrice)} 〜{' '}
              {formatPrice(proposal.formulaEstimate.maxPrice)}
            </span>
          </div>
        </div>

        {/* Teaser Content */}
        <div className="p-6 relative">
          <div className="prose prose-sm max-w-none text-sdlp-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {proposal.teaser}
            </ReactMarkdown>
          </div>

          {/* Blur overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent" />
        </div>

        {/* Unlock CTA */}
        <div className="px-6 pb-6 text-center -mt-8 relative z-10">
          <p className="text-sm text-sdlp-text-secondary mb-3">
            詳細な技術スタック・開発計画・リスク分析を含む完全版を見る
          </p>
          <button
            type="button"
            onClick={onUnlock}
            className="w-full rounded-xl bg-sdlp-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors"
          >
            メールアドレスを入力して全文を見る
          </button>
        </div>
      </div>
    </motion.div>
  )
}
