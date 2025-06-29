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

export function getStructuredData() {
  const baseUrl = 'https://nands.tech';
  
  // Mike King理論準拠: 統一エンティティシステムから組織データ生成
  const organizationData = StructuredDataHelpers.getOrganizationSchema();

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
          "AIO対策"
        ]
      }
    ]
  };

  return structuredData;
} 