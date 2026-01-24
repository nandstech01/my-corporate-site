'use client';

import { motion } from 'framer-motion';
import { Link2, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import { useClaviTheme } from '@/app/clavi/context';

export default function ExpandFeaturePage() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <ClaviPublicHeader />
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF' }}>
              <Link2 className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>拡張機能</h1>
            <p className="text-lg mb-8" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Fragment ID・内部リンク最適化・エンティティ連携でAI引用率を最大化。
            </p>

            <div className="space-y-4 mb-10">
              {[
                'Fragment ID自動付与（セクション単位の深いリンク）',
                '内部リンクのセマンティック最適化',
                'sameAs / mainEntity エンティティ連携',
                'クロスリファレンス（相互参照）提案',
                'AI引用フレンドリーなアンカー構造',
                'Passage Ranking最適化',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm" style={{ color: isDark ? '#E2E8F0' : '#475569' }}>{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/clavi/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              無料で試す <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
      <ClaviFooter />
    </div>
  );
}
