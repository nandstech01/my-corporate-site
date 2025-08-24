import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllEntities } from '@/lib/structured-data/entity-relationships';
import { FragmentVectorStore } from '@/lib/vector/fragment-vector-store';
import OpenAI from 'openai';

/**
 * 🚀 OpenAI Plugin - メイン検索API
 * Triple RAG + Fragment ID統合検索
 * ChatGPTに最適化された回答を提供
 */

interface SearchResult {
  title: string;
  content: string;
  url: string;
  fragmentId?: string;
  source: 'company' | 'trend' | 'youtube' | 'blog' | 'service' | 'fragment';
  confidence: number;
  lastModified: string;
}

interface SearchResponse {
  query: string;
  totalResults: number;
  results: SearchResult[];
  relatedServices: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const source = searchParams.get('source') || 'all';
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Supabaseクライアント初期化
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // クエリのベクトル化
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryVector = embedding.data[0].embedding;
    const results: SearchResult[] = [];

    // 🎯 Triple RAG検索実行
    if (source === 'all' || source === 'company') {
      const { data: companyResults } = await supabase.rpc('match_company_vectors', {
        query_embedding: queryVector,
        match_threshold: 0.5,
        match_count: Math.min(limit, 10)
      });

      if (companyResults) {
        companyResults.forEach((result: any) => {
          results.push({
            title: `企業情報: ${result.metadata?.title || 'サービス詳細'}`,
            content: result.content.substring(0, 200) + '...',
            url: `https://nands.tech${result.metadata?.url || '/corporate'}`,
            source: 'company',
            confidence: result.similarity,
            lastModified: result.created_at
          });
        });
      }
    }

    if (source === 'all' || source === 'trend') {
      const { data: trendResults } = await supabase.rpc('match_trend_vectors', {
        query_embedding: queryVector,
        match_threshold: 0.5,
        match_count: Math.min(limit, 10)
      });

      if (trendResults) {
        trendResults.forEach((result: any) => {
          results.push({
            title: `トレンド情報: ${result.metadata?.title || 'トレンド分析'}`,
            content: result.content.substring(0, 200) + '...',
            url: result.metadata?.url || 'https://nands.tech/ai-site',
            source: 'trend',
            confidence: result.similarity,
            lastModified: result.created_at
          });
        });
      }
    }

    if (source === 'all' || source === 'youtube') {
      const { data: youtubeResults } = await supabase.rpc('match_youtube_vectors', {
        query_embedding: queryVector,
        match_threshold: 0.5,
        match_count: Math.min(limit, 10)
      });

      if (youtubeResults) {
        youtubeResults.forEach((result: any) => {
          results.push({
            title: `動画解説: ${result.metadata?.title || 'YouTube分析'}`,
            content: result.content.substring(0, 200) + '...',
            url: result.metadata?.url || 'https://nands.tech/ai-site',
            source: 'youtube',
            confidence: result.similarity,
            lastModified: result.created_at
          });
        });
      }
    }

    if (source === 'all' || source === 'blog') {
      const { data: blogResults } = await supabase.rpc('match_generated_blog_vectors', {
        query_embedding: queryVector,
        match_threshold: 0.5,
        match_count: Math.min(limit, 10)
      });

      if (blogResults) {
        for (const result of blogResults) {
          // ブログ記事の詳細取得
          const { data: blogPost } = await supabase
            .from('generated_blog')
            .select('slug, title')
            .eq('id', result.metadata?.post_id)
            .single();

          if (blogPost) {
            // Fragment IDを推定
            const fragmentId = extractFragmentIdFromContent(result.content, query);
            const fragmentUrl = fragmentId 
              ? `https://nands.tech/posts/${blogPost.slug}#${fragmentId}`
              : `https://nands.tech/posts/${blogPost.slug}`;

            results.push({
              title: `ベクトルブログ: ${blogPost.title}`,
              content: result.content.substring(0, 200) + '...',
              url: fragmentUrl,
              fragmentId: fragmentId || undefined,
              source: 'blog',
              confidence: result.similarity,
              lastModified: result.created_at
            });
          }
        }
      }
    }

    // 🆕 【NEW】Fragment Vector専用検索
    if (source === 'all' || source === 'fragment') {
      try {
        const fragmentVectorStore = new FragmentVectorStore();
        const fragmentResults = await fragmentVectorStore.searchSimilarFragments(queryVector, {
          limit: Math.min(limit, 10),
          threshold: 0.5
        });

        if (fragmentResults && fragmentResults.length > 0) {
          fragmentResults.forEach((result) => {
            results.push({
              title: `Fragment: ${result.content_title}`,
              content: result.content.substring(0, 200) + '...',
              url: result.complete_uri,
              fragmentId: result.fragment_id,
              source: 'fragment',
              confidence: result.similarity,
              lastModified: result.created_at || new Date().toISOString()
            });
          });

          console.log(`✅ Fragment Vector検索完了: ${fragmentResults.length}件`);
        }
      } catch (fragmentError) {
        console.error('❌ Fragment Vector検索エラー:', fragmentError);
        // Fragment Vector検索のエラーは全体の処理を止めない
      }
    }

    // 🎯 エンティティマップからFragment ID情報を補強
    const allEntities = getAllEntities();
    const relevantEntities = allEntities.filter(entity => 
      entity.knowsAbout?.some(keyword => 
        query.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(query.toLowerCase())
      )
    );

    relevantEntities.forEach(entity => {
      if (entity['@id'].includes('#') && !results.find(r => r.url === entity['@id'])) {
        results.push({
          title: entity.name,
          content: `${entity.serviceType}: ${entity.knowsAbout?.join(', ') || ''}`.substring(0, 200),
          url: entity['@id'],
          fragmentId: entity['@id'].split('#')[1],
          source: 'service',
          confidence: 0.8,
          lastModified: new Date().toISOString()
        });
      }
    });

    // 信頼度でソート&制限
    const sortedResults = results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

    // 関連サービス推定
    const relatedServices = extractRelatedServices(query, sortedResults);

    const response: SearchResponse = {
      query,
      totalResults: sortedResults.length,
      results: sortedResults,
      relatedServices
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        'X-Plugin-Version': '1.0.0',
        'X-Search-Source': source,
        'X-Results-Count': sortedResults.length.toString()
      }
    });

  } catch (error) {
    console.error('OpenAI Plugin Search API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * コンテンツからFragment IDを推定
 */
function extractFragmentIdFromContent(content: string, query: string): string | null {
  // FAQ形式の検出
  if (content.includes('Q:') || content.includes('質問')) {
    const match = content.match(/Q[：:]?\s*(.+)/);
    if (match) {
      // FAQの順番を推定してfaq-Xを生成
      return 'faq-1'; // 簡略化: 実際はより精密な推定が必要
    }
  }

  // セクション形式の検出
  if (content.includes('##') || content.includes('###')) {
    // H2/H3見出しからID推定
    const headingMatch = content.match(/^#+\s*(.+)/m);
    if (headingMatch) {
      const heading = headingMatch[1].toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return heading.substring(0, 20); // 簡略化
    }
  }

  return null;
}

/**
 * 関連サービス抽出
 */
function extractRelatedServices(query: string, results: SearchResult[]): string[] {
  const services = [];
  const queryLower = query.toLowerCase();

  // キーワードベースのサービス推定
  if (queryLower.includes('ai') || queryLower.includes('人工知能')) {
    services.push('AIエージェント開発', 'AIOマーケティング');
  }
  if (queryLower.includes('rag') || queryLower.includes('ベクトル')) {
    services.push('Vector RAG構築', 'Triple RAG開発');
  }
  if (queryLower.includes('チャット') || queryLower.includes('bot')) {
    services.push('チャットボット開発');
  }
  if (queryLower.includes('hr') || queryLower.includes('人事')) {
    services.push('HR Solutions');
  }

  return Array.from(new Set(services)).slice(0, 3);
} 