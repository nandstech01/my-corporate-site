/**
 * AI検索エンジン最適化システム
 * knowsAbout詳細化・mentions関連エンティティ・Fragment ID連携
 * 
 * 対象AI検索エンジン:
 * - ChatGPT (3.8B users)
 * - Perplexity (99.5M users) 
 * - Claude/Anthropic
 * - Gemini/Bard
 * - DeepSeek (280M users)
 */

import { 
  ORGANIZATION_ENTITY, 
  SERVICE_ENTITIES,
  type EntityRelationship 
} from './entity-relationships';

// =============================================================================
// AI検索エンジン最適化の型定義
// =============================================================================

/**
 * 専門知識の詳細化スキーマ
 */
export interface DetailedKnowsAbout {
  /** 専門分野・技術名 */
  subject: string;
  
  /** 専門度レベル (1-5: 基礎-専門家) */
  expertiseLevel: 1 | 2 | 3 | 4 | 5;
  
  /** カテゴリ分類 */
  category: 'technology' | 'methodology' | 'domain' | 'tool' | 'framework' | 'concept';
  
  /** 関連するエンティティID */
  relatedEntities: string[];
  
  /** 実務経験年数 */
  experienceYears?: number;
  
  /** 認定・資格レベル */
  certificationLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  
  /** 同義語・関連用語 */
  synonyms: string[];
  
  /** 技術スタック・関連技術 */
  relatedTechnologies?: string[];
  
  /** Fragment ID (ページ内セクション参照) */
  fragmentId?: string;
}

/**
 * 関連エンティティ明示スキーマ
 */
export interface DetailedMentions {
  /** エンティティ名 */
  entity: string;
  
  /** エンティティタイプ */
  entityType: 'Technology' | 'Methodology' | 'Organization' | 'Person' | 'Product' | 'Service' | 'Concept';
  
  /** 言及の文脈・関係性 */
  context: 'implements' | 'uses' | 'integrates' | 'optimizes' | 'teaches' | 'provides' | 'collaborates';
  
  /** 重要度スコア (1-10) */
  importance: number;
  
  /** Fragment ID (言及箇所への参照) */
  fragmentId?: string;
  
  /** 関連するknowsAbout項目 */
  relatedKnowledge: string[];
  
  /** AI検索での検索意図マッチング */
  searchIntents: string[];
  
  /** 共起語・関連語 */
  coOccurringTerms: string[];
}

/**
 * AI検索最適化Fragment ID
 */
export interface AIOptimizedFragmentId {
  /** Fragment ID */
  id: string;
  
  /** セクション名 */
  sectionName: string;
  
  /** AI検索クエリ対応 */
  targetQueries: string[];
  
  /** 含まれるエンティティ */
  entities: DetailedMentions[];
  
  /** セマンティック重要度 */
  semanticWeight: number;
  
  /** 階層レベル (h1=1, h2=2, etc.) */
  hierarchyLevel: number;
  
  /** 関連Fragment IDs */
  relatedFragments: string[];
}

/**
 * AI検索エンジン別最適化設定
 */
export interface AISearchEngineConfig {
  engineName: 'ChatGPT' | 'Perplexity' | 'Claude' | 'Gemini' | 'DeepSeek';
  
  /** 推奨knowsAbout項目数 */
  recommendedKnowsAboutCount: number;
  
  /** 推奨mentions項目数 */
  recommendedMentionsCount: number;
  
  /** 専門度重視レベル */
  expertiseFocus: 'breadth' | 'depth' | 'balanced';
  
  /** エンティティ関係性重視度 */
  entityRelationshipWeight: number;
  
  /** Fragment ID活用度 */
  fragmentIdUtilization: 'minimal' | 'moderate' | 'extensive';
}

// =============================================================================
// AI検索エンジン別設定
// =============================================================================

export const AI_SEARCH_ENGINE_CONFIGS: Record<string, AISearchEngineConfig> = {
  ChatGPT: {
    engineName: 'ChatGPT',
    recommendedKnowsAboutCount: 25,
    recommendedMentionsCount: 15,
    expertiseFocus: 'depth',
    entityRelationshipWeight: 0.8,
    fragmentIdUtilization: 'extensive'
  },
  Perplexity: {
    engineName: 'Perplexity',
    recommendedKnowsAboutCount: 20,
    recommendedMentionsCount: 12,
    expertiseFocus: 'balanced',
    entityRelationshipWeight: 0.9,
    fragmentIdUtilization: 'extensive'
  },
  Claude: {
    engineName: 'Claude',
    recommendedKnowsAboutCount: 30,
    recommendedMentionsCount: 18,
    expertiseFocus: 'depth',
    entityRelationshipWeight: 0.85,
    fragmentIdUtilization: 'extensive'
  },
  Gemini: {
    engineName: 'Gemini',
    recommendedKnowsAboutCount: 22,
    recommendedMentionsCount: 14,
    expertiseFocus: 'breadth',
    entityRelationshipWeight: 0.7,
    fragmentIdUtilization: 'moderate'
  },
  DeepSeek: {
    engineName: 'DeepSeek',
    recommendedKnowsAboutCount: 18,
    recommendedMentionsCount: 10,
    expertiseFocus: 'balanced',
    entityRelationshipWeight: 0.75,
    fragmentIdUtilization: 'moderate'
  }
};

// =============================================================================
// 詳細化knowsAboutデータ
// =============================================================================

export const DETAILED_KNOWS_ABOUT_ORGANIZATION: DetailedKnowsAbout[] = [
  // AI・機械学習領域
  {
    subject: 'レリバンスエンジニアリング',
    expertiseLevel: 5,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/aio-seo#service'],
    experienceYears: 3,
    certificationLevel: 'expert',
    synonyms: ['Relevance Engineering', 'RE', 'AI検索最適化手法'],
    relatedTechnologies: ['Mike King理論', 'GEO', 'AIO対策'],
    fragmentId: 'relevance-engineering-expertise'
  },
  {
    subject: 'RAG（Retrieval-Augmented Generation）',
    expertiseLevel: 5,
    category: 'technology',
    relatedEntities: ['https://nands.tech/vector-rag#service'],
    experienceYears: 2,
    certificationLevel: 'expert',
    synonyms: ['Retrieval-Augmented Generation', 'ベクトル検索', '文書検索AI'],
    relatedTechnologies: ['LangChain', 'Pinecone', 'OpenAI Embeddings', 'Chroma'],
    fragmentId: 'rag-technology-expertise'
  },
  {
    subject: 'Model Context Protocol (MCP)',
    expertiseLevel: 4,
    category: 'framework',
    relatedEntities: ['https://nands.tech/mcp-servers#service'],
    experienceYears: 1,
    certificationLevel: 'advanced',
    synonyms: ['MCP', 'Model Context Protocol', 'Claude連携'],
    relatedTechnologies: ['Claude Desktop', 'Cursor IDE', 'Anthropic'],
    fragmentId: 'mcp-framework-expertise'
  },
  {
    subject: 'Mastra Framework',
    expertiseLevel: 4,
    category: 'framework',
    relatedEntities: ['https://nands.tech/ai-agents#service'],
    experienceYears: 1,
    certificationLevel: 'advanced',
    synonyms: ['Mastra', 'AIエージェントフレームワーク'],
    relatedTechnologies: ['TypeScript', 'Node.js', 'LLM統合'],
    fragmentId: 'mastra-framework-expertise'
  },
  
  // システム開発領域
  {
    subject: 'Next.js',
    expertiseLevel: 5,
    category: 'framework',
    relatedEntities: ['https://nands.tech/system-development#service'],
    experienceYears: 4,
    certificationLevel: 'expert',
    synonyms: ['Next.js', 'React Framework', 'Vercel'],
    relatedTechnologies: ['React', 'TypeScript', 'Vercel', 'App Router'],
    fragmentId: 'nextjs-development-expertise'
  },
  {
    subject: 'TypeScript',
    expertiseLevel: 5,
    category: 'technology',
    relatedEntities: ['https://nands.tech/system-development#service'],
    experienceYears: 5,
    certificationLevel: 'expert',
    synonyms: ['TypeScript', 'TS', '型安全プログラミング'],
    relatedTechnologies: ['JavaScript', 'Node.js', 'React', 'Next.js'],
    fragmentId: 'typescript-expertise'
  },
  {
    subject: 'Supabase',
    expertiseLevel: 4,
    category: 'tool',
    relatedEntities: ['https://nands.tech/system-development#service'],
    experienceYears: 2,
    certificationLevel: 'advanced',
    synonyms: ['Supabase', 'BaaS', 'PostgreSQL'],
    relatedTechnologies: ['PostgreSQL', 'Authentication', 'Edge Functions'],
    fragmentId: 'supabase-expertise'
  },
  
  // SEO・マーケティング領域
  {
    subject: 'AIO対策（AI Overviews最適化）',
    expertiseLevel: 5,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/aio-seo#service'],
    experienceYears: 2,
    certificationLevel: 'expert',
    synonyms: ['AIO対策', 'AI Overviews', 'SGE対策', 'AI検索最適化'],
    relatedTechnologies: ['Schema.org', 'JSON-LD', '構造化データ'],
    fragmentId: 'aio-optimization-expertise'
  },
  {
    subject: 'Schema.org構造化データ',
    expertiseLevel: 5,
    category: 'technology',
    relatedEntities: ['https://nands.tech/aio-seo#service'],
    experienceYears: 6,
    certificationLevel: 'expert',
    synonyms: ['Schema.org', '構造化データ', 'JSON-LD', 'Microdata'],
    relatedTechnologies: ['JSON-LD', 'Rich Results', 'Knowledge Graph'],
    fragmentId: 'schema-org-expertise'
  },
  
  // 人材開発・研修領域
  {
    subject: 'プロンプトエンジニアリング',
    expertiseLevel: 4,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/reskilling#service'],
    experienceYears: 2,
    certificationLevel: 'advanced',
    synonyms: ['プロンプトエンジニアリング', 'Prompt Engineering', 'AI活用術'],
    relatedTechnologies: ['ChatGPT', 'Claude', 'LLM活用'],
    fragmentId: 'prompt-engineering-expertise'
  },
  {
    subject: 'IT講師・技術研修',
    expertiseLevel: 5,
    category: 'domain',
    relatedEntities: ['https://nands.tech/reskilling#service'],
    experienceYears: 10,
    certificationLevel: 'expert',
    synonyms: ['IT講師', '技術研修', 'リスキリング', '人材開発'],
    relatedTechnologies: ['研修カリキュラム', 'オンライン研修', '実践指導'],
    fragmentId: 'it-training-expertise'
  }
];

// =============================================================================
// 詳細化mentionsデータ
// =============================================================================

export const DETAILED_MENTIONS_ORGANIZATION: DetailedMentions[] = [
  // AI技術関連
  {
    entity: 'OpenAI GPT-4',
    entityType: 'Technology',
    context: 'integrates',
    importance: 9,
    fragmentId: 'openai-integration',
    relatedKnowledge: ['RAG（Retrieval-Augmented Generation）', 'プロンプトエンジニアリング'],
    searchIntents: ['ChatGPT 連携', 'GPT-4 システム開発', 'OpenAI API'],
    coOccurringTerms: ['API連携', 'LLM統合', 'AI自動化']
  },
  {
    entity: 'Anthropic Claude',
    entityType: 'Technology',
    context: 'integrates',
    importance: 8,
    fragmentId: 'claude-integration',
    relatedKnowledge: ['Model Context Protocol (MCP)', 'RAG（Retrieval-Augmented Generation）'],
    searchIntents: ['Claude 連携', 'Anthropic API', 'MCP 開発'],
    coOccurringTerms: ['Claude Desktop', 'MCP Server', 'AI Assistant']
  },
  {
    entity: 'Mike King',
    entityType: 'Person',
    context: 'implements',
    importance: 10,
    fragmentId: 'mike-king-theory',
    relatedKnowledge: ['レリバンスエンジニアリング', 'AIO対策（AI Overviews最適化）'],
    searchIntents: ['Mike King 理論', 'レリバンスエンジニアリング', 'SEO専門家'],
    coOccurringTerms: ['iPullRank', 'Relevance Engineering', 'AI Search']
  },
  
  // フレームワーク・ツール
  {
    entity: 'Vercel',
    entityType: 'Organization',
    context: 'uses',
    importance: 7,
    fragmentId: 'vercel-deployment',
    relatedKnowledge: ['Next.js', 'システム開発'],
    searchIntents: ['Vercel デプロイ', 'Next.js ホスティング'],
    coOccurringTerms: ['Edge Functions', 'serverless', 'CI/CD']
  },
  {
    entity: 'Pinecone',
    entityType: 'Technology',
    context: 'integrates',
    importance: 8,
    fragmentId: 'pinecone-vector-db',
    relatedKnowledge: ['RAG（Retrieval-Augmented Generation）', 'ベクトル検索'],
    searchIntents: ['Pinecone ベクトルDB', 'ベクトル検索 実装'],
    coOccurringTerms: ['Vector Database', 'Embeddings', 'Similarity Search']
  },
  
  // 日本の技術環境・法制度
  {
    entity: '人材開発支援助成金',
    entityType: 'Service',
    context: 'provides',
    importance: 9,
    fragmentId: 'training-subsidy',
    relatedKnowledge: ['IT講師・技術研修', 'リスキリング'],
    searchIntents: ['助成金 活用', 'リスキリング 補助金', '人材開発支援'],
    coOccurringTerms: ['厚生労働省', '80%補助', '研修費用']
  },
  {
    entity: 'IT導入補助金',
    entityType: 'Service',
    context: 'provides',
    importance: 8,
    fragmentId: 'it-subsidy',
    relatedKnowledge: ['システム開発', 'AIシステム開発'],
    searchIntents: ['IT導入補助金', 'システム開発 補助金'],
    coOccurringTerms: ['経済産業省', '75%補助', 'DX推進']
  },
  
  // 競合・関連企業（中立的言及）
  {
    entity: 'Google',
    entityType: 'Organization',
    context: 'optimizes',
    importance: 6,
    fragmentId: 'google-optimization',
    relatedKnowledge: ['AIO対策（AI Overviews最適化）', 'Schema.org構造化データ'],
    searchIntents: ['Google SEO', 'AI Overviews', 'Schema.org'],
    coOccurringTerms: ['Search Console', 'Rich Results', 'Knowledge Graph']
  }
];

// =============================================================================
// AI最適化Fragment IDシステム
// =============================================================================

export const AI_OPTIMIZED_FRAGMENT_IDS: AIOptimizedFragmentId[] = [
  {
    id: 'ai-search-optimization-overview',
    sectionName: 'AI検索エンジン最適化の概要',
    targetQueries: [
      'AI検索 最適化',
      'ChatGPT SEO',
      'Perplexity 対策',
      'AI Overviews 最適化'
    ],
    entities: [
      {
        entity: 'レリバンスエンジニアリング',
        entityType: 'Methodology',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['Mike King理論', 'AI検索最適化'],
        searchIntents: ['レリバンスエンジニアリング とは', 'AI SEO 手法'],
        coOccurringTerms: ['Mike King', 'iPullRank', 'Semantic SEO']
      }
    ],
    semanticWeight: 0.95,
    hierarchyLevel: 2,
    relatedFragments: ['mike-king-theory', 'relevance-engineering-expertise']
  },
  {
    id: 'rag-system-architecture',
    sectionName: 'RAGシステムアーキテクチャ',
    targetQueries: [
      'RAG システム 構築',
      'ベクトル検索 実装',
      '文書検索AI 開発',
      'Retrieval-Augmented Generation'
    ],
    entities: [
      {
        entity: 'Triple RAGアーキテクチャ',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['RAG（Retrieval-Augmented Generation）', 'ベクトル検索'],
        searchIntents: ['RAG アーキテクチャ', 'マルチRAG システム'],
        coOccurringTerms: ['Vector Database', 'Embeddings', 'LLM']
      }
    ],
    semanticWeight: 0.9,
    hierarchyLevel: 2,
    relatedFragments: ['rag-technology-expertise', 'pinecone-vector-db']
  },
  {
    id: 'subsidy-optimization-strategy',
    sectionName: '助成金活用最適化戦略',
    targetQueries: [
      '助成金 活用 IT',
      'リスキリング 補助金',
      '人材開発支援助成金 使い方',
      'IT導入補助金 申請'
    ],
    entities: [
      {
        entity: '80%補助率実現システム',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['人材開発支援助成金', 'IT導入補助金'],
        searchIntents: ['助成金 最大活用', '補助金 申請支援'],
        coOccurringTerms: ['厚生労働省', '経済産業省', 'DX推進']
      }
    ],
    semanticWeight: 0.85,
    hierarchyLevel: 2,
    relatedFragments: ['training-subsidy', 'it-subsidy']
  }
];

// =============================================================================
// AI検索エンジン最適化システムクラス
// =============================================================================

export class AISearchOptimizationSystem {
  private configs: Record<string, AISearchEngineConfig>;
  
  constructor() {
    this.configs = AI_SEARCH_ENGINE_CONFIGS;
  }

  /**
   * 統合AI検索最適化スキーマ生成
   */
  generateAIOptimizedSchema(
    baseEntity: EntityRelationship,
    targetEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude'],
    pageContext?: {
      slug: string;
      title: string;
      category: string;
      fragmentIds: string[];
    }
  ): any {
    // エンジン別最適化設定の統合
    const aggregatedConfig = this.aggregateEngineConfigs(targetEngines);
    
    // 詳細化knowsAbout生成
    const optimizedKnowsAbout = this.generateOptimizedKnowsAbout(
      baseEntity,
      aggregatedConfig,
      pageContext
    );
    
    // 詳細化mentions生成
    const optimizedMentions = this.generateOptimizedMentions(
      baseEntity,
      aggregatedConfig,
      pageContext
    );
    
    // Fragment ID連携強化
    const fragmentEnhancement = this.generateFragmentEnhancement(
      pageContext?.fragmentIds || []
    );

    return {
      '@context': 'https://schema.org',
      '@type': baseEntity['@type'],
      '@id': baseEntity['@id'],
      name: baseEntity.name,
      
      // 詳細化専門知識
      knowsAbout: optimizedKnowsAbout.map(item => ({
        '@type': 'Thing',
        name: item.subject,
        category: item.category,
        expertiseLevel: item.expertiseLevel,
        relatedTechnologies: item.relatedTechnologies,
        sameAs: item.synonyms,
        ...(item.fragmentId && { mainEntityOfPage: `#${item.fragmentId}` })
      })),
      
      // 関連エンティティ明示
      mentions: optimizedMentions.map(mention => ({
        '@type': mention.entityType,
        name: mention.entity,
        relationshipType: mention.context,
        importance: mention.importance,
        searchIntents: mention.searchIntents,
        ...(mention.fragmentId && { mainEntityOfPage: `#${mention.fragmentId}` })
      })),
      
      // AI検索エンジン特化プロパティ
      aiSearchOptimization: {
        targetEngines: targetEngines,
        optimizationLevel: 'advanced',
        semanticEnhancement: fragmentEnhancement,
        entityRelationshipDensity: this.calculateEntityDensity(optimizedMentions),
        knowledgeGraphIntegration: true
      },
      
      // Fragment ID マッピング
      hasPartEnhanced: AI_OPTIMIZED_FRAGMENT_IDS
        .filter(fragment => pageContext?.fragmentIds?.includes(fragment.id))
        .map(fragment => ({
          '@type': 'WebPageElement',
          '@id': `#${fragment.id}`,
          name: fragment.sectionName,
          targetQueries: fragment.targetQueries,
          semanticWeight: fragment.semanticWeight,
          entities: fragment.entities
        }))
    };
  }

  /**
   * エンジン別設定の統合
   */
  private aggregateEngineConfigs(targetEngines: string[]): {
    recommendedKnowsAboutCount: number;
    recommendedMentionsCount: number;
    expertiseFocus: string;
    entityRelationshipWeight: number;
  } {
    const configs = targetEngines.map(engine => this.configs[engine]).filter(Boolean);
    
    return {
      recommendedKnowsAboutCount: Math.max(...configs.map(c => c.recommendedKnowsAboutCount)),
      recommendedMentionsCount: Math.max(...configs.map(c => c.recommendedMentionsCount)),
      expertiseFocus: 'balanced', // 複数エンジン対応時は balanced
      entityRelationshipWeight: configs.reduce((sum, c) => sum + c.entityRelationshipWeight, 0) / configs.length
    };
  }

  /**
   * 最適化knowsAbout生成
   */
  private generateOptimizedKnowsAbout(
    baseEntity: EntityRelationship,
    config: any,
    pageContext?: any
  ): DetailedKnowsAbout[] {
    let optimizedItems = [...DETAILED_KNOWS_ABOUT_ORGANIZATION];
    
    // ページコンテキストに基づくフィルタリング
    if (pageContext?.category) {
      optimizedItems = optimizedItems.filter(item => 
        item.relatedEntities.some(entity => entity.includes(pageContext.category)) ||
        item.fragmentId && pageContext.fragmentIds?.includes(item.fragmentId)
      );
    }
    
    // エンジン別最適化
    optimizedItems = optimizedItems
      .sort((a, b) => b.expertiseLevel - a.expertiseLevel)
      .slice(0, config.recommendedKnowsAboutCount);
    
    return optimizedItems;
  }

  /**
   * 最適化mentions生成
   */
  private generateOptimizedMentions(
    baseEntity: EntityRelationship,
    config: any,
    pageContext?: any
  ): DetailedMentions[] {
    let optimizedMentions = [...DETAILED_MENTIONS_ORGANIZATION];
    
    // 重要度によるソート・フィルタリング
    optimizedMentions = optimizedMentions
      .sort((a, b) => b.importance - a.importance)
      .slice(0, config.recommendedMentionsCount);
    
    return optimizedMentions;
  }

  /**
   * Fragment ID連携強化
   */
  private generateFragmentEnhancement(fragmentIds: string[]): any {
    const relevantFragments = AI_OPTIMIZED_FRAGMENT_IDS.filter(
      fragment => fragmentIds.includes(fragment.id)
    );
    
    return {
      totalFragments: relevantFragments.length,
      averageSemanticWeight: relevantFragments.reduce((sum, f) => sum + f.semanticWeight, 0) / relevantFragments.length,
      hierarchyDistribution: this.calculateHierarchyDistribution(relevantFragments),
      queryTargeting: relevantFragments.flatMap(f => f.targetQueries)
    };
  }

  /**
   * エンティティ密度計算
   */
  private calculateEntityDensity(mentions: DetailedMentions[]): number {
    const totalImportance = mentions.reduce((sum, m) => sum + m.importance, 0);
    const maxPossibleImportance = mentions.length * 10;
    return totalImportance / maxPossibleImportance;
  }

  /**
   * 階層分布計算
   */
  private calculateHierarchyDistribution(fragments: AIOptimizedFragmentId[]): Record<number, number> {
    const distribution: Record<number, number> = {};
    fragments.forEach(fragment => {
      distribution[fragment.hierarchyLevel] = (distribution[fragment.hierarchyLevel] || 0) + 1;
    });
    return distribution;
  }

  /**
   * AI検索クエリ対応スコア計算
   */
  calculateAISearchScore(schema: any): {
    totalScore: number;
    breakdown: {
      knowsAboutScore: number;
      mentionsScore: number;
      fragmentIdScore: number;
      entityRelationshipScore: number;
    };
  } {
    const knowsAboutScore = this.scoreKnowsAbout(schema.knowsAbout || []);
    const mentionsScore = this.scoreMentions(schema.mentions || []);
    const fragmentIdScore = this.scoreFragmentIds(schema.hasPartEnhanced || []);
    const entityRelationshipScore = this.scoreEntityRelationships(schema);
    
    const totalScore = (knowsAboutScore + mentionsScore + fragmentIdScore + entityRelationshipScore) / 4;
    
    return {
      totalScore,
      breakdown: {
        knowsAboutScore,
        mentionsScore,
        fragmentIdScore,
        entityRelationshipScore
      }
    };
  }

  private scoreKnowsAbout(knowsAbout: any[]): number {
    if (!knowsAbout.length) return 0;
    
    const expertiseLevelSum = knowsAbout.reduce((sum, item) => sum + (item.expertiseLevel || 3), 0);
    const averageExpertise = expertiseLevelSum / knowsAbout.length;
    const countScore = Math.min(100, knowsAbout.length * 4);
    
    return (averageExpertise / 5) * 50 + countScore * 0.5;
  }

  private scoreMentions(mentions: any[]): number {
    if (!mentions.length) return 0;
    
    const importanceSum = mentions.reduce((sum, mention) => sum + (mention.importance || 5), 0);
    const averageImportance = importanceSum / mentions.length;
    const countScore = Math.min(100, mentions.length * 6);
    
    return (averageImportance / 10) * 50 + countScore * 0.5;
  }

  private scoreFragmentIds(fragmentIds: any[]): number {
    if (!fragmentIds.length) return 0;
    
    const semanticWeightSum = fragmentIds.reduce((sum, fragment) => sum + (fragment.semanticWeight || 0.5), 0);
    const averageWeight = semanticWeightSum / fragmentIds.length;
    
    return averageWeight * 100;
  }

  private scoreEntityRelationships(schema: any): number {
    const hasEntityRelationships = schema.aiSearchOptimization?.entityRelationshipDensity || 0;
    const hasKnowledgeGraphIntegration = schema.aiSearchOptimization?.knowledgeGraphIntegration ? 50 : 0;
    
    return hasEntityRelationships * 50 + hasKnowledgeGraphIntegration;
  }
}

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * AI検索エンジン最適化スキーマ生成
 */
export function generateAISearchOptimizedSchema(
  entityType: 'organization' | 'service',
  targetEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude'],
  pageContext?: any
): any {
  const system = new AISearchOptimizationSystem();
  
  const baseEntity = entityType === 'organization' 
    ? ORGANIZATION_ENTITY 
    : SERVICE_ENTITIES[0]; // または適切なサービス選択ロジック
  
  return system.generateAIOptimizedSchema(baseEntity, targetEngines, pageContext);
}

/**
 * Fragment ID連携マッピング生成
 */
export function generateFragmentMapping(fragmentIds: string[]): Record<string, AIOptimizedFragmentId> {
  const mapping: Record<string, AIOptimizedFragmentId> = {};
  
  AI_OPTIMIZED_FRAGMENT_IDS.forEach(fragment => {
    if (fragmentIds.includes(fragment.id)) {
      mapping[fragment.id] = fragment;
    }
  });
  
  return mapping;
}

/**
 * AI検索クエリ対応度チェック
 */
export function checkAISearchReadiness(schema: any): {
  isReady: boolean;
  score: number;
  recommendations: string[];
} {
  const system = new AISearchOptimizationSystem();
  const scoreResult = system.calculateAISearchScore(schema);
  const isReady = scoreResult.totalScore >= 75;
  
  const recommendations: string[] = [];
  
  if (scoreResult.breakdown.knowsAboutScore < 70) {
    recommendations.push('knowsAboutプロパティの詳細化と専門度向上');
  }
  if (scoreResult.breakdown.mentionsScore < 70) {
    recommendations.push('mentionsでの関連エンティティ明示強化');
  }
  if (scoreResult.breakdown.fragmentIdScore < 70) {
    recommendations.push('Fragment IDとの連携強化');
  }
  if (scoreResult.breakdown.entityRelationshipScore < 70) {
    recommendations.push('エンティティ関係性の構造化向上');
  }
  
  return {
    isReady,
    score: scoreResult.totalScore,
    recommendations
  };
}

export default AISearchOptimizationSystem; 