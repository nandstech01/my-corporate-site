import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// 最大ファイルサイズ: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

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

    // VIDEO Jobを取得
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

    // FormDataから動画ファイルを取得
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: '動画ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック
    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `ファイルサイズが大きすぎます。最大500MBまでです。（現在: ${Math.round(videoFile.size / 1024 / 1024)}MB）` },
        { status: 400 }
      );
    }

    // ファイルタイプチェック
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: '動画ファイルをアップロードしてください' },
        { status: 400 }
      );
    }

    console.log('📤 動画アップロード開始:', {
      fileName: videoFile.name,
      fileSize: `${Math.round(videoFile.size / 1024 / 1024)}MB`,
      fileType: videoFile.type,
    });

    // Supabase Storageにアップロード
    const timestamp = Date.now();
    const fileExt = videoFile.name.split('.').pop();
    const fileName = `${jobId}_final_${timestamp}.${fileExt}`;
    const filePath = `video-jobs/${videoJob.user_id}/${fileName}`;

    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('final-videos')
      .upload(filePath, buffer, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      );
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage.from('final-videos').getPublicUrl(filePath);

    console.log('✅ 動画アップロード完了:', {
      publicUrl,
      filePath,
    });

    // VIDEO Jobを更新
    const { error: updateError } = await supabase
      .from('video_jobs')
      .update({
        status: 'final_uploaded',
        final_video_url: publicUrl,
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
      final_video_url: publicUrl,
      message: '最終動画をアップロードしました',
    });
  } catch (error: any) {
    console.error('Error in upload-final:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

