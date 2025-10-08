/**
 * YouTubeショート動画用Schema.org構造化データ
 * Mike King理論準拠：AI引用最適化
 * 
 * 実装理念:
 * 1. VideoObject + CreativeWork + WebPage統合
 * 2. Fragment ID完全対応（hasPart）
 * 3. ブログ記事との関連性（isRelatedTo）
 * 4. エンティティ統合（mentions）
 * 5. AI検索エンジン最適化
 * 
 * 🆕 4大AI検索エンジン最適化（Phase 2）:
 * - ChatGPT: 会話形式での引用最適化
 * - Perplexity: ソース引用・信頼性重視
 * - Claude: 構造化データ・エンティティ理解
 * - Gemini: マルチモーダル（動画+テキスト）最適化
 * - DeepSeek: 技術的な詳細度重視
 */

import type { YouTubeShortInfo } from '../youtube/youtube-data-api';
import { AI_SEARCH_ENGINE_CONFIGS } from './ai-search-optimization';

/**
 * YouTubeショート動画のエンティティ情報
 */
export interface YouTubeShortEntity {
  fragmentId: string;
  completeUri: string;
  videoId: string;
  title: string;
  description: string;
  
  // エンティティ関係
  category: string;
  tags: string[];
  targetQueries: string[];
  relatedEntities: string[];
  
  // ブログ記事連携
  relatedBlogPostId?: number;
  relatedBlogPostSlug?: string;
  relatedBlogPostUrl?: string;
  
  // バズ要素分析
  viralityScore?: number;
  targetEmotion?: string;
  hookType?: string;
}

/**
 * YouTubeショート用Schema.org VideoObject生成
 * AI検索エンジンで引用されやすい構造化データ
 */
export function generateYouTubeShortSchema(
  shortInfo: YouTubeShortInfo,
  entity: YouTubeShortEntity,
  blogPostUrl?: string
): object {
  const baseUrl = 'https://nands.tech';
  const shortsPageUrl = `${baseUrl}/shorts`;
  const completeUri = entity.completeUri;

  // メインのVideoObject
  const videoObject = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': completeUri,
    
    // 基本情報
    name: shortInfo.title,
    description: shortInfo.description,
    thumbnailUrl: shortInfo.thumbnailUrl,
    uploadDate: shortInfo.publishedAt,
    duration: shortInfo.duration,
    
    // URL情報（複数形式提供）
    url: shortInfo.shortUrl,
    embedUrl: shortInfo.embedUrl,
    contentUrl: shortInfo.videoUrl,
    
    // Fragment ID対応（Mike King理論）
    identifier: [
      {
        '@type': 'PropertyValue',
        propertyID: 'Fragment ID',
        value: entity.fragmentId
      },
      {
        '@type': 'PropertyValue',
        propertyID: 'Complete URI',
        value: completeUri
      },
      {
        '@type': 'PropertyValue',
        propertyID: 'YouTube Video ID',
        value: shortInfo.videoId
      }
    ],
    
    // 統計情報
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/WatchAction',
        userInteractionCount: shortInfo.viewCount
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: shortInfo.likeCount
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: shortInfo.commentCount
      }
    ],
    
    // 著者情報（株式会社エヌアンドエス）
    author: {
      '@type': 'Organization',
      name: '株式会社エヌアンドエス',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`
      },
      sameAs: [
        'https://www.youtube.com/@kenjiharada_ai_site',
        'https://twitter.com/nands_tech',
        'https://www.facebook.com/nands.tech'
      ]
    },
    
    // 発行者情報
    publisher: {
      '@type': 'Organization',
      name: '株式会社エヌアンドエス',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`
      }
    },
    
    // カテゴリとキーワード
    genre: entity.category,
    keywords: entity.tags.join(', '),
    
    // AI引用最適化：mentions（エンティティ統合）
    mentions: entity.relatedEntities.map(entityName => ({
      '@type': 'Thing',
      name: entityName
    })),
    
    // ブログ記事との関連性
    ...(blogPostUrl && {
      isRelatedTo: {
        '@type': 'BlogPosting',
        url: blogPostUrl,
        mainEntityOfPage: blogPostUrl
      }
    }),
    
    // ビデオ品質情報
    videoQuality: 'HD',
    encodingFormat: 'video/mp4',
    
    // AI引用用の追加メタデータ
    additionalType: [
      'https://schema.org/ShortFormVideo',
      'https://schema.org/EducationalVideo'
    ],
    
    // ターゲットクエリ（AI検索最適化）
    about: entity.targetQueries.map(query => ({
      '@type': 'Thing',
      name: query
    })),
    
    // アクセシビリティ
    accessibilityFeature: [
      'captions',
      'audioDescription'
    ],
    
    // 言語
    inLanguage: 'ja-JP',
    
    // ライセンス
    license: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    
    // コンテンツレーティング
    contentRating: {
      '@type': 'Rating',
      ratingValue: 'G',
      bestRating: 'G',
      author: {
        '@type': 'Organization',
        name: 'EIRIN'
      }
    }
  };

  return videoObject;
}

/**
 * YouTube Shorts専用ページのWebPageSchema生成
 */
export function generateYouTubeShortsPageSchema(
  allShorts: YouTubeShortEntity[]
): object {
  const baseUrl = 'https://nands.tech';
  const shortsPageUrl = `${baseUrl}/shorts`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': shortsPageUrl,
    
    url: shortsPageUrl,
    name: 'YouTubeショート動画一覧 | 株式会社エヌアンドエス',
    description: 'AI技術やビジネスに関するショート動画を配信しています。中学生でも理解できるわかりやすい解説で、最新のAI情報をお届けします。',
    
    // Fragment ID統合（hasPart）
    hasPart: allShorts.map(entity => ({
      '@type': 'VideoObject',
      '@id': entity.completeUri,
      name: entity.title,
      url: `https://youtube.com/shorts/${entity.videoId}`,
      identifier: {
        '@type': 'PropertyValue',
        propertyID: 'Fragment ID',
        value: entity.fragmentId
      }
    })),
    
    // パンくずリスト
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'ホーム',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'YouTubeショート動画',
          item: shortsPageUrl
        }
      ]
    },
    
    // 主要エンティティ
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: allShorts.length,
      itemListElement: allShorts.map((entity, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'VideoObject',
          '@id': entity.completeUri,
          name: entity.title,
          url: `https://youtube.com/shorts/${entity.videoId}`
        }
      }))
    },
    
    // 組織情報
    publisher: {
      '@type': 'Organization',
      name: '株式会社エヌアンドエス',
      url: baseUrl
    },
    
    // 最終更新日
    dateModified: new Date().toISOString(),
    
    // AI引用最適化
    about: {
      '@type': 'Thing',
      name: 'AI技術解説・ビジネス活用'
    },
    
    // 言語
    inLanguage: 'ja-JP'
  };
}

/**
 * エンティティ関係グラフ生成
 * Fragment Vectors統合用
 */
export function generateYouTubeShortEntityGraph(
  shortInfo: YouTubeShortInfo,
  entity: YouTubeShortEntity,
  blogPostId?: number
): {
  nodes: Array<{ id: string; type: string; label: string }>;
  edges: Array<{ from: string; to: string; relationship: string }>;
} {
  const nodes = [
    {
      id: entity.fragmentId,
      type: 'youtube-short',
      label: shortInfo.title
    },
    {
      id: 'company',
      type: 'organization',
      label: '株式会社エヌアンドエス'
    },
    {
      id: entity.category,
      type: 'category',
      label: entity.category
    }
  ];

  const edges = [
    {
      from: entity.fragmentId,
      to: 'company',
      relationship: 'publishedBy'
    },
    {
      from: entity.fragmentId,
      to: entity.category,
      relationship: 'belongsTo'
    }
  ];

  // ブログ記事との関連
  if (blogPostId) {
    nodes.push({
      id: `blog-post-${blogPostId}`,
      type: 'blog-post',
      label: entity.relatedBlogPostSlug || `ブログ記事 #${blogPostId}`
    });
    
    edges.push({
      from: entity.fragmentId,
      to: `blog-post-${blogPostId}`,
      relationship: 'relatedTo'
    });
  }

  // タグエンティティ
  entity.tags.forEach(tag => {
    nodes.push({
      id: `tag-${tag}`,
      type: 'tag',
      label: tag
    });
    
    edges.push({
      from: entity.fragmentId,
      to: `tag-${tag}`,
      relationship: 'hasTag'
    });
  });

  return { nodes, edges };
}

/**
 * AI引用最適化スコア計算
 */
export function calculateAIOptimizationScore(
  shortInfo: YouTubeShortInfo,
  entity: YouTubeShortEntity
): {
  totalScore: number;
  breakdown: {
    fragmentIdScore: number;
    schemaScore: number;
    entityScore: number;
    engagementScore: number;
  };
} {
  // Fragment ID実装（30点）
  const fragmentIdScore = entity.fragmentId && entity.completeUri ? 30 : 0;

  // Schema.org実装（25点）
  const schemaScore = 25; // 実装済みとして満点

  // エンティティ統合（25点）
  const entityScore = Math.min(
    (entity.relatedEntities.length * 5) + (entity.targetQueries.length * 2.5),
    25
  );

  // エンゲージメント（20点）
  const engagementRate = 
    (shortInfo.likeCount + shortInfo.commentCount * 2) / Math.max(shortInfo.viewCount, 1);
  const engagementScore = Math.min(engagementRate * 10000, 20);

  const totalScore = fragmentIdScore + schemaScore + entityScore + engagementScore;

  return {
    totalScore: Math.round(totalScore),
    breakdown: {
      fragmentIdScore,
      schemaScore,
      entityScore: Math.round(entityScore),
      engagementScore: Math.round(engagementScore)
    }
  };
}

/**
 * 既存のentity-relationships.tsに統合するためのエンティティ定義
 */
export function generateYouTubeShortEntityDefinition(
  entity: YouTubeShortEntity
): {
  fragmentId: string;
  completeUri: string;
  entityType: string;
  primaryEntity: string;
  relatedEntities: string[];
  category: string;
  semanticWeight: number;
  targetQueries: string[];
  schemaTypes: string[];
} {
  return {
    fragmentId: entity.fragmentId,
    completeUri: entity.completeUri,
    entityType: 'youtube-short',
    primaryEntity: entity.title,
    relatedEntities: entity.relatedEntities,
    category: entity.category,
    semanticWeight: entity.viralityScore || 0.7,
    targetQueries: entity.targetQueries,
    schemaTypes: ['VideoObject', 'ShortFormVideo', 'CreativeWork']
  };
}

/**
 * 🆕 4大AI検索エンジン最適化：マルチモーダルVideoObject生成
 * 
 * 各AI検索エンジンの特性に応じた最適化:
 * - ChatGPT: 会話形式での引用（conversational context）
 * - Perplexity: ソース引用重視（citation-friendly）
 * - Claude: エンティティ統合（entity-rich）
 * - Gemini: マルチモーダル（video + text + thumbnail）
 * - DeepSeek: 技術的詳細（technical depth）
 */
export function generateAIOptimizedYouTubeShortSchema(
  shortInfo: YouTubeShortInfo,
  entity: YouTubeShortEntity,
  blogPostUrl?: string,
  targetEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'DeepSeek']
): object {
  const baseSchema = generateYouTubeShortSchema(shortInfo, entity, blogPostUrl) as any;
  
  // 4大AI検索エンジン最適化レイヤーを追加
  const aiOptimizations: Record<string, any> = {};
  
  targetEngines.forEach(engineName => {
    const config = AI_SEARCH_ENGINE_CONFIGS[engineName];
    if (!config) return;
    
    aiOptimizations[engineName] = {
      recommendedKnowsAboutCount: config.recommendedKnowsAboutCount,
      recommendedMentionsCount: config.recommendedMentionsCount,
      expertiseFocus: config.expertiseFocus,
      entityRelationshipWeight: config.entityRelationshipWeight,
      fragmentIdUtilization: config.fragmentIdUtilization
    };
  });
  
  // マルチモーダル最適化（Gemini特化）
  const multimodalOptimization = {
    '@type': 'CreativeWork',
    workExample: [
      {
        '@type': 'VideoObject',
        name: shortInfo.title,
        contentUrl: shortInfo.videoUrl,
        thumbnailUrl: shortInfo.thumbnailUrl,
        description: shortInfo.description,
        uploadDate: shortInfo.publishedAt // ✅ リッチリザルト対応
      },
      {
        '@type': 'ImageObject',
        contentUrl: shortInfo.thumbnailUrl,
        caption: shortInfo.title,
        representativeOfPage: true
      }
    ]
  };
  
  // 会話形式最適化（ChatGPT特化）
  const conversationalContext = {
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: `${entity.targetQueries[0] || shortInfo.title}について`,
      answerCount: 1, // ✅ Google リッチリザルト対応
      acceptedAnswer: {
        '@type': 'Answer',
        text: shortInfo.description,
        video: {
          '@type': 'VideoObject',
          contentUrl: shortInfo.videoUrl,
          name: shortInfo.title,
          thumbnailUrl: shortInfo.thumbnailUrl, // ✅ リッチリザルト対応
          uploadDate: shortInfo.publishedAt // ✅ リッチリザルト対応
        }
      }
    }
  };
  
  // エンティティ統合強化（Claude特化）
  const enhancedEntities = {
    mainEntity: {
      '@type': 'VideoObject',
      '@id': entity.completeUri,
      about: entity.targetQueries.map(query => ({
        '@type': 'Thing',
        name: query,
        sameAs: entity.relatedEntities.filter(e => e.startsWith('http'))
      }))
    }
  };
  
  // 技術的詳細強化（DeepSeek特化）
  const technicalDetails = {
    encodingFormat: 'video/mp4',
    videoQuality: 'HD',
    videoFrameSize: '1080x1920',
    bitrate: '2500000',
    uploadDate: shortInfo.publishedAt,
    duration: shortInfo.duration,
    aggregateRating: shortInfo.likeCount && shortInfo.viewCount ? {
      '@type': 'AggregateRating',
      ratingValue: ((shortInfo.likeCount / shortInfo.viewCount) * 5).toFixed(2),
      bestRating: '5',
      worstRating: '1',
      ratingCount: shortInfo.viewCount
    } : undefined
  };
  
  // ソース引用最適化（Perplexity特化）
  const citationOptimization = {
    citation: {
      '@type': 'CreativeWork',
      identifier: entity.fragmentId,
      url: entity.completeUri,
      author: {
        '@type': 'Organization',
        name: '株式会社エヌアンドエス',
        url: 'https://nands.tech'
      },
      datePublished: shortInfo.publishedAt,
      license: 'https://creativecommons.org/licenses/by-nc-nd/4.0/'
    }
  };
  
  // 統合Schema生成
  return {
    ...baseSchema,
    
    // 🆕 AI検索エンジン最適化メタデータ
    aiSearchOptimization: {
      targetEngines: aiOptimizations,
      optimizationScore: calculateAIOptimizationScore(shortInfo, entity).totalScore,
      multimodalSupport: true,
      citationFriendly: true,
      entityRich: true
    },
    
    // 🆕 マルチモーダル対応（Gemini）
    ...(targetEngines.includes('Gemini') && { multimodal: multimodalOptimization }),
    
    // 🆕 会話形式対応（ChatGPT）
    ...(targetEngines.includes('ChatGPT') && { conversational: conversationalContext }),
    
    // 🆕 エンティティ統合強化（Claude）
    ...(targetEngines.includes('Claude') && { enhancedEntities }),
    
    // 🆕 技術的詳細（DeepSeek）
    ...(targetEngines.includes('DeepSeek') && { technical: technicalDetails }),
    
    // 🆕 ソース引用最適化（Perplexity）
    ...(targetEngines.includes('Perplexity') && { citation: citationOptimization })
  };
}

/**
 * 🆕 YouTubeショート動画のAI検索クエリ生成
 * 各AI検索エンジンでの検索されやすさを最大化
 */
export function generateAISearchQueries(
  entity: YouTubeShortEntity,
  targetEngines: string[] = ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'DeepSeek']
): Record<string, string[]> {
  const queries: Record<string, string[]> = {};
  
  targetEngines.forEach(engineName => {
    const config = AI_SEARCH_ENGINE_CONFIGS[engineName];
    if (!config) return;
    
    // エンジン特化クエリ生成
    switch (engineName) {
      case 'ChatGPT':
        queries[engineName] = [
          `${entity.title}を動画で説明してください`,
          `${entity.targetQueries[0]}について教えてください`,
          `${entity.title}のYouTube動画はありますか`,
          ...entity.targetQueries.slice(0, 2)
        ];
        break;
      
      case 'Perplexity':
        queries[engineName] = [
          `${entity.title} ソース`,
          `${entity.targetQueries[0]} 信頼できる情報`,
          `${entity.title} 公式`,
          ...entity.targetQueries.slice(0, 2)
        ];
        break;
      
      case 'Claude':
        queries[engineName] = [
          `${entity.title}のエンティティ`,
          `${entity.targetQueries[0]} 構造化データ`,
          `${entity.title} 関連情報`,
          ...entity.targetQueries.slice(0, 2)
        ];
        break;
      
      case 'Gemini':
        queries[engineName] = [
          `${entity.title} 動画`,
          `${entity.targetQueries[0]} マルチメディア`,
          `${entity.title} 画像`,
          ...entity.targetQueries.slice(0, 2)
        ];
        break;
      
      case 'DeepSeek':
        queries[engineName] = [
          `${entity.title} 技術詳細`,
          `${entity.targetQueries[0]} 実装`,
          `${entity.title} コード`,
          ...entity.targetQueries.slice(0, 2)
        ];
        break;
    }
  });
  
  return queries;
}

/**
 * 🆕 AI検索エンジン準備度スコア計算
 * 各AI検索エンジンでの最適化レベルを評価
 */
export function calculateAISearchReadinessScore(
  entity: YouTubeShortEntity,
  shortInfo: YouTubeShortInfo
): {
  totalScore: number;
  engineScores: Record<string, number>;
  recommendations: string[];
} {
  const engineScores: Record<string, number> = {};
  const recommendations: string[] = [];
  
  // Fragment ID実装チェック
  const hasFragmentId = !!entity.fragmentId && !!entity.completeUri;
  
  // エンティティ統合チェック
  const hasEntities = entity.relatedEntities.length > 0;
  
  // ターゲットクエリチェック
  const hasQueries = entity.targetQueries.length > 0;
  
  // エンゲージメントチェック
  const hasEngagement = shortInfo.viewCount > 0 && shortInfo.likeCount > 0;
  
  // 各AI検索エンジンのスコア計算
  ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'DeepSeek'].forEach(engineName => {
    let score = 0;
    
    // 基本スコア
    if (hasFragmentId) score += 25;
    if (hasEntities) score += 20;
    if (hasQueries) score += 20;
    if (hasEngagement) score += 15;
    
    // エンジン特化スコア
    switch (engineName) {
      case 'ChatGPT':
        // 会話形式での引用しやすさ
        if (entity.targetQueries.some(q => q.includes('？') || q.includes('教え'))) score += 10;
        if (shortInfo.description.length > 50) score += 10;
        break;
      
      case 'Perplexity':
        // ソース引用の信頼性
        if (entity.completeUri.startsWith('https://')) score += 10;
        if (shortInfo.publishedAt) score += 10;
        break;
      
      case 'Claude':
        // エンティティ統合度
        if (entity.relatedEntities.length >= 3) score += 10;
        if (entity.targetQueries.length >= 3) score += 10;
        break;
      
      case 'Gemini':
        // マルチモーダル対応
        if (shortInfo.thumbnailUrl) score += 10;
        if (shortInfo.videoUrl) score += 10;
        break;
      
      case 'DeepSeek':
        // 技術的詳細度
        if (entity.tags.some(t => t.includes('技術') || t.includes('実装') || t.includes('コード'))) score += 10;
        if (entity.targetQueries.some(q => q.includes('方法') || q.includes('実装'))) score += 10;
        break;
    }
    
    engineScores[engineName] = Math.min(score, 100);
    
    // 推奨事項生成
    if (score < 60) {
      recommendations.push(`${engineName}: スコア ${score}/100 - 最適化が必要`);
    }
  });
  
  const totalScore = Math.round(
    Object.values(engineScores).reduce((sum, score) => sum + score, 0) / 5
  );
  
  return {
    totalScore,
    engineScores,
    recommendations
  };
}

