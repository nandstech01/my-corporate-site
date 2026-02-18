/**
 * LangGraph ReAct Agent
 *
 * Slack Bot のコアエンジン。メッセージを受け取り、
 * ツールを自律的に選択して実行する。
 *
 * Phase 1 改善:
 * - ツール実行トラッカーで重複呼び出し防止
 * - ReAct ループ制限 (最大5回)
 * - コンテキストウィンドウ管理 (古いツール結果トリミング + 会話サマリー)
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
  compactConversationIfNeeded,
} from './memory'
import type { AgentContext } from './types'
import {
  createToolTracker,
  isDuplicate,
  getCachedResult,
  recordExecution,
  buildExecutionSummary,
  type ToolTracker,
} from './tool-tracker'

// ============================================================
// 定数
// ============================================================

const MAX_ITERATIONS = 5
const RECENT_MESSAGES_FULL = 5
const MAX_TOOL_RESULT_LENGTH = 1000
const TOOL_RESULT_HEAD = 400
const TOOL_RESULT_TAIL = 400

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
  iterationCount: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => 0,
  }),
  toolTracker: Annotation<ToolTracker>({
    reducer: (_prev, next) => next,
    default: () => createToolTracker(),
  }),
})

type AgentStateType = typeof AgentState.State

// ============================================================
// Model
// ============================================================

function createModel() {
  return new ChatOpenAI({
    modelName: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// ユーティリティ: コンテキスト管理
// ============================================================

/**
 * 長いツール結果を head/tail でトリミング (OpenClaw の Session Pruning パターン)
 */
function trimToolResult(content: string): string {
  if (content.length <= MAX_TOOL_RESULT_LENGTH) return content
  return `${content.slice(0, TOOL_RESULT_HEAD)}\n...[trimmed]...\n${content.slice(-TOOL_RESULT_TAIL)}`
}

/**
 * 会話履歴を圧縮: 直近 N 件は全文保持、それ以前はサマリー化
 */
function compactHistory(
  messages: readonly BaseMessage[],
): readonly BaseMessage[] {
  if (messages.length <= RECENT_MESSAGES_FULL) {
    return messages
  }

  const oldMessages = messages.slice(0, -RECENT_MESSAGES_FULL)
  const recentMessages = messages.slice(-RECENT_MESSAGES_FULL)

  // 古いメッセージをサマリーに圧縮
  const summaryParts: string[] = []
  for (const msg of oldMessages) {
    const role =
      msg instanceof HumanMessage
        ? 'User'
        : msg instanceof AIMessage
          ? 'Assistant'
          : msg instanceof ToolMessage
            ? 'Tool'
            : 'System'

    const content =
      typeof msg.content === 'string'
        ? msg.content
        : JSON.stringify(msg.content)

    // ツール結果は短縮
    if (msg instanceof ToolMessage) {
      summaryParts.push(`[${role}]: ${trimToolResult(content)}`)
    } else {
      const truncated =
        content.length > 200 ? `${content.slice(0, 200)}...` : content
      summaryParts.push(`[${role}]: ${truncated}`)
    }
  }

  const summaryMessage = new HumanMessage(
    `[Previous conversation summary]:\n${summaryParts.join('\n')}`,
  )

  return [summaryMessage, ...recentMessages]
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
        // ツール結果をトリミングして復元
        return new HumanMessage(
          `[Previous tool result]: ${trimToolResult(msg.content)}`,
        )
      }
      return new AIMessage(msg.content)
    })

    // 会話履歴を圧縮
    const compacted = compactHistory(historyMessages)

    // Prepend history before current messages (current user message is last)
    const currentMessages = state.messages
    const allMessages = [...compacted, ...currentMessages]

    return {
      memoryContext,
      messages: allMessages,
      iterationCount: 0,
      toolTracker: createToolTracker(),
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

  const trackerSummary = buildExecutionSummary(state.toolTracker)
  const systemMessage = new SystemMessage(
    buildSystemPrompt(state.memoryContext, trackerSummary),
  )

  const response = await modelWithTools.invoke([
    systemMessage,
    ...state.messages,
  ])

  return {
    messages: [response],
    iterationCount: state.iterationCount + 1,
  }
}

// ============================================================
// Conditional Edge
// ============================================================

function shouldContinue(state: AgentStateType): 'tools' | typeof END {
  // ループ制限: MAX_ITERATIONS 到達で強制終了
  if (state.iterationCount >= MAX_ITERATIONS) {
    return END
  }

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
// Tool Execution (with tracker integration)
// ============================================================

async function executeTools(
  tools: StructuredToolInterface[],
  state: AgentStateType,
): Promise<Partial<AgentStateType>> {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage
  const toolCalls = lastMessage.tool_calls ?? []

  const toolMap = new Map(tools.map((t) => [t.name, t]))
  let tracker = state.toolTracker

  const toolMessages: ToolMessage[] = await Promise.all(
    toolCalls.map(async (tc) => {
      const args = (tc.args ?? {}) as Record<string, unknown>

      // 重複チェック: 同一ツール + 同一引数なら前回結果を返す
      if (isDuplicate(tracker, tc.name, args)) {
        const cached = getCachedResult(tracker, tc.name, args)
        return new ToolMessage({
          tool_call_id: tc.id ?? '',
          content: cached
            ? `[CACHED - already executed] ${cached}`
            : JSON.stringify({
                error: `Tool ${tc.name} was already called with the same arguments. Use the previous result.`,
              }),
        })
      }

      const selectedTool = toolMap.get(tc.name)
      if (!selectedTool) {
        return new ToolMessage({
          tool_call_id: tc.id ?? '',
          content: JSON.stringify({ error: `Tool ${tc.name} not found` }),
        })
      }

      try {
        const result = await selectedTool.invoke(tc.args)
        const resultStr =
          typeof result === 'string' ? result : JSON.stringify(result)

        // トラッカーに記録
        tracker = recordExecution(tracker, tc.name, args, resultStr)

        return new ToolMessage({
          tool_call_id: tc.id ?? '',
          content: resultStr,
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

  return {
    messages: toolMessages,
    toolTracker: tracker,
  }
}

// ============================================================
// Graph Builder
// ============================================================

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
    toolCalls:
      toolSummaries.length > 0
        ? toolSummaries.map((s) => ({ summary: s }))
        : undefined,
  })

  // 会話コンパクション: 履歴が閾値を超えたらサマリー化 (best-effort)
  compactConversationIfNeeded({
    slackChannelId: params.slackChannelId,
    slackUserId: params.slackUserId,
    slackThreadTs: params.slackThreadTs,
  }).catch(() => {
    // コンパクション失敗は無視（レスポンスに影響させない）
  })

  return responseText
}
