/**
 * CLAVI Semantic Analyzer Unit Tests
 * 
 * Phase 4.2.2: テストコード
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { SemanticAnalyzer } from '../semantic-analyzer';

describe('SemanticAnalyzer', () => {
  let analyzer: SemanticAnalyzer;
  
  beforeEach(() => {
    analyzer = new SemanticAnalyzer();
  });
  
  describe('calculateCosineSimilarity', () => {
    it('同一ベクトルの類似度は1.0', () => {
      const vector = [1, 2, 3, 4, 5];
      const similarity = analyzer.calculateCosineSimilarity(vector, vector);
      expect(similarity).toBeCloseTo(1.0, 5);
    });
    
    it('直交ベクトルの類似度は0.0', () => {
      const vectorA = [1, 0, 0];
      const vectorB = [0, 1, 0];
      const similarity = analyzer.calculateCosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeCloseTo(0.0, 5);
    });
    
    it('反対方向のベクトルの類似度は-1.0', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [-1, -2, -3];
      const similarity = analyzer.calculateCosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeCloseTo(-1.0, 5);
    });
    
    it('ベクトル次元が異なる場合はエラーを投げる', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [1, 2];
      
      expect(() => {
        analyzer.calculateCosineSimilarity(vectorA, vectorB);
      }).toThrow('Vector dimensions must match');
    });
    
    it('空のベクトルの場合はエラーを投げる', () => {
      expect(() => {
        analyzer.calculateCosineSimilarity([], []);
      }).toThrow('Vectors cannot be empty');
    });
    
    it('ゼロベクトルの類似度は0.0', () => {
      const vectorA = [0, 0, 0];
      const vectorB = [1, 2, 3];
      const similarity = analyzer.calculateCosineSimilarity(vectorA, vectorB);
      expect(similarity).toBe(0);
    });
  });
  
  describe('buildSimilarityMatrix', () => {
    it('2×2類似度マトリクスを正しく構築する', () => {
      const embeddings = [
        [1, 0, 0],
        [0, 1, 0]
      ];
      const fragmentIds = ['fragment-1', 'fragment-2'];
      
      const matrix = analyzer.buildSimilarityMatrix({ embeddings, fragmentIds });
      
      expect(matrix.dimensions.rows).toBe(2);
      expect(matrix.dimensions.cols).toBe(2);
      expect(matrix.matrix[0][0]).toBeCloseTo(1.0, 5); // 対角成分
      expect(matrix.matrix[1][1]).toBeCloseTo(1.0, 5); // 対角成分
      expect(matrix.matrix[0][1]).toBeCloseTo(0.0, 5); // 直交ベクトル
      expect(matrix.matrix[1][0]).toBeCloseTo(0.0, 5); // 対称行列
    });
    
    it('embeddingsとfragmentIdsの長さが異なる場合はエラーを投げる', () => {
      const embeddings = [[1, 2, 3]];
      const fragmentIds = ['fragment-1', 'fragment-2'];
      
      expect(() => {
        analyzer.buildSimilarityMatrix({ embeddings, fragmentIds });
      }).toThrow('Embeddings and fragmentIds length must match');
    });
  });
  
  describe('getSimilarityStatistics', () => {
    it('類似度統計を正しく計算する', () => {
      const matrix = [
        [1.0, 0.8, 0.6],
        [0.8, 1.0, 0.7],
        [0.6, 0.7, 1.0]
      ];
      
      const stats = analyzer.getSimilarityStatistics(matrix);
      
      expect(stats.mean).toBeCloseTo(0.7, 1);
      expect(stats.min).toBeCloseTo(0.6, 1);
      expect(stats.max).toBeCloseTo(0.8, 1);
    });
  });
  
  describe('getMostSimilarPairs', () => {
    it('最も類似度の高いペアを返す', () => {
      const matrix = {
        matrix: [
          [1.0, 0.8, 0.6],
          [0.8, 1.0, 0.7],
          [0.6, 0.7, 1.0]
        ],
        fragmentIds: ['f1', 'f2', 'f3'],
        dimensions: { rows: 3, cols: 3 }
      };
      
      const pairs = analyzer.getMostSimilarPairs({ matrix, topK: 2 });
      
      expect(pairs).toHaveLength(2);
      expect(pairs[0].similarity).toBeCloseTo(0.8, 1);
      expect(pairs[1].similarity).toBeCloseTo(0.7, 1);
    });
  });
  
  describe('getLeastSimilarPairs', () => {
    it('最も類似度の低いペアを返す', () => {
      const matrix = {
        matrix: [
          [1.0, 0.8, 0.6],
          [0.8, 1.0, 0.7],
          [0.6, 0.7, 1.0]
        ],
        fragmentIds: ['f1', 'f2', 'f3'],
        dimensions: { rows: 3, cols: 3 }
      };
      
      const pairs = analyzer.getLeastSimilarPairs({ matrix, topK: 2 });
      
      expect(pairs).toHaveLength(2);
      expect(pairs[0].similarity).toBeCloseTo(0.6, 1);
      expect(pairs[1].similarity).toBeCloseTo(0.7, 1);
    });
  });
});

