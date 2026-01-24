'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import { useClaviTheme } from '@/app/clavi/context';

const caseStudies = [
  {
    id: 'media-company',
    title: 'メディア企業A社',
    industry: 'メディア・出版',
    result: 'AI検索からの流入 +180%',
    description: '300ページ以上のコンテンツにJSON-LDを自動適用。ChatGPT・Perplexityからの引用率が大幅改善。',
    metrics: { before: 12, after: 78 },
  },
  {
    id: 'ec-site',
    title: 'ECサイトB社',
    industry: 'Eコマース',
    result: 'リッチリザルト表示率 +250%',
    description: '商品ページにProduct・Reviewスキーマを自動生成。Google検索結果でのリッチスニペット表示が大幅増加。',
    metrics: { before: 8, after: 65 },
  },
  {
    id: 'saas-company',
    title: 'SaaS企業C社',
    industry: 'テクノロジー',
    result: 'ヘルプ記事の引用率 +320%',
    description: 'FAQとHowToスキーマを全ヘルプ記事に適用。AIアシスタントからの参照回数が飛躍的に向上。',
    metrics: { before: 5, after: 72 },
  },
];

export default function CaseStudiesPage() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <ClaviPublicHeader />

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>導入事例</h1>
            <p className="text-lg" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>CLAVI導入で成果を出した企業の事例</p>
          </motion.div>

          <div className="space-y-6">
            {caseStudies.map((cs, i) => (
              <motion.div
                key={cs.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/clavi/case-studies/${cs.id}`}>
                  <div
                    className="p-6 rounded-xl transition-all hover:shadow-md"
                    style={{
                      background: isDark ? '#1E293B' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF', color: '#2563EB' }}>
                            {cs.industry}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{cs.title}</h3>
                        <p className="text-sm mb-2" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{cs.description}</p>
                        <div className="flex items-center gap-1.5 text-emerald-500 font-semibold text-sm">
                          <TrendingUp className="w-4 h-4" />
                          {cs.result}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xs mb-0.5" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>Before</div>
                          <div className="text-xl font-bold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{cs.metrics.before}</div>
                        </div>
                        <ArrowRight className="w-4 h-4" style={{ color: isDark ? '#64748B' : '#94A3B8' }} />
                        <div className="text-center">
                          <div className="text-xs mb-0.5" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>After</div>
                          <div className="text-xl font-bold text-blue-600">{cs.metrics.after}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ClaviFooter />
    </div>
  );
}
