'use client'

import { Flame } from 'lucide-react'
import type { BuzzPostRow } from '../types'

interface BuzzCollectionMonitorProps {
  readonly buzzPosts: readonly BuzzPostRow[]
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

const PLATFORM_BADGE: Record<string, { bg: string; color: string }> = {
  x: { bg: '#FFFFFF20', color: '#FFFFFF' },
  linkedin: { bg: '#0077B520', color: '#0077B5' },
  instagram: { bg: '#E1306C20', color: '#E1306C' },
  threads: { bg: '#99999920', color: '#999999' },
} as const

export default function BuzzCollectionMonitor({ buzzPosts }: BuzzCollectionMonitorProps) {
  const topPosts = [...buzzPosts].sort((a, b) => b.buzz_score - a.buzz_score).slice(0, 5)

  // Platform breakdown
  const platformCounts: Record<string, number> = {}
  for (const post of buzzPosts) {
    const p = post.platform ?? 'unknown'
    platformCounts[p] = (platformCounts[p] ?? 0) + 1
  }

  // Daily collection counts
  const dailyCounts: Record<string, number> = {}
  for (const post of buzzPosts) {
    const day = (post.collected_at ?? '').slice(0, 10)
    if (day) {
      dailyCounts[day] = (dailyCounts[day] ?? 0) + 1
    }
  }

  const dailyData = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)

  const maxDaily = Math.max(...dailyData.map(([, c]) => c), 1)

  if (buzzPosts.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame size={14} style={{ color: '#F97316' }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
            Buzz Collection
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="text-sm" style={{ color: COLORS.textDim }}>No buzz posts yet</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Flame size={14} style={{ color: '#F97316' }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          Buzz Collection
        </span>
        <span className="text-[10px]" style={{ color: COLORS.textMuted }}>
          {buzzPosts.length} posts
        </span>
      </div>

      {/* Platform breakdown */}
      <div className="flex gap-2 mb-4">
        {Object.entries(platformCounts).map(([platform, count]) => {
          const badge = PLATFORM_BADGE[platform] ?? { bg: COLORS.border, color: COLORS.textMuted }
          return (
            <span
              key={platform}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: badge.bg, color: badge.color }}
            >
              {platform}: {count}
            </span>
          )
        })}
      </div>

      {/* Top buzz posts */}
      <div className="rounded-lg p-3 mb-4 space-y-2" style={{ background: COLORS.cardInner }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
          Top Buzz Posts
        </p>
        {topPosts.map((post, i) => (
          <div key={post.id} className="flex items-center gap-2">
            <span className="text-[10px] font-bold w-4 text-right" style={{ color: i < 3 ? '#F97316' : COLORS.textDim }}>
              {i + 1}
            </span>
            <span className="flex-1 text-xs truncate" style={{ color: COLORS.text }}>
              {post.post_text}
            </span>
            <span className="text-[10px] font-medium" style={{ color: '#F97316' }}>
              {post.buzz_score.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Daily collection bar chart */}
      <div className="rounded-lg p-3" style={{ background: COLORS.cardInner }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
          Daily Collection
        </p>
        <div className="flex items-end gap-1" style={{ height: 50 }}>
          {dailyData.map(([date, count]) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${Math.max((count / maxDaily) * 40, 2)}px`,
                  background: '#F97316',
                  opacity: 0.7,
                }}
              />
              <span className="text-[7px]" style={{ color: COLORS.textDim }}>
                {date.slice(8)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
