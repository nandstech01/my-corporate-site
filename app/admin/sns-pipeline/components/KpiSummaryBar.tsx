'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Zap, Clock, Network, type LucideIcon } from 'lucide-react'

interface KpiSummaryBarProps {
  totalPosts: number
  avgEngagementRate: number
  pendingApprovals: number
  activeCronJobs: number
}

const COLORS = {
  card: '#182f34',
  border: '#224249',
  accent: '#06B6D4',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
} as const

interface KpiCardConfig {
  readonly label: string
  readonly icon: LucideIcon
  readonly color: string
  readonly getValue: (props: KpiSummaryBarProps) => string
  readonly getProgress: (props: KpiSummaryBarProps) => number
}

const KPI_CARDS: readonly KpiCardConfig[] = [
  {
    label: 'Total Posts (30d)',
    icon: TrendingUp,
    color: COLORS.accent,
    getValue: (p) => String(p.totalPosts),
    getProgress: (p) => Math.min(p.totalPosts / 100, 1),
  },
  {
    label: 'Avg Engagement Rate',
    icon: Zap,
    color: COLORS.accent,
    getValue: (p) => `${p.avgEngagementRate.toFixed(2)}%`,
    getProgress: (p) => Math.min(p.avgEngagementRate / 10, 1),
  },
  {
    label: 'Pending Approvals',
    icon: Clock,
    color: '#F59E0B',
    getValue: (p) => String(p.pendingApprovals),
    getProgress: (p) => Math.min(p.pendingApprovals / 10, 1),
  },
  {
    label: 'Active Cron Jobs',
    icon: Network,
    color: COLORS.accent,
    getValue: (p) => `${p.activeCronJobs} jobs`,
    getProgress: (p) => Math.min(p.activeCronJobs / 15, 1),
  },
] as const

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
} as const

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
} as const

export default function KpiSummaryBar(props: KpiSummaryBarProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {KPI_CARDS.map((card) => {
        const Icon = card.icon
        const isPendingHighlight = card.label === 'Pending Approvals' && props.pendingApprovals > 0
        const activeColor = isPendingHighlight ? '#F59E0B' : card.color

        return (
          <motion.div
            key={card.label}
            variants={cardVariants}
            className="group relative rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="relative px-5 py-4">
              <div className="absolute top-3 right-3 opacity-15 group-hover:opacity-30 transition-opacity duration-200">
                <Icon size={28} className="transition-opacity" style={{ color: activeColor }} />
              </div>

              <span
                className="block text-[10px] font-medium uppercase tracking-wider mb-1"
                style={{ color: COLORS.textMuted }}
              >
                {card.label}
              </span>

              <span
                className="block text-xl font-bold"
                style={{ color: COLORS.text }}
              >
                {card.getValue(props)}
              </span>
            </div>

            <div
              className="w-full h-1"
              style={{ background: `${activeColor}15` }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${card.getProgress(props) * 100}%`,
                  background: activeColor,
                  opacity: 0.6,
                }}
              />
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
