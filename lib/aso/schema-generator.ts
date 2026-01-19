/**
 * ASO Schema Generator
 * 
 * Phase 4.4.1: JSON-LD生成（Option A: 最小@graph）
 * - Schema.org 16.0+ 準拠
 * - hasPart.text は要約（20-30語）に制限
 * - Organization + WebSite + WebPage の最小構成
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import { ExtractedEntities } from './entity-extractor';

export interface FragmentSummary {
  fragmentId: string;
  title: string;
  fullContent: string; // 50-150語の完全なコンテンツ
}

export interface SchemaGenerationParams {
  url: string;
  title: string;
  description: string;
  fragments: FragmentSummary[];
  entities: ExtractedEntities;
}

export interface GeneratedSchema {
  '@context': string;
  '@graph': any[];
}

export class ASOSchemaGenerator {
  /**
   * JSON-LD生成（Option A: 最小プロダクト）
   * 
   * ⚠️ 修正2適用: hasPart.text は"要約"へ縮退（20-30語）
   * 
   * 生成対象:
   * 1. Organization
   * 2. WebSite
   * 3. WebPage with hasPart（要約のみ）
   * 
   * @param params - URL、タイトル、Fragment、エンティティ
   * @returns JSON-LD Schema
   */
  generateSchema(params: SchemaGenerationParams): GeneratedSchema {
    const { url, title, description, fragments, entities } = params;
    
    console.log(`[ASOSchemaGenerator] JSON-LD生成開始:`);
    console.log(`  - URL: ${url}`);
    console.log(`  - Fragments: ${fragments.length}個`);
    console.log(`  - Organization: ${entities.organization ? '✅' : '❌'}`);
    
    const baseUrl = this.getBaseUrl(url);
    
    // @graph 配列
    const graph: any[] = [];
    
    // 1. Organization（Mike King理論準拠）
    const organization = this.generateOrganization(baseUrl, entities);
    graph.push(organization);
    
    // 2. WebSite
    const webSite = this.generateWebSite(baseUrl, entities);
    graph.push(webSite);
    
    // 3. WebPage with hasPart（修正版）
    const webPage = this.generateWebPage(url, title, description, baseUrl, fragments, entities);
    graph.push(webPage);
    
    console.log(`[ASOSchemaGenerator] JSON-LD生成完了: @graph要素${graph.length}個`);
    
    return {
      '@context': 'https://schema.org',
      '@graph': graph
    };
  }
  
  /**
   * Organization スキーマ生成
   */
  private generateOrganization(baseUrl: string, entities: ExtractedEntities): any {
    const org = entities.organization;
    
    if (!org) {
      // フォールバック: 最小限のOrganization
      return {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        'name': 'Unknown Organization',
        'url': baseUrl
      };
    }
    
    const schema: any = {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      'name': org.name,
      'url': org.url || baseUrl,
      'description': org.description
    };
    
    // knowsAbout（専門知識領域）を追加
    if (entities.knowsAbout && entities.knowsAbout.length > 0) {
      schema.knowsAbout = entities.knowsAbout;
    }
    
    return schema;
  }
  
  /**
   * WebSite スキーマ生成
   */
  private generateWebSite(baseUrl: string, entities: ExtractedEntities): any {
    const org = entities.organization;
    
    return {
      '@type': 'WebSite',
      '@id': `${baseUrl}#website`,
      'url': baseUrl,
      'name': org?.name || 'Unknown Website',
      'publisher': { '@id': `${baseUrl}#organization` }
    };
  }
  
  /**
   * WebPage with hasPart スキーマ生成（修正版）
   * 
   * ⚠️ 修正2適用: hasPart.text は要約のみ（20-30語に圧縮）
   */
  private generateWebPage(
    url: string,
    title: string,
    description: string,
    baseUrl: string,
    fragments: FragmentSummary[],
    entities: ExtractedEntities
  ): any {
    const webPage: any = {
      '@type': 'WebPage',
      '@id': url,
      'url': url,
      'name': title,
      'description': description,
      'isPartOf': { '@id': `${baseUrl}#website` },
      'publisher': { '@id': `${baseUrl}#organization` }
    };
    
    // hasPart（WebPageElement）を追加
    if (fragments.length > 0) {
      webPage.hasPart = fragments.map((fragment) => {
        // ⚠️ 修正2: 要約のみ（20-30語に圧縮）
        const summary = this.extractSummary(fragment.fullContent, 30);
        
        return {
          '@type': 'WebPageElement',
          '@id': `${url}#${fragment.fragmentId}`,
          'name': fragment.title,
          'text': summary, // ⚠️ 短め要約のみ（過剰投入回避）
          'url': `${url}#${fragment.fragmentId}`
        };
      });
    }
    
    return webPage;
  }
  
  /**
   * 要約抽出（20-30語）
   * 
   * ⚠️ 修正2: 本文全体をhasPart.textに入れず、要約のみ
   * 
   * アルゴリズム:
   * 1. 最初の2文を抽出
   * 2. 30語を超える場合は切り捨て
   * 3. 省略記号（...）を追加
   */
  private extractSummary(fullContent: string, maxWords: number): string {
    // 文の境界で分割（. ! ? で終わる）
    const sentences = fullContent.match(/[^.!?]+[.!?]+/g) || [];
    
    // 最初の2文を取得
    let summary = sentences.slice(0, 2).join(' ').trim();
    
    // 語数カウント（空白区切り）
    const words = summary.split(/\s+/);
    
    // 30語を超える場合は切り捨て
    if (words.length > maxWords) {
      summary = words.slice(0, maxWords).join(' ') + '...';
    }
    
    // 最後が句読点でない場合は追加
    if (summary && !summary.match(/[.!?]$/)) {
      summary += '...';
    }
    
    return summary;
  }
  
  /**
   * Base URL抽出（origin）
   */
  private getBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch (error) {
      console.error('[ASOSchemaGenerator] Invalid URL:', url);
      return url;
    }
  }
  
  /**
   * Rich Results Test 検証用URLを生成
   */
  generateRichResultsTestUrl(schema: GeneratedSchema): string {
    const schemaJson = JSON.stringify(schema, null, 2);
    const encodedSchema = encodeURIComponent(schemaJson);
    
    // Google Rich Results Test URL
    // 注: 実際にはページURLも必要だが、スキーマのみで検証可能
    return `https://search.google.com/test/rich-results?code=${encodedSchema}`;
  }
  
  /**
   * Schema.org バリデーション
   * 
   * 基本的なバリデーションチェック:
   * - @context の存在
   * - @graph の存在
   * - 必須フィールドの存在
   */
  validateSchema(schema: GeneratedSchema): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // @context チェック
    if (!schema['@context']) {
      errors.push('@context が存在しません');
    } else if (schema['@context'] !== 'https://schema.org') {
      warnings.push('@context が "https://schema.org" ではありません');
    }
    
    // @graph チェック
    if (!schema['@graph'] || !Array.isArray(schema['@graph'])) {
      errors.push('@graph が存在しないか、配列ではありません');
      return { valid: false, errors, warnings };
    }
    
    // Organization の存在チェック
    const hasOrganization = schema['@graph'].some(
      (item: any) => item['@type'] === 'Organization'
    );
    if (!hasOrganization) {
      errors.push('Organization が @graph 内に存在しません');
    }
    
    // WebSite の存在チェック
    const hasWebSite = schema['@graph'].some(
      (item: any) => item['@type'] === 'WebSite'
    );
    if (!hasWebSite) {
      errors.push('WebSite が @graph 内に存在しません');
    }
    
    // WebPage の存在チェック
    const hasWebPage = schema['@graph'].some(
      (item: any) => item['@type'] === 'WebPage'
    );
    if (!hasWebPage) {
      errors.push('WebPage が @graph 内に存在しません');
    }
    
    // hasPart チェック（WebPage内）
    const webPage = schema['@graph'].find(
      (item: any) => item['@type'] === 'WebPage'
    );
    if (webPage && webPage.hasPart) {
      if (!Array.isArray(webPage.hasPart)) {
        errors.push('WebPage.hasPart が配列ではありません');
      } else {
        // 各WebPageElementのtext長チェック
        for (const part of webPage.hasPart) {
          if (part.text) {
            const wordCount = part.text.split(/\s+/).length;
            if (wordCount > 50) {
              warnings.push(
                `Fragment "${part.name}" の text が長すぎます（${wordCount}語）。30語以下を推奨。`
              );
            }
          }
        }
      }
    }
    
    const valid = errors.length === 0;
    
    console.log(`[ASOSchemaGenerator] バリデーション結果:`);
    console.log(`  - Valid: ${valid ? '✅' : '❌'}`);
    console.log(`  - Errors: ${errors.length}個`);
    console.log(`  - Warnings: ${warnings.length}個`);
    
    return { valid, errors, warnings };
  }
  
  /**
   * 整形されたJSON文字列を生成
   */
  formatSchema(schema: GeneratedSchema): string {
    return JSON.stringify(schema, null, 2);
  }
  
  /**
   * HTML <script> タグを生成
   */
  generateScriptTag(schema: GeneratedSchema): string {
    const formattedSchema = this.formatSchema(schema);
    return `<script type="application/ld+json">\n${formattedSchema}\n</script>`;
  }
}

