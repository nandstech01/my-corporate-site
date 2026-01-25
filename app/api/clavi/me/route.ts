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

  const jwt_tenant_id = context?.tenant_id || null;
  const jwt_tenant_role = context?.tenant_role || null;

  // 所属テナント一覧を取得（JOINはviewでは使えないため分割クエリ）
  const { data: userTenants } = await supabase
    .from('user_tenants')
    .select('tenant_id, role, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // テナント詳細を取得
  const tenantIds = (userTenants || []).map(ut => ut.tenant_id);
  let tenantsDetails: any[] = [];
  if (tenantIds.length > 0) {
    const { data: details } = await supabase
      .from('tenants')
      .select('id, name, subscription_tier, subscription_status, created_at')
      .in('id', tenantIds);
    tenantsDetails = details || [];
  }

  // マージ: user_tenants + tenants詳細
  const tenants = (userTenants || []).map(ut => {
    const detail = tenantsDetails.find(t => t.id === ut.tenant_id);
    return {
      tenant_id: ut.tenant_id,
      role: ut.role,
      created_at: ut.created_at,
      tenants: detail || null,
    };
  });

  // 有効なテナントIDとロールを決定（JWT claim優先、なければDB fallback）
  const firstTenant = tenants[0];
  const tenant_id = jwt_tenant_id || firstTenant?.tenant_id || null;
  const tenant_role = jwt_tenant_role || firstTenant?.role || null;
  const selected_tenant_id = user.user_metadata?.selected_tenant_id || null;

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    tenant_id,
    tenant_role,
    selected_tenant_id,
    is_member: tenants.length > 0,
    tenants,
  });
}
