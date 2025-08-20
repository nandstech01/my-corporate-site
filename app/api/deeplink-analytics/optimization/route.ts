import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// 最適化提案データの型定義
interface OptimizationSuggestion {
  id: string;
  type: 'similarity' | 'fragment_id' | 'ai_quotation' | 'performance';
  priority: 'high' | 'medium' | 'low';
  fragment_id: string;
  complete_uri: string;
  current_score: number;
  target_score: number;
  improvement_potential: number;
  suggestion_title: string;
  suggestion_description: string;
  action_items: string[];
  estimated_impact: string;
  implementation_difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: string;
}

interface OptimizationAnalysis {
  totalSuggestions: number;
  highPrioritySuggestions: number;
  totalImprovementPotential: number;
  suggestionsByType: {
    similarity: number;
    fragment_id: number;
    ai_quotation: number;
    performance: number;
  };
  topSuggestions: OptimizationSuggestion[];
  quickWins: OptimizationSuggestion[];
  longTermImprovements: OptimizationSuggestion[];
  automationOpportunities: Array<{
    area: string;
    description: string;
    potential_savings: string;
    automation_complexity: 'low' | 'medium' | 'high';
  }>;
}

// 類似度改善提案の生成
function generateSimilarityImprovement(fragmentData: any): OptimizationSuggestion | null {
  const currentScore = fragmentData.similarity_score || 0;
  
  if (currentScore >= 0.85) return null; // 既に高品質
  
  const improvementPotential = Math.min(0.95, currentScore + 0.2) - currentScore;
  let priority: 'high' | 'medium' | 'low' = 'medium';
  let actionItems: string[] = [];
  let suggestionTitle = '';
  let suggestionDescription = '';
  let estimatedImpact = '';
  let implementationDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  let estimatedTime = '';

  if (currentScore < 0.6) {
    priority = 'high';
    suggestionTitle = 'コンテンツ全面リニューアル';
    suggestionDescription = '類似度が低いため、コンテンツの全面的な見直しが必要です。関連性の高い情報を追加し、構造化データを最適化することで大幅な改善が期待できます。';
    actionItems = [
      'H1-H3見出しの最適化とキーワード強化',
      '関連性の高いコンテンツの追加',
      'Company RAGデータの拡充',
      'Fragment ID構造の見直し',
      'hasPartスキーマの最適化'
    ];
    estimatedImpact = `類似度を${(improvementPotential * 100).toFixed(0)}%向上、AI引用率30%増加見込み`;
    implementationDifficulty = 'hard';
    estimatedTime = '2-3週間';
  } else if (currentScore < 0.75) {
    priority = 'medium';
    suggestionTitle = 'トレンドRAG統合による強化';
    suggestionDescription = '中程度の類似度です。トレンドRAGデータを統合することで、より関連性の高いコンテンツに改善できます。';
    actionItems = [
      'トレンドRAGデータの統合',
      'コンテンツのトピカル関連性向上',
      'Dynamic RAGの活用',
      'メタデータの最適化'
    ];
    estimatedImpact = `類似度を${(improvementPotential * 100).toFixed(0)}%向上、AI引用率15%増加見込み`;
    implementationDifficulty = 'medium';
    estimatedTime = '1-2週間';
  } else {
    priority = 'low';
    suggestionTitle = 'マイクロ最適化';
    suggestionDescription = '良好な類似度です。細かな調整で更なる向上を目指せます。';
    actionItems = [
      'キーワード密度の微調整',
      '内部リンク構造の最適化',
      'メタデータの精緻化'
    ];
    estimatedImpact = `類似度を${(improvementPotential * 100).toFixed(0)}%向上、AI引用率5%増加見込み`;
    implementationDifficulty = 'easy';
    estimatedTime = '3-5日';
  }

  return {
    id: `similarity-${fragmentData.fragment_id}-${Date.now()}`,
    type: 'similarity',
    priority,
    fragment_id: fragmentData.fragment_id,
    complete_uri: fragmentData.complete_uri,
    current_score: currentScore,
    target_score: Math.min(0.95, currentScore + improvementPotential),
    improvement_potential: improvementPotential,
    suggestion_title: suggestionTitle,
    suggestion_description: suggestionDescription,
    action_items: actionItems,
    estimated_impact: estimatedImpact,
    implementation_difficulty: implementationDifficulty,
    estimated_time: estimatedTime
  };
}

// AI引用率向上提案の生成
function generateAIQuotationImprovement(fragmentData: any, quotationData: any[]): OptimizationSuggestion | null {
  const fragmentQuotations = quotationData.filter(q => q.fragment_id === fragmentData.fragment_id);
  const quotationCount = fragmentQuotations.length;
  const averageQuality = fragmentQuotations.length > 0 
    ? fragmentQuotations.reduce((sum, q) => sum + (q.quotation_quality_score || 0), 0) / fragmentQuotations.length 
    : 0;

  if (quotationCount >= 10 && averageQuality >= 0.8) return null; // 既に高パフォーマンス

  let priority: 'high' | 'medium' | 'low' = 'medium';
  let suggestionTitle = '';
  let suggestionDescription = '';
  let actionItems: string[] = [];
  let estimatedImpact = '';
  let implementationDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  let estimatedTime = '';

  if (quotationCount === 0) {
    priority = 'high';
    suggestionTitle = 'AI引用獲得戦略';
    suggestionDescription = 'AI検索エンジンからの引用が全くありません。コンテンツの権威性と発見性を向上させる必要があります。';
    actionItems = [
      '専門的な情報の追加',
      '引用しやすい形式への構造化',
      'FAQ形式での情報整理',
      'データ・統計情報の充実',
      '他サイトからの被リンク獲得'
    ];
    estimatedImpact = 'AI引用率を0%から月5-10件に向上';
    implementationDifficulty = 'hard';
    estimatedTime = '2-4週間';
  } else if (quotationCount < 3) {
    priority = 'medium';
    suggestionTitle = 'AI引用頻度向上';
    suggestionDescription = '少数のAI引用はありますが、更なる向上の余地があります。コンテンツの信頼性と関連性を強化しましょう。';
    actionItems = [
      'エビデンスベースの情報追加',
      '最新トレンドとの関連付け',
      'より具体的な回答形式への変更',
      '関連キーワードの拡充'
    ];
    estimatedImpact = `AI引用率を${quotationCount}件から月10-15件に向上`;
    implementationDifficulty = 'medium';
    estimatedTime = '1-2週間';
  } else if (averageQuality < 0.7) {
    priority = 'medium';
    suggestionTitle = 'AI引用品質向上';
    suggestionDescription = '引用数は確保できていますが、品質に改善の余地があります。より価値の高い引用を獲得しましょう。';
    actionItems = [
      'コンテンツの深度向上',
      '専門用語の適切な説明追加',
      '実例・ケーススタディの充実',
      '情報の最新性確保'
    ];
    estimatedImpact = `引用品質を${(averageQuality * 100).toFixed(0)}%から85%以上に向上`;
    implementationDifficulty = 'medium';
    estimatedTime = '1-3週間';
  } else {
    return null; // 改善不要
  }

  return {
    id: `ai-quotation-${fragmentData.fragment_id}-${Date.now()}`,
    type: 'ai_quotation',
    priority,
    fragment_id: fragmentData.fragment_id,
    complete_uri: fragmentData.complete_uri,
    current_score: averageQuality,
    target_score: 0.85,
    improvement_potential: 0.85 - averageQuality,
    suggestion_title: suggestionTitle,
    suggestion_description: suggestionDescription,
    action_items: actionItems,
    estimated_impact: estimatedImpact,
    implementation_difficulty: implementationDifficulty,
    estimated_time: estimatedTime
  };
}

// Fragment ID最適化提案の生成
function generateFragmentIdOptimization(fragmentData: any): OptimizationSuggestion | null {
  const fragmentId = fragmentData.fragment_id;
  const completeUri = fragmentData.complete_uri;
  
  // Fragment IDの品質評価
  let issues: string[] = [];
  let improvements: string[] = [];
  
  // 長さチェック
  if (fragmentId.length < 3) {
    issues.push('Fragment IDが短すぎる');
    improvements.push('より説明的なFragment IDに変更');
  }
  
  // 意味性チェック
  if (/^[0-9]+$/.test(fragmentId)) {
    issues.push('数字のみのFragment IDは意味が不明');
    improvements.push('内容を表す英単語を含むFragment IDに変更');
  }
  
  // 区切り文字チェック
  if (fragmentId.includes('_') && fragmentId.includes('-')) {
    issues.push('区切り文字が混在している');
    improvements.push('ハイフン(-)で統一');
  }
  
  // SEO観点でのチェック
  if (!fragmentId.includes('title') && !fragmentId.includes('section') && !fragmentId.includes('faq') && fragmentId.length < 8) {
    issues.push('SEO価値の低いFragment ID');
    improvements.push('キーワードを含む意味のあるFragment IDに変更');
  }
  
  if (issues.length === 0) return null; // 改善不要
  
  const priority: 'high' | 'medium' | 'low' = issues.length >= 3 ? 'high' : issues.length >= 2 ? 'medium' : 'low';
  
  return {
    id: `fragment-id-${fragmentId}-${Date.now()}`,
    type: 'fragment_id',
    priority,
    fragment_id: fragmentId,
    complete_uri: completeUri,
    current_score: Math.max(0, 1 - (issues.length * 0.2)),
    target_score: 0.9,
    improvement_potential: 0.9 - Math.max(0, 1 - (issues.length * 0.2)),
    suggestion_title: 'Fragment ID最適化',
    suggestion_description: `Fragment ID "${fragmentId}" に以下の問題があります: ${issues.join(', ')}`,
    action_items: improvements,
    estimated_impact: 'AI検索での発見性向上、内部リンク効果の向上',
    implementation_difficulty: 'easy',
    estimated_time: '1-2日'
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 最適化提案データ生成開始...');

    // URLパラメータから設定を取得
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const priorityFilter = searchParams.get('priority');
    const typeFilter = searchParams.get('type');

    // 1. 基本データの取得
    const [
      { data: analyticsData, error: analyticsError },
      { data: quotationData, error: quotationError },
      { data: similarityData, error: similarityError }
    ] = await Promise.all([
      supabase
        .from('deeplink_analytics')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(50),
      supabase
        .from('ai_quotation_history')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(100),
      supabase
        .from('similarity_history')
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(100)
    ]);

    if (analyticsError) throw analyticsError;
    if (quotationError) throw quotationError;
    if (similarityError) throw similarityError;

    if (!analyticsData || analyticsData.length === 0) {
      return NextResponse.json({
        success: true,
        analysis: {
          totalSuggestions: 0,
          highPrioritySuggestions: 0,
          totalImprovementPotential: 0,
          suggestionsByType: { similarity: 0, fragment_id: 0, ai_quotation: 0, performance: 0 },
          topSuggestions: [],
          quickWins: [],
          longTermImprovements: [],
          automationOpportunities: []
        }
      });
    }

    // 2. 最適化提案の生成
    const allSuggestions: OptimizationSuggestion[] = [];

    for (const fragmentData of analyticsData) {
      // 類似度改善提案
      const similaritySuggestion = generateSimilarityImprovement(fragmentData);
      if (similaritySuggestion) allSuggestions.push(similaritySuggestion);

      // AI引用改善提案
      const quotationSuggestion = generateAIQuotationImprovement(fragmentData, quotationData || []);
      if (quotationSuggestion) allSuggestions.push(quotationSuggestion);

      // Fragment ID最適化提案
      const fragmentIdSuggestion = generateFragmentIdOptimization(fragmentData);
      if (fragmentIdSuggestion) allSuggestions.push(fragmentIdSuggestion);
    }

    // 3. フィルタリング
    let filteredSuggestions = allSuggestions;
    
    if (priorityFilter) {
      filteredSuggestions = filteredSuggestions.filter(s => s.priority === priorityFilter);
    }
    
    if (typeFilter) {
      filteredSuggestions = filteredSuggestions.filter(s => s.type === typeFilter);
    }

    // 4. 優先度順ソート
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    filteredSuggestions.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.improvement_potential - a.improvement_potential;
    });

    // 5. 分析データの構築
    const totalSuggestions = filteredSuggestions.length;
    const highPrioritySuggestions = filteredSuggestions.filter(s => s.priority === 'high').length;
    const totalImprovementPotential = filteredSuggestions.reduce((sum, s) => sum + s.improvement_potential, 0);

    const suggestionsByType = {
      similarity: filteredSuggestions.filter(s => s.type === 'similarity').length,
      fragment_id: filteredSuggestions.filter(s => s.type === 'fragment_id').length,
      ai_quotation: filteredSuggestions.filter(s => s.type === 'ai_quotation').length,
      performance: filteredSuggestions.filter(s => s.type === 'performance').length
    };

    const topSuggestions = filteredSuggestions.slice(0, limit);
    const quickWins = filteredSuggestions.filter(s => s.implementation_difficulty === 'easy').slice(0, 5);
    const longTermImprovements = filteredSuggestions.filter(s => s.implementation_difficulty === 'hard').slice(0, 5);

    // 6. 自動化機会の提案
    const automationOpportunities = [
      {
        area: '類似度監視',
        description: '類似度が0.7を下回った際の自動アラート機能',
        potential_savings: '監視工数を週5時間削減',
        automation_complexity: 'low' as const
      },
      {
        area: 'Fragment ID生成',
        description: 'コンテンツ作成時のFragment ID自動生成・最適化',
        potential_savings: '作業時間を50%短縮',
        automation_complexity: 'medium' as const
      },
      {
        area: 'AI引用追跡',
        description: 'AI検索エンジンからの引用自動検知・記録',
        potential_savings: '手動チェック工数を80%削減',
        automation_complexity: 'high' as const
      }
    ];

    const analysis: OptimizationAnalysis = {
      totalSuggestions,
      highPrioritySuggestions,
      totalImprovementPotential: Math.round(totalImprovementPotential * 1000) / 1000,
      suggestionsByType,
      topSuggestions,
      quickWins,
      longTermImprovements,
      automationOpportunities
    };

    console.log('✅ 最適化提案データ生成成功:', {
      totalSuggestions,
      highPrioritySuggestions,
      topSuggestionTypes: topSuggestions.slice(0, 3).map(s => s.type)
    });

    return NextResponse.json({
      success: true,
      analysis,
      filters: {
        limit,
        priority: priorityFilter || 'all',
        type: typeFilter || 'all'
      },
      timestamp: new Date().toISOString(),
      message: '最適化提案データを正常に生成しました'
    });

  } catch (error) {
    console.error('❌ 最適化提案データ生成エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: '最適化提案データの生成に失敗しました',
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