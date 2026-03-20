'use client'

import { ShieldAlert, CheckCircle } from 'lucide-react'
import type { SafetyEventRow } from '../types'

interface SafetyEventsPanelProps {
  readonly safetyEvents: readonly SafetyEventRow[]
}

const COLORS = {
  card: '#182f34',
  cardInner: '#102023',
  border: '#224249',
  accent: '#06B6D4',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
  textDim: '#56737a',
} as const

const SEVERITY_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  critical: { bg: '#EF444430', color: '#EF4444', label: 'CRITICAL' },
  high: { bg: '#F9731630', color: '#F97316', label: 'HIGH' },
  medium: { bg: '#EAB30830', color: '#EAB308', label: 'MEDIUM' },
  low: { bg: '#22C55E30', color: '#22C55E', label: 'LOW' },
} as const

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)

  if (diffSec < 60) return 'just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return `${Math.floor(diffSec / 86400)}d ago`
}

export default function SafetyEventsPanel({ safetyEvents }: SafetyEventsPanelProps) {
  const activeEvents = safetyEvents.filter(e => e.active)
  const resolvedEvents = safetyEvents.filter(e => !e.active)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <ShieldAlert size={16} style={{ color: activeEvents.length > 0 ? '#EF4444' : '#22C55E' }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          Safety Events
        </span>
        {activeEvents.length > 0 && (
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#EF444420', color: '#EF4444' }}
          >
            {activeEvents.length} active
          </span>
        )}
      </div>

      {activeEvents.length === 0 && resolvedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <CheckCircle size={32} style={{ color: '#22C55E', opacity: 0.6 }} />
          <span className="text-sm font-medium" style={{ color: '#22C55E' }}>
            All Clear
          </span>
          <span className="text-[10px]" style={{ color: COLORS.textDim }}>
            No safety events detected
          </span>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-2">
          {activeEvents.map(event => {
            const severity = SEVERITY_CONFIG[event.severity] ?? SEVERITY_CONFIG.low
            return (
              <div key={event.id} className="rounded-lg p-3" style={{ background: COLORS.cardInner }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: severity.bg, color: severity.color }}
                  >
                    {severity.label}
                  </span>
                  <span className="text-xs font-medium" style={{ color: COLORS.text }}>
                    {event.event_type}
                  </span>
                  <span className="ml-auto text-[10px]" style={{ color: COLORS.textDim }}>
                    {formatRelativeTime(event.created_at)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: COLORS.textMuted }}>
                  {event.description}
                </p>
                {event.platforms_affected && event.platforms_affected.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {event.platforms_affected.map(p => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: COLORS.border, color: COLORS.textMuted }}>
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {resolvedEvents.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
                Recently Resolved
              </p>
              {resolvedEvents.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-center gap-2 py-1.5">
                  <CheckCircle size={12} style={{ color: '#22C55E', opacity: 0.5 }} />
                  <span className="text-xs" style={{ color: COLORS.textDim }}>
                    {event.event_type}
                  </span>
                  <span className="ml-auto text-[9px]" style={{ color: COLORS.textDim }}>
                    {event.resolved_at ? formatRelativeTime(event.resolved_at) : formatRelativeTime(event.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
