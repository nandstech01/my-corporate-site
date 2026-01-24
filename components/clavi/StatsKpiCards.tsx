'use client';

import { LayoutDashboard, TrendingUp, CheckCircle, Activity } from 'lucide-react';

interface KpiData {
  total_analyses: number;
  success_rate: number;
  average_score: number;
  this_month_count: number;
}

interface StatsKpiCardsProps {
  data: KpiData | null;
  isLoading?: boolean;
  isDark?: boolean;
}

export default function StatsKpiCards({ data, isLoading, isDark = true }: StatsKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl animate-pulse"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl"
                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              />
              <div
                className="w-12 h-4 rounded"
                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              />
            </div>
            <div
              className="w-20 h-8 rounded mb-2"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            />
            <div
              className="w-24 h-4 rounded"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            />
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      icon: LayoutDashboard,
      label: '総分析件数',
      value: data?.total_analyses || 0,
      subLabel: 'Total',
      color: '#22d3ee',
      bgGradient: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.1))',
    },
    {
      icon: CheckCircle,
      label: '成功率',
      value: `${data?.success_rate?.toFixed(1) || 0}%`,
      subLabel: 'Success',
      color: '#22c55e',
      bgGradient: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
    },
    {
      icon: TrendingUp,
      label: '平均スコア',
      value: data?.average_score?.toFixed(1) || 0,
      subLabel: 'Average',
      color: '#a855f7',
      bgGradient: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.1))',
    },
    {
      icon: Activity,
      label: '今月の分析',
      value: data?.this_month_count || 0,
      subLabel: 'This Month',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="p-6 rounded-2xl transition-all hover:scale-[1.02]"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: kpi.bgGradient }}
              >
                <Icon className="w-6 h-6" style={{ color: kpi.color }} />
              </div>
              <span className="text-xs" style={{ color: isDark ? '#56737a' : '#94a3b8' }}>
                {kpi.subLabel}
              </span>
            </div>
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              {kpi.value}
            </div>
            <div className="text-sm" style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
              {kpi.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

