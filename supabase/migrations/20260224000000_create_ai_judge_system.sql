-- AI Judge System Tables

-- AI Judge判断ログ
CREATE TABLE ai_judge_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pending_action_id UUID REFERENCES slack_pending_actions(id),
  platform TEXT NOT NULL CHECK (platform IN ('x', 'linkedin', 'instagram')),
  post_text TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'edit', 'reject')),
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT NOT NULL,
  safety_flags TEXT[] DEFAULT '{}',
  edit_suggestion TEXT,
  topic_relevance FLOAT,
  auto_resolved BOOLEAN DEFAULT false,
  model_used TEXT NOT NULL,
  latency_ms INT,
  was_posted BOOLEAN DEFAULT false,
  post_id TEXT,
  actual_engagement JSONB,
  prediction_error FLOAT,
  created_at TIMESTAMPTZ DEFAULT now(),
  posted_at TIMESTAMPTZ,
  engagement_fetched_at TIMESTAMPTZ
);

-- 安全イベント（災害/炎上時の自動停止）
CREATE TABLE safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('disaster','controversy','platform_outage','manual_pause')),
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium')),
  platforms_affected TEXT[] NOT NULL DEFAULT '{x,linkedin,instagram}',
  keywords TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- NGワードリスト
CREATE TABLE safety_ng_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('block','flag')),
  category TEXT NOT NULL CHECK (category IN ('profanity','competitor','legal','sensitivity')),
  platform TEXT[] DEFAULT '{x,linkedin,instagram}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- バズ投稿DB（外部高パフォーマンス投稿）
CREATE TABLE buzz_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('x','linkedin')),
  external_post_id TEXT,
  author_handle TEXT,
  post_text TEXT NOT NULL,
  language TEXT DEFAULT 'ja',
  likes INT DEFAULT 0,
  reposts INT DEFAULT 0,
  replies INT DEFAULT 0,
  impressions INT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  topic_category TEXT,
  hook_pattern TEXT,
  tone TEXT,
  content_type TEXT,
  extracted_patterns JSONB,
  buzz_score FLOAT DEFAULT 0,
  relevance_score FLOAT DEFAULT 0,
  collected_at TIMESTAMPTZ DEFAULT now(),
  post_date TIMESTAMPTZ
);

-- パターンパフォーマンス（Multi-Armed Bandit用）
CREATE TABLE pattern_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('x','linkedin','instagram')),
  successes INT DEFAULT 0,
  failures INT DEFAULT 0,
  total_uses INT DEFAULT 0,
  avg_engagement FLOAT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pattern_id, platform)
);

-- 予測精度追跡
CREATE TABLE prediction_accuracy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_decision_id UUID REFERENCES ai_judge_decisions(id),
  platform TEXT NOT NULL,
  post_id TEXT NOT NULL,
  predicted_engagement FLOAT NOT NULL,
  actual_engagement FLOAT NOT NULL,
  absolute_error FLOAT NOT NULL,
  percentage_error FLOAT NOT NULL,
  model_version TEXT NOT NULL,
  pattern_used TEXT,
  posted_at TIMESTAMPTZ NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- モデルドリフトログ
CREATE TABLE model_drift_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  model_version TEXT NOT NULL,
  date DATE NOT NULL,
  rolling_mae FLOAT NOT NULL,
  training_mae FLOAT NOT NULL,
  sample_count INT NOT NULL,
  is_drifted BOOLEAN DEFAULT false,
  retrain_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(platform, model_version, date)
);

-- 安全異常ログ
CREATE TABLE safety_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_decision_id UUID REFERENCES ai_judge_decisions(id),
  platform TEXT NOT NULL,
  post_id TEXT NOT NULL,
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('negative_spike','engagement_cliff','prediction_miss','sentiment_negative')),
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  details JSONB NOT NULL,
  resolved BOOLEAN DEFAULT false,
  auto_action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 学習パイプラインイベント
CREATE TABLE learning_pipeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('engagement_update','high_performer','low_performer','pattern_success','pattern_failure')),
  platform TEXT NOT NULL,
  post_id TEXT NOT NULL,
  data JSONB NOT NULL,
  processed_by_retrainer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 既存テーブル拡張
ALTER TABLE slack_bot_memory ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMPTZ;
ALTER TABLE slack_bot_memory ADD COLUMN IF NOT EXISTS validation_score FLOAT DEFAULT 0;
ALTER TABLE blog_topic_queue ADD COLUMN IF NOT EXISTS judge_action TEXT;
ALTER TABLE blog_topic_queue ADD COLUMN IF NOT EXISTS judge_confidence FLOAT;
ALTER TABLE blog_topic_queue ADD COLUMN IF NOT EXISTS judge_reasons JSONB;
ALTER TABLE blog_topic_queue ADD COLUMN IF NOT EXISTS auto_approved_at TIMESTAMPTZ;

-- RLS
ALTER TABLE ai_judge_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_ng_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE buzz_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_accuracy ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_drift_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_pipeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_ai_judge_decisions ON ai_judge_decisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_safety_events ON safety_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_safety_ng_words ON safety_ng_words FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_buzz_posts ON buzz_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_pattern_performance ON pattern_performance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_prediction_accuracy ON prediction_accuracy FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_model_drift_log ON model_drift_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_safety_anomalies ON safety_anomalies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_learning_pipeline_events ON learning_pipeline_events FOR ALL USING (true) WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX idx_ai_judge_decisions_platform_created ON ai_judge_decisions(platform, created_at DESC);
CREATE INDEX idx_ai_judge_decisions_was_posted ON ai_judge_decisions(was_posted) WHERE was_posted = true;
CREATE INDEX idx_safety_events_active ON safety_events(active) WHERE active = true;
CREATE INDEX idx_safety_ng_words_active ON safety_ng_words(active) WHERE active = true;
CREATE INDEX idx_buzz_posts_platform_score ON buzz_posts(platform, buzz_score DESC);
CREATE INDEX idx_pattern_performance_platform ON pattern_performance(platform, pattern_id);
CREATE INDEX idx_prediction_accuracy_platform ON prediction_accuracy(platform, measured_at DESC);
CREATE INDEX idx_learning_pipeline_events_unprocessed ON learning_pipeline_events(processed_by_retrainer) WHERE processed_by_retrainer = false;
