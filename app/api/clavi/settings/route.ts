import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type {
  GetSettingsResponse,
  UpdateSettingsResponse,
  UpdateSettingsRequest,
} from '@/lib/clavi/types/tenant-settings';

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
 * GET /api/clavi/settings
 * テナント設定を取得（RPC経由）
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('get_tenant_settings');

    if (error) {
      if (error.message?.includes('No tenant context')) {
        return NextResponse.json(
          { error: 'No tenant context. Please select or join a tenant.' },
          { status: 403 }
        );
      }
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
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: UpdateSettingsRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('update_tenant_settings', {
      p_same_as: body.sameAs || null,
      p_author: body.author || null,
    });

    if (error) {
      if (error.message?.includes('Permission denied')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message?.includes('No tenant context')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message?.includes('Tenant not found')) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to update settings', details: error.message },
        { status: 500 }
      );
    }

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
