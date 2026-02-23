-- Phase 3: Safety Framework + Blog Auto-Generation
-- Adds L1/L2/L4 safety layers, cross-platform learning, blog judge support

-- ai_judge_decisions: 'blog' プラットフォーム追加
ALTER TABLE ai_judge_decisions DROP CONSTRAINT IF EXISTS ai_judge_decisions_platform_check;
ALTER TABLE ai_judge_decisions ADD CONSTRAINT ai_judge_decisions_platform_check
  CHECK (platform IN ('x', 'linkedin', 'instagram', 'blog'));

-- pattern_performance: クロスプラットフォーム追跡
ALTER TABLE pattern_performance ADD COLUMN IF NOT EXISTS cross_platform_source TEXT;

-- safety_events: 自動検出メタデータ
ALTER TABLE safety_events ADD COLUMN IF NOT EXISTS auto_detected BOOLEAN DEFAULT false;
ALTER TABLE safety_events ADD COLUMN IF NOT EXISTS detection_source TEXT;

-- learning_pipeline_events: クロス学習イベント追加
ALTER TABLE learning_pipeline_events DROP CONSTRAINT IF EXISTS learning_pipeline_events_event_type_check;
ALTER TABLE learning_pipeline_events ADD CONSTRAINT learning_pipeline_events_event_type_check
  CHECK (event_type IN (
    'engagement_update','high_performer','low_performer',
    'pattern_success','pattern_failure','cross_platform_transfer'));

-- インデックス: 安全イベント高速検索
CREATE INDEX IF NOT EXISTS idx_safety_events_type_active
  ON safety_events(event_type, active) WHERE active = true;
