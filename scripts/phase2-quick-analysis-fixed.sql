-- ========================================
-- Phase 2小規模テスト - 主要KPI分析（修正版）
-- ========================================
-- テナントID: 2dec3290-5427-4874-a525-6265da5aa8f3
-- 実行日: 2026-01-10/11
-- 対象: Phase 2小規模テスト（5件）
-- ========================================

-- 1️⃣ 基本統計
SELECT
  '1. 基本統計' as analysis_type,
  COUNT(*) as total_analyses,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND(100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*), 2)
    ELSE 0
  END as success_rate_percent
FROM aso.client_analyses
WHERE created_at >= '2026-01-10'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid;

-- 2️⃣ 冪等性チェック（重複URL検出）
WITH url_counts AS (
  SELECT url, COUNT(*) as count
  FROM aso.client_analyses
  WHERE created_at >= '2026-01-10'
    AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
  GROUP BY url
  HAVING COUNT(*) > 1
)
SELECT
  '2. 冪等性チェック' as analysis_type,
  COALESCE(SUM(count - 1), 0) as duplicate_count,
  CASE 
    WHEN COALESCE(SUM(count - 1), 0) = 0 
    THEN '✅ 合格（重複なし）'
    ELSE '❌ 不合格（重複あり）'
  END as judgment
FROM url_counts;

-- 3️⃣ 最新5件の分析
SELECT
  '3. 最新5件' as analysis_type,
  id as analysis_id,
  url,
  status,
  ai_structure_score,
  created_at
FROM aso.client_analyses
WHERE created_at >= '2026-01-10'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
ORDER BY created_at DESC
LIMIT 5;

-- 4️⃣ AI構造化スコア
SELECT
  '4. AI構造化スコア' as analysis_type,
  COUNT(*) as total,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND(AVG(ai_structure_score), 2)
    ELSE NULL
  END as avg_score,
  MIN(ai_structure_score) as min_score,
  MAX(ai_structure_score) as max_score
FROM aso.client_analyses
WHERE created_at >= '2026-01-10'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
  AND status = 'completed'
  AND ai_structure_score IS NOT NULL;

