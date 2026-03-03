/**
 * A/B Experiment Tracker
 *
 * Formal experiment tracking layer on top of Thompson Sampling.
 * Enables controlled A/B comparisons with statistical significance testing.
 *
 * Storage: Uses learning_pipeline_events table with event_types:
 * - experiment_created: full Experiment config in data
 * - experiment_outcome: { experimentId, variantId, engagement, success }
 * - experiment_concluded: ExperimentResult in data
 */

import { createClient } from '@supabase/supabase-js'
import type { Platform } from '../ai-judge/types'
import {
  welchTTest,
  proportionZTest,
  zCritical,
} from './statistics'

// ============================================================
// Types
// ============================================================

export interface Experiment {
  readonly id: string
  readonly name: string
  readonly platform: Platform
  readonly status: 'active' | 'concluded' | 'paused'
  readonly hypothesis: string
  readonly variants: readonly ExperimentVariant[]
  readonly startedAt: string
  readonly concludedAt?: string
  readonly minSampleSize: number
  readonly significanceLevel: number
}

export interface ExperimentVariant {
  readonly id: string
  readonly patternIds: readonly string[]
  readonly sampleCount: number
  readonly totalEngagement: number
  readonly avgEngagement: number
  readonly successCount: number
  readonly successRate: number
}

export interface ExperimentResult {
  readonly experimentId: string
  readonly isSignificant: boolean
  readonly pValue: number
  readonly winner?: string
  readonly liftPercent?: number
  readonly confidenceInterval: readonly [number, number]
}

export interface CreateExperimentConfig {
  readonly id: string
  readonly name: string
  readonly platform: Platform
  readonly hypothesis: string
  readonly variants: readonly {
    readonly id: string
    readonly patternIds: readonly string[]
  }[]
  readonly minSampleSize?: number
  readonly significanceLevel?: number
}

interface ExperimentOutcomeData {
  readonly experimentId: string
  readonly variantId: string
  readonly engagement: number
  readonly success: boolean
}

interface LearningPipelineRow {
  readonly id: string
  readonly event_type: string
  readonly platform: string
  readonly post_id: string
  readonly data: Record<string, unknown>
  readonly created_at: string
}

// ============================================================
// Supabase Client
// ============================================================

let cachedSupabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (cachedSupabase) return cachedSupabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  cachedSupabase = createClient(url, key)
  return cachedSupabase
}

// ============================================================
// Create Experiment
// ============================================================

export async function createExperiment(
  config: CreateExperimentConfig,
): Promise<Experiment> {
  const supabase = getSupabase()

  const experiment: Experiment = {
    id: config.id,
    name: config.name,
    platform: config.platform,
    status: 'active',
    hypothesis: config.hypothesis,
    variants: config.variants.map((v) => ({
      id: v.id,
      patternIds: v.patternIds,
      sampleCount: 0,
      totalEngagement: 0,
      avgEngagement: 0,
      successCount: 0,
      successRate: 0,
    })),
    startedAt: new Date().toISOString(),
    minSampleSize: config.minSampleSize ?? 30,
    significanceLevel: config.significanceLevel ?? 0.05,
  }

  const { error } = await supabase.from('learning_pipeline_events').insert({
    event_type: 'experiment_created',
    platform: config.platform,
    post_id: config.id,
    data: experiment,
  })

  if (error) {
    throw new Error(`Failed to create experiment: ${error.message}`)
  }

  return experiment
}

// ============================================================
// Record Experiment Outcome
// ============================================================

export async function recordExperimentOutcome(
  experimentId: string,
  variantId: string,
  engagement: number,
  success: boolean,
  platform: Platform = 'x',
): Promise<void> {
  const supabase = getSupabase()

  const outcomeData: ExperimentOutcomeData = {
    experimentId,
    variantId,
    engagement,
    success,
  }

  const { error } = await supabase.from('learning_pipeline_events').insert({
    event_type: 'experiment_outcome',
    platform,
    post_id: experimentId,
    data: outcomeData,
  })

  if (error) {
    throw new Error(`Failed to record experiment outcome: ${error.message}`)
  }
}

// ============================================================
// Fetch experiment data from events
// ============================================================

async function fetchExperimentConfig(
  experimentId: string,
): Promise<Experiment | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('learning_pipeline_events')
    .select('*')
    .eq('event_type', 'experiment_created')
    .eq('post_id', experimentId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return null
  }

  return (data[0] as LearningPipelineRow).data as unknown as Experiment
}

async function fetchExperimentOutcomes(
  experimentId: string,
): Promise<readonly ExperimentOutcomeData[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('learning_pipeline_events')
    .select('*')
    .eq('event_type', 'experiment_outcome')
    .eq('post_id', experimentId)

  if (error || !data) {
    return []
  }

  return (data as readonly LearningPipelineRow[]).map(
    (row) => row.data as unknown as ExperimentOutcomeData,
  )
}

// ============================================================
// Aggregate variant stats from outcomes
// ============================================================

function aggregateVariantStats(
  baseVariants: readonly ExperimentVariant[],
  outcomes: readonly ExperimentOutcomeData[],
): readonly ExperimentVariant[] {
  return baseVariants.map((variant) => {
    const variantOutcomes = outcomes.filter((o) => o.variantId === variant.id)
    const sampleCount = variantOutcomes.length
    const totalEngagement = variantOutcomes.reduce((s, o) => s + o.engagement, 0)
    const successCount = variantOutcomes.filter((o) => o.success).length

    return {
      ...variant,
      sampleCount,
      totalEngagement,
      avgEngagement: sampleCount > 0 ? totalEngagement / sampleCount : 0,
      successCount,
      successRate: sampleCount > 0 ? successCount / sampleCount : 0,
    }
  })
}

// ============================================================
// Evaluate Experiment
// ============================================================

export async function evaluateExperiment(
  experimentId: string,
): Promise<ExperimentResult> {
  const experiment = await fetchExperimentConfig(experimentId)

  if (!experiment) {
    throw new Error(`Experiment not found: ${experimentId}`)
  }

  const outcomes = await fetchExperimentOutcomes(experimentId)
  const variants = aggregateVariantStats(experiment.variants, outcomes)

  // Need at least 2 variants to compare
  if (variants.length < 2) {
    return {
      experimentId,
      isSignificant: false,
      pValue: 1,
      confidenceInterval: [0, 0],
    }
  }

  const control = variants[0]
  const treatment = variants[1]

  // Check minimum sample size
  if (
    control.sampleCount < experiment.minSampleSize ||
    treatment.sampleCount < experiment.minSampleSize
  ) {
    return {
      experimentId,
      isSignificant: false,
      pValue: 1,
      confidenceInterval: [0, 0],
    }
  }

  // Build engagement samples from outcomes for t-test
  const controlOutcomes = outcomes
    .filter((o) => o.variantId === control.id)
    .map((o) => o.engagement)
  const treatmentOutcomes = outcomes
    .filter((o) => o.variantId === treatment.id)
    .map((o) => o.engagement)

  // Run Welch's t-test on engagement
  const tResult = welchTTest(controlOutcomes, treatmentOutcomes)

  // Run proportion z-test on success rates
  const zResult = proportionZTest(
    control.successCount,
    control.sampleCount,
    treatment.successCount,
    treatment.sampleCount,
  )

  // Use the more conservative (higher) p-value
  const pValue = Math.max(tResult.pValue, zResult.pValue)
  const isSignificant = pValue < experiment.significanceLevel

  // Determine winner by engagement mean
  const winner =
    isSignificant && treatment.avgEngagement !== control.avgEngagement
      ? treatment.avgEngagement > control.avgEngagement
        ? treatment.id
        : control.id
      : undefined

  // Lift percentage
  const liftPercent =
    isSignificant && control.avgEngagement > 0
      ? ((treatment.avgEngagement - control.avgEngagement) /
          control.avgEngagement) *
        100
      : undefined

  // Confidence interval on engagement difference
  const diff = treatment.avgEngagement - control.avgEngagement
  const controlStdDev =
    controlOutcomes.length > 1
      ? Math.sqrt(
          controlOutcomes.reduce(
            (s, v) => s + (v - control.avgEngagement) ** 2,
            0,
          ) /
            (controlOutcomes.length - 1),
        )
      : 0
  const treatmentStdDev =
    treatmentOutcomes.length > 1
      ? Math.sqrt(
          treatmentOutcomes.reduce(
            (s, v) => s + (v - treatment.avgEngagement) ** 2,
            0,
          ) /
            (treatmentOutcomes.length - 1),
        )
      : 0
  const pooledSe = Math.sqrt(
    controlStdDev ** 2 / control.sampleCount +
      treatmentStdDev ** 2 / treatment.sampleCount,
  )
  // Use z critical value directly with pooled SE (already a standard error)
  const zVal = zCritical(experiment.significanceLevel)
  const ci: readonly [number, number] = [
    diff - zVal * pooledSe,
    diff + zVal * pooledSe,
  ] as const

  return {
    experimentId,
    isSignificant,
    pValue,
    winner,
    liftPercent,
    confidenceInterval: ci,
  }
}

// ============================================================
// Conclude Experiment
// ============================================================

export async function concludeExperiment(
  experimentId: string,
): Promise<void> {
  const supabase = getSupabase()
  const result = await evaluateExperiment(experimentId)
  const experiment = await fetchExperimentConfig(experimentId)

  const { error } = await supabase.from('learning_pipeline_events').insert({
    event_type: 'experiment_concluded',
    platform: experiment?.platform ?? 'x',
    post_id: experimentId,
    data: {
      ...result,
      concludedAt: new Date().toISOString(),
    },
  })

  if (error) {
    throw new Error(`Failed to conclude experiment: ${error.message}`)
  }
}

// ============================================================
// Get Active Experiments
// ============================================================

export async function getActiveExperiments(
  platform: Platform,
): Promise<readonly Experiment[]> {
  const supabase = getSupabase()

  // Fetch all experiment_created events for the platform
  const { data: createdEvents, error: createdError } = await supabase
    .from('learning_pipeline_events')
    .select('*')
    .eq('event_type', 'experiment_created')
    .eq('platform', platform)

  if (createdError || !createdEvents) {
    return []
  }

  // Fetch all concluded experiment IDs
  const { data: concludedEvents } = await supabase
    .from('learning_pipeline_events')
    .select('post_id')
    .eq('event_type', 'experiment_concluded')

  const concludedIds = new Set(
    (concludedEvents ?? []).map(
      (e: { post_id: string }) => e.post_id,
    ),
  )

  // Filter to active experiments
  const experiments = (createdEvents as readonly LearningPipelineRow[])
    .map((row) => row.data as unknown as Experiment)
    .filter((exp) => exp.status === 'active' && !concludedIds.has(exp.id))

  return experiments
}

// ============================================================
// Auto-Evaluate All Active Experiments
// ============================================================

export async function autoEvaluateAll(): Promise<readonly ExperimentResult[]> {
  const platforms: readonly Platform[] = ['x', 'linkedin', 'threads']
  const results: ExperimentResult[] = []

  for (const platform of platforms) {
    const experiments = await getActiveExperiments(platform)

    for (const experiment of experiments) {
      try {
        const result = await evaluateExperiment(experiment.id)
        results.push(result)

        if (result.isSignificant) {
          process.stdout.write(
            `Experiment "${experiment.id}" reached significance: ` +
              `p=${result.pValue.toFixed(4)}, winner=${result.winner ?? 'none'}, ` +
              `lift=${result.liftPercent?.toFixed(1) ?? 'N/A'}%\n`,
          )
          await concludeExperiment(experiment.id)
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        process.stdout.write(
          `Failed to evaluate experiment "${experiment.id}": ${msg}\n`,
        )
      }
    }
  }

  return results
}

// ============================================================
// Get Pattern → Experiment Variant Map
// ============================================================

export async function getExperimentPatternMap(
  platform: Platform,
): Promise<ReadonlyMap<string, { experimentId: string; variantId: string }>> {
  const experiments = await getActiveExperiments(platform)
  const patternMap = new Map<string, { experimentId: string; variantId: string }>()

  for (const experiment of experiments) {
    for (const variant of experiment.variants) {
      for (const patternId of variant.patternIds) {
        patternMap.set(patternId, {
          experimentId: experiment.id,
          variantId: variant.id,
        })
      }
    }
  }

  return patternMap
}
