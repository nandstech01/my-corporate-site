'use client';

import { motion } from 'framer-motion';
import { Search, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import { useClaviTheme } from '@/app/clavi/context';

export default function AnalyzeFeaturePage() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <ClaviPublicHeader />
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF' }}>
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>分析機能</h1>
            <p className="text-lg mb-8" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
              URLを入力するだけで、ページの構造化データ対応状況を瞬時に分析します。
            </p>

            <div className="space-y-4 mb-10">
              {[
                'メタデータ自動抽出（title, description, og:image等）',
                '既存JSON-LD/Microdata検出・バリデーション',
                '見出し構造（H1-H6）の階層チェック',
                'AI構造化スコア（0-100点）算出',
                'Fragment ID最適化候補の提案',
                'Schema.org準拠度チェック',
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
