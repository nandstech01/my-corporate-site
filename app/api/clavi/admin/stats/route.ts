/**
 * CLAVI Admin API: システム統計
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
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d

    // 期間の計算
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 基本統計
    const [
      { count: totalTenants },
      { count: totalUsers },
      { count: totalAnalyses },
      { count: periodAnalyses },
    ] = await Promise.all([
      supabase.from('tenants').select('*', { count: 'exact', head: true }),
      supabase.from('user_tenants').select('*', { count: 'exact', head: true }),
      supabase.from('clavi_client_analyses').select('*', { count: 'exact', head: true }),
      supabase.from('clavi_client_analyses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
    ]);

    // ステータス別カウント
    const { data: analysesData } = await supabase
      .from('clavi_client_analyses')
      .select('status, ai_structure_score');

    const statusCounts: Record<string, number> = {
      processing: 0,
      completed: 0,
      failed: 0,
      expired: 0,
    };
    let totalScore = 0;
    let scoreCount = 0;

    (analysesData || []).forEach(item => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }
      if (item.ai_structure_score !== null) {
        totalScore += item.ai_structure_score;
        scoreCount++;
      }
    });

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount * 10) / 10 : 0;
    const successRate = (totalAnalyses || 0) > 0
      ? Math.round((statusCounts.completed / (totalAnalyses || 1)) * 1000) / 10
      : 0;

    // サブスクリプション別テナント数
    const { data: subscriptionData } = await supabase
      .from('tenants')
      .select('subscription_tier');

    const subscriptionCounts: Record<string, number> = {
      starter: 0,
      pro: 0,
      enterprise: 0,
    };
    (subscriptionData || []).forEach(item => {
      if (subscriptionCounts[item.subscription_tier] !== undefined) {
        subscriptionCounts[item.subscription_tier]++;
      }
    });

    // 日別分析数（期間内）
    const { data: dailyData } = await supabase
      .from('clavi_client_analyses')
      .select('created_at, status')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    const dailyStats: Record<string, { total: number; completed: number; failed: number }> = {};
    (dailyData || []).forEach(item => {
      const date = item.created_at.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, completed: 0, failed: 0 };
      }
      dailyStats[date].total++;
      if (item.status === 'completed') {
        dailyStats[date].completed++;
      } else if (item.status === 'failed') {
        dailyStats[date].failed++;
      }
    });

    const dailyChartData = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        ...stats,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 直近のアクティブテナント（過去7日に分析実行）
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { data: activeTenantsData } = await supabase
      .from('clavi_client_analyses')
      .select('tenant_id')
      .gte('created_at', weekAgo.toISOString());

    const activeTenantIds = new Set((activeTenantsData || []).map(d => d.tenant_id));
    const activeTenantsCount = activeTenantIds.size;

    return NextResponse.json({
      overview: {
        totalTenants: totalTenants || 0,
        totalUsers: totalUsers || 0,
        totalAnalyses: totalAnalyses || 0,
        periodAnalyses: periodAnalyses || 0,
        activeTenantsCount,
        avgScore,
        successRate,
      },
      statusCounts,
      subscriptionCounts,
      dailyChartData,
      period,
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
