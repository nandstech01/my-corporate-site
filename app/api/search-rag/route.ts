import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SearchRequest {
  query: string;
  sources: string[]; // ['company', 'trend', 'youtube']
  limit?: number;
  threshold?: number;
  dateFilter?: 'all' | '7days' | '30days' | '90days';
  latestNewsMode?: boolean;
}

interface SearchResult {
  id: number;
  content: string;
  source: string;
  score?: number;
  metadata: any;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      query, 
      sources = ['company'], 
      limit = 10, 
      threshold = 0.3,
      dateFilter = 'all',
      latestNewsMode = false
    }: SearchRequest = await request.json();

    if (!query?.trim()) {
      return NextResponse.json(
        { error: '検索クエリが必要です' },
        { status: 400 }
      );
    }

    console.log(`🔍 RAG統合検索開始: "${query}"`);
    console.log(`📊 対象RAGシステム: ${sources.join(', ')}`);
    console.log(`📅 日付フィルタ: ${dateFilter}, 最新ニュースモード: ${latestNewsMode}`);

    // 日付フィルタの計算
    let dateThreshold: string | null = null;
    if (dateFilter !== 'all') {
      const days = dateFilter === '7days' ? 7 : dateFilter === '30days' ? 30 : 90;
      const date = new Date();
      date.setDate(date.getDate() - days);
      dateThreshold = date.toISOString();
      console.log(`📅 ${days}日前以降のデータを検索: ${dateThreshold}`);
    }

    // 最新ニュースモードの場合、RAGシステムを調整
    let adjustedSources = sources;
    if (latestNewsMode) {
      // 最新ニュースモードでは主にTrend RAGを重視
      adjustedSources = sources.includes('trend') ? ['trend'] : sources;
      console.log(`📰 最新ニュースモード: 対象RAG調整 → ${adjustedSources.join(', ')}`);
    }

    // クエリをベクトル化
    const embeddings = new OpenAIEmbeddings();
    const queryEmbedding = await embeddings.embedSingle(query);

    console.log(`🔢 クエリベクトル化完了: 次元=${queryEmbedding.length}`);

    const searchResults: SearchResult[] = [];

    // Fragment Vector RAG検索（旧Company RAGの置き換え）
    if (adjustedSources.includes('company')) {
      try {
        const { data: fragmentResults, error: fragmentError } = await supabaseServiceRole
          .rpc('match_fragment_vectors', {
            query_embedding: `[${queryEmbedding.join(',')}]`,
            match_threshold: threshold,
            match_count: limit,
            filter_page_path: null,
            filter_content_type: null
          });

        if (fragmentError) {
          console.error('Fragment Vector RAG検索エラー:', fragmentError);
        } else {
          const formattedResults: SearchResult[] = (fragmentResults || []).map((result: any) => ({
            id: result.id,
            content: result.content || '',
            source: 'fragment',
            score: result.similarity,
            metadata: {
              type: 'fragment',
              fragment_id: result.fragment_id,
              complete_uri: result.complete_uri,
              page_path: result.page_path,
              content_title: result.content_title,
              content_type: result.content_type,
              category: result.category,
              semantic_weight: result.semantic_weight,
              target_queries: result.target_queries,
              related_entities: result.related_entities,
              url: result.complete_uri,
              created_at: result.created_at,
              search_timestamp: new Date().toISOString(),
              ...result.metadata
            }
          }));
          searchResults.push(...formattedResults);
          console.log(`📄 Fragment Vector RAG: ${formattedResults.length}件取得`);
        }
      } catch (error) {
        console.error('Fragment Vector RAG検索エラー:', error);
      }
    }

    // Trend RAG検索（最新ニュース重視）
    if (adjustedSources.includes('trend')) {
      try {
        let trendQuery = supabaseServiceRole
          .rpc('match_trend_vectors', {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: limit * (latestNewsMode ? 3 : 1) // 最新ニュースモードでは3倍取得
          });

        // 日付フィルタを適用（trend_dateまたはmetadata.publishedを使用）
        if (dateThreshold) {
          const dateOnly = dateThreshold.split('T')[0]; // YYYY-MM-DD形式に変換
          trendQuery = trendQuery.filter('trend_date', 'gte', dateOnly);
          console.log(`📅 Trend RAG日付フィルタ適用: ${dateOnly}以降`);
        }

        const { data: trendResults, error: trendError } = await trendQuery;

        if (trendError) {
          console.error('Trend RAG検索エラー:', trendError);
        } else {
          let formattedResults: SearchResult[] = (trendResults || []).map((result: any) => ({
            id: result.id,
            content: result.content || '',
            source: 'trend',
            score: result.similarity,
            metadata: {
              ...result.metadata,
              title: result.trend_topic || result.title || '',
              source: result.source,
              source_url: result.source_url,
              relevance_score: result.relevance_score,
              published_at: result.metadata?.published || result.metadata?.retrieved_at,
              trend_date: result.trend_date,
              keywords: result.keywords,
              popularity_score: result.popularity_score
            }
          }));

          // 最新ニュースモードでは日付新しさを重視した再スコアリング
          if (latestNewsMode) {
            const now = Date.now();
            formattedResults = formattedResults.map((result: SearchResult) => {
              // 安全な日付処理
              const dateValue = result.metadata?.published_at || 
                               result.metadata?.trend_date || 
                               result.metadata?.retrieved_at || 
                               result.metadata?.created_at;
              
              const publishedDate = new Date(dateValue);
              let daysDiff = Infinity;
              let freshnessBonus = 0;
              let freshnessScore = 0;
              
              // 有効な日付の場合のみ処理
              if (dateValue && !isNaN(publishedDate.getTime())) {
                daysDiff = (now - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
                
                if (daysDiff <= 1) {
                  freshnessBonus = 0.3; // 24時間以内
                } else if (daysDiff <= 7) {
                  freshnessBonus = 0.15; // 7日以内
                } else if (daysDiff <= 30) {
                  freshnessBonus = 0.05; // 30日以内
                }
                
                freshnessScore = Math.max(0, 1 - (daysDiff / 30)); // 30日で線形減衰
              }
              
              // 最新性を考慮したスコア調整（関連性60% + 新しさ40%）
              const originalScore = result.score || 0;
              const enhancedScore = (originalScore * 0.6) + (freshnessScore * 0.4) + freshnessBonus;
              
              console.log(`📰 ${result.metadata?.title?.substring(0, 30)}... 
                         原スコア: ${originalScore.toFixed(3)}, 
                         新しさ: ${freshnessScore.toFixed(3)}, 
                         最終: ${enhancedScore.toFixed(3)}`);
              
              return {
                ...result,
                score: Math.min(enhancedScore, 1.0) // 最大1.0に制限
              };
            });

            // 強化されたスコアで再ソート
            formattedResults.sort((a: SearchResult, b: SearchResult) => (b.score || 0) - (a.score || 0));
          }

          searchResults.push(...formattedResults);
          console.log(`📰 Trend RAG: ${formattedResults.length}件取得 (最新ニュースモード: ${latestNewsMode})`);
        }
      } catch (error) {
        console.error('Trend RAG検索エラー:', error);
      }
    }

    // YouTube RAG検索
    if (adjustedSources.includes('youtube') && !latestNewsMode) {
      try {
        let youtubeQuery = supabaseServiceRole
          .rpc('match_youtube_vectors', {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: limit
          });

        // 日付フィルタを適用
        if (dateThreshold) {
          youtubeQuery = youtubeQuery.filter('created_at', 'gte', dateThreshold);
        }

        const { data: youtubeResults, error: youtubeError } = await youtubeQuery;

        if (youtubeError) {
          console.error('YouTube RAG検索エラー:', youtubeError);
        } else {
          const formattedResults: SearchResult[] = (youtubeResults || []).map((result: any) => ({
            id: result.id,
            content: result.content,
            source: 'youtube',
            score: result.similarity,
            metadata: {
              ...result.metadata,
              video_title: result.video_title,
              channel_name: result.channel_name,
              video_url: result.video_url,
              educational_score: result.educational_score,
              complexity_level: result.complexity_level
            }
          }));
          searchResults.push(...formattedResults);
          console.log(`🎥 YouTube RAG: ${formattedResults.length}件取得`);
        }
      } catch (error) {
        console.error('YouTube RAG検索エラー:', error);
      }
    }

    // 結果をスコア順にソートして上位を取得
    let sortedResults = searchResults
      .sort((a: SearchResult, b: SearchResult) => (b.score || 0) - (a.score || 0))
      .slice(0, limit * adjustedSources.length);

    // 最新ニュースモードでは日付の新しさも考慮
    if (latestNewsMode) {
      sortedResults = sortedResults.sort((a: SearchResult, b: SearchResult) => {
        // スコアと日付の組み合わせで評価
        const scoreA = (a.score || 0);
        const scoreB = (b.score || 0);
        const dateA = new Date(a.metadata.published_at || a.metadata.created_at || 0).getTime();
        const dateB = new Date(b.metadata.published_at || b.metadata.created_at || 0).getTime();
        
        // スコア70%、日付30%の重み付け
        const weightedA = scoreA * 0.7 + (dateA / Date.now()) * 0.3;
        const weightedB = scoreB * 0.7 + (dateB / Date.now()) * 0.3;
        
        return weightedB - weightedA;
      });
    }

    console.log(`✅ RAG統合検索完了: 総計${sortedResults.length}件 (日付フィルタ: ${dateFilter})`);

    return NextResponse.json({
      success: true,
      results: sortedResults,
      total: sortedResults.length,
      query: query,
      sources: adjustedSources,
      dateFilter: dateFilter,
      latestNewsMode: latestNewsMode,
      summary: {
        company: searchResults.filter(r => r.source === 'company').length,
        trend: searchResults.filter(r => r.source === 'trend').length,
        youtube: searchResults.filter(r => r.source === 'youtube').length,
        total: sortedResults.length,
        avgScore: sortedResults.length > 0 
          ? (sortedResults.reduce((sum, r) => sum + (r.score || 0), 0) / sortedResults.length).toFixed(3)
          : 0,
        dateRange: dateThreshold ? `${dateFilter} (${dateThreshold}以降)` : 'すべて'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ RAG統合検索エラー:', error);
    return NextResponse.json(
      { 
        error: 'RAG統合検索でエラーが発生しました',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 