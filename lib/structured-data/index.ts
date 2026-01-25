// Mike King理論準拠: 統合構造化データシステム
// Relevance Engineering (RE) 統合エントリーポイント

// フェーズ1: RE基盤システム
export { 
  ORGANIZATION_ENTITY, 
  SERVICE_ENTITIES, 
  ENTITY_RELATIONSHIP_MAP,
  getEntityRelationships,
  getRelatedServices,
  type EntityRelationship,
  type ServiceEntity
} from './entity-relationships';

export {
  validateJsonLd,
  validateAllPages,
  generateFixRecommendations,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ValidationSuggestion
} from './validation-system';

// フェーズ2: LLMO完全対応システム
export {
  AutoTOCSystem,
  autoTOC,
  TOCHelpers,
  generateTOCComponent,
  type TOCItem,
  type FragmentData,
  type TOCConfiguration
} from './auto-toc-system';

export {
  HowToFAQSchemaSystem,
  howToFAQSchema,
  HowToFAQHelpers,
  type HowToSchema,
  type FAQSchema,
  type HowToStep,
  type FAQItem,
  type ProcessContent,
  type QuestionAnswerPair
} from './howto-faq-schema';

export {
  SemanticLinksSystem,
  semanticLinks,
  SemanticLinksHelpers,
  generateSemanticLinksComponent,
  PAGE_RELATIONSHIP_MAP,
  type SemanticLink,
  type LinkContext,
  type SemanticLinkConfig
} from './semantic-links';

// フェーズ3: GEO最適化拡張システム
export {
  HasPartSchemaSystem,
  type HasPartSchema,
  type HasPartConfiguration
} from './haspart-schema-system';

import { ORGANIZATION_ENTITY, SERVICE_ENTITIES, AI_SITE_FAQ_ENTITIES, type ServiceEntity } from './entity-relationships';
import { validateJsonLd, type ValidationResult } from './validation-system';
import { HasPartSchemaSystem, type HasPartSchema } from './haspart-schema-system';
import { type TOCItem } from './auto-toc-system';
import { HARADA_KENJI_PROFILE, type AuthorProfile } from './author-trust-system';

/**
 * 統合構造化データ生成システム
 * Mike King理論に基づく包括的な構造化データ生成
 */
export class UnifiedStructuredDataSystem {
  private baseUrl: string;
  private hasPartSystem: HasPartSchemaSystem;

  constructor(baseUrl: string = 'https://nands.tech') {
    this.baseUrl = baseUrl;
    this.hasPartSystem = new HasPartSchemaSystem({ baseUrl });
  }

  /**
   * 組織の包括的構造化データ生成
   */
  generateOrganizationSchema(): any {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": ORGANIZATION_ENTITY['@id'],
      "name": ORGANIZATION_ENTITY.name,
      "url": this.baseUrl,
      "description": "Mike King理論準拠のレリバンスエンジニアリング実装企業。AI検索最適化、生成AI研修、AIシステム開発を関西地方を中心に全国展開。",
      "foundingDate": "2008",
      "legalName": "株式会社エヌアンドエス",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "JP",
        "addressRegion": "滋賀県",
        "addressLocality": "大津市",
        "streetAddress": "皇子が丘2丁目10番25-3004号",
        "postalCode": "520-0025"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "0120-407-638",
        "contactType": "customer service",
        "availableLanguage": ["Japanese"],
        "areaServed": ["JP", "関西地方", "滋賀県", "大津市"]
      },
      "founder": {
        "@type": "Person",
        "name": "原田賢治",
        "jobTitle": "代表取締役"
      },
      "knowsAbout": ORGANIZATION_ENTITY.knowsAbout,
      "sameAs": ORGANIZATION_ENTITY.sameAs,
      "hasOfferCatalog": this.generateOfferCatalog()
    };
  }

  /**
   * サービスカタログ生成
   */
  private generateOfferCatalog(): any {
    return {
      "@type": "OfferCatalog",
      "name": "AI技術・人材支援サービス",
      "itemListElement": SERVICE_ENTITIES.map((service, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Service",
          "@id": service['@id'],
          "name": service.name,
          "serviceType": service.serviceType,
          "provider": service.provider,
          "knowsAbout": service.knowsAbout,
          "mentions": service.mentions
        }
      }))
    };
  }

  /**
   * サービス固有の構造化データ生成
   */
  generateServiceSchema(serviceType: string, additionalData?: any): any {
    const service = SERVICE_ENTITIES.find(s => s.serviceType === serviceType);
    if (!service) {
      throw new Error(`Service type ${serviceType} not found`);
    }

    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": service['@id'],
      "name": service.name,
      "serviceType": service.serviceType,
      "provider": {
        "@id": ORGANIZATION_ENTITY['@id']
      },
      "knowsAbout": service.knowsAbout,
      "mentions": service.mentions,
      "relatedTo": service.relatedTo
    };

    // 追加データのマージ
    return { ...baseSchema, ...additionalData };
  }

  /**
   * hasPart統合版のWebページ構造化データ生成
   */
  generateWebPageSchemaWithHasPart(pageData: {
    path: string;
    title: string;
    description: string;
    serviceType?: string;
    breadcrumbs?: Array<{name: string, url: string}>;
    lastModified?: string;
    toc?: TOCItem[];
    fragmentIds?: string[];
  }): any {
    const pageUrl = `${this.baseUrl}${pageData.path}`;
    
    const baseSchema: any = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      "name": pageData.title,
      "url": pageUrl,
      "description": pageData.description,
      "inLanguage": "ja-JP",
      "isPartOf": {
        "@type": "WebSite",
        "@id": `${this.baseUrl}/#website`
      },
      "about": {
        "@id": ORGANIZATION_ENTITY['@id']
      }
    };

    // サービス関連の場合は追加情報
    if (pageData.serviceType) {
      const service = SERVICE_ENTITIES.find(s => s.serviceType === pageData.serviceType);
      if (service) {
        baseSchema.about = {
          "@id": service['@id']
        };
        baseSchema['mentions'] = service.knowsAbout;
        baseSchema['relatedTo'] = service.relatedTo;
      }
    }

    // hasPartスキーマの統合
    if (pageData.toc && pageData.toc.length > 0) {
      const { allParts } = this.hasPartSystem.generateHasPartSchema(
        pageData.toc,
        pageUrl,
        pageData.title
      );
      
      baseSchema.hasPart = allParts.map(part => ({
        "@type": part['@type'],
        "@id": part['@id'],
        "name": part.name,
        "url": part.url
      }));
    } else if (pageData.fragmentIds && pageData.fragmentIds.length > 0) {
      const { fragmentSchemas } = this.hasPartSystem.generateFragmentBasedSchema(
        pageData.fragmentIds,
        pageUrl,
        pageData.title
      );
      
      baseSchema.hasPart = fragmentSchemas.map(fragment => ({
        "@type": fragment['@type'],
        "@id": fragment['@id'],
        "name": fragment.name,
        "url": fragment.url
      }));
    }

    // AI-site専用: FAQ Fragment IDエンティティ統合（Schema.org準拠）
    if (pageData.path === '/ai-site' && AI_SITE_FAQ_ENTITIES.length > 0) {
      // 既存のhasPartがあれば統合、なければ新規作成
      const existingHasParts = baseSchema.hasPart || [];
      
      // 正しいFAQ構造化データ: Question+Answer形式
      const faqQuestions = AI_SITE_FAQ_ENTITIES.map((faq, index) => ({
        "@type": "Question",
        "@id": faq['@id'],
        "name": faq.name.replace(' - FAQ', ''), // FAQ接尾辞を除去
        "url": faq['@id'],
        "text": faq.name.replace(' - FAQ', ''),
        "answerCount": 1,
        "acceptedAnswer": {
          "@type": "Answer",
          "@id": `${faq['@id']}-answer`,
          "text": `${faq.name.replace(' - FAQ', '')}に関する詳細な回答です。${faq.knowsAbout?.join('、')}について説明します。`,
          "url": faq['@id'],
          "about": faq.knowsAbout,
          "mentions": faq.mentions
        },
        "mainEntity": {
          "@type": "Thing",
          "name": faq.knowsAbout?.[0] || "AIサイト関連質問",
          "description": faq.mentions?.join('、') || "AI関連の質問"
        }
      }));

      // WebPageElementとしてhasPartに追加（Fragment ID対応）
      const faqWebElements = faqQuestions.map(question => ({
        "@type": "WebPageElement",
        "@id": question["@id"],
        "name": question.name,
        "url": question.url
      }));
      
      baseSchema.hasPart = [...existingHasParts, ...faqWebElements];
      
      // Note: FAQPageは2025年よりGoogle検索で政府・医療機関のみに制限
      // ItemList + Question形式に変更
      baseSchema.mainEntity = {
        "@type": "ItemList",
        "@id": `${pageUrl}#faq-collection`,
        "name": "AIサイト よくある質問集",
        "description": "AIサイト、レリバンスエンジニアリング、AI引用最適化に関するよくある質問",
        "url": `${pageUrl}#faq-title`,
        "itemListElement": faqQuestions.map((q: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": q
        }))
      };

      // レリバンスエンジニアリング専門家・原田賢治の権威性構造化データ
      baseSchema.author = {
        "@type": "Person",
        "@id": HARADA_KENJI_PROFILE['@id'],
        "name": HARADA_KENJI_PROFILE.name,
        "jobTitle": HARADA_KENJI_PROFILE.jobTitle,
        "description": HARADA_KENJI_PROFILE.description,
        "expertise": HARADA_KENJI_PROFILE.expertise,
        "worksFor": HARADA_KENJI_PROFILE.worksFor,
        "knowsAbout": [
          "レリバンスエンジニアリング",
          "AI検索最適化", 
          "Mike King理論",
          "Fragment ID実装",
          "Complete URI生成",
          "Triple RAGシステム",
          "ベクトル検索システム",
          "AI引用最適化",
          "構造化データ設計",
          "hasPartスキーマ実装",
          "WebPageElement最適化",
          "AIサイト構築",
          "ベクトルRAG検索",
          "エンティティマップ設計",
          "セマンティック検索",
          "AI検索エンジン対応"
        ],
        "hasCredential": HARADA_KENJI_PROFILE.credentials.map(cred => ({
          "@type": "EducationalOccupationalCredential",
          "name": cred.title,
          "credentialCategory": cred.type,
          "recognizedBy": {
            "@type": "Organization",
            "name": cred.issuer
          },
          "dateCreated": cred.year.toString()
        }))
      };

      // サービス提供者として専門性を明示
      baseSchema.provider = {
        "@type": "Person",
        "@id": HARADA_KENJI_PROFILE['@id'],
        "name": HARADA_KENJI_PROFILE.name,
        "expertise": [
          "レリバンスエンジニアリング実装",
          "AI引用最適化システム構築",
          "Mike King理論の日本市場適用"
        ]
      };
    }

    return baseSchema;
  }

  /**
   * ベクトルブログ専用: 動的FAQ Fragment IDエンティティ統合
   * Mike King理論準拠: AI引用最適化
   */
  generateBlogPageSchemaWithDynamicFAQs(pageData: {
    path: string;
    title: string;
    description: string;
    slug: string;
    postId: number;
    content: string;
    lastModified?: string;
    faqItems?: Array<{ question: string; answer: string; index: number }>;
    toc?: TOCItem[];
  }): any {
    const pageUrl = `${this.baseUrl}${pageData.path}`;
    
    // 基本のWebPageスキーマ
    const baseSchema: any = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": pageUrl,
      "url": pageUrl,
      "name": pageData.title,
      "description": pageData.description,
      "inLanguage": "ja-JP",
      "isPartOf": {
        "@type": "WebSite",
        "@id": `${this.baseUrl}/#website`
      },
      "publisher": {
        "@type": "Organization",
        "@id": `${this.baseUrl}/#organization`
      },
      "dateModified": pageData.lastModified || new Date().toISOString(),
      // 🎯 H1メインタイトルのFragment ID統合
      "hasPart": [
        {
          "@type": "WebPageElement",
          "@id": `${pageUrl}#main-title`,
          "name": pageData.title,
          "url": `${pageUrl}#main-title`,
          "about": pageData.title
        }
      ]
    };

    // Fragment IDベースのhasPartスキーマ統合
    if (pageData.toc && pageData.toc.length > 0) {
      const hasPartElements = pageData.toc.map(tocItem => ({
        "@type": "WebPageElement",
        "@id": `${pageUrl}#${tocItem.id}`,
        "name": tocItem.title,
        "url": `${pageUrl}#${tocItem.id}`
      }));
      
      baseSchema.hasPart = hasPartElements;
    }

    // 動的FAQ Fragment IDエンティティ統合
    if (pageData.faqItems && pageData.faqItems.length > 0) {
      // 動的エンティティを生成
      const {
        generateBlogFAQEntities,
        addDynamicBlogEntities
      } = require('./entity-relationships');
      
      const dynamicFAQEntities = generateBlogFAQEntities(
        {
          id: pageData.postId,
          title: pageData.title,
          slug: pageData.slug,
          content: pageData.content
        },
        pageData.faqItems
      );

      // メモリ内キャッシュに追加
      addDynamicBlogEntities(dynamicFAQEntities);

      // FAQ用構造化データ: Question+Answer形式
      const faqQuestions = pageData.faqItems.map((faq, index) => ({
        "@type": "Question",
        "@id": `${pageUrl}#faq-${index + 1}`,
        "name": faq.question,
        "url": `${pageUrl}#faq-${index + 1}`,
        "text": faq.question,
        "answerCount": 1,
        "acceptedAnswer": {
          "@type": "Answer",
          "@id": `${pageUrl}#faq-${index + 1}-answer`,
          "text": faq.answer,
          "url": `${pageUrl}#faq-${index + 1}`,
          "author": {
            "@type": "Person",
            "@id": `${this.baseUrl}/author/harada-kenji`,
            "name": "原田賢治"
          }
        },
        "mainEntity": {
          "@type": "Thing",
          "name": `${pageData.title}関連質問`,
          "description": "ベクトルブログ記事のFAQ"
        }
      }));

      // WebPageElementとしてhasPartに追加
      const faqWebElements = faqQuestions.map(question => ({
        "@type": "WebPageElement", 
        "@id": question["@id"],
        "name": question.name,
        "url": question.url
      }));
      
      const existingHasParts = baseSchema.hasPart || [];
      baseSchema.hasPart = [...existingHasParts, ...faqWebElements];
      
      // Note: FAQPageは2025年よりGoogle検索で政府・医療機関のみに制限
      // ItemList + Question形式に変更
      baseSchema.mainEntity = {
        "@type": "ItemList",
        "@id": `${pageUrl}#faq-collection`,
        "name": `${pageData.title} - よくある質問`,
        "description": `${pageData.title}に関するよくある質問と回答`,
        "url": `${pageUrl}#faq-section`,
        "itemListElement": faqQuestions.map((q: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": q
        }))
      };
    }

    return baseSchema;
  }

  /**
   * GEO最適化版のhasPartスキーマ生成
   */
  generateGEOOptimizedHasPart(
    toc: TOCItem[],
    pageUrl: string,
    pageTitle: string,
    targetQueries: string[]
  ): {
    geoSchema: HasPartSchema;
    jsonLd: any;
  } {
    return this.hasPartSystem.generateGEOOptimizedSchema(
      toc,
      pageUrl,
      pageTitle,
      targetQueries
    );
  }

  /**
   * Topical Coverage最適化hasPartスキーマ
   */
  generateTopicalCoverageHasPart(
    toc: TOCItem[],
    targetKeywords: string[],
    pageUrl: string
  ): HasPartSchema[] {
    return this.hasPartSystem.optimizeForTopicalCoverage(
      toc,
      targetKeywords,
      pageUrl
    );
  }

  /**
   * Webページの構造化データ生成
   */
     generateWebPageSchema(pageData: {
     path: string;
     title: string;
     description: string;
     serviceType?: string;
     breadcrumbs?: Array<{name: string, url: string}>;
     lastModified?: string;
   }): any {
     const baseSchema: any = {
       "@context": "https://schema.org",
       "@type": "WebPage",
       "@id": `${this.baseUrl}${pageData.path}#webpage`,
       "name": pageData.title,
       "url": `${this.baseUrl}${pageData.path}`,
       "description": pageData.description,
       "inLanguage": "ja-JP",
       "isPartOf": {
         "@type": "WebSite",
         "@id": `${this.baseUrl}/#website`
       },
       "about": {
         "@id": ORGANIZATION_ENTITY['@id']
       }
     };

    // サービス関連の場合は追加情報
    if (pageData.serviceType) {
      const service = SERVICE_ENTITIES.find(s => s.serviceType === pageData.serviceType);
      if (service) {
        baseSchema.about = {
          "@id": service['@id']
        };
        baseSchema['mentions'] = service.knowsAbout;
        baseSchema['relatedTo'] = service.relatedTo;
      }
    }

    // パンくずリスト
    if (pageData.breadcrumbs) {
      baseSchema['breadcrumb'] = {
        "@type": "BreadcrumbList",
        "itemListElement": pageData.breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        }))
      };
    }

    // 最終更新日
    if (pageData.lastModified) {
      baseSchema['dateModified'] = pageData.lastModified;
    }

    return baseSchema;
  }

  /**
   * 検証付きスキーマ生成
   */
  async generateValidatedSchema(schemaData: any): Promise<{
    schema: any;
    validation: ValidationResult;
  }> {
    const validation = await validateJsonLd(schemaData);
    
    // 軽微なエラーの自動修正
    let correctedSchema = { ...schemaData };
    
    validation.errors.forEach(error => {
      if (error.type === 'REQUIRED_FIELD_MISSING' && error.field === '@context') {
        correctedSchema['@context'] = 'https://schema.org';
      }
    });

    return {
      schema: correctedSchema,
      validation
    };
  }

  /**
   * セマンティックリンク生成
   * ページ間の意味的関係性に基づく内部リンク生成
   */
  generateSemanticLinks(currentPath: string, serviceType?: string): Array<{
    title: string;
    url: string;
    relevanceScore: number;
    relationship: string;
  }> {
    const links: Array<{title: string, url: string, relevanceScore: number, relationship: string}> = [];

    if (serviceType) {
      const currentService = SERVICE_ENTITIES.find(s => s.serviceType === serviceType);
      if (currentService) {
        // 関連サービスへのリンク
        currentService.relatedTo.forEach(relatedId => {
          const relatedService = SERVICE_ENTITIES.find(s => s['@id'] === relatedId);
          if (relatedService) {
            const url = relatedService['@id'].replace('#service', '').replace(this.baseUrl, '');
            links.push({
              title: relatedService.name,
              url,
              relevanceScore: 0.9,
              relationship: 'directlyRelated'
            });
          }
        });

        // 技術的類似性に基づくリンク
        SERVICE_ENTITIES.forEach(service => {
          if (service.serviceType !== serviceType) {
            const commonKeywords = service.knowsAbout.filter(keyword => 
              currentService.knowsAbout.includes(keyword)
            );
            
            if (commonKeywords.length > 2) {
              const url = service['@id'].replace('#service', '').replace(this.baseUrl, '');
              links.push({
                title: service.name,
                url,
                relevanceScore: commonKeywords.length / Math.max(service.knowsAbout.length, currentService.knowsAbout.length),
                relationship: 'technicallyRelated'
              });
            }
          }
        });
      }
    }

    return links.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

// デフォルトインスタンス
export const unifiedStructuredData = new UnifiedStructuredDataSystem();

/**
 * 便利関数群
 */
export const StructuredDataHelpers = {
  /**
   * 組織スキーマの簡易取得
   */
  getOrganizationSchema: () => unifiedStructuredData.generateOrganizationSchema(),

  /**
   * サービススキーマの簡易取得
   */
  getServiceSchema: (serviceType: string, additionalData?: any) => 
    unifiedStructuredData.generateServiceSchema(serviceType, additionalData),

  /**
   * Webページスキーマの簡易取得
   */
  getWebPageSchema: (pageData: Parameters<UnifiedStructuredDataSystem['generateWebPageSchema']>[0]) =>
    unifiedStructuredData.generateWebPageSchema(pageData),

  /**
   * セマンティックリンクの簡易取得
   */
  getSemanticLinks: (currentPath: string, serviceType?: string) =>
    unifiedStructuredData.generateSemanticLinks(currentPath, serviceType)
}; 