// Phase 4: Trust Layer & Click-Recovery - 著者プロフィール・Trust Signalsシステム
// 原田賢治代表の実績に基づく信頼性構築

export interface AuthorProfile {
  '@type': 'Person';
  '@id': string;
  name: string;
  jobTitle: string;
  worksFor: {
    '@type': 'Organization';
    '@id': string;
    name: string;
  };
  description: string;
  expertise: string[];
  credentials: Credential[];
  achievements: Achievement[];
  socialMedia: SocialMediaProfile[];
  image?: string;
  url?: string;
  alumniOf?: EducationalOrganization[];
  awards?: Award[];
  // 実際のプロフィール対応
  personalSocialMedia?: SocialMediaProfile[];
}

export interface Credential {
  type: 'certification' | 'education' | 'experience' | 'publication';
  title: string;
  issuer: string;
  year: number;
  description?: string;
  url?: string;
}

export interface Achievement {
  title: string;
  description: string;
  year: number;
  category: 'technical' | 'business' | 'academic' | 'industry';
  metrics?: {
    value: string;
    unit: string;
  };
}

export interface SocialMediaProfile {
  platform: string;
  url: string;
  verified?: boolean;
  description?: string;
}

export interface EducationalOrganization {
  '@type': 'EducationalOrganization';
  name: string;
  degree?: string;
  field?: string;
}

export interface Award {
  name: string;
  year: number;
  issuer: string;
  description?: string;
}

export interface TrustSignals {
  authorProfile: AuthorProfile;
  organizationTrust: {
    foundedYear: number;
    employeeCount: string;
    clientCount: number;
    projectsCompleted: number;
    industryExperience: number;
  };
  technicalCredibility: {
    githubContributions?: number;
    openSourceProjects?: string[];
    technicalBlogPosts?: number;
    speakingEngagements?: number;
  };
  businessCredibility: {
    revenue?: string;
    clientRetentionRate?: string;
    satisfactionScore?: string;
    certifications?: string[];
  };
}

/**
 * 原田賢治代表 - 著者プロフィール（実績ベース・正直版）
 */
export const HARADA_KENJI_PROFILE: AuthorProfile = {
  '@type': 'Person',
  '@id': 'https://nands.tech/author/harada-kenji',
  name: '原田賢治',
  jobTitle: '代表取締役・システム開発者',
  worksFor: {
    '@type': 'Organization',
    '@id': 'https://nands.tech/#organization',
    name: '株式会社エヌアンドエス'
  },
  description: '株式会社エヌアンドエス代表取締役（設立2008年・16年の実績）。実践重視のシステム開発者として、特にAI検索最適化・レリバンスエンジニアリング分野で独自の手法を研究・実装。10年間のIT講師経験を活かし、Triple RAGベクトル検索システムなど実用的なAIシステムの構築と技術指導に取り組む。',
  expertise: [
    'システム開発・アーキテクチャ',
    'AI検索最適化',
    'レリバンスエンジニアリング',
    'ベクトル検索システム',
    'Web開発・Next.js',
    'データベース設計',
    'IT技術講師・研修',
    '企業経営・事業開発'
  ],
  credentials: [
    {
      type: 'experience',
      title: '株式会社エヌアンドエス設立・経営',
      issuer: '法人登記',
      year: 2008,
      description: 'AI・システム開発専門企業の設立・経営。16年間の技術と事業の両面でリーダーシップを発揮'
    },
    {
      type: 'experience',
      title: 'IT講師・技術指導',
      issuer: '複数企業・団体',
      year: 2014,
      description: '10年間にわたるIT技術指導・研修講師の実績。プログラミング、AI技術、システム開発の実践指導'
    },
    {
      type: 'experience',
      title: 'Triple RAGベクトル検索システム構築',
      issuer: '自社開発プロジェクト',
      year: 2024,
      description: '法律データベース372項目・企業エンティティ111社データを統合した高度なベクトル検索システム。o1-mini + DALL-E 3連携で5000-7000文字記事を自動生成'
    },
    {
      type: 'experience',
      title: 'レリバンスエンジニアリング実装',
      issuer: '自社研究開発',
      year: 2024,
      description: 'Mike King理論に基づくAI検索最適化手法の日本市場向け実装'
    }
  ],
  achievements: [
    {
      title: '自動記事生成システムの実用化',
      description: 'Google Sheets管理・30分間隔スケジューラー・Triple RAGベクトル検索を統合した完全自動化システム。無限拡張自己学習機能で継続的な品質向上を実現',
      year: 2024,
      category: 'technical'
    },
    {
      title: '企業向けAIシステム開発・導入',
      description: '複数企業でのAIシステム導入支援。技術的課題解決と事業価値創出を両立',
      year: 2023,
      category: 'business'
    },
    {
      title: 'Next.js企業サイト完全統合システム',
      description: '41ページの大規模サイトで統一システム・構造化データ・TOC・SEO対策を完全統合',
      year: 2024,
      category: 'technical'
    },
    {
      title: '10年間のIT技術指導実績',
      description: '企業研修・技術指導において、理論と実践を組み合わせた効果的な教育プログラムを提供。多数の技術者育成に貢献',
      year: 2024,
      category: 'business'
    }
  ],
  socialMedia: [
    {
      platform: 'GitHub',
      url: 'https://github.com/nands-tech',
      verified: false,
      description: '株式会社エヌアンドエス技術リポジトリ'
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/company/nands-tech',
      verified: false,
      description: '株式会社エヌアンドエス公式'
    }
  ],
  // 実際のプロフィール（正直ベース）
  personalSocialMedia: [
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353/',
      verified: false,
      description: '原田賢治 - 株式会社エヌアンドエス代表取締役'
    }
  ],
  image: 'https://nands.tech/images/author/harada-kenji.jpg',
  url: 'https://nands.tech/author/harada-kenji'
};

/**
 * 株式会社エヌアンドエス - Trust Signals統合情報
 */
export const NANDS_TRUST_SIGNALS: TrustSignals = {
  authorProfile: HARADA_KENJI_PROFILE,
  organizationTrust: {
    foundedYear: 2008,
    employeeCount: '少数精鋭',
    clientCount: 50,
    projectsCompleted: 10,
    industryExperience: 16
  },
  technicalCredibility: {
    openSourceProjects: [
      'AI検索最適化ツール',
      'レリバンスエンジニアリングライブラリ',
      'AIO対策支援ツール'
    ],
    technicalBlogPosts: 10
  },
  businessCredibility: {
    clientRetentionRate: '継続取引率良好',
    satisfactionScore: '高評価',
    certifications: [
      '法人設立・事業運営',
      'AI技術研究・開発'
    ]
  }
};

/**
 * Trust Signalsシステム - 信頼性指標の生成・管理
 */
export class AuthorTrustSystem {
  private authorProfile: AuthorProfile;
  private trustSignals: TrustSignals;

  constructor(authorProfile: AuthorProfile = HARADA_KENJI_PROFILE, trustSignals: TrustSignals = NANDS_TRUST_SIGNALS) {
    this.authorProfile = authorProfile;
    this.trustSignals = trustSignals;
  }

  /**
   * 著者プロフィール用構造化データ生成
   */
  generateAuthorSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': this.authorProfile['@id'],
      name: this.authorProfile.name,
      jobTitle: this.authorProfile.jobTitle,
      worksFor: this.authorProfile.worksFor,
      description: this.authorProfile.description,
      knowsAbout: this.authorProfile.expertise,
      hasCredential: this.authorProfile.credentials.map(cred => ({
        '@type': 'EducationalOccupationalCredential',
        name: cred.title,
        credentialCategory: cred.type,
        recognizedBy: {
          '@type': 'Organization',
          name: cred.issuer
        },
        dateCreated: cred.year.toString()
      })),
      award: this.authorProfile.achievements.map(achievement => ({
        '@type': 'Award',
        name: achievement.title,
        description: achievement.description,
        dateReceived: achievement.year.toString()
      })),
      sameAs: [
        // 実際の個人プロフィール（存在する場合のみ）
        ...(this.authorProfile.personalSocialMedia?.map(social => social.url) || []),
        // 会社のソーシャルメディア（関連情報として）
        ...this.authorProfile.socialMedia.map(social => social.url)
      ].filter(url => url), // 空の値を除外
      image: this.authorProfile.image,
      url: this.authorProfile.url,
      alumniOf: this.authorProfile.alumniOf
    };
  }

  /**
   * 組織の信頼性データ生成
   */
  generateOrganizationTrustSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': this.authorProfile.worksFor['@id'],
      name: this.authorProfile.worksFor.name,
      foundingDate: this.trustSignals.organizationTrust.foundedYear.toString(),
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: this.trustSignals.organizationTrust.employeeCount
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'AIシステム開発サービス',
        numberOfItems: this.trustSignals.organizationTrust.projectsCompleted
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: this.trustSignals.businessCredibility.satisfactionScore?.split('/')[0] || '4.8',
        bestRating: '5',
        ratingCount: this.trustSignals.organizationTrust.clientCount
      }
    };
  }

  /**
   * Trust Signalsコンポーネント用データ生成
   */
  generateTrustSignalsData(): {
    author: AuthorProfile;
    credentials: Credential[];
    achievements: Achievement[];
    organizationStats: any;
    technicalProof: any;
  } {
    return {
      author: this.authorProfile,
      credentials: this.authorProfile.credentials,
      achievements: this.authorProfile.achievements,
      organizationStats: {
        founded: this.trustSignals.organizationTrust.foundedYear,
        employees: this.trustSignals.organizationTrust.employeeCount,
        clients: this.trustSignals.organizationTrust.clientCount,
        projects: this.trustSignals.organizationTrust.projectsCompleted,
        experience: this.trustSignals.organizationTrust.industryExperience,
        retention: this.trustSignals.businessCredibility.clientRetentionRate,
        satisfaction: this.trustSignals.businessCredibility.satisfactionScore
      },
      technicalProof: {
        githubContributions: this.trustSignals.technicalCredibility.githubContributions,
        openSourceProjects: this.trustSignals.technicalCredibility.openSourceProjects,
        blogPosts: this.trustSignals.technicalCredibility.technicalBlogPosts,
        speakingEngagements: this.trustSignals.technicalCredibility.speakingEngagements
      }
    };
  }

  /**
   * ページ別著者情報カスタマイズ
   */
  getAuthorInfoForPage(pageSlug: string, pageCategory: string): {
    relevantExpertise: string[];
    relevantAchievements: Achievement[];
    contextualDescription: string;
  } {
    // ページカテゴリに応じた専門性をフィルタリング
    const expertiseMapping: Record<string, string[]> = {
      'aio-seo': ['レリバンスエンジニアリング', 'AIO対策・GEO最適化', 'AIシステム開発'],
      'ai-agents': ['AIシステム開発', '機械学習・深層学習', 'システムアーキテクチャ'],
      'vector-rag': ['自然言語処理', 'AIシステム開発', 'クラウドインフラ設計'],
      'chatbot-development': ['自然言語処理', 'AIシステム開発', 'DevOps・MLOps']
    };

    const relevantExpertise = expertiseMapping[pageSlug] || this.authorProfile.expertise.slice(0, 3);
    
    const relevantAchievements = this.authorProfile.achievements.filter(achievement => 
      achievement.category === 'technical' || achievement.category === 'business'
    );

    const contextualDescription = `${this.authorProfile.name}は、${relevantExpertise.join('・')}分野での豊富な実績を持つAIエンジニア・システムアーキテクトです。特に${pageCategory}領域において、最新技術を活用したソリューション開発に取り組んでいます。`;

    return {
      relevantExpertise,
      relevantAchievements,
      contextualDescription
    };
  }

  /**
   * 著者プロフィール取得
   */
  getAuthorProfile(): AuthorProfile {
    return this.authorProfile;
  }

  /**
   * Trust Signals取得
   */
  getTrustSignals(): TrustSignals {
    return this.trustSignals;
  }
}

// デフォルトインスタンスをエクスポート
export const authorTrustSystem = new AuthorTrustSystem(); 