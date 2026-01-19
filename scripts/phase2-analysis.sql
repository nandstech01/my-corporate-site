-- ========================================
-- Phase 2 最小実験 - 結果分析SQLクエリ
-- ========================================
-- 
-- 目的: Phase 2実験の結果を分析し、KPIを計算する
-- 実行環境: Supabase SQL Editor または psql
-- 
-- 使用方法:
-- 1. Supabase Dashboard → SQL Editor
-- 2. このファイルの内容をコピペ
-- 3. 実行
--
-- 注意:
-- - 実験期間中（2026-01-XX以降）のデータのみを対象
-- - テナントID: 2dec3290-5427-4874-a525-6265da5aa8f3 (Test Tenant)

-- ========================================
-- 1. 基本統計（全体サマリー）
-- ========================================

SELECT
  '1. 基本統計' as analysis_type,
  COUNT(*) as total_analyses,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  ROUND(100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*), 2) as success_rate_percent,
  ROUND(100.0 * COUNT(CASE WHEN status = 'failed' THEN 1 END) / COUNT(*), 2) as failure_rate_percent
FROM aso.client_analyses
WHERE created_at >= '2026-01-11'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid;

-- ========================================
-- 2. ステータス別内訳
-- ========================================

SELECT
  '2. ステータス別内訳' as analysis_type,
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM aso.client_analyses
WHERE created_at >= '2026-01-11'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
GROUP BY status
ORDER BY count DESC;

-- ========================================
-- 3. 処理時間分析（パーセンタイル）
-- ========================================

WITH processing_times AS (
  SELECT
    analysis_id,
    url,
    (metadata->>'processing_time_ms')::int as processing_time_ms
  FROM aso.client_analyses
  WHERE created_at >= '2026-01-11'
    AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
    AND status = 'completed'
    AND metadata ? 'processing_time_ms'
)
SELECT
  '3. 処理時間分析（完了分のみ）' as analysis_type,
  COUNT(*) as sample_count,
  ROUND(AVG(processing_time_ms)) as avg_ms,
  ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY processing_time_ms)) as p50_ms,
  ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY processing_time_ms)) as p75_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms)) as p95_ms,
  ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY processing_time_ms)) as p99_ms,
  MIN(processing_time_ms) as min_ms,
  MAX(processing_time_ms) as max_ms,
  CASE 
    WHEN PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) <= 300000 
    THEN '✅ 合格（< 5分）'
    ELSE '❌ 不合格（>= 5分）'
  END as p95_judgment
FROM processing_times;

-- ========================================
-- 4. 冪等性チェック（重複URL検出）
-- ========================================

WITH url_counts AS (
  SELECT
    url,
    COUNT(*) as count
  FROM aso.client_analyses
  WHERE created_at >= '2026-01-11'
    AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
  GROUP BY url
  HAVING COUNT(*) > 1
)
SELECT
  '4. 冪等性チェック（重複URL）' as analysis_type,
  COALESCE(SUM(count - 1), 0) as duplicate_count,
  CASE 
    WHEN COALESCE(SUM(count - 1), 0) = 0 
    THEN '✅ 合格（重複なし）'
    ELSE '❌ 不合格（重複あり）'
  END as idempotency_judgment
FROM url_counts;

-- 重複URLの詳細（存在する場合）
SELECT
  '4-1. 重複URLの詳細' as analysis_type,
  url,
  COUNT(*) as duplicate_count,
  array_agg(analysis_id ORDER BY created_at) as analysis_ids,
  array_agg(status ORDER BY created_at) as statuses
FROM aso.client_analyses
WHERE created_at >= '2026-01-11'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
GROUP BY url
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ========================================
-- 5. AI構造化スコア分析
-- ========================================

SELECT
  '5. AI構造化スコア分析' as analysis_type,
  COUNT(*) as total_with_score,
  ROUND(AVG(ai_structure_score), 2) as avg_score,
  ROUND(MIN(ai_structure_score), 2) as min_score,
  ROUND(MAX(ai_structure_score), 2) as max_score,
  ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY ai_structure_score), 2) as median_score,
  COUNT(CASE WHEN ai_structure_score >= 70 THEN 1 END) as high_quality_count,
  ROUND(100.0 * COUNT(CASE WHEN ai_structure_score >= 70 THEN 1 END) / COUNT(*), 2) as high_quality_percent
FROM aso.client_analyses
WHERE created_at >= '2026-01-11'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
  AND status = 'completed'
  AND ai_structure_score IS NOT NULL;

-- ========================================
-- 6. エラーパターン分析（失敗分のみ）
-- ========================================

SELECT
  '6. エラーパターン分析' as analysis_type,
  metadata->>'error_type' as error_type,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage,
  array_agg(url ORDER BY created_at LIMIT 3) as sample_urls
FROM aso.client_analyses
WHERE created_at >= '2026-01-11'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
  AND status = 'failed'
  AND metadata ? 'error_type'
GROUP BY metadata->>'error_type'
ORDER BY count DESC;

-- ========================================
-- 7. タイムライン（時系列）
-- ========================================

SELECT
  '7. タイムライン（時系列）' as analysis_type,
  analysis_id,
  url,
  status,
  ai_structure_score,
  created_at,
  EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at))) as seconds_since_previous
FROM aso.client_analyses
WHERE created_at >= '2026-01-11'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
ORDER BY created_at;

-- ========================================
-- 8. KPI総合判定
-- ========================================

WITH kpi_metrics AS (
  SELECT
    -- KPI 1: 二重実行
    (SELECT COALESCE(SUM(count - 1), 0)
     FROM (SELECT COUNT(*) as count
           FROM aso.client_analyses
           WHERE created_at >= '2026-01-11'
             AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
           GROUP BY url
           HAVING COUNT(*) > 1) dup) as duplicate_count,
    
    -- KPI 2: p95処理時間
    (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (metadata->>'processing_time_ms')::int)
     FROM aso.client_analyses
     WHERE created_at >= '2026-01-11'
       AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
       AND status = 'completed'
       AND metadata ? 'processing_time_ms') as p95_processing_time_ms,
    
    -- KPI 3: needs_review率（仮に status='failed' かつ error_type='needs_review' と定義）
    (SELECT ROUND(100.0 * COUNT(CASE WHEN status = 'failed' AND metadata->>'error_type' = 'needs_review' THEN 1 END) / COUNT(*), 2)
     FROM aso.client_analyses
     WHERE created_at >= '2026-01-11'
       AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid) as needs_review_rate_percent,
    
    -- KPI 4: 成功率
    (SELECT ROUND(100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*), 2)
     FROM aso.client_analyses
     WHERE created_at >= '2026-01-11'
       AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid) as success_rate_percent
)
SELECT
  '8. KPI総合判定' as analysis_type,
  duplicate_count,
  CASE WHEN duplicate_count = 0 THEN '✅' ELSE '❌' END as kpi1_idempotency,
  ROUND(p95_processing_time_ms / 1000.0, 1) as p95_seconds,
  CASE WHEN p95_processing_time_ms <= 300000 THEN '✅' ELSE '❌' END as kpi2_performance,
  needs_review_rate_percent,
  CASE WHEN needs_review_rate_percent < 30 THEN '✅' ELSE '❌' END as kpi3_quality,
  success_rate_percent,
  CASE WHEN success_rate_percent >= 70 THEN '✅' ELSE '❌' END as kpi4_success_rate,
  CASE
    WHEN duplicate_count = 0 
         AND p95_processing_time_ms <= 300000 
         AND needs_review_rate_percent < 30 
         AND success_rate_percent >= 70 
    THEN '🎉 合格 - Phase 3へ進む'
    WHEN duplicate_count = 0 
         AND p95_processing_time_ms <= 600000 
         AND needs_review_rate_percent < 40 
         AND success_rate_percent >= 60 
    THEN '⚠️ 条件付き合格 - 対象URL絞る'
    ELSE '❌ 不合格 - Phase 1に戻る'
  END as final_judgment
FROM kpi_metrics;

-- ========================================
-- 9. 詳細データエクスポート（CSV用）
-- ========================================

SELECT
  '9. 詳細データエクスポート' as analysis_type,
  analysis_id,
  url,
  status,
  ai_structure_score,
  metadata->>'processing_time_ms' as processing_time_ms,
  metadata->>'error_type' as error_type,
  metadata->>'error_message' as error_message,
  created_at,
  updated_at
FROM aso.client_analyses
WHERE created_at >= '2026-01-11'
  AND tenant_id = '2dec3290-5427-4874-a525-6265da5aa8f3'::uuid
ORDER BY created_at;

