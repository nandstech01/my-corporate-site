import { NextRequest, NextResponse } from 'next/server';
import { AI_OPTIMIZED_FRAGMENT_IDS } from '@/lib/structured-data/ai-search-optimization';
import { AI_SITE_FAQ_ENTITIES } from '@/lib/structured-data/entity-relationships';

/**
 * 🚀 Fragment Feed API - /ai-site専用
 * AIエンジンが直接アクセス可能なFragment IDマップ
 * Mike King理論に基づくAI引用最適化フィード
 */

interface FragmentFeedItem {
  id: string;
  name: string;
  url: string;
  type: 'section' | 'faq' | 'feature';
  weight: number;
  queries: string[];
  entities: string[];
  description?: string;
  lastModified: string;
}

interface FragmentFeedResponse {
  meta: {
    title: string;
    description: string;
    url: string;
    lastModified: string;
    totalFragments: number;
    fragmentTypes: Record<string, number>;
  };
  fragments: FragmentFeedItem[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const currentTime = new Date().toISOString();
    
    // H2セクション用Fragment IDs
    const sectionFragments: FragmentFeedItem[] = [
      {
        id: 'main-title',
        name: 'AIサイト - メインタイトル',
        url: 'https://nands.tech/ai-site#main-title',
        type: 'section',
        weight: 1.0,
        queries: ['AIサイト', 'AI引用サイト', 'レリバンスエンジニアリング'],
        entities: ['AIサイト', 'AI引用', 'Triple RAG'],
        description: 'AIに引用される設計を標準搭載したサイト',
        lastModified: currentTime
      },
      {
        id: 'features-title',
        name: 'AIサイト - 機能・特徴',
        url: 'https://nands.tech/ai-site#features-title',
        type: 'feature',
        weight: 0.95,
        queries: ['AIサイト 機能', 'レリバンスエンジニアリング 特徴', 'Fragment ID 実装'],
        entities: ['Fragment ID', '構造化データ', 'Triple RAG', 'AI最適化'],
        description: 'AIサイトの核となる機能と技術的特徴',
        lastModified: currentTime
      },
      {
        id: 'pricing-title',
        name: 'AIサイト - 価格・プラン',
        url: 'https://nands.tech/ai-site#pricing-title',
        type: 'section',
        weight: 0.92,
        queries: ['AIサイト 価格', 'レリバンスエンジニアリング 費用', 'IT補助金'],
        entities: ['価格設定', 'IT補助金', 'ROI', '投資対効果'],
        description: 'IT補助金対応の価格プランと投資対効果',
        lastModified: currentTime
      },
      {
        id: 'faq-title',
        name: 'AIサイト - よくある質問',
        url: 'https://nands.tech/ai-site#faq-title',
        type: 'section',
        weight: 0.94,
        queries: ['AIサイト FAQ', 'AI引用 方法', 'Mike King理論'],
        entities: ['AI引用FAQ', 'Mike King理論', 'AI検索最適化'],
        description: 'AIサイトとレリバンスエンジニアリングに関するFAQ',
        lastModified: currentTime
      }
    ];

    // FAQ用Fragment IDs（AI_SITE_FAQ_ENTITIESから生成）
    const faqFragments: FragmentFeedItem[] = AI_SITE_FAQ_ENTITIES.map((faq, index) => {
      const faqNumber = index + 1;
      return {
        id: `faq-${faqNumber}`,
        name: faq.name,
        url: faq['@id'],
        type: 'faq' as const,
        weight: 0.85 + (index < 10 ? 0.05 : 0), // 上位10個により高い重み
        queries: faq.knowsAbout || [],
        entities: faq.mentions || [],
        description: `${faq.name}に関する詳細回答`,
        lastModified: currentTime
      };
    });

    const allFragments = [...sectionFragments, ...faqFragments];

    // メタデータ生成
    const fragmentTypes = allFragments.reduce((acc, fragment) => {
      acc[fragment.type] = (acc[fragment.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response: FragmentFeedResponse = {
      meta: {
        title: 'AIサイト Fragment Feed - AI引用最適化マップ',
        description: 'Mike King理論に基づくFragment IDとComplete URIの完全マップ。AIエンジンによる正確な引用をサポート。',
        url: 'https://nands.tech/ai-site',
        lastModified: currentTime,
        totalFragments: allFragments.length,
        fragmentTypes
      },
      fragments: allFragments
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400', // 5分キャッシュ
        'X-Fragment-Feed-Version': '1.0.0',
        'X-AI-Optimization': 'mike-king-theory'
      }
    });

  } catch (error) {
    console.error('Fragment Feed API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Fragment Feed generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 