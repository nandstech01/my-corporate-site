// Googleガイドライン準拠版の構造化データ
// 
// 【準拠ポイント】
// ✅ 実際に存在する情報のみ記載
// ✅ 正確な企業情報（住所・電話番号・代表者）
// ✅ 存在しない画像URLを削除
// ✅ 実装されていない機能（検索）を削除
// ✅ 過度に複雑な構造を簡素化
// ✅ 誤解を招く可能性のある記述を削除
//
// 【検証方法】
// Google Rich Results Test: https://search.google.com/test/rich-results
// Schema Markup Validator: https://validator.schema.org/
//
export function getStructuredData() {
  const baseUrl = 'https://nands.tech';
  
  // 組織の基本情報（ガイドライン準拠・正確な情報）
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "株式会社エヌアンドエス",
    "url": baseUrl,
    "description": "滋賀県大津市皇子が丘を拠点とする総合人材支援企業。生成AIを活用したリスキリング研修、キャリアコンサルティング、退職支援を関西地方を中心に全国で提供。",
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
      "telephone": "0120-558-551",
      "contactType": "customer service",
      "availableLanguage": ["Japanese"],
      "areaServed": ["JP", "関西地方", "滋賀県", "大津市"]
    },
    "founder": {
      "@type": "Person",
      "name": "原田賢治",
      "jobTitle": "代表取締役"
    },
    // 実際に提供しているサービス・技術領域
    "knowsAbout": [
      "生成AI研修",
      "リスキリング",
      "プロンプトエンジニアリング",
      "キャリアコンサルティング",
      "退職支援",
      "退職代行サービス",
      "システム開発",
      "MCPサーバー開発",
      "RAG（Retrieval-Augmented Generation）",
      "13法令準拠RAG",
      "ベクトル化技術",
      "LLM（大規模言語モデル）",
      "AIエージェント開発",
      "AI法律相談システム",
      "労働法AI検索システム",
      "SEO対策",
      "レリバンスエンジニアリング",
      "AIモード対策",
      "弁護士監修サービス",
      "労働組合連携",
      "民法第627条退職権利",
      "労働基準法コンサルティング",
      "24時間365日AIサポート",
      "オンライン完結型サービス"
    ],
    "serviceArea": [
      {
        "@type": "Country",
        "name": "日本"
      },
      {
        "@type": "Place",
        "name": "関西地方"
      },
      {
        "@type": "Place",
        "name": "滋賀県"
      },
      {
        "@type": "Place",
        "name": "大津市"
      }
    ],
    // 関連サービスサイト
    "sameAs": [
      "https://taishoku-anshin-daiko.com/"
    ],
    // 実際のサービス実績
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "人材支援・技術サービス",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "キャリア転換支援サービス（退職エージェント）",
            "description": "AI技術活用、退職〜学習〜転職〜副業まで包括支援、業界最安値2,980円",
            "provider": {
              "@id": `${baseUrl}/#organization`
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI法律相談システム開発",
            "description": "13法令準拠RAG、労働法AI検索システム",
            "provider": {
              "@id": `${baseUrl}/#organization`
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "生成AIリスキリング研修",
            "description": "プロンプトエンジニアリング、AIエージェント開発研修",
            "provider": {
              "@id": `${baseUrl}/#organization`
            }
          }
        }
      ]
    }
  };

  // ウェブサイト情報（シンプル版）
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": "株式会社エヌアンドエス",
    "description": "生成AIリスキリング研修と総合人材支援のエキスパート",
    "publisher": {
      "@id": `${baseUrl}/#organization`
    },
    "mainEntity": {
      "@id": `${baseUrl}/#organization`
    }
  };

  // ガイドライン準拠のシンプルな構造
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      organizationData,
      websiteData
    ]
  };

  return structuredData;
} 