/**
 * ASO Content Improvement Advisor Unit Tests
 * 
 * Phase 4.3.3: テストコード
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { ContentImprovementAdvisor, FragmentAnalysis } from '../content-improvement-advisor';

describe('ContentImprovementAdvisor', () => {
  let advisor: ContentImprovementAdvisor;
  
  beforeEach(() => {
    advisor = new ContentImprovementAdvisor();
  });
  
  describe('generateImprovementProposals', () => {
    it('スコアに応じてFragmentを正しく分類する', () => {
      const fragments: FragmentAnalysis[] = [
        {
          fragment_id: 'f1',
          title: 'High Quality Fragment',
          content: 'test content',
          similarity_to_centroid: 0.85 // 85点 -> Keep
        },
        {
          fragment_id: 'f2',
          title: 'Medium Quality Fragment',
          content: 'test content',
          similarity_to_centroid: 0.65 // 65点 -> Revise
        },
        {
          fragment_id: 'f3',
          title: 'Low Quality Fragment',
          content: 'test content',
          similarity_to_centroid: 0.35 // 35点 -> Optimize
        }
      ];
      
      const report = advisor.generateImprovementProposals(fragments);
      
      expect(report.summary.totalFragments).toBe(3);
      expect(report.summary.keep).toBe(1);
      expect(report.summary.revise).toBe(1);
      expect(report.summary.optimize).toBe(1);
      
      expect(report.proposals).toHaveLength(3);
    });
    
    it('80点以上はKeep提案', () => {
      const fragments: FragmentAnalysis[] = [
        {
          fragment_id: 'f1',
          title: 'Test Fragment',
          content: 'test',
          similarity_to_centroid: 0.82
        }
      ];
      
      const report = advisor.generateImprovementProposals(fragments);
      
      expect(report.proposals[0].category).toBe('keep');
      expect(report.proposals[0].score).toBe(82);
      expect(report.proposals[0].priority).toBe('low');
    });
    
    it('50-79点はRevise提案', () => {
      const fragments: FragmentAnalysis[] = [
        {
          fragment_id: 'f1',
          title: 'Test Fragment',
          content: 'test',
          similarity_to_centroid: 0.65
        }
      ];
      
      const report = advisor.generateImprovementProposals(fragments);
      
      expect(report.proposals[0].category).toBe('revise');
      expect(report.proposals[0].score).toBe(65);
      expect(report.proposals[0].priority).toBe('medium');
    });
    
    it('50-59点のReviseは優先度高', () => {
      const fragments: FragmentAnalysis[] = [
        {
          fragment_id: 'f1',
          title: 'Test Fragment',
          content: 'test',
          similarity_to_centroid: 0.55
        }
      ];
      
      const report = advisor.generateImprovementProposals(fragments);
      
      expect(report.proposals[0].category).toBe('revise');
      expect(report.proposals[0].priority).toBe('high');
    });
    
    it('49点以下はOptimize提案', () => {
      const fragments: FragmentAnalysis[] = [
        {
          fragment_id: 'f1',
          title: 'Test Fragment',
          content: 'test',
          similarity_to_centroid: 0.45
        }
      ];
      
      const report = advisor.generateImprovementProposals(fragments);
      
      expect(report.proposals[0].category).toBe('optimize');
      expect(report.proposals[0].score).toBe(45);
      expect(report.proposals[0].priority).toBe('high');
    });
    
    it('Quick Winsは優先度高の提案のみ', () => {
      const fragments: FragmentAnalysis[] = [
        { fragment_id: 'f1', title: 'F1', content: 'test', similarity_to_centroid: 0.85 }, // Keep (low)
        { fragment_id: 'f2', title: 'F2', content: 'test', similarity_to_centroid: 0.55 }, // Revise (high)
        { fragment_id: 'f3', title: 'F3', content: 'test', similarity_to_centroid: 0.35 }, // Optimize (high)
        { fragment_id: 'f4', title: 'F4', content: 'test', similarity_to_centroid: 0.65 }  // Revise (medium)
      ];
      
      const report = advisor.generateImprovementProposals(fragments);
      
      expect(report.quickWins.length).toBe(2); // f2とf3のみ
      expect(report.quickWins.every(p => p.priority === 'high')).toBe(true);
    });
    
    it('提案が優先度順にソートされる', () => {
      const fragments: FragmentAnalysis[] = [
        { fragment_id: 'f1', title: 'F1', content: 'test', similarity_to_centroid: 0.85 }, // low
        { fragment_id: 'f2', title: 'F2', content: 'test', similarity_to_centroid: 0.65 }, // medium
        { fragment_id: 'f3', title: 'F3', content: 'test', similarity_to_centroid: 0.35 }  // high
      ];
      
      const report = advisor.generateImprovementProposals(fragments);
      
      expect(report.proposals[0].priority).toBe('high');
      expect(report.proposals[1].priority).toBe('medium');
      expect(report.proposals[2].priority).toBe('low');
    });
  });
  
  describe('generateMarkdownReport', () => {
    it('Markdownレポートを生成する', () => {
      const fragments: FragmentAnalysis[] = [
        { fragment_id: 'f1', title: 'Fragment 1', content: 'test', similarity_to_centroid: 0.85 },
        { fragment_id: 'f2', title: 'Fragment 2', content: 'test', similarity_to_centroid: 0.65 },
        { fragment_id: 'f3', title: 'Fragment 3', content: 'test', similarity_to_centroid: 0.35 }
      ];
      
      const report = advisor.generateImprovementProposals(fragments);
      const markdown = advisor.generateMarkdownReport(report);
      
      expect(markdown).toContain('# コンテンツ改善提案レポート');
      expect(markdown).toContain('## 📊 サマリー');
      expect(markdown).toContain('## 🎯 Quick Wins');
      expect(markdown).toContain('## 📋 カテゴリ別詳細');
    });
    
    it('総合評価が正しく生成される', () => {
      const highQualityFragments: FragmentAnalysis[] = Array(8).fill(null).map((_, i) => ({
        fragment_id: `f${i}`,
        title: `Fragment ${i}`,
        content: 'test',
        similarity_to_centroid: 0.85
      })).concat(Array(2).fill(null).map((_, i) => ({
        fragment_id: `f${i + 8}`,
        title: `Fragment ${i + 8}`,
        content: 'test',
        similarity_to_centroid: 0.65
      })));
      
      const report = advisor.generateImprovementProposals(highQualityFragments);
      const markdown = advisor.generateMarkdownReport(report);
      
      // 80%がKeepなので「優秀」判定
      expect(markdown).toContain('✅ **優秀**');
    });
  });
});

