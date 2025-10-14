import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * YouTube最新ショート動画取得API
 * 
 * 完全に独立したエンドポイント
 * 既存のブログ埋め込み機能やベクトルリンクには影響なし
 * 
 * company_youtube_shortsテーブルから直接取得
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '6', 10);

    // Supabaseクライアント作成
    const supabase = createClient(supabaseUrl, supabaseKey);

    // company_youtube_shortsテーブルから最新のショート動画を取得
    // 60秒以下の動画のみをフィルタリング（縦型動画）
    const { data, error } = await supabase
      .from('company_youtube_shorts')
      .select('id, script_title, youtube_video_id, description, content, created_at, thumbnail_url, script_duration_seconds')
      .not('youtube_video_id', 'is', null)
      .lte('script_duration_seconds', 60) // 60秒以下のショート動画のみ
      .order('created_at', { ascending: false })
      .limit(maxResults);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch videos from database', details: error },
        { status: 500 }
      );
    }

    // 動画情報を整形
    const videos: YouTubeVideo[] = (data || []).map((item: any) => ({
      id: item.youtube_video_id,
      title: item.script_title || 'Untitled',
      description: item.description || item.content || '',
      thumbnailUrl: item.thumbnail_url || `https://img.youtube.com/vi/${item.youtube_video_id}/maxresdefault.jpg`,
      publishedAt: item.created_at,
    }));

    return NextResponse.json({ videos });

  } catch (error) {
    console.error('Error fetching latest shorts:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

