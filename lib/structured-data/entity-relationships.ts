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