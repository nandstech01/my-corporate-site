// Mike King理論準拠: 統一エンティティ関係性システム
// Relevance Engineering (RE) 基盤実装

export interface EntityRelationship {
  '@id': string;
  '@type': string;
  name: string;
  knowsAbout: string[];
  relatedTo: string[];
  sameAs?: string[];
  mentions?: string[];
  about?: string[];
}

export interface ServiceEntity extends EntityRelationship {
  serviceType: string;
  provider: {
    '@id': string;
  };
  hasOfferCatalog?: {
    '@type': string;
    itemListElement: Array<{
      '@type': string;
      item: {
        '@id': string;
      };
    }>;
  };
}

export interface CompanyPageEntity extends EntityRelationship {
  pageType: string;
  provider: {
    '@id': string;
  };
}

/**
 * 中央エンティティ（組織）の定義
 * 全ての関係性の中心となるエンティティ
 */
export const ORGANIZATION_ENTITY: EntityRelationship = {
  '@id': 'https://nands.tech/#organization',
  '@type': 'Organization',
  name: '株式会社エヌアンドエス',
  knowsAbout: [
    // Mike King理論: レリバンスエンジニアリング
    'レリバンスエンジニアリング',
    'Relevance Engineering',
    'AI検索最適化',
    'セマンティック検索',
    
    // AI・システム開発領域
    'AIエージェント開発',
    'Mastra Framework',
    'MCPサーバー開発',
    'Model Context Protocol',
    '13法令準拠RAG',
    'RAG（Retrieval-Augmented Generation）',
    'ベクトル化技術',
    'LLM（大規模言語モデル）',
    'システム開発',
    'Next.js開発',
    
    // SEO・マーケティング領域
    'SEO対策',
    'AIO対策',
    'AI Overviews最適化',
    'ChatGPT SEO',
    'Perplexity最適化',
    'JSON-LD実装',
    'Schema.org',
    '構造化データ',
    
    // 人材支援領域
    '生成AI研修',
    'リスキリング',
    'プロンプトエンジニアリング',
    'キャリアコンサルティング',
    '退職支援',
    '副業支援',
    
    // 法務・コンプライアンス
    'AI法律相談システム',
    '労働法AI検索システム',
    '弁護士監修サービス',
    '労働組合連携',
    '民法第627条',
    '労働基準法',
    
    // 技術インフラ
    '24時間365日AIサポート',
    'オンライン完結型サービス',
    'クラウドインフラ',
    'セキュリティ対策'
  ],
  relatedTo: [
    'https://nands.tech/system-development#service',
    'https://nands.tech/ai-agents#service',
    'https://nands.tech/aio-seo#service',
    'https://nands.tech/mcp-servers#service',
    'https://nands.tech/vector-rag#service',
    'https://nands.tech/reskilling#service',
    'https://nands.tech/fukugyo#service',
    'https://nands.tech/corporate#service',
    'https://nands.tech/hr-solutions#service'
  ],
  sameAs: [
    'https://taishoku-anshin-daiko.com/',
    'https://twitter.com/nands_tech',
    'https://www.linkedin.com/company/nands-tech'
  ]
};

/**
 * サービスエンティティの定義
 * 各サービス間の意味的関係性を明確化
 */
export const SERVICE_ENTITIES: ServiceEntity[] = [
  {
    '@id': 'https://nands.tech/system-development#service',
    '@type': 'Service',
    name: 'AIシステム開発サービス',
    serviceType: 'SystemDevelopment',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Next.js開発',
      'React開発',
      'TypeScript',
      'Node.js',
      'Supabase',
      'PostgreSQL',
      'REST API',
      'GraphQL',
      'Vercel',
      'AWS',
      'Docker',
      'CI/CD'
    ],
    relatedTo: [
      'https://nands.tech/ai-agents#service',
      'https://nands.tech/mcp-servers#service',
      'https://nands.tech/vector-rag#service'
    ],
    mentions: [
      'フルスタック開発',
      'アジャイル開発',
      'DevOps',
      'セキュリティ',
      'スケーラビリティ'
    ]
  },
  {
    '@id': 'https://nands.tech/ai-agents#service',
    '@type': 'Service',
    name: 'AIエージェント開発サービス',
    serviceType: 'AIAgentDevelopment',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Mastra Framework',
      'AIエージェント',
      'LLM統合',
      'OpenAI GPT-4',
      'Claude 3.5 Sonnet',
      'Function Calling',
      'Tool Use',
      '自動化',
      'ワークフロー',
      'AI推論'
    ],
    relatedTo: [
      'https://nands.tech/system-development#service',
      'https://nands.tech/mcp-servers#service',
      'https://nands.tech/vector-rag#service'
    ],
    mentions: [
      '業務自動化',
      'インテリジェント処理',
      'AI意思決定',
      'データ分析'
    ]
  },
  {
    '@id': 'https://nands.tech/aio-seo#service',
    '@type': 'Service',
    name: 'AIO SEO・GEO対策サービス',
    serviceType: 'AIO_SEO_GEO',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'レリバンスエンジニアリング',
      'Mike King理論',
      'GEO（Generative Engine Optimization）',
      'Topical-Coverage',
      'Explain-Then-List構造',
      'Fragment ID最適化',
      'TOC自動生成',
      'AI Overviews最適化',
      'ChatGPT SEO',
      'Perplexity最適化',
      'セマンティック検索',
      '構造化データ',
      'JSON-LD',
      'Schema.org',
      'エンティティSEO',
      'ナレッジグラフ',
      'AI検索エンジン対策'
    ],
    relatedTo: [
      'https://nands.tech/system-development#service',
      'https://nands.tech/vector-rag#service'
    ],
    mentions: [
      'AI時代のSEO',
      '生成AI検索対策',
      'LLMO対策',
      'GEO最適化',
      '生成系検索最適化',
      '1万字級網羅記事',
      '引用されやすい構造'
    ]
  },
  {
    '@id': 'https://nands.tech/mcp-servers#service',
    '@type': 'Service', 
    name: 'MCPサーバー開発サービス',
    serviceType: 'MCPServerDevelopment',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Model Context Protocol',
      'MCP',
      'Claude Desktop',
      'Cursor IDE',
      'AIシステム連携',
      'データ統合',
      'カスタムサーバー',
      'API統合',
      'ツール拡張'
    ],
    relatedTo: [
      'https://nands.tech/ai-agents#service',
      'https://nands.tech/system-development#service'
    ],
    mentions: [
      'AI開発効率化',
      'ツール統合',
      'ワークフロー最適化'
    ]
  },
  {
    '@id': 'https://nands.tech/vector-rag#service',
    '@type': 'Service',
    name: 'ベクトルRAG開発サービス',
    serviceType: 'VectorRAGDevelopment',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'RAG（Retrieval-Augmented Generation）',
      '13法令準拠RAG',
      'ベクトル検索',
      'Embeddings',
      'Pinecone',
      'Chroma',
      'FAISS',
      'セマンティック検索',
      '文書検索',
      'AI回答生成'
    ],
    relatedTo: [
      'https://nands.tech/ai-agents#service',
      'https://nands.tech/system-development#service',
      'https://nands.tech/hr-solutions#service'
    ],
    mentions: [
      '法的文書検索',
      '精度向上',
      'コンプライアンス',
      'ナレッジ管理'
    ]
  },
  {
    '@id': 'https://nands.tech/lp#service',
    '@type': 'Service',
    name: '人材開発支援助成金対応AI研修サービス',
    serviceType: 'CorporateAITraining',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '人材開発支援助成金',
      'リスキリング',
      'AI研修',
      'SNS自動運用',
      'レリバンスエンジニアリング',
      'GEO最適化',
      'AI検索対策',
      '法人向け研修',
      'ChatGPT活用',
      'Claude活用',
      'AI時代対応',
      '75%還付制度'
    ],
    relatedTo: [
      'https://nands.tech/ai-site#service',
      'https://nands.tech/aio-seo#service',
      'https://nands.tech/hr-solutions#service'
    ],
    mentions: [
      '人材育成',
      'デジタル人材',
      'AI人材育成',
      '企業研修',
      'スキルアップ',
      '助成金活用'
    ]
  },
  {
    '@id': 'https://nands.tech/ai-site#service',
    '@type': 'Service',
    name: 'AIサイト開発サービス（Triple RAG統合）',
    serviceType: 'AISiteDevelopment',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'レリバンスエンジニアリング',
      'Mike King理論',
      'Triple RAG',
      '自動ベクトルブログ',
      '構造化データ',
      'AI引用最適化',
      'Fragment ID最適化',
      'Complete URI生成',
      '24時間365日無人営業',
      'IT補助金対応',
      '自立成長サイト',
      'ベクトル検索',
      'OpenAI Embeddings',
      'Supabase pgvector',
      'セマンティック検索',
      'RAGシステム統合'
    ],
    relatedTo: [
      'https://nands.tech/vector-rag#service',
      'https://nands.tech/aio-seo#service',
      'https://nands.tech/system-development#service'
    ],
    mentions: [
      'AIに引用される設計',
      '自立成長',
      '無人営業システム',
      'Triple RAG統合',
      '構造化データ最適化',
      'AI検索対応'
    ]
  },
  {
    '@id': 'https://nands.tech/ai-site#main-title',
    '@type': 'Service',
    name: 'AIサイト - 24時間365日無人営業システム - H1',
    serviceType: 'AIWebsiteTitle',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'AIサイト概念',
      '24時間365日無人営業',
      'AI引用される構造',
      'レリバンスエンジニアリング',
      'Mike King理論',
      'Triple RAG',
      '自動ベクトルブログ',
      '構造化データ自動生成'
    ],
    relatedTo: [
      'https://nands.tech/ai-site#service',
      'https://nands.tech/ai-site#features-title'
    ],
    mentions: [
      'AIサイト',
      '無人営業',
      'AI引用',
      'レリバンスエンジニアリング'
    ]
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/ai-site#features-title',
    '@type': 'Service',
    name: '機能一覧 - Triple RAG & Fragment ID - H2',
    serviceType: 'AIWebsiteFeatures',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Triple RAG機能',
      'Fragment ID実装',
      '構造化データ自動生成',
      'ベクトル検索',
      'エンティティRAG',
      'チャットボット',
      'レリバンスエンジニアリング',
      '自動ベクトルブログ生成'
    ],
    relatedTo: [
      'https://nands.tech/ai-site#main-title',
      'https://nands.tech/ai-site#pricing-title'
    ],
    mentions: [
      'Triple RAG',
      'Fragment ID',
      '構造化データ',
      'ベクトル検索'
    ]
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/ai-site#pricing-title',
    '@type': 'Service',
    name: '価格・プラン - IT補助金対応 - H2',
    serviceType: 'AIWebsitePricing',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'AIサイト価格設定',
      'IT補助金活用',
      'ROI投資対効果',
      '月額運用費用',
      '導入費用',
      '補助金申請サポート'
    ],
    relatedTo: [
      'https://nands.tech/ai-site#features-title',
      'https://nands.tech/ai-site#faq-title'
    ],
    mentions: [
      '価格設定',
      'IT補助金',
      'ROI',
      '投資対効果'
    ]
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/ai-site#faq-title',
    '@type': 'Service',
    name: 'よくある質問 - AI引用最適化の全て - H2',
    serviceType: 'AIWebsiteFAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'AIサイトFAQ',
      'AI引用方法',
      'Mike King理論質問',
      'レリバンスエンジニアリング効果',
      'Fragment ID効果',
      'Complete URI機能',
      'AI検索最適化'
    ],
    relatedTo: [
      'https://nands.tech/ai-site#pricing-title',
      'https://nands.tech/ai-site#main-title'
    ],
    mentions: [
      'AI引用FAQ',
      'Mike King理論',
      'AI検索最適化',
      'Fragment ID効果'
    ]
  } as ServiceEntity,

];

/**
 * 企業情報系エンティティの定義
 * Fragment ID・完全URI統合対応
 */
export const COMPANY_PAGE_ENTITIES: CompanyPageEntity[] = [
  {
    '@id': 'https://nands.tech/corporate#company',
    '@type': 'AboutPage',
    name: '企業情報・会社概要',
    pageType: 'CorporateInformation',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '企業情報',
      '会社概要',
      '代表者情報',
      '設立年月日',
      '資本金',
      '事業内容',
      '所在地',
      '連絡先',
      '企業理念',
      'ミッション',
      'ビジョン',
      '経営方針',
      '沿革',
      '組織体制',
      '役員構成',
      '企業文化',
      'CSR活動',
      '環境への取り組み',
      '社会貢献',
      '持続可能性',
      'コンプライアンス',
      'ガバナンス'
    ],
    relatedTo: [
      'https://nands.tech/about#company',
      'https://nands.tech/sustainability#company',
      'https://nands.tech/reviews#company',
      'https://nands.tech/faq#company'
    ],
    mentions: [
      '株式会社エヌアンドエス',
      '原田賢治',
      'AI技術',
      'レリバンスエンジニアリング',
      '関西地方',
      '滋賀県大津市',
      '2008年設立',
      'ITコンサルティング',
      '人材育成',
      'DX推進'
    ]
  },
  {
    '@id': 'https://nands.tech/about#company',
    '@type': 'AboutPage',
    name: '会社概要・代表者紹介',
    pageType: 'AboutUs',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '会社概要',
      '代表者紹介',
      '原田賢治',
      '経歴',
      '専門分野',
      '資格',
      '実績',
      '著書',
      '講演',
      'AI研究',
      'レリバンスエンジニアリング研究',
      'SEO専門',
      'GEO対策',
      'AI検索最適化',
      'プロンプトエンジニアリング',
      '生成AI活用',
      'ChatGPT専門',
      'Perplexity最適化',
      'Claude活用',
      '企業研修',
      '人材育成',
      'コンサルティング'
    ],
    relatedTo: [
      'https://nands.tech/corporate#company',
      'https://nands.tech/reviews#company',
      'https://nands.tech/ai-agents#service',
      'https://nands.tech/aio-seo#service'
    ],
    mentions: [
      'Mike King理論',
      'iPullRank',
      'SEOコンサルタント',
      'AI研究者',
      '関西SEO',
      '滋賀県AI',
      'AI人材育成',
      'DXコンサルタント'
    ]
  },
  {
    '@id': 'https://nands.tech/reviews#company',
    '@type': 'ReviewPage',
    name: 'お客様の声・評価・実績',
    pageType: 'CustomerReviews',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'お客様の声',
      '顧客評価',
      '実績',
      '成功事例',
      'ケーススタディ',
      '導入事例',
      '効果測定',
      'ROI改善',
      '業務効率化',
      'AI導入成果',
      'SEO改善結果',
      '検索順位向上',
      'アクセス数増加',
      'コンバージョン改善',
      '売上向上',
      '人材育成効果',
      'スキルアップ',
      '研修満足度',
      '企業満足度',
      'サービス品質',
      'サポート体制',
      '継続利用率'
    ],
    relatedTo: [
      'https://nands.tech/corporate#company',
      'https://nands.tech/about#company',
      'https://nands.tech/faq#company',
      'https://nands.tech/ai-agents#service'
    ],
    mentions: [
      '顧客満足度',
      '実績No.1',
      '関西地方実績',
      'AI導入支援',
      'SEO対策実績',
      '研修実績',
      '継続率',
      '効果実証'
    ]
  },
  {
    '@id': 'https://nands.tech/faq#company',
    '@type': 'FAQPage',
    name: 'よくある質問・FAQ',
    pageType: 'FrequentlyAskedQuestions',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'よくある質問',
      'FAQ',
      'サービス内容',
      '料金体系',
      '契約条件',
      '導入方法',
      '導入期間',
      'サポート内容',
      '対応地域',
      '対象業界',
      '対象企業規模',
      '必要な準備',
      '効果期間',
      '成果保証',
      '解約条件',
      '支払い方法',
      '無料相談',
      '無料トライアル',
      'デモンストレーション',
      '技術要件',
      'セキュリティ',
      'プライバシー'
    ],
    relatedTo: [
      'https://nands.tech/corporate#company',
      'https://nands.tech/about#company',
      'https://nands.tech/reviews#company',
      'https://nands.tech/legal#company'
    ],
    mentions: [
      '無料相談',
      '初回無料',
      '成果保証',
      '関西対応',
      '全国対応',
      'オンライン対応',
      '24時間サポート',
      '専任担当'
    ]
  },

  // 持続可能性ページ
  {
    '@id': 'https://nands.tech/sustainability#company',
    '@type': 'AboutPage',
    name: '持続可能性・CSR',
    pageType: 'Sustainability',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '持続可能性',
      'CSR',
      '企業の社会的責任',
      '環境経営',
      'SDGs',
      '社会貢献',
      'ESG経営',
      'カーボンニュートラル',
      'デジタル変革支援',
      '地域貢献'
    ],
    relatedTo: [
      'https://nands.tech/corporate#company',
      'https://nands.tech/about#company',
      'https://nands.tech/reviews#company'
    ],
    mentions: [
      '環境配慮',
      '社会貢献活動',
      '持続可能な成長',
      '責任ある事業運営',
      'ステークホルダー重視'
    ]
  },

  // 法的情報ページ
  {
    '@id': 'https://nands.tech/legal#company',
    '@type': 'AboutPage',
    name: '法的情報',
    pageType: 'LegalInformation',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '法的情報',
      '商標',
      '著作権',
      '知的財産',
      '法令遵守',
      'コンプライアンス',
      '事業許可',
      '認定情報',
      '免責事項',
      '準拠法'
    ],
    relatedTo: [
      'https://nands.tech/privacy#company',
      'https://nands.tech/terms#company',
      'https://nands.tech/faq#company'
    ],
    mentions: [
      '法的権利',
      '責任制限',
      '知的財産保護',
      '適用法令',
      '免責条項'
    ]
  },

  // プライバシーポリシーページ
  {
    '@id': 'https://nands.tech/privacy#company',
    '@type': 'AboutPage',
    name: 'プライバシーポリシー',
    pageType: 'PrivacyPolicy',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'プライバシーポリシー',
      '個人情報保護',
      'データ保護',
      'GDPR',
      '個人情報取扱い',
      'Cookie利用',
      'データ収集',
      'データ利用目的',
      'セキュリティ対策',
      '第三者提供'
    ],
    relatedTo: [
      'https://nands.tech/terms#company',
      'https://nands.tech/legal#company',
      'https://nands.tech/corporate#company'
    ],
    mentions: [
      '個人情報保護法',
      'プライバシー保護',
      'データセキュリティ',
      '適正利用',
      '安全管理措置'
    ]
  },

  // 利用規約ページ  
  {
    '@id': 'https://nands.tech/terms#company',
    '@type': 'AboutPage',
    name: '利用規約',
    pageType: 'TermsOfService',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '利用規約',
      'サービス利用条件',
      '利用者責任',
      'サービス提供条件',
      '契約条件',
      '禁止事項',
      'サービス変更',
      '契約解除',
      '損害賠償',
      '準拠法・管轄'
    ],
    relatedTo: [
      'https://nands.tech/privacy#company',
      'https://nands.tech/legal#company',
      'https://nands.tech/faq#company'
    ],
    mentions: [
      'サービス利用',
      '利用条件',
      '契約関係',
      '法的拘束力',
      '利用者同意'
    ]
  }
];

/**
 * AI-site FAQ Fragment IDエンティティ (30個 - AI認識変革戦略)
 * 型エラー回避のため専用配列で管理
 */
export const AI_SITE_FAQ_ENTITIES: ServiceEntity[] = [
  {
    '@id': 'https://nands.tech/ai-site#faq-1',
    '@type': 'Service',
    name: 'AIサイトとは何ですか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'AIサイト定義',
      'AI引用サイト',
      'レリバンスエンジニアリング',
      'ChatGPT引用',
      'Perplexity引用'
    ],
    relatedTo: ['https://nands.tech/ai-site#service'],
    mentions: ['AIサイト', 'AI引用', 'レリバンスエンジニアリング']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-2',
    '@type': 'Service',
    name: 'AIサイトと通常のサイトの違いは？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'AIサイト差別化',
      'Fragment ID',
      '構造化データ',
      'Triple RAG',
      'AI最適化'
    ],
    relatedTo: ['https://nands.tech/ai-site#faq-1'],
    mentions: ['差別化', 'AI最適化', '構造化データ']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-3',
    '@type': 'Service',
    name: 'AIに引用されるサイトの重要性は？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'AI検索移行',
      '競合優位性',
      'AI引用重要性',
      'Google AI Overviews'
    ],
    relatedTo: ['https://nands.tech/ai-site#faq-2'],
    mentions: ['AI検索', '競合優位性', 'Google AI']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-4',
    '@type': 'Service',
    name: 'レリバンスエンジニアリングとは？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Mike King理論',
      'AI検索最適化',
      '情報設計',
      '構造化技術',
      'SEO進化'
    ],
    relatedTo: ['https://nands.tech/ai-site#faq-1'],
    mentions: ['Mike King', 'AI検索最適化', 'SEO']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-5',
    '@type': 'Service',
    name: 'Fragment IDとは何ですか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Fragment ID技術',
      'Complete URI',
      'AI引用精度',
      'ページ内ID指定'
    ],
    relatedTo: ['https://nands.tech/ai-site#faq-4'],
    mentions: ['Fragment ID', 'Complete URI', 'AI引用']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-6',
    '@type': 'Service',
    name: 'Triple RAGシステムとは？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['Triple RAG', 'エンティティRAG', '最新トレンドRAG', '公開記事RAG'],
    relatedTo: ['https://nands.tech/ai-site#faq-5'],
    mentions: ['Triple RAG', 'エンティティRAG', 'ベクトル検索']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-7',
    '@type': 'Service',
    name: '構造化データの役割は？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['構造化データ', 'JSON-LD', 'Schema.org', 'AI理解促進'],
    relatedTo: ['https://nands.tech/ai-site#faq-6'],
    mentions: ['構造化データ', 'JSON-LD', 'AI理解']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-8',
    '@type': 'Service',
    name: '自動ベクトルブログとは？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['自動ベクトルブログ', 'RAG生成', '7000文字記事', 'AI権威性'],
    relatedTo: ['https://nands.tech/ai-site#faq-7'],
    mentions: ['ベクトルブログ', '自動生成', 'RAG']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-9',
    '@type': 'Service',
    name: 'Complete URIの仕組みは？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['Complete URI', 'Fragment ID統合', 'ディープリンク', 'AI引用精度'],
    relatedTo: ['https://nands.tech/ai-site#faq-8'],
    mentions: ['Complete URI', 'ディープリンク', 'AI引用']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-10',
    '@type': 'Service',
    name: 'ベクトル検索との違いは？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['ベクトル検索', 'セマンティック検索', 'キーワード検索', 'AI検索'],
    relatedTo: ['https://nands.tech/ai-site#faq-9'],
    mentions: ['ベクトル検索', 'セマンティック', 'AI検索']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-11',
    '@type': 'Service',
    name: 'AIに引用されるとどんなメリットがありますか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AI引用メリット', '24時間営業', '自動集客', '競合優位性'],
    relatedTo: ['https://nands.tech/ai-site#faq-10'],
    mentions: ['AI引用', '自動集客', '競合優位性']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-12',
    '@type': 'Service',
    name: 'ROI（投資対効果）はどれくらい？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['ROI計算', '投資対効果', 'AI営業効果', '収益向上'],
    relatedTo: ['https://nands.tech/ai-site#faq-11'],
    mentions: ['ROI', '投資対効果', '収益向上']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-13',
    '@type': 'Service',
    name: '導入効果の測定方法は？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['効果測定', 'AI引用数', 'クリック率', 'CV向上'],
    relatedTo: ['https://nands.tech/ai-site#faq-12'],
    mentions: ['効果測定', 'AI引用数', 'CV向上']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-14',
    '@type': 'Service',
    name: '競合他社との差別化要因は？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['差別化要因', 'Mike King理論', 'レリバンスエンジニアリング', '独自技術'],
    relatedTo: ['https://nands.tech/ai-site#faq-13'],
    mentions: ['差別化', 'Mike King理論', '独自技術']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-15',
    '@type': 'Service',
    name: '24時間365日無人営業とは？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['無人営業', '24時間対応', 'AI自動対応', '営業自動化'],
    relatedTo: ['https://nands.tech/ai-site#faq-14'],
    mentions: ['無人営業', '24時間対応', '営業自動化']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-16',
    '@type': 'Service',
    name: '既存サイトへの実装は可能ですか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['既存サイト実装', 'サイト移行', '段階的実装', '互換性'],
    relatedTo: ['https://nands.tech/ai-site#faq-15'],
    mentions: ['既存サイト', 'サイト移行', '実装']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-17',
    '@type': 'Service',
    name: '実装期間はどれくらいですか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['実装期間', '6-10週間', '要件定義', 'プロジェクト管理'],
    relatedTo: ['https://nands.tech/ai-site#faq-16'],
    mentions: ['実装期間', '6-10週間', '要件定義']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-18',
    '@type': 'Service',
    name: 'IT補助金は活用できますか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['IT補助金', '補助金活用', '最大3/4補助', '申請サポート'],
    relatedTo: ['https://nands.tech/ai-site#faq-17'],
    mentions: ['IT補助金', '補助金活用', '申請サポート']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-19',
    '@type': 'Service',
    name: '運用保守は必要ですか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['運用保守', '月額10-15万円', '監視', '最適化'],
    relatedTo: ['https://nands.tech/ai-site#faq-18'],
    mentions: ['運用保守', '月額運用', '監視']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-20',
    '@type': 'Service',
    name: 'セキュリティ対策は？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['セキュリティ対策', 'データ保護', '暗号化', 'アクセス制御'],
    relatedTo: ['https://nands.tech/ai-site#faq-19'],
    mentions: ['セキュリティ', 'データ保護', '暗号化']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-21',
    '@type': 'Service',
    name: 'AI検索の普及はどれくらい進んでいますか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AI検索普及', 'Google AI Overviews', 'ChatGPT検索', '市場動向'],
    relatedTo: ['https://nands.tech/ai-site#faq-20'],
    mentions: ['AI検索普及', 'Google AI', 'ChatGPT']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-22',
    '@type': 'Service',
    name: 'どの業界に効果的ですか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['業界別効果', '製造BtoB', '士業', '地域サービス'],
    relatedTo: ['https://nands.tech/ai-site#faq-21'],
    mentions: ['業界別', '製造BtoB', '士業']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-23',
    '@type': 'Service',
    name: 'Google検索との関係は？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['Google検索', 'SEO', 'AI Overviews', '検索最適化'],
    relatedTo: ['https://nands.tech/ai-site#faq-22'],
    mentions: ['Google検索', 'SEO', 'AI Overviews']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-24',
    '@type': 'Service',
    name: 'ChatGPTやClaude以外のAIにも対応？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['マルチAI対応', 'ChatGPT', 'Claude', 'Perplexity', 'Gemini'],
    relatedTo: ['https://nands.tech/ai-site#faq-23'],
    mentions: ['マルチAI', 'ChatGPT', 'Claude', 'Perplexity']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-25',
    '@type': 'Service',
    name: '国際的な展開は可能ですか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['国際展開', '多言語対応', 'グローバル対応', '海外市場'],
    relatedTo: ['https://nands.tech/ai-site#faq-24'],
    mentions: ['国際展開', '多言語対応', 'グローバル']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-26',
    '@type': 'Service',
    name: 'AIに引用されることのリスクはありますか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AI引用リスク', 'リスク管理', '情報制御', 'ブランド保護'],
    relatedTo: ['https://nands.tech/ai-site#faq-25'],
    mentions: ['AI引用リスク', 'リスク管理', 'ブランド保護']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-27',
    '@type': 'Service',
    name: '従来のSEOとの違いは？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['SEO違い', 'AIO対策', 'GEO対策', 'AI検索最適化'],
    relatedTo: ['https://nands.tech/ai-site#faq-26'],
    mentions: ['SEO', 'AIO', 'GEO', 'AI最適化']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-28',
    '@type': 'Service',
    name: '小規模企業でも効果ありますか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['小規模企業効果', '中小企業対応', 'スケーラブル', '段階的導入'],
    relatedTo: ['https://nands.tech/ai-site#faq-27'],
    mentions: ['小規模企業', '中小企業', 'スケーラブル']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-29',
    '@type': 'Service',
    name: '他社サービスとの違いは？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['他社比較', '独自性', 'Mike King理論準拠', '実装完成度'],
    relatedTo: ['https://nands.tech/ai-site#faq-28'],
    mentions: ['他社比較', '独自性', 'Mike King理論']
  },
  {
    '@id': 'https://nands.tech/ai-site#faq-30',
    '@type': 'Service',
    name: '成果が出ない場合はどうなりますか？ - FAQ',
    serviceType: 'FAQ',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['成果保証', 'サポート体制', '改善提案', '継続サポート'],
    relatedTo: ['https://nands.tech/ai-site#faq-29'],
    mentions: ['成果保証', 'サポート体制', '継続サポート']
  }
];

/**
 * エンティティ関係性マップ
 * サービス間の相互関係を定義
 */
export const ENTITY_RELATIONSHIP_MAP = {
  // システム開発 ↔ AIエージェント
  systemToAgent: {
    relation: 'enables',
    description: 'システム開発がAIエージェントの実装基盤を提供'
  },
  
  // AIエージェント ↔ MCP
  agentToMCP: {
    relation: 'integrates',
    description: 'AIエージェントがMCPサーバーと統合'
  },
  
  // ベクトルRAG ↔ AIエージェント
  ragToAgent: {
    relation: 'powers',
    description: 'ベクトルRAGがAIエージェントの知識基盤を提供'
  },
  
  // AIO SEO ↔ システム開発
  seoToSystem: {
    relation: 'optimizes',
    description: 'AIO SEOがシステムの検索可視性を最適化'
  },
  
  // リスキリング ↔ 全技術サービス
  reskillingToTech: {
    relation: 'teaches',
    description: 'リスキリングが技術サービスの活用方法を教育'
  },
  
  // LP研修 ↔ AIサイト
  lpToAISite: {
    relation: 'prepares',
    description: '人材開発研修がAIサイト活用に必要なスキルを提供'
  },
  
  // AIサイト ↔ ベクトルRAG
  aiSiteToRAG: {
    relation: 'utilizes',
    description: 'AIサイトがTriple RAGシステムを活用'
  },
  
  // AIサイト ↔ AIO SEO
  aiSiteToSEO: {
    relation: 'implements',
    description: 'AIサイトがAIO SEO・GEO対策を実装'
  }
};

/**
 * エンティティ関係性の取得
 */
export function getEntityRelationships(entityId: string): string[] {
  const entity = SERVICE_ENTITIES.find(e => e['@id'] === entityId);
  return entity?.relatedTo || [];
}

/**
 * 関連サービスの取得
 */
export function getRelatedServices(serviceType: string): ServiceEntity[] {
  return SERVICE_ENTITIES.filter(service => 
    service.serviceType !== serviceType &&
    service.relatedTo.some(relatedId => 
      SERVICE_ENTITIES.find(s => s['@id'] === relatedId && s.serviceType === serviceType)
    )
  );
} 

/**
 * 動的ベクトルブログエンティティ生成システム
 * Mike King理論準拠: AI引用最適化
 */
export interface DynamicBlogEntity extends ServiceEntity {
  postId: number;
  slug: string;
  fragmentType: 'title' | 'section' | 'faq' | 'howto';
  generatedAt: string;
  vectorId?: number;
}

/**
 * ベクトルブログFAQ動的エンティティ生成
 */
export function generateBlogFAQEntities(
  postData: {
    id: number;
    title: string;
    slug: string;
    content: string;
  },
  faqItems: Array<{ question: string; answer: string; index: number }>
): DynamicBlogEntity[] {
  const entities: DynamicBlogEntity[] = [];

  faqItems.forEach((faq, index) => {
    const entity: DynamicBlogEntity = {
      '@id': `https://nands.tech/posts/${postData.slug}#faq-${index + 1}`,
      '@type': 'Service',
      name: `${faq.question} - FAQ`,
      serviceType: 'FAQ',
      provider: { '@id': 'https://nands.tech/#organization' },
      knowsAbout: [
        // AI引用最適化キーワード抽出
        ...extractKeywordsFromText(faq.question),
        ...extractKeywordsFromText(faq.answer),
        'AI引用最適化',
        'ベクトルブログ'
      ],
      relatedTo: [
        `https://nands.tech/posts/${postData.slug}#main-title`,
        `https://nands.tech/posts/${postData.slug}#faq-section`
      ],
      mentions: extractMentionsFromText(faq.answer),
      // 動的エンティティ専用プロパティ
      postId: postData.id,
      slug: postData.slug,
      fragmentType: 'faq',
      generatedAt: new Date().toISOString()
    };

    entities.push(entity);
  });

  return entities;
}

/**
 * ベクトルブログセクション動的エンティティ生成
 */
export function generateBlogSectionEntities(
  postData: {
    id: number;
    title: string;
    slug: string;
    content: string;
  },
  sections: Array<{ id: string; title: string; level: number }>
): DynamicBlogEntity[] {
  const entities: DynamicBlogEntity[] = [];

  sections.forEach((section) => {
    const entity: DynamicBlogEntity = {
      '@id': `https://nands.tech/posts/${postData.slug}#${section.id}`,
      '@type': 'Service',
      name: `${section.title} - セクション`,
      serviceType: 'BlogSection',
      provider: { '@id': 'https://nands.tech/#organization' },
      knowsAbout: [
        ...extractKeywordsFromText(section.title),
        'AI引用最適化',
        'Fragment ID',
        'レリバンスエンジニアリング'
      ],
      relatedTo: [
        `https://nands.tech/posts/${postData.slug}#main-title`
      ],
      mentions: [section.title],
      // 動的エンティティ専用プロパティ
      postId: postData.id,
      slug: postData.slug,
      fragmentType: 'section',
      generatedAt: new Date().toISOString()
    };

    entities.push(entity);
  });

  return entities;
}

/**
 * テキストからキーワードを抽出（簡易版）
 */
function extractKeywordsFromText(text: string): string[] {
  const keywords: string[] = [];
  
  // AI・技術関連キーワード
  const techKeywords = ['AI', 'AIO', 'SEO', 'RAG', 'ベクトル', 'API', 'システム', 'データ', 'プロンプト'];
  techKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });

  // ビジネス関連キーワード
  const businessKeywords = ['マーケティング', '最適化', '効率', '業務', '企業', '戦略', '導入'];
  businessKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });

  return Array.from(new Set(keywords)); // 重複除去
}

/**
 * テキストからメンション（言及）を抽出
 */
function extractMentionsFromText(text: string): string[] {
  const mentions: string[] = [];
  
  // 重要な固有名詞・サービス名を抽出
  const importantTerms = [
    'ChatGPT', 'OpenAI', 'Google', 'Perplexity', 'Claude',
    'Next.js', 'React', 'TypeScript', 'Supabase',
    'Mike King', 'レリバンスエンジニアリング', 'Fragment ID'
  ];
  
  importantTerms.forEach(term => {
    if (text.includes(term)) {
      mentions.push(term);
    }
  });

  return Array.from(new Set(mentions)); // 重複除去
}

/**
 * 動的エンティティをメモリ内キャッシュ（一時的）
 */
let DYNAMIC_BLOG_ENTITIES: DynamicBlogEntity[] = [];

/**
 * 動的エンティティの追加
 */
export function addDynamicBlogEntities(entities: DynamicBlogEntity[]): void {
  DYNAMIC_BLOG_ENTITIES = [...DYNAMIC_BLOG_ENTITIES, ...entities];
}

/**
 * 動的エンティティの取得
 */
export function getDynamicBlogEntities(slug?: string): DynamicBlogEntity[] {
  if (slug) {
    return DYNAMIC_BLOG_ENTITIES.filter(entity => entity.slug === slug);
  }
  return DYNAMIC_BLOG_ENTITIES;
}

/**
 * 全エンティティ取得（静的 + 動的）
 */
export function getAllEntities(): (ServiceEntity | DynamicBlogEntity)[] {
  return [
    ...SERVICE_ENTITIES,
    ...AI_SITE_FAQ_ENTITIES,
    ...DYNAMIC_BLOG_ENTITIES
  ];
} 