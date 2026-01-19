import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import * as jose from 'jose';
import { createClient } from '@supabase/supabase-js';

// 環境変数取得
const OIDC_EXPECTED_AUDIENCE = process.env.OIDC_EXPECTED_AUDIENCE || 'https://nands.tech/api/aso/job-token';
const JOB_SERVICE_ACCOUNT_EMAIL = process.env.JOB_SERVICE_ACCOUNT_EMAIL || '';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';
const SUPABASE_JWT_ISSUER = process.env.SUPABASE_JWT_ISSUER || '';
const SUPABASE_JWT_AUDIENCE = process.env.SUPABASE_JWT_AUDIENCE || 'authenticated';
const SUPABASE_JWT_ROLE = process.env.SUPABASE_JWT_ROLE || 'authenticated';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

/**
 * ジョブトークン発行API
 * Cloud Run JobsからのOIDC IDトークンを検証し、Supabase JWTを発行
 */
export async function POST(request: Request) {
  try {
    // Step 1: Authorization ヘッダーからOIDC IDトークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const oidcIdToken = authHeader.substring(7); // "Bearer " を削除

    // Step 2: X-Tenant-ID ヘッダーから tenant_id を取得
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing X-Tenant-ID header' },
        { status: 400 }
      );
    }

    // Step 3: OIDC IDトークンを検証
    const client = new OAuth2Client();
    let payload;
    
    try {
      const ticket = await client.verifyIdToken({
        idToken: oidcIdToken,
        audience: OIDC_EXPECTED_AUDIENCE,
      });
      payload = ticket.getPayload();
    } catch (error) {
      console.error('❌ OIDC検証エラー:', error);
      return NextResponse.json(
        { error: 'Invalid OIDC ID token', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 401 }
      );
    }

    // Step 4: ペイロード検証
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    // issuer検証（Googleからの発行）
    if (payload.iss !== 'https://accounts.google.com') {
      console.error('❌ issuer不正:', payload.iss);
      return NextResponse.json(
        { error: 'Invalid token issuer' },
        { status: 401 }
      );
    }

    // audience検証
    if (payload.aud !== OIDC_EXPECTED_AUDIENCE) {
      console.error('❌ audience不正:', payload.aud, '期待値:', OIDC_EXPECTED_AUDIENCE);
      return NextResponse.json(
        { error: 'Invalid token audience' },
        { status: 401 }
      );
    }

    // サービスアカウントメール検証
    if (payload.email !== JOB_SERVICE_ACCOUNT_EMAIL) {
      console.error('❌ email不正:', payload.email, '期待値:', JOB_SERVICE_ACCOUNT_EMAIL);
      return NextResponse.json(
        { error: 'Invalid service account' },
        { status: 401 }
      );
    }

    // email_verified検証
    if (!payload.email_verified) {
      console.error('❌ email未検証');
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 401 }
      );
    }

    console.log('✅ OIDC検証成功:', {
      iss: payload.iss,
      aud: payload.aud,
      email: payload.email,
      sub: payload.sub,
      tenant_id: tenantId
    });

    // Step 5: Supabase JWT発行
    if (!SUPABASE_JWT_SECRET || !SUPABASE_JWT_ISSUER) {
      console.error('❌ SUPABASE_JWT_SECRET未設定');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ SUPABASE_URL / SUPABASE_ANON_KEY 未設定');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    /**
     * Step 5.1: ジョブ専用ユーザー（auth.users実体）を取得/作成
     * - service_roleキーは使わない
     * - `public.get_or_create_job_user()` を "authenticated" JWT で呼び出す
     */
    const secret = new TextEncoder().encode(SUPABASE_JWT_SECRET);
    const bootstrapNow = Math.floor(Date.now() / 1000);
    const bootstrapJwt = await new jose.SignJWT({
      iss: SUPABASE_JWT_ISSUER,
      aud: SUPABASE_JWT_AUDIENCE,
      role: 'authenticated',
      sub: payload.sub || 'cloud_run_job',
      iat: bootstrapNow,
      exp: bootstrapNow + 60, // 60秒だけ有効（RPC呼び出し用）
      'https://nands.tech/source': 'job_token_issuer',
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(secret);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          Authorization: `Bearer ${bootstrapJwt}`,
        },
      },
    });

    const { data: jobUserData, error: jobUserError } = await supabase.rpc('get_or_create_job_user', {
      p_tenant_id: tenantId,
    });

    if (jobUserError || !jobUserData?.auth_user_id) {
      console.error('❌ get_or_create_job_user RPC失敗:', jobUserError);
      return NextResponse.json(
        { error: 'Failed to resolve job user' },
        { status: 500 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // 1時間有効

    // JWT custom claim（RLS用）
    const jwtPayload = {
      iss: SUPABASE_JWT_ISSUER,
      aud: SUPABASE_JWT_AUDIENCE,
      role: SUPABASE_JWT_ROLE,
      sub: jobUserData.auth_user_id, // ✅ auth.users 実体ユーザーID（auth.uid()前提RLSでも動作）
      iat: now,
      exp: exp,
      'https://nands.tech/tenant_id': tenantId, // custom claim
      'https://nands.tech/tenant_role': 'member', // ジョブは常にmember
      'https://nands.tech/source': 'cloud_run_job', // ジョブからの発行であることを明示
    };

    const jobToken = await new jose.SignJWT(jwtPayload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(secret);

    console.log('✅ Supabase JWT発行成功:', {
      tenant_id: tenantId,
      exp: new Date(exp * 1000).toISOString(),
    });

    // Step 6: レスポンス
    return NextResponse.json({
      success: true,
      job_token: jobToken,
      access_token: jobToken, // jobs/production との互換のため（実体は同じJWT）
      tenant_id: tenantId,
      expires_at: new Date(exp * 1000).toISOString(),
    });

  } catch (error) {
    console.error('❌ ジョブトークン発行エラー:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

