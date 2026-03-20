'use client'

import { Target } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { PredictionAccuracyRow } from '../types'

interface AiJudgeAccuracyChartProps {
  readonly predictions: readonly PredictionAccuracyRow[]
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

function getMaeColor(mae: number): string {
  if (mae < 0.15) return '#22C55E'
  if (mae < 0.30) return '#EAB308'
  return '#EF4444'
}

export default function AiJudgeAccuracyChart({ predictions }: AiJudgeAccuracyChartProps) {
  // Group by day and compute average absolute_error
  const dailyMap: Record<string, { total: number; count: number }> = {}
  for (const p of predictions) {
    const day = (p.measured_at ?? p.posted_at).slice(0, 10)
    if (!dailyMap[day]) {
      dailyMap[day] = { total: 0, count: 0 }
    }
    dailyMap[day].total += p.absolute_error
    dailyMap[day].count += 1
  }

  const chartData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { total, count }]) => ({
      date,
      mae: Number((total / count).toFixed(4)),
    }))

  const currentMae = chartData.length > 0 ? chartData[chartData.length - 1].mae : 0
  const weekAgoMae = chartData.length >= 7 ? chartData[chartData.length - 7].mae : currentMae
  const trend = currentMae - weekAgoMae
  const maeColor = getMaeColor(currentMae)

  if (predictions.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} style={{ color: COLORS.accent }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
            AI Judge Accuracy
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="text-sm" style={{ color: COLORS.textDim }}>No prediction data yet</span>
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
        <Target size={14} style={{ color: COLORS.accent }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          AI Judge Accuracy
        </span>
        <span className="text-[10px]" style={{ color: COLORS.textMuted }}>
          {predictions.length} predictions
        </span>
      </div>

      {/* KPI Badges */}
      <div className="flex gap-3 mb-4">
        <div
          className="px-3 py-1.5 rounded-lg"
          style={{ background: `${maeColor}15`, border: `1px solid ${maeColor}30` }}
        >
          <span className="block text-[10px]" style={{ color: COLORS.textMuted }}>Current MAE</span>
          <span className="block text-sm font-bold" style={{ color: maeColor }}>
            {currentMae.toFixed(3)}
          </span>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg"
          style={{ background: COLORS.cardInner }}
        >
          <span className="block text-[10px]" style={{ color: COLORS.textMuted }}>7d Trend</span>
          <span className="block text-sm font-bold" style={{ color: trend <= 0 ? '#22C55E' : '#EF4444' }}>
            {trend <= 0 ? '↓' : '↑'} {Math.abs(trend).toFixed(3)}
          </span>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg"
          style={{ background: COLORS.cardInner }}
        >
          <span className="block text-[10px]" style={{ color: COLORS.textMuted }}>Total</span>
          <span className="block text-sm font-bold" style={{ color: COLORS.text }}>
            {predictions.length}
          </span>
        </div>
      </div>

      {/* Area Chart */}
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="maeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={maeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={maeColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: COLORS.textDim }} tickFormatter={(d: string) => d.slice(5)} />
            <YAxis tick={{ fontSize: 9, fill: COLORS.textDim }} width={40} />
            <Tooltip
              contentStyle={{
                background: COLORS.cardInner,
                border: 'none',
                borderRadius: 8,
                fontSize: 11,
                color: COLORS.text,
              }}
              formatter={(value: number) => [value.toFixed(4), 'MAE']}
              labelFormatter={(label: string) => label}
            />
            <Area
              type="monotone"
              dataKey="mae"
              stroke={maeColor}
              strokeWidth={1.5}
              fill="url(#maeGradient)"
              dot={false}
              activeDot={{ r: 3, fill: maeColor, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
