import { NextRequest, NextResponse } from 'next/server';

interface YoutubeVideoInfo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  videoUrl: string;
  channelUrl: string;
  tags: string[];
  relevance?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { query, maxResults = 10 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'queryパラメータが必要です' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'YouTube Data API v3のAPIキーが設定されていません',
          setup_instructions: 'YOUTUBE_API_KEY環境変数を.env.localに設定してください。Google Cloud ConsoleでYouTube Data API v3を有効にしてAPIキーを取得してください。'
        },
        { status: 500 }
      );
    }

    console.log(`🔍 YouTube Data API検索開始 - クエリ: "${query}"`);

    // YouTube Data API v3 - Search: list endpoint
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      order: 'relevance',
      key: apiKey
    })}`;

    console.log(`📡 YouTube Data API呼び出し中...`);
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('❌ YouTube Data API検索エラー:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        data: searchData,
        url: searchUrl
      });
      return NextResponse.json(
        { 
          error: `YouTube Data API検索エラー: ${searchData.error?.message || 'Unknown error'}`,
          details: searchData,
          status: searchResponse.status
        },
        { status: 500 }
      );
    }

    if (!searchData.items || searchData.items.length === 0) {
      console.log('📭 検索結果が見つかりませんでした');
      return NextResponse.json({
        results: [],
        total: 0,
        api_source: 'YouTube Data API v3'
      });
    }

    console.log(`📊 YouTube Data API検索結果: ${searchData.items.length}件`);

    // 動画IDsを取得
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // Videos APIで詳細情報を取得
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
    
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    if (!videosResponse.ok) {
      console.error('❌ YouTube Videos API エラー:', {
        status: videosResponse.status,
        statusText: videosResponse.statusText,
        data: videosData,
        url: videosUrl
      });
      return NextResponse.json(
        { 
          error: `YouTube Videos API エラー: ${videosData.error?.message || 'Unknown error'}`,
          details: videosData,
          status: videosResponse.status
        },
        { status: 500 }
      );
    }

    // 結果を整形
    const videoResults: YoutubeVideoInfo[] = videosData.items.map((video: any, index: number) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount || '0',
      likeCount: video.statistics.likeCount || '0',
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`,
      tags: video.snippet.tags || [],
      relevance: calculateRelevance(video, query, index)
    }));

    console.log(`✅ YouTube動画情報取得完了: ${videoResults.length}件`);

    // 推奨チャンネルのボーナススコア
    const recommendedChannels = [
      'Two Minute Papers',
      'Yannic Kilcher', 
      'AI Explained',
      '3Blue1Brown',
      'Google AI',
      'OpenAI',
      'Microsoft Research',
      'DeepMind',
      'Lex Fridman',
      'Machine Learning Street Talk',
      'Andrej Karpathy',
      'Jeremy Howard',
      'StatQuest with Josh Starmer'
    ];

    // チャンネルボーナスを適用
    videoResults.forEach(video => {
      const isRecommended = recommendedChannels.some(channel => 
        video.channelTitle.toLowerCase().includes(channel.toLowerCase())
      );
      if (isRecommended) {
        video.relevance = Math.min((video.relevance || 0) + 0.2, 1.0);
      }
    });

    // 関連度でソート
    videoResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    console.log(`🎯 YouTube検索完了: ${videoResults.length}件の動画を取得`);

    return NextResponse.json({
      results: videoResults,
      total: videoResults.length,
      api_source: 'YouTube Data API v3',
      query: query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ YouTube検索エラー:', error);
    return NextResponse.json(
      { error: `YouTube検索でエラーが発生しました: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// 関連度計算関数
function calculateRelevance(video: any, query: string, index: number): number {
  let relevance = 0.8 - (index * 0.03); // より緩やかな減衰
  
  const title = (video.snippet.title || '').toLowerCase();
  const description = (video.snippet.description || '').toLowerCase();
  const channelTitle = (video.snippet.channelTitle || '').toLowerCase();
  const queryTerms = query.toLowerCase().split(' ');
  const tags = (video.snippet.tags || []).map((tag: string) => tag.toLowerCase());
  
  // フレーズ完全一致のボーナス（最も高いスコア）
  if (title.includes(query.toLowerCase())) relevance += 0.2;
  if (description.includes(query.toLowerCase())) relevance += 0.15;
  
  // すべての検索語が含まれているかチェック
  const allTermsInTitle = queryTerms.every(term => title.includes(term));
  const allTermsInDesc = queryTerms.every(term => description.includes(term));
  const allTermsInTags = queryTerms.every(term => 
    tags.some((tag: string) => tag.includes(term))
  );
  
  if (allTermsInTitle) relevance += 0.15;
  if (allTermsInDesc) relevance += 0.1;
  if (allTermsInTags) relevance += 0.1;
  
  // 個別の検索語の出現頻度によるボーナス
  const termFrequencyBonus = queryTerms.reduce((bonus, term) => {
    const titleCount = (title.match(new RegExp(term, 'g')) || []).length;
    const descCount = (description.match(new RegExp(term, 'g')) || []).length;
    const tagCount = tags.filter((tag: string) => tag.includes(term)).length;
    return bonus + (titleCount * 0.02) + (descCount * 0.01) + (tagCount * 0.01);
  }, 0);
  
  relevance += Math.min(termFrequencyBonus, 0.1);
  
  // 動画の品質スコア
  const viewCount = parseInt(video.statistics.viewCount || '0');
  const likeCount = parseInt(video.statistics.likeCount || '0');
  const duration = parseDuration(video.contentDetails.duration);
  
  // 高評価率によるボーナス（5%以上の高評価率で最大0.1のボーナス）
  if (viewCount > 0) {
    const likeRatio = (likeCount / viewCount) * 100;
    relevance += Math.min(likeRatio / 50, 0.1);
  }
  
  // 適度な動画長によるボーナス（5-30分の動画を優遇）
  const durationMinutes = duration / 60;
  if (durationMinutes >= 5 && durationMinutes <= 30) {
    relevance += 0.05;
  }
  
  // 新しい動画によるボーナス
  const publishedDate = new Date(video.snippet.publishedAt);
  const now = new Date();
  const monthsOld = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsOld <= 1) relevance += 0.1;
  else if (monthsOld <= 3) relevance += 0.05;
  
  // 教育的コンテンツの重み付けを強化
  const educationalKeywords = [
    'tutorial', 'explained', 'guide', 'how to', 'learn', 'course', 'lecture',
    'チュートリアル', '解説', 'ガイド', '講座', '入門', '学習', 'レクチャー'
  ];
  const hasEducationalKeyword = educationalKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword) || 
    tags.some((tag: string) => tag.includes(keyword))
  );
  if (hasEducationalKeyword) {
    relevance += 0.15;
  }
  
  // AI/技術関連キーワードの重み付けを強化
  const techKeywords = [
    'ai', 'machine learning', 'deep learning', 'neural network', 'algorithm', 'programming',
    '人工知能', '機械学習', 'ディープラーニング', 'ニューラルネットワーク', 'アルゴリズム', 'プログラミング'
  ];
  const hasTechKeyword = techKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword) || 
    tags.some((tag: string) => tag.includes(keyword))
  );
  if (hasTechKeyword) {
    relevance += 0.1;
  }
  
  return Math.min(relevance, 1.0);
}

// YouTube動画の時間をパース
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]?.replace('H', '') || '0');
  const minutes = parseInt(match[2]?.replace('M', '') || '0');
  const seconds = parseInt(match[3]?.replace('S', '') || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
} 