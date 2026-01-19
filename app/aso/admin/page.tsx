'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSearch,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
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

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [subscriptionCounts, setSubscriptionCounts] = useState<SubscriptionCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch('/api/aso/admin/stats?period=30d', {
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
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-orange-500/20 border-t-orange-500"></div>
          <p className="mt-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      icon: Building2,
      label: '総テナント数',
      value: overview?.totalTenants || 0,
      suffix: '',
      color: '#f97316',
      bgColor: 'rgba(249,115,22,0.1)',
    },
    {
      icon: Users,
      label: '総ユーザー数',
      value: overview?.totalUsers || 0,
      suffix: '',
      color: '#22d3ee',
      bgColor: 'rgba(34,211,238,0.1)',
    },
    {
      icon: FileSearch,
      label: '総分析件数',
      value: overview?.totalAnalyses || 0,
      suffix: '',
      color: '#a855f7',
      bgColor: 'rgba(168,85,247,0.1)',
    },
    {
      icon: TrendingUp,
      label: '今月の分析',
      value: overview?.periodAnalyses || 0,
      suffix: '',
      color: '#22c55e',
      bgColor: 'rgba(34,197,94,0.1)',
    },
  ];

  const secondaryStats = [
    {
      label: 'アクティブテナント',
      value: overview?.activeTenantsCount || 0,
      description: '過去7日間',
    },
    {
      label: '平均スコア',
      value: overview?.avgScore || 0,
      description: '全分析',
    },
    {
      label: '成功率',
      value: `${overview?.successRate || 0}%`,
      description: '完了/全体',
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
            background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.2))'
          }}
        >
          <LayoutDashboard className="w-6 h-6" style={{ color: '#f97316' }} />
        </div>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            管理ダッシュボード
          </h1>
          <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            プラットフォーム全体の概要
          </p>
        </div>
      </motion.div>

      {/* メインKPIカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
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

      {/* サブ統計 */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl"
            style={{
              background: isDark
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              {stat.value}
            </div>
            <div style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              {stat.label}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: isDark ? '#475569' : '#94a3b8' }}
            >
              {stat.description}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ステータス別・サブスクリプション別 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ジョブステータス */}
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
            className="p-6 border-b flex items-center justify-between"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
          >
            <h2
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              <Activity className="w-5 h-5" style={{ color: '#f97316' }} />
              ジョブステータス
            </h2>
            <Link
              href="/aso/admin/jobs"
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: '#f97316' }}
            >
              詳細
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6 space-y-3">
            {statusCounts && Object.entries(statusCounts).map(([status, count]) => {
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
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: colors[status] }}
                    />
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {labels[status] || status}
                    </span>
                  </div>
                  <span
                    className="font-semibold"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* サブスクリプション */}
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
            className="p-6 border-b flex items-center justify-between"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
          >
            <h2
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              <Building2 className="w-5 h-5" style={{ color: '#a855f7' }} />
              サブスクリプション
            </h2>
            <Link
              href="/aso/admin/tenants"
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: '#a855f7' }}
            >
              詳細
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6 space-y-3">
            {subscriptionCounts && Object.entries(subscriptionCounts).map(([tier, count]) => {
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
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: colors[tier] }}
                    />
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {labels[tier] || tier}
                    </span>
                  </div>
                  <span
                    className="font-semibold"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Link href="/aso/admin/tenants">
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
                    className="text-lg font-semibold mb-2"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    テナント管理
                  </h3>
                  <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    全テナントの一覧と管理
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.2))'
                  }}
                >
                  <Building2 className="w-6 h-6" style={{ color: '#f97316' }} />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/aso/admin/jobs">
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
                    className="text-lg font-semibold mb-2"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    ジョブ監視
                  </h3>
                  <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    分析ジョブのモニタリング
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))'
                  }}
                >
                  <Activity className="w-6 h-6" style={{ color: '#22d3ee' }} />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/aso/admin/stats">
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
                    className="text-lg font-semibold mb-2"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    システム統計
                  </h3>
                  <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    詳細な分析とグラフ
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,197,94,0.2))'
                  }}
                >
                  <TrendingUp className="w-6 h-6" style={{ color: '#a855f7' }} />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
