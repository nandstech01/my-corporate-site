/**
 * AI検索エンジン最適化システム
 * knowsAbout詳細化・mentions関連エンティティ・Fragment ID連携
 * 
 * 対象AI検索エンジン:
 * - ChatGPT (3.8B users)
 * - Perplexity (99.5M users) 
 * - Claude/Anthropic
 * - Gemini/Bard
 * - DeepSeek (280M users)
 */

import { 
  ORGANIZATION_ENTITY, 
  SERVICE_ENTITIES,
  type EntityRelationship 
} from './entity-relationships';
import {
  generateEnhancedPotentialActions,
  generateEnhancedAdditionalTypes,
  generateEnhancedSameAs,
  type PotentialActionSchema
} from './schema-org-latest';

// =============================================================================
// AI検索エンジン最適化の型定義
// =============================================================================

/**
 * 専門知識の詳細化スキーマ
 */
export interface DetailedKnowsAbout {
  /** 専門分野・技術名 */
  subject: string;
  
  /** 専門度レベル (1-5: 基礎-専門家) */
  expertiseLevel: 1 | 2 | 3 | 4 | 5;
  
  /** カテゴリ分類 */
  category: 'technology' | 'methodology' | 'domain' | 'tool' | 'framework' | 'concept';
  
  /** 関連するエンティティID */
  relatedEntities: string[];
  
  /** 実務経験年数 */
  experienceYears?: number;
  
  /** 認定・資格レベル */
  certificationLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  
  /** 同義語・関連用語 */
  synonyms: string[];
  
  /** 技術スタック・関連技術 */
  relatedTechnologies?: string[];
  
  /** Fragment ID (ページ内セクション参照) */
  fragmentId?: string;
}

/**
 * 関連エンティティ明示スキーマ
 */
export interface DetailedMentions {
  /** エンティティ名 */
  entity: string;
  
  /** エンティティタイプ */
  entityType: 'Technology' | 'Methodology' | 'Organization' | 'Person' | 'Product' | 'Service' | 'Concept' | 'LegalDocument' | 'Policy' | 'Compliance' | 'SecurityMeasure' | 'Terms';
  
  /** 言及の文脈・関係性 */
  context: 'implements' | 'uses' | 'integrates' | 'optimizes' | 'teaches' | 'provides' | 'collaborates' | 'ensures' | 'defines' | 'specifies' | 'maintains';
  
  /** 重要度スコア (1-10) */
  importance: number;
  
  /** Fragment ID (言及箇所への参照) */
  fragmentId?: string;
  
  /** 関連するknowsAbout項目 */
  relatedKnowledge: string[];
  
  /** AI検索での検索意図マッチング */
  searchIntents: string[];
  
  /** 共起語・関連語 */
  coOccurringTerms: string[];
}

/**
 * AI検索最適化Fragment ID
 */
export interface AIOptimizedFragmentId {
  /** Fragment ID */
  id: string;
  
  /** セクション名 */
  sectionName: string;
  
  /** AI検索クエリ対応 */
  targetQueries: string[];
  
  /** 含まれるエンティティ */
  entities: DetailedMentions[];
  
  /** セマンティック重要度 */
  semanticWeight: number;
  
  /** 階層レベル (h1=1, h2=2, etc.) */
  hierarchyLevel: number;
  
  /** 関連Fragment IDs */
  relatedFragments: string[];
}

/**
 * AI検索エンジン別最適化設定
 */
export interface AISearchEngineConfig {
  engineName: 'ChatGPT' | 'Perplexity' | 'Claude' | 'Gemini' | 'DeepSeek';
  
  /** 推奨knowsAbout項目数 */
  recommendedKnowsAboutCount: number;
  
  /** 推奨mentions項目数 */
  recommendedMentionsCount: number;
  
  /** 専門度重視レベル */
  expertiseFocus: 'breadth' | 'depth' | 'balanced';
  
  /** エンティティ関係性重視度 */
  entityRelationshipWeight: number;
  
  /** Fragment ID活用度 */
  fragmentIdUtilization: 'minimal' | 'moderate' | 'extensive';
}

// =============================================================================
// AI検索エンジン別設定
// =============================================================================

export const AI_SEARCH_ENGINE_CONFIGS: Record<string, AISearchEngineConfig> = {
  ChatGPT: {
    engineName: 'ChatGPT',
    recommendedKnowsAboutCount: 25,
    recommendedMentionsCount: 15,
    expertiseFocus: 'depth',
    entityRelationshipWeight: 0.8,
    fragmentIdUtilization: 'extensive'
  },
  Perplexity: {
    engineName: 'Perplexity',
    recommendedKnowsAboutCount: 20,
    recommendedMentionsCount: 12,
    expertiseFocus: 'balanced',
    entityRelationshipWeight: 0.9,
    fragmentIdUtilization: 'extensive'
  },
  Claude: {
    engineName: 'Claude',
    recommendedKnowsAboutCount: 30,
    recommendedMentionsCount: 18,
    expertiseFocus: 'depth',
    entityRelationshipWeight: 0.85,
    fragmentIdUtilization: 'extensive'
  },
  Gemini: {
    engineName: 'Gemini',
    recommendedKnowsAboutCount: 22,
    recommendedMentionsCount: 14,
    expertiseFocus: 'breadth',
    entityRelationshipWeight: 0.7,
    fragmentIdUtilization: 'moderate'
  },
  DeepSeek: {
    engineName: 'DeepSeek',
    recommendedKnowsAboutCount: 18,
    recommendedMentionsCount: 10,
    expertiseFocus: 'balanced',
    entityRelationshipWeight: 0.75,
    fragmentIdUtilization: 'moderate'
  }
};

// =============================================================================
// 詳細化knowsAboutデータ
// =============================================================================

export const DETAILED_KNOWS_ABOUT_ORGANIZATION: DetailedKnowsAbout[] = [
  // AI・機械学習領域
  {
    subject: 'レリバンスエンジニアリング',
    expertiseLevel: 5,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/aio-seo#service'],
    experienceYears: 3,
    certificationLevel: 'expert',
    synonyms: ['Relevance Engineering', 'RE', 'AI検索最適化手法'],
    relatedTechnologies: ['Mike King理論', 'GEO', 'AIO対策'],
    fragmentId: 'relevance-engineering-expertise'
  },
  {
    subject: 'RAG（Retrieval-Augmented Generation）',
    expertiseLevel: 5,
    category: 'technology',
    relatedEntities: ['https://nands.tech/vector-rag#service'],
    experienceYears: 2,
    certificationLevel: 'expert',
    synonyms: ['Retrieval-Augmented Generation', 'ベクトル検索', '文書検索AI'],
    relatedTechnologies: ['LangChain', 'Pinecone', 'OpenAI Embeddings', 'Chroma'],
    fragmentId: 'rag-technology-expertise'
  },
  {
    subject: 'Model Context Protocol (MCP)',
    expertiseLevel: 4,
    category: 'framework',
    relatedEntities: ['https://nands.tech/mcp-servers#service'],
    experienceYears: 1,
    certificationLevel: 'advanced',
    synonyms: ['MCP', 'Model Context Protocol', 'Claude連携'],
    relatedTechnologies: ['Claude Desktop', 'Cursor IDE', 'Anthropic'],
    fragmentId: 'mcp-framework-expertise'
  },
  {
    subject: 'Mastra Framework',
    expertiseLevel: 4,
    category: 'framework',
    relatedEntities: ['https://nands.tech/ai-agents#service'],
    experienceYears: 1,
    certificationLevel: 'advanced',
    synonyms: ['Mastra', 'AIエージェントフレームワーク'],
    relatedTechnologies: ['TypeScript', 'Node.js', 'LLM統合'],
    fragmentId: 'mastra-framework-expertise'
  },
  
  // システム開発領域
  {
    subject: 'Next.js',
    expertiseLevel: 5,
    category: 'framework',
    relatedEntities: ['https://nands.tech/system-development#service'],
    experienceYears: 4,
    certificationLevel: 'expert',
    synonyms: ['Next.js', 'React Framework', 'Vercel'],
    relatedTechnologies: ['React', 'TypeScript', 'Vercel', 'App Router'],
    fragmentId: 'nextjs-development-expertise'
  },
  {
    subject: 'TypeScript',
    expertiseLevel: 5,
    category: 'technology',
    relatedEntities: ['https://nands.tech/system-development#service'],
    experienceYears: 5,
    certificationLevel: 'expert',
    synonyms: ['TypeScript', 'TS', '型安全プログラミング'],
    relatedTechnologies: ['JavaScript', 'Node.js', 'React', 'Next.js'],
    fragmentId: 'typescript-expertise'
  },
  {
    subject: 'Supabase',
    expertiseLevel: 4,
    category: 'tool',
    relatedEntities: ['https://nands.tech/system-development#service'],
    experienceYears: 2,
    certificationLevel: 'advanced',
    synonyms: ['Supabase', 'BaaS', 'PostgreSQL'],
    relatedTechnologies: ['PostgreSQL', 'Authentication', 'Edge Functions'],
    fragmentId: 'supabase-expertise'
  },
  
  // SEO・マーケティング領域
  {
    subject: 'AIO対策（AI Overviews最適化）',
    expertiseLevel: 5,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/aio-seo#service'],
    experienceYears: 2,
    certificationLevel: 'expert',
    synonyms: ['AIO対策', 'AI Overviews', 'SGE対策', 'AI検索最適化'],
    relatedTechnologies: ['Schema.org', 'JSON-LD', '構造化データ'],
    fragmentId: 'aio-optimization-expertise'
  },
  {
    subject: 'Schema.org構造化データ',
    expertiseLevel: 5,
    category: 'technology',
    relatedEntities: ['https://nands.tech/aio-seo#service'],
    experienceYears: 6,
    certificationLevel: 'expert',
    synonyms: ['Schema.org', '構造化データ', 'JSON-LD', 'Microdata'],
    relatedTechnologies: ['JSON-LD', 'Rich Results', 'Knowledge Graph'],
    fragmentId: 'schema-org-expertise'
  },
  
  // 人材開発・研修領域
  {
    subject: 'プロンプトエンジニアリング',
    expertiseLevel: 4,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/reskilling#service'],
    experienceYears: 2,
    certificationLevel: 'advanced',
    synonyms: ['プロンプトエンジニアリング', 'Prompt Engineering', 'AI活用術'],
    relatedTechnologies: ['ChatGPT', 'Claude', 'LLM活用'],
    fragmentId: 'prompt-engineering-expertise'
  },
  {
    subject: 'IT講師・技術研修',
    expertiseLevel: 5,
    category: 'domain',
    relatedEntities: ['https://nands.tech/reskilling#service'],
    experienceYears: 10,
    certificationLevel: 'expert',
    synonyms: ['IT講師', '技術研修', 'リスキリング', '人材開発'],
    relatedTechnologies: ['研修カリキュラム', 'オンライン研修', '実践指導'],
    fragmentId: 'it-training-expertise'
  },
  
  // 🎬 YouTube動画制作・SNS戦略領域（🆕 4大AI検索エンジン最適化）
  {
    subject: 'YouTubeショート動画制作',
    expertiseLevel: 4,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/video-generation#service', 'https://nands.tech/sns-automation#service'],
    experienceYears: 2,
    certificationLevel: 'advanced',
    synonyms: ['YouTube Shorts', 'ショート動画', '短尺動画', 'バーティカル動画'],
    relatedTechnologies: ['動画編集', 'スクリプト生成', 'サムネイル最適化', 'エンゲージメント分析'],
    fragmentId: 'youtube-shorts-production-expertise'
  },
  {
    subject: 'YouTube中尺動画制作（130秒）',
    expertiseLevel: 4,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/video-generation#service', 'https://nands.tech/aio-seo#service'],
    experienceYears: 1,
    certificationLevel: 'advanced',
    synonyms: ['YouTube Medium', '中尺動画', '130秒動画', '解説動画', '教育型動画'],
    relatedTechnologies: ['VideoObject Schema', 'Fragment ID', 'hasPartスキーマ', 'associatedMedia', 'エンティティ統合'],
    fragmentId: 'youtube-medium-production-expertise'
  },
  {
    subject: 'hasPartスキーマ動画統合',
    expertiseLevel: 5,
    category: 'technology',
    relatedEntities: ['https://nands.tech/aio-seo#service', 'https://nands.tech/video-generation#service'],
    experienceYears: 1,
    certificationLevel: 'expert',
    synonyms: ['hasPart統合', '記事構成要素統合', 'マルチメディア統合', 'Schema.org hasPart'],
    relatedTechnologies: ['VideoObject', 'Fragment ID', 'isPartOf', 'エンティティリレーションシップ', 'Mike King理論'],
    fragmentId: 'haspart-video-integration-expertise'
  },
  {
    subject: 'associatedMedia動画統合',
    expertiseLevel: 5,
    category: 'technology',
    relatedEntities: ['https://nands.tech/aio-seo#service'],
    experienceYears: 1,
    certificationLevel: 'expert',
    synonyms: ['関連メディア統合', 'Schema.org associatedMedia', '記事メディア最適化'],
    relatedTechnologies: ['VideoObject Schema', 'E-E-A-T最適化', 'AI検索最適化', 'Google Rich Results'],
    fragmentId: 'associated-media-integration-expertise'
  },
  {
    subject: 'バイラルコンテンツ設計',
    expertiseLevel: 4,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/sns-automation#service', 'https://nands.tech/video-generation#service'],
    experienceYears: 2,
    certificationLevel: 'advanced',
    synonyms: ['バイラルマーケティング', 'コンテンツバイラル化', 'SNSバズ', 'エンゲージメント最適化'],
    relatedTechnologies: ['Hook設計', '感情トリガー', 'ストーリーテリング', 'データ分析'],
    fragmentId: 'viral-content-design-expertise'
  },
  {
    subject: 'マルチプラットフォームSNS戦略',
    expertiseLevel: 4,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/sns-automation#service'],
    experienceYears: 3,
    certificationLevel: 'advanced',
    synonyms: ['SNS戦略', 'ソーシャルメディア', 'クロスプラットフォーム', 'SNS自動化'],
    relatedTechnologies: ['X (Twitter)', 'Threads', 'LinkedIn', 'TikTok', 'YouTube'],
    fragmentId: 'multi-platform-sns-strategy-expertise'
  },
  {
    subject: 'AIコンテンツ生成自動化',
    expertiseLevel: 5,
    category: 'technology',
    relatedEntities: ['https://nands.tech/video-generation#service', 'https://nands.tech/sns-automation#service'],
    experienceYears: 2,
    certificationLevel: 'expert',
    synonyms: ['AI自動生成', 'コンテンツオートメーション', 'スクリプト生成', 'メタデータ最適化'],
    relatedTechnologies: ['GPT-4', 'OpenAI API', 'プロンプトエンジニアリング', 'RAG'],
    fragmentId: 'ai-content-generation-automation-expertise'
  },
  {
    subject: 'マルチモーダルコンテンツ最適化',
    expertiseLevel: 4,
    category: 'methodology',
    relatedEntities: ['https://nands.tech/aio-seo#service', 'https://nands.tech/video-generation#service'],
    experienceYears: 2,
    certificationLevel: 'advanced',
    synonyms: ['マルチモーダルAI', '動画+テキスト最適化', 'クロスメディア最適化'],
    relatedTechnologies: ['VideoObject Schema', 'Fragment ID', 'エンティティ統合', 'AI検索最適化'],
    fragmentId: 'multimodal-content-optimization-expertise'
  }
];

// =============================================================================
// 詳細化mentionsデータ
// =============================================================================

export const DETAILED_MENTIONS_ORGANIZATION: DetailedMentions[] = [
  // AI技術関連
  {
    entity: 'OpenAI GPT-4',
    entityType: 'Technology',
    context: 'integrates',
    importance: 9,
    fragmentId: 'openai-integration',
    relatedKnowledge: ['RAG（Retrieval-Augmented Generation）', 'プロンプトエンジニアリング'],
    searchIntents: ['ChatGPT 連携', 'GPT-4 システム開発', 'OpenAI API'],
    coOccurringTerms: ['API連携', 'LLM統合', 'AI自動化']
  },
  {
    entity: 'Anthropic Claude',
    entityType: 'Technology',
    context: 'integrates',
    importance: 8,
    fragmentId: 'claude-integration',
    relatedKnowledge: ['Model Context Protocol (MCP)', 'RAG（Retrieval-Augmented Generation）'],
    searchIntents: ['Claude 連携', 'Anthropic API', 'MCP 開発'],
    coOccurringTerms: ['Claude Desktop', 'MCP Server', 'AI Assistant']
  },
  {
    entity: 'Mike King',
    entityType: 'Person',
    context: 'implements',
    importance: 10,
    fragmentId: 'mike-king-theory',
    relatedKnowledge: ['レリバンスエンジニアリング', 'AIO対策（AI Overviews最適化）'],
    searchIntents: ['Mike King 理論', 'レリバンスエンジニアリング', 'SEO専門家'],
    coOccurringTerms: ['iPullRank', 'Relevance Engineering', 'AI Search']
  },
  
  // フレームワーク・ツール
  {
    entity: 'Vercel',
    entityType: 'Organization',
    context: 'uses',
    importance: 7,
    fragmentId: 'vercel-deployment',
    relatedKnowledge: ['Next.js', 'システム開発'],
    searchIntents: ['Vercel デプロイ', 'Next.js ホスティング'],
    coOccurringTerms: ['Edge Functions', 'serverless', 'CI/CD']
  },
  {
    entity: 'Pinecone',
    entityType: 'Technology',
    context: 'integrates',
    importance: 8,
    fragmentId: 'pinecone-vector-db',
    relatedKnowledge: ['RAG（Retrieval-Augmented Generation）', 'ベクトル検索'],
    searchIntents: ['Pinecone ベクトルDB', 'ベクトル検索 実装'],
    coOccurringTerms: ['Vector Database', 'Embeddings', 'Similarity Search']
  },
  
  // 日本の技術環境・法制度
  {
    entity: '人材開発支援助成金',
    entityType: 'Service',
    context: 'provides',
    importance: 9,
    fragmentId: 'training-subsidy',
    relatedKnowledge: ['IT講師・技術研修', 'リスキリング'],
    searchIntents: ['助成金 活用', 'リスキリング 補助金', '人材開発支援'],
    coOccurringTerms: ['厚生労働省', '80%補助', '研修費用']
  },
  {
    entity: 'IT導入補助金',
    entityType: 'Service',
    context: 'provides',
    importance: 8,
    fragmentId: 'it-subsidy',
    relatedKnowledge: ['システム開発', 'AIシステム開発'],
    searchIntents: ['IT導入補助金', 'システム開発 補助金'],
    coOccurringTerms: ['経済産業省', '75%補助', 'DX推進']
  },
  
  // 競合・関連企業（中立的言及）
  {
    entity: 'Google',
    entityType: 'Organization',
    context: 'optimizes',
    importance: 6,
    fragmentId: 'google-optimization',
    relatedKnowledge: ['AIO対策（AI Overviews最適化）', 'Schema.org構造化データ'],
    searchIntents: ['Google SEO', 'AI Overviews', 'Schema.org'],
    coOccurringTerms: ['Search Console', 'Rich Results', 'Knowledge Graph']
  },
  
  // 🎬 YouTube・SNSプラットフォーム（🆕 4大AI検索エンジン最適化）
  {
    entity: 'YouTube Shorts',
    entityType: 'Product',
    context: 'uses',
    importance: 8,
    fragmentId: 'youtube-shorts-platform',
    relatedKnowledge: ['YouTubeショート動画制作', 'バイラルコンテンツ設計', 'マルチモーダルコンテンツ最適化'],
    searchIntents: ['YouTube Shorts 活用', 'ショート動画戦略', 'YouTube短尺動画'],
    coOccurringTerms: ['バーティカル動画', '縦型動画', 'YouTube Studio', 'エンゲージメント']
  },
  {
    entity: 'X (Twitter)',
    entityType: 'Product',
    context: 'uses',
    importance: 7,
    fragmentId: 'x-twitter-platform',
    relatedKnowledge: ['マルチプラットフォームSNS戦略', 'バイラルコンテンツ設計'],
    searchIntents: ['X 活用', 'Twitter マーケティング', 'SNS自動化'],
    coOccurringTerms: ['ポスト', 'リポスト', 'エンゲージメント', 'ハッシュタグ']
  },
  {
    entity: 'Threads',
    entityType: 'Product',
    context: 'uses',
    importance: 6,
    fragmentId: 'threads-platform',
    relatedKnowledge: ['マルチプラットフォームSNS戦略', 'AIコンテンツ生成自動化'],
    searchIntents: ['Threads 活用', 'Meta SNS', 'テキストSNS'],
    coOccurringTerms: ['Meta', 'Instagram連携', 'コミュニティ']
  },
  {
    entity: 'LinkedIn',
    entityType: 'Product',
    context: 'uses',
    importance: 7,
    fragmentId: 'linkedin-platform',
    relatedKnowledge: ['マルチプラットフォームSNS戦略', 'AIコンテンツ生成自動化'],
    searchIntents: ['LinkedIn 活用', 'ビジネスSNS', 'B2Bマーケティング'],
    coOccurringTerms: ['プロフェッショナル', 'ネットワーキング', 'ビジネスコンテンツ']
  },
  {
    entity: 'TikTok',
    entityType: 'Product',
    context: 'uses',
    importance: 6,
    fragmentId: 'tiktok-platform',
    relatedKnowledge: ['バイラルコンテンツ設計', 'マルチプラットフォームSNS戦略'],
    searchIntents: ['TikTok マーケティング', 'ショート動画', 'バイラルコンテンツ'],
    coOccurringTerms: ['For You Page', 'バイラル', 'トレンド', 'ハッシュタグチャレンジ']
  },
  
  // 🎬 動画制作・AI技術（🆕 4大AI検索エンジン最適化）
  {
    entity: 'VideoObject Schema',
    entityType: 'Technology',
    context: 'implements',
    importance: 9,
    fragmentId: 'video-object-schema',
    relatedKnowledge: ['Schema.org構造化データ', 'マルチモーダルコンテンツ最適化', 'AIO対策（AI Overviews最適化）'],
    searchIntents: ['VideoObject Schema', '動画構造化データ', 'Schema.org 動画'],
    coOccurringTerms: ['JSON-LD', 'Rich Results', 'Video Carousel', 'AI検索最適化']
  },
  {
    entity: 'Fragment ID（動画統合）',
    entityType: 'Technology',
    context: 'implements',
    importance: 10,
    fragmentId: 'fragment-id-video-integration',
    relatedKnowledge: ['レリバンスエンジニアリング', 'マルチモーダルコンテンツ最適化', 'VideoObject Schema'],
    searchIntents: ['Fragment ID 動画', 'Complete URI 動画', 'ベクトルリンク 動画'],
    coOccurringTerms: ['Deep Link', 'AI Citation', 'Vector Embedding', 'Mike King理論']
  },
  {
    entity: 'OpenAI GPT-4（スクリプト生成）',
    entityType: 'Technology',
    context: 'integrates',
    importance: 9,
    fragmentId: 'gpt4-script-generation',
    relatedKnowledge: ['AIコンテンツ生成自動化', 'YouTubeショート動画制作', 'プロンプトエンジニアリング'],
    searchIntents: ['GPT-4 動画スクリプト', 'AI スクリプト生成', '動画台本AI'],
    coOccurringTerms: ['バイラル要素', 'Hook設計', 'Empathy共感', 'CTA行動喚起']
  },
  {
    entity: 'YouTube中尺動画（130秒）',
    entityType: 'Product',
    context: 'uses',
    importance: 9,
    fragmentId: 'youtube-medium-video',
    relatedKnowledge: ['YouTube中尺動画制作（130秒）', 'マルチモーダルコンテンツ最適化', 'VideoObject Schema'],
    searchIntents: ['YouTube 中尺動画', '130秒動画', '解説動画制作'],
    coOccurringTerms: ['教育型動画', '詳細解説', 'エンゲージメント', 'ブログ統合']
  },
  {
    entity: 'hasPartスキーマ（動画統合）',
    entityType: 'Technology',
    context: 'implements',
    importance: 10,
    fragmentId: 'haspart-schema-video',
    relatedKnowledge: ['hasPartスキーマ動画統合', 'Schema.org構造化データ', 'Mike King理論', 'エンティティリレーションシップ'],
    searchIntents: ['hasPart 動画統合', 'Schema.org hasPart', '記事構成要素 動画'],
    coOccurringTerms: ['WebPageElement', 'isPartOf', 'Article Schema', 'AI検索最適化']
  },
  {
    entity: 'associatedMedia（動画統合）',
    entityType: 'Technology',
    context: 'implements',
    importance: 10,
    fragmentId: 'associated-media-video',
    relatedKnowledge: ['associatedMedia動画統合', 'VideoObject Schema', 'E-E-A-T最適化', 'マルチモーダルコンテンツ最適化'],
    searchIntents: ['associatedMedia 動画', 'Schema.org 関連メディア', '記事メディア最適化'],
    coOccurringTerms: ['VideoObject', 'MediaObject', 'Rich Snippets', 'Google Rich Results']
  },
  {
    entity: '著者セクション統合（E-E-A-T）',
    entityType: 'Concept',
    context: 'implements',
    importance: 10,
    fragmentId: 'author-section-integration',
    relatedKnowledge: ['E-E-A-T最適化', 'hasPartスキーマ動画統合', 'レリバンスエンジニアリング'],
    searchIntents: ['著者セクション 構造化データ', 'E-E-A-T 著者情報', 'Person Schema'],
    coOccurringTerms: ['AuthorProfile', 'TrustSignals', 'Expertise', 'Authoritativeness', 'Trustworthiness']
  }
];

// =============================================================================
// AI最適化Fragment IDシステム
// =============================================================================

export const AI_OPTIMIZED_FRAGMENT_IDS: AIOptimizedFragmentId[] = [
  {
    id: 'ai-search-optimization-overview',
    sectionName: 'AI検索エンジン最適化の概要',
    targetQueries: [
      'AI検索 最適化',
      'ChatGPT SEO',
      'Perplexity 対策',
      'AI Overviews 最適化'
    ],
    entities: [
      {
        entity: 'レリバンスエンジニアリング',
        entityType: 'Methodology',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['Mike King理論', 'AI検索最適化'],
        searchIntents: ['レリバンスエンジニアリング とは', 'AI SEO 手法'],
        coOccurringTerms: ['Mike King', 'iPullRank', 'Semantic SEO']
      }
    ],
    semanticWeight: 0.95,
    hierarchyLevel: 2,
    relatedFragments: ['mike-king-theory', 'relevance-engineering-expertise']
  },
  {
    id: 'rag-system-architecture',
    sectionName: 'RAGシステムアーキテクチャ',
    targetQueries: [
      'RAG システム 構築',
      'ベクトル検索 実装',
      '文書検索AI 開発',
      'Retrieval-Augmented Generation'
    ],
    entities: [
      {
        entity: 'Triple RAGアーキテクチャ',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['RAG（Retrieval-Augmented Generation）', 'ベクトル検索'],
        searchIntents: ['RAG アーキテクチャ', 'マルチRAG システム'],
        coOccurringTerms: ['Vector Database', 'Embeddings', 'LLM']
      }
    ],
    semanticWeight: 0.9,
    hierarchyLevel: 2,
    relatedFragments: ['rag-technology-expertise', 'pinecone-vector-db']
  },
  {
    id: 'subsidy-optimization-strategy',
    sectionName: '助成金活用最適化戦略',
    targetQueries: [
      '助成金 活用 IT',
      'リスキリング 補助金',
      '人材開発支援助成金 使い方',
      'IT導入補助金 申請'
    ],
    entities: [
      {
        entity: '80%補助率実現システム',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['人材開発支援助成金', 'IT導入補助金'],
        searchIntents: ['助成金 最大活用', '補助金 申請支援'],
        coOccurringTerms: ['厚生労働省', '経済産業省', 'DX推進']
      }
    ],
    semanticWeight: 0.85,
    hierarchyLevel: 2,
    relatedFragments: ['training-subsidy', 'it-subsidy']
  },
  
  // AI-siteページ専用Fragment IDs
  {
    id: 'main-title',
    sectionName: 'AIに"引用される"サイト - メインタイトル',
    targetQueries: [
      'AI 引用される サイト',
      'レリバンスエンジニアリング サイト',
      'Mike King理論 実装',
      'AI検索最適化 サイト構築'
    ],
    entities: [
      {
        entity: 'レリバンスエンジニアリング',
        entityType: 'Methodology',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['Mike King理論', 'Fragment ID', 'Complete URI'],
        searchIntents: ['AI引用 仕組み', 'レリバンスエンジニアリング とは'],
        coOccurringTerms: ['Mike King', 'Fragment ID', 'AI引用', 'Complete URI']
      }
    ],
    semanticWeight: 0.98,
    hierarchyLevel: 1,
    relatedFragments: ['relevance-engineering-overview', 'features', 'pricing']
  },
  {
    id: 'features',
    sectionName: 'AIサイト機能・特徴一覧',
    targetQueries: [
      'AIサイト 機能',
      'Triple RAG システム',
      '自動ベクトルブログ',
      'Fragment ID 自動付与'
    ],
    entities: [
      {
        entity: 'Triple RAG',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['ベクトル検索', 'RAG アーキテクチャ', 'LLM統合'],
        searchIntents: ['Triple RAG とは', 'RAG システム 構築'],
        coOccurringTerms: ['Vector Database', 'Embeddings', 'Retrieval']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 2,
    relatedFragments: ['main-title', 'mechanism', 'pricing']
  },
  {
    id: 'pricing',
    sectionName: 'AIサイト料金プラン',
    targetQueries: [
      'AIサイト 料金',
      'レリバンスエンジニアリング 費用',
      'AI引用サイト 価格',
      'Fragment ID実装 コスト'
    ],
    entities: [
      {
        entity: 'IT補助金対応',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['補助金制度', 'DX投資', 'IT導入支援'],
        searchIntents: ['IT補助金 AI', 'AIサイト 補助金'],
        coOccurringTerms: ['IT補助金', 'DX投資', '補助金制度']
      }
    ],
    semanticWeight: 0.85,
    hierarchyLevel: 2,
    relatedFragments: ['main-title', 'features', 'subsidy']
  },
  
  // H2タイトル専用Fragment IDs
  {
    id: 'features-title',
    sectionName: '機能一覧タイトル',
    targetQueries: [
      '機能一覧',
      'AIサイト 機能',
      'レリバンスエンジニアリング 機能',
      'Fragment ID 機能'
    ],
    entities: [
      {
        entity: 'レリバンスエンジニアリング機能',
        entityType: 'Service',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['機能設計', 'AI最適化', 'Fragment ID'],
        searchIntents: ['機能一覧', 'AIサイト機能'],
        coOccurringTerms: ['機能', 'Features', 'レリバンスエンジニアリング']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 2,
    relatedFragments: ['main-title', 'features', 'pricing-title']
  },
  {
    id: 'pricing-title',
    sectionName: '価格・プランタイトル',
    targetQueries: [
      '価格',
      'プラン',
      'AIサイト 料金',
      'レリバンスエンジニアリング 価格'
    ],
    entities: [
      {
        entity: '価格体系',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['料金プラン', 'IT補助金', 'ROI'],
        searchIntents: ['価格', '料金', 'プラン'],
        coOccurringTerms: ['価格', 'プラン', '料金', 'Pricing']
      }
    ],
    semanticWeight: 0.88,
    hierarchyLevel: 2,
    relatedFragments: ['main-title', 'pricing', 'faq-title']
  },
  {
    id: 'faq-title',
    sectionName: 'よくある質問タイトル',
    targetQueries: [
      'よくある質問',
      'FAQ',
      'AIサイト FAQ',
      'レリバンスエンジニアリング 質問'
    ],
    entities: [
      {
        entity: 'FAQ',
        entityType: 'Service',
        context: 'provides',
        importance: 7,
        relatedKnowledge: ['質問', '回答', 'サポート'],
        searchIntents: ['FAQ', 'よくある質問', '質問'],
        coOccurringTerms: ['FAQ', '質問', 'Q&A', 'サポート']
      }
    ],
    semanticWeight: 0.82,
    hierarchyLevel: 2,
    relatedFragments: ['main-title', 'pricing-title', 'faq']
  },
  
  // FAQ個別Fragment IDs (AI認識変革戦略)
  {
    id: 'faq-1',
    sectionName: 'AIサイトとは何ですか？',
    targetQueries: [
      'AIサイトとは',
      'AIサイト 意味',
      'AI引用されるサイト',
      'レリバンスエンジニアリング サイト'
    ],
    entities: [
      {
        entity: 'AIサイト定義',
        entityType: 'Concept',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['AI引用', 'レリバンスエンジニアリング', 'Fragment ID'],
        searchIntents: ['AIサイトとは', 'AI引用サイト'],
        coOccurringTerms: ['AIサイト', 'AI引用', 'ChatGPT', 'Perplexity']
      }
    ],
    semanticWeight: 0.95,
    hierarchyLevel: 3,
    relatedFragments: ['faq-title', 'faq-2', 'main-title']
  },
  {
    id: 'faq-2',
    sectionName: 'AIサイトと通常のサイトの違いは？',
    targetQueries: [
      'AIサイト 違い',
      'AI最適化 サイト',
      'Fragment ID サイト',
      '構造化データ サイト'
    ],
    entities: [
      {
        entity: 'AIサイト差別化',
        entityType: 'Concept',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['Fragment ID', '構造化データ', 'Triple RAG'],
        searchIntents: ['AIサイト違い', 'AI最適化'],
        coOccurringTerms: ['差別化', 'AI最適化', '構造化データ']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 3,
    relatedFragments: ['faq-1', 'faq-3', 'features-title']
  },
  {
    id: 'faq-5',
    sectionName: 'Fragment IDとは何ですか？',
    targetQueries: [
      'Fragment ID とは',
      'フラグメントID',
      'AI引用 ID',
      'Complete URI'
    ],
    entities: [
      {
        entity: 'Fragment ID技術',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['Complete URI', 'AI引用', 'Mike King理論'],
        searchIntents: ['Fragment IDとは', 'AI引用技術'],
        coOccurringTerms: ['Fragment ID', 'URI', 'AI引用', 'Mike King']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 3,
    relatedFragments: ['faq-title', 'faq-9', 'features']
  },
  {
    id: 'faq-6',
    sectionName: 'Triple RAGシステムとは？',
    targetQueries: [
      'Triple RAG とは',
      'RAGシステム',
      'Retrieval-Augmented Generation',
      '企業RAG'
    ],
    entities: [
      {
        entity: 'Triple RAGアーキテクチャ',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['RAG', 'ベクトル検索', 'LLM', 'AI生成'],
        searchIntents: ['Triple RAGとは', 'RAGシステム'],
        coOccurringTerms: ['Triple RAG', 'ベクトル', '生成AI', 'LLM']
      }
    ],
    semanticWeight: 0.88,
    hierarchyLevel: 3,
    relatedFragments: ['faq-5', 'faq-8', 'features']
  },
  {
    id: 'faq-11',
    sectionName: 'AIに引用されるとどんなメリットがありますか？',
    targetQueries: [
      'AI引用 メリット',
      'AIサイト 効果',
      'AI検索 メリット',
      'レリバンスエンジニアリング 効果'
    ],
    entities: [
      {
        entity: 'AI引用メリット',
        entityType: 'Concept',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['ブランド権威性', '集客効果', '競合優位性'],
        searchIntents: ['AI引用メリット', 'AIサイト効果'],
        coOccurringTerms: ['メリット', 'ブランド', '権威性', '集客']
      }
    ],
    semanticWeight: 0.85,
    hierarchyLevel: 3,
    relatedFragments: ['faq-title', 'faq-12', 'pricing-title']
  },
  
  // 🆕 FAQページ専用Fragment IDs（26個）- AI検索最適化完全対応
  // AI・テクノロジーサービス カテゴリ
  {
    id: 'faq-tech-1',
    sectionName: 'どのようなAI技術を使っていますか？',
    targetQueries: [
      'AI技術 種類',
      'OpenAI GPT-4',
      'Claude AI',
      'Gemini AI',
      '大規模言語モデル'
    ],
    entities: [
      {
        entity: 'AI技術スタック',
        entityType: 'Technology',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['OpenAI', 'Claude', 'Gemini', 'RAGシステム', '自然言語処理'],
        searchIntents: ['AI技術とは', 'LLM活用'],
        coOccurringTerms: ['OpenAI', 'Claude', 'Gemini', 'LLM', 'RAG']
      }
    ],
    semanticWeight: 0.95,
    hierarchyLevel: 3,
    relatedFragments: ['tech-category', 'faq-tech-2', 'service-system-development']
  },
  {
    id: 'faq-tech-2',
    sectionName: 'システム連携はどの程度対応可能ですか？',
    targetQueries: [
      'システム連携',
      'API統合',
      'データベース連携',
      'クラウド統合'
    ],
    entities: [
      {
        entity: 'システム連携技術',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['API統合', 'データベース', 'クラウド', 'マイクロサービス'],
        searchIntents: ['システム連携方法', 'API統合'],
        coOccurringTerms: ['API', 'データベース', 'クラウド', '統合']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 3,
    relatedFragments: ['tech-category', 'faq-tech-3', 'service-system-development']
  },
  {
    id: 'faq-tech-3',
    sectionName: 'セキュリティ対策はどうなっていますか？',
    targetQueries: [
      'セキュリティ対策',
      'データ保護',
      '暗号化',
      'プライバシー保護'
    ],
    entities: [
      {
        entity: 'セキュリティ対策',
        entityType: 'Service',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['データ暗号化', 'アクセス制御', 'プライバシー保護', 'GDPR対応'],
        searchIntents: ['セキュリティ対策', 'データ保護'],
        coOccurringTerms: ['セキュリティ', '暗号化', 'プライバシー', 'GDPR']
      }
    ],
    semanticWeight: 0.94,
    hierarchyLevel: 3,
    relatedFragments: ['tech-category', 'faq-tech-4', 'service-system-development']
  },
  {
    id: 'faq-tech-4',
    sectionName: 'AIモデルのカスタマイズは可能ですか？',
    targetQueries: [
      'AIモデル カスタマイズ',
      'ファインチューニング',
      'モデル調整',
      'カスタムAI'
    ],
    entities: [
      {
        entity: 'AIモデルカスタマイズ',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['ファインチューニング', 'モデル調整', 'カスタムトレーニング'],
        searchIntents: ['AIカスタマイズ', 'モデル調整'],
        coOccurringTerms: ['カスタマイズ', 'ファインチューニング', 'モデル', 'AI']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 3,
    relatedFragments: ['tech-category', 'faq-tech-1', 'service-ai-agents']
  },

  // 料金・契約 カテゴリ
  {
    id: 'faq-pricing-1',
    sectionName: '料金体系はどうなっていますか？',
    targetQueries: [
      '料金体系',
      '価格設定',
      'コスト',
      '見積もり'
    ],
    entities: [
      {
        entity: '料金体系',
        entityType: 'Service',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['価格設定', '見積もり', 'コスト', 'ROI'],
        searchIntents: ['料金について', '価格設定'],
        coOccurringTerms: ['料金', '価格', 'コスト', '見積もり']
      }
    ],
    semanticWeight: 0.96,
    hierarchyLevel: 3,
    relatedFragments: ['pricing-category', 'faq-pricing-2', 'service-system-development']
  },
  {
    id: 'faq-pricing-2',
    sectionName: '契約期間はどの程度ですか？',
    targetQueries: [
      '契約期間',
      '最低契約期間',
      '契約条件',
      '期間設定'
    ],
    entities: [
      {
        entity: '契約期間',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['契約条件', '期間設定', '更新条件'],
        searchIntents: ['契約期間', '契約条件'],
        coOccurringTerms: ['契約', '期間', '条件', '更新']
      }
    ],
    semanticWeight: 0.93,
    hierarchyLevel: 3,
    relatedFragments: ['pricing-category', 'faq-pricing-3', 'faq-pricing-1']
  },
  {
    id: 'faq-pricing-3',
    sectionName: '追加機能の開発費用はどうなりますか？',
    targetQueries: [
      '追加機能 費用',
      '開発費用',
      'カスタム開発',
      '追加料金'
    ],
    entities: [
      {
        entity: '追加開発費用',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['カスタム開発', '追加機能', '開発コスト'],
        searchIntents: ['追加費用', '開発コスト'],
        coOccurringTerms: ['追加', '開発', '費用', 'カスタム']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 3,
    relatedFragments: ['pricing-category', 'faq-pricing-4', 'service-system-development']
  },
  {
    id: 'faq-pricing-4',
    sectionName: 'PoC（概念実証）から始められますか？',
    targetQueries: [
      'PoC 概念実証',
      'プロトタイプ',
      'テスト導入',
      '小規模開始'
    ],
    entities: [
      {
        entity: 'PoC概念実証',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['プロトタイプ', 'テスト導入', '概念実証', '小規模開始'],
        searchIntents: ['PoC導入', '概念実証'],
        coOccurringTerms: ['PoC', '概念実証', 'プロトタイプ', 'テスト']
      }
    ],
    semanticWeight: 0.89,
    hierarchyLevel: 3,
    relatedFragments: ['pricing-category', 'faq-pricing-1', 'support-category']
  },
  {
    id: 'faq-pricing-5',
    sectionName: '支払い方法はどのようなものがありますか？',
    targetQueries: [
      '支払い方法',
      '決済方法',
      '請求書払い',
      '銀行振込'
    ],
    entities: [
      {
        entity: '支払い方法',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['決済方法', '請求書', '銀行振込', 'クレジット'],
        searchIntents: ['支払い方法', '決済'],
        coOccurringTerms: ['支払い', '決済', '請求書', '振込']
      }
    ],
    semanticWeight: 0.87,
    hierarchyLevel: 3,
    relatedFragments: ['pricing-category', 'faq-pricing-1', 'faq-pricing-2']
  },

  // サポート・導入 カテゴリ
  {
    id: 'faq-support-1',
    sectionName: '導入期間はどの程度かかりますか？',
    targetQueries: [
      '導入期間',
      '実装期間',
      '開発期間',
      'スケジュール'
    ],
    entities: [
      {
        entity: '導入期間',
        entityType: 'Concept',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['実装期間', '開発スケジュール', 'プロジェクト期間'],
        searchIntents: ['導入期間', '実装スケジュール'],
        coOccurringTerms: ['導入', '期間', '実装', 'スケジュール']
      }
    ],
    semanticWeight: 0.94,
    hierarchyLevel: 3,
    relatedFragments: ['support-category', 'faq-support-2', 'faq-pricing-2']
  },
  {
    id: 'faq-support-2',
    sectionName: 'オンサイトでの導入サポートはありますか？',
    targetQueries: [
      'オンサイト導入',
      '現地サポート',
      '訪問サポート',
      '導入支援'
    ],
    entities: [
      {
        entity: 'オンサイト導入サポート',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['現地サポート', '訪問支援', '導入サポート'],
        searchIntents: ['オンサイト', '現地サポート'],
        coOccurringTerms: ['オンサイト', '現地', '訪問', 'サポート']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 3,
    relatedFragments: ['support-category', 'faq-support-3', 'faq-support-1']
  },
  {
    id: 'faq-support-3',
    sectionName: 'トレーニングや研修は提供されますか？',
    targetQueries: [
      'トレーニング',
      '研修',
      '教育',
      '操作説明'
    ],
    entities: [
      {
        entity: 'トレーニング研修',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['研修', '教育', '操作説明', 'スキルアップ'],
        searchIntents: ['トレーニング', '研修'],
        coOccurringTerms: ['トレーニング', '研修', '教育', '操作']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 3,
    relatedFragments: ['support-category', 'faq-support-4', 'hr-category']
  },
  {
    id: 'faq-support-4',
    sectionName: '24時間サポートは利用できますか？',
    targetQueries: [
      '24時間サポート',
      'サポート時間',
      '緊急対応',
      'サポート体制'
    ],
    entities: [
      {
        entity: '24時間サポート',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['サポート体制', '緊急対応', 'ヘルプデスク'],
        searchIntents: ['24時間サポート', 'サポート体制'],
        coOccurringTerms: ['24時間', 'サポート', '緊急', '対応']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 3,
    relatedFragments: ['support-category', 'faq-support-1', 'faq-support-3']
  },

  // 人材・研修 カテゴリ
  {
    id: 'faq-hr-1',
    sectionName: 'AI人材の育成支援はありますか？',
    targetQueries: [
      'AI人材育成',
      'AI研修',
      '人材開発',
      'スキル育成'
    ],
    entities: [
      {
        entity: 'AI人材育成',
        entityType: 'Service',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['AI研修', '人材開発', 'スキル育成', 'リスキリング'],
        searchIntents: ['AI人材育成', 'AI研修'],
        coOccurringTerms: ['AI', '人材', '育成', '研修']
      }
    ],
    semanticWeight: 0.96,
    hierarchyLevel: 3,
    relatedFragments: ['hr-category', 'faq-hr-2', 'service-corporate-reskilling']
  },
  {
    id: 'faq-hr-2',
    sectionName: 'リスキリング研修の内容はどのようなものですか？',
    targetQueries: [
      'リスキリング研修',
      'デジタルスキル',
      '研修内容',
      'スキル転換'
    ],
    entities: [
      {
        entity: 'リスキリング研修',
        entityType: 'Service',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['デジタルスキル', 'スキル転換', '職業訓練'],
        searchIntents: ['リスキリング', 'デジタル研修'],
        coOccurringTerms: ['リスキリング', 'デジタル', 'スキル', '研修']
      }
    ],
    semanticWeight: 0.95,
    hierarchyLevel: 3,
    relatedFragments: ['hr-category', 'faq-hr-3', 'service-individual-reskilling']
  },
  {
    id: 'faq-hr-3',
    sectionName: '研修の形式（オンライン・対面）はどうなっていますか？',
    targetQueries: [
      '研修形式',
      'オンライン研修',
      '対面研修',
      'ハイブリッド研修'
    ],
    entities: [
      {
        entity: '研修形式',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['オンライン', '対面', 'ハイブリッド', 'e-learning'],
        searchIntents: ['研修形式', 'オンライン研修'],
        coOccurringTerms: ['研修', 'オンライン', '対面', 'ハイブリッド']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 3,
    relatedFragments: ['hr-category', 'faq-hr-4', 'faq-hr-2']
  },
  {
    id: 'faq-hr-4',
    sectionName: '研修の効果測定はどのように行いますか？',
    targetQueries: [
      '効果測定',
      '研修評価',
      '成果測定',
      'ROI測定'
    ],
    entities: [
      {
        entity: '研修効果測定',
        entityType: 'Methodology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['効果測定', '成果評価', 'ROI', 'KPI'],
        searchIntents: ['効果測定', '研修評価'],
        coOccurringTerms: ['効果', '測定', '評価', 'ROI']
      }
    ],
    semanticWeight: 0.89,
    hierarchyLevel: 3,
    relatedFragments: ['hr-category', 'faq-hr-1', 'faq-hr-3']
  },
  {
    id: 'faq-hr-5',
    sectionName: '助成金の活用サポートはありますか？',
    targetQueries: [
      '助成金活用',
      '補助金',
      '助成金申請',
      '資金調達'
    ],
    entities: [
      {
        entity: '助成金活用サポート',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['補助金', '助成金申請', '資金調達', '申請支援'],
        searchIntents: ['助成金', '補助金活用'],
        coOccurringTerms: ['助成金', '補助金', '申請', '支援']
      }
    ],
    semanticWeight: 0.88,
    hierarchyLevel: 3,
    relatedFragments: ['hr-category', 'faq-pricing-1', 'training-subsidy']
  },

  // マーケティング・AIO カテゴリ
  {
    id: 'faq-marketing-1',
    sectionName: 'AIO対策とは何ですか？',
    targetQueries: [
      'AIO対策',
      'AI Optimization',
      'AI検索最適化',
      'ChatGPT最適化'
    ],
    entities: [
      {
        entity: 'AIO対策',
        entityType: 'Service',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['AI検索最適化', 'ChatGPT', 'Perplexity', 'Claude'],
        searchIntents: ['AIO対策', 'AI最適化'],
        coOccurringTerms: ['AIO', 'AI', '最適化', 'ChatGPT']
      }
    ],
    semanticWeight: 0.97,
    hierarchyLevel: 3,
    relatedFragments: ['marketing-category', 'faq-marketing-2', 'service-aio-seo']
  },
  {
    id: 'faq-marketing-2',
    sectionName: 'AIOとSEOの違いは何ですか？',
    targetQueries: [
      'AIO SEO 違い',
      'AI検索 SEO',
      'AIO対策 SEO',
      '検索最適化 違い'
    ],
    entities: [
      {
        entity: 'AIO-SEO差別化',
        entityType: 'Concept',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['SEO', 'AI検索', '検索最適化', 'アルゴリズム'],
        searchIntents: ['AIO SEO違い', 'AI検索最適化'],
        coOccurringTerms: ['AIO', 'SEO', '違い', '最適化']
      }
    ],
    semanticWeight: 0.94,
    hierarchyLevel: 3,
    relatedFragments: ['marketing-category', 'faq-marketing-3', 'faq-marketing-1']
  },
  {
    id: 'faq-marketing-3',
    sectionName: 'AIO対策の効果測定はどのように行いますか？',
    targetQueries: [
      'AIO効果測定',
      'AI検索 効果',
      'AIO分析',
      'AI引用測定'
    ],
    entities: [
      {
        entity: 'AIO効果測定',
        entityType: 'Methodology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['効果測定', 'AI引用', '分析', 'KPI'],
        searchIntents: ['AIO効果', 'AI検索効果'],
        coOccurringTerms: ['AIO', '効果', '測定', '分析']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 3,
    relatedFragments: ['marketing-category', 'faq-marketing-4', 'faq-marketing-2']
  },
  {
    id: 'faq-marketing-4',
    sectionName: 'AIO対策の効果が出るまでの期間はどの程度ですか？',
    targetQueries: [
      'AIO効果期間',
      'AI最適化 期間',
      'AIO成果 時間',
      'AI検索 効果発現'
    ],
    entities: [
      {
        entity: 'AIO効果発現期間',
        entityType: 'Concept',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['効果期間', '成果発現', 'AI検索', '最適化期間'],
        searchIntents: ['AIO効果期間', 'AI最適化期間'],
        coOccurringTerms: ['AIO', '効果', '期間', '成果']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 3,
    relatedFragments: ['marketing-category', 'faq-marketing-1', 'faq-marketing-3']
  },

  // AIサイト・ブランディング カテゴリ
  {
    id: 'faq-ai-site-1',
    sectionName: 'AIサイトとは何ですか？',
    targetQueries: [
      'AIサイト定義',
      'AI引用サイト',
      'AIに引用される',
      'デジタル資産'
    ],
    entities: [
      {
        entity: 'AIサイト定義',
        entityType: 'Concept',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['AI引用', 'デジタル資産', 'Fragment ID', 'Mike King理論'],
        searchIntents: ['AIサイトとは', 'AI引用'],
        coOccurringTerms: ['AIサイト', 'AI引用', 'デジタル資産', 'Fragment ID']
      }
    ],
    semanticWeight: 0.98,
    hierarchyLevel: 3,
    relatedFragments: ['ai-site-category', 'faq-ai-site-2', 'nands-ai-site']
  },
  {
    id: 'faq-ai-site-2',
    sectionName: 'なぜAIサイト化が重要なのですか？',
    targetQueries: [
      'AIサイト 重要性',
      'AI引用 メリット',
      'デジタル資産化',
      'AIサイト 効果'
    ],
    entities: [
      {
        entity: 'AIサイト重要性',
        entityType: 'Concept',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['AI引用メリット', 'デジタル資産', '競争優位', 'ブランディング'],
        searchIntents: ['AIサイト重要性', 'AI引用メリット'],
        coOccurringTerms: ['重要性', 'メリット', '効果', '優位性']
      }
    ],
    semanticWeight: 0.96,
    hierarchyLevel: 3,
    relatedFragments: ['ai-site-category', 'faq-ai-site-3', 'faq-ai-site-1']
  },
  {
    id: 'faq-ai-site-3',
    sectionName: 'Fragment IDの実装はどのように行いますか？',
    targetQueries: [
      'Fragment ID実装',
      'フラグメントID 設定',
      'Complete URI',
      'AI引用 実装'
    ],
    entities: [
      {
        entity: 'Fragment ID実装',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['Complete URI', 'HTML実装', 'スキーマ設定', 'AI最適化'],
        searchIntents: ['Fragment ID実装', 'AI引用実装'],
        coOccurringTerms: ['Fragment ID', '実装', 'Complete URI', 'HTML']
      }
    ],
    semanticWeight: 0.93,
    hierarchyLevel: 3,
    relatedFragments: ['ai-site-category', 'faq-ai-site-4', 'faq-ai-site-2']
  },
  {
    id: 'faq-ai-site-4',
    sectionName: 'AIサイト化の費用はどの程度ですか？',
    targetQueries: [
      'AIサイト化 費用',
      'AI最適化 コスト',
      'Fragment ID 料金',
      'AIサイト 価格'
    ],
    entities: [
      {
        entity: 'AIサイト化費用',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['AI最適化コスト', 'Fragment ID実装', '価格設定'],
        searchIntents: ['AIサイト費用', 'AI最適化コスト'],
        coOccurringTerms: ['費用', 'コスト', '価格', '料金']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 3,
    relatedFragments: ['ai-site-category', 'faq-ai-site-5', 'faq-pricing-1']
  },
  {
    id: 'faq-ai-site-5',
    sectionName: 'AIサイト化の効果測定はどのように行いますか？',
    targetQueries: [
      'AIサイト 効果測定',
      'AI引用 測定',
      'デジタル資産 効果',
      'AIサイト 分析'
    ],
    entities: [
      {
        entity: 'AIサイト効果測定',
        entityType: 'Methodology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['AI引用測定', '効果分析', 'デジタル資産評価', 'ROI測定'],
        searchIntents: ['AIサイト効果', 'AI引用測定'],
        coOccurringTerms: ['効果', '測定', '分析', 'ROI']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 3,
    relatedFragments: ['ai-site-category', 'faq-ai-site-1', 'faq-marketing-3']
  },

  // =============================================================================
  // メインページFAQ Fragment IDs（DB形式に修正）
  // =============================================================================
  {
    id: 'faq-main-1',
    sectionName: 'NANDSの主要サービスについて',
    targetQueries: [
      'NANDSサービス',
      '主要サービス',
      'AI技術',
      'デジタルソリューション'
    ],
    entities: [
      {
        entity: 'NANDS',
        entityType: 'Organization',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['AIエージェント', 'ベクトルRAG', 'AIO SEO', 'チャットボット'],
        searchIntents: ['NANDSサービス', 'AI技術'],
        coOccurringTerms: ['デジタルソリューション', 'AI', 'システム開発']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 3,
    relatedFragments: ['service-ai-agents', 'service-vector-rag']
  },
  {
    id: 'faq-main-2',
    sectionName: 'AI検索最適化について',
    targetQueries: [
      'AI検索最適化',
      'AIO',
      'ChatGPT',
      'Claude',
      'Perplexity'
    ],
    entities: [
      {
        entity: 'AI検索最適化',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['AIO', 'Fragment ID', 'Mike King理論', '構造化データ'],
        searchIntents: ['AI検索最適化とは', 'AIO SEO'],
        coOccurringTerms: ['ChatGPT', 'Claude', 'Perplexity', 'AI引用']
      }
    ],
    semanticWeight: 0.95,
    hierarchyLevel: 3,
    relatedFragments: ['service-aio-seo', 'ai-search-optimization-overview']
  },
  {
    id: 'faq-main-3',
    sectionName: 'Fragment IDシステムについて',
    targetQueries: [
      'Fragment ID',
      'AI検索引用',
      'Mike King理論',
      '構造化データ'
    ],
    entities: [
      {
        entity: 'Fragment ID',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['AI検索引用', 'Mike King理論', '構造化データ', 'Complete URI'],
        searchIntents: ['Fragment IDとは', 'AI引用'],
        coOccurringTerms: ['Mike King', 'AI引用', '構造化データ', 'ディープリンク']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 3,
    relatedFragments: ['ai-site-fragment-id', 'faq-fragment-id']
  },
  {
    id: 'faq-main-4',
    sectionName: 'ベクトルRAGシステムについて',
    targetQueries: [
      'ベクトルRAG',
      'RAG',
      'セマンティック検索',
      'AI検索'
    ],
    entities: [
      {
        entity: 'ベクトルRAG',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['RAG', 'セマンティック検索', 'AI検索', '知識資産'],
        searchIntents: ['ベクトルRAGとは', 'RAG システム'],
        coOccurringTerms: ['RAG', 'ベクトル', 'AI検索', 'セマンティック']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 3,
    relatedFragments: ['service-vector-rag', 'faq-vector-rag']
  },
  {
    id: 'faq-main-5',
    sectionName: 'AIエージェント開発について',
    targetQueries: [
      'AIエージェント',
      '自律的AI',
      'マルチエージェント',
      'AI自動化'
    ],
    entities: [
      {
        entity: 'AIエージェント',
        entityType: 'Technology',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['自律的AI', 'マルチエージェント', 'AI自動化', 'タスク実行'],
        searchIntents: ['AIエージェントとは', '自律的AI'],
        coOccurringTerms: ['AIエージェント', '自律的', '自動化', 'AI']
      }
    ],
    semanticWeight: 0.93,
    hierarchyLevel: 3,
    relatedFragments: ['service-ai-agents', 'faq-ai-agents']
  },
  {
    id: 'faq-main-6',
    sectionName: '導入期間・費用について',
    targetQueries: [
      '導入期間',
      '費用',
      'プロジェクト規模',
      '見積もり'
    ],
    entities: [
      {
        entity: '導入期間',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['費用', 'プロジェクト規模', 'チャットボット開発', '見積もり'],
        searchIntents: ['導入期間', '費用'],
        coOccurringTerms: ['導入期間', '費用', 'チャットボット', 'プロジェクト']
      }
    ],
    semanticWeight: 0.85,
    hierarchyLevel: 3,
    relatedFragments: ['contact-pricing', 'faq-pricing']
  },
  {
    id: 'faq-main-7',
    sectionName: '導入後サポート体制について',
    targetQueries: [
      'サポート体制',
      '24時間監視',
      '月次レポート',
      '定期メンテナンス'
    ],
    entities: [
      {
        entity: 'サポート体制',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['24時間監視', '月次レポート', '定期メンテナンス', '機能追加'],
        searchIntents: ['サポート体制', '24時間'],
        coOccurringTerms: ['サポート', '24時間', 'メンテナンス', 'レポート']
      }
    ],
    semanticWeight: 0.87,
    hierarchyLevel: 3,
    relatedFragments: ['contact-support', 'faq-support']
  },
  {
    id: 'faq-main-8',
    sectionName: 'セキュリティ対策について',
    targetQueries: [
      'セキュリティ対策',
      'AES-256暗号化',
      '多要素認証',
      'アクセス制御'
    ],
    entities: [
      {
        entity: 'セキュリティ対策',
        entityType: 'Service',
        context: 'implements',
        importance: 8,
        relatedKnowledge: ['AES-256暗号化', '多要素認証', 'アクセス制御', 'データ保護'],
        searchIntents: ['セキュリティ対策', '暗号化'],
        coOccurringTerms: ['セキュリティ', '暗号化', '認証', 'データ保護']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 3,
    relatedFragments: ['security-measures', 'faq-security']
  },

  // =============================================================================
  // メインページサービス Fragment IDs（新規追加）
  // =============================================================================
  {
    id: 'service-system-development',
    sectionName: 'システム開発サービス',
    targetQueries: [
      'システム開発 企業',
      'カスタムシステム 構築',
      'AI システム 開発',
      'システム構築 会社'
    ],
    entities: [
      {
        entity: 'システム開発',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['カスタム開発', 'AI開発', 'システム構築'],
        searchIntents: ['システム開発 会社', 'カスタムシステム 構築'],
        coOccurringTerms: ['要件定義', 'システム設計', 'プログラミング']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 2,
    relatedFragments: ['faq-main-1', 'service-ai-agents']
  },
  {
    id: 'service-aio-seo',
    sectionName: 'AIO SEO対策サービス',
    targetQueries: [
      'AIO SEO 対策',
      'AI検索 最適化',
      'Google AI Overviews',
      'LLMO 対策'
    ],
    entities: [
      {
        entity: 'AIO SEO対策',
        entityType: 'Service',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['AI検索最適化', 'LLMO', 'レリバンスエンジニアリング'],
        searchIntents: ['AIO SEO とは', 'AI検索 最適化 方法'],
        coOccurringTerms: ['Mike King理論', 'Google AI Overviews', 'Perplexity']
      }
    ],
    semanticWeight: 0.95,
    hierarchyLevel: 2,
    relatedFragments: ['faq-main-2', 'ai-search-optimization-overview']
  },
  {
    id: 'service-chatbot-development',
    sectionName: 'AIチャットボット開発',
    targetQueries: [
      'AIチャットボット 開発',
      'チャットボット 作成',
      'AI対話システム',
      'カスタムチャットボット'
    ],
    entities: [
      {
        entity: 'AIチャットボット開発',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['AI対話システム', 'チャットボット作成', 'カスタム開発'],
        searchIntents: ['チャットボット 開発 会社', 'AI対話システム 構築'],
        coOccurringTerms: ['OpenAI', 'Claude', '自然言語処理', 'NLP']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 2,
    relatedFragments: ['service-ai-agents', 'service-vector-rag']
  },
  {
    id: 'service-vector-rag',
    sectionName: 'ベクトルRAGシステム',
    targetQueries: [
      'RAG システム 構築',
      'ベクトル検索 開発',
      '文書検索AI',
      'Retrieval-Augmented Generation'
    ],
    entities: [
      {
        entity: 'ベクトルRAGシステム',
        entityType: 'Service',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['ベクトル検索', '文書検索AI', 'RAG構築'],
        searchIntents: ['RAG システム とは', 'ベクトル検索 実装'],
        coOccurringTerms: ['OpenAI Embeddings', 'pgvector', 'Supabase']
      }
    ],
    semanticWeight: 0.94,
    hierarchyLevel: 2,
    relatedFragments: ['service-chatbot-development', 'rag-system-architecture']
  },
  {
    id: 'service-ai-side-business',
    sectionName: 'AI副業支援サービス',
    targetQueries: [
      'AI副業 支援',
      'AI 副業 始め方',
      'AIスキル 副業',
      'AI副業 サポート'
    ],
    entities: [
      {
        entity: 'AI副業支援',
        entityType: 'Service',
        context: 'teaches',
        importance: 8,
        relatedKnowledge: ['AI副業', 'スキル習得', '副業サポート'],
        searchIntents: ['AI副業 方法', 'AIスキル 習得'],
        coOccurringTerms: ['スキルアップ', '収入向上', 'フリーランス']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['service-individual-reskilling', 'service-hr-support']
  },
  {
    id: 'service-hr-support',
    sectionName: 'HR支援ソリューション',
    targetQueries: [
      'HR支援 システム',
      '人事システム AI',
      '人材管理 DX',
      'HR デジタル化'
    ],
    entities: [
      {
        entity: 'HR支援ソリューション',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['人事システム', '人材管理', 'HRテック'],
        searchIntents: ['HR支援 システム', '人事 DX'],
        coOccurringTerms: ['人材管理', '採用支援', '人事評価']
      }
    ],
    semanticWeight: 0.85,
    hierarchyLevel: 2,
    relatedFragments: ['service-corporate-reskilling', 'faq-main-7']
  },
  {
    id: 'service-ai-agents',
    sectionName: 'AIエージェント開発',
    targetQueries: [
      'AIエージェント 開発',
      'AI自動化 システム',
      'AIワークフロー',
      'インテリジェントエージェント'
    ],
    entities: [
      {
        entity: 'AIエージェント開発',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['AI自動化', 'AIワークフロー', 'インテリジェントシステム'],
        searchIntents: ['AIエージェント とは', 'AI自動化 開発'],
        coOccurringTerms: ['マルチエージェント', 'AI協調', '自動化システム']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 2,
    relatedFragments: ['service-system-development', 'service-chatbot-development']
  },
  {
    id: 'service-mcp-servers',
    sectionName: 'MCPサーバー開発',
    targetQueries: [
      'MCP サーバー 開発',
      'Model Context Protocol',
      'MCP 実装',
      'AIモデル連携'
    ],
    entities: [
      {
        entity: 'MCPサーバー開発',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['Model Context Protocol', 'MCP実装', 'AIモデル連携'],
        searchIntents: ['MCP とは', 'MCPサーバー 構築'],
        coOccurringTerms: ['Claude', 'OpenAI', 'AIモデル統合']
      }
    ],
    semanticWeight: 0.87,
    hierarchyLevel: 2,
    relatedFragments: ['service-ai-agents', 'service-vector-rag']
  },
  {
    id: 'service-sns-automation',
    sectionName: 'SNS自動化システム',
    targetQueries: [
      'SNS 自動化',
      'ソーシャルメディア 自動投稿',
      'SNS管理 システム',
      'ソーシャル自動化'
    ],
    entities: [
      {
        entity: 'SNS自動化システム',
        entityType: 'Service',
        context: 'provides',
        importance: 7,
        relatedKnowledge: ['SNS自動化', 'ソーシャルメディア管理', '自動投稿'],
        searchIntents: ['SNS 自動化 ツール', 'ソーシャルメディア 管理'],
        coOccurringTerms: ['Twitter', 'LinkedIn', 'Facebook', 'Instagram']
      }
    ],
    semanticWeight: 0.82,
    hierarchyLevel: 2,
    relatedFragments: ['service-ai-agents', 'marketing-automation']
  },
  {
    id: 'service-video-generation',
    sectionName: 'AI動画生成サービス',
    targetQueries: [
      'AI動画生成',
      '動画 自動作成',
      'AI映像制作',
      '動画生成AI'
    ],
    entities: [
      {
        entity: 'AI動画生成',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['動画自動作成', 'AI映像制作', '動画生成技術'],
        searchIntents: ['AI動画生成 ツール', '動画 自動作成 サービス'],
        coOccurringTerms: ['Runway', 'Pika Labs', '動画編集AI']
      }
    ],
    semanticWeight: 0.84,
    hierarchyLevel: 2,
    relatedFragments: ['service-ai-agents', 'content-generation']
  },
  {
    id: 'youtube-medium-blog-integration',
    sectionName: 'YouTube中尺動画ブログ統合',
    targetQueries: [
      'YouTube 中尺動画 ブログ統合',
      '動画 記事 統合',
      'VideoObject Schema ブログ',
      'hasPartスキーマ 動画'
    ],
    entities: [
      {
        entity: 'YouTube中尺動画（130秒）',
        entityType: 'Product',
        context: 'uses',
        importance: 9,
        relatedKnowledge: ['YouTube中尺動画制作（130秒）', 'hasPartスキーマ動画統合', 'associatedMedia動画統合'],
        searchIntents: ['YouTube 中尺動画 統合', 'ブログ 動画 最適化'],
        coOccurringTerms: ['Fragment ID', 'Complete URI', 'ベクトルリンク', 'AI引用']
      },
      {
        entity: 'hasPartスキーマ（動画統合）',
        entityType: 'Technology',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['hasPartスキーマ動画統合', 'Mike King理論', 'エンティティリレーションシップ'],
        searchIntents: ['hasPart 動画', 'Schema.org 記事構成'],
        coOccurringTerms: ['WebPageElement', 'isPartOf', 'Article', 'VideoObject']
      },
      {
        entity: 'associatedMedia（動画統合）',
        entityType: 'Technology',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['associatedMedia動画統合', 'E-E-A-T最適化', 'VideoObject Schema'],
        searchIntents: ['associatedMedia Schema', '関連メディア 最適化'],
        coOccurringTerms: ['MediaObject', 'Rich Results', 'Google検索']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 2,
    relatedFragments: ['service-video-generation', 'aio-seo-optimization', 'multimodal-content-optimization-expertise']
  },
  {
    id: 'author-section-eeat-integration',
    sectionName: '著者セクションE-E-A-T統合',
    targetQueries: [
      '著者セクション 構造化データ',
      'E-E-A-T 著者情報',
      'Person Schema ブログ',
      '著者プロフィール 最適化'
    ],
    entities: [
      {
        entity: '著者セクション統合（E-E-A-T）',
        entityType: 'Concept',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['E-E-A-T最適化', 'hasPartスキーマ動画統合', 'レリバンスエンジニアリング'],
        searchIntents: ['著者 E-E-A-T', 'Person Schema 実装'],
        coOccurringTerms: ['AuthorProfile', 'TrustSignals', 'Expertise', 'Authoritativeness']
      },
      {
        entity: 'Fragment ID（著者プロフィール）',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['Fragment ID', 'ベクトルリンク化', 'AI引用最適化'],
        searchIntents: ['著者 Fragment ID', 'author-profile ベクトル化'],
        coOccurringTerms: ['Complete URI', 'AI Citation', 'Deep Link']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 2,
    relatedFragments: ['haspart-video-integration-expertise', 'eeat-optimization']
  },
  {
    id: 'service-corporate-reskilling',
    sectionName: '法人向けAIリスキリング',
    targetQueries: [
      '法人 リスキリング',
      '企業 AI研修',
      '法人向け AI教育',
      '企業研修 AI'
    ],
    entities: [
      {
        entity: '法人向けAIリスキリング',
        entityType: 'Service',
        context: 'teaches',
        importance: 9,
        relatedKnowledge: ['企業研修', 'AI教育', 'デジタル人材育成'],
        searchIntents: ['法人 リスキリング 研修', '企業 AI教育'],
        coOccurringTerms: ['デジタルトランスフォーメーション', 'DX人材', '企業研修']
      }
    ],
    semanticWeight: 0.89,
    hierarchyLevel: 2,
    relatedFragments: ['faq-main-1', 'service-hr-support']
  },
  {
    id: 'service-individual-reskilling',
    sectionName: '個人向けAIリスキリング',
    targetQueries: [
      '個人 リスキリング',
      'AI スキル習得',
      '個人向け AI研修',
      'AIスキル 学習'
    ],
    entities: [
      {
        entity: '個人向けAIリスキリング',
        entityType: 'Service',
        context: 'teaches',
        importance: 8,
        relatedKnowledge: ['AIスキル習得', '個人研修', 'スキルアップ'],
        searchIntents: ['AI スキル 習得方法', '個人 リスキリング 講座'],
        coOccurringTerms: ['スキルアップ', 'キャリアチェンジ', 'AI学習']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['service-ai-side-business', 'individual-training']
  },

  // =============================================================================
  // メインページAIサイトセクション Fragment IDs（新規追加）
  // =============================================================================
  {
    id: 'ai-site-showcase',
    sectionName: 'AIサイトショーケース',
    targetQueries: [
      'AIサイト 事例',
      'AI引用 実績',
      'AIサイト デモ',
      'AI検索対応サイト 例'
    ],
    entities: [
      {
        entity: 'AIサイトショーケース',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['AIサイト事例', 'AI引用実績', 'デモサイト'],
        searchIntents: ['AIサイト 事例', 'AI引用 実績'],
        coOccurringTerms: ['ポートフォリオ', '実績紹介', 'ケーススタディ']
      }
    ],
    semanticWeight: 0.87,
    hierarchyLevel: 2,
    relatedFragments: ['nands-ai-site', 'ai-site-features']
  },
  {
    id: 'nands-ai-site',
    sectionName: 'NANDSのAIサイト',
    targetQueries: [
      'NANDS AIサイト',
      'エヌアンドエス AIサイト',
      'NANDS AI引用',
      'エヌアンドエス AI対応'
    ],
    entities: [
      {
        entity: 'NANDSのAIサイト',
        entityType: 'Service',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['AI引用対応', 'AI検索最適化', 'レリバンスエンジニアリング'],
        searchIntents: ['NANDS AIサイト とは', 'エヌアンドエス AI対応'],
        coOccurringTerms: ['Mike King理論', 'AI検索エンジン', 'Fragment ID']
      }
    ],
    semanticWeight: 0.96,
    hierarchyLevel: 1,
    relatedFragments: ['faq-main-ai-site-definition', 'ai-search-optimization-overview']
  },
  {
    id: 'ai-site-features',
    sectionName: 'AIサイト機能',
    targetQueries: [
      'AIサイト 機能',
      'AI引用 機能',
      'AIサイト 特徴',
      'AI検索対応 機能'
    ],
    entities: [
      {
        entity: 'AIサイト機能',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['AI引用機能', 'Fragment ID', '構造化データ'],
        searchIntents: ['AIサイト 機能一覧', 'AI引用 仕組み'],
        coOccurringTerms: ['Fragment ID', '構造化データ', 'Schema.org']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 2,
    relatedFragments: ['ai-site-technology', 'faq-main-ai-site-features']
  },
  {
    id: 'ai-site-technology',
    sectionName: 'AIサイト技術',
    targetQueries: [
      'AIサイト 技術',
      'AI引用 技術',
      'AIサイト 実装',
      'AI検索対応 技術'
    ],
    entities: [
      {
        entity: 'AIサイト技術',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['Fragment ID技術', '構造化データ技術', 'レリバンスエンジニアリング'],
        searchIntents: ['AIサイト 技術仕様', 'AI引用 実装方法'],
        coOccurringTerms: ['Next.js', 'TypeScript', 'Schema.org', 'JSON-LD']
      }
    ],
    semanticWeight: 0.89,
    hierarchyLevel: 2,
    relatedFragments: ['ai-site-features', 'technical-implementation']
  },
  {
    id: 'ai-site-heading',
    sectionName: 'AIサイト見出し',
    targetQueries: [
      'AIサイト 見出し',
      'AI引用 タイトル',
      'AIサイト ヘッダー',
      'AI検索対応 見出し'
    ],
    entities: [
      {
        entity: 'AIサイト見出し',
        entityType: 'Service',
        context: 'provides',
        importance: 7,
        relatedKnowledge: ['AIサイトタイトル', 'AI引用見出し', 'ヘッダー最適化'],
        searchIntents: ['AIサイト タイトル', 'AI引用 見出し'],
        coOccurringTerms: ['H1タグ', 'タイトル最適化', 'SEO見出し']
      }
    ],
    semanticWeight: 0.83,
    hierarchyLevel: 3,
    relatedFragments: ['nands-ai-site', 'ai-site-showcase']
  },

  // =============================================================================
  // ai-siteページ FAQ Fragment IDs（新規追加）
  // =============================================================================
  {
    id: 'faq-1',
    sectionName: 'AIサイト定義FAQ',
    targetQueries: [
      'AIサイト とは',
      'AI引用 サイト',
      'レリバンスエンジニアリング',
      'AIに引用される サイト'
    ],
    entities: [
      {
        entity: 'AIサイト',
        entityType: 'Concept',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['AI引用', 'レリバンスエンジニアリング', 'ChatGPT', 'Perplexity'],
        searchIntents: ['AIサイト 意味', 'AI引用 仕組み'],
        coOccurringTerms: ['Fragment ID', '構造化データ', 'Complete URI']
      }
    ],
    semanticWeight: 0.98,
    hierarchyLevel: 1,
    relatedFragments: ['faq-2', 'nands-ai-site', 'faq-main-ai-site-definition']
  },
  {
    id: 'faq-2',
    sectionName: 'AIサイト vs 通常サイトFAQ',
    targetQueries: [
      'AIサイト 違い',
      '通常サイト AI最適化',
      'AI検索 対応',
      'Fragment ID 効果'
    ],
    entities: [
      {
        entity: 'AIサイト差別化',
        entityType: 'Concept',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['Fragment ID', '構造化データ', 'Triple RAG', 'AI検索最適化'],
        searchIntents: ['AIサイト メリット', 'AI最適化 効果'],
        coOccurringTerms: ['Mike King理論', 'レリバンスエンジニアリング']
      }
    ],
    semanticWeight: 0.95,
    hierarchyLevel: 2,
    relatedFragments: ['faq-1', 'faq-3', 'ai-site-features']
  },
  {
    id: 'faq-3',
    sectionName: 'AI引用重要性FAQ',
    targetQueries: [
      'AI引用 重要性',
      'AI検索 普及',
      'Google検索 変化',
      '競合優位性 AI'
    ],
    entities: [
      {
        entity: 'AI引用重要性',
        entityType: 'Concept',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['AI検索普及', '競合優位性', 'Google AI Overviews'],
        searchIntents: ['AI引用 必要性', 'AI検索 トレンド'],
        coOccurringTerms: ['ChatGPT', 'Perplexity', 'Claude']
      }
    ],
    semanticWeight: 0.94,
    hierarchyLevel: 2,
    relatedFragments: ['faq-2', 'faq-4', 'faq-21']
  },
  {
    id: 'faq-4',
    sectionName: 'レリバンスエンジニアリングFAQ',
    targetQueries: [
      'レリバンスエンジニアリング とは',
      'Mike King理論',
      'AI検索最適化 手法',
      'SEO 進化'
    ],
    entities: [
      {
        entity: 'レリバンスエンジニアリング',
        entityType: 'Technology',
        context: 'implements',
        importance: 10,
        relatedKnowledge: ['Mike King理論', 'AI検索最適化', 'SEO進化'],
        searchIntents: ['Mike King とは', 'レリバンスエンジニアリング 方法'],
        coOccurringTerms: ['情報設計', '構造化技術', 'AI理解']
      }
    ],
    semanticWeight: 0.96,
    hierarchyLevel: 1,
    relatedFragments: ['faq-3', 'faq-5', 'faq-main-aio']
  },
  {
    id: 'faq-5',
    sectionName: 'Fragment IDFAQ',
    targetQueries: [
      'Fragment ID とは',
      'Complete URI',
      'AI引用 精度',
      'ディープリンク'
    ],
    entities: [
      {
        entity: 'Fragment ID',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['Complete URI', 'ディープリンク', 'AI引用精度'],
        searchIntents: ['Fragment ID 実装', 'Complete URI 仕組み'],
        coOccurringTerms: ['#section-1', 'URL構造', 'AI引用']
      }
    ],
    semanticWeight: 0.93,
    hierarchyLevel: 2,
    relatedFragments: ['faq-4', 'faq-6', 'faq-9']
  },
  {
    id: 'faq-6',
    sectionName: 'Triple RAGFAQ',
    targetQueries: [
      'Triple RAG システム',
      'RAG 3つ データソース',
      'Retrieval-Augmented Generation',
      'AI回答 精度向上'
    ],
    entities: [
      {
        entity: 'Triple RAG',
        entityType: 'Technology',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['企業情報', '業界トレンド', 'YouTube動画', 'RAGシステム'],
        searchIntents: ['Triple RAG とは', 'RAG システム 種類'],
        coOccurringTerms: ['多角的情報', 'AI回答精度', 'データ統合']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 2,
    relatedFragments: ['faq-5', 'faq-7', 'service-vector-rag']
  },
  {
    id: 'faq-7',
    sectionName: '構造化データFAQ',
    targetQueries: [
      '構造化データ 役割',
      'JSON-LD 形式',
      'AI理解 データ',
      'Schema.org'
    ],
    entities: [
      {
        entity: '構造化データ',
        entityType: 'Technology',
        context: 'implements',
        importance: 8,
        relatedKnowledge: ['JSON-LD', 'Schema.org', 'AI理解', '機械可読'],
        searchIntents: ['構造化データ 実装', 'JSON-LD とは'],
        coOccurringTerms: ['メタデータ', 'セマンティック', 'AI解釈']
      }
    ],
    semanticWeight: 0.89,
    hierarchyLevel: 2,
    relatedFragments: ['faq-6', 'faq-8', 'haspart-schema-system']
  },
  {
    id: 'faq-8',
    sectionName: '自動ベクトルブログFAQ',
    targetQueries: [
      '自動ベクトルブログ',
      'Triple RAG ブログ生成',
      'SEO AI最適化',
      '自動記事生成'
    ],
    entities: [
      {
        entity: '自動ベクトルブログ',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['Triple RAG', 'SEO最適化', 'AI引用最適化', '自動生成'],
        searchIntents: ['自動ブログ生成', 'ベクトルブログ とは'],
        coOccurringTerms: ['権威性向上', 'AI引用確率', '継続的最適化']
      }
    ],
    semanticWeight: 0.87,
    hierarchyLevel: 2,
    relatedFragments: ['faq-7', 'faq-9', 'auto-rag-generation']
  },
  {
    id: 'faq-9',
    sectionName: 'Complete URIFAQ',
    targetQueries: [
      'Complete URI 仕組み',
      'Fragment ID URL',
      'AI引用 リンク',
      'https://domain.com/page#fragment'
    ],
    entities: [
      {
        entity: 'Complete URI',
        entityType: 'Technology',
        context: 'implements',
        importance: 8,
        relatedKnowledge: ['Fragment ID', 'URL構造', 'AI引用リンク', 'ディープリンク'],
        searchIntents: ['Complete URI 実装', 'Fragment URL 構造'],
        coOccurringTerms: ['正確引用', 'リンク生成', 'AI参照']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['faq-8', 'faq-10', 'faq-5']
  },
  {
    id: 'faq-10',
    sectionName: 'ベクトル検索違いFAQ',
    targetQueries: [
      'ベクトル検索 違い',
      'AI引用 最適化',
      'Fragment ID 連携',
      '引用精度 向上'
    ],
    entities: [
      {
        entity: 'ベクトル検索最適化',
        entityType: 'Technology',
        context: 'optimizes',
        importance: 8,
        relatedKnowledge: ['AI引用最適化', 'Fragment ID連携', '構造化データ', '引用精度'],
        searchIntents: ['ベクトル検索 AI最適化', '引用精度 改善'],
        coOccurringTerms: ['類似検索', 'セマンティック', 'AI理解']
      }
    ],
    semanticWeight: 0.85,
    hierarchyLevel: 2,
    relatedFragments: ['faq-9', 'faq-11', 'service-vector-rag']
  },
  {
    id: 'faq-11',
    sectionName: 'AI引用メリットFAQ',
    targetQueries: [
      'AI引用 メリット',
      'ブランド権威性',
      '検索露出 増加',
      '信頼できる情報源'
    ],
    entities: [
      {
        entity: 'AI引用メリット',
        entityType: 'Concept',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['ブランド権威性', '検索露出', '信頼性向上', '集客チャネル'],
        searchIntents: ['AI引用 効果', 'ブランド価値 向上'],
        coOccurringTerms: ['競合優位性', '先行利益', '権威性確保']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 2,
    relatedFragments: ['faq-10', 'faq-12', 'faq-main-ai-site-benefits']
  },
  {
    id: 'faq-12',
    sectionName: 'ROI投資対効果FAQ',
    targetQueries: [
      'ROI 投資対効果',
      'AIサイト 効果測定',
      'ブランド認知 向上',
      '長期資産価値'
    ],
    entities: [
      {
        entity: 'ROI効果',
        entityType: 'Concept',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['投資対効果', 'ブランド認知', '信頼性向上', '長期資産'],
        searchIntents: ['AIサイト ROI', '効果測定 方法'],
        coOccurringTerms: ['競争優位性', '持続的効果', 'SEO比較']
      }
    ],
    semanticWeight: 0.88,
    hierarchyLevel: 2,
    relatedFragments: ['faq-11', 'faq-13', 'pricing']
  },
  {
    id: 'faq-13',
    sectionName: '導入効果測定FAQ',
    targetQueries: [
      '導入効果 測定方法',
      'AI引用回数',
      'Fragment ID アクセス',
      '分析ダッシュボード'
    ],
    entities: [
      {
        entity: '効果測定システム',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['AI引用回数', 'Fragment IDアクセス', '構造化データ認識', 'AI検索ランキング'],
        searchIntents: ['効果測定 ツール', 'AI引用 分析'],
        coOccurringTerms: ['可視化', 'ダッシュボード', 'データ分析']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['faq-12', 'faq-14', 'roi-section']
  },
  {
    id: 'faq-14',
    sectionName: '競合差別化FAQ',
    targetQueries: [
      '競合他社 差別化',
      'AI引用最適化 先行者利益',
      'レリバンスエンジニアリング 実装',
      '圧倒的差別化'
    ],
    entities: [
      {
        entity: '競合差別化',
        entityType: 'Concept',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['先行者利益', 'AI引用最適化', 'レリバンスエンジニアリング', '差別化要因'],
        searchIntents: ['競合優位性 確保', 'AI最適化 差別化'],
        coOccurringTerms: ['新分野', '対応企業少数', '圧倒的優位']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 2,
    relatedFragments: ['faq-13', 'faq-15', 'faq-3']
  },
  {
    id: 'faq-15',
    sectionName: '24時間365日無人営業FAQ',
    targetQueries: [
      '24時間365日 無人営業',
      'AI自動営業',
      'AIが営業マン',
      '自動見込み客獲得'
    ],
    entities: [
      {
        entity: '無人営業システム',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['AI自動営業', '見込み客獲得', '人的営業不要', 'AIマーケティング'],
        searchIntents: ['無人営業 仕組み', 'AI営業 効果'],
        coOccurringTerms: ['自動引用', '自動紹介', '新マーケティング']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 2,
    relatedFragments: ['faq-14', 'faq-16', 'ai-site-features']
  },
  {
    id: 'faq-16',
    sectionName: '既存サイト実装FAQ',
    targetQueries: [
      '既存サイト 実装可能',
      'WordPress Fragment ID',
      '独自CMS 対応',
      'ヘッドレス構成'
    ],
    entities: [
      {
        entity: '既存サイト実装',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['WordPress対応', '独自CMS', 'Fragment ID追加', '構造化データ実装'],
        searchIntents: ['既存サイト AI最適化', 'WordPress Fragment ID'],
        coOccurringTerms: ['サブディレクトリ', 'ヘッドレス', 'CMS問わず']
      }
    ],
    semanticWeight: 0.84,
    hierarchyLevel: 2,
    relatedFragments: ['faq-15', 'faq-17', 'faq-main-system-dev']
  },
  {
    id: 'faq-17',
    sectionName: '実装期間FAQ',
    targetQueries: [
      '実装期間 どれくらい',
      'AIサイト 構築期間',
      '6-10週間',
      '要件定義から本番'
    ],
    entities: [
      {
        entity: '実装期間',
        entityType: 'Service',
        context: 'provides',
        importance: 7,
        relatedKnowledge: ['6-10週間', '要件定義', '設計実装', 'テスト本番'],
        searchIntents: ['AIサイト 開発期間', '実装 スケジュール'],
        coOccurringTerms: ['一貫サポート', '規模変動', '基本パッケージ']
      }
    ],
    semanticWeight: 0.82,
    hierarchyLevel: 2,
    relatedFragments: ['faq-16', 'faq-18', 'pricing']
  },
  {
    id: 'faq-18',
    sectionName: 'IT補助金FAQ',
    targetQueries: [
      'IT補助金 活用',
      'IT導入補助金',
      '最大3/4 補助率',
      '申請サポート'
    ],
    entities: [
      {
        entity: 'IT補助金活用',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['IT導入補助金', '補助率3/4', '導入コスト削減', '申請サポート'],
        searchIntents: ['IT補助金 対象', 'AIサイト 補助金'],
        coOccurringTerms: ['コスト削減', '申請手続き', '補助金対象']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['faq-17', 'faq-19', 'subsidy']
  },
  {
    id: 'faq-19',
    sectionName: '運用保守FAQ',
    targetQueries: [
      '運用保守 必要性',
      '自動運転設計',
      'AI検索仕様 変更対応',
      '月額10-15万円'
    ],
    entities: [
      {
        entity: '運用保守サービス',
        entityType: 'Service',
        context: 'provides',
        importance: 7,
        relatedKnowledge: ['自動運転設計', 'AI検索仕様変更', '最適化調整', '月額保守'],
        searchIntents: ['AIサイト 運用', '保守 必要性'],
        coOccurringTerms: ['仕様変更対応', '継続最適化', '推奨サービス']
      }
    ],
    semanticWeight: 0.81,
    hierarchyLevel: 2,
    relatedFragments: ['faq-18', 'faq-20', 'pricing']
  },
  {
    id: 'faq-20',
    sectionName: 'セキュリティ対策FAQ',
    targetQueries: [
      'セキュリティ対策',
      '企業機密情報 保護',
      '情報機密レベル管理',
      'アクセス制御'
    ],
    entities: [
      {
        entity: 'セキュリティ対策',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['企業機密保護', '情報レベル管理', 'アクセス制御', '公開情報選別'],
        searchIntents: ['AIサイト セキュリティ', '機密情報 保護'],
        coOccurringTerms: ['機密レベル', '適切保護', '徹底管理']
      }
    ],
    semanticWeight: 0.83,
    hierarchyLevel: 2,
    relatedFragments: ['faq-19', 'faq-21', 'faq-main-system-dev']
  },
  {
    id: 'faq-21',
    sectionName: 'AI検索普及FAQ',
    targetQueries: [
      'AI検索 普及状況',
      'ChatGPT Perplexity 普及',
      'Google AI Overviews',
      '2025年 AI検索移行'
    ],
    entities: [
      {
        entity: 'AI検索普及',
        entityType: 'Concept',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['ChatGPT普及', 'Perplexity', 'Google AI Overviews', 'AI検索移行'],
        searchIntents: ['AI検索 トレンド', 'Google検索 変化'],
        coOccurringTerms: ['急速普及', '本格化予想', '検索移行']
      }
    ],
    semanticWeight: 0.93,
    hierarchyLevel: 2,
    relatedFragments: ['faq-20', 'faq-22', 'faq-3']
  },
  {
    id: 'faq-22',
    sectionName: '効果的業界FAQ',
    targetQueries: [
      '効果的 業界',
      'BtoB製造業 AI引用',
      '士業 AIサイト',
      'IT企業 AI最適化'
    ],
    entities: [
      {
        entity: '業界別効果',
        entityType: 'Concept',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['BtoB製造業', '士業', 'コンサルティング', 'IT企業'],
        searchIntents: ['業界別 AI効果', '専門知識 AI引用'],
        coOccurringTerms: ['専門知識', '技術情報', '権威性向上']
      }
    ],
    semanticWeight: 0.87,
    hierarchyLevel: 2,
    relatedFragments: ['faq-21', 'faq-23', 'use-cases']
  },
  {
    id: 'faq-23',
    sectionName: 'Google検索関係FAQ',
    targetQueries: [
      'Google検索 関係',
      'Google AI Overviews',
      'SGE Search Generative Experience',
      'SEO 相乗効果'
    ],
    entities: [
      {
        entity: 'Google AI統合',
        entityType: 'Technology',
        context: 'integrates',
        importance: 9,
        relatedKnowledge: ['Google AI Overviews', 'SGE', 'AI引用最適化', 'SEO相乗効果'],
        searchIntents: ['Google AI 対応', 'SEO AI統合'],
        coOccurringTerms: ['従来SEO', '相乗効果', 'AI最適化重要']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 2,
    relatedFragments: ['faq-22', 'faq-24', 'service-aio-seo']
  },
  {
    id: 'faq-24',
    sectionName: '他AI対応FAQ',
    targetQueries: [
      'ChatGPT Claude以外 AI対応',
      'Perplexity Gemini 対応',
      'Bing Chat 対応',
      '新AIサービス 対応'
    ],
    entities: [
      {
        entity: '多AI対応',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['Perplexity対応', 'Gemini対応', 'Bing Chat', '新AIサービス'],
        searchIntents: ['AI検索エンジン 対応', '複数AI 最適化'],
        coOccurringTerms: ['主要AI対応', '迅速対応', '幅広い対応']
      }
    ],
    semanticWeight: 0.85,
    hierarchyLevel: 2,
    relatedFragments: ['faq-23', 'faq-25', 'ai-site-technology']
  },
  {
    id: 'faq-25',
    sectionName: '国際展開FAQ',
    targetQueries: [
      '国際展開 可能',
      '多言語対応',
      '英語 中国語 対応',
      'グローバル AI最適化'
    ],
    entities: [
      {
        entity: '国際対応',
        entityType: 'Service',
        context: 'provides',
        importance: 7,
        relatedKnowledge: ['多言語対応', '英語対応', '中国語対応', 'グローバル最適化'],
        searchIntents: ['多言語 AIサイト', '国際 AI最適化'],
        coOccurringTerms: ['構造化データ多言語', 'Fragment ID国際', 'グローバル展開']
      }
    ],
    semanticWeight: 0.80,
    hierarchyLevel: 2,
    relatedFragments: ['faq-24', 'faq-26', 'contact']
  },
  {
    id: 'faq-26',
    sectionName: 'AI引用リスクFAQ',
    targetQueries: [
      'AI引用 リスク',
      '情報誤解釈 リスク',
      'Fragment ID 正確引用',
      'ブランド価値 向上'
    ],
    entities: [
      {
        entity: 'AI引用リスク管理',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['リスク最小化', '誤解釈防止', 'Fragment ID正確性', 'ブランド価値'],
        searchIntents: ['AI引用 安全性', 'リスク対策'],
        coOccurringTerms: ['適切実装', '正確引用', '価値向上']
      }
    ],
    semanticWeight: 0.84,
    hierarchyLevel: 2,
    relatedFragments: ['faq-25', 'faq-27', 'faq-5']
  },
  {
    id: 'faq-27',
    sectionName: '従来SEO違いFAQ',
    targetQueries: [
      '従来SEO 違い',
      'SEO 人間向け',
      'AI引用最適化 AI向け',
      '並行実施 効果'
    ],
    entities: [
      {
        entity: 'SEO AI最適化比較',
        entityType: 'Concept',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['従来SEO', 'AI向け最適化', '人間向け検索', '並行実施'],
        searchIntents: ['SEO AI違い', '最適化 比較'],
        coOccurringTerms: ['現在未来対応', '両方実施', '検索環境対応']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 2,
    relatedFragments: ['faq-26', 'faq-28', 'faq-4']
  },
  {
    id: 'faq-28',
    sectionName: '小規模企業効果FAQ',
    targetQueries: [
      '小規模企業 効果',
      '大企業同等 露出機会',
      '専門性 アピール',
      'AI引用 機会増加'
    ],
    entities: [
      {
        entity: '小規模企業効果',
        entityType: 'Concept',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['大企業同等機会', '専門性アピール', '露出機会増加', 'AI引用効果'],
        searchIntents: ['中小企業 AI効果', '小規模 AI最適化'],
        coOccurringTerms: ['むしろ効果的', '同等機会', '専門性強化']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['faq-27', 'faq-29', 'faq-11']
  },
  {
    id: 'faq-29',
    sectionName: '他社サービス違いFAQ',
    targetQueries: [
      '他社サービス 違い',
      'レリバンスエンジニアリング 本格実装',
      'Triple RAG Fragment ID',
      '包括的ソリューション'
    ],
    entities: [
      {
        entity: '他社差別化要因',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['レリバンスエンジニアリング本格実装', 'Triple RAG', 'Fragment ID自動', '包括的ソリューション'],
        searchIntents: ['サービス比較', '独自性 確認'],
        coOccurringTerms: ['AI引用特化', '本格実装', '包括的提供']
      }
    ],
    semanticWeight: 0.91,
    hierarchyLevel: 2,
    relatedFragments: ['faq-28', 'faq-30', 'faq-14']
  },
  {
    id: 'faq-30',
    sectionName: '成果保証FAQ',
    targetQueries: [
      '成果が出ない場合',
      'AI検索 新分野',
      '効果測定方法',
      '継続的最適化'
    ],
    entities: [
      {
        entity: '成果保証システム',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['新分野対応', '効果測定', '継続最適化', '長期取り組み'],
        searchIntents: ['成果保証 内容', 'AI最適化 効果'],
        coOccurringTerms: ['段階的向上', '継続サポート', '長期視点']
      }
    ],
    semanticWeight: 0.87,
    hierarchyLevel: 2,
    relatedFragments: ['faq-29', 'contact', 'faq-13']
  },

  // ===== 法的文書Fragment IDs =====
  // プライバシーポリシーページ
  {
    id: 'privacy-header',
    sectionName: 'プライバシーポリシー - ヘッダー',
    targetQueries: [
      'プライバシーポリシー',
      '個人情報保護',
      'AI DX時代 個人情報',
      '安心安全 データ管理'
    ],
    entities: [
      {
        entity: 'プライバシーポリシー',
        entityType: 'LegalDocument',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['個人情報保護', 'AI・DX時代対応', '安心安全管理'],
        searchIntents: ['プライバシーポリシー 確認', '個人情報 取扱い'],
        coOccurringTerms: ['個人情報保護', 'データ保護', 'セキュリティ', 'GDPR']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 1,
    relatedFragments: ['privacy-policy', 'privacy-compliance', 'privacy-security']
  },
  {
    id: 'privacy-policy',
    sectionName: 'プライバシーポリシー - 基本方針',
    targetQueries: [
      '個人情報保護 基本方針',
      '法令遵守 個人情報',
      'Cookie使用 ポリシー',
      '個人情報 安全管理'
    ],
    entities: [
      {
        entity: '個人情報保護基本方針',
        entityType: 'Policy',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['個人情報保護法', '適正取得利用', '安全管理措置'],
        searchIntents: ['個人情報 取扱い方針', 'Cookie 利用方針'],
        coOccurringTerms: ['個人情報保護法', '関連法令', '適正取扱い', 'Cookie']
      }
    ],
    semanticWeight: 0.88,
    hierarchyLevel: 2,
    relatedFragments: ['privacy-header', 'privacy-compliance', 'privacy-cookies']
  },
  {
    id: 'privacy-compliance',
    sectionName: 'プライバシーポリシー - 法令遵守',
    targetQueries: [
      '個人情報保護法 遵守',
      'ガイドライン 対応',
      '適正 個人情報取得',
      '法令 個人情報管理'
    ],
    entities: [
      {
        entity: '個人情報保護法遵守',
        entityType: 'Compliance',
        context: 'ensures',
        importance: 8,
        relatedKnowledge: ['個人情報保護法', '政省令', 'ガイドライン'],
        searchIntents: ['法令遵守 個人情報', '適正取扱い 方法'],
        coOccurringTerms: ['個人情報保護法', '政省令', 'ガイドライン', '適正取扱い']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['privacy-policy', 'privacy-security', 'legal-compliance']
  },
  {
    id: 'privacy-security',
    sectionName: 'プライバシーポリシー - 安全管理',
    targetQueries: [
      '個人情報 安全管理',
      '漏洩防止 対策',
      '不正アクセス 防止',
      '技術的 安全管理措置'
    ],
    entities: [
      {
        entity: '個人情報安全管理',
        entityType: 'SecurityMeasure',
        context: 'implements',
        importance: 8,
        relatedKnowledge: ['安全管理措置', '漏洩防止', '従業員教育'],
        searchIntents: ['個人情報 セキュリティ', '安全管理 方法'],
        coOccurringTerms: ['安全管理措置', '漏洩防止', '不正アクセス防止', '継続改善']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['privacy-compliance', 'privacy-disclosure', 'privacy-cookies']
  },
  {
    id: 'privacy-disclosure',
    sectionName: 'プライバシーポリシー - 開示・訂正・削除',
    targetQueries: [
      '個人情報 開示請求',
      '個人情報 訂正請求',
      '個人情報 削除請求',
      '本人確認 手続き'
    ],
    entities: [
      {
        entity: '個人情報開示対応',
        entityType: 'Service',
        context: 'provides',
        importance: 7,
        relatedKnowledge: ['開示請求', '訂正削除', '本人確認', '法令対応'],
        searchIntents: ['個人情報 開示方法', '訂正削除 手続き'],
        coOccurringTerms: ['開示請求', '訂正請求', '削除請求', '本人確認']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['privacy-security', 'privacy-cookies', 'terms-usage']
  },
  {
    id: 'privacy-cookies',
    sectionName: 'プライバシーポリシー - Cookie使用',
    targetQueries: [
      'Cookie 使用方針',
      'ブラウザ設定 Cookie',
      'サービス改善 Cookie',
      'Cookie 制限拒否'
    ],
    entities: [
      {
        entity: 'Cookie使用方針',
        entityType: 'Policy',
        context: 'defines',
        importance: 7,
        relatedKnowledge: ['Cookie利用', 'ブラウザ設定', 'サービス改善'],
        searchIntents: ['Cookie とは', 'Cookie 設定方法'],
        coOccurringTerms: ['Cookie', 'ブラウザ設定', 'サービス改善', '利便性向上']
      }
    ],
    semanticWeight: 0.84,
    hierarchyLevel: 2,
    relatedFragments: ['privacy-disclosure', 'privacy-policy', 'terms-usage']
  },

  // 利用規約ページ
  {
    id: 'terms-header',
    sectionName: '利用規約 - ヘッダー',
    targetQueries: [
      '利用規約',
      'サービス利用規約',
      'AI研修 利用規約',
      'DX支援 利用規約'
    ],
    entities: [
      {
        entity: 'サービス利用規約',
        entityType: 'LegalDocument',
        context: 'defines',
        importance: 8,
        relatedKnowledge: ['AI研修サービス', 'DX支援サービス', 'キャリア支援'],
        searchIntents: ['利用規約 確認', 'サービス 利用条件'],
        coOccurringTerms: ['利用規約', 'AI研修', 'DX支援', 'キャリア支援']
      }
    ],
    semanticWeight: 0.88,
    hierarchyLevel: 1,
    relatedFragments: ['terms-usage', 'privacy-header', 'legal-header']
  },
  {
    id: 'terms-usage',
    sectionName: '利用規約 - 利用条件',
    targetQueries: [
      'サービス利用条件',
      'AI研修 利用条件',
      '利用者義務',
      '禁止行為 利用規約'
    ],
    entities: [
      {
        entity: 'サービス利用条件',
        entityType: 'Terms',
        context: 'specifies',
        importance: 8,
        relatedKnowledge: ['利用者義務', '禁止行為', '適正利用'],
        searchIntents: ['利用条件 詳細', '利用者 義務'],
        coOccurringTerms: ['利用条件', '利用者義務', '禁止事項', '適正利用']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['terms-header', 'privacy-policy', 'legal-compliance']
  },

  // 法的情報ページ
  {
    id: 'legal-header',
    sectionName: '法的情報 - ヘッダー',
    targetQueries: [
      '法的情報',
      '特定商取引法 表記',
      'コンプライアンス',
      '透明性 企業経営'
    ],
    entities: [
      {
        entity: '法的情報',
        entityType: 'LegalDocument',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['特定商取引法', 'コンプライアンス', 'Trust Layer'],
        searchIntents: ['法的情報 確認', '特定商取引法 表記'],
        coOccurringTerms: ['法的情報', '特定商取引法', 'コンプライアンス', '透明性']
      }
    ],
    semanticWeight: 0.88,
    hierarchyLevel: 1,
    relatedFragments: ['legal-compliance', 'privacy-header', 'terms-header']
  },
  {
    id: 'legal-compliance',
    sectionName: '法的情報 - 法令遵守',
    targetQueries: [
      '法令遵守',
      'コンプライアンス体制',
      '社会的責任',
      '適用法令 遵守'
    ],
    entities: [
      {
        entity: 'コンプライアンス体制',
        entityType: 'Compliance',
        context: 'maintains',
        importance: 8,
        relatedKnowledge: ['法令遵守', '社会的責任', 'コンプライアンス維持'],
        searchIntents: ['コンプライアンス とは', '法令遵守 体制'],
        coOccurringTerms: ['法令遵守', '社会的責任', 'コンプライアンス体制', '規則遵守']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['legal-header', 'privacy-compliance', 'terms-usage']
  },

  // ===== ブログ記事著者Fragment ID =====
  {
    id: 'author-profile',
    sectionName: '著者プロフィール - 原田賢治',
    targetQueries: [
      '原田賢治',
      '代表取締役',
      'AI技術責任者',
      'レリバンスエンジニアリング専門家',
      'Mike King理論 専門家',
      'AI研修講師',
      'NANDS代表',
      'AI検索最適化 専門家',
      'Triple RAG 開発者',
      'ベクトル検索 専門家'
    ],
    entities: [
      {
        entity: '原田賢治プロフィール',
        entityType: 'Person',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['レリバンスエンジニアリング', 'Mike King理論', 'AI検索最適化', 'Triple RAG', 'ベクトル検索システム', 'AI研修', 'DX支援', 'システム開発'],
        searchIntents: ['原田賢治 プロフィール', 'NANDS 代表', 'AI専門家 経歴', 'レリバンスエンジニアリング 専門家'],
        coOccurringTerms: ['原田賢治', 'NANDS', 'レリバンスエンジニアリング', 'Mike King理論', 'AI検索最適化', 'ChatGPT', 'Perplexity', 'GEO対策', 'AI研修', 'Triple RAG', 'ベクトル検索システム', '自動記事生成システム']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 2,
    relatedFragments: ['main-title', 'service-ai-search-optimization', 'service-corporate-training']
  },
  
  // =============================================================================
  // 🎯 Aboutページ Fragment IDs（8個） - 企業情報・代表者情報
  // =============================================================================
  
  {
    id: 'hero',
    sectionName: 'NANDS - Business Concept',
    targetQueries: [
      'NANDS とは',
      '株式会社エヌアンドエス',
      'Business Concept',
      '次のステージ'
    ],
    entities: [
      {
        entity: 'NANDS',
        entityType: 'Organization',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['株式会社エヌアンドエス', 'Business Concept', 'AI技術', '働く人'],
        searchIntents: ['NANDS とは', '株式会社エヌアンドエス 会社概要'],
        coOccurringTerms: ['エヌアンドエス', 'AI技術', '働く人', '次のステージ']
      }
    ],
    semanticWeight: 0.98,
    hierarchyLevel: 1,
    relatedFragments: ['mission-vision', 'company-message']
  },
  
  {
    id: 'mission-vision',
    sectionName: 'Mission & Vision - 企業使命とビジョン',
    targetQueries: [
      '企業使命',
      'ビジョン',
      '2030年',
      'リーディングカンパニー',
      'DX推進'
    ],
    entities: [
      {
        entity: 'Mission & Vision',
        entityType: 'Concept',
        context: 'defines',
        importance: 9,
        relatedKnowledge: ['2030年', 'リーディングカンパニー', 'DX推進', 'AI活用'],
        searchIntents: ['NANDS ミッション', 'エヌアンドエス ビジョン', '2030年 目標'],
        coOccurringTerms: ['Mission', 'Vision', '2030年', 'リーディングカンパニー', 'DX推進']
      }
    ],
    semanticWeight: 0.96,
    hierarchyLevel: 1,
    relatedFragments: ['hero', 'enterprise-ai']
  },
  
  {
    id: 'enterprise-ai',
    sectionName: 'Enterprise AI Solutions - 企業向けAI',
    targetQueries: [
      'AI導入コンサルティング',
      '企業向けAI研修',
      'AI組織構築',
      'ROI評価'
    ],
    entities: [
      {
        entity: 'Enterprise AI Solutions',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['AI導入コンサルティング', '企業向けAI研修', 'AI組織構築', 'ROI評価', 'AI戦略'],
        searchIntents: ['企業 AI導入 支援', 'AI研修 法人向け', 'AI組織構築 コンサルティング'],
        coOccurringTerms: ['AI導入', 'AI研修', 'AI組織構築', 'ROI評価', 'AI戦略']
      }
    ],
    semanticWeight: 0.94,
    hierarchyLevel: 1,
    relatedFragments: ['mission-vision', 'business']
  },
  
  {
    id: 'business',
    sectionName: 'Business - 事業内容',
    targetQueries: [
      '事業内容',
      'リスキリング研修',
      'キャリアコンサルティング',
      '退職支援'
    ],
    entities: [
      {
        entity: '事業内容',
        entityType: 'Service',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['リスキリング研修', 'キャリアコンサルティング', '退職支援', 'システム開発', 'SNSコンサル', 'メディア運営'],
        searchIntents: ['NANDS 事業内容', 'エヌアンドエス サービス', 'リスキリング研修 内容'],
        coOccurringTerms: ['リスキリング', 'キャリアコンサルティング', '退職支援', 'システム開発']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 1,
    relatedFragments: ['enterprise-ai', 'company-message']
  },
  
  {
    id: 'company-message',
    sectionName: 'Company & Message - 会社概要',
    targetQueries: [
      '会社概要',
      '代表メッセージ',
      '原田賢治',
      '寄り添い続ける'
    ],
    entities: [
      {
        entity: '株式会社エヌアンドエス',
        entityType: 'Organization',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['原田賢治', '2008年設立', '滋賀県大津市', '東京支社', '代表メッセージ', '寄り添い続ける'],
        searchIntents: ['株式会社エヌアンドエス 会社概要', '原田賢治 代表', 'NANDS 代表メッセージ'],
        coOccurringTerms: ['株式会社エヌアンドエス', '原田賢治', '2008年設立', '代表メッセージ']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 1,
    relatedFragments: ['business', 'history-access']
  },
  
  {
    id: 'history-access',
    sectionName: 'History & Access - 企業沿革',
    targetQueries: [
      '企業沿革',
      '2008年設立',
      'デジタルマーケティング',
      'AIコンサルティング',
      'AI事業本部'
    ],
    entities: [
      {
        entity: '企業沿革',
        entityType: 'Concept',
        context: 'defines',
        importance: 8,
        relatedKnowledge: ['2008年設立', 'デジタルマーケティング', 'AIコンサルティング', 'AI事業本部', '滋賀県大津市', '東京支社'],
        searchIntents: ['NANDS 沿革', 'エヌアンドエス 歴史', '会社設立 2008年'],
        coOccurringTerms: ['企業沿革', '2008年設立', 'AI事業本部', '滋賀県大津市']
      }
    ],
    semanticWeight: 0.88,
    hierarchyLevel: 2,
    relatedFragments: ['company-message', 'company-official-x']
  },
  
  {
    id: 'company-official-x',
    sectionName: 'Official SNS - X (Twitter)',
    targetQueries: [
      '公式SNS',
      'NANDS_AI',
      'X Twitter',
      'AI技術動向'
    ],
    entities: [
      {
        entity: '公式SNS',
        entityType: 'Service',
        context: 'provides',
        importance: 7,
        relatedKnowledge: ['X', 'Twitter', 'NANDS_AI', 'AI技術動向', 'サービス情報', '業界インサイト'],
        searchIntents: ['NANDS 公式SNS', 'NANDS_AI Twitter', 'エヌアンドエス X'],
        coOccurringTerms: ['X', 'Twitter', 'NANDS_AI', 'AI技術動向']
      }
    ],
    semanticWeight: 0.86,
    hierarchyLevel: 2,
    relatedFragments: ['history-access', 'representative-linkedin']
  },
  
  {
    id: 'representative-linkedin',
    sectionName: 'Representative LinkedIn - 原田賢治',
    targetQueries: [
      '原田賢治 LinkedIn',
      'B2B専門性',
      '業界インサイト',
      '経営視点',
      'レリバンスエンジニアリング専門家'
    ],
    entities: [
      {
        entity: '原田賢治',
        entityType: 'Person',
        context: 'provides',
        importance: 9,
        relatedKnowledge: ['LinkedIn', 'B2B専門性', '業界インサイト', '経営視点', 'レリバンスエンジニアリング'],
        searchIntents: ['原田賢治 LinkedIn', 'NANDS 代表 プロフィール', 'レリバンスエンジニアリング 専門家'],
        coOccurringTerms: ['原田賢治', 'LinkedIn', 'B2B専門性', 'レリバンスエンジニアリング']
      }
    ],
    semanticWeight: 0.84,
    hierarchyLevel: 2,
    relatedFragments: ['company-official-x', 'company-message']
  },
  
  // =============================================================================
  // 🤖 AI-Siteページ Fragment IDs（35個） - AI引用最適化専用ページ
  // =============================================================================
  
  {
    id: 'main-title-ai-site',
    sectionName: 'AIサイト｜24時間365日無人営業マン',
    targetQueries: [
      'AIサイト',
      '無人営業マン',
      '24時間365日',
      'AI引用される',
      'Triple RAG'
    ],
    entities: [
      {
        entity: 'AIサイト',
        entityType: 'Product',
        context: 'provides',
        importance: 10,
        relatedKnowledge: ['24時間365日', '無人営業マン', 'AI引用', 'Triple RAG', 'Fragment ID'],
        searchIntents: ['AIサイト とは', 'AI引用される サイト', '無人営業マン システム'],
        coOccurringTerms: ['AIサイト', '無人営業マン', 'AI引用', 'Triple RAG']
      }
    ],
    semanticWeight: 0.95,
    hierarchyLevel: 1,
    relatedFragments: ['mechanism-title', 'features-title', 'pricing-title']
  },
  
  {
    id: 'mechanism-title',
    sectionName: 'AI引用の仕組み',
    targetQueries: [
      'AI引用 仕組み',
      'Mike King理論',
      'Fragment ID',
      '構造化データ',
      'ベクトル検索'
    ],
    entities: [
      {
        entity: 'Mike King理論',
        entityType: 'Methodology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['Fragment ID', '構造化データ', 'AI引用最適化', 'レリバンスエンジニアリング'],
        searchIntents: ['Mike King理論 とは', 'AI引用最適化 方法', 'Fragment ID 仕組み'],
        coOccurringTerms: ['Mike King理論', 'Fragment ID', 'AI引用最適化']
      }
    ],
    semanticWeight: 0.92,
    hierarchyLevel: 2,
    relatedFragments: ['faq-2', 'faq-3', 'features-title']
  },
  
  {
    id: 'features-title',
    sectionName: '機能一覧 - Triple RAG & Fragment ID',
    targetQueries: [
      'Triple RAG',
      'Fragment ID',
      '自動ブログ生成',
      'ベクトル検索',
      'AI最適化'
    ],
    entities: [
      {
        entity: 'Triple RAG',
        entityType: 'Technology',
        context: 'implements',
        importance: 9,
        relatedKnowledge: ['Company RAG', 'Trend RAG', 'YouTube RAG', 'ベクトル検索', '自動生成'],
        searchIntents: ['Triple RAG とは', 'RAGシステム 機能', 'AI検索 最適化'],
        coOccurringTerms: ['Triple RAG', 'Fragment ID', 'ベクトル検索', 'AI最適化']
      }
    ],
    semanticWeight: 0.90,
    hierarchyLevel: 2,
    relatedFragments: ['faq-7', 'faq-9', 'pricing-title']
  },
  
  {
    id: 'pricing-title',
    sectionName: '料金プラン',
    targetQueries: [
      'AIサイト 料金',
      'IT補助金',
      '導入費用',
      'プラン 比較',
      'コストパフォーマンス'
    ],
    entities: [
      {
        entity: 'IT補助金',
        entityType: 'Policy',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['AI導入', '補助金活用', 'DX推進', '中小企業支援'],
        searchIntents: ['IT補助金 AIサイト', '補助金 AI導入', 'DX補助金 活用方法'],
        coOccurringTerms: ['IT補助金', 'AI導入', 'DX推進', 'コスト削減']
      }
    ],
    semanticWeight: 0.88,
    hierarchyLevel: 2,
    relatedFragments: ['faq-18', 'faq-19', 'main-title-ai-site']
  },
  
  {
    id: 'faq-title',
    sectionName: 'よくある質問',
    targetQueries: [
      'AIサイト FAQ',
      'よくある質問',
      'AI引用 質問',
      'Fragment ID 質問',
      'Triple RAG 質問'
    ],
    entities: [
      {
        entity: 'FAQ',
        entityType: 'Service',
        context: 'provides',
        importance: 8,
        relatedKnowledge: ['AIサイト', 'Fragment ID', 'AI引用', 'Mike King理論', 'Triple RAG'],
        searchIntents: ['AIサイト よくある質問', 'Fragment ID FAQ', 'AI引用 疑問'],
        coOccurringTerms: ['FAQ', 'AIサイト', 'Fragment ID', 'AI引用']
      }
    ],
    semanticWeight: 0.85,
    hierarchyLevel: 2,
    relatedFragments: ['faq-1', 'faq-2', 'faq-3', 'faq-4', 'faq-5']
  }
];

// =============================================================================
// AI検索エンジン最適化システムクラス
// =============================================================================

export class AISearchOptimizationSystem {
  private configs: Record<string, AISearchEngineConfig>;
  
  constructor() {
    this.configs = AI_SEARCH_ENGINE_CONFIGS;
  }

  /**
   * 統合AI検索最適化スキーマ生成
   */
  generateAIOptimizedSchema(
    baseEntity: EntityRelationship,
    targetEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude'],
    pageContext?: {
      slug: string;
      title: string;
      category: string;
      fragmentIds: string[];
    }
  ): any {
    // エンジン別最適化設定の統合
    const aggregatedConfig = this.aggregateEngineConfigs(targetEngines);
    
    // 詳細化knowsAbout生成
    const optimizedKnowsAbout = this.generateOptimizedKnowsAbout(
      baseEntity,
      aggregatedConfig,
      pageContext
    );
    
    // 詳細化mentions生成
    const optimizedMentions = this.generateOptimizedMentions(
      baseEntity,
      aggregatedConfig,
      pageContext
    );
    
    // Fragment ID連携強化
    const fragmentEnhancement = this.generateFragmentEnhancement(
      pageContext?.fragmentIds || []
    );

    return {
      '@context': 'https://schema.org',
      '@type': baseEntity['@type'],
      '@id': baseEntity['@id'],
      name: baseEntity.name,
      
      // 詳細化専門知識
      knowsAbout: optimizedKnowsAbout.map(item => ({
        '@type': 'Thing',
        name: item.subject,
        category: item.category,
        expertiseLevel: item.expertiseLevel,
        relatedTechnologies: item.relatedTechnologies,
        sameAs: item.synonyms,
        ...(item.fragmentId && { mainEntityOfPage: `#${item.fragmentId}` })
      })),
      
      // 関連エンティティ明示
      mentions: optimizedMentions.map(mention => ({
        '@type': mention.entityType,
        name: mention.entity,
        relationshipType: mention.context,
        importance: mention.importance,
        searchIntents: mention.searchIntents,
        ...(mention.fragmentId && { mainEntityOfPage: `#${mention.fragmentId}` })
      })),
      
      // AI検索エンジン特化プロパティ
      aiSearchOptimization: {
        targetEngines: targetEngines,
        optimizationLevel: 'advanced',
        semanticEnhancement: fragmentEnhancement,
        entityRelationshipDensity: this.calculateEntityDensity(optimizedMentions),
        knowledgeGraphIntegration: true
      },
      
      // Fragment ID マッピング
      hasPartEnhanced: AI_OPTIMIZED_FRAGMENT_IDS
        .filter(fragment => pageContext?.fragmentIds?.includes(fragment.id))
        .map(fragment => ({
          '@type': 'WebPageElement',
          '@id': `#${fragment.id}`,
          name: fragment.sectionName,
          targetQueries: fragment.targetQueries,
          semanticWeight: fragment.semanticWeight,
          entities: fragment.entities
        }))
    };
  }

  /**
   * エンジン別設定の統合
   */
  private aggregateEngineConfigs(targetEngines: string[]): {
    recommendedKnowsAboutCount: number;
    recommendedMentionsCount: number;
    expertiseFocus: string;
    entityRelationshipWeight: number;
  } {
    const configs = targetEngines.map(engine => this.configs[engine]).filter(Boolean);
    
    return {
      recommendedKnowsAboutCount: Math.max(...configs.map(c => c.recommendedKnowsAboutCount)),
      recommendedMentionsCount: Math.max(...configs.map(c => c.recommendedMentionsCount)),
      expertiseFocus: 'balanced', // 複数エンジン対応時は balanced
      entityRelationshipWeight: configs.reduce((sum, c) => sum + c.entityRelationshipWeight, 0) / configs.length
    };
  }

  /**
   * 最適化knowsAbout生成
   */
  private generateOptimizedKnowsAbout(
    baseEntity: EntityRelationship,
    config: any,
    pageContext?: any
  ): DetailedKnowsAbout[] {
    let optimizedItems = [...DETAILED_KNOWS_ABOUT_ORGANIZATION];
    
    // ページコンテキストに基づくフィルタリング
    if (pageContext?.category) {
      optimizedItems = optimizedItems.filter(item => 
        item.relatedEntities.some(entity => entity.includes(pageContext.category)) ||
        item.fragmentId && pageContext.fragmentIds?.includes(item.fragmentId)
      );
    }
    
    // エンジン別最適化
    optimizedItems = optimizedItems
      .sort((a, b) => b.expertiseLevel - a.expertiseLevel)
      .slice(0, config.recommendedKnowsAboutCount);
    
    return optimizedItems;
  }

  /**
   * 最適化mentions生成
   */
  private generateOptimizedMentions(
    baseEntity: EntityRelationship,
    config: any,
    pageContext?: any
  ): DetailedMentions[] {
    let optimizedMentions = [...DETAILED_MENTIONS_ORGANIZATION];
    
    // 重要度によるソート・フィルタリング
    optimizedMentions = optimizedMentions
      .sort((a, b) => b.importance - a.importance)
      .slice(0, config.recommendedMentionsCount);
    
    return optimizedMentions;
  }

  /**
   * Fragment ID連携強化
   */
  private generateFragmentEnhancement(fragmentIds: string[]): any {
    const relevantFragments = AI_OPTIMIZED_FRAGMENT_IDS.filter(
      fragment => fragmentIds.includes(fragment.id)
    );
    
    return {
      totalFragments: relevantFragments.length,
      averageSemanticWeight: relevantFragments.reduce((sum, f) => sum + f.semanticWeight, 0) / relevantFragments.length,
      hierarchyDistribution: this.calculateHierarchyDistribution(relevantFragments),
      queryTargeting: relevantFragments.flatMap(f => f.targetQueries)
    };
  }

  /**
   * エンティティ密度計算
   */
  private calculateEntityDensity(mentions: DetailedMentions[]): number {
    const totalImportance = mentions.reduce((sum, m) => sum + m.importance, 0);
    const maxPossibleImportance = mentions.length * 10;
    return totalImportance / maxPossibleImportance;
  }

  /**
   * 階層分布計算
   */
  private calculateHierarchyDistribution(fragments: AIOptimizedFragmentId[]): Record<number, number> {
    const distribution: Record<number, number> = {};
    fragments.forEach(fragment => {
      distribution[fragment.hierarchyLevel] = (distribution[fragment.hierarchyLevel] || 0) + 1;
    });
    return distribution;
  }

  /**
   * AI検索クエリ対応スコア計算
   */
  calculateAISearchScore(schema: any): {
    totalScore: number;
    breakdown: {
      knowsAboutScore: number;
      mentionsScore: number;
      fragmentIdScore: number;
      entityRelationshipScore: number;
    };
  } {
    const knowsAboutScore = this.scoreKnowsAbout(schema.knowsAbout || []);
    const mentionsScore = this.scoreMentions(schema.mentions || []);
    const fragmentIdScore = this.scoreFragmentIds(schema.hasPartEnhanced || []);
    const entityRelationshipScore = this.scoreEntityRelationships(schema);
    
    const totalScore = (knowsAboutScore + mentionsScore + fragmentIdScore + entityRelationshipScore) / 4;
    
    return {
      totalScore,
      breakdown: {
        knowsAboutScore,
        mentionsScore,
        fragmentIdScore,
        entityRelationshipScore
      }
    };
  }

  private scoreKnowsAbout(knowsAbout: any[]): number {
    if (!knowsAbout.length) return 0;
    
    const expertiseLevelSum = knowsAbout.reduce((sum, item) => sum + (item.expertiseLevel || 3), 0);
    const averageExpertise = expertiseLevelSum / knowsAbout.length;
    const countScore = Math.min(100, knowsAbout.length * 4);
    
    return (averageExpertise / 5) * 50 + countScore * 0.5;
  }

  private scoreMentions(mentions: any[]): number {
    if (!mentions.length) return 0;
    
    const importanceSum = mentions.reduce((sum, mention) => sum + (mention.importance || 5), 0);
    const averageImportance = importanceSum / mentions.length;
    const countScore = Math.min(100, mentions.length * 6);
    
    return (averageImportance / 10) * 50 + countScore * 0.5;
  }

  private scoreFragmentIds(fragmentIds: any[]): number {
    if (!fragmentIds.length) return 0;
    
    const semanticWeightSum = fragmentIds.reduce((sum, fragment) => sum + (fragment.semanticWeight || 0.5), 0);
    const averageWeight = semanticWeightSum / fragmentIds.length;
    
    return averageWeight * 100;
  }

  private scoreEntityRelationships(schema: any): number {
    const hasEntityRelationships = schema.aiSearchOptimization?.entityRelationshipDensity || 0;
    const hasKnowledgeGraphIntegration = schema.aiSearchOptimization?.knowledgeGraphIntegration ? 50 : 0;
    
    return hasEntityRelationships * 50 + hasKnowledgeGraphIntegration;
  }
}

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * AI検索エンジン最適化スキーマ生成
 */
export function generateAISearchOptimizedSchema(
  entityType: 'organization' | 'service',
  targetEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude'],
  pageContext?: any
): any {
  const system = new AISearchOptimizationSystem();
  
  const baseEntity = entityType === 'organization' 
    ? ORGANIZATION_ENTITY 
    : SERVICE_ENTITIES[0]; // または適切なサービス選択ロジック
  
  return system.generateAIOptimizedSchema(baseEntity, targetEngines, pageContext);
}

/**
 * Fragment ID連携マッピング生成
 */
export function generateFragmentMapping(fragmentIds: string[]): Record<string, AIOptimizedFragmentId> {
  const mapping: Record<string, AIOptimizedFragmentId> = {};
  
  AI_OPTIMIZED_FRAGMENT_IDS.forEach(fragment => {
    if (fragmentIds.includes(fragment.id)) {
      mapping[fragment.id] = fragment;
    }
  });
  
  return mapping;
}

/**
 * AI検索クエリ対応度チェック
 */
export function checkAISearchReadiness(schema: any): {
  isReady: boolean;
  score: number;
  recommendations: string[];
} {
  const system = new AISearchOptimizationSystem();
  const scoreResult = system.calculateAISearchScore(schema);
  const isReady = scoreResult.totalScore >= 75;
  
  const recommendations: string[] = [];
  
  if (scoreResult.breakdown.knowsAboutScore < 70) {
    recommendations.push('knowsAboutプロパティの詳細化と専門度向上');
  }
  if (scoreResult.breakdown.mentionsScore < 70) {
    recommendations.push('mentionsでの関連エンティティ明示強化');
  }
  if (scoreResult.breakdown.fragmentIdScore < 70) {
    recommendations.push('Fragment IDとの連携強化');
  }
  if (scoreResult.breakdown.entityRelationshipScore < 70) {
    recommendations.push('エンティティ関係性の構造化向上');
  }
  
  return {
    isReady,
    score: scoreResult.totalScore,
    recommendations
  };
}

// =============================================================================
// AI検索最適化強化システム (Schema.org 16.0+ 統合)
// =============================================================================

/**
 * 強化版AI検索最適化スキーマ
 */
export interface EnhancedAIOptimizedSchema {
  // 基本AI最適化
  knowsAbout: DetailedKnowsAbout[];
  mentions: DetailedMentions[];
  
  // Schema.org 16.0+ 強化要素
  potentialAction: PotentialActionSchema[];
  additionalType: string[];
  sameAs: string[];
  
  // AI検索エンジン特化プロパティ
  aiSearchMetadata: {
    targetEngines: string[];
    optimizationLevel: 'basic' | 'advanced' | 'expert';
    readinessScore: number;
    fragmentIdMapping: Record<string, string>;
    semanticConnections: Record<string, number>;
    queryTargeting: Record<string, string[]>;
  };
  
  // ナレッジグラフ連携
  knowledgeGraphIntegration: {
    entityDensity: number;
    relationshipStrength: number;
    topicalAuthority: number;
    semanticCoverage: number;
  };
}

/**
 * AI検索エンジン別詳細設定
 */
export interface AdvancedAIEngineConfig extends AISearchEngineConfig {
  // Schema.org 16.0+ 活用度
  potentialActionUtilization: 'minimal' | 'moderate' | 'extensive';
  additionalTypeImportance: number; // 0-1
  sameAsWeighting: number; // 0-1
  
  // AI特化最適化
  semanticUnderstandingFocus: string[];
  queryProcessingPreference: 'exact' | 'semantic' | 'hybrid';
  entityRecognitionPriority: number; // 0-1
  
  // 日本語対応レベル
  japaneseLanguageSupport: 'basic' | 'intermediate' | 'native';
  culturalContextAwareness: number; // 0-1
}

/**
 * 拡張AI検索エンジン設定
 */
export const ADVANCED_AI_SEARCH_ENGINE_CONFIGS: Record<string, AdvancedAIEngineConfig> = {
  ChatGPT: {
    ...AI_SEARCH_ENGINE_CONFIGS.ChatGPT,
    potentialActionUtilization: 'extensive',
    additionalTypeImportance: 0.8,
    sameAsWeighting: 0.9,
    semanticUnderstandingFocus: [
      'entityRelationships', 
      'contextualRelevance', 
      'domainExpertise'
    ],
    queryProcessingPreference: 'hybrid',
    entityRecognitionPriority: 0.85,
    japaneseLanguageSupport: 'intermediate',
    culturalContextAwareness: 0.7
  },
  
  Perplexity: {
    ...AI_SEARCH_ENGINE_CONFIGS.Perplexity,
    potentialActionUtilization: 'extensive',
    additionalTypeImportance: 0.9,
    sameAsWeighting: 1.0,
    semanticUnderstandingFocus: [
      'sourceCredibility',
      'factualAccuracy',
      'entityVerification'
    ],
    queryProcessingPreference: 'semantic',
    entityRecognitionPriority: 0.95,
    japaneseLanguageSupport: 'intermediate',
    culturalContextAwareness: 0.6
  },
  
  Claude: {
    ...AI_SEARCH_ENGINE_CONFIGS.Claude,
    potentialActionUtilization: 'extensive',
    additionalTypeImportance: 0.85,
    sameAsWeighting: 0.8,
    semanticUnderstandingFocus: [
      'contextualDepth',
      'nuancedUnderstanding',
      'multiModalReasoning'
    ],
    queryProcessingPreference: 'semantic',
    entityRecognitionPriority: 0.9,
    japaneseLanguageSupport: 'native',
    culturalContextAwareness: 0.9
  },
  
  Gemini: {
    ...AI_SEARCH_ENGINE_CONFIGS.Gemini,
    potentialActionUtilization: 'moderate',
    additionalTypeImportance: 0.75,
    sameAsWeighting: 0.85,
    semanticUnderstandingFocus: [
      'multiModalIntegration',
      'visualContext',
      'broadKnowledge'
    ],
    queryProcessingPreference: 'hybrid',
    entityRecognitionPriority: 0.8,
    japaneseLanguageSupport: 'intermediate',
    culturalContextAwareness: 0.75
  },
  
  DeepSeek: {
    ...AI_SEARCH_ENGINE_CONFIGS.DeepSeek,
    potentialActionUtilization: 'moderate',
    additionalTypeImportance: 0.7,
    sameAsWeighting: 0.75,
    semanticUnderstandingFocus: [
      'technicalAccuracy',
      'codeUnderstanding',
      'logicalReasoning'
    ],
    queryProcessingPreference: 'exact',
    entityRecognitionPriority: 0.8,
    japaneseLanguageSupport: 'basic',
    culturalContextAwareness: 0.5
  }
};

// =============================================================================
// 拡張AI検索最適化システム
// =============================================================================

export class EnhancedAISearchOptimizationSystem extends AISearchOptimizationSystem {
  private advancedConfigs: Record<string, AdvancedAIEngineConfig>;
  
  constructor() {
    super();
    this.advancedConfigs = ADVANCED_AI_SEARCH_ENGINE_CONFIGS;
  }
  
  /**
   * 強化版AI最適化スキーマ生成
   */
  generateEnhancedAIOptimizedSchema(
    baseEntity: EntityRelationship,
    targetEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude'],
    context?: {
      slug: string;
      title: string;
      category: string;
      fragmentIds: string[];
      serviceType?: string;
      isJapaneseEnterprise?: boolean;
      isAIFocused?: boolean;
    }
  ): EnhancedAIOptimizedSchema {
    // 基本AI最適化要素
    const basicSchema = this.generateAIOptimizedSchema(baseEntity, targetEngines, context);
    
    // Schema.org 16.0+ 強化要素
    const potentialAction = generateEnhancedPotentialActions(
      baseEntity['@type'],
      { serviceType: context?.serviceType }
    );
    
    const additionalType = generateEnhancedAdditionalTypes(
      baseEntity['@type'],
      {
        isJapaneseEnterprise: context?.isJapaneseEnterprise ?? true,
        isAIFocused: context?.isAIFocused ?? true,
        industrySpecific: this.extractIndustryContext(context?.category)
      }
    );
    
    const sameAs = generateEnhancedSameAs(
      baseEntity['@id'],
      {
        includeIndustryRefs: true,
        includeJapaneseRefs: true,
        includeAIRefs: context?.isAIFocused ?? true,
        includeKnowledgeGraph: true
      }
    );
    
    // AI検索メタデータ強化
    const aiSearchMetadata = this.generateAdvancedAISearchMetadata(
      targetEngines,
      context
    );
    
    // ナレッジグラフ連携強化
    const knowledgeGraphIntegration = this.calculateKnowledgeGraphMetrics(
      basicSchema.knowsAbout || [],
      basicSchema.mentions || [],
      additionalType,
      sameAs
    );
    
    return {
      knowsAbout: basicSchema.knowsAbout || [],
      mentions: basicSchema.mentions || [],
      potentialAction,
      additionalType,
      sameAs,
      aiSearchMetadata,
      knowledgeGraphIntegration
    };
  }
  
  /**
   * 高度なAI検索メタデータ生成
   */
  private generateAdvancedAISearchMetadata(
    targetEngines: string[],
    context?: any
  ): any {
    const configs = targetEngines.map(engine => this.advancedConfigs[engine]).filter(Boolean);
    
    // エンジン別最適化レベル計算
    const optimizationLevels = configs.map(config => {
      const score = this.calculateAdvancedOptimizationScore(config, context);
      if (score >= 90) return 'expert';
      if (score >= 75) return 'advanced';
      return 'basic';
    });
    
    const primaryOptimizationLevel = this.determineOverallOptimizationLevel(optimizationLevels);
    
    // Fragment ID意味マッピング強化
    const fragmentIdMapping = this.generateSemanticFragmentMapping(
      context?.fragmentIds || []
    );
    
    // セマンティック接続強度計算
    const semanticConnections = this.calculateSemanticConnections(
      targetEngines,
      context
    );
    
    // クエリターゲティング強化
    const queryTargeting = this.generateAdvancedQueryTargeting(
      configs,
      context
    );
    
    // 総合準備スコア計算
    const readinessScore = this.calculateAdvancedReadinessScore(
      configs,
      context
    );
    
    return {
      targetEngines,
      optimizationLevel: primaryOptimizationLevel,
      readinessScore,
      fragmentIdMapping,
      semanticConnections,
      queryTargeting
    };
  }
  
  /**
   * ナレッジグラフメトリクス計算
   */
  private calculateKnowledgeGraphMetrics(
    knowsAbout: any[],
    mentions: any[],
    additionalTypes: string[],
    sameAs: string[]
  ): any {
    // エンティティ密度計算
    const totalEntityReferences = knowsAbout.length + mentions.length + sameAs.length;
    const entityDensity = Math.min(1.0, totalEntityReferences / 50); // 50を最大基準
    
    // 関係性強度計算
    const relationshipStrength = this.calculateRelationshipStrength(
      knowsAbout,
      mentions
    );
    
    // トピック権威性計算
    const topicalAuthority = this.calculateTopicalAuthority(
      knowsAbout,
      additionalTypes
    );
    
    // セマンティックカバレッジ計算
    const semanticCoverage = this.calculateSemanticCoverage(
      knowsAbout,
      mentions,
      additionalTypes
    );
    
    return {
      entityDensity,
      relationshipStrength,
      topicalAuthority,
      semanticCoverage
    };
  }
  
  /**
   * 業界コンテキスト抽出
   */
  private extractIndustryContext(category?: string): string[] {
    const industryMapping: Record<string, string[]> = {
      'ai-agents': ['software', 'ai', 'automation'],
      'aio-seo': ['marketing', 'seo', 'digital'],
      'vector-rag': ['ai', 'data', 'search'],
      'system-development': ['software', 'technology', 'development'],
      'reskilling': ['education', 'training', 'hr'],
      'hr-solutions': ['hr', 'consulting', 'training'],
      'chatbot-development': ['ai', 'software', 'automation'],
      'mcp-servers': ['ai', 'software', 'integration'],
      'video-generation': ['ai', 'media', 'content'],
      'sns-automation': ['marketing', 'automation', 'social']
    };
    
    return category ? (industryMapping[category] || []) : [];
  }
  
  /**
   * 高度最適化スコア計算
   */
  private calculateAdvancedOptimizationScore(
    config: AdvancedAIEngineConfig,
    context?: any
  ): number {
    let score = 0;
    
    // 基本要素スコア (60%)
    score += 60 * (config.entityRelationshipWeight || 0);
    
    // Schema.org 16.0+ 要素スコア (25%)
    score += 25 * (
      (config.additionalTypeImportance * 0.4) +
      (config.sameAsWeighting * 0.4) +
      (config.potentialActionUtilization === 'extensive' ? 0.2 : 
       config.potentialActionUtilization === 'moderate' ? 0.1 : 0)
    );
    
    // 言語・文化対応スコア (15%)
    score += 15 * (
      (config.japaneseLanguageSupport === 'native' ? 1.0 :
       config.japaneseLanguageSupport === 'intermediate' ? 0.7 : 0.4) * 0.6 +
      (config.culturalContextAwareness * 0.4)
    );
    
    return Math.round(score);
  }
  
  /**
   * セマンティックフラグメントマッピング生成
   */
  private generateSemanticFragmentMapping(fragmentIds: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    fragmentIds.forEach(fragmentId => {
      // Fragment IDから意味的カテゴリを推定
      const semanticCategory = this.inferSemanticCategory(fragmentId);
      mapping[fragmentId] = semanticCategory;
    });
    
    return mapping;
  }
  
  /**
   * セマンティックカテゴリ推定
   */
  private inferSemanticCategory(fragmentId: string): string {
    const categoryPatterns: Record<string, string> = {
      'hero': 'introduction',
      'service': 'offering',
      'feature': 'capability',
      'benefit': 'value-proposition',
      'process': 'methodology',
      'technology': 'technical-specification',
      'team': 'organization',
      'contact': 'interaction',
      'faq': 'information',
      'case-study': 'evidence',
      'pricing': 'commercial',
      'about': 'organizational'
    };
    
    for (const [pattern, category] of Object.entries(categoryPatterns)) {
      if (fragmentId.toLowerCase().includes(pattern)) {
        return category;
      }
    }
    
    return 'general-content';
  }
  
  /**
   * 関係性強度計算
   */
  private calculateRelationshipStrength(
    knowsAbout: any[],
    mentions: any[]
  ): number {
    // knowsAboutとmentions間の相互参照数
    const crossReferences = knowsAbout.filter(ka =>
      mentions.some(mention => 
        mention.relatedKnowledge?.includes(ka.subject) ||
        ka.relatedTechnologies?.some((tech: string) => 
          mention.entity.includes(tech)
        )
      )
    ).length;
    
    const totalPossibleConnections = knowsAbout.length * mentions.length;
    
    return totalPossibleConnections > 0 ? 
      Math.min(1.0, (crossReferences * 2) / Math.sqrt(totalPossibleConnections)) : 0;
  }
  
  /**
   * トピック権威性計算
   */
  private calculateTopicalAuthority(
    knowsAbout: any[],
    additionalTypes: string[]
  ): number {
    // 高専門度（レベル4-5）の知識領域数
    const expertKnowledgeCount = knowsAbout.filter(ka => ka.expertiseLevel >= 4).length;
    
    // AI関連タイプの数
    const aiRelatedTypes = additionalTypes.filter(type => 
      type.toLowerCase().includes('ai') || 
      type.toLowerCase().includes('machine') ||
      type.toLowerCase().includes('intelligent')
    ).length;
    
    // 権威性スコア計算
    const authorityScore = (expertKnowledgeCount * 0.7) + (aiRelatedTypes * 0.3);
    
    return Math.min(1.0, authorityScore / 10); // 10を最大基準
  }
  
  /**
   * セマンティックカバレッジ計算
   */
  private calculateSemanticCoverage(
    knowsAbout: any[],
    mentions: any[],
    additionalTypes: string[]
  ): number {
    // ユニークな概念・技術の総数
    const allConcepts = new Set([
      ...knowsAbout.map(ka => ka.subject),
      ...knowsAbout.flatMap(ka => ka.synonyms || []),
      ...knowsAbout.flatMap(ka => ka.relatedTechnologies || []),
      ...mentions.map(m => m.entity),
      ...mentions.flatMap(m => m.coOccurringTerms || []),
      ...additionalTypes
    ]);
    
    // セマンティックカバレッジ算出
    return Math.min(1.0, allConcepts.size / 100); // 100を最大基準
  }
  
  /**
   * 高度クエリターゲティング生成
   */
  private generateAdvancedQueryTargeting(
    configs: AdvancedAIEngineConfig[],
    context?: any
  ): Record<string, string[]> {
    const queryTargeting: Record<string, string[]> = {};
    
    configs.forEach(config => {
      const engineQueries = this.generateEngineSpecificQueries(config, context);
      queryTargeting[config.engineName] = engineQueries;
    });
    
    return queryTargeting;
  }
  
  /**
   * エンジン特化クエリ生成
   */
  private generateEngineSpecificQueries(
    config: AdvancedAIEngineConfig,
    context?: any
  ): string[] {
    const baseQueries = [
      `${context?.category || 'AI'} サービス`,
      `${context?.title || 'システム開発'} 会社`,
      'AI 導入 支援',
      'システム開発 助成金'
    ];
    
    // エンジン特化クエリ追加
    const engineSpecificQueries: Record<string, string[]> = {
      ChatGPT: [
        'ChatGPT 連携 開発',
        'AI チャットボット 構築',
        'プロンプトエンジニアリング 研修'
      ],
      Perplexity: [
        'AI 検索最適化',
        'レリバンスエンジニアリング',
        'SEO AI対策'
      ],
      Claude: [
        'Claude API 開発',
        'MCP サーバー構築',
        'AI エージェント開発'
      ],
      Gemini: [
        'Google AI 活用',
        'マルチモーダル AI',
        'Gemini API 統合'
      ],
      DeepSeek: [
        'AI コード生成',
        'プログラミング支援',
        '技術的AI実装'
      ]
    };
    
    return [
      ...baseQueries,
      ...(engineSpecificQueries[config.engineName] || [])
    ];
  }
  
  /**
   * 高度準備スコア計算
   */
  private calculateAdvancedReadinessScore(
    configs: AdvancedAIEngineConfig[],
    context?: any
  ): number {
    const scores = configs.map(config => 
      this.calculateAdvancedOptimizationScore(config, context)
    );
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }
  
  /**
   * 全体最適化レベル決定
   */
  private determineOverallOptimizationLevel(levels: string[]): 'basic' | 'advanced' | 'expert' {
    const expertCount = levels.filter(l => l === 'expert').length;
    const advancedCount = levels.filter(l => l === 'advanced').length;
    
    if (expertCount >= levels.length * 0.6) return 'expert';
    if (advancedCount + expertCount >= levels.length * 0.7) return 'advanced';
    return 'basic';
  }
  
  /**
   * セマンティック接続計算
   */
  private calculateSemanticConnections(
    targetEngines: string[],
    context?: any
  ): Record<string, number> {
    const connections: Record<string, number> = {};
    
    targetEngines.forEach(engine => {
      const config = this.advancedConfigs[engine];
      if (config) {
        // エンジン別セマンティック理解重視度
        const semanticWeight = 
          config.queryProcessingPreference === 'semantic' ? 1.0 :
          config.queryProcessingPreference === 'hybrid' ? 0.8 : 0.6;
        
        connections[engine] = semanticWeight * config.entityRecognitionPriority;
      }
    });
    
    return connections;
  }
}

export default AISearchOptimizationSystem; 