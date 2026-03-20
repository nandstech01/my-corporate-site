'use client'

import { ShieldCheck, CheckCircle } from 'lucide-react'
import type { SlackPendingAction } from '../types'

interface HitlApprovalQueueProps {
  pendingActions: readonly SlackPendingAction[]
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

const ACTION_TYPE_CONFIG: Record<
  SlackPendingAction['action_type'],
  { label: string; bg: string; color: string }
> = {
  post_x: { label: 'Post X', bg: '#FFFFFF20', color: '#FFFFFF' },
  post_x_long: { label: 'Post X (Long)', bg: '#FFFFFF20', color: '#FFFFFF' },
  post_linkedin: { label: 'Post LinkedIn', bg: '#0077B520', color: '#0077B5' },
  post_instagram_story: { label: 'Post IG Story', bg: '#E1306C20', color: '#E1306C' },
  post_threads: { label: 'Post Threads', bg: '#99999920', color: '#999999' },
  trigger_blog: { label: 'Trigger Blog', bg: '#F9731620', color: '#F97316' },
} as const

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()

  if (diffMs < 0) {
    return 'just now'
  }

  const totalMinutes = Math.floor(diffMs / 60000)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)

  if (totalMinutes < 1) {
    return 'just now'
  }
  if (totalMinutes < 60) {
    return `${totalMinutes}m ago`
  }
  if (totalHours < 24) {
    return `${totalHours}h ago`
  }
  if (totalDays < 30) {
    return `${totalDays}d ago`
  }
  return `${Math.floor(totalDays / 30)}mo ago`
}

export default function HitlApprovalQueue({ pendingActions }: HitlApprovalQueueProps) {
  const pending = pendingActions.filter((a) => a.status === 'pending')

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <ShieldCheck size={16} style={{ color: COLORS.accent }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          HITL Approval Queue
        </span>
        {pending.length > 0 && (
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#F59E0B20', color: '#F59E0B' }}
          >
            {pending.length} pending
          </span>
        )}
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <CheckCircle size={32} style={{ color: '#22C55E', opacity: 0.6 }} />
          <span className="text-sm font-medium" style={{ color: '#22C55E' }}>
            All caught up
          </span>
          <span className="text-[10px]" style={{ color: COLORS.textDim }}>
            No pending approvals
          </span>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-2">
          {pending.map((action) => {
            const config = ACTION_TYPE_CONFIG[action.action_type]

            return (
              <div
                key={action.id}
                className="flex items-start gap-3 px-3 py-3 rounded-lg"
                style={{ background: COLORS.cardInner }}
              >
                <span
                  className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
                  style={{ background: config.bg, color: config.color }}
                >
                  {config.label}
                </span>

                <div className="flex-1 min-w-0">
                  {action.preview_text ? (
                    <p
                      className="text-xs leading-relaxed line-clamp-2"
                      style={{ color: COLORS.text }}
                    >
                      {action.preview_text}
                    </p>
                  ) : (
                    <p className="text-xs italic" style={{ color: COLORS.textDim }}>
                      No preview available
                    </p>
                  )}
                  <span className="block text-[10px] mt-1" style={{ color: COLORS.textDim }}>
                    {formatRelativeTime(action.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div
        className="px-5 py-2.5 text-center"
        style={{ borderTop: `1px solid ${COLORS.border}` }}
      >
        <span className="text-[10px]" style={{ color: COLORS.textDim }}>
          Approve / reject via Slack
        </span>
      </div>
    </div>
  )
}
