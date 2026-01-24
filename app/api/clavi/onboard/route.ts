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

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // リクエストボディ
  const { tenant_name } = await request.json();
  if (!tenant_name || tenant_name.trim().length === 0) {
    return NextResponse.json({
      error: 'tenant_name is required and cannot be empty'
    }, { status: 400 });
  }

  // RPC実行（冪等: 既存所属なら既存tenant_id返す）
  const { data: tenant_id, error: onboardError } = await supabase
    .rpc('onboard', { tenant_name: tenant_name.trim() });

  if (onboardError) {
    if (onboardError.code === '23514' || onboardError.message?.includes('cannot be empty')) {
      return NextResponse.json({
        error: 'Invalid tenant_name',
        details: onboardError.message
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to onboard',
      details: onboardError.message
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    tenant_id: tenant_id,
    message: 'Onboarded successfully. Please re-login to activate tenant context.'
  });
}
