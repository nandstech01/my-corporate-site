'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import {
  Building2,
  ArrowLeft,
  Users,
  FileSearch,
  TrendingUp,
  Clock,
  DollarSign,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAsoTheme } from '@/app/aso/context';

interface TenantDetail {
  tenant: {
    id: string;
    name: string;
    subscription_tier: string;
    subscription_status: string;
    stripe_customer_id: string | null;
    created_at: string;
    updated_at: string;
  };
  users: Array<{
    user_id: string;
    role: string;
    created_at: string;
  }>;
  recentAnalyses: Array<{
    id: string;
    url: string;
    status: string;
    ai_structure_score: number | null;
    created_at: string;
  }>;
  stats: {
    totalAnalyses: number;
    statusCounts: Record<string, number>;
    avgScore: number;
    thisMonthCount: number;
    totalTokens: number;
    totalCost: number;
    avgProcessingTime: number;
  };
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

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [data, setData] = useState<TenantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTenant, setEditedTenant] = useState<{
    name: string;
    subscription_tier: string;
    subscription_status: string;
  } | null>(null);

  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  const fetchTenantDetail = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`/api/aso/admin/tenants/${tenantId}`, {
        credentials: 'include',
        headers: session?.access_token
          ? { 'Authorization': `Bearer ${session.access_token}` }
          : {},
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
        setEditedTenant({
          name: result.tenant.name,
          subscription_tier: result.tenant.subscription_tier,
          subscription_status: result.tenant.subscription_status,
        });
      } else if (response.status === 404) {
        router.push('/aso/admin/tenants');
      }
    } catch (error) {
      console.error('Failed to fetch tenant detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const handleSave = async () => {
    if (!editedTenant) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`/api/aso/admin/tenants/${tenantId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { 'Authorization': `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify(editedTenant),
      });

      if (response.ok) {
        await fetchTenantDetail();
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to update tenant:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-orange-500/20 border-t-orange-500"></div>
          <p className="mt-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { tenant, users, recentAnalyses, stats } = data;

  const statCards = [
    { icon: FileSearch, label: '総分析', value: stats.totalAnalyses, color: '#a855f7' },
    { icon: TrendingUp, label: '平均スコア', value: stats.avgScore, color: '#22d3ee' },
    { icon: Clock, label: '平均処理時間', value: `${stats.avgProcessingTime}ms`, color: '#f97316' },
    { icon: DollarSign, label: '総コスト', value: `$${stats.totalCost}`, color: '#22c55e' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 戻るリンク */}
      <motion.div variants={itemVariants}>
        <Link
          href="/aso/admin/tenants"
          className="inline-flex items-center gap-2 text-sm transition-colors"
          style={{ color: isDark ? '#64748b' : '#94a3b8' }}
        >
          <ArrowLeft className="w-4 h-4" />
          テナント一覧へ戻る
        </Link>
      </motion.div>

      {/* ヘッダー */}
      <motion.div
        variants={itemVariants}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3">
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
              {tenant.name}
            </h1>
            <p
              className="font-mono text-sm"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              {tenant.id}
            </p>
          </div>
        </div>

        <button
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            background: editMode
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'rgba(249,115,22,0.1)',
            color: editMode ? '#ffffff' : '#f97316',
          }}
        >
          {editMode ? (
            <>
              <Save className="w-4 h-4" />
              {isSaving ? '保存中...' : '保存'}
            </>
          ) : (
            '編集'
          )}
        </button>
      </motion.div>

      {/* 基本情報 */}
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
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
        >
          基本情報
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              className="text-sm"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              テナント名
            </label>
            {editMode ? (
              <input
                type="text"
                value={editedTenant?.name || ''}
                onChange={(e) => setEditedTenant(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full mt-1 px-3 py-2 rounded-lg outline-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              />
            ) : (
              <p
                className="font-medium mt-1"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                {tenant.name}
              </p>
            )}
          </div>

          <div>
            <label
              className="text-sm"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              プラン
            </label>
            {editMode ? (
              <select
                value={editedTenant?.subscription_tier || ''}
                onChange={(e) => setEditedTenant(prev => prev ? { ...prev, subscription_tier: e.target.value } : null)}
                className="w-full mt-1 px-3 py-2 rounded-lg outline-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            ) : (
              <p
                className="font-medium mt-1 capitalize"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                {tenant.subscription_tier}
              </p>
            )}
          </div>

          <div>
            <label
              className="text-sm"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              ステータス
            </label>
            {editMode ? (
              <select
                value={editedTenant?.subscription_status || ''}
                onChange={(e) => setEditedTenant(prev => prev ? { ...prev, subscription_status: e.target.value } : null)}
                className="w-full mt-1 px-3 py-2 rounded-lg outline-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              >
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
                <option value="unpaid">Unpaid</option>
              </select>
            ) : (
              <p
                className="font-medium mt-1 capitalize"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                {tenant.subscription_status}
              </p>
            )}
          </div>

          <div>
            <label
              className="text-sm"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              作成日
            </label>
            <p
              className="font-medium mt-1"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              {new Date(tenant.created_at).toLocaleString('ja-JP')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
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
                <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                  {card.label}
                </span>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                {card.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ユーザー一覧 */}
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
          className="p-6 border-b flex items-center gap-2"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
        >
          <Users className="w-5 h-5" style={{ color: '#22d3ee' }} />
          <h2
            className="text-lg font-semibold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            ユーザー ({users.length})
          </h2>
        </div>
        <div className="p-6">
          {users.length === 0 ? (
            <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              ユーザーがいません
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <span
                    className="font-mono text-sm"
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  >
                    {user.user_id.slice(0, 12)}...
                  </span>
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full capitalize"
                    style={{
                      background: user.role === 'owner'
                        ? 'rgba(249,115,22,0.1)'
                        : 'rgba(100,116,139,0.1)',
                      color: user.role === 'owner' ? '#f97316' : '#64748b',
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

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
          className="p-6 border-b flex items-center gap-2"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
        >
          <FileSearch className="w-5 h-5" style={{ color: '#a855f7' }} />
          <h2
            className="text-lg font-semibold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            最近の分析 (10件)
          </h2>
        </div>
        <div>
          {recentAnalyses.length === 0 ? (
            <div
              className="p-6"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              分析がありません
            </div>
          ) : (
            recentAnalyses.map((analysis, index) => (
              <div
                key={analysis.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
                style={{
                  borderBottom: index < recentAnalyses.length - 1
                    ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
                    : 'none'
                }}
              >
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
                        ? 'rgba(34,197,94,0.1)'
                        : 'rgba(239,68,68,0.1)',
                      color: analysis.status === 'completed'
                        ? '#22c55e'
                        : '#ef4444'
                    }}
                  >
                    {analysis.status}
                  </span>
                  {analysis.ai_structure_score !== null && (
                    <span
                      className="font-semibold"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      {analysis.ai_structure_score}点
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
