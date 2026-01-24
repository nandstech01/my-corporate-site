import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore setAll errors from Server Components
          }
        },
      },
    }
  );
}

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * PATCH /api/clavi/members/[userId]
 * メンバーロール変更API（owner専用）
 *
 * Body: { role: 'admin' | 'member' }
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const supabase = await createSupabaseServerClient();
  const { userId } = await params;

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // リクエストボディ取得
  let role: string;
  try {
    const body = await request.json();
    role = body.role;

    if (!role) {
      return NextResponse.json(
        { error: 'role is required' },
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
  const { data, error } = await supabase.rpc('update_member_role', {
    p_user_id: userId,
    p_new_role: role,
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
    // 自分自身のロール変更
    if (error.message?.includes('Cannot change your own role')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    // バリデーションエラー
    if (error.message?.includes('Invalid role')) {
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
    // ownerロール変更試行
    if (error.message?.includes('Cannot change owner role')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    // その他のエラー
    console.error('update_member_role error:', error);
    return NextResponse.json(
      { error: 'Failed to update member role', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/clavi/members/[userId]
 * メンバー削除API（owner: 全員、admin: memberのみ）
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const supabase = await createSupabaseServerClient();
  const { userId } = await params;

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RPC実行
  const { data, error } = await supabase.rpc('remove_member', {
    p_user_id: userId,
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
    // 自分自身の削除
    if (error.message?.includes('Cannot remove yourself')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    // owner削除試行
    if (error.message?.includes('Cannot remove owner')) {
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
    // その他のエラー
    console.error('remove_member error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
