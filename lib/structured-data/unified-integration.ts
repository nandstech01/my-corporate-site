
// Mike King理論準拠: 統一レリバンスエンジニアリング統合システム
// フェーズ1-2完成 → フェーズ3: GEO最適化拡張

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { getUnifiedSupabaseClient } from '../supabase/unified-client'
import { 
  getEntityRelationships, 
  type EntityRelationship,
  ORGANIZATION_ENTITY,
  SERVICE_ENTITIES
} from './entity-relationships'
import { 
  SemanticLinksSystem, 
  type SemanticLink,
  type LinkContext
} from './semantic-links'
import { 
  AutoTOCSystem, 
  type TOCItem 
} from './auto-toc-system'
import { 
  HasPartSchemaSystem,
  type HasPartSchema
} from './haspart-schema-system'
// Phase 3: MDXセクション分割システム統合
import {
  MDXSectionSystem,
  type MDXSection,
  type ContentSplitResult
} from './mdx-section-system'
// Phase 4: Trust Layer & Click-Recovery統合
import { 
  AuthorTrustSystem, 
  authorTrustSystem,
  type AuthorProfile,
  type TrustSignals
} from './author-trust-system'
import { 
  aiSearchDetection, 
  type TrafficSource,
  type AISearchStats
} from '../ai-search-detection'
import { createClient } from '@/utils/supabase/server'

// 統合データ型定義
export interface UnifiedPageData {
  // データベース情報
  business?: {
    id: number;
    slug: string;
    name: string;
    description?: string;
  };
  category?: {
    id: number;
    slug: string;
    name: string;
    description?: string;
    business_id: number;
  };
  posts?: Array<{
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    seo_keywords?: string[];
    category_id?: number;
    section_id?: number;
    is_chatgpt_special?: boolean;
  }>;
  sections?: Array<{
    id: number;
    slug: string;
    name: string;
    description?: string;
  }>;
  
  // 統合システム出力
  entityRelationships: EntityRelationship[];
  semanticLinks: SemanticLink[];
  tableOfContents: TOCItem[];
  structuredData: any;
  fragmentIds: string[];
  // Phase 3: GEO最適化拡張
  hasPartSchemas?: HasPartSchema[];
  geoOptimizedHasPart?: {
    geoSchema: HasPartSchema;
    jsonLd: any;
  };
  // Phase 3: MDXセクション分割・1万字級コンテンツ拡充
  mdxSections?: MDXSection[];
  contentSplitResult?: ContentSplitResult;
  expandedWordCount?: number;
  topicalCoverageComplete?: boolean;
  
  // Phase 4: Trust Layer & Click-Recovery
  authorProfile?: AuthorProfile;
  trustSignals?: TrustSignals;
  aiSearchDetection?: {
    trafficSource: TrafficSource;
    shouldShowBanner: boolean;
    recoveryMessage: {
      title: string;
      message: string;
      ctaText: string;
      urgency: 'low' | 'medium' | 'high';
    };
  };
  authorSchema?: any;
  organizationTrustSchema?: any;
}

export interface PageContext {
  pageSlug: string;
  pageTitle: string;
  keywords: string[];
  category: string;
  businessId?: number;
  categoryId?: number;
  // Phase 3: GEO対応
  targetQueries?: string[];
  // Phase 4: AI検索・Trust Layer対応
  requestHeaders?: Headers;
  currentUrl?: string;
  enableAISearchDetection?: boolean;
  enableTrustSignals?: boolean;
}

/**
 * 統一レリバンスエンジニアリング統合システム
 */
export class UnifiedIntegrationSystem {
  private semanticLinks: SemanticLinksSystem;
  private autoTOC: AutoTOCSystem;
  private hasPartSystem: HasPartSchemaSystem;
  // Phase 3: MDXセクション分割システム
  private mdxSystem: MDXSectionSystem;
  
  // キャッシュシステム追加（無限ループ防止）
  private mdxCache = new Map<string, ContentSplitResult>();
  private trustSignalsCache = new Map<string, { authorProfile: AuthorProfile; trustSignals: TrustSignals; }>();
  private processingPages = new Set<string>();

  constructor() {
    this.semanticLinks = new SemanticLinksSystem();
    this.autoTOC = new AutoTOCSystem();
    this.hasPartSystem = new HasPartSchemaSystem();
    // Phase 3: 1万字級対応MDXシステム初期化
    this.mdxSystem = new MDXSectionSystem({
      targetWordCount: 5000, // 軽量化：1万字 → 5千字
      enableTopicalClustering: true,
      includeKeywordAnalysis: true,
      generateSubsections: false // サブセクション生成を無効化で高速化
    });
  }

  /**
   * 統合データ生成（メイン処理）
   */
  async generateUnifiedPageData(context: PageContext): Promise<UnifiedPageData> {
    try {
      // 🔧 一時的に従来のクライアント使用（後で統一クライアントに移行）
      const supabase = createClientComponentClient();
      
      // // キャッシュチェック - 一時的にコメントアウト
      // const cacheKey = `unified_${context.slug || 'index'}_${context.entityType || 'default'}`;
      // if (this.cache.has(cacheKey)) {
      //   console.log('📦 キャッシュからデータ取得:', cacheKey);
      //   return this.cache.get(cacheKey)!;
      // }

      console.log('🚀 統合データ生成開始（最適化版）:', context);

      // データベースから関連データを並列取得
      const [business, category, posts, sections] = await Promise.all([
        this.fetchBusinessData(supabase, context),
        this.fetchCategoryData(supabase, context),
        this.fetchPostsData(supabase, context),
        this.fetchSectionsData(supabase, context)
      ]);

      // エンティティ関係性を生成
      const entityRelationships = this.generateEntityRelationships(
        context, business, category, posts
      );

      // セマンティックリンクを生成
      const linkContext: LinkContext = {
        currentPage: context.pageSlug,
        currentTitle: context.pageTitle,
        keywords: context.keywords,
        category: context.category,
        priority: 1
      };
      const baseSemanticLinks = this.semanticLinks.generateSemanticLinks(linkContext);
      const enhancedSemanticLinks = await this.enhanceSemanticLinksWithDB(
        baseSemanticLinks, business, category, posts
      );

      // TOCを生成
      const tableOfContents = this.generateTableOfContents(context);

      // Fragment IDsを生成
      const fragmentIds = tableOfContents.map(item => item.id);

      // Phase 3: hasPartスキーマを生成
      const hasPartSchemas = this.hasPartSystem.generateFragmentBasedSchema(
        fragmentIds,
        `https://nands.tech/${context.pageSlug}`,
        context.pageTitle,
        tableOfContents
      );

      // GEO最適化hasPartスキーマ（targetQueriesがある場合）
      let geoOptimizedHasPart;
      if (context.targetQueries && context.targetQueries.length > 0) {
        geoOptimizedHasPart = this.hasPartSystem.generateGEOOptimizedSchema(
          tableOfContents,
          `https://nands.tech/${context.pageSlug}`,
          context.pageTitle,
          context.targetQueries
        );
      }

      // 統一構造化データを生成（hasPartスキーマを統合）
      const structuredData = this.generateUnifiedStructuredDataWithHasPart(
        context, entityRelationships, business, category, hasPartSchemas.fragmentSchemas
      );

      // Phase 3: MDXセクション分割・1万字級コンテンツ拡充
      let mdxSections: MDXSection[] = [];
      let contentSplitResult: ContentSplitResult | undefined;
      let expandedWordCount = 0;
      let topicalCoverageComplete = false;

      // 🚀 AIO・GEO最適化：MDXセクション分割（キャッシュ・無限ループ防止版）
      try {
        const cacheKey = `${context.pageSlug}-${context.pageTitle}`;
        
        // 並行実行制御：同じページが既に処理中の場合はスキップ
        if (this.processingPages.has(cacheKey)) {
          console.log(`⏩ MDXセクション分割スキップ: ${cacheKey} は処理中`);
        } else if (this.mdxCache.has(cacheKey)) {
          // キャッシュがある場合は再利用
          contentSplitResult = this.mdxCache.get(cacheKey);
          mdxSections = contentSplitResult!.sections;
          expandedWordCount = contentSplitResult!.totalWordCount;
          topicalCoverageComplete = expandedWordCount >= 5000; // 5千字級達成判定
          
          console.log(`📊 MDXセクション分割完了（キャッシュ）: ${mdxSections.length}セクション, ${expandedWordCount}文字`);
        } else {
          // 新規処理（タイムアウト付き）
          this.processingPages.add(cacheKey);
          
          const processWithTimeout = Promise.race([
            this.processMDXSections(context, entityRelationships),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('MDXセクション分割タイムアウト')), 5000)
            )
          ]);

          contentSplitResult = await processWithTimeout as ContentSplitResult;
          
          // キャッシュに保存
          this.mdxCache.set(cacheKey, contentSplitResult);
          
          mdxSections = contentSplitResult.sections;
          expandedWordCount = contentSplitResult.totalWordCount;
          topicalCoverageComplete = expandedWordCount >= 5000; // 5千字級達成判定

          console.log(`📊 MDXセクション分割完了: ${mdxSections.length}セクション, ${expandedWordCount}文字`);
          
          this.processingPages.delete(cacheKey);
        }
      } catch (mdxError) {
        console.error('MDXセクション分割エラー:', mdxError);
        this.processingPages.delete(`${context.pageSlug}-${context.pageTitle}`);
        // AIO・GEO機能継続：エラーがあってもデフォルト値で継続
        mdxSections = this.generateFallbackMDXSections(context);
        expandedWordCount = 3000; // フォールバック値
        topicalCoverageComplete = false;
      }

      // Phase 4: Trust Layer & AI検索検知処理
      let authorProfile: AuthorProfile | undefined;
      let trustSignals: TrustSignals | undefined;
      let authorSchema: any | undefined;
      let organizationTrustSchema: any | undefined;
      let aiSearchDetectionResult: any | undefined;

      // 🚀 AIO・GEO最適化：Trust Signals（キャッシュ・無限ループ防止版）
      try {
        const trustCacheKey = `${context.pageSlug}-${context.category}`;
        
        // Trust Signalsが有効な場合
        if (context.enableTrustSignals !== false) {
          if (this.trustSignalsCache.has(trustCacheKey)) {
            // キャッシュから取得
            const cached = this.trustSignalsCache.get(trustCacheKey)!;
            authorProfile = cached.authorProfile;
            trustSignals = cached.trustSignals;
            
            console.log(`👤 Trust Signals適用完了（キャッシュ）: ${authorProfile.expertise.join(', ')}`);
          } else {
            // 新規処理（タイムアウト付き）
            const trustProcessWithTimeout = Promise.race([
              this.processTrustSignals(context),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Trust Signals処理タイムアウト')), 3000)
              )
            ]);

            const trustResult = await trustProcessWithTimeout as { authorProfile: AuthorProfile; trustSignals: TrustSignals; };
            authorProfile = trustResult.authorProfile;
            trustSignals = trustResult.trustSignals;
            
            // キャッシュに保存
            this.trustSignalsCache.set(trustCacheKey, { authorProfile, trustSignals });
            
            console.log(`👤 Trust Signals適用完了: ${authorProfile.expertise.join(', ')}`);
          }
          
          // 著者プロフィール用構造化データ生成
          authorSchema = authorTrustSystem.generateAuthorSchema();
          organizationTrustSchema = authorTrustSystem.generateOrganizationTrustSchema();
          
          // 既存の構造化データに著者情報を統合
          if (structuredData && Array.isArray(structuredData)) {
            structuredData.push(authorSchema);
            structuredData.push(organizationTrustSchema);
          } else if (structuredData && typeof structuredData === 'object') {
            structuredData.author = authorSchema;
            structuredData.organization = organizationTrustSchema;
          }
        }

        // AI検索検知処理（軽量化）
        if (context.enableAISearchDetection !== false && context.requestHeaders) {
          try {
            const trafficSource = aiSearchDetection.detectAISearchTraffic(
              context.requestHeaders,
              context.currentUrl
            );

            if (trafficSource.isAISearch) {
              const shouldShowBanner = aiSearchDetection.shouldShowClickRecoveryBanner(trafficSource);
              const recoveryMessage = aiSearchDetection.generateRecoveryMessage(trafficSource);

              aiSearchDetectionResult = {
                trafficSource,
                shouldShowBanner,
                recoveryMessage
              };

              console.log(`🤖 AI検索流入検知: ${trafficSource.source?.name} (信頼度: ${trafficSource.confidence})`);
            }
          } catch (aiDetectionError) {
            console.warn('AI検索検知処理エラー:', aiDetectionError);
            // エラーは無視して継続
          }
        }

      } catch (phase4Error) {
        console.error('Phase 4処理エラー:', phase4Error);
        // AIO・GEO機能継続：エラーがあってもフォールバック値で継続
        if (context.enableTrustSignals !== false) {
          authorProfile = this.generateFallbackAuthorProfile();
          trustSignals = this.generateFallbackTrustSignals();
        }
      }

      const unifiedData: UnifiedPageData = {
        business,
        category,
        posts,
        sections,
        entityRelationships,
        semanticLinks: enhancedSemanticLinks,
        tableOfContents,
        structuredData,
        fragmentIds,
        hasPartSchemas: hasPartSchemas.fragmentSchemas,
        geoOptimizedHasPart,
        // Phase 3: MDXセクション分割結果
        mdxSections,
        contentSplitResult,
        expandedWordCount,
        topicalCoverageComplete,
        // Phase 4: Trust Layer & AI検索検知結果
        authorProfile,
        trustSignals,
        authorSchema,
        organizationTrustSchema,
        aiSearchDetection: aiSearchDetectionResult
      };

      // キャッシュに保存
      // this.mdxCache.set(cacheKey, unifiedData); // キャッシュは一時的にコメントアウト

      return unifiedData;

    } catch (error) {
      console.error('統合データ生成エラー:', error);
      throw error;
    } finally {
      // this.processingPages.delete(cacheKey); // キャッシュは一時的にコメントアウト
    }
  }

  /**
   * ビジネスデータ取得
   */
  private async fetchBusinessData(supabase: any, context: PageContext) {
    if (!context.businessId) return null;
    
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', context.businessId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ビジネスデータ取得エラー:', error);
      return null;
    }
  }

  /**
   * カテゴリデータ取得
   */
  private async fetchCategoryData(supabase: any, context: PageContext) {
    if (!context.categoryId) return null;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', context.categoryId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('カテゴリデータ取得エラー:', error);
      return null;
    }
  }

  /**
   * 記事データ取得
   */
  private async fetchPostsData(supabase: any, context: PageContext) {
    try {
      let query = supabase
        .from('chatgpt_posts')
        .select('*, is_chatgpt_special')
        .limit(10);
      
      if (context.categoryId) {
        query = query.eq('category_id', context.categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('記事データ取得エラー:', error);
      return [];
    }
  }

  /**
   * セクションデータ取得
   */
  private async fetchSectionsData(supabase: any, context: PageContext) {
    try {
      const { data, error } = await supabase
        .from('chatgpt_sections')
        .select('*')
        .limit(20);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('セクションデータ取得エラー:', error);
      return [];
    }
  }

  /**
   * エンティティ関係性生成
   */
  private generateEntityRelationships(
    context: PageContext,
    business: any,
    category: any,
    posts: any[]
  ): EntityRelationship[] {
    const relationships: EntityRelationship[] = [];

    // メインサービスエンティティ
    const serviceEntity = SERVICE_ENTITIES.find((s: any) => 
      s.serviceType === context.category || 
      context.keywords.some(k => s.knowsAbout.includes(k))
    );

    if (serviceEntity) {
      relationships.push(serviceEntity);
    }

    // 関連サービスエンティティ
    const relatedServices = SERVICE_ENTITIES.filter((s: any) => 
      s !== serviceEntity && 
      context.keywords.some(k => s.knowsAbout.includes(k))
    ).slice(0, 3);

    relationships.push(...relatedServices);

    return relationships;
  }

  /**
   * セマンティックリンクのDB連携強化
   */
  private async enhanceSemanticLinksWithDB(
    baseLinks: SemanticLink[],
    business: any,
    category: any,
    posts: any[]
  ): Promise<SemanticLink[]> {
    const enhancedLinks = [...baseLinks];

    // カテゴリからの記事リンク追加
    if (category && posts.length > 0) {
      const categoryPosts = posts.filter(post => post.category_id === category.id);
      categoryPosts.slice(0, 3).forEach(post => {
        enhancedLinks.push({
          url: `/posts/${post.slug}`,
          title: post.title,
          description: post.excerpt || `${post.title}について詳しく解説`,
          relevanceScore: 0.8,
          linkType: 'related',
          keywords: post.seo_keywords || [post.title]
        });
      });
    }

    // カテゴリページリンク
    if (category) {
      enhancedLinks.push({
        url: `/categories/${category.slug}`,
        title: `${category.name}の関連記事`,
        description: category.description || `${category.name}に関する記事一覧`,
        relevanceScore: 0.9,
        linkType: 'related',
        keywords: [category.name]
      });
    }

    return enhancedLinks
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);
  }

  /**
   * TOC生成
   */
  private generateTableOfContents(context: PageContext): TOCItem[] {
    // ページタイプに応じたデフォルトTOC構造
    const defaultStructures: Record<string, TOCItem[]> = {
      'hr-solutions': [
        { id: 'hr-hero', title: 'HR支援サービス概要', level: 2, anchor: '#hr-hero' },
        { id: 'hr-services', title: 'サービス詳細', level: 2, anchor: '#hr-services' },
        { id: 'hr-techstack', title: '技術スタック', level: 2, anchor: '#hr-techstack' },
        { id: 'hr-showcase', title: '実績・事例', level: 2, anchor: '#hr-showcase' },
        { id: 'hr-pricing', title: '料金プラン', level: 2, anchor: '#hr-pricing' },
        { id: 'hr-contact', title: 'お問い合わせ', level: 2, anchor: '#hr-contact' }
      ],
      'ai-agents': [
        { id: 'agent-hero', title: 'AIエージェント開発', level: 2, anchor: '#agent-hero' },
        { id: 'agent-services', title: 'サービス内容', level: 2, anchor: '#agent-services' },
        { id: 'agent-techstack', title: 'Mastra Framework', level: 2, anchor: '#agent-techstack' },
        { id: 'agent-showcase', title: '開発事例', level: 2, anchor: '#agent-showcase' },
        { id: 'agent-pricing', title: '開発費用', level: 2, anchor: '#agent-pricing' },
        { id: 'agent-contact', title: 'ご相談', level: 2, anchor: '#agent-contact' }
      ],
      'aio-seo': [
        { id: 'aio-hero', title: 'AIO対策・GEO概要', level: 2, anchor: '#aio-hero' },
        { id: 'aio-services', title: 'レリバンスエンジニアリング', level: 2, anchor: '#aio-services' },
        { id: 'aio-methodology', title: 'Mike King理論', level: 2, anchor: '#aio-methodology' },
        { id: 'aio-case-studies', title: '成功事例', level: 2, anchor: '#aio-case-studies' },
        { id: 'aio-pricing', title: '料金体系', level: 2, anchor: '#aio-pricing' },
        { id: 'aio-contact', title: 'お問い合わせ', level: 2, anchor: '#aio-contact' }
      ],
      'chatbot-development': [
        { id: 'hero-section', title: 'チャットボット開発サービス', level: 2, anchor: '#hero-section' },
        { id: 'services-section', title: 'サービス詳細', level: 2, anchor: '#services-section' },
        { id: 'tech-stack-section', title: '技術スタック', level: 2, anchor: '#tech-stack-section' },
        { id: 'showcase-section', title: '実績・事例', level: 2, anchor: '#showcase-section' },
        { id: 'pricing-section', title: '料金プラン', level: 2, anchor: '#pricing-section' },
        { id: 'consultation-section', title: 'お問い合わせ', level: 2, anchor: '#consultation-section' }
      ],
      'mcp-servers': [
        { id: 'hero-section', title: 'MCPサーバー開発サービス', level: 2, anchor: '#hero-section' },
        { id: 'services-section', title: 'サービス詳細', level: 2, anchor: '#services-section' },
        { id: 'tech-stack-section', title: '技術スタック', level: 2, anchor: '#tech-stack-section' },
        { id: 'showcase-section', title: '実績・事例', level: 2, anchor: '#showcase-section' },
        { id: 'pricing-section', title: '料金プラン', level: 2, anchor: '#pricing-section' },
        { id: 'contact-section', title: 'お問い合わせ', level: 2, anchor: '#contact-section' }
      ],
      'sns-automation': [
        { id: 'hero-section', title: 'SNS自動化システム開発', level: 2, anchor: '#hero-section' },
        { id: 'services-section', title: 'サービス詳細', level: 2, anchor: '#services-section' },
        { id: 'tech-stack-section', title: '技術スタック', level: 2, anchor: '#tech-stack-section' },
        { id: 'showcase-section', title: '実績・事例', level: 2, anchor: '#showcase-section' },
        { id: 'pricing-section', title: '料金プラン', level: 2, anchor: '#pricing-section' },
        { id: 'contact-section', title: 'お問い合わせ', level: 2, anchor: '#contact-section' }
      ],
      'corporate': [
        { id: 'hero', title: '法人向けAIソリューション', level: 2, anchor: '#hero' },
        { id: 'problems', title: '課題解決', level: 2, anchor: '#problems' },
        { id: 'services', title: 'サービス内容', level: 2, anchor: '#services' },
        { id: 'merits', title: '導入メリット', level: 2, anchor: '#merits' },
        { id: 'case-studies', title: '導入事例', level: 2, anchor: '#case-studies' },
        { id: 'industries', title: '業界別ソリューション', level: 2, anchor: '#industries' },
        { id: 'flow', title: '導入の流れ', level: 2, anchor: '#flow' },
        { id: 'roi-calculator', title: 'ROI計算ツール', level: 2, anchor: '#roi-calculator' },
        { id: 'contact', title: 'お問い合わせ', level: 2, anchor: '#contact' }
      ]
    };

    return defaultStructures[context.pageSlug] || [];
  }

  /**
   * hasPartスキーマ統合版の構造化データ生成
   */
  private generateUnifiedStructuredDataWithHasPart(
    context: PageContext,
    entities: EntityRelationship[],
    business: any,
    category: any,
    hasPartSchemas: HasPartSchema[]
  ): any {
    const pageUrl = `https://nands.tech/${context.pageSlug}`;
    
    const graphItems: any[] = [
      // メインページエンティティ（hasPartを含む）
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        "name": context.pageTitle,
        "provider": {
          "@id": "https://nands.tech/#organization"
        },
        "areaServed": "JP",
        "serviceType": context.category,
        "knowsAbout": context.keywords,
        "mainEntity": entities.map(e => ({ "@id": e["@id"] })),
        // Phase 3: hasPartスキーマを統合
        "hasPart": hasPartSchemas.map(part => ({
          "@type": part['@type'],
          "@id": part['@id'],
          "name": part.name,
          "url": part.url
        }))
      },
      
      // 組織エンティティ
      ORGANIZATION_ENTITY,
      
      // WebPageエンティティ（hasPartを含む）
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": context.pageTitle,
        "isPartOf": {
          "@id": "https://nands.tech/#website"
        },
        "about": {
          "@id": `${pageUrl}#service`
        },
        "mainEntity": {
          "@id": `${pageUrl}#service`
        },
        // Phase 3: WebPageにもhasPartスキーマを追加
        "hasPart": hasPartSchemas.map(part => ({
          "@type": part['@type'],
          "@id": part['@id'],
          "name": part.name,
          "url": part.url
        }))
      }
    ];

    // hasPartスキーマを個別エンティティとして追加
    hasPartSchemas.forEach(partSchema => {
      graphItems.push({
        "@type": partSchema['@type'],
        "@id": partSchema['@id'],
        "name": partSchema.name,
        "url": partSchema.url,
        "position": partSchema.position,
        "isPartOf": partSchema.isPartOf
      });
    });

    // ビジネス・カテゴリ情報を統合
    if (business) {
      graphItems.push({
        "@type": "BusinessUnit",
        "@id": `https://nands.tech/business/${business.slug}#entity`,
        "name": business.name,
        "description": business.description,
        "parentOrganization": {
          "@id": "https://nands.tech/#organization"
        }
      });
    }

    if (category) {
      graphItems.push({
        "@type": "CategoryPage",
        "@id": `https://nands.tech/categories/${category.slug}#entity`,
        "name": category.name,
        "description": category.description,
        "mainEntity": {
          "@id": `${pageUrl}#service`
        }
      });
    }

    return {
      "@context": "https://schema.org",
      "@graph": graphItems
    };
  }

  /**
   * モックページコンテンツ生成（MDXセクション分割用）
   * 実際の実装では既存ページからHTMLを取得
   */
  private generateMockPageContent(context: PageContext, entities: EntityRelationship[]): string {
    const sections = [
      {
        id: `${context.pageSlug}-hero`,
        title: `${context.pageTitle}概要`,
        content: `${context.pageTitle}は、${context.keywords.join('・')}分野における革新的なソリューションです。最新のAI技術を活用して、お客様のビジネスを次のレベルへと押し上げます。`
      },
      {
        id: `${context.pageSlug}-services`,
        title: 'サービス詳細',
        content: `当サービスでは、${entities.map(e => e.name).join('、')}を通じて包括的なソリューションを提供しています。各サービスは相互に連携し、最大限の効果を発揮します。`
      },
      {
        id: `${context.pageSlug}-features`,
        title: '主な特徴・機能',
        content: `${context.keywords.map(k => `${k}に特化した機能`).join('、')}により、業界最高水準のパフォーマンスを実現します。AIを活用した自動化機能で、作業効率を大幅に向上させることができます。`
      },
      {
        id: `${context.pageSlug}-benefits`,
        title: 'お客様のメリット',
        content: `導入により、コスト削減、効率化、品質向上を同時に実現できます。特に${context.category}分野では、従来比で50%以上の効率向上が期待できます。`
      },
      {
        id: `${context.pageSlug}-case-studies`,
        title: '導入事例・実績',
        content: `これまでに多数の企業様にご導入いただき、優れた成果を上げています。業界をリードする企業様からも高い評価をいただいております。`
      },
      {
        id: `${context.pageSlug}-pricing`,
        title: '料金プラン',
        content: `お客様のニーズに合わせて、複数の料金プランをご用意しています。初期導入コストを抑えつつ、段階的にサービスを拡張していくことが可能です。`
      }
    ];

    // HTMLセクション形式で生成
    return `<main>${sections.map(section => 
      `<section id="${section.id}">
        <h2>${section.title}</h2>
        <p>${section.content}</p>
      </section>`
    ).join('\n')}</main>`;
  }

  /**
   * MDXセクション分割処理（キャッシュ・タイムアウト付き）
   */
  private async processMDXSections(context: PageContext, entities: EntityRelationship[]): Promise<ContentSplitResult> {
    const mockPageContent = this.generateMockPageContent(context, entities);
    return this.mdxSystem.structurizeExistingPage(
      mockPageContent,
      context.pageSlug,
      context.pageTitle,
      context.keywords
    );
  }

  /**
   * MDXセクション分割失敗時のフォールバック生成
   */
  private generateFallbackMDXSections(context: PageContext): MDXSection[] {
    return [
      {
        id: `${context.pageSlug}-overview`,
        title: `${context.pageTitle}について`,
        content: `${context.pageTitle}に関する詳細情報をお探しの方へ。${context.keywords.slice(0, 3).join('・')}などの重要なトピックについて解説いたします。`,
        level: 2,
        anchor: `#${context.pageSlug}-overview`,
        keywords: context.keywords.slice(0, 5),
        wordCount: 150,
        fragmentId: `${context.pageSlug}-overview`,
        seoKeywords: context.keywords.slice(0, 3),
        semanticTopics: ['概要', '基本情報', '導入']
      },
      {
        id: `${context.pageSlug}-features`,
        title: '主な特徴と機能',
        content: `${context.category}分野での革新的なソリューションを提供します。最新の技術を活用し、お客様のニーズに最適化された機能を提供いたします。`,
        level: 2,
        anchor: `#${context.pageSlug}-features`,
        keywords: context.keywords.slice(2, 7),
        wordCount: 120,
        fragmentId: `${context.pageSlug}-features`,
        seoKeywords: context.keywords.slice(1, 4),
        semanticTopics: ['機能', '特徴', '技術']
      },
      {
        id: `${context.pageSlug}-benefits`,
        title: 'メリットと効果',
        content: `導入による具体的なメリットと期待される効果について詳しく説明します。効率化、コスト削減、品質向上など、多方面での改善が期待できます。`,
        level: 2,
        anchor: `#${context.pageSlug}-benefits`,
        keywords: context.keywords.slice(3, 8),
        wordCount: 130,
        fragmentId: `${context.pageSlug}-benefits`,
        seoKeywords: context.keywords.slice(2, 5),
        semanticTopics: ['メリット', '効果', '改善']
      }
    ];
  }

  /**
   * Trust Signals処理（キャッシュ・タイムアウト付き）
   */
  private async processTrustSignals(context: PageContext): Promise<{ authorProfile: AuthorProfile; trustSignals: TrustSignals; }> {
    const authorProfile = authorTrustSystem.getAuthorProfile();
    const trustSignals = authorTrustSystem.getTrustSignals();
    return { authorProfile, trustSignals };
  }

  /**
   * Trust Signals処理失敗時のフォールバック生成
   */
  private generateFallbackTrustSignals(): TrustSignals {
    return {
      authorProfile: this.generateFallbackAuthorProfile(),
      organizationTrust: {
        foundedYear: 2008,
        employeeCount: '10-50名',
        clientCount: 100,
        projectsCompleted: 200,
        industryExperience: 15
      },
      technicalCredibility: {
        githubContributions: 500,
        openSourceProjects: ['AI-Tools', 'Data-Analytics'],
        technicalBlogPosts: 50,
        speakingEngagements: 20
      },
      businessCredibility: {
        revenue: '1億円以上',
        clientRetentionRate: '95%',
        satisfactionScore: '4.8/5.0',
        certifications: ['AWS Certified', 'Google Cloud Professional']
      }
    };
  }

  /**
   * モック著者プロフィール生成（Trust Signals失敗時のフォールバック）
   */
  private generateFallbackAuthorProfile(): AuthorProfile {
    return {
      '@type': 'Person',
      '@id': 'https://nands.tech/author/ai-expert',
      name: 'AIエンジニア',
      jobTitle: 'AI技術責任者',
      worksFor: {
        '@type': 'Organization',
        '@id': 'https://nands.tech/#organization',
        name: '株式会社エヌアンドエス'
      },
      description: 'AIソリューションの専門家として、お客様のビジネスに革新的な変革をもたらす技術を提供します。',
      expertise: ['AIソリューション', 'テクノロジー', 'データ分析'],
      credentials: [
        { type: 'experience', title: 'シニアエンジニア', issuer: 'AI Tech Solutions', year: 2020 },
        { type: 'certification', title: 'AI Professional Certificate', issuer: 'AI Institute', year: 2019 }
      ],
      achievements: [
        { title: 'AI Innovation Project', description: '革新的なAIソリューションの開発', year: 2022, category: 'technical' },
        { title: 'Best Performance Award', description: '最高パフォーマンス賞受賞', year: 2021, category: 'business' }
      ],
      socialMedia: [
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/ai-expert' },
        { platform: 'Twitter', url: 'https://twitter.com/ai_expert' }
      ],
      awards: [
        { name: 'Best AI Innovation Award', year: 2022, issuer: 'AI Tech Awards' },
        { name: 'Top 10 AI Experts', year: 2021, issuer: 'Global AI Rankings' }
      ]
    };
  }
}

/**
 * 統合システムのユーティリティ関数
 */
export async function generateUnifiedPageData(context: PageContext): Promise<UnifiedPageData> {
  const system = new UnifiedIntegrationSystem();
  return await system.generateUnifiedPageData(context);
}

/**
 * React/Next.js コンポーネント用のヘルパー
 */
export function UnifiedStructuredDataScript({ data }: { data: any }) {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}

export function SemanticLinksComponent({ 
  links, 
  title = "関連サービス",
  className = "mt-8 p-6 bg-gray-50 rounded-lg"
}: { 
  links: SemanticLink[];
  title?: string;
  className?: string;
}) {
  if (links.length === 0) return '';

  return `
    <div class="${className}">
      <h3 class="text-lg font-semibold mb-4">${title}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${links.map(link => `
          <a href="${link.url}" class="block p-4 bg-white rounded-md hover:shadow-md transition-shadow">
            <h4 class="font-medium text-blue-600">${link.title}</h4>
            <p class="text-sm text-gray-600 mt-1">${link.description}</p>
            <div class="flex flex-wrap gap-1 mt-2">
              ${link.keywords.slice(0, 3).map(keyword => 
                `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${keyword}</span>`
              ).join('')}
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

export function TOCComponent({ 
  toc, 
  title = "目次",
  className = "py-16 bg-gradient-to-r from-blue-50 to-indigo-50"
}: { 
  toc: TOCItem[];
  title?: string;  
  className?: string;
}) {
  if (toc.length === 0) return '';

  return `
    <section class="${className}">
      <div class="max-w-6xl mx-auto px-4">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 class="text-2xl font-bold text-white flex items-center">
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              ${title}
            </h2>
            <p class="text-blue-100 mt-2">このページの内容に素早くアクセス</p>
          </div>
          
          <nav class="p-8">
            <div class="grid md:grid-cols-2 gap-6">
              ${toc.map((item, index) => `
                <div class="group">
                  <a href="${item.anchor}" 
                     class="flex items-start p-4 rounded-xl border border-gray-200 
                            hover:border-blue-300 hover:bg-blue-50 transition-all duration-300
                            group-hover:shadow-md">
                    <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 
                               rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
                      ${index + 1}
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 
                               transition-colors mb-2 leading-tight">
                        ${item.title}
                      </h3>
                      ${item.children && item.children.length > 0 ? `
                        <div class="space-y-1">
                                                     ${item.children.map(child => `
                             <a href="${child.anchor}" 
                                class="block text-sm text-gray-600 hover:text-blue-600 
                                       transition-colors hover:underline pl-2 border-l-2 
                                       border-gray-200 hover:border-blue-300">
                               ${child.title}
                             </a>
                           `).join('')}
                        </div>
                      ` : ''}
                    </div>
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 
                               transition-colors flex-shrink-0 mt-1" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              `).join('')}
            </div>
          </nav>
        </div>
      </div>
    </section>
  `;
} 