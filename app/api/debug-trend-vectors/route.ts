import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 trend_vectorsテーブルの構造とデータを確認中...');

    // 1. テーブルの構造を確認
    const { data: tableInfo, error: tableError } = await supabaseServiceRole
      .rpc('get_table_schema', { table_name: 'trend_vectors' })
      .limit(1);

    // 2. 実際のデータを数件取得して構造を確認
    const { data: sampleData, error: sampleError } = await supabaseServiceRole
      .from('trend_vectors')
      .select('*')
      .limit(5);

    if (sampleError) {
      console.error('❌ サンプルデータ取得エラー:', sampleError);
    }

    // 3. カラム名を確認（PgREST APIを使用）
    const { data: columnsCheck, error: columnsError } = await supabaseServiceRole
      .from('trend_vectors')
      .select()
      .limit(1)
      .single();

    // 4. 日付系フィールドの値を確認
    let dateFieldsAnalysis = null;
    if (sampleData && sampleData.length > 0) {
      const firstRow = sampleData[0];
      dateFieldsAnalysis = {
        available_fields: Object.keys(firstRow),
        created_at: firstRow.created_at,
        updated_at: firstRow.updated_at,
        trend_date: firstRow.trend_date || 'フィールドが存在しません',
        metadata: firstRow.metadata
      };
    }

    // 5. 1日前より古いデータの件数を複数のフィールドで確認
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oneDayAgoISO = oneDayAgo.toISOString();
    const oneDayAgoDate = oneDayAgo.toISOString().split('T')[0];

    let created_at_count = 0;
    let trend_date_count = 0;
    let metadata_published_count = 0;

    // created_atでの確認
    try {
      const { count: createdCount } = await supabaseServiceRole
        .from('trend_vectors')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', oneDayAgoISO);
      created_at_count = createdCount || 0;
    } catch (e) {
      console.error('created_at確認エラー:', e);
    }

    // trend_dateでの確認（存在する場合）
    try {
      const { count: trendCount } = await supabaseServiceRole
        .from('trend_vectors')
        .select('*', { count: 'exact', head: true })
        .lt('trend_date', oneDayAgoDate);
      trend_date_count = trendCount || 0;
    } catch (e) {
      console.error('trend_date確認エラー:', e);
    }

    // metadata->publishedでの確認
    try {
      const { count: metadataCount } = await supabaseServiceRole
        .from('trend_vectors')
        .select('*', { count: 'exact', head: true })
        .lt('metadata->published', oneDayAgoISO);
      metadata_published_count = metadataCount || 0;
    } catch (e) {
      console.error('metadata->published確認エラー:', e);
    }

    // 6. 全件数確認
    const { count: totalCount } = await supabaseServiceRole
      .from('trend_vectors')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      debug_info: {
        table_structure_available: !tableError,
        sample_data_count: sampleData?.length || 0,
        total_records: totalCount || 0,
        date_fields_analysis: dateFieldsAnalysis,
        one_day_ago_analysis: {
          threshold_iso: oneDayAgoISO,
          threshold_date: oneDayAgoDate,
          created_at_older_count: created_at_count,
          trend_date_older_count: trend_date_count,
          metadata_published_older_count: metadata_published_count
        },
        sample_records: sampleData?.map(record => ({
          id: record.id,
          created_at: record.created_at,
          trend_date: record.trend_date,
          metadata_published: record.metadata?.published,
          metadata_retrieved_at: record.metadata?.retrieved_at,
          available_keys: Object.keys(record)
        })) || []
      },
      recommendations: {
        correct_date_field: created_at_count > 0 ? 'created_at' : 
                          trend_date_count > 0 ? 'trend_date' : 
                          metadata_published_count > 0 ? 'metadata->published' : 
                          'unknown',
        should_use_created_at: created_at_count > 0,
        should_use_trend_date: trend_date_count > 0,
        should_use_metadata: metadata_published_count > 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ デバッグAPI エラー:', error);
    return NextResponse.json(
      { 
        error: 'デバッグ処理でエラーが発生しました',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 