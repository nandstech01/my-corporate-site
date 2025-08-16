'use client'

import TextType from '@/components/common/TextType'
import { useState } from 'react'

const currentFeatures = [
  {
    title: "RAG検索実行",
    description: "自社知識×最新トレンド×YouTube情報から最適な情報を自動抽出",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    status: "✅ 実装済み"
  },
  {
    title: "7000文字記事生成",
    description: "OpenAI o1-miniによる高品質な長文コンテンツを自動生成",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    status: "✅ 実装済み"
  },
  {
    title: "FAQ自動生成",
    description: "8個のQ&A形式を記事内に自動挿入、構造化データでAI検索最適化",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    status: "✅ 実装済み"
  },
  {
    title: "Fragment ID付与",
    description: "各セクションに固有IDを付与し、AI検索エンジンでの部分引用を促進",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    status: "✅ 実装済み"
  },
  {
    title: "構造化データ生成",
    description: "Schema.org準拠のJSON-LDを自動生成、検索エンジンとAIの理解を向上",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    status: "✅ 実装済み"
  },
  {
    title: "ベクトル化・RAG資産化",
    description: "生成された記事を自動でベクトル化し、次回の検索対象として蓄積",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    status: "✅ 実装済み"
  }
]

const nextPhaseFeatures = [
  {
    title: "完全自動スケジューラー",
    description: "時間指定で記事生成を自動実行、365日無人で知識資産を蓄積",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    status: "🚧 次フェーズ"
  },
  {
    title: "AI引用最適化",
    description: "ChatGPT・Perplexity・Claudeでの引用率向上を自動監視・改善",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    status: "🚧 次フェーズ"
  },
  {
    title: "無限成長サイクル",
    description: "記事→ベクトル化→RAG蓄積→新記事生成の完全自動循環",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    status: "🚧 次フェーズ"
  }
]

const stats = [
  { label: "生成記事数", value: "37件", description: "すべてベクトル化済み" },
  { label: "FAQ自動生成", value: "8個/記事", description: "構造化データ対応" },
  { label: "文字数", value: "7000+文字", description: "AIに評価される長文" },
  { label: "検索対象", value: "100%", description: "トリプルRAGで活用" }
]

export default function AutoRAGGenerationSection() {
  const [activeTab, setActiveTab] = useState<'current' | 'next'>('current')

  return (
    <section id="auto-rag-generation" className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            <TextType 
              text="自立型AI記事生成システム" 
              className="text-white" 
              showCursor={false} 
              startOnVisible 
              as="span" 
            />
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            書けば書くほど賢くなる。AIに引用され続けるサイトへ自動進化
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Mike King理論に基づくレリバンスエンジニアリングを完全実装。
            生成された記事は自動でRAG資産化され、次回の記事生成に活用される無限成長サイクルを実現。
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{stat.value}</div>
              <div className="text-white font-semibold mb-1">{stat.label}</div>
              <div className="text-gray-400 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === 'current'
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🎯 現在実装済み
            </button>
            <button
              onClick={() => setActiveTab('next')}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === 'next'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🚀 次フェーズ予定
            </button>
          </div>
        </div>

        {/* Feature List */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {(activeTab === 'current' ? currentFeatures : nextPhaseFeatures).map((feature, index) => (
            <div 
              key={feature.title} 
              className={`bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 ${
                activeTab === 'current' ? 'hover:border-cyan-400/50' : 'hover:border-purple-400/50'
              }`}
            >
              <div className="mb-3" aria-hidden="true">{feature.icon}</div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  feature.status.includes('実装済み') 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {feature.status}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Automation Flow Diagram */}
        <div className="mt-16 bg-white/5 rounded-2xl border border-white/10 p-8">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            🔄 完全自動化フロー
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            {[
              { 
                icon: (
                  <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ), 
                label: "RAG検索", 
                desc: "トリプル検索" 
              },
              { 
                icon: (
                  <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ), 
                label: "記事生成", 
                desc: "7000文字" 
              },
              { 
                icon: (
                  <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), 
                label: "FAQ生成", 
                desc: "8個Q&A" 
              },
              { 
                icon: (
                  <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ), 
                label: "Fragment ID", 
                desc: "部分引用最適化" 
              },
              { 
                icon: (
                  <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ), 
                label: "構造化データ", 
                desc: "AI理解促進" 
              },
              { 
                icon: (
                  <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ), 
                label: "ベクトル化", 
                desc: "RAG資産蓄積" 
              },
              { 
                icon: (
                  <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ), 
                label: "AI引用", 
                desc: "検索エンジン最適化" 
              }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="mb-2">{step.icon}</div>
                <div className="text-white font-semibold text-sm mb-1">{step.label}</div>
                <div className="text-gray-400 text-xs">{step.desc}</div>
                {index < 6 && (
                  <div className="hidden md:block text-cyan-400 text-2xl mt-4">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Next Phase Value Proposition */}
        {activeTab === 'next' && (
          <div className="mt-12 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-400/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              🚀 完全自動化で実現する未来
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-white font-semibold mb-2">365日無人運営</h4>
                <p className="text-gray-300 text-sm">スケジューラーで記事生成を完全自動化</p>
              </div>
              <div>
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="text-white font-semibold mb-2">無限成長</h4>
                <p className="text-gray-300 text-sm">記事が記事を生む自己進化システム</p>
              </div>
              <div>
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="text-white font-semibold mb-2">ROI最大化</h4>
                <p className="text-gray-300 text-sm">AI検索時代の先行者利益を獲得</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
} 