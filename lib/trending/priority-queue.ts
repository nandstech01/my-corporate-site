/**
 * In-memory priority queue for time-sensitive posting opportunities.
 *
 * Score formula: relevanceScore * freshnessDecay * urgencyMultiplier
 *   - breaking: 3x, trending: 1.5x, standard: 1x
 *   - freshnessDecay: exp(-ageHours / 4) (half-life ~2.8 hours)
 */

// ============================================================
// Types
// ============================================================

export type UrgencyLevel = 'breaking' | 'trending' | 'standard'

export interface TrendingOpportunity {
  readonly id: string
  readonly source: 'buzz_posts' | 'x_quote_opportunities' | 'slack_bot_memory'
  readonly topic: string
  readonly urgency: UrgencyLevel
  readonly score: number
  readonly detectedAt: Date
  readonly expiresAt: Date
  readonly metadata?: Record<string, unknown>
}

// ============================================================
// Constants
// ============================================================

const URGENCY_MULTIPLIERS: Readonly<Record<UrgencyLevel, number>> = {
  breaking: 3.0,
  trending: 1.5,
  standard: 1.0,
}

/** Decay constant: exp(-ageHours / DECAY_CONSTANT) gives half-life ~2.8h */
const DECAY_CONSTANT = 4

// ============================================================
// Score Calculation
// ============================================================

export function calculatePriorityScore(
  relevanceScore: number,
  urgency: UrgencyLevel,
  detectedAt: Date,
  now: Date = new Date(),
): number {
  const ageMs = now.getTime() - detectedAt.getTime()
  const ageHours = Math.max(0, ageMs / (1000 * 60 * 60))
  const freshnessDecay = Math.exp(-ageHours / DECAY_CONSTANT)
  const urgencyMultiplier = URGENCY_MULTIPLIERS[urgency]

  return relevanceScore * freshnessDecay * urgencyMultiplier
}

// ============================================================
// Priority Queue
// ============================================================

export interface TrendingPriorityQueue {
  readonly items: readonly TrendingOpportunity[]
  readonly processedIds: ReadonlySet<string>
}

export function createQueue(): TrendingPriorityQueue {
  return {
    items: [],
    processedIds: new Set(),
  }
}

export function addOpportunity(
  queue: TrendingPriorityQueue,
  opportunity: TrendingOpportunity,
): TrendingPriorityQueue {
  if (queue.processedIds.has(opportunity.id)) {
    return queue
  }

  const existingIds = new Set(queue.items.map((item) => item.id))
  if (existingIds.has(opportunity.id)) {
    return queue
  }

  return {
    ...queue,
    items: [...queue.items, opportunity].sort((a, b) => b.score - a.score),
  }
}

export function getTopOpportunity(
  queue: TrendingPriorityQueue,
): TrendingOpportunity | null {
  const validItems = queue.items.filter(
    (item) => !queue.processedIds.has(item.id),
  )
  return validItems.length > 0 ? validItems[0] : null
}

export function markProcessed(
  queue: TrendingPriorityQueue,
  id: string,
): TrendingPriorityQueue {
  return {
    items: queue.items.filter((item) => item.id !== id),
    processedIds: new Set(Array.from(queue.processedIds).concat(id)),
  }
}

export function pruneExpired(
  queue: TrendingPriorityQueue,
  now: Date = new Date(),
): TrendingPriorityQueue {
  const validItems = queue.items.filter(
    (item) => item.expiresAt.getTime() > now.getTime(),
  )

  if (validItems.length === queue.items.length) {
    return queue
  }

  return {
    ...queue,
    items: validItems,
  }
}
