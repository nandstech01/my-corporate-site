import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface YouTubeTrendKeyword {
  keyword: string;
  score: number;
  viewCount: number;
  likeCount: number;
  videoCount: number;
  videos: {
    title: string;
    url: string;
    viewCount: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 YouTubeトレンド分析API開始');

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY is not set');
    }

    // 1. YouTube Data API v3でAI関連動画を検索（24時間以内）
    console.log('📺 YouTube検索中（過去24時間）...');
    
    const searchQueries = [
      'ChatGPT',
      'AI',
      'Claude',
      'Gemini',
      'GPT-4',
      'LLM',
      '機械学習',
      '生成AI',
      'AIエージェント'
    ];

    const allVideos: any[] = [];

    for (const query of searchQueries.slice(0, 3)) { // コスト削減のため3クエリに制限
      // ⚠️ トレンドRAGは24時間以内（使い捨て型）
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1); // 24時間前
      const publishedAfter = oneDayAgo.toISOString();

      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.append('key', YOUTUBE_API_KEY);
      searchUrl.searchParams.append('q', query);
      searchUrl.searchParams.append('type', 'video');
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('maxResults', '10');
      searchUrl.searchParams.append('order', 'viewCount');
      searchUrl.searchParams.append('publishedAfter', publishedAfter);
      searchUrl.searchParams.append('relevanceLanguage', 'ja');
      searchUrl.searchParams.append('regionCode', 'JP');

      const searchResponse = await fetch(searchUrl.toString());
      if (!searchResponse.ok) {
        console.error('YouTube Search API error:', await searchResponse.text());
        continue;
      }

      const searchData = await searchResponse.json();
      const videoIds = searchData.items?.map((item: any) => item.id.videoId).filter(Boolean) || [];

      if (videoIds.length === 0) continue;

      // 詳細情報を取得（統計情報含む）
      const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      videoUrl.searchParams.append('key', YOUTUBE_API_KEY);
      videoUrl.searchParams.append('id', videoIds.join(','));
      videoUrl.searchParams.append('part', 'snippet,statistics');

      const videoResponse = await fetch(videoUrl.toString());
      if (!videoResponse.ok) {
        console.error('YouTube Video API error:', await videoResponse.text());
        continue;
      }

      const videoData = await videoResponse.json();
      allVideos.push(...(videoData.items || []));

      console.log(`  ✅ "${query}": ${videoIds.length}件取得`);
    }

    if (allVideos.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'YouTube動画が取得できませんでした',
        keywords: []
      });
    }

    console.log(`📊 合計 ${allVideos.length}件の動画を取得`);

    // 2. OpenAI APIでキーワード抽出
    console.log('🧠 OpenAI APIでキーワード抽出中...');

    const videoTexts = allVideos.map(video => ({
      title: video.snippet.title,
      description: video.snippet.description?.substring(0, 200) || '',
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0')
    }));

    const extractionPrompt = `
あなたはAI技術のトレンド分析専門家です。

以下のYouTube動画情報から、AI関連のトレンドキーワードを抽出してください。

【動画情報】
${videoTexts.map((v, i) => `${i + 1}. ${v.title}\n   説明: ${v.description}\n   再生回数: ${v.viewCount.toLocaleString()}`).join('\n\n')}

【抽出ルール】
1. AI・機械学習・生成AI・LLM関連のキーワードのみ
2. 具体的な技術名・製品名・手法名を優先（例: ChatGPT, RAG, プロンプトエンジニアリング）
3. 一般的すぎるワード（例: "便利", "使い方"）は除外
4. 検索クエリとして最適な形式（2-4単語、日本語推奨）
5. 重複を排除し、最もトレンド性の高いものを選定

【出力形式】
JSON配列で返してください（他のテキストは一切含めない）：
["キーワード1", "キーワード2", "キーワード3", ...]

最大10個まで。トレンド性の高い順に並べてください。
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたはAI技術のトレンド分析専門家です。指示に従ってJSON形式のみで返答してください。'
        },
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content?.trim() || '[]';
    console.log('🤖 OpenAI応答:', responseText);

    let extractedKeywords: string[] = [];
    try {
      extractedKeywords = JSON.parse(responseText);
    } catch (parseError) {
      // JSONパース失敗時のフォールバック
      console.error('JSON parse error:', parseError);
      const matches = responseText.match(/"([^"]+)"/g);
      if (matches) {
        extractedKeywords = matches.map(m => m.replace(/"/g, ''));
      }
    }

    console.log(`✅ ${extractedKeywords.length}個のキーワードを抽出`);

    // 3. 各キーワードのスコアリング（動画との関連性で）
    const keywordScores: Map<string, YouTubeTrendKeyword> = new Map();

    for (const keyword of extractedKeywords) {
      const relatedVideos = allVideos.filter(video => {
        const title = video.snippet.title.toLowerCase();
        const desc = video.snippet.description?.toLowerCase() || '';
        const kw = keyword.toLowerCase();
        return title.includes(kw) || desc.includes(kw);
      });

      if (relatedVideos.length === 0) continue;

      const totalViewCount = relatedVideos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || '0'), 0);
      const totalLikeCount = relatedVideos.reduce((sum, v) => sum + parseInt(v.statistics.likeCount || '0'), 0);
      
      // スコア計算（再生回数 + いいね数 × 10 + 動画数 × 10000）
      const score = totalViewCount + (totalLikeCount * 10) + (relatedVideos.length * 10000);

      keywordScores.set(keyword, {
        keyword,
        score,
        viewCount: totalViewCount,
        likeCount: totalLikeCount,
        videoCount: relatedVideos.length,
        videos: relatedVideos.slice(0, 3).map(v => ({
          title: v.snippet.title,
          url: `https://www.youtube.com/watch?v=${v.id}`,
          viewCount: parseInt(v.statistics.viewCount || '0')
        }))
      });
    }

    // 4. スコア順にソート
    const sortedKeywords = Array.from(keywordScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    console.log('🏆 トップ10キーワード:');
    sortedKeywords.forEach((kw, i) => {
      console.log(`  ${i + 1}. ${kw.keyword} (スコア: ${kw.score.toLocaleString()}, 動画数: ${kw.videoCount})`);
    });

    return NextResponse.json({
      success: true,
      keywords: sortedKeywords,
      totalVideosAnalyzed: allVideos.length,
      analysisDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ YouTubeトレンド分析エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        keywords: []
      },
      { status: 500 }
    );
  }
}

