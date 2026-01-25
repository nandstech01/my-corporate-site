'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import { useClaviTheme } from '@/app/clavi/context';

export default function BlogPage() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <ClaviPublicHeader />

      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <div
            className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-6"
            style={{ background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF' }}
          >
            <Clock className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            ブログ
          </h1>
          <p className="text-base mb-2" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
            Coming Soon
          </p>
          <p className="text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            AI検索最適化に関する最新情報やTipsを掲載予定です。
          </p>
        </motion.div>
      </section>

      <ClaviFooter />
    </div>
  );
}
