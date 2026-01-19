-- 48時間ゲート検証用テストデータ作成スクリプト
-- 作成日: 2026-01-12

-- テナントA作成
INSERT INTO aso.tenants (id, name)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'Tenant A - Test Company'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;

\echo '✅ Tenant A created'

-- 分析データ作成（テナントA）
INSERT INTO aso.client_analyses (
  id,
  tenant_id,
  url,
  status,
  analysis_data
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'https://tenant-a.example.com',
  'completed',
  '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET url = EXCLUDED.url;

\echo '✅ Analysis data created'

-- Fragment Vectors作成（ダミーデータ）
INSERT INTO aso.fragment_vectors (
  id,
  tenant_id,
  analysis_id,
  fragment_id,
  content_title,
  content,
  page_path,
  complete_uri,
  embedding
)
VALUES
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'h2-test-1',
  'Test Fragment 1',
  'This is a test content.',
  '/',
  'https://tenant-a.example.com#h2-test-1',
  array_fill(0.1::float, ARRAY[1536])::vector(1536)
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'h2-test-2',
  'Test Fragment 2',
  'This is another test content.',
  '/',
  'https://tenant-a.example.com#h2-test-2',
  array_fill(0.2::float, ARRAY[1536])::vector(1536)
)
ON CONFLICT (id) DO UPDATE
SET content_title = EXCLUDED.content_title;

\echo '✅ Fragment Vectors created'

-- 確認
SELECT '=== Tenant A ===' as section;
SELECT * FROM aso.tenants WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT '=== Client Analyses ===' as section;
SELECT id, tenant_id, url, status FROM aso.client_analyses WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT '=== Fragment Vectors ===' as section;
SELECT id, tenant_id, analysis_id, fragment_id, content_title 
FROM aso.fragment_vectors 
WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

