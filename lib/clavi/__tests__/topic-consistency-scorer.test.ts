/**
 * CLAVI Topic Consistency Scorer Unit Tests
 * 
 * Phase 4.2.3: テストコード
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { TopicConsistencyScorer } from '../topic-consistency-scorer';

describe('TopicConsistencyScorer', () => {
  let scorer: TopicConsistencyScorer;
  
  beforeEach(() => {
    scorer = new TopicConsistencyScorer();
  });
  
  describe('calculateTopicConsistency', () => {
    it('完全に一致するベクトルのスコアは100点', () => {
      const embeddings = [
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3]
      ];
      const fragmentIds = ['f1', 'f2', 'f3'];
      
      const result = scorer.calculateTopicConsistency({ embeddings, fragmentIds });
      
      expect(result.score).toBe(100);
      expect(result.statistics.mean).toBeCloseTo(1.0, 5);
      expect(result.statistics.stdDev).toBeCloseTo(0.0, 5);
    });
    
    it('類似度の高いベクトルは高スコア（80点以上）', () => {
      const embeddings = [
        [1, 0, 0],
        [0.9, 0.1, 0],
        [0.95, 0.05, 0]
      ];
      const fragmentIds = ['f1', 'f2', 'f3'];
      
      const result = scorer.calculateTopicConsistency({ embeddings, fragmentIds });
      
      expect(result.score).toBeGreaterThanOrEqual(80);
    });
    
    it('バラバラのベクトルは低スコア', () => {
      const embeddings = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
      const fragmentIds = ['f1', 'f2', 'f3'];
      
      const result = scorer.calculateTopicConsistency({ embeddings, fragmentIds });
      
      expect(result.score).toBeLessThan(80);
    });
    
    it('embeddingsとfragmentIdsの長さが異なる場合はエラーを投げる', () => {
      const embeddings = [[1, 2, 3]];
      const fragmentIds = ['f1', 'f2'];
      
      expect(() => {
        scorer.calculateTopicConsistency({ embeddings, fragmentIds });
      }).toThrow('Embeddings and fragmentIds length must match');
    });
    
    it('空のembeddingsの場合はエラーを投げる', () => {
      expect(() => {
        scorer.calculateTopicConsistency({ embeddings: [], fragmentIds: [] });
      }).toThrow('Embeddings cannot be empty');
    });
  });
  
  describe('classifyFragmentsByScore', () => {
    it('スコアに応じてFragmentを正しく分類する', () => {
      const deviations = [
        { fragmentId: 'f1', similarityToCentroid: 0.9 }, // Keep (90点)
        { fragmentId: 'f2', similarityToCentroid: 0.7 }, // Revise (70点)
        { fragmentId: 'f3', similarityToCentroid: 0.4 }  // Optimize (40点)
      ];
      
      const classification = scorer.classifyFragmentsByScore(deviations);
      
      expect(classification.keep).toContain('f1');
      expect(classification.revise).toContain('f2');
      expect(classification.optimize).toContain('f3');
    });
    
    it('80点ちょうどはKeep判定', () => {
      const deviations = [
        { fragmentId: 'f1', similarityToCentroid: 0.8 }
      ];
      
      const classification = scorer.classifyFragmentsByScore(deviations);
      
      expect(classification.keep).toContain('f1');
    });
    
    it('50点ちょうどはRevise判定', () => {
      const deviations = [
        { fragmentId: 'f1', similarityToCentroid: 0.5 }
      ];
      
      const classification = scorer.classifyFragmentsByScore(deviations);
      
      expect(classification.revise).toContain('f1');
    });
  });
  
  describe('assessTopicQuality', () => {
    it('80点以上はグレードA', () => {
      const assessment = scorer.assessTopicQuality(85);
      expect(assessment.grade).toBe('A');
    });
    
    it('70-79点はグレードB', () => {
      const assessment = scorer.assessTopicQuality(75);
      expect(assessment.grade).toBe('B');
    });
    
    it('60-69点はグレードC', () => {
      const assessment = scorer.assessTopicQuality(65);
      expect(assessment.grade).toBe('C');
    });
    
    it('50-59点はグレードD', () => {
      const assessment = scorer.assessTopicQuality(55);
      expect(assessment.grade).toBe('D');
    });
    
    it('49点以下はグレードF', () => {
      const assessment = scorer.assessTopicQuality(40);
      expect(assessment.grade).toBe('F');
    });
    
    it('各グレードに推奨事項が含まれる', () => {
      const assessment = scorer.assessTopicQuality(85);
      expect(assessment.recommendations.length).toBeGreaterThan(0);
    });
  });
});

