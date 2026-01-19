'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  BarChart3,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
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

interface SubscriptionData {
  subscription: {
    tenant_id: string;
    tenant_name: string;
    tier: string;
    status: string;
    stripe_subscription_id: string | null;
    stripe_price_id: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  };
  usage: {
    current: number;
    limit: number;
    remaining: number;
  };
}

const tierNames: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const tierPrices: Record<string, string> = {
  starter: '29,800',
  pro: '98,000',
  enterprise: '298,000',
};

const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: '有効', color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)' },
  trialing: { label: 'トライアル中', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)' },
  past_due: { label: '支払い遅延', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
  canceled: { label: 'キャンセル済み', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
  unpaid: { label: '未払い', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
};

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/aso/stripe/subscription');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch subscription');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const openPortal = async () => {
    try {
      setIsPortalLoading(true);

      const response = await fetch('/api/aso/stripe/portal', {
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to open portal');
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsPortalLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500"></div>
          <p className="mt-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="text-center p-8 rounded-2xl max-w-md"
          style={{
            background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#ef4444' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
            エラーが発生しました
          </h2>
          <p className="text-sm mb-4" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            {error}
          </p>
          <button
            onClick={fetchSubscription}
            className="px-4 py-2 rounded-lg font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #a855f7, #22d3ee)' }}
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { subscription, usage } = data;
  const statusInfo = statusLabels[subscription.status] || statusLabels.active;
  const usagePercent = usage.limit === -1 ? 0 : Math.min((usage.current / usage.limit) * 100, 100);
  const isNearLimit = usage.limit !== -1 && usagePercent >= 80;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ヘッダー */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'
            }}
          >
            <CreditCard className="w-6 h-6" style={{ color: '#a855f7' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              契約管理
            </h1>
            <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              サブスクリプション・使用量
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchSubscription}
          className="p-2 rounded-lg"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          }}
        >
          <RefreshCw className="w-5 h-5" style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
        </motion.button>
      </motion.div>

      {/* キャンセル予定アラート */}
      {subscription.cancel_at_period_end && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <div>
            <p className="font-medium" style={{ color: '#f59e0b' }}>
              解約予定
            </p>
            <p className="text-sm mt-1" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>
              現在の請求期間終了後にサブスクリプションが終了します。
              継続をご希望の場合は、カスタマーポータルから解約をキャンセルしてください。
            </p>
          </div>
        </motion.div>
      )}

      {/* プラン情報カード */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
          >
            現在のプラン
          </h2>
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              background: statusInfo.bgColor,
              color: statusInfo.color,
            }}
          >
            {statusInfo.label}
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-3xl font-bold"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                {tierNames[subscription.tier] || subscription.tier}
              </p>
              <p className="text-lg" style={{ color: '#a855f7' }}>
                ¥{tierPrices[subscription.tier] || '---'}/月
              </p>
            </div>

            {subscription.stripe_subscription_id && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openPortal}
                disabled={isPortalLoading}
                className="px-4 py-2 rounded-xl font-medium flex items-center gap-2 text-white"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
                }}
              >
                {isPortalLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    読み込み中
                  </>
                ) : (
                  <>
                    プラン管理
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </div>

          {subscription.current_period_end && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                次回請求日: {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
              </span>
            </div>
          )}

          {!subscription.stripe_subscription_id && (
            <Link href="/aso/pricing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
                }}
              >
                プランを選択する
              </motion.button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* 使用量カード */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: '#22d3ee' }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: isDark ? '#ffffff' : '#0f172a' }}
            >
              今月の使用量
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p
                className="text-4xl font-bold"
                style={{ color: isDark ? '#ffffff' : '#0f172a' }}
              >
                {usage.current}
              </p>
              <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                / {usage.limit === -1 ? '無制限' : `${usage.limit} URL`}
              </p>
            </div>

            {usage.limit !== -1 && (
              <div className="flex items-center gap-2">
                {isNearLimit ? (
                  <XCircle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                ) : (
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />
                )}
                <span
                  className="text-sm font-medium"
                  style={{ color: isNearLimit ? '#f59e0b' : '#22c55e' }}
                >
                  残り {usage.remaining} URL
                </span>
              </div>
            )}
          </div>

          {/* プログレスバー */}
          {usage.limit !== -1 && (
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: isNearLimit
                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    : 'linear-gradient(90deg, #22d3ee, #a855f7)',
                }}
              />
            </div>
          )}

          {isNearLimit && (
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
              <div>
                <p className="font-medium" style={{ color: '#f59e0b' }}>
                  使用量が上限に近づいています
                </p>
                <p className="text-sm mt-1" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>
                  より多くのURL分析が必要な場合は、プランのアップグレードをご検討ください。
                </p>
                <Link href="/aso/pricing">
                  <button
                    className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: 'rgba(245,158,11,0.2)',
                      color: '#f59e0b',
                    }}
                  >
                    プランを確認
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ヘルプリンク */}
      <motion.div
        variants={itemVariants}
        className="text-center"
        style={{ color: isDark ? '#64748b' : '#94a3b8' }}
      >
        <p className="text-sm">
          ご不明な点がございましたら、
          <a
            href="mailto:support@nands.tech"
            className="underline hover:no-underline"
            style={{ color: '#a855f7' }}
          >
            サポート
          </a>
          までお問い合わせください。
        </p>
      </motion.div>
    </motion.div>
  );
}
