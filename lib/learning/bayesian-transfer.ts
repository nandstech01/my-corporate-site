/**
 * Bayesian Cross-Platform Transfer Learning
 *
 * Pure math functions for computing Bayesian priors when transferring
 * pattern performance data across platforms. Uses Beta distribution
 * priors scaled by platform similarity.
 */

import type { Platform } from '../ai-judge/types'

// ============================================================
// Platform Similarity Matrix
// ============================================================

const PLATFORM_SIMILARITY: Record<Platform, Record<Platform, number>> = {
  x: { x: 1.0, threads: 0.7, linkedin: 0.4, instagram: 0.2 },
  threads: { x: 0.7, threads: 1.0, linkedin: 0.3, instagram: 0.5 },
  linkedin: { x: 0.4, threads: 0.3, linkedin: 1.0, instagram: 0.2 },
  instagram: { x: 0.2, threads: 0.5, linkedin: 0.2, instagram: 1.0 },
}

// ============================================================
// Types
// ============================================================

export interface TransferPrior {
  readonly alpha: number
  readonly beta: number
}

export interface TransferConfig {
  readonly transferStrength: number     // default 0.3
  readonly maxPriorUses: number         // default 5
  readonly minSourceUses: number        // default 8
  readonly minSourceSuccessRate: number // default 0.55
}

export const DEFAULT_TRANSFER_CONFIG: TransferConfig = {
  transferStrength: 0.3,
  maxPriorUses: 5,
  minSourceUses: 8,
  minSourceSuccessRate: 0.55,
}

// ============================================================
// Digamma Approximation (Stirling)
// ============================================================

/**
 * Digamma function via Stirling's approximation:
 * digamma(x) ~ ln(x) - 1/(2x) - 1/(12x^2) + 1/(120x^4)
 */
export function digamma(x: number): number {
  if (x <= 0) return -Infinity  // Guard for invalid inputs
  // For small x, use recurrence: digamma(x) = digamma(x+1) - 1/x
  let result = 0
  let val = x
  while (val < 6) {
    result -= 1 / val
    val += 1
  }
  // Stirling approximation for large val
  result += Math.log(val) - 1 / (2 * val) - 1 / (12 * val * val) + 1 / (120 * val * val * val * val)
  return result
}

// ============================================================
// Log-Beta Function (ln B(a,b) = lnGamma(a) + lnGamma(b) - lnGamma(a+b))
// ============================================================

/**
 * Log of the Beta function using Stirling's log-gamma approximation.
 * lnGamma(x) ~ (x-0.5)*ln(x) - x + 0.5*ln(2*pi) + 1/(12x)
 */
function lnGamma(x: number): number {
  // Use recurrence for small x
  let shift = 0
  let val = x
  while (val < 7) {
    shift -= Math.log(val)
    val += 1
  }
  // Stirling approximation for lnGamma
  return (
    shift +
    (val - 0.5) * Math.log(val) -
    val +
    0.5 * Math.log(2 * Math.PI) +
    1 / (12 * val)
  )
}

function lnBeta(a: number, b: number): number {
  return lnGamma(a) + lnGamma(b) - lnGamma(a + b)
}

// ============================================================
// Calculate Transferred Prior
// ============================================================

/**
 * Calculate a Beta prior transferred from a source to a target platform.
 *
 * effectiveStrength = transferStrength * platformSimilarity
 * alpha_prior = 1 + (sourceAlpha - 1) * effectiveStrength
 * beta_prior  = 1 + (sourceBeta  - 1) * effectiveStrength
 *
 * Cap: (alpha_prior + beta_prior - 2) <= maxPriorUses, normalize proportionally.
 */
export function calculateTransferPrior(params: {
  readonly sourceAlpha: number
  readonly sourceBeta: number
  readonly transferStrength: number
  readonly platformSimilarity: number
  readonly maxPriorUses: number
}): TransferPrior {
  const { sourceAlpha, sourceBeta, transferStrength, platformSimilarity, maxPriorUses } = params

  const effectiveStrength = transferStrength * platformSimilarity

  const rawAlpha = 1 + (sourceAlpha - 1) * effectiveStrength
  const rawBeta = 1 + (sourceBeta - 1) * effectiveStrength

  const totalExcess = rawAlpha + rawBeta - 2

  // If total pseudo-observations exceed cap, normalize proportionally
  if (totalExcess > maxPriorUses && totalExcess > 0) {
    const scale = maxPriorUses / totalExcess
    return {
      alpha: Math.max(1, 1 + (rawAlpha - 1) * scale),
      beta: Math.max(1, 1 + (rawBeta - 1) * scale),
    }
  }

  return { alpha: Math.max(1, rawAlpha), beta: Math.max(1, rawBeta) }
}

// ============================================================
// KL Divergence Between Two Beta Distributions
// ============================================================

/**
 * KL(Beta(a1,b1) || Beta(a2,b2))
 * = ln(B(a2,b2)/B(a1,b1))
 *   + (a1-a2)*digamma(a1) + (b1-b2)*digamma(b1)
 *   + (a2-a1+b2-b1)*digamma(a1+b1)
 */
export function klDivergenceBeta(
  alpha1: number,
  beta1: number,
  alpha2: number,
  beta2: number,
): number {
  const logBetaRatio = lnBeta(alpha2, beta2) - lnBeta(alpha1, beta1)

  const kl =
    logBetaRatio +
    (alpha1 - alpha2) * digamma(alpha1) +
    (beta1 - beta2) * digamma(beta1) +
    (alpha2 - alpha1 + beta2 - beta1) * digamma(alpha1 + beta1)

  // KL divergence should be non-negative; clamp to handle numerical noise
  return Math.max(0, kl)
}

// ============================================================
// Adaptive Transfer Strength
// ============================================================

/**
 * Adjust transfer strength based on observed divergence.
 * If divergence > threshold: reduce by 0.05 (min 0.1)
 * If divergence < threshold: increase by 0.02 (max 0.5)
 */
export function adaptiveTransferStrength(
  baseStrength: number,
  observedDivergence: number,
  divergenceThreshold: number = 0.5,
): number {
  if (observedDivergence > divergenceThreshold) {
    return Math.max(0.1, baseStrength - 0.05)
  }
  return Math.min(0.5, baseStrength + 0.02)
}

// ============================================================
// Platform Similarity Lookup
// ============================================================

export function getPlatformSimilarity(source: Platform, target: Platform): number {
  return PLATFORM_SIMILARITY[source]?.[target] ?? 0
}
