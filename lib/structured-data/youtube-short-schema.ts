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
 */

import type { YouTubeShortInfo } from '../youtube/youtube-data-api';

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

