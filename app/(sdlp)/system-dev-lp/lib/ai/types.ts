import type { EstimateResult } from '../types'
import type { ServiceType, LeadTier, FollowUpStrategy } from '@/lib/services/types'

export type { FollowUpStrategy }

export type ComplexityTier = 'S' | 'M' | 'L' | 'XL'

export interface RequirementsAnalysis {
  complexityTier: ComplexityTier
  implicitRequirements: string[]
  techStackCandidates: string[]
  riskFactors: string[]
  estimatedTeamSize: number
}

export interface LeadScoring {
  score: number
  tier: LeadTier
  factors: {
    budgetScore: number
    timelineScore: number
    complexityScore: number
  }
}

export interface ProposalGraphState {
  answers: Record<string, unknown>
  serviceType: ServiceType
  formulaEstimate: EstimateResult
  requirementsAnalysis: RequirementsAnalysis | null
  proposalMarkdown: string | null
  teaser: string | null
  chatContext: string | null
  leadScoring: LeadScoring | null
  followUpStrategy: FollowUpStrategy | null
  promptTokens: number
  completionTokens: number
  error: string | null
}

export interface ProposalResult {
  teaser: string
  fullMarkdown: string
  chatContext: string
  complexityTier: ComplexityTier
  formulaEstimate: EstimateResult
  leadScoring: LeadScoring | null
  followUpStrategy: FollowUpStrategy | null
  promptTokens: number
  completionTokens: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateProposalRequest {
  answers: Record<string, unknown>
  serviceType: ServiceType
  formulaEstimate: EstimateResult
}

export interface GenerateProposalResponse {
  success: boolean
  proposal?: ProposalResult
  error?: string
  generationTimeMs?: number
}

export interface ChatRequest {
  message: string
  chatContext: string
  serviceType: ServiceType
  history: ChatMessage[]
}

export interface ChatResponse {
  message: string
  suggestedQuestions?: string[]
}
