import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 1. trend_vectorsテーブルの統計情報を取得
    const { data: trendsData, error: trendsError } = await supabase
      .from('trend_vectors')
      .select('*')
      .limit(10);

    if (trendsError) {
      console.error('Trend vectors error:', trendsError);
      return NextResponse.json({ error: 'Failed to fetch trend vectors' }, { status: 500 });
    }

    // 2. postsテーブルの情報を取得
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(5);

    if (postsError) {
      console.error('Posts error:', postsError);
    }

    // 3. コンテンツタイプの統計
    const { data: contentStats, error: contentError } = await supabase
      .from('trend_vectors')
      .select('content_type')
      .limit(1000);

    const contentTypeStats = contentStats?.reduce((acc, item) => {
      acc[item.content_type] = (acc[item.content_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // 4. カテゴリ情報
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(10);

    return NextResponse.json({
      total_records: trendsData?.length || 0,
      content_type_stats: contentTypeStats,
      latest_10_records: trendsData || [],
      posts_sample: postsData || [],
      posts_columns: postsData?.[0] ? Object.keys(postsData[0]) : [],
      posts_error: postsError ? postsError.message : null,
      categories_sample: categoriesData || [],
      categories_error: categoriesError ? categoriesError.message : null,
      debug_info: {
        timestamp: new Date().toISOString(),
        database_connection: 'OK'
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 