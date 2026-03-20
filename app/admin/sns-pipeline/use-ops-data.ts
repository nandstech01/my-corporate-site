'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import type {
  XConversationThreadRow,
  BuzzPostRow,
  SafetyEventRow,
  XGrowthMetricRow,
} from './types'

const THIRTY_DAYS_AGO = () => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString()
}

export interface OpsData {
  readonly conversations: readonly XConversationThreadRow[]
  readonly buzzPosts: readonly BuzzPostRow[]
  readonly safetyEvents: readonly SafetyEventRow[]
  readonly growthMetrics: readonly XGrowthMetricRow[]
  readonly loading: boolean
  readonly error: string | null
}

export function useOpsData(enabled = true): OpsData {
  const [conversations, setConversations] = useState<readonly XConversationThreadRow[]>([])
  const [buzzPosts, setBuzzPosts] = useState<readonly BuzzPostRow[]>([])
  const [safetyEvents, setSafetyEvents] = useState<readonly SafetyEventRow[]>([])
  const [growthMetrics, setGrowthMetrics] = useState<readonly XGrowthMetricRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const since = THIRTY_DAYS_AGO()

      const [convResult, buzzResult, safetyResult, growthResult] = await Promise.all([
        supabase
          .from('x_conversation_threads')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(200),

        supabase
          .from('buzz_posts')
          .select('*')
          .gte('collected_at', since)
          .order('buzz_score', { ascending: false })
          .limit(200),

        supabase
          .from('safety_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),

        supabase
          .from('x_growth_metrics')
          .select('*')
          .gte('date', since.slice(0, 10))
          .order('date', { ascending: false })
          .limit(60),
      ])

      const errors = [
        convResult.error,
        buzzResult.error,
        safetyResult.error,
        growthResult.error,
      ].filter(Boolean)

      if (errors.length > 0) {
        const msgs = errors.map(e => e?.message).join(', ')
        setError(`Some ops queries failed: ${msgs}`)
      }

      setConversations((convResult.data ?? []) as XConversationThreadRow[])
      setBuzzPosts((buzzResult.data ?? []) as BuzzPostRow[])
      setSafetyEvents((safetyResult.data ?? []) as SafetyEventRow[])
      setGrowthMetrics((growthResult.data ?? []) as XGrowthMetricRow[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ops data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchAll()
    }
  }, [fetchAll, enabled])

  return { conversations, buzzPosts, safetyEvents, growthMetrics, loading, error }
}
