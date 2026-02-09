'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ProposalResult } from '../lib/ai/types'
import type { ServiceType } from '@/lib/services/types'
import { formatPrice } from '../lib/estimateCalculator'
import ConversionCTAs from './ConversionCTAs'
import { fadeInUp, staggerContainer, DURATION, EASE } from '@/lib/motion'

interface ProposalFullProps {
  proposal: ProposalResult
  serviceType?: ServiceType
  onStartChat: () => void
  email?: string
}

export default function ProposalFull({
  proposal,
  serviceType,
  onStartChat,
  email,
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

        {/* Conversion CTAs */}
        <motion.div
          variants={fadeInUp}
          className="p-6 bg-gradient-to-b from-sdlp-bg-card to-white"
        >
          <ConversionCTAs
            leadScoring={proposal.leadScoring}
            followUpStrategy={proposal.followUpStrategy}
            onStartChat={onStartChat}
            email={email}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
