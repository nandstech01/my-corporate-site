'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import type {
  PatternPerformanceRow,
  PredictionAccuracyRow,
  LearningPipelineEventRow,
  ModelDriftLogRow,
} from './types'

const THIRTY_DAYS_AGO = () => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString()
}

export interface BanditMetrics {
  readonly exploitationRatio: number
  readonly topPatternByPlatform: Readonly<Record<string, { patternId: string; winRate: number }>>
  readonly avgWinRate: number
  readonly dataHealth: 'cold_start' | 'learning' | 'converged' | 'no_data'
  readonly totalPatterns: number
  readonly patternsWithData: number
}

export interface LearningData {
  readonly patterns: readonly PatternPerformanceRow[]
  readonly predictions: readonly PredictionAccuracyRow[]
  readonly events: readonly LearningPipelineEventRow[]
  readonly driftLogs: readonly ModelDriftLogRow[]
  readonly banditMetrics: BanditMetrics
  readonly loading: boolean
  readonly error: string | null
}

function computeBanditMetrics(patterns: readonly PatternPerformanceRow[]): BanditMetrics {
  if (patterns.length === 0) {
    return { exploitationRatio: 0, topPatternByPlatform: {}, avgWinRate: 0, dataHealth: 'no_data', totalPatterns: 0, patternsWithData: 0 }
  }

  const patternsWithData = patterns.filter(p => p.total_uses > 0)
  const winRates = patternsWithData.map(p => ({
    ...p,
    winRate: (p.successes + 1) / (p.successes + p.failures + 2),
  }))

  const topByPlatform: Record<string, { patternId: string; winRate: number }> = {}
  for (const p of winRates) {
    const plat = p.platform ?? 'unknown'
    if (!topByPlatform[plat] || p.winRate > topByPlatform[plat].winRate) {
      topByPlatform[plat] = { patternId: p.pattern_id, winRate: p.winRate }
    }
  }

  let topUses = 0
  let totalUses = 0
  for (const plat of Object.keys(topByPlatform)) {
    const platPatterns = patternsWithData.filter(p => p.platform === plat)
    const topId = topByPlatform[plat].patternId
    topUses += platPatterns.find(p => p.pattern_id === topId)?.total_uses ?? 0
    totalUses += platPatterns.reduce((s, p) => s + p.total_uses, 0)
  }

  const exploitationRatio = totalUses > 0 ? topUses / totalUses : 0
  const avgWinRate = winRates.length > 0
    ? winRates.reduce((s, p) => s + p.winRate, 0) / winRates.length
    : 0

  const maxUses = Math.max(...patternsWithData.map(p => p.total_uses), 0)
  const dataHealth: BanditMetrics['dataHealth'] = maxUses === 0
    ? 'no_data'
    : maxUses < 5
      ? 'cold_start'
      : maxUses < 20
        ? 'learning'
        : 'converged'

  return { exploitationRatio, topPatternByPlatform: topByPlatform, avgWinRate, dataHealth, totalPatterns: patterns.length, patternsWithData: patternsWithData.length }
}

export function useLearningData(enabled = true): LearningData {
  const [patterns, setPatterns] = useState<readonly PatternPerformanceRow[]>([])
  const [predictions, setPredictions] = useState<readonly PredictionAccuracyRow[]>([])
  const [events, setEvents] = useState<readonly LearningPipelineEventRow[]>([])
  const [driftLogs, setDriftLogs] = useState<readonly ModelDriftLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const since = THIRTY_DAYS_AGO()

      const [patternsResult, predictionsResult, eventsResult, driftResult] = await Promise.all([
        supabase
          .from('pattern_performance')
          .select('*')
          .order('total_uses', { ascending: false })
          .limit(200),

        supabase
          .from('prediction_accuracy')
          .select('*')
          .gte('measured_at', since)
          .order('measured_at', { ascending: false })
          .limit(200),

        supabase
          .from('learning_pipeline_events')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(200),

        supabase
          .from('model_drift_log')
          .select('*')
          .gte('date', since.slice(0, 10))
          .order('date', { ascending: false })
          .limit(200),
      ])

      const errors = [
        patternsResult.error,
        predictionsResult.error,
        eventsResult.error,
        driftResult.error,
      ].filter(Boolean)

      if (errors.length > 0) {
        const msgs = errors.map(e => e?.message).join(', ')
        setError(`Some learning queries failed: ${msgs}`)
      }

      setPatterns((patternsResult.data ?? []) as PatternPerformanceRow[])
      setPredictions((predictionsResult.data ?? []) as PredictionAccuracyRow[])
      setEvents((eventsResult.data ?? []) as LearningPipelineEventRow[])
      setDriftLogs((driftResult.data ?? []) as ModelDriftLogRow[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch learning data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchAll()
    }
  }, [fetchAll, enabled])

  const banditMetrics = computeBanditMetrics(patterns)

  return { patterns, predictions, events, driftLogs, banditMetrics, loading, error }
}
