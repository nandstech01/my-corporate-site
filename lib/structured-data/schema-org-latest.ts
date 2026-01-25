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
// Schema.org 16.0+ potentialAction 拡充システム
// =============================================================================

export interface PotentialActionSchema {
  '@type': string;
  '@id'?: string;
  name: string;
  description?: string;
  target: string | {
    '@type': 'EntryPoint';
    urlTemplate: string;
    encodingType?: string;
    contentType?: string;
  };
  object?: any;
  instrument?: any;
  expectsAcceptanceOf?: any;
  actionStatus?: 'PotentialActionStatus' | 'ActiveActionStatus' | 'CompletedActionStatus';
}

/**
 * 日本企業向けpotentialAction定義
 */
export const JAPANESE_ENTERPRISE_ACTIONS: PotentialActionSchema[] = [
  // お問い合わせアクション
  {
    '@type': 'ContactAction',
    name: 'お問い合わせ',
    description: 'AI・システム開発・研修に関するご相談',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://nands.tech/contact',
      encodingType: 'application/x-www-form-urlencoded',
      contentType: 'text/html'
    },
    object: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Japanese'
    }
  },
  
  // 助成金相談アクション
  {
    '@type': 'ConsultAction',
    name: '助成金活用相談',
    description: '人材開発支援助成金・IT導入補助金の活用相談',
    target: 'https://nands.tech/contact?subject=subsidy',
    object: {
      '@type': 'GovernmentService',
      name: '助成金活用支援サービス',
      serviceType: 'Government Benefits Consultation'
    }
  },
  
  // 研修申し込みアクション
  {
    '@type': 'RegisterAction',
    name: 'リスキリング研修申し込み',
    description: 'AI・プロンプトエンジニアリング研修への申し込み',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://nands.tech/reskilling?action=register',
      encodingType: 'application/x-www-form-urlencoded'
    },
    object: {
      '@type': 'Course',
      '@id': 'https://nands.tech/reskilling#course',
      name: 'AI・プロンプトエンジニアリング リスキリング研修',
      description: '生成AI活用とプロンプトエンジニアリングの実践的研修プログラム。ChatGPT、Claude等の最新AI技術を業務に活用するためのスキルを習得します。人材開発支援助成金適用で受講料最大80%補助対象。',
      courseMode: 'online',
      availableLanguage: 'Japanese',
      provider: {
        '@type': 'Organization',
        '@id': 'https://nands.tech/#organization',
        name: 'エヌアンドエス株式会社',
        url: 'https://nands.tech'
      },
      offers: {
        '@type': 'Offer',
        name: 'リスキリング研修受講料',
        description: '人材開発支援助成金適用で最大80%補助',
        price: '200000',
        priceCurrency: 'JPY',
        availability: 'https://schema.org/InStock',
        validFrom: '2024-01-01',
        validThrough: '2024-12-31',
        priceValidUntil: '2024-12-31',
        eligibleQuantity: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 20,
          unitText: '名'
        },
        category: 'Government Subsidy Eligible Training'
      },
      hasCourseInstance: [
        {
          '@type': 'CourseInstance',
          courseMode: 'online',
          instructor: {
            '@type': 'Person',
            name: '原田賢治',
            '@id': 'https://nands.tech/#founder',
            jobTitle: '代表取締役・AI技術コンサルタント'
          },
          location: {
            '@type': 'VirtualLocation',
            name: 'オンライン研修',
            url: 'https://nands.tech/reskilling'
          },
          courseSchedule: {
            '@type': 'Schedule',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            duration: 'P5D',
            repeatFrequency: 'Monthly',
            repeatCount: 12,
            timeOfDay: '09:00-17:00',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          },
          courseWorkload: 'PT35H',
          maximumAttendeeCapacity: 20
        }
      ],
      educationalLevel: 'Professional',
      teaches: [
        'プロンプトエンジニアリング',
        'ChatGPT業務活用',
        'Claude活用技術',
        'AI倫理とガバナンス',
        '生成AI導入戦略'
      ],
      timeRequired: 'P5D',
      coursePrerequisites: '基本的なPC操作スキル',
      educationalCredentialAwarded: {
        '@type': 'EducationalOccupationalCredential',
        name: 'AI活用実践認定証',
        credentialCategory: 'Professional Certification'
      },
      occupationalCategory: [
        'AI技術者',
        'プロンプトエンジニア',
        'DX推進担当者'
      ],
      about: [
        'Artificial Intelligence',
        'Prompt Engineering',
        'Digital Transformation',
        'Human Resources Development'
      ],
      inLanguage: 'ja-JP',
      isAccessibleForFree: false,
      financialAid: [
        {
          '@type': 'GovernmentService',
          name: '人材開発支援助成金',
          description: '厚生労働省による研修費用80%補助制度',
          funder: {
            '@type': 'GovernmentOrganization',
            name: '厚生労働省'
          }
        }
      ]
    },
    expectsAcceptanceOf: {
      '@type': 'Offer',
      name: '人材開発支援助成金適用（最大80%補助）'
    }
  },
  
  // 見積もり依頼アクション
  {
    '@type': 'QuoteAction',
    name: 'システム開発見積もり依頼',
    description: 'AIシステム・Webシステム開発の見積もり依頼',
    target: 'https://nands.tech/system-development?action=quote',
    object: {
      '@type': 'Service',
      serviceType: 'System Development',
      provider: { '@id': 'https://nands.tech/#organization' }
    },
    instrument: {
      '@type': 'WebApplication',
      '@id': 'https://nands.tech/quote-form-app',
      name: '見積もりフォーム',
      description: 'システム開発・AI開発プロジェクトの見積もり依頼フォーム',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web-based',
      url: 'https://nands.tech/system-development?action=quote',
      offers: {
        '@type': 'Offer',
        name: '無料見積もりサービス',
        description: 'システム開発・AI開発の無料見積もり',
        price: '0',
        priceCurrency: 'JPY',
        availability: 'https://schema.org/InStock',
        validFrom: '2024-01-01'
      },
      author: {
        '@type': 'Organization',
        '@id': 'https://nands.tech/#organization',
        name: 'エヌアンドエス株式会社'
      },
      publisher: {
        '@type': 'Organization',
        '@id': 'https://nands.tech/#organization',
        name: 'エヌアンドエス株式会社'
      },
      inLanguage: 'ja-JP',
      isAccessibleForFree: true,
      usageInfo: '24時間365日利用可能',
      featureList: [
        'システム開発見積もり',
        'AI開発見積もり', 
        'プロジェクト相談',
        '助成金活用提案'
      ]
    }
  },
  
  // 検索アクション（サイト内検索）
  {
    '@type': 'SearchAction',
    name: 'サイト内検索',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://nands.tech/search?q={search_term_string}',
      encodingType: 'application/x-www-form-urlencoded'
    },
    object: {
      '@type': 'WebSite',
      '@id': 'https://nands.tech/#website'
    }
  },
  
  // 購読アクション（ブログ・最新情報）
  {
    '@type': 'SubscribeAction',
    name: '最新情報の購読',
    description: 'AI・技術トレンドの最新情報を受け取る',
    target: 'https://nands.tech/subscribe',
    object: {
      '@type': 'CreativeWork',
      name: 'AI技術トレンド情報',
      genre: 'Technology News'
    }
  },
  
  // 予約アクション（オンライン相談）
  {
    '@type': 'ReserveAction',
    name: 'オンライン相談予約',
    description: 'AI導入・システム開発に関するオンライン相談の予約',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://nands.tech/consultation/reserve',
      encodingType: 'application/x-www-form-urlencoded'
    },
    object: {
      '@type': 'Service',
      name: 'オンライン技術相談',
      serviceType: 'Consultation',
      duration: 'PT60M'
    }
  }
];

// =============================================================================
// Schema.org 16.0+ additionalType 活用システム
// =============================================================================

export interface AdditionalTypeMapping {
  baseType: string;
  additionalTypes: string[];
  japaneseContext?: string[];
  industrySpecific?: string[];
  aiOptimized?: string[];
}

/**
 * 日本企業・AI業界特化additionalType定義
 */
// Note: TechnologyCompany, JapaneseEnterprise等のカスタム型はschema.orgに存在しない
// 有効な型のみを使用: Corporation, SoftwareCompany, LocalBusiness等
export const ADDITIONAL_TYPE_MAPPINGS: Record<string, AdditionalTypeMapping> = {
  Organization: {
    baseType: 'Organization',
    additionalTypes: [
      'https://schema.org/Corporation'
      // TechnologyCompany削除 - schema.orgに存在しない無効な型
    ],
    japaneseContext: [
      // JapaneseEnterprise削除 - schema.orgに存在しない
      'https://schema.org/LocalBusiness'
    ],
    industrySpecific: [
      'https://schema.org/ProfessionalService',
      // ConsultingCompany削除 - schema.orgに存在しない
      'https://schema.org/EducationalOrganization'
    ],
    aiOptimized: [
      // これらはschema.orgに存在しないカスタム型のため削除
      // ArtificialIntelligenceProvider, MachineLearningCompany等
    ]
  },
  
  Service: {
    baseType: 'Service',
    additionalTypes: [
      'https://schema.org/ProfessionalService'
      // TechnologyService削除 - schema.orgに存在しない
    ],
    japaneseContext: [
      // JapaneseBusinessService, GovernmentSubsidyEligibleService削除 - schema.orgに存在しない
    ],
    industrySpecific: [
      // SoftwareDevelopmentService, ConsultingService, TrainingService削除 - schema.orgに存在しない
    ],
    aiOptimized: [
      // ArtificialIntelligenceService, MachineLearningService, AutomationService削除 - schema.orgに存在しない
    ]
  },
  
  Course: {
    baseType: 'Course',
    additionalTypes: [
      'https://schema.org/EducationalOccupationalProgram'
    ],
    japaneseContext: [
      // JapaneseVocationalTraining, SubsidyEligibleTraining削除 - schema.orgに存在しない
    ],
    industrySpecific: [
      // TechnologyTraining, ProfessionalDevelopmentCourse削除 - schema.orgに存在しない
    ],
    aiOptimized: [
      // カスタム型を削除 - schema.orgに存在しない
      // ReskilleCourse (タイポ) 等
    ]
  },
  
  Person: {
    baseType: 'Person',
    additionalTypes: [
      // TechnicalExpert削除 - schema.orgに存在しない
    ],
    japaneseContext: [
      // JapaneseBusinessProfessional削除 - schema.orgに存在しない
    ],
    industrySpecific: [
      // SoftwareEngineer, ITConsultant, TechnologyEducator削除 - schema.orgに存在しない
    ],
    aiOptimized: [
      // カスタム型を削除 - schema.orgに存在しない
    ]
  }
};

// =============================================================================
// Schema.org 16.0+ sameAs プロパティ強化システム
// =============================================================================

export interface EnhancedSameAsMapping {
  entityId: string;
  primaryReferences: string[];
  industryReferences: string[];
  japaneseReferences: string[];
  aiOptimizedReferences: string[];
  knowledgeGraphConnections: string[];
}

/**
 * 強化sameAs参照システム
 */
// Note: 仮想URL・存在しないURLはGoogleガイドライン違反のため削除
// sameAsには実際に存在し、検証可能なURLのみを使用すること
export const ENHANCED_SAME_AS_MAPPINGS: Record<string, EnhancedSameAsMapping> = {
  'https://nands.tech/#organization': {
    entityId: 'https://nands.tech/#organization',
    primaryReferences: [
      'https://nands.tech/',
      'https://nands.tech/corporate',
      'https://nands.tech/about'
    ],
    industryReferences: [
      // 仮想URL削除 - 実際に存在するURLのみ使用可能
    ],
    japaneseReferences: [
      // 仮想URL削除 - 法人番号公表サイト等は実際の番号がある場合のみ
    ],
    aiOptimizedReferences: [
      // 仮想パートナーシップURL削除 - 実際のパートナーシップがある場合のみ
    ],
    knowledgeGraphConnections: [
      // カスタムschema.org URL削除 - 存在しないURL形式
    ]
  },

  'https://nands.tech/ai-agents#service': {
    entityId: 'https://nands.tech/ai-agents#service',
    primaryReferences: [
      'https://nands.tech/ai-agents',
      'https://nands.tech/mcp-servers'
    ],
    industryReferences: [
      // 仮想URL削除
    ],
    japaneseReferences: [
      // 仮想URL削除 - IPA, デジタル庁等の仮想URL
    ],
    aiOptimizedReferences: [
      // 仮想URL削除 - 実際のリポジトリがある場合のみ追加
    ],
    knowledgeGraphConnections: [
      // カスタムURL削除
    ]
  }
};

// =============================================================================
// 統合生成関数
// =============================================================================

/**
 * potentialAction統合生成
 */
export function generateEnhancedPotentialActions(
  entityType: string,
  context?: { serviceType?: string; pageType?: string }
): PotentialActionSchema[] {
  let actions = [...JAPANESE_ENTERPRISE_ACTIONS];
  
  // 不完全なオブジェクトを検証・修正する
  actions = actions.map(action => {
    // RegisterActionのobjectが不完全なCourseの場合、完全なものに置き換え
    if (action['@type'] === 'RegisterAction' && action.object && action.object['@type'] === 'Course') {
      // 既に完全な場合はそのまま、不完全な場合は除外または修正
      if (!action.object.name || !action.object.description) {
        // 不完全なCourseを完全なものに修正
        action.object = {
          '@type': 'Course',
          '@id': 'https://nands.tech/reskilling#course',
          name: 'AI・プロンプトエンジニアリング リスキリング研修',
          description: '生成AI活用とプロンプトエンジニアリングの実践的研修プログラム。ChatGPT、Claude等の最新AI技術を業務に活用するためのスキルを習得します。人材開発支援助成金適用で受講料最大80%補助対象。',
          courseMode: 'online',
          availableLanguage: 'Japanese',
          provider: {
            '@type': 'Organization',
            '@id': 'https://nands.tech/#organization',
            name: 'エヌアンドエス株式会社',
            url: 'https://nands.tech'
          },
          offers: {
            '@type': 'Offer',
            name: 'リスキリング研修受講料',
            description: '人材開発支援助成金適用で最大80%補助',
            price: '200000',
            priceCurrency: 'JPY',
            availability: 'https://schema.org/InStock',
            validFrom: '2024-01-01',
            validThrough: '2024-12-31'
          },
          hasCourseInstance: [
            {
              '@type': 'CourseInstance',
              courseMode: 'online',
              instructor: {
                '@type': 'Person',
                name: '原田賢治',
                '@id': 'https://nands.tech/#founder',
                jobTitle: '代表取締役・AI技術コンサルタント'
              },
              location: {
                '@type': 'VirtualLocation',
                name: 'オンライン研修',
                url: 'https://nands.tech/reskilling'
              },
              courseSchedule: {
                '@type': 'Schedule',
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                duration: 'P5D',
                repeatFrequency: 'Monthly',
                repeatCount: 12,
                timeOfDay: '09:00-17:00',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
              },
              courseWorkload: 'PT35H',
              maximumAttendeeCapacity: 20
            }
          ]
        };
      }
    }
    return action;
  });
  
  // コンテキスト別フィルタリング
  if (context?.serviceType) {
    actions = actions.filter(action => 
      action.description?.includes(context.serviceType!) ||
      action.name.includes(getServiceKeyword(context.serviceType!))
    );
  }
  
  // エンティティタイプ別最適化
  if (entityType === 'Organization') {
    // 組織レベルの包括的アクション
    return actions;
  } else if (entityType === 'Service') {
    // サービス特化アクション
    return actions.filter(action => 
      ['ContactAction', 'QuoteAction', 'RegisterAction', 'ConsultAction'].includes(action['@type'])
    );
  }
  
  return actions;
}

/**
 * additionalType統合生成
 */
export function generateEnhancedAdditionalTypes(
  baseType: string,
  context?: { 
    isJapaneseEnterprise?: boolean;
    isAIFocused?: boolean;
    industrySpecific?: string[];
  }
): string[] {
  const mapping = ADDITIONAL_TYPE_MAPPINGS[baseType];
  if (!mapping) return [];
  
  let additionalTypes = [...mapping.additionalTypes];
  
  if (context?.isJapaneseEnterprise && mapping.japaneseContext) {
    additionalTypes.push(...mapping.japaneseContext);
  }
  
  if (context?.isAIFocused && mapping.aiOptimized) {
    additionalTypes.push(...mapping.aiOptimized);
  }
  
  if (context?.industrySpecific && mapping.industrySpecific) {
    const relevantTypes = mapping.industrySpecific.filter(type =>
      context.industrySpecific!.some(industry => type.toLowerCase().includes(industry.toLowerCase()))
    );
    additionalTypes.push(...relevantTypes);
  }
  
  return Array.from(new Set(additionalTypes)); // 重複除去
}

/**
 * sameAs強化生成
 */
export function generateEnhancedSameAs(
  entityId: string,
  context?: {
    includeIndustryRefs?: boolean;
    includeJapaneseRefs?: boolean;
    includeAIRefs?: boolean;
    includeKnowledgeGraph?: boolean;
  }
): string[] {
  const mapping = ENHANCED_SAME_AS_MAPPINGS[entityId];
  if (!mapping) return [];
  
  let sameAsRefs = [...mapping.primaryReferences];
  
  if (context?.includeIndustryRefs) {
    sameAsRefs.push(...mapping.industryReferences);
  }
  
  if (context?.includeJapaneseRefs) {
    sameAsRefs.push(...mapping.japaneseReferences);
  }
  
  if (context?.includeAIRefs) {
    sameAsRefs.push(...mapping.aiOptimizedReferences);
  }
  
  if (context?.includeKnowledgeGraph) {
    sameAsRefs.push(...mapping.knowledgeGraphConnections);
  }
  
  // 有効なURLのみフィルタリング
  return sameAsRefs.filter(url => url && url.startsWith('https://'));
}

/**
 * ヘルパー関数
 */
function getServiceKeyword(serviceType: string): string {
  const serviceKeywords: Record<string, string> = {
    'ai-agents': 'AI',
    'aio-seo': 'SEO',
    'vector-rag': 'RAG',
    'chatbot-development': 'チャットボット',
    'system-development': 'システム開発',
    'reskilling': '研修',
    'hr-solutions': '人材',
    'mcp-servers': 'MCP',
    'video-generation': '動画',
    'sns-automation': 'SNS'
  };
  
  return serviceKeywords[serviceType] || '';
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