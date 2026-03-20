'use client'

import { AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { ModelDriftLogRow } from '../types'

interface ModelDriftMonitorProps {
  readonly driftLogs: readonly ModelDriftLogRow[]
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

function getDriftStatus(isDrifted: boolean): { color: string; label: string; bg: string } {
  if (isDrifted) return { color: '#EF4444', label: 'Drifted', bg: '#EF444420' }
  return { color: '#22C55E', label: 'Stable', bg: '#22C55E20' }
}

export default function ModelDriftMonitor({ driftLogs }: ModelDriftMonitorProps) {
  // Group by platform, get latest status for each
  const platformStatus = new Map<string, ModelDriftLogRow>()
  for (const log of driftLogs) {
    if (!platformStatus.has(log.platform)) {
      platformStatus.set(log.platform, log)
    }
  }

  // Chart data: rolling_mae vs training_mae over time
  const chartData = [...driftLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map(d => ({
      date: d.date.slice(5),
      rolling_mae: Number(d.rolling_mae.toFixed(4)),
      training_mae: Number(d.training_mae.toFixed(4)),
      platform: d.platform,
    }))

  if (driftLogs.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} style={{ color: '#EAB308' }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
            Model Drift Monitor
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="text-sm" style={{ color: COLORS.textDim }}>No drift data yet</span>
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
        <AlertTriangle size={14} style={{ color: '#EAB308' }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          Model Drift Monitor
        </span>
      </div>

      {/* Platform drift status badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[...platformStatus.entries()].map(([platform, log]) => {
          const status = getDriftStatus(log.is_drifted)
          return (
            <div
              key={platform}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: status.bg }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: status.color }}
              />
              <span className="text-xs font-medium" style={{ color: COLORS.text }}>
                {platform}
              </span>
              <span className="text-[9px]" style={{ color: status.color }}>
                {status.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Line Chart */}
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: COLORS.textDim }} />
            <YAxis tick={{ fontSize: 9, fill: COLORS.textDim }} width={40} />
            <Tooltip
              contentStyle={{
                background: COLORS.cardInner,
                border: 'none',
                borderRadius: 8,
                fontSize: 11,
                color: COLORS.text,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: COLORS.textMuted }} />
            <Line
              type="monotone"
              dataKey="rolling_mae"
              name="Rolling MAE"
              stroke="#EF4444"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="training_mae"
              name="Training MAE"
              stroke="#22C55E"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-3 flex gap-3">
        {[...platformStatus.entries()].map(([platform, log]) => (
          <div key={platform} className="text-[10px]" style={{ color: COLORS.textDim }}>
            {platform}: {log.sample_count} samples, last check {log.date}
          </div>
        ))}
      </div>
    </div>
  )
}
