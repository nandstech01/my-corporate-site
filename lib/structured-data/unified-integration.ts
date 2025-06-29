// Mike King理論準拠: 統一レリバンスエンジニアリング統合システム
// フェーズ1-2完成 → フェーズ3: GEO最適化拡張

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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

  constructor() {
    this.semanticLinks = new SemanticLinksSystem();
    this.autoTOC = new AutoTOCSystem();
    this.hasPartSystem = new HasPartSchemaSystem();
    // Phase 3: 1万字級対応MDXシステム初期化
    this.mdxSystem = new MDXSectionSystem({
      targetWordCount: 10000, // 1万字級対応
      enableTopicalClustering: true,
      includeKeywordAnalysis: true,
      generateSubsections: true
    });
  }

  /**
   * 統合ページデータ生成（メイン関数）
   */
  async generateUnifiedPageData(context: PageContext): Promise<UnifiedPageData> {
    try {
      const supabase = createClientComponentClient();

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

      try {
        // 既存のページコンテンツを構造化（実際の実装では既存ページからHTMLを取得）
        const mockPageContent = this.generateMockPageContent(context, entityRelationships);
        
        contentSplitResult = this.mdxSystem.structurizeExistingPage(
          mockPageContent,
          context.pageSlug,
          context.pageTitle,
          context.keywords
        );

        mdxSections = contentSplitResult.sections;
        expandedWordCount = contentSplitResult.totalWordCount;
        topicalCoverageComplete = expandedWordCount >= 10000; // 1万字級達成判定

        console.log(`📊 MDXセクション分割完了: ${mdxSections.length}セクション, ${expandedWordCount}文字`);
      } catch (mdxError) {
        console.error('MDXセクション分割エラー:', mdxError);
        // エラーがあっても他の機能は継続
      }

      // Phase 4: Trust Layer & AI検索検知処理
      let authorProfile: AuthorProfile | undefined;
      let trustSignals: TrustSignals | undefined;
      let authorSchema: any | undefined;
      let organizationTrustSchema: any | undefined;
      let aiSearchDetectionResult: any | undefined;

      try {
        // Trust Signalsが有効な場合
        if (context.enableTrustSignals !== false) {
          authorProfile = authorTrustSystem.getAuthorProfile();
          trustSignals = authorTrustSystem.getTrustSignals();
          
          // 著者プロフィール用構造化データ生成
          authorSchema = authorTrustSystem.generateAuthorSchema();
          organizationTrustSchema = authorTrustSystem.generateOrganizationTrustSchema();
          
          // ページ別著者情報をカスタマイズ
          const contextualAuthorInfo = authorTrustSystem.getAuthorInfoForPage(
            context.pageSlug, 
            context.category
          );
          
          // 既存の構造化データに著者情報を統合
          if (structuredData && Array.isArray(structuredData)) {
            structuredData.push(authorSchema);
            structuredData.push(organizationTrustSchema);
          } else if (structuredData && typeof structuredData === 'object') {
            structuredData.author = authorSchema;
            structuredData.organization = organizationTrustSchema;
          }
          
          console.log(`👤 Trust Signals適用完了: ${contextualAuthorInfo.relevantExpertise.join(', ')}`);
        }

        // AI検索検知が有効な場合
        if (context.enableAISearchDetection !== false && context.requestHeaders) {
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
        }

      } catch (phase4Error) {
        console.error('Phase 4処理エラー:', phase4Error);
        // エラーがあっても他の機能は継続
      }

      return {
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

    } catch (error) {
      console.error('統合データ生成エラー:', error);
      throw error;
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
        .select('*')
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
  className = "sticky top-4 p-4 bg-white border rounded-lg"
}: { 
  toc: TOCItem[];
  title?: string;  
  className?: string;
}) {
  if (toc.length === 0) return '';

  return `
    <div class="${className}">
      <h3 class="font-semibold mb-3">${title}</h3>
      <nav>
        <ul class="space-y-2">
          ${toc.map(item => `
            <li>
              <a href="${item.anchor}" class="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                ${item.title}
              </a>
            </li>
          `).join('')}
        </ul>
      </nav>
    </div>
  `;
} 