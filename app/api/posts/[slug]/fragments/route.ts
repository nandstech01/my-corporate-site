import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllEntities } from '@/lib/structured-data/entity-relationships';

/**
 * 🚀 Dynamic Fragment Feed API - ベクトルブログ記事専用
 * 任意のブログ記事のFragment IDマップを提供
 * Mike King理論に基づくAI引用最適化フィード
 */

interface FragmentFeedItem {
  id: string;
  name: string;
  url: string;
  type: 'title' | 'section' | 'faq' | 'passage';
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
    postId: number;
    slug: string;
    lastModified: string;
    totalFragments: number;
    fragmentTypes: Record<string, number>;
  };
  fragments: FragmentFeedItem[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    const { slug } = params;
    const currentTime = new Date().toISOString();
    
    // Supabaseクライアント初期化
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 記事データを取得
    const { data: post, error: postError } = await supabase
      .from('generated_blog')
      .select('*')
      .eq('slug', slug)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found', slug },
        { status: 404 }
      );
    }

    const baseUrl = `https://nands.tech/posts/${slug}`;
    const fragments: FragmentFeedItem[] = [];

    // H1メインタイトル
    fragments.push({
      id: 'main-title',
      name: `${post.title} - メインタイトル`,
      url: `${baseUrl}#main-title`,
      type: 'title',
      weight: 1.0,
      queries: [post.title, ...extractKeywords(post.title)],
      entities: ['ベクトルブログ', 'AI引用最適化', '記事タイトル'],
      description: post.meta_description || post.title,
      lastModified: post.updated_at || post.created_at
    });

    // コンテンツからFragment IDを抽出してフィード化
    const fragmentIdPattern = /\{#([^}]+)\}/g;
    const contentLines = post.content.split('\n');
    
    contentLines.forEach((line: string, index: number) => {
      const match = fragmentIdPattern.exec(line);
      if (match) {
        const fragmentId = match[1];
        const cleanTitle = line.replace(fragmentIdPattern, '').replace(/^#+\s*/, '').trim();
        const level = (line.match(/^#+/) || [''])[0].length;
        
        let type: 'section' | 'faq' | 'passage' = 'section';
        let weight = 0.8;
        
        if (fragmentId.startsWith('faq-')) {
          type = 'faq';
          weight = 0.9;
        } else if (fragmentId.startsWith('subtopic-')) {
          type = 'passage';
          weight = 0.7;
        }

        fragments.push({
          id: fragmentId,
          name: cleanTitle,
          url: `${baseUrl}#${fragmentId}`,
          type,
          weight,
          queries: extractKeywords(cleanTitle),
          entities: [post.title, 'ベクトルブログ', 'Fragment ID'],
          description: `${post.title}の${cleanTitle}セクション`,
          lastModified: post.updated_at || post.created_at
        });
      }
    });

    // 動的エンティティからFAQ情報を取得
    const allEntities = getAllEntities();
    const blogFAQEntities = allEntities.filter(
      entity => entity['@id'].includes(`/posts/${slug}#faq-`)
    );

    blogFAQEntities.forEach(entity => {
      const fragmentId = entity['@id'].split('#')[1];
      if (!fragments.find(f => f.id === fragmentId)) {
        fragments.push({
          id: fragmentId,
          name: entity.name.replace(' - FAQ', ''),
          url: entity['@id'],
          type: 'faq',
          weight: 0.9,
          queries: entity.mentions || [],
          entities: entity.knowsAbout || [],
          description: `${post.title}に関するよくある質問`,
          lastModified: ('generatedAt' in entity ? entity.generatedAt : currentTime) || currentTime
        });
      }
    });

    // Fragment数をカウント
    const fragmentTypes = fragments.reduce((acc, fragment) => {
      acc[fragment.type] = (acc[fragment.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response: FragmentFeedResponse = {
      meta: {
        title: `${post.title} - Fragment Feed`,
        description: `Mike King理論に基づく「${post.title}」のFragment IDとComplete URIマップ。AIエンジンによる正確な引用をサポート。`,
        url: baseUrl,
        postId: post.id,
        slug: post.slug,
        lastModified: post.updated_at || post.created_at,
        totalFragments: fragments.length,
        fragmentTypes
      },
      fragments: fragments.sort((a, b) => b.weight - a.weight) // 重要度順にソート
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        'X-Fragment-Feed-Version': '1.0.0',
        'X-AI-Optimization': 'mike-king-theory',
        'X-Post-Slug': slug,
        'X-Fragment-Count': fragments.length.toString()
      }
    });

  } catch (error) {
    console.error(`Fragment Feed API error for slug ${params.slug}:`, error);
    
    return NextResponse.json(
      { 
        error: 'Fragment Feed generation failed',
        slug: params.slug,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * テキストからキーワードを抽出
 */
function extractKeywords(text: string): string[] {
  const keywords = text
    .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1)
    .slice(0, 5);
  
  return Array.from(new Set(keywords));
} 