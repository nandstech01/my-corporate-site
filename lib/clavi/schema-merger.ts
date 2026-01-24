/**
 * CLAVI Schema Merger
 *
 * Phase 8: 型別マージロジック
 * - 既存JSON-LD（WordPress等）とCLAVI生成スキーマをインテリジェントにマージ
 * - sameAs, Author, knowsAbout の追加
 * - 重複検出・警告生成
 *
 * @version 1.0.0
 * @date 2026-01-20
 */

import type { JsonLdInfo } from './types/crawler';
import type { GeneratedSchema } from './schema-generator';
import type {
  TenantSettings,
} from './types/tenant-settings';

// ========================================
// 型定義
// ========================================

/**
 * マージ結果
 */
export interface SchemaMergeResult {
  /** マージ後のスキーマ */
  merged: GeneratedSchema;
  /** 衝突レポート */
  conflicts: ConflictReport[];
  /** 追加されたプロパティ */
  additions: string[];
  /** 警告メッセージ */
  warnings: string[];
}

/**
 * 衝突レポート
 */
export interface ConflictReport {
  /** 衝突した@type */
  type: string;
  /** 衝突内容 */
  field: string;
  /** 既存の値 */
  existingValue: any;
  /** CLAVI生成の値 */
  generatedValue: any;
  /** 解決方法 */
  resolution: 'existing' | 'generated' | 'merged';
}

/**
 * 既存スキーマ検出結果
 */
export interface ExistingSchemaDetection {
  /** Organization存在 */
  hasOrganization: boolean;
  /** WebSite存在 */
  hasWebSite: boolean;
  /** WebPage存在 */
  hasWebPage: boolean;
  /** Person/Author存在 */
  hasPerson: boolean;
  /** Article存在 */
  hasArticle: boolean;
  /** FAQPage存在 */
  hasFAQPage: boolean;
  /** 既存Fragment ID一覧 */
  existingFragmentIds: string[];
  /** 検出されたCMSプラグイン */
  detectedPlugin?: string;
}

// ========================================
// Schema Merger クラス
// ========================================

export class CLAVISchemaMerger {
  /**
   * 既存JSON-LDを検出・分析
   */
  detectExistingSchemas(existingJsonLd: JsonLdInfo[]): ExistingSchemaDetection {
    const detection: ExistingSchemaDetection = {
      hasOrganization: false,
      hasWebSite: false,
      hasWebPage: false,
      hasPerson: false,
      hasArticle: false,
      hasFAQPage: false,
      existingFragmentIds: [],
      detectedPlugin: undefined,
    };

    for (const jsonLd of existingJsonLd) {
      const type = jsonLd.type;
      const data = jsonLd.data;

      // 型別検出
      if (type === 'Organization') {
        detection.hasOrganization = true;
      } else if (type === 'WebSite') {
        detection.hasWebSite = true;
      } else if (type === 'WebPage') {
        detection.hasWebPage = true;
        // 既存のhasPart Fragment IDを抽出
        if (data?.hasPart && Array.isArray(data.hasPart)) {
          for (const part of data.hasPart) {
            if (part['@id']) {
              detection.existingFragmentIds.push(part['@id']);
            }
          }
        }
      } else if (type === 'Person') {
        detection.hasPerson = true;
      } else if (type === 'Article' || type === 'NewsArticle' || type === 'BlogPosting') {
        detection.hasArticle = true;
      } else if (type === 'FAQPage') {
        detection.hasFAQPage = true;
      }

      // CMSプラグイン検出（ヒューリスティック）
      if (!detection.detectedPlugin) {
        detection.detectedPlugin = this.detectCmsPlugin(data);
      }
    }

    console.log('[CLAVISchemaMerger] 既存スキーマ検出:', detection);

    return detection;
  }

  /**
   * CMSプラグインを検出（ヒューリスティック）
   */
  private detectCmsPlugin(data: any): string | undefined {
    if (!data) return undefined;

    // Yoast SEO検出
    if (data['@id']?.includes('/schema/') || data.potentialAction?.[0]?.target?.urlTemplate) {
      return 'Yoast SEO';
    }

    // Rank Math検出
    if (data['@id']?.includes('#richSnippet') || data['@graph']?.[0]?.['@type'] === 'ItemList') {
      return 'Rank Math';
    }

    // All in One SEO検出
    if (data['@graph']?.some((item: any) => item.mainEntityOfPage?.['@id']?.includes('#webpage'))) {
      return 'All in One SEO';
    }

    return undefined;
  }

  /**
   * 型別マージ（Option B: 推奨方式 + Phase 8.1: 日付情報追加）
   *
   * @param existing - 既存のJSON-LD（WordPress等）
   * @param generated - CLAVI生成のスキーマ
   * @param tenantSettings - テナント設定（sameAs, Author等）
   * @param datePublished - 公開日（ISO 8601形式）
   * @param dateModified - 更新日（ISO 8601形式）
   * @returns マージ結果
   */
  mergeWithExisting(
    existing: JsonLdInfo[],
    generated: GeneratedSchema,
    tenantSettings: TenantSettings,
    datePublished?: string,
    dateModified?: string
  ): SchemaMergeResult {
    const result: SchemaMergeResult = {
      merged: {
        '@context': 'https://schema.org',
        '@graph': [],
      },
      conflicts: [],
      additions: [],
      warnings: [],
    };

    console.log('[CLAVISchemaMerger] マージ開始:');
    console.log(`  - 既存JSON-LD: ${existing.length}個`);
    console.log(`  - テナント設定: ${tenantSettings ? 'あり' : 'なし'}`);

    // 既存スキーマを型別にマップ
    const existingByType = new Map<string, any>();
    for (const jsonLd of existing) {
      existingByType.set(jsonLd.type, jsonLd.data);
    }

    // @graph内の要素を型別にマップ
    const generatedByType = new Map<string, any>();
    for (const item of generated['@graph']) {
      generatedByType.set(item['@type'], item);
    }

    // 1. Organization処理
    const mergedOrg = this.mergeOrganization(
      existingByType.get('Organization'),
      generatedByType.get('Organization'),
      tenantSettings,
      result
    );
    if (mergedOrg) {
      result.merged['@graph'].push(mergedOrg);
    }

    // 2. Person/Author処理（常に追加）
    // baseUrlをOrganizationから取得（@id必須化により必ず存在）
    const orgId = mergedOrg?.['@id'] || generatedByType.get('Organization')?.['@id'];
    const baseUrl = orgId ? orgId.replace('#organization', '') : '';
    const author = this.generateAuthorSchema(tenantSettings, result, baseUrl);
    if (author) {
      result.merged['@graph'].push(author);
    }

    // 3. WebSite処理
    const mergedWebSite = this.mergeWebSite(
      existingByType.get('WebSite'),
      generatedByType.get('WebSite'),
      result
    );
    if (mergedWebSite) {
      result.merged['@graph'].push(mergedWebSite);
    }

    // 4. WebPage + hasPart処理
    const mergedWebPage = this.mergeWebPage(
      existingByType.get('WebPage'),
      generatedByType.get('WebPage'),
      author,
      result
    );
    if (mergedWebPage) {
      result.merged['@graph'].push(mergedWebPage);
    }

    // 5. Article処理（存在する場合はauthor追加 + 日付追加）
    const existingArticle = existingByType.get('Article') ||
      existingByType.get('NewsArticle') ||
      existingByType.get('BlogPosting');
    if (existingArticle) {
      const mergedArticle = this.mergeArticle(
        existingArticle,
        author,
        result,
        datePublished,
        dateModified
      );
      if (mergedArticle) {
        result.merged['@graph'].push(mergedArticle);
      }
    }

    console.log('[CLAVISchemaMerger] マージ完了:');
    console.log(`  - @graph要素: ${result.merged['@graph'].length}個`);
    console.log(`  - 追加: ${result.additions.join(', ') || 'なし'}`);
    console.log(`  - 衝突: ${result.conflicts.length}件`);
    console.log(`  - 警告: ${result.warnings.length}件`);

    return result;
  }

  /**
   * Organization マージ（Phase 8.1: @id必須化）
   */
  private mergeOrganization(
    existing: any,
    generated: any,
    tenantSettings: TenantSettings,
    result: SchemaMergeResult
  ): any {
    // sameAs配列を構築
    const organizationSameAs = this.buildSameAsUrls(tenantSettings?.sameAs?.organization);

    if (existing) {
      // 既存Organizationを基盤として拡張
      const merged = { ...existing };

      // ネストされた@contextは不要（トップレベルで定義済み）
      delete merged['@context'];

      // ⚠️ Phase 8.1: @idを必ず設定（Google推奨）
      // 既存に@idがなければCLAVI生成の@idを使用、それもなければURLから生成
      if (!merged['@id']) {
        if (generated?.['@id']) {
          merged['@id'] = generated['@id'];
        } else if (merged.url) {
          merged['@id'] = `${merged.url}#organization`;
        } else if (generated?.url) {
          merged['@id'] = `${generated.url}#organization`;
        }
        result.additions.push('Organization.@id');
      }

      // sameAsを追加（重複除去）
      const existingSameAs = Array.isArray(existing.sameAs) ? existing.sameAs : [];
      merged.sameAs = this.uniqueArray([...existingSameAs, ...organizationSameAs]);
      if (organizationSameAs.length > 0) {
        result.additions.push('Organization.sameAs');
      }

      // knowsAboutを追加（重複除去）
      if (generated?.knowsAbout) {
        const existingKnowsAbout = Array.isArray(existing.knowsAbout) ? existing.knowsAbout : [];
        merged.knowsAbout = this.uniqueArray([...existingKnowsAbout, ...generated.knowsAbout]);
        result.additions.push('Organization.knowsAbout');
      }

      result.warnings.push('既存のOrganizationスキーマが検出されました。sameAs/knowsAboutを追加しました。');

      return merged;
    }

    // 既存なし → CLAVI生成を使用
    if (generated) {
      const org = { ...generated };

      // ⚠️ Phase 8.1: @idを必ず設定
      if (!org['@id'] && org.url) {
        org['@id'] = `${org.url}#organization`;
        result.additions.push('Organization.@id');
      }

      if (organizationSameAs.length > 0) {
        org.sameAs = organizationSameAs;
        result.additions.push('Organization.sameAs');
      }
      return org;
    }

    return null;
  }

  /**
   * Author Schema生成（Phase 8.1: 絶対URL @id対応）
   */
  private generateAuthorSchema(
    tenantSettings: TenantSettings,
    result: SchemaMergeResult,
    baseUrl: string = ''
  ): any {
    const authorSettings = tenantSettings?.author;

    if (!authorSettings?.name) {
      return null;
    }

    // sameAs配列を構築
    const authorSameAs = this.buildSameAsUrls(authorSettings.sameAs);

    // @idは絶対URLを使用（Schema.org推奨）
    const authorId = baseUrl ? `${baseUrl}#author` : '#author';

    const author: any = {
      '@type': 'Person',
      '@id': authorId,
      name: authorSettings.name,
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

    if (authorSameAs.length > 0) {
      author.sameAs = authorSameAs;
    }

    result.additions.push('Person/Author');

    console.log('[CLAVISchemaMerger] Author Schema生成:', author.name);

    return author;
  }

  /**
   * WebSite マージ
   */
  private mergeWebSite(
    existing: any,
    generated: any,
    result: SchemaMergeResult
  ): any {
    if (existing) {
      // 既存WebSiteを使用
      const merged = { ...existing };
      // ネストされた@contextは不要（トップレベルで定義済み）
      delete merged['@context'];
      result.warnings.push('既存のWebSiteスキーマを使用します。');
      return merged;
    }

    // 既存なし → CLAVI生成を使用
    return generated || null;
  }

  /**
   * WebPage + hasPart マージ（Phase 8.1: 日付情報追加）
   */
  private mergeWebPage(
    existing: any,
    generated: any,
    author: any,
    result: SchemaMergeResult
  ): any {
    if (existing) {
      const merged = { ...existing };

      // ネストされた@contextは不要（トップレベルで定義済み）
      delete merged['@context'];

      // ⚠️ Phase 8.1: 日付情報をマージ（既存がない場合のみ追加）
      if (generated?.datePublished && !existing.datePublished) {
        merged.datePublished = generated.datePublished;
        result.additions.push('WebPage.datePublished');
      }
      if (generated?.dateModified && !existing.dateModified) {
        merged.dateModified = generated.dateModified;
        result.additions.push('WebPage.dateModified');
      }

      // hasPart追加（重複除去）
      if (generated?.hasPart && Array.isArray(generated.hasPart)) {
        const existingHasPart = Array.isArray(existing.hasPart) ? existing.hasPart : [];
        const existingIds = new Set(existingHasPart.map((p: any) => p['@id']));

        // 新しいhasPart要素のみ追加
        const newParts = generated.hasPart.filter((p: any) => !existingIds.has(p['@id']));

        if (newParts.length > 0) {
          merged.hasPart = [...existingHasPart, ...newParts];
          result.additions.push(`WebPage.hasPart (+${newParts.length})`);
        }
      }

      // authorリンク追加
      if (author && !existing.author) {
        merged.author = { '@id': author['@id'] };
        result.additions.push('WebPage.author');
      }

      return merged;
    }

    // 既存なし → CLAVI生成を使用
    if (generated) {
      const webPage = { ...generated };

      // authorリンク追加
      if (author) {
        webPage.author = { '@id': author['@id'] };
        result.additions.push('WebPage.author');
      }

      return webPage;
    }

    return null;
  }

  /**
   * Article マージ（author追加 + Phase 8.1: 日付情報追加）
   */
  private mergeArticle(
    existing: any,
    author: any,
    result: SchemaMergeResult,
    datePublished?: string,
    dateModified?: string
  ): any {
    if (!existing) return null;

    const merged = { ...existing };

    // ネストされた@contextは不要（トップレベルで定義済み）
    delete merged['@context'];

    // ⚠️ Phase 8.1: 日付情報をマージ（既存がない場合のみ追加）
    if (datePublished && !existing.datePublished) {
      merged.datePublished = datePublished;
      result.additions.push('Article.datePublished');
    }
    if (dateModified && !existing.dateModified) {
      merged.dateModified = dateModified;
      result.additions.push('Article.dateModified');
    }

    // authorリンク追加（既存がない場合）
    if (author && !existing.author) {
      merged.author = { '@id': author['@id'] };
      result.additions.push('Article.author');
    }

    return merged;
  }

  /**
   * sameAs URLの配列を構築
   */
  private buildSameAsUrls(sameAs: any): string[] {
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
   * 重複を除去した配列を返す
   */
  private uniqueArray<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }

  /**
   * マージ結果のサマリー生成
   */
  generateMergeSummary(result: SchemaMergeResult): string {
    let summary = '# Schema Merge Summary\n\n';

    summary += '## Additions\n';
    if (result.additions.length > 0) {
      for (const addition of result.additions) {
        summary += `- ${addition}\n`;
      }
    } else {
      summary += '- なし\n';
    }
    summary += '\n';

    if (result.conflicts.length > 0) {
      summary += '## Conflicts\n';
      for (const conflict of result.conflicts) {
        summary += `- ${conflict.type}.${conflict.field}: ${conflict.resolution}\n`;
      }
      summary += '\n';
    }

    if (result.warnings.length > 0) {
      summary += '## Warnings\n';
      for (const warning of result.warnings) {
        summary += `- ${warning}\n`;
      }
      summary += '\n';
    }

    summary += '## Generated @graph Types\n';
    for (const item of result.merged['@graph']) {
      summary += `- ${item['@type']}\n`;
    }

    return summary;
  }
}

// シングルトンエクスポート
export const schemaMerger = new CLAVISchemaMerger();
