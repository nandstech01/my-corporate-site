-- Add ML columns to linkedin_post_analytics for storing prediction data
ALTER TABLE linkedin_post_analytics
  ADD COLUMN IF NOT EXISTS ml_features JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ml_prediction FLOAT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ml_confidence FLOAT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ml_model_version TEXT DEFAULT NULL;
