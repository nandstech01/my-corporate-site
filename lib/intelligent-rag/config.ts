/**
 * 智的RAG最適化システム 設定
 * GPT-5 mini採用によるコスト最適化設定
 * 
 * @author 株式会社エヌアンドエス
 * @version 1.0.0
 */

import type { GPT5MiniConfig, CategoryMapping, AnalysisDepth, OptimizationLevel } from './types';

// ===== GPT-5 mini最適化設定 =====

export const GPT5_MINI_CONFIG: GPT5MiniConfig = {
  model: 'gpt-5-mini',
  temperature: 1.0,      // GPT-5 miniはデフォルト値(1.0)のみサポート
  max_tokens: 4000,      // 中程度の出力
  top_p: 0.9,           // 品質と多様性のバランス
  frequency_penalty: 0.1, // 若干の重複抑制
  presence_penalty: 0.1,  // 若干の新規性促進
  caching_enabled: true   // 90%コスト削減活用
};

// ===== システム設定 =====

export const INTELLIGENT_RAG_CONFIG = {
  // システム情報
  version: '1.0.0',
  mikeKingTheoryVersion: '2024.1',
  
  // GPT-5 mini設定
  openaiConfig: GPT5_MINI_CONFIG,
  
  // コスト最適化設定
  costOptimization: {
    enableCaching: true,
    maxTokensPerRequest: 4000,
    batchProcessing: true,
    estimatedCostSaving: 85, // パーセント
  },
  
  // RAGデータ取得設定
  ragDataLimits: {
    maxTrendItems: 10,
    maxYouTubeItems: 10,
    maxFragmentItems: 20,
    minimumContentLength: 50,
    prioritizeRecent: true,
    recentDaysThreshold: 30
  },
  
  // 分析設定
  analysisConfig: {
    defaultDepth: 'standard' as AnalysisDepth,
    enableDeepAnalysis: true,
    semanticThreshold: 0.7,
    coherenceThreshold: 0.8,
    confidenceThreshold: 0.75
  },
  
  // 最適化設定
  optimizationLevel: 'balanced' as OptimizationLevel,
  
  // Mike King理論準拠設定
  mikeKingCompliance: {
    enableRelevanceEngineering: true,
    fragmentIdIntegration: true,
    structuredDataValidation: true,
    entityRelationshipChecking: true,
    aiSearchOptimization: true
  },
  
  // 既存システム保護設定
  systemProtection: {
    backwardCompatibility: true,
    isolatedExecution: true,
    existingApiPreservation: true,
    noDirectDbModification: true
  },
  
  // パフォーマンス設定
  performance: {
    timeoutMs: 30000,
    retryCount: 3,
    retryDelayMs: 1000,
    enableParallelProcessing: true,
    maxConcurrentRequests: 3
  }
};

// ===== カテゴリマッピング設定 =====

// 実際のデータベースカテゴリに基づくマッピング
export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    id: 'seo-writing',
    name: 'SEOライティング',
    keywords: ['SEO', 'ライティング', 'コンテンツ', '検索最適化', 'ブログ'],
    description: 'SEOライティングに関する記事カテゴリ',
    relatedCategories: ['ai-tools', 'chatgpt-usage'],
    technicalLevel: 6,
    businessValue: 8,
    searchVolume: 'high',
    competitiveness: 'high'
  },
  {
    id: 'ai-basics',
    name: 'AI基礎知識',
    keywords: ['AI', '人工知能', '機械学習', '基礎', '入門'],
    description: 'AI・機械学習の基本',
    relatedCategories: ['chatgpt-usage', 'ai-tools'],
    technicalLevel: 3,
    businessValue: 9,
    searchVolume: 'high',
    competitiveness: 'medium'
  },
  {
    id: 'chatgpt-usage',
    name: 'ChatGPT活用',
    keywords: ['ChatGPT', 'プロンプト', 'OpenAI', '活用', '最適化'],
    description: 'ChatGPTの使い方・プロンプト最適化',
    relatedCategories: ['ai-basics', 'ai-tools'],
    technicalLevel: 4,
    businessValue: 9,
    searchVolume: 'high',
    competitiveness: 'high'
  },
  {
    id: 'ai-tools',
    name: 'AIツール紹介',
    keywords: ['AIツール', 'ノーコード', 'アプリ', 'ツール', 'サービス'],
    description: 'ノーコードAI・AIアプリ',
    relatedCategories: ['chatgpt-usage', 'ai-basics'],
    technicalLevel: 5,
    businessValue: 8,
    searchVolume: 'high',
    competitiveness: 'medium'
  },
  {
    id: 'ai-news',
    name: 'AIニュース・トレンド',
    keywords: ['AIニュース', 'トレンド', '最新情報', '業界動向', '技術'],
    description: '最新のAI情報',
    relatedCategories: ['ai-basics', 'ai-tools'],
    technicalLevel: 4,
    businessValue: 7,
    searchVolume: 'high',
    competitiveness: 'medium'
  },
  // リスキリング業界別カテゴリ
  {
    id: 'finance',
    name: '金融業界向けリスキリング',
    keywords: ['金融', '銀行', '証券', 'リスキリング', 'DX'],
    description: '金融業界向けリスキリングに関する記事カテゴリ',
    relatedCategories: ['ai-basics', 'chatgpt-usage'],
    technicalLevel: 5,
    businessValue: 9,
    searchVolume: 'medium',
    competitiveness: 'medium'
  },
  {
    id: 'manufacturing',
    name: '製造業界向けリスキリング',
    keywords: ['製造業', '工場', '生産', 'リスキリング', 'IoT'],
    description: '製造業界向けリスキリングに関する記事カテゴリ',
    relatedCategories: ['ai-tools', 'ai-basics'],
    technicalLevel: 6,
    businessValue: 8,
    searchVolume: 'medium',
    competitiveness: 'medium'
  },
  {
    id: 'logistics',
    name: '物流・運輸業界向けリスキリング',
    keywords: ['物流', '運輸', '配送', 'リスキリング', '効率化'],
    description: '物流・運輸業界向けリスキリングに関する記事カテゴリ',
    relatedCategories: ['ai-tools', 'manufacturing'],
    technicalLevel: 5,
    businessValue: 8,
    searchVolume: 'medium',
    competitiveness: 'low'
  },
  {
    id: 'retail',
    name: '小売・EC業界向けリスキリング',
    keywords: ['小売', 'EC', 'eコマース', 'リスキリング', 'デジタル'],
    description: '小売・EC業界向けリスキリングに関する記事カテゴリ',
    relatedCategories: ['ai-tools', 'marketing'],
    technicalLevel: 5,
    businessValue: 9,
    searchVolume: 'high',
    competitiveness: 'high'
  },
  {
    id: 'medical-care',
    name: '医療・介護業界向けリスキリング',
    keywords: ['医療', '介護', 'ヘルスケア', 'リスキリング', 'デジタル化'],
    description: '医療・介護業界向けリスキリングに関する記事カテゴリ',
    relatedCategories: ['ai-basics', 'ai-tools'],
    technicalLevel: 6,
    businessValue: 9,
    searchVolume: 'medium',
    competitiveness: 'low'
  },
  {
    id: 'construction',
    name: '建設・不動産業界向けリスキリング',
    keywords: ['建設', '不動産', '建築', 'リスキリング', 'BIM'],
    description: '建設・不動産業界向けリスキリングに関する記事カテゴリ',
    relatedCategories: ['ai-tools', 'manufacturing'],
    technicalLevel: 6,
    businessValue: 7,
    searchVolume: 'medium',
    competitiveness: 'low'
  },
  {
    id: 'it-software',
    name: 'IT・ソフトウェア業界向けリスキリング',
    keywords: ['IT', 'ソフトウェア', 'プログラミング', 'リスキリング', '開発'],
    description: 'IT・ソフトウェア業界向けリスキリングに関する記事カテゴリ',
    relatedCategories: ['ai-tools', 'chatgpt-usage'],
    technicalLevel: 8,
    businessValue: 9,
    searchVolume: 'high',
    competitiveness: 'high'
  },
  {
    id: 'hr-service',
    name: '人材サービス業界向けリスキリング',
    keywords: ['人材', 'HR', '採用', 'リスキリング', '人事'],
    description: '人材サービス業界向けリスキリングに関する記事カテゴリ',
    relatedCategories: ['ai-tools', 'ai-basics'],
    technicalLevel: 4,
    businessValue: 8,
    searchVolume: 'medium',
    competitiveness: 'medium'
  },
  {
    id: 'marketing',
    name: '広告・マーケティング業界向けリスキリング',
    keywords: ['マーケティング', '広告', 'デジタル', 'リスキリング', 'SNS'],
    description: '広告・マーケティング業界向けリスキリングに関する記事カテゴリ',
    relatedCategories: ['ai-tools', 'chatgpt-usage'],
    technicalLevel: 5,
    businessValue: 9,
    searchVolume: 'high',
    competitiveness: 'high'
  }
];

// ===== プロンプトテンプレート =====

export const PROMPT_TEMPLATES = {
  ragAnalysis: `
あなたは世界最高水準のRAG内容分析エキスパートです。
Mike King理論に基づくレリバンスエンジニアリングの専門家として、以下のRAGデータを分析してください。

分析対象RAGデータ:
{ragData}

分析項目:
1. 主要トピックの抽出
2. キーワードクラスタリング
3. 業界カテゴリの判定
4. 技術レベルの評価 (1-10)
5. コンテンツの品質評価

JSON形式で詳細な分析結果を出力してください。
`,

  queryGeneration: `
あなたは検索クエリ最適化の専門家です。
以下の分析結果に基づいて、最適な記事タイトル（H1）となる検索クエリを生成してください。

RAG分析結果:
{analysisResult}

要件:
- Mike King理論準拠のレリバンスエンジニアリング最適化
- AI検索エンジン対応（ChatGPT、Perplexity、Claude）
- 日本語読者向け
- 50-80文字程度
- SEO最適化

主要クエリ1つと代替クエリ3つをJSON形式で出力してください。
`,

  categorySelection: `
あなたはコンテンツカテゴリ分類の専門家です。
以下の分析結果とクエリに最適なカテゴリを選択してください。

分析結果: {analysisResult}
生成クエリ: {generatedQuery}

利用可能カテゴリ:
{availableCategories}

要件:
- 最も関連性の高いカテゴリを選択
- ビジネス価値と技術的適合性を考慮
- 複数候補がある場合は優先順位付け

JSON形式で推奨カテゴリと理由を出力してください。
`,

  coherenceCheck: `
あなたはコンテンツ整合性チェックの専門家です。
以下の組み合わせの意味的整合性を評価してください。

検索クエリ: {query}
選択カテゴリ: {category}
RAG分析結果: {analysisResult}

評価項目:
1. セマンティック整合性 (0-1)
2. 意味的ギャップの特定
3. 改善提案
4. Mike King理論準拠度

JSON形式で評価結果と推奨事項を出力してください。
`
};

// ===== エラーメッセージ =====

export const ERROR_MESSAGES = {
  OPENAI_CONNECTION_FAILED: 'OpenAI API接続に失敗しました',
  INSUFFICIENT_RAG_DATA: 'RAGデータが不足しています',
  ANALYSIS_TIMEOUT: '分析処理がタイムアウトしました',
  INVALID_CATEGORY: '無効なカテゴリが指定されました',
  COHERENCE_CHECK_FAILED: '整合性チェックに失敗しました',
  SYSTEM_INTEGRITY_ERROR: '既存システムの整合性エラーが検出されました'
};

// ===== デフォルト値 =====

export const DEFAULT_VALUES = {
  analysisDepth: 'standard' as AnalysisDepth,
  maxRetries: 3,
  timeoutMs: 30000,
  coherenceThreshold: 0.8,
  confidenceThreshold: 0.75,
  costSavingsTarget: 85 // パーセント
}; 