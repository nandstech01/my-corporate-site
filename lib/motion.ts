import type { Variants, Transition } from 'framer-motion'

// Shared animation durations (seconds)
export const DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
} as const

// Cubic-bezier matching top page easing
export const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

// Stagger delay between children
export const STAGGER = 0.12

// --- Shared Variants ---

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER,
    },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE },
  },
}

// Tap/hover micro-interaction presets
export const tapScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
} as const

// Standard transition preset
export const defaultTransition: Transition = {
  duration: DURATION.normal,
  ease: EASE,
}
