/**
 * CLAVI Admin API: テナント一覧
 * プラットフォーム管理者専用
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminUser, unauthorizedResponse, unauthenticatedResponse } from '@/lib/clavi/admin-auth';

// service_role クライアント（RLSバイパス）
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(request: NextRequest) {
  // 管理者権限チェック
  const adminUser = await getAdminUser();
  if (!adminUser) {
    const { searchParams } = new URL(request.url);
    const authCheck = searchParams.get('_auth_check');
    if (authCheck) {
      return unauthenticatedResponse();
    }
    return unauthorizedResponse();
  }

  try {
    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // テナント一覧取得
    let query = supabase
      .from('clavi_tenants_admin_view')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: tenants, error, count } = await query;

    if (error) {
      // ビューが存在しない場合はテーブルから直接取得
      if (error.code === '42P01') {
        const { data: tenantsFromTable, error: tableError, count: tableCount } = await supabase
          .from('tenants')
          .select('*', { count: 'exact' })
          .order(sortBy, { ascending: sortOrder === 'asc' })
          .range(offset, offset + limit - 1);

        if (tableError) {
          console.error('Failed to fetch tenants:', tableError);
          return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
        }

        return NextResponse.json({
          tenants: tenantsFromTable || [],
          pagination: {
            page,
            limit,
            total: tableCount || 0,
            totalPages: Math.ceil((tableCount || 0) / limit),
          },
        });
      }

      console.error('Failed to fetch tenants:', error);
      return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
    }

    // 各テナントの統計情報を取得
    const tenantsWithStats = await Promise.all(
      (tenants || []).map(async (tenant) => {
        // ユーザー数
        const { count: userCount } = await supabase
          .from('user_tenants')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id);

        // 分析数
        const { count: analysisCount } = await supabase
          .from('clavi_client_analyses')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id);

        return {
          ...tenant,
          user_count: userCount || 0,
          analysis_count: analysisCount || 0,
        };
      })
    );

    return NextResponse.json({
      tenants: tenantsWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin tenants API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
