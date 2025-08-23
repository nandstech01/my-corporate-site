// Phase 3: GEO最適化拡張 - hasPartスキーマ自動出力システム
// Schema.org公式仕様準拠: hasPart/isPartOf関係性の自動生成

import { TOCItem } from './auto-toc-system';

export interface HasPartSchema {
  '@type': 'CreativeWork';
  '@id': string;
  name: string;
  url: string;
  position?: number;
  isPartOf?: {
    '@id': string;
  };
  hasPart?: HasPartSchema[];
}

export interface HasPartConfiguration {
  baseUrl: string;
  includePosition: boolean;
  generateHierarchy: boolean;
  maxDepth: number;
  includeFragmentAnchors: boolean;
}

/**
 * Mike King理論準拠: hasPartスキーマ自動生成システム
 */
export class HasPartSchemaSystem {
  private config: HasPartConfiguration;

  constructor(config: Partial<HasPartConfiguration> = {}) {
    this.config = {
      baseUrl: 'https://nands.tech',
      includePosition: true,
      generateHierarchy: true,
      maxDepth: 4,
      includeFragmentAnchors: true,
      ...config
    };
  }

  /**
   * TOCデータからhasPartスキーマを生成
   */
  generateHasPartSchema(
    toc: TOCItem[],
    parentUrl: string,
    parentTitle: string
  ): {
    mainSchema: HasPartSchema;
    allParts: HasPartSchema[];
    jsonLd: any;
  } {
    const allParts: HasPartSchema[] = [];

    // メインコンテンツのスキーマ
    const mainSchema: HasPartSchema = {
      '@type': 'CreativeWork',
      '@id': `${parentUrl}#main-content`,
      name: parentTitle,
      url: parentUrl,
      hasPart: this.buildHasPartHierarchy(toc, parentUrl, allParts, 1)
    };

    // JSON-LD形式での出力
    const jsonLd = this.generateJsonLd(mainSchema, allParts);

    return {
      mainSchema,
      allParts,
      jsonLd
    };
  }

  /**
   * Fragment IDベースのhasPartスキーマ生成
   */
  generateFragmentBasedSchema(
    fragmentIds: string[],
    pageUrl: string,
    pageTitle: string,
    tocItems?: TOCItem[]
  ): {
    fragmentSchemas: HasPartSchema[];
    jsonLd: any;
  } {
    const fragmentSchemas: HasPartSchema[] = [];

    fragmentIds.forEach((fragmentId, index) => {
      const tocItem = tocItems?.find(item => item.id === fragmentId);
      const fragmentUrl = `${pageUrl}#${fragmentId}`;
      
      // Fragment IDの特別処理（既存のFAQ処理を維持）
      let fragmentName = tocItem?.title || `セクション ${index + 1}`;
      
      // 🆕 メインページサービスFragment IDの処理（NANDS=AI強化）
      if (fragmentId.startsWith('service-')) {
        const serviceNames: { [key: string]: string } = {
          'service-system-development': 'システム開発サービス',
          'service-aio-seo': 'AIO・SEO最適化サービス',
          'service-chatbot-development': 'チャットボット開発サービス',
          'service-vector-rag': 'ベクトルRAG検索サービス',
          'service-ai-side-business': 'AI副業サポートサービス',
          'service-hr-support': '人材ソリューションサービス',
          'service-ai-agents': 'AIエージェント開発サービス',
          'service-mcp-servers': 'MCPサーバー開発サービス',
          'service-sns-automation': 'SNS自動化サービス',
          'service-video-generation': 'AI動画生成サービス',
          'service-corporate-reskilling': '法人向けリスキリングサービス',
          'service-individual-reskilling': '個人向けリスキリングサービス'
        };
        fragmentName = serviceNames[fragmentId] || fragmentName;
      }
      
      // 🆕 AIサイト関連Fragment IDの処理（AI引用資産化）
      if (fragmentId.startsWith('ai-site-') || fragmentId === 'nands-ai-site') {
        const aiSiteNames: { [key: string]: string } = {
          'nands-ai-site': 'NANDSのAIサイト - AIに引用されるサイト',
          'ai-site-features': 'AI引用精度向上機能',
          'ai-site-technology': 'AI引用技術アーキテクチャ'
        };
        fragmentName = aiSiteNames[fragmentId] || fragmentName;
      }
      
      // 🆕 メインページFAQ Fragment IDの処理（AI引用FAQ最適化）
      if (fragmentId.startsWith('faq-main-')) {
        const faqMainNames: { [key: string]: string } = {
          'faq-main-reskilling': 'リスキリング研修FAQ',
          'faq-main-system-dev': 'システム開発FAQ', 
          'faq-main-pricing': '料金体系FAQ',
          'faq-main-remote': 'リモートサポートFAQ',
          'faq-main-aio': 'AIO対策FAQ',
          'faq-main-ai-site-definition': 'AIサイト定義FAQ',
          'faq-main-ai-site-features': 'NANDSのAIサイト特徴FAQ',
          'faq-main-ai-site-benefits': 'AIサイトメリットFAQ'
        };
        fragmentName = faqMainNames[fragmentId] || fragmentName;
      }

      // 🆕 /faqページFAQ Fragment IDの処理（全26項目 - レリバンスエンジニアリング強化）
      if (fragmentId.startsWith('faq-tech-') || fragmentId.startsWith('faq-pricing-') || 
          fragmentId.startsWith('faq-support-') || fragmentId.startsWith('faq-hr-') || 
          fragmentId.startsWith('faq-marketing-') || fragmentId.startsWith('faq-ai-site-')) {
        const faqPageNames: { [key: string]: string } = {
          // AI・テクノロジーサービス（4個）
          'faq-tech-1': 'AI技術FAQ - どのようなAI技術を使っていますか？',
          'faq-tech-2': 'システム連携FAQ - 既存システムとの連携は可能ですか？',
          'faq-tech-3': 'セキュリティ対策FAQ - セキュリティ対策はどうなっていますか？',
          'faq-tech-4': 'AIモデルカスタマイズFAQ - AIモデルのカスタマイズは可能ですか？',
          
          // 料金・契約（5個）
          'faq-pricing-1': '料金体系FAQ - 料金体系を教えてください',
          'faq-pricing-2': '契約期間FAQ - 最小契約期間はありますか？',
          'faq-pricing-3': '追加開発費用FAQ - 追加機能の開発費用はどうなりますか？',
          'faq-pricing-4': '支払い方法FAQ - 支払い方法について教えてください',
          'faq-pricing-5': 'PoC概念実証FAQ - PoC（概念実証）から始められますか？',
          
          // サポート・導入（4個）
          'faq-support-1': '導入期間FAQ - 導入までの期間はどのくらいですか？',
          'faq-support-2': 'オンサイト導入FAQ - オンサイトでの導入支援はありますか？',
          'faq-support-3': 'トレーニング研修FAQ - トレーニングや研修はありますか？',
          'faq-support-4': '24時間サポートFAQ - 24時間サポートは利用できますか？',
          
          // 人材・研修（5個）
          'faq-hr-1': 'AI人材育成FAQ - AI人材の育成支援はありますか？',
          'faq-hr-2': 'リスキリング研修FAQ - リスキリング研修の内容を教えてください',
          'faq-hr-3': '研修形式FAQ - 研修の形式はどのようなものですか？',
          'faq-hr-4': '研修効果測定FAQ - 研修効果の測定はどのように行いますか？',
          'faq-hr-5': '助成金活用FAQ - 助成金の活用サポートはありますか？',
          
          // マーケティング・AIO（4個）
          'faq-marketing-1': 'AIO対策FAQ - AIO対策とは何ですか？',
          'faq-marketing-2': 'AIO-SEO違いFAQ - 従来のSEOとの違いは何ですか？',
          'faq-marketing-3': 'AIO効果測定FAQ - 効果測定はどのように行いますか？',
          'faq-marketing-4': 'AIO効果期間FAQ - どのくらいの期間で効果が現れますか？',
          
          // AIサイト・ブランディング（5個）
          'faq-ai-site-1': 'AIサイト定義FAQ - AIサイトとは何ですか？',
          'faq-ai-site-2': 'AIサイト重要性FAQ - なぜAIサイト化が重要なのですか？',
          'faq-ai-site-3': 'Fragment ID実装FAQ - Fragment IDの実装はどのように行いますか？',
          'faq-ai-site-4': 'AIサイト化費用FAQ - AIサイト化の費用はどの程度ですか？',
          'faq-ai-site-5': 'AIサイト効果測定FAQ - AIサイト化の効果測定はどのように行いますか？'
        };
        fragmentName = faqPageNames[fragmentId] || fragmentName;
      }

      // FAQ Fragment IDの処理（既存機能を維持）
      if (fragmentId.startsWith('faq-') && pageUrl.includes('/ai-site')) {
        const faqNumber = fragmentId.replace('faq-', '');
        const faqTitles = [
          'AIサイトとは何ですか？',
          'AIサイトと通常のサイトの違いは？',
          'AIに引用されるサイトの重要性は？',
          'レリバンスエンジニアリングとは？',
          'Fragment IDとは何ですか？',
          'Triple RAGシステムとは？',
          '構造化データの役割は？',
          '自動ベクトルブログとは？',
          'Complete URIの仕組みは？',
          'ベクトル検索との違いは？',
          'AIに引用されるとどんなメリットがありますか？',
          'ROI（投資対効果）はどれくらい？',
          '導入効果の測定方法は？',
          '競合他社との差別化要因は？',
          '24時間365日無人営業とは？',
          '既存サイトへの実装は可能ですか？',
          '実装期間はどれくらいですか？',
          'IT補助金は活用できますか？',
          '運用保守は必要ですか？',
          'セキュリティ対策は？',
          'AI検索の普及はどれくらい進んでいますか？',
          'どの業界に効果的ですか？',
          'Google検索との関係は？',
          'ChatGPTやClaude以外のAIにも対応？',
          '国際的な展開は可能ですか？',
          'AIに引用されることのリスクはありますか？',
          '従来のSEOとの違いは？',
          '小規模企業でも効果ありますか？',
          '他社サービスとの違いは？',
          '成果が出ない場合はどうなりますか？'
        ];
        const idx = parseInt(faqNumber) - 1;
        if (idx >= 0 && idx < faqTitles.length) {
          fragmentName = faqTitles[idx];
        }
      }

      const fragmentSchema: HasPartSchema = {
        '@type': 'CreativeWork',
        '@id': fragmentUrl,
        name: fragmentName,
        url: fragmentUrl,
        position: this.config.includePosition ? index + 1 : undefined,
        isPartOf: {
          '@id': `${pageUrl}#main-content`
        }
      };

      fragmentSchemas.push(fragmentSchema);
    });

    // メインコンテンツにフラグメントを関連付け
    const mainContentSchema: HasPartSchema = {
      '@type': 'CreativeWork',
      '@id': `${pageUrl}#main-content`,
      name: pageTitle,
      url: pageUrl,
      hasPart: fragmentSchemas.map(fragment => ({
        '@type': 'CreativeWork',
        '@id': fragment['@id'],
        name: fragment.name,
        url: fragment.url
      }))
    };

    const jsonLd = {
      '@context': 'https://schema.org/',
      '@graph': [
        mainContentSchema,
        ...fragmentSchemas
      ]
    };

    return {
      fragmentSchemas,
      jsonLd
    };
  }

  /**
   * 階層構造のhasPart関係性を構築
   */
  private buildHasPartHierarchy(
    tocItems: TOCItem[],
    baseUrl: string,
    allParts: HasPartSchema[],
    currentDepth: number
  ): HasPartSchema[] {
    if (currentDepth > this.config.maxDepth) {
      return [];
    }

    return tocItems.map((item, index) => {
      const fragmentUrl = this.config.includeFragmentAnchors 
        ? `${baseUrl}${item.anchor}`
        : `${baseUrl}#section-${item.id}`;

      const hasPartSchema: HasPartSchema = {
        '@type': 'CreativeWork',
        '@id': fragmentUrl,
        name: item.title,
        url: fragmentUrl,
        position: this.config.includePosition ? index + 1 : undefined
      };

      // 子要素がある場合の再帰処理
      if (item.children && item.children.length > 0 && this.config.generateHierarchy) {
        hasPartSchema.hasPart = this.buildHasPartHierarchy(
          item.children,
          baseUrl,
          allParts,
          currentDepth + 1
        );
      }

      // 親要素への参照
      if (currentDepth > 1) {
        hasPartSchema.isPartOf = {
          '@id': `${baseUrl}#main-content`
        };
      }

      allParts.push(hasPartSchema);
      return hasPartSchema;
    });
  }

  /**
   * JSON-LD形式でのhasPartスキーマ生成
   */
  private generateJsonLd(mainSchema: HasPartSchema, allParts: HasPartSchema[]): any {
    return {
      '@context': 'https://schema.org/',
      '@graph': [
        mainSchema,
        ...allParts
      ]
    };
  }

  /**
   * 既存の構造化データにhasPartを統合
   */
  integrateWithExistingSchema(
    existingSchema: any,
    hasPartData: HasPartSchema[]
  ): any {
    const updatedSchema = { ...existingSchema };

    // Service/Article等の既存タイプにhasPartを追加
    if (updatedSchema['@type'] && 
        ['Service', 'Article', 'WebPage', 'CreativeWork'].includes(updatedSchema['@type'])) {
      updatedSchema.hasPart = hasPartData.map(part => ({
        '@type': part['@type'],
        '@id': part['@id'],
        name: part.name,
        url: part.url
      }));
    }

    return updatedSchema;
  }

  /**
   * Topical Coverageのためのhaspart最適化
   */
  optimizeForTopicalCoverage(
    tocItems: TOCItem[],
    targetKeywords: string[],
    pageUrl: string
  ): HasPartSchema[] {
    const optimizedParts: HasPartSchema[] = [];

    tocItems.forEach((item, index) => {
      // キーワード関連性スコアを計算
      const relevanceScore = this.calculateKeywordRelevance(item.title, targetKeywords);
      
      if (relevanceScore > 0.3) { // 閾値以上のセクションのみ含める
        const optimizedPart: HasPartSchema = {
          '@type': 'CreativeWork',
          '@id': `${pageUrl}${item.anchor}`,
          name: this.enhanceTitleForTopicalCoverage(item.title, targetKeywords),
          url: `${pageUrl}${item.anchor}`,
          position: index + 1,
          isPartOf: {
            '@id': `${pageUrl}#main-content`
          }
        };

        optimizedParts.push(optimizedPart);
      }
    });

    return optimizedParts;
  }

  /**
   * キーワード関連性スコア計算
   */
  private calculateKeywordRelevance(title: string, keywords: string[]): number {
    const titleLower = title.toLowerCase();
    let matches = 0;

    keywords.forEach(keyword => {
      if (titleLower.includes(keyword.toLowerCase())) {
        matches++;
      }
    });

    return matches / keywords.length;
  }

  /**
   * Topical Coverage用のタイトル強化
   */
  private enhanceTitleForTopicalCoverage(title: string, keywords: string[]): string {
    const relevantKeywords = keywords.filter(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );

    if (relevantKeywords.length === 0) {
      return title;
    }

    // 最も関連性の高いキーワードを優先表示
    return `${title} - ${relevantKeywords[0]}`;
  }

  /**
   * GEO (Generative Engine Optimization) 対応のhasPartスキーマ
   */
  generateGEOOptimizedSchema(
    tocItems: TOCItem[],
    pageUrl: string,
    pageTitle: string,
    targetQueries: string[]
  ): {
    geoSchema: HasPartSchema;
    jsonLd: any;
  } {
    const geoOptimizedParts = tocItems.map((item, index) => {
      // 質問形式のアンカーを生成
      const questionBasedAnchor = this.generateQuestionBasedAnchor(item.title, targetQueries);
      
      return {
        '@type': 'CreativeWork' as const,
        '@id': `${pageUrl}#${questionBasedAnchor}`,
        name: this.optimizeTitleForGEO(item.title, targetQueries),
        url: `${pageUrl}#${questionBasedAnchor}`,
        position: index + 1,
        isPartOf: {
          '@id': `${pageUrl}#main-content`
        }
      };
    });

    const geoSchema: HasPartSchema = {
      '@type': 'CreativeWork',
      '@id': `${pageUrl}#main-content`,
      name: pageTitle,
      url: pageUrl,
      hasPart: geoOptimizedParts
    };

    const jsonLd = {
      '@context': 'https://schema.org/',
      '@graph': [
        geoSchema,
        ...geoOptimizedParts
      ]
    };

    return {
      geoSchema,
      jsonLd
    };
  }

  /**
   * 質問ベースのアンカー生成
   */
  private generateQuestionBasedAnchor(title: string, queries: string[]): string {
    const baseAnchor = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // クエリに関連する接頭辞を追加
    const relevantQuery = queries.find(query => 
      title.toLowerCase().includes(query.toLowerCase())
    );

    if (relevantQuery) {
      const prefix = relevantQuery.includes('what') ? 'what-is' :
                    relevantQuery.includes('how') ? 'how-to' :
                    relevantQuery.includes('why') ? 'why' :
                    'about';
      return `${prefix}-${baseAnchor}`;
    }

    return baseAnchor;
  }

  /**
   * GEO向けのタイトル最適化
   */
  private optimizeTitleForGEO(title: string, queries: string[]): string {
    // より具体的で回答に適したタイトルに変換
    const questionWords = ['とは', 'について', 'の方法', '方法', '理由'];
    
    for (const word of questionWords) {
      if (!title.includes(word)) {
        // 自然な質問形式に変換
        if (queries.some(q => q.includes('とは'))) {
          return `${title}とは`;
        } else if (queries.some(q => q.includes('方法'))) {
          return `${title}の方法`;
        }
      }
    }

    return title;
  }
}

export default HasPartSchemaSystem; 