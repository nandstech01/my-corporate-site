-- Fix learning system constraints
-- Bug 1: pattern_performance.platform missing 'threads' and 'blog'
-- Bug 2: learning_pipeline_events.event_type missing experiment/bayesian events
-- Bug 3: learning_pipeline_events.post_id NOT NULL blocks bayesian_transfer events

-- 1. pattern_performance: add 'threads' and 'blog' to platform check
ALTER TABLE pattern_performance
  DROP CONSTRAINT IF EXISTS pattern_performance_platform_check;
ALTER TABLE pattern_performance
  ADD CONSTRAINT pattern_performance_platform_check
    CHECK (platform IN ('x', 'linkedin', 'instagram', 'threads', 'blog'));

-- 2. learning_pipeline_events: add experiment and bayesian event types
ALTER TABLE learning_pipeline_events
  DROP CONSTRAINT IF EXISTS learning_pipeline_events_event_type_check;
ALTER TABLE learning_pipeline_events
  ADD CONSTRAINT learning_pipeline_events_event_type_check
    CHECK (event_type IN (
      'engagement_update', 'high_performer', 'low_performer',
      'pattern_success', 'pattern_failure', 'cross_platform_transfer',
      'experiment_created', 'experiment_outcome', 'experiment_concluded',
      'bayesian_transfer'
    ));

-- 3. learning_pipeline_events: make post_id nullable for bayesian_transfer events
ALTER TABLE learning_pipeline_events
  ALTER COLUMN post_id DROP NOT NULL;
