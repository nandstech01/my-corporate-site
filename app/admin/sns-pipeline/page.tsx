'use client'

import { useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useSnsData, computeEngagementRate } from './use-sns-data'
import { useLangSmithData } from './use-langsmith-data'
import { useLearningData } from './use-learning-data'
import { useOpsData } from './use-ops-data'
import { CRON_JOBS } from './types'
import PipelineFlowDiagram from './components/PipelineFlowDiagram'
import KpiSummaryBar from './components/KpiSummaryBar'
import { PlatformDetailCards } from './components/PlatformDetailCards'
import CronJobTimeline from './components/CronJobTimeline'
import HitlApprovalQueue from './components/HitlApprovalQueue'
import AgentTraceTimeline from './components/AgentTraceTimeline'
import AgentFlowDiagram from './components/AgentFlowDiagram'
import ToolUsageChart from './components/ToolUsageChart'
import TokenUsagePanel from './components/TokenUsagePanel'
import LatencyHeatmap from './components/LatencyHeatmap'
import PatternLeaderboard from './components/PatternLeaderboard'
import AiJudgeAccuracyChart from './components/AiJudgeAccuracyChart'
import ExperimentDashboard from './components/ExperimentDashboard'
import ModelDriftMonitor from './components/ModelDriftMonitor'
import SafetyEventsPanel from './components/SafetyEventsPanel'
import XGrowthChart from './components/XGrowthChart'
import BuzzCollectionMonitor from './components/BuzzCollectionMonitor'
import ConversationTracker from './components/ConversationTracker'
import { Brain, GraduationCap, Settings } from 'lucide-react'

const COLORS = {
  bg: '#0d1a1d',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
  accent: '#06B6D4',
  border: '#224249',
} as const

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} as const

function isActiveInLast7Days(posts: readonly { posted_at: string }[]): boolean {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return posts.some(p => new Date(p.posted_at) >= sevenDaysAgo)
}

export default function SnsPipelinePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const isEnabled = !authLoading && !!user

  const {
    xPosts,
    linkedinPosts,
    instagramPosts,
    threadsPosts,
    storyQueue,
    blogTopics,
    pendingActions,
    loading,
    error,
  } = useSnsData(isEnabled)

  const {
    traces: langsmithTraces,
    stats: langsmithStats,
    loading: langsmithLoading,
    error: langsmithError,
  } = useLangSmithData(isEnabled)

  const {
    patterns,
    predictions,
    events: learningEvents,
    driftLogs,
    banditMetrics,
    loading: learningLoading,
    error: learningError,
  } = useLearningData(isEnabled)

  const {
    conversations,
    buzzPosts,
    safetyEvents,
    growthMetrics,
    loading: opsLoading,
    error: opsError,
  } = useOpsData(isEnabled)

  const handlePlatformClick = useCallback((platform: string) => {
    const targetId = platform === 'blog' ? 'platform-blog-rss' : `platform-${platform}`
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const totalPosts = useMemo(
    () => xPosts.length + linkedinPosts.length + instagramPosts.length + threadsPosts.length,
    [xPosts, linkedinPosts, instagramPosts, threadsPosts]
  )

  const avgEngagementRate = useMemo(() => {
    const allPosts = [
      ...xPosts.map(p => ({ likes: p.likes, impressions: p.impressions, retweets: p.retweets, replies: p.replies })),
      ...linkedinPosts.map(p => ({ likes: p.likes, impressions: p.impressions, comments: p.comments, reposts: p.reposts })),
      ...instagramPosts.map(p => ({ likes: p.likes, impressions: p.impressions, comments: p.comments, shares: p.shares, saves: p.saves })),
      ...threadsPosts.map(p => ({ likes: p.likes, impressions: p.views, replies: p.replies, reposts: p.reposts })),
    ]
    return computeEngagementRate(allPosts)
  }, [xPosts, linkedinPosts, instagramPosts, threadsPosts])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: COLORS.bg }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.accent }} />
      </div>
    )
  }

  if (!user) {
    router.push('/admin')
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: COLORS.bg }}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: COLORS.accent }} />
          <span className="text-sm" style={{ color: COLORS.textMuted }}>Loading SNS pipeline data...</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="-m-4 sm:-m-6 p-4 sm:p-6"
      style={{ background: COLORS.bg, minHeight: '100vh' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: COLORS.text }}>
            SNS Pipeline Dashboard
            <span className="relative flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              LIVE
            </span>
          </h1>
          <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
            全SNSパイプラインのリアルタイム可視化 — 過去30日間
          </p>
        </div>
      </div>

      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#FCA5A5',
          }}
        >
          {error}
        </div>
      )}

      {/* Section 1: Pipeline Flow Diagram */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-6"
      >
        <PipelineFlowDiagram
          xPostCount={xPosts.length}
          linkedinPostCount={linkedinPosts.length}
          instagramPostCount={instagramPosts.length}
          threadsPostCount={threadsPosts.length}
          blogTopicCount={blogTopics.length}
          xActive={isActiveInLast7Days(xPosts)}
          linkedinActive={isActiveInLast7Days(linkedinPosts)}
          instagramActive={isActiveInLast7Days(instagramPosts)}
          threadsActive={isActiveInLast7Days(threadsPosts)}
          blogActive={blogTopics.some(t => {
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            return new Date(t.created_at) >= sevenDaysAgo
          })}
          onPlatformClick={handlePlatformClick}
        />
      </motion.div>

      {/* Section 2: KPI Summary Bar */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-6"
      >
        <KpiSummaryBar
          totalPosts={totalPosts}
          avgEngagementRate={avgEngagementRate}
          pendingApprovals={pendingActions.length}
          activeCronJobs={CRON_JOBS.length}
        />
      </motion.div>

      {/* Section 3: Platform Detail Cards */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-6"
      >
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.text }}>
          Platform Details
          <span className="text-[10px] font-medium" style={{ color: COLORS.textMuted }}>
            30-day overview
          </span>
        </h2>
        <PlatformDetailCards
          xPosts={xPosts}
          linkedinPosts={linkedinPosts}
          instagramPosts={instagramPosts}
          threadsPosts={threadsPosts}
          storyQueue={storyQueue}
          blogTopics={blogTopics}
          pendingActions={pendingActions}
        />
      </motion.div>

      {/* Section 4 & 5: Cron Timeline + HITL Queue */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"
      >
        <CronJobTimeline />
        <HitlApprovalQueue pendingActions={pendingActions} />
      </motion.div>

      {/* LangSmith Section Divider */}
      <div className="my-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.2), transparent)' }} />

      {/* LangSmith Analytics Super-Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-base">&#128300;</span>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}>
            LangSmith Analytics
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.2), transparent)' }} />
      </div>

      {/* Sections 6-8 Wrapper */}
      <div className="rounded-2xl p-5" style={{
        background: 'rgba(6,182,212,0.02)',
        border: '1px solid rgba(6,182,212,0.08)',
      }}>
        {/* Section 6: Agent Trace Timeline (LangSmith) */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#F8FAFC' }}>
            <Brain size={14} style={{ color: '#06B6D4' }} />
            Agent Traces
            <span className="relative flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
              LIVE
            </span>
            <span className="text-[10px] font-medium" style={{ color: '#6a8b94' }}>
              {langsmithTraces.length} traces — 7d
            </span>
            {langsmithLoading && (
              <div className="animate-spin rounded-full h-3 w-3 border-b" style={{ borderColor: '#06B6D4' }} />
            )}
          </h2>
          {langsmithError && (
            <div
              className="mb-3 px-3 py-2 rounded-lg text-xs"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#FCA5A5',
              }}
            >
              {langsmithError}
            </div>
          )}
          <AgentTraceTimeline traces={langsmithTraces} />
        </motion.div>

        {/* Section 7: Agent Flow + Tool Usage (2-col grid) */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"
        >
          <AgentFlowDiagram latestTrace={langsmithTraces[0] ?? null} />
          <ToolUsageChart toolUsage={langsmithStats?.toolUsage ?? []} />
        </motion.div>

        {/* Section 8: Token Usage + Latency (2-col grid) */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          <TokenUsagePanel stats={langsmithStats} />
          <LatencyHeatmap platformLatency={langsmithStats?.platformLatency ?? []} />
        </motion.div>
      </div>

      {/* Learning System Section Divider */}
      <div className="my-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent)' }} />

      {/* Learning System Super-Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap size={16} style={{ color: '#A855F7' }} />
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}>
            Learning System
          </span>
          {learningLoading && (
            <div className="animate-spin rounded-full h-3 w-3 border-b" style={{ borderColor: '#A855F7' }} />
          )}
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(168,85,247,0.2), transparent)' }} />
      </div>

      {learningError && (
        <div
          className="mb-5 px-4 py-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#FCA5A5',
          }}
        >
          {learningError}
        </div>
      )}

      {/* Sections 9-10 Wrapper */}
      <div className="rounded-2xl p-5 mb-6" style={{
        background: 'rgba(168,85,247,0.02)',
        border: '1px solid rgba(168,85,247,0.08)',
      }}>
        {/* Section 9: Pattern Leaderboard + AI Judge Accuracy (2-col) */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"
        >
          <PatternLeaderboard patterns={patterns} banditMetrics={banditMetrics} />
          <AiJudgeAccuracyChart predictions={predictions} />
        </motion.div>

        {/* Section 10: Experiment Dashboard + Model Drift Monitor (2-col) */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          <ExperimentDashboard events={learningEvents} />
          <ModelDriftMonitor driftLogs={driftLogs} />
        </motion.div>
      </div>

      {/* Operations & Growth Section Divider */}
      <div className="my-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.2), transparent)' }} />

      {/* Operations & Growth Super-Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Settings size={16} style={{ color: '#22C55E' }} />
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
            Operations &amp; Growth
          </span>
          {opsLoading && (
            <div className="animate-spin rounded-full h-3 w-3 border-b" style={{ borderColor: '#22C55E' }} />
          )}
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.2), transparent)' }} />
      </div>

      {opsError && (
        <div
          className="mb-5 px-4 py-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#FCA5A5',
          }}
        >
          {opsError}
        </div>
      )}

      {/* Sections 11-13 Wrapper */}
      <div className="rounded-2xl p-5" style={{
        background: 'rgba(34,197,94,0.02)',
        border: '1px solid rgba(34,197,94,0.08)',
      }}>
        {/* Section 11: Safety Events Panel (full width) */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-6"
        >
          <SafetyEventsPanel safetyEvents={safetyEvents} />
        </motion.div>

        {/* Section 12: X Growth Chart + Buzz Collection Monitor (2-col) */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"
        >
          <XGrowthChart growthMetrics={growthMetrics} />
          <BuzzCollectionMonitor buzzPosts={buzzPosts} />
        </motion.div>

        {/* Section 13: Conversation Tracker (full width) */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <ConversationTracker conversations={conversations} />
        </motion.div>
      </div>
    </motion.div>
  )
}
