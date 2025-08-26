/**
 * 智的RAG最適化システム ユーティリティ関数
 * 
 * @author 株式会社エヌアンドエス
 * @version 1.0.0
 */

import type { RAGContentAnalysis, OptimalQuery, OptimalCategory, CoherenceCheckResult } from './types';
import { RAGContentAnalyzer } from './rag-content-analyzer';
import { OptimalQueryGenerator } from './optimal-query-generator';
import { CategorySelector } from './category-selector';
import { SemanticCoherenceChecker } from './semantic-coherence-checker';

/**
 * RAG内容分析（便利関数）
 */
export async function analyzeRAGContent(): Promise<RAGContentAnalysis> {
  const analyzer = new RAGContentAnalyzer();
  return await analyzer.analyzeRAGContent();
}

/**
 * 最適クエリ生成（便利関数）
 */
export async function generateOptimalQuery(analysis: RAGContentAnalysis): Promise<string> {
  const generator = new OptimalQueryGenerator();
  return await generator.generateOptimalQuery(analysis);
}

/**
 * 最適カテゴリ選択（便利関数）
 */
export async function selectOptimalCategory(analysis: RAGContentAnalysis): Promise<string> {
  const selector = new CategorySelector();
  return await selector.selectOptimalCategory(analysis);
}

/**
 * セマンティック整合性チェック（便利関数）
 */
export async function checkSemanticCoherence(params: {
  query: string;
  category: string;
  ragAnalysis: RAGContentAnalysis;
}): Promise<CoherenceCheckResult> {
  const checker = new SemanticCoherenceChecker();
  return await checker.checkCoherence(params);
}

/**
 * 智的ブログパラメータ生成（統合便利関数）
 */
export async function generateIntelligentBlogParams(): Promise<{
  analysis: RAGContentAnalysis;
  optimalQuery: string;
  optimalCategory: string;
  coherenceCheck: CoherenceCheckResult;
}> {
  // 1. RAG分析
  const analysis = await analyzeRAGContent();
  
  // 2. 最適クエリ生成
  const optimalQuery = await generateOptimalQuery(analysis);
  
  // 3. 最適カテゴリ選択
  const optimalCategory = await selectOptimalCategory(analysis);
  
  // 4. 整合性チェック
  const coherenceCheck = await checkSemanticCoherence({
    query: optimalQuery,
    category: optimalCategory,
    ragAnalysis: analysis
  });
  
  return {
    analysis,
    optimalQuery,
    optimalCategory,
    coherenceCheck
  };
} 