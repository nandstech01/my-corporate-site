'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, ArrowLeft, MessageCircle } from 'lucide-react'
import type { ChatMessage } from '../lib/ai/types'
import { SUGGESTED_QUESTIONS } from '../lib/ai/chat-prompts'

interface ProposalChatProps {
  chatContext: string
  onBack: () => void
}

const MAX_MESSAGES = 20

export default function ProposalChat({
  chatContext,
  onBack,
}: ProposalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>(
    SUGGESTED_QUESTIONS.slice(0, 3),
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return
      if (messages.length >= MAX_MESSAGES) return

      const userMessage: ChatMessage = { role: 'user', content: text.trim() }
      const currentMessages = [...messages, userMessage]
      setMessages(currentMessages)
      setInput('')
      setSuggestions([])
      setIsStreaming(true)

      try {
        const response = await fetch('/api/system-dev-proposal/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            chatContext,
            history: messages,
          }),
        })

        if (!response.ok) {
          throw new Error('Chat request failed')
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let assistantContent = ''

        setMessages([
          ...currentMessages,
          { role: 'assistant', content: '' },
        ])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

          for (const line of lines) {
            const json = JSON.parse(line.slice(6))
            if (json.content) {
              assistantContent += json.content
              setMessages([
                ...currentMessages,
                { role: 'assistant', content: assistantContent },
              ])
            }
            if (json.done && json.suggestedQuestions) {
              setSuggestions(json.suggestedQuestions)
            }
          }
        }
      } catch {
        setMessages([
          ...currentMessages,
          {
            role: 'assistant',
            content:
              '申し訳ございません。一時的にエラーが発生しました。もう一度お試しください。',
          },
        ])
      } finally {
        setIsStreaming(false)
        inputRef.current?.focus()
      }
    },
    [messages, isStreaming, chatContext],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const atLimit = messages.filter((m) => m.role === 'user').length >= MAX_MESSAGES / 2

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-2xl bg-white shadow-lg border border-sdlp-border overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-sdlp-border p-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-sdlp-text-secondary hover:text-sdlp-text transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            提案書に戻る
          </button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4 text-sdlp-primary" />
              <span className="text-sm font-semibold text-sdlp-text">
                AIコンサルタント
              </span>
            </div>
          </div>
          <div className="w-20" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-10 w-10 text-sdlp-primary/30 mx-auto mb-3" />
              <p className="text-sm text-sdlp-text-secondary mb-4">
                提案書の内容について何でもご質問ください
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-sdlp-primary text-white'
                    : 'bg-gray-100 text-sdlp-text'
                }`}
              >
                {msg.content || (
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !isStreaming && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="text-xs rounded-full border border-sdlp-border px-3 py-1.5 text-sdlp-text-secondary hover:border-sdlp-primary hover:text-sdlp-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-sdlp-border p-4">
          {atLimit ? (
            <div className="text-center">
              <p className="text-sm text-sdlp-text-secondary mb-2">
                チャットの上限に達しました
              </p>
              <a
                href="mailto:contact@nands.tech"
                className="inline-flex items-center gap-2 rounded-xl bg-sdlp-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors"
              >
                NANDSに直接問い合わせる
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="質問を入力..."
                disabled={isStreaming}
                className="flex-1 rounded-xl border-2 border-sdlp-border px-4 py-2.5 text-sm text-sdlp-text placeholder:text-gray-400 focus:border-sdlp-primary focus:outline-none focus:ring-1 focus:ring-sdlp-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="rounded-xl bg-sdlp-primary px-4 py-2.5 text-white hover:bg-sdlp-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  )
}
