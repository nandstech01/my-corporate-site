import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END } from '@langchain/langgraph'
import { Annotation } from '@langchain/langgraph'
import { getServiceConfig, isValidServiceType } from '@/lib/services/config'
import type { ServiceType, FollowUpStrategy } from '@/lib/services/types'
import { scoreLeadQuality } from './lead-scoring'
import type {
  RequirementsAnalysis,
  ProposalResult,
  GenerateProposalRequest,
  LeadScoring,
} from './types'

const GraphState = Annotation.Root({
  answersJson: Annotation<string>,
  serviceType: Annotation<ServiceType>,
  formulaEstimateJson: Annotation<string>,
  requirementsAnalysis: Annotation<RequirementsAnalysis | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  proposalMarkdown: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  teaser: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  chatContext: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  leadScoring: Annotation<LeadScoring | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  followUpStrategy: Annotation<FollowUpStrategy | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  promptTokens: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),
  completionTokens: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),
  error: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
})

type GraphStateType = typeof GraphState.State

function createModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return new ChatAnthropic({
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.3,
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return new ChatOpenAI({
    modelName: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

function validateService(
  state: GraphStateType,
): Partial<GraphStateType> {
  if (!isValidServiceType(state.serviceType)) {
    return { error: `Invalid service type: ${state.serviceType}` }
  }
  return {}
}

async function analyzeRequirements(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const config = getServiceConfig(state.serviceType)
  const model = createModel()

  const response = await model.invoke([
    { role: 'system' as const, content: config.prompts.requirementsAnalysis },
    {
      role: 'user' as const,
      content: `以下のアンケート回答を分析してください:\n\n${state.answersJson}`,
    },
  ])

  const content =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { error: 'Failed to parse requirements analysis JSON' }
  }

  const analysis: RequirementsAnalysis = JSON.parse(jsonMatch[0])
  const usage = response.usage_metadata

  return {
    requirementsAnalysis: analysis,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

function scoreLeadQualityNode(
  state: GraphStateType,
): Partial<GraphStateType> {
  if (!state.requirementsAnalysis) {
    return { error: 'No requirements analysis for lead scoring' }
  }

  const answers: Record<string, unknown> = JSON.parse(state.answersJson)
  const scoring = scoreLeadQuality(
    answers,
    state.serviceType,
    state.requirementsAnalysis.complexityTier,
  )

  return { leadScoring: scoring }
}

async function generateProposal(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.requirementsAnalysis) {
    return { error: 'No requirements analysis available' }
  }

  const config = getServiceConfig(state.serviceType)
  const model = createModel()

  const response = await model.invoke([
    { role: 'system' as const, content: config.prompts.proposalGeneration },
    {
      role: 'user' as const,
      content: `## アンケート回答\n${state.answersJson}\n\n## 要件分析結果\n${JSON.stringify(state.requirementsAnalysis, null, 2)}`,
    },
  ])

  const content =
    typeof response.content === 'string'
      ? response.content
      : String(response.content)

  const usage = response.usage_metadata

  return {
    proposalMarkdown: content,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

function formatOutput(
  state: GraphStateType,
): Partial<GraphStateType> {
  if (!state.proposalMarkdown) {
    return { error: 'No proposal markdown available' }
  }

  const lines = state.proposalMarkdown.split('\n')
  const teaserLines: string[] = []
  let sectionCount = 0

  for (const line of lines) {
    if (line.startsWith('## ') && sectionCount > 0) {
      sectionCount++
      if (sectionCount > 2) break
    }
    if (line.startsWith('## ')) {
      sectionCount++
    }
    teaserLines.push(line)
  }

  const teaser = teaserLines.join('\n').trim()

  const config = getServiceConfig(state.serviceType)

  // Summarize answers to stay within chat API's character limit
  const answers: Record<string, unknown> = JSON.parse(state.answersJson)
  const answerSummary = Object.entries(answers)
    .filter(([, v]) => v !== '' && v !== null && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
    .join('\n')

  const chatContext = [
    `サービス: ${config.nameJa}`,
    `プロジェクト概要:\n${answerSummary}`,
    `複雑度: ${state.requirementsAnalysis?.complexityTier ?? '不明'}`,
    `推奨技術: ${state.requirementsAnalysis?.techStackCandidates?.join(', ') ?? '未定'}`,
    `リスク: ${state.requirementsAnalysis?.riskFactors?.join(', ') ?? 'なし'}`,
    `チーム規模: ${state.requirementsAnalysis?.estimatedTeamSize ?? '未定'}名`,
    state.leadScoring ? `リードスコア: ${state.leadScoring.score} (${state.leadScoring.tier})` : '',
  ].filter(Boolean).join('\n').slice(0, 2800)

  return {
    teaser,
    chatContext,
  }
}

function suggestFollowUp(
  state: GraphStateType,
): Partial<GraphStateType> {
  const tier = state.leadScoring?.tier ?? 'cold'
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? ''

  const strategies: Record<string, FollowUpStrategy> = {
    hot: {
      cta: '今すぐ無料相談を予約（30分）',
      ctaUrl: calendlyUrl,
      message: '御社のプロジェクトは高い実現可能性があります。30分の無料相談で、具体的な進め方をご提案いたします。',
      emailSubject: '【NANDS】AI開発提案書のご確認・無料相談のご案内',
    },
    warm: {
      cta: '詳細資料をメールで受け取る',
      ctaUrl: '',
      message: '提案書の詳細版と事例集をメールでお送りします。ご検討の参考にしてください。',
      emailSubject: '【NANDS】AI開発提案書・詳細資料のお届け',
    },
    cold: {
      cta: '事例集をダウンロード',
      ctaUrl: '',
      message: '同業種の開発事例をまとめた資料をご用意しています。ご検討の第一歩としてご活用ください。',
      emailSubject: '【NANDS】開発事例集のご案内',
    },
  }

  return {
    followUpStrategy: strategies[tier] ?? strategies.cold,
  }
}

function shouldContinueAfterValidation(
  state: GraphStateType,
): 'analyzeRequirements' | typeof END {
  return state.error ? END : 'analyzeRequirements'
}

function shouldContinueAfterAnalysis(
  state: GraphStateType,
): 'scoreLeadQuality' | typeof END {
  return state.error ? END : 'scoreLeadQuality'
}

function shouldContinueAfterScoring(
  state: GraphStateType,
): 'generateProposal' | typeof END {
  return state.error ? END : 'generateProposal'
}

function shouldContinueAfterProposal(
  state: GraphStateType,
): 'formatOutput' | typeof END {
  return state.error ? END : 'formatOutput'
}

function buildGraph() {
  const graph = new StateGraph(GraphState)
    .addNode('validateService', validateService)
    .addNode('analyzeRequirements', analyzeRequirements)
    .addNode('scoreLeadQuality', scoreLeadQualityNode)
    .addNode('generateProposal', generateProposal)
    .addNode('formatOutput', formatOutput)
    .addNode('suggestFollowUp', suggestFollowUp)
    .addEdge(START, 'validateService')
    .addConditionalEdges(
      'validateService',
      shouldContinueAfterValidation,
    )
    .addConditionalEdges(
      'analyzeRequirements',
      shouldContinueAfterAnalysis,
    )
    .addConditionalEdges(
      'scoreLeadQuality',
      shouldContinueAfterScoring,
    )
    .addConditionalEdges(
      'generateProposal',
      shouldContinueAfterProposal,
    )
    .addEdge('formatOutput', 'suggestFollowUp')
    .addEdge('suggestFollowUp', END)

  return graph.compile()
}

export async function generateProposalFromAnswers(
  request: GenerateProposalRequest,
): Promise<ProposalResult> {
  const app = buildGraph()

  const result = await app.invoke({
    answersJson: JSON.stringify(request.answers, null, 2),
    serviceType: request.serviceType,
    formulaEstimateJson: JSON.stringify(request.formulaEstimate, null, 2),
  })

  if (result.error) {
    throw new Error(result.error)
  }

  if (!result.proposalMarkdown || !result.teaser || !result.chatContext) {
    throw new Error('Incomplete proposal generation')
  }

  return {
    teaser: result.teaser,
    fullMarkdown: result.proposalMarkdown,
    chatContext: result.chatContext,
    complexityTier:
      result.requirementsAnalysis?.complexityTier ?? 'M',
    formulaEstimate: request.formulaEstimate,
    leadScoring: result.leadScoring,
    followUpStrategy: result.followUpStrategy,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
  }
}
