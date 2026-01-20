'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { LayoutDashboard, TrendingUp, CheckCircle, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAsoTheme } from '@/app/aso/context';

interface DashboardStats {
  total_analyses: number;
  success_rate: number;
  average_score: number;
  this_month_count: number;
}

interface RecentAnalysis {
  id: string;
  url: string;
  status: string;
  ai_structure_score: number | null;
  created_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        const headers: HeadersInit = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch('/api/aso/analyses?limit=100', {
          credentials: 'include',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          const analyses = data.analyses || [];

          const totalCount = analyses.length;
          const completedAnalyses = analyses.filter((a: any) => a.status === 'completed');
          const successRate = totalCount > 0 ? (completedAnalyses.length / totalCount) * 100 : 0;
          const avgScore = completedAnalyses.length > 0
            ? completedAnalyses.reduce((sum: number, a: any) => sum + (a.ai_structure_score || 0), 0) / completedAnalyses.length
            : 0;

          const now = new Date();
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const thisMonthCount = analyses.filter((a: any) =>
            new Date(a.created_at) >= thisMonthStart
          ).length;

          setStats({
            total_analyses: totalCount,
            success_rate: Math.round(successRate * 10) / 10,
            average_score: Math.round(avgScore * 10) / 10,
            this_month_count: thisMonthCount,
          });

          setRecentAnalyses(analyses.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500"></div>
          <p className="mt-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      icon: LayoutDashboard,
      label: '総分析件数',
      value: stats?.total_analyses || 0,
      suffix: '',
      color: '#a855f7',
      bgColor: 'rgba(168,85,247,0.1)',
    },
    {
      icon: CheckCircle,
      label: '成功率',
      value: stats?.success_rate || 0,
      suffix: '%',
      color: '#22d3ee',
      bgColor: 'rgba(34,211,238,0.1)',
    },
    {
      icon: TrendingUp,
      label: '平均スコア',
      value: stats?.average_score || 0,
      suffix: '',
      color: '#a855f7',
      bgColor: 'rgba(168,85,247,0.1)',
    },
    {
      icon: Activity,
      label: '今月の分析',
      value: stats?.this_month_count || 0,
      suffix: '',
      color: '#22d3ee',
      bgColor: 'rgba(34,211,238,0.1)',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ヘッダー */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'
          }}
        >
          <LayoutDashboard className="w-6 h-6" style={{ color: '#a855f7' }} />
        </div>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            ダッシュボード
          </h1>
          <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            KPI & 最近の分析概要
          </p>
        </div>
      </motion.div>

      {/* KPIカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative p-6 rounded-2xl transition-all cursor-default"
              style={{
                background: isDark
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(255,255,255,0.8)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                boxShadow: isDark
                  ? '0 4px 20px -4px rgba(0,0,0,0.3)'
                  : '0 4px 20px -4px rgba(0,0,0,0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: card.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              </div>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                {card.value}{card.suffix}
              </div>
              <div style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                {card.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 最近の分析 */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <div
          className="p-6 border-b"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              最近の分析
            </h2>
            <Link
              href="/aso/analyses"
              className="flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: '#a855f7' }}
            >
              すべて表示
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div>
          {recentAnalyses.length === 0 ? (
            <div
              className="p-12 text-center"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              まだ分析がありません。
              <Link href="/aso/analyses" className="ml-1" style={{ color: '#a855f7' }}>
                新規分析を開始
              </Link>
            </div>
          ) : (
            recentAnalyses.map((analysis, index) => (
              <Link
                key={analysis.id}
                href={`/aso/analyses/${analysis.id}`}
                className="block p-4 transition-colors"
                style={{
                  borderBottom: index < recentAnalyses.length - 1
                    ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
                    : 'none',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(0,0,0,0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      {analysis.url}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                    >
                      {new Date(analysis.created_at).toLocaleString('ja-JP')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 text-xs font-medium rounded-full"
                      style={{
                        background: analysis.status === 'completed'
                          ? 'rgba(34,211,238,0.1)'
                          : 'rgba(239,68,68,0.1)',
                        color: analysis.status === 'completed'
                          ? '#22d3ee'
                          : '#ef4444'
                      }}
                    >
                      {analysis.status === 'completed' ? '完了' : '失敗'}
                    </span>

                    {analysis.ai_structure_score !== null && (
                      <div className="text-right">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                        >
                          {analysis.ai_structure_score}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                        >
                          点
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </motion.div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Link href="/aso/analyses">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="p-6 rounded-2xl transition-all group"
              style={{
                background: isDark
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(255,255,255,0.8)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-lg font-semibold mb-2 transition-colors"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    新規分析を開始
                  </h3>
                  <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    URLを入力して構造化データを分析
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'
                  }}
                >
                  <ArrowRight className="w-6 h-6" style={{ color: '#a855f7' }} />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/aso/stats">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="p-6 rounded-2xl transition-all group"
              style={{
                background: isDark
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(255,255,255,0.8)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-lg font-semibold mb-2 transition-colors"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    統計を確認
                  </h3>
                  <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    詳細な分析統計とグラフを表示
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))'
                  }}
                >
                  <TrendingUp className="w-6 h-6" style={{ color: '#22d3ee' }} />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
