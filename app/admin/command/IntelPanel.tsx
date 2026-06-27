'use client'

/**
 * 司令塔インテリジェンス右レール (Phase 1):
 *  - OFFICIAL: 公式Claude Code最新版（NEWバッジ＝日本最速検知）
 *  - NEXT: 次の一手（SEO最優先機会）＋ 配信予定件数
 *  - CRON: 各チャンネルの健全性（緑=healthy / 赤=stale）
 * Presentational only; data comes from /api/admin/command-intel via the page.
 */

import { motion } from 'framer-motion'

type Intel = {
  cronHealth: Array<{ name: string; label: string; lastSuccess: string | null; ageHours: number | null; status: 'healthy' | 'stale' | 'unknown' }>
  nextAction: { topOpportunity: { kind: string; query: string; reason: string; score: number } | null; pendingPosts: number; demandQueries: string[] }
  claudeCodeNews: { version: string | null; title: string; summary: string; sourceUrl: string; isNew: boolean } | null
}

const ORANGE = '#E8845C'
const CYAN = '#38E1D8'
const GREEN = '#3DDC91'
const RED = '#ff6b6b'

const KIND_LABEL: Record<string, string> = {
  strike_distance: 'あと一歩・上位狙い',
  low_ctr: 'タイトル改善で伸びる',
  rising_demand: '需要が急上昇',
}

function age(h: number | null): string {
  if (h == null) return '—'
  if (h < 1) return 'たった今'
  if (h < 24) return `${h}h前`
  return `${Math.floor(h / 24)}d前`
}

function statusColor(s: string): string {
  return s === 'healthy' ? GREEN : s === 'stale' ? RED : '#6b7c98'
}

const panelStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(7,11,22,0.55)',
  backdropFilter: 'blur(10px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px rgba(56,225,216,0.10)',
}
const head = (color: string): React.CSSProperties => ({
  fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.26em', color,
})

export default function IntelPanel({ intel }: { intel: Intel | null }) {
  if (!intel) return null
  const news = intel.claudeCodeNews
  const op = intel.nextAction.topOpportunity

  return (
    <div className="hidden xl:flex flex-col gap-3" style={{ position: 'fixed', right: 24, top: '17vh', width: 348, zIndex: 20, pointerEvents: 'none' }}>
      {/* OFFICIAL NEWS */}
      {news && (
        <div className="px-4 py-3" style={panelStyle}>
          <div className="flex items-center justify-between mb-2">
            <span style={head(ORANGE)}>OFFICIAL ・ Claude Code</span>
            {news.isNew && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0.6 }} animate={{ scale: [1, 1.08, 1], opacity: 1 }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 700, color: '#0b0e14', background: ORANGE, padding: '2px 8px', borderRadius: 6, letterSpacing: '0.1em' }}
              >
                NEW
              </motion.span>
            )}
          </div>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{news.title}</div>
          <div style={{ color: '#aebccd', fontSize: 12, marginTop: 4, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {news.summary}
          </div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#6b7c98', marginTop: 6 }}>
            {news.isNew ? '🇯🇵 日本最速で配信予定' : 'changelog 監視中'}
          </div>
        </div>
      )}

      {/* NEXT ACTION */}
      <div className="px-4 py-3" style={panelStyle}>
        <div className="mb-2" style={head(CYAN)}>NEXT ・ 次の一手</div>
        {op ? (
          <>
            <div style={{ color: CYAN, fontSize: 11, fontWeight: 600 }}>{KIND_LABEL[op.kind] ?? op.kind}</div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginTop: 2 }}>「{op.query}」</div>
            <div style={{ color: '#aebccd', fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{op.reason}</div>
          </>
        ) : (
          <div style={{ color: '#6b7c98', fontSize: 12 }}>SEOデータ蓄積中…</div>
        )}
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#9fb3c8', marginTop: 8 }}>
          配信予定（pending）: <span style={{ color: '#fff' }}>{intel.nextAction.pendingPosts}</span> 件
        </div>
      </div>

      {/* CRON HEALTH */}
      <div className="px-4 py-3" style={panelStyle}>
        <div className="mb-2" style={head(GREEN)}>SYSTEM ・ 自動運用の健全性</div>
        <div className="flex flex-col gap-1.5">
          {intel.cronHealth.map((j) => (
            <div key={j.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(j.status), boxShadow: `0 0 8px ${statusColor(j.status)}` }} />
                <span style={{ fontSize: 12.5, color: '#dce6f2' }}>{j.label}</span>
              </div>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#6b7c98' }}>{age(j.ageHours)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
