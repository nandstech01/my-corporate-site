/**
 * CLAVI Admin API: 分析ジョブ一覧
 * プラットフォーム管理者専用
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminUser, unauthorizedResponse } from '@/lib/clavi/admin-auth';

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
    return unauthorizedResponse();
  }

  try {
    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status') || '';
    const tenantId = searchParams.get('tenant_id') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // 分析ジョブ一覧取得（clavi.client_analyses）
    let query = supabase
      .from('clavi_client_analyses')
      .select(`
        id,
        tenant_id,
        url,
        status,
        ai_structure_score,
        error_message,
        created_at,
        updated_at
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Failed to fetch jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    // テナント名を取得して結合
    const tenantIds = Array.from(new Set((jobs || []).map(j => j.tenant_id)));
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, name')
      .in('id', tenantIds);

    const tenantMap = new Map((tenants || []).map(t => [t.id, t.name]));

    const jobsWithTenant = (jobs || []).map(job => ({
      ...job,
      tenant_name: tenantMap.get(job.tenant_id) || 'Unknown',
    }));

    // ステータス別カウント
    const { data: statusCounts } = await supabase
      .from('clavi_client_analyses')
      .select('status')
      .then(async ({ data }) => {
        const counts: Record<string, number> = {
          processing: 0,
          completed: 0,
          failed: 0,
          expired: 0,
        };
        (data || []).forEach(item => {
          if (counts[item.status] !== undefined) {
            counts[item.status]++;
          }
        });
        return { data: counts };
      });

    return NextResponse.json({
      jobs: jobsWithTenant,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      statusCounts: statusCounts || {},
    });
  } catch (error) {
    console.error('Admin jobs API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
