/**
 * YouTube Data API v3統合
 * 自社チャンネル（@kenjiharada_ai_site）の動画自動取得
 * AI引用最適化：Fragment ID + 構造化データ統合
 */

import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// 自社YouTubeチャンネル設定
const COMPANY_CHANNEL_CONFIG = {
  channelHandle: '@kenjiharada_ai_site',
  channelId: '', // チャンネルIDを取得後に設定
  channelUrl: 'https://www.youtube.com/@kenjiharada_ai_site'
};

/**
 * YouTubeショート動画情報
 */
export interface YouTubeShortInfo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string; // ISO 8601形式（PT30S = 30秒）
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  
  // AI引用最適化用
  videoUrl: string;
  embedUrl: string;
  shortUrl: string; // https://youtube.com/shorts/VIDEO_ID
  
  // Fragment ID生成用
  fragmentId?: string;
  completeUri?: string;
  
  // ベクトル化用コンテンツ
  contentForEmbedding: string;
}

/**
 * チャンネルIDを取得
 */
export async function getChannelId(channelHandle: string): Promise<string | null> {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: channelHandle,
      type: ['channel'],
      maxResults: 1
    });

    const channelId = response.data.items?.[0]?.id?.channelId || null;
    console.log(`✅ チャンネルID取得: ${channelId}`);
    return channelId;
  } catch (error) {
    console.error('❌ チャンネルID取得エラー:', error);
    return null;
  }
}

/**
 * チャンネルの全動画を取得（ページネーション対応）
 */
export async function getChannelVideos(
  channelId: string,
  maxResults: number = 50
): Promise<string[]> {
  try {
    console.log(`🔍 チャンネル動画取得開始: ${channelId}`);
    
    const videoIds: string[] = [];
    let pageToken: string | undefined = undefined;
    
    do {
      const response = await youtube.search.list({
        part: ['id'],
        channelId: channelId,
        type: ['video'],
        maxResults: 50,
        pageToken: pageToken,
        order: 'date' // 最新順
      }) as any;

      const items = response.data.items || [];
      items.forEach((item: any) => {
        if (item.id?.videoId) {
          videoIds.push(item.id.videoId);
        }
      });

      pageToken = response.data.nextPageToken || undefined;
      
      console.log(`  📊 取得済み動画数: ${videoIds.length}`);
      
      // 最大件数に達したら終了
      if (videoIds.length >= maxResults) break;
      
    } while (pageToken);

    console.log(`✅ 総動画数: ${videoIds.length}`);
    return videoIds.slice(0, maxResults);
    
  } catch (error) {
    console.error('❌ チャンネル動画取得エラー:', error);
    return [];
  }
}

/**
 * 動画の詳細情報を取得
 */
export async function getVideoDetails(videoIds: string[]): Promise<YouTubeShortInfo[]> {
  try {
    // YouTube Data APIは一度に50件まで取得可能
    const chunks = chunkArray(videoIds, 50);
    const allVideos: YouTubeShortInfo[] = [];

    for (const chunk of chunks) {
      const response = await youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: chunk
      });

      const items = response.data.items || [];
      
      for (const item of items) {
        const videoId = item.id!;
        const snippet = item.snippet!;
        const contentDetails = item.contentDetails!;
        const statistics = item.statistics!;

        // 時間をパース（ISO 8601形式）
        const duration = contentDetails.duration || 'PT0S';
        const durationSeconds = parseDuration(duration);

        // ショート動画判定（60秒以下）
        const isShort = durationSeconds > 0 && durationSeconds <= 60;

        if (isShort) {
          // AI引用最適化用のコンテンツ生成
          const contentForEmbedding = generateEmbeddingContent({
            title: snippet.title || '',
            description: snippet.description || '',
            tags: snippet.tags || [],
            videoId
          });

          const videoInfo: YouTubeShortInfo = {
            videoId,
            title: snippet.title || '',
            description: snippet.description || '',
            publishedAt: snippet.publishedAt || '',
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
            duration,
            durationSeconds,
            viewCount: parseInt(statistics.viewCount || '0'),
            likeCount: parseInt(statistics.likeCount || '0'),
            commentCount: parseInt(statistics.commentCount || '0'),
            tags: snippet.tags || [],
            
            // URL生成
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            shortUrl: `https://youtube.com/shorts/${videoId}`,
            
            // ベクトル化用
            contentForEmbedding
          };

          allVideos.push(videoInfo);
        }
      }
    }

    console.log(`✅ ショート動画抽出: ${allVideos.length}件`);
    return allVideos;
    
  } catch (error) {
    console.error('❌ 動画詳細取得エラー:', error);
    return [];
  }
}

/**
 * 自社チャンネルのショート動画を自動取得
 */
export async function fetchCompanyYouTubeShorts(
  maxResults: number = 50
): Promise<YouTubeShortInfo[]> {
  try {
    console.log('🎬 自社YouTubeショート動画自動取得開始');
    console.log(`  チャンネル: ${COMPANY_CHANNEL_CONFIG.channelHandle}`);

    // 1. チャンネルIDを取得（初回のみ）
    if (!COMPANY_CHANNEL_CONFIG.channelId) {
      const channelId = await getChannelId(COMPANY_CHANNEL_CONFIG.channelHandle);
      if (!channelId) {
        throw new Error('チャンネルIDが取得できませんでした');
      }
      COMPANY_CHANNEL_CONFIG.channelId = channelId;
    }

    // 2. 全動画IDを取得
    const videoIds = await getChannelVideos(COMPANY_CHANNEL_CONFIG.channelId, maxResults * 2);
    
    if (videoIds.length === 0) {
      console.log('⚠️ 動画が見つかりませんでした');
      return [];
    }

    // 3. 動画詳細を取得（ショート動画のみフィルタ）
    const shortVideos = await getVideoDetails(videoIds);

    // 4. Fragment ID + Complete URI 生成
    const shortsWithFragmentIds = shortVideos.map((video, index) => ({
      ...video,
      fragmentId: `youtube-short-${index + 1}`,
      completeUri: `https://nands.tech/shorts#youtube-short-${index + 1}`
    }));

    console.log('✅ 自社YouTubeショート動画取得完了');
    console.log(`  総件数: ${shortsWithFragmentIds.length}`);
    
    return shortsWithFragmentIds;
    
  } catch (error) {
    console.error('❌ 自社YouTubeショート動画取得エラー:', error);
    return [];
  }
}

/**
 * 特定の動画URLから情報を取得
 */
export async function fetchVideoByUrl(url: string): Promise<YouTubeShortInfo | null> {
  try {
    // URLから動画IDを抽出
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('動画IDが抽出できませんでした');
    }

    const videos = await getVideoDetails([videoId]);
    return videos[0] || null;
    
  } catch (error) {
    console.error('❌ 動画URL取得エラー:', error);
    return null;
  }
}

// ===== ヘルパー関数 =====

/**
 * ISO 8601形式の時間を秒に変換
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * URLから動画IDを抽出
 */
function extractVideoId(url: string): string | null {
  // https://youtube.com/shorts/WTHkxADdgao
  // https://www.youtube.com/watch?v=WTHkxADdgao
  // https://youtu.be/WTHkxADdgao
  
  const patterns = [
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * 配列をチャンク分割
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * AI引用最適化用のコンテンツ生成
 * Mike King理論準拠：セマンティック検索可能なコンテンツ
 */
function generateEmbeddingContent(video: {
  title: string;
  description: string;
  tags: string[];
  videoId: string;
}): string {
  return `
# YouTubeショート動画: ${video.title}

## 動画情報
- タイトル: ${video.title}
- 説明: ${video.description}
- タグ: ${video.tags.join(', ')}

## 視聴URL
- ショート動画: https://youtube.com/shorts/${video.videoId}
- 通常URL: https://www.youtube.com/watch?v=${video.videoId}
- 埋め込みURL: https://www.youtube.com/embed/${video.videoId}

## Fragment ID対応
この動画はFragment IDシステムに統合され、AI検索エンジンで引用可能です。
Complete URI形式で正確なセクション参照が可能になります。

## AI引用最適化
- Mike King理論準拠のベクトルリンク実装
- ChatGPT、Perplexity、Claude、Gemini対応
- Schema.org VideoObject構造化データ統合
- Fragment ID: youtube-short-{id}
- Complete URI: https://nands.tech/shorts#youtube-short-{id}
  `.trim();
}

