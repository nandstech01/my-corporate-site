'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyData {
  date: string;
  total_count: number;
  success_count: number;
}

interface StatsDailyChartProps {
  data: DailyData[];
  isLoading?: boolean;
  isDark?: boolean;
}

export default function StatsDailyChart({ data, isLoading, isDark = true }: StatsDailyChartProps) {
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#64748b' : '#94a3b8';
  const tooltipBg = isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)';
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
          日次分析件数推移
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p style={{ color: textColor }}>データがありません</p>
        </div>
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
    }),
  }));

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
        日次分析件数推移
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="displayDate"
            stroke={textColor}
            tick={{ fill: textColor }}
          />
          <YAxis stroke={textColor} tick={{ fill: textColor }} />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '12px',
              color: isDark ? '#fff' : '#0f172a',
            }}
            labelStyle={{ color: textColor }}
          />
          <Legend
            wrapperStyle={{ color: textColor }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="total_count"
            stroke="#a855f7"
            strokeWidth={2}
            name="総分析数"
            dot={{ fill: '#a855f7', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="success_count"
            stroke="#22d3ee"
            strokeWidth={2}
            name="成功数"
            dot={{ fill: '#22d3ee', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

