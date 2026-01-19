/**
 * ASO Entity Extractor
 * 
 * Phase 4.4.0: エンティティ抽出（OpenAI GPT-4）
 * - Mike King理論 + Google推奨準拠
 * - Organization, Service, Product, knowsAbout の抽出
 * - 抽出根拠（evidence）を必ず含める（幻覚対策）
 * 
 * @version 1.0.0
 * @date 2026-01-12
 */

import OpenAI from 'openai';

export interface OrganizationEntity {
  name: string;
  url: string;
  description: string;
  evidence: string; // 本文のどこから抽出したか
}

export interface ServiceEntity {
  name: string;
  description: string;
  evidence: string;
}

export interface ProductEntity {
  name: string;
  description: string;
  evidence: string;
}

export interface ExtractedEntities {
  organization?: OrganizationEntity;
  services?: ServiceEntity[];
  products?: ProductEntity[];
  knowsAbout?: string[]; // 専門知識領域
}

export interface EntityExtractionParams {
  url: string;
  title: string;
  description: string;
  headings: string[];
  content: string; // ページ全体のテキストコンテンツ
}

export class ASOEntityExtractor {
  private openai: OpenAI;
  
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('[ASOEntityExtractor] OPENAI_API_KEY が設定されていません');
    }
    
    this.openai = new OpenAI({ apiKey });
    
    console.log('[ASOEntityExtractor] 初期化完了');
  }
  
  /**
   * Mike King理論 + Google推奨: エンティティ抽出
   * 
   * Option A: 最小プロダクト
   * - Organization（組織）※必須
   * - Service（サービス）※最大3個
   * - Product（製品）※最大3個
   * 
   * ⚠️ 重要: 抽出根拠（evidence）を必ず含める
   * これにより、LLMの幻覚を抑制し、検証可能性を確保
   * 
   * @param params - URL、タイトル、説明、見出し、本文
   * @returns 抽出されたエンティティ
   */
  async extractEntities(
    params: EntityExtractionParams
  ): Promise<ExtractedEntities> {
    const { url, title, description, headings, content } = params;
    
    console.log(`[ASOEntityExtractor] エンティティ抽出開始:`);
    console.log(`  - URL: ${url}`);
    console.log(`  - タイトル: ${title}`);
    console.log(`  - 見出し数: ${headings.length}`);
    console.log(`  - コンテンツ長: ${content.length}文字`);
    
    // プロンプト構築
    const prompt = this.buildExtractionPrompt(params);
    
    try {
      // OpenAI GPT-4でエンティティ抽出
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // 一貫性重視（低温度）
        max_tokens: 2000
      });
      
      const content_text = response.choices[0].message.content;
      
      if (!content_text) {
        throw new Error('OpenAI response content is null');
      }
      
      // JSON パース
      const extracted = JSON.parse(content_text) as ExtractedEntities;
      
      // バリデーション
      this.validateExtractedEntities(extracted);
      
      console.log(`[ASOEntityExtractor] エンティティ抽出完了:`);
      console.log(`  - Organization: ${extracted.organization ? '✅' : '❌'}`);
      console.log(`  - Services: ${extracted.services?.length || 0}個`);
      console.log(`  - Products: ${extracted.products?.length || 0}個`);
      console.log(`  - knowsAbout: ${extracted.knowsAbout?.length || 0}個`);
      
      return extracted;
      
    } catch (error) {
      console.error('[ASOEntityExtractor] エンティティ抽出エラー:', error);
      
      // エラー時はフォールバック（基本情報のみ）
      return this.createFallbackEntities(params);
    }
  }
  
  /**
   * システムプロンプト（Schema.org専門家）
   */
  private getSystemPrompt(): string {
    return `あなたはSchema.org専門家です。

以下のルールに従ってWebページからエンティティを抽出してください：

1. **Organization（組織）**
   - 必須: name, url, description
   - evidence: 本文の該当箇所を引用（50文字以内）

2. **Service（サービス）**
   - 最大3個まで
   - 必須: name, description
   - evidence: 本文の該当箇所を引用（50文字以内）

3. **Product（製品）**
   - 最大3個まで
   - 必須: name, description
   - evidence: 本文の該当箇所を引用（50文字以内）

4. **knowsAbout（専門知識領域）**
   - 最大5個まで
   - キーワードまたは短いフレーズ

⚠️ 重要:
- evidence（抽出根拠）は必須です
- 本文に明確に記載されている情報のみを抽出してください
- 推測や想像で情報を追加しないでください
- evidenceが見つからない場合、そのエンティティは抽出しないでください

JSON形式で返してください。`;
  }
  
  /**
   * 抽出プロンプト構築
   */
  private buildExtractionPrompt(params: EntityExtractionParams): string {
    const { url, title, description, headings, content } = params;
    
    // コンテンツが長すぎる場合は要約
    const maxContentLength = 4000; // GPT-4のトークン制限を考慮
    const truncatedContent = content.length > maxContentLength
      ? content.substring(0, maxContentLength) + '...[省略]'
      : content;
    
    return `以下のWebページから、Schema.org準拠のエンティティを抽出してください：

## ページ情報

**URL**: ${url}
**タイトル**: ${title}
**説明**: ${description}

## 見出し構造

${headings.slice(0, 20).map((h, i) => `${i + 1}. ${h}`).join('\n')}
${headings.length > 20 ? `\n...(全${headings.length}個)` : ''}

## ページ本文

${truncatedContent}

---

上記の情報から、以下のエンティティを抽出してください：

1. **Organization**: 組織名、URL、説明、抽出根拠
2. **Services**: 提供サービス（最大3個）、各サービスの説明と抽出根拠
3. **Products**: 製品情報（最大3個）、各製品の説明と抽出根拠
4. **knowsAbout**: 専門知識領域（最大5個のキーワード）

JSON形式で返してください：

\`\`\`json
{
  "organization": {
    "name": "組織名",
    "url": "${url}",
    "description": "組織の説明",
    "evidence": "本文の該当箇所を引用"
  },
  "services": [
    {
      "name": "サービス名",
      "description": "サービスの説明",
      "evidence": "本文の該当箇所を引用"
    }
  ],
  "products": [
    {
      "name": "製品名",
      "description": "製品の説明",
      "evidence": "本文の該当箇所を引用"
    }
  ],
  "knowsAbout": ["キーワード1", "キーワード2"]
}
\`\`\``;
  }
  
  /**
   * 抽出結果のバリデーション
   */
  private validateExtractedEntities(entities: ExtractedEntities): void {
    // Organization の必須チェック
    if (entities.organization) {
      if (!entities.organization.name || !entities.organization.url) {
        console.warn('[ASOEntityExtractor] Organization に必須フィールドが不足');
      }
      
      if (!entities.organization.evidence) {
        console.warn('[ASOEntityExtractor] Organization に evidence が不足');
      }
    }
    
    // Services の evidence チェック
    if (entities.services) {
      for (const service of entities.services) {
        if (!service.evidence) {
          console.warn(`[ASOEntityExtractor] Service "${service.name}" に evidence が不足`);
        }
      }
      
      // 最大3個制限
      if (entities.services.length > 3) {
        console.warn(`[ASOEntityExtractor] Services が3個を超えています: ${entities.services.length}個`);
        entities.services = entities.services.slice(0, 3);
      }
    }
    
    // Products の evidence チェック
    if (entities.products) {
      for (const product of entities.products) {
        if (!product.evidence) {
          console.warn(`[ASOEntityExtractor] Product "${product.name}" に evidence が不足`);
        }
      }
      
      // 最大3個制限
      if (entities.products.length > 3) {
        console.warn(`[ASOEntityExtractor] Products が3個を超えています: ${entities.products.length}個`);
        entities.products = entities.products.slice(0, 3);
      }
    }
    
    // knowsAbout の最大5個制限
    if (entities.knowsAbout && entities.knowsAbout.length > 5) {
      console.warn(`[ASOEntityExtractor] knowsAbout が5個を超えています: ${entities.knowsAbout.length}個`);
      entities.knowsAbout = entities.knowsAbout.slice(0, 5);
    }
  }
  
  /**
   * フォールバックエンティティ生成
   * 
   * OpenAI APIエラー時や抽出失敗時に、
   * ページの基本情報から最小限のエンティティを生成
   */
  private createFallbackEntities(
    params: EntityExtractionParams
  ): ExtractedEntities {
    console.log('[ASOEntityExtractor] フォールバックエンティティ生成');
    
    const domain = new URL(params.url).hostname;
    const organizationName = this.extractOrganizationNameFromDomain(domain);
    
    return {
      organization: {
        name: organizationName,
        url: params.url,
        description: params.description || params.title,
        evidence: `Title: ${params.title}`
      },
      services: [],
      products: [],
      knowsAbout: []
    };
  }
  
  /**
   * ドメインから組織名を抽出
   * 
   * 例: www.adobe.com -> Adobe
   */
  private extractOrganizationNameFromDomain(domain: string): string {
    // www. を除去
    const cleanDomain = domain.replace(/^www\./, '');
    
    // トップレベルドメインを除去
    const parts = cleanDomain.split('.');
    const mainPart = parts[0];
    
    // 先頭を大文字に
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  }
  
  /**
   * エンティティ抽出結果のサマリー生成
   */
  generateExtractionSummary(entities: ExtractedEntities): string {
    let summary = '# エンティティ抽出結果\n\n';
    
    if (entities.organization) {
      summary += '## Organization\n\n';
      summary += `- **名前**: ${entities.organization.name}\n`;
      summary += `- **URL**: ${entities.organization.url}\n`;
      summary += `- **説明**: ${entities.organization.description}\n`;
      summary += `- **根拠**: "${entities.organization.evidence}"\n\n`;
    }
    
    if (entities.services && entities.services.length > 0) {
      summary += '## Services\n\n';
      for (let i = 0; i < entities.services.length; i++) {
        const service = entities.services[i];
        summary += `### ${i + 1}. ${service.name}\n\n`;
        summary += `- **説明**: ${service.description}\n`;
        summary += `- **根拠**: "${service.evidence}"\n\n`;
      }
    }
    
    if (entities.products && entities.products.length > 0) {
      summary += '## Products\n\n';
      for (let i = 0; i < entities.products.length; i++) {
        const product = entities.products[i];
        summary += `### ${i + 1}. ${product.name}\n\n`;
        summary += `- **説明**: ${product.description}\n`;
        summary += `- **根拠**: "${product.evidence}"\n\n`;
      }
    }
    
    if (entities.knowsAbout && entities.knowsAbout.length > 0) {
      summary += '## knowsAbout（専門知識領域）\n\n';
      for (const knowledge of entities.knowsAbout) {
        summary += `- ${knowledge}\n`;
      }
      summary += '\n';
    }
    
    return summary;
  }
}

