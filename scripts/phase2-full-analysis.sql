-- ========================================
-- Phase 2フルテスト（30件） - 結果分析
-- ========================================
-- 実行日: 2026-01-10
-- テナントID: 2dec3290-5427-4874-a525-6265da5aa8f3
-- 対象期間: 2026-01-10 18:53 UTC以降
-- ========================================

-- 1️⃣ 基本統計
SELECT
  '1. 基本統計（Phase 2フルテスト）' as analysis_type,
  COUNT(*) as total_analyses,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND(100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*), 2)
    ELSE 0
  END as success_rate_percent,
  CASE
    WHEN COUNT(CASE WHEN status = 'completed' THEN 1 END) >= 21
    THEN '✅ 合格（≥21件）'
    ELSE '❌ 不合格（<21件）'
  END as judgment
FROM clavi.client_analyses
WHERE created_at >= '2026-01-10 18:53:00'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid;

-- 2️⃣ 冪等性チェック（重複URL検出）
WITH url_counts AS (
  SELECT url, COUNT(*) as count
  FROM clavi.client_analyses
  WHERE created_at >= '2026-01-10 18:53:00'
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

-- 3️⃣ AI構造化スコア分析
SELECT
  '3. AI構造化スコア分析' as analysis_type,
  COUNT(*) as total,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND(AVG(ai_structure_score), 2)
    ELSE NULL
  END as avg_score,
  MIN(ai_structure_score) as min_score,
  MAX(ai_structure_score) as max_score,
  ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY ai_structure_score), 2) as median_score,
  COUNT(CASE WHEN ai_structure_score >= 70 THEN 1 END) as high_quality_count,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND(100.0 * COUNT(CASE WHEN ai_structure_score >= 70 THEN 1 END) / COUNT(*), 2)
    ELSE 0
  END as high_quality_percent,
  CASE
    WHEN AVG(ai_structure_score) >= 60
    THEN '✅ 合格（≥60点）'
    ELSE '⚠️ やや低い（<60点）'
  END as judgment
FROM clavi.client_analyses
WHERE created_at >= '2026-01-10 18:53:00'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
  AND status = 'completed'
  AND ai_structure_score IS NOT NULL;

-- 4️⃣ 最新30件のURL一覧
SELECT
  '4. 最新30件' as analysis_type,
  id,
  url,
  status,
  ai_structure_score,
  created_at
FROM clavi.client_analyses
WHERE created_at >= '2026-01-10 18:53:00'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
ORDER BY created_at DESC
LIMIT 30;

-- 5️⃣ スコア分布（10点刻み）
SELECT
  '5. スコア分布' as analysis_type,
  CASE
    WHEN ai_structure_score < 10 THEN '0-9'
    WHEN ai_structure_score < 20 THEN '10-19'
    WHEN ai_structure_score < 30 THEN '20-29'
    WHEN ai_structure_score < 40 THEN '30-39'
    WHEN ai_structure_score < 50 THEN '40-49'
    WHEN ai_structure_score < 60 THEN '50-59'
    WHEN ai_structure_score < 70 THEN '60-69'
    WHEN ai_structure_score < 80 THEN '70-79'
    WHEN ai_structure_score < 90 THEN '80-89'
    ELSE '90-100'
  END as score_range,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM clavi.client_analyses
WHERE created_at >= '2026-01-10 18:53:00'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
  AND status = 'completed'
  AND ai_structure_score IS NOT NULL
GROUP BY score_range
ORDER BY score_range;

