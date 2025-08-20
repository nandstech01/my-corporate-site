import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase接続設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 類似度追跡データの型定義
interface SimilarityTrend {
  fragment_id: string;
  complete_uri: string;
  currentSimilarity: number;
  previousSimilarity: number;
  improvementRate: number;
  trendDirection: 'up' | 'down' | 'stable';
  measurementCount: number;
  ragSourceContribution: {
    companyRAG: number;
    trendRAG: number;
    dynamicRAG: number;
  };
}

interface SimilarityTracking {
  totalFragments: number;
  averageImprovement: number;
  trendSummary: {
    improving: number;
    declining: number;
    stable: number;
  };
  fragmentTrends: SimilarityTrend[];
  timeSeriesData: Array<{
    date: string;
    averageSimilarity: number;
    measurementCount: number;
  }>;
  ragContributionAnalysis: {
    companyRAGAverage: number;
    trendRAGAverage: number;
    dynamicRAGAverage: number;
  };
  improvementSuggestions: Array<{
    fragment_id: string;
    currentScore: number;
    targetScore: number;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 類似度追跡データ取得開始...');

    // URLパラメータから期間を取得（デフォルト: 7日間）
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const fragmentId = searchParams.get('fragment_id');

    // 1. 類似度履歴の基本データ取得
    let query = supabase
      .from('similarity_history')
      .select(`
        fragment_id,
        complete_uri,
        similarity_score,
        data_source,
        measurement_type,
        company_rag_contribution,
        trend_rag_contribution,
        dynamic_rag_contribution,
        measured_at
      `)
      .gte('measured_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('measured_at', { ascending: false });

    // 特定のFragment IDが指定された場合
    if (fragmentId) {
      query = query.eq('fragment_id', fragmentId);
    }

    const { data: historyData, error: historyError } = await query;

    if (historyError) {
      console.error('❌ 類似度履歴取得エラー:', historyError);
      throw historyError;
    }

    if (!historyData || historyData.length === 0) {
      console.log('⚠️ 類似度履歴データが見つかりません');
      return NextResponse.json({
        success: true,
        tracking: {
          totalFragments: 0,
          averageImprovement: 0,
          trendSummary: { improving: 0, declining: 0, stable: 0 },
          fragmentTrends: [],
          timeSeriesData: [],
          ragContributionAnalysis: { companyRAGAverage: 0, trendRAGAverage: 0, dynamicRAGAverage: 0 },
          improvementSuggestions: []
        }
      });
    }

    // 2. Fragment ID別の推移分析
    const fragmentGroups = historyData.reduce((acc, record) => {
      const key = `${record.fragment_id}-${record.complete_uri}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record);
      return acc;
    }, {} as { [key: string]: any[] });

    // 3. Fragment別トレンド計算
    const fragmentTrends: SimilarityTrend[] = Object.entries(fragmentGroups).map(([key, records]) => {
      const sortedRecords = records.sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
      const latest = sortedRecords[sortedRecords.length - 1];
      const previous = sortedRecords.length > 1 ? sortedRecords[sortedRecords.length - 2] : latest;
      
      const currentSimilarity = latest.similarity_score;
      const previousSimilarity = previous.similarity_score;
      const improvementRate = currentSimilarity - previousSimilarity;
      
      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (improvementRate > 0.01) trendDirection = 'up';
      else if (improvementRate < -0.01) trendDirection = 'down';

      return {
        fragment_id: latest.fragment_id,
        complete_uri: latest.complete_uri,
        currentSimilarity,
        previousSimilarity,
        improvementRate,
        trendDirection,
        measurementCount: sortedRecords.length,
        ragSourceContribution: {
          companyRAG: latest.company_rag_contribution || 0,
          trendRAG: latest.trend_rag_contribution || 0,
          dynamicRAG: latest.dynamic_rag_contribution || 0
        }
      };
    });

    // 4. 全体統計の計算
    const totalFragments = fragmentTrends.length;
    const averageImprovement = fragmentTrends.reduce((sum, trend) => sum + trend.improvementRate, 0) / totalFragments;
    
    const trendSummary = {
      improving: fragmentTrends.filter(t => t.trendDirection === 'up').length,
      declining: fragmentTrends.filter(t => t.trendDirection === 'down').length,
      stable: fragmentTrends.filter(t => t.trendDirection === 'stable').length
    };

    // 5. 時系列データの生成
    const timeSeriesData = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecords = historyData.filter(record => {
        const recordDate = new Date(record.measured_at).toISOString().split('T')[0];
        return recordDate === dateStr;
      });
      
      const averageSimilarity = dayRecords.length > 0 
        ? dayRecords.reduce((sum, record) => sum + record.similarity_score, 0) / dayRecords.length 
        : 0;
      
      return {
        date: dateStr,
        averageSimilarity: Math.round(averageSimilarity * 1000) / 1000,
        measurementCount: dayRecords.length
      };
    });

    // 6. RAG貢献度分析
    const ragContributionAnalysis = {
      companyRAGAverage: historyData.reduce((sum, record) => sum + (record.company_rag_contribution || 0), 0) / historyData.length,
      trendRAGAverage: historyData.reduce((sum, record) => sum + (record.trend_rag_contribution || 0), 0) / historyData.length,
      dynamicRAGAverage: historyData.reduce((sum, record) => sum + (record.dynamic_rag_contribution || 0), 0) / historyData.length
    };

    // 7. 改善提案の生成
    const improvementSuggestions = fragmentTrends
      .filter(trend => trend.currentSimilarity < 0.8) // 改善が必要な閾値
      .sort((a, b) => a.currentSimilarity - b.currentSimilarity)
      .slice(0, 5)
      .map(trend => {
        const targetScore = Math.min(0.95, trend.currentSimilarity + 0.1);
        let suggestion = '';
        let priority: 'high' | 'medium' | 'low' = 'medium';

        if (trend.currentSimilarity < 0.6) {
          suggestion = 'コンテンツの全面的な見直しとRAGデータの拡充が必要です';
          priority = 'high';
        } else if (trend.currentSimilarity < 0.75) {
          suggestion = 'トレンドRAGデータの統合でコンテキストを強化することを推奨します';
          priority = 'medium';
        } else {
          suggestion = 'ダイナミックRAGの活用で類似度の微調整を行いましょう';
          priority = 'low';
        }

        return {
          fragment_id: trend.fragment_id,
          currentScore: trend.currentSimilarity,
          targetScore,
          suggestion,
          priority
        };
      });

    // 8. レスポンス構築
    const tracking: SimilarityTracking = {
      totalFragments,
      averageImprovement: Math.round(averageImprovement * 1000) / 1000,
      trendSummary,
      fragmentTrends: fragmentTrends.sort((a, b) => b.currentSimilarity - a.currentSimilarity),
      timeSeriesData,
      ragContributionAnalysis: {
        companyRAGAverage: Math.round(ragContributionAnalysis.companyRAGAverage * 1000) / 1000,
        trendRAGAverage: Math.round(ragContributionAnalysis.trendRAGAverage * 1000) / 1000,
        dynamicRAGAverage: Math.round(ragContributionAnalysis.dynamicRAGAverage * 1000) / 1000
      },
      improvementSuggestions
    };

    console.log('✅ 類似度追跡データ取得成功:', {
      totalFragments,
      averageImprovement: tracking.averageImprovement,
      trendSummary,
      timeSeriesPoints: timeSeriesData.length
    });

    return NextResponse.json({
      success: true,
      tracking,
      period: `${days}日間`,
      timestamp: new Date().toISOString(),
      message: '類似度追跡データを正常に取得しました'
    });

  } catch (error) {
    console.error('❌ 類似度追跡データ取得エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: '類似度追跡データの取得に失敗しました',
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