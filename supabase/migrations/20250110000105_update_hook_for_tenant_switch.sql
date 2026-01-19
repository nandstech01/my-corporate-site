-- ============================================
-- Task 5.5: Hook修正（テナント切替対応）
-- ============================================
-- 作成日: 2025-01-10
-- 目的: user_metadataの selected_tenant_id を優先してJWT claimに設定
-- 変更点: 従来の決定ルール（owner優先等）は selected_tenant_id が無い場合のフォールバック

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = aso, public, pg_temp
AS $$
DECLARE
  claims jsonb;
  user_tenant_id uuid;
  user_tenant_role text;
  selected_tenant_id_text text;
  user_metadata jsonb;
BEGIN
  -- G5: claims正規化（null/非object → '{}'）
  claims := coalesce(event->'claims', '{}'::jsonb);
  IF jsonb_typeof(claims) IS DISTINCT FROM 'object' THEN
    claims := '{}'::jsonb;
  END IF;
  
  -- ✨ 新機能: user_metadata から selected_tenant_id を取得
  user_metadata := event->'user_metadata';
  IF user_metadata IS NOT NULL THEN
    selected_tenant_id_text := user_metadata->>'selected_tenant_id';
  END IF;

  -- 優先度1: user_metadataで指定されたテナント（ユーザーが明示的に選択）
  IF selected_tenant_id_text IS NOT NULL AND selected_tenant_id_text != '' THEN
    BEGIN
      -- 指定されたテナントに本当に所属しているか検証
      SELECT tenant_id, role INTO user_tenant_id, user_tenant_role
      FROM aso.user_tenants
      WHERE user_id = (event->>'user_id')::uuid
        AND tenant_id = selected_tenant_id_text::uuid
      LIMIT 1;
      
      -- 所属していない場合はNULLにリセット（不正な selected_tenant_id）
      IF user_tenant_id IS NULL THEN
        RAISE WARNING 'User % has selected_tenant_id=% but is not a member of that tenant', 
          event->>'user_id', selected_tenant_id_text;
        user_tenant_id := NULL;
        user_tenant_role := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      user_tenant_id := NULL;
      user_tenant_role := NULL;
    END;
  END IF;

  -- 優先度2: selected_tenant_id が無い or 不正な場合、従来の決定ルール
  IF user_tenant_id IS NULL THEN
    BEGIN
      SELECT tenant_id, role INTO user_tenant_id, user_tenant_role
      FROM aso.user_tenants
      WHERE user_id = (event->>'user_id')::uuid
      ORDER BY 
        CASE 
          WHEN role = 'owner' THEN 1
          WHEN role = 'admin' THEN 2
          WHEN role = 'member' THEN 3
          ELSE 4
        END,
        created_at ASC,
        tenant_id ASC
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      user_tenant_id := NULL;
      user_tenant_role := NULL;
    END;
  END IF;

  -- JWT claimに設定
  IF user_tenant_id IS NOT NULL THEN
    claims := jsonb_set(
      claims, 
      '{https://nands.tech/tenant_id}',
      to_jsonb(user_tenant_id::text)
    );
    
    claims := jsonb_set(
      claims,
      '{https://nands.tech/tenant_role}',
      to_jsonb(user_tenant_role)
    );
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
EXCEPTION WHEN OTHERS THEN
  -- 例外時はeventをそのまま返す（認証を止めない）
  RETURN event;
END;
$$;

-- 権限設定
REVOKE ALL ON FUNCTION public.custom_access_token_hook(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- コメント
COMMENT ON FUNCTION public.custom_access_token_hook IS
'JWT claimにtenant_id/tenant_roleを追加するAuth Hook。
優先度:
1. user_metadata.selected_tenant_id（ユーザーが明示的に選択）
2. 従来の決定ルール（owner優先 → created_at最古 → tenant_id昇順）';

-- 完了メッセージ
DO $$ BEGIN
  RAISE NOTICE '✅ custom_access_token_hook 更新完了（テナント切替対応）';
END $$;

