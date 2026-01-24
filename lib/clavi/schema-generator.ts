/**
 * CLAVI Schema Generator
 *
 * Phase 4.4.1: JSON-LD生成（Option A: 最小@graph）
 * Phase 8: sameAs, Author Schema追加
 * - Schema.org 16.0+ 準拠
 * - hasPart.text は要約（20-30語）に制限
 * - Organization + WebSite + WebPage の最小構成
 * - Person/Author Schema（Phase 8追加）
 * - sameAs統合（Phase 8追加）
 *
 * @version 2.0.0
 * @date 2026-01-20
 */

import { ExtractedEntities } from './entity-extractor';
import type { TenantSettings, AuthorSettings } from './types/tenant-settings';

// ========================================
// 定数定義（Phase 8.1）
// ========================================

/** 日本語要約の最大文字数 */
const JAPANESE_SUMMARY_MAX_CHARS = 60;

/** 英語要約の最大語数 */
const ENGLISH_SUMMARY_MAX_WORDS = 30;

/** hasPart.text の警告しきい値（語数） */
const SUMMARY_WARNING_THRESHOLD = 50;

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
  /** Phase 8: テナント設定（sameAs, Author） */
  tenantSettings?: TenantSettings;
  /** Phase 8.1: 日付情報（Google推奨） */
  datePublished?: string; // ISO 8601形式
  dateModified?: string;  // ISO 8601形式
}

export interface GeneratedSchema {
  '@context': string;
  '@graph': any[];
}

export class CLAVISchemaGenerator {
  /**
   * JSON-LD生成（Option A: 最小プロダクト + Phase 8拡張）
   *
   * ⚠️ 修正2適用: hasPart.text は"要約"へ縮退（20-30語）
   *
   * 生成対象:
   * 1. Organization（sameAs追加 - Phase 8）
   * 2. WebSite
   * 3. WebPage with hasPart（要約のみ）
   * 4. Person/Author（Phase 8追加）
   *
   * @param params - URL、タイトル、Fragment、エンティティ、テナント設定
   * @returns JSON-LD Schema
   */
  generateSchema(params: SchemaGenerationParams): GeneratedSchema {
    const { url, title, description, fragments, entities, tenantSettings, datePublished, dateModified } = params;

    console.log(`[CLAVISchemaGenerator] JSON-LD生成開始:`);
    console.log(`  - URL: ${url}`);
    console.log(`  - Fragments: ${fragments.length}個`);
    console.log(`  - Organization: ${entities.organization ? '✅' : '❌'}`);
    console.log(`  - TenantSettings: ${tenantSettings ? '✅' : '❌'}`);
    console.log(`  - datePublished: ${datePublished || '未設定'}`);
    console.log(`  - dateModified: ${dateModified || '未設定'}`);

    const baseUrl = this.getBaseUrl(url);

    // @graph 配列
    const graph: any[] = [];

    // 1. Organization（Mike King理論準拠 + sameAs追加 + @id必須）
    const organization = this.generateOrganization(baseUrl, entities, tenantSettings);
    graph.push(organization);

    // 2. WebSite
    const webSite = this.generateWebSite(baseUrl, entities);
    graph.push(webSite);

    // 3. Person/Author（Phase 8追加）
    const author = this.generateAuthor(baseUrl, tenantSettings);
    if (author) {
      graph.push(author);
    }

    // 4. WebPage with hasPart（修正版 + author追加 + 日付追加）
    const webPage = this.generateWebPage(
      url, title, description, baseUrl, fragments, entities, author,
      datePublished, dateModified
    );
    graph.push(webPage);

    console.log(`[CLAVISchemaGenerator] JSON-LD生成完了: @graph要素${graph.length}個`);

    return {
      '@context': 'https://schema.org',
      '@graph': graph
    };
  }
  
  /**
   * Organization スキーマ生成（Phase 8: sameAs追加）
   */
  private generateOrganization(
    baseUrl: string,
    entities: ExtractedEntities,
    tenantSettings?: TenantSettings
  ): any {
    const org = entities.organization;

    if (!org) {
      // フォールバック: 最小限のOrganization
      const fallback: any = {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        'name': 'Unknown Organization',
        'url': baseUrl
      };

      // Phase 8: sameAs追加（テナント設定から）
      const sameAs = this.buildSameAsArray(tenantSettings?.sameAs?.organization);
      if (sameAs.length > 0) {
        fallback.sameAs = sameAs;
      }

      return fallback;
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

    // Phase 8: sameAs追加（テナント設定から）
    const sameAs = this.buildSameAsArray(tenantSettings?.sameAs?.organization);
    if (sameAs.length > 0) {
      schema.sameAs = sameAs;
    }

    return schema;
  }

  /**
   * Person/Author スキーマ生成（Phase 8追加）
   */
  private generateAuthor(baseUrl: string, tenantSettings?: TenantSettings): any | null {
    const authorSettings = tenantSettings?.author;

    if (!authorSettings?.name) {
      return null;
    }

    console.log(`[CLAVISchemaGenerator] Author Schema生成: ${authorSettings.name}`);

    const author: any = {
      '@type': 'Person',
      '@id': `${baseUrl}#author`,
      'name': authorSettings.name,
      'worksFor': { '@id': `${baseUrl}#organization` }
    };

    if (authorSettings.jobTitle) {
      author.jobTitle = authorSettings.jobTitle;
    }

    if (authorSettings.description) {
      author.description = authorSettings.description;
    }

    if (authorSettings.image) {
      author.image = authorSettings.image;
    }

    if (authorSettings.expertise && authorSettings.expertise.length > 0) {
      author.knowsAbout = authorSettings.expertise;
    }

    // sameAs追加
    const sameAs = this.buildSameAsArray(authorSettings.sameAs);
    if (sameAs.length > 0) {
      author.sameAs = sameAs;
    }

    return author;
  }

  /**
   * sameAs URL配列を構築
   */
  private buildSameAsArray(sameAs: any): string[] {
    if (!sameAs) return [];

    const urls: string[] = [];

    if (sameAs.twitter) urls.push(sameAs.twitter);
    if (sameAs.linkedin) urls.push(sameAs.linkedin);
    if (sameAs.facebook) urls.push(sameAs.facebook);
    if (sameAs.youtube) urls.push(sameAs.youtube);
    if (sameAs.github) urls.push(sameAs.github);
    if (sameAs.custom && Array.isArray(sameAs.custom)) {
      urls.push(...sameAs.custom);
    }

    return urls.filter((url) => url && url.trim().length > 0);
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
   * WebPage with hasPart スキーマ生成（修正版 + Phase 8: author追加 + Phase 8.1: 日付追加）
   *
   * ⚠️ 修正2適用: hasPart.text は要約のみ（20-30語に圧縮）
   * ⚠️ Google推奨: datePublished/dateModified をISO 8601形式で追加
   */
  private generateWebPage(
    url: string,
    title: string,
    description: string,
    baseUrl: string,
    fragments: FragmentSummary[],
    entities: ExtractedEntities,
    author?: any,
    datePublished?: string,
    dateModified?: string
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

    // Phase 8.1: 日付情報追加（Google推奨、ISO 8601形式 + 検証）
    if (datePublished) {
      if (this.isValidISO8601(datePublished)) {
        webPage.datePublished = datePublished;
      } else {
        console.warn(`[CLAVISchemaGenerator] Invalid ISO 8601 datePublished: ${datePublished}`);
      }
    }
    if (dateModified) {
      if (this.isValidISO8601(dateModified)) {
        webPage.dateModified = dateModified;
      } else {
        console.warn(`[CLAVISchemaGenerator] Invalid ISO 8601 dateModified: ${dateModified}`);
      }
    }

    // Phase 8: author追加
    if (author) {
      webPage.author = { '@id': author['@id'] };
    }

    // hasPart（WebPageElement）を追加 - 常に生成を試みる
    if (fragments && fragments.length > 0) {
      webPage.hasPart = fragments.map((fragment) => {
        // ⚠️ 修正2: 要約のみ（20-30語に圧縮）+ 日本語対応
        const summary = this.extractSummary(fragment.fullContent, 30);

        return {
          '@type': 'WebPageElement',
          '@id': `${url}#${fragment.fragmentId}`,
          'name': fragment.title,
          'text': summary, // ⚠️ 短め要約のみ（過剰投入回避）
          'url': `${url}#${fragment.fragmentId}`
        };
      });

      console.log(`[CLAVISchemaGenerator] hasPart生成: ${fragments.length}個のWebPageElement`);
    } else {
      console.log(`[CLAVISchemaGenerator] ⚠️ hasPart未生成: fragmentsが空です`);
    }

    return webPage;
  }
  
  /**
   * 要約抽出（20-30語/文字）
   *
   * ⚠️ 修正2: 本文全体をhasPart.textに入れず、要約のみ
   * ⚠️ Phase 8.1: 日本語対応（。！？に対応）
   *
   * アルゴリズム:
   * 1. 最初の2文を抽出（英語: .!? / 日本語: 。！？）
   * 2. 英語: 30語、日本語: 60文字を超える場合は切り捨て
   * 3. 省略記号（...または…）を追加
   */
  private extractSummary(fullContent: string, maxWords: number): string {
    if (!fullContent || fullContent.trim().length === 0) {
      return '';
    }

    // 日本語コンテンツかどうかを判定（ひらがな・カタカナ・漢字の存在で判定）
    const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(fullContent);

    if (isJapanese) {
      return this.extractJapaneseSummary(fullContent);
    } else {
      return this.extractEnglishSummary(fullContent, maxWords);
    }
  }

  /**
   * 日本語要約抽出
   * - 文境界: 。！？
   * - 最大60文字（JAPANESE_SUMMARY_MAX_CHARS）
   */
  private extractJapaneseSummary(fullContent: string): string {
    // 日本語の文境界で分割（。！？で終わる）
    const sentences = fullContent.match(/[^。！？]+[。！？]+/g) || [];

    if (sentences.length === 0) {
      // 文境界が見つからない場合は最初のN文字を使用
      const trimmed = fullContent.trim().slice(0, JAPANESE_SUMMARY_MAX_CHARS);
      return trimmed.length < fullContent.trim().length ? trimmed + '…' : trimmed;
    }

    // 最初の2文を取得
    let summary = sentences.slice(0, 2).join('').trim();

    // 最大文字数を超える場合は切り捨て
    if (summary.length > JAPANESE_SUMMARY_MAX_CHARS) {
      summary = summary.slice(0, JAPANESE_SUMMARY_MAX_CHARS) + '…';
    }

    return summary;
  }

  /**
   * 英語要約抽出
   * - 文境界: . ! ?
   * - 最大30語
   */
  private extractEnglishSummary(fullContent: string, maxWords: number): string {
    // 英語の文境界で分割（. ! ? で終わる）
    const sentences = fullContent.match(/[^.!?]+[.!?]+/g) || [];

    if (sentences.length === 0) {
      // 文境界が見つからない場合は最初のmaxWords語を使用
      const words = fullContent.trim().split(/\s+/);
      if (words.length <= maxWords) {
        return fullContent.trim();
      }
      return words.slice(0, maxWords).join(' ') + '...';
    }

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
   * ISO 8601日付形式の検証
   *
   * 有効な形式:
   * - 2026-01-20
   * - 2026-01-20T12:00:00
   * - 2026-01-20T12:00:00Z
   * - 2026-01-20T12:00:00+09:00
   * - 2026-01-20T12:00:00.000Z
   */
  private isValidISO8601(date: string): boolean {
    if (!date || typeof date !== 'string') {
      return false;
    }

    // ISO 8601形式の正規表現
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?)?$/;

    if (!iso8601Regex.test(date)) {
      return false;
    }

    // 実際にパース可能かどうかも確認
    const parsed = Date.parse(date);
    return !isNaN(parsed);
  }

  /**
   * Base URL抽出（origin）
   */
  private getBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch (error) {
      console.error('[CLAVISchemaGenerator] Invalid URL:', url);
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
            if (wordCount > SUMMARY_WARNING_THRESHOLD) {
              warnings.push(
                `Fragment "${part.name}" の text が長すぎます（${wordCount}語）。${ENGLISH_SUMMARY_MAX_WORDS}語以下を推奨。`
              );
            }
          }
        }
      }
    }
    
    const valid = errors.length === 0;
    
    console.log(`[CLAVISchemaGenerator] バリデーション結果:`);
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

