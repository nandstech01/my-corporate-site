'use client'

import { TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { XGrowthMetricRow } from '../types'

interface XGrowthChartProps {
  readonly growthMetrics: readonly XGrowthMetricRow[]
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

export default function XGrowthChart({ growthMetrics }: XGrowthChartProps) {
  const sorted = [...growthMetrics].sort((a, b) => a.date.localeCompare(b.date))

  const chartData = sorted.map(m => ({
    date: m.date.slice(5),
    followers: m.followers_count,
    change: m.daily_follower_change,
  }))

  const latest = sorted[sorted.length - 1]
  const dailyChange = latest?.daily_follower_change ?? 0
  const avgER = sorted.length > 0
    ? sorted.reduce((sum, m) => sum + m.avg_engagement_rate, 0) / sorted.length
    : 0

  if (growthMetrics.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} style={{ color: '#22C55E' }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
            X Growth
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="text-sm" style={{ color: COLORS.textDim }}>No growth data yet</span>
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
        <TrendingUp size={14} style={{ color: '#22C55E' }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          X Growth
        </span>
      </div>

      {/* KPI Row */}
      <div className="flex gap-3 mb-4">
        <div className="px-3 py-1.5 rounded-lg" style={{ background: COLORS.cardInner }}>
          <span className="block text-[10px]" style={{ color: COLORS.textMuted }}>Followers</span>
          <span className="block text-sm font-bold" style={{ color: COLORS.text }}>
            {latest?.followers_count?.toLocaleString() ?? '—'}
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-lg" style={{ background: COLORS.cardInner }}>
          <span className="block text-[10px]" style={{ color: COLORS.textMuted }}>Daily Change</span>
          <span className="block text-sm font-bold" style={{ color: dailyChange >= 0 ? '#22C55E' : '#EF4444' }}>
            {dailyChange >= 0 ? '\u2191' : '\u2193'} {Math.abs(dailyChange)}
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-lg" style={{ background: COLORS.cardInner }}>
          <span className="block text-[10px]" style={{ color: COLORS.textMuted }}>Avg ER</span>
          <span className="block text-sm font-bold" style={{ color: COLORS.accent }}>
            {avgER.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Area Chart */}
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: COLORS.textDim }} />
            <YAxis tick={{ fontSize: 9, fill: COLORS.textDim }} width={50} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              contentStyle={{
                background: COLORS.cardInner,
                border: 'none',
                borderRadius: 8,
                fontSize: 11,
                color: COLORS.text,
              }}
              formatter={(value: number, name: string) => [
                name === 'followers' ? value.toLocaleString() : value,
                name === 'followers' ? 'Followers' : 'Daily Change',
              ]}
            />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="#22C55E"
              strokeWidth={1.5}
              fill="url(#growthGradient)"
              dot={false}
              activeDot={{ r: 3, fill: '#22C55E', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
