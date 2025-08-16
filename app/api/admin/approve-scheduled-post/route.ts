import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { postId, approved } = await request.json();

    if (!postId || typeof approved !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: '無効なパラメーターです'
      }, { status: 400 });
    }

    // スケジュールされた記事の状態を更新
    const { data, error } = await supabaseServiceRole
      .from('scheduled_posts')
      .update({ 
        status: approved ? 'approved' : 'rejected',
        approved_at: approved ? new Date().toISOString() : null,
        rejected_at: !approved ? new Date().toISOString() : null
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('Approval update error:', error);
      return NextResponse.json({
        success: false,
        error: '承認状態の更新に失敗しました'
      }, { status: 500 });
    }

    // 承認された場合、自動実行キューに追加（将来実装）
    if (approved) {
      // TODO: 実際の記事生成処理への連携
      console.log(`✅ 記事 ${postId} が承認されました。実行予定: ${data.scheduled_for}`);
    }

    return NextResponse.json({
      success: true,
      status: approved ? 'approved' : 'rejected',
      message: approved ? '記事が承認されました' : '記事が拒否されました'
    });

  } catch (error) {
    console.error('Approve scheduled post API error:', error);
    return NextResponse.json({
      success: false,
      error: 'APIエラーが発生しました'
    }, { status: 500 });
  }
} 