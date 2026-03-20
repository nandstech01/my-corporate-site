'use client'

import { FlaskConical } from 'lucide-react'
import type { LearningPipelineEventRow } from '../types'

interface ExperimentDashboardProps {
  readonly events: readonly LearningPipelineEventRow[]
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

interface ParsedExperiment {
  readonly id: string
  readonly platform: string
  readonly status: 'active' | 'concluded'
  readonly data: Record<string, unknown>
  readonly created_at: string
}

function parseExperiments(events: readonly LearningPipelineEventRow[]): readonly ParsedExperiment[] {
  const experimentMap = new Map<string, ParsedExperiment>()

  for (const event of events) {
    const expId = (event.data as Record<string, unknown>)?.experiment_id as string ?? event.id

    if (event.event_type === 'experiment_created' || event.event_type === 'experiment_started') {
      if (!experimentMap.has(expId)) {
        experimentMap.set(expId, {
          id: expId,
          platform: event.platform ?? 'all',
          status: 'active',
          data: event.data as Record<string, unknown>,
          created_at: event.created_at,
        })
      }
    }

    if (event.event_type === 'experiment_concluded' || event.event_type === 'experiment_completed') {
      experimentMap.set(expId, {
        id: expId,
        platform: event.platform ?? 'all',
        status: 'concluded',
        data: event.data as Record<string, unknown>,
        created_at: event.created_at,
      })
    }
  }

  return [...experimentMap.values()]
}

function getStatusColor(status: string): { bg: string; color: string } {
  if (status === 'active') return { bg: '#22C55E20', color: '#22C55E' }
  return { bg: '#6B728020', color: '#9CA3AF' }
}

export default function ExperimentDashboard({ events }: ExperimentDashboardProps) {
  const experiments = parseExperiments(events)
  const active = experiments.filter(e => e.status === 'active')
  const concluded = experiments.filter(e => e.status === 'concluded')

  if (events.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical size={14} style={{ color: COLORS.accent }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
            A/B Experiments
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="text-sm" style={{ color: COLORS.textDim }}>No experiments yet</span>
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
        <FlaskConical size={14} style={{ color: COLORS.accent }} />
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          A/B Experiments
        </span>
        <span className="text-[10px]" style={{ color: COLORS.textMuted }}>
          {active.length} active · {concluded.length} concluded
        </span>
      </div>

      {/* Active experiments */}
      {active.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#22C55E' }}>
            Active
          </p>
          <div className="space-y-2">
            {active.slice(0, 5).map(exp => {
              const variants = (exp.data?.variants as string[]) ?? []
              const sampleSize = (exp.data?.sample_size as number) ?? 0
              const targetSize = (exp.data?.target_sample_size as number) ?? 100
              const progress = targetSize > 0 ? Math.min((sampleSize / targetSize) * 100, 100) : 0

              return (
                <div key={exp.id} className="rounded-lg p-3" style={{ background: COLORS.cardInner }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium" style={{ color: COLORS.text }}>
                      {exp.id.length > 30 ? exp.id.slice(0, 28) + '…' : exp.id}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded"
                      style={getStatusColor('active')}
                    >
                      active
                    </span>
                  </div>
                  {variants.length > 0 && (
                    <div className="flex gap-1 mb-1.5">
                      {variants.map((v, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: COLORS.border, color: COLORS.textMuted }}>
                          {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.border }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${progress}%`, background: COLORS.accent }}
                      />
                    </div>
                    <span className="text-[9px]" style={{ color: COLORS.textDim }}>
                      {sampleSize}/{targetSize}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Concluded experiments */}
      {concluded.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textMuted }}>
            Concluded
          </p>
          <div className="space-y-2">
            {concluded.slice(0, 5).map(exp => {
              const winner = (exp.data?.winner as string) ?? 'N/A'
              const lift = (exp.data?.lift_percent as number) ?? 0
              const pValue = (exp.data?.p_value as number) ?? 1

              return (
                <div key={exp.id} className="rounded-lg p-3" style={{ background: COLORS.cardInner }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium truncate" style={{ color: COLORS.text }}>
                      {exp.id.length > 20 ? exp.id.slice(0, 18) + '…' : exp.id}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={getStatusColor('concluded')}>
                      concluded
                    </span>
                    {winner !== 'N/A' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#FFD70030', color: '#FFD700' }}>
                        Winner: {winner}
                      </span>
                    )}
                    {lift !== 0 && (
                      <span className="text-[9px]" style={{ color: lift > 0 ? '#22C55E' : '#EF4444' }}>
                        {lift > 0 ? '+' : ''}{lift.toFixed(1)}%
                      </span>
                    )}
                    {pValue < 1 && (
                      <span className="text-[9px]" style={{ color: COLORS.textDim }}>
                        p={pValue.toFixed(3)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
