'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  FileSearch,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAsoTheme } from '@/app/aso/context';

interface Tenant {
  id: string;
  name: string;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
  user_count: number;
  analysis_count: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  const fetchTenants = async (page: number, searchQuery: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchQuery,
      });

      const response = await fetch(`/api/aso/admin/tenants?${params}`, {
        credentials: 'include',
        headers: session?.access_token
          ? { 'Authorization': `Bearer ${session.access_token}` }
          : {},
      });

      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants(currentPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTenants(1, search);
  };

  const tierColors: Record<string, { bg: string; text: string }> = {
    starter: { bg: 'rgba(34,211,238,0.1)', text: '#22d3ee' },
    pro: { bg: 'rgba(168,85,247,0.1)', text: '#a855f7' },
    enterprise: { bg: 'rgba(249,115,22,0.1)', text: '#f97316' },
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
    trialing: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
    past_due: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
    canceled: { bg: 'rgba(100,116,139,0.1)', text: '#64748b' },
    unpaid: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  };

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
          <Building2 className="w-6 h-6" style={{ color: '#f97316' }} />
        </div>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            テナント管理
          </h1>
          <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            全 {pagination?.total || 0} テナント
          </p>
        </div>
      </motion.div>

      {/* 検索 */}
      <motion.div variants={itemVariants}>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="テナント名で検索..."
              className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
              style={{
                background: isDark
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.8)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                color: isDark ? '#ffffff' : '#0f172a',
              }}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ef4444)',
              color: '#ffffff',
            }}
          >
            検索
          </button>
        </form>
      </motion.div>

      {/* テナント一覧 */}
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
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-orange-500/20 border-t-orange-500"></div>
            <p className="mt-4" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              Loading...
            </p>
          </div>
        ) : tenants.length === 0 ? (
          <div
            className="p-12 text-center"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            テナントが見つかりません
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
                    テナント名
                  </th>
                  <th
                    className="text-left px-6 py-4 font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    プラン
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
                    ユーザー
                  </th>
                  <th
                    className="text-center px-6 py-4 font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    分析
                  </th>
                  <th
                    className="text-left px-6 py-4 font-medium"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    作成日
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant, index) => (
                  <tr
                    key={tenant.id}
                    className="transition-colors"
                    style={{
                      borderBottom: index < tenants.length - 1
                        ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
                        : 'none'
                    }}
                  >
                    <td className="px-6 py-4">
                      <div
                        className="font-medium"
                        style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                      >
                        {tenant.name}
                      </div>
                      <div
                        className="text-xs mt-1 font-mono"
                        style={{ color: isDark ? '#475569' : '#94a3b8' }}
                      >
                        {tenant.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 text-xs font-medium rounded-full capitalize"
                        style={{
                          background: tierColors[tenant.subscription_tier]?.bg || 'rgba(100,116,139,0.1)',
                          color: tierColors[tenant.subscription_tier]?.text || '#64748b',
                        }}
                      >
                        {tenant.subscription_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 text-xs font-medium rounded-full capitalize"
                        style={{
                          background: statusColors[tenant.subscription_status]?.bg || 'rgba(100,116,139,0.1)',
                          color: statusColors[tenant.subscription_status]?.text || '#64748b',
                        }}
                      >
                        {tenant.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
                        <span style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                          {tenant.user_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileSearch className="w-4 h-4" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
                        <span style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                          {tenant.analysis_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                        {new Date(tenant.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/aso/admin/tenants/${tenant.id}`}
                        className="flex items-center gap-1 text-sm font-medium"
                        style={{ color: '#f97316' }}
                      >
                        詳細
                        <ExternalLink className="w-4 h-4" />
                      </Link>
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
