'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import { useClaviTheme } from '@/app/clavi/context';

export default function ContactPage() {
  const router = useRouter();
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    type: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    router.push('/clavi/contact/success');
  };

  const inputClasses = "w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow";

  const inputStyle = {
    background: isDark ? '#0F172A' : '#F8FAFC',
    border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
    color: isDark ? '#F8FAFC' : '#0F172A',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <ClaviPublicHeader />

      <main className="flex-grow flex flex-col items-center">
        {/* Hero */}
        <section className="w-full py-12 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[720px] mx-auto text-center space-y-8"
          >
            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-5xl font-black leading-tight tracking-tight"
                style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
              >
                お問い合わせ
              </h1>
              <p
                className="text-base sm:text-lg leading-relaxed max-w-[540px] mx-auto"
                style={{ color: isDark ? '#E2E8F0' : '#374151' }}
              >
                CLAVIに関するご質問や導入のご相談など、お気軽にお問い合わせください。
              </p>
            </div>

            {/* Support Team Avatars */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex -space-x-3 items-center justify-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="relative size-12 rounded-full border-[3px] shadow-sm"
                    style={{
                      borderColor: isDark ? '#0F172A' : '#F8FAFC',
                      background: isDark ? '#334155' : '#E2E8F0',
                      zIndex: 30 - i * 10,
                    }}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ color: isDark ? '#E2E8F0' : '#374151' }}
                    >
                      {['S', 'T', 'M'][i]}
                    </div>
                  </div>
                ))}
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: isDark ? '#E2E8F0' : '#374151' }}
              >
                Support Team
              </span>
            </div>
          </motion.div>
        </section>

        {/* Form */}
        <section className="w-full pb-20 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-[640px] mx-auto rounded-xl shadow-sm overflow-hidden"
            style={{
              background: isDark ? '#1E293B' : '#FFFFFF',
              border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
            }}
          >
            {/* Top gradient bar */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-600/80 to-blue-600" />

            <form onSubmit={handleSubmit} className="p-8 sm:p-10 flex flex-col gap-6">
              {/* Company Name */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                >
                  会社名
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={inputClasses}
                  style={inputStyle}
                  placeholder="例）株式会社CLAVI"
                />
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    お名前 <span className="text-red-500 text-xs ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClasses}
                    style={inputStyle}
                    placeholder="例）山田 太郎"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    メールアドレス <span className="text-red-500 text-xs ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClasses}
                    style={inputStyle}
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Phone & Type Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClasses}
                    style={inputStyle}
                    placeholder="03-1234-5678"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    お問い合わせ種別
                  </label>
                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className={`${inputClasses} appearance-none pr-10`}
                      style={inputStyle}
                    >
                      <option value="" disabled>選択してください</option>
                      <option value="consultation">導入のご相談</option>
                      <option value="technical">技術的なサポート</option>
                      <option value="partnership">パートナーシップについて</option>
                      <option value="other">その他</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: isDark ? '#E2E8F0' : '#374151' }}
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                >
                  お問い合わせ内容 <span className="text-red-500 text-xs ml-1">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`${inputClasses} resize-y min-h-[120px]`}
                  style={inputStyle}
                  placeholder="具体的なご質問やご要望をご記入ください。"
                />
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="h-5 w-5 cursor-pointer appearance-none rounded border transition-colors"
                      style={{
                        borderColor: agreed ? '#2563EB' : (isDark ? '#475569' : '#CBD5E1'),
                        background: agreed ? '#2563EB' : (isDark ? '#0F172A' : '#F8FAFC'),
                      }}
                    />
                    {agreed && (
                      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm leading-snug" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
                    <span className="font-medium" style={{ color: '#2563EB' }}>プライバシーポリシー</span> に同意する
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !agreed}
                  className="w-full flex justify-center items-center gap-2 rounded-lg px-8 py-4 text-sm font-bold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#2563EB' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      送信する
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p
                  className="mt-4 text-center text-xs"
                  style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  通常、2営業日以内に担当者よりご連絡いたします。
                </p>
              </div>
            </form>
          </motion.div>
        </section>
      </main>

      <ClaviFooter />
    </div>
  );
}
