/**
 * CLAVI Admin API: テナント詳細
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 管理者権限チェック
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return unauthorizedResponse();
  }

  try {
    const { id: tenantId } = await params;
    const supabase = getServiceClient();

    // テナント基本情報
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // ユーザー一覧
    const { data: userTenants } = await supabase
      .from('user_tenants')
      .select('user_id, role, created_at')
      .eq('tenant_id', tenantId);

    // 分析一覧（最新10件）
    const { data: recentAnalyses, count: totalAnalyses } = await supabase
      .from('clavi_client_analyses')
      .select('id, url, status, ai_structure_score, created_at', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(10);

    // 分析統計
    const { data: allAnalyses } = await supabase
      .from('clavi_client_analyses')
      .select('status, ai_structure_score, created_at')
      .eq('tenant_id', tenantId);

    const statusCounts: Record<string, number> = {
      processing: 0,
      completed: 0,
      failed: 0,
      expired: 0,
    };
    let totalScore = 0;
    let scoreCount = 0;

    (allAnalyses || []).forEach(item => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }
      if (item.ai_structure_score !== null) {
        totalScore += item.ai_structure_score;
        scoreCount++;
      }
    });

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount * 10) / 10 : 0;

    // 今月の分析数
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = (allAnalyses || []).filter(
      a => new Date(a.created_at) >= monthStart
    ).length;

    // パフォーマンスメトリクス
    const { data: performanceData } = await supabase
      .from('clavi_performance_metrics')
      .select('processing_time_ms, openai_tokens_used, estimated_cost_usd')
      .eq('tenant_id', tenantId);

    const totalTokens = (performanceData || []).reduce(
      (sum, p) => sum + (p.openai_tokens_used || 0),
      0
    );
    const totalCost = (performanceData || []).reduce(
      (sum, p) => sum + parseFloat(p.estimated_cost_usd || '0'),
      0
    );
    const avgProcessingTime = performanceData?.length
      ? Math.round(
          performanceData.reduce((sum, p) => sum + (p.processing_time_ms || 0), 0) /
          performanceData.length
        )
      : 0;

    return NextResponse.json({
      tenant,
      users: userTenants || [],
      recentAnalyses: recentAnalyses || [],
      stats: {
        totalAnalyses: totalAnalyses || 0,
        statusCounts,
        avgScore,
        thisMonthCount,
        totalTokens,
        totalCost: Math.round(totalCost * 100) / 100,
        avgProcessingTime,
      },
    });
  } catch (error) {
    console.error('Admin tenant detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 管理者権限チェック
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return unauthorizedResponse();
  }

  try {
    const { id: tenantId } = await params;
    const supabase = getServiceClient();
    const body = await request.json();

    // 更新可能なフィールド
    const allowedFields = ['name', 'subscription_tier', 'subscription_status'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: updatedTenant, error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update tenant:', error);
      return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
    }

    return NextResponse.json({ tenant: updatedTenant });
  } catch (error) {
    console.error('Admin tenant update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
