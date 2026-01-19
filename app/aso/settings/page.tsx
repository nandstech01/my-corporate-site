'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Building2, Key, Check, Copy, CreditCard, BarChart3, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAsoTheme } from '@/app/aso/context';

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

interface UserProfile {
  email: string;
  id: string;
}

interface TenantInfo {
  tenant_id: string;
  tenant_name: string;
  role: string;
}

interface SubscriptionInfo {
  tier: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface UsageInfo {
  current: number;
  limit: number;
  remaining: number;
}

const tierNames: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: '有効', color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)' },
  trialing: { label: 'トライアル中', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)' },
  past_due: { label: '支払い遅延', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
  canceled: { label: 'キャンセル済み', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
  unpaid: { label: '未払い', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      // ユーザー情報取得
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setProfile({
          email: user.email || '',
          id: user.id,
        });

        // テナント情報取得
        const { data: tenantData } = await supabase
          .rpc('get_user_tenant_by_id', { p_user_id: user.id })
          .single<{ tenant_id: string; role: string }>();

        if (tenantData) {
          // テナント名取得
          const { data: tenantInfo } = await supabase
            .from('aso.tenants')
            .select('name')
            .eq('id', tenantData.tenant_id)
            .single();

          setTenant({
            tenant_id: tenantData.tenant_id,
            tenant_name: tenantInfo?.name || 'Unknown',
            role: tenantData.role,
          });

          // サブスクリプション情報取得
          try {
            const subResponse = await fetch('/api/aso/stripe/subscription');
            if (subResponse.ok) {
              const subData = await subResponse.json();
              setSubscription({
                tier: subData.subscription.tier,
                status: subData.subscription.status,
                current_period_end: subData.subscription.current_period_end,
                cancel_at_period_end: subData.subscription.cancel_at_period_end,
              });
              setUsage(subData.usage);
            }
          } catch (subError) {
            console.error('Error fetching subscription:', subError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500"></div>
          <p className="mt-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Loading settings...
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
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'
          }}
        >
          <SettingsIcon className="w-6 h-6" style={{ color: '#a855f7' }} />
        </div>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            設定
          </h1>
          <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            アカウント・テナント情報
          </p>
        </div>
      </motion.div>

      {/* プロフィールセクション */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
          }}
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: '#22d3ee' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              プロフィール
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              メールアドレス
            </label>
            <div
              className="px-4 py-3 rounded-xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? '#ffffff' : '#0f172a'
              }}
            >
              {profile?.email || 'N/A'}
            </div>
            <p className="mt-2 text-xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
              メールアドレスの変更はSupabase管理画面から行ってください
            </p>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              ユーザーID
            </label>
            <div
              className="px-4 py-3 rounded-xl font-mono text-sm break-all"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? '#94a3b8' : '#64748b'
              }}
            >
              {profile?.id || 'N/A'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* テナント情報セクション */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
          }}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" style={{ color: '#a855f7' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              テナント情報
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {tenant ? (
            <>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                >
                  テナント名
                </label>
                <div
                  className="px-4 py-3 rounded-xl"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: isDark ? '#ffffff' : '#0f172a'
                  }}
                >
                  {tenant.tenant_name}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                >
                  テナントID
                </label>
                <div
                  className="px-4 py-3 rounded-xl font-mono text-sm break-all"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: isDark ? '#94a3b8' : '#64748b'
                  }}
                >
                  {tenant.tenant_id}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                >
                  ロール
                </label>
                <div
                  className="inline-flex px-3 py-1.5 rounded-lg font-medium"
                  style={{
                    background: tenant.role === 'owner'
                      ? 'rgba(245,158,11,0.1)'
                      : tenant.role === 'admin'
                      ? 'rgba(168,85,247,0.1)'
                      : 'rgba(34,211,238,0.1)',
                    border: `1px solid ${
                      tenant.role === 'owner'
                        ? 'rgba(245,158,11,0.2)'
                        : tenant.role === 'admin'
                        ? 'rgba(168,85,247,0.2)'
                        : 'rgba(34,211,238,0.2)'
                    }`,
                    color: tenant.role === 'owner'
                      ? '#f59e0b'
                      : tenant.role === 'admin'
                      ? '#a855f7'
                      : '#22d3ee'
                  }}
                >
                  {tenant.role === 'owner' ? 'オーナー' : tenant.role === 'admin' ? '管理者' : tenant.role === 'member' ? 'メンバー' : tenant.role}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              テナント情報を取得できませんでした
            </div>
          )}
        </div>
      </motion.div>

      {/* サブスクリプション情報セクション */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
          }}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" style={{ color: '#a855f7' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              契約情報
            </h2>
          </div>
          <Link href="/aso/subscription">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
                color: '#ffffff',
              }}
            >
              詳細
              <ExternalLink className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
        </div>

        <div className="p-6 space-y-4">
          {subscription ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                  >
                    現在のプラン
                  </label>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    {tierNames[subscription.tier] || subscription.tier}
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: statusLabels[subscription.status]?.bgColor || statusLabels.active.bgColor,
                    color: statusLabels[subscription.status]?.color || statusLabels.active.color,
                  }}
                >
                  {statusLabels[subscription.status]?.label || subscription.status}
                </span>
              </div>

              {usage && (
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                  >
                    今月の使用量
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" style={{ color: '#22d3ee' }} />
                      <span style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                        <span className="text-xl font-bold">{usage.current}</span>
                        <span className="text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                          {' '}/ {usage.limit === -1 ? '無制限' : `${usage.limit} URL`}
                        </span>
                      </span>
                    </div>
                    {usage.limit !== -1 && (
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((usage.current / usage.limit) * 100, 100)}%`,
                            background: 'linear-gradient(90deg, #22d3ee, #a855f7)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {subscription.current_period_end && (
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                  >
                    次回請求日
                  </label>
                  <div style={{ color: isDark ? '#e2e8f0' : '#475569' }}>
                    {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              )}

              {subscription.cancel_at_period_end && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}
                >
                  <p className="text-sm" style={{ color: '#f59e0b' }}>
                    解約予定: 現在の請求期間終了後にサブスクリプションが終了します
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                契約情報を読み込んでいます...
              </p>
              <Link href="/aso/pricing" className="inline-block mt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
                    color: '#ffffff',
                  }}
                >
                  プランを確認
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* API設定セクション */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
          }}
        >
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5" style={{ color: '#f59e0b' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              API連携
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              認証方式
            </label>
            <div
              className="inline-flex px-3 py-1.5 rounded-lg font-medium"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#22c55e'
              }}
            >
              Supabase Auth (JWT)
            </div>
            <p className="mt-2 text-xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
              本システムはSupabase認証を使用しています。外部APIキーは不要です。
            </p>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              分析APIエンドポイント
            </label>
            <div
              className="px-4 py-3 rounded-xl font-mono text-sm"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? '#94a3b8' : '#64748b'
              }}
            >
              POST /api/aso/analyze
            </div>
            <p className="mt-2 text-xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
              認証済みリクエストでURL分析を実行できます
            </p>
          </div>

          {tenant && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: isDark ? '#64748b' : '#94a3b8' }}
              >
                テナントID（API連携用）
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 px-4 py-3 rounded-xl font-mono text-sm truncate"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: isDark ? '#94a3b8' : '#64748b'
                  }}
                >
                  {tenant.tenant_id}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyToClipboard(tenant.tenant_id, 'tenantId')}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                  style={{
                    background: copiedField === 'tenantId'
                      ? 'rgba(34,197,94,0.1)'
                      : 'linear-gradient(135deg, #a855f7, #22d3ee)',
                    color: '#ffffff',
                    border: copiedField === 'tenantId' ? '1px solid rgba(34,197,94,0.2)' : 'none'
                  }}
                >
                  {copiedField === 'tenantId' ? (
                    <>
                      <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
                      <span style={{ color: '#22c55e' }}>コピー済み</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      コピー
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 情報ボックス */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(168,85,247,0.1)',
          border: '1px solid rgba(168,85,247,0.2)'
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'
            }}
          >
            <span className="text-2xl">ℹ️</span>
          </div>
          <div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              ロールについて
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: isDark ? '#c4b5fd' : '#8b5cf6' }}>
              <li>• <strong style={{ color: '#f59e0b' }}>オーナー</strong>: テナントの全権限を持ちます</li>
              <li>• <strong style={{ color: '#a855f7' }}>管理者</strong>: メンバー管理と分析の全機能を使用できます</li>
              <li>• <strong style={{ color: '#22d3ee' }}>メンバー</strong>: 分析の閲覧・実行ができます</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

