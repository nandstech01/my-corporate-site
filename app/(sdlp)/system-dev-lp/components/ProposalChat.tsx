'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, Bot } from 'lucide-react'
import type { ChatMessage } from '../lib/ai/types'
import { getSuggestedQuestions, SUGGESTED_QUESTIONS } from '../lib/ai/chat-prompts'
import { isValidServiceType } from '@/lib/services/config'
import type { ServiceType } from '@/lib/services/types'
import { fadeInUp, DURATION, EASE, STAGGER } from '@/lib/motion'

interface ProposalChatProps {
  chatContext: string
  serviceType?: ServiceType
  onBack: () => void
}

const MAX_MESSAGES = 20

const messageVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.fast, ease: EASE },
  },
}

const suggestionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * STAGGER, duration: DURATION.fast, ease: EASE },
  }),
}

export default function ProposalChat({
  chatContext,
  serviceType = 'custom-dev',
  onBack,
}: ProposalChatProps) {
  const initialSuggestions = isValidServiceType(serviceType)
    ? getSuggestedQuestions(serviceType).slice(0, 3)
    : SUGGESTED_QUESTIONS.slice(0, 3)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions)
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
            serviceType,
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
            try {
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
            } catch {
              // Ignore malformed SSE chunks (can happen at chunk boundaries)
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
    [messages, isStreaming, chatContext, serviceType],
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
      transition={{ duration: DURATION.normal, ease: EASE }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-2xl bg-white shadow-lg border border-sdlp-border overflow-hidden flex flex-col h-[calc(100vh-160px)] max-h-[600px] min-h-[400px]">
        {/* Brand accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-sdlp-border p-4 bg-gradient-to-r from-sdlp-bg-card to-white">
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ x: -2 }}
            className="flex items-center gap-1 text-sm text-sdlp-text-secondary hover:text-sdlp-text transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            提案書に戻る
          </motion.button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="relative">
                <Bot className="h-4 w-4 text-sdlp-primary" />
                <motion.div
                  className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-sm font-semibold text-sdlp-text">
                AIコンサルタント
              </span>
            </div>
          </div>
          <div className="w-20" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.normal, ease: EASE }}
                className="text-center py-8"
              >
                <Bot className="h-12 w-12 text-sdlp-primary/20 mx-auto mb-3" />
                <p className="text-sm font-medium text-sdlp-text mb-1">
                  AIコンサルタントに相談
                </p>
                <p className="text-xs text-sdlp-text-secondary">
                  提案書の内容について何でもご質問ください
                </p>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mr-2 mt-1">
                    <div className="h-6 w-6 rounded-full bg-sdlp-primary/10 flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5 text-sdlp-primary" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sdlp-primary text-white rounded-br-md'
                      : 'bg-sdlp-bg-card text-sdlp-text rounded-bl-md'
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-1.5 py-1">
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full bg-sdlp-primary/40"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full bg-sdlp-primary/40"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full bg-sdlp-primary/40"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-2 flex flex-wrap gap-2"
            >
              {suggestions.map((q, i) => (
                <motion.button
                  key={q}
                  custom={i}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  type="button"
                  onClick={() => sendMessage(q)}
                  whileHover={{ scale: 1.03, borderColor: 'var(--sdlp-primary)' }}
                  whileTap={{ scale: 0.97 }}
                  className="text-xs rounded-full border border-sdlp-border px-3 py-1.5 text-sdlp-text-secondary hover:border-sdlp-primary hover:text-sdlp-primary transition-colors"
                >
                  {q}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="border-t border-sdlp-border p-4 bg-white">
          {atLimit ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-sm text-sdlp-text-secondary mb-2">
                チャットの上限に達しました
              </p>
              <motion.a
                href="mailto:contact@nands.tech"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-xl bg-sdlp-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors"
              >
                NANDSに直接問い合わせる
              </motion.a>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="質問を入力..."
                disabled={isStreaming}
                className="flex-1 rounded-xl border-2 border-sdlp-border px-4 py-2.5 text-sm text-sdlp-text placeholder:text-sdlp-text-secondary/50 focus:border-sdlp-primary focus:outline-none focus:ring-1 focus:ring-sdlp-primary disabled:opacity-50 transition-colors"
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isStreaming}
                whileHover={input.trim() && !isStreaming ? { scale: 1.05 } : {}}
                whileTap={input.trim() && !isStreaming ? { scale: 0.95 } : {}}
                className="rounded-xl bg-sdlp-primary px-4 py-2.5 text-white hover:bg-sdlp-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  )
}
