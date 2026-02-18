'use client'

import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

interface EngagementMiniChartProps {
  data: { date: string; value: number }[]
  color: string
}

const COLORS = {
  cardInner: '#102023',
  textMuted: '#6a8b94',
  textDim: '#56737a',
  text: '#F8FAFC',
} as const

export default function EngagementMiniChart({ data, color }: EngagementMiniChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: 60, color: COLORS.textDim }}
      >
        <span className="text-xs">No data</span>
      </div>
    )
  }

  const gradientId = `mini-gradient-${color.replace('#', '')}`

  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{
            background: COLORS.cardInner,
            border: 'none',
            borderRadius: 8,
            fontSize: 11,
            color: COLORS.text,
          }}
          labelStyle={{ color: COLORS.textMuted, fontSize: 10 }}
          itemStyle={{ color: COLORS.text }}
          formatter={(value: number) => [value, 'Value']}
          labelFormatter={(label: string) => label}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
