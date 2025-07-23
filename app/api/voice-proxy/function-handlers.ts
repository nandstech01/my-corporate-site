// OpenAI Realtime APIの関数実行ハンドラー

interface FunctionCallArgs {
  query: string;
  category?: string;
}

// ブログ記事生成の実行
export async function executeBlogGeneration(args: FunctionCallArgs) {
  try {
    console.log('📝 ブログ記事生成開始:', args);
    
    // RAG検索の実行
    const ragResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search-rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: args.query,
        rag_types: ['company', 'trend'],
        date_filter: 'all'
      })
    });

    if (!ragResponse.ok) {
      throw new Error(`RAG検索エラー: ${ragResponse.statusText}`);
    }

    const ragData = await ragResponse.json();
    console.log('📊 RAG検索完了:', ragData.results?.length || 0, '件取得');

    // ブログ記事生成の実行
    const blogResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-rag-blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: args.query,
        ragData: ragData.results || [],
        targetLength: 6000,
        businessCategory: 'corporate',
        categorySlug: args.category || 'ai-tools',
        includeImages: false
      })
    });

    if (!blogResponse.ok) {
      throw new Error(`ブログ記事生成エラー: ${blogResponse.statusText}`);
    }

    const blogResult = await blogResponse.json();
    console.log('✅ ブログ記事生成完了:', blogResult.title);

    return {
      success: true,
      title: blogResult.title,
      wordCount: blogResult.wordCount,
      postId: blogResult.postId,
      slug: blogResult.slug,
      message: `「${blogResult.title}」を生成し、保存完了しました！（${blogResult.wordCount}文字）`
    };

  } catch (error) {
    console.error('❌ ブログ記事生成エラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '申し訳ありません。ブログ記事の生成中にエラーが発生しました。'
    };
  }
}

// トレンド検索の実行
export async function searchTrends(args: { query: string }) {
  try {
    console.log('🔍 トレンド検索開始:', args);
    
    const ragResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search-rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: args.query,
        rag_types: ['trend'],
        date_filter: 'latest',
        latest_news_mode: true
      })
    });

    if (!ragResponse.ok) {
      throw new Error(`トレンド検索エラー: ${ragResponse.statusText}`);
    }

    const ragData = await ragResponse.json();
    const trends = ragData.results || [];
    
    console.log('📈 トレンド検索完了:', trends.length, '件取得');

    // 結果を要約
    const trendSummary = trends.slice(0, 5).map((trend: any, index: number) => {
      const metadata = trend.metadata || {};
      return `${index + 1}. ${metadata.title || '記事タイトル'}: ${trend.content?.substring(0, 100) || '内容'}...`;
    }).join('\n');

    return {
      success: true,
      count: trends.length,
      trends: trends.slice(0, 5),
      summary: trendSummary,
      message: `最新トレンドを${trends.length}件取得しました。主なトピック:\n${trendSummary}`
    };

  } catch (error) {
    console.error('❌ トレンド検索エラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '申し訳ありません。トレンド検索中にエラーが発生しました。'
    };
  }
}

// 関数呼び出しのルーター
export async function handleFunctionCall(functionName: string, args: any) {
  console.log('🔧 関数実行:', functionName, args);
  
  switch (functionName) {
    case 'execute_blog_generation':
      return await executeBlogGeneration(args);
      
    case 'search_trends':
      return await searchTrends(args);
      
    default:
      console.warn('⚠️ 未知の関数:', functionName);
      return {
        success: false,
        error: `Unknown function: ${functionName}`,
        message: '申し訳ありません。その機能は対応していません。'
      };
  }
} 