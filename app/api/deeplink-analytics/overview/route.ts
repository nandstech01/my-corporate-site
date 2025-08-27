import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// 🎯 現在の自社RAG対応 統計データの型定義
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

    console.log('🔍 現在の自社RAG（fragment_vectors）データ取得開始:', { days });

    // 🎯 現在の自社RAG（fragment_vectors）テーブルから正確なデータ取得
    const { data: fragmentData, error: fragmentError } = await supabase
      .from('fragment_vectors')
      .select('id, fragment_id, complete_uri, page_path, content_title, content, content_type, category, semantic_weight, created_at')
      .order('created_at', { ascending: false });

    if (fragmentError) {
      console.error('❌ Fragment Vectorsデータ取得エラー:', fragmentError);
    }

    // 🎯 Company Vectorsからも取得（比較参照用）
    const { data: companyData, error: companyError } = await supabase
      .from('company_vectors')
      .select('id, fragment_id, page_slug, content_type, section_title, content_chunk, created_at, relevance_score')
      .order('created_at', { ascending: false });

    if (companyError) {
      console.error('❌ Company Vectorsデータ取得エラー:', companyError);
    }

    // 🎯 Analytics データ（実際のクリック数など）
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('deeplink_analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (analyticsError) {
      console.error('❌ Analytics データ取得エラー:', analyticsError);
    }

    // 🎯 AI引用データ（実データのみ - サンプルデータ除外）
    const { data: quotationData, error: quotationError } = await supabase
      .from('ai_quotation_history')
      .select('*')
      .neq('detected_source', 'manual'); // サンプルデータ（manual）を除外し、実データ（auto-detection）のみ取得

    if (quotationError) {
      console.error('❌ AI引用データ取得エラー:', quotationError);
    }

    console.log('📊 データ取得結果:', {
      fragmentVectors: fragmentData?.length || 0,
      companyVectors: companyData?.length || 0,
      analytics: analyticsData?.length || 0,
      quotations: quotationData?.length || 0
    });

    // 🎯 データが少ない場合はデモデータで補完
    let fragments = fragmentData || [];
    const analytics = analyticsData || [];
    const quotations = quotationData || [];
    const company = companyData || [];

    // Fragment Vectorsにデータがない場合はデモデータを生成
    if (fragments.length === 0) {
      console.log('⚠️ Fragment Vectorsにデータがありません。デモデータを生成します。');
      fragments = generateDemoFragmentData();
    }

    // Analytics データをFragment IDでマッピング
    const analyticsMap = new Map();
    analytics.forEach(item => {
      if (item.fragment_id) {
        analyticsMap.set(item.fragment_id, item);
      }
    });

    // AI引用データをFragment IDでマッピング
    const quotationMap = new Map();
    quotations.forEach(item => {
      if (item.fragment_id) {
        const existing = quotationMap.get(item.fragment_id) || 0;
        quotationMap.set(item.fragment_id, existing + 1);
      }
    });

    // 🎯 メトリクス計算
    let totalClicks = 0;
    let totalAIQuotations = 0;
    let similaritySum = 0;
    const contentTypeBreakdown: { [key: string]: number } = {};
    const topPerformingFragments: any[] = [];

    fragments.forEach(fragment => {
      // Analytics データから実際のクリック数を取得（モックは使用しない）
      const analyticsInfo = analyticsMap.get(fragment.fragment_id);
      const clickCount = analyticsInfo?.click_count || 0; // 実際のデータのみ、0がデフォルト
      
      // AI引用数を取得（モックは使用しない）
      const aiQuotationCount = quotationMap.get(fragment.fragment_id) || 0; // 実際のデータのみ、0がデフォルト
      
      // 類似度スコア（semantic_weight を使用、なければデフォルト値）
      const similarityScore = fragment.semantic_weight || 0.85; // デフォルト値のみ
      
      totalClicks += clickCount;
      totalAIQuotations += aiQuotationCount;
      similaritySum += similarityScore;

      // コンテンツタイプ集計
      const contentType = fragment.content_type || 'unknown';
      contentTypeBreakdown[contentType] = (contentTypeBreakdown[contentType] || 0) + 1;

      // トップパフォーマンスデータ準備
      topPerformingFragments.push({
        fragmentId: fragment.fragment_id,
        completeURI: fragment.complete_uri,
        pagePath: fragment.page_path,
        clickCount,
        aiQuotationCount,
        similarityScore: parseFloat(similarityScore.toFixed(3)),
        totalScore: clickCount + aiQuotationCount
      });
    });

    // 類似度分布計算
    const similarityDistribution = {
      high: fragments.filter(f => (f.semantic_weight || 0.85) >= 0.9).length,
      medium: fragments.filter(f => {
        const score = f.semantic_weight || 0.85;
        return score >= 0.8 && score < 0.9;
      }).length,
      low: fragments.filter(f => (f.semantic_weight || 0.85) < 0.8).length
    };

    // 最近のアクティビティ
    const recentActivity = fragments
      .map(f => ({
        fragmentId: f.fragment_id,
        completeURI: f.complete_uri,
        source: 'fragment_vectors',
        createdAt: f.created_at || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // 🎯 統合統計データ生成
    const overviewStats: UnifiedDeepLinkStats = {
      totalFragments: fragments.length,
      existingFragments: company.length, // 比較参照用
      staticFragments: fragments.filter(f => f.content_type?.includes('service') || f.content_type?.includes('faq')).length,
      newAnalyticsOnly: fragments.filter(f => analyticsMap.has(f.fragment_id)).length,
      withAnalytics: fragments.length, // 全てにアクティビティがあると仮定
      totalClicks,
      totalAIQuotations,
      averageSimilarity: fragments.length > 0 ? parseFloat((similaritySum / fragments.length).toFixed(3)) : 0,
      topPerformingFragments: topPerformingFragments
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 10),
      contentTypeBreakdown,
      similarityDistribution,
      recentActivity
    };

    console.log('✅ 現在の自社RAG統計データ生成成功:', {
      totalFragments: overviewStats.totalFragments,
      withAnalytics: overviewStats.withAnalytics,
      totalClicks: overviewStats.totalClicks,
      totalAIQuotations: overviewStats.totalAIQuotations,
      averageSimilarity: overviewStats.averageSimilarity
    });

    return NextResponse.json({
      success: true,
      data: overviewStats,
      timestamp: new Date().toISOString(),
      dataSource: {
        primary: 'fragment_vectors',
        analytics: 'deeplink_analytics',
        quotations: 'ai_quotation_history',
        comparison: 'company_vectors',
        demo_data_used: fragmentData?.length === 0
      }
    });

  } catch (error) {
    console.error('❌ 現在の自社RAG概要API エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: '現在の自社RAGデータの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}

// 🎯 デモデータ生成関数
function generateDemoFragmentData() {
  const demoFragments = [
    {
      id: 1,
      fragment_id: 'service-ai-agents',
      complete_uri: 'https://nands.tech/#service-ai-agents',
      page_path: '/',
      content_title: 'AIエージェント開発サービス',
      content: 'カスタムAIエージェントの設計・開発・運用を一貫して支援',
      content_type: 'service',
      category: 'main-page',
      semantic_weight: 0.95,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      fragment_id: 'service-vector-rag',
      complete_uri: 'https://nands.tech/#service-vector-rag',
      page_path: '/',
      content_title: 'ベクトルRAGシステム',
      content: '高精度な情報検索と生成を実現するベクトルRAGシステムの構築',
      content_type: 'service',
      category: 'main-page',
      semantic_weight: 0.93,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      fragment_id: 'faq-tech-1',
      complete_uri: 'https://nands.tech/faq#faq-tech-1',
      page_path: '/faq',
      content_title: 'どのようなAI技術を使っていますか？',
      content: '最新のAI技術を幅広く活用しています。OpenAI GPT-4、Claude、Gemini等',
      content_type: 'faq',
      category: 'tech',
      semantic_weight: 0.88,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      fragment_id: 'faq-pricing-1',
      complete_uri: 'https://nands.tech/faq#faq-pricing-1',
      page_path: '/faq',
      content_title: '料金体系を教えてください',
      content: 'プロジェクトの規模と要件に応じた柔軟な料金体系を採用',
      content_type: 'faq',
      category: 'pricing',
      semantic_weight: 0.90,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      fragment_id: 'service-system-development',
      complete_uri: 'https://nands.tech/#service-system-development',
      page_path: '/',
      content_title: 'システム開発サービス',
      content: 'Webアプリケーション、モバイルアプリ、業務システムの開発',
      content_type: 'service',
      category: 'main-page',
      semantic_weight: 0.92,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      fragment_id: 'service-aio-seo',
      complete_uri: 'https://nands.tech/#service-aio-seo',
      page_path: '/',
      content_title: 'AIO・SEO最適化サービス',
      content: 'AI検索エンジン最適化とSEOによる検索順位向上',
      content_type: 'service',
      category: 'main-page',
      semantic_weight: 0.91,
      created_at: new Date().toISOString()
    }
  ];

  return demoFragments;
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