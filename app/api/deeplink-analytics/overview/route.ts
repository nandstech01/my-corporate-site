import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase接続設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 🎯 統合ディープリンク統計データの型定義（145件対応）
interface UnifiedDeepLinkStats {
  totalFragments: number;
  existingFragments: number;
  staticFragments: number;
  newAnalyticsOnly: number;
  withAnalytics: number;
  totalClicks: number;
  totalAIQuotations: number;
  averageSimilarity: number;
  topPerformingFragments: Array<{
    fragmentId: string;
    completeURI: string;
    pagePath: string;
    clickCount: number;
    aiQuotationCount: number;
    similarityScore: number;
  }>;
  contentTypeBreakdown: { [key: string]: number };
  // 🎯 詳細内訳データ型定義を修正
  contentTypeDetails?: {
    [key: string]: {
      total: number;
      details: {
        h1_sections: number;
        h2_sections: number;
        h3_sections: number;
        faq_sections: number;
        introduction_sections: number;
        other_sections: number;
      };
      samples: Array<{
        fragmentId: string;
        sectionTitle: string;
        completeURI: string;
      }>;
    };
  };
  similarityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  recentActivity: Array<{
    fragmentId: string;
    completeURI: string;
    source: string;
    createdAt: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '7';

    console.log('🔍 ディープリンク計測概要データ取得開始（145件対応）:', { days });

    // 🎯 統合APIからデータ取得（145件すべて）
    const unifiedResponse = await fetch(`http://localhost:3000/api/deeplink-analytics/unified?days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!unifiedResponse.ok) {
      console.error('❌ 統合API呼び出しエラー:', unifiedResponse.status);
      return NextResponse.json({
        success: false,
        error: '統合データの取得に失敗しました'
      }, { status: 500 });
    }

    const unifiedData = await unifiedResponse.json();

    if (!unifiedData.success) {
      console.error('❌ 統合API データエラー:', unifiedData.error);
      return NextResponse.json({
        success: false,
        error: unifiedData.error || '統合データの処理に失敗しました'
      }, { status: 500 });
    }

    // 🎯 145件統合データを概要形式に変換
    const overviewStats: UnifiedDeepLinkStats = {
      totalFragments: unifiedData.totalFragments,
      existingFragments: unifiedData.existingFragments,
      staticFragments: unifiedData.staticFragments,
      newAnalyticsOnly: unifiedData.newAnalyticsOnly,
      withAnalytics: unifiedData.withAnalytics,
      totalClicks: unifiedData.totalClicks,
      totalAIQuotations: unifiedData.totalAIQuotations,
      averageSimilarity: unifiedData.averageSimilarity,
      topPerformingFragments: unifiedData.topPerformingFragments || [],
      contentTypeBreakdown: unifiedData.contentTypeBreakdown || {},
      // 🎯 詳細内訳データを追加
      contentTypeDetails: unifiedData.contentTypeDetails || {},
      similarityDistribution: unifiedData.similarityDistribution || { high: 0, medium: 0, low: 0 },
      recentActivity: unifiedData.recentActivity || []
    };

    console.log('✅ 145件統合概要データ生成成功:', {
      totalFragments: overviewStats.totalFragments,
      existingFragments: overviewStats.existingFragments,
      staticFragments: overviewStats.staticFragments,
      newAnalyticsOnly: overviewStats.newAnalyticsOnly,
      withAnalytics: overviewStats.withAnalytics
    });

    return NextResponse.json({
      success: true,
      data: overviewStats,
      timestamp: new Date().toISOString(),
      integrationInfo: {
        method: 'unified_api_integration',
        totalFragmentsSupported: 145,
        dataSource: 'company_vectors + static_fragments + deeplink_analytics',
        existingSystemProtection: '100%'
      }
    });

  } catch (error) {
    console.error('❌ ディープリンク概要API エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: 'ディープリンク概要データの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 