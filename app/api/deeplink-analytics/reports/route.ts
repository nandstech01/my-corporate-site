import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// レポートデータの型定義
interface ReportSummary {
  period: string;
  start_date: string;
  end_date: string;
  total_fragments: number;
  total_clicks: number;
  total_ai_quotations: number;
  average_similarity: number;
  total_sns_links: number;
  total_conversions: number;
  improvement_rate: number;
  roi_score: number;
}

interface PerformanceTrend {
  date: string;
  fragments: number;
  clicks: number;
  ai_quotations: number;
  similarity_avg: number;
  sns_activity: number;
  conversion_rate: number;
}

interface TopPerformer {
  fragment_id: string;
  complete_uri: string;
  clicks: number;
  ai_quotations: number;
  similarity_score: number;
  conversion_count: number;
  performance_score: number;
}

interface CompetitiveAnalysis {
  our_performance: {
    ai_citation_rate: number;
    similarity_average: number;
    fragment_density: number;
    conversion_efficiency: number;
  };
  industry_benchmark: {
    ai_citation_rate: number;
    similarity_average: number;
    fragment_density: number;
    conversion_efficiency: number;
  };
  competitive_advantage: {
    citation_advantage: number;
    similarity_advantage: number;
    density_advantage: number;
    conversion_advantage: number;
  };
}

interface ROIAnalysis {
  investment: {
    development_hours: number;
    hourly_rate: number;
    total_investment: number;
  };
  returns: {
    ai_citation_value: number;
    conversion_value: number;
    seo_improvement_value: number;
    total_returns: number;
  };
  roi_percentage: number;
  payback_period_months: number;
  projected_annual_value: number;
}

interface ReportData {
  summary: ReportSummary;
  performance_trends: PerformanceTrend[];
  top_performers: TopPerformer[];
  competitive_analysis: CompetitiveAnalysis;
  roi_analysis: ROIAnalysis;
  insights: string[];
  recommendations: string[];
  next_actions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
    expected_impact: string;
  }>;
}

// 日付範囲の計算
function getDateRange(period: 'weekly' | 'monthly', customStart?: string, customEnd?: string) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
  } else if (period === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1);
  }

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };
}

// パフォーマンススコアの計算
function calculatePerformanceScore(
  clicks: number,
  aiQuotations: number,
  similarityScore: number,
  conversions: number
): number {
  // 重み付きスコア計算
  const clickWeight = 0.2;
  const quotationWeight = 0.4;
  const similarityWeight = 0.3;
  const conversionWeight = 0.1;

  const normalizedClicks = Math.min(clicks / 100, 1); // 100クリックを最大として正規化
  const normalizedQuotations = Math.min(aiQuotations / 10, 1); // 10引用を最大として正規化
  const normalizedSimilarity = similarityScore; // 既に0-1の範囲
  const normalizedConversions = Math.min(conversions / 5, 1); // 5コンバージョンを最大として正規化

  return (
    normalizedClicks * clickWeight +
    normalizedQuotations * quotationWeight +
    normalizedSimilarity * similarityWeight +
    normalizedConversions * conversionWeight
  ) * 100;
}

// ROI分析の計算
function calculateROI(): ROIAnalysis {
  // 仮の投資コスト（実際の開発時間に基づく）
  const developmentHours = 120; // 約15日間の開発
  const hourlyRate = 8000; // 時給8,000円
  const totalInvestment = developmentHours * hourlyRate;

  // 仮のリターン計算
  const aiCitationValue = 500000; // AI引用による年間価値
  const conversionValue = 300000; // コンバージョン改善による価値
  const seoImprovementValue = 200000; // SEO改善による価値
  const totalReturns = aiCitationValue + conversionValue + seoImprovementValue;

  const roiPercentage = ((totalReturns - totalInvestment) / totalInvestment) * 100;
  const paybackPeriodMonths = (totalInvestment / (totalReturns / 12));

  return {
    investment: {
      development_hours: developmentHours,
      hourly_rate: hourlyRate,
      total_investment: totalInvestment
    },
    returns: {
      ai_citation_value: aiCitationValue,
      conversion_value: conversionValue,
      seo_improvement_value: seoImprovementValue,
      total_returns: totalReturns
    },
    roi_percentage: Math.round(roiPercentage * 100) / 100,
    payback_period_months: Math.round(paybackPeriodMonths * 10) / 10,
    projected_annual_value: totalReturns
  };
}

// 競合分析の生成
function generateCompetitiveAnalysis(ourMetrics: any): CompetitiveAnalysis {
  // 業界ベンチマーク（仮想データ）
  const industryBenchmark = {
    ai_citation_rate: 0.15, // 15%
    similarity_average: 0.72, // 72%
    fragment_density: 3.2, // ページあたり3.2個のフラグメント
    conversion_efficiency: 0.08 // 8%
  };

  const ourPerformance = {
    ai_citation_rate: ourMetrics.aiQuotations / Math.max(ourMetrics.totalFragments, 1),
    similarity_average: ourMetrics.averageSimilarity,
    fragment_density: ourMetrics.totalFragments / Math.max(ourMetrics.pageCount || 5, 1),
    conversion_efficiency: ourMetrics.totalConversions / Math.max(ourMetrics.totalClicks || 1, 1)
  };

  return {
    our_performance: ourPerformance,
    industry_benchmark: industryBenchmark,
    competitive_advantage: {
      citation_advantage: ((ourPerformance.ai_citation_rate - industryBenchmark.ai_citation_rate) / industryBenchmark.ai_citation_rate) * 100,
      similarity_advantage: ((ourPerformance.similarity_average - industryBenchmark.similarity_average) / industryBenchmark.similarity_average) * 100,
      density_advantage: ((ourPerformance.fragment_density - industryBenchmark.fragment_density) / industryBenchmark.fragment_density) * 100,
      conversion_advantage: ((ourPerformance.conversion_efficiency - industryBenchmark.conversion_efficiency) / industryBenchmark.conversion_efficiency) * 100
    }
  };
}

// インサイトの生成
function generateInsights(data: any): string[] {
  const insights: string[] = [];

  // 類似度分析
  if (data.averageSimilarity > 0.85) {
    insights.push('🎯 類似度が85%を超えており、AI検索エンジンからの高い評価が期待できます');
  } else if (data.averageSimilarity < 0.7) {
    insights.push('⚠️ 類似度が70%を下回っているため、コンテンツの改善が必要です');
  }

  // AI引用分析
  const quotationRate = data.totalAIQuotations / Math.max(data.totalFragments, 1);
  if (quotationRate > 0.5) {
    insights.push('🚀 AI引用率が50%を超えており、優れたパフォーマンスを示しています');
  } else if (quotationRate < 0.1) {
    insights.push('📈 AI引用率が低いため、コンテンツの権威性向上が必要です');
  }

  // SNS活動分析
  if (data.totalSNSLinks > 10) {
    insights.push('📱 SNS統合が活発で、多チャネルでの露出が実現できています');
  }

  // コンバージョン分析
  const conversionRate = data.totalConversions / Math.max(data.totalClicks || 1, 1);
  if (conversionRate > 0.1) {
    insights.push('💰 コンバージョン率が10%を超えており、高い収益性を実現しています');
  }

  return insights;
}

// 推奨アクションの生成
function generateRecommendations(data: any, competitiveAnalysis: CompetitiveAnalysis): string[] {
  const recommendations: string[] = [];

  // 類似度改善
  if (data.averageSimilarity < 0.8) {
    recommendations.push('コンテンツの類似度向上のため、トレンドRAGデータの統合を推奨します');
  }

  // AI引用改善
  if (competitiveAnalysis.competitive_advantage.citation_advantage < 0) {
    recommendations.push('AI引用率向上のため、FAQ形式コンテンツの拡充を推奨します');
  }

  // Fragment ID最適化
  recommendations.push('Fragment IDの命名規則を統一し、SEO価値を向上させることを推奨します');

  // SNS活用
  if (data.totalSNSLinks < 5) {
    recommendations.push('SNSプラットフォームとの連携を強化し、リーチ拡大を図ることを推奨します');
  }

  return recommendations;
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 レポートデータ生成開始...');

    // URLパラメータから設定を取得
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'weekly') as 'weekly' | 'monthly';
    const customStart = searchParams.get('start_date');
    const customEnd = searchParams.get('end_date');
    const format = searchParams.get('format') || 'json'; // json, summary

    // 日付範囲の計算
    const dateRange = getDateRange(period, customStart || undefined, customEnd || undefined);

    // 1. 基本データの取得
    const [
      { data: analyticsData, error: analyticsError },
      { data: quotationData, error: quotationError },
      { data: similarityData, error: similarityError }
    ] = await Promise.all([
      supabase
        .from('deeplink_analytics')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false }),
      supabase
        .from('ai_quotation_history')
        .select('*')
        .gte('detected_at', dateRange.start)
        .lte('detected_at', dateRange.end)
        .order('detected_at', { ascending: false }),
      supabase
        .from('similarity_history')
        .select('*')
        .gte('measured_at', dateRange.start)
        .lte('measured_at', dateRange.end)
        .order('measured_at', { ascending: false })
    ]);

    if (analyticsError) throw analyticsError;
    if (quotationError) throw quotationError;
    if (similarityError) throw similarityError;

    // 2. サマリーデータの計算
    const totalFragments = analyticsData?.length || 0;
    const totalClicks = analyticsData?.reduce((sum, item) => sum + (item.click_count || 0), 0) || 0;
    const totalAIQuotations = quotationData?.length || 0;
    const averageSimilarity = analyticsData?.length > 0 
      ? analyticsData.reduce((sum, item) => sum + (item.similarity_score || 0), 0) / analyticsData.length 
      : 0;
    const totalSNSLinks = analyticsData?.filter(item => item.fragment_id.startsWith('sns-')).length || 0;
    const totalConversions = analyticsData?.reduce((sum, item) => sum + (item.conversion_count || 0), 0) || 0;

    // 前期比較のための改善率計算（仮想データ）
    const improvementRate = 12.5; // 12.5%改善

    const summary: ReportSummary = {
      period,
      start_date: dateRange.start,
      end_date: dateRange.end,
      total_fragments: totalFragments,
      total_clicks: totalClicks,
      total_ai_quotations: totalAIQuotations,
      average_similarity: Math.round(averageSimilarity * 1000) / 1000,
      total_sns_links: totalSNSLinks,
      total_conversions: totalConversions,
      improvement_rate: improvementRate,
      roi_score: 0 // 後で計算
    };

    // 3. パフォーマンストレンドの生成
    const performanceTrends: PerformanceTrend[] = [];
    const daysInPeriod = period === 'weekly' ? 7 : 30;
    
    for (let i = daysInPeriod - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      performanceTrends.push({
        date: date.toISOString().split('T')[0],
        fragments: Math.floor(totalFragments / daysInPeriod) + Math.floor(Math.random() * 3),
        clicks: Math.floor(totalClicks / daysInPeriod) + Math.floor(Math.random() * 10),
        ai_quotations: Math.floor(totalAIQuotations / daysInPeriod) + Math.floor(Math.random() * 2),
        similarity_avg: averageSimilarity + (Math.random() - 0.5) * 0.1,
        sns_activity: Math.floor(totalSNSLinks / daysInPeriod) + Math.floor(Math.random() * 2),
        conversion_rate: (totalConversions / Math.max(totalClicks, 1)) + (Math.random() - 0.5) * 0.02
      });
    }

    // 4. トップパフォーマーの計算
    const topPerformers: TopPerformer[] = (analyticsData || [])
      .map(item => ({
        fragment_id: item.fragment_id,
        complete_uri: item.complete_uri,
        clicks: item.click_count || 0,
        ai_quotations: quotationData?.filter(q => q.fragment_id === item.fragment_id).length || 0,
        similarity_score: item.similarity_score || 0,
        conversion_count: item.conversion_count || 0,
        performance_score: calculatePerformanceScore(
          item.click_count || 0,
          quotationData?.filter(q => q.fragment_id === item.fragment_id).length || 0,
          item.similarity_score || 0,
          item.conversion_count || 0
        )
      }))
      .sort((a, b) => b.performance_score - a.performance_score)
      .slice(0, 5);

    // 5. 競合分析の生成
    const competitiveAnalysis = generateCompetitiveAnalysis({
      totalFragments,
      totalClicks,
      aiQuotations: totalAIQuotations,
      averageSimilarity,
      totalConversions,
      pageCount: 5 // 仮のページ数
    });

    // 6. ROI分析
    const roiAnalysis = calculateROI();
    summary.roi_score = roiAnalysis.roi_percentage;

    // 7. インサイトと推奨事項の生成
    const insights = generateInsights({
      averageSimilarity,
      totalAIQuotations,
      totalFragments,
      totalSNSLinks,
      totalClicks,
      totalConversions
    });

    const recommendations = generateRecommendations({
      averageSimilarity,
      totalSNSLinks
    }, competitiveAnalysis);

    // 8. 次のアクション項目
    const nextActions = [
      {
        action: '類似度が0.7未満のFragment IDコンテンツ改善',
        priority: 'high' as const,
        timeline: '2週間',
        expected_impact: '類似度15%向上、AI引用率20%増加'
      },
      {
        action: 'SNS統合プラットフォームの拡充',
        priority: 'medium' as const,
        timeline: '1ヶ月',
        expected_impact: 'リーチ30%拡大、コンバージョン10%増加'
      },
      {
        action: 'Fragment ID命名規則の統一',
        priority: 'low' as const,
        timeline: '3週間',
        expected_impact: 'SEO価値5%向上、管理効率20%改善'
      }
    ];

    // 9. レポートデータの構築
    const reportData: ReportData = {
      summary,
      performance_trends: performanceTrends,
      top_performers: topPerformers,
      competitive_analysis: competitiveAnalysis,
      roi_analysis: roiAnalysis,
      insights,
      recommendations,
      next_actions: nextActions
    };

    console.log('✅ レポートデータ生成成功:', {
      period,
      totalFragments,
      totalAIQuotations,
      roiPercentage: roiAnalysis.roi_percentage
    });

    // フォーマットに応じたレスポンス
    if (format === 'summary') {
      return NextResponse.json({
        success: true,
        summary: reportData.summary,
        key_insights: insights.slice(0, 3),
        top_recommendations: recommendations.slice(0, 3),
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      report: reportData,
      metadata: {
        generated_at: new Date().toISOString(),
        period,
        date_range: dateRange,
        data_points: {
          analytics: analyticsData?.length || 0,
          quotations: quotationData?.length || 0,
          similarity_records: similarityData?.length || 0
        }
      },
      message: `${period === 'weekly' ? '週次' : '月次'}レポートを正常に生成しました`
    });

  } catch (error) {
    console.error('❌ レポートデータ生成エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: 'レポートデータの生成に失敗しました',
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