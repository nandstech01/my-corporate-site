'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronDown } from 'lucide-react';
import { useClaviTheme } from '@/app/clavi/context';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import Link from 'next/link';

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    description: '小規模チームや個人のプロジェクト向け。',
    priceDisplay: '¥0',
    priceSuffix: '/月',
    cta: '無料で始める',
    ctaAction: 'signup' as const,
    popular: false,
    features: [
      'ユーザー数 3名まで',
      '基本分析ダッシュボード',
      'データ保存期間 30日',
    ],
    disabledFeatures: [
      'APIアクセス不可',
    ],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    description: '成長中のビジネスに最適な標準プラン。',
    priceDisplay: '¥4,980',
    priceSuffix: '/月',
    cta: '14日間無料トライアル',
    ctaAction: 'checkout' as const,
    popular: true,
    features: [
      'ユーザー数 20名まで',
      '高度な分析とレポート',
      'データ保存期間 無制限',
      '優先メールサポート',
      'APIアクセス制限あり',
    ],
    disabledFeatures: [],
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    description: '大規模な組織や高度な要件に対応。',
    priceDisplay: 'お問い合わせ',
    priceSuffix: '',
    cta: '営業担当へ連絡',
    ctaAction: 'contact' as const,
    popular: false,
    features: [
      'ユーザー数 無制限',
      'SSO (シングルサインオン)',
      '専用サクセスマネージャー',
      'SLA保証',
      'カスタムAPI連携',
    ],
    disabledFeatures: [],
  },
];

const comparisonRows = [
  { feature: 'アカウント数', starter: '3', pro: '20', enterprise: '無制限' },
  { feature: 'データ保存容量', starter: '5GB', pro: '50GB', enterprise: '1TB〜' },
  { feature: 'モバイルアプリ対応', starter: true, pro: true, enterprise: true },
  { feature: 'AI自動分析', starter: false, pro: true, enterprise: true },
  { feature: '2要素認証 (2FA)', starter: false, pro: true, enterprise: true },
  { feature: '監査ログ', starter: false, pro: false, enterprise: true },
];

const faqs = [
  {
    q: 'プランの変更はいつでも可能ですか？',
    a: 'はい、アカウント設定画面からいつでもプランのアップグレードまたはダウングレードが可能です。変更は即座に反映され、料金は日割り計算されます。',
  },
  {
    q: '無料トライアル終了後はどうなりますか？',
    a: 'トライアル終了の3日前に通知をお送りします。継続をご希望の場合は支払情報を入力してください。何もしなければ、自動的に無料のStarterプランに移行します。',
  },
  {
    q: '支払い方法は何がありますか？',
    a: '現在、主要なクレジットカード（Visa, Mastercard, Amex, JCB）およびPayPalに対応しています。Enterpriseプランでは請求書払いも可能です。',
  },
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  const handleAction = async (plan: typeof plans[0]) => {
    if (plan.ctaAction === 'signup') {
      window.location.href = '/clavi/signup';
      return;
    }

    if (plan.ctaAction === 'contact') {
      window.location.href = '/clavi/contact';
      return;
    }

    setIsLoading(plan.id);
    try {
      const response = await fetch('/api/clavi/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: plan.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
      if (data.url) window.location.href = data.url;
    } catch {
      alert('エラーが発生しました。再度お試しください。');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}
    >
      <ClaviPublicHeader />

      {/* Hero */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-3xl opacity-50"
            style={{ background: isDark ? 'rgba(6,182,212,0.05)' : 'rgba(6,182,212,0.1)' }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6"
            style={{ color: isDark ? '#FFFFFF' : '#1E293B', fontFamily: '"Noto Sans JP", sans-serif' }}
          >
            シンプルな料金。<br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              隠れたコストなし。
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-xl"
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            ビジネスの成長に合わせて選べる柔軟なプランをご用意しました。<br />
            14日間の無料トライアルで、すべての機能をお試しいただけます。
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex justify-center items-center gap-3"
          >
            <span className="text-sm font-medium" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
              月額払い
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex flex-shrink-0 h-6 w-11 rounded-full cursor-pointer transition-colors duration-200"
              style={{ background: isAnnual ? '#2563EB' : (isDark ? '#475569' : '#CBD5E1') }}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200"
                style={{ transform: isAnnual ? 'translateX(1.25rem)' : 'translateX(0.125rem)', marginTop: '0.125rem' }}
              />
            </button>
            <span className="text-sm font-medium" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
              年額払い
              <span className="text-xs font-bold ml-1" style={{ color: '#06B6D4' }}>20% OFF</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative -mt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative flex flex-col rounded-2xl p-8 shadow-xl transition-shadow duration-300 hover:shadow-2xl ${
                  plan.popular ? 'md:scale-105 z-10' : ''
                }`}
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: plan.popular
                    ? '2px solid #2563EB'
                    : `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 -mt-4 mr-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
                    一番人気
                  </div>
                )}

                <h3 className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline">
                  <span className={`font-extrabold ${plan.id === 'enterprise' ? 'text-3xl' : 'text-4xl'}`}
                    style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}
                  >
                    {plan.priceDisplay}
                  </span>
                  {plan.priceSuffix && (
                    <span className="ml-1 text-xl font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      {plan.priceSuffix}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAction(plan)}
                  disabled={isLoading !== null}
                  className={`mt-8 block w-full font-semibold py-3 px-4 rounded-lg text-center transition-all ${
                    isLoading === plan.id ? 'opacity-70 cursor-not-allowed' : ''
                  } ${
                    plan.popular
                      ? 'text-white shadow-lg hover:-translate-y-1'
                      : plan.id === 'enterprise'
                        ? 'hover:text-white'
                        : ''
                  }`}
                  style={
                    plan.popular
                      ? { background: '#2563EB' }
                      : plan.id === 'enterprise'
                        ? {
                            background: 'transparent',
                            border: '2px solid #2563EB',
                            color: '#2563EB',
                          }
                        : {
                            background: isDark ? '#334155' : '#F1F5F9',
                            color: isDark ? '#F8FAFC' : '#1E293B',
                          }
                  }
                >
                  {isLoading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      処理中...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>

                <ul className="mt-8 space-y-4 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2563EB' }} />
                      <span className="text-sm" style={{ color: isDark ? '#E2E8F0' : '#475569' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.disabledFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 opacity-50">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: isDark ? '#64748B' : '#94A3B8' }} />
                      <span className="text-sm" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16" style={{ background: isDark ? '#1E293B' : '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
            詳細な機能比較
          </h2>
          <div className="overflow-x-auto rounded-lg"
            style={{ border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}
          >
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
                  <th className="p-4 w-1/4 text-sm font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                    機能
                  </th>
                  <th className="p-4 text-center w-1/4 text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#1E293B', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                    Starter
                  </th>
                  <th className="p-4 text-center w-1/4 text-lg font-bold" style={{ color: '#2563EB', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                    Pro
                  </th>
                  <th className="p-4 text-center w-1/4 text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#1E293B', borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="transition-colors"
                    style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` }}
                  >
                    <td className="p-4 text-sm font-medium" style={{ color: isDark ? '#E2E8F0' : '#475569' }}>
                      {row.feature}
                    </td>
                    {(['starter', 'pro', 'enterprise'] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="p-4 text-center text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                          {typeof val === 'boolean' ? (
                            val ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 mx-auto" style={{ color: isDark ? '#475569' : '#CBD5E1' }} />
                            )
                          ) : (
                            val
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
            よくある質問
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex justify-between items-center w-full p-6 text-left"
                >
                  <span className="text-lg font-bold" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`}
                    style={{ color: '#2563EB' }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ビジネスの鍵を見つけましょう
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            CLAVIを使えば、複雑なデータもシンプルに管理できます。まずは無料分析から始めてみませんか？
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/clavi/signup"
              className="px-8 py-4 bg-white text-blue-700 text-lg font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              無料分析を試す
            </Link>
            <Link
              href="/clavi/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-bold rounded-lg hover:bg-white/10 transition-colors"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      <ClaviFooter />
    </div>
  );
}
