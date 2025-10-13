import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 個別トレンドRAGの削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`🗑️ トレンドRAG削除: ID ${id}`);

    const { error } = await supabaseServiceRole
      .from('trend_rag')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('❌ 削除エラー:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ 削除完了: ID ${id}`);

    return NextResponse.json({
      success: true,
      message: `トレンドRAG（ID: ${id}）を削除しました`
    });

  } catch (error) {
    console.error('❌ トレンドRAG削除エラー:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

