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

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // JWT claimからtenant_id取得
  const { data: context } = await supabase.rpc('get_current_tenant_context');
  const tenant_id = context?.tenant_id;

  if (!tenant_id) {
    return NextResponse.json({
      tenant: null,
      message: 'No tenant found. Please onboard first.'
    });
  }

  // RLS前提でtenant取得（tenant_idで絞る）
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenant_id)
    .maybeSingle();

  // 未所属 or tenant未作成の場合
  if (tenantError || !tenant) {
    return NextResponse.json({
      tenant: null,
      message: 'Tenant not found or access denied.'
    });
  }

  return NextResponse.json({
    tenant: tenant
  });
}

/**
 * PATCH /api/clavi/tenant
 * テナント情報更新API（owner/admin専用）
 *
 * Body: { name?: string, subscription_tier?: 'starter' | 'pro' | 'enterprise' }
 */
export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // リクエストボディ取得
  let name: string | undefined;
  let subscription_tier: string | undefined;
  try {
    const body = await request.json();
    name = body.name;
    subscription_tier = body.subscription_tier;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // RPC実行
  const { data, error } = await supabase.rpc('update_tenant', {
    p_name: name || null,
    p_subscription_tier: subscription_tier || null,
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
    if (error.message?.includes('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    // その他のエラー
    console.error('update_tenant error:', error);
    return NextResponse.json(
      { error: 'Failed to update tenant', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/clavi/tenant
 * テナント削除API（owner専用）
 *
 * 注意: CASCADE削除（user_tenants, invitations, audit_log等も削除）
 */
export async function DELETE() {
  const supabase = await createSupabaseServerClient();

  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RPC実行
  const { data, error } = await supabase.rpc('delete_tenant');

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
    // その他のエラー
    console.error('delete_tenant error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tenant', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ...data,
    note: 'Please sign out immediately. Your tenant and all associated data have been deleted.',
  });
}
