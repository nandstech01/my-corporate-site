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
      'Triple RAG',
      '自動ベクトルブログ',
      '構造化データ',
      'AI引用最適化',
      '24時間365日無人営業',
      'IT補助金対応',
      '自立成長サイト',
      'ベクトル検索',
      'OpenAI Embeddings',
      'Supabase pgvector',
      'Fragment ID最適化',
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