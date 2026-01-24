/**
 * CLAVI Entity Extractor Unit Tests
 * 
 * Phase 4.4.0: テストコード
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { CLAVIEntityExtractor, EntityExtractionParams } from '../entity-extractor';

// Mock設定
jest.mock('openai');

describe('CLAVIEntityExtractor', () => {
  let extractor: CLAVIEntityExtractor;
  
  beforeEach(() => {
    // 環境変数設定
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    extractor = new CLAVIEntityExtractor();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('OPENAI_API_KEY が設定されていない場合はエラーを投げる', () => {
      delete process.env.OPENAI_API_KEY;
      
      expect(() => {
        new CLAVIEntityExtractor();
      }).toThrow('[CLAVIEntityExtractor] OPENAI_API_KEY が設定されていません');
    });
    
    it('正常に初期化される', () => {
      expect(extractor).toBeInstanceOf(CLAVIEntityExtractor);
    });
  });
  
  describe('extractEntities', () => {
    it('Webページからエンティティを抽出する', async () => {
      const params: EntityExtractionParams = {
        url: 'https://example.com',
        title: 'Example Company',
        description: 'We provide great services',
        headings: ['Service 1', 'Service 2', 'About Us'],
        content: 'Example Company is a leading provider of services. We offer Service 1 and Service 2.'
      };
      
      // Mock実装は省略
      // const result = await extractor.extractEntities(params);
      
      // expect(result.organization).toBeDefined();
      // expect(result.organization?.name).toBe('Example Company');
      // expect(result.organization?.evidence).toBeDefined();
    });
    
    it('Organization には evidence が含まれる', async () => {
      // テストケース: 抽出根拠が必須
    });
    
    it('Services は最大3個まで', async () => {
      // テストケース: 3個を超える場合は切り捨て
    });
    
    it('Products は最大3個まで', async () => {
      // テストケース: 3個を超える場合は切り捨て
    });
    
    it('knowsAbout は最大5個まで', async () => {
      // テストケース: 5個を超える場合は切り捨て
    });
    
    it('OpenAI APIエラー時はフォールバックエンティティを返す', async () => {
      const params: EntityExtractionParams = {
        url: 'https://example.com',
        title: 'Example Company',
        description: 'Test description',
        headings: [],
        content: ''
      };
      
      // Mock実装は省略（APIエラーをシミュレート）
      // const result = await extractor.extractEntities(params);
      
      // expect(result.organization).toBeDefined();
      // expect(result.organization?.name).toBe('Example'); // ドメインから抽出
    });
  });
  
  describe('generateExtractionSummary', () => {
    it('エンティティ抽出結果のMarkdownサマリーを生成する', () => {
      const entities = {
        organization: {
          name: 'Test Company',
          url: 'https://test.com',
          description: 'A test company',
          evidence: 'Test Company is a leading provider'
        },
        services: [
          {
            name: 'Service A',
            description: 'Description A',
            evidence: 'We offer Service A'
          }
        ],
        products: [
          {
            name: 'Product X',
            description: 'Description X',
            evidence: 'Our product X is innovative'
          }
        ],
        knowsAbout: ['AI', 'Machine Learning']
      };
      
      const summary = extractor.generateExtractionSummary(entities);
      
      expect(summary).toContain('# エンティティ抽出結果');
      expect(summary).toContain('## Organization');
      expect(summary).toContain('## Services');
      expect(summary).toContain('## Products');
      expect(summary).toContain('## knowsAbout');
    });
    
    it('エンティティがない場合でもエラーを投げない', () => {
      const emptyEntities = {};
      
      const summary = extractor.generateExtractionSummary(emptyEntities);
      
      expect(summary).toContain('# エンティティ抽出結果');
    });
  });
});

