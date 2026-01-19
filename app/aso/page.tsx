'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Layers,
  Shield,
  Zap,
  Globe,
  Copy,
  Check,
  FileCode2,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

type Theme = 'light' | 'dark';

// テーマ取得（localStorage > システム設定）
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';

  const stored = localStorage.getItem('aso-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function AsoLandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // テーマ初期化
  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  // テーマ切り替え
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('aso-theme', newTheme);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.push('/aso/dashboard');
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = () => {
    router.push('/aso/login');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "author": { "@type": "Person", "name": "Author" },
  "hasPart": [{ "@type": "WebPageElement", "@id": "#section-1" }]
}
</script>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // テーマに基づく色設定
  const colors = {
    bg: theme === 'dark'
      ? 'linear-gradient(180deg, #0A1628 0%, #1A2332 40%, #0D1B2A 70%, #050A14 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
    text: theme === 'dark' ? '#ffffff' : '#1a1a1a',
    textMuted: theme === 'dark' ? '#9ca3af' : '#6b7280',
    cardBg: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    cardBorder: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    codeBg: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
    stepBg: theme === 'dark' ? '#0D1B2A' : '#ffffff',
  };

  if (isLoading || !mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: colors.bg }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: colors.textMuted }} className="text-sm">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: colors.bg, color: colors.text }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: theme === 'dark'
            ? `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(168, 85, 247, 0.08), transparent 60%),
               radial-gradient(ellipse 60% 40% at 80% 100%, rgba(34, 211, 238, 0.05), transparent 50%)`
            : `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(168, 85, 247, 0.05), transparent 60%),
               radial-gradient(ellipse 60% 40% at 80% 100%, rgba(34, 211, 238, 0.03), transparent 50%)`
        }}
      />

      {/* Header */}
      <header
        className="relative z-50 border-b"
        style={{ borderColor: colors.cardBorder }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold tracking-tight" style={{ color: colors.text }}>ASO</span>
                <span className="font-normal hidden sm:inline ml-2" style={{ color: colors.textMuted }}>AI Search Optimizer</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* テーマ切り替えボタン */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full transition-all duration-300"
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: colors.textMuted
                }}
                aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={handleLogin}
                className="group px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all duration-300"
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.text
                }}
              >
                ログイン
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-40 pb-24 sm:pb-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-sm font-semibold tracking-widest uppercase mb-6"
              style={{ color: '#a855f7' }}
            >
              Structured Data Platform
            </motion.p>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6"
            >
              <span style={{ color: colors.text }}>URLを入力するだけで</span>
              <br />
              <span className="bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent">
                構造化データを自動生成
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ color: colors.textMuted }}
            >
              JSON-LD・Schema.org対応の構造化データを自動抽出。
              <span style={{ color: colors.text }}> WordPressにコピー&ペーストするだけ</span>で
              AI検索エンジン最適化を実現。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={handleLogin}
                className="group w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 font-semibold text-base text-white transition-all duration-300 flex items-center justify-center gap-3"
              >
                無料で始める
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 flex items-center justify-center"
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.text
                }}
              >
                機能を見る
              </a>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs tracking-wider" style={{ color: colors.textMuted }}>SCROLL</span>
            <svg className="w-5 h-5" style={{ color: colors.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Code Preview Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: colors.cardBorder }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs font-mono" style={{ color: colors.textMuted }}>structured-data.jsonld</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm"
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: colors.textMuted
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div
              className="p-6 sm:p-8 font-mono text-sm leading-relaxed overflow-x-auto"
              style={{ background: colors.codeBg }}
            >
              <div style={{ color: colors.textMuted }}>{'<script type="application/ld+json">'}</div>
              <div style={{ color: colors.text }}>{'{'}</div>
              <div className="pl-4">
                <span className="text-cyan-500">"@context"</span>
                <span style={{ color: colors.text }}>: </span>
                <span className="text-purple-500">"https://schema.org"</span>
                <span style={{ color: colors.text }}>,</span>
              </div>
              <div className="pl-4">
                <span className="text-cyan-500">"@type"</span>
                <span style={{ color: colors.text }}>: </span>
                <span className="text-purple-500">"Article"</span>
                <span style={{ color: colors.text }}>,</span>
              </div>
              <div className="pl-4">
                <span className="text-cyan-500">"headline"</span>
                <span style={{ color: colors.text }}>: </span>
                <span className="text-purple-500">"Your Article Title"</span>
                <span style={{ color: colors.text }}>,</span>
              </div>
              <div className="pl-4">
                <span className="text-cyan-500">"hasPart"</span>
                <span style={{ color: colors.text }}>: [{'{'}</span>
              </div>
              <div className="pl-8">
                <span className="text-cyan-500">"@type"</span>
                <span style={{ color: colors.text }}>: </span>
                <span className="text-purple-500">"WebPageElement"</span>
                <span style={{ color: colors.text }}>,</span>
              </div>
              <div className="pl-8">
                <span className="text-cyan-500">"@id"</span>
                <span style={{ color: colors.text }}>: </span>
                <span className="text-purple-500">"#section-1"</span>
              </div>
              <div className="pl-4" style={{ color: colors.text }}>{'}]'}</div>
              <div style={{ color: colors.text }}>{'}'}</div>
              <div style={{ color: colors.textMuted }}>{'</script>'}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <p
              className="text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: '#22d3ee' }}
            >
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: colors.text }}>
              すべてを、シンプルに
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
              AI検索エンジン最適化に必要なすべてを、ワンプラットフォームで
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: FileCode2,
                title: 'JSON-LD自動生成',
                description: 'Article、Organization、FAQ、HowToなど主要スキーマに完全対応。',
                color: '#a855f7'
              },
              {
                icon: Zap,
                title: '高速クロール',
                description: '平均3秒で分析完了。バッチ処理で100URL同時対応。',
                color: '#22d3ee'
              },
              {
                icon: Sparkles,
                title: 'Fragment ID',
                description: 'ページ内セクションのDeep Link IDを自動付与。',
                color: '#a855f7'
              },
              {
                icon: Shield,
                title: 'エンタープライズ',
                description: 'テナント分離・RLS・暗号化で企業データを安全に管理。',
                color: '#22d3ee'
              },
              {
                icon: Layers,
                title: 'hasPart最適化',
                description: 'Mike King理論準拠のセクション構造化でAI引用率を最大化。',
                color: '#a855f7'
              },
              {
                icon: Globe,
                title: 'WordPress連携',
                description: 'コピー&ペーストで即座に実装。プラグイン不要。',
                color: '#22d3ee'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 rounded-3xl transition-all duration-300"
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${feature.color}15`,
                    border: `1px solid ${feature.color}25`
                  }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: colors.text }}>{feature.title}</h3>
                <p className="leading-relaxed" style={{ color: colors.textMuted }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <p
              className="text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: '#a855f7' }}
            >
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight" style={{ color: colors.text }}>
              3ステップで完了
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'URLを入力',
                desc: '分析したいWebページのURLを入力。複数URL一括処理にも対応。'
              },
              {
                step: '02',
                title: 'AI自動分析',
                desc: 'メタデータ・見出し構造・既存JSON-LDを自動解析。Schema.org準拠データを生成。'
              },
              {
                step: '03',
                title: 'コピー&ペースト',
                desc: '生成されたJSON-LDをWordPressのheadタグにコピペ。AI検索最適化完了。'
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))',
                    }}
                  />
                  <div
                    className="absolute inset-[2px] rounded-2xl flex items-center justify-center"
                    style={{ background: colors.stepBg }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {item.step}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: colors.text }}>{item.title}</h3>
                <p className="leading-relaxed max-w-xs mx-auto" style={{ color: colors.textMuted }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center p-12 sm:p-16 lg:p-20 rounded-3xl relative overflow-hidden"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            {/* Gradient blur */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.15), transparent 70%)'
              }}
            />

            <div className="relative">
              <p
                className="text-sm font-semibold tracking-widest uppercase mb-4"
                style={{ color: '#22d3ee' }}
              >
                Get Started
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: colors.text }}>
                今すぐ始める
              </h2>
              <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: colors.textMuted }}>
                アカウントを作成して、AI検索エンジン最適化を始めましょう。
                <span style={{ color: colors.text }}> 初期費用無料</span>でスタートできます。
              </p>

              <button
                onClick={handleLogin}
                className="group px-10 py-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 font-semibold text-lg text-white transition-all duration-300 inline-flex items-center gap-3"
              >
                ログインして開始
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-8 px-4 sm:px-6 lg:px-8 border-t"
        style={{ borderColor: colors.cardBorder }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm" style={{ color: colors.textMuted }}>AI Search Optimizer</span>
          </div>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            © 2026 ASO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
