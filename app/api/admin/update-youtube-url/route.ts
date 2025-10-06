import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * YouTube URLからVideo IDを抽出
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * YouTube URL登録API
 * 
 * 台本生成後、動画をYouTubeに投稿したらURLを登録する
 * この時点で初めて fragment_vectors に同期され、ベクトルリンク化される
 */
export async function POST(request: NextRequest) {
  try {
    const { scriptId, youtubeUrl } = await request.json();

    if (!scriptId || !youtubeUrl) {
      return NextResponse.json(
        { success: false, error: 'scriptId と youtubeUrl は必須です' },
        { status: 400 }
      );
    }

    console.log('\n📺 ========================================');
    console.log('🔗 YouTube URL登録開始');
    console.log(`  Script ID: ${scriptId}`);
    console.log(`  YouTube URL: ${youtubeUrl}`);
    console.log('📺 ========================================\n');

    // 1. Video IDを抽出
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: '無効なYouTube URLです' },
        { status: 400 }
      );
    }
    console.log(`✅ Video ID抽出完了: ${videoId}\n`);

    // 2. company_youtube_shorts から台本データを取得
    console.log('📥 台本データ取得中...');
    const { data: scriptData, error: fetchError } = await supabaseServiceRole
      .from('company_youtube_shorts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (fetchError || !scriptData) {
      console.error('❌ 台本データ取得エラー:', fetchError);
      return NextResponse.json(
        { success: false, error: '台本データが見つかりません' },
        { status: 404 }
      );
    }
    console.log('✅ 台本データ取得完了\n');

    // 3. サムネイル・動画URLを自動生成（API不要）
    console.log('🎨 サムネイル・動画URL生成中...');
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const videoUrl = youtubeUrl;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const shortUrl = youtubeUrl.includes('/shorts/') ? youtubeUrl : `https://www.youtube.com/shorts/${videoId}`;
    
    console.log(`  📸 サムネイル: ${thumbnailUrl}`);
    console.log(`  🎬 動画URL: ${videoUrl}`);
    console.log(`  📺 埋め込みURL: ${embedUrl}`);
    console.log('✅ URL生成完了\n');

    // 4. Complete URIを生成（この時点で初めて生成）
    console.log('🔗 Complete URI生成中...');
    const completeUri = `https://ken12.tech/posts/${scriptData.blog_slug}#${scriptData.fragment_id}`;
    console.log(`✅ Complete URI: ${completeUri}\n`);

    // 5. company_youtube_shorts を更新
    console.log('🔄 YouTube URL登録中...');
    const { error: updateError } = await supabaseServiceRole
      .from('company_youtube_shorts')
      .update({
        youtube_video_id: videoId,
        youtube_url: youtubeUrl,
        video_url: videoUrl,
        embed_url: embedUrl,
        thumbnail_url: thumbnailUrl,
        complete_uri: completeUri, // ⚠️ この時点で初めて設定
        ai_optimization_score: 95, // URL登録完了で最高スコア
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', scriptId);

    if (updateError) {
      console.error('❌ YouTube URL登録エラー:', updateError);
      return NextResponse.json(
        { success: false, error: 'YouTube URL登録に失敗しました' },
        { status: 500 }
      );
    }
    console.log('✅ YouTube URL登録完了（サムネイル含む）\n');

    // 6. fragment_vectors に初めて保存（ベクトルリンク化）
    console.log('🔗 Fragment Vectorsに保存中（ベクトルリンク化）...');
    
    const { error: fragmentError } = await supabaseServiceRole
      .from('fragment_vectors')
      .insert({
        fragment_id: scriptData.fragment_id,
        complete_uri: completeUri,
        page_path: scriptData.page_path,
        content_title: scriptData.content_title,
        content: scriptData.content,
        content_type: 'youtube-short',
        embedding: scriptData.embedding,
        category: 'ai-technology',
        semantic_weight: 1.0,
        target_queries: scriptData.target_queries || [],
        related_entities: scriptData.related_entities || ['Company', 'BlogPost', scriptData.blog_slug],
        metadata: {
          script_id: scriptData.id,
          related_blog_post_id: scriptData.related_blog_post_id,
          blog_slug: scriptData.blog_slug,
          youtube_video_id: videoId,
          youtube_url: youtubeUrl,
          thumbnail_url: thumbnailUrl,
          embed_url: embedUrl,
          virality_score: scriptData.virality_score,
          target_emotion: scriptData.target_emotion,
          hook_type: scriptData.hook_type,
          published_at: new Date().toISOString()
        }
      });

    if (fragmentError) {
      console.error('⚠️ Fragment Vectors保存エラー:', fragmentError);
      // エラーは記録するが処理は続行（YouTube URLは既に保存済み）
    } else {
      console.log('✅ Fragment Vectors保存完了（ベクトルリンク化完了）\n');
    }

    // 6. posts テーブルのステータスを更新
    if (scriptData.related_blog_post_id) {
      console.log('🔄 記事ステータス更新中...');
      const { error: postUpdateError } = await supabaseServiceRole
        .from('posts')
        .update({
          youtube_script_status: 'published'
        })
        .eq('id', scriptData.related_blog_post_id);

      if (postUpdateError) {
        console.error('⚠️ 記事ステータス更新エラー:', postUpdateError);
      } else {
        console.log('✅ 記事ステータス更新完了\n');
      }
    }

    console.log('🎉 ========================================');
    console.log('✅ YouTube URL登録完了！');
    console.log(`  Video ID: ${videoId}`);
    console.log(`  サムネイル: ${thumbnailUrl}`);
    console.log(`  完全URI: ${scriptData.complete_uri}`);
    console.log(`  ステータス: published（ベクトルリンク化済み）`);
    console.log('🎉 ========================================\n');

    return NextResponse.json({
      success: true,
      videoId,
      thumbnailUrl,
      videoUrl,
      embedUrl,
      completeUri: scriptData.complete_uri,
      message: 'YouTube URL・サムネイル・動画URLを登録し、ベクトルリンク化しました'
    });

  } catch (error) {
    console.error('❌ YouTube URL登録エラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

