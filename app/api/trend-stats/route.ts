import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // trend_ragテーブルから全トレンドデータを取得（UIで表示するため）
    const { data: allTrends, error: allTrendsError } = await supabaseServiceRole
      .from('trend_rag')
      .select('*')
      .order('created_at', { ascending: false });

    if (allTrendsError) {
      console.error('Trend RAG error:', allTrendsError);
    }

    // trend_vectorsテーブルの統計情報を取得
    const { data: trendData, error: trendError } = await supabaseServiceRole
      .from('trend_vectors')
      .select('id, content_type, created_at', { count: 'exact' });

    if (trendError) {
      console.error('Trend vectors error:', trendError);
      return NextResponse.json({ error: trendError.message }, { status: 500 });
    }

    // company_vectorsテーブルの統計情報を取得
    const { data: companyData, error: companyError } = await supabaseServiceRole
      .from('company_vectors')
      .select('id, content_type', { count: 'exact' });

    if (companyError) {
      console.error('Company vectors error:', companyError);
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }

    // youtube_vectorsテーブルの統計情報を取得
    const { data: youtubeData, error: youtubeError } = await supabaseServiceRole
      .from('youtube_vectors')
      .select('id, content_type, created_at, educational_score, complexity_level, implementation_score', { count: 'exact' });

    if (youtubeError) {
      console.error('YouTube vectors error:', youtubeError);
      // YouTube vectorsテーブルが存在しない場合はエラーを無視
      console.log('YouTube vectors table not found, skipping...');
    }

    // 統計情報を計算
    const trendStats = {
      total: trendData?.length || 0,
      news: trendData?.filter(item => item.content_type === 'news').length || 0,
      last_24h: trendData?.filter(item => {
        const itemDate = new Date(item.created_at);
        const now = new Date();
        const diff = now.getTime() - itemDate.getTime();
        return diff <= 24 * 60 * 60 * 1000; // 24時間以内
      }).length || 0
    };

    const companyStats = {
      total: companyData?.length || 0
    };

    // YouTube vectorsの統計情報を計算
    const youtubeStats = {
      total: youtubeData?.length || 0,
      educational_videos: youtubeData?.filter(item => item.educational_score > 0.7).length || 0,
      beginner_level: youtubeData?.filter(item => item.complexity_level === 1).length || 0,
      intermediate_level: youtubeData?.filter(item => item.complexity_level === 2).length || 0,
      advanced_level: youtubeData?.filter(item => item.complexity_level === 3).length || 0,
      implementation_focused: youtubeData?.filter(item => item.implementation_score > 0.6).length || 0,
      last_7_days: youtubeData?.filter(item => {
        const itemDate = new Date(item.created_at);
        const now = new Date();
        const diff = now.getTime() - itemDate.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000; // 7日以内
      }).length || 0,
      average_educational_score: youtubeData && youtubeData.length > 0 
        ? (youtubeData.reduce((sum, item) => sum + (item.educational_score || 0), 0) / youtubeData.length).toFixed(2)
        : '0',
      status: youtubeData && youtubeData.length > 0 ? 'active' : 'ready'
    };

    const response = NextResponse.json({
      trends: allTrends || [], // 🆕 UIで使用するトレンドデータ
      trend_vectors: trendStats,
      company_vectors: companyStats,
      youtube_vectors: youtubeStats,
      third_rag: youtubeStats, // 後方互換性のため
      summary: {
        total_vectors: trendStats.total + companyStats.total + youtubeStats.total,
        active_systems: [
          companyStats.total > 0 ? 'company' : null,
          trendStats.total > 0 ? 'trend' : null,
          youtubeStats.total > 0 ? 'youtube' : null
        ].filter(Boolean).length,
        last_updated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

    // キャッシュ制御ヘッダーを追加
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch statistics',
      details: (error as Error).message
    }, { status: 500 });
  }
} 