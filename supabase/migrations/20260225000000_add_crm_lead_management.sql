-- Add CRM fields to system_dev_leads
ALTER TABLE public.system_dev_leads
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  ADD COLUMN IF NOT EXISTS assigned_to TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lead_score INTEGER,
  ADD COLUMN IF NOT EXISTS lead_tier TEXT,
  ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'custom-dev',
  ADD COLUMN IF NOT EXISTS utm_source TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS utm_medium TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS proposal_id UUID,
  ADD COLUMN IF NOT EXISTS request_id TEXT;

-- Unique constraint for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_dev_leads_request_id
  ON public.system_dev_leads(request_id) WHERE request_id IS NOT NULL;

-- Index for CRM queries
CREATE INDEX IF NOT EXISTS idx_system_dev_leads_status ON public.system_dev_leads(status);
CREATE INDEX IF NOT EXISTS idx_system_dev_leads_lead_tier ON public.system_dev_leads(lead_tier);

-- Service role can update leads (for CRM)
CREATE POLICY "Service role can update leads"
  ON public.system_dev_leads
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Lead activities log
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.system_dev_leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('status_change', 'note_added', 'email_sent', 'call_made', 'meeting_scheduled', 'proposal_viewed', 'follow_up_created')),
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage activities"
  ON public.lead_activities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created_at ON public.lead_activities(created_at DESC);

-- Lead follow-up tasks
CREATE TABLE IF NOT EXISTS public.lead_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.system_dev_leads(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('call', 'email', 'meeting', 'proposal', 'other')),
  description TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lead_follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage follow-ups"
  ON public.lead_follow_ups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_lead_follow_ups_lead_id ON public.lead_follow_ups(lead_id);
CREATE INDEX idx_lead_follow_ups_due_at ON public.lead_follow_ups(due_at) WHERE completed_at IS NULL;

-- Lead email sequences tracking
CREATE TABLE IF NOT EXISTS public.lead_email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.system_dev_leads(id) ON DELETE CASCADE,
  sequence_key TEXT NOT NULL,
  current_step INTEGER DEFAULT 0,
  next_send_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lead_email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage sequences"
  ON public.lead_email_sequences
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE UNIQUE INDEX idx_lead_email_sequences_lead_key
  ON public.lead_email_sequences(lead_id, sequence_key);
CREATE INDEX idx_lead_email_sequences_next_send
  ON public.lead_email_sequences(next_send_at) WHERE status = 'active';
