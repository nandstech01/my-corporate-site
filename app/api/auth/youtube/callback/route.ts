import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getYouTubeTokensFromCode } from '@/lib/youtube/client';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * YouTube OAuth コールバック
 * GET /api/auth/youtube/callback?code=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/video-jobs?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/video-jobs?error=no_code', request.url)
      );
    }

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/youtube/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/admin/video-jobs?error=config_missing', request.url)
      );
    }

    // 認証コードからトークンを取得
    const tokens = await getYouTubeTokensFromCode(
      { clientId, clientSecret, redirectUri },
      code
    );

    // Supabaseでユーザーを取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    const sessionCookies = allCookies
      .filter(cookie => cookie.name.startsWith('sb-'))
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          Cookie: sessionCookies,
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        new URL('/admin?error=authentication_required', request.url)
      );
    }

    // YouTube認証情報をDBに保存
    const { error: upsertError } = await supabase
      .from('youtube_auth')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at,
        scope: tokens.scope,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Error saving YouTube auth:', upsertError);
      return NextResponse.redirect(
        new URL('/admin/video-jobs?error=save_failed', request.url)
      );
    }

    // 成功リダイレクト
    return NextResponse.redirect(
      new URL('/admin/video-jobs?youtube_auth=success', request.url)
    );
  } catch (error: any) {
    console.error('Error in YouTube OAuth callback:', error);
    return NextResponse.redirect(
      new URL(`/admin/video-jobs?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

