-- 1. blog_topic_queue: RSS → Slack notification pipeline
CREATE TABLE blog_topic_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_feed TEXT NOT NULL,          -- 'openai_blog', 'anthropic_blog', etc.
  source_url TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_published_at TIMESTAMPTZ,
  suggested_topic TEXT,               -- LLM-suggested angle
  suggested_keyword TEXT,
  buzz_score INTEGER DEFAULT 0,       -- 0-100
  buzz_breakdown JSONB,               -- {freshness:20, authority:20, ...}
  status TEXT DEFAULT 'new',          -- new/notified/approved/dismissed
  slack_message_ts TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. blog_jobs: Generation pipeline tracking
CREATE TABLE blog_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_queue_id UUID REFERENCES blog_topic_queue(id),
  topic TEXT NOT NULL,
  target_keyword TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  business_category TEXT DEFAULT 'ai-technology',
  status TEXT DEFAULT 'queued',       -- queued/running/post_processing/completed/failed
  current_step TEXT,                  -- scrape/research/rag/generate/ml_score/post_process/publish
  progress_pct INTEGER DEFAULT 0,
  ml_score REAL,
  ml_breakdown JSONB,
  retry_count INTEGER DEFAULT 0,
  generation_model TEXT,
  post_id INTEGER,                    -- Generated post ID
  error_message TEXT,
  gcp_job_id TEXT,                    -- Cloud Run Job execution ID
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. gsc_page_metrics: GSC daily data
CREATE TABLE gsc_page_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  position REAL DEFAULT 0,
  queries JSONB,                      -- [{query, clicks, impressions, ctr, position}]
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_path, date)
);

-- 4. blog_ml_training_data: ML training data
CREATE TABLE blog_ml_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER NOT NULL,
  post_slug TEXT NOT NULL,
  features JSONB NOT NULL,            -- 34 features
  seo_score REAL,                     -- GSC-derived
  aio_score REAL,
  combined_score REAL,
  labeled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. blog_ml_models: Model registry
CREATE TABLE blog_ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_type TEXT NOT NULL,           -- 'xgboost_seo', 'lightgbm_aio', 'ensemble'
  model_version TEXT NOT NULL,
  training_size INTEGER,
  mae REAL,
  rmse REAL,
  r2_score REAL,
  feature_importance JSONB,
  is_active BOOLEAN DEFAULT false,
  mlflow_run_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_topic_queue_status ON blog_topic_queue(status, created_at DESC);
CREATE INDEX idx_blog_jobs_status ON blog_jobs(status, created_at DESC);
CREATE INDEX idx_gsc_page_date ON gsc_page_metrics(page_path, date DESC);
CREATE INDEX idx_ml_training_post ON blog_ml_training_data(post_id);
CREATE INDEX idx_ml_models_active ON blog_ml_models(model_type, is_active);

-- RLS
ALTER TABLE blog_topic_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_page_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_ml_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_ml_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_all_blog_topic_queue ON blog_topic_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_blog_jobs ON blog_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_gsc_page_metrics ON gsc_page_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_blog_ml_training ON blog_ml_training_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_blog_ml_models ON blog_ml_models FOR ALL USING (true) WITH CHECK (true);
