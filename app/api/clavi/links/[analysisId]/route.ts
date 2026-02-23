/**
 * CLAVI SaaS - リンク推奨取得API
 *
 * @description
 * 分析IDからリンク推奨データを取得
 * RLS（Row Level Security）により、テナント分離が保証される
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

export async function GET(
  request: Request,
  { params }: { params: { analysisId: string } }
) {
  try {
    const { analysisId } = params;

    // UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(analysisId)) {
      return NextResponse.json(
        { error: 'Invalid analysis ID format' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get tenant context
    let tenant_id: string | null = null;

    const { data: context, error: contextError } = await supabase
      .rpc('get_current_tenant_context');

    if (!contextError && context?.tenant_id) {
      tenant_id = context.tenant_id;
    } else {
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

    // Fetch analysis (RLS ensures tenant isolation)
    const { data: analysis, error: fetchError } = await supabase
      .from('clavi_client_analyses')
      .select('id, url, company_name, analysis_data, ai_structure_score, status, created_at')
      .eq('id', analysisId)
      .eq('tenant_id', tenant_id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analysis not found or access denied' },
          { status: 404 }
        );
      }

      console.error('[CLAVI Links] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch analysis' },
        { status: 500 }
      );
    }

    if (analysis.status !== 'completed') {
      return NextResponse.json(
        {
          recommendations: [],
          summary: {
            totalFragments: 0,
            avgRecommendations: 0,
            strongLinks: 0,
            moderateLinks: 0,
          },
          message: 'Analysis is not yet completed',
        },
        { status: 200 }
      );
    }

    const analysisData = analysis.analysis_data;
    const linkRecommendations = analysisData?.link_recommendations
      || analysisData?.internalLinkRecommendations
      || [];

    // Build summary stats
    const fragments = analysisData?.fragments || analysisData?.haspart_schemas || [];
    const totalFragments = fragments.length;

    const strongLinks = linkRecommendations.filter(
      (r: any) => (r.score ?? r.relevance ?? 0) >= 80
    ).length;
    const moderateLinks = linkRecommendations.filter(
      (r: any) => {
        const score = r.score ?? r.relevance ?? 0;
        return score >= 50 && score < 80;
      }
    ).length;
    const avgRecommendations = totalFragments > 0
      ? Math.round(linkRecommendations.length / totalFragments)
      : 0;

    return NextResponse.json(
      {
        recommendations: linkRecommendations,
        analysis: {
          id: analysis.id,
          url: analysis.url,
          companyName: analysis.company_name,
          score: analysis.ai_structure_score,
          createdAt: analysis.created_at,
        },
        summary: {
          totalFragments,
          avgRecommendations,
          strongLinks,
          moderateLinks,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CLAVI Links] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
