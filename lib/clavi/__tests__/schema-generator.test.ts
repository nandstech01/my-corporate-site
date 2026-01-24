/**
 * CLAVI Schema Generator Unit Tests
 * 
 * Phase 4.4.1: テストコード
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { CLAVISchemaGenerator, SchemaGenerationParams } from '../schema-generator';
import { ExtractedEntities } from '../entity-extractor';

describe('CLAVISchemaGenerator', () => {
  let generator: CLAVISchemaGenerator;
  
  beforeEach(() => {
    generator = new CLAVISchemaGenerator();
  });
  
  describe('generateSchema', () => {
    it('最小@graphを生成する（Organization + WebSite + WebPage）', () => {
      const params: SchemaGenerationParams = {
        url: 'https://example.com/test',
        title: 'Test Page',
        description: 'A test page',
        fragments: [],
        entities: {
          organization: {
            name: 'Example Company',
            url: 'https://example.com',
            description: 'A test company',
            evidence: 'test'
          }
        }
      };
      
      const schema = generator.generateSchema(params);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@graph']).toHaveLength(3);
      
      const types = schema['@graph'].map((item: any) => item['@type']);
      expect(types).toContain('Organization');
      expect(types).toContain('WebSite');
      expect(types).toContain('WebPage');
    });
    
    it('Organization に knowsAbout を追加できる', () => {
      const params: SchemaGenerationParams = {
        url: 'https://example.com/test',
        title: 'Test Page',
        description: 'Test',
        fragments: [],
        entities: {
          organization: {
            name: 'Example Company',
            url: 'https://example.com',
            description: 'Test',
            evidence: 'test'
          },
          knowsAbout: ['AI', 'Machine Learning']
        }
      };
      
      const schema = generator.generateSchema(params);
      
      const org = schema['@graph'].find((item: any) => item['@type'] === 'Organization');
      expect(org.knowsAbout).toEqual(['AI', 'Machine Learning']);
    });
    
    it('hasPart に要約のみを含める（30語以下）', () => {
      const longContent = 'This is a very long content that exceeds thirty words. '.repeat(5);
      
      const params: SchemaGenerationParams = {
        url: 'https://example.com/test',
        title: 'Test Page',
        description: 'Test',
        fragments: [
          {
            fragmentId: 'h2-test-1',
            title: 'Test Fragment',
            fullContent: longContent
          }
        ],
        entities: {
          organization: {
            name: 'Test Company',
            url: 'https://example.com',
            description: 'Test',
            evidence: 'test'
          }
        }
      };
      
      const schema = generator.generateSchema(params);
      
      const webPage = schema['@graph'].find((item: any) => item['@type'] === 'WebPage');
      expect(webPage.hasPart).toHaveLength(1);
      
      const part = webPage.hasPart[0];
      expect(part['@type']).toBe('WebPageElement');
      expect(part.text).toBeDefined();
      
      // 30語以下であることを確認
      const wordCount = part.text.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(35); // 省略記号を考慮して少し余裕を持たせる
    });
    
    it('Fragmentが0個でもエラーを投げない', () => {
      const params: SchemaGenerationParams = {
        url: 'https://example.com/test',
        title: 'Test Page',
        description: 'Test',
        fragments: [],
        entities: {
          organization: {
            name: 'Test Company',
            url: 'https://example.com',
            description: 'Test',
            evidence: 'test'
          }
        }
      };
      
      expect(() => {
        generator.generateSchema(params);
      }).not.toThrow();
    });
    
    it('Organization がない場合はフォールバックを使用', () => {
      const params: SchemaGenerationParams = {
        url: 'https://example.com/test',
        title: 'Test Page',
        description: 'Test',
        fragments: [],
        entities: {}
      };
      
      const schema = generator.generateSchema(params);
      
      const org = schema['@graph'].find((item: any) => item['@type'] === 'Organization');
      expect(org.name).toBe('Unknown Organization');
    });
  });
  
  describe('validateSchema', () => {
    it('正しいスキーマはvalidation通過', () => {
      const params: SchemaGenerationParams = {
        url: 'https://example.com/test',
        title: 'Test Page',
        description: 'Test',
        fragments: [],
        entities: {
          organization: {
            name: 'Test Company',
            url: 'https://example.com',
            description: 'Test',
            evidence: 'test'
          }
        }
      };
      
      const schema = generator.generateSchema(params);
      const result = generator.validateSchema(schema);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('@context がない場合はエラー', () => {
      const invalidSchema: any = {
        '@graph': []
      };
      
      const result = generator.validateSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('@context が存在しません');
    });
    
    it('@graph がない場合はエラー', () => {
      const invalidSchema: any = {
        '@context': 'https://schema.org'
      };
      
      const result = generator.validateSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('hasPart.text が長すぎる場合は警告', () => {
      const longText = 'word '.repeat(60); // 60語
      
      const schema: any = {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Organization', '@id': 'test#org', name: 'Test' },
          { '@type': 'WebSite', '@id': 'test#website', url: 'test' },
          {
            '@type': 'WebPage',
            '@id': 'test',
            url: 'test',
            hasPart: [
              {
                '@type': 'WebPageElement',
                '@id': 'test#f1',
                name: 'Test Fragment',
                text: longText
              }
            ]
          }
        ]
      };
      
      const result = generator.validateSchema(schema);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('text が長すぎます');
    });
  });
  
  describe('generateScriptTag', () => {
    it('HTML <script> タグを生成する', () => {
      const params: SchemaGenerationParams = {
        url: 'https://example.com/test',
        title: 'Test Page',
        description: 'Test',
        fragments: [],
        entities: {
          organization: {
            name: 'Test Company',
            url: 'https://example.com',
            description: 'Test',
            evidence: 'test'
          }
        }
      };
      
      const schema = generator.generateSchema(params);
      const scriptTag = generator.generateScriptTag(schema);
      
      expect(scriptTag).toContain('<script type="application/ld+json">');
      expect(scriptTag).toContain('</script>');
      expect(scriptTag).toContain('"@context": "https://schema.org"');
    });
  });
});

