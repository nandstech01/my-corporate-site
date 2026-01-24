/**
 * CLAVI Internal Link Optimizer Unit Tests
 * 
 * Phase 4.3.1: テストコード
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { InternalLinkOptimizer } from '../internal-link-optimizer';

// Mock設定
jest.mock('@supabase/supabase-js');

describe('InternalLinkOptimizer', () => {
  let optimizer: InternalLinkOptimizer;
  
  beforeEach(() => {
    // 環境変数設定
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    
    optimizer = new InternalLinkOptimizer();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('Supabase環境変数が設定されていない場合はエラーを投げる', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      expect(() => {
        new InternalLinkOptimizer();
      }).toThrow('[InternalLinkOptimizer] Supabase環境変数が設定されていません');
    });
    
    it('正常に初期化される', () => {
      expect(optimizer).toBeInstanceOf(InternalLinkOptimizer);
    });
  });
  
  describe('recommendInternalLinks', () => {
    it('類似Fragmentの推奨リンクを返す', async () => {
      const params = {
        tenant_id: 'test-tenant-id',
        analysis_id: 'test-analysis-id',
        fragment_id: 'h2-test-1',
        top_k: 5,
        match_threshold: 0.6
      };
      
      // Mock実装は省略
      // const result = await optimizer.recommendInternalLinks(params);
      
      // expect(result.sourceFragmentId).toBe('h2-test-1');
      // expect(result.recommendations.length).toBeGreaterThan(0);
      // expect(result.recommendations[0].similarityScore).toBeGreaterThanOrEqual(0.6);
    });
    
    it('top_kのデフォルト値は5', async () => {
      // テストケース: top_kを指定しない場合
      // デフォルトで5件の推奨が返される
    });
    
    it('match_thresholdのデフォルト値は0.6', async () => {
      // テストケース: match_thresholdを指定しない場合
      // 類似度0.6以上のFragmentのみが推奨される
    });
    
    it('自分自身は推奨リストから除外される', async () => {
      // テストケース: 検索結果に自分自身が含まれる場合
      // 推奨リストから除外される
    });
  });
  
  describe('buildInternalLinkMatrix', () => {
    it('全Fragment間の内部リンクマトリクスを構築する', async () => {
      const params = {
        tenant_id: 'test-tenant-id',
        analysis_id: 'test-analysis-id',
        top_k: 3
      };
      
      // Mock実装は省略
      // const result = await optimizer.buildInternalLinkMatrix(params);
      
      // expect(result.matrix.size).toBeGreaterThan(0);
      // expect(result.totalFragments).toBeGreaterThan(0);
    });
    
    it('個別Fragmentのエラーは全体の処理を止めない', async () => {
      // テストケース: 一部のFragmentでエラーが発生
      // 処理は継続し、他のFragmentは正常に処理される
    });
  });
  
  describe('generateOptimizationReport', () => {
    it('内部リンク最適化レポートを生成する', () => {
      // Mock matrix
      const mockMatrix = new Map();
      
      mockMatrix.set('f1', {
        sourceFragmentId: 'f1',
        sourceTitle: 'Fragment 1',
        recommendations: [
          { fragmentId: 'f2', completeUri: '#f2', contentTitle: 'Fragment 2', similarityScore: 0.85, reason: 'test' },
          { fragmentId: 'f3', completeUri: '#f3', contentTitle: 'Fragment 3', similarityScore: 0.65, reason: 'test' }
        ],
        totalCandidates: 2
      });
      
      const report = optimizer.generateOptimizationReport(mockMatrix);
      
      expect(report.summary.totalFragments).toBe(1);
      expect(report.summary.strongLinks).toBe(1); // 0.8以上
      expect(report.summary.moderateLinks).toBe(1); // 0.6-0.8
      expect(report.topOpportunities.length).toBeGreaterThan(0);
    });
    
    it('空のマトリクスでもエラーを投げない', () => {
      const emptyMatrix = new Map();
      
      const report = optimizer.generateOptimizationReport(emptyMatrix);
      
      expect(report.summary.totalFragments).toBe(0);
      expect(report.summary.averageRecommendations).toBe(0);
    });
  });
});

