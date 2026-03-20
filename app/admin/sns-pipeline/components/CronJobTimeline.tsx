'use client'

import { Clock } from 'lucide-react'
import { CRON_JOBS, type CronJobConfig } from '../types'

const COLORS = {
  card: '#182f34',
  cardInner: '#102023',
  border: '#224249',
  accent: '#06B6D4',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
  textDim: '#56737a',
} as const

const PLATFORM_LABEL: Record<CronJobConfig['platform'], string> = {
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  blog: 'Blog RSS',
  threads: 'Threads',
  all: 'All Platforms',
}

const PLATFORM_COLOR: Record<CronJobConfig['platform'], string> = {
  x: '#FFFFFF',
  linkedin: '#0077B5',
  instagram: '#E1306C',
  blog: '#F97316',
  threads: '#999999',
  all: '#06B6D4',
}

function parseCronHours(cronUtc: string): { minutes: number; hours: number[]; dayOfWeek: number | null } {
  const parts = cronUtc.split(' ')
  const minutes = parseInt(parts[0], 10)
  const hourPart = parts[1]
  const dayOfWeekPart = parts[4]

  const hours = hourPart === '*'
    ? Array.from({ length: 24 }, (_, i) => i)
    : hourPart.split(',').map((h) => parseInt(h, 10))

  const dayOfWeek = dayOfWeekPart !== '*' ? parseInt(dayOfWeekPart, 10) : null

  return { minutes, hours, dayOfWeek }
}

function getNextRun(cronUtc: string): Date {
  const now = new Date()
  const { minutes, hours, dayOfWeek } = parseCronHours(cronUtc)

  const currentUtcDay = now.getUTCDay()
  const currentUtcHour = now.getUTCHours()
  const currentUtcMinute = now.getUTCMinutes()

  if (dayOfWeek !== null) {
    let daysUntil = dayOfWeek - currentUtcDay
    if (daysUntil < 0) {
      daysUntil += 7
    }
    if (daysUntil === 0) {
      const targetMinutes = hours[0] * 60 + minutes
      const currentMinutes = currentUtcHour * 60 + currentUtcMinute
      if (currentMinutes >= targetMinutes) {
        daysUntil = 7
      }
    }
    const next = new Date(now)
    next.setUTCDate(next.getUTCDate() + daysUntil)
    next.setUTCHours(hours[0], minutes, 0, 0)
    return next
  }

  const currentTotalMinutes = currentUtcHour * 60 + currentUtcMinute

  for (const h of hours) {
    const targetTotalMinutes = h * 60 + minutes
    if (targetTotalMinutes > currentTotalMinutes) {
      const next = new Date(now)
      next.setUTCHours(h, minutes, 0, 0)
      return next
    }
  }

  const next = new Date(now)
  next.setUTCDate(next.getUTCDate() + 1)
  next.setUTCHours(hours[0], minutes, 0, 0)
  return next
}

function formatTimeUntil(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()

  if (diffMs <= 0) {
    return 'now'
  }

  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  if (hours === 0) {
    return `in ${mins}m`
  }
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `in ${days}d ${remainingHours}h` : `in ${days}d`
  }
  return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`
}

function groupJobsByPlatform(): Record<string, readonly CronJobConfig[]> {
  const groups: Record<string, CronJobConfig[]> = {}
  for (const job of CRON_JOBS) {
    const key = job.platform
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(job)
  }
  return groups
}

export default function CronJobTimeline() {
  const grouped = groupJobsByPlatform()
  const platformOrder: CronJobConfig['platform'][] = ['x', 'linkedin', 'instagram', 'blog', 'threads', 'all']

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <Clock size={16} style={{ color: COLORS.accent }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          Cron Job Schedule
        </span>
        <span
          className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${COLORS.accent}20`, color: COLORS.accent }}
        >
          {CRON_JOBS.length} jobs
        </span>
      </div>

      <div className="px-5 py-3 space-y-4">
        {platformOrder.map((platform) => {
          const jobs = grouped[platform]
          if (!jobs || jobs.length === 0) return null
          const color = PLATFORM_COLOR[platform]

          return (
            <div key={platform}>
              <div
                className="flex items-center gap-2 mb-2 pl-3"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
                  {PLATFORM_LABEL[platform]}
                </span>
              </div>

              <div className="space-y-1.5 ml-1">
                {jobs.map((job) => {
                  const nextRun = getNextRun(job.cronUtc)
                  const diffMs = nextRun.getTime() - Date.now()
                  const isImminent = diffMs > 0 && diffMs < 2 * 60 * 60 * 1000

                  return (
                    <div
                      key={job.name}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ background: COLORS.cardInner }}
                    >
                      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                        {isImminent && (
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ background: color }}
                          />
                        )}
                        <span
                          className="relative inline-flex rounded-full h-2.5 w-2.5"
                          style={{ background: color }}
                        />
                      </span>

                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-medium truncate" style={{ color: COLORS.text }}>
                          {job.name}
                        </span>
                        <span className="block text-[10px]" style={{ color: COLORS.textDim }}>
                          {job.jstDescription}
                        </span>
                      </span>

                      <span
                        className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: isImminent ? `${color}20` : `${COLORS.textDim}15`,
                          color: isImminent ? color : COLORS.textMuted,
                        }}
                      >
                        {formatTimeUntil(nextRun)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
