'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useClaviTheme } from '@/app/clavi/context'
import { Search, RefreshCw, Plus, Minus, Maximize2, Sparkles } from 'lucide-react'

const recommendedLinks = [
  { title: 'SEOの基本ガイド2024', path: '/blog/seo-basics-2024', score: 98, level: 'high' },
  { title: 'コンテンツマーケティング戦略', path: '/services/content-marketing', score: 92, level: 'high' },
  { title: 'キーワード選定ツール', path: '/tools/keyword-research', score: 85, level: 'mid' },
  { title: '競合分析レポート', path: '/reports/competitor-analysis', score: 74, level: 'low' },
  { title: 'Webサイトスピード改善', path: '/blog/speed-optimization', score: 68, level: 'low' },
]

export default function LinksPage() {
  const { theme } = useClaviTheme()
  const isDark = theme === 'dark'
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  const scoreColor = (level: string) => {
    if (level === 'high') return { bg: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', text: isDark ? '#6EE7B7' : '#065F46' }
    if (level === 'mid') return { bg: isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF', text: isDark ? '#67E8F9' : '#0E7490' }
    return { bg: isDark ? 'rgba(251,191,36,0.15)' : '#FFFBEB', text: isDark ? '#FCD34D' : '#92400E' }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            内部リンク最適化
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            サイト構造を可視化し、SEOパフォーマンスを最大化するためのリンク機会を発見
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center rounded-lg px-3 py-1.5"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <Search className="w-3.5 h-3.5 mr-2" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
            <input
              type="text"
              placeholder="URLを検索..."
              className="bg-transparent border-none text-xs focus:ring-0 focus:outline-none p-0 w-32"
              style={{ color: isDark ? '#E2E8F0' : '#334155' }}
              readOnly
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors shadow-lg shadow-cyan-500/20">
            <RefreshCw className="w-3.5 h-3.5" />
            再分析
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0">
        {/* Graph Panel */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden flex flex-col relative"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          {/* Graph Badges */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            <div className="backdrop-blur-md text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5"
              style={{
                background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                color: isDark ? '#E2E8F0' : '#334155',
              }}
            >
              ノード数: <span className="font-bold text-[#06B6D4]">142</span>
            </div>
            <div className="backdrop-blur-md text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5"
              style={{
                background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                color: isDark ? '#E2E8F0' : '#334155',
              }}
            >
              孤立ページ: <span className="font-bold text-red-400">3</span>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            {[Plus, Minus, Maximize2].map((Icon, i) => (
              <button
                key={i}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  background: isDark ? '#224249' : '#F1F5F9',
                  border: `1px solid ${isDark ? '#2d5359' : '#E2E8F0'}`,
                  color: isDark ? '#90c1cb' : '#64748B',
                }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Network Graph */}
          <div
            className="flex-1 relative overflow-hidden flex items-center justify-center min-h-[300px]"
            style={{
              background: isDark
                ? 'radial-gradient(circle at center, #1a2f33 0%, #102023 100%)'
                : 'radial-gradient(circle at center, #F8FAFC 0%, #F1F5F9 100%)',
            }}
          >
            {/* Dot Grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(${isDark ? '#224249' : '#CBD5E1'} 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
                opacity: 0.3,
              }}
            />

            {/* SVG Lines */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#06B6D4', stopOpacity: 0.6 }} />
                  <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 0.15 }} />
                </linearGradient>
              </defs>
              <g stroke="url(#linkGrad)" strokeWidth="1.5">
                <line x1="50%" y1="50%" x2="30%" y2="30%" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="70%" y2="30%" />
                <line x1="50%" y1="50%" x2="20%" y2="65%" />
                <line x1="50%" y1="50%" x2="80%" y2="65%" />
                <line x1="30%" y1="30%" x2="15%" y2="18%" />
                <line x1="30%" y1="30%" x2="38%" y2="15%" />
                <line x1="70%" y1="30%" x2="78%" y2="15%" />
                <line x1="20%" y1="65%" x2="10%" y2="78%" />
                <line x1="80%" y1="65%" x2="90%" y2="78%" />
                <line x1="30%" y1="30%" x2="70%" y2="30%" strokeDasharray="4" strokeOpacity="0.15" />
              </g>
            </svg>

            {/* Center Node */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center z-20"
              style={{
                background: '#06B6D4',
                boxShadow: '0 0 30px rgba(6,182,212,0.5)',
                border: `3px solid ${isDark ? '#102023' : '#FFFFFF'}`,
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <span className="text-white text-lg font-bold">H</span>
            </div>

            {/* Level 2 Nodes */}
            {[
              { top: '30%', left: '30%', color: '#22D3EE' },
              { top: '30%', left: '70%', color: '#22D3EE' },
              { top: '65%', left: '20%', color: '#818CF8' },
              { top: '65%', left: '80%', color: '#818CF8' },
            ].map((node, i) => (
              <div
                key={i}
                className="absolute w-9 h-9 rounded-full z-10 cursor-pointer hover:scale-110 transition-transform"
                style={{
                  top: node.top,
                  left: node.left,
                  background: node.color,
                  boxShadow: `0 0 15px ${node.color}50`,
                  border: `2px solid ${isDark ? '#102023' : '#FFFFFF'}`,
                  animation: `float ${4 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
                }}
              />
            ))}

            {/* Leaf Nodes */}
            {[
              { top: '18%', left: '15%' },
              { top: '15%', left: '38%' },
              { top: '15%', left: '78%' },
              { top: '78%', left: '10%' },
              { top: '78%', left: '90%' },
            ].map((node, i) => (
              <div
                key={i}
                className="absolute w-5 h-5 rounded-full"
                style={{
                  top: node.top,
                  left: node.left,
                  background: isDark ? '#334155' : '#CBD5E1',
                  border: `1px solid ${isDark ? '#475569' : '#94A3B8'}`,
                }}
              />
            ))}

            {/* Tooltip */}
            <div
              className="absolute top-[26%] left-[33%] text-[10px] p-2 rounded shadow-xl pointer-events-none"
              style={{
                background: isDark ? '#182f34' : '#FFFFFF',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                animation: 'float 3s ease-in-out infinite 0.5s',
              }}
            >
              <div className="font-bold text-[#06B6D4]">/services/optimization</div>
              <div style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>リンク数: 12</div>
            </div>
          </div>

          {/* Legend */}
          <div
            className="h-10 flex items-center px-4 justify-between text-[10px] flex-shrink-0"
            style={{
              borderTop: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              color: isDark ? '#6a8b94' : '#94A3B8',
            }}
          >
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> トップページ</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE]" /> 第2階層</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" /> 記事ページ</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: isDark ? '#334155' : '#CBD5E1' }} /> その他</div>
            </div>
            <div>最終更新: 2026/01/25 14:30</div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            <div
              className="p-3.5 rounded-xl"
              style={{
                background: isDark ? '#182f34' : '#FFFFFF',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              }}
            >
              <div className="text-[10px] font-medium uppercase mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                平均クリック深度
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>2.4</span>
                <span className="text-[10px] font-medium text-emerald-500 mb-0.5">▼ 0.2</span>
              </div>
            </div>
            <div
              className="p-3.5 rounded-xl"
              style={{
                background: isDark ? '#182f34' : '#FFFFFF',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              }}
            >
              <div className="text-[10px] font-medium uppercase mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                リンクスコア
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>84</span>
                <span className="text-[10px] font-medium text-emerald-500 mb-0.5">▲ 5.2</span>
              </div>
            </div>
          </div>

          {/* Recommended Links */}
          <div
            className="flex-1 rounded-xl flex flex-col min-h-0 overflow-hidden"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <div
              className="px-4 py-2.5 flex justify-between items-center flex-shrink-0"
              style={{
                borderBottom: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                background: isDark ? '#142628' : '#F8FAFC',
              }}
            >
              <h2 className="text-xs font-bold flex items-center gap-1.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                <span className="text-amber-400">★</span>
                推奨リンク
              </h2>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>ターゲット</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>関連度</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedLinks.map((link, i) => {
                    const sc = scoreColor(link.level)
                    return (
                      <tr
                        key={i}
                        onClick={() => setSelectedRow(i)}
                        className="cursor-pointer transition-colors"
                        style={{
                          background: selectedRow === i
                            ? isDark ? 'rgba(6,182,212,0.08)' : '#F0FDFA'
                            : 'transparent',
                          borderBottom: `1px solid ${isDark ? '#1e3a3f' : '#F1F5F9'}`,
                        }}
                      >
                        <td className="px-3 py-2.5">
                          <div className="text-xs font-medium truncate max-w-[160px]" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                            {link.title}
                          </div>
                          <div className="text-[10px] truncate max-w-[160px]" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>
                            {link.path}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            {link.score}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div
              className="px-4 py-2.5 text-center flex-shrink-0"
              style={{
                borderTop: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                background: isDark ? '#142628' : '#F8FAFC',
              }}
            >
              <button className="text-[11px] text-[#06B6D4] font-medium hover:underline">
                すべての推奨事項を見る (24件)
              </button>
            </div>
          </div>

          {/* AI Anchor Text Card */}
          <div
            className="rounded-xl p-4 relative overflow-hidden flex-shrink-0"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
                : 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
            }}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-white text-xs font-bold mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                AI アンカーテキスト提案
              </h3>
              <p className="text-indigo-200 text-[10px] mb-3">
                選択したリンクに最適なアンカーテキストを自動生成
              </p>
              <div
                className="rounded p-2.5 mb-3"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p className="text-[10px] text-gray-300">
                  推奨: <span className="text-white font-mono bg-indigo-500/40 px-1 rounded">&ldquo;効果的なSEO対策&rdquo;</span>
                </p>
              </div>
              <button className="w-full py-1.5 rounded text-xs font-bold text-indigo-900 bg-white hover:bg-indigo-50 transition-colors">
                適用する
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Float animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </motion.div>
  )
}
