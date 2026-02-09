-- Add service_type to system_dev_leads
ALTER TABLE system_dev_leads ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'custom-dev';
ALTER TABLE system_dev_leads DROP CONSTRAINT IF EXISTS check_service_type_leads;
ALTER TABLE system_dev_leads ADD CONSTRAINT check_service_type_leads
  CHECK (service_type IN ('homepage', 'efficiency', 'custom-dev', 'ai-integration'));

-- Add service_type and lead scoring columns to system_dev_proposals
ALTER TABLE system_dev_proposals ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'custom-dev';
ALTER TABLE system_dev_proposals DROP CONSTRAINT IF EXISTS check_service_type_proposals;
ALTER TABLE system_dev_proposals ADD CONSTRAINT check_service_type_proposals
  CHECK (service_type IN ('homepage', 'efficiency', 'custom-dev', 'ai-integration'));

ALTER TABLE system_dev_proposals ADD COLUMN IF NOT EXISTS lead_score INTEGER;
ALTER TABLE system_dev_proposals ADD COLUMN IF NOT EXISTS lead_tier TEXT;
ALTER TABLE system_dev_proposals DROP CONSTRAINT IF EXISTS check_lead_tier;
ALTER TABLE system_dev_proposals ADD CONSTRAINT check_lead_tier
  CHECK (lead_tier IS NULL OR lead_tier IN ('hot', 'warm', 'cold'));

ALTER TABLE system_dev_proposals ADD COLUMN IF NOT EXISTS urgency_flag BOOLEAN DEFAULT false;
ALTER TABLE system_dev_proposals ADD COLUMN IF NOT EXISTS follow_up_strategy JSONB DEFAULT '{}';

-- Create index for querying by service_type
CREATE INDEX IF NOT EXISTS idx_leads_service_type ON system_dev_leads (service_type);
CREATE INDEX IF NOT EXISTS idx_proposals_service_type ON system_dev_proposals (service_type);
CREATE INDEX IF NOT EXISTS idx_proposals_lead_tier ON system_dev_proposals (lead_tier);
