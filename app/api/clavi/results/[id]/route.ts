/**
 * CLAVI SaaS - 分析結果取得API
 *
 * @description
 * 分析IDから結果を取得
 * RLS（Row Level Security）により、テナント分離が保証される
 *
 * @author NANDS SaaS開発チーム
 * @created 2025-01-10
 */

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
 * 分析結果レスポンス型
 */
interface AnalysisResultResponse {
  id: string;
  tenant_id: string;
  url: string;
  company_name: string | null;
  analysis_data: any;
  ai_structure_score: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/clavi/results/[id]
 *
 * 分析結果を取得
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/clavi/results/123e4567-e89b-12d3-a456-426614174000');
 * const data = await response.json();
 * console.log(data.analysis_data);
 * ```
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // UUID形式チェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid analysis ID format' },
        { status: 400 }
      );
    }

    // 認証確認
    const supabase = await createSupabaseServerClient();

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
      // Fallback: RPC関数を使用（/api/clavi/analyses と同じロジック）
      const { data: membership, error: membershipError } = await supabase
        .rpc('get_user_tenant_by_id', { p_user_id: user.id })
        .single<{ tenant_id: string; role: string }>();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'No tenant context. Please select or join a tenant.' },
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

    // 分析結果取得（RLSにより自動的にテナント分離）
    const { data: analysis, error: fetchError } = await supabase
      .from('clavi_client_analyses')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // 見つからない、またはRLSにより拒否
        return NextResponse.json(
          { error: 'Analysis not found or access denied' },
          { status: 404 }
        );
      }

      console.error('[CLAVI Results] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json<AnalysisResultResponse>(analysis, { status: 200 });
  } catch (error) {
    console.error('[CLAVI] Get result error:', error);
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
 * DELETE /api/clavi/results/[id]
 *
 * 分析結果を削除（owner/adminのみ）
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/clavi/results/123e4567-e89b-12d3-a456-426614174000', {
 *   method: 'DELETE'
 * });
 * ```
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // UUID形式チェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid analysis ID format' },
        { status: 400 }
      );
    }

    // 認証確認
    const supabase = await createSupabaseServerClient();

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

    let tenant_role: string | null = null;

    if (!contextError && context?.tenant_id) {
      tenant_id = context.tenant_id;
      tenant_role = context.tenant_role;
    } else {
      // Fallback: RPC関数を使用
      const { data: membership, error: membershipError } = await supabase
        .rpc('get_user_tenant_by_id', { p_user_id: user.id })
        .single<{ tenant_id: string; role: string }>();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'No tenant context. Please select or join a tenant.' },
          { status: 403 }
        );
      }

      tenant_id = membership.tenant_id;
      tenant_role = membership.role;
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'No tenant context' },
        { status: 403 }
      );
    }

    // 権限チェック（owner/adminのみ削除可能）
    if (tenant_role !== 'owner' && tenant_role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only owner/admin can delete.' },
        { status: 403 }
      );
    }

    // 分析結果削除（RLSにより自動的にテナント分離）
    const { error: deleteError } = await supabase
      .from('clavi_client_analyses')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenant_id);

    if (deleteError) {
      console.error('分析削除エラー:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Analysis deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CLAVI] Delete result error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
