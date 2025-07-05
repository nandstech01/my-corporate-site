import { NextRequest, NextResponse } from 'next/server';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const { videoInfo, query } = await request.json();

    if (!videoInfo || !query) {
      return NextResponse.json(
        { error: 'videoInfoとqueryパラメータが必要です' },
        { status: 400 }
      );
    }

    console.log(`🔄 YouTube動画ベクトル化開始: ${videoInfo.title}`);

    // YouTube動画の字幕取得を試行（利用可能な場合）
    let transcriptText = '';
    
    // 字幕取得を一時的に無効化（デバッグ用）
    console.log('📝 字幕取得をスキップ（デバッグ用）');

    // ベクトル化用のコンテンツを作成（説明文とタイトルから）
    const contentForVectorization = `
タイトル: ${videoInfo.title}
チャンネル: ${videoInfo.channelTitle}
説明: ${videoInfo.description}
再生時間: ${videoInfo.duration}
視聴回数: ${videoInfo.viewCount}
いいね数: ${videoInfo.likeCount}
公開日: ${videoInfo.publishedAt}
タグ: ${videoInfo.tags.join(', ')}
動画URL: ${videoInfo.videoUrl}
チャンネルURL: ${videoInfo.channelUrl}
    `.trim();

    console.log(`📝 ベクトル化対象コンテンツ: ${contentForVectorization.substring(0, 150)}...`);

    // 教育的スコアを計算
    console.log('📊 スコア計算開始...');
    const educationalScore = calculateEducationalScore(videoInfo);
    const complexityLevel = calculateComplexityLevel(videoInfo);
    const implementationScore = calculateImplementationScore(videoInfo);

    console.log(`📊 スコア計算完了: 教育=${educationalScore}, 複雑度=${complexityLevel}, 実装=${implementationScore}`);

    // OpenAI Embeddingsでベクトル化
    console.log('🔢 OpenAI Embeddings開始...');
    const embeddings = new OpenAIEmbeddings();
    
    // ベクトル化（タイムアウト30秒）
    const embedding = await embeddings.embedSingle(contentForVectorization);
    console.log(`🔢 ベクトル化完了: 次元=${embedding.length}`);

    // 動画の時間を秒に変換
    const durationSeconds = parseDuration(videoInfo.duration);

    // youtube_vectorsテーブルに保存
    console.log('💾 データベース保存開始...');
    const { data: savedVector, error: saveError } = await supabaseServiceRole
      .from('youtube_vectors')
      .insert([
        {
          content_id: videoInfo.id,
          content_type: 'youtube_video',
          video_title: videoInfo.title,
          channel_name: videoInfo.channelTitle,
          video_url: videoInfo.videoUrl,
          content: contentForVectorization,
          embedding: embedding,
          source: 'youtube',
          source_url: videoInfo.videoUrl,
          relevance_score: videoInfo.relevance || 0,
          educational_score: educationalScore,
          complexity_level: complexityLevel,
          implementation_score: implementationScore,
          video_duration_seconds: durationSeconds,
          view_count: parseInt(videoInfo.viewCount) || 0,
          like_count: parseInt(videoInfo.likeCount) || 0,
          published_at: videoInfo.publishedAt,
          transcript_language: 'en', // デフォルト値
          keywords: extractKeywords(videoInfo.title, videoInfo.description, videoInfo.tags),
          metadata: {
            title: videoInfo.title,
            channel_title: videoInfo.channelTitle,
            description: videoInfo.description,
            duration: videoInfo.duration,
            duration_seconds: durationSeconds,
            view_count: videoInfo.viewCount,
            like_count: videoInfo.likeCount,
            thumbnail_url: videoInfo.thumbnailUrl,
            tags: videoInfo.tags,
            relevance: videoInfo.relevance || 0,
            educational_score: educationalScore,
            complexity_level: complexityLevel,
            implementation_score: implementationScore,
            query: query,
            retrieved_at: new Date().toISOString(),
            has_transcript: transcriptText.length > 0
          }
        }
      ])
      .select()
      .single();

    if (saveError) {
      console.error('❌ YouTube動画ベクトル保存エラー:', saveError);
      return NextResponse.json(
        { error: 'YouTube動画ベクトル保存でエラーが発生しました: ' + saveError.message },
        { status: 500 }
      );
    }

    console.log(`✅ YouTube動画ベクトル化完了: ID ${savedVector.id}`);

    return NextResponse.json({
      success: true,
      vectorId: savedVector.id,
      videoInfo: videoInfo,
      contentLength: contentForVectorization.length,
      embeddingDimensions: embedding.length,
      durationSeconds: durationSeconds,
      scores: {
        educational: educationalScore,
        complexity: complexityLevel,
        implementation: implementationScore
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ YouTube動画ベクトル化エラー:', error);
    return NextResponse.json(
      { error: 'YouTube動画ベクトル化でエラーが発生しました: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// 教育的スコア計算
function calculateEducationalScore(video: YoutubeVideoInfo): number {
  let score = 0.5; // 基本スコア
  
  const title = video.title.toLowerCase();
  const description = video.description.toLowerCase();
  const channelTitle = video.channelTitle.toLowerCase();
  
  // 教育的キーワードのチェック
  const educationalKeywords = [
    'tutorial', 'explained', 'guide', 'how to', 'learn', 'course', 'lecture',
    'introduction', 'basics', 'fundamentals', 'step by step', 'beginner',
    '教程', '解説', 'ガイド', '入門', '基礎', '学習'
  ];
  
  educationalKeywords.forEach(keyword => {
    if (title.includes(keyword)) score += 0.1;
    if (description.includes(keyword)) score += 0.05;
  });
  
  // 推奨チャンネルのボーナス
  const educationalChannels = [
    '3blue1brown', 'khan academy', 'crash course', 'ted', 'mit',
    'stanford', 'berkeley', 'statquest', 'two minute papers'
  ];
  
  educationalChannels.forEach(channel => {
    if (channelTitle.includes(channel)) score += 0.2;
  });
  
  return Math.min(score, 1.0);
}

// 複雑度レベル計算
function calculateComplexityLevel(video: YoutubeVideoInfo): number {
  let level = 1; // 基本レベル
  
  const title = video.title.toLowerCase();
  const description = video.description.toLowerCase();
  
  // 初心者向けキーワード
  const beginnerKeywords = ['beginner', 'introduction', 'basics', 'getting started', '入門', '基礎'];
  const intermediateKeywords = ['intermediate', 'advanced', 'deep dive', 'implementation', '実装', '応用'];
  const expertKeywords = ['expert', 'research', 'paper', 'theory', 'mathematical', '理論', '数学'];
  
  beginnerKeywords.forEach(keyword => {
    if (title.includes(keyword) || description.includes(keyword)) level = Math.max(level, 1);
  });
  
  intermediateKeywords.forEach(keyword => {
    if (title.includes(keyword) || description.includes(keyword)) level = Math.max(level, 2);
  });
  
  expertKeywords.forEach(keyword => {
    if (title.includes(keyword) || description.includes(keyword)) level = Math.max(level, 3);
  });
  
  return level;
}

// 実装スコア計算
function calculateImplementationScore(video: YoutubeVideoInfo): number {
  let score = 0.3; // 基本スコア
  
  const title = video.title.toLowerCase();
  const description = video.description.toLowerCase();
  
  // 実装関連キーワード
  const implementationKeywords = [
    'code', 'programming', 'implementation', 'build', 'create', 'develop',
    'python', 'javascript', 'react', 'node', 'api', 'database',
    'プログラミング', 'コード', '実装', '開発', '作成', '構築'
  ];
  
  implementationKeywords.forEach(keyword => {
    if (title.includes(keyword)) score += 0.1;
    if (description.includes(keyword)) score += 0.05;
  });
  
  // GitHubリンクなどの実装リソース
  if (description.includes('github') || description.includes('repository') || description.includes('repo')) {
    score += 0.2;
  }
  
  return Math.min(score, 1.0);
}

// キーワード抽出関数
function extractKeywords(title: string, description: string, tags: string[]): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const keywords = [];
  
  // AI/技術関連キーワード
  const aiKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
    'openai', 'chatgpt', 'gpt', 'llm', 'transformer', 'pytorch', 'tensorflow',
    '人工知能', '機械学習', 'ディープラーニング', 'ニューラルネットワーク'
  ];
  
  const techKeywords = [
    'programming', 'coding', 'python', 'javascript', 'react', 'nodejs', 'api',
    'database', 'web development', 'software', 'algorithm', 'data science',
    'プログラミング', 'コーディング', 'ソフトウェア', 'アルゴリズム', 'データサイエンス'
  ];
  
  const educationalKeywords = [
    'tutorial', 'course', 'lesson', 'guide', 'explained', 'learning',
    'チュートリアル', 'コース', '授業', 'ガイド', '解説', '学習'
  ];
  
  const allKeywords = [...aiKeywords, ...techKeywords, ...educationalKeywords, ...tags];
  
  // 一意のキーワードを抽出
  const uniqueKeywords = Array.from(new Set(allKeywords));
  
  for (const keyword of uniqueKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  }
  
  return keywords.slice(0, 15); // 最大15個まで
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