'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useClaviTheme } from '@/app/clavi/context'
import { Loader2, AlertCircle, Copy, Download, Check } from 'lucide-react'

interface Analysis {
  id: string
  url: string
  company_name: string | null
  ai_structure_score: number | null
  status: string
  created_at: string
}

interface GeneratedArticle {
  title: string
  content: string
  metaDescription: string
  suggestedTags: string[]
  wordCount: number
  analysisId: string
  sourceUrl: string
}

export default function BlogGeneratorPage() {
  const { theme } = useClaviTheme()
  const isDark = theme === 'dark'

  const [selectedTone, setSelectedTone] = useState('professional')
  const [selectedDirection, setSelectedDirection] = useState('guide')
  const [wordCount, setWordCount] = useState(3000)

  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedAnalysisId, setSelectedAnalysisId] = useState('')
  const [analysesLoading, setAnalysesLoading] = useState(true)

  const [generating, setGenerating] = useState(false)
  const [article, setArticle] = useState<GeneratedArticle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

  // Fetch analyses list on mount
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await fetch('/api/clavi/analyses?status=completed&limit=100')
        if (!res.ok) throw new Error('Failed to fetch analyses')
        const data = await res.json()
        setAnalyses(data.analyses || [])
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

  const handleGenerate = useCallback(async () => {
    if (!selectedAnalysisId) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/clavi/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: selectedAnalysisId,
          tone: selectedTone,
          direction: selectedDirection,
          wordCount,
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to generate article')
      }
      const data: GeneratedArticle = await res.json()
      setArticle(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate article')
    } finally {
      setGenerating(false)
    }
  }, [selectedAnalysisId, selectedTone, selectedDirection, wordCount])

  const handleCopy = useCallback(async () => {
    if (!article) return
    const text = `# ${article.title}\n\n${article.metaDescription}\n\n${article.content}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [article])

  const handleDownload = useCallback(() => {
    if (!article) return
    const text = `# ${article.title}\n\n${article.metaDescription}\n\n${article.content}`
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.title || 'blog-article'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [article])

  // Simple markdown to JSX renderer for preview
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let listItems: string[] = []

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 text-xs my-2" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            {listItems.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        )
        listItems = []
      }
    }

    lines.forEach((line, i) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('### ')) {
        flushList()
        elements.push(
          <h3 key={i} className="text-sm font-semibold mt-4 mb-1" style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>
            {trimmed.replace('### ', '')}
          </h3>
        )
      } else if (trimmed.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={i} className="text-base font-bold mt-6 mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {trimmed.replace('## ', '')}
          </h2>
        )
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        listItems.push(trimmed.replace(/^[-*]\s/, ''))
      } else if (trimmed.startsWith('> ')) {
        flushList()
        elements.push(
          <blockquote
            key={i}
            className="border-l-2 pl-4 my-4 text-xs italic"
            style={{
              borderColor: '#06B6D4',
              color: isDark ? '#67E8F9' : '#0E7490',
            }}
          >
            {trimmed.replace('> ', '')}
          </blockquote>
        )
      } else if (trimmed === '') {
        flushList()
      } else {
        flushList()
        elements.push(
          <p key={i} className="my-2">
            {trimmed}
          </p>
        )
      }
    })
    flushList()

    return elements
  }

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

          {/* Source Analysis Selector */}
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
                  分析データを選択
                </label>
                <select
                  value={selectedAnalysisId}
                  onChange={(e) => setSelectedAnalysisId(e.target.value)}
                  disabled={analysesLoading}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: isDark ? '#102023' : '#F8FAFC',
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
              </div>
              {selectedAnalysisId && (
                <div className="text-[10px] px-2 py-1.5 rounded"
                  style={{
                    background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF',
                    color: isDark ? '#67E8F9' : '#0E7490',
                  }}
                >
                  選択中の分析データを元に記事を生成します
                </div>
              )}
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
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedAnalysisId}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '記事を生成する'
                )}
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div
              className="p-3 rounded-xl flex items-center gap-2 text-xs"
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
              {article && (
                <>
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
                    生成完了
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium"
                    style={{
                      background: isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF',
                      color: isDark ? '#67E8F9' : '#0E7490',
                    }}
                  >
                    {article.wordCount.toLocaleString()}文字
                  </span>
                </>
              )}
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
              {generating ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#06B6D4]" />
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                      記事を生成しています...
                    </p>
                    <p className="text-xs mt-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                      AIが分析データを元に記事を作成中です。しばらくお待ちください。
                    </p>
                  </div>
                </div>
              ) : article ? (
                <>
                  {/* Draft Label */}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#06B6D4] mb-2">
                    Generated Draft
                  </div>

                  {/* Article Title */}
                  <h1 className="text-xl font-bold mb-3 leading-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {article.title}
                  </h1>

                  {/* Tags */}
                  {article.suggestedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.suggestedTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded"
                          style={{
                            background: isDark ? '#224249' : '#F1F5F9',
                            color: isDark ? '#90c1cb' : '#64748B',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta Description */}
                  {article.metaDescription && (
                    <p className="text-xs italic mb-5" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                      Meta Description: {article.metaDescription}
                    </p>
                  )}

                  {/* Article Body */}
                  <div className="space-y-1 text-sm leading-relaxed" style={{ color: isDark ? '#CBD5E1' : '#475569' }}>
                    {renderMarkdown(article.content)}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="text-4xl opacity-20">
                    ✦
                  </div>
                  <p className="text-sm font-medium" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                    分析データを選択して「記事を生成する」をクリックしてください
                  </p>
                </div>
              )}
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
                  onClick={handleGenerate}
                  disabled={generating || !selectedAnalysisId}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  style={{
                    color: isDark ? '#90c1cb' : '#64748B',
                  }}
                >
                  再生成
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!article}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  style={{
                    background: isDark ? '#224249' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#2d5359' : '#E2E8F0'}`,
                    color: isDark ? '#E2E8F0' : '#334155',
                  }}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'コピー済み' : 'コピー'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!article}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  style={{
                    background: isDark ? '#224249' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#2d5359' : '#E2E8F0'}`,
                    color: isDark ? '#E2E8F0' : '#334155',
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  ダウンロード
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
