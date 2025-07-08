/**
 * AI検索最適化統合システム
 * 既存Mike King理論準拠システム + AI検索エンジン最適化
 * 
 * 統合機能:
 * - knowsAbout詳細化
 * - mentions関連エンティティ明示
 * - Fragment ID連携強化
 * - Schema.org 16.0+ 対応
 */

import { 
  UnifiedPageData, 
  PageContext, 
  UnifiedIntegrationSystem 
} from './unified-integration';
import { 
  Schema16UnifiedPageData,
  Schema16UnifiedIntegrationSystem 
} from './unified-integration-schema16';
import {
  AISearchOptimizationSystem,
  generateAISearchOptimizedSchema,
  generateFragmentMapping,
  checkAISearchReadiness,
  DETAILED_KNOWS_ABOUT_ORGANIZATION,
  DETAILED_MENTIONS_ORGANIZATION,
  AI_OPTIMIZED_FRAGMENT_IDS
} from './ai-search-optimization';

// =============================================================================
// AI検索最適化統合データ型
// =============================================================================

export interface AIEnhancedUnifiedPageData extends Schema16UnifiedPageData {
  // AI検索エンジン最適化
  aiSearchOptimization?: {
    optimizedSchema: any;
    targetEngines: string[];
    readinessScore: number;
    recommendations: string[];
    fragmentMapping: Record<string, any>;
  };
  
  // 詳細化knowsAbout
  detailedKnowsAbout?: {
    totalItems: number;
    expertiseDistribution: Record<number, number>;
    categoryBreakdown: Record<string, number>;
    fragmentConnections: string[];
  };
  
  // 強化mentions
  enhancedMentions?: {
    totalEntities: number;
    entityTypes: Record<string, number>;
    importanceDistribution: Record<number, number>;
    searchIntentCoverage: string[];
  };
  
  // Fragment ID連携
  fragmentIdEnhancement?: {
    totalFragments: number;
    semanticWeighting: Record<string, number>;
    queryTargeting: Record<string, string[]>;
    hierarchyMapping: Record<number, string[]>;
  };
}

// =============================================================================
// AI検索最適化統合システム
// =============================================================================

export class AIEnhancedUnifiedIntegrationSystem extends Schema16UnifiedIntegrationSystem {
  private aiOptimizationSystem: AISearchOptimizationSystem;
  
  constructor() {
    super();
    this.aiOptimizationSystem = new AISearchOptimizationSystem();
  }

  /**
   * AI検索最適化統合ページデータ生成
   */
  async generateAIEnhancedUnifiedPageData(
    context: PageContext,
    targetAIEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude']
  ): Promise<AIEnhancedUnifiedPageData> {
    // Schema.org 16.0+ 対応データを取得
    const schema16Data = await this.generateSchema16UnifiedPageData(context);
    
    // AI検索エンジン最適化を実行
    const aiSearchOptimization = await this.generateAISearchOptimization(
      context,
      targetAIEngines
    );
    
    // 詳細化knowsAbout分析
    const detailedKnowsAbout = this.analyzeDetailedKnowsAbout(context);
    
    // 強化mentions分析
    const enhancedMentions = this.analyzeEnhancedMentions(context);
    
    // Fragment ID連携強化
    const fragmentIdEnhancement = this.analyzeFragmentIdEnhancement(context);
    
    return {
      ...schema16Data,
      aiSearchOptimization,
      detailedKnowsAbout,
      enhancedMentions,
      fragmentIdEnhancement
    };
  }

  /**
   * AI検索エンジン最適化生成
   */
  private async generateAISearchOptimization(
    context: PageContext,
    targetEngines: string[]
  ): Promise<any> {
    // ページコンテキストの構築
    const pageContext = {
      slug: context.pageSlug,
      title: context.pageTitle,
      category: context.category,
      fragmentIds: this.generateContextualFragmentIds(context)
    };
    
    // AI最適化スキーマ生成
    const optimizedSchema = generateAISearchOptimizedSchema(
      'organization', // または 'service'
      targetEngines,
      pageContext
    );
    
    // Fragment IDマッピング
    const fragmentMapping = generateFragmentMapping(pageContext.fragmentIds);
    
    // 準備度チェック
    const readinessCheck = checkAISearchReadiness(optimizedSchema);
    
    return {
      optimizedSchema,
      targetEngines,
      readinessScore: readinessCheck.score,
      recommendations: readinessCheck.recommendations,
      fragmentMapping
    };
  }

  /**
   * 詳細化knowsAbout分析
   */
  private analyzeDetailedKnowsAbout(context: PageContext): any {
    // コンテキストに関連するknowsAbout項目フィルタリング
    const relevantItems = DETAILED_KNOWS_ABOUT_ORGANIZATION.filter(item =>
      item.relatedEntities.some(entity => entity.includes(context.category)) ||
      context.keywords.some(keyword => 
        item.synonyms.includes(keyword) || 
        item.relatedTechnologies?.includes(keyword)
      )
    );
    
    // 専門度分布計算
    const expertiseDistribution: Record<number, number> = {};
    relevantItems.forEach(item => {
      expertiseDistribution[item.expertiseLevel] = 
        (expertiseDistribution[item.expertiseLevel] || 0) + 1;
    });
    
    // カテゴリ分布計算
    const categoryBreakdown: Record<string, number> = {};
    relevantItems.forEach(item => {
      categoryBreakdown[item.category] = 
        (categoryBreakdown[item.category] || 0) + 1;
    });
    
    // Fragment ID接続
    const fragmentConnections = relevantItems
      .map(item => item.fragmentId)
      .filter(Boolean) as string[];
    
    return {
      totalItems: relevantItems.length,
      expertiseDistribution,
      categoryBreakdown,
      fragmentConnections
    };
  }

  /**
   * 強化mentions分析
   */
  private analyzeEnhancedMentions(context: PageContext): any {
    // コンテキストに関連するmentions項目フィルタリング
    const relevantMentions = DETAILED_MENTIONS_ORGANIZATION.filter(mention =>
      mention.relatedKnowledge.some(knowledge => 
        context.keywords.includes(knowledge)
      ) ||
      mention.searchIntents.some(intent =>
        context.keywords.some(keyword => intent.includes(keyword))
      )
    );
    
    // エンティティタイプ分布
    const entityTypes: Record<string, number> = {};
    relevantMentions.forEach(mention => {
      entityTypes[mention.entityType] = 
        (entityTypes[mention.entityType] || 0) + 1;
    });
    
    // 重要度分布
    const importanceDistribution: Record<number, number> = {};
    relevantMentions.forEach(mention => {
      const importanceRange = Math.floor(mention.importance / 2) * 2; // 2刻み
      importanceDistribution[importanceRange] = 
        (importanceDistribution[importanceRange] || 0) + 1;
    });
    
    // 検索意図カバレッジ
    const searchIntentCoverage = relevantMentions
      .flatMap(mention => mention.searchIntents)
      .slice(0, 10); // 上位10個
    
    return {
      totalEntities: relevantMentions.length,
      entityTypes,
      importanceDistribution,
      searchIntentCoverage
    };
  }

  /**
   * Fragment ID連携強化分析
   */
  private analyzeFragmentIdEnhancement(context: PageContext): any {
    const contextualFragmentIds = this.generateContextualFragmentIds(context);
    
    // 関連Fragment ID取得
    const relevantFragments = AI_OPTIMIZED_FRAGMENT_IDS.filter(fragment =>
      contextualFragmentIds.includes(fragment.id)
    );
    
    // セマンティック重み付け
    const semanticWeighting: Record<string, number> = {};
    relevantFragments.forEach(fragment => {
      semanticWeighting[fragment.id] = fragment.semanticWeight;
    });
    
    // クエリターゲティング
    const queryTargeting: Record<string, string[]> = {};
    relevantFragments.forEach(fragment => {
      queryTargeting[fragment.id] = fragment.targetQueries;
    });
    
    // 階層マッピング
    const hierarchyMapping: Record<number, string[]> = {};
    relevantFragments.forEach(fragment => {
      if (!hierarchyMapping[fragment.hierarchyLevel]) {
        hierarchyMapping[fragment.hierarchyLevel] = [];
      }
      hierarchyMapping[fragment.hierarchyLevel].push(fragment.id);
    });
    
    return {
      totalFragments: relevantFragments.length,
      semanticWeighting,
      queryTargeting,
      hierarchyMapping
    };
  }

  /**
   * コンテキスト適応Fragment ID生成
   */
  private generateContextualFragmentIds(context: PageContext): string[] {
    const fragmentIds: string[] = [];
    
    // カテゴリベースのFragment ID
    if (context.category === 'aio-seo' || context.keywords.includes('SEO')) {
      fragmentIds.push('ai-search-optimization-overview', 'mike-king-theory');
    }
    
    if (context.category === 'vector-rag' || context.keywords.includes('RAG')) {
      fragmentIds.push('rag-system-architecture', 'rag-technology-expertise');
    }
    
    if (context.keywords.includes('助成金') || context.keywords.includes('補助金')) {
      fragmentIds.push('subsidy-optimization-strategy', 'training-subsidy');
    }
    
    // 技術キーワードベース
    if (context.keywords.some(k => ['Next.js', 'TypeScript', 'React'].includes(k))) {
      fragmentIds.push('nextjs-development-expertise', 'typescript-expertise');
    }
    
    if (context.keywords.some(k => ['AI', '機械学習', 'ChatGPT'].includes(k))) {
      fragmentIds.push('openai-integration', 'claude-integration');
    }
    
    return Array.from(new Set(fragmentIds)); // 重複除去
  }

  /**
   * 統合構造化データ（AI最適化版）生成
   */
  generateAIEnhancedStructuredData(data: AIEnhancedUnifiedPageData): any {
    // Schema.org 16.0+ ベースデータ
    const schema16Data = this.generateSchema16StructuredData(data);
    
    // AI検索最適化拡張
    const aiEnhancements = {
      // AI検索エンジン最適化プロパティ
      aiSearchOptimized: true,
      targetAIEngines: data.aiSearchOptimization?.targetEngines,
      aiReadinessScore: data.aiSearchOptimization?.readinessScore,
      
      // 詳細化knowsAbout
      detailedKnowledgeProfile: {
        totalExpertiseAreas: data.detailedKnowsAbout?.totalItems,
        expertiseDistribution: data.detailedKnowsAbout?.expertiseDistribution,
        categoryBreakdown: data.detailedKnowsAbout?.categoryBreakdown
      },
      
      // 強化mentions
      enhancedEntityRelationships: {
        totalMentionedEntities: data.enhancedMentions?.totalEntities,
        entityTypeDistribution: data.enhancedMentions?.entityTypes,
        searchIntentCoverage: data.enhancedMentions?.searchIntentCoverage
      },
      
      // Fragment ID連携
      fragmentIdOptimization: {
        totalOptimizedFragments: data.fragmentIdEnhancement?.totalFragments,
        semanticWeightingMap: data.fragmentIdEnhancement?.semanticWeighting,
        hierarchyStructure: data.fragmentIdEnhancement?.hierarchyMapping
      }
    };
    
    return {
      ...schema16Data,
      ...aiEnhancements,
      
      // AI最適化スキーマを統合
      ...data.aiSearchOptimization?.optimizedSchema
    };
  }

  /**
   * AI検索エンジン別最適化レポート生成
   */
  generateOptimizationReport(data: AIEnhancedUnifiedPageData): {
    overall: any;
    engineSpecific: Record<string, any>;
    recommendations: string[];
  } {
    const targetEngines = data.aiSearchOptimization?.targetEngines || [];
    
    const overall = {
      readinessScore: data.aiSearchOptimization?.readinessScore || 0,
      totalKnowledgeAreas: data.detailedKnowsAbout?.totalItems || 0,
      totalEntityMentions: data.enhancedMentions?.totalEntities || 0,
      optimizedFragments: data.fragmentIdEnhancement?.totalFragments || 0
    };
    
    const engineSpecific: Record<string, any> = {};
    targetEngines.forEach(engine => {
      engineSpecific[engine] = {
        optimizationLevel: this.calculateEngineOptimization(engine, data),
        specificRecommendations: this.getEngineSpecificRecommendations(engine, data)
      };
    });
    
    const recommendations = data.aiSearchOptimization?.recommendations || [];
    
    return {
      overall,
      engineSpecific,
      recommendations
    };
  }

  /**
   * エンジン別最適化レベル計算
   */
  private calculateEngineOptimization(engine: string, data: AIEnhancedUnifiedPageData): number {
    // エンジン別の重み付け
    const weights = {
      ChatGPT: { knowsAbout: 0.3, mentions: 0.3, fragments: 0.4 },
      Perplexity: { knowsAbout: 0.25, mentions: 0.4, fragments: 0.35 },
      Claude: { knowsAbout: 0.35, mentions: 0.3, fragments: 0.35 },
      Gemini: { knowsAbout: 0.4, mentions: 0.3, fragments: 0.3 },
      DeepSeek: { knowsAbout: 0.3, mentions: 0.35, fragments: 0.35 }
    };
    
    const weight = weights[engine as keyof typeof weights] || weights.ChatGPT;
    
    const knowsAboutScore = Math.min(100, (data.detailedKnowsAbout?.totalItems || 0) * 4);
    const mentionsScore = Math.min(100, (data.enhancedMentions?.totalEntities || 0) * 6);
    const fragmentsScore = Math.min(100, (data.fragmentIdEnhancement?.totalFragments || 0) * 20);
    
    return Math.round(
      knowsAboutScore * weight.knowsAbout +
      mentionsScore * weight.mentions +
      fragmentsScore * weight.fragments
    );
  }

  /**
   * エンジン別推奨事項生成
   */
  private getEngineSpecificRecommendations(engine: string, data: AIEnhancedUnifiedPageData): string[] {
    const recommendations: string[] = [];
    
    const engineConfigs = {
      ChatGPT: {
        minKnowsAbout: 25,
        minMentions: 15,
        focusArea: 'Fragment ID最適化'
      },
      Perplexity: {
        minKnowsAbout: 20,
        minMentions: 12,
        focusArea: 'エンティティ関係性強化'
      },
      Claude: {
        minKnowsAbout: 30,
        minMentions: 18,
        focusArea: '専門知識の深化'
      }
    };
    
    const config = engineConfigs[engine as keyof typeof engineConfigs];
    if (!config) return recommendations;
    
    if ((data.detailedKnowsAbout?.totalItems || 0) < config.minKnowsAbout) {
      recommendations.push(`${engine}向け: knowsAbout項目を${config.minKnowsAbout}個以上に増加`);
    }
    
    if ((data.enhancedMentions?.totalEntities || 0) < config.minMentions) {
      recommendations.push(`${engine}向け: mentions項目を${config.minMentions}個以上に増加`);
    }
    
    recommendations.push(`${engine}向け重点強化: ${config.focusArea}`);
    
    return recommendations;
  }
}

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * AI検索最適化統合ページデータ生成
 */
export async function generateAIEnhancedUnifiedPageData(
  context: PageContext,
  targetAIEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude']
): Promise<AIEnhancedUnifiedPageData> {
  const system = new AIEnhancedUnifiedIntegrationSystem();
  return await system.generateAIEnhancedUnifiedPageData(context, targetAIEngines);
}

/**
 * AI検索最適化構造化データJSON生成
 */
export function generateAIEnhancedStructuredDataJSON(data: AIEnhancedUnifiedPageData): string {
  const system = new AIEnhancedUnifiedIntegrationSystem();
  const structuredData = system.generateAIEnhancedStructuredData(data);
  
  return JSON.stringify(structuredData, null, 2);
}

/**
 * AI検索エンジン対応レポート生成
 */
export function generateAISearchReport(data: AIEnhancedUnifiedPageData): any {
  const system = new AIEnhancedUnifiedIntegrationSystem();
  return system.generateOptimizationReport(data);
}

/**
 * Fragment ID最適化チェック
 */
export function checkFragmentIdOptimization(fragmentIds: string[]): {
  optimized: string[];
  needsOptimization: string[];
  recommendations: string[];
} {
  const optimizedFragments = AI_OPTIMIZED_FRAGMENT_IDS.map(f => f.id);
  
  const optimized = fragmentIds.filter(id => optimizedFragments.includes(id));
  const needsOptimization = fragmentIds.filter(id => !optimizedFragments.includes(id));
  
  const recommendations = [
    ...(needsOptimization.length > 0 ? [`Fragment ID最適化対象: ${needsOptimization.join(', ')}`] : []),
    ...(optimized.length < 3 ? ['最適化済みFragment IDを3個以上追加推奨'] : []),
    'AI検索クエリ対応の強化推奨'
  ];
  
  return {
    optimized,
    needsOptimization,
    recommendations
  };
}

export default AIEnhancedUnifiedIntegrationSystem; 