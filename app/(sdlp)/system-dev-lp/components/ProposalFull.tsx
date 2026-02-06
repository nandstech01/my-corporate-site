'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageCircle } from 'lucide-react'
import type { ProposalResult } from '../lib/ai/types'
import { formatPrice } from '../lib/estimateCalculator'

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
          <h2 className="text-xl font-bold mb-2">あなた専用の開発提案書</h2>
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

        {/* Full Proposal Content */}
        <div className="p-6 sm:p-8">
          <div className="prose prose-sm max-w-none text-sdlp-text prose-headings:text-sdlp-text prose-h2:text-lg prose-h2:font-bold prose-h2:border-b prose-h2:border-sdlp-border prose-h2:pb-2 prose-h2:mb-4 prose-h3:text-base prose-h3:font-semibold prose-table:text-sm prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {proposal.fullMarkdown}
            </ReactMarkdown>
          </div>
        </div>

        {/* Chat CTA */}
        <div className="border-t border-sdlp-border p-6 text-center bg-gray-50">
          <p className="text-sm text-sdlp-text-secondary mb-3">
            提案内容について質問がありますか？
          </p>
          <button
            type="button"
            onClick={onStartChat}
            className="inline-flex items-center gap-2 rounded-xl bg-sdlp-primary px-6 py-3 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            AIコンサルタントに相談する
          </button>
        </div>

        {/* Contact CTA */}
        <div className="border-t border-sdlp-border p-6 text-center">
          <a
            href="mailto:contact@nands.tech"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sdlp-primary to-sdlp-accent px-8 py-3.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            NANDSに問い合わせる
          </a>
        </div>
      </div>
    </motion.div>
  )
}
