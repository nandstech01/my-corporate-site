#!/usr/bin/env node
// Mike King理論準拠: フェーズ1完成確認スクリプト
// 統一エンティティ関係性システム + JSON-LD検証の実行

import { 
  validateJsonLd, 
  validateAllPages, 
  generateFixRecommendations,
  StructuredDataHelpers,
  type ValidationResult 
} from '../lib/structured-data';
import { getStructuredData } from '../app/structured-data';

/**
 * フェーズ1: RE基盤検証
 */
async function validatePhase1Implementation(): Promise<void> {
  console.log('🚀 Mike King理論準拠: フェーズ1 RE基盤検証開始\n');

  try {
    // 1. 組織スキーマの検証
    console.log('📊 1. 組織スキーマ検証...');
    const orgSchema = StructuredDataHelpers.getOrganizationSchema();
    const orgValidation = await validateJsonLd(orgSchema);
    reportValidationResult('組織スキーマ', orgValidation);

    // 2. 統合構造化データの検証
    console.log('\n📊 2. 統合構造化データ検証...');
    const structuredData = getStructuredData();
    const mainValidation = await validateJsonLd(structuredData);
    reportValidationResult('メイン構造化データ', mainValidation);

    // 3. サービススキーマの検証
    console.log('\n📊 3. サービススキーマ検証...');
    const serviceTypes = [
      'SystemDevelopment', 
      'AIAgentDevelopment', 
      'AIO_SEO', 
      'MCPServerDevelopment', 
      'VectorRAGDevelopment'
    ];

    for (const serviceType of serviceTypes) {
      try {
        const serviceSchema = StructuredDataHelpers.getServiceSchema(serviceType);
        const serviceValidation = await validateJsonLd(serviceSchema);
        reportValidationResult(`${serviceType}サービス`, serviceValidation);
      } catch (error) {
        console.log(`❌ ${serviceType}: エラー - ${error instanceof Error ? error.message : '不明なエラー'}`);
      }
    }

    // 4. エンティティ関係性の確認
    console.log('\n🔗 4. エンティティ関係性確認...');
    validateEntityRelationships();

    // 5. AI検索最適化要素の確認
    console.log('\n🤖 5. AI検索最適化要素確認...');
    validateAiOptimizationElements(orgSchema);

    // 6. 総合評価
    console.log('\n📈 6. フェーズ1 総合評価');
    const overallScore = calculateOverallScore([orgValidation, mainValidation]);
    console.log(`総合スコア: ${overallScore}/100`);
    
    if (overallScore >= 80) {
      console.log('✅ フェーズ1: RE基盤完成 - 次フェーズ（GEO最適化）に進行可能');
    } else {
      console.log('⚠️  フェーズ1: 改善が必要 - 修正後再検証してください');
    }

  } catch (error) {
    console.error('💥 検証エラー:', error);
    process.exit(1);
  }
}

/**
 * 検証結果レポート
 */
function reportValidationResult(name: string, validation: ValidationResult): void {
  const status = validation.isValid ? '✅' : '❌';
  const score = validation.score;
  
  console.log(`${status} ${name}: スコア ${score}/100`);
  
  if (validation.errors.length > 0) {
    console.log('   エラー:');
    validation.errors.forEach(error => {
      console.log(`   - ${error.message}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log('   警告:');
    validation.warnings.slice(0, 3).forEach(warning => {
      console.log(`   - ${warning.message}`);
    });
  }
  
  if (validation.suggestions.length > 0) {
    console.log('   改善提案:');
    validation.suggestions.slice(0, 2).forEach(suggestion => {
      console.log(`   💡 ${suggestion.description}`);
    });
  }
}

/**
 * エンティティ関係性検証
 */
function validateEntityRelationships(): void {
  try {
    const systemService = StructuredDataHelpers.getServiceSchema('SystemDevelopment');
    const aiAgentService = StructuredDataHelpers.getServiceSchema('AIAgentDevelopment');
    
    // 関係性の存在確認
    if (systemService.relatedTo && systemService.relatedTo.includes('https://nands.tech/ai-agents#service')) {
      console.log('✅ システム開発 ↔ AIエージェント関係性: 正常');
    } else {
      console.log('❌ システム開発 ↔ AIエージェント関係性: 未設定');
    }
    
    if (aiAgentService.relatedTo && aiAgentService.relatedTo.includes('https://nands.tech/system-development#service')) {
      console.log('✅ AIエージェント ↔ システム開発関係性: 正常');
    } else {
      console.log('❌ AIエージェント ↔ システム開発関係性: 未設定');
    }
    
  } catch (error) {
    console.log('❌ エンティティ関係性検証エラー:', error instanceof Error ? error.message : '不明なエラー');
  }
}

/**
 * AI検索最適化要素検証
 */
function validateAiOptimizationElements(orgSchema: any): void {
  const aiOptimizationFields = [
    'knowsAbout',
    'sameAs', 
    'hasOfferCatalog',
    '@id'
  ];
  
  aiOptimizationFields.forEach(field => {
    if (orgSchema[field]) {
      console.log(`✅ ${field}: 実装済み`);
      
      // knowsAboutの詳細チェック
      if (field === 'knowsAbout' && Array.isArray(orgSchema[field])) {
        const count = orgSchema[field].length;
        console.log(`   - 専門領域数: ${count}個`);
        
        // Mike King理論関連キーワードの確認
        const mikeKingTerms = orgSchema[field].filter((term: string) => 
          term.includes('レリバンスエンジニアリング') || 
          term.includes('AI検索') || 
          term.includes('セマンティック')
        );
        console.log(`   - Mike King理論関連: ${mikeKingTerms.length}個`);
      }
    } else {
      console.log(`❌ ${field}: 未実装`);
    }
  });
}

/**
 * 総合スコア計算
 */
function calculateOverallScore(validations: ValidationResult[]): number {
  if (validations.length === 0) return 0;
  
  const totalScore = validations.reduce((sum, validation) => sum + validation.score, 0);
  return Math.round(totalScore / validations.length);
}

/**
 * メイン実行
 */
if (require.main === module) {
  validatePhase1Implementation().catch(console.error);
}

export { validatePhase1Implementation }; 