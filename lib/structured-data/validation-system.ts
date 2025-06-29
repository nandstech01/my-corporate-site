// JSON-LD統一検証システム
// Mike King理論準拠: 構造化データ品質保証

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  score: number; // 0-100のスコア
}

export interface ValidationError {
  type: 'REQUIRED_FIELD_MISSING' | 'INVALID_TYPE' | 'INVALID_URL' | 'SCHEMA_VIOLATION';
  field: string;
  message: string;
  severity: 'error' | 'warning';
  fix?: string;
}

export interface ValidationWarning {
  type: 'OPTIMIZATION_OPPORTUNITY' | 'BEST_PRACTICE' | 'AI_SEARCH_ENHANCEMENT';
  field: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface ValidationSuggestion {
  type: 'ENTITY_RELATIONSHIP' | 'SEMANTIC_ENHANCEMENT' | 'AI_OPTIMIZATION';
  description: string;
  implementation: string;
  benefit: string;
}

/**
 * Schema.org必須フィールドの定義
 */
const REQUIRED_FIELDS = {
  Organization: ['@type', 'name', 'url'],
  Service: ['@type', 'name', 'provider'],
  WebSite: ['@type', 'name', 'url'],
  WebPage: ['@type', 'name', 'url'],
  Article: ['@type', 'headline', 'author', 'datePublished'],
  Person: ['@type', 'name'],
  ItemList: ['@type', 'itemListElement']
};

/**
 * AI検索最適化のための推奨フィールド
 */
const AI_SEARCH_RECOMMENDED_FIELDS = {
  Organization: ['knowsAbout', 'sameAs', 'hasOfferCatalog', 'contactPoint'],
  Service: ['serviceType', 'provider', 'hasOfferCatalog', 'knowsAbout'],
  WebPage: ['about', 'mentions', 'hasPart', 'isPartOf'],
  Article: ['about', 'mentions', 'keywords', 'articleSection']
};

/**
 * メイン検証関数
 */
export async function validateJsonLd(jsonLdData: any): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // 基本構造検証
  if (!jsonLdData['@context']) {
    errors.push({
      type: 'REQUIRED_FIELD_MISSING',
      field: '@context',
      message: '@contextフィールドが必要です',
      severity: 'error',
      fix: '"@context": "https://schema.org"を追加してください'
    });
  }

  if (!jsonLdData['@type']) {
    errors.push({
      type: 'REQUIRED_FIELD_MISSING',
      field: '@type',
      message: '@typeフィールドが必要です',
      severity: 'error',
      fix: '適切な@typeを指定してください'
    });
  }

  // スキーマ別検証
  if (jsonLdData['@type']) {
    validateSchemaSpecificFields(jsonLdData, errors, warnings);
  }

  // AI検索最適化検証
  validateAiSearchOptimization(jsonLdData, warnings, suggestions);

  // エンティティ関係性検証
  validateEntityRelationships(jsonLdData, suggestions);

  // スコア計算
  const score = calculateValidationScore(jsonLdData, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    score
  };
}

/**
 * スキーマ別フィールド検証
 */
function validateSchemaSpecificFields(
  jsonLdData: any, 
  errors: ValidationError[], 
  warnings: ValidationWarning[]
): void {
  const schemaType = jsonLdData['@type'];
  const requiredFields = REQUIRED_FIELDS[schemaType as keyof typeof REQUIRED_FIELDS];

  if (requiredFields) {
    requiredFields.forEach(field => {
      if (!jsonLdData[field]) {
        errors.push({
          type: 'REQUIRED_FIELD_MISSING',
          field,
          message: `${schemaType}スキーマには${field}フィールドが必要です`,
          severity: 'error',
          fix: `"${field}": "適切な値"を追加してください`
        });
      }
    });
  }

  // URL検証
  ['url', 'sameAs', '@id'].forEach(urlField => {
    if (jsonLdData[urlField]) {
      const urls = Array.isArray(jsonLdData[urlField]) ? jsonLdData[urlField] : [jsonLdData[urlField]];
      urls.forEach((url: string) => {
        if (!isValidUrl(url)) {
          errors.push({
            type: 'INVALID_URL',
            field: urlField,
            message: `無効なURL: ${url}`,
            severity: 'error',
            fix: '有効なHTTPS URLを指定してください'
          });
        }
      });
    }
  });
}

/**
 * AI検索最適化検証
 */
function validateAiSearchOptimization(
  jsonLdData: any,
  warnings: ValidationWarning[],
  suggestions: ValidationSuggestion[]
): void {
  const schemaType = jsonLdData['@type'];
  const recommendedFields = AI_SEARCH_RECOMMENDED_FIELDS[schemaType as keyof typeof AI_SEARCH_RECOMMENDED_FIELDS];

  if (recommendedFields) {
    recommendedFields.forEach(field => {
      if (!jsonLdData[field]) {
        warnings.push({
          type: 'AI_SEARCH_ENHANCEMENT',
          field,
          message: `AI検索最適化のため${field}フィールドの追加を推奨`,
          impact: 'medium',
          recommendation: `${field}フィールドを追加してAI検索エンジンの理解を向上させる`
        });
      }
    });
  }

  // knowsAboutフィールドの詳細度チェック
  if (jsonLdData.knowsAbout) {
    const knowsAboutCount = Array.isArray(jsonLdData.knowsAbout) 
      ? jsonLdData.knowsAbout.length 
      : 1;
    
    if (knowsAboutCount < 10) {
      suggestions.push({
        type: 'SEMANTIC_ENHANCEMENT',
        description: 'knowsAboutフィールドの拡充',
        implementation: '関連技術・専門分野を追加してセマンティック理解を向上',
        benefit: 'AI検索エンジンでの関連性向上、より適切な検索結果表示'
      });
    }
  }

  // エンティティIDの検証
  if (!jsonLdData['@id']) {
    suggestions.push({
      type: 'ENTITY_RELATIONSHIP',
      description: 'エンティティIDの追加',
      implementation: '@idフィールドを追加して一意識別子を設定',
      benefit: 'エンティティ間の関係性構築、ナレッジグラフへの統合'
    });
  }
}

/**
 * エンティティ関係性検証
 */
function validateEntityRelationships(
  jsonLdData: any,
  suggestions: ValidationSuggestion[]
): void {
  // relatedToフィールドの確認
  if (!jsonLdData.relatedTo && jsonLdData['@type'] === 'Service') {
    suggestions.push({
      type: 'ENTITY_RELATIONSHIP',
      description: '関連サービスとの接続',
      implementation: 'relatedToフィールドを追加して他サービスとの関係性を明示',
      benefit: 'サービス間の相互関係を検索エンジンに伝達、クロスセリング効果'
    });
  }

  // mentionsフィールドの確認
  if (!jsonLdData.mentions && ['Article', 'WebPage'].includes(jsonLdData['@type'])) {
    suggestions.push({
      type: 'SEMANTIC_ENHANCEMENT',
      description: '言及エンティティの明示',
      implementation: 'mentionsフィールドでページ内で言及している概念・技術を明示',
      benefit: 'コンテンツの意味的理解向上、関連検索での露出増加'
    });
  }
}

/**
 * 検証スコア計算
 */
function calculateValidationScore(
  jsonLdData: any,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): number {
  let score = 100;

  // エラーによる減点
  errors.forEach(error => {
    if (error.severity === 'error') {
      score -= 20;
    }
  });

  // 警告による減点
  warnings.forEach(warning => {
    switch (warning.impact) {
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
      case 'low':
        score -= 2;
        break;
    }
  });

  // 最適化フィールドによる加点
  const optimizationFields = ['knowsAbout', 'sameAs', '@id', 'relatedTo', 'mentions'];
  optimizationFields.forEach(field => {
    if (jsonLdData[field]) {
      score += 2;
    }
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * URL検証
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * 全ページの一括検証
 */
export async function validateAllPages(pages: Array<{path: string, jsonLd: any}>): Promise<{
  overall: ValidationResult;
  pageResults: Array<{path: string, result: ValidationResult}>;
}> {
  const pageResults = await Promise.all(
    pages.map(async page => ({
      path: page.path,
      result: await validateJsonLd(page.jsonLd)
    }))
  );

  // 全体スコア計算
  const averageScore = pageResults.reduce((sum, result) => sum + result.result.score, 0) / pageResults.length;
  const totalErrors = pageResults.flatMap(result => result.result.errors);
  const totalWarnings = pageResults.flatMap(result => result.result.warnings);
  const totalSuggestions = pageResults.flatMap(result => result.result.suggestions);

  const overall: ValidationResult = {
    isValid: totalErrors.length === 0,
    errors: totalErrors,
    warnings: totalWarnings,
    suggestions: totalSuggestions,
    score: Math.round(averageScore)
  };

  return {
    overall,
    pageResults
  };
}

/**
 * 修正提案の自動生成
 */
export function generateFixRecommendations(validationResult: ValidationResult): string[] {
  const recommendations: string[] = [];

  // エラー修正提案
  validationResult.errors.forEach(error => {
    if (error.fix) {
      recommendations.push(`🔴 ${error.message}: ${error.fix}`);
    }
  });

  // 警告への対応提案
  validationResult.warnings.forEach(warning => {
    recommendations.push(`🟡 ${warning.message}: ${warning.recommendation}`);
  });

  // 改善提案
  validationResult.suggestions.forEach(suggestion => {
    recommendations.push(`💡 ${suggestion.description}: ${suggestion.implementation} (効果: ${suggestion.benefit})`);
  });

  return recommendations;
} 