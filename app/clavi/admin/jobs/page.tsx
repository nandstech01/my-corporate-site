'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useClaviTheme } from '@/app/clavi/context';

interface Job {
  id: string;
  tenant_id: string;
  tenant_name: string;
  url: string;
  status: string;
  ai_structure_score: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatusCounts {
  processing: number;
  completed: number;
  failed: number;
  expired: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  const fetchJobs = async (page: number, status: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        status,
      });

      const response = await fetch(`/api/clavi/admin/jobs?${params}`, {
        credentials: 'include',
        headers: session?.access_token
          ? { 'Authorization': `Bearer ${session.access_token}` }
          : {},
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
        setPagination(data.pagination);
        setStatusCounts(data.statusCounts);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleRefresh = () => {
    fetchJobs(currentPage, statusFilter);
  };

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    processing: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', label: '処理中' },
    completed: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', label: '完了' },
    failed: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', label: '失敗' },
    expired: { bg: 'rgba(100,116,139,0.1)', text: '#64748b', label: '期限切れ' },
  };

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
              background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))'
            }}
          >
            <Activity className="w-6 h-6" style={{ color: '#22d3ee' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              ジョブ監視
            </h1>
            <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              全 {pagination?.total || 0} ジョブ
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            background: 'rgba(34,211,238,0.1)',
            color: '#22d3ee',
          }}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          更新
        </button>
      </motion.div>

      {/* ステータスフィルタ */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        <button
          onClick={() => {
            setStatusFilter('');
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: statusFilter === ''
              ? 'linear-gradient(135deg, #22d3ee, #a855f7)'
              : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            color: statusFilter === '' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
          }}
        >
          すべて ({(statusCounts?.processing || 0) + (statusCounts?.completed || 0) + (statusCounts?.failed || 0) + (statusCounts?.expired || 0)})
        </button>
        {statusCounts && Object.entries(statusColors).map(([status, config]) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: statusFilter === status
                ? config.bg
                : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: statusFilter === status ? config.text : (isDark ? '#94a3b8' : '#64748b'),
              border: statusFilter === status ? `1px solid ${config.text}40` : '1px solid transparent',
            }}
          >
            {config.label} ({statusCounts[status as keyof StatusCounts] || 0})
          </button>
        ))}
      </motion.div>

      {/* ジョブ一覧 */}
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
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-500"></div>
            <p className="mt-4" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              Loading...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div
            className="p-12 text-center"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            ジョブが見つかりません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: isDark
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(0,0,0,0.02)',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
                  }}
                >
                  <th
                    className="text-left px-6 py-4 font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    URL
                  </th>
                  <th
                    className="text-left px-6 py-4 font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    テナント
                  </th>
                  <th
                    className="text-left px-6 py-4 font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    ステータス
                  </th>
                  <th
                    className="text-center px-6 py-4 font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    スコア
                  </th>
                  <th
                    className="text-left px-6 py-4 font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    実行日時
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="transition-colors"
                    style={{
                      borderBottom: index < jobs.length - 1
                        ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
                        : 'none'
                    }}
                  >
                    <td className="px-6 py-4">
                      <div
                        className="font-medium truncate max-w-xs"
                        style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                        title={job.url}
                      >
                        {job.url}
                      </div>
                      <div
                        className="text-xs mt-1 font-mono"
                        style={{ color: isDark ? '#475569' : '#94a3b8' }}
                      >
                        {job.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/clavi/admin/tenants/${job.tenant_id}`}
                        className="flex items-center gap-1 hover:underline"
                        style={{ color: '#f97316' }}
                      >
                        {job.tenant_name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 text-xs font-medium rounded-full"
                          style={{
                            background: statusColors[job.status]?.bg || 'rgba(100,116,139,0.1)',
                            color: statusColors[job.status]?.text || '#64748b',
                          }}
                        >
                          {statusColors[job.status]?.label || job.status}
                        </span>
                        {job.error_message && (
                          <div className="group relative">
                            <AlertCircle
                              className="w-4 h-4 cursor-help"
                              style={{ color: '#ef4444' }}
                            />
                            <div
                              className="absolute z-10 left-0 top-6 w-64 p-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-xs"
                              style={{
                                background: isDark ? '#1e293b' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                color: isDark ? '#f87171' : '#ef4444',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              }}
                            >
                              {job.error_message}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {job.ai_structure_score !== null ? (
                        <span
                          className="font-semibold"
                          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                        >
                          {job.ai_structure_score}
                        </span>
                      ) : (
                        <span style={{ color: isDark ? '#475569' : '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                        {new Date(job.created_at).toLocaleString('ja-JP')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ページネーション */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2"
        >
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg transition-all disabled:opacity-50"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
          </button>

          <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            {currentPage} / {pagination.totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage === pagination.totalPages}
            className="p-2 rounded-lg transition-all disabled:opacity-50"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            }}
          >
            <ChevronRight className="w-5 h-5" style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
