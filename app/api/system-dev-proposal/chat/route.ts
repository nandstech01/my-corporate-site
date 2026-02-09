import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { z } from 'zod'
import {
  getChatSystemPrompt,
  getSuggestedQuestions,
  CHAT_SYSTEM_PROMPT,
  SUGGESTED_QUESTIONS,
  buildChatUserContext,
} from '@/app/(sdlp)/system-dev-lp/lib/ai/chat-prompts'
import { isValidServiceType } from '@/lib/services/config'
import { checkRateLimit } from '../rate-limit'

const MAX_MESSAGES = 20
const MAX_TOTAL_CHARS = 15000

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  chatContext: z.string().max(5000),
  serviceType: z.string().default('custom-dev'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(1000),
      }),
    )
    .max(MAX_MESSAGES),
})

function useAnthropic(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

function createAnthropicStream(
  systemPrompt: string,
  chatContext: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  message: string,
) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const messages: Anthropic.MessageParam[] = [
    ...history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: message },
  ]

  return anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    system: `${systemPrompt}\n\n${buildChatUserContext(chatContext)}`,
    messages,
    max_tokens: 300,
    temperature: 0.7,
  })
}

async function createOpenAIStream(
  systemPrompt: string,
  chatContext: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  message: string,
) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `${systemPrompt}\n\n${buildChatUserContext(chatContext)}`,
    },
    ...history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ]

  return openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 300,
    temperature: 0.7,
    stream: true,
  })
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    const { allowed } = checkRateLimit(ip, 'chat')
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const body = await request.json()
    const parsed = chatSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: parsed.error.issues[0]?.message ?? 'バリデーションエラー',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const { message, chatContext, serviceType, history } = parsed.data

    const totalChars =
      message.length +
      chatContext.length +
      history.reduce((sum, m) => sum + m.content.length, 0)
    if (totalChars > MAX_TOTAL_CHARS) {
      return new Response(
        JSON.stringify({ error: 'Request payload too large' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (history.length >= MAX_MESSAGES) {
      return new Response(
        JSON.stringify({
          error: 'チャットの上限に達しました。詳細はお問い合わせください。',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const systemPrompt = isValidServiceType(serviceType)
      ? getChatSystemPrompt(serviceType)
      : CHAT_SYSTEM_PROMPT

    const suggestedQs = isValidServiceType(serviceType)
      ? getSuggestedQuestions(serviceType)
      : SUGGESTED_QUESTIONS

    const encoder = new TextEncoder()

    if (useAnthropic()) {
      const stream = createAnthropicStream(systemPrompt, chatContext, history, message)

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                const content = event.delta.text
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
                  )
                }
              }
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ done: true, suggestedQuestions: suggestedQs.slice(0, 3) })}\n\n`,
              ),
            )
            controller.close()
          } catch {
            controller.close()
          }
        },
        cancel() {},
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Fallback: OpenAI
    const stream = await createOpenAIStream(systemPrompt, chatContext, history, message)

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
              )
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, suggestedQuestions: suggestedQs.slice(0, 3) })}\n\n`,
            ),
          )
          controller.close()
        } catch {
          controller.close()
        }
      },
      cancel() {},
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Chat service error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
