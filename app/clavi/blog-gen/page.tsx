'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useClaviTheme } from '@/app/clavi/context'

export default function BlogGeneratorPage() {
  const { theme } = useClaviTheme()
  const isDark = theme === 'dark'

  const [selectedTone, setSelectedTone] = useState('professional')
  const [selectedDirection, setSelectedDirection] = useState('guide')
  const [wordCount, setWordCount] = useState(3000)

  const tones = [
    { id: 'professional', label: 'Professional' },
    { id: 'casual', label: 'Casual' },
    { id: 'enthusiastic', label: 'Enthusiastic' },
    { id: 'technical', label: 'Technical' },
  ]

  const directions = [
    { id: 'guide', label: 'ガイド記事' },
    { id: 'casestudy', label: 'ケーススタディ' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Panel - Settings */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              ブログ記事生成
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
              AIを使ってSEOに強い記事を作成します
            </p>
          </div>

          {/* Source Analysis */}
          <div
            className="p-5 rounded-xl"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
              <span className="text-[#06B6D4]">◆</span>
              ソース分析
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                  分析対象 URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/source-article"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: isDark ? '#102023' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                    color: isDark ? '#E2E8F0' : '#334155',
                  }}
                  readOnly
                />
              </div>
              <button
                className="w-full py-2 px-4 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: isDark ? '#224249' : '#F1F5F9',
                  color: isDark ? '#90c1cb' : '#64748B',
                }}
              >
                URLを分析する
              </button>
            </div>
          </div>

          {/* Article Settings */}
          <div
            className="p-5 rounded-xl flex-grow"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
              <span className="text-[#06B6D4]">◆</span>
              記事設定
            </h2>

            <div className="space-y-5">
              {/* Direction */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                  記事の方向性
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {directions.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDirection(d.id)}
                      className="py-2 px-3 rounded-lg text-xs font-medium text-center transition-all"
                      style={{
                        background: selectedDirection === d.id
                          ? isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF'
                          : isDark ? '#102023' : '#F8FAFC',
                        border: `1px solid ${selectedDirection === d.id ? '#06B6D4' : isDark ? '#224249' : '#E2E8F0'}`,
                        color: selectedDirection === d.id
                          ? '#06B6D4'
                          : isDark ? '#90c1cb' : '#64748B',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Reader */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                  ターゲット読者
                </label>
                <select
                  className="w-full py-2 px-3 rounded-lg text-xs outline-none"
                  style={{
                    background: isDark ? '#102023' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                    color: isDark ? '#E2E8F0' : '#334155',
                  }}
                >
                  <option>CEO / 経営者</option>
                  <option>マーケティング担当者</option>
                  <option>開発者 / エンジニア</option>
                  <option>一般消費者</option>
                </select>
              </div>

              {/* Word Count */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                  文字数目安
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="500"
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#06B6D4]"
                    style={{ background: isDark ? '#224249' : '#E2E8F0' }}
                  />
                  <span className="text-xs font-bold text-[#06B6D4] w-14 text-right whitespace-nowrap">
                    {wordCount.toLocaleString()}字
                  </span>
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                  トーン＆マナー
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tones.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTone(t.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: selectedTone === t.id ? '#06B6D4' : isDark ? '#102023' : '#F1F5F9',
                        color: selectedTone === t.id ? '#FFFFFF' : isDark ? '#90c1cb' : '#64748B',
                        border: selectedTone === t.id ? '1px solid #06B6D4' : `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${isDark ? '#224249' : '#E2E8F0'}` }}>
              <button className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
                ✦ 記事を生成する
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {/* Preview Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
              <span className="text-[#06B6D4]">●</span>
              プレビュー
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
                style={{
                  background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                  color: isDark ? '#6EE7B7' : '#065F46',
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                JSON-LD 構造化データ付与済
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium"
                style={{
                  background: isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF',
                  color: isDark ? '#67E8F9' : '#0E7490',
                }}
              >
                SEOスコア: 92/100
              </span>
            </div>
          </div>

          {/* Preview Content */}
          <div
            className="flex-grow rounded-xl overflow-hidden flex flex-col"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <div className="flex-grow p-6 overflow-y-auto">
              {/* Draft Label */}
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#06B6D4] mb-2">
                Generated Draft
              </div>

              {/* Article Title */}
              <h1 className="text-xl font-bold mb-3 leading-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                2024年のデジタルトランスフォーメーション成功の鍵：AI統合ガイド
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {['#DX', '#ArtificialIntelligence', '#BusinessGrowth'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: isDark ? '#224249' : '#F1F5F9',
                      color: isDark ? '#90c1cb' : '#64748B',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta Description */}
              <p className="text-xs italic mb-5" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                Meta Description: 2024年における企業のDX推進にはAIの統合が不可欠です。本ガイドでは、経営層が知っておくべき導入戦略と成功事例を徹底解説します。
              </p>

              {/* Article Body (Sample) */}
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: isDark ? '#CBD5E1' : '#475569' }}>
                <p>
                  近年、デジタルトランスフォーメーション（DX）は単なるトレンドを超え、企業の生存戦略そのものとなりました。特に生成AIの台頭により、ビジネスプロセスは劇的な変化を遂げています。
                </p>

                <h2 className="text-base font-bold mt-6 mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  1. なぜ今、AI統合が急務なのか
                </h2>
                <p>
                  市場の変化スピードは加速しており、従来の手法では対応しきれない課題が増加しています。AIを業務フローの中核に据えることで、意思決定の迅速化とコスト削減を同時に実現することが可能です。
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                  <li>データドリブンな意思決定の実現</li>
                  <li>反復業務の自動化による生産性向上</li>
                  <li>顧客体験（CX）のパーソナライズ化</li>
                </ul>

                <h2 className="text-base font-bold mt-6 mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  2. 導入における主要な課題と解決策
                </h2>
                <p>
                  多くの企業が導入に失敗する原因は、「目的の不明確さ」と「社内リテラシーの不足」にあります。技術ありきではなく、解決すべきビジネス課題から逆算するアプローチが必要です。
                </p>

                <blockquote
                  className="border-l-2 pl-4 my-4 text-xs italic"
                  style={{
                    borderColor: '#06B6D4',
                    color: isDark ? '#67E8F9' : '#0E7490',
                  }}
                >
                  &ldquo;AIは魔法の杖ではありません。それを使いこなす人間のビジョンこそが、真の変革を生み出します。&rdquo;
                </blockquote>

                <h3 className="text-sm font-semibold mt-4 mb-1" style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>
                  2-1. 人材育成の重要性
                </h3>
                <p>
                  外部ベンダーに丸投げするのではなく、社内でAIを活用できる人材を育成することが、持続的な成長への近道です。リスキリングプログラムの導入を検討しましょう。
                </p>
              </div>

              {/* Fade overlay */}
              <div
                className="h-16 -mt-16 relative pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${isDark ? '#182f34' : '#FFFFFF'})`,
                }}
              />
            </div>

            {/* Action Bar */}
            <div
              className="px-4 py-3 flex items-center justify-between flex-shrink-0"
              style={{
                background: isDark ? '#142628' : '#F8FAFC',
                borderTop: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              }}
            >
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    color: isDark ? '#90c1cb' : '#64748B',
                  }}
                >
                  修正を依頼
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    color: isDark ? '#90c1cb' : '#64748B',
                  }}
                >
                  再生成
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: isDark ? '#224249' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#2d5359' : '#E2E8F0'}`,
                    color: isDark ? '#E2E8F0' : '#334155',
                  }}
                >
                  コピー
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors">
                  WordPressへ投稿
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
