'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useClaviTheme } from '@/app/clavi/context'
import { Search, RefreshCw, Plus, Minus, Maximize2, Sparkles, Loader2, AlertCircle } from 'lucide-react'

interface Analysis {
  id: string
  url: string
  company_name: string | null
  ai_structure_score: number | null
  status: string
  created_at: string
}

interface LinkRecommendation {
  title?: string
  targetUrl?: string
  target_url?: string
  path?: string
  score?: number
  relevance?: number
  level?: string
  anchorText?: string
  anchor_text?: string
  reason?: string
}

interface LinkData {
  recommendations: LinkRecommendation[]
  analysis: {
    id: string
    url: string
    companyName: string | null
    score: number | null
    createdAt: string
  }
  summary: {
    totalFragments: number
    avgRecommendations: number
    strongLinks: number
    moderateLinks: number
  }
  message?: string
}

export default function LinksPage() {
  const { theme } = useClaviTheme()
  const isDark = theme === 'dark'
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('')
  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysesLoading, setAnalysesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch analyses list on mount
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await fetch('/api/clavi/analyses?status=completed&limit=100')
        if (!res.ok) throw new Error('Failed to fetch analyses')
        const data = await res.json()
        setAnalyses(data.analyses || [])
        // Auto-select first analysis
        if (data.analyses?.length > 0) {
          setSelectedAnalysisId(data.analyses[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analyses')
      } finally {
        setAnalysesLoading(false)
      }
    }
    fetchAnalyses()
  }, [])

  // Fetch link data when analysis is selected
  const fetchLinks = useCallback(async (analysisId: string) => {
    if (!analysisId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clavi/links/${analysisId}`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to fetch links')
      }
      const data: LinkData = await res.json()
      setLinkData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load link data')
      setLinkData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedAnalysisId) {
      fetchLinks(selectedAnalysisId)
    }
  }, [selectedAnalysisId, fetchLinks])

  const normalizeRecommendation = (rec: LinkRecommendation) => ({
    title: rec.title || rec.targetUrl || rec.target_url || rec.path || 'Unknown',
    path: rec.path || rec.targetUrl || rec.target_url || '',
    score: rec.score ?? rec.relevance ?? 0,
    anchorText: rec.anchorText || rec.anchor_text || '',
    reason: rec.reason || '',
  })

  const getLevel = (score: number): string => {
    if (score >= 80) return 'high'
    if (score >= 50) return 'mid'
    return 'low'
  }

  const scoreColor = (level: string) => {
    if (level === 'high') return { bg: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', text: isDark ? '#6EE7B7' : '#065F46' }
    if (level === 'mid') return { bg: isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF', text: isDark ? '#67E8F9' : '#0E7490' }
    return { bg: isDark ? 'rgba(251,191,36,0.15)' : '#FFFBEB', text: isDark ? '#FCD34D' : '#92400E' }
  }

  const recommendations = (linkData?.recommendations || []).map(normalizeRecommendation)
  const filteredRecommendations = searchQuery
    ? recommendations.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recommendations

  const summary = linkData?.summary || { totalFragments: 0, avgRecommendations: 0, strongLinks: 0, moderateLinks: 0 }
  const selectedRec = selectedRow !== null ? filteredRecommendations[selectedRow] : null

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
          {/* Analysis Selector */}
          <select
            value={selectedAnalysisId}
            onChange={(e) => setSelectedAnalysisId(e.target.value)}
            disabled={analysesLoading}
            className="rounded-lg px-3 py-1.5 text-xs outline-none"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              color: isDark ? '#E2E8F0' : '#334155',
            }}
          >
            {analysesLoading ? (
              <option>読み込み中...</option>
            ) : analyses.length === 0 ? (
              <option value="">分析データなし</option>
            ) : (
              analyses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.url} {a.ai_structure_score ? `(${a.ai_structure_score}点)` : ''}
                </option>
              ))
            )}
          </select>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs focus:ring-0 focus:outline-none p-0 w-32"
              style={{ color: isDark ? '#E2E8F0' : '#334155' }}
            />
          </div>
          <button
            onClick={() => selectedAnalysisId && fetchLinks(selectedAnalysisId)}
            disabled={loading || !selectedAnalysisId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            再分析
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs"
          style={{
            background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
            border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#FECACA'}`,
            color: isDark ? '#FCA5A5' : '#DC2626',
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#06B6D4]" />
            <p className="text-xs" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>リンクデータを読み込み中...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
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
                推奨リンク: <span className="font-bold text-[#06B6D4]">{recommendations.length}</span>
              </div>
              <div className="backdrop-blur-md text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{
                  background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                  color: isDark ? '#E2E8F0' : '#334155',
                }}
              >
                フラグメント: <span className="font-bold text-[#06B6D4]">{summary.totalFragments}</span>
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

              {recommendations.length > 0 ? (
                <>
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
                      {summary.strongLinks > 2 && <line x1="30%" y1="30%" x2="15%" y2="18%" />}
                      {summary.strongLinks > 3 && <line x1="30%" y1="30%" x2="38%" y2="15%" />}
                      {summary.moderateLinks > 0 && <line x1="70%" y1="30%" x2="78%" y2="15%" />}
                      {summary.moderateLinks > 1 && <line x1="20%" y1="65%" x2="10%" y2="78%" />}
                      {recommendations.length > 4 && <line x1="80%" y1="65%" x2="90%" y2="78%" />}
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
                  ].slice(0, Math.min(4, recommendations.length)).map((node, i) => (
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
                  ].slice(0, Math.max(0, recommendations.length - 4)).map((node, i) => (
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
                  {linkData?.analysis?.url && (
                    <div
                      className="absolute top-[26%] left-[33%] text-[10px] p-2 rounded shadow-xl pointer-events-none"
                      style={{
                        background: isDark ? '#182f34' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                        animation: 'float 3s ease-in-out infinite 0.5s',
                      }}
                    >
                      <div className="font-bold text-[#06B6D4] truncate max-w-[200px]">
                        {linkData.analysis.url}
                      </div>
                      <div style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                        リンク数: {recommendations.length}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center z-10">
                  <p className="text-sm font-medium" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
                    {analyses.length === 0
                      ? '分析データがありません。まず分析を実行してください。'
                      : 'この分析にはリンク推奨データがありません'}
                  </p>
                </div>
              )}
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
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE]" /> 強い関連</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" /> 中程度</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: isDark ? '#334155' : '#CBD5E1' }} /> その他</div>
              </div>
              <div>
                強: {summary.strongLinks} / 中: {summary.moderateLinks}
              </div>
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
                  フラグメント数
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{summary.totalFragments}</span>
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
                  構造スコア
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {linkData?.analysis?.score ?? '---'}
                  </span>
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
                {filteredRecommendations.length === 0 ? (
                  <div className="flex items-center justify-center h-full p-4">
                    <p className="text-xs" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                      {searchQuery ? '検索結果がありません' : 'リンク推奨データがありません'}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>ターゲット</th>
                        <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>関連度</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecommendations.map((link, i) => {
                        const level = getLevel(link.score)
                        const sc = scoreColor(level)
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
                )}
              </div>

              <div
                className="px-4 py-2.5 text-center flex-shrink-0"
                style={{
                  borderTop: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                  background: isDark ? '#142628' : '#F8FAFC',
                }}
              >
                <span className="text-[11px] font-medium" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                  全 {filteredRecommendations.length} 件
                </span>
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
                    {selectedRec?.anchorText ? (
                      <>推奨: <span className="text-white font-mono bg-indigo-500/40 px-1 rounded">&ldquo;{selectedRec.anchorText}&rdquo;</span></>
                    ) : selectedRec ? (
                      <>推奨: <span className="text-white font-mono bg-indigo-500/40 px-1 rounded">&ldquo;{selectedRec.title}&rdquo;</span></>
                    ) : (
                      'リンクを選択してください'
                    )}
                  </p>
                </div>
                <button
                  disabled={!selectedRec}
                  className="w-full py-1.5 rounded text-xs font-bold text-indigo-900 bg-white hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  適用する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
