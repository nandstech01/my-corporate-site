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

  // 🆕 メインページサービスFragment IDエンティティ（12個追加 - NANDS=AI強化）
  {
    '@id': 'https://nands.tech/#service-system-development',
    '@type': 'WebPageElement',
    name: 'システム開発サービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['システム開発', 'NANDS', 'AI統合', 'Web開発'],
    relatedTo: ['https://nands.tech/system-development#service'],
    mentions: ['AI', 'システム開発', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-aio-seo',
    '@type': 'WebPageElement',
    name: 'AIO・SEO最適化サービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIO対策', 'SEO', 'NANDS', 'AI検索最適化'],
    relatedTo: ['https://nands.tech/aio-seo#service'],
    mentions: ['AI', 'SEO', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-chatbot-development',
    '@type': 'WebPageElement',
    name: 'チャットボット開発サービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['チャットボット', 'ChatGPT', 'NANDS', 'AI開発'],
    relatedTo: ['https://nands.tech/chatbot-development#service'],
    mentions: ['AI', 'チャットボット', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-vector-rag',
    '@type': 'WebPageElement',
    name: 'ベクトルRAG検索サービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['ベクトルRAG', 'AI検索', 'NANDS', 'OpenAI'],
    relatedTo: ['https://nands.tech/vector-rag#service'],
    mentions: ['AI', 'RAG', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-ai-side-business',
    '@type': 'WebPageElement',
    name: 'AI副業サービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AI副業', 'ChatGPT', 'NANDS', '副業支援'],
    relatedTo: ['https://nands.tech/fukugyo#service'],
    mentions: ['AI', '副業', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-hr-support',
    '@type': 'WebPageElement',
    name: '人材ソリューションサービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['人材ソリューション', 'HR', 'NANDS', 'AI活用'],
    relatedTo: ['https://nands.tech/hr-solutions#service'],
    mentions: ['AI', '人材', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-ai-agents',
    '@type': 'WebPageElement',
    name: 'AIエージェントサービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIエージェント', 'Mastra', 'NANDS', 'AI自動化'],
    relatedTo: ['https://nands.tech/ai-agents#service'],
    mentions: ['AI', 'エージェント', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-mcp-servers',
    '@type': 'WebPageElement',
    name: 'MCPサーバーサービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['MCPサーバー', 'MCP', 'NANDS', 'AI統合'],
    relatedTo: ['https://nands.tech/mcp-servers#service'],
    mentions: ['AI', 'MCP', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-sns-automation',
    '@type': 'WebPageElement',
    name: 'SNS自動化サービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['SNS自動化', 'AI投稿', 'NANDS', 'マーケティング'],
    relatedTo: ['https://nands.tech/sns-automation#service'],
    mentions: ['AI', 'SNS', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-video-generation',
    '@type': 'WebPageElement',
    name: '動画生成サービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['動画生成', 'AI動画', 'NANDS', 'コンテンツ制作'],
    relatedTo: ['https://nands.tech/video-generation#service'],
    mentions: ['AI', '動画', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-corporate-reskilling',
    '@type': 'WebPageElement',
    name: '法人向けリスキリングサービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['法人研修', 'リスキリング', 'NANDS', 'DX推進'],
    relatedTo: ['https://nands.tech/corporate#service'],
    mentions: ['AI', '研修', 'NANDS']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#service-individual-reskilling',
    '@type': 'WebPageElement',
    name: '個人向けリスキリングサービス（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['個人研修', 'リスキリング', 'NANDS', 'キャリア支援'],
    relatedTo: ['https://nands.tech/reskilling#service'],
    mentions: ['AI', '研修', 'NANDS']
  } as ServiceEntity,

  // 🆕 NANDSのAIサイト関連Fragment IDエンティティ（3個追加 - AI引用資産化強化）
  {
    '@id': 'https://nands.tech/#nands-ai-site',
    '@type': 'WebPageElement',
    name: 'NANDSのAIサイト（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIに引用されるサイト', 'デジタル資産', 'NANDS', 'AI検索エンジン対応'],
    relatedTo: ['https://nands.tech/ai-site#ai-site-overview'],
    mentions: ['NANDS', 'AI引用', 'デジタル資産']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#ai-site-features',
    '@type': 'WebPageElement',
    name: 'AI引用精度向上機能（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AI引用精度', 'Fragment ID', 'NANDS', '構造化データ'],
    relatedTo: ['https://nands.tech/ai-site#ai-site-features'],
    mentions: ['NANDS', 'AI引用', '精度向上']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#ai-site-technology',
    '@type': 'WebPageElement',
    name: '継続的価値創造システム（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['価値創造', 'NANDS=AI認識', 'NANDS', 'ブランド資産化'],
    relatedTo: ['https://nands.tech/ai-site#ai-technology-details'],
    mentions: ['NANDS', '価値創造', 'ブランド資産']
  } as ServiceEntity,

  // 🆕 メインページFAQ Fragment IDエンティティ（新形式に更新 - fragment_vectorsと整合）
  {
    '@id': 'https://nands.tech/#faq-main-1',
    '@type': 'WebPageElement',
    name: 'NANDSの主要サービスFAQ（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIエージェント開発', 'ベクトルRAG', 'チャットボット開発', 'AIO SEO', 'リスキリング研修'],
    relatedTo: ['https://nands.tech/ai-agents#service', 'https://nands.tech/vector-rag#service'],
    mentions: ['AI', 'RAG', 'NANDS', 'チャットボット']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#faq-main-2',
    '@type': 'WebPageElement',
    name: 'AI検索最適化FAQ（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AI検索最適化', 'AIO', 'ChatGPT', 'Claude', 'Perplexity', 'Fragment ID'],
    relatedTo: ['https://nands.tech/aio-seo#service', 'https://nands.tech/faq#aio'],
    mentions: ['AIO', 'AI検索', 'ChatGPT', 'Claude', 'Perplexity']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#faq-main-3',
    '@type': 'WebPageElement',
    name: 'Fragment IDシステムFAQ（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['Fragment ID', 'AI検索引用', 'Mike King理論', '構造化データ', 'Complete URI'],
    relatedTo: ['https://nands.tech/ai-site#fragment-id', 'https://nands.tech/faq#fragment-id'],
    mentions: ['Fragment ID', 'Mike King', 'AI引用', '構造化データ']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#faq-main-4',
    '@type': 'WebPageElement',
    name: 'ベクトルRAGシステムFAQ（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['ベクトルRAG', 'RAG', 'セマンティック検索', 'AI検索', '知識資産'],
    relatedTo: ['https://nands.tech/vector-rag#service', 'https://nands.tech/faq#vector-rag'],
    mentions: ['RAG', 'ベクトル', 'AI検索', 'セマンティック']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#faq-main-5',
    '@type': 'WebPageElement',
    name: 'AIエージェント開発FAQ（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIエージェント', '自律的AI', 'マルチエージェント', 'AI自動化', 'タスク実行'],
    relatedTo: ['https://nands.tech/ai-agents#service', 'https://nands.tech/faq#ai-agents'],
    mentions: ['AIエージェント', '自律的', '自動化', 'AI']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#faq-main-6',
    '@type': 'WebPageElement',
    name: 'サービス導入期間・費用FAQ（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['導入期間', '費用', 'プロジェクト規模', 'チャットボット開発', '見積もり'],
    relatedTo: ['https://nands.tech/contact#pricing', 'https://nands.tech/faq#pricing'],
    mentions: ['導入期間', '費用', 'チャットボット', 'プロジェクト']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#faq-main-7',
    '@type': 'WebPageElement',
    name: '導入後サポート体制FAQ（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['サポート体制', '24時間監視', '月次レポート', '定期メンテナンス', '機能追加'],
    relatedTo: ['https://nands.tech/contact#support', 'https://nands.tech/faq#support'],
    mentions: ['サポート', '24時間', 'メンテナンス', 'レポート']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/#faq-main-8',
    '@type': 'WebPageElement',
    name: 'セキュリティ対策FAQ（メインページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['セキュリティ対策', 'AES-256暗号化', '多要素認証', 'アクセス制御', 'データ保護'],
    relatedTo: ['https://nands.tech/security#measures', 'https://nands.tech/faq#security'],
    mentions: ['セキュリティ', '暗号化', '認証', 'データ保護']
  } as ServiceEntity,

  // 🆕 /faqページFAQ Fragment IDエンティティ（26個追加 - レリバンスエンジニアリング強化）
  // AI・テクノロジーサービス（5個）
  {
    '@id': 'https://nands.tech/faq#faq-tech-1',
    '@type': 'WebPageElement',
    name: 'AI技術FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AI技術', 'OpenAI GPT-4', 'Claude', 'Gemini', 'RAG', '自然言語処理', '画像認識', '音声処理'],
    relatedTo: ['https://nands.tech/ai-agents#service', 'https://nands.tech/faq#tech'],
    mentions: ['OpenAI', 'Claude', 'Gemini', 'RAG', 'AI技術']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-tech-2',
    '@type': 'WebPageElement',
    name: 'システム連携FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['システム連携', 'REST API', 'GraphQL', 'Webhook', 'CRM', 'ERP', 'Microsoft 365', 'Google Workspace', 'Salesforce'],
    relatedTo: ['https://nands.tech/system-development#service', 'https://nands.tech/faq#tech'],
    mentions: ['API', 'システム連携', 'Microsoft 365', 'Google Workspace', 'Salesforce']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-tech-3',
    '@type': 'WebPageElement',
    name: 'セキュリティ対策FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['セキュリティ対策', 'ISO27001', 'データ暗号化', 'AES-256', 'アクセス制御', 'GDPR', '個人情報保護法'],
    relatedTo: ['https://nands.tech/system-development#security', 'https://nands.tech/faq#tech'],
    mentions: ['ISO27001', 'セキュリティ', 'GDPR', '個人情報保護']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-tech-4',
    '@type': 'WebPageElement',
    name: 'AIモデルカスタマイズFAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIモデルカスタマイズ', 'ファインチューニング', 'プロンプトエンジニアリング', '医療AI', '法務AI', '製造業AI'],
    relatedTo: ['https://nands.tech/ai-agents#customization', 'https://nands.tech/faq#tech'],
    mentions: ['ファインチューニング', 'プロンプトエンジニアリング', '専門AI', 'カスタマイズ']
  } as ServiceEntity,

  
  // 料金・契約（4個）
  {
    '@id': 'https://nands.tech/faq#faq-pricing-1',
    '@type': 'WebPageElement',
    name: '料金体系FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['料金体系', '個別見積もり', '初期開発費用', '月額運用費用', '従量課金', '無料相談'],
    relatedTo: ['https://nands.tech/contact#pricing', 'https://nands.tech/faq#pricing'],
    mentions: ['料金体系', '見積もり', '無料相談', 'コスト']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-pricing-2',
    '@type': 'WebPageElement',
    name: '契約期間FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['契約期間', '最小契約期間', 'PoC', '概念実証', '短期契約', '柔軟対応'],
    relatedTo: ['https://nands.tech/contact#contract', 'https://nands.tech/faq#pricing'],
    mentions: ['契約期間', 'PoC', '概念実証', '柔軟対応']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-pricing-3',
    '@type': 'WebPageElement',
    name: '追加機能開発費用FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['追加機能開発', '開発工数', '個別見積もり', '月額保守契約', '機能拡張', '柔軟対応'],
    relatedTo: ['https://nands.tech/system-development#additional', 'https://nands.tech/faq#pricing'],
    mentions: ['追加機能', '開発工数', '機能拡張', '保守契約']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-pricing-4',
    '@type': 'WebPageElement',
    name: '支払い方法FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['支払い方法', '銀行振込', 'クレジットカード決済', '自動引き落とし', '分割払い', '着手金'],
    relatedTo: ['https://nands.tech/contact#payment', 'https://nands.tech/faq#pricing'],
    mentions: ['支払い方法', '銀行振込', 'クレジットカード', '分割払い']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-pricing-5',
    '@type': 'WebPageElement',
    name: 'PoC概念実証FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['PoC', '概念実証', 'プロトタイプ', 'スモールスタート', 'リスク軽減', '段階的導入'],
    relatedTo: ['https://nands.tech/contact#consultation', 'https://nands.tech/faq#pricing'],
    mentions: ['PoC', '概念実証', 'プロトタイプ', 'スモールスタート']
  } as ServiceEntity,
  
  // サポート・導入（4個）
  {
    '@id': 'https://nands.tech/faq#faq-support-1',
    '@type': 'WebPageElement',
    name: '導入期間FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['導入期間', 'チャットボット開発', 'AIシステム開発', '要件定義', '設計', '開発', 'テスト', 'リリース'],
    relatedTo: ['https://nands.tech/chatbot-development#timeline', 'https://nands.tech/faq#support'],
    mentions: ['導入期間', 'チャットボット', 'AIシステム', '開発工程']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-support-2',
    '@type': 'WebPageElement',
    name: 'オンサイト導入支援FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['オンサイト導入支援', 'システム設置', '初期設定', '操作研修', '運用開始支援', 'リモートサポート'],
    relatedTo: ['https://nands.tech/contact#onsite', 'https://nands.tech/faq#support'],
    mentions: ['オンサイト', '導入支援', '操作研修', 'リモートサポート']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-support-3',
    '@type': 'WebPageElement',
    name: 'トレーニング研修FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['トレーニング研修', '操作研修', 'AI活用研修', '技術者向けトレーニング', 'オンライン研修', '録画資料'],
    relatedTo: ['https://nands.tech/reskilling#training', 'https://nands.tech/faq#support'],
    mentions: ['トレーニング', '操作研修', 'AI活用研修', 'オンライン研修']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-support-4',
    '@type': 'WebPageElement',
    name: '24時間サポートFAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['24時間サポート', 'プレミアムサポート', '障害対応', 'システム監視', 'パフォーマンス最適化', 'ミッションクリティカル'],
    relatedTo: ['https://nands.tech/contact#premium', 'https://nands.tech/faq#support'],
    mentions: ['24時間サポート', 'プレミアムサポート', '障害対応', 'システム監視']
  } as ServiceEntity,
  
  // 人材・研修（4個）
  {
    '@id': 'https://nands.tech/faq#faq-hr-1',
    '@type': 'WebPageElement',
    name: 'AI人材育成FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AI人材育成', 'AIリテラシー研修', 'データサイエンティスト育成', 'AI開発者研修', '段階的カリキュラム'],
    relatedTo: ['https://nands.tech/hr-solutions#ai-training', 'https://nands.tech/faq#hr'],
    mentions: ['AI人材育成', 'データサイエンティスト', 'AIリテラシー', '人材研修']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-hr-2',
    '@type': 'WebPageElement',
    name: 'リスキリング研修内容FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['リスキリング研修', 'デジタルスキル', 'AI機械学習', 'データ分析', 'プログラミング基礎', '助成金活用'],
    relatedTo: ['https://nands.tech/reskilling#curriculum', 'https://nands.tech/faq#hr'],
    mentions: ['リスキリング', 'デジタルスキル', '助成金', 'プログラミング']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-hr-3',
    '@type': 'WebPageElement',
    name: '研修形式FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['研修形式', 'オンライン研修', '対面研修', 'ハイブリッド研修', 'ライブセッション', 'ハンズオン実習', 'グループワーク'],
    relatedTo: ['https://nands.tech/reskilling#format', 'https://nands.tech/faq#hr'],
    mentions: ['オンライン研修', '対面研修', 'ハイブリッド', 'ハンズオン実習']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-hr-4',
    '@type': 'WebPageElement',
    name: '研修効果測定FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['研修効果測定', 'スキルアセスメント', '実習課題評価', '修了テスト', '実務適用度調査', 'フォローアップ'],
    relatedTo: ['https://nands.tech/reskilling#assessment', 'https://nands.tech/faq#hr'],
    mentions: ['効果測定', 'スキルアセスメント', '実習課題', 'フォローアップ']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-hr-5',
    '@type': 'WebPageElement',
    name: '助成金活用FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['助成金活用', '人材開発支援助成金', 'IT導入補助金', 'DX推進補助金', '申請サポート', '書類作成支援'],
    relatedTo: ['https://nands.tech/reskilling#subsidy', 'https://nands.tech/faq#hr'],
    mentions: ['助成金', '人材開発支援助成金', 'IT導入補助金', '申請サポート']
  } as ServiceEntity,
  
  // マーケティング・AIO（4個）
  {
    '@id': 'https://nands.tech/faq#faq-marketing-1',
    '@type': 'WebPageElement',
    name: 'AIO対策定義FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIO対策', 'AI Optimization', 'ChatGPT', 'Claude', 'Perplexity', 'AI検索エンジン', '構造化データ', '技術実装'],
    relatedTo: ['https://nands.tech/aio-seo#definition', 'https://nands.tech/faq#marketing'],
    mentions: ['AIO対策', 'ChatGPT', 'Claude', 'Perplexity', 'AI検索']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-marketing-2',
    '@type': 'WebPageElement',
    name: 'SEO違いFAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['SEO違い', 'Googleアルゴリズム', 'AI言語モデル', 'Fragment ID', 'エンティティ関係性', 'セマンティック最適化'],
    relatedTo: ['https://nands.tech/aio-seo#comparison', 'https://nands.tech/faq#marketing'],
    mentions: ['SEO', 'Googleアルゴリズム', 'Fragment ID', 'セマンティック最適化']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-marketing-3',
    '@type': 'WebPageElement',
    name: '効果測定FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['効果測定', 'AI検索引用回数', 'ブランド言及頻度', 'トラフィック分析', 'コンバージョン率', 'KPI設定', '競合分析'],
    relatedTo: ['https://nands.tech/aio-seo#analytics', 'https://nands.tech/faq#marketing'],
    mentions: ['効果測定', '引用回数', 'トラフィック分析', 'KPI', '競合分析']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-marketing-4',
    '@type': 'WebPageElement',
    name: '効果発現期間FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['効果発現期間', '初期効果', '本格的効果', '業界差', 'コンテンツ品質', '競合状況', '継続最適化'],
    relatedTo: ['https://nands.tech/aio-seo#timeline', 'https://nands.tech/faq#marketing'],
    mentions: ['効果期間', '初期効果', '継続最適化', '業界差']
  } as ServiceEntity,
  
  // AIサイト・ブランディング（5個）
  {
    '@id': 'https://nands.tech/faq#faq-ai-site-1',
    '@type': 'WebPageElement',
    name: 'AIサイト定義FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIサイト定義', 'AI引用', 'ChatGPT', 'Claude', 'Perplexity', 'あなたの会社', 'コンテンツ引用', 'AI検索エンジン'],
    relatedTo: ['https://nands.tech/ai-site#definition', 'https://nands.tech/faq#ai-site'],
    mentions: ['AIサイト', 'AI引用', 'ChatGPT', 'Claude', 'Perplexity', 'あなたの会社']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-ai-site-2',
    '@type': 'WebPageElement',
    name: 'AIサイト特徴FAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIサイト特徴', 'Fragment ID実装', '構造化データ最適化', 'Mike King理論', 'AI引用最適化', 'あなたのサイト'],
    relatedTo: ['https://nands.tech/ai-site#features', 'https://nands.tech/faq#ai-site'],
    mentions: ['Fragment ID', 'Mike King', 'AI引用最適化', 'あなたのサイト']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-ai-site-3',
    '@type': 'WebPageElement',
    name: 'AIサイトメリットFAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIサイトメリット', 'AI検索引用率向上', 'デジタル資産化', 'ブランド認知度向上', 'あなたの会社', '信頼性向上'],
    relatedTo: ['https://nands.tech/ai-site#benefits', 'https://nands.tech/faq#ai-site'],
    mentions: ['AI検索引用', 'デジタル資産', 'ブランド認知度', 'あなたの会社', '信頼性']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-ai-site-4',
    '@type': 'WebPageElement',
    name: '他社AIサイト違いFAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['他社AIサイト違い', '真のAIサイト', 'AI技術サイト', 'レリバンスエンジニアリング', 'あなたのサイト', '引用精度向上'],
    relatedTo: ['https://nands.tech/ai-site#comparison', 'https://nands.tech/faq#ai-site'],
    mentions: ['真のAIサイト', 'レリバンスエンジニアリング', 'あなたのサイト', '引用精度']
  } as ServiceEntity,
  {
    '@id': 'https://nands.tech/faq#faq-ai-site-5',
    '@type': 'WebPageElement',
    name: 'AIサイト化プロセスFAQ（/faqページFragment ID）',
    serviceType: 'FragmentAnchor',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: ['AIサイト化プロセス', 'AI引用最適化', 'Fragment ID実装', '構造化データ統合', 'Mike King理論適用', 'あなたの既存サイト'],
    relatedTo: ['https://nands.tech/ai-site#process', 'https://nands.tech/faq#ai-site'],
    mentions: ['AIサイト化', 'Fragment ID実装', 'Mike King理論', 'あなたの既存サイト']
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
  // 🆕 aboutページ新Fragment IDエンティティ（6個追加）
  {
    '@id': 'https://nands.tech/about#hero',
    '@type': 'AboutPage',
    name: 'NANDS - Business Concept - メインビジュアル',
    pageType: 'HeroSection',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'NANDS',
      'Business Concept',
      '全ての働く人を次のステージへ',
      'AI技術で働く人の次のステージを支援',
      '企業ビジョン',
      'メインメッセージ',
      '企業理念',
      'ブランドコンセプト'
    ],
    relatedTo: [
      'https://nands.tech/about#mission-vision',
      'https://nands.tech/about#company-message',
      'https://nands.tech/#organization'
    ],
    mentions: [
      'NANDS',
      'Business Concept',
      '次のステージ',
      'AI技術',
      '働く人'
    ]
  },
  {
    '@id': 'https://nands.tech/about#mission-vision',
    '@type': 'AboutPage',
    name: 'Mission & Vision - 企業使命とビジョン',
    pageType: 'MissionVision',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Mission',
      'Vision',
      '働く人々の可能性を解放し',
      'キャリアの新たな地平を切り拓く',
      '2030年',
      '日本の働き方を革新する',
      'リーディングカンパニーへ',
      'キャリア革新',
      '企業変革',
      '社会貢献',
      'キャリアトランスフォーメーション',
      'デジタルトランスフォーメーション',
      'AIリテラシ向上',
      'グローバル競争力'
    ],
    relatedTo: [
      'https://nands.tech/about#hero',
      'https://nands.tech/about#enterprise-ai',
      'https://nands.tech/#organization'
    ],
    mentions: [
      'Mission',
      'Vision',
      '2030年',
      'リーディングカンパニー',
      'DX推進',
      'AI活用'
    ]
  },
  {
    '@id': 'https://nands.tech/about#enterprise-ai',
    '@type': 'AboutPage',
    name: 'Enterprise AI Solutions - 企業向けAIソリューション',
    pageType: 'EnterpriseAI',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Enterprise AI Solutions',
      'AI導入コンサルティング',
      '企業向けAI研修プログラム',
      'AI組織構築支援',
      'AI活用戦略の策定',
      '業務プロセスの分析・改善',
      'ROI評価とコスト最適化',
      '経営者向けAI戦略研修',
      '実務者向けAIツール活用研修',
      '開発者向け技術研修',
      'AI人材の採用支援',
      '組織体制の設計',
      '社内AI活用推進体制の構築',
      '導入実績・成果',
      '滋賀拠点エリア',
      '2008年設立年',
      '全国サービス展開'
    ],
    relatedTo: [
      'https://nands.tech/about#mission-vision',
      'https://nands.tech/about#business',
      'https://nands.tech/ai-agents#service',
      'https://nands.tech/system-development#service'
    ],
    mentions: [
      'AI導入コンサルティング',
      '企業向けAI研修',
      'AI組織構築',
      'ROI評価',
      'AI戦略',
      'AI人材育成'
    ]
  },
  {
    '@id': 'https://nands.tech/about#business',
    '@type': 'AboutPage',
    name: 'Business - 事業内容',
    pageType: 'BusinessOverview',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Business',
      'キャリア変革支援事業',
      '生成AI活用リスキリング研修',
      'キャリアコンサルティング',
      'キャリアサポート事業',
      '退職支援事業「退職あんしん代行」',
      'システム開発事業',
      'SNSコンサル事業',
      'メディア運営事業',
      '事業コンセプト',
      'キャリアの新たな地平を切り拓く',
      '実践的なスキル開発支援',
      '個々のニーズに寄り添った丁寧なキャリア支援',
      '安心・確実な転職・退職プロセスのサポート'
    ],
    relatedTo: [
      'https://nands.tech/about#enterprise-ai',
      'https://nands.tech/about#company-message',
      'https://nands.tech/reskilling#service',
      'https://nands.tech/system-development#service'
    ],
    mentions: [
      'リスキリング研修',
      'キャリアコンサルティング',
      '退職支援',
      'システム開発',
      'SNSコンサル',
      'メディア運営'
    ]
  },
  {
    '@id': 'https://nands.tech/about#company-message',
    '@type': 'AboutPage',
    name: 'Company & Message - 会社概要・代表メッセージ',
    pageType: 'CompanyMessage',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Company',
      'Message',
      '株式会社エヌアンドエス',
      '原田 賢治',
      '代表取締役',
      '2008年4月設立',
      '本社',
      '〒520-0025 滋賀県大津市皇子ヶ丘２丁目１０番２５−３００４号',
      '東京支社',
      '〒150-0043 東京都渋谷区道玄坂１丁目１０番８号渋谷道玄坂東急ビル2F-C',
      '生成AI活用リスキリング研修事業',
      'キャリアコンサルティング事業',
      'システム開発事業',
      '退職支援事業',
      'SNSコンサル事業',
      'メディア運営事業',
      'contact@nands.tech',
      '0120-407-638',
      '寄り添い続ける！',
      '代表メッセージ',
      'テクノロジーの進化と人間味のあるサポート'
    ],
    relatedTo: [
      'https://nands.tech/about#business',
      'https://nands.tech/about#history-access',
      'https://nands.tech/corporate#company',
      'https://nands.tech/#organization'
    ],
    mentions: [
      '株式会社エヌアンドエス',
      '原田賢治',
      '2008年設立',
      '滋賀県大津市',
      '東京支社',
      '代表メッセージ',
      '寄り添い続ける'
    ]
  },
  {
    '@id': 'https://nands.tech/about#history-access',
    '@type': 'AboutPage',
    name: 'History & Access - 企業沿革・アクセス情報',
    pageType: 'HistoryAccess',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'History',
      'Access',
      '企業沿革',
      'アクセス情報',
      '2008年4月株式会社エヌアンドエス設立',
      'デジタルマーケティング事業進出',
      '人材育成事業本格開始',
      '転職サポート事業開始',
      '事業方針刷新',
      'AIコンサルティング事業開始',
      'メディア・SNS事業開始',
      'AI事業本部設立',
      '退職支援事業開始',
      '本社',
      '〒520-0025 滋賀県大津市皇子が丘２丁目10−25−3004号',
      'NANDSTECH',
      'AI・テクノロジー',
      'マーケティング・支援',
      'リスキリング・企業情報',
      '無料相談・お問い合わせ',
      'contact@nands.tech',
      '0120-407-638'
    ],
    relatedTo: [
      'https://nands.tech/about#company-message',
      'https://nands.tech/about#hero',
      'https://nands.tech/corporate#company',
      'https://nands.tech/#organization'
    ],
    mentions: [
      '企業沿革',
      '2008年設立',
      'デジタルマーケティング',
      'AIコンサルティング',
      'AI事業本部',
      '滋賀県大津市',
      'NANDSTECH'
    ]
  },

  // 🆕 SNS統合Fragment IDエンティティ（2個追加）
  {
    '@id': 'https://nands.tech/about#company-official-x',
    '@type': 'AboutPage',
    name: '公式SNS - X (Twitter)アカウント',
    pageType: 'SocialMediaSection',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '@NANDS_AI',
      '公式Xアカウント',
      'AI技術動向',
      'サービス情報',
      '業界インサイト',
      'レリバンスエンジニアリング発信',
      'Mike King理論解説',
      'AI検索最適化情報',
      'Fragment ID活用',
      'AI引用精度向上',
      'リスキリング研修案内',
      '企業公式発信'
    ],
    relatedTo: [
      'https://nands.tech/about#company-message',
      'https://nands.tech/about#representative-linkedin',
      'https://nands.tech/#organization',
      'https://x.com/NANDS_AI'
    ],
    mentions: [
      'X',
      'Twitter',
      '公式SNS',
      'NANDS_AI',
      'AI技術動向',
      'サービス情報',
      '業界インサイト',
      'レリバンスエンジニアリング',
      'Mike King理論'
    ]
  },

  {
    '@id': 'https://nands.tech/about#representative-linkedin',
    '@type': 'AboutPage',
    name: '代表LinkedIn - 原田賢治個人アカウント',
    pageType: 'PersonalSocialMediaSection',
    provider: { '@id': 'https://nands.tech/author/harada-kenji' },
    knowsAbout: [
      '原田賢治LinkedIn',
      'B2B専門性',
      '業界インサイト',
      '経営視点',
      'レリバンスエンジニアリング専門家',
      'AI検索最適化専門家',
      'Mike King理論実装者',
      '企業DX支援',
      '関西地域AI推進',
      'ビジネスネットワーキング',
      'AI時代キャリア戦略',
      'AIリテラシー向上',
      '実践的リスキリング研修',
      '企業経営者連携'
    ],
    relatedTo: [
      'https://nands.tech/about#company-message',
      'https://nands.tech/about#company-official-x',
      'https://nands.tech/author/harada-kenji',
      'https://nands.tech/#organization',
      'https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353/'
    ],
    mentions: [
      'LinkedIn',
      '原田賢治',
      '代表取締役',
      'B2B専門性',
      '業界インサイト',
      '経営視点',
      'レリバンスエンジニアリング',
      'AI検索最適化',
      '企業DX',
      '関西地域'
    ]
  },
  {
    '@id': 'https://nands.tech/reviews#company',
    '@type': 'WebPage', // ReviewPageはschema.orgに存在しない → WebPage使用
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
    '@type': 'WebPage', // FAQPageは2025年より政府・医療機関のみ → WebPage使用
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
      'https://nands.tech/reviews#company',
      'https://nands.tech/legal#legal-header'
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

  // 法的情報ページ - ヘッダー
  {
    '@id': 'https://nands.tech/legal#legal-header',
    '@type': 'AboutPage',
    name: '法的情報 - ヘッダー',
    pageType: 'LegalInformation',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '法的情報',
      '特定商取引法表記',
      'コンプライアンス',
      '透明性の高い企業経営',
      'Trust Layer',
      '法的文書管理'
    ],
    relatedTo: [
      'https://nands.tech/legal#legal-compliance',
      'https://nands.tech/privacy#privacy-header',
      'https://nands.tech/terms#terms-header'
    ],
    mentions: [
      '法的情報',
      '株式会社エヌアンドエス',
      '特定商取引法',
      'コンプライアンス',
      '透明性'
    ]
  },

  // 法的情報ページ - 法令遵守
  {
    '@id': 'https://nands.tech/legal#legal-compliance',
    '@type': 'AboutPage', 
    name: '法的情報 - 法令遵守',
    pageType: 'LegalInformation',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '法令遵守',
      'コンプライアンス体制',
      '社会的責任',
      '適用法令',
      '社会規範',
      'コンプライアンス維持'
    ],
    relatedTo: [
      'https://nands.tech/legal#legal-header',
      'https://nands.tech/privacy#privacy-compliance',
      'https://nands.tech/terms#terms-usage'
    ],
    mentions: [
      '法令遵守',
      '社会的責任',
      'コンプライアンス体制',
      '規則遵守',
      '社会規範'
    ]
  },

  // プライバシーポリシーページ - ヘッダー
  {
    '@id': 'https://nands.tech/privacy#privacy-header',
    '@type': 'AboutPage',
    name: 'プライバシーポリシー - ヘッダー',
    pageType: 'PrivacyPolicy',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'プライバシーポリシー',
      '個人情報保護',
      'AI・DX時代の個人情報管理',
      '安心・安全',
      '個人情報保護方針',
      '最終更新日'
    ],
    relatedTo: [
      'https://nands.tech/privacy#privacy-policy',
      'https://nands.tech/terms#terms-header',
      'https://nands.tech/legal#legal-header'
    ],
    mentions: [
      'プライバシーポリシー',
      '個人情報保護',
      'AI・DX時代',
      '株式会社エヌアンドエス',
      '個人情報保護方針'
    ]
  },

  // プライバシーポリシーページ - 基本方針
  {
    '@id': 'https://nands.tech/privacy#privacy-policy',
    '@type': 'AboutPage',
    name: 'プライバシーポリシー - 基本方針',
    pageType: 'PrivacyPolicy',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '個人情報保護基本方針',
      '法令遵守',
      '個人情報の安全管理',
      '開示・訂正・削除',
      'Cookie使用',
      '外部サイトリンク',
      '個人情報保護法',
      '適正な取得・利用・管理'
    ],
    relatedTo: [
      'https://nands.tech/privacy#privacy-header',
      'https://nands.tech/privacy#privacy-compliance',
      'https://nands.tech/privacy#privacy-security'
    ],
    mentions: [
      '個人情報保護法',
      '関連法令',
      '適正な個人情報取扱い',
      '安全管理',
      'Cookie利用'
    ]
  },

  // プライバシーポリシーページ - 法令遵守
  {
    '@id': 'https://nands.tech/privacy#privacy-compliance',
    '@type': 'AboutPage',
    name: 'プライバシーポリシー - 法令遵守',
    pageType: 'PrivacyPolicy',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '個人情報保護法',
      '関連政省令',
      'ガイドライン',
      '関係法令遵守',
      '適正な個人情報取得',
      '適正な個人情報利用',
      '適正な個人情報管理',
      '適正な個人情報提供'
    ],
    relatedTo: [
      'https://nands.tech/privacy#privacy-policy',
      'https://nands.tech/privacy#privacy-security',
      'https://nands.tech/legal#legal-compliance'
    ],
    mentions: [
      '個人情報保護法',
      '政省令',
      'ガイドライン',
      '法令遵守',
      '適正取扱い'
    ]
  },

  // プライバシーポリシーページ - 安全管理
  {
    '@id': 'https://nands.tech/privacy#privacy-security',
    '@type': 'AboutPage',
    name: 'プライバシーポリシー - 安全管理',
    pageType: 'PrivacyPolicy',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '個人情報安全管理',
      '漏洩防止',
      '滅失防止',
      '毀損防止',
      '不正アクセス防止',
      '技術的安全管理措置',
      '組織的安全管理措置',
      '従業員教育',
      '継続的改善'
    ],
    relatedTo: [
      'https://nands.tech/privacy#privacy-compliance',
      'https://nands.tech/privacy#privacy-disclosure',
      'https://nands.tech/privacy#privacy-cookies'
    ],
    mentions: [
      '安全管理措置',
      '漏洩防止',
      '不正アクセス防止',
      '従業員周知',
      '継続改善'
    ]
  },

  // プライバシーポリシーページ - 開示・訂正・削除
  {
    '@id': 'https://nands.tech/privacy#privacy-disclosure',
    '@type': 'AboutPage',
    name: 'プライバシーポリシー - 開示・訂正・削除',
    pageType: 'PrivacyPolicy',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '個人情報開示',
      '個人情報訂正',
      '個人情報追加',
      '個人情報削除',
      '利用停止',
      '消去',
      '本人確認',
      '法令に基づく対応'
    ],
    relatedTo: [
      'https://nands.tech/privacy#privacy-security',
      'https://nands.tech/privacy#privacy-cookies',
      'https://nands.tech/terms#terms-usage'
    ],
    mentions: [
      '開示請求',
      '訂正請求',
      '削除請求',
      '本人確認',
      '法令対応'
    ]
  },

  // プライバシーポリシーページ - Cookie使用
  {
    '@id': 'https://nands.tech/privacy#privacy-cookies',
    '@type': 'AboutPage',
    name: 'プライバシーポリシー - Cookie使用',
    pageType: 'PrivacyPolicy',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'Cookie使用',
      '利用者利便性向上',
      '利用状況分析',
      'サービス改善',
      'ブラウザ設定',
      'Cookie制限',
      'Cookie拒否'
    ],
    relatedTo: [
      'https://nands.tech/privacy#privacy-disclosure',
      'https://nands.tech/privacy#privacy-policy',
      'https://nands.tech/terms#terms-usage'
    ],
    mentions: [
      'Cookie',
      'ブラウザ設定',
      '利用状況分析',
      'サービス改善',
      '利便性向上'
    ]
  },

  // 利用規約ページ - ヘッダー
  {
    '@id': 'https://nands.tech/terms#terms-header',
    '@type': 'AboutPage',
    name: '利用規約 - ヘッダー',
    pageType: 'TermsOfService',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      '利用規約',
      'サービス利用規約',
      'AI研修サービス',
      'DX支援サービス',
      'キャリア支援サービス',
      '利用条件',
      '禁止事項',
      '責任制限'
    ],
    relatedTo: [
      'https://nands.tech/terms#terms-usage',
      'https://nands.tech/privacy#privacy-header',
      'https://nands.tech/legal#legal-header'
    ],
    mentions: [
      '利用規約',
      '株式会社エヌアンドエス',
      'AI研修',
      'DX支援',
      'キャリア支援'
    ]
  },

  // 利用規約ページ - 利用条件
  {
    '@id': 'https://nands.tech/terms#terms-usage',
    '@type': 'AboutPage',
    name: '利用規約 - 利用条件',
    pageType: 'TermsOfService',
    provider: { '@id': 'https://nands.tech/#organization' },
    knowsAbout: [
      'サービス利用条件',
      'AI研修利用条件',
      'DX支援利用条件',
      'キャリア支援利用条件',
      '利用者義務',
      '禁止行為',
      '適正利用',
      '基本条件'
    ],
    relatedTo: [
      'https://nands.tech/terms#terms-header',
      'https://nands.tech/privacy#privacy-policy',
      'https://nands.tech/legal#legal-compliance'
    ],
    mentions: [
      '利用条件',
      '利用者義務',
      '禁止事項',
      'AI研修利用',
      'DX支援利用'
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