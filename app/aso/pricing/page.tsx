'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Building2 } from 'lucide-react';
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

interface PricingPlan {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: string[];
  urlLimit: string;
  icon: typeof Sparkles;
  popular?: boolean;
  gradient: string;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29800,
    priceDisplay: '29,800',
    description: '小規模チーム・スタートアップ向け',
    urlLimit: '50 URL/月',
    icon: Sparkles,
    gradient: 'from-cyan-500 to-blue-500',
    features: [
      '月間50件のURL分析',
      'AI構造化スコア',
      'Fragment ID自動生成',
      'JSON-LD出力',
      'メール サポート',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 98000,
    priceDisplay: '98,000',
    description: '成長企業・マーケティングチーム向け',
    urlLimit: '500 URL/月',
    icon: Zap,
    popular: true,
    gradient: 'from-purple-500 to-pink-500',
    features: [
      '月間500件のURL分析',
      'AI構造化スコア',
      'Fragment ID自動生成',
      'JSON-LD出力',
      'ベクトル検索',
      '優先サポート',
      'API アクセス',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 298000,
    priceDisplay: '298,000',
    description: '大規模組織・エージェンシー向け',
    urlLimit: '無制限',
    icon: Building2,
    gradient: 'from-amber-500 to-orange-500',
    features: [
      '無制限URL分析',
      'AI構造化スコア',
      'Fragment ID自動生成',
      'JSON-LD出力',
      'ベクトル検索',
      '専任サポート',
      'API アクセス',
      'カスタム連携',
      'SLA保証',
    ],
  },
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { theme } = useAsoTheme();
  const isDark = theme === 'dark';

  const handleSubscribe = async (tier: 'starter' | 'pro' | 'enterprise') => {
    setIsLoading(tier);

    try {
      const response = await fetch('/api/aso/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Stripeチェックアウトページにリダイレクト
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('エラーが発生しました。再度お試しください。');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 py-4"
    >
      {/* ヘッダー */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight"
          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
        >
          料金プラン
        </h1>
        <p
          className="text-lg max-w-2xl mx-auto"
          style={{ color: isDark ? '#94a3b8' : '#64748b' }}
        >
          ビジネスの規模に合わせた柔軟なプランをご用意しています
        </p>
      </motion.div>

      {/* プランカード */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isPopular = plan.popular;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`relative rounded-2xl overflow-hidden ${
                isPopular ? 'md:-mt-4 md:mb-4' : ''
              }`}
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                border: `1px solid ${
                  isPopular
                    ? 'rgba(168,85,247,0.5)'
                    : isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)'
                }`,
              }}
            >
              {/* Popular バッジ */}
              {isPopular && (
                <div
                  className="absolute top-0 right-0 px-4 py-1 text-xs font-semibold text-white rounded-bl-xl"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  }}
                >
                  人気
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* プランヘッダー */}
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${plan.gradient}`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      {plan.name}
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                    >
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* 価格 */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl font-bold"
                      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                      ¥{plan.priceDisplay}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: isDark ? '#64748b' : '#94a3b8' }}
                    >
                      /月
                    </span>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: '#a855f7' }}
                  >
                    {plan.urlLimit}
                  </p>
                </div>

                {/* 機能リスト */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: '#22c55e' }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: isDark ? '#e2e8f0' : '#475569' }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTAボタン */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading !== null}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all ${
                    isLoading === plan.id ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  style={{
                    background: isPopular
                      ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                      : isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.8)',
                  }}
                >
                  {isLoading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      処理中...
                    </span>
                  ) : (
                    'このプランを選択'
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* FAQ / 注意事項 */}
      <motion.div
        variants={itemVariants}
        className="max-w-3xl mx-auto rounded-2xl p-6"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: isDark ? '#ffffff' : '#0f172a' }}
        >
          よくある質問
        </h3>
        <div className="space-y-4">
          <div>
            <h4
              className="font-medium mb-1"
              style={{ color: isDark ? '#e2e8f0' : '#334155' }}
            >
              プランの変更はできますか？
            </h4>
            <p
              className="text-sm"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              はい、いつでもアップグレード・ダウングレードが可能です。
              変更は即座に反映され、料金は日割り計算されます。
            </p>
          </div>
          <div>
            <h4
              className="font-medium mb-1"
              style={{ color: isDark ? '#e2e8f0' : '#334155' }}
            >
              解約はいつでもできますか？
            </h4>
            <p
              className="text-sm"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              はい、解約はいつでも可能です。
              解約後も請求期間終了まではサービスをご利用いただけます。
            </p>
          </div>
          <div>
            <h4
              className="font-medium mb-1"
              style={{ color: isDark ? '#e2e8f0' : '#334155' }}
            >
              支払い方法は？
            </h4>
            <p
              className="text-sm"
              style={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              クレジットカード（Visa, Mastercard, American Express, JCB）に対応しています。
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
