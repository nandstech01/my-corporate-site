'use client'

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import type { PlatformLatency } from '../use-langsmith-data'

const COLORS = {
  card: '#182f34',
  cardInner: '#102023',
  border: '#224249',
  borderSubtle: '#1e3a3f',
  accent: '#06B6D4',
  accentGlow: 'rgba(6,182,212,0.4)',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
  textDim: '#56737a',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#8B5CF6',
} as const

const PLATFORM_COLORS: Record<string, string> = {
  x: '#FFFFFF',
  linkedin: '#0077B5',
  instagram: '#E1306C',
  blog: '#F97316',
  cron: '#8B5CF6',
  agent: '#06B6D4',
}

function getHeatColor(ms: number): string {
  if (ms < 2000) return '#10B981'
  if (ms < 5000) return '#F59E0B'
  if (ms < 10000) return '#F97316'
  return '#EF4444'
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

interface LatencyHeatmapProps {
  readonly platformLatency: readonly PlatformLatency[]
}

export default function LatencyHeatmap({ platformLatency }: LatencyHeatmapProps) {
  if (platformLatency.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center h-full flex items-center justify-center"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <p className="text-sm" style={{ color: COLORS.textMuted }}>
          No latency data yet
        </p>
      </div>
    )
  }

  const maxLatency = Math.max(...platformLatency.map((p) => p.maxMs), 1)
  const totalRuns = platformLatency.reduce((sum, p) => sum + p.count, 0)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color: COLORS.accent }} />
          <h3 className="text-sm font-bold" style={{ color: COLORS.text }}>
            Latency by Platform
          </h3>
          <span
            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tabular-nums"
            style={{
              background: 'rgba(6,182,212,0.1)',
              color: '#06B6D4',
              border: '1px solid rgba(6,182,212,0.2)',
            }}
          >
            {totalRuns} runs
          </span>
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: COLORS.textMuted }}>
          Avg / P95 / Max response time (7d)
        </p>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {platformLatency.map((p, index) => {
          const color = PLATFORM_COLORS[p.platform] ?? COLORS.accent

          return (
            <motion.div
              key={p.platform}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: color,
                      boxShadow: `0 0 8px ${color}80`,
                    }}
                  />
                  <span className="text-xs font-medium capitalize" style={{ color: COLORS.text }}>
                    {p.platform}
                  </span>
                  <span className="text-[10px]" style={{ color: COLORS.textDim }}>
                    {p.count} runs
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] tabular-nums">
                  <span
                    className="px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${getHeatColor(p.avgMs)}15`,
                      color: getHeatColor(p.avgMs),
                      border: `1px solid ${getHeatColor(p.avgMs)}30`,
                    }}
                  >
                    avg {formatMs(p.avgMs)}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${getHeatColor(p.p95Ms)}15`,
                      color: getHeatColor(p.p95Ms),
                      border: `1px solid ${getHeatColor(p.p95Ms)}30`,
                    }}
                  >
                    p95 {formatMs(p.p95Ms)}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${getHeatColor(p.maxMs)}15`,
                      color: getHeatColor(p.maxMs),
                      border: `1px solid ${getHeatColor(p.maxMs)}30`,
                    }}
                  >
                    max {formatMs(p.maxMs)}
                  </span>
                </div>
              </div>

              <div
                className="relative w-full h-2.5 rounded-full overflow-hidden"
                style={{ background: `${color}08` }}
              >
                {/* Max bar (dim) */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(p.maxMs / maxLatency) * 100}%`,
                    background: `${color}15`,
                  }}
                />
                {/* P95 bar (medium) */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(p.p95Ms / maxLatency) * 100}%`,
                    background: `${color}40`,
                  }}
                />
                {/* Avg bar (glow primary) */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(p.avgMs / maxLatency) * 100}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    boxShadow: `0 0 8px ${color}40`,
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-4 px-4 py-2 text-[9px]"
        style={{ borderTop: `1px solid ${COLORS.border}` }}
      >
        <span className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#10B981', boxShadow: '0 0 4px #10B981' }}
          />
          <span style={{ color: COLORS.textDim }}>&lt;2s</span>
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#F59E0B', boxShadow: '0 0 4px #F59E0B' }}
          />
          <span style={{ color: COLORS.textDim }}>2-5s</span>
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#F97316', boxShadow: '0 0 4px #F97316' }}
          />
          <span style={{ color: COLORS.textDim }}>5-10s</span>
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#EF4444', boxShadow: '0 0 4px #EF4444' }}
          />
          <span style={{ color: COLORS.textDim }}>&gt;10s</span>
        </span>
      </div>
    </div>
  )
}
