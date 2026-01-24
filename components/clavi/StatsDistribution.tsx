'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DistributionData {
  range: string;
  count: number;
}

interface StatsDistributionProps {
  data: DistributionData[];
  isLoading?: boolean;
  isDark?: boolean;
}

export default function StatsDistribution({ data, isLoading, isDark = true }: StatsDistributionProps) {
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#6a8b94' : '#94a3b8';
  const tooltipBg = isDark ? 'rgba(12,22,25,0.95)' : 'rgba(255,255,255,0.98)';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500"></div>
            <p className="mt-4" style={{ color: textColor }}>Loading chart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
        >
          スコア分布
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p style={{ color: textColor }}>データがありません</p>
        </div>
      </div>
    );
  }

  const getColor = (range: string) => {
    const minScore = parseInt(range.split('-')[0]);
    if (minScore >= 90) return '#22c55e';
    if (minScore >= 70) return '#22d3ee';
    if (minScore >= 50) return '#f59e0b';
    if (minScore >= 30) return '#f97316';
    return '#ef4444';
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold"
          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
        >
          スコア分布
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: '#22c55e' }} />
            <span style={{ color: textColor }}>良好</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: '#f59e0b' }} />
            <span style={{ color: textColor }}>改善余地</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: '#ef4444' }} />
            <span style={{ color: textColor }}>要改善</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="range"
            stroke={textColor}
            tick={{ fill: textColor }}
            label={{ value: 'スコア範囲', position: 'insideBottom', offset: -5, fill: textColor }}
          />
          <YAxis
            stroke={textColor}
            tick={{ fill: textColor }}
            label={{ value: '件数', angle: -90, position: 'insideLeft', fill: textColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '12px',
              color: isDark ? '#fff' : '#0f172a',
            }}
            labelStyle={{ color: textColor }}
            formatter={(value: number) => [`${value}件`, '分析数']}
          />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.range)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 統計サマリー */}
      <div
        className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>
            {data.filter(d => parseInt(d.range.split('-')[0]) >= 70).reduce((sum, d) => sum + d.count, 0)}
          </div>
          <div className="text-xs mt-1" style={{ color: textColor }}>良好（70点以上）</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            {data.filter(d => {
              const min = parseInt(d.range.split('-')[0]);
              return min >= 50 && min < 70;
            }).reduce((sum, d) => sum + d.count, 0)}
          </div>
          <div className="text-xs mt-1" style={{ color: textColor }}>改善余地（50-69点）</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            {data.filter(d => parseInt(d.range.split('-')[0]) < 50).reduce((sum, d) => sum + d.count, 0)}
          </div>
          <div className="text-xs mt-1" style={{ color: textColor }}>要改善（50点未満）</div>
        </div>
      </div>
    </div>
  );
}

