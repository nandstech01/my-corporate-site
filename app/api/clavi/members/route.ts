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

/**
 * GET /api/clavi/members
 * メンバー一覧取得API（全ロール参照可能）
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();

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
