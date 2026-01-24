/**
 * CLAVI Topic Consistency Scorer
 * 
 * Phase 4.2.3: トピック一貫性スコア算出
 * - Mike King理論準拠（トピック一貫性の定量評価）
 * - 重心ベクトル計算
 * - スコア算出（0-100点）
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { SemanticAnalyzer } from './semantic-analyzer';

export interface TopicConsistencyResult {
  score: number; // 0-100点
  centroid: number[]; // 重心ベクトル
  deviations: Array<{
    fragmentId: string;
    similarityToCentroid: number; // 重心との類似度
  }>;
  statistics: {
    mean: number; // 平均類似度
    min: number; // 最小類似度
    max: number; // 最大類似度
    stdDev: number; // 標準偏差
  };
}

export class TopicConsistencyScorer {
  private semanticAnalyzer: SemanticAnalyzer;
  
  constructor() {
    this.semanticAnalyzer = new SemanticAnalyzer();
  }
  
  /**
   * Mike King理論: トピック一貫性スコア（0-100点）
   * 
   * アルゴリズム:
   * 1. 重心ベクトル計算（全Fragmentの平均ベクトル）
   * 2. 各Fragmentと重心の類似度計算
   * 3. 平均類似度をスコアに変換（0-100点）
   * 
   * @param params - ベクトルとFragment IDリスト
   * @returns トピック一貫性スコア + 統計情報
   */
  calculateTopicConsistency(params: {
    embeddings: number[][];
    fragmentIds: string[];
  }): TopicConsistencyResult {
    const { embeddings, fragmentIds } = params;
    
    if (embeddings.length !== fragmentIds.length) {
      throw new Error(
        `[TopicConsistencyScorer] Embeddings and fragmentIds length must match: ${embeddings.length} vs ${fragmentIds.length}`
      );
    }
    
    if (embeddings.length === 0) {
      throw new Error('[TopicConsistencyScorer] Embeddings cannot be empty');
    }
    
    console.log(`[TopicConsistencyScorer] トピック一貫性スコア算出開始:`);
    console.log(`  - Fragments: ${embeddings.length}個`);
    console.log(`  - Dimensions: ${embeddings[0].length}`);
    
    // 1. 重心ベクトル計算
    const centroid = this.calculateCentroid(embeddings);
    console.log(`[TopicConsistencyScorer] 重心ベクトル計算完了`);
    
    // 2. 各Fragmentと重心の類似度計算
    const deviations: Array<{
      fragmentId: string;
      similarityToCentroid: number;
    }> = [];
    
    for (let i = 0; i < embeddings.length; i++) {
      const similarity = this.semanticAnalyzer.calculateCosineSimilarity(
        embeddings[i],
        centroid
      );
      
      deviations.push({
        fragmentId: fragmentIds[i],
        similarityToCentroid: similarity
      });
    }
    
    console.log(`[TopicConsistencyScorer] 類似度計算完了`);
    
    // 3. 統計情報計算
    const similarities = deviations.map(d => d.similarityToCentroid);
    
    const mean = similarities.reduce((sum, val) => sum + val, 0) / similarities.length;
    const min = Math.min(...similarities);
    const max = Math.max(...similarities);
    
    const variance = similarities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / similarities.length;
    const stdDev = Math.sqrt(variance);
    
    // 4. スコア算出（0-100点）
    // 平均類似度を100倍してスコア化
    // 0.8以上は優秀（80点以上）
    const score = Math.round(mean * 100);
    
    console.log(`[TopicConsistencyScorer] トピック一貫性スコア: ${score}点`);
    console.log(`  - 平均類似度: ${mean.toFixed(3)}`);
    console.log(`  - 標準偏差: ${stdDev.toFixed(3)}`);
    
    return {
      score,
      centroid,
      deviations,
      statistics: {
        mean,
        min,
        max,
        stdDev
      }
    };
  }
  
  /**
   * 重心ベクトル計算
   * 
   * centroid[i] = (v1[i] + v2[i] + ... + vn[i]) / n
   * 
   * @param embeddings - ベクトル配列
   * @returns 重心ベクトル
   */
  private calculateCentroid(embeddings: number[][]): number[] {
    if (embeddings.length === 0) {
      throw new Error('[TopicConsistencyScorer] Cannot calculate centroid of empty embeddings');
    }
    
    const dimensions = embeddings[0].length;
    const centroid: number[] = new Array(dimensions).fill(0);
    
    // 各次元で平均を計算
    for (const embedding of embeddings) {
      if (embedding.length !== dimensions) {
        throw new Error(
          `[TopicConsistencyScorer] All embeddings must have same dimensions: ${dimensions} vs ${embedding.length}`
        );
      }
      
      for (let i = 0; i < dimensions; i++) {
        centroid[i] += embedding[i];
      }
    }
    
    // 平均化
    for (let i = 0; i < dimensions; i++) {
      centroid[i] /= embeddings.length;
    }
    
    return centroid;
  }
  
  /**
   * スコア判定（Keep/Revise/Optimize）
   * 
   * Mike King理論に基づく分類:
   * - 80-100点: Keep（高品質コンテンツ）
   * - 50-79点: Revise（リライト推奨）
   * - 0-49点: Optimize（統合/削除推奨）
   */
  classifyFragmentsByScore(deviations: Array<{
    fragmentId: string;
    similarityToCentroid: number;
  }>): {
    keep: string[]; // 80点以上
    revise: string[]; // 50-79点
    optimize: string[]; // 49点以下
  } {
    const keep: string[] = [];
    const revise: string[] = [];
    const optimize: string[] = [];
    
    for (const deviation of deviations) {
      const score = deviation.similarityToCentroid * 100;
      
      if (score >= 80) {
        keep.push(deviation.fragmentId);
      } else if (score >= 50) {
        revise.push(deviation.fragmentId);
      } else {
        optimize.push(deviation.fragmentId);
      }
    }
    
    console.log(`[TopicConsistencyScorer] Fragment分類:`);
    console.log(`  - Keep (80+): ${keep.length}個`);
    console.log(`  - Revise (50-79): ${revise.length}個`);
    console.log(`  - Optimize (<50): ${optimize.length}個`);
    
    return { keep, revise, optimize };
  }
  
  /**
   * トピックの一貫性判定
   * 
   * スコアに基づいてページ全体の評価を返す
   */
  assessTopicQuality(score: number): {
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    assessment: string;
    recommendations: string[];
  } {
    if (score >= 80) {
      return {
        grade: 'A',
        assessment: '非常に一貫性の高いトピック構成です。このまま維持することを推奨します。',
        recommendations: [
          '現在の構成を維持',
          '定期的な更新で鮮度を保つ',
          '関連する最新情報の追加'
        ]
      };
    } else if (score >= 70) {
      return {
        grade: 'B',
        assessment: '良好なトピック構成です。一部のセクションを強化するとさらに良くなります。',
        recommendations: [
          '類似度の低いセクションの強化',
          'キーワードの一貫性確保',
          '具体例の追加'
        ]
      };
    } else if (score >= 60) {
      return {
        grade: 'C',
        assessment: '平均的なトピック構成です。リライトを推奨します。',
        recommendations: [
          '主題との関連性を強化',
          '冗長なセクションの削減',
          '構成の見直し'
        ]
      };
    } else if (score >= 50) {
      return {
        grade: 'D',
        assessment: 'トピックの一貫性が低いです。大幅なリライトが必要です。',
        recommendations: [
          '主題の再定義',
          '関連性の低いセクションの削除',
          '構成の全面的な見直し'
        ]
      };
    } else {
      return {
        grade: 'F',
        assessment: 'トピックの一貫性が非常に低いです。全面的な再構築を推奨します。',
        recommendations: [
          'ページの目的を明確化',
          '関連性のないコンテンツの削除',
          '複数ページへの分割を検討'
        ]
      };
    }
  }
}

