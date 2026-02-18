'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { Coins, Cpu, DollarSign, CheckCircle } from 'lucide-react'
import type { ComponentType } from 'react'
import type { DailyTokenUsage, LangSmithStats } from '../use-langsmith-data'

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
  prompt: '#06B6D4',
  completion: '#10B981',
} as const

interface KpiItem {
  readonly label: string
  readonly value: string
  readonly color: string
  readonly icon: ComponentType<{ className?: string; style?: React.CSSProperties }>
  readonly progress: number
}

function buildKpis(stats: LangSmithStats): readonly KpiItem[] {
  const totalPrompt = stats.dailyTokens.reduce((s, d) => s + d.promptTokens, 0)
  const totalCompletion = stats.dailyTokens.reduce((s, d) => s + d.completionTokens, 0)
  const totalCost = stats.dailyTokens.reduce((s, d) => s + d.estimatedCost, 0)
  const maxTokens = Math.max(totalPrompt, totalCompletion, 1)

  return [
    {
      label: 'Prompt Tokens',
      value: totalPrompt.toLocaleString(),
      color: COLORS.prompt,
      icon: Cpu,
      progress: (totalPrompt / maxTokens) * 100,
    },
    {
      label: 'Completion Tokens',
      value: totalCompletion.toLocaleString(),
      color: COLORS.completion,
      icon: Cpu,
      progress: (totalCompletion / maxTokens) * 100,
    },
    {
      label: 'Est. Cost (7d)',
      value: `$${totalCost.toFixed(2)}`,
      color: '#F59E0B',
      icon: DollarSign,
      progress: 50,
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      color: stats.successRate >= 95 ? '#10B981' : '#F59E0B',
      icon: CheckCircle,
      progress: stats.successRate,
    },
  ]
}

interface CustomTooltipProps {
  readonly active?: boolean
  readonly payload?: readonly { payload: DailyTokenUsage }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null
  const data = payload[0].payload

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{
        background: COLORS.cardInner,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <p className="font-medium mb-1" style={{ color: COLORS.text }}>{data.date}</p>
      <p style={{ color: COLORS.prompt }}>
        Prompt: {data.promptTokens.toLocaleString()}
      </p>
      <p style={{ color: COLORS.completion }}>
        Completion: {data.completionTokens.toLocaleString()}
      </p>
      <p style={{ color: '#F59E0B' }}>
        Cost: ${data.estimatedCost.toFixed(3)}
      </p>
    </div>
  )
}

interface TokenUsagePanelProps {
  readonly stats: LangSmithStats | null
}

export default function TokenUsagePanel({ stats }: TokenUsagePanelProps) {
  if (!stats || stats.dailyTokens.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center h-full flex items-center justify-center"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <p className="text-sm" style={{ color: COLORS.textMuted }}>
          No token usage data yet
        </p>
      </div>
    )
  }

  const kpis = buildKpis(stats)

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Coins size={14} style={{ color: COLORS.accent }} />
          <h3 className="text-sm font-bold" style={{ color: COLORS.text }}>
            Token Usage
          </h3>
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: COLORS.textMuted }}>
          Daily token consumption + cost estimate (7d)
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-4 pb-3">
        {kpis.map((kpi, index) => {
          const KpiIcon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="relative overflow-hidden rounded-lg px-3 py-2"
              style={{ background: COLORS.cardInner }}
            >
              <KpiIcon
                className="absolute top-2 right-2 w-8 h-8"
                style={{ color: kpi.color, opacity: 0.05 }}
              />
              <span
                className="block text-[9px] font-medium uppercase tracking-wider"
                style={{ color: COLORS.textDim }}
              >
                {kpi.label}
              </span>
              <span
                className="block text-base font-bold mt-0.5 tabular-nums"
                style={{ color: kpi.color }}
              >
                {kpi.value}
              </span>
              <div
                className="w-full h-1 rounded-full mt-2 overflow-hidden"
                style={{ background: `${kpi.color}15` }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${kpi.progress}%`,
                    background: kpi.color,
                    boxShadow: `0 0 8px ${kpi.color}`,
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="px-3 pb-4" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={stats.dailyTokens as DailyTokenUsage[]}
            margin={{ top: 5, right: 10, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="promptGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.prompt} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.prompt} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.completion} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.completion} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: COLORS.textDim, fontSize: 9 }}
              axisLine={{ stroke: COLORS.border }}
              tickLine={false}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis
              tick={{ fill: COLORS.textDim, fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="promptTokens"
              stroke={COLORS.prompt}
              fill="url(#promptGrad)"
              strokeWidth={1.5}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: COLORS.prompt,
                fill: COLORS.cardInner,
                style: { filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.6))' },
              }}
            />
            <Area
              type="monotone"
              dataKey="completionTokens"
              stroke={COLORS.completion}
              fill="url(#completionGrad)"
              strokeWidth={1.5}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: COLORS.completion,
                fill: COLORS.cardInner,
                style: { filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' },
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
