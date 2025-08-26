/**
 * 智的RAG最適化システム 型定義
 * Mike King理論準拠レリバンスエンジニアリング統合
 * 
 * @author 株式会社エヌアンドエス
 * @version 1.0.0
 */

// ===== RAGデータ型定義 =====

export interface TrendRAGContent {
  id: number;
  trend_topic: string;
  content: string;
  source: string;
  trend_date: string;
  keywords: string[];
  created_at: string;
}

export interface YouTubeRAGContent {
  id: number;
  video_title: string;
  content: string;
  channel_name: string;
  video_url: string;
  keywords: string[];
  created_at: string;
}

export interface FragmentRAGContent {
  id: number;
  fragment_id: string;
  content_title: string;
  content: string;
  content_type: string;
  category: string;
  complete_uri: string;
  page_path: string;
  created_at: string;
}

// ===== 分析結果型定義 =====

export interface SemanticAnalysis {
  mainTopics: string[];
  keywordClusters: string[][];
  industryCategories: string[];
  technicalLevel: number; // 1-10
  confidenceScore: number; // 0-1
  languageComplexity: number; // 1-10
  topicalCoherence: number; // 0-1
}

export interface OptimalQuery {
  primary: string;
  alternatives: string[];
  relatedQueries: string[];
  targetKeywords: string[];
  searchIntent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  difficultyScore: number; // 1-10
}

export interface OptimalCategory {
  bestMatch: string;
  secondaryMatches: string[];
  categoryScore: Record<string, number>;
  confidenceLevel: number; // 0-1
  reasoning: string;
}

export interface CoherenceCheckResult {
  score: number; // 0-1
  isCoherent: boolean;
  issues: string[];
  recommendations: string[];
  semanticGaps: string[];
  improvementSuggestions: string[];
}

// ===== メイン分析結果型 =====

export interface RAGContentAnalysis {
  ragContent: {
    trend: TrendRAGContent[];
    youtube: YouTubeRAGContent[];
    fragment: FragmentRAGContent[];
  };
  
  dataStatistics: {
    totalItems: number;
    trendCount: number;
    youtubeCount: number;
    fragmentCount: number;
    averageContentLength: number;
    keywordDiversity: number;
  };
  
  semanticAnalysis: SemanticAnalysis;
  
  contentThemes: {
    primaryThemes: string[];
    secondaryThemes: string[];
    emergingTopics: string[];
    technicalConcepts: string[];
  };
  
  qualityMetrics: {
    contentRichness: number; // 0-1
    topicalCoverage: number; // 0-1
    informationDensity: number; // 0-1
    credibilityScore: number; // 0-1
  };
  
  mikeKingCompliance: {
    relevanceEngineeringScore: number; // 0-1
    entityCoverage: number; // 0-1
    fragmentOptimization: number; // 0-1
    structuredDataReadiness: number; // 0-1
  };
}

// ===== 設定・オプション型定義 =====

export interface RAGAnalysisOptions {
  includeTrend?: boolean;
  includeYouTube?: boolean;
  includeFragment?: boolean;
  maxItemsPerSource?: number;
  minimumContentLength?: number;
  enableDeepAnalysis?: boolean;
  prioritizeRecent?: boolean;
}

export interface QueryGenerationOptions {
  targetAudience: 'beginner' | 'intermediate' | 'expert' | 'general';
  contentStyle: 'technical' | 'business' | 'educational' | 'casual';
  primaryGoal: 'awareness' | 'engagement' | 'conversion' | 'education';
  includeKeywords?: string[];
  excludeKeywords?: string[];
  maxQueryLength?: number;
}

export interface CategorySelectionOptions {
  availableCategories: string[];
  priorityCategories?: string[];
  excludeCategories?: string[];
  requireExactMatch?: boolean;
  allowMultipleCategories?: boolean;
}

export interface CoherenceCheckOptions {
  strictMode?: boolean;
  mikeKingTheoryCompliance?: boolean;
  aiSearchOptimization?: boolean;
  fragmentIdIntegration?: boolean;
  structuredDataValidation?: boolean;
}

// ===== API応答型定義 =====

export interface IntelligentRAGResponse {
  success: boolean;
  timestamp: string;
  processingTime: number;
  
  analysis: RAGContentAnalysis;
  optimalQuery: OptimalQuery;
  optimalCategory: OptimalCategory;
  coherenceCheck: CoherenceCheckResult;
  
  costOptimization: {
    modelUsed: 'gpt-5-mini';
    estimatedTokens: number;
    estimatedCost: number;
    costSavings: string;
  };
  
  recommendations: {
    immediate: string[];
    strategic: string[];
    optimization: string[];
  };
  
  metadata: {
    systemVersion: string;
    analysisDepth: 'basic' | 'standard' | 'comprehensive';
    mikeKingTheoryVersion: string;
    confidenceLevel: number;
  };
}

// ===== エラー型定義 =====

export interface IntelligentRAGError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  component: 'analyzer' | 'query-generator' | 'category-selector' | 'coherence-checker';
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestions: string[];
}

// ===== GPT-5 mini最適化型定義 =====

export interface GPT5MiniConfig {
  model: 'gpt-5-mini';
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  caching_enabled: boolean;
}

export interface GPT5MiniUsageStats {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalCost: number;
  costSavings: number;
  requestCount: number;
  averageLatency: number;
}

// ===== カテゴリマッピング型定義 =====

export interface CategoryMapping {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  parentCategory?: string;
  relatedCategories: string[];
  technicalLevel: number;
  businessValue: number;
  searchVolume: 'low' | 'medium' | 'high';
  competitiveness: 'low' | 'medium' | 'high';
}

// ===== 既存システム統合型定義 =====

export interface ExistingSystemIntegration {
  fragmentIdIntegration: boolean;
  structuredDataIntegration: boolean;
  entityRelationshipIntegration: boolean;
  mikeKingTheoryCompliance: boolean;
  aiSearchOptimization: boolean;
  backwardCompatibility: boolean;
}

// ===== ユーティリティ型定義 =====

export type AnalysisDepth = 'basic' | 'standard' | 'comprehensive' | 'expert';
export type ProcessingStatus = 'pending' | 'analyzing' | 'generating' | 'validating' | 'completed' | 'error';
export type OptimizationLevel = 'performance' | 'balanced' | 'quality' | 'cost-effective';

// ===== 便利な型ガード =====

export function isTrendRAGContent(content: any): content is TrendRAGContent {
  return content && typeof content.trend_topic === 'string';
}

export function isYouTubeRAGContent(content: any): content is YouTubeRAGContent {
  return content && typeof content.video_title === 'string';
}

export function isFragmentRAGContent(content: any): content is FragmentRAGContent {
  return content && typeof content.fragment_id === 'string';
}

export function isValidRAGContentAnalysis(analysis: any): analysis is RAGContentAnalysis {
  return analysis && 
         analysis.ragContent && 
         analysis.semanticAnalysis && 
         analysis.qualityMetrics &&
         analysis.mikeKingCompliance;
} 