import { NextRequest, NextResponse } from 'next/server';

/**
 * 🆕 バッチニュース取得API
 * 
 * blog-trend-queries.ts、script-trend-queries.ts、または architect-trend-queries.ts から
 * ランダムにクエリを選択し、Brave Search APIで複数のニュースを取得
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      count = 10, 
      useBlogQueries = true,
      useArchitectQueries = false, // 🆕 AIアーキテクトモード
      articleType = 'general',     // 🆕 記事タイプ（career/technical/freelance/general）
      freshnessFilter = '24h'      // 🆕 鮮度フィルタ（24h/7days/30days）
    } = await request.json();

    // モード判定
    let modeLabel = useBlogQueries ? '教育モード' : '台本用';
    if (useArchitectQueries) {
      modeLabel = `AIアーキテクトモード（${articleType}）`;
    }

    console.log(`🔍 バッチニュース取得開始: ${count}件 (${modeLabel})`);
    console.log(`📅 鮮度フィルタ: ${freshnessFilter}`);

    // クエリファイルから取得（レート制限を考慮して少なめに）
    // Brave Search API無料プラン: 1リクエスト/秒
    const queryCount = Math.min(Math.ceil(count / 5), 2); // 最大2クエリまで（レート制限対策）
    
    let queries: string[];
    
    if (useArchitectQueries) {
      // 🆕 AIアーキテクトモード: architect-trend-queries.ts を使用
      const { getArchitectQueriesByArticleType } = await import('@/lib/intelligent-rag/architect-trend-queries');
      queries = getArchitectQueriesByArticleType(articleType as 'career' | 'technical' | 'freelance' | 'general', queryCount);
      console.log(`🏗️ AIアーキテクト用クエリを使用（${articleType}タイプ）`);
    } else if (useBlogQueries) {
      // 教育モード: blog-trend-queries.ts を使用
      queries = (await import('@/lib/intelligent-rag/blog-trend-queries')).getRandomBlogTrendQueries(queryCount);
      console.log(`📚 教育モード用クエリを使用`);
    } else {
      // 台本用: script-trend-queries.ts を使用
      queries = (await import('@/lib/intelligent-rag/script-trend-queries')).getAllScriptTrendQueries().slice(0, queryCount);
      console.log(`🎬 台本用クエリを使用`);
    }
    
    console.log(`⚠️ レート制限対策: ${queries.length}クエリを順次実行（待機時間あり）`);

    console.log(`📝 選択されたクエリ（${queries.length}個）:`, queries.map((q, i) => `${i + 1}. ${q}`).join('\n  '));

    const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
    if (!BRAVE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'BRAVE_API_KEY が設定されていません',
      }, { status: 500 });
    }

    const allNews: any[] = [];

    // 各クエリでBrave Search APIを呼び出し
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      
      try {
        console.log(`\n🔍 Brave Search API呼び出し [${i + 1}/${queries.length}]: "${query}"`);

        // ⏳ レート制限対策: 2つ目以降のクエリは2秒待機（Brave無料プラン: 1req/秒）
        if (i > 0) {
          console.log('  ⏳ レート制限対策: 2秒待機中...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 🔧 Brave Search API 無料プラン対応のパラメータ
        // freshness, country, search_lang は有料プランのみ対応の可能性
        const searchParams = new URLSearchParams({
          q: query,
          count: '5', // 各クエリで5件取得
        });

        console.log(`  📡 リクエストURL: https://api.search.brave.com/res/v1/web/search?${searchParams}`);

        const searchResponse = await fetch(
          `https://api.search.brave.com/res/v1/web/search?${searchParams}`,
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
          console.warn(`⚠️ Brave Search API エラー (${query}): ${searchResponse.status}`);
          console.warn(`  エラー詳細: ${errorText.substring(0, 200)}`);
          
          // 429エラー（レート制限）の場合は、次のクエリに進む前に長めに待機
          if (searchResponse.status === 429) {
            console.warn('  ⏳ レート制限エラー: 5秒待機...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          
          // 422エラー（パラメータエラー）の場合は、クエリをスキップ
          if (searchResponse.status === 422) {
            console.warn('  ⚠️ パラメータエラー: このクエリをスキップ');
          }
          
          continue;
        }

        const braveData = await searchResponse.json();
        const allResults = braveData.web?.results || [];
        
        // 📅 鮮度フィルタに応じた時間制限を設定
        let maxHours = 24; // デフォルト: 24時間
        if (freshnessFilter === '7days') {
          maxHours = 24 * 7; // 1週間
        } else if (freshnessFilter === '30days') {
          maxHours = 24 * 30; // 30日
        }
        
        // 📅 age情報を使用してフィルタリング
        const braveResults = allResults.filter((item: any) => {
          if (item.age) {
            const ageMatch = item.age.match(/(\d+)\s*(minute|hour|day|week|month)/i);
            if (ageMatch) {
              const value = parseInt(ageMatch[1]);
              const unit = ageMatch[2].toLowerCase();
              
              let hoursAgo = 0;
              if (unit === 'minute') hoursAgo = value / 60;
              else if (unit === 'hour') hoursAgo = value;
              else if (unit === 'day') hoursAgo = value * 24;
              else if (unit === 'week') hoursAgo = value * 24 * 7;
              else if (unit === 'month') hoursAgo = value * 24 * 30;
              
              return hoursAgo <= maxHours;
            }
          }
          return true; // age情報がない場合は含める
        }).slice(0, 3); // 最大3件

        const freshnessLabel = freshnessFilter === '7days' ? '1週間以内' : freshnessFilter === '30days' ? '30日以内' : '24時間以内';
        console.log(`  ✅ ニュース取得成功（${freshnessLabel}）: ${braveResults.length}件 / ${allResults.length}件中`);

        // ニュースアイテムを変換
        for (const item of braveResults) {
          try {
            const newsItem = {
              title: item.title || 'No title',
              content: item.description || '',
              url: item.url || '',
              category: useBlogQueries ? 'tech' : 'general',
              source: item.profile?.name || new URL(item.url).hostname.replace('www.', ''),
              query: query
            };

            allNews.push(newsItem);
            console.log(`    📰 ${newsItem.title}`);
          } catch (itemError) {
            console.warn(`    ⚠️ ニュースアイテム処理エラー:`, itemError);
          }
        }

        // 目標件数に達したら終了
        if (allNews.length >= count) {
          break;
        }
      } catch (queryError) {
        console.warn(`⚠️ クエリ処理エラー (${query}):`, queryError);
      }
    }

    console.log(`\n✅ バッチニュース取得完了: ${allNews.length}件`);

    if (allNews.length === 0) {
      console.warn('⚠️ 警告: ニュースが1件も取得できませんでした');
      console.warn('  原因: レート制限、パラメータエラー、または24時間以内のニュースがない可能性があります');
      console.warn('  対策: 手動検索モードを使用するか、時間を置いて再試行してください');
    }

    return NextResponse.json({
      success: true,
      news: allNews.slice(0, count), // 目標件数まで切り取り
      total: allNews.length,
      queries_used: queries.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ バッチニュース取得エラー:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'バッチニュース取得でエラーが発生しました: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

