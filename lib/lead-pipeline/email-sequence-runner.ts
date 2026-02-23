/**
 * Email sequence runner - executed by cron job
 * Checks for sequences with next_send_at <= now and sends the next email
 */

import { createClient } from '@supabase/supabase-js'
import { EMAIL_SEQUENCES } from './email-sequences'

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Supabase configuration missing')
  }
  return createClient(url, serviceKey)
}

export async function runEmailSequences(): Promise<void> {
  const supabase = createSupabaseAdmin()

  // Find active sequences due for sending
  const { data: dueSequences, error } = await supabase
    .from('lead_email_sequences')
    .select('*, lead:lead_id(email, lead_tier, service_type)')
    .eq('status', 'active')
    .lte('next_send_at', new Date().toISOString())
    .order('next_send_at', { ascending: true })
    .limit(50)

  if (error) {
    throw new Error(`Failed to fetch due sequences: ${error.message}`)
  }

  if (!dueSequences || dueSequences.length === 0) {
    process.stdout.write('Email sequences: no sequences due for sending\n')
    return
  }

  process.stdout.write(`Email sequences: ${dueSequences.length} sequence(s) due for sending\n`)

  for (const seq of dueSequences) {
    try {
      const sequenceDef = EMAIL_SEQUENCES[seq.sequence_key.replace('_nurture', '')]
      if (!sequenceDef) {
        process.stdout.write(`Email sequences: unknown sequence key '${seq.sequence_key}', skipping\n`)
        continue
      }

      const currentStep = seq.current_step ?? 0
      const stepDef = sequenceDef.steps[currentStep]
      if (!stepDef) {
        // Sequence completed
        await supabase
          .from('lead_email_sequences')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', seq.id)
        process.stdout.write(`Email sequences: sequence ${seq.id} completed\n`)
        continue
      }

      const leadEmail = (seq.lead as { email?: string })?.email
      if (!leadEmail) {
        process.stdout.write(`Email sequences: no email for lead ${seq.lead_id}, skipping\n`)
        continue
      }

      // TODO: Send actual email using emailService.sendProposalEmail()
      // For now, log the intent
      process.stdout.write(
        `Email sequences: would send step ${currentStep} (${stepDef.templateKey}) to ${leadEmail}\n`
      )

      // Calculate next step timing
      const nextStep = currentStep + 1
      const nextStepDef = sequenceDef.steps[nextStep]
      const nextSendAt = nextStepDef
        ? new Date(Date.now() + (nextStepDef.dayOffset - stepDef.dayOffset) * 24 * 60 * 60 * 1000).toISOString()
        : null

      await supabase
        .from('lead_email_sequences')
        .update({
          current_step: nextStep,
          next_send_at: nextSendAt,
          status: nextStepDef ? 'active' : 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', seq.id)

      // Log activity
      await supabase.from('lead_activities').insert({
        lead_id: seq.lead_id,
        activity_type: 'email_sent',
        description: `Drip email sent: ${stepDef.description}`,
        metadata: { sequence_key: seq.sequence_key, step: currentStep, template: stepDef.templateKey },
      })

    } catch (stepError) {
      const message = stepError instanceof Error ? stepError.message : 'Unknown error'
      process.stderr.write(`Email sequences: error processing sequence ${seq.id}: ${message}\n`)
    }
  }
}
