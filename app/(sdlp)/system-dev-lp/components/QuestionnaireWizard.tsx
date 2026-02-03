'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, SkipForward, Mail, Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import StepProgressBar from './StepProgressBar'
import QuestionCard from './QuestionCard'
import ButtonGrid from './ButtonGrid'
import CheckboxGroup from './CheckboxGroup'
import EstimateLoading from './EstimateLoading'
import { questionnaireSteps, TOTAL_STEPS } from '../lib/questionnaireConfig'
import { calculateEstimate, formatPrice } from '../lib/estimateCalculator'
import type { QuestionnaireAnswers, EstimateResult } from '../lib/types'

const initialAnswers: QuestionnaireAnswers = {
  systemOverview: '',
  industry: '',
  employeeCount: '',
  systemDestination: '',
  systemType: '',
  features: [],
  specialRequirements: '',
  timeline: '',
  devices: [],
  budget: '',
  email: '',
}

type WizardPhase = 'questions' | 'loading' | 'email' | 'result'

export default function QuestionnaireWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(initialAnswers)
  const [phase, setPhase] = useState<WizardPhase>('questions')
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const step = questionnaireSteps[currentStep - 1]

  const handleVoiceResult = useCallback(
    (text: string) => {
      if (!step) return
      setAnswers((prev) => {
        const current = (prev[step.field] as string) || ''
        return { ...prev, [step.field]: current + text }
      })
    },
    [step],
  )

  const { isListening, isSupported, transcript, startListening, stopListening } =
    useSpeechRecognition(handleVoiceResult)

  const getFieldValue = useCallback(
    (field: keyof QuestionnaireAnswers): string | string[] => {
      return answers[field] as string | string[]
    },
    [answers],
  )

  const updateField = useCallback(
    (field: keyof QuestionnaireAnswers, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const toggleArrayField = useCallback(
    (field: keyof QuestionnaireAnswers, value: string) => {
      setAnswers((prev) => {
        const current = prev[field] as string[]
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value]
        return { ...prev, [field]: next }
      })
    },
    [],
  )

  const canProceed = useCallback((): boolean => {
    if (!step) return false
    const val = getFieldValue(step.field)
    if (!step.required) return true
    if (Array.isArray(val)) return val.length > 0
    return typeof val === 'string' && val.trim().length > 0
  }, [step, getFieldValue])

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // All steps done — show loading then email
      setPhase('loading')
      const result = calculateEstimate(answers)
      setEstimate(result)
      setTimeout(() => {
        setPhase('email')
      }, 2000)
    }
  }, [currentStep, answers])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    if (step?.skippable) {
      handleNext()
    }
  }, [step, handleNext])

  const handleSubmitEmail = useCallback(async () => {
    if (!answers.email || !estimate) return
    setSubmitting(true)
    try {
      await fetch('/api/system-dev-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          estimatedPrice: estimate.maxPrice,
          estimatedDuration: estimate.estimatedDuration,
        }),
      })
    } catch {
      // Silently handle - still show result
    }
    setSubmitting(false)
    setSubmitted(true)
    setPhase('result')
  }, [answers, estimate])

  const handleSkipEmail = useCallback(() => {
    setPhase('result')
  }, [])

  // Loading phase
  if (phase === 'loading') {
    return <EstimateLoading />
  }

  // Email input phase
  if (phase === 'email' && estimate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg border border-sdlp-border text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sdlp-primary/10 mb-4">
            <Mail className="h-7 w-7 text-sdlp-primary" />
          </div>
          <h2 className="text-xl font-bold text-sdlp-text mb-2">
            見積もり結果をお送りします
          </h2>
          <p className="text-sm text-sdlp-text-secondary mb-6">
            メールアドレスをご入力いただくと、詳細な見積もり結果をお送りします。
          </p>
          <input
            type="email"
            value={answers.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="example@company.co.jp"
            className="w-full rounded-xl border-2 border-sdlp-border px-4 py-3 text-sm text-sdlp-text placeholder:text-gray-400 focus:border-sdlp-primary focus:outline-none focus:ring-1 focus:ring-sdlp-primary mb-4"
          />
          <button
            type="button"
            onClick={handleSubmitEmail}
            disabled={!answers.email || submitting}
            className="w-full rounded-xl bg-sdlp-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '送信中...' : '見積もり結果を見る'}
          </button>
          <button
            type="button"
            onClick={handleSkipEmail}
            className="mt-3 text-sm text-sdlp-text-secondary hover:text-sdlp-text transition-colors"
          >
            メールアドレスなしで結果を見る
          </button>
        </div>
      </motion.div>
    )
  }

  // Result phase
  if (phase === 'result' && estimate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg border border-sdlp-border">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg
                className="h-7 w-7 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-sdlp-text mb-1">
              概算見積もり結果
            </h2>
            <p className="text-sm text-sdlp-text-secondary">
              以下はあくまで目安です。詳細はご相談ください。
            </p>
          </div>

          {/* Price */}
          <div className="rounded-xl bg-gradient-to-r from-sdlp-primary to-sdlp-accent p-6 text-center text-white mb-6">
            <div className="text-sm font-medium text-white/80 mb-1">
              概算費用
            </div>
            <div className="text-3xl font-bold">
              {formatPrice(estimate.minPrice)} 〜{' '}
              {formatPrice(estimate.maxPrice)}
            </div>
            <div className="text-sm text-white/70 mt-2">
              開発期間: {estimate.estimatedDuration}
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-sdlp-text">費用内訳</h3>
            {estimate.breakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-sdlp-text-secondary">{item.label}</span>
                <span className="font-medium text-sdlp-text">
                  {formatPrice(item.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <a
              href="mailto:contact@nands.tech"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-sdlp-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors"
            >
              メールで問い合わせる
            </a>
          </div>

          {submitted && (
            <p className="text-center text-xs text-green-600 mt-4">
              メールアドレスを登録しました。追って詳細をお送りします。
            </p>
          )}
        </div>
      </motion.div>
    )
  }

  // Questions phase
  const options =
    step?.dynamicOptions?.(answers) ?? step?.options ?? []

  return (
    <div className="w-full max-w-2xl mx-auto">
      <StepProgressBar currentStep={currentStep} />

      <div className="mt-8">
        <QuestionCard
          stepId={step.id}
          title={step.title}
          subtitle={step.subtitle}
        >
          {/* Textarea type */}
          {step.type === 'textarea' && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={getFieldValue(step.field) as string}
                  onChange={(e) => updateField(step.field, e.target.value)}
                  placeholder={step.placeholder}
                  maxLength={step.maxLength}
                  rows={4}
                  className={`w-full rounded-xl border-2 px-4 py-3 pr-12 text-sm text-sdlp-text placeholder:text-gray-400 focus:border-sdlp-primary focus:outline-none focus:ring-1 focus:ring-sdlp-primary resize-none transition-colors ${
                    isListening
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-sdlp-border'
                  }`}
                />
                {/* Mic button inside textarea */}
                {isSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                        : 'bg-sdlp-primary/10 text-sdlp-primary hover:bg-sdlp-primary/20'
                    }`}
                    aria-label={isListening ? '音声入力を停止' : '音声で入力'}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Interim transcript display */}
              {isListening && transcript && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <span className="opacity-70">認識中: </span>{transcript}
                </div>
              )}

              {/* Voice input hint */}
              {isSupported && !isListening && !(getFieldValue(step.field) as string) && (
                <div className="flex items-center gap-2 text-xs text-sdlp-text-secondary">
                  <Mic className="h-3.5 w-3.5" />
                  <span>マイクボタンで音声入力もできます</span>
                  <span className="rounded-full bg-sdlp-primary/10 px-2 py-0.5 text-[10px] font-semibold text-sdlp-primary">
                    おすすめ
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Button grid type */}
          {step.type === 'button-grid' && (
            <ButtonGrid
              options={options}
              selected={getFieldValue(step.field) as string}
              onSelect={(val) => {
                updateField(step.field, val)
                // Auto-advance on single select
                setTimeout(() => {
                  if (currentStep < TOTAL_STEPS) {
                    setCurrentStep((prev) => prev + 1)
                  } else {
                    setPhase('loading')
                    const result = calculateEstimate({
                      ...answers,
                      [step.field]: val,
                    })
                    setEstimate(result)
                    setTimeout(() => setPhase('email'), 2000)
                  }
                }, 300)
              }}
            />
          )}

          {/* Checkbox type */}
          {step.type === 'checkbox' && (
            <CheckboxGroup
              options={options}
              selected={getFieldValue(step.field) as string[]}
              onToggle={(val) => toggleArrayField(step.field, val)}
            />
          )}

          {/* Text input type */}
          {step.type === 'text' && (
            <input
              type="text"
              value={getFieldValue(step.field) as string}
              onChange={(e) => updateField(step.field, e.target.value)}
              placeholder={step.placeholder}
              className="w-full rounded-xl border-2 border-sdlp-border px-4 py-3 text-sm text-sdlp-text placeholder:text-gray-400 focus:border-sdlp-primary focus:outline-none focus:ring-1 focus:ring-sdlp-primary"
            />
          )}
        </QuestionCard>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between max-w-2xl mx-auto">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-1 text-sm font-medium text-sdlp-text-secondary hover:text-sdlp-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          戻る
        </button>

        <div className="flex items-center gap-3">
          {step?.skippable && (
            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center gap-1 text-sm text-sdlp-text-secondary hover:text-sdlp-text transition-colors"
            >
              <SkipForward className="h-4 w-4" />
              スキップ
            </button>
          )}

          {/* Show next button for non-button-grid types */}
          {step?.type !== 'button-grid' && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() && step?.required !== false}
              className="flex items-center gap-1 rounded-xl bg-sdlp-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === TOTAL_STEPS ? '結果を見る' : '次へ'}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
