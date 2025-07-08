/**
 * Schema.org 16.0+ 最新標準対応システム
 * 2024-2025年最新仕様準拠 - AI企業・日本企業最適化版
 * 
 * 主要新機能:
 * - IPTC Digital Source Enumeration (AI透明性)
 * - Certification 拡張 (企業認証)
 * - Government Benefits Type (助成金対応)
 * - 最新Organization/Service プロパティ
 */

// =============================================================================
// IPTC Digital Source Enumeration (Schema.org 24.0+)
// AI生成コンテンツの透明性確保
// =============================================================================

export enum IPTCDigitalSourceType {
  /** 人間による直接撮影・作成 */
  DIGITAL_CAPTURE = 'https://schema.org/DigitalCaptureDigitalSource',
  
  /** AI支援による作成（人間主導） */
  ALGORITHMICALLY_ENHANCED = 'https://schema.org/AlgorithmicallyEnhancedDigitalSource',
  
  /** AI生成（学習済みモデル使用） */
  TRAINED_ALGORITHMIC_MEDIA = 'https://schema.org/TrainedAlgorithmicMediaDigitalSource',
  
  /** 完全AI生成 */
  ALGORITHMIC_MEDIA = 'https://schema.org/AlgorithmicMediaDigitalSource',
  
  /** 複合的生成（人間+AI） */
  COMPOSITE_WITH_TRAINED_ALGORITHMIC = 'https://schema.org/CompositeWithTrainedAlgorithmicMediaDigitalSource',
  
  /** データ駆動生成 */
  DATA_DRIVEN_MEDIA = 'https://schema.org/DataDrivenMediaDigitalSource'
}

// =============================================================================
// Certification System (Schema.org 25.0+)
// 企業認証・資格情報の詳細化
// =============================================================================

export interface CertificationSchema {
  '@type': 'Certification';
  '@id': string;
  name: string;
  description?: string;
  
  /** 認証ステータス */
  certificationStatus: 'https://schema.org/CertificationActive' | 'https://schema.org/CertificationInactive';
  
  /** 認証機関 */
  issuedBy: {
    '@type': 'Organization';
    name: string;
    url?: string;
  };
  
  /** 認証対象 */
  about: {
    '@type': 'Organization' | 'Person' | 'Product' | 'Service';
    '@id': string;
  };
  
  /** 認証日 */
  dateIssued?: string;
  
  /** 有効期限 */
  expires?: string;
  
  /** 認証番号・ID */
  identifier?: string;
  
  /** 認証レベル・等級 */
  certificationLevel?: string;
  
  /** 認証範囲・対象分野 */
  applicableLocation?: string;
  
  /** 認証基準・要件 */
  certificationRequirement?: string;
}

// =============================================================================
// Government Benefits Type (Schema.org 25.0+) 
// 助成金・政府支援制度対応
// =============================================================================

export enum GovernmentBenefitsType {
  /** 基本所得保障 */
  BASIC_INCOME = 'https://schema.org/BasicIncome',
  
  /** 事業支援 */
  BUSINESS_SUPPORT = 'https://schema.org/BusinessSupport',
  
  /** 障害者支援 */
  DISABILITY_SUPPORT = 'https://schema.org/DisabilitySupport',
  
  /** 医療保障 */
  HEALTH_CARE = 'https://schema.org/HealthCare',
  
  /** 一時金支給 */
  ONE_TIME_PAYMENTS = 'https://schema.org/OneTimePayments',
  
  /** 有給休暇 */
  PAID_LEAVE = 'https://schema.org/PaidLeave',
  
  /** 育児支援 */
  PARENTAL_SUPPORT = 'https://schema.org/ParentalSupport',
  
  /** 失業給付 */
  UNEMPLOYMENT_SUPPORT = 'https://schema.org/UnemploymentSupport'
}

export interface GovernmentServiceSchema {
  '@type': 'GovernmentService';
  '@id': string;
  name: string;
  description: string;
  
  /** 提供機関 */
  provider: {
    '@type': 'GovernmentOrganization';
    name: string;
    url?: string;
  };
  
  /** 給付・支援種別 */
  benefitsType: GovernmentBenefitsType[];
  
  /** 対象地域 */
  areaServed: string[];
  
  /** 対象者・企業 */
  eligibleCustomerType: string[];
  
  /** 申請要件 */
  eligibilityRequirements: string[];
  
  /** 給付額・支援内容 */
  monetaryAmount?: {
    '@type': 'MonetaryAmount';
    currency: 'JPY';
    value?: number;
    minValue?: number;
    maxValue?: number;
  };
  
  /** 支援割合（例：80%補助） */
  percentCoverage?: number;
  
  /** 申請期間 */
  applicationDeadline?: string;
  
  /** 申請方法 */
  howToApply?: string;
  
  /** 関連URL */
  url?: string;
}

// =============================================================================
// Digital Platform Enumeration (Schema.org 24.0+)
// プラットフォーム対応の詳細化
// =============================================================================

export enum DigitalPlatformType {
  /** Android プラットフォーム */
  ANDROID = 'https://schema.org/AndroidPlatform',
  
  /** iOS プラットフォーム */
  IOS = 'https://schema.org/IOSPlatform',
  
  /** デスクトップWeb */
  DESKTOP_WEB = 'https://schema.org/DesktopWebPlatform',
  
  /** モバイルWeb */
  MOBILE_WEB = 'https://schema.org/MobileWebPlatform',
  
  /** 汎用Web */
  GENERIC_WEB = 'https://schema.org/GenericWebPlatform'
}

// =============================================================================
// 最新Organization拡張プロパティ (Schema.org 16.0+)
// =============================================================================

export interface LatestOrganizationProperties {
  /** デジタルソース透明性 */
  digitalSourceType?: IPTCDigitalSourceType[];
  
  /** 企業認証情報 */
  hasCertification?: CertificationSchema[];
  
  /** 提供する政府サービス・助成金対応 */
  providesGovernmentService?: GovernmentServiceSchema[];
  
  /** 対応プラットフォーム */
  targetPlatform?: DigitalPlatformType[];
  
  /** 多様性・スタッフィング報告 */
  diversityStaffingReport?: {
    '@type': 'Article';
    name: string;
    url: string;
    datePublished?: string;
  };
  
  /** 所有権・資金調達情報 */
  ownershipFundingInfo?: {
    '@type': 'CreativeWork';
    name: string;
    url: string;
    text?: string;
  };
  
  /** 訂正・更新情報 */
  correction?: {
    '@type': 'CorrectionComment';
    text: string;
    dateCreated: string;
  }[];
  
  /** アーカイブ情報 */
  archivedAt?: string[];
  
  /** 非営利種別（該当する場合） */
  nonprofitStatus?: string;
}

// =============================================================================
// 最新Service拡張プロパティ (Schema.org 16.0+)
// =============================================================================

export interface LatestServiceProperties {
  /** サービス認証 */
  hasCertification?: CertificationSchema[];
  
  /** 関連する政府給付・助成金 */
  governmentBenefitsInfo?: GovernmentServiceSchema[];
  
  /** 対応プラットフォーム */
  availableOnDevice?: DigitalPlatformType[];
  
  /** サービス期間指定 */
  servicePeriod?: {
    '@type': 'ServicePeriod';
    startDate: string;
    endDate?: string;
  };
  
  /** 財政インセンティブ */
  financialIncentive?: {
    '@type': 'FinancialIncentive';
    name: string;
    description: string;
    incentiveType: string;
    amount?: {
      '@type': 'MonetaryAmount';
      currency: 'JPY';
      value: number;
    };
  }[];
  
  /** サービス品質保証 */
  serviceWarranty?: {
    '@type': 'WarrantyPromise';
    durationOfWarranty: string;
    warrantyScope: string;
  };
}

// =============================================================================
// 日本企業向け特化プロパティ
// =============================================================================

export interface JapaneseEnterpriseProperties {
  /** 助成金対応詳細 */
  subsidySupport: {
    /** 人材開発支援助成金 */
    humanResourcesDevelopment: {
      enabled: boolean;
      coverageRate: number; // 80% など
      maxAmount?: number;
    };
    
    /** IT導入補助金 */
    itIntroduction: {
      enabled: boolean;
      coverageRate: number;
      maxAmount?: number;
    };
    
    /** ものづくり補助金 */
    manufacturing: {
      enabled: boolean;
      coverageRate: number;
      maxAmount?: number;
    };
    
    /** 小規模事業者持続化補助金 */
    smallBusinessSustainability: {
      enabled: boolean;
      coverageRate: number;
      maxAmount?: number;
    };
  };
  
  /** 法的コンプライアンス */
  legalCompliance: {
    /** 個人情報保護法対応 */
    personalInformationProtection: boolean;
    
    /** サイバーセキュリティ対応 */
    cybersecurityCompliance: boolean;
    
    /** AI倫理ガイドライン準拠 */
    aiEthicsCompliance: boolean;
    
    /** 障害者差別解消法対応 */
    accessibilityCompliance: boolean;
  };
  
  /** 地域対応 */
  regionalSupport: {
    /** 全国対応 */
    nationwide: boolean;
    
    /** リモート対応 */
    remoteSupport: boolean;
    
    /** 特定地域注力 */
    focusAreas?: string[];
  };
}

// =============================================================================
// 統合型定義
// =============================================================================

export interface Schema16LatestOrganization extends LatestOrganizationProperties {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  '@id': string;
  
  // 基本プロパティ
  name: string;
  description: string;
  url: string;
  
  // 日本企業特化
  japaneseEnterpriseFeatures?: JapaneseEnterpriseProperties;
}

export interface Schema16LatestService extends LatestServiceProperties {
  '@context': 'https://schema.org';
  '@type': 'Service';
  '@id': string;
  
  // 基本プロパティ
  name: string;
  description: string;
  provider: { '@id': string };
}

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * AI関連サービス企業向けのデジタルソース透明性設定
 */
export function createAIServiceTransparency(): IPTCDigitalSourceType[] {
  return [
    IPTCDigitalSourceType.DIGITAL_CAPTURE,           // 人間作成コンテンツ
    IPTCDigitalSourceType.ALGORITHMICALLY_ENHANCED,  // AI支援コンテンツ  
    IPTCDigitalSourceType.TRAINED_ALGORITHMIC_MEDIA  // AI生成コンテンツ（明示）
  ];
}

/**
 * 日本の主要企業認証を生成
 */
export function createJapaneseCertifications(organizationId: string): CertificationSchema[] {
  return [
    {
      '@type': 'Certification',
      '@id': `${organizationId}#iso27001`,
      name: 'ISO 27001 情報セキュリティマネジメントシステム',
      certificationStatus: 'https://schema.org/CertificationActive',
      issuedBy: {
        '@type': 'Organization',
        name: 'ISO（国際標準化機構）',
        url: 'https://www.iso.org/'
      },
      about: {
        '@type': 'Organization',
        '@id': organizationId
      },
      certificationLevel: 'ISO 27001:2013',
      applicableLocation: '日本国内'
    },
    {
      '@type': 'Certification',
      '@id': `${organizationId}#privacy-mark`,
      name: 'プライバシーマーク認定',
      certificationStatus: 'https://schema.org/CertificationActive',
      issuedBy: {
        '@type': 'Organization',
        name: '一般財団法人日本情報経済社会推進協会（JIPDEC）',
        url: 'https://www.jipdec.or.jp/'
      },
      about: {
        '@type': 'Organization',
        '@id': organizationId
      },
      applicableLocation: '日本国内'
    }
  ];
}

/**
 * 助成金対応サービスを生成
 */
export function createJapaneseGovernmentBenefits(): GovernmentServiceSchema[] {
  return [
    {
      '@type': 'GovernmentService',
      '@id': 'https://gov.japan#human-resources-development-subsidy',
      name: '人材開発支援助成金',
      description: 'リスキリング研修の費用を最大80%補助する助成金制度',
      provider: {
        '@type': 'GovernmentOrganization',
        name: '厚生労働省',
        url: 'https://www.mhlw.go.jp/'
      },
      benefitsType: [GovernmentBenefitsType.BUSINESS_SUPPORT],
      areaServed: ['日本全国'],
      eligibleCustomerType: ['企業', '事業者'],
      eligibilityRequirements: [
        '雇用保険適用事業所であること',
        '事前に計画届を提出すること',
        '訓練実施期間中の賃金を支払うこと'
      ],
      percentCoverage: 80,
      monetaryAmount: {
        '@type': 'MonetaryAmount',
        currency: 'JPY',
        maxValue: 1000000
      },
      url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyufukin/'
    },
    {
      '@type': 'GovernmentService',
      '@id': 'https://gov.japan#it-introduction-subsidy',
      name: 'IT導入補助金',
      description: 'ITツール導入による業務効率化・売上向上を支援する補助金',
      provider: {
        '@type': 'GovernmentOrganization',
        name: '経済産業省',
        url: 'https://www.meti.go.jp/'
      },
      benefitsType: [GovernmentBenefitsType.BUSINESS_SUPPORT],
      areaServed: ['日本全国'],
      eligibleCustomerType: ['中小企業', '小規模事業者'],
      eligibilityRequirements: [
        '中小企業であること',
        'ITツール導入による生産性向上が見込まれること',
        '補助対象経費が30万円以上であること'
      ],
      percentCoverage: 75,
      monetaryAmount: {
        '@type': 'MonetaryAmount',
        currency: 'JPY',
        maxValue: 4500000
      },
      url: 'https://www.it-hojo.jp/'
    }
  ];
}

/**
 * 最新Schema.org準拠の統合Organization生成
 */
export function generateLatestOrganizationSchema(
  baseOrg: any,
  options: {
    includeAITransparency?: boolean;
    includeCertifications?: boolean;
    includeGovernmentBenefits?: boolean;
  } = {}
): Schema16LatestOrganization {
  const latest: Schema16LatestOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': baseOrg['@id'],
    name: baseOrg.name,
    description: baseOrg.description,
    url: baseOrg.url
  };

  // AI透明性
  if (options.includeAITransparency) {
    latest.digitalSourceType = createAIServiceTransparency();
  }

  // 企業認証
  if (options.includeCertifications) {
    latest.hasCertification = createJapaneseCertifications(baseOrg['@id']);
  }

  // 助成金対応
  if (options.includeGovernmentBenefits) {
    latest.providesGovernmentService = createJapaneseGovernmentBenefits();
  }

  // 日本企業特化機能
  latest.japaneseEnterpriseFeatures = {
    subsidySupport: {
      humanResourcesDevelopment: {
        enabled: true,
        coverageRate: 80,
        maxAmount: 1000000
      },
      itIntroduction: {
        enabled: true,
        coverageRate: 75,
        maxAmount: 4500000
      },
      manufacturing: {
        enabled: false,
        coverageRate: 66
      },
      smallBusinessSustainability: {
        enabled: true,
        coverageRate: 66,
        maxAmount: 2000000
      }
    },
    legalCompliance: {
      personalInformationProtection: true,
      cybersecurityCompliance: true,
      aiEthicsCompliance: true,
      accessibilityCompliance: true
    },
    regionalSupport: {
      nationwide: true,
      remoteSupport: true,
      focusAreas: ['東京都', '関東地方', '全国']
    }
  };

  return latest;
} 