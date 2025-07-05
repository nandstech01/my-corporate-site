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
      sources, 
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

    // Company RAG検索
    if (adjustedSources.includes('company')) {
      try {
        let companyQuery = supabaseServiceRole
          .rpc('match_company_vectors', {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: limit
          });

        // 日付フィルタを適用（Company RAGでは生成記事の日付をチェック）
        if (dateThreshold && !latestNewsMode) {
          // Company RAGの場合、作成日時でフィルタ
          companyQuery = companyQuery.filter('created_at', 'gte', dateThreshold);
        }

        const { data: companyResults, error: companyError } = await companyQuery;

        if (companyError) {
          console.error('Company RAG検索エラー:', companyError);
        } else {
          const formattedResults: SearchResult[] = (companyResults || []).map((result: any) => ({
            id: result.id,
            content: result.content,
            source: 'company',
            score: result.similarity,
            metadata: {
              ...result.metadata,
              source_type: result.source_type,
              source_url: result.source_url,
              created_at: result.created_at
            }
          }));
          searchResults.push(...formattedResults);
          console.log(`📄 Company RAG: ${formattedResults.length}件取得`);
        }
      } catch (error) {
        console.error('Company RAG検索エラー:', error);
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

        // 日付フィルタを適用
        if (dateThreshold) {
          trendQuery = trendQuery.filter('published_at', 'gte', dateThreshold);
        }

        const { data: trendResults, error: trendError } = await trendQuery;

        if (trendError) {
          console.error('Trend RAG検索エラー:', trendError);
        } else {
          let formattedResults: SearchResult[] = (trendResults || []).map((result: any) => ({
            id: result.id,
            content: result.content,
            source: 'trend',
            score: result.similarity,
            metadata: {
              ...result.metadata,
              title: result.title,
              source_url: result.source_url,
              published_at: result.published_at
            }
          }));

          // 最新ニュースモードでは日付順でソート
          if (latestNewsMode) {
            formattedResults.sort((a: SearchResult, b: SearchResult) => {
              const dateA = new Date(a.metadata.published_at || 0).getTime();
              const dateB = new Date(b.metadata.published_at || 0).getTime();
              return dateB - dateA; // 新しい順
            });
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