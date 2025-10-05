/**
 * ベクトルリンク（Vector Link）公式定義
 * 
 * @description
 * ベクトルリンクとは、ウェブページや文書内の特定断片を指し示す完全URI（ディープリンク）と、
 * その断片の内容を数値表現したベクトル埋め込み（embedding）を、1対1で対応づけて管理する仕組みである。
 * 
 * @concept
 * AI検索時代における「意味と位置の両立」を保証する二層的リンク資産
 * 
 * @author 株式会社エヌアンドエス
 * @version 1.0.0
 * @date 2025-01-26
 */

// ===== 📖 ベクトルリンクの定義 =====

/**
 * ベクトルリンク（Vector Link）
 * 
 * 断片を指し示す完全URI（ディープリンク）と、その断片の意味を表すベクトル埋め込みを
 * 対応づけた二層的リンク資産であり、AI検索時代における意味と位置の両立を保証する仕組み
 */
export interface VectorLink {
  /** 完全URI（公開層 / ディープリンク） */
  completeUri: string;
  
  /** Fragment ID */
  fragmentId: string;
  
  /** ベクトル埋め込み（非公開層 / 意味表現） */
  embedding: number[];
  
  /** 対応関係のメタデータ */
  metadata: VectorLinkMetadata;
}

/**
 * ベクトルリンクメタデータ
 */
export interface VectorLinkMetadata {
  /** コンテンツタイトル */
  contentTitle: string;
  
  /** コンテンツ内容 */
  content: string;
  
  /** ページパス */
  pagePath: string;
  
  /** コンテンツタイプ */
  contentType: 'heading' | 'service' | 'faq' | 'author' | 'section' | 'youtube-short';
  
  /** カテゴリ */
  category: string;
  
  /** 意味的重み */
  semanticWeight: number;
  
  /** ターゲットクエリ */
  targetQueries: string[];
  
  /** 関連エンティティ */
  relatedEntities: string[];
  
  /** 作成日時 */
  createdAt: Date;
  
  /** 更新日時 */
  updatedAt: Date;
}

// ===== 🧩 構成要素 =====

/**
 * 1. 完全URI（公開層 / ディープリンク）
 * 
 * @description
 * https://example.com/page#section3 のように断片を一意に指し示すID
 * JSON-LDやHTMLに公開され、検索エンジンやAIが参照可能
 * 
 * @example
 * "https://nands.tech/page#service-system-development"
 * "https://nands.tech/faq#faq-pricing-1"
 */
export type CompleteUri = string;

/**
 * 2. ベクトル埋め込み（非公開層 / 意味表現）
 * 
 * @description
 * 該当断片のテキストをベクトル化（例: 1536次元）
 * Vector DB（pgvector, Pinecone 等）に保存
 * 意味検索やRAGに利用
 * 
 * @example
 * [0.1234, -0.5678, 0.9012, ...] // 1536次元のベクトル
 */
export type VectorEmbedding = number[];

/**
 * 3. 対応関係（ベクトルリンク）
 * 
 * @description
 * 完全URI ↔ embedding を同一キーで管理
 * 公開層と非公開層を結合することで「意味を担保したリンク資産」となる
 */
export interface VectorLinkMapping {
  completeUri: CompleteUri;
  embedding: VectorEmbedding;
  fragmentId: string;
  mappingKey: string;
}

// ===== 🎯 ベクトルリンクの目的 =====

/**
 * ベクトルリンクの目的
 */
export const VECTOR_LINK_PURPOSES = {
  /** 検索エンジンやAIに対する引用性向上 */
  CITATION_ENHANCEMENT: {
    description: 'URIによる位置指定と、意味検索による高精度マッチを両立',
    benefits: [
      'Google AI Overviews での引用確率向上',
      'ChatGPT Plugin での正確な参照',
      'Perplexity での具体的な引用',
      'Claude での詳細な出典表示'
    ]
  },
  
  /** 自社RAGやAIアプリでの再利用性強化 */
  RAG_OPTIMIZATION: {
    description: 'ユーザーのクエリをベクトル検索 → URIで返す → 公開層に確実に対応',
    benefits: [
      'Triple RAG システムでの高精度検索',
      'OpenAI Plugin での正確な回答生成',
      'セマンティック検索の向上',
      'コンテキスト保持の強化'
    ]
  },
  
  /** 資産化 */
  ASSET_BUILDING: {
    description: 'ページ更新や外部AI検索アルゴリズムの変化にも耐えられる「意味＋位置の二層構造」を確立',
    benefits: [
      'アルゴリズム変更への耐性',
      'コンテンツ更新時の継続性',
      '長期的なSEO資産価値',
      'AI検索時代への適応性'
    ]
  }
} as const;

// ===== ✅ 定義まとめ =====

/**
 * ベクトルリンク公式定義（短文）
 */
export const VECTOR_LINK_DEFINITION = `
ベクトルリンクとは、断片を指し示す完全URI（ディープリンク）と、
その断片の意味を表すベクトル埋め込みを対応づけた二層的リンク資産であり、
AI検索時代における意味と位置の両立を保証する仕組みである。
`.trim();

/**
 * ベクトルリンク英語定義（国際展開用）
 */
export const VECTOR_LINK_DEFINITION_EN = `
Vector Link is a two-layer link asset that maps complete URIs (deep links) 
pointing to specific fragments with vector embeddings representing the semantic 
meaning of those fragments, ensuring both semantic understanding and positional 
accuracy in the AI search era.
`.trim();

// ===== 🔧 実装クラス参照 =====

/**
 * ベクトルリンク実装クラス
 */
export const VECTOR_LINK_IMPLEMENTATIONS = {
  /** Fragment Vector Store */
  fragmentVectorStore: 'lib/vector/fragment-vector-store.ts',
  
  /** Fragment Vectorizer */
  fragmentVectorizer: 'lib/vector/fragment-vectorizer.ts',
  
  /** Vector Link可視化 */
  visualization: 'app/admin/fragment-vectors/page.tsx',
  
  /** OpenAI Plugin統合 */
  openaiPlugin: 'app/api/openai-plugin/search/route.ts',
  
  /** 自動ブログ生成統合 */
  blogGeneration: 'app/api/generate-rag-blog/route.ts'
} as const;

// ===== 📊 統計情報タイプ =====

/**
 * ベクトルリンク統計情報
 */
export interface VectorLinkStats {
  /** 総ベクトルリンク数 */
  totalVectorLinks: number;
  
  /** 対象ページ数 */
  uniquePages: number;
  
  /** コンテンツタイプ別統計 */
  contentTypeBreakdown: Record<string, number>;
  
  /** カテゴリ別統計 */
  categoryBreakdown: Record<string, number>;
  
  /** ページ別統計 */
  pageBreakdown: Record<string, number>;
  
  /** 平均意味的重み */
  averageSemanticWeight: number;
  
  /** 最終更新日時 */
  lastUpdated: Date;
}

// ===== 🚀 Future Roadmap =====

/**
 * ベクトルリンク拡張計画
 */
export const VECTOR_LINK_ROADMAP = {
  'Phase 1': {
    status: '✅ 完了',
    description: 'メインページFragment IDベクトル化',
    items: [
      'fragment_vectors テーブル作成',
      'FragmentVectorStore 実装',
      'FragmentVectorizer 実装',
      '可視化ダッシュボード作成'
    ]
  },
  'Phase 2': {
    status: '🚧 進行中',
    description: '全ページのベクトルリンク化',
    items: [
      'FAQ ページ',
      'AI-site ページ',
      '既存ブログ記事',
      'About ページ'
    ]
  },
  'Phase 3': {
    status: '📋 計画中',
    description: '統合管理システム',
    items: [
      'ベクトルリンク統計ページ',
      'URI-Vector対応表',
      '自動最適化システム',
      'パフォーマンス監視'
    ]
  }
} as const; 