'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, CheckCircle, XCircle, Loader, ChevronDown } from 'lucide-react'
import type { LangSmithTrace } from '../use-langsmith-data'

const COLORS = {
  card: '#182f34',
  cardInner: '#102023',
  border: '#224249',
  accent: '#06B6D4',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
  textDim: '#56737a',
  success: '#10B981',
  error: '#EF4444',
} as const

const PLATFORM_TAG_COLORS: Record<string, string> = {
  x: '#FFFFFF',
  linkedin: '#0077B5',
  instagram: '#E1306C',
  blog: '#F97316',
  cron: '#8B5CF6',
  'slack-bot': '#06B6D4',
  interactive: '#06B6D4',
  'image-gen': '#F59E0B',
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function StatusIndicator({ status }: { readonly status: string }) {
  if (status === 'error') {
    return <XCircle size={14} style={{ color: COLORS.error }} />
  }
  if (status === 'pending' || status === 'running') {
    return (
      <div className="animate-pulse">
        <Loader size={14} className="animate-spin" style={{ color: COLORS.accent }} />
      </div>
    )
  }
  return <CheckCircle size={14} style={{ color: COLORS.success }} />
}

function getStatusColor(status: string): string {
  if (status === 'error') return '#EF4444'
  if (status === 'running' || status === 'pending') return '#06B6D4'
  return '#10B981'
}

const LANGSMITH_BASE = 'https://smith.langchain.com'

interface AgentTraceTimelineProps {
  readonly traces: readonly LangSmithTrace[]
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
} as const

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
} as const

export default function AgentTraceTimeline({ traces }: AgentTraceTimelineProps) {
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(8)

  if (traces.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <div style={{ animation: 'float 3s ease-in-out infinite' }}>
          <span className="text-3xl">🔍</span>
        </div>
        <p className="text-sm mt-3" style={{ color: COLORS.textMuted }}>
          No traces yet. LangSmith data will appear after agent executions.
        </p>
        <style jsx>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
      </div>
    )
  }

  const visibleTraces = traces.slice(0, visibleCount)
  const hasMore = traces.length > visibleCount

  return (
    <motion.div
      className="space-y-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {visibleTraces.map((trace) => (
        <motion.div
          key={trace.id}
          variants={itemVariants}
          className="group rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderLeft: `3px solid ${getStatusColor(trace.status)}`,
            ...(trace.status === 'error' ? { boxShadow: '0 0 12px rgba(239,68,68,0.08)' } : {}),
          }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <div className="absolute inset-0 blur-sm opacity-40 rounded-full" style={{
                    background: getStatusColor(trace.status),
                  }} />
                  <StatusIndicator status={trace.status} />
                </div>
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: COLORS.text }}
                >
                  {trace.name}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs tabular-nums" style={{ color: COLORS.textMuted }}>
                  {formatLatency(trace.latencyMs)}
                </span>
                <span className="text-xs tabular-nums" style={{ color: COLORS.textDim }}>
                  {trace.totalTokens > 0 ? `${trace.totalTokens.toLocaleString()} tok` : ''}
                </span>
                <a
                  href={`${LANGSMITH_BASE}/o/default/projects/p/nands-sns-pipeline/r/${trace.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: COLORS.accent }}
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {trace.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                  style={{
                    background: `${PLATFORM_TAG_COLORS[tag] ?? COLORS.accent}15`,
                    color: PLATFORM_TAG_COLORS[tag] ?? COLORS.accent,
                    border: `1px solid ${PLATFORM_TAG_COLORS[tag] ?? COLORS.accent}30`,
                    boxShadow: `0 0 4px ${PLATFORM_TAG_COLORS[tag] ?? COLORS.accent}15`,
                  }}
                >
                  {tag}
                </span>
              ))}

              {trace.toolCalls.length > 0 && (
                <button
                  onClick={() => setExpandedTrace(expandedTrace === trace.id ? null : trace.id)}
                  className="flex items-center gap-1 text-[10px]"
                  style={{ color: COLORS.textDim }}
                >
                  <ChevronDown size={10} style={{
                    transform: expandedTrace === trace.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }} />
                  {trace.toolCalls.length} tool{trace.toolCalls.length !== 1 ? 's' : ''}
                </button>
              )}

              <span
                className="ml-auto text-[10px]"
                style={{ color: COLORS.textDim }}
              >
                {formatTimeAgo(trace.startTime)}
              </span>
            </div>

            <AnimatePresence>
              {expandedTrace === trace.id && trace.toolCalls.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1 mt-2 pt-2" style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    {trace.toolCalls.map((tool) => (
                      <span key={tool} className="px-1.5 py-0.5 rounded text-[9px] font-mono"
                        style={{ background: `${COLORS.accent}10`, color: COLORS.textMuted, border: `1px solid ${COLORS.accent}15` }}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {trace.error && (
              <p
                className="mt-2 text-[11px] truncate"
                style={{ color: COLORS.error }}
              >
                {trace.error}
              </p>
            )}

            {trace.latencyMs > 0 && (
              <div className="mt-2">
                <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${Math.min((trace.latencyMs / 15000) * 100, 100)}%`,
                    background: trace.latencyMs < 5000 ? '#10B981' :
                      trace.latencyMs < 15000 ? '#F59E0B' : '#EF4444',
                  }} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {hasMore && (
        <button
          onClick={() => setVisibleCount(v => v + 8)}
          className="w-full py-2.5 rounded-lg text-xs font-medium transition-colors"
          style={{ background: `${COLORS.accent}08`, color: COLORS.accent, border: `1px solid ${COLORS.accent}20` }}
        >
          Show {traces.length - visibleCount} more traces
        </button>
      )}
    </motion.div>
  )
}
