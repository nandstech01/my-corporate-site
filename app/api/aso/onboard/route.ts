import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // リクエストボディ
  const { tenant_name } = await request.json();
  if (!tenant_name || tenant_name.trim().length === 0) {
    return NextResponse.json({ 
      error: 'tenant_name is required and cannot be empty' 
    }, { status: 400 });
  }

  // RPC実行（冪等: 既存所属なら既存tenant_id返す）
  const { data: tenant_id, error: onboardError } = await supabase
    .rpc('onboard', { tenant_name: tenant_name.trim() });

  if (onboardError) {
    // tenant_name空などのバリデーションエラー
    if (onboardError.code === '23514' || onboardError.message?.includes('cannot be empty')) {
      return NextResponse.json({ 
        error: 'Invalid tenant_name',
        details: onboardError.message 
      }, { status: 400 });
    }

    // その他のエラー
    return NextResponse.json({ 
      error: 'Failed to onboard',
      details: onboardError.message 
    }, { status: 500 });
  }

  // 冪等設計: 既存/新規どちらでも200（成功扱い）
  return NextResponse.json({
    success: true,
    tenant_id: tenant_id,
    message: 'Onboarded successfully. Please re-login to activate tenant context.'
  });
}

