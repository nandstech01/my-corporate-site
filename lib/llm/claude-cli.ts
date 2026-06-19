/**
 * Claude CLI wrapper — calls Claude via the `claude -p` subscription-backed CLI
 * instead of the paid API. Drop-in replacement for OpenAI/Anthropic SDK calls
 * across CORTEX content generation (X, Threads, LinkedIn, Instagram, Blog,
 * Daily Buzz, etc).
 *
 * Auth: relies on the local Claude Code subscription (keychain). No API key
 * needed in env. Heavier latency than direct API (~3-8s per call) but zero
 * per-token cost.
 */

import { spawn } from 'child_process'

export type ClaudeModel =
  | 'claude-haiku-4-5-20251001'
  | 'claude-haiku-4-5'
  | 'claude-sonnet-4-6'
  | 'claude-opus-4-7'
  | 'claude-opus-4-8'

export interface InvokeClaudeOptions {
  /** System prompt appended to Claude Code's default. */
  system?: string
  /** Model id. Defaults to Haiku 4.5 (cheapest/fastest). */
  model?: ClaudeModel
  /** Max wall-clock time in ms before SIGTERM. Default 120s. */
  timeoutMs?: number
  /** Soft retry count on empty/failed responses. Default 1. */
  retries?: number
}

export interface ClaudeResponse {
  text: string
  model: ClaudeModel
  durationMs: number
}

const DEFAULT_MODEL: ClaudeModel = 'claude-haiku-4-5-20251001'
const DEFAULT_TIMEOUT = 120_000

/**
 * Invoke Claude with a user message. Returns the text response.
 *
 * @example
 *   const { text } = await invokeClaude("Write a tweet about Claude Code", {
 *     system: "あなたはX投稿生成専門のAI...",
 *     model: "claude-sonnet-4-6",
 *   })
 */
export async function invokeClaude(
  user: string,
  options: InvokeClaudeOptions = {}
): Promise<ClaudeResponse> {
  const {
    system,
    model = DEFAULT_MODEL,
    timeoutMs = DEFAULT_TIMEOUT,
    retries = 1,
  } = options

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await invokeOnce(user, { system, model, timeoutMs })
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await sleep(1000 * (attempt + 1))
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`invokeClaude failed: ${String(lastError)}`)
}

async function invokeOnce(
  user: string,
  { system, model, timeoutMs }: Required<Pick<InvokeClaudeOptions, 'model' | 'timeoutMs'>> & { system?: string }
): Promise<ClaudeResponse> {
  // Pass the prompt via stdin (no positional arg) so long prompts don't hit
  // ARG_MAX limits on the spawn syscall.
  const args: string[] = [
    '-p',
    '--model', model,
    '--no-session-persistence',
    '--exclude-dynamic-system-prompt-sections',
  ]
  // Resilience: when the primary model is overloaded, fall back to another model
  // instead of exiting 1 and failing the entire cron job (the observed
  // "claude -p exited 1" failure mode during high-volume periods).
  // Disable with CLAUDE_CLI_FALLBACK_MODEL=none.
  const fallbackModel = process.env.CLAUDE_CLI_FALLBACK_MODEL ?? 'claude-sonnet-4-6'
  if (fallbackModel && fallbackModel !== 'none' && fallbackModel !== model) {
    args.push('--fallback-model', fallbackModel)
  }
  if (system) {
    args.push('--append-system-prompt', system)
  }

  const start = Date.now()

  return new Promise<ClaudeResponse>((resolve, reject) => {
    const proc = spawn('claude', args, {
      env: {
        ...process.env,
        CLAUDE_VOICE_HOOK_SUPPRESS: '1',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // Send the prompt via stdin
    proc.stdin.on('error', () => null)
    proc.stdin.end(user)

    let stdout = ''
    let stderr = ''
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      proc.kill('SIGTERM')
      setTimeout(() => proc.kill('SIGKILL'), 2000)
      reject(new Error(`claude -p timeout after ${timeoutMs}ms. stderr: ${stderr.slice(0, 500)}`))
    }, timeoutMs)

    proc.stdout.on('data', (d) => { stdout += d.toString() })
    proc.stderr.on('data', (d) => { stderr += d.toString() })

    proc.on('error', (err) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(err)
    })

    proc.on('close', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      const durationMs = Date.now() - start

      if (code !== 0) {
        reject(new Error(`claude -p exited ${code}. stderr: ${stderr.slice(0, 500)}`))
        return
      }

      const text = stdout.trim()
      if (!text) {
        reject(new Error(`claude -p returned empty output. stderr: ${stderr.slice(0, 500)}`))
        return
      }

      resolve({ text, model, durationMs })
    })
  })
}

/**
 * Invoke Claude and parse JSON from the response. Strips ```json fences if
 * present. Throws if the response can't be parsed.
 */
export async function invokeClaudeJson<T = unknown>(
  user: string,
  options: InvokeClaudeOptions = {}
): Promise<T> {
  const { text } = await invokeClaude(user, options)
  return parseClaudeJson<T>(text)
}

/**
 * Parse JSON from a Claude response, tolerating code fences and surrounding
 * commentary.
 */
export function parseClaudeJson<T = unknown>(raw: string): T {
  let text = raw.trim()

  // Strip ```json or ``` fences (start/end)
  text = text.replace(/^```(?:json|JSON)?\s*\n?/, '').replace(/\n?```\s*$/, '')

  // If response includes prose before/after JSON, try to extract the first
  // top-level {...} or [...] block.
  if (!text.startsWith('{') && !text.startsWith('[')) {
    const firstObj = text.indexOf('{')
    const firstArr = text.indexOf('[')
    const start = firstObj === -1
      ? firstArr
      : firstArr === -1
        ? firstObj
        : Math.min(firstObj, firstArr)
    if (start >= 0) {
      const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'))
      if (end > start) text = text.slice(start, end + 1)
    }
  }

  try {
    return JSON.parse(text) as T
  } catch (err) {
    throw new Error(
      `Failed to parse JSON from Claude response: ${(err as Error).message}\n--- Raw ---\n${raw.slice(0, 600)}`
    )
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================
// Subagent invocation
// ============================================================
// Reads a `.claude/agents/<name>.md` definition (Claude Code subagent format),
// extracts the YAML frontmatter (name, description, tools, model) and the body
// (system prompt), then dispatches the prompt via `invokeClaude`. This lets
// non-interactive CORTEX scripts (e.g. cron, loop-executor) use the same
// subagent definitions that Claude Code's Task tool uses interactively.

import { readFile } from 'fs/promises'
import { resolve as resolvePath } from 'path'

export interface SubagentDefinition {
  readonly name: string
  readonly description?: string
  readonly tools?: string
  readonly model?: ClaudeModel | string
  readonly systemPrompt: string
}

export interface SubagentOptions extends InvokeClaudeOptions {
  /** If true, parse the response as JSON via parseClaudeJson. */
  parseJson?: boolean
  /** Directory holding the agent markdown files. Default: '.claude/agents'. */
  agentsDir?: string
  /** Override the model declared in the agent file. */
  modelOverride?: ClaudeModel
}

const MODEL_ALIAS: Record<string, ClaudeModel> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6',
  opus: 'claude-opus-4-7',
}

function resolveModel(declared?: string, override?: ClaudeModel): ClaudeModel {
  if (override) return override
  if (!declared) return DEFAULT_MODEL
  if (declared in MODEL_ALIAS) return MODEL_ALIAS[declared]
  return declared as ClaudeModel
}

/**
 * Parse a `.claude/agents/<name>.md` file. Format:
 *
 *     ---
 *     name: foo
 *     description: ...
 *     tools: Read, Grep
 *     model: sonnet
 *     ---
 *
 *     # body (system prompt)
 *     ...
 */
export async function loadSubagentDefinition(
  agentName: string,
  agentsDir: string = '.claude/agents',
): Promise<SubagentDefinition> {
  const filePath = resolvePath(process.cwd(), agentsDir, `${agentName}.md`)
  let raw: string
  try {
    raw = await readFile(filePath, 'utf-8')
  } catch (err) {
    throw new Error(
      `Subagent definition not found: ${filePath} (cwd=${process.cwd()}). ${(err as Error).message}`,
    )
  }

  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!frontmatterMatch) {
    throw new Error(`Subagent ${agentName}: missing YAML frontmatter (expected --- … --- at top)`)
  }

  const yaml = frontmatterMatch[1]
  const body = frontmatterMatch[2].trim()
  const fields: Record<string, string> = {}
  for (const line of yaml.split(/\r?\n/)) {
    const m = line.match(/^(\w[\w_]*):\s*(.*)$/)
    if (m) fields[m[1]] = m[2].trim()
  }

  if (!fields.name) {
    throw new Error(`Subagent ${agentName}: missing 'name' in frontmatter`)
  }

  return {
    name: fields.name,
    description: fields.description,
    tools: fields.tools,
    model: fields.model,
    systemPrompt: body,
  }
}

/**
 * Invoke a `.claude/agents/<name>.md` subagent as a single-turn call.
 *
 * @example
 *   const { text } = await invokeSubagent('cortex-x-writer', 'Generate a post about CORTEX migration')
 *
 * @example  // JSON-returning agent
 *   const verdict = await invokeSubagent('cortex-critic', postText, { parseJson: true })
 */
export async function invokeSubagent(
  agentName: string,
  userPrompt: string,
  options: SubagentOptions = {},
): Promise<ClaudeResponse> {
  const def = await loadSubagentDefinition(agentName, options.agentsDir)
  const model = resolveModel(def.model, options.modelOverride)

  const response = await invokeClaude(userPrompt, {
    system: def.systemPrompt,
    model,
    timeoutMs: options.timeoutMs,
    retries: options.retries,
  })

  return response
}

/**
 * Same as `invokeSubagent` but parses the response as JSON via `parseClaudeJson`.
 * Useful for agents whose output spec is a structured object (e.g. cortex-critic).
 */
export async function invokeSubagentJson<T = unknown>(
  agentName: string,
  userPrompt: string,
  options: Omit<SubagentOptions, 'parseJson'> = {},
): Promise<T> {
  const { text } = await invokeSubagent(agentName, userPrompt, options)
  return parseClaudeJson<T>(text)
}

// ============================================================
// LangChain-compatible adapter
// ============================================================
// Mirrors the minimal `ChatOpenAI.invoke(messages)` interface so existing
// LangChain/LangGraph code can swap with one line: `createModel()` returns
// this instead of `new ChatOpenAI({...})`. No structural changes needed at
// call sites.

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatInvokeResponse {
  content: string
  usage_metadata?: { input_tokens: number; output_tokens: number; total_tokens: number }
}

/**
 * LangChain-shaped adapter around `claude -p`. Drop-in for ChatOpenAI when
 * the calling code only uses `.invoke([...])` and reads `.content` /
 * `.usage_metadata`.
 */
export class ClaudeChatModel {
  private readonly model: ClaudeModel
  private readonly timeoutMs: number

  constructor(opts: { model?: ClaudeModel; timeoutMs?: number } = {}) {
    this.model = opts.model ?? DEFAULT_MODEL
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT
  }

  async invoke(messages: ChatMessage[]): Promise<ChatInvokeResponse> {
    const systems = messages.filter((m) => m.role === 'system').map((m) => m.content)
    const userMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => (m.role === 'assistant' ? `（前の応答）${m.content}` : m.content))
    const system = systems.length > 0 ? systems.join('\n\n') : undefined
    const user = userMessages.join('\n\n')

    const { text } = await invokeClaude(user, {
      system,
      model: this.model,
      timeoutMs: this.timeoutMs,
    })

    return { content: text }
  }
}

// ============================================================
// Anthropic SDK shape adapter
// ============================================================
// Drop-in replacement for `new Anthropic({ apiKey })` + `client.messages.create(...)`.
// Most call sites do `await client.messages.create({ model, max_tokens, messages, system })`
// and read `response.content[0].text` — we mimic that exactly.

function mapAnthropicModel(name?: string): ClaudeModel {
  if (!name) return DEFAULT_MODEL
  if (name.includes('opus')) return 'claude-opus-4-7'
  if (name.includes('sonnet')) return 'claude-sonnet-4-6'
  if (name.includes('haiku')) return 'claude-haiku-4-5-20251001'
  return DEFAULT_MODEL
}

type AnthropicContent =
  | string
  | Array<{ type: string; text?: string; [k: string]: unknown }>

interface AnthropicCreateParams {
  model?: string
  max_tokens?: number
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: AnthropicContent }>
  system?: string
  [k: string]: unknown
}

interface AnthropicCreateResponse {
  id: string
  type: 'message'
  role: 'assistant'
  model: string
  content: Array<{ type: 'text'; text: string }>
  stop_reason: 'end_turn'
  stop_sequence: null
  usage: { input_tokens: number; output_tokens: number }
}

function extractText(content: AnthropicContent): string {
  if (typeof content === 'string') return content
  return content
    .map((c) => (c.type === 'text' && typeof c.text === 'string' ? c.text : ''))
    .filter(Boolean)
    .join('\n')
}

/**
 * Drop-in replacement for `new Anthropic({ apiKey })`. Routes
 * `messages.create()` through `claude -p` (subscription auth) instead of the
 * billable Anthropic API.
 *
 * @example
 *   const client = createAnthropicCompatible()
 *   const response = await client.messages.create({
 *     model: 'claude-sonnet-4-6',
 *     max_tokens: 1024,
 *     messages: [{ role: 'user', content: 'Hello' }],
 *     system: 'You are helpful.',
 *   })
 *   const text = response.content[0].text
 */
export function createAnthropicCompatible(): {
  messages: { create(params: AnthropicCreateParams): Promise<AnthropicCreateResponse> }
} {
  return {
    messages: {
      async create(params: AnthropicCreateParams): Promise<AnthropicCreateResponse> {
        const userParts = params.messages
          .filter((m) => m.role === 'user')
          .map((m) => extractText(m.content))
          .filter(Boolean)
          .join('\n\n')
        const assistantHistory = params.messages
          .filter((m) => m.role === 'assistant')
          .map((m) => `（前のassistant応答）${extractText(m.content)}`)
          .join('\n\n')

        const user = [assistantHistory, userParts].filter(Boolean).join('\n\n')
        const model = mapAnthropicModel(params.model)

        const { text } = await invokeClaude(user, {
          system: params.system,
          model,
        })

        return {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
          type: 'message',
          role: 'assistant',
          model: params.model ?? model,
          content: [{ type: 'text', text }],
          stop_reason: 'end_turn',
          stop_sequence: null,
          usage: { input_tokens: 0, output_tokens: 0 },
        }
      },
    },
  }
}

// ============================================================
// OpenAI SDK shape adapter
// ============================================================
// Drop-in replacement for `new OpenAI({ apiKey })` + `client.chat.completions.create(...)`.

interface OpenAICreateParams {
  model?: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  max_tokens?: number
  [k: string]: unknown
}

interface OpenAIChoice {
  index: number
  message: { role: 'assistant'; content: string }
  finish_reason: 'stop'
}

interface OpenAICreateResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: OpenAIChoice[]
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

/**
 * Drop-in replacement for `new OpenAI({ apiKey })`. Routes
 * `chat.completions.create()` through `claude -p`.
 */
export function createOpenAICompatible(): {
  chat: { completions: { create(params: OpenAICreateParams): Promise<OpenAICreateResponse> } }
} {
  return {
    chat: {
      completions: {
        async create(params: OpenAICreateParams): Promise<OpenAICreateResponse> {
          const system = params.messages.find((m) => m.role === 'system')?.content
          const user = params.messages
            .filter((m) => m.role !== 'system')
            .map((m) => (m.role === 'assistant' ? `（前のassistant応答）${m.content}` : m.content))
            .join('\n\n')

          // 要求モデル名 → Claudeモデルにマップ（既定はHaiku=軽量タスク向け）。
          // 'opus' を要求した呼び出し（長文ブログ生成等）は Opus 4.8 を使う。
          const requested = (params.model ?? '').toLowerCase()
          const model: ClaudeModel = requested.includes('opus')
            ? 'claude-opus-4-8'
            : requested.includes('sonnet')
              ? 'claude-sonnet-4-6'
              : 'claude-haiku-4-5-20251001'
          // 長文生成はHaikuの既定120sでは足りないためモデル別に延長
          const timeoutMs =
            model === 'claude-opus-4-8'
              ? 300000
              : model === 'claude-sonnet-4-6'
                ? 200000
                : 120000
          const { text } = await invokeClaude(user, { system, model, timeoutMs })

          return {
            id: `chatcmpl_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: params.model ?? 'claude-haiku-4-5-20251001',
            choices: [
              {
                index: 0,
                message: { role: 'assistant', content: text },
                finish_reason: 'stop',
              },
            ],
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          }
        },
      },
    },
  }
}
