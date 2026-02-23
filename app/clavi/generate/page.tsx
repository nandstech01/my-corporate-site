'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useClaviTheme } from '@/app/clavi/context'
import { createClient } from '@/lib/supabase/browser'
import {
  Search,
  Plus,
  ExternalLink,
  Eye,
  MoreVertical,
  Copy,
  Check,
  Maximize2,
  X,
  AlertTriangle,
  Edit3,
  FileX,
} from 'lucide-react'

interface AnalysisItem {
  id: string
  url: string
  company_name: string | null
  ai_structure_score: number | null
  status: string
  created_at: string
  updated_at: string
  structured_data?: any
  analysis_data?: {
    structured_data?: any
    [key: string]: any
  }
}

interface JsonLdEntry {
  id: string
  url: string
  schemaType: string
  typeColor: string
  lastGenerated: string
  status: 'live' | 'warning' | 'syncing' | 'draft'
  statusLabel: string
  jsonLd: string | null
}

const schemaTypeColors: Record<string, string> = {
  Article: 'purple',
  Organization: 'blue',
  Product: 'pink',
  FAQPage: 'yellow',
  Service: 'emerald',
  WebPage: 'blue',
  Person: 'emerald',
  LocalBusiness: 'pink',
  Event: 'purple',
  BreadcrumbList: 'yellow',
}

function mapAnalysisToEntry(analysis: AnalysisItem): JsonLdEntry {
  const sd = analysis.analysis_data?.structured_data || analysis.structured_data
  const schemaType = sd?.['@type'] || (Array.isArray(sd?.['@graph']) ? sd['@graph'][0]?.['@type'] : null) || 'WebPage'
  const typeColor = schemaTypeColors[schemaType] || 'blue'

  let status: JsonLdEntry['status'] = 'draft'
  let statusLabel = 'Draft'

  if (analysis.status === 'completed' && sd) {
    status = 'live'
    statusLabel = 'Success (Live)'
  } else if (analysis.status === 'completed' && !sd) {
    status = 'warning'
    statusLabel = 'Warning (No Schema)'
  } else if (analysis.status === 'processing' || analysis.status === 'pending') {
    status = 'syncing'
    statusLabel = 'Processing...'
  } else if (analysis.status === 'failed') {
    status = 'warning'
    statusLabel = 'Failed'
  }

  return {
    id: analysis.id,
    url: new URL(analysis.url).pathname || analysis.url,
    schemaType,
    typeColor,
    lastGenerated: new Date(analysis.updated_at).toISOString().split('T')[0],
    status,
    statusLabel,
    jsonLd: sd ? JSON.stringify(sd, null, 2) : null,
  }
}

export default function GeneratePage() {
  const { theme } = useClaviTheme()
  const isDark = theme === 'dark'
  const [entries, setEntries] = useState<JsonLdEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<number>(0)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [copied, setCopied] = useState(false)

  const fetchAnalyses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch('/api/clavi/analyses?limit=100&status=completed&sort=created_at_desc', {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('ログインが必要です')
        } else {
          setError('データの取得に失敗しました')
        }
        return
      }

      const data = await response.json()
      const mapped = (data.analyses || []).map(mapAnalysisToEntry)
      setEntries(mapped)
      if (mapped.length > 0) {
        setSelectedRow(0)
      }
    } catch {
      setError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalyses()
  }, [fetchAnalyses])

  const filteredEntries = activeFilter === 'all'
    ? entries
    : entries.filter((e) => {
        if (activeFilter === 'live') return e.status === 'live'
        if (activeFilter === 'warning') return e.status === 'warning'
        if (activeFilter === 'draft') return e.status === 'draft'
        return true
      })

  const selectedEntry = filteredEntries[selectedRow] || null

  const handleCopyJsonLd = async () => {
    if (!selectedEntry?.jsonLd) return
    const scriptTag = `<script type="application/ld+json">\n${selectedEntry.jsonLd}\n</script>`
    try {
      await navigator.clipboard.writeText(scriptTag)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = scriptTag
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const typeColors: Record<string, { bg: string; text: string; border: string }> = {
    purple: {
      bg: isDark ? 'rgba(168,85,247,0.1)' : '#FAF5FF',
      text: isDark ? '#C084FC' : '#7C3AED',
      border: isDark ? 'rgba(168,85,247,0.2)' : '#E9D5FF',
    },
    blue: {
      bg: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF',
      text: isDark ? '#60A5FA' : '#2563EB',
      border: isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE',
    },
    pink: {
      bg: isDark ? 'rgba(236,72,153,0.1)' : '#FDF2F8',
      text: isDark ? '#F472B6' : '#DB2777',
      border: isDark ? 'rgba(236,72,153,0.2)' : '#FBCFE8',
    },
    yellow: {
      bg: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB',
      text: isDark ? '#FBBF24' : '#D97706',
      border: isDark ? 'rgba(245,158,11,0.2)' : '#FDE68A',
    },
    emerald: {
      bg: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5',
      text: isDark ? '#6EE7B7' : '#059669',
      border: isDark ? 'rgba(16,185,129,0.2)' : '#A7F3D0',
    },
  }

  const statusDot = (status: string) => {
    switch (status) {
      case 'live':
        return { color: '#10B981' }
      case 'warning':
        return { color: '#F59E0B', pulse: true }
      case 'syncing':
        return { color: '#3B82F6', ping: true }
      case 'draft':
        return { color: isDark ? '#6B7280' : '#9CA3AF' }
      default:
        return { color: '#6B7280' }
    }
  }

  const filters = [
    { id: 'all', label: 'Status: All' },
    { id: 'live', label: 'Live', dotColor: '#10B981' },
    { id: 'warning', label: 'Warnings', dotColor: '#F59E0B' },
    { id: 'draft', label: 'Drafts', dotColor: isDark ? '#6B7280' : '#9CA3AF' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            JSON-LD管理
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            構造化データの実装状況を管理・モニタリング
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4" />
          手動で作成
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3 mb-4 flex-shrink-0">
        {/* Search */}
        <div
          className="flex items-center rounded-lg px-3 py-2 flex-1 max-w-sm"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <Search className="w-4 h-4 mr-2" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
          <input
            type="text"
            placeholder="URL, Schema Type で検索..."
            className="bg-transparent border-none text-xs focus:ring-0 focus:outline-none p-0 w-full"
            style={{ color: isDark ? '#E2E8F0' : '#334155' }}
            readOnly
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider mr-1" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>
            Filter:
          </span>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f.id)
                setSelectedRow(0)
              }}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors"
              style={{
                background: activeFilter === f.id
                  ? isDark ? 'rgba(6,182,212,0.15)' : '#ECFEFF'
                  : isDark ? '#224249' : '#F1F5F9',
                border: `1px solid ${activeFilter === f.id ? '#06B6D4' : isDark ? '#2d5359' : '#E2E8F0'}`,
                color: activeFilter === f.id
                  ? '#06B6D4'
                  : isDark ? '#E2E8F0' : '#334155',
              }}
            >
              {f.dotColor && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.dotColor }} />
              )}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div
          className="flex-1 rounded-xl flex items-center justify-center"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#A5F3FC] border-t-[#06B6D4]" />
            <p className="mt-4 text-sm" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
              データを読み込み中...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div
          className="flex-1 rounded-xl flex items-center justify-center"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-amber-500" />
            <p className="text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{error}</p>
            <button
              onClick={fetchAnalyses}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#0891B2] hover:bg-[#0E7490] transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredEntries.length === 0 && (
        <div
          className="flex-1 rounded-xl flex items-center justify-center"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <div className="text-center">
            <FileX className="w-10 h-10 mx-auto mb-3" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
            <p className="text-sm font-medium" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {activeFilter !== 'all' ? 'フィルタに一致する分析がありません' : 'まだ分析がありません'}
            </p>
            <p className="text-xs mt-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              分析ページからURLを分析してJSON-LDを生成しましょう
            </p>
          </div>
        </div>
      )}

      {/* Content: Table + Preview */}
      {!isLoading && !error && filteredEntries.length > 0 && (
        <div className="flex-1 flex gap-0 min-h-0 overflow-hidden rounded-xl" style={{ border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}` }}>
          {/* Table */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: isDark ? '#182f34' : '#FFFFFF' }}>
            {/* Table Header */}
            <div
              className="grid grid-cols-[1fr_100px_100px_140px_70px] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider flex-shrink-0"
              style={{
                background: isDark ? '#142628' : '#F8FAFC',
                borderBottom: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                color: isDark ? '#6a8b94' : '#94A3B8',
              }}
            >
              <span>Page URL</span>
              <span>Type</span>
              <span>Generated</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {filteredEntries.map((entry, i) => {
                const tc = typeColors[entry.typeColor] || typeColors.blue
                const dot = statusDot(entry.status)
                const isSelected = selectedRow === i

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setSelectedRow(i)
                      setCopied(false)
                    }}
                    className="grid grid-cols-[1fr_100px_100px_140px_70px] px-4 py-3 items-center cursor-pointer transition-colors group"
                    style={{
                      background: isSelected
                        ? isDark ? 'rgba(6,182,212,0.08)' : '#F0FDFA'
                        : 'transparent',
                      borderBottom: `1px solid ${isDark ? '#1e3a3f' : '#F1F5F9'}`,
                      borderLeft: isSelected ? '3px solid #06B6D4' : '3px solid transparent',
                    }}
                  >
                    {/* URL */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-medium font-mono truncate" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                        {entry.url}
                      </span>
                      <ExternalLink
                        className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: isDark ? '#56737a' : '#94A3B8' }}
                      />
                    </div>

                    {/* Schema Type */}
                    <div>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}
                      >
                        {entry.schemaType}
                      </span>
                    </div>

                    {/* Last Generated */}
                    <span className="text-[11px]" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                      {entry.lastGenerated}
                    </span>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        {dot.ping && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: dot.color }} />
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${dot.pulse ? 'animate-pulse' : ''}`}
                          style={{ background: dot.color }}
                        />
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                        {entry.statusLabel}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-1 rounded transition-colors"
                        style={{
                          color: isSelected ? '#06B6D4' : isDark ? '#56737a' : '#94A3B8',
                          background: isSelected ? (isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF') : 'transparent',
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded transition-colors" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preview Drawer */}
          <aside
            className="w-[380px] flex flex-col flex-shrink-0 hidden lg:flex"
            style={{
              background: isDark ? '#142628' : '#F8FAFC',
              borderLeft: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            {/* Drawer Header */}
            <div
              className="px-4 py-3 flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: `1px solid ${isDark ? '#224249' : '#E2E8F0'}` }}
            >
              <div>
                <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Code Preview
                </h3>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                  {selectedEntry?.url || '-'}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleCopyJsonLd}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: copied ? '#10B981' : isDark ? '#56737a' : '#94A3B8' }}
                  title={copied ? 'Copied!' : 'Copy JSON-LD'}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button className="p-1.5 rounded transition-colors" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded transition-colors" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Validation Warning */}
            {selectedEntry?.status === 'warning' && (
              <div
                className="px-4 py-2.5 flex items-start gap-2"
                style={{
                  background: isDark ? 'rgba(245,158,11,0.08)' : '#FFFBEB',
                  borderBottom: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : '#FDE68A'}`,
                }}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-amber-500">Missing Required Property</p>
                  <p className="text-[10px] mt-0.5" style={{ color: isDark ? 'rgba(245,158,11,0.8)' : '#92400E' }}>
                    構造化データが生成されていないか、必須フィールドが不足しています。
                  </p>
                </div>
              </div>
            )}

            {/* Code Block */}
            <div
              className="flex-1 overflow-auto p-4"
              style={{ background: isDark ? '#0d1a1d' : '#FFFFFF' }}
            >
              {selectedEntry?.jsonLd ? (
                <pre className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap">
                  <span style={{ color: isDark ? '#475569' : '#94A3B8' }}>
                    {`// Generated: ${selectedEntry.lastGenerated}`}
                  </span>
                  {'\n'}
                  <JsonHighlight json={selectedEntry.jsonLd} isDark={isDark} />
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>
                    JSON-LDデータがありません
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div
              className="px-4 py-3 flex justify-end gap-2 flex-shrink-0"
              style={{ borderTop: `1px solid ${isDark ? '#224249' : '#E2E8F0'}` }}
            >
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                style={{
                  background: 'transparent',
                  border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                  color: isDark ? '#E2E8F0' : '#334155',
                }}
              >
                <Edit3 className="w-3 h-3" />
                Edit JSON
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors shadow-lg shadow-cyan-500/20">
                Validate & Sync
              </button>
            </div>
          </aside>
        </div>
      )}
    </motion.div>
  )
}

function JsonHighlight({ json, isDark }: { json: string; isDark: boolean }) {
  const colors = {
    key: isDark ? '#67E8F9' : '#0E7490',
    string: isDark ? '#FCA5A5' : '#DC2626',
    number: isDark ? '#86EFAC' : '#16A34A',
    bracket: isDark ? '#94A3B8' : '#64748B',
    punctuation: isDark ? '#64748B' : '#94A3B8',
  }

  const lines = json.split('\n')

  return (
    <>
      {lines.map((line, i) => {
        const parts: JSX.Element[] = []
        let remaining = line
        let keyIdx = 0

        while (remaining.length > 0) {
          const keyMatch = remaining.match(/^(\s*)("(?:\\.|[^"\\])*")(\s*:\s*)/)
          if (keyMatch) {
            parts.push(
              <span key={`ws-${i}-${keyIdx}`}>{keyMatch[1]}</span>,
              <span key={`key-${i}-${keyIdx}`} style={{ color: colors.key }}>{keyMatch[2]}</span>,
              <span key={`colon-${i}-${keyIdx}`} style={{ color: colors.punctuation }}>{keyMatch[3]}</span>
            )
            remaining = remaining.slice(keyMatch[0].length)
            keyIdx++
            continue
          }

          const strMatch = remaining.match(/^("(?:\\.|[^"\\])*")(,?)/)
          if (strMatch) {
            parts.push(
              <span key={`str-${i}-${keyIdx}`} style={{ color: colors.string }}>{strMatch[1]}</span>,
              <span key={`comma-${i}-${keyIdx}`} style={{ color: colors.punctuation }}>{strMatch[2]}</span>
            )
            remaining = remaining.slice(strMatch[0].length)
            keyIdx++
            continue
          }

          const bracketMatch = remaining.match(/^([{}\[\]])(.*)/)
          if (bracketMatch) {
            parts.push(
              <span key={`br-${i}-${keyIdx}`} style={{ color: colors.bracket }}>{bracketMatch[1]}</span>
            )
            remaining = remaining.slice(1)
            keyIdx++
            continue
          }

          parts.push(
            <span key={`rest-${i}-${keyIdx}`} style={{ color: colors.bracket }}>{remaining}</span>
          )
          break
        }

        return (
          <span key={`line-${i}`}>
            {parts}
            {'\n'}
          </span>
        )
      })}
    </>
  )
}
