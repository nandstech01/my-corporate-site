'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import { useClaviTheme } from '@/app/clavi/context';

export default function ContactSuccessPage() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <ClaviPublicHeader />

      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5' }}
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            送信完了
          </h1>
          <p className="text-base mb-8" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
            お問い合わせありがとうございます。
            担当者より2営業日以内にご連絡いたします。
          </p>
          <Link
            href="/clavi"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            トップに戻る <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      <ClaviFooter />
    </div>
  );
}
