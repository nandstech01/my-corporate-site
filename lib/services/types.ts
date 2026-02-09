import type { LucideIcon } from 'lucide-react'

export type ServiceType = 'homepage' | 'efficiency' | 'custom-dev' | 'ai-integration'

export type LeadTier = 'hot' | 'warm' | 'cold'

export interface ServiceQuestion {
  id: number
  title: string
  subtitle: string
  type: 'textarea' | 'button-grid' | 'checkbox' | 'text'
  field: string
  options?: string[]
  placeholder?: string
  maxLength?: number
  required: boolean
  skippable?: boolean
  dynamicOptions?: (answers: Record<string, unknown>) => string[]
}

export interface ServicePrompts {
  requirementsAnalysis: string
  proposalGeneration: string
  chatSystem: string
}

export interface ServiceConfig {
  id: ServiceType
  nameJa: string
  icon: LucideIcon
  description: string
  questions: ServiceQuestion[]
  prompts: ServicePrompts
  features: {
    standard: string[]
    premium: string[]
  }
  pricingHints: {
    minPrice: number
    maxPrice: number
  }
  scoringWeights: {
    budget: number
    timeline: number
    complexity: number
  }
  suggestedQuestions: string[]
}

export interface LeadScoringResult {
  score: number
  tier: LeadTier
  factors: {
    budgetScore: number
    timelineScore: number
    complexityScore: number
  }
}

export interface FollowUpStrategy {
  cta: string
  ctaUrl: string
  message: string
  emailSubject: string
}
