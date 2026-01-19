import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/aso/invitations/accept
 * 招待受諾API
 *
 * Body: { token: string }
 *
 * 検証:
 * - トークン有効期限
 * - メールアドレス一致
 * - 既存メンバーシップ（冪等性）
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // リクエストボディ取得
  let token: string;
  try {
    const body = await request.json();
    token = body.token;

    if (!token) {
      return NextResponse.json(
        { error: 'token is required' },
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
  const { data, error } = await supabase.rpc('accept_invitation', {
    p_token: token,
  });

  if (error) {
    // 認証エラー
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    // トークン/招待エラー
    if (error.message?.includes('Invalid invitation token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    // 取消/期限切れエラー
    if (error.message?.includes('revoked') || error.message?.includes('expired')) {
      return NextResponse.json(
        { error: error.message },
        { status: 410 }
      );
    }
    // メール不一致エラー
    if (error.message?.includes('Email mismatch')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    // その他のエラー
    console.error('accept_invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation', details: error.message },
      { status: 500 }
    );
  }

  // 成功レスポンス
  return NextResponse.json({
    ...data,
    note: 'Please sign out and sign in again to apply the tenant context to your session.',
  });
}
