import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// AI引用分析データの型定義
interface AIQuotationAnalytics {
  totalQuotations: number;
  averageQualityScore: number;
  quotationsByEngine: { [engine: string]: number };
  quotationsByType: { [type: string]: number };
  qualityDistribution: {
    excellent: number;  // 0.9以上
    good: number;       // 0.7-0.9
    average: number;    // 0.5-0.7
    poor: number;       // 0.5未満
  };
  fragmentPerformance: Array<{
    fragment_id: string;
    complete_uri: string;
    quotation_count: number;
    average_quality: number;
    best_engine: string;
    latest_quotation: string;
  }>;
  engineComparison: Array<{
    ai_engine: string;
    quotation_count: number;
    average_quality: number;
    quality_trend: 'up' | 'down' | 'stable';
  }>;
  recentQuotations: Array<{
    fragment_id: string;
    complete_uri: string;
    ai_engine: string;
    quotation_context: string;
    quality_score: number;
    quotation_type: string;
    detected_at: string;
  }>;
  contextAnalysis: Array<{
    context_keyword: string;
    frequency: number;
    average_quality: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 AI引用分析データ取得開始...');

    // URLパラメータから期間を取得（デフォルト: 30日間）
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const aiEngine = searchParams.get('ai_engine');
    const fragmentId = searchParams.get('fragment_id');

    // 1. AI引用履歴の基本データ取得（実データのみ - サンプルデータ除外）
    let query = supabase
      .from('ai_quotation_history')
      .select(`
        fragment_id,
        complete_uri,
        ai_engine,
        quotation_context,
        quotation_quality_score,
        quotation_type,
        detected_source,
        detected_at,
        created_at
      `)
      .neq('detected_source', 'manual') // サンプルデータ（manual）を除外し、実データ（auto-detection）のみ取得
      .gte('detected_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('detected_at', { ascending: false });

    // フィルタリング
    if (aiEngine) {
      query = query.eq('ai_engine', aiEngine);
    }
    if (fragmentId) {
      query = query.eq('fragment_id', fragmentId);
    }

    const { data: quotationData, error: quotationError } = await query;

    if (quotationError) {
      console.error('❌ AI引用データ取得エラー:', quotationError);
      throw quotationError;
    }

    if (!quotationData || quotationData.length === 0) {
      console.log('⚠️ AI引用データが見つかりません');
      return NextResponse.json({
        success: true,
        analytics: {
          totalQuotations: 0,
          averageQualityScore: 0,
          quotationsByEngine: {},
          quotationsByType: {},
          qualityDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
          fragmentPerformance: [],
          engineComparison: [],
          recentQuotations: [],
          contextAnalysis: []
        }
      });
    }

    // 2. 基本統計の計算
    const totalQuotations = quotationData.length;
    const averageQualityScore = quotationData.reduce((sum, item) => sum + (item.quotation_quality_score || 0), 0) / totalQuotations;

    // 3. エンジン別引用数
    const quotationsByEngine = quotationData.reduce((acc, item) => {
      acc[item.ai_engine] = (acc[item.ai_engine] || 0) + 1;
      return acc;
    }, {} as { [engine: string]: number });

    // 4. タイプ別引用数
    const quotationsByType = quotationData.reduce((acc, item) => {
      const type = item.quotation_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [type: string]: number });

    // 5. 品質分布
    const qualityDistribution = {
      excellent: quotationData.filter(item => (item.quotation_quality_score || 0) >= 0.9).length,
      good: quotationData.filter(item => (item.quotation_quality_score || 0) >= 0.7 && (item.quotation_quality_score || 0) < 0.9).length,
      average: quotationData.filter(item => (item.quotation_quality_score || 0) >= 0.5 && (item.quotation_quality_score || 0) < 0.7).length,
      poor: quotationData.filter(item => (item.quotation_quality_score || 0) < 0.5).length
    };

    // 6. Fragment別パフォーマンス
    const fragmentGroups = quotationData.reduce((acc, item) => {
      const key = `${item.fragment_id}-${item.complete_uri}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as { [key: string]: any[] });

    const fragmentPerformance = Object.entries(fragmentGroups).map(([key, items]) => {
      const fragment_id = items[0].fragment_id;
      const complete_uri = items[0].complete_uri;
      const quotation_count = items.length;
      const average_quality = items.reduce((sum, item) => sum + (item.quotation_quality_score || 0), 0) / items.length;
      
      // 最も品質の高い引用をしたエンジン
      const bestQuotation = items.reduce((best, current) => 
        (current.quotation_quality_score || 0) > (best.quotation_quality_score || 0) ? current : best
      );
      const best_engine = bestQuotation.ai_engine;
      const latest_quotation = items.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime())[0].detected_at;

      return {
        fragment_id,
        complete_uri,
        quotation_count,
        average_quality: Math.round(average_quality * 1000) / 1000,
        best_engine,
        latest_quotation
      };
    }).sort((a, b) => b.quotation_count - a.quotation_count);

    // 7. エンジン比較分析
    const engineGroups = quotationData.reduce((acc, item) => {
      if (!acc[item.ai_engine]) {
        acc[item.ai_engine] = [];
      }
      acc[item.ai_engine].push(item);
      return acc;
    }, {} as { [engine: string]: any[] });

    const engineComparison = Object.entries(engineGroups).map(([engine, items]) => {
      const quotation_count = items.length;
      const average_quality = items.reduce((sum, item) => sum + (item.quotation_quality_score || 0), 0) / items.length;
      
      // 品質トレンド計算（簡易版：最新と最古の比較）
      const sortedItems = items.sort((a, b) => new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime());
      const oldestQuality = sortedItems[0]?.quotation_quality_score || 0;
      const newestQuality = sortedItems[sortedItems.length - 1]?.quotation_quality_score || 0;
      const qualityDiff = newestQuality - oldestQuality;
      
      let quality_trend: 'up' | 'down' | 'stable' = 'stable';
      if (qualityDiff > 0.05) quality_trend = 'up';
      else if (qualityDiff < -0.05) quality_trend = 'down';

      return {
        ai_engine: engine,
        quotation_count,
        average_quality: Math.round(average_quality * 1000) / 1000,
        quality_trend
      };
    }).sort((a, b) => b.quotation_count - a.quotation_count);

    // 8. 最新の引用（上位10件）
    const recentQuotations = quotationData
      .sort((a, b) => new Date(b.detected_at || 0).getTime() - new Date(a.detected_at || 0).getTime())
      .slice(0, 10)
      .map(item => ({
        fragment_id: item.fragment_id,
        complete_uri: item.complete_uri,
        ai_engine: item.ai_engine,
        quotation_context: item.quotation_context || '',
        quality_score: item.quotation_quality_score || 0,
        quotation_type: item.quotation_type || 'unknown',
        detected_at: item.detected_at || new Date().toISOString()
      }));

    // 9. コンテキスト分析（簡易版）
    const contextKeywords = quotationData
      .filter(item => item.quotation_context)
      .flatMap(item => {
        // 簡易キーワード抽出（実際の実装ではより高度な自然言語処理を使用）
        const context = item.quotation_context || '';
        const keywords = context
          .toLowerCase()
          .split(/[、。\s,\.]+/)
          .filter((word: string) => word.length > 2)
          .slice(0, 3); // 最初の3つのキーワードのみ
        return keywords.map((keyword: string) => ({
          keyword,
          quality: item.quotation_quality_score || 0
        }));
      });

    const keywordGroups = contextKeywords.reduce((acc, item) => {
      if (!acc[item.keyword]) {
        acc[item.keyword] = [];
      }
      acc[item.keyword].push(item.quality);
      return acc;
    }, {} as { [keyword: string]: number[] });

    const contextAnalysis = Object.entries(keywordGroups)
      .map(([keyword, qualities]) => {
        const qualitiesArray = qualities as number[];
        return {
          context_keyword: keyword,
          frequency: qualitiesArray.length,
          average_quality: Math.round((qualitiesArray.reduce((sum: number, q: number) => sum + q, 0) / qualitiesArray.length) * 1000) / 1000
        };
      })
      .filter(item => item.frequency >= 2) // 2回以上出現したキーワードのみ
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // 10. レスポンス構築
    const analytics: AIQuotationAnalytics = {
      totalQuotations,
      averageQualityScore: Math.round(averageQualityScore * 1000) / 1000,
      quotationsByEngine,
      quotationsByType,
      qualityDistribution,
      fragmentPerformance,
      engineComparison,
      recentQuotations,
      contextAnalysis
    };

    console.log('✅ AI引用分析データ取得成功:', {
      totalQuotations,
      averageQualityScore: analytics.averageQualityScore,
      engineCount: Object.keys(quotationsByEngine).length,
      fragmentCount: fragmentPerformance.length
    });

    return NextResponse.json({
      success: true,
      analytics,
      period: `${days}日間`,
      filters: {
        ai_engine: aiEngine || 'all',
        fragment_id: fragmentId || 'all'
      },
      timestamp: new Date().toISOString(),
      message: 'AI引用分析データを正常に取得しました'
    });

  } catch (error) {
    console.error('❌ AI引用分析データ取得エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: 'AI引用分析データの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500 
    });
  }
}

// OPTIONSメソッド対応（CORS）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 