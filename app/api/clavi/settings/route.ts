/**
 * CLAVI SaaS - テナント設定API
 *
 * @description
 * テナント毎のsameAs, Author設定を管理
 * Phase 8: Google AIO表示最適化のための設定
 *
 * RPC経由でclaviスキーマにアクセス（REST APIではclaviスキーマが公開されていないため）
 *
 * @author NANDS SaaS開発チーム
 * @created 2026-01-20
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type {
  GetSettingsResponse,
  UpdateSettingsResponse,
  UpdateSettingsRequest,
} from '@/lib/clavi/types/tenant-settings';

/**
 * 認証済みSupabaseクライアントを取得
 * Cookie認証とBearer token認証の両方をサポート
 */
async function getAuthenticatedClient(request?: Request) {
  // まずCookie認証を試行
  const cookieClient = createRouteHandlerClient({ cookies });
  const { data: { user: cookieUser }, error: cookieError } = await cookieClient.auth.getUser();

  if (cookieUser && !cookieError) {
    return { supabase: cookieClient, user: cookieUser };
  }

  // Cookie認証失敗時、Bearer token認証を試行
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const tokenClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const { data: { user: tokenUser }, error: tokenError } = await tokenClient.auth.getUser(token);

      if (tokenUser && !tokenError) {
        return { supabase: tokenClient, user: tokenUser };
      }
    }
  }

  return { supabase: null, user: null };
}

/**
 * GET /api/clavi/settings
 * テナント設定を取得（RPC経由）
 */
export async function GET(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedClient(request);

    if (!supabase || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RPC経由でテナント設定を取得
    const { data, error } = await supabase.rpc('get_tenant_settings');

    if (error) {
      console.error('[CLAVI Settings] GET RPC error:', error);

      // テナントコンテキストエラー
      if (error.message?.includes('No tenant context')) {
        return NextResponse.json(
          { error: 'No tenant context. Please select or join a tenant.' },
          { status: 403 }
        );
      }

      // テナントが見つからない
      if (error.message?.includes('Tenant not found')) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch settings', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<GetSettingsResponse>({
      success: true,
      settings: data.settings || {},
    });
  } catch (error) {
    console.error('[CLAVI Settings] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/clavi/settings
 * テナント設定を更新（RPC経由）
 *
 * Body: { sameAs?: SameAsSettings, author?: AuthorSettings }
 */
export async function PATCH(request: Request) {
  console.log('[CLAVI Settings] PATCH request received');
  try {
    const { supabase, user } = await getAuthenticatedClient(request);
    console.log('[CLAVI Settings] Auth result:', { userId: user?.id, hasClient: !!supabase });

    if (!supabase || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // リクエストボディ取得
    let body: UpdateSettingsRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    console.log('[CLAVI Settings] Calling update_tenant_settings RPC');

    // RPC経由でテナント設定を更新
    const { data, error } = await supabase.rpc('update_tenant_settings', {
      p_same_as: body.sameAs || null,
      p_author: body.author || null,
    });

    if (error) {
      console.error('[CLAVI Settings] PATCH RPC error:', error);

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
          { status: 403 }
        );
      }

      // テナントが見つからない
      if (error.message?.includes('Tenant not found')) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update settings', details: error.message },
        { status: 500 }
      );
    }

    console.log('[CLAVI Settings] RPC success:', data);

    return NextResponse.json<UpdateSettingsResponse>({
      success: true,
      message: data.message || 'Settings updated successfully',
      settings: data.settings,
    });
  } catch (error) {
    console.error('[CLAVI Settings] PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
