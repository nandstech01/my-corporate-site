-- Add predicted engagement rate column for proper calibration
-- Previously the calibrator used confidence (0-1 judge certainty) as predicted engagement,
-- but actual engagement is (likes + reposts*2 + replies*3) / impressions - a different metric.
ALTER TABLE ai_judge_decisions
  ADD COLUMN IF NOT EXISTS predicted_engagement_rate FLOAT;
