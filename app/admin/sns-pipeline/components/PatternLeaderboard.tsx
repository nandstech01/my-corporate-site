'use client'

import { Trophy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import type { PatternPerformanceRow } from '../types'
import type { BanditMetrics } from '../use-learning-data'

interface PatternLeaderboardProps {
  readonly patterns: readonly PatternPerformanceRow[]
  readonly banditMetrics?: BanditMetrics
}

const COLORS = {
  card: '#182f34',
  cardInner: '#102023',
  border: '#224249',
  accent: '#06B6D4',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
  textDim: '#56737a',
} as const

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'] as const

const PLATFORM_BADGE: Record<string, { bg: string; color: string }> = {
  x: { bg: '#FFFFFF20', color: '#FFFFFF' },
  linkedin: { bg: '#0077B520', color: '#0077B5' },
  instagram: { bg: '#E1306C20', color: '#E1306C' },
  threads: { bg: '#99999920', color: '#999999' },
} as const

function computeWinRate(successes: number, failures: number): number {
  return (successes + 1) / (successes + failures + 2)
}

export default function PatternLeaderboard({ patterns, banditMetrics }: PatternLeaderboardProps) {
  const sorted = [...patterns]
    .map(p => ({ ...p, winRate: computeWinRate(p.successes, p.failures) }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 15)

  const chartData = sorted.slice(0, 10).map(p => ({
    name: p.pattern_id.length > 16 ? p.pattern_id.slice(0, 14) + '…' : p.pattern_id,
    winRate: Math.round(p.winRate * 100),
  }))

  if (patterns.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={14} style={{ color: '#FFD700' }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
            Pattern Leaderboard
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="text-sm" style={{ color: COLORS.textDim }}>No pattern data yet</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={14} style={{ color: '#FFD700' }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          Pattern Leaderboard
        </span>
        <span className="text-[10px]" style={{ color: COLORS.textMuted }}>
          {patterns.length} patterns
        </span>
      </div>

      {banditMetrics && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, background: COLORS.cardInner, borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ color: COLORS.textDim, fontSize: 11 }}>Exploitation Ratio</div>
            <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700 }}>
              {(banditMetrics.exploitationRatio * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ flex: 1, background: COLORS.cardInner, borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ color: COLORS.textDim, fontSize: 11 }}>Avg Win Rate</div>
            <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700 }}>
              {(banditMetrics.avgWinRate * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ flex: 1, background: COLORS.cardInner, borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ color: COLORS.textDim, fontSize: 11 }}>Data Health</div>
            <div style={{
              color: banditMetrics.dataHealth === 'converged' ? '#22C55E' : banditMetrics.dataHealth === 'learning' ? '#EAB308' : '#EF4444',
              fontSize: 14, fontWeight: 600
            }}>
              {banditMetrics.dataHealth === 'converged' ? 'Converged' : banditMetrics.dataHealth === 'learning' ? 'Learning' : banditMetrics.dataHealth === 'cold_start' ? 'Cold Start' : 'No Data'}
              <span style={{ color: COLORS.textDim, fontSize: 11, marginLeft: 6 }}>
                ({banditMetrics.patternsWithData}/{banditMetrics.totalPatterns})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Win Rate Bar Chart */}
      <div className="mb-4" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: COLORS.textDim }} />
            <Tooltip
              contentStyle={{
                background: COLORS.cardInner,
                border: 'none',
                borderRadius: 8,
                fontSize: 11,
                color: COLORS.text,
              }}
              formatter={(value: number) => [`${value}%`, 'Win Rate']}
            />
            <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={index < 3 ? MEDAL_COLORS[index] : COLORS.accent}
                  opacity={index < 3 ? 0.9 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top patterns table */}
      <div
        className="rounded-lg p-3 space-y-2"
        style={{ background: COLORS.cardInner }}
      >
        {sorted.slice(0, 5).map((pattern, i) => (
          <div key={pattern.id} className="flex items-center gap-2">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: i < 3 ? `${MEDAL_COLORS[i]}30` : `${COLORS.textDim}20`,
                color: i < 3 ? MEDAL_COLORS[i] : COLORS.textMuted,
              }}
            >
              {i + 1}
            </span>
            <span className="flex-1 text-xs font-medium truncate" style={{ color: COLORS.text }}>
              {pattern.pattern_id}
            </span>
            {pattern.platform && PLATFORM_BADGE[pattern.platform] && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{
                  background: PLATFORM_BADGE[pattern.platform].bg,
                  color: PLATFORM_BADGE[pattern.platform].color,
                }}
              >
                {pattern.platform}
              </span>
            )}
            <span className="text-[10px] font-medium" style={{ color: COLORS.accent }}>
              {(pattern.winRate * 100).toFixed(0)}%
            </span>
            <span className="text-[10px]" style={{ color: COLORS.textDim }}>
              {pattern.total_uses} uses
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
