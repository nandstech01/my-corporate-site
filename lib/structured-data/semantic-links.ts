// Mike King理論準拠: セマンティック内部リンクシステム
// Phase 2: LLMO完全対応 - AI検索関連性最適化

export interface SemanticLink {
  url: string;
  title: string;
  description: string;
  relevanceScore: number;
  linkType: 'service' | 'related' | 'process' | 'case-study' | 'faq';
  keywords: string[];
  anchor?: string;
}

export interface LinkContext {
  currentPage: string;
  currentTitle: string;
  keywords: string[];
  category: string;
  priority: number;
}

export interface SemanticLinkConfig {
  minRelevanceScore: number;
  maxLinksPerSection: number;
  enableAIOptimization: boolean;
  linkTypes: string[];
}

/**
 * ページマップと関連性データ
 */
export const PAGE_RELATIONSHIP_MAP = {
  // サービスページ
  'system-development': {
    title: 'AIシステム開発・RAGシステム構築',
    keywords: ['システム開発', 'RAG', 'AI', 'フルスタック', 'API', 'データベース'],
    category: 'service',
    related: [
      'ai-agents', 'chatbot-development', 'vector-rag', 'hr-solutions'
    ],
    processes: ['consultation', 'development-flow', 'testing'],
    caseStudies: ['rag-system-case', 'hr-ai-case'],
    faqs: ['development-period', 'development-cost', 'legal-compliance']
  },
  'ai-agents': {
    title: 'AIエージェント開発・カスタマイズ',
    keywords: ['AIエージェント', 'カスタマイズ', '自動化', 'AI開発'],
    category: 'service',
    related: ['system-development', 'chatbot-development', 'mcp-servers'],
    processes: ['agent-consultation', 'customization-flow'],
    caseStudies: ['agent-automation-case'],
    faqs: ['agent-capabilities', 'customization-options']
  },
  'aio-seo': {
    title: 'AIO対策・レリバンスエンジニアリング',
    keywords: ['AIO対策', 'レリバンスエンジニアリング', 'Mike King', 'AI検索', 'SEO'],
    category: 'service',
    related: ['system-development', 'vector-rag'],
    processes: ['aio-analysis', 'relevance-optimization'],
    caseStudies: ['aio-success-case'],
    faqs: ['mike-king-theory', 'aio-effectiveness']
  },
  'chatbot-development': {
    title: 'チャットボット開発・導入支援',
    keywords: ['チャットボット', 'GPT-4', '自動応答', '多言語対応'],
    category: 'service',
    related: ['ai-agents', 'system-development', 'hr-solutions'],
    processes: ['chatbot-planning', 'integration-flow'],
    caseStudies: ['chatbot-cs-case'],
    faqs: ['chatbot-accuracy', 'multilingual-support']
  },
  'vector-rag': {
    title: 'ベクトルRAG・知識ベース構築',
    keywords: ['ベクトルRAG', '知識ベース', 'ベクトル検索', 'セマンティック検索'],
    category: 'service',
    related: ['system-development', 'aio-seo'],
    processes: ['knowledge-base-design', 'vector-optimization'],
    caseStudies: ['knowledge-base-case'],
    faqs: ['vector-accuracy', 'knowledge-maintenance']
  },
  'hr-solutions': {
    title: 'HR支援・人事DXソリューション',
    keywords: ['HR支援', '人事DX', '労務相談', '法令準拠'],
    category: 'service',
    related: ['system-development', 'chatbot-development'],
    processes: ['hr-consultation', 'compliance-setup'],
    caseStudies: ['hr-automation-case'],
    faqs: ['legal-compliance', 'hr-automation-benefits']
  },
  'mcp-servers': {
    title: 'MCPサーバー開発・運用',
    keywords: ['MCPサーバー', 'プロトコル', 'サーバー開発'],
    category: 'service',
    related: ['ai-agents', 'system-development'],
    processes: ['mcp-setup', 'server-optimization'],
    caseStudies: ['mcp-implementation-case'],
    faqs: ['mcp-benefits', 'server-maintenance']
  },
  'sns-automation': {
    title: 'SNS自動化・マーケティング支援',
    keywords: ['SNS自動化', 'マーケティング', 'ソーシャルメディア'],
    category: 'service',
    related: ['system-development', 'ai-agents'],
    processes: ['sns-strategy', 'automation-setup'],
    caseStudies: ['sns-growth-case'],
    faqs: ['automation-safety', 'content-quality']
  },
  'video-generation': {
    title: '動画生成・AI動画制作',
    keywords: ['動画生成', 'AI動画', '動画制作', '自動化'],
    category: 'service',
    related: ['ai-agents', 'sns-automation'],
    processes: ['video-planning', 'generation-workflow'],
    caseStudies: ['video-automation-case'],
    faqs: ['video-quality', 'generation-speed']
  }
};

/**
 * セマンティック内部リンク自動生成システム
 */
export class SemanticLinksSystem {
  private config: SemanticLinkConfig;

  constructor(config: Partial<SemanticLinkConfig> = {}) {
    this.config = {
      minRelevanceScore: 0.3,
      maxLinksPerSection: 5,
      enableAIOptimization: true,
      linkTypes: ['service', 'related', 'process', 'case-study', 'faq'],
      ...config
    };
  }

  /**
   * 現在のページコンテキストに基づいて関連リンクを生成
   */
  generateSemanticLinks(context: LinkContext): SemanticLink[] {
    const currentPageData = PAGE_RELATIONSHIP_MAP[context.currentPage as keyof typeof PAGE_RELATIONSHIP_MAP];
    
    if (!currentPageData) {
      return [];
    }

    const allLinks: SemanticLink[] = [];

    // サービス関連リンク
    if (this.config.linkTypes.includes('service')) {
      allLinks.push(...this.generateServiceLinks(currentPageData, context));
    }

    // プロセス関連リンク
    if (this.config.linkTypes.includes('process')) {
      allLinks.push(...this.generateProcessLinks(currentPageData, context));
    }

    // ケーススタディリンク
    if (this.config.linkTypes.includes('case-study')) {
      allLinks.push(...this.generateCaseStudyLinks(currentPageData, context));
    }

    // FAQ関連リンク
    if (this.config.linkTypes.includes('faq')) {
      allLinks.push(...this.generateFAQLinks(currentPageData, context));
    }

    // 関連性スコアでソートし、フィルタリング
    return allLinks
      .filter(link => link.relevanceScore >= this.config.minRelevanceScore)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, this.config.maxLinksPerSection);
  }

  /**
   * サービス関連リンクの生成
   */
  private generateServiceLinks(
    currentPageData: any,
    context: LinkContext
  ): SemanticLink[] {
    const links: SemanticLink[] = [];

    currentPageData.related?.forEach((relatedPageKey: string) => {
      const relatedPageData = PAGE_RELATIONSHIP_MAP[relatedPageKey as keyof typeof PAGE_RELATIONSHIP_MAP];
      
      if (relatedPageData) {
        const relevanceScore = this.calculateRelevanceScore(
          [...currentPageData.keywords],
          [...relatedPageData.keywords],
          context.keywords
        );

        links.push({
          url: `/${relatedPageKey}`,
          title: relatedPageData.title,
          description: this.generateLinkDescription(relatedPageData),
          relevanceScore,
          linkType: 'service',
          keywords: [...relatedPageData.keywords]
        });
      }
    });

    return links;
  }

  /**
   * プロセス関連リンクの生成
   */
  private generateProcessLinks(
    currentPageData: any,
    context: LinkContext
  ): SemanticLink[] {
    const links: SemanticLink[] = [];

    currentPageData.processes?.forEach((processKey: string) => {
      const processData = this.getProcessData(processKey);
      
      if (processData) {
        const relevanceScore = this.calculateProcessRelevance(
          processData.keywords,
          context.keywords
        );

        links.push({
          url: processData.url,
          title: processData.title,
          description: processData.description,
          relevanceScore,
          linkType: 'process',
          keywords: processData.keywords,
          anchor: processData.anchor
        });
      }
    });

    return links;
  }

  /**
   * ケーススタディリンクの生成
   */
  private generateCaseStudyLinks(
    currentPageData: any,
    context: LinkContext
  ): SemanticLink[] {
    const links: SemanticLink[] = [];

    currentPageData.caseStudies?.forEach((caseKey: string) => {
      const caseData = this.getCaseStudyData(caseKey);
      
      if (caseData) {
        const relevanceScore = this.calculateCaseStudyRelevance(
          caseData.keywords,
          context.keywords
        );

        links.push({
          url: caseData.url,
          title: caseData.title,
          description: caseData.description,
          relevanceScore,
          linkType: 'case-study',
          keywords: caseData.keywords
        });
      }
    });

    return links;
  }

  /**
   * FAQ関連リンクの生成
   */
  private generateFAQLinks(
    currentPageData: any,
    context: LinkContext
  ): SemanticLink[] {
    const links: SemanticLink[] = [];

    currentPageData.faqs?.forEach((faqKey: string) => {
      const faqData = this.getFAQData(faqKey);
      
      if (faqData) {
        const relevanceScore = this.calculateFAQRelevance(
          faqData.keywords,
          context.keywords
        );

        links.push({
          url: faqData.url,
          title: faqData.title,
          description: faqData.description,
          relevanceScore,
          linkType: 'faq',
          keywords: faqData.keywords,
          anchor: faqData.anchor
        });
      }
    });

    return links;
  }

  /**
   * 関連性スコアの計算（Mike King理論準拠）
   */
  private calculateRelevanceScore(
    sourceKeywords: string[],
    targetKeywords: string[],
    contextKeywords: string[]
  ): number {
    let score = 0;

    // キーワード重複度
    const sourceSet = new Set(sourceKeywords.map(k => k.toLowerCase()));
    const targetSet = new Set(targetKeywords.map(k => k.toLowerCase()));
    const contextSet = new Set(contextKeywords.map(k => k.toLowerCase()));

    // 直接重複
    const directOverlap = Array.from(sourceSet).filter(k => targetSet.has(k)).length;
    score += (directOverlap / Math.max(sourceSet.size, targetSet.size)) * 0.4;

    // コンテキスト関連性
    const contextOverlap = Array.from(contextSet).filter(k => targetSet.has(k)).length;
    score += (contextOverlap / Math.max(contextSet.size, targetSet.size)) * 0.3;

    // セマンティック関連性（Mike King理論）
    const semanticBonus = this.calculateSemanticBonus(sourceKeywords, targetKeywords);
    score += semanticBonus * 0.3;

    return Math.min(1.0, score);
  }

  /**
   * セマンティックボーナス計算
   */
  private calculateSemanticBonus(sourceKeywords: string[], targetKeywords: string[]): number {
    const semanticGroups = [
      ['AI', 'システム開発', 'RAG', 'チャットボット', 'エージェント'],
      ['AIO対策', 'レリバンスエンジニアリング', 'Mike King', 'SEO', 'AI検索'],
      ['HR支援', '人事DX', '労務相談', '法令準拠'],
      ['動画生成', 'SNS自動化', 'マーケティング']
    ];

    let bonus = 0;
    semanticGroups.forEach(group => {
      const sourceInGroup = sourceKeywords.filter(k => 
        group.some(g => k.toLowerCase().includes(g.toLowerCase()))
      ).length;
      const targetInGroup = targetKeywords.filter(k => 
        group.some(g => k.toLowerCase().includes(g.toLowerCase()))
      ).length;

      if (sourceInGroup > 0 && targetInGroup > 0) {
        bonus += 0.2;
      }
    });

    return Math.min(1.0, bonus);
  }

  /**
   * プロセス関連性計算
   */
  private calculateProcessRelevance(processKeywords: string[], contextKeywords: string[]): number {
    const overlap = processKeywords.filter(pk => 
      contextKeywords.some(ck => ck.toLowerCase().includes(pk.toLowerCase()))
    ).length;

    return Math.min(1.0, overlap / Math.max(1, processKeywords.length));
  }

  /**
   * ケーススタディ関連性計算
   */
  private calculateCaseStudyRelevance(caseKeywords: string[], contextKeywords: string[]): number {
    return this.calculateProcessRelevance(caseKeywords, contextKeywords);
  }

  /**
   * FAQ関連性計算
   */
  private calculateFAQRelevance(faqKeywords: string[], contextKeywords: string[]): number {
    return this.calculateProcessRelevance(faqKeywords, contextKeywords);
  }

  /**
   * リンク説明文の生成
   */
  private generateLinkDescription(pageData: any): string {
    const keywordList = pageData.keywords.slice(0, 3).join('・');
    return `${keywordList}に関する専門サービス`;
  }

  /**
   * プロセスデータの取得
   */
  private getProcessData(processKey: string): any {
    const processMap: {[key: string]: any} = {
      'consultation': {
        title: '無料相談・お見積もり',
        description: 'ご要件をお聞きし、最適なソリューションをご提案',
        keywords: ['相談', '見積もり', 'ヒアリング'],
        url: '#consultation-section',
        anchor: 'consultation-section'
      },
      'development-flow': {
        title: '開発フロー',
        description: '要件定義から運用開始までの開発プロセス',
        keywords: ['開発', 'フロー', 'プロセス'],
        url: '#development-flow-section',
        anchor: 'development-flow-section'
      }
    };

    return processMap[processKey];
  }

  /**
   * ケーススタディデータの取得
   */
  private getCaseStudyData(caseKey: string): any {
    const caseMap: {[key: string]: any} = {
      'rag-system-case': {
        title: 'RAGシステム導入事例',
        description: '13法令準拠RAGシステムの導入実績',
        keywords: ['RAG', '法令準拠', '事例'],
        url: '#case-studies-section'
      },
      'hr-ai-case': {
        title: 'HR支援AI導入事例',
        description: '人事業務効率化の成功事例',
        keywords: ['HR', 'AI', '効率化'],
        url: '#hr-case-studies'
      }
    };

    return caseMap[caseKey];
  }

  /**
   * FAQデータの取得
   */
  private getFAQData(faqKey: string): any {
    const faqMap: {[key: string]: any} = {
      'development-period': {
        title: '開発期間について',
        description: 'システム開発にかかる期間の詳細',
        keywords: ['期間', '開発', 'スケジュール'],
        url: '/faq#development-period',
        anchor: 'development-period'
      },
      'development-cost': {
        title: '開発費用について',
        description: 'システム開発費用の詳細',
        keywords: ['費用', 'コスト', '料金'],
        url: '/faq#development-cost',
        anchor: 'development-cost'
      },
      'mike-king-theory': {
        title: 'Mike King理論について',
        description: 'レリバンスエンジニアリングの詳細',
        keywords: ['Mike King', 'レリバンスエンジニアリング', 'AIO'],
        url: '/faq#mike-king-theory',
        anchor: 'mike-king-theory'
      }
    };

    return faqMap[faqKey];
  }
}

/**
 * React用セマンティックリンクコンポーネント生成
 */
export function generateSemanticLinksComponent(
  links: SemanticLink[],
  title: string = '関連サービス',
  className?: string
): string {
  if (links.length === 0) return '';

  const linksByType = links.reduce((acc, link) => {
    if (!acc[link.linkType]) acc[link.linkType] = [];
    acc[link.linkType].push(link);
    return acc;
  }, {} as {[key: string]: SemanticLink[]});

  const typeLabels: {[key: string]: string} = {
    'service': '関連サービス',
    'process': '関連プロセス',
    'case-study': '導入事例',
    'faq': 'よくある質問'
  };

  return `
    <section className="semantic-links ${className || 'bg-gray-50 py-12'}">
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">${title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${Object.entries(linksByType).map(([type, typeLinks]) => `
            <div className="link-type-section">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">${typeLabels[type] || type}</h4>
              <ul className="space-y-3">
                ${typeLinks.map(link => `
                  <li>
                    <a 
                      href="${link.url}${link.anchor ? '#' + link.anchor : ''}"
                      className="block p-4 bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 group"
                    >
                      <h5 className="font-bold text-gray-900 group-hover:text-blue-600 mb-2">
                        ${link.title}
                      </h5>
                      <p className="text-sm text-gray-600 mb-2">
                        ${link.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          ${link.keywords.slice(0, 3).join(' • ')}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          関連度: ${Math.round(link.relevanceScore * 100)}%
                        </span>
                      </div>
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/**
 * デフォルトインスタンス
 */
export const semanticLinks = new SemanticLinksSystem();

/**
 * 便利関数
 */
export const SemanticLinksHelpers = {
  /**
   * ページ用セマンティックリンク生成
   */
  generateForPage: (pageKey: string, keywords: string[] = []) => {
    const context: LinkContext = {
      currentPage: pageKey,
      currentTitle: PAGE_RELATIONSHIP_MAP[pageKey as keyof typeof PAGE_RELATIONSHIP_MAP]?.title || '',
      keywords,
      category: 'service',
      priority: 1
    };

    return semanticLinks.generateSemanticLinks(context);
  },

  /**
   * システム開発ページ用リンク
   */
  generateSystemDevelopmentLinks: () => 
    SemanticLinksHelpers.generateForPage('system-development', 
      ['システム開発', 'RAG', 'AI', 'レリバンスエンジニアリング']),

  /**
   * AIO SEOページ用リンク
   */
  generateAIOSEOLinks: () => 
    SemanticLinksHelpers.generateForPage('aio-seo', 
      ['AIO対策', 'Mike King', 'レリバンスエンジニアリング', 'AI検索'])
}; 