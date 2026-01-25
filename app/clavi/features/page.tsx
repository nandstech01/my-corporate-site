'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Sparkles, Network, ArrowRight, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import ClaviPublicHeader from '@/components/clavi/ClaviPublicHeader';
import ClaviFooter from '@/components/clavi/ClaviFooter';
import { FeaturesHeroPlayer } from '@/components/clavi/FeaturesHeroPlayer';
import { useClaviTheme } from '@/app/clavi/context';

type TabKey = 'analyze' | 'generate' | 'expand';

const tabs: { key: TabKey; label: string; icon: typeof BarChart3; color: string }[] = [
  { key: 'analyze', label: '分析', icon: BarChart3, color: '#2563EB' },
  { key: 'generate', label: '生成', icon: Sparkles, color: '#06B6D4' },
  { key: 'expand', label: '拡張', icon: Network, color: '#8B5CF6' },
];

const columns = [
  {
    key: 'analyze' as TabKey,
    title: 'Analyze',
    titleJp: '分析',
    icon: BarChart3,
    color: '#2563EB',
    description: '現状のコンテンツ構造をAIが深く理解し、改善点を可視化します。',
    cards: [
      {
        title: 'AI Structure Score',
        desc: 'ページ構造の健全性を0-100でスコアリング。不足している見出しや論理構成の欠陥を即座に特定。',
        href: '/clavi/features/analyze',
      },
      {
        title: '競合ギャップ分析',
        desc: '上位表示されている競合サイトと比較し、自社に不足しているトピックやキーワードを抽出。',
        href: '/clavi/features/analyze',
      },
    ],
  },
  {
    key: 'generate' as TabKey,
    title: 'Generate',
    titleJp: '生成',
    icon: Sparkles,
    color: '#06B6D4',
    description: '解析データに基づき、検索エンジンとユーザーの両方に響くコンテンツを生成。',
    cards: [
      {
        title: 'JSON-LD 自動生成',
        desc: 'Googleが理解しやすい構造化データを自動生成。リッチリザルトへの表示率を高めます。',
        href: '/clavi/features/generate',
      },
      {
        title: 'スマートメタ最適化',
        desc: 'クリック率を最大化するタイトルタグとメタディスクリプションを、キーワード意図に合わせて提案。',
        href: '/clavi/features/generate',
      },
    ],
  },
  {
    key: 'expand' as TabKey,
    title: 'Expand',
    titleJp: '拡張',
    icon: Network,
    color: '#8B5CF6',
    description: 'サイト全体の接続性を強化し、ドメインパワーを底上げします。',
    cards: [
      {
        title: '内部リンク最適化',
        desc: '関連性の高い記事同士を自動でリンク。クローラーの巡回効率を高め、ページ評価を均等化。',
        href: '/clavi/features/expand',
      },
      {
        title: 'トピッククラスター設計',
        desc: 'ピラーページとクラスターコンテンツの設計を自動化。専門性を高めるサイト構造を提案。',
        href: '/clavi/features/expand',
      },
    ],
  },
];

export default function FeaturesPage() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabKey>('analyze');

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <ClaviPublicHeader />

      {/* Hero Section with Remotion Animation */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        {/* Remotion Animation Background + Text */}
        <div className="relative w-full" style={{ aspectRatio: '1200/600', maxHeight: '500px' }}>
          <FeaturesHeroPlayer />
        </div>

        {/* Content below animation */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center -mt-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed mb-10"
            style={{ color: isDark ? '#E2E8F0' : '#374151' }}
          >
            URLを入力するだけで、AIがコンテンツを解析、生成、そして拡張します。<br />
            SEOに最適化されたワークフローを体験してください。
          </motion.p>

          {/* URL Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20" />
            <div className="relative flex items-center rounded-xl shadow-2xl p-2"
              style={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
              }}
            >
              <LinkIcon className="w-5 h-5 ml-3" style={{ color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="https://your-website.com"
                readOnly
                className="w-full bg-transparent border-none text-lg py-3 px-4 outline-none"
                style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}
              />
              <Link
                href="/clavi/signup"
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors whitespace-nowrap"
                style={{ background: '#2563EB' }}
              >
                分析する
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20" style={{ background: isDark ? '#0F172A' : '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Tab Navigation */}
          <div className="flex justify-center mb-16 space-x-4 sm:space-x-12">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex flex-col items-center gap-2 group cursor-pointer transition-opacity"
                  style={{ opacity: isActive ? 1 : 0.5 }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                    style={{
                      background: isActive
                        ? (isDark ? `${tab.color}20` : `${tab.color}15`)
                        : (isDark ? '#1E293B' : '#F1F5F9'),
                      color: isActive ? tab.color : (isDark ? '#E2E8F0' : '#374151'),
                    }}
                  >
                    <tab.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
                    {tab.label}
                  </span>
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: isActive ? '3rem' : '0',
                      background: tab.color,
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* 3-Column Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {columns.map((col) => (
              <div key={col.key} className="flex flex-col gap-6">
                {/* Column Header */}
                <div className="flex items-center gap-3 mb-2">
                  <col.icon className="w-7 h-7" style={{ color: col.color }} />
                  <h2 className="text-2xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
                    {col.title}
                  </h2>
                </div>
                <p className="text-sm mb-4" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
                  {col.description}
                </p>

                {/* Feature Cards */}
                {col.cards.map((card) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-2xl p-6 shadow-xl h-full flex flex-col transition-all hover:-translate-y-1"
                    style={{
                      background: isDark ? '#1E293B' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`,
                    }}
                  >
                    {/* Visual Illustration */}
                    <div
                      className="h-40 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center"
                      style={{
                        background: isDark ? '#0F172A' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`,
                      }}
                    >
                      {card.title === 'AI Structure Score' && (
                        <div className="relative w-28 h-28">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="56" cy="56" r="48" fill="transparent"
                              stroke={isDark ? '#334155' : '#E2E8F0'}
                              strokeWidth="10"
                            />
                            <circle
                              cx="56" cy="56" r="48" fill="transparent"
                              stroke="#2563EB"
                              strokeWidth="10"
                              strokeDasharray="301.6"
                              strokeDashoffset="54"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>82</span>
                            <span className="text-[10px] font-medium uppercase" style={{ color: '#64748B' }}>Score</span>
                          </div>
                        </div>
                      )}
                      {card.title === '競合ギャップ分析' && (
                        <div className="w-full px-4 space-y-3">
                          <div className="flex justify-between text-[10px] font-semibold" style={{ color: '#64748B' }}>
                            <span>ターゲットキーワード</span>
                            <span>ギャップ</span>
                          </div>
                          <div className="w-full rounded-full h-2" style={{ background: isDark ? '#334155' : '#E2E8F0' }}>
                            <div className="bg-red-400 h-2 rounded-full" style={{ width: '45%' }} />
                          </div>
                          <div className="w-full rounded-full h-2" style={{ background: isDark ? '#334155' : '#E2E8F0' }}>
                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '70%' }} />
                          </div>
                          <div className="w-full rounded-full h-2" style={{ background: isDark ? '#334155' : '#E2E8F0' }}>
                            <div className="bg-green-400 h-2 rounded-full" style={{ width: '90%' }} />
                          </div>
                        </div>
                      )}
                      {card.title === 'JSON-LD 自動生成' && (
                        <div className="font-mono text-xs leading-relaxed px-4" style={{ color: '#06B6D4' }}>
                          {'{'}<br />
                          &nbsp;&nbsp;&quot;@context&quot;: &quot;https://schema.org&quot;,<br />
                          &nbsp;&nbsp;&quot;@type&quot;: &quot;Article&quot;,<br />
                          &nbsp;&nbsp;&quot;headline&quot;: &quot;AI Content Strategy&quot;<br />
                          {'}'}
                        </div>
                      )}
                      {card.title === 'スマートメタ最適化' && (
                        <div className="w-full px-4 flex flex-col justify-center gap-2">
                          <div className="rounded shadow-sm p-3"
                            style={{ background: isDark ? '#334155' : '#FFFFFF' }}
                          >
                            <div className="h-2 w-1/3 bg-blue-600 rounded mb-2" />
                            <div className="h-2 w-3/4 rounded" style={{ background: isDark ? '#475569' : '#E2E8F0' }} />
                          </div>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 rounded text-[10px] font-bold"
                              style={{ background: isDark ? 'rgba(34,197,94,0.15)' : '#DCFCE7', color: '#16A34A' }}
                            >最適な長さ</span>
                            <span className="px-2 py-1 rounded text-[10px] font-bold"
                              style={{ background: isDark ? 'rgba(37,99,235,0.15)' : '#DBEAFE', color: '#2563EB' }}
                            >高CTR</span>
                          </div>
                        </div>
                      )}
                      {card.title === '内部リンク最適化' && (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute w-2 h-2 bg-purple-500 rounded-full" style={{ top: '25%', left: '25%' }} />
                          <div className="absolute w-3 h-3 bg-purple-500 rounded-full shadow-lg z-10" style={{ top: '45%', left: '45%' }} />
                          <div className="absolute w-2 h-2 bg-purple-500 rounded-full" style={{ bottom: '25%', right: '25%' }} />
                          <div className="absolute w-2 h-2 bg-purple-500/50 rounded-full" style={{ top: '33%', right: '33%' }} />
                          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
                            <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#8B5CF6" strokeWidth="1" />
                            <line x1="75%" y1="75%" x2="50%" y2="50%" stroke="#8B5CF6" strokeWidth="1" />
                            <line x1="66%" y1="33%" x2="50%" y2="50%" stroke="#8B5CF6" strokeWidth="1" />
                          </svg>
                        </div>
                      )}
                      {card.title === 'トピッククラスター設計' && (
                        <div className="grid grid-cols-2 gap-2 w-full max-w-[120px]">
                          <div className="h-8 rounded"
                            style={{
                              background: isDark ? 'rgba(139,92,246,0.15)' : '#F3E8FF',
                              border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : '#E9D5FF'}`,
                            }}
                          />
                          <div className="h-8 rounded"
                            style={{
                              background: isDark ? 'rgba(139,92,246,0.15)' : '#F3E8FF',
                              border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : '#E9D5FF'}`,
                            }}
                          />
                          <div className="col-span-2 h-8 bg-purple-500 rounded flex items-center justify-center text-white text-[10px] font-bold">
                            Pillar Page
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <h3 className="text-lg font-bold mb-2" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
                      {card.title}
                    </h3>
                    <p className="text-sm mb-4 flex-grow" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
                      {card.desc}
                    </p>
                    <Link
                      href={card.href}
                      className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                      style={{ color: col.color }}
                    >
                      詳しく見る <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t" style={{
        background: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#334155' : '#F1F5F9',
      }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6" style={{ color: isDark ? '#F8FAFC' : '#1E293B' }}>
            コンテンツ戦略を最適化する準備はできましたか？
          </h2>
          <p className="text-lg mb-8" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
            数千のウェブサイトがCLAVIを使ってオーガニックトラフィックを伸ばしています。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/clavi/signup"
              className="px-8 py-3 rounded-xl text-lg font-semibold text-white shadow-lg transition-all hover:-translate-y-1"
              style={{ background: '#2563EB' }}
            >
              無料トライアルを開始
            </Link>
            <Link
              href="/clavi/contact"
              className="px-8 py-3 rounded-xl text-lg font-semibold transition-all"
              style={{
                background: isDark ? '#334155' : '#FFFFFF',
                color: isDark ? '#F8FAFC' : '#1E293B',
                border: `1px solid ${isDark ? '#475569' : '#E2E8F0'}`,
              }}
            >
              デモを見る
            </Link>
          </div>
        </div>
      </section>

      <ClaviFooter />
    </div>
  );
}
