'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

export interface LangSmithTrace {
  readonly id: string
  readonly name: string
  readonly status: string
  readonly latencyMs: number
  readonly totalTokens: number
  readonly promptTokens: number
  readonly completionTokens: number
  readonly toolCalls: readonly string[]
  readonly tags: readonly string[]
  readonly startTime: string
  readonly endTime: string | null
  readonly error: string | null
}

export interface ToolUsageStat {
  readonly name: string
  readonly count: number
  readonly successRate: number
}

export interface DailyTokenUsage {
  readonly date: string
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
  readonly estimatedCost: number
}

export interface PlatformLatency {
  readonly platform: string
  readonly avgMs: number
  readonly p95Ms: number
  readonly maxMs: number
  readonly count: number
}

export interface LangSmithStats {
  readonly toolUsage: readonly ToolUsageStat[]
  readonly dailyTokens: readonly DailyTokenUsage[]
  readonly platformLatency: readonly PlatformLatency[]
  readonly successRate: number
  readonly totalRuns: number
  readonly totalErrors: number
}

export interface LangSmithData {
  readonly traces: readonly LangSmithTrace[]
  readonly stats: LangSmithStats | null
  readonly loading: boolean
  readonly error: string | null
}

const POLL_INTERVAL_MS = 30_000

export function useLangSmithData(enabled: boolean): LangSmithData {
  const [traces, setTraces] = useState<readonly LangSmithTrace[]>([])
  const [stats, setStats] = useState<LangSmithStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [tracesRes, statsRes] = await Promise.all([
        fetch('/api/admin/langsmith/traces?limit=50&days=7'),
        fetch('/api/admin/langsmith/stats?days=7'),
      ])

      if (!tracesRes.ok || !statsRes.ok) {
        const errMsg = !tracesRes.ok
          ? `Traces: ${tracesRes.status}`
          : `Stats: ${statsRes.status}`
        setError(`Failed to fetch LangSmith data (${errMsg})`)
        return
      }

      const [tracesJson, statsJson] = await Promise.all([
        tracesRes.json(),
        statsRes.json(),
      ])

      if (tracesJson.success) {
        setTraces(tracesJson.data)
      }
      if (statsJson.success) {
        setStats(statsJson.data)
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch LangSmith data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    fetchData()
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, fetchData])

  return { traces, stats, loading, error }
}
