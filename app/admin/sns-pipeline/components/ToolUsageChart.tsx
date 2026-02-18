'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
import type { ToolUsageStat } from '../use-langsmith-data'

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

const BAR_COLORS = [
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#EC4899',
  '#0077B5',
  '#F97316',
  '#14B8A6',
  '#6366F1',
  '#A855F7',
  '#FB923C',
]

function GlowBar(props: any) {
  const { x, y, width, height, fill } = props
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        fill={fill} opacity={0.15} rx={4}
        filter="url(#barGlow)"
      />
      <rect
        x={x} y={y} width={width} height={height}
        fill={fill} opacity={0.85} rx={4}
      />
    </g>
  )
}

interface CustomTooltipProps {
  readonly active?: boolean
  readonly payload?: readonly { payload: ToolUsageStat & { color?: string } }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null
  const data = payload[0].payload
  const barColor = data.color ?? COLORS.accent
  const successColor = data.successRate >= 95 ? COLORS.success : COLORS.warning

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{
        background: COLORS.cardInner,
        border: `1px solid ${COLORS.border}`,
        borderLeft: `3px solid ${barColor}`,
        boxShadow: `0 0 15px ${barColor}20`,
      }}
    >
      <p className="font-medium mb-1" style={{ color: COLORS.text }}>
        {data.name}
      </p>
      <p style={{ color: COLORS.textMuted }}>
        Calls: <span style={{ color: COLORS.text }}>{data.count}</span>
      </p>
      <p className="flex items-center gap-1.5" style={{ color: COLORS.textMuted }}>
        Success:{' '}
        <span className="inline-flex items-center gap-1" style={{ color: COLORS.text }}>
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: successColor, boxShadow: `0 0 4px ${successColor}` }}
          />
          {data.successRate.toFixed(0)}%
        </span>
      </p>
    </div>
  )
}

interface ToolUsageChartProps {
  readonly toolUsage: readonly ToolUsageStat[]
}

export default function ToolUsageChart({ toolUsage }: ToolUsageChartProps) {
  const data = toolUsage.slice(0, 12).map((item, index) => ({
    ...item,
    color: BAR_COLORS[index % BAR_COLORS.length],
  }))

  const totalCalls = data.reduce((sum, d) => sum + d.count, 0)

  if (data.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center h-full flex items-center justify-center"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <p className="text-sm" style={{ color: COLORS.textMuted }}>
          No tool usage data yet
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl overflow-hidden"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Wrench size={14} style={{ color: COLORS.accent }} />
          <h3 className="text-sm font-bold" style={{ color: COLORS.text }}>
            Tool Usage
          </h3>
          <span
            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tabular-nums"
            style={{
              background: 'rgba(6,182,212,0.1)',
              color: '#06B6D4',
              border: '1px solid rgba(6,182,212,0.2)',
            }}
          >
            {totalCalls} calls
          </span>
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: COLORS.textMuted }}>
          Top {data.length} tools by call count (7d)
        </p>
      </div>

      <div className="px-3 pb-4" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
          >
            <defs>
              <filter id="barGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <XAxis
              type="number"
              tick={{ fill: COLORS.textDim, fontSize: 10 }}
              axisLine={{ stroke: COLORS.border }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: COLORS.textMuted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: `${COLORS.accent}08` }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} shape={<GlowBar />}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
