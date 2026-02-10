/**
 * LangGraph ReAct Agent
 *
 * Slack Bot のコアエンジン。メッセージを受け取り、
 * ツールを自律的に選択して実行する。
 *
 * Flow:
 *   START → loadMemory → agent → [shouldContinue] → tools → agent → ... → END
 */

import { ChatOpenAI } from '@langchain/openai'
import {
  StateGraph,
  START,
  END,
  Annotation,
  messagesStateReducer,
} from '@langchain/langgraph'
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage,
} from '@langchain/core/messages'
import type { StructuredToolInterface } from '@langchain/core/tools'
import { createTools } from './tools'
import { buildSystemPrompt } from './system-prompt'
import {
  recallMemories,
  getConversationHistory,
  saveConversationMessage,
} from './memory'
import type { AgentContext } from './types'

// ============================================================
// State 定義
// ============================================================

const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  slackChannelId: Annotation<string>,
  slackUserId: Annotation<string>,
  slackThreadTs: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  memoryContext: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),
})

type AgentStateType = typeof AgentState.State

// ============================================================
// Model
// ============================================================

function createModel() {
  return new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// Nodes
// ============================================================

async function loadMemory(
  state: AgentStateType,
): Promise<Partial<AgentStateType>> {
  try {
    const memories = await recallMemories({
      slackUserId: state.slackUserId,
      limit: 10,
    })

    const memoryContext =
      memories.length > 0
        ? memories
            .map(
              (m) =>
                `[${m.memory_type}] ${m.content} (importance: ${m.importance})`,
            )
            .join('\n')
        : ''

    // Load conversation history
    const history = await getConversationHistory({
      slackChannelId: state.slackChannelId,
      slackThreadTs: state.slackThreadTs,
      limit: 30,
    })

    const historyMessages: BaseMessage[] = history.map((msg) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content)
      }
      if (msg.role === 'tool') {
        return new HumanMessage(`[Previous tool result]: ${msg.content}`)
      }
      return new AIMessage(msg.content)
    })

    // Prepend history before current messages (current user message is last)
    const currentMessages = state.messages
    const allMessages = [...historyMessages, ...currentMessages]

    return {
      memoryContext,
      messages: allMessages,
    }
  } catch {
    return { memoryContext: '' }
  }
}

async function agent(
  state: AgentStateType,
): Promise<Partial<AgentStateType>> {
  const model = createModel()
  const ctx: AgentContext = {
    slackChannelId: state.slackChannelId,
    slackUserId: state.slackUserId,
    slackThreadTs: state.slackThreadTs,
  }

  const tools = createTools(ctx)
  const modelWithTools = model.bindTools(tools)

  const systemMessage = new SystemMessage(
    buildSystemPrompt(state.memoryContext),
  )

  const response = await modelWithTools.invoke([
    systemMessage,
    ...state.messages,
  ])

  return { messages: [response] }
}

// ============================================================
// Conditional Edge
// ============================================================

function shouldContinue(state: AgentStateType): 'tools' | typeof END {
  const lastMessage = state.messages[state.messages.length - 1]

  if (
    lastMessage &&
    'tool_calls' in lastMessage &&
    Array.isArray((lastMessage as AIMessage).tool_calls) &&
    ((lastMessage as AIMessage).tool_calls?.length ?? 0) > 0
  ) {
    return 'tools'
  }

  return END
}

// ============================================================
// Graph Builder
// ============================================================

async function executeTools(
  tools: StructuredToolInterface[],
  state: AgentStateType,
): Promise<Partial<AgentStateType>> {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage
  const toolCalls = lastMessage.tool_calls ?? []

  const toolMap = new Map(tools.map((t) => [t.name, t]))

  const toolMessages: ToolMessage[] = await Promise.all(
    toolCalls.map(async (tc) => {
      const selectedTool = toolMap.get(tc.name)
      if (!selectedTool) {
        return new ToolMessage({
          tool_call_id: tc.id ?? '',
          content: JSON.stringify({ error: `Tool ${tc.name} not found` }),
        })
      }
      try {
        const result = await selectedTool.invoke(tc.args)
        return new ToolMessage({
          tool_call_id: tc.id ?? '',
          content: typeof result === 'string' ? result : JSON.stringify(result),
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Tool execution failed'
        return new ToolMessage({
          tool_call_id: tc.id ?? '',
          content: JSON.stringify({ error: message }),
        })
      }
    }),
  )

  return { messages: toolMessages }
}

function buildAgentGraph() {
  return (ctx: AgentContext) => {
    const tools = createTools(ctx)

    const toolsNode = async (state: AgentStateType) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      executeTools(tools as any, state)

    const graph = new StateGraph(AgentState)
      .addNode('loadMemory', loadMemory)
      .addNode('agent', agent)
      .addNode('tools', toolsNode)
      .addEdge(START, 'loadMemory')
      .addEdge('loadMemory', 'agent')
      .addConditionalEdges('agent', shouldContinue)
      .addEdge('tools', 'agent')

    return graph.compile()
  }
}

const getCompiledGraph = buildAgentGraph()

// ============================================================
// Public API
// ============================================================

export async function runAgent(params: {
  readonly message: string
  readonly slackChannelId: string
  readonly slackUserId: string
  readonly slackThreadTs: string | null
}): Promise<string> {
  const ctx: AgentContext = {
    slackChannelId: params.slackChannelId,
    slackUserId: params.slackUserId,
    slackThreadTs: params.slackThreadTs,
  }

  const app = getCompiledGraph(ctx)

  // Save user message
  await saveConversationMessage({
    slackChannelId: params.slackChannelId,
    slackUserId: params.slackUserId,
    slackThreadTs: params.slackThreadTs,
    role: 'user',
    content: params.message,
  })

  const result = await app.invoke({
    messages: [new HumanMessage(params.message)],
    slackChannelId: params.slackChannelId,
    slackUserId: params.slackUserId,
    slackThreadTs: params.slackThreadTs,
  })

  // Save tool calls and results to conversation history
  const toolSummaries: string[] = []
  for (const msg of result.messages) {
    if (
      'tool_calls' in msg &&
      Array.isArray((msg as AIMessage).tool_calls) &&
      ((msg as AIMessage).tool_calls?.length ?? 0) > 0
    ) {
      const toolCalls = (msg as AIMessage).tool_calls ?? []
      for (const tc of toolCalls) {
        toolSummaries.push(`Called: ${tc.name}`)
      }
    }
    if (msg instanceof ToolMessage) {
      const content =
        typeof msg.content === 'string'
          ? msg.content.slice(0, 500)
          : JSON.stringify(msg.content).slice(0, 500)
      await saveConversationMessage({
        slackChannelId: params.slackChannelId,
        slackUserId: params.slackUserId,
        slackThreadTs: params.slackThreadTs,
        role: 'tool',
        content,
      })
    }
  }

  // Extract final assistant message
  const lastMessage = result.messages[result.messages.length - 1]
  const responseText =
    typeof lastMessage.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage.content)

  // Save assistant message with tool call summary
  await saveConversationMessage({
    slackChannelId: params.slackChannelId,
    slackUserId: params.slackUserId,
    slackThreadTs: params.slackThreadTs,
    role: 'assistant',
    content: responseText,
    toolCalls: toolSummaries.length > 0
      ? toolSummaries.map((s) => ({ summary: s }))
      : undefined,
  })

  return responseText
}
