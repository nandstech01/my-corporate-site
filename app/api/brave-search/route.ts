import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { supabase } from '@/lib/supabase/supabase';

/**
 * GET: URLクエリパラメータからBrave Search（X投稿取得用）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const count = parseInt(searchParams.get('count') || '10');

    if (!query) {
      return NextResponse.json(
        { error: 'クエリパラメータ "q" が必要です' },
        { status: 400 }
      );
    }

    console.log(`🔍 Brave Search GET API - クエリ: "${query}"`);

    const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
    if (!BRAVE_API_KEY) {
      return NextResponse.json({
        error: 'BRAVE_API_KEY が設定されていません',
        query,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Brave Search API呼び出し
    const searchResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${new URLSearchParams({
        q: query,
        count: count.toString(),
        country: 'JP',
        search_lang: 'en',
        freshness: 'pd',
        result_filter: 'web'
      })}`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': BRAVE_API_KEY,
        },
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error(`Brave Search API エラー: ${searchResponse.status} - ${errorText}`);
      return NextResponse.json({
        error: `Brave Search API エラー: ${searchResponse.status}`,
        details: errorText,
        query,
        timestamp: new Date().toISOString()
      }, { status: searchResponse.status });
    }

    const braveData = await searchResponse.json();
    const braveResults = braveData.web?.results || [];

    console.log(`📊 Brave Search GET結果: ${braveResults.length}件`);

    // 結果を返す（ベクトル化なし、X投稿取得用）
    const results = braveResults.map((item: any, index: number) => ({
      title: item.title || '',
      url: item.url || '',
      description: item.description || '',
      age: item.age || '',
      source: item.profile?.name || extractDomain(item.url)
    }));

    return NextResponse.json({
      results,
      total: results.length,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Brave Search GET エラー:', error);
    return NextResponse.json(
      { error: 'Brave Search GET でエラーが発生しました: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST: 従来のニュース取得・ベクトル化機能
 */
export async function POST(request: NextRequest) {
  try {
    const { query, type = 'news' } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'クエリパラメータが必要です' },
        { status: 400 }
      );
    }

    console.log(`🔍 Brave Search API開始 - クエリ: "${query}"`);

    // Brave Search API キーの確認
    const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
    if (!BRAVE_API_KEY) {
      return NextResponse.json({
        error: 'BRAVE_API_KEY が設定されていません',
        setup_instructions: 'https://api.search.brave.com/register でAPIキーを取得してください',
        environment_variable: 'BRAVE_API_KEY=your_api_key_here',
        query,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    try {
      // 1. 実際のBrave Search APIを使用してニュースを取得
      console.log(`📡 Brave Search API呼び出し中...`);
      
      // 🔧 Brave Search API 無料プラン対応のパラメータ
      // freshness, country, search_lang は有料プランのみ対応の可能性
      const searchResponse = await fetch(
        `https://api.search.brave.com/res/v1/web/search?${new URLSearchParams({
          q: query,
          count: '10',
        })}`,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': BRAVE_API_KEY,
          },
        }
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error(`Brave Search API エラー: ${searchResponse.status} - ${errorText}`);
        
        return NextResponse.json({
          error: `Brave Search API エラー: ${searchResponse.status}`,
          details: errorText,
          setup_instructions: 'APIキーが正しく設定されているか確認してください',
          query,
          timestamp: new Date().toISOString()
        }, { status: searchResponse.status });
      }

      const braveData = await searchResponse.json();
      const allResults = braveData.web?.results || [];

      console.log(`📊 Brave Search API結果: ${allResults.length}件`);

      // 📅 age情報を使用して24時間以内のニュースのみフィルタリング
      const braveResults = allResults.filter((item: any) => {
        if (item.age) {
          const ageMatch = item.age.match(/(\d+)\s*(minute|hour|day)/i);
          if (ageMatch) {
            const value = parseInt(ageMatch[1]);
            const unit = ageMatch[2].toLowerCase();
            
            let hoursAgo = 0;
            if (unit === 'minute') hoursAgo = value / 60;
            else if (unit === 'hour') hoursAgo = value;
            else if (unit === 'day') hoursAgo = value * 24;
            
            const isWithin24Hours = hoursAgo <= 24;
            console.log(`  📅 ${item.title?.substring(0, 50)}... → ${item.age} (${hoursAgo.toFixed(1)}時間前) ${isWithin24Hours ? '✅' : '❌'}`);
            
            return isWithin24Hours;
          }
        }
        return true; // age情報がない場合は含める
      });

      console.log(`📊 24時間以内のニュース: ${braveResults.length}件 / ${allResults.length}件中`);

      // 2. Brave Search結果をニュースアイテム形式に変換
      const newsItems = braveResults.map((item: any, index: number) => {
        const newsItem = {
          id: `brave_${Date.now()}_${index}`,
          title: item.title || '',
          url: item.url || '',
          description: item.description || '',
          published: item.age || new Date().toISOString(),
          source: item.profile?.name || extractDomain(item.url),
          relevance: calculateRelevance(item, query, index)
        };
        
        console.log(`📰 ニュース${index + 1}: ${newsItem.title}`);
        return newsItem;
      });

      // 3. 各ニュースアイテムをベクトル化してtrend_vectorsテーブルに保存
      const vectorizedNews = [];
      const embeddings = new OpenAIEmbeddings();
      
      for (const newsItem of newsItems) {
        try {
          // ベクトル化用のコンテンツを作成
          const contentForVectorization = `
タイトル: ${newsItem.title}
内容: ${newsItem.description}
ソース: ${newsItem.source}
URL: ${newsItem.url}
          `.trim();

          console.log(`🔄 ベクトル化中: ${newsItem.title.substring(0, 50)}...`);

          // OpenAI Embeddingsでベクトル化
          const embedding = await embeddings.embedSingle(contentForVectorization);

          // 実際のニュース配信日を計算
          const publishedDate = parseNewsDate(newsItem.published);
          const trendDate = publishedDate ? publishedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          
          console.log(`📅 ニュース配信日: ${newsItem.published} → ${trendDate}`);

          // trend_vectorsテーブルに保存（既存の構造に合わせて）
          const { data: savedVector, error: saveError } = await supabase
            .from('trend_vectors')
            .insert([
              {
                content_id: newsItem.id,
                content_type: 'news',
                content: contentForVectorization,
                embedding: JSON.stringify(embedding),
                trend_topic: newsItem.title,
                source: newsItem.source,
                source_url: newsItem.url,
                relevance_score: newsItem.relevance,
                trend_date: trendDate,
                popularity_score: 0.8,
                keywords: extractKeywords(newsItem.title, newsItem.description),
                metadata: {
                  published: newsItem.published,
                  actual_published_date: trendDate,
                  query: query,
                  retrieved_at: new Date().toISOString(),
                  api_source: 'brave_search_api'
                }
              }
            ])
            .select()
            .single();

          if (saveError) {
            console.error('ベクトル保存エラー:', saveError);
            continue;
          }

          vectorizedNews.push({
            ...newsItem,
            vectorId: savedVector.id,
            vectorized: true
          });

          console.log(`✅ ベクトル化完了: ID ${savedVector.id}`);

        } catch (error) {
          console.error(`❌ ベクトル化エラー (${newsItem.title}):`, error);
          vectorizedNews.push({
            ...newsItem,
            vectorized: false,
            error: (error as Error).message
          });
        }
      }

      console.log(`🎉 処理完了: ${vectorizedNews.length}件のニュースを処理`);
      console.log(`📊 ベクトル化成功: ${vectorizedNews.filter(n => n.vectorized).length}件`);

      return NextResponse.json({
        results: vectorizedNews,
        total: vectorizedNews.length,
        vectorized: vectorizedNews.filter(n => n.vectorized).length,
        query,
        api_source: 'Brave Search API',
        timestamp: new Date().toISOString()
      });

    } catch (apiError) {
      console.error('Brave Search API 呼び出しエラー:', apiError);
      
      return NextResponse.json({
        error: 'Brave Search API呼び出しでエラーが発生しました',
        details: (apiError as Error).message,
        setup_instructions: 'BRAVE_API_KEY環境変数が正しく設定されているか確認してください',
        query,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    console.error('ニュース取得・ベクトル化エラー:', error);
    return NextResponse.json(
      { error: 'ニュース取得・ベクトル化でエラーが発生しました: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// ドメインを抽出する関数
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}

// 関連度を計算する関数
function calculateRelevance(item: any, query: string, index: number): number {
  let relevance = 0.8 - (index * 0.03); // より緩やかな減衰
  
  const title = (item.title || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  const queryTerms = query.toLowerCase().split(' ');
  
  // すべての検索語が含まれているかチェック
  const allTermsInTitle = queryTerms.every(term => title.includes(term));
  const allTermsInDesc = queryTerms.every(term => description.includes(term));
  
  // フレーズ完全一致のボーナス（最も高いスコア）
  if (title.includes(query.toLowerCase())) relevance += 0.2;
  if (description.includes(query.toLowerCase())) relevance += 0.15;
  
  // すべての検索語を含む場合のボーナス
  if (allTermsInTitle) relevance += 0.15;
  if (allTermsInDesc) relevance += 0.1;
  
  // 個別の検索語の出現頻度によるボーナス
  const termFrequencyBonus = queryTerms.reduce((bonus, term) => {
    const titleCount = (title.match(new RegExp(term, 'g')) || []).length;
    const descCount = (description.match(new RegExp(term, 'g')) || []).length;
    return bonus + (titleCount * 0.02) + (descCount * 0.01);
  }, 0);
  
  relevance += Math.min(termFrequencyBonus, 0.1); // 最大0.1までのボーナス
  
  // 記事の新しさによるボーナス
  if (item.age && item.age.includes('minute')) relevance += 0.1;
  else if (item.age && item.age.includes('hour')) relevance += 0.05;
  
  return Math.min(relevance, 1.0);
}

// ニュース配信日をパースする関数
function parseNewsDate(published: string): Date | null {
  try {
    // 既に絶対的な日付の場合
    if (published.includes('T') || published.includes('-')) {
      const date = new Date(published);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // 相対的な時間表記をパース（「1 day ago」「2 hours ago」など）
    const now = new Date();
    const lowerPublished = published.toLowerCase();

    if (lowerPublished.includes('minute')) {
      const minutes = parseInt(lowerPublished.match(/(\d+)\s*minute/)?.[1] || '0');
      return new Date(now.getTime() - minutes * 60 * 1000);
    }
    
    if (lowerPublished.includes('hour')) {
      const hours = parseInt(lowerPublished.match(/(\d+)\s*hour/)?.[1] || '0');
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }
    
    if (lowerPublished.includes('day')) {
      const days = parseInt(lowerPublished.match(/(\d+)\s*day/)?.[1] || '0');
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }
    
    if (lowerPublished.includes('week')) {
      const weeks = parseInt(lowerPublished.match(/(\d+)\s*week/)?.[1] || '0');
      return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
    }

    if (lowerPublished.includes('month')) {
      const months = parseInt(lowerPublished.match(/(\d+)\s*month/)?.[1] || '0');
      return new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000);
    }

    // パースできない場合は今日の日付を返す
    return now;
  } catch (error) {
    console.error(`日付パースエラー: ${published}`, error);
    return new Date(); // フォールバック
  }
}

// キーワード抽出関数
function extractKeywords(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const commonWords = ['の', 'は', 'が', 'を', 'に', 'で', 'と', 'から', 'より', 'まで', 'について', 'による', 'において'];
  
  const words = text
    .split(/[\s,、。！？（）【】\[\]{}「」『』\u3000]+/)
    .filter(word => word.length > 1 && !commonWords.includes(word))
    .slice(0, 10); // 最大10個のキーワード
    
  return words;
} 