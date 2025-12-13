import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadVideoToYouTube, refreshYouTubeAccessToken } from '@/lib/youtube/client';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

// Fetchでストリーム取得してReadableに変換
async function fetchVideoAsStream(url: string): Promise<Readable> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  // Web ReadableStream → Node.js Readable
  const webStream = response.body;
  const reader = webStream.getReader();

  const readable = new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (error) {
        this.destroy(error as Error);
      }
    },
  });

  return readable;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. VIDEO Jobを取得
    const { data: videoJob, error: fetchError } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !videoJob) {
      return NextResponse.json(
        { error: 'VIDEO Jobが見つかりません' },
        { status: 404 }
      );
    }

    // 2. 必須フィールドチェック
    if (!videoJob.final_video_url) {
      return NextResponse.json(
        { error: '最終動画がアップロードされていません' },
        { status: 400 }
      );
    }

    if (!videoJob.youtube_title) {
      return NextResponse.json(
        { error: 'YouTubeタイトルが設定されていません' },
        { status: 400 }
      );
    }

    // 3. YouTube認証情報を取得
    const { data: youtubeAuth, error: authError } = await supabase
      .from('youtube_auth')
      .select('*')
      .eq('user_id', videoJob.user_id)
      .single();

    if (authError || !youtubeAuth) {
      return NextResponse.json(
        { 
          error: 'YouTube認証が必要です', 
          requireAuth: true,
          authUrl: '/api/auth/youtube'
        },
        { status: 401 }
      );
    }

    // 4. トークンの有効期限チェック & 必要に応じてリフレッシュ
    const clientId = process.env.YOUTUBE_CLIENT_ID!;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET!;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI!;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'YouTube API credentials not configured' },
        { status: 500 }
      );
    }

    let accessToken = youtubeAuth.access_token;
    let refreshToken = youtubeAuth.refresh_token;

    const now = new Date();
    const expiresAt = new Date(youtubeAuth.expires_at);

    // トークンが期限切れまたは5分以内に期限切れなら更新
    if (expiresAt <= new Date(now.getTime() + 5 * 60 * 1000)) {
      console.log('🔄 YouTube access token expired, refreshing...');
      
      const newTokens = await refreshYouTubeAccessToken(
        { clientId, clientSecret, redirectUri },
        refreshToken
      );

      accessToken = newTokens.access_token;
      refreshToken = newTokens.refresh_token;

      // DBを更新
      await supabase
        .from('youtube_auth')
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: newTokens.expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', videoJob.user_id);

      console.log('✅ YouTube access token refreshed');
    }

    // 5. 動画ファイルをストリームとして取得
    console.log('📥 Fetching video from:', videoJob.final_video_url);
    const videoStream = await fetchVideoAsStream(videoJob.final_video_url);

    // 6. YouTubeにアップロード
    console.log('🚀 Uploading to YouTube...');
    const uploadResult = await uploadVideoToYouTube(
      { clientId, clientSecret, redirectUri },
      { 
        access_token: accessToken, 
        refresh_token: refreshToken,
        expires_at: youtubeAuth.expires_at,
        scope: youtubeAuth.scope,
      },
      videoStream,
      {
        title: videoJob.youtube_title,
        description: videoJob.youtube_description || undefined,
        tags: videoJob.youtube_tags || [],
        privacyStatus: 'unlisted', // 限定公開
        categoryId: '22', // People & Blogs
      }
    );

    console.log('✅ YouTube upload complete:', uploadResult.videoId);

    // 7. VIDEO Jobを更新
    const { error: updateError } = await supabase
      .from('video_jobs')
      .update({
        status: 'youtube_uploaded',
        youtube_video_id: uploadResult.videoId,
        youtube_url: uploadResult.videoUrl,
        youtube_published_at: uploadResult.uploadedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'データベース更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      youtube_video_id: uploadResult.videoId,
      youtube_url: uploadResult.videoUrl,
      published_at: uploadResult.uploadedAt,
      message: 'YouTubeへの投稿が完了しました（限定公開）',
    });
  } catch (error: any) {
    console.error('Error in publish-youtube:', error);
    return NextResponse.json(
      { error: error.message || 'YouTubeへの投稿に失敗しました' },
      { status: 500 }
    );
  }
}
