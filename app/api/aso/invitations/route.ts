import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/aso/invitations
 * 招待作成API（owner/admin専用、admin招待はowner限定）
 *
 * Body: { target_email: string, target_role?: 'admin' | 'member' }
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // リクエストボディ取得
  let target_email: string;
  let target_role: string;
  try {
    const body = await request.json();
    target_email = body.target_email;
    target_role = body.target_role || 'member';

    if (!target_email) {
      return NextResponse.json(
        { error: 'target_email is required' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // RPC実行
  const { data, error } = await supabase.rpc('create_invitation', {
    p_target_email: target_email,
    p_target_role: target_role,
  });

  if (error) {
    // 権限エラー
    if (error.message?.includes('Permission denied')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    // テナントコンテキストエラー
    if (error.message?.includes('No tenant context')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    // バリデーションエラー
    if (error.message?.includes('Invalid') || error.message?.includes('already exists') || error.message?.includes('already a member')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    // その他のエラー
    console.error('create_invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

/**
 * GET /api/aso/invitations
 * 招待一覧取得API（owner/admin専用）
 *
 * Query: status?: 'pending' | 'accepted' | 'expired' | 'revoked'
 */
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // クエリパラメータ取得
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  // JWT claimからtenant_id取得
  const { data: context } = await supabase.rpc('get_current_tenant_context');
  const tenant_id = context?.tenant_id;
  const tenant_role = context?.tenant_role;

  if (!tenant_id) {
    return NextResponse.json(
      { error: 'No tenant context. Please switch to a tenant first.' },
      { status: 400 }
    );
  }

  // 権限チェック（owner/adminのみ）
  if (!tenant_role || !['owner', 'admin'].includes(tenant_role)) {
    return NextResponse.json(
      { error: 'Permission denied. Only owner/admin can view invitations.' },
      { status: 403 }
    );
  }

  // 招待一覧取得（RLSで自テナントのみ）
  let query = supabase
    .from('invitations')
    .select('*')
    .eq('tenant_id', tenant_id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: invitations, error } = await query;

  if (error) {
    console.error('get invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to get invitations', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    invitations: invitations || [],
  });
}

/**
 * DELETE /api/aso/invitations
 * 招待取消API（owner/admin専用）
 *
 * Body: { invitation_id: string }
 */
export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // リクエストボディ取得
  let invitation_id: string;
  try {
    const body = await request.json();
    invitation_id = body.invitation_id;

    if (!invitation_id) {
      return NextResponse.json(
        { error: 'invitation_id is required' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // RPC実行
  const { data, error } = await supabase.rpc('revoke_invitation', {
    p_invitation_id: invitation_id,
  });

  if (error) {
    // 権限エラー
    if (error.message?.includes('Permission denied')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    // テナントコンテキストエラー
    if (error.message?.includes('No tenant context')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    // Not found
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    // ステータスエラー
    if (error.message?.includes('Cannot revoke')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    // その他のエラー
    console.error('revoke_invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invitation', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
