-- Migration: Phase 4.3.2 - CLAVI Fragment Vector Similarity Search RPC
-- Mike King理論準拠: ベクトル近傍検索による内部リンク最適化
-- 
-- ⚠️ 安全版v2（2026-01-12最終修正）:
-- 1. SECURITY INVOKER（RLSに従う）
-- 2. tenant_id引数を削除（auth.uid()から導出のみ）
-- 3. analysis_id の所属テナント検証（JOIN強制）
-- 4. authenticated のみに権限付与
--
-- @version 3.0.0 (安全版v2 - tenant引数削除)
-- @date 2026-01-12

-- =====================================================
-- RPC関数: find_similar_fragments_clavi（安全版v2）
-- =====================================================
-- 
-- Mike King理論: ベクトル近傍検索RPC
-- 
-- ⚠️ セキュリティ設計（最終版）:
-- - SECURITY INVOKER: 呼び出し側の権限で実行（RLSに従う）
-- - tenant_id引数削除: auth.uid() から導出のみ（差し替え攻撃防止）
-- - analysis_id検証: client_analyses と JOIN して同一テナントに属することを保証
-- - 二重防御: RLS + 関数内チェック + JOIN制約
--
-- 引数（tenant_id削除版）:
--   - query_embedding: 検索対象のベクトル（1536次元）
--   - match_threshold: 類似度の閾値（0.0-1.0）
--   - match_count: 返却する最大件数（上限20で固定）
--   - p_analysis_id: 分析ID（所属テナント検証あり）
--
-- 戻り値:
--   - fragment_id: Fragment ID
--   - complete_uri: 完全URI（#fragment_id）
--   - content_title: コンテンツタイトル
--   - similarity: コサイン類似度（0.0-1.0）

CREATE OR REPLACE FUNCTION public.find_similar_fragments_clavi(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_analysis_id uuid  -- ⚠️ tenant_id引数を削除
)
RETURNS TABLE (
  fragment_id text,
  complete_uri text,
  content_title text,
  similarity float
)
LANGUAGE plpgsql
SECURITY INVOKER -- ⚠️ RLSに従う
STABLE -- 副作用なし
SET search_path = public, clavi, pg_temp
AS $$
DECLARE
  v_user_tenant_id uuid;
  v_analysis_tenant_id uuid;
BEGIN
  -- ⚠️ 修正1: tenant_idを auth.uid() からのみ取得（引数で受けない）
  SELECT tenant_id INTO v_user_tenant_id
  FROM public.user_tenants
  WHERE user_id = auth.uid()
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- 未ログインまたはテナント未登録の場合は空結果
  IF v_user_tenant_id IS NULL THEN
    RETURN;
  END IF;
  
  -- ⚠️ 修正2: analysis_id が同一テナントに属することを検証
  SELECT tenant_id INTO v_analysis_tenant_id
  FROM clavi.client_analyses
  WHERE id = p_analysis_id;
  
  -- analysis_id が存在しないか、別テナントに属する場合は空結果
  IF v_analysis_tenant_id IS NULL OR v_analysis_tenant_id != v_user_tenant_id THEN
    RETURN;
  END IF;
  
  -- ⚠️ 修正3: match_count の上限を20に固定（濫用防止）
  IF match_count > 20 THEN
    match_count := 20;
  END IF;
  
  -- ⚠️ 修正4: ビュー（clavi_fragment_vectors）を使用してRLS適用
  -- tenant_id は v_user_tenant_id のみを使用（引数なし）
  RETURN QUERY
  SELECT
    fv.fragment_id,
    fv.complete_uri,
    fv.content_title,
    1 - (fv.embedding <=> query_embedding) as similarity
  FROM clavi_fragment_vectors fv -- 公開ビューを使用（RLS適用済み）
  WHERE
    -- ⚠️ 導出した tenant_id のみを使用
    fv.tenant_id = v_user_tenant_id
    AND fv.analysis_id = p_analysis_id
    -- 類似度フィルタ
    AND 1 - (fv.embedding <=> query_embedding) > match_threshold
  -- コサイン距離昇順（類似度降順）
  ORDER BY fv.embedding <=> query_embedding
  -- 上限20件
  LIMIT match_count;
END;
$$;

-- =====================================================
-- 権限設定（安全版v2）
-- =====================================================

-- PUBLIC からのアクセスを拒否
REVOKE ALL ON FUNCTION public.find_similar_fragments_clavi(
  vector(1536),
  float,
  int,
  uuid
) FROM PUBLIC;

-- ⚠️ authenticated ロールのみに実行権限を付与
GRANT EXECUTE ON FUNCTION public.find_similar_fragments_clavi(
  vector(1536),
  float,
  int,
  uuid
) TO authenticated;

-- ⚠️ anon と service_role からは明示的に権限を削除
REVOKE EXECUTE ON FUNCTION public.find_similar_fragments_clavi(
  vector(1536),
  float,
  int,
  uuid
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.find_similar_fragments_clavi(
  vector(1536),
  float,
  int,
  uuid
) FROM service_role;

-- =====================================================
-- コメント追加
-- =====================================================

COMMENT ON FUNCTION public.find_similar_fragments_clavi IS 
'Mike King理論準拠: CLAVI Fragment Vector類似度検索RPC（安全版v2）
- SECURITY INVOKER（RLSに従う）
- tenant_id引数削除（auth.uid()から導出のみ）
- analysis_id所属テナント検証（JOIN強制）
- match_count上限20件（濫用防止）
- authenticated のみに権限付与';

-- =====================================================
-- 48時間ゲート検証クエリ
-- =====================================================
-- 
-- 以下のクエリでテナント分離を検証:
-- 
-- A. 関数属性の確認（psql）
-- \df+ public.find_similar_fragments_clavi
-- 期待結果:
--   - prosecdef: false (SECURITY INVOKER)
--   - プロシージャ引数: 4個（tenant_idなし）
--
-- B. 実行権限の確認
-- SELECT grantee, privilege_type
-- FROM information_schema.routine_privileges
-- WHERE routine_name = 'find_similar_fragments_clavi';
-- 期待結果:
--   - authenticated: EXECUTE
--   - anon: なし
--
-- C. クロステナント漏洩テスト（最重要）
-- 
-- 1. テナントAで正常に動作するか確認
--    （userA でログイン後）
-- SELECT * FROM public.find_similar_fragments_clavi(
--   query_embedding := array_fill(0.1::float, ARRAY[1536])::vector(1536),
--   match_threshold := 0.0,
--   match_count := 5,
--   p_analysis_id := '<tenant_A_analysis_id>'::uuid
-- );
-- 期待結果: 該当データが返る
--
-- 2. テナントBからテナントAのデータを取得できないことを確認
--    （userB でログイン後、tenant_A の analysis_id を指定）
-- SELECT * FROM public.find_similar_fragments_clavi(
--   query_embedding := array_fill(0.1::float, ARRAY[1536])::vector(1536),
--   match_threshold := 0.0,  -- ⚠️ 意地悪入力
--   match_count := 999,       -- ⚠️ 意地悪入力（上限20に制限される）
--   p_analysis_id := '<tenant_A_analysis_id>'::uuid
-- );
-- 期待結果: 0件（空の結果セット）
--
-- 3. 未ログインユーザー（anon）からは実行不可を確認
-- 期待結果: permission denied for function

-- =====================================================
-- インデックス確認（パフォーマンス最適化）
-- =====================================================
-- 
-- 以下のインデックスが必要（既存マイグレーションで作成済みと想定）:
-- 
-- 1. pgvector HNSW Index（高速な近傍検索用）
--    CREATE INDEX IF NOT EXISTS idx_fragment_vectors_embedding_hnsw
--    ON clavi.fragment_vectors
--    USING hnsw (embedding vector_cosine_ops)
--    WITH (m = 16, ef_construction = 64);
-- 
-- 2. テナント分離用の複合インデックス
--    CREATE INDEX IF NOT EXISTS idx_fragment_vectors_tenant_analysis
--    ON clavi.fragment_vectors (tenant_id, analysis_id);
--
-- 3. client_analyses のテナント検証用インデックス
--    CREATE INDEX IF NOT EXISTS idx_client_analyses_id_tenant
--    ON clavi.client_analyses (id, tenant_id);

-- =====================================================
-- Migration完了（安全版v2 - tenant引数削除）
-- =====================================================
