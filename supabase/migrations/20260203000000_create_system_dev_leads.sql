-- System Development LP lead management table
CREATE TABLE IF NOT EXISTS public.system_dev_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_overview TEXT,
  industry TEXT,
  employee_count TEXT,
  system_destination TEXT,
  system_type TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  special_requirements TEXT,
  timeline TEXT,
  devices JSONB DEFAULT '[]'::jsonb,
  budget TEXT,
  email TEXT NOT NULL,
  estimated_price INTEGER,
  estimated_duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_dev_leads ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (from API route)
CREATE POLICY "Service role can insert leads"
  ON public.system_dev_leads
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role can read leads
CREATE POLICY "Service role can read leads"
  ON public.system_dev_leads
  FOR SELECT
  TO service_role
  USING (true);

-- Create index on email for lookups
CREATE INDEX idx_system_dev_leads_email ON public.system_dev_leads(email);
CREATE INDEX idx_system_dev_leads_created_at ON public.system_dev_leads(created_at DESC);
