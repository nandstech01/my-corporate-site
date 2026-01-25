'use client';

import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Search,
  Code2,
  Link2,
  Share2,
  Zap,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import { ClaviHeroPlayer } from '@/components/clavi/ClaviHeroPlayer';
import { HeroBackgroundPlayer } from '@/components/clavi/HeroBackgroundPlayer';
import { TypewriterHero } from '@/components/clavi/TypewriterHero';
import { useClaviTheme } from './context';

export default function AsoLandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showHeroContent, setShowHeroContent] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/clavi/dashboard');
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Wait for background animation to finish (3 seconds) before showing hero content
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowHeroContent(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}
      >
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  const faqs = [
    {
      q: '既存のSEOツール（Ahrefs/Semrush）の代わりになりますか？',
      a: 'いいえ。従来のSEOツールはキーワードリサーチやGoogle検索でのランキングに優れています。CLAVIはAI Overview（SGE）、ChatGPT引用、音声検索最適化に特化した補完レイヤーです。',
    },
    {
      q: 'CLAVIの導入に技術的な知識は必要ですか？',
      a: '一切不要です。Google Analyticsと同様のJavaScriptスニペット、または専用のWordPressプラグインを提供しています。導入後はバックグラウンドで自動的に動作します。',
    },
    {
      q: 'どのくらいで効果が出ますか？',
      a: 'プラットフォームによってクロール速度は異なりますが、通常2〜4週間以内にPerplexityやChatGPTでのコンテンツ参照方法に変化が見られます。',
    },
  ];

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ background: isDark ? '#0F172A' : '#F8FAFC', color: isDark ? '#E2E8F0' : '#1E293B' }}
    >
      <ClaviPublicHeader />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Animation Layer (left half only) - plays once then fades */}
        <div
          className="absolute left-0 top-0 w-1/2 h-full opacity-90 pointer-events-none hidden lg:block overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, black 0%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 60%, transparent 100%)',
          }}
        >
          <HeroBackgroundPlayer />
        </div>

        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            {/* Left: Text - appears after background animation (3 seconds) */}
            <div className="lg:col-span-6 text-center lg:text-left mb-12 lg:mb-0">
              {showHeroContent && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-6 border"
                    style={{
                      background: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF',
                      color: '#2563EB',
                      borderColor: isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE',
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                    </span>
                    New: Schema.org 16.0 対応
                  </div>

                  <TypewriterHero />

                  <p className="text-lg mb-8 leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    従来のSEOとは異なり、CLAVIはChatGPT、Gemini、PerplexityなどのAIクローラー向けにコンテンツ構造を最適化します。新しい検索時代への扉を開きましょう。
                  </p>

                  {/* URL Input + CTA */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="WebサイトのURLを入力"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none shadow-sm"
                        style={{
                          background: isDark ? '#1E293B' : '#FFFFFF',
                          border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                          color: isDark ? '#E2E8F0' : '#1E293B',
                        }}
                      />
                    </div>
                    <Link
                      href="/clavi/signup"
                      className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                      style={{ background: '#1E3A8A' }}
                    >
                      今すぐ分析
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <p className="mt-4 text-xs" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                    クレジットカード不要。14日間無料トライアル。
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right: Visual - Remotion Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-6 relative"
            >
              <div
                className="relative rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                }}
              >
                <ClaviHeroPlayer />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-8 border-y" style={{
        background: isDark ? '#0F172A' : '#FFFFFF',
        borderColor: isDark ? '#1E293B' : '#F1F5F9',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wider mb-6"
            style={{ color: isDark ? '#64748B' : '#94A3B8' }}
          >
            最新テクノロジー & AIクローラーに対応
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            {['Schema.org 16.0+', 'Google AI Overview', 'GPT-4 Omni', 'Perplexity'].map((name) => (
              <div key={name} className="flex items-center gap-2 font-bold text-lg"
                style={{ color: isDark ? '#94A3B8' : '#64748B' }}
              >
                <Search className="w-4 h-4" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After Section */}
      <section className="py-24" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: isDark ? '#FFFFFF' : '#1E3A8A' }}>
              あなたのコンテンツ、AIに見えていますか？
            </h2>
            <p style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="max-w-2xl mx-auto">
              従来のSEO構造だけでは不十分です。LLMはデータを異なる方法で読み取ります。CLAVIが生み出す違いをご覧ください。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: isDark ? '#1E293B' : '#F1F5F9',
                border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
              }}
            >
              <div className="absolute top-0 left-0 text-white text-xs font-bold px-3 py-1 rounded-br-lg" style={{ background: '#94A3B8' }}>
                導入前
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 mt-4" style={{ color: isDark ? '#E2E8F0' : '#475569' }}>
                <X className="w-5 h-5 text-gray-400" />
                非構造化データ
              </h3>
              <div className="font-mono text-sm p-4 rounded-lg border border-dashed"
                style={{
                  background: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  color: isDark ? '#94A3B8' : '#64748B',
                }}
              >
                <p>&lt;div class=&quot;content&quot;&gt;</p>
                <p className="pl-4">AIが関連性を解析しにくい、巨大なテキストブロック...</p>
                <p>&lt;/div&gt;</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-red-500 font-bold text-sm">
                <X className="w-4 h-4" />
                LLMに無視される
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl p-8 relative overflow-hidden shadow-xl"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(37,99,235,0.1), #1E293B)'
                  : 'linear-gradient(135deg, #EFF6FF, #FFFFFF)',
                border: '2px solid #2563EB',
              }}
            >
              <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                導入後: CLAVI最適化済
              </div>
              <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2 mt-4">
                <Check className="w-5 h-5 text-green-500" />
                構造化ナレッジグラフ
              </h3>
              <div className="font-mono text-sm p-4 rounded-lg"
                style={{
                  background: isDark ? '#0F172A' : '#FFFFFF',
                  border: '1px solid rgba(37,99,235,0.3)',
                }}
              >
                <p className="text-purple-600">&quot;type&quot;: &quot;Article&quot;,</p>
                <p className="text-blue-600">&quot;hasPart&quot;: [</p>
                <p className="pl-4 text-green-600">{`{"@type": "KeyInsight", "value": "..."}`}</p>
                <p className="text-blue-600">]</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-green-600 font-bold text-sm">
                <Zap className="w-4 h-4" />
                AIに引用・推薦される
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Keys Section */}
      <section className="py-20" style={{ background: isDark ? '#1E293B' : '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-black mb-16" style={{ color: isDark ? '#FFFFFF' : '#1E3A8A' }}>
            AI認識を解き放つ3つの鍵
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: <Code2 className="w-7 h-7 text-blue-600" />, title: 'セマンティックマークアップ', desc: 'エンティティ、関係性、コンテキストをクローラー向けに明示的に定義するJSON-LDスキーマを自動挿入します。', bg: isDark ? 'rgba(37,99,235,0.15)' : '#DBEAFE' },
              { icon: <Share2 className="w-7 h-7 text-cyan-600" />, title: 'コンテキスト伝播', desc: 'コンテンツを権威あるソースや内部ピラーページにリンクし、ナレッジグラフ上でのトピカルオーソリティを確立します。', bg: isDark ? 'rgba(6,182,212,0.15)' : '#CFFAFE' },
              { icon: <Zap className="w-7 h-7 text-indigo-600" />, title: 'リアルタイム適応', desc: 'AIアルゴリズムの進化（SGEアップデート等）に合わせてメタデータを継続的に更新し、コンテンツを常に最新に保ちます。', bg: isDark ? 'rgba(79,70,229,0.15)' : '#E0E7FF' },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl hover:shadow-xl transition-shadow"
                style={{
                  background: isDark ? '#0F172A' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`,
                }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: item.bg }}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {item.title}
                </h3>
                <p className="leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 overflow-hidden" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black" style={{ color: isDark ? '#FFFFFF' : '#1E3A8A' }}>ワークフロー</h2>
            <p className="mt-2" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>URLからAI最適化まで、わずか数秒で完了。</p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 hidden md:block z-0"
              style={{ background: isDark ? '#334155' : '#E2E8F0' }}
            />
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                { num: '1', title: 'URLを入力', desc: '記事やランディングページのリンクをダッシュボードに貼り付けるだけ。', color: '#1E3A8A' },
                { num: '2', title: 'AI分析', desc: 'CLAVIが構造、エンティティ、AIの回答トップとのギャップをスキャンします。', color: '#2563EB' },
                { num: '3', title: 'コードを展開', desc: '生成されたスクリプトタグをコピー、またはWordPressプラグインで導入。', color: '#06B6D4' },
              ].map((step) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl shadow-lg text-center hover:-translate-y-2 transition-transform"
                  style={{
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`,
                  }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white ring-4"
                    style={{
                      background: step.color,
                      boxShadow: `0 0 0 4px ${isDark ? '#1E293B' : '#FFFFFF'}`,
                    }}
                  >
                    {step.num}
                  </div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{step.title}</h4>
                  <p className="text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20" style={{ background: isDark ? '#1E293B' : '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: isDark ? '#FFFFFF' : '#1E3A8A' }}>
            CLAVI vs. 従来のSEOツール
          </h2>
          <div className="overflow-hidden rounded-xl shadow-sm"
            style={{ border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}
          >
            <table className="min-w-full divide-y" style={{ borderColor: isDark ? '#334155' : '#E2E8F0' }}>
              <thead style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>機能</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>従来のSEO</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-blue-600 uppercase tracking-wider"
                    style={{ background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF' }}
                  >CLAVI</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                {[
                  { feature: 'ターゲット', trad: '検索バー経由のユーザー', clavi: 'LLM & チャットボット' },
                  { feature: '最適化手法', trad: 'キーワード & 被リンク', clavi: 'エンティティ & ベクトル' },
                  { feature: 'コンテンツ構造', trad: 'H1, H2, H3 タグ', clavi: 'ディープ ナレッジグラフ' },
                  { feature: '更新頻度', trad: '手動 / 低速', clavi: 'リアルタイム / ダイナミック' },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{row.feature}</td>
                    <td className="px-6 py-4 text-sm text-center" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{row.trad}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600 text-center"
                      style={{ background: isDark ? 'rgba(37,99,235,0.05)' : 'rgba(239,246,255,0.5)' }}
                    >{row.clavi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: isDark ? '#FFFFFF' : '#1E3A8A' }}>
            よくある質問
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl shadow-sm overflow-hidden"
                style={{
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex justify-between items-center w-full p-6 text-left font-medium"
                  style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-sm leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#1E3A8A' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            AI検索時代を制する準備はできていますか？
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            500社以上の先進企業が、未来のデジタルプレゼンスを最適化しています。
          </p>
          <div className="bg-white/10 backdrop-blur-sm p-2 rounded-2xl inline-flex flex-col sm:flex-row w-full max-w-lg shadow-2xl">
            <input
              type="email"
              placeholder="ビジネスメールアドレスを入力"
              className="flex-grow bg-white/90 border-0 rounded-xl px-6 py-4 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none mb-2 sm:mb-0 sm:mr-2"
            />
            <Link
              href="/clavi/signup"
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-8 py-4 rounded-xl transition-colors whitespace-nowrap shadow-lg text-center"
            >
              無料で始める
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-4">14日間無料トライアル。いつでもキャンセル可能。</p>
        </div>
      </section>

      <ClaviFooter />
    </div>
  );
}
