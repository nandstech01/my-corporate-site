/**
 * GA4 Event Tracking for System Dev LP funnel
 *
 * Events tracked:
 * - sdlp_questionnaire_start: User begins questionnaire
 * - sdlp_step_complete: User completes a question step
 * - sdlp_step_skip: User skips a question
 * - sdlp_proposal_generated: AI proposal successfully generated
 * - sdlp_email_submitted: User submits email at gate
 * - sdlp_email_skipped: User skips email gate
 * - sdlp_calendly_opened: User opens Calendly booking
 * - sdlp_chat_started: User starts proposal chat
 */

type GtagEvent = {
  action: string
  category?: string
  label?: string
  value?: number
  [key: string]: unknown
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function trackEvent({ action, category = 'sdlp_funnel', label, value, ...rest }: GtagEvent): void {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  })
}

export function trackQuestionnaireStart(serviceType: string): void {
  trackEvent({ action: 'sdlp_questionnaire_start', label: serviceType })
}

export function trackStepComplete(step: number, field: string, serviceType: string): void {
  trackEvent({ action: 'sdlp_step_complete', label: field, value: step, service_type: serviceType })
}

export function trackStepSkip(step: number, field: string): void {
  trackEvent({ action: 'sdlp_step_skip', label: field, value: step })
}

export function trackProposalGenerated(serviceType: string, generationTimeMs: number, complexityTier: string): void {
  trackEvent({
    action: 'sdlp_proposal_generated',
    label: serviceType,
    value: generationTimeMs,
    complexity_tier: complexityTier,
  })
}

export function trackEmailSubmitted(serviceType: string, leadTier?: string): void {
  trackEvent({ action: 'sdlp_email_submitted', label: serviceType, lead_tier: leadTier })
}

export function trackEmailSkipped(serviceType: string): void {
  trackEvent({ action: 'sdlp_email_skipped', label: serviceType })
}

export function trackCalendlyOpened(serviceType: string): void {
  trackEvent({ action: 'sdlp_calendly_opened', label: serviceType })
}

export function trackChatStarted(serviceType: string): void {
  trackEvent({ action: 'sdlp_chat_started', label: serviceType })
}
