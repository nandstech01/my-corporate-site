import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    console.log('🔍 [Akool Generate] Request received for job:', jobId);

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
      console.error('❌ [Akool Generate] VIDEO Job not found:', fetchError);
      return NextResponse.json(
        { error: 'VIDEO Jobが見つかりません' },
        { status: 404 }
      );
    }

    // 台本チェック
    if (!videoJob.script_raw) {
      return NextResponse.json(
        { error: '台本が入力されていません' },
        { status: 400 }
      );
    }

    // 音声URL チェック
    if (!videoJob.voice?.url) {
      return NextResponse.json(
        { error: '音声が生成されていません。先に「音声生成」を実行してください。' },
        { status: 400 }
      );
    }

    // Akool API認証情報
    const akoolClientId = process.env.AKOOL_CLIENT_ID;
    const akoolApiKey = process.env.AKOOL_API_KEY;
    
    if (!akoolClientId || !akoolApiKey) {
      return NextResponse.json(
        { error: 'Akool認証情報が設定されていません (CLIENT_ID or API_KEY)' },
        { status: 500 }
      );
    }
    
    // Step 1: Bearer Tokenを取得
    const tokenResponse = await fetch('https://openapi.akool.com/api/open/v3/getToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: akoolClientId,
        clientSecret: akoolApiKey,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.token) {
      console.error('❌ [Akool Generate] Failed to get token:', tokenData);
      return NextResponse.json(
        { error: tokenData.msg || 'トークンの取得に失敗しました' },
        { status: tokenResponse.status }
      );
    }

    const bearerToken = tokenData.token;

    // あん子アバター固定
    const ANKO_AVATAR_ID = 'ankotalking';
    const ANKO_AVATAR_FROM = 3;
    const ANKO_AVATAR_URL = 'https://drz0f01yeq1cx.cloudfront.net/1762020526961-preview_compressed_LYGmTBLVNWLfQWic9tya.mp4';

    const webhookUrl = process.env.AKOOL_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/akool/webhook`;
    
    const akoolRequestBody = {
      width: 1080,
      height: 1920,
      avatar_from: ANKO_AVATAR_FROM,
      webhookUrl: webhookUrl,
      elements: [
        {
          type: 'image',
          url: 'https://drz0f01yeq1cx.cloudfront.net/1729480978805-talkingAvatarbg.png',
          layer_number: 0,
          width: 1080,
          height: 1920,
          scale_x: 1,
          scale_y: 1,
          offset_x: 540,
          offset_y: 960,
        },
        {
          type: 'avatar',
          avatar_id: ANKO_AVATAR_ID,
          layer_number: 1,
          scale_x: 1,
          scale_y: 1,
          width: 1080,
          height: 1920,
          offset_x: 540,
          offset_y: 960,
          url: ANKO_AVATAR_URL,
        },
        {
          type: 'audio',
          voice_clone: {
            voice_from: videoJob.voice.from,
            voice_id: videoJob.voice.voice_model_id,
            voice_url: videoJob.voice.url,
          },
          url: videoJob.voice.url,
        },
      ],
    };

    console.log('🔍 [Akool Generate] Request body:', JSON.stringify(akoolRequestBody, null, 2));

    // Step 2: Akool APIを呼び出し
    const akoolResponse = await fetch(
      'https://openapi.akool.com/api/open/v3/talkingavatar/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(akoolRequestBody),
      }
    );

    const responseText = await akoolResponse.text();
    console.log('🔍 [Akool Generate] Raw Response:', responseText);

    let akoolData;
    try {
      akoolData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [Akool Generate] Failed to parse response:', parseError);
      return NextResponse.json(
        { error: 'Akool APIからの不正なレスポンス' },
        { status: 500 }
      );
    }

    if (!akoolResponse.ok) {
      console.error('❌ [Akool Generate] Akool API Error:', akoolData);
      return NextResponse.json(
        { error: akoolData.msg || 'Akool APIエラーが発生しました' },
        { status: akoolResponse.status }
      );
    }

    const akoolJobId = 
      akoolData.data?._id || 
      akoolData.data?.id || 
      akoolData._id || 
      akoolData.id ||
      akoolData.data?.jobId ||
      akoolData.jobId;
    
    if (!akoolJobId) {
      console.error('❌ [Akool Generate] Failed to extract Job ID:', akoolData);
      return NextResponse.json(
        { error: 'Akool Job IDの取得に失敗しました', response: akoolData },
        { status: 500 }
      );
    }

    // VIDEO Jobを更新
    const { error: updateError } = await supabase
      .from('video_jobs')
      .update({
        status: 'akool_processing',
        akool_job_id: akoolJobId,
        avatar: {
          ...videoJob.avatar,
          avatarTemplateId: ANKO_AVATAR_ID,
          url: ANKO_AVATAR_URL,
          resolution: '1080x1920',
          status: 1,
        },
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
      akool_job_id: akoolJobId,
      message: 'アバター動画の生成を開始しました',
    });
  } catch (error: any) {
    console.error('Error in akool-generate:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

