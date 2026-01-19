import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // JWT claimからtenant_id/role取得（RPC使用、確実）
  const { data: context, error: contextError } = await supabase
    .rpc('get_current_tenant_context');

  const tenant_id = context?.tenant_id || null;
  const tenant_role = context?.tenant_role || null;

  // ✨ Task 5.5: 所属テナント一覧を取得（複数テナント対応）
  const { data: tenants, error: tenantsError } = await supabase
    .from('user_tenants')
    .select(`
      tenant_id,
      role,
      created_at,
      tenants:tenant_id (
        id,
        name,
        subscription_tier,
        subscription_status,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // selected_tenant_id（user_metadataに保存されている選択中テナント）
  const selected_tenant_id = user.user_metadata?.selected_tenant_id || null;

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    tenant_id: tenant_id, // 現在のJWT claimに入っているテナント
    tenant_role: tenant_role, // 現在のJWT claimに入っているロール
    selected_tenant_id: selected_tenant_id, // user_metadataの選択中テナント
    is_member: (tenants && tenants.length > 0),
    tenants: tenants || [], // 所属テナント一覧（複数テナント対応）
  });
}

