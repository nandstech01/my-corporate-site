import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CleanupStats {
  trend_vectors: {
    total_before: number;
    deleted: number;
    remaining: number;
  };
  youtube_vectors: {
    total_before: number;
    deleted: number;
    remaining: number;
  };
  company_vectors: {
    total_before: number;
    deleted: number;
    remaining: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { 
      dry_run = false,
      trend_days = 30,      // Trend RAGは30日で削除
      youtube_days = 90,    // YouTube RAGは90日で削除
      company_days = 365    // Company RAGは365日で削除（生成記事のみ）
    } = await request.json();

    console.log(`🧹 古いRAGデータ削除開始 (${dry_run ? 'DRY RUN' : 'LIVE'})`);
    console.log(`📅 削除対象: Trend=${trend_days}日前, YouTube=${youtube_days}日前, Company=${company_days}日前`);

    const stats: CleanupStats = {
      trend_vectors: { total_before: 0, deleted: 0, remaining: 0 },
      youtube_vectors: { total_before: 0, deleted: 0, remaining: 0 },
      company_vectors: { total_before: 0, deleted: 0, remaining: 0 }
    };

    // 日付しきい値を計算
    const trendThreshold = new Date();
    trendThreshold.setDate(trendThreshold.getDate() - trend_days);
    
    const youtubeThreshold = new Date();
    youtubeThreshold.setDate(youtubeThreshold.getDate() - youtube_days);
    
    const companyThreshold = new Date();
    companyThreshold.setDate(companyThreshold.getDate() - company_days);

    // 1. Trend Vectors の削除
    console.log(`🗞️ Trend RAGデータ削除処理開始...`);
    
    // 削除前のカウント
    const { count: trendCountBefore } = await supabaseServiceRole
      .from('trend_vectors')
      .select('*', { count: 'exact', head: true });
    
    stats.trend_vectors.total_before = trendCountBefore || 0;

    if (!dry_run) {
      const { data: deletedTrendData, error: trendDeleteError } = await supabaseServiceRole
        .from('trend_vectors')
        .delete()
        .lt('trend_date', trendThreshold.toISOString().split('T')[0])
        .select('id');

      if (trendDeleteError) {
        console.error('❌ Trend RAG削除エラー:', trendDeleteError);
        throw trendDeleteError;
      }

      stats.trend_vectors.deleted = deletedTrendData?.length || 0;
    } else {
      // DRY RUN: 削除対象をカウントのみ
      const { count: trendDeleteCount } = await supabaseServiceRole
        .from('trend_vectors')
        .select('*', { count: 'exact', head: true })
        .lt('trend_date', trendThreshold.toISOString().split('T')[0]);

      stats.trend_vectors.deleted = trendDeleteCount || 0;
    }

    stats.trend_vectors.remaining = stats.trend_vectors.total_before - stats.trend_vectors.deleted;

    // 2. YouTube Vectors の削除
    console.log(`🎥 YouTube RAGデータ削除処理開始...`);
    
    // 削除前のカウント
    const { count: youtubeCountBefore } = await supabaseServiceRole
      .from('youtube_vectors')
      .select('*', { count: 'exact', head: true });
    
    stats.youtube_vectors.total_before = youtubeCountBefore || 0;

    if (!dry_run) {
      const { data: deletedYoutubeData, error: youtubeDeleteError } = await supabaseServiceRole
        .from('youtube_vectors')
        .delete()
        .lt('created_at', youtubeThreshold.toISOString())
        .select('id');

      if (youtubeDeleteError) {
        console.error('❌ YouTube RAG削除エラー:', youtubeDeleteError);
        throw youtubeDeleteError;
      }

      stats.youtube_vectors.deleted = deletedYoutubeData?.length || 0;
    } else {
      // DRY RUN: 削除対象をカウントのみ
      const { count: youtubeDeleteCount } = await supabaseServiceRole
        .from('youtube_vectors')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', youtubeThreshold.toISOString());

      stats.youtube_vectors.deleted = youtubeDeleteCount || 0;
    }

    stats.youtube_vectors.remaining = stats.youtube_vectors.total_before - stats.youtube_vectors.deleted;

    // 3. Company Vectors の削除（生成記事のみ）
    console.log(`🏢 Company RAGデータ削除処理開始（生成記事のみ）...`);
    
    // 削除前のカウント
    const { count: companyCountBefore } = await supabaseServiceRole
      .from('company_vectors')
      .select('*', { count: 'exact', head: true });
    
    stats.company_vectors.total_before = companyCountBefore || 0;

    if (!dry_run) {
      const { data: deletedCompanyData, error: companyDeleteError } = await supabaseServiceRole
        .from('company_vectors')
        .delete()
        .eq('content_type', 'generated_blog')
        .lt('created_at', companyThreshold.toISOString())
        .select('id');

      if (companyDeleteError) {
        console.error('❌ Company RAG削除エラー:', companyDeleteError);
        throw companyDeleteError;
      }

      stats.company_vectors.deleted = deletedCompanyData?.length || 0;
    } else {
      // DRY RUN: 削除対象をカウントのみ
      const { count: companyDeleteCount } = await supabaseServiceRole
        .from('company_vectors')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'generated_blog')
        .lt('created_at', companyThreshold.toISOString());

      stats.company_vectors.deleted = companyDeleteCount || 0;
    }

    stats.company_vectors.remaining = stats.company_vectors.total_before - stats.company_vectors.deleted;

    console.log(`✅ 古いRAGデータ削除完了 (${dry_run ? 'DRY RUN' : 'LIVE'})`);
    console.log(`📊 削除統計:`, stats);

    return NextResponse.json({
      success: true,
      dry_run: dry_run,
      stats: stats,
      thresholds: {
        trend: trendThreshold.toISOString().split('T')[0],
        youtube: youtubeThreshold.toISOString(),
        company: companyThreshold.toISOString()
      },
      total_deleted: stats.trend_vectors.deleted + stats.youtube_vectors.deleted + stats.company_vectors.deleted,
      recommendations: {
        trend_vectors: stats.trend_vectors.deleted > 0 
          ? `${stats.trend_vectors.deleted}件の古いニュースを削除しました。ストレージを節約できます。`
          : '削除対象のニュースはありません。',
        youtube_vectors: stats.youtube_vectors.deleted > 0 
          ? `${stats.youtube_vectors.deleted}件の古いYouTube動画を削除しました。`
          : '削除対象のYouTube動画はありません。',
        company_vectors: stats.company_vectors.deleted > 0 
          ? `${stats.company_vectors.deleted}件の古い生成記事を削除しました。`
          : '削除対象の生成記事はありません。'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 古いRAGデータ削除エラー:', error);
    return NextResponse.json(
      { 
        error: '古いRAGデータ削除でエラーが発生しました',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

// GET リクエストで削除対象をプレビュー
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trend_days = parseInt(searchParams.get('trend_days') || '30');
  const youtube_days = parseInt(searchParams.get('youtube_days') || '90');
  const company_days = parseInt(searchParams.get('company_days') || '365');

  try {
    // 日付しきい値を計算
    const trendThreshold = new Date();
    trendThreshold.setDate(trendThreshold.getDate() - trend_days);
    
    const youtubeThreshold = new Date();
    youtubeThreshold.setDate(youtubeThreshold.getDate() - youtube_days);
    
    const companyThreshold = new Date();
    companyThreshold.setDate(companyThreshold.getDate() - company_days);

    // 削除対象をプレビュー
    const { count: trendDeleteCount } = await supabaseServiceRole
      .from('trend_vectors')
      .select('*', { count: 'exact', head: true })
      .lt('trend_date', trendThreshold.toISOString().split('T')[0]);

    const { count: youtubeDeleteCount } = await supabaseServiceRole
      .from('youtube_vectors')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', youtubeThreshold.toISOString());

    const { count: companyDeleteCount } = await supabaseServiceRole
      .from('company_vectors')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'generated_blog')
      .lt('created_at', companyThreshold.toISOString());

    return NextResponse.json({
      preview: true,
      deletion_targets: {
        trend_vectors: trendDeleteCount || 0,
        youtube_vectors: youtubeDeleteCount || 0,
        company_vectors: companyDeleteCount || 0
      },
      thresholds: {
        trend: trendThreshold.toISOString().split('T')[0],
        youtube: youtubeThreshold.toISOString(),
        company: companyThreshold.toISOString()
      },
      total_targets: (trendDeleteCount || 0) + (youtubeDeleteCount || 0) + (companyDeleteCount || 0),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 削除対象プレビューエラー:', error);
    return NextResponse.json(
      { 
        error: '削除対象プレビューでエラーが発生しました',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 