import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, START, END } from '@langchain/langgraph'
import { Annotation } from '@langchain/langgraph'
import {
  REQUIREMENTS_ANALYSIS_PROMPT,
  PROPOSAL_GENERATION_PROMPT,
  buildRequirementsUserPrompt,
  buildProposalUserPrompt,
} from './prompts'
import type {
  RequirementsAnalysis,
  ProposalResult,
  GenerateProposalRequest,
} from './types'

const GraphState = Annotation.Root({
  answersJson: Annotation<string>,
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

function createModel(temperature = 0.3) {
  return new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature,
    apiKey: process.env.OPENAI_API_KEY,
  })
}

async function analyzeRequirements(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  const model = createModel(0.2)

  const response = await model.invoke([
    { role: 'system', content: REQUIREMENTS_ANALYSIS_PROMPT },
    {
      role: 'user',
      content: buildRequirementsUserPrompt(state.answersJson),
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

async function generateProposal(
  state: GraphStateType,
): Promise<Partial<GraphStateType>> {
  if (!state.requirementsAnalysis) {
    return { error: 'No requirements analysis available' }
  }

  const model = createModel(0.5)

  const response = await model.invoke([
    { role: 'system', content: PROPOSAL_GENERATION_PROMPT },
    {
      role: 'user',
      content: buildProposalUserPrompt(
        state.answersJson,
        JSON.stringify(state.requirementsAnalysis, null, 2),
      ),
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

  const chatContext = [
    `プロジェクト概要: ${state.answersJson}`,
    `複雑度: ${state.requirementsAnalysis?.complexityTier ?? '不明'}`,
    `推奨技術: ${state.requirementsAnalysis?.techStackCandidates?.join(', ') ?? '未定'}`,
    `リスク: ${state.requirementsAnalysis?.riskFactors?.join(', ') ?? 'なし'}`,
    `チーム規模: ${state.requirementsAnalysis?.estimatedTeamSize ?? '未定'}名`,
  ].join('\n')

  return {
    teaser,
    chatContext,
  }
}

function shouldContinueAfterAnalysis(
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
    .addNode('analyzeRequirements', analyzeRequirements)
    .addNode('generateProposal', generateProposal)
    .addNode('formatOutput', formatOutput)
    .addEdge(START, 'analyzeRequirements')
    .addConditionalEdges(
      'analyzeRequirements',
      shouldContinueAfterAnalysis,
    )
    .addConditionalEdges(
      'generateProposal',
      shouldContinueAfterProposal,
    )
    .addEdge('formatOutput', END)

  return graph.compile()
}

export async function generateProposalFromAnswers(
  request: GenerateProposalRequest,
): Promise<ProposalResult> {
  const app = buildGraph()

  const result = await app.invoke({
    answersJson: JSON.stringify(request.answers, null, 2),
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
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
  }
}
