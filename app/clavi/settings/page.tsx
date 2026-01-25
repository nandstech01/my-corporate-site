'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Building2, Key, Check, Copy, CreditCard, BarChart3, ExternalLink, Share2, UserCircle, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useClaviTheme } from '@/app/clavi/context';
import SameAsInputForm from '@/components/clavi/SameAsInputForm';
import AuthorInputForm from '@/components/clavi/AuthorInputForm';
import type { TenantSettings, SameAsSettings, AuthorSettings } from '@/lib/clavi/types/tenant-settings';

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
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  // Phase 8: sameAs & Author settings
  const [tenantSettings, setTenantSettings] = useState<TenantSettings>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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

      // サーバーサイドAPI経由でユーザー・テナント情報を取得
      const meResponse = await fetch('/api/clavi/me', { credentials: 'include' });
      if (!meResponse.ok) {
        return;
      }
      const meData = await meResponse.json();

      setProfile({
        email: meData.email || '',
        id: meData.user_id,
      });

      // テナント情報を設定
      const firstTenant = meData.tenants?.[0];
      const currentTenantId = meData.tenant_id || firstTenant?.tenant_id;
      const currentRole = meData.tenant_role || firstTenant?.role;
      const tenantName = firstTenant?.tenants?.name || 'Unknown';

      if (currentTenantId) {
        setTenant({
          tenant_id: currentTenantId,
          tenant_name: tenantName,
          role: currentRole || 'member',
        });

        // サブスクリプション情報取得
        try {
          const subResponse = await fetch('/api/clavi/stripe/subscription', {
            credentials: 'include',
          });
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
        } catch {
          // subscription fetch failed silently
        }

        // テナント設定取得
        try {
          const settingsResponse = await fetch('/api/clavi/settings', {
            credentials: 'include',
          });
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            setTenantSettings(settingsData.settings || {});
          }
        } catch {
          // settings fetch failed silently
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 8: 設定保存
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      const response = await fetch('/api/clavi/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sameAs: tenantSettings.sameAs,
          author: tenantSettings.author,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMessage({ type: 'success', text: '設定を保存しました' });
        setHasChanges(false);
        setTenantSettings(data.settings);
      } else {
        setSaveMessage({ type: 'error', text: data.error || '保存に失敗しました' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: '保存に失敗しました' });
    } finally {
      setIsSaving(false);
      // 3秒後にメッセージをクリア
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSameAsChange = (sameAs: SameAsSettings) => {
    setTenantSettings((prev) => ({ ...prev, sameAs }));
    setHasChanges(true);
  };

  const handleAuthorChange = (author: AuthorSettings | undefined) => {
    setTenantSettings((prev) => ({ ...prev, author }));
    setHasChanges(true);
  };

  // 編集権限チェック
  const canEdit = tenant?.role === 'owner' || tenant?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#A5F3FC] border-t-[#06B6D4]"></div>
          <p className="mt-4" style={{ color: isDark ? '#90c1cb' : '#64748b' }}>
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
          >
            設定
          </h1>
          <p className="text-sm mt-0.5" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            アカウント・テナント情報・Schema.org設定
          </p>
        </div>

        {/* 保存ボタン */}
        {canEdit && hasChanges && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveSettings}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-white bg-[#0891B2] hover:bg-[#0E7490] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? '保存中...' : '変更を保存'}
          </motion.button>
        )}
      </motion.div>

      {/* 保存メッセージ */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl p-4"
          style={{
            background: saveMessage.type === 'success'
              ? 'rgba(34,197,94,0.1)'
              : 'rgba(239,68,68,0.1)',
            border: `1px solid ${
              saveMessage.type === 'success'
                ? 'rgba(34,197,94,0.2)'
                : 'rgba(239,68,68,0.2)'
            }`,
          }}
        >
          <div className="flex items-center gap-2">
            <Check
              className="w-5 h-5"
              style={{ color: saveMessage.type === 'success' ? '#22c55e' : '#ef4444' }}
            />
            <span style={{ color: saveMessage.type === 'success' ? '#22c55e' : '#ef4444' }}>
              {saveMessage.text}
            </span>
          </div>
        </motion.div>
      )}

      {/* プロフィールセクション */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl overflow-hidden"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: isDark ? '#182f34' : '#F8FAFC',
            borderColor: isDark ? '#224249' : '#E2E8F0'
          }}
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: '#06B6D4' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
            >
              プロフィール
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
            >
              メールアドレス
            </label>
            <div
              className="px-4 py-3 rounded-xl"
              style={{
                background: isDark ? '#0c1619' : '#F8FAFC',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                color: isDark ? '#F8FAFC' : '#0F172A'
              }}
            >
              {profile?.email || 'N/A'}
            </div>
            <p className="mt-2 text-xs" style={{ color: isDark ? '#56737a' : '#94a3b8' }}>
              メールアドレスの変更はSupabase管理画面から行ってください
            </p>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
            >
              ユーザーID
            </label>
            <div
              className="px-4 py-3 rounded-xl font-mono text-sm break-all"
              style={{
                background: isDark ? '#0c1619' : '#F8FAFC',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                color: isDark ? '#90c1cb' : '#64748b'
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
        className="rounded-xl overflow-hidden"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: isDark ? '#182f34' : '#F8FAFC',
            borderColor: isDark ? '#224249' : '#E2E8F0'
          }}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" style={{ color: '#06B6D4' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
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
                  style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
                >
                  テナント名
                </label>
                <div
                  className="px-4 py-3 rounded-xl"
                  style={{
                    background: isDark ? '#0c1619' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                    color: isDark ? '#F8FAFC' : '#0F172A'
                  }}
                >
                  {tenant.tenant_name}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
                >
                  テナントID
                </label>
                <div
                  className="px-4 py-3 rounded-xl font-mono text-sm break-all"
                  style={{
                    background: isDark ? '#0c1619' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                    color: isDark ? '#90c1cb' : '#64748b'
                  }}
                >
                  {tenant.tenant_id}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
                >
                  ロール
                </label>
                <div
                  className="inline-flex px-3 py-1.5 rounded-lg font-medium"
                  style={{
                    background: tenant.role === 'owner'
                      ? 'rgba(245,158,11,0.1)'
                      : tenant.role === 'admin'
                      ? 'rgba(6,182,212,0.1)'
                      : 'rgba(6,182,212,0.1)',
                    border: `1px solid ${
                      tenant.role === 'owner'
                        ? 'rgba(245,158,11,0.2)'
                        : tenant.role === 'admin'
                        ? 'rgba(6,182,212,0.2)'
                        : 'rgba(6,182,212,0.2)'
                    }`,
                    color: tenant.role === 'owner'
                      ? '#f59e0b'
                      : tenant.role === 'admin'
                      ? '#06B6D4'
                      : '#06B6D4'
                  }}
                >
                  {tenant.role === 'owner' ? 'オーナー' : tenant.role === 'admin' ? '管理者' : tenant.role === 'member' ? 'メンバー' : tenant.role}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8" style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
              テナント情報を取得できませんでした
            </div>
          )}
        </div>
      </motion.div>

      {/* Phase 8: ソーシャルリンク（sameAs）セクション */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl overflow-hidden"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: isDark ? '#182f34' : '#F8FAFC',
            borderColor: isDark ? '#224249' : '#E2E8F0'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5" style={{ color: '#22c55e' }} />
              <h2
                className="text-lg font-semibold"
                style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
              >
                ソーシャルリンク（sameAs）
              </h2>
            </div>
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                background: 'rgba(6,182,212,0.1)',
                color: '#06B6D4',
              }}
            >
              Schema.org
            </span>
          </div>
          <p className="mt-2 text-sm" style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
            SNSアカウントを登録すると、JSON-LDのsameAsプロパティに追加され、Google Knowledge Graphでの認識が向上します。
          </p>
        </div>

        <div className="p-6">
          {canEdit ? (
            <SameAsInputForm
              sameAs={tenantSettings.sameAs}
              onChange={handleSameAsChange}
              isDark={isDark}
            />
          ) : (
            <div className="text-center py-8" style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
              設定の編集にはオーナーまたは管理者権限が必要です
            </div>
          )}
        </div>
      </motion.div>

      {/* Phase 8: 代表者情報（Author）セクション */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl overflow-hidden"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: isDark ? '#182f34' : '#F8FAFC',
            borderColor: isDark ? '#224249' : '#E2E8F0'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5" style={{ color: '#f59e0b' }} />
              <h2
                className="text-lg font-semibold"
                style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
              >
                代表者情報（Author）
              </h2>
            </div>
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                background: 'rgba(245,158,11,0.1)',
                color: '#f59e0b',
              }}
            >
              E-E-A-T
            </span>
          </div>
          <p className="mt-2 text-sm" style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
            代表者情報を設定すると、PersonスキーマとしてJSON-LDに追加され、E-E-A-T評価の向上に貢献します。
          </p>
        </div>

        <div className="p-6">
          {canEdit ? (
            <AuthorInputForm
              author={tenantSettings.author}
              onChange={handleAuthorChange}
              isDark={isDark}
            />
          ) : (
            <div className="text-center py-8" style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
              設定の編集にはオーナーまたは管理者権限が必要です
            </div>
          )}
        </div>
      </motion.div>

      {/* サブスクリプション情報セクション */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl overflow-hidden"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: isDark ? '#182f34' : '#F8FAFC',
            borderColor: isDark ? '#224249' : '#E2E8F0'
          }}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" style={{ color: '#06B6D4' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
            >
              契約情報
            </h2>
          </div>
          <Link href="/clavi/subscription">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 text-white bg-[#0891B2] hover:bg-[#0E7490] transition-colors"
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
                    style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
                  >
                    現在のプラン
                  </label>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
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
                    style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
                  >
                    今月の使用量
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" style={{ color: '#06B6D4' }} />
                      <span style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        <span className="text-xl font-bold">{usage.current}</span>
                        <span className="text-sm" style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
                          {' '}/ {usage.limit === -1 ? '無制限' : `${usage.limit} URL`}
                        </span>
                      </span>
                    </div>
                    {usage.limit !== -1 && (
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: isDark ? '#224249' : '#E2E8F0' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((usage.current / usage.limit) * 100, 100)}%`,
                            background: '#06B6D4',
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
                    style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
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
              <p style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}>
                契約情報を読み込んでいます...
              </p>
              <Link href="/clavi/pricing" className="inline-block mt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#0891B2] hover:bg-[#0E7490] transition-colors"
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
        className="rounded-xl overflow-hidden"
        style={{
          background: isDark ? '#182f34' : '#FFFFFF',
          border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: isDark ? '#182f34' : '#F8FAFC',
            borderColor: isDark ? '#224249' : '#E2E8F0'
          }}
        >
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5" style={{ color: '#f59e0b' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
            >
              API連携
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
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
            <p className="mt-2 text-xs" style={{ color: isDark ? '#56737a' : '#94a3b8' }}>
              本システムはSupabase認証を使用しています。外部APIキーは不要です。
            </p>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
            >
              分析APIエンドポイント
            </label>
            <div
              className="px-4 py-3 rounded-xl font-mono text-sm"
              style={{
                background: isDark ? '#0c1619' : '#F8FAFC',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                color: isDark ? '#90c1cb' : '#64748b'
              }}
            >
              POST /api/clavi/analyze
            </div>
            <p className="mt-2 text-xs" style={{ color: isDark ? '#56737a' : '#94a3b8' }}>
              認証済みリクエストでURL分析を実行できます
            </p>
          </div>

          {tenant && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: isDark ? '#6a8b94' : '#94a3b8' }}
              >
                テナントID（API連携用）
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 px-4 py-3 rounded-xl font-mono text-sm truncate"
                  style={{
                    background: isDark ? '#0c1619' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                    color: isDark ? '#90c1cb' : '#64748b'
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
                      : '#06B6D4',
                    color: '#FFFFFF',
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
        className="rounded-xl p-5"
        style={{
          background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF',
          border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : '#A5F3FC'}`
        }}
      >
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
        >
          ロールについて
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
          <li>• <strong style={{ color: '#f59e0b' }}>オーナー</strong>: テナントの全権限を持ちます（sameAs/Author設定可能）</li>
          <li>• <strong style={{ color: '#06B6D4' }}>管理者</strong>: メンバー管理と分析の全機能を使用できます（sameAs/Author設定可能）</li>
          <li>• <strong style={{ color: '#06B6D4' }}>メンバー</strong>: 分析の閲覧・実行ができます</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
