/**
 * Pure Statistical Functions for A/B Experiment Testing
 *
 * No external dependencies. All functions are pure (no side effects).
 * Implements Welch's t-test, proportion z-test, confidence intervals,
 * and sample size calculations.
 */

// ============================================================
// Types
// ============================================================

export interface TTestResult {
  readonly tStatistic: number
  readonly degreesOfFreedom: number
  readonly pValue: number
}

export interface ZTestResult {
  readonly zStatistic: number
  readonly pValue: number
}

// ============================================================
// Log-Gamma and Incomplete Beta (internal math)
// ============================================================

/**
 * Log-gamma function using Lanczos approximation.
 */
function lnGamma(z: number): number {
  if (z <= 0) return Infinity

  const g = 7
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]

  if (z < 0.5) {
    // Reflection formula
    return (
      Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z)
    )
  }

  const x = z - 1
  let a = coefficients[0]
  const t = x + g + 0.5

  for (let i = 1; i < coefficients.length; i++) {
    a += coefficients[i] / (x + i)
  }

  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

// ============================================================
// Regularized incomplete beta via direct series + CF
// ============================================================

/**
 * Regularized incomplete beta I_x(a, b) — simplified direct implementation.
 *
 * Uses the continued fraction representation from Numerical Recipes.
 */
function betaIncomplete(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1

  // Use symmetry for convergence
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - betaIncomplete(1 - x, b, a)
  }

  const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b)
  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lnBeta)

  // Evaluate continued fraction using modified Lentz's method
  const MAX_ITER = 200
  const EPS = 3e-14
  const FPMIN = 1e-30

  const qab = a + b
  const qap = a + 1
  const qam = a - 1

  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < FPMIN) d = FPMIN
  d = 1 / d
  let h = d

  for (let m = 1; m <= MAX_ITER; m++) {
    const m2 = 2 * m

    // Even step
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    h *= d * c

    // Odd step
    aa = -((a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del

    if (Math.abs(del - 1) < EPS) break
  }

  return (front * h) / a
}

// ============================================================
// t-distribution CDF
// ============================================================

/**
 * CDF of the Student's t-distribution.
 *
 * P(T <= t) using regularized incomplete beta function:
 * P(T <= t) = 1 - 0.5 * I_x(df/2, 0.5) where x = df/(df + t^2)
 */
function tDistCdf(t: number, df: number): number {
  if (df <= 0) return NaN

  const x = df / (df + t * t)
  const ibeta = betaIncomplete(x, df / 2, 0.5)

  if (t >= 0) {
    return 1 - 0.5 * ibeta
  }
  return 0.5 * ibeta
}

// ============================================================
// Normal CDF (for z-test)
// ============================================================

/**
 * Standard normal CDF using Abramowitz & Stegun approximation.
 */
function normalCdf(z: number): number {
  if (z < -8) return 0
  if (z > 8) return 1

  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = z < 0 ? -1 : 1
  const x = Math.abs(z) / Math.SQRT2

  const t = 1 / (1 + p * x)
  const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1 + sign * erf)
}

// ============================================================
// z critical value (inverse normal approximation)
// ============================================================

/**
 * Approximate z critical value for given alpha (two-tailed).
 * Uses rational approximation from Abramowitz & Stegun 26.2.23.
 */
export function zCritical(alpha: number): number {
  const p = 1 - alpha / 2
  // Rational approximation for inverse normal
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0,
  ]
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ]
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ]
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ]

  const pLow = 0.02425
  const pHigh = 1 - pLow

  let q: number
  let r: number

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }

  if (p <= pHigh) {
    q = p - 0.5
    r = q * q
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    )
  }

  q = Math.sqrt(-2 * Math.log(1 - p))
  return -(
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  )
}

// ============================================================
// Public API
// ============================================================

/**
 * Welch's t-test for two samples with unequal variances.
 *
 * Uses Welch-Satterthwaite equation for degrees of freedom.
 * Returns two-tailed p-value.
 */
export function welchTTest(
  sample1: readonly number[],
  sample2: readonly number[],
): TTestResult {
  const n1 = sample1.length
  const n2 = sample2.length

  if (n1 < 2 || n2 < 2) {
    return { tStatistic: 0, degreesOfFreedom: 0, pValue: 1 }
  }

  const mean1 = sample1.reduce((s, v) => s + v, 0) / n1
  const mean2 = sample2.reduce((s, v) => s + v, 0) / n2

  const var1 = sample1.reduce((s, v) => s + (v - mean1) ** 2, 0) / (n1 - 1)
  const var2 = sample2.reduce((s, v) => s + (v - mean2) ** 2, 0) / (n2 - 1)

  const se1 = var1 / n1
  const se2 = var2 / n2
  const seSum = se1 + se2

  if (seSum === 0) {
    return { tStatistic: 0, degreesOfFreedom: n1 + n2 - 2, pValue: 1 }
  }

  const tStatistic = (mean1 - mean2) / Math.sqrt(seSum)

  // Welch-Satterthwaite degrees of freedom
  const dfNumerator = seSum ** 2
  const dfDenominator = se1 ** 2 / (n1 - 1) + se2 ** 2 / (n2 - 1)
  const degreesOfFreedom = dfDenominator > 0 ? dfNumerator / dfDenominator : n1 + n2 - 2

  // Two-tailed p-value from t-distribution CDF
  const cdf = tDistCdf(Math.abs(tStatistic), degreesOfFreedom)
  const pValue = 2 * (1 - cdf)

  return {
    tStatistic,
    degreesOfFreedom,
    pValue: Math.max(0, Math.min(1, pValue)),
  }
}

/**
 * Two-proportion z-test.
 *
 * Tests whether two proportions are significantly different.
 * Returns two-tailed p-value.
 */
export function proportionZTest(
  successes1: number,
  n1: number,
  successes2: number,
  n2: number,
): ZTestResult {
  if (n1 === 0 || n2 === 0) {
    return { zStatistic: 0, pValue: 1 }
  }

  const p1 = successes1 / n1
  const p2 = successes2 / n2

  // Pooled proportion
  const pPooled = (successes1 + successes2) / (n1 + n2)
  const qPooled = 1 - pPooled

  if (pPooled === 0 || pPooled === 1) {
    return { zStatistic: 0, pValue: 1 }
  }

  const se = Math.sqrt(pPooled * qPooled * (1 / n1 + 1 / n2))

  if (se === 0) {
    return { zStatistic: 0, pValue: 1 }
  }

  const zStatistic = (p1 - p2) / se

  // Two-tailed p-value
  const pValue = 2 * (1 - normalCdf(Math.abs(zStatistic)))

  return {
    zStatistic,
    pValue: Math.max(0, Math.min(1, pValue)),
  }
}

/**
 * Confidence interval for a mean.
 *
 * @param mean - Sample mean
 * @param stddev - Sample standard deviation
 * @param n - Sample size
 * @param alpha - Significance level (default 0.05 for 95% CI)
 * @returns [lower, upper] bounds
 */
export function confidenceInterval(
  mean: number,
  stddev: number,
  n: number,
  alpha = 0.05,
): readonly [number, number] {
  if (n <= 0 || stddev < 0) {
    return [mean, mean]
  }

  const z = zCritical(alpha)
  const margin = z * (stddev / Math.sqrt(n))

  return [mean - margin, mean + margin] as const
}

/**
 * Minimum sample size per group for a two-sample test.
 *
 * @param mde - Minimum detectable effect (proportion, e.g., 0.05 for 5%)
 * @param alpha - Significance level (default 0.05)
 * @param power - Statistical power (default 0.8)
 * @returns Required sample size per group
 */
export function requiredSampleSize(
  mde: number,
  alpha = 0.05,
  power = 0.8,
): number {
  if (mde <= 0) return Infinity

  const zAlpha = zCritical(alpha)
  const zBeta = zCritical(2 * (1 - power))

  // For proportions around 0.5 (worst case variance)
  const p = 0.5
  const q = 1 - p

  const n = ((zAlpha + zBeta) ** 2 * 2 * p * q) / (mde ** 2)

  return Math.ceil(n)
}
