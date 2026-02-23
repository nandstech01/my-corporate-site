'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, Zap } from 'lucide-react';

interface Proposal {
  fragment_id: string;
  category: string;
  action: 'keep' | 'revise' | 'optimize';
  score: number;
  reason: string;
  suggestions: string[];
  priority: 'high' | 'medium' | 'low';
}

interface ImprovementReport {
  summary: {
    total_fragments: number;
    keep_count: number;
    revise_count: number;
    optimize_count: number;
  };
  proposals: Proposal[];
}

interface Props {
  data: ImprovementReport | undefined;
  isDark: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const actionColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  keep: { bg: 'rgba(16,185,129,0.1)', text: '#059669', darkBg: 'rgba(16,185,129,0.15)', darkText: '#10B981' },
  revise: { bg: 'rgba(245,158,11,0.1)', text: '#D97706', darkBg: 'rgba(245,158,11,0.15)', darkText: '#FBBF24' },
  optimize: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626', darkBg: 'rgba(239,68,68,0.15)', darkText: '#EF4444' },
};

function ProposalCard({ proposal, isDark }: { proposal: Proposal; isDark: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const colors = actionColors[proposal.action] || actionColors.revise;

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: isDark ? '#1a3338' : '#F8FAFC',
        border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2 py-0.5 text-xs font-medium rounded-full"
            style={{
              background: isDark ? colors.darkBg : colors.bg,
              color: isDark ? colors.darkText : colors.text,
            }}
          >
            {proposal.action.toUpperCase()}
          </span>
          <span
            className="px-2 py-0.5 text-xs font-medium rounded-md"
            style={{
              background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF',
              color: '#06B6D4',
            }}
          >
            {proposal.category}
          </span>
          {proposal.priority === 'high' && (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#EF4444' }}>
              <Zap className="w-3 h-3" />
              High Priority
            </span>
          )}
        </div>
        <span
          className="text-sm font-bold shrink-0"
          style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
        >
          {proposal.score}/100
        </span>
      </div>

      <p className="text-sm" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
        {proposal.reason}
      </p>

      {proposal.suggestions.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: '#06B6D4' }}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {proposal.suggestions.length} suggestions
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {proposal.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="text-xs pl-3 border-l-2"
                    style={{
                      color: isDark ? '#90c1cb' : '#64748B',
                      borderColor: '#06B6D4',
                    }}
                  >
                    {s}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function ImprovementProposals({ data, isDark }: Props) {
  if (!data) {
    return (
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-8 text-center"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
        }}
      >
        <Lightbulb className="w-8 h-8 mx-auto mb-3" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
        <p className="text-sm" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
          分析を実行して改善提案を表示
        </p>
      </motion.div>
    );
  }

  const { summary, proposals } = data;
  const quickWins = proposals.filter((p) => p.priority === 'high');

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl p-6 space-y-5"
      style={{
        background: isDark ? '#182f34' : '#FFFFFF',
        border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
      }}
    >
      <h2 className="text-lg font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
        改善提案
      </h2>

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
          {summary.total_fragments} fragments:
        </span>
        <span
          className="px-2.5 py-1 text-xs font-medium rounded-full"
          style={{ background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)', color: isDark ? '#10B981' : '#059669' }}
        >
          Keep {summary.keep_count}
        </span>
        <span
          className="px-2.5 py-1 text-xs font-medium rounded-full"
          style={{ background: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)', color: isDark ? '#FBBF24' : '#D97706' }}
        >
          Revise {summary.revise_count}
        </span>
        <span
          className="px-2.5 py-1 text-xs font-medium rounded-full"
          style={{ background: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)', color: isDark ? '#EF4444' : '#DC2626' }}
        >
          Optimize {summary.optimize_count}
        </span>
      </div>

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#06B6D4' }}>
            <Zap className="w-4 h-4" />
            Quick Wins ({quickWins.length})
          </h3>
          <div className="space-y-3">
            {quickWins.map((p, i) => (
              <ProposalCard key={`qw-${i}`} proposal={p} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {/* All Proposals */}
      {proposals.length > quickWins.length && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            全提案 ({proposals.length})
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {proposals
              .filter((p) => p.priority !== 'high')
              .map((p, i) => (
                <ProposalCard key={`all-${i}`} proposal={p} isDark={isDark} />
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
