/**
 * AI検索最適化統合システム
 * 既存Mike King理論準拠システム + AI検索エンジン最適化 + Schema.org 16.0+ 完全対応
 * 
 * 統合機能:
 * - knowsAbout詳細化
 * - mentions関連エンティティ明示
 * - Fragment ID連携強化
 * - Schema.org 16.0+ 対応（potentialAction、additionalType、sameAs強化）
 * - 高度なAI検索エンジン最適化
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
  EnhancedAISearchOptimizationSystem,
  generateAISearchOptimizedSchema,
  generateFragmentMapping,
  checkAISearchReadiness,
  DETAILED_KNOWS_ABOUT_ORGANIZATION,
  DETAILED_MENTIONS_ORGANIZATION,
  AI_OPTIMIZED_FRAGMENT_IDS,
  type EnhancedAIOptimizedSchema,
  type AdvancedAIEngineConfig
} from './ai-search-optimization';
import {
  generateEnhancedPotentialActions,
  generateEnhancedAdditionalTypes,
  generateEnhancedSameAs,
  type PotentialActionSchema
} from './schema-org-latest';

// =============================================================================
// 完全統合AI検索最適化データ型
// =============================================================================

export interface CompleteAIEnhancedUnifiedPageData extends Schema16UnifiedPageData {
  // 基本AI検索エンジン最適化
  aiSearchOptimization?: {
    optimizedSchema: any;
    targetEngines: string[];
    readinessScore: number;
    recommendations: string[];
    fragmentMapping: Record<string, any>;
  };
  
  // 強化AI検索エンジン最適化 (新規)
  enhancedAIOptimization?: {
    enhancedSchema: EnhancedAIOptimizedSchema;
    advancedMetrics: any;
    engineSpecificOptimization: Record<string, any>;
    knowledgeGraphIntegration: any;
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
  
  // Schema.org 16.0+ 統合要素 (新規)
  schema16PlusIntegration?: {
    potentialActions: PotentialActionSchema[];
    additionalTypes: string[];
    enhancedSameAs: string[];
    japaneseEnterpriseFeatures: any;
  };
}

// =============================================================================
// 完全統合AI検索最適化システム
// =============================================================================

export class CompleteAIEnhancedUnifiedIntegrationSystem extends Schema16UnifiedIntegrationSystem {
  private aiOptimizationSystem: AISearchOptimizationSystem;
  private enhancedAIOptimizationSystem: EnhancedAISearchOptimizationSystem;
  
  constructor() {
    super();
    this.aiOptimizationSystem = new AISearchOptimizationSystem();
    this.enhancedAIOptimizationSystem = new EnhancedAISearchOptimizationSystem();
  }

  /**
   * 完全統合AI検索最適化ページデータ生成
   */
  async generateCompleteAIEnhancedUnifiedPageData(
    context: PageContext,
    targetAIEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude'],
    options?: {
      enableAdvancedOptimization?: boolean;
      includeSchema16Plus?: boolean;
      enableJapaneseEnterprise?: boolean;
      enableAIFocus?: boolean;
    }
  ): Promise<CompleteAIEnhancedUnifiedPageData> {
    // Schema.org 16.0+ 対応データを取得
    const schema16Data = await this.generateSchema16UnifiedPageData(context);
    
    // 基本AI検索エンジン最適化を実行
    const aiSearchOptimization = await this.generateAISearchOptimization(
      context,
      targetAIEngines
    );
    
    // 強化AI検索エンジン最適化を実行（オプション）
    let enhancedAIOptimization;
    if (options?.enableAdvancedOptimization !== false) {
      enhancedAIOptimization = await this.generateEnhancedAIOptimization(
        context,
        targetAIEngines,
        options
      );
    }
    
    // 詳細化knowsAbout分析
    const detailedKnowsAbout = this.analyzeDetailedKnowsAbout(context);
    
    // 強化mentions分析
    const enhancedMentions = this.analyzeEnhancedMentions(context);
    
    // Fragment ID連携強化
    const fragmentIdEnhancement = this.analyzeFragmentIdEnhancement(context);
    
    // Schema.org 16.0+ 統合要素（オプション）
    let schema16PlusIntegration;
    if (options?.includeSchema16Plus !== false) {
      schema16PlusIntegration = await this.generateSchema16PlusIntegration(
        context,
        options
      );
    }
    
    return {
      ...schema16Data,
      aiSearchOptimization,
      enhancedAIOptimization,
      detailedKnowsAbout,
      enhancedMentions,
      fragmentIdEnhancement,
      schema16PlusIntegration
    };
  }

  /**
   * 強化AI検索最適化生成
   */
  private async generateEnhancedAIOptimization(
    context: PageContext,
    targetAIEngines: string[],
    options?: any
  ): Promise<any> {
    // 組織エンティティ取得
    const organizationEntity = {
      '@id': 'https://nands.tech/#organization',
      '@type': 'Organization',
      name: 'エヌアンドエス株式会社',
      knowsAbout: [],
      relatedTo: [],
      sameAs: [],
      mentions: []
    };
    
    // 強化スキーマ生成
    const enhancedSchema = this.enhancedAIOptimizationSystem.generateEnhancedAIOptimizedSchema(
      organizationEntity,
      targetAIEngines,
             {
         slug: context.pageSlug,
         title: context.pageTitle,
         category: context.category,
         fragmentIds: this.extractFragmentIds(context),
         serviceType: context.category,
         isJapaneseEnterprise: options?.enableJapaneseEnterprise ?? true,
         isAIFocused: options?.enableAIFocus ?? true
       }
    );
    
    // 高度メトリクス計算
    const advancedMetrics = this.calculateAdvancedMetrics(enhancedSchema);
    
    // エンジン別最適化
    const engineSpecificOptimization = this.generateEngineSpecificOptimization(
      targetAIEngines,
      enhancedSchema
    );
    
    // ナレッジグラフ統合
    const knowledgeGraphIntegration = enhancedSchema.knowledgeGraphIntegration;
    
    return {
      enhancedSchema,
      advancedMetrics,
      engineSpecificOptimization,
      knowledgeGraphIntegration
    };
  }
  
  /**
   * Schema.org 16.0+ 統合要素生成
   */
  private async generateSchema16PlusIntegration(
    context: PageContext,
    options?: any
  ): Promise<any> {
    // potentialAction生成
    const potentialActions = generateEnhancedPotentialActions(
      'Organization',
             { 
         serviceType: context.category,
         pageType: context.pageSlug 
       }
    );
    
    // additionalType生成
    const additionalTypes = generateEnhancedAdditionalTypes(
      'Organization',
      {
        isJapaneseEnterprise: options?.enableJapaneseEnterprise ?? true,
        isAIFocused: options?.enableAIFocus ?? true,
        industrySpecific: this.extractIndustrySpecific(context.category)
      }
    );
    
    // 強化sameAs生成
    const enhancedSameAs = generateEnhancedSameAs(
      'https://nands.tech/#organization',
      {
        includeIndustryRefs: true,
        includeJapaneseRefs: true,
        includeAIRefs: options?.enableAIFocus ?? true,
        includeKnowledgeGraph: true
      }
    );
    
    // 日本企業特化機能
    const japaneseEnterpriseFeatures = this.generateJapaneseEnterpriseFeatures(context);
    
    return {
      potentialActions,
      additionalTypes,
      enhancedSameAs,
      japaneseEnterpriseFeatures
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
   * 完全統合構造化データ（AI最適化版）生成
   */
  generateCompleteAIEnhancedStructuredData(data: CompleteAIEnhancedUnifiedPageData): any {
    // Schema.org 16.0+ ベースデータ
    const schema16Data = this.generateSchema16StructuredData(data);
    
    // 基本AI検索最適化拡張
    const basicAIEnhancements = {
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
    
    // 強化AI最適化拡張（新規）
    const enhancedAIExtensions = data.enhancedAIOptimization ? {
      // Schema.org 16.0+ 強化要素
      potentialAction: data.schema16PlusIntegration?.potentialActions,
      additionalType: data.schema16PlusIntegration?.additionalTypes,
      sameAs: data.schema16PlusIntegration?.enhancedSameAs,
      
      // 高度AI検索メタデータ
      advancedAISearchMetadata: {
        optimizationLevel: data.enhancedAIOptimization.enhancedSchema.aiSearchMetadata.optimizationLevel,
        readinessScore: data.enhancedAIOptimization.enhancedSchema.aiSearchMetadata.readinessScore,
        semanticConnections: data.enhancedAIOptimization.enhancedSchema.aiSearchMetadata.semanticConnections,
        queryTargeting: data.enhancedAIOptimization.enhancedSchema.aiSearchMetadata.queryTargeting
      },
      
      // ナレッジグラフ統合
      knowledgeGraphMetrics: data.enhancedAIOptimization.knowledgeGraphIntegration,
      
      // 日本企業特化
      japaneseEnterpriseOptimization: data.schema16PlusIntegration?.japaneseEnterpriseFeatures
    } : {};
    
    return {
      ...schema16Data,
      ...basicAIEnhancements,
      ...enhancedAIExtensions,
      
      // AI最適化スキーマを統合
      ...data.aiSearchOptimization?.optimizedSchema,
      
      // 強化AI最適化スキーマを統合
      ...(data.enhancedAIOptimization?.enhancedSchema ? {
        enhancedKnowsAbout: data.enhancedAIOptimization.enhancedSchema.knowsAbout,
        enhancedMentions: data.enhancedAIOptimization.enhancedSchema.mentions
      } : {})
    };
  }

  /**
   * 高度メトリクス計算
   */
  private calculateAdvancedMetrics(enhancedSchema: EnhancedAIOptimizedSchema): any {
    return {
      overallOptimizationScore: this.calculateOverallOptimizationScore(enhancedSchema),
      engineCompatibilityMatrix: this.calculateEngineCompatibilityMatrix(enhancedSchema),
      semanticRichness: this.calculateSemanticRichness(enhancedSchema),
      japaneseOptimizationLevel: this.calculateJapaneseOptimizationLevel(enhancedSchema)
    };
  }
  
  /**
   * エンジン別最適化生成
   */
  private generateEngineSpecificOptimization(
    targetEngines: string[],
    enhancedSchema: EnhancedAIOptimizedSchema
  ): Record<string, any> {
    const optimization: Record<string, any> = {};
    
    targetEngines.forEach(engine => {
      optimization[engine] = {
        optimizationScore: this.calculateEngineOptimizationScore(engine, enhancedSchema),
        specificRecommendations: this.getEngineSpecificRecommendations(engine, enhancedSchema),
        strengthAreas: this.identifyEngineStrengthAreas(engine, enhancedSchema),
        improvementAreas: this.identifyEngineImprovementAreas(engine, enhancedSchema)
      };
    });
    
    return optimization;
  }
  
  /**
   * Fragment ID抽出
   */
  private extractFragmentIds(context: PageContext): string[] {
    // コンテキストからFragment IDを抽出
    const fragmentIds: string[] = [];
    
    // 基本的なFragment ID生成
    if (context.category) {
      fragmentIds.push(`${context.category}-overview`);
      fragmentIds.push(`${context.category}-features`);
      fragmentIds.push(`${context.category}-benefits`);
    }
    
    // AI最適化Fragment IDを追加
    fragmentIds.push(...AI_OPTIMIZED_FRAGMENT_IDS.map(f => f.id));
    
    return Array.from(new Set(fragmentIds)); // 重複除去
  }
  
  /**
   * 業界特化抽出
   */
  private extractIndustrySpecific(category?: string): string[] {
    const industryMapping: Record<string, string[]> = {
      'ai-agents': ['software', 'ai', 'automation'],
      'aio-seo': ['marketing', 'seo', 'digital'],
      'vector-rag': ['ai', 'data', 'search'],
      'system-development': ['software', 'technology', 'development'],
      'reskilling': ['education', 'training', 'hr'],
      'hr-solutions': ['hr', 'consulting', 'training'],
      'chatbot-development': ['ai', 'software', 'automation'],
      'mcp-servers': ['ai', 'software', 'integration'],
      'video-generation': ['ai', 'media', 'content'],
      'sns-automation': ['marketing', 'automation', 'social']
    };
    
    return category ? (industryMapping[category] || []) : [];
  }
  
  /**
   * 日本企業特化機能生成
   */
  private generateJapaneseEnterpriseFeatures(context: PageContext): any {
    return {
      subsidyIntegration: {
        humanResourcesDevelopment: true,
        itIntroduction: true,
        eligibilityMapping: this.mapSubsidyEligibility(context.category)
      },
      regionalOptimization: {
        focusRegions: ['滋賀県', '関西地方', '全国'],
        culturalAdaptation: true,
        languageOptimization: 'native'
      },
      complianceFeatures: {
        personalInformationProtection: true,
        cybersecurityCompliance: true,
        accessibilityCompliance: true
      }
    };
  }
  
  /**
   * 助成金適格性マッピング
   */
  private mapSubsidyEligibility(category?: string): Record<string, boolean> {
    const eligibilityMap: Record<string, Record<string, boolean>> = {
      'reskilling': {
        humanResourcesDevelopment: true,
        itIntroduction: false,
        manufacturing: false
      },
      'system-development': {
        humanResourcesDevelopment: false,
        itIntroduction: true,
        manufacturing: false
      },
      'ai-agents': {
        humanResourcesDevelopment: true,
        itIntroduction: true,
        manufacturing: false
      }
    };
    
    return category ? (eligibilityMap[category] || {}) : {};
  }
  
  // ヘルパーメソッド（詳細実装は省略）
  private calculateOverallOptimizationScore(schema: EnhancedAIOptimizedSchema): number {
    // 総合最適化スコア計算
    return Math.round((
      schema.aiSearchMetadata.readinessScore * 0.4 +
      schema.knowledgeGraphIntegration.entityDensity * 100 * 0.3 +
      schema.knowledgeGraphIntegration.semanticCoverage * 100 * 0.3
    ));
  }
  
  private calculateEngineCompatibilityMatrix(schema: EnhancedAIOptimizedSchema): Record<string, number> {
    // エンジン互換性マトリクス
    const matrix: Record<string, number> = {};
    schema.aiSearchMetadata.targetEngines.forEach(engine => {
      matrix[engine] = schema.aiSearchMetadata.semanticConnections[engine] || 0;
    });
    return matrix;
  }
  
  private calculateSemanticRichness(schema: EnhancedAIOptimizedSchema): number {
    // セマンティック豊富性
    return schema.knowledgeGraphIntegration.semanticCoverage;
  }
  
  private calculateJapaneseOptimizationLevel(schema: EnhancedAIOptimizedSchema): number {
    // 日本語最適化レベル
    return 0.85; // 仮の値、実際の計算ロジックを実装
  }
  
  private calculateEngineOptimizationScore(engine: string, schema: EnhancedAIOptimizedSchema): number {
    return Math.round((schema.aiSearchMetadata.semanticConnections[engine] || 0) * 100);
  }
  
  private getEngineSpecificRecommendations(engine: string, schema: EnhancedAIOptimizedSchema): string[] {
    return schema.aiSearchMetadata.queryTargeting[engine] || [];
  }
  
  private identifyEngineStrengthAreas(engine: string, schema: EnhancedAIOptimizedSchema): string[] {
    // エンジン別強み分野特定
    return ['Entity Recognition', 'Semantic Understanding'];
  }
  
  private identifyEngineImprovementAreas(engine: string, schema: EnhancedAIOptimizedSchema): string[] {
    // エンジン別改善分野特定
    return ['Fragment Optimization', 'Cultural Context'];
  }
}

// =============================================================================
// 便利関数群（強化版）
// =============================================================================

/**
 * 完全統合AI検索最適化ページデータ生成
 */
export async function generateCompleteAIEnhancedUnifiedPageData(
  context: PageContext,
  targetAIEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude'],
  options?: {
    enableAdvancedOptimization?: boolean;
    includeSchema16Plus?: boolean;
    enableJapaneseEnterprise?: boolean;
    enableAIFocus?: boolean;
  }
): Promise<CompleteAIEnhancedUnifiedPageData> {
  const system = new CompleteAIEnhancedUnifiedIntegrationSystem();
  return await system.generateCompleteAIEnhancedUnifiedPageData(context, targetAIEngines, options);
}

/**
 * 完全統合AI検索最適化構造化データJSON生成
 */
export function generateCompleteAIEnhancedStructuredDataJSON(
  data: CompleteAIEnhancedUnifiedPageData
): string {
  const system = new CompleteAIEnhancedUnifiedIntegrationSystem();
  const structuredData = system.generateCompleteAIEnhancedStructuredData(data);
  
  return JSON.stringify(structuredData, null, 2);
}

/**
 * 強化AI検索エンジン対応レポート生成
 */
export function generateEnhancedAISearchReport(data: CompleteAIEnhancedUnifiedPageData): any {
  if (!data.enhancedAIOptimization) {
    throw new Error('Enhanced AI optimization data not available');
  }
  
  return {
    overview: data.enhancedAIOptimization.advancedMetrics,
    engineSpecific: data.enhancedAIOptimization.engineSpecificOptimization,
    recommendations: data.aiSearchOptimization?.recommendations || [],
    knowledgeGraph: data.enhancedAIOptimization.knowledgeGraphIntegration
  };
}

/**
 * 総合AI検索準備度チェック（強化版）
 */
export function checkCompleteAISearchReadiness(data: CompleteAIEnhancedUnifiedPageData): {
  isReady: boolean;
  overallScore: number;
  basicOptimizationScore: number;
  enhancedOptimizationScore?: number;
  recommendations: string[];
  nextSteps: string[];
} {
  const basicScore = data.aiSearchOptimization?.readinessScore || 0;
  const enhancedScore = data.enhancedAIOptimization?.advancedMetrics?.overallOptimizationScore;
  
  const overallScore = enhancedScore ? 
    Math.round((basicScore * 0.4) + (enhancedScore * 0.6)) : 
    basicScore;
  
  const isReady = overallScore >= 80;
  
  const recommendations = [
    ...(data.aiSearchOptimization?.recommendations || [])
  ];
  
  const nextSteps = [
    ...(overallScore < 80 ? ['総合最適化スコアの向上（目標: 80点以上）'] : []),
    ...(basicScore < 75 ? ['基本AI検索最適化の強化'] : []),
    ...(enhancedScore && enhancedScore < 85 ? ['高度AI検索最適化の精密調整'] : [])
  ];
  
  return {
    isReady,
    overallScore,
    basicOptimizationScore: basicScore,
    enhancedOptimizationScore: enhancedScore,
    recommendations,
    nextSteps
  };
}

// 後方互換性のためのエイリアス
export type AIEnhancedUnifiedPageData = CompleteAIEnhancedUnifiedPageData;
export { CompleteAIEnhancedUnifiedIntegrationSystem as AIEnhancedUnifiedIntegrationSystem }; 