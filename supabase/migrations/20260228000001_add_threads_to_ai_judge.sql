-- ai_judge_decisions の platform CHECK制約に 'threads' を追加
ALTER TABLE ai_judge_decisions
  DROP CONSTRAINT IF EXISTS ai_judge_decisions_platform_check;
ALTER TABLE ai_judge_decisions
  ADD CONSTRAINT ai_judge_decisions_platform_check
  CHECK (platform IN ('x', 'linkedin', 'instagram', 'blog', 'threads'));
