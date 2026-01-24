import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/clavi/switch-tenant
 * テナント切替API
 * 
 * Body: { tenant_id: string }
 * 
 * 処理:
 * 1. 指定されたテナントに所属しているか検証
 * 2. user_metadataのselected_tenant_idを更新
 * 3. 再ログイン推奨のメッセージを返す
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // リクエストボディ取得
  let tenant_id: string;
  try {
    const body = await request.json();
    tenant_id = body.tenant_id;
    
    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // Step 1: 指定されたテナントに所属しているか検証
  const { data: membership, error: membershipError } = await supabase
    .from('user_tenants')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .eq('tenant_id', tenant_id)
    .maybeSingle();

  if (membershipError || !membership) {
    return NextResponse.json(
      { error: 'You are not a member of this tenant' },
      { status: 403 }
    );
  }

  // Step 2: user_metadataのselected_tenant_idを更新
  const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
    data: {
      selected_tenant_id: tenant_id
    }
  });

  if (updateError) {
    console.error('❌ user_metadata更新エラー:', updateError);
    return NextResponse.json(
      { error: 'Failed to update tenant selection', details: updateError.message },
      { status: 500 }
    );
  }

  // Step 3: 監査ログ記録
  try {
    await supabase.rpc('log_audit', {
      p_tenant_id: tenant_id,
      p_user_id: user.id,
      p_action: 'tenant_switched',
      p_resource_type: 'user_tenant',
      p_resource_id: tenant_id,
      p_metadata: {
        role: membership.role,
        switched_at: new Date().toISOString()
      }
    });
  } catch (logError) {
    // 監査ログ失敗は無視（主処理を妨げない）
    console.warn('⚠️ 監査ログ記録失敗（無視）:', logError);
  }

  // Step 4: レスポンス
  return NextResponse.json({
    success: true,
    message: 'Tenant switched successfully',
    tenant_id: tenant_id,
    role: membership.role,
    note: 'Please sign out and sign in again to apply the change to JWT claims.'
  });
}

