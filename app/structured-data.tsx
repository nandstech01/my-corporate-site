// Mike King理論準拠: レリバンスエンジニアリング実装版
// 
// 【Mike King理論準拠ポイント】
// ✅ 統一エンティティ関係性システム実装
// ✅ AI検索エンジン最適化（ChatGPT, Perplexity等）
// ✅ セマンティック検索対応
// ✅ エンティティ間関係性の明示
// ✅ knowsAbout拡充によるLLMO対応
// ✅ 自動検証システム統合
//
// 【検証方法】
// Google Rich Results Test: https://search.google.com/test/rich-results
// Schema Markup Validator: https://validator.schema.org/
// AI検索最適化検証: 新統合システム
//
import { StructuredDataHelpers } from '../lib/structured-data';
import { HasPartSchemaSystem } from '../lib/structured-data/haspart-schema-system';

export function getStructuredData() {
  const baseUrl = 'https://nands.tech';
  
  // Mike King理論準拠: 統一エンティティシステムから組織データ生成
  const organizationData = StructuredDataHelpers.getOrganizationSchema();

  // 🆕 hasPartスキーマシステム初期化（既存機能を維持）
  const hasPartSystem = new HasPartSchemaSystem({ baseUrl });

  // 🆕 新規追加Fragment IDリスト（NANDS=AI強化）
  const newFragmentIds = [
    // サービス12項目Fragment ID
    'service-system-development',
    'service-aio-seo', 
    'service-chatbot-development',
    'service-vector-rag',
    'service-ai-side-business',
    'service-hr-support',
    'service-ai-agents',
    'service-mcp-servers',
    'service-sns-automation',
    'service-video-generation',
    'service-corporate-reskilling',
    'service-individual-reskilling',
    // AIサイト関連Fragment ID
    'nands-ai-site',
    'ai-site-features', 
    'ai-site-technology',
    // 🆕 ProblemSection Fragment ID (4個)
    'problem-individual-ai-career',
    'problem-individual-relevance',
    'problem-corporate-vector-link',
    'problem-corporate-ai-architect',
    // 🆕 PhilosophySection Fragment ID (1個)
    'philosophy-kenji-harada',
    // 🆕 SolutionBentoGrid Fragment ID (4個)
    'solution-individual-step1',
    'solution-individual-step2',
    'solution-corporate-layer1',
    'solution-corporate-layer2',
    // 🆕 PricingSection Fragment ID (4個)
    'pricing-individual-main',
    'pricing-individual-bonus',
    'pricing-corporate-main',
    'pricing-corporate-support',
    // 🆕 CTASection Fragment ID (4個)
    'cta-individual-line',
    'cta-individual-consultation',
    'cta-corporate-technical',
    'cta-corporate-documents',
    // 🆕 ContactSection Fragment ID (1個)
    'contact-form',
    // 🆕 FAQSection Fragment ID (21個 - 新しいFAQ)
    'faq-main-1', 'faq-main-2', 'faq-main-3', 'faq-main-4', 'faq-main-5',
    'faq-main-6', 'faq-main-7', 'faq-main-8', 'faq-main-9', 'faq-main-10',
    'faq-main-11', 'faq-main-12', 'faq-main-13', 'faq-main-14', 'faq-main-15',
    'faq-main-16', 'faq-main-17', 'faq-main-18', 'faq-main-19', 'faq-main-20',
    'faq-main-21',
    // 🆕 /faqページFAQ Fragment ID（全26項目 - レリバンスエンジニアリング強化）
    'faq-tech-1', 'faq-tech-2', 'faq-tech-3', 'faq-tech-4', 'faq-tech-5',
    'faq-pricing-1', 'faq-pricing-2', 'faq-pricing-3', 'faq-pricing-4',
    'faq-support-1', 'faq-support-2', 'faq-support-3', 'faq-support-4',
    'faq-hr-1', 'faq-hr-2', 'faq-hr-3', 'faq-hr-4',
    'faq-marketing-1', 'faq-marketing-2', 'faq-marketing-3', 'faq-marketing-4',
    'faq-ai-site-1', 'faq-ai-site-2', 'faq-ai-site-3', 'faq-ai-site-4', 'faq-ai-site-5'
  ];

  // 🆕 新Fragment IDのhasPartスキーマ生成（既存機能に追加）
  const fragmentBasedSchema = hasPartSystem.generateFragmentBasedSchema(
    newFragmentIds,
    baseUrl,
    '株式会社エヌアンドエス - NANDS=AI強化ページ'
  );

  // ウェブサイト情報（Mike King理論準拠）
  const websiteData = StructuredDataHelpers.getWebPageSchema({
    path: '/',
    title: '株式会社エヌアンドエス - Mike King理論準拠レリバンスエンジニアリング実装企業',
    description: 'レリバンスエンジニアリング、AI検索最適化、生成AI研修、AIシステム開発のエキスパート。Mike King理論に基づくAIO・LLMO対策を全国展開。'
  });

  // Mike King理論準拠: エンティティ関係性を明示した構造化データ
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      organizationData,
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "株式会社エヌアンドエス",
        "description": "Mike King理論準拠のレリバンスエンジニアリング実装企業",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "mainEntity": {
          "@id": `${baseUrl}/#organization`
        },
        "about": [
          "レリバンスエンジニアリング",
          "AI検索最適化",
          "セマンティック検索",
          "LLMO対策",
          "AIO対策",
          "NANDS=AI強化",
          "Fragment ID最適化"
        ],
        // 🆕 新Fragment IDのhasPartスキーマ統合（既存機能を維持）
        "hasPart": fragmentBasedSchema.fragmentSchemas.map(schema => ({
          "@type": schema['@type'],
          "@id": schema['@id'],
          "name": schema.name,
          "url": schema.url
        }))
      },
      // 🆕 新Fragment IDスキーマを既存graphに追加
      ...fragmentBasedSchema.fragmentSchemas
    ]
  };

  return structuredData;
} 