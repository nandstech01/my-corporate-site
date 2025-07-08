/**
 * Schema.org 16.0+ 統合システム拡張
 * 既存Mike King理論準拠システム + 最新Schema.org機能
 * 
 * 拡張内容:
 * - AI透明性システム
 * - 企業認証統合
 * - 助成金対応システム
 * - 最新プロパティ統合
 */

import React from 'react';
import { 
  UnifiedPageData, 
  PageContext, 
  UnifiedIntegrationSystem 
} from './unified-integration';
import { 
  ORGANIZATION_ENTITY, 
  SERVICE_ENTITIES,
  type EntityRelationship 
} from './entity-relationships';
import {
  IPTCDigitalSourceType,
  CertificationSchema,
  GovernmentServiceSchema,
  GovernmentBenefitsType,
  DigitalPlatformType,
  Schema16LatestOrganization,
  Schema16LatestService,
  createAIServiceTransparency,
  createJapaneseCertifications,
  createJapaneseGovernmentBenefits,
  generateLatestOrganizationSchema
} from './schema-org-latest';

// =============================================================================
// Schema.org 16.0+ 拡張統合データ型
// =============================================================================

export interface Schema16UnifiedPageData extends UnifiedPageData {
  // AI透明性
  aiTransparencySchema?: {
    digitalSourceTypes: IPTCDigitalSourceType[];
    transparencyStatement: string;
    contentCreationProcess: string[];
  };
  
  // 企業認証システム
  certificationSystem?: {
    activeCertifications: CertificationSchema[];
    certificationCount: number;
    certificationTypes: string[];
  };
  
  // 助成金対応システム
  governmentBenefitsSystem?: {
    availableBenefits: GovernmentServiceSchema[];
    totalCoverageRate: number;
    eligiblePrograms: string[];
  };
  
  // 最新組織スキーマ
  latestOrganizationSchema?: Schema16LatestOrganization;
  
  // 最新サービススキーマ
  latestServiceSchemas?: Schema16LatestService[];
  
  // プラットフォーム対応
  platformSupport?: {
    supportedPlatforms: DigitalPlatformType[];
    platformSpecificFeatures: Record<string, string[]>;
  };
}

// =============================================================================
// Schema.org 16.0+ 拡張統合システム
// =============================================================================

export class Schema16UnifiedIntegrationSystem extends UnifiedIntegrationSystem {
  
  /**
   * Schema.org 16.0+ 対応統合ページデータ生成
   */
  async generateSchema16UnifiedPageData(context: PageContext): Promise<Schema16UnifiedPageData> {
    // 基本統合データを取得
    const baseData = await this.generateUnifiedPageData(context);
    
    // Schema.org 16.0+ 拡張データを生成
    const aiTransparencySchema = this.generateAITransparencySchema();
    const certificationSystem = this.generateCertificationSystem();
    const governmentBenefitsSystem = this.generateGovernmentBenefitsSystem();
    const latestOrganizationSchema = this.generateLatestOrganizationSchema();
    const latestServiceSchemas = this.generateLatestServiceSchemas();
    const platformSupport = this.generatePlatformSupport();
    
    return {
      ...baseData,
      aiTransparencySchema,
      certificationSystem,
      governmentBenefitsSystem,
      latestOrganizationSchema,
      latestServiceSchemas,
      platformSupport
    };
  }

  /**
   * AI透明性スキーマ生成
   */
  private generateAITransparencySchema() {
    const digitalSourceTypes = createAIServiceTransparency();
    
    return {
      digitalSourceTypes,
      transparencyStatement: '当社は AI 関連サービスを提供する企業として、コンテンツ作成における AI 技術の使用について透明性を確保しています。',
      contentCreationProcess: [
        '人間の専門家によるコンテンツ企画・構成',
        'AI技術を活用した効率化（明示的表記）',
        '人間による最終確認・品質保証',
        '継続的な改善とフィードバック反映'
      ]
    };
  }

  /**
   * 企業認証システム生成
   */
  private generateCertificationSystem() {
    const activeCertifications = createJapaneseCertifications(ORGANIZATION_ENTITY['@id']);
    
    return {
      activeCertifications,
      certificationCount: activeCertifications.length,
      certificationTypes: activeCertifications.map(cert => cert.name)
    };
  }

  /**
   * 助成金対応システム生成
   */
  private generateGovernmentBenefitsSystem() {
    const availableBenefits = createJapaneseGovernmentBenefits();
    
    // 平均補助率計算
    const totalCoverageRate = availableBenefits.reduce((sum, benefit) => 
      sum + (benefit.percentCoverage || 0), 0
    ) / availableBenefits.length;
    
    return {
      availableBenefits,
      totalCoverageRate,
      eligiblePrograms: availableBenefits.map(benefit => benefit.name)
    };
  }

  /**
   * 最新組織スキーマ生成
   */
  private generateLatestOrganizationSchema(): Schema16LatestOrganization {
    return generateLatestOrganizationSchema(ORGANIZATION_ENTITY, {
      includeAITransparency: true,
      includeCertifications: true,
      includeGovernmentBenefits: true
    });
  }

  /**
   * 最新サービススキーマ生成
   */
  private generateLatestServiceSchemas(): Schema16LatestService[] {
    return SERVICE_ENTITIES.map(service => {
      const certifications = createJapaneseCertifications(service['@id']);
      const governmentBenefits = createJapaneseGovernmentBenefits();
      
      return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': service['@id'],
        name: service.name,
        description: `${service.name}の詳細説明`, // 実際の説明文を設定
        provider: { '@id': ORGANIZATION_ENTITY['@id'] },
        
        // 最新Schema.org拡張
        hasCertification: certifications,
        governmentBenefitsInfo: governmentBenefits,
        availableOnDevice: [
          DigitalPlatformType.GENERIC_WEB,
          DigitalPlatformType.DESKTOP_WEB,
          DigitalPlatformType.MOBILE_WEB
        ],
        servicePeriod: {
          '@type': 'ServicePeriod',
          startDate: '2024-01-01'
        },
        financialIncentive: [
          {
            '@type': 'FinancialIncentive',
            name: '人材開発支援助成金活用',
            description: 'リスキリング研修で最大80%の助成金活用が可能',
            incentiveType: 'subsidy',
            amount: {
              '@type': 'MonetaryAmount',
              currency: 'JPY',
              value: 800000
            }
          }
        ],
        serviceWarranty: {
          '@type': 'WarrantyPromise',
          durationOfWarranty: 'P1Y', // 1年間
          warrantyScope: 'サービス品質保証・アフターサポート'
        }
      };
    });
  }

  /**
   * プラットフォーム対応生成
   */
  private generatePlatformSupport() {
    const supportedPlatforms = [
      DigitalPlatformType.GENERIC_WEB,
      DigitalPlatformType.DESKTOP_WEB,
      DigitalPlatformType.MOBILE_WEB
    ];
    
    const platformSpecificFeatures = {
      [DigitalPlatformType.DESKTOP_WEB]: [
        '高度なダッシュボード機能',
        '複数画面対応',
        'キーボードショートカット'
      ],
      [DigitalPlatformType.MOBILE_WEB]: [
        'レスポンシブデザイン',
        'タッチ操作最適化',
        'オフライン対応'
      ],
      [DigitalPlatformType.GENERIC_WEB]: [
        'クロスブラウザ対応',
        'アクセシビリティ準拠',
        'SEO最適化'
      ]
    };
    
    return {
      supportedPlatforms,
      platformSpecificFeatures
    };
  }

  /**
   * 統合構造化データ（Schema.org 16.0+対応）生成
   */
  generateSchema16StructuredData(data: Schema16UnifiedPageData): any {
    // 基本構造化データを生成（プライベートメソッドの代替）
    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': data.latestOrganizationSchema?.['@id'] || 'https://nands.tech/#organization',
      name: data.latestOrganizationSchema?.name || 'エヌアンドエス株式会社',
      description: data.latestOrganizationSchema?.description || 'AI・システム開発・リスキリング研修のエヌアンドエス'
    };

    // Schema.org 16.0+ 拡張データを統合
    const schema16Extensions = {
      // AI透明性
      digitalSourceType: data.aiTransparencySchema?.digitalSourceTypes,
      
      // 企業認証
      hasCertification: data.certificationSystem?.activeCertifications,
      
      // 助成金対応
      providesGovernmentService: data.governmentBenefitsSystem?.availableBenefits,
      
      // プラットフォーム対応
      targetPlatform: data.platformSupport?.supportedPlatforms,
      
      // 日本企業特化プロパティ
      japaneseEnterpriseFeatures: data.latestOrganizationSchema?.japaneseEnterpriseFeatures
    };

    return {
      ...baseStructuredData,
      ...schema16Extensions
    };
  }
}

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * Schema.org 16.0+ 対応ページデータ生成関数
 */
export async function generateSchema16UnifiedPageData(context: PageContext): Promise<Schema16UnifiedPageData> {
  const system = new Schema16UnifiedIntegrationSystem();
  return await system.generateSchema16UnifiedPageData(context);
}

/**
 * Schema.org 16.0+ 対応構造化データJSON生成
 */
export function generateSchema16StructuredDataJSON(data: Schema16UnifiedPageData): string {
  const system = new Schema16UnifiedIntegrationSystem();
  const structuredData = system.generateSchema16StructuredData(data);
  
  return JSON.stringify(structuredData, null, 2);
}

/**
 * AI透明性ステートメント生成
 */
export function generateAITransparencyStatement(digitalSourceTypes: IPTCDigitalSourceType[]): string {
  const typeDescriptions: Record<IPTCDigitalSourceType, string> = {
    [IPTCDigitalSourceType.DIGITAL_CAPTURE]: '人間による直接作成',
    [IPTCDigitalSourceType.ALGORITHMICALLY_ENHANCED]: 'AI支援による作成',
    [IPTCDigitalSourceType.TRAINED_ALGORITHMIC_MEDIA]: 'AI生成（学習済みモデル使用）',
    [IPTCDigitalSourceType.ALGORITHMIC_MEDIA]: '完全AI生成',
    [IPTCDigitalSourceType.COMPOSITE_WITH_TRAINED_ALGORITHMIC]: '複合的生成（人間+AI）',
    [IPTCDigitalSourceType.DATA_DRIVEN_MEDIA]: 'データ駆動生成'
  };
  
  const descriptions = digitalSourceTypes
    .map(type => typeDescriptions[type])
    .filter(desc => desc)
    .join('、');
  
  return `このコンテンツは${descriptions}により作成されています。当社はAI技術の活用において透明性を重視し、適切な表記を行っています。`;
}

/**
 * 助成金適用可能性チェック
 */
export function checkSubsidyEligibility(
  serviceType: string,
  companyType: 'large' | 'medium' | 'small'
): {
  eligible: boolean;
  applicableSubsidies: string[];
  maxCoverageRate: number;
  estimatedBenefit: number;
} {
  const benefits = createJapaneseGovernmentBenefits();
  
  // サービス種別と企業規模に基づく適用可能性判定
  const applicableBenefits = benefits.filter(benefit => {
    if (serviceType.includes('リスキリング') || serviceType.includes('研修')) {
      return benefit.name.includes('人材開発');
    }
    if (serviceType.includes('システム') || serviceType.includes('IT')) {
      return benefit.name.includes('IT導入');
    }
    return false;
  });
  
  const maxCoverageRate = Math.max(...applicableBenefits.map(b => b.percentCoverage || 0));
  const estimatedBenefit = applicableBenefits.reduce((sum, benefit) => 
    sum + (benefit.monetaryAmount?.maxValue || 0), 0
  );
  
  return {
    eligible: applicableBenefits.length > 0,
    applicableSubsidies: applicableBenefits.map(b => b.name),
    maxCoverageRate,
    estimatedBenefit
  };
}

export default Schema16UnifiedIntegrationSystem; 