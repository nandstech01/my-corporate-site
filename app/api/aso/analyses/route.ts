/**
 * ASO SaaS - 分析一覧取得API
 * 
 * @description
 * テナント内の全分析一覧を取得（ページネーション、フィルタリング対応）
 * RLS（Row Level Security）により、テナント分離が保証される
 * 
 * @author NANDS SaaS開発チーム
 * @created 2025-01-10
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * 分析一覧アイテム型
 */
interface AnalysisListItem {
  id: string;
  url: string;
  company_name: string | null;
  ai_structure_score: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * 分析一覧レスポンス型
 */
interface AnalysesListResponse {
  analyses: AnalysisListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * GET /api/aso/analyses
 * 
 * 分析一覧を取得（ページネーション対応）
 * 
 * @query page - ページ番号（1から開始、デフォルト: 1）
 * @query limit - 1ページあたりの件数（デフォルト: 20、最大: 100）
 * @query status - ステータスフィルタ（pending, processing, completed, failed）
 * @query sort - ソート順（created_at_desc, created_at_asc, score_desc, score_asc）
 * 
 * @example
 * ```typescript
 * // デフォルト（ページ1、20件）
 * const response = await fetch('/api/aso/analyses');
 * 
 * // ページ2、50件、完了済みのみ、スコア順
 * const response = await fetch('/api/aso/analyses?page=2&limit=50&status=completed&sort=score_desc');
 * 
 * const data = await response.json();
 * console.log(data.analyses);
 * console.log(data.pagination.total);
 * ```
 */
export async function GET(request: Request) {
  try {
    // クエリパラメータ解析
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const status = searchParams.get('status') || null;
    const sort = searchParams.get('sort') || 'created_at_desc';

    // 認証確認（Authorization ヘッダーまたはCookie）
    const authHeader = request.headers.get('authorization');
    let supabase;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    } else {
      supabase = createRouteHandlerClient({ cookies });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // テナントコンテキスト取得（analyze APIと同じロジック）
    let tenant_id: string | null = null;
    let tenant_role: string | null = null;

    const { data: context, error: contextError } = await supabase
      .rpc('get_current_tenant_context');

    if (!contextError && context?.tenant_id) {
      tenant_id = context.tenant_id;
      tenant_role = context.tenant_role;
      console.log('[ASO] Using tenant from RPC:', tenant_id, tenant_role);
    } else {
      // Fallback: analyze APIと同じRPC関数を使用
      console.log('[ASO] RPC failed, using fallback. User ID:', user.id);
      
      const { data: membership, error: membershipError } = await supabase
        .rpc('get_user_tenant_by_id', { p_user_id: user.id })
        .single<{ tenant_id: string; role: string }>();

      console.log('[ASO] Membership query result:', { membership, error: membershipError });

      if (membershipError || !membership) {
        console.error('[ASO] No tenant context:', membershipError);
        return NextResponse.json(
          { error: 'No tenant context. Please select or join a tenant.' },
          { status: 403 }
        );
      }

      tenant_id = membership.tenant_id;
      tenant_role = membership.role;
      console.log('[ASO] Using tenant from fallback:', tenant_id, tenant_role);
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'No tenant context' },
        { status: 403 }
      );
    }

    console.log('[ASO] Listing analyses for tenant:', tenant_id);

    // RPC関数で取得（Phase 5準拠）
    const offset = (page - 1) * limit;
    const { data: analyses, error: fetchError } = await supabase
      .rpc('list_client_analyses', {
        p_tenant_id: tenant_id,
        p_limit: limit,
        p_offset: offset,
      });

    console.log('[ASO] List result:', { count: analyses?.length || 0, error: fetchError });

    if (fetchError) {
      console.error('分析一覧取得エラー:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      );
    }

    // クライアント側でフィルタ・ソート（シンプル実装）
    let filteredAnalyses = analyses || [];
    
    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
      filteredAnalyses = filteredAnalyses.filter((a: any) => a.status === status);
    }

    // ソート
    switch (sort) {
      case 'created_at_asc':
        filteredAnalyses.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'score_desc':
        filteredAnalyses.sort((a: any, b: any) => (b.ai_structure_score || 0) - (a.ai_structure_score || 0));
        break;
      case 'score_asc':
        filteredAnalyses.sort((a: any, b: any) => (a.ai_structure_score || 0) - (b.ai_structure_score || 0));
        break;
      case 'created_at_desc':
      default:
        // デフォルトで降順
        break;
    }

    const total = filteredAnalyses.length;
    const total_pages = Math.ceil(total / limit);

    return NextResponse.json<AnalysesListResponse>(
      {
        analyses: filteredAnalyses || [],
        pagination: {
          page,
          limit,
          total,
          total_pages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ASO] List analyses error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/aso/analyses
 * 
 * 一括分析実行（バッチ処理）
 * 
 * @body urls - URL配列（最大10件）
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/aso/analyses', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     urls: [
 *       'https://example.com',
 *       'https://example.com/about',
 *       'https://example.com/contact'
 *     ]
 *   })
 * });
 * const data = await response.json();
 * console.log(data.results);
 * ```
 */
export async function POST(request: Request) {
  try {
    // リクエストボディ解析
    const body = await request.json();
    const { urls } = body;

    // バリデーション
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'urls must be a non-empty array' },
        { status: 400 }
      );
    }

    if (urls.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 URLs allowed per batch' },
        { status: 400 }
      );
    }

    // すべてのURLが文字列か確認
    if (!urls.every(url => typeof url === 'string')) {
      return NextResponse.json(
        { error: 'All URLs must be strings' },
        { status: 400 }
      );
    }

    // 認証確認（Authorization ヘッダーまたはCookie）
    const authHeader = request.headers.get('authorization');
    let supabase;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    } else {
      supabase = createRouteHandlerClient({ cookies });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // テナントコンテキスト取得
    let tenant_id: string | null = null;

    const { data: context, error: contextError } = await supabase
      .rpc('get_current_tenant_context');

    if (!contextError && context?.tenant_id) {
      tenant_id = context.tenant_id;
    } else {
      // Fallback: 直接 user_tenants から取得
      const { data: membership, error: membershipError } = await supabase
      .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'No tenant context' },
          { status: 403 }
        );
      }

      tenant_id = membership.tenant_id;
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'No tenant context' },
        { status: 403 }
      );
    }

    // 各URLを順次処理
    const results = [];

    for (const url of urls) {
      try {
        // /api/aso/analyzeを内部的に呼び出し
        const analyzeResponse = await fetch(`${request.url.replace('/analyses', '/analyze')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Cookieをパススルー
            'Cookie': request.headers.get('Cookie') || '',
          },
          body: JSON.stringify({ url }),
        });

        const analyzeData = await analyzeResponse.json();

        results.push({
          url,
          success: analyzeResponse.ok,
          status: analyzeResponse.status,
          data: analyzeData,
        });
      } catch (error) {
        results.push({
          url,
          success: false,
          status: 500,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;

    return NextResponse.json(
      {
        message: `Batch analysis completed: ${successCount} succeeded, ${failedCount} failed`,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failedCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ASO] Batch analyses error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

