import type { QuestionnaireAnswers, EstimateResult } from '../types'

export type ComplexityTier = 'S' | 'M' | 'L' | 'XL'

export interface RequirementsAnalysis {
  complexityTier: ComplexityTier
  implicitRequirements: string[]
  techStackCandidates: string[]
  riskFactors: string[]
  estimatedTeamSize: number
}

export interface ProposalGraphState {
  answers: QuestionnaireAnswers
  formulaEstimate: EstimateResult
  requirementsAnalysis: RequirementsAnalysis | null
  proposalMarkdown: string | null
  teaser: string | null
  chatContext: string | null
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
  promptTokens: number
  completionTokens: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateProposalRequest {
  answers: QuestionnaireAnswers
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
  history: ChatMessage[]
}

export interface ChatResponse {
  message: string
  suggestedQuestions?: string[]
}
