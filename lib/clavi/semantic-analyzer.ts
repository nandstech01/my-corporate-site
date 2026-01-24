/**
 * CLAVI Semantic Analyzer
 * 
 * Phase 4.2.2: セマンティック分析（コサイン類似度計算）
 * - Mike King理論準拠（NumPy/Pandas的処理をTypeScriptで実装）
 * - コサイン類似度計算
 * - 類似度マトリクス構築（N×N）
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

export interface SimilarityMatrix {
  matrix: number[][]; // N×N行列
  fragmentIds: string[]; // Fragment IDリスト
  dimensions: { rows: number; cols: number };
}

export interface CosineSimilarityResult {
  similarity: number; // 0.0-1.0
  vectorA: number[];
  vectorB: number[];
}

export class SemanticAnalyzer {
  /**
   * Mike King理論: コサイン類似度計算（NumPy/Pandas代替）
   * 
   * コサイン類似度 = (A・B) / (||A|| × ||B||)
   * 
   * @param vectorA - ベクトルA（1536次元）
   * @param vectorB - ベクトルB（1536次元）
   * @returns 類似度スコア（0.0-1.0）
   */
  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error(
        `[SemanticAnalyzer] Vector dimensions must match: ${vectorA.length} vs ${vectorB.length}`
      );
    }
    
    if (vectorA.length === 0) {
      throw new Error('[SemanticAnalyzer] Vectors cannot be empty');
    }
    
    // 1. ドット積計算（A・B）
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    
    // 2. ノルム計算（||A|| と ||B||）
    const normA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    // 3. ゼロ除算チェック
    if (normA === 0 || normB === 0) {
      console.warn('[SemanticAnalyzer] Zero vector detected, returning 0 similarity');
      return 0;
    }
    
    // 4. コサイン類似度
    const similarity = dotProduct / (normA * normB);
    
    // 5. 数値精度補正（-1 ~ 1の範囲に収める）
    return Math.max(-1, Math.min(1, similarity));
  }
  
  /**
   * Mike King理論: 類似度マトリクス構築（N×N）
   * 
   * すべてのFragment間の類似度を計算し、マトリクスを構築
   * 
   * @param embeddings - ベクトル配列
   * @param fragmentIds - Fragment IDリスト
   * @returns 類似度マトリクス
   */
  buildSimilarityMatrix(params: {
    embeddings: number[][];
    fragmentIds: string[];
  }): SimilarityMatrix {
    const { embeddings, fragmentIds } = params;
    
    if (embeddings.length !== fragmentIds.length) {
      throw new Error(
        `[SemanticAnalyzer] Embeddings and fragmentIds length must match: ${embeddings.length} vs ${fragmentIds.length}`
      );
    }
    
    const n = embeddings.length;
    console.log(`[SemanticAnalyzer] 類似度マトリクス構築開始: ${n}×${n}`);
    
    // N×N行列を初期化
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    
    // 類似度計算（対称行列なので半分だけ計算）
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        if (i === j) {
          // 対角成分（自分自身）は1.0
          matrix[i][j] = 1.0;
        } else {
          // コサイン類似度計算
          const similarity = this.calculateCosineSimilarity(
            embeddings[i],
            embeddings[j]
          );
          
          // 対称行列なので両方に設定
          matrix[i][j] = similarity;
          matrix[j][i] = similarity;
        }
      }
      
      // 進捗表示（10%ごと）
      if ((i + 1) % Math.max(1, Math.floor(n / 10)) === 0) {
        const progress = Math.round(((i + 1) / n) * 100);
        console.log(`[SemanticAnalyzer] 進捗: ${progress}% (${i + 1}/${n})`);
      }
    }
    
    console.log(`[SemanticAnalyzer] 類似度マトリクス構築完了`);
    
    return {
      matrix,
      fragmentIds,
      dimensions: { rows: n, cols: n }
    };
  }
  
  /**
   * 類似度マトリクスから統計情報を取得
   */
  getSimilarityStatistics(matrix: number[][]): {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
  } {
    // 対角成分（1.0）を除外した類似度リスト
    const similarities: number[] = [];
    
    for (let i = 0; i < matrix.length; i++) {
      for (let j = i + 1; j < matrix[i].length; j++) {
        similarities.push(matrix[i][j]);
      }
    }
    
    if (similarities.length === 0) {
      return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
    }
    
    // 平均値
    const mean = similarities.reduce((sum, val) => sum + val, 0) / similarities.length;
    
    // 中央値
    const sorted = [...similarities].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // 最小値・最大値
    const min = Math.min(...similarities);
    const max = Math.max(...similarities);
    
    // 標準偏差
    const variance = similarities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / similarities.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, median, min, max, stdDev };
  }
  
  /**
   * 最も類似度の高いFragment IDペアを取得
   */
  getMostSimilarPairs(params: {
    matrix: SimilarityMatrix;
    topK: number;
  }): Array<{
    fragmentIdA: string;
    fragmentIdB: string;
    similarity: number;
  }> {
    const { matrix, topK } = params;
    
    const pairs: Array<{
      fragmentIdA: string;
      fragmentIdB: string;
      similarity: number;
    }> = [];
    
    // 対角成分を除外して類似度を収集
    for (let i = 0; i < matrix.matrix.length; i++) {
      for (let j = i + 1; j < matrix.matrix[i].length; j++) {
        pairs.push({
          fragmentIdA: matrix.fragmentIds[i],
          fragmentIdB: matrix.fragmentIds[j],
          similarity: matrix.matrix[i][j]
        });
      }
    }
    
    // 類似度降順でソート
    pairs.sort((a, b) => b.similarity - a.similarity);
    
    // 上位topK個を返す
    return pairs.slice(0, topK);
  }
  
  /**
   * 最も類似度の低いFragment IDペアを取得
   */
  getLeastSimilarPairs(params: {
    matrix: SimilarityMatrix;
    topK: number;
  }): Array<{
    fragmentIdA: string;
    fragmentIdB: string;
    similarity: number;
  }> {
    const { matrix, topK } = params;
    
    const pairs: Array<{
      fragmentIdA: string;
      fragmentIdB: string;
      similarity: number;
    }> = [];
    
    // 対角成分を除外して類似度を収集
    for (let i = 0; i < matrix.matrix.length; i++) {
      for (let j = i + 1; j < matrix.matrix[i].length; j++) {
        pairs.push({
          fragmentIdA: matrix.fragmentIds[i],
          fragmentIdB: matrix.fragmentIds[j],
          similarity: matrix.matrix[i][j]
        });
      }
    }
    
    // 類似度昇順でソート
    pairs.sort((a, b) => a.similarity - b.similarity);
    
    // 下位topK個を返す
    return pairs.slice(0, topK);
  }
}

