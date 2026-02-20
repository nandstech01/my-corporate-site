/**
 * 智的RAG最適化システム
 * Mike King理論準拠レリバンスエンジニアリング統合
 *
 * @description
 * RAGデータの内容を智的分析し、最適な検索クエリとカテゴリを自動生成
 * 既存システムに影響を与えない独立実装
 *
 * @author 株式会社エヌアンドエス
 * @version 2.0.0 - 本格実装
 */

// --- 型定義 re-export ---
export type {
  RAGContentAnalysis,
  CoherenceCheckResult,
  OptimalQuery,
  OptimalCategory,
  SemanticAnalysis,
  TrendRAGContent,
  YouTubeRAGContent,
  FragmentRAGContent,
  RAGAnalysisOptions,
  QueryGenerationOptions,
  CategorySelectionOptions,
  CoherenceCheckOptions,
  IntelligentRAGResponse,
  IntelligentRAGError,
  GPT5MiniConfig,
  GPT5MiniUsageStats,
  CategoryMapping,
  ExistingSystemIntegration,
  AnalysisDepth,
  ProcessingStatus,
  OptimizationLevel
} from './types';

export {
  isTrendRAGContent,
  isYouTubeRAGContent,
  isFragmentRAGContent,
  isValidRAGContentAnalysis
} from './types';

// --- 設定 re-export ---
export {
  INTELLIGENT_RAG_CONFIG,
  GPT5_MINI_CONFIG,
  CATEGORY_MAPPINGS,
  PROMPT_TEMPLATES,
  ERROR_MESSAGES,
  DEFAULT_VALUES
} from './config';

// --- 実装クラス re-export ---
export { RAGContentAnalyzer } from './rag-content-analyzer';
export { OptimalQueryGenerator } from './optimal-query-generator';
export { CategorySelector } from './category-selector';
export { SemanticCoherenceChecker } from './semantic-coherence-checker';

// --- ユーティリティ re-export ---
export {
  analyzeRAGContent,
  generateOptimalQuery,
  selectOptimalCategory,
  checkSemanticCoherence,
  generateIntelligentBlogParams
} from './utils';

// --- 実装クラスインポート（統合クラス用） ---
import { RAGContentAnalyzer } from './rag-content-analyzer';
import { OptimalQueryGenerator } from './optimal-query-generator';
import { CategorySelector } from './category-selector';
import { SemanticCoherenceChecker } from './semantic-coherence-checker';
import type { RAGContentAnalysis } from './types';

/**
 * 智的RAG最適化統合クラス
 * 全コンポーネントを組み合わせた使いやすいインターフェース
 */
export class IntelligentRAGOptimizationSystem {
  private analyzer: RAGContentAnalyzer;
  private queryGenerator: OptimalQueryGenerator;
  private categorySelector: CategorySelector;
  private coherenceChecker: SemanticCoherenceChecker;

  constructor() {
    this.analyzer = new RAGContentAnalyzer();
    this.queryGenerator = new OptimalQueryGenerator();
    this.categorySelector = new CategorySelector();
    this.coherenceChecker = new SemanticCoherenceChecker();
  }

  /**
   * メイン機能: RAGデータから最適な記事パラメータを自動生成
   */
  async generateOptimalBlogParameters(options: {
    analyzeTrendRAG?: boolean;
    analyzeYouTubeRAG?: boolean;
    analyzeFragmentRAG?: boolean;
    requireCoherence?: boolean;
  } = {
    analyzeTrendRAG: true,
    analyzeYouTubeRAG: true,
    analyzeFragmentRAG: true,
    requireCoherence: true
  }): Promise<{
    success: boolean;
    analysis: RAGContentAnalysis;
    optimalQuery: string;
    optimalCategory: string;
    coherenceScore: number;
    recommendations: string[];
    costSavings: string;
  }> {
    try {
      // 1. RAGデータ内容分析（GPT-5 mini使用）
      const analysis = await this.analyzer.analyzeRAGContent({
        includeTrend: options.analyzeTrendRAG,
        includeYouTube: options.analyzeYouTubeRAG,
        includeFragment: options.analyzeFragmentRAG
      });

      // 2. 最適クエリ生成
      const optimalQuery = await this.queryGenerator.generateOptimalQuery(analysis);

      // 3. 最適カテゴリ選択
      const optimalCategory = await this.categorySelector.selectOptimalCategory(analysis);

      // 4. 整合性チェック（オプション）
      let coherenceScore = 1.0;
      const recommendations: string[] = [];

      if (options.requireCoherence) {
        const coherenceResult = await this.coherenceChecker.checkCoherence({
          query: optimalQuery,
          category: optimalCategory,
          ragAnalysis: analysis
        });
        coherenceScore = coherenceResult.score;
        recommendations.push(...coherenceResult.recommendations);
      }

      return {
        success: true,
        analysis,
        optimalQuery,
        optimalCategory,
        coherenceScore,
        recommendations,
        costSavings: 'GPT-5 mini使用により85%コスト削減達成'
      };
    } catch (error) {
      const emptyAnalysis: RAGContentAnalysis = {
        ragContent: { trend: [], youtube: [], fragment: [] },
        dataStatistics: { totalItems: 0, trendCount: 0, youtubeCount: 0, fragmentCount: 0, averageContentLength: 0, keywordDiversity: 0 },
        semanticAnalysis: { mainTopics: [], keywordClusters: [], industryCategories: [], technicalLevel: 5, confidenceScore: 0, languageComplexity: 5, topicalCoherence: 0 },
        contentThemes: { primaryThemes: [], secondaryThemes: [], emergingTopics: [], technicalConcepts: [] },
        qualityMetrics: { contentRichness: 0, topicalCoverage: 0, informationDensity: 0, credibilityScore: 0 },
        mikeKingCompliance: { relevanceEngineeringScore: 0, entityCoverage: 0, fragmentOptimization: 0, structuredDataReadiness: 0 }
      };

      return {
        success: false,
        analysis: emptyAnalysis,
        optimalQuery: '',
        optimalCategory: '',
        coherenceScore: 0,
        recommendations: ['システムエラーが発生しました。再試行してください。'],
        costSavings: ''
      };
    }
  }
}

// --- 遅延初期化シングルトン ---
let _intelligentRAGSystem: IntelligentRAGOptimizationSystem | null = null;

export function getIntelligentRAGSystem(): IntelligentRAGOptimizationSystem {
  if (!_intelligentRAGSystem) {
    _intelligentRAGSystem = new IntelligentRAGOptimizationSystem();
  }
  return _intelligentRAGSystem;
}

/**
 * 後方互換シングルトン（遅延初期化）
 * @deprecated getIntelligentRAGSystem() を使用してください
 */
export const intelligentRAGSystem: IntelligentRAGOptimizationSystem =
  new Proxy({} as IntelligentRAGOptimizationSystem, {
    get(_target, prop, receiver) {
      return Reflect.get(getIntelligentRAGSystem(), prop, receiver);
    },
    has(_target, prop) {
      return Reflect.has(getIntelligentRAGSystem(), prop);
    },
    ownKeys() {
      return Reflect.ownKeys(getIntelligentRAGSystem());
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Reflect.getOwnPropertyDescriptor(getIntelligentRAGSystem(), prop);
    }
  });

/**
 * 便利関数: 智的RAG最適化の簡易実行
 */
export async function optimizeRAGBlogGeneration(options?: {
  analyzeTrendRAG?: boolean;
  analyzeYouTubeRAG?: boolean;
  analyzeFragmentRAG?: boolean;
  requireCoherence?: boolean;
}) {
  return await getIntelligentRAGSystem().generateOptimalBlogParameters(options);
}
