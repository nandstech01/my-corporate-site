CREATE TABLE public.system_dev_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.system_dev_leads(id),
  questionnaire_answers JSONB NOT NULL,
  formula_estimate JSONB NOT NULL,
  ai_proposal_markdown TEXT,
  ai_teaser TEXT,
  complexity_tier TEXT,
  chat_context TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_dev_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.system_dev_proposals
  FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE public.system_dev_proposals
  ADD CONSTRAINT check_complexity_tier
    CHECK (complexity_tier IS NULL OR complexity_tier IN ('S', 'M', 'L', 'XL'));

ALTER TABLE public.system_dev_proposals
  ADD CONSTRAINT check_positive_tokens
    CHECK (prompt_tokens >= 0 AND completion_tokens >= 0);

COMMENT ON TABLE public.system_dev_proposals IS 'AI-generated development proposals from the system-dev-lp questionnaire funnel';
