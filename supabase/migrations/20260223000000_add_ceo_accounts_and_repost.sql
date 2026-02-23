-- Add CEO personal accounts and Google DeepMind for monitoring
-- Phase 4.1: Expand monitored accounts + repost support

-- 0. Fix x_user_id UNIQUE constraint (allow multiple unresolved empty strings)
ALTER TABLE x_monitored_accounts DROP CONSTRAINT IF EXISTS x_monitored_accounts_x_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS x_monitored_accounts_x_user_id_unique
  ON x_monitored_accounts(x_user_id) WHERE x_user_id != '';
CREATE UNIQUE INDEX IF NOT EXISTS x_monitored_accounts_username_unique
  ON x_monitored_accounts(username);

-- 1. Insert missing original accounts (from Phase 4 seed that failed due to UNIQUE)
INSERT INTO x_monitored_accounts (x_user_id, username, display_name, category, monitor_priority)
VALUES
  ('', 'AnthropicAI', 'Anthropic', 'ai_company', 1),
  ('', 'OpenClaw_', 'OpenClaw', 'ai_company', 2)
ON CONFLICT DO NOTHING;

-- 2. Add CEO personal accounts and Google DeepMind
-- NOTE: x_user_id will be resolved at first monitor run via v2.userByUsername()
INSERT INTO x_monitored_accounts (x_user_id, username, display_name, category, monitor_priority)
VALUES
  ('', 'sama', 'Sam Altman', 'ceo', 1),
  ('', 'DarioAmodei', 'Dario Amodei', 'ceo', 1),
  ('', 'sundarpichai', 'Sundar Pichai', 'ceo', 2),
  ('', 'GoogleDeepMind', 'Google DeepMind', 'ai_company', 2)
ON CONFLICT DO NOTHING;

-- 3. Extend x_quote_opportunities status to include 'retweeted'
ALTER TABLE x_quote_opportunities DROP CONSTRAINT IF EXISTS x_quote_opportunities_status_check;
ALTER TABLE x_quote_opportunities ADD CONSTRAINT x_quote_opportunities_status_check
  CHECK (status IN ('pending','generating','ready','posted','expired','skipped','retweeted'));

-- 4. Extend x_post_analytics post_type to include 'repost'
ALTER TABLE x_post_analytics DROP CONSTRAINT IF EXISTS x_post_analytics_post_type_check;
ALTER TABLE x_post_analytics ADD CONSTRAINT x_post_analytics_post_type_check
  CHECK (post_type IN ('original','quote','thread','reply','repost'));
