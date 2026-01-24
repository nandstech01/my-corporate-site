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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // JWT claimからtenant_id/role取得（RPC使用）
  const { data: context } = await supabase
    .rpc('get_current_tenant_context');

  const tenant_id = context?.tenant_id || null;
  const tenant_role = context?.tenant_role || null;

  // 所属テナント一覧を取得（複数テナント対応）
  const { data: tenants } = await supabase
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

  const selected_tenant_id = user.user_metadata?.selected_tenant_id || null;

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    tenant_id: tenant_id,
    tenant_role: tenant_role,
    selected_tenant_id: selected_tenant_id,
    is_member: (tenants && tenants.length > 0),
    tenants: tenants || [],
  });
}
