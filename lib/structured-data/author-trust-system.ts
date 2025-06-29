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
    clientCount: string;
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
 * 原田賢治代表 - 著者プロフィール（実績ベース）
 */
export const HARADA_KENJI_PROFILE: AuthorProfile = {
  '@type': 'Person',
  '@id': 'https://nands.tech/author/harada-kenji',
  name: '原田賢治',
  jobTitle: '代表取締役・AIエンジニア',
  worksFor: {
    '@type': 'Organization',
    '@id': 'https://nands.tech/#organization',
    name: '株式会社エヌアンドエス'
  },
  description: 'AIエンジニア・システム開発者として技術領域での経験を持つ。機械学習、自然言語処理分野での知識を活かし、エンタープライズ向けシステムの設計・開発に取り組む。近年はレリバンスエンジニアリング・AIO対策の研究開発に注力し、AI検索時代の新しい最適化手法の確立に取り組んでいる。',
  expertise: [
    'AIシステム開発',
    '機械学習・深層学習',
    '自然言語処理',
    'レリバンスエンジニアリング',
    'システムアーキテクチャ',
    'クラウドインフラ設計',
    'DevOps・MLOps',
    'AIO対策・GEO最適化'
  ],
  credentials: [
    {
      type: 'experience',
      title: 'AIシステム開発経験',
      issuer: '株式会社エヌアンドエス',
      year: 2020,
      description: '企業向けAIシステムの設計・開発・運用経験'
    },
    {
      type: 'experience',
      title: 'システム開発コンサルティング',
      issuer: '複数企業',
      year: 2018,
      description: '製造業・サービス業でのシステム開発支援'
    },
    {
      type: 'certification',
      title: 'プログラミング・AI技術',
      issuer: '独学・実務経験',
      year: 2015,
      description: 'プログラミング、機械学習、AI技術の習得・実践'
    }
  ],
  achievements: [
    {
      title: 'レリバンスエンジニアリング手法の研究',
      description: 'Mike King理論に基づくAI検索最適化手法を日本市場向けに研究・実装',
      year: 2024,
      category: 'technical'
    },
    {
      title: 'エンタープライズシステム開発',
      description: '企業向けAIシステム・Webアプリケーションの開発・導入支援',
      year: 2023,
      category: 'business'
    },
    {
      title: 'AI技術研究・情報発信',
      description: '最新AI技術・機械学習手法に関する技術研究と情報発信',
      year: 2023,
      category: 'academic'
    },
    {
      title: 'オープンソースツール開発',
      description: 'AIシステム・検索最適化ツールの開発・公開',
      year: 2024,
      category: 'technical'
    }
  ],
  socialMedia: [
    {
      platform: 'GitHub',
      url: 'https://github.com/nands-tech',
      verified: false
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/company/nands-tech',
      verified: false
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
    foundedYear: 2020,
    employeeCount: '少数精鋭',
    clientCount: '複数企業',
    projectsCompleted: 10,
    industryExperience: 4
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
      sameAs: this.authorProfile.socialMedia.map(social => social.url),
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