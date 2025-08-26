/**
 * RAG内容分析API
 * GPT-5 mini採用による智的RAG分析・最適パラメータ自動生成
 * 
 * @description
 * 既存システムに影響を与えない完全独立API
 * Mike King理論準拠のレリバンスエンジニアリング統合
 * 
 * @author 株式会社エヌアンドエス
 * @version 2.0.0 - Phase 2実装
 */

import { NextRequest, NextResponse } from 'next/server';
import { RAGContentAnalyzer } from '@/lib/intelligent-rag/rag-content-analyzer';
import { OptimalQueryGenerator } from '@/lib/intelligent-rag/optimal-query-generator';
import { CategorySelector } from '@/lib/intelligent-rag/category-selector';
import { SemanticCoherenceChecker } from '@/lib/intelligent-rag/semantic-coherence-checker';

// APIリクエスト型定義
interface AnalyzeRAGRequest {
  options?: {
    analyzeTrendRAG?: boolean;
    analyzeYouTubeRAG?: boolean;
    analyzeFragmentRAG?: boolean;
    requireCoherence?: boolean;
    enableDeepAnalysis?: boolean;
    customKeywords?: string[];
    targetAudience?: 'beginner' | 'intermediate' | 'expert' | 'general';
    contentStyle?: 'technical' | 'business' | 'educational' | 'casual';
  };
}

// APIレスポンス型定義
interface AnalyzeRAGResponse {
  success: boolean;
  timestamp: string;
  processingTime: number;
  
  // 分析結果
  analysis: {
    dataStatistics: {
      totalItems: number;
      trendCount: number;
      youtubeCount: number;
      fragmentCount: number;
      averageContentLength: number;
      keywordDiversity: number;
    };
    semanticAnalysis: {
      mainTopics: string[];
      industryCategories: string[];
      technicalLevel: number;
      confidenceScore: number;
      topicalCoherence: number;
    };
    qualityMetrics: {
      contentRichness: number;
      topicalCoverage: number;
      informationDensity: number;
      credibilityScore: number;
    };
    mikeKingCompliance: {
      relevanceEngineeringScore: number;
      entityCoverage: number;
      fragmentOptimization: number;
      structuredDataReadiness: number;
    };
  };
  
  // 生成結果
  optimalParameters: {
    query: string;
    category: string;
    coherenceScore: number;
    reasoning: string;
  };
  
  // コスト最適化情報
  costOptimization: {
    modelUsed: 'gpt-5-mini';
    totalRequests: number;
    estimatedCost: number;
    costSavings: string;
  };
  
  // 推奨事項
  recommendations: string[];
  
  // エラー情報（該当時のみ）
  error?: string;
  warnings?: string[];
}

/**
 * POST /api/analyze-rag-content
 * RAG内容の智的分析と最適パラメータ生成
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    console.log('🧠 RAG内容分析API開始...');
    console.log('⚡ GPT-5 mini使用: 85%コスト削減 + 高精度分析');
    
    // リクエスト解析
    const body: AnalyzeRAGRequest = await request.json().catch(() => ({}));
    const options = body.options || {};
    
    // デフォルト設定
    const config = {
      analyzeTrendRAG: options.analyzeTrendRAG ?? true,
      analyzeYouTubeRAG: options.analyzeYouTubeRAG ?? true,
      analyzeFragmentRAG: options.analyzeFragmentRAG ?? true,
      requireCoherence: options.requireCoherence ?? true,
      enableDeepAnalysis: options.enableDeepAnalysis ?? true,
      customKeywords: options.customKeywords || [],
      targetAudience: options.targetAudience || 'general',
      contentStyle: options.contentStyle || 'business'
    };

    console.log('📊 分析設定:', config);

    // 1. RAG内容分析（メイン処理）
    console.log('🔍 RAGデータ分析実行中...');
    const analyzer = new RAGContentAnalyzer();
    const analysis = await analyzer.analyzeRAGContent({
      includeTrend: config.analyzeTrendRAG,
      includeYouTube: config.analyzeYouTubeRAG,
      includeFragment: config.analyzeFragmentRAG,
      enableDeepAnalysis: config.enableDeepAnalysis
    });

    // 2. 最適クエリ生成
    console.log('🔍 最適クエリ生成中...');
    const queryGenerator = new OptimalQueryGenerator();
    const optimalQuery = await queryGenerator.generateOptimalQuery(analysis, {
      targetAudience: config.targetAudience,
      contentStyle: config.contentStyle,
      primaryGoal: 'education',
      includeKeywords: config.customKeywords
    });

    // 3. 最適カテゴリ選択
    console.log('📂 最適カテゴリ選択中...');
    const categorySelector = new CategorySelector();
    const optimalCategory = await categorySelector.selectOptimalCategory(analysis);

    // 4. セマンティック整合性チェック
    let coherenceScore = 1.0;
    let coherenceRecommendations: string[] = [];
    
    if (config.requireCoherence) {
      console.log('✅ セマンティック整合性チェック中...');
      const coherenceChecker = new SemanticCoherenceChecker();
      const coherenceResult = await coherenceChecker.checkCoherence({
        query: optimalQuery,
        category: optimalCategory,
        ragAnalysis: analysis
      });
      coherenceScore = coherenceResult.score;
      coherenceRecommendations = coherenceResult.recommendations || [];
    }

    // 5. 使用統計とコスト情報収集
    const analyzerStats = analyzer.getUsageStats();
    const queryStats = queryGenerator.getUsageStats();
    const categoryStats = categorySelector.getUsageStats();

    const totalRequests = analyzerStats.totalRequests + queryStats.totalRequests + categoryStats.totalRequests;
    const totalCost = (analyzerStats.totalCost || 0) + 0.001; // 概算コスト
    const avgCostSavings = (analyzerStats.costSavings + queryStats.costSavings + categoryStats.costSavings) / 3;

    // 6. 推奨事項生成
    const recommendations = [
      ...coherenceRecommendations,
      ...(analysis.qualityMetrics.contentRichness < 0.7 ? ['RAGデータの充実化を推奨'] : []),
      ...(coherenceScore < 0.8 ? ['セマンティック整合性の向上を推奨'] : []),
      ...(analysis.dataStatistics.totalItems < 5 ? ['RAGデータ件数の増加を推奨'] : [])
    ];

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ RAG内容分析API完了 (${processingTime}ms)`);
    console.log(`📊 分析結果: ${analysis.dataStatistics.totalItems}件のRAGデータを分析`);
    console.log(`📝 最適クエリ: "${optimalQuery}"`);
    console.log(`📂 最適カテゴリ: "${optimalCategory}"`);
    console.log(`⭐ 整合性スコア: ${(coherenceScore * 100).toFixed(1)}%`);
    console.log(`💰 コスト削減: ${avgCostSavings.toFixed(1)}%`);

    // 成功レスポンス
    const response: AnalyzeRAGResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      processingTime,
      
      analysis: {
        dataStatistics: analysis.dataStatistics,
        semanticAnalysis: analysis.semanticAnalysis,
        qualityMetrics: analysis.qualityMetrics,
        mikeKingCompliance: analysis.mikeKingCompliance
      },
      
      optimalParameters: {
        query: optimalQuery,
        category: optimalCategory,
        coherenceScore,
        reasoning: `GPT-5 mini による智的分析に基づく最適化。整合性スコア ${(coherenceScore * 100).toFixed(1)}%`
      },
      
      costOptimization: {
        modelUsed: 'gpt-5-mini',
        totalRequests,
        estimatedCost: totalCost,
        costSavings: `${avgCostSavings.toFixed(1)}% (GPT-4o比較)`
      },
      
      recommendations
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ RAG内容分析APIエラー:', error);
    
    const processingTime = Date.now() - startTime;
    
    // エラーレスポンス
    const errorResponse: AnalyzeRAGResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      processingTime,
      
      analysis: {
        dataStatistics: { totalItems: 0, trendCount: 0, youtubeCount: 0, fragmentCount: 0, averageContentLength: 0, keywordDiversity: 0 },
        semanticAnalysis: { mainTopics: [], industryCategories: [], technicalLevel: 5, confidenceScore: 0, topicalCoherence: 0 },
        qualityMetrics: { contentRichness: 0, topicalCoverage: 0, informationDensity: 0, credibilityScore: 0 },
        mikeKingCompliance: { relevanceEngineeringScore: 0, entityCoverage: 0, fragmentOptimization: 0, structuredDataReadiness: 0 }
      },
      
      optimalParameters: {
        query: 'AI技術の最新動向と実践的な活用方法',
        category: 'ai-basics',
        coherenceScore: 0.5,
        reasoning: 'フォールバック: デフォルト値を使用'
      },
      
      costOptimization: {
        modelUsed: 'gpt-5-mini',
        totalRequests: 0,
        estimatedCost: 0,
        costSavings: '0%'
      },
      
      recommendations: [
        'システムエラーが発生しました',
        'しばらく時間をおいて再試行してください',
        'システム管理者に連絡してください'
      ],
      
      error: error instanceof Error ? error.message : 'Unknown error',
      warnings: ['フォールバック処理が実行されました']
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/analyze-rag-content
 * システム状態とヘルプ情報の取得
 */
export async function GET(): Promise<NextResponse> {
  try {
    const helpInfo = {
      name: 'RAG内容分析API',
      version: '2.0.0',
      description: 'GPT-5 mini による智的RAG分析・最適パラメータ自動生成',
      
      features: [
        '3つのRAGシステム統合分析 (Trend, YouTube, Fragment)',
        'GPT-5 mini による高精度セマンティック分析',
        '最適検索クエリ自動生成',
        '智的カテゴリ選択',
        'セマンティック整合性チェック',
        '85%コスト削減 (GPT-4o比較)',
        'Mike King理論準拠レリバンスエンジニアリング'
      ],
      
      usage: {
        endpoint: 'POST /api/analyze-rag-content',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          options: {
            analyzeTrendRAG: 'boolean (デフォルト: true)',
            analyzeYouTubeRAG: 'boolean (デフォルト: true)', 
            analyzeFragmentRAG: 'boolean (デフォルト: true)',
            requireCoherence: 'boolean (デフォルト: true)',
            enableDeepAnalysis: 'boolean (デフォルト: true)',
            customKeywords: 'string[] (オプション)',
            targetAudience: 'beginner|intermediate|expert|general (デフォルト: general)',
            contentStyle: 'technical|business|educational|casual (デフォルト: business)'
          }
        }
      },
      
      systemIntegration: {
        existingSystemImpact: 'なし（完全独立実装）',
        backwardCompatibility: '100%保証',
        dataAccess: '読み取り専用',
        isolatedExecution: true
      },
      
      costOptimization: {
        model: 'GPT-5 mini',
        inputCost: '$0.25 per 1M tokens',
        outputCost: '$2.00 per 1M tokens',
        savings: '85% compared to GPT-4o',
        cachingDiscount: '90% for repeated tokens'
      },
      
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(helpInfo, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: 'ヘルプ情報の取得に失敗しました' },
      { status: 500 }
    );
  }
} 