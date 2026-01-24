'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { LayoutDashboard, TrendingUp, CheckCircle, Activity, ArrowRight, Plus, Maximize2, Info } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useClaviTheme } from '@/app/clavi/context';

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useClaviTheme();
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

        const response = await fetch('/api/clavi/analyses?limit=100', {
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
        // Dashboard data fetch failed silently
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#A5F3FC] border-t-[#06B6D4]" />
          <p className="mt-3 text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Loading...
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
      trend: stats?.total_analyses ? '+' + (stats.this_month_count || 0) : null,
      trendUp: true,
    },
    {
      icon: CheckCircle,
      label: '成功率',
      value: stats?.success_rate || 0,
      suffix: '%',
      trend: stats?.success_rate && stats.success_rate > 80 ? '良好' : null,
      trendUp: (stats?.success_rate || 0) > 50,
    },
    {
      icon: TrendingUp,
      label: '平均スコア',
      value: stats?.average_score || 0,
      suffix: '',
      trend: null,
      trendUp: true,
    },
    {
      icon: Activity,
      label: '今月の分析',
      value: stats?.this_month_count || 0,
      suffix: '',
      trend: null,
      trendUp: true,
    },
  ];

  // Generate node positions for the network graph
  const graphNodes = recentAnalyses.map((a, i) => {
    const angle = (i / Math.max(recentAnalyses.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = 38;
    return {
      id: a.id,
      url: a.url,
      score: a.ai_structure_score,
      status: a.status,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto w-full space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1
            className="text-3xl font-bold leading-tight tracking-tight"
            style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
          >
            ダッシュボード
          </h1>
          <p className="text-sm" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            KPI & 最近の分析概要
          </p>
        </div>
        <Link
          href="/clavi/analyses"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:-translate-y-0.5"
          style={{ background: '#06B6D4' }}
        >
          <Plus className="w-4 h-4" />
          新規分析
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex flex-col p-5 rounded-xl shadow-sm overflow-hidden group transition-all hover:shadow-md"
              style={{
                background: isDark ? '#182f34' : '#FFFFFF',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              }}
            >
              {/* Background watermark icon */}
              <div className="absolute -right-2 -top-2 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-20 h-20 text-[#06B6D4]" strokeWidth={1.2} />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                  {card.label}
                </span>
                <Info className="w-3.5 h-3.5 cursor-help" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
              </div>
              <div className="flex items-end gap-3">
                <span
                  className="text-3xl font-bold tracking-tight"
                  style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                >
                  {card.value}{card.suffix}
                </span>
                {card.trend && (
                  <span className={`text-sm font-medium mb-1 flex items-center gap-0.5 ${
                    card.trendUp ? 'text-emerald-500' : 'text-orange-500'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    {card.trend}
                  </span>
                )}
                {!card.trend && card.value === 0 && (
                  <span className="text-slate-400 text-sm font-medium mb-1">-</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analysis Network Graph */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl overflow-hidden shadow-lg"
        style={{
          background: isDark ? '#0c1619' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
        }}
      >
        {/* Graph Header */}
        <div
          className="flex items-center justify-between p-4 border-b backdrop-blur-sm"
          style={{
            background: isDark ? 'rgba(16,32,35,0.5)' : '#F8FAFC',
            borderColor: isDark ? '#224249' : '#E2E8F0',
          }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>分析マップ</h2>
            <span className="px-2 py-0.5 rounded text-xs font-medium border"
              style={{
                background: isDark ? 'rgba(6,182,212,0.2)' : '#ECFEFF',
                color: isDark ? '#60a5fa' : '#0891B2',
                borderColor: isDark ? 'rgba(6,182,212,0.3)' : '#A5F3FC',
              }}
            >
              Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded transition-colors" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Graph Body */}
        <div className="relative w-full h-[400px] overflow-hidden"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, #182f34, #0c1619)'
              : 'radial-gradient(circle at center, #F8FAFC, #EFF6FF)',
          }}
        >
          {/* Grid */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: isDark
                ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)'
                : 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrowBlue" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#06B6D4" />
              </marker>
              <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#10B981" />
              </marker>
              <marker id="arrowOrange" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
              </marker>
              <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#64748B" />
              </marker>
            </defs>

            {/* Connection lines from center to each node */}
            {graphNodes.map((node) => {
              const score = node.score || 0;
              const color = score >= 80 ? '#10B981' : score >= 50 ? '#06B6D4' : score > 0 ? '#F59E0B' : '#64748B';
              const markerId = score >= 80 ? 'arrowGreen' : score >= 50 ? 'arrowBlue' : score > 0 ? 'arrowOrange' : 'arrowGray';
              return (
                <line
                  key={node.id}
                  x1="50%" y1="50%"
                  x2={`${node.x}%`} y2={`${node.y}%`}
                  stroke={color}
                  strokeOpacity="0.5"
                  strokeWidth="2"
                  markerEnd={`url(#${markerId})`}
                />
              );
            })}

            {/* Decorative ring around center */}
            <circle cx="50%" cy="50%" r="28" fill="none" stroke="#06B6D4" strokeOpacity={isDark ? 0.15 : 0.25} strokeWidth="1" />
            <circle cx="50%" cy="50%" r="50" fill="none" stroke="#06B6D4" strokeOpacity={isDark ? 0.08 : 0.15} strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          {/* Central Node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{
                background: isDark ? '#182f34' : '#FFFFFF',
                border: '2px solid #06B6D4',
                boxShadow: isDark
                  ? '0 0 25px rgba(6,182,212,0.4), 0 0 50px rgba(6,182,212,0.1)'
                  : '0 0 25px rgba(6,182,212,0.2), 0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <div className="text-center">
                <div className="text-xl font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>{stats?.average_score || 0}</div>
                <div className="text-[9px] uppercase tracking-wider font-medium" style={{ color: isDark ? '#67E8F9' : '#0891B2' }}>Avg Score</div>
              </div>
            </div>
            <div
              className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm"
              style={{
                background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.8)',
                color: '#FFFFFF',
              }}
            >
              平均スコア
            </div>
          </div>

          {/* Surrounding Analysis Nodes */}
          {graphNodes.map((node) => {
            const score = node.score || 0;
            const borderColor = score >= 80 ? '#10B981' : score >= 50 ? '#06B6D4' : score > 0 ? '#F59E0B' : '#475569';
            const glowColor = score >= 80 ? 'rgba(16,185,129,0.3)' : score >= 50 ? 'rgba(6,182,212,0.3)' : 'rgba(245,158,11,0.2)';
            return (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <Link href={`/clavi/analyses/${node.id}`}>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: isDark ? '#182f34' : '#FFFFFF',
                      border: `2px solid ${borderColor}`,
                      boxShadow: isDark ? `0 0 12px ${glowColor}` : `0 2px 8px rgba(0,0,0,0.1), 0 0 8px ${glowColor}`,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
                      {score > 0 ? score : '?'}
                    </span>
                  </div>
                  {/* Tooltip */}
                  <div
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm max-w-[120px] truncate"
                    style={{
                      background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(15,23,42,0.85)',
                      color: '#FFFFFF',
                    }}>
                    {node.url.replace(/^https?:\/\//, '').split('/').pop() || node.url}
                  </div>
                </Link>
              </div>
            );
          })}

          {/* Empty state decorative nodes when no data */}
          {graphNodes.length === 0 && (
            <>
              {[
                { x: 30, y: 30 }, { x: 70, y: 25 }, { x: 75, y: 65 },
                { x: 25, y: 65 }, { x: 55, y: 20 },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div
                    className="w-10 h-10 rounded-full border border-dashed flex items-center justify-center"
                    style={{
                      background: isDark ? '#182f34' : '#FFFFFF',
                      borderColor: isDark ? '#475569' : '#CBD5E1',
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" style={{ color: isDark ? '#64748B' : '#94A3B8' }} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Legend */}
          <div
            className="absolute bottom-4 left-4 p-3 backdrop-blur-sm rounded-lg border flex flex-col gap-2"
            style={{
              background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
              borderColor: isDark ? 'rgba(100,116,139,0.5)' : '#E2E8F0',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" style={{ background: '#06B6D4' }} />
              <span className="text-[10px] font-medium" style={{ color: isDark ? '#FFFFFF' : '#334155' }}>平均スコア</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
              <span className="text-[10px]" style={{ color: isDark ? '#CBD5E1' : '#64748B' }}>80+ Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#06B6D4' }} />
              <span className="text-[10px]" style={{ color: isDark ? '#CBD5E1' : '#64748B' }}>50+ Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
              <span className="text-[10px]" style={{ color: isDark ? '#CBD5E1' : '#64748B' }}>{'<50 Needs Work'}</span>
            </div>
          </div>

          {/* Stats badge */}
          <div
            className="absolute top-4 right-4 p-3 backdrop-blur-sm rounded-lg border text-right"
            style={{
              background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
              borderColor: isDark ? 'rgba(100,116,139,0.5)' : '#E2E8F0',
            }}
          >
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>分析件数</div>
            <div className="text-lg font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>{stats?.total_analyses || 0}</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Analyses Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h3
            className="text-xl font-bold"
            style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
          >
            最近の分析
          </h3>
          <Link
            href="/clavi/analyses"
            className="text-sm font-medium text-[#06B6D4] hover:underline flex items-center gap-1"
          >
            すべて表示
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="w-full overflow-hidden rounded-xl shadow-sm"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          {recentAnalyses.length === 0 ? (
            <div className="p-10 text-center" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              <p className="text-sm">まだ分析がありません。</p>
              <Link href="/clavi/analyses" className="text-sm text-[#06B6D4] font-medium mt-1 inline-block">
                新規分析を開始
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead
                  className="border-b"
                  style={{
                    background: isDark ? '#1e3a40' : '#F8FAFC',
                    borderColor: isDark ? '#224249' : '#E2E8F0',
                  }}
                >
                  <tr>
                    <th className="px-6 py-4 font-medium" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>URL</th>
                    <th className="px-6 py-4 font-medium" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>スコア</th>
                    <th className="px-6 py-4 font-medium" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>ステータス</th>
                    <th className="px-6 py-4 font-medium text-right" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>日時</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: isDark ? '#224249' : '#F1F5F9' }}>
                  {recentAnalyses.map((analysis) => (
                    <tr
                      key={analysis.id}
                      className="group transition-colors cursor-pointer"
                      style={{
                        borderColor: isDark ? '#224249' : '#F1F5F9',
                      }}
                      onClick={() => window.location.href = `/clavi/analyses/${analysis.id}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? '#1f363d' : '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded"
                            style={{ background: isDark ? '#224249' : '#F1F5F9' }}
                          >
                            <Activity className="w-4 h-4" style={{ color: isDark ? '#90c1cb' : '#64748B' }} />
                          </div>
                          <div>
                            <p className="font-medium truncate max-w-[200px] group-hover:text-[#06B6D4] transition-colors"
                              style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                            >
                              {analysis.url}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {analysis.ai_structure_score !== null ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="font-bold"
                              style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                            >
                              {analysis.ai_structure_score}
                            </span>
                            <span className={`text-[10px] uppercase font-bold tracking-wide ${
                              (analysis.ai_structure_score || 0) >= 80 ? 'text-emerald-400' :
                              (analysis.ai_structure_score || 0) >= 50 ? 'text-[#06B6D4]' :
                              'text-orange-400'
                            }`}>
                              {(analysis.ai_structure_score || 0) >= 80 ? 'Excellent' :
                               (analysis.ai_structure_score || 0) >= 50 ? 'Good' :
                               'Needs Work'}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
                          style={{
                            background: analysis.status === 'completed'
                              ? isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5'
                              : isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',
                            color: analysis.status === 'completed'
                              ? isDark ? '#34D399' : '#15803D'
                              : '#EF4444',
                          }}
                        >
                          {analysis.status === 'completed' ? '完了' : '失敗'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                          {new Date(analysis.created_at).toLocaleString('ja-JP')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Link href="/clavi/analyses">
          <div
            className="p-6 rounded-xl transition-all hover:shadow-md group relative overflow-hidden"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <Plus className="w-20 h-20 text-[#06B6D4]" strokeWidth={1} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3
                  className="text-sm font-bold mb-1"
                  style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                >
                  新規分析を開始
                </h3>
                <p className="text-xs" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                  URLを入力して構造化データを分析
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform"
                style={{ background: isDark ? '#224249' : '#ECFEFF' }}
              >
                <ArrowRight className="w-4 h-4 text-[#06B6D4]" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/clavi/settings">
          <div
            className="p-6 rounded-xl transition-all hover:shadow-md group relative overflow-hidden"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <Activity className="w-20 h-20 text-[#06B6D4]" strokeWidth={1} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3
                  className="text-sm font-bold mb-1"
                  style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
                >
                  設定を確認
                </h3>
                <p className="text-xs" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                  プロフィール・組織情報を設定
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform"
                style={{ background: isDark ? '#224249' : '#ECFEFF' }}
              >
                <ArrowRight className="w-4 h-4 text-[#06B6D4]" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
