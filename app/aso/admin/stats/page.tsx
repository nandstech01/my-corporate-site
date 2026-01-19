'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  FileSearch,
  Activity,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAsoTheme } from '@/app/aso/context';

interface OverviewStats {
  totalTenants: number;
  totalUsers: number;
  totalAnalyses: number;
  periodAnalyses: number;
  activeTenantsCount: number;
  avgScore: number;
  successRate: number;
}

interface StatusCounts {
  processing: number;
  completed: number;
  failed: number;
  expired: number;
}

interface SubscriptionCounts {
  starter: number;
  pro: number;
  enterprise: number;
}

interface DailyChartData {
  date: string;
  total: number;
  completed: number;
  failed: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function StatsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [subscriptionCounts, setSubscriptionCounts] = useState<SubscriptionCounts | null>(null);
  const [dailyChartData, setDailyChartData] = useState<DailyChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  const fetchStats = async (selectedPeriod: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`/api/aso/admin/stats?period=${selectedPeriod}`, {
        credentials: 'include',
        headers: session?.access_token
          ? { 'Authorization': `Bearer ${session.access_token}` }
          : {},
      });

      if (response.ok) {
        const data = await response.json();
        setOverview(data.overview);
        setStatusCounts(data.statusCounts);
        setSubscriptionCounts(data.subscriptionCounts);
        setDailyChartData(data.dailyChartData);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period);
  }, [period]);

  const maxDailyTotal = Math.max(...dailyChartData.map(d => d.total), 1);

  const kpiCards = [
    { icon: Building2, label: '総テナント', value: overview?.totalTenants || 0, color: '#f97316' },
    { icon: Users, label: '総ユーザー', value: overview?.totalUsers || 0, color: '#22d3ee' },
    { icon: FileSearch, label: '総分析', value: overview?.totalAnalyses || 0, color: '#a855f7' },
    { icon: Activity, label: 'アクティブ', value: overview?.activeTenantsCount || 0, color: '#22c55e' },
    { icon: TrendingUp, label: '平均スコア', value: overview?.avgScore || 0, color: '#3b82f6' },
    { icon: BarChart3, label: '成功率', value: `${overview?.successRate || 0}%`, color: '#ec4899' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500"></div>
          <p className="mt-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ヘッダー */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,197,94,0.2))'
            }}
          >
            <BarChart3 className="w-6 h-6" style={{ color: '#a855f7' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              システム統計
            </h1>
            <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              プラットフォーム全体の分析
            </p>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="flex gap-2">
          {[
            { value: '7d', label: '7日間' },
            { value: '30d', label: '30日間' },
            { value: '90d', label: '90日間' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: period === opt.value
                  ? 'linear-gradient(135deg, #a855f7, #22c55e)'
                  : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: period === opt.value ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={itemVariants}
              className="p-4 rounded-xl"
              style={{
                background: isDark
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(255,255,255,0.8)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                {card.value}
              </div>
              <div
                className="text-sm"
                style={{ color: isDark ? '#64748b' : '#94a3b8' }}
              >
                {card.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 日別グラフ */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-6"
        style={{
          background: isDark
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5" style={{ color: '#a855f7' }} />
          <h2
            className="text-lg font-semibold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            日別分析数
          </h2>
        </div>

        {dailyChartData.length === 0 ? (
          <div
            className="h-48 flex items-center justify-center"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            データがありません
          </div>
        ) : (
          <div className="space-y-4">
            {/* 凡例 */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: '#22c55e' }} />
                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>完了</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: '#ef4444' }} />
                <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>失敗</span>
              </div>
            </div>

            {/* バーチャート */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {dailyChartData.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div
                    className="w-24 text-sm flex-shrink-0"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    {new Date(day.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 h-6 flex gap-0.5 rounded overflow-hidden">
                    {day.completed > 0 && (
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(day.completed / maxDailyTotal) * 100}%`,
                          background: '#22c55e',
                        }}
                      />
                    )}
                    {day.failed > 0 && (
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(day.failed / maxDailyTotal) * 100}%`,
                          background: '#ef4444',
                        }}
                      />
                    )}
                    {day.total - day.completed - day.failed > 0 && (
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${((day.total - day.completed - day.failed) / maxDailyTotal) * 100}%`,
                          background: '#f59e0b',
                        }}
                      />
                    )}
                  </div>
                  <div
                    className="w-12 text-right text-sm font-medium"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    {day.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ステータス・サブスクリプション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ステータス分布 */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6"
          style={{
            background: isDark
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5" style={{ color: '#22d3ee' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              ジョブステータス分布
            </h2>
          </div>

          {statusCounts && (
            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => {
                const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colors: Record<string, string> = {
                  processing: '#f59e0b',
                  completed: '#22c55e',
                  failed: '#ef4444',
                  expired: '#64748b',
                };
                const labels: Record<string, string> = {
                  processing: '処理中',
                  completed: '完了',
                  failed: '失敗',
                  expired: '期限切れ',
                };

                return (
                  <div key={status}>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                        {labels[status] || status}
                      </span>
                      <span style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          background: colors[status],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* サブスクリプション分布 */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6"
          style={{
            background: isDark
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5" style={{ color: '#f97316' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              サブスクリプション分布
            </h2>
          </div>

          {subscriptionCounts && (
            <div className="space-y-4">
              {Object.entries(subscriptionCounts).map(([tier, count]) => {
                const total = Object.values(subscriptionCounts).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colors: Record<string, string> = {
                  starter: '#22d3ee',
                  pro: '#a855f7',
                  enterprise: '#f97316',
                };
                const labels: Record<string, string> = {
                  starter: 'Starter',
                  pro: 'Pro',
                  enterprise: 'Enterprise',
                };

                return (
                  <div key={tier}>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                        {labels[tier] || tier}
                      </span>
                      <span style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          background: colors[tier],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* 期間内の分析数 */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-6"
        style={{
          background: isDark
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <div className="text-center">
          <div
            className="text-4xl font-bold mb-2"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            {overview?.periodAnalyses || 0}
          </div>
          <div style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            過去{period === '7d' ? '7日間' : period === '30d' ? '30日間' : '90日間'}の分析数
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
