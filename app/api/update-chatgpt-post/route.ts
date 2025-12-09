import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Keyを使用してRLSをバイパス
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '記事IDが必要です' },
        { status: 400 }
      );
    }

    console.log(`[chatgpt_posts更新] ID: ${id}`);
    console.log('[chatgpt_posts更新] 更新データ:', Object.keys(updateData));

    // chatgpt_postsテーブルを更新
    const { data, error } = await supabaseAdmin
      .from('chatgpt_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[chatgpt_posts更新] エラー:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log('[chatgpt_posts更新] 成功:', data?.id);

    return NextResponse.json({
      success: true,
      data,
      message: '記事が更新されました'
    });
  } catch (error: any) {
    console.error('[chatgpt_posts更新] 予期せぬエラー:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新に失敗しました' },
      { status: 500 }
    );
  }
}

