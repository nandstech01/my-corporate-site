'use client'

import { MessageSquare } from 'lucide-react'
import type { XConversationThreadRow } from '../types'

interface ConversationTrackerProps {
  readonly conversations: readonly XConversationThreadRow[]
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

const REPLY_TYPE_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  self_thread: { bg: '#06B6D420', color: '#06B6D4', label: 'Self Thread' },
  reply_to_user: { bg: '#22C55E20', color: '#22C55E', label: 'Reply' },
  follow_up: { bg: '#EAB30820', color: '#EAB308', label: 'Follow Up' },
  proactive: { bg: '#A855F720', color: '#A855F7', label: 'Proactive' },
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

export default function ConversationTracker({ conversations }: ConversationTrackerProps) {
  // Reply type breakdown
  const typeCounts: Record<string, number> = {}
  for (const conv of conversations) {
    const t = conv.reply_type ?? 'unknown'
    typeCounts[t] = (typeCounts[t] ?? 0) + 1
  }

  const recent = conversations.slice(0, 10)

  if (conversations.length === 0) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <MessageSquare size={16} style={{ color: COLORS.accent }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
            Conversation Tracker
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <span className="text-sm" style={{ color: COLORS.textDim }}>No conversations yet</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <MessageSquare size={16} style={{ color: COLORS.accent }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          Conversation Tracker
        </span>
        <span className="text-[10px]" style={{ color: COLORS.textMuted }}>
          {conversations.length} threads
        </span>
      </div>

      {/* Reply type breakdown */}
      <div className="px-5 py-3 flex flex-wrap gap-2" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        {Object.entries(typeCounts).map(([type, count]) => {
          const config = REPLY_TYPE_CONFIG[type] ?? { bg: COLORS.border, color: COLORS.textMuted, label: type }
          return (
            <span
              key={type}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: config.bg, color: config.color }}
            >
              {config.label}: {count}
            </span>
          )
        })}
      </div>

      {/* Recent conversations */}
      <div className="px-4 py-3 space-y-2">
        {recent.map(conv => {
          const config = REPLY_TYPE_CONFIG[conv.reply_type ?? ''] ?? REPLY_TYPE_CONFIG.reply_to_user
          const sumEngagement = (eng: Record<string, number> | null): number => {
            if (!eng) return 0
            return Object.values(eng).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0)
          }
          const engBefore = sumEngagement(conv.engagement_before)
          const engAfter = sumEngagement(conv.engagement_after)
          const engDelta = engAfter - engBefore
          const hasEngagement = conv.engagement_before !== null && conv.engagement_after !== null

          return (
            <div key={conv.id} className="rounded-lg p-3" style={{ background: COLORS.cardInner }}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: config.bg, color: config.color }}
                >
                  {config.label}
                </span>
                {conv.strategy_used && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: COLORS.border, color: COLORS.textMuted }}>
                    {conv.strategy_used}
                  </span>
                )}
                <span className="ml-auto text-[10px]" style={{ color: COLORS.textDim }}>
                  {formatRelativeTime(conv.created_at)}
                </span>
              </div>
              <p className="text-xs leading-relaxed line-clamp-2 mb-1" style={{ color: COLORS.text }}>
                {conv.root_tweet_text}
              </p>
              <div className="flex items-center gap-3">
                {conv.depth_level !== null && conv.depth_level !== undefined && (
                  <span className="text-[9px]" style={{ color: COLORS.textDim }}>
                    Depth: {conv.depth_level}
                  </span>
                )}
                {hasEngagement && (
                  <span className="text-[9px]" style={{ color: engDelta >= 0 ? '#22C55E' : '#EF4444' }}>
                    Engagement: {engBefore} → {engAfter} ({engDelta >= 0 ? '+' : ''}{engDelta})
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
