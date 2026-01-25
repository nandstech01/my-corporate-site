'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import { useClaviTheme } from '@/app/clavi/context';

const caseStudiesData: Record<string, any> = {
  'media-company': {
    title: 'メディア企業A社',
    industry: 'メディア・出版',
    result: 'AI検索からの流入 +180%',
    challenge: '300ページ以上のコンテンツがあるが、構造化データが未整備。AI検索エンジンからの引用がほとんどない状態。',
    solution: 'CLAVIのバッチ分析機能で全ページを一括スキャン。Article・BreadcrumbList・FAQスキーマを自動生成し、CMSテンプレートに組み込み。',
    results: ['AI構造化スコア: 平均12点 → 78点', 'ChatGPT引用率: +180%', 'Perplexity参照: 月間50件 → 200件以上', 'オーガニック流入: +45%'],
    metrics: { before: 12, after: 78 },
  },
  'ec-site': {
    title: 'ECサイトB社',
    industry: 'Eコマース',
    result: 'リッチリザルト表示率 +250%',
    challenge: '5,000SKU以上の商品ページにProduct・Reviewスキーマが存在しない。リッチスニペットでの表示がほぼゼロ。',
    solution: 'CLAVIのJSON-LD生成APIを既存CMSと連携。商品データベースからProduct・AggregateRatingスキーマを自動挿入。',
    results: ['リッチリザルト表示: +250%', 'CTR改善: +35%', 'AI検索からの商品参照: +120%', '導入工数: 従来の1/10'],
    metrics: { before: 8, after: 65 },
  },
  'saas-company': {
    title: 'SaaS企業C社',
    industry: 'テクノロジー',
    result: 'ヘルプ記事の引用率 +320%',
    challenge: 'ヘルプセンターの200記事がAIアシスタントから全く参照されない。カスタマーサポートの負荷が高止まり。',
    solution: 'FAQ・HowToスキーマ+Fragment IDを全記事に適用。セクション単位での深いリンク構造を実現。',
    results: ['AIアシスタント引用: +320%', 'サポート問い合わせ: -25%', 'セルフサービス解決率: +40%', 'AI構造化スコア: 5点 → 72点'],
    metrics: { before: 5, after: 72 },
  },
};

export default function CaseStudyDetailPage() {
  const params = useParams();
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';
  const id = params.id as string;
  const cs = caseStudiesData[id];

  if (!cs) {
    return (
      <div className="min-h-screen" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
        <ClaviPublicHeader />
        <div className="py-20 text-center">
          <p style={{ color: isDark ? '#E2E8F0' : '#374151' }}>事例が見つかりません</p>
          <Link href="/clavi/case-studies" className="text-blue-600 mt-2 inline-block">一覧に戻る</Link>
        </div>
        <ClaviFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <ClaviPublicHeader />

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/clavi/case-studies" className="inline-flex items-center gap-1.5 text-sm text-blue-600 mb-6">
              <ArrowLeft className="w-4 h-4" /> 事例一覧に戻る
            </Link>

            <span className="text-xs font-medium px-2 py-0.5 rounded-md inline-block mb-3" style={{ background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF', color: '#2563EB' }}>
              {cs.industry}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{cs.title}</h1>
            <div className="flex items-center gap-1.5 text-emerald-500 font-semibold mb-8">
              <TrendingUp className="w-5 h-5" /> {cs.result}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-xl text-center" style={{ background: isDark ? '#1E293B' : '#FFFFFF', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                <div className="text-xs mb-1" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>Before</div>
                <div className="text-3xl font-bold" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>{cs.metrics.before}</div>
                <div className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>AI Structure Score</div>
              </div>
              <div className="p-5 rounded-xl text-center" style={{ background: isDark ? '#1E293B' : '#FFFFFF', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                <div className="text-xs mb-1" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>After</div>
                <div className="text-3xl font-bold text-blue-600">{cs.metrics.after}</div>
                <div className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>AI Structure Score</div>
              </div>
            </div>

            {/* Content sections */}
            <div className="space-y-6">
              <div className="p-5 rounded-xl" style={{ background: isDark ? '#1E293B' : '#FFFFFF', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                <h2 className="text-sm font-semibold mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>課題</h2>
                <p className="text-sm" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>{cs.challenge}</p>
              </div>

              <div className="p-5 rounded-xl" style={{ background: isDark ? '#1E293B' : '#FFFFFF', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                <h2 className="text-sm font-semibold mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>ソリューション</h2>
                <p className="text-sm" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>{cs.solution}</p>
              </div>

              <div className="p-5 rounded-xl" style={{ background: isDark ? '#1E293B' : '#FFFFFF', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>成果</h2>
                <div className="space-y-2">
                  {cs.results.map((r: string) => (
                    <div key={r} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm" style={{ color: isDark ? '#E2E8F0' : '#475569' }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <ClaviFooter />
    </div>
  );
}
