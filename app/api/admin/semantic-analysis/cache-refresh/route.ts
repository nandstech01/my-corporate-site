import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // キャッシュ更新ロジック
    const timestamp = new Date().toISOString();
    
    // 既存キャッシュのタイムスタンプ更新
    const { error: updateError } = await supabase
      .from('semantic_similarity_cache')
      .update({ last_calculated: timestamp })
      .gt('similarity_score', 0.7); // 高スコアのアイテムのみ更新

    if (updateError) {
      console.error('Cache update error:', updateError);
      return NextResponse.json(
        { error: 'キャッシュ更新に失敗しました' },
        { status: 500 }
      );
    }

    // 新しいキャッシュエントリを追加（サンプル）
    const newCacheEntries = [
      {
        source_id: 'ai-agents',
        target_id: 'vector-rag',
        similarity_score: 0.85,
        context_type: 'service',
        last_calculated: timestamp
      },
      {
        source_id: 'aio-seo',
        target_id: 'system-development',
        similarity_score: 0.72,
        context_type: 'service', 
        last_calculated: timestamp
      }
    ];

    const { error: insertError } = await supabase
      .from('semantic_similarity_cache')
      .upsert(newCacheEntries, { 
        onConflict: 'source_id,target_id,context_type',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error('Cache insert error:', insertError);
    }

    return NextResponse.json({
      success: true,
      message: 'セマンティックキャッシュを更新しました',
      updatedAt: timestamp,
      newEntries: newCacheEntries.length
    });

  } catch (error) {
    console.error('Cache refresh error:', error);
    return NextResponse.json(
      { 
        error: 'キャッシュ更新処理に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 