import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET /api/clavi/members
 * メンバー一覧取得API（全ロール参照可能）
 */
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RPC実行
  const { data, error } = await supabase.rpc('list_members');

  if (error) {
    // テナントコンテキストエラー
    if (error.message?.includes('No tenant context')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    // その他のエラー
    console.error('list_members error:', error);
    return NextResponse.json(
      { error: 'Failed to list members', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
