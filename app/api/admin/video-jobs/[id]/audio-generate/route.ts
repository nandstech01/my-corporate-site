import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const { input_text, voice_id } = await request.json();

    console.log('🔍 [Audio Generate] Request received for job:', jobId);

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

    // Akool API認証情報
    const akoolClientId = process.env.AKOOL_CLIENT_ID;
    const akoolApiKey = process.env.AKOOL_API_KEY;
    
    if (!akoolClientId || !akoolApiKey) {
      return NextResponse.json(
        { error: 'Akool認証情報が設定されていません' },
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
      return NextResponse.json(
        { error: tokenData.msg || 'トークンの取得に失敗しました' },
        { status: tokenResponse.status }
      );
    }

    const bearerToken = tokenData.token;
    const webhookUrl = process.env.AKOOL_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/akool/webhook`;

    // Step 2: Akool Audio API呼び出し
    const audioRequestBody = {
      input_text: input_text || videoJob.script_raw,
      voice_id: voice_id || 'pMsXgVXv3BLzUgSXRplE',
      webhookUrl: webhookUrl,
    };

    console.log('🔍 [Audio Generate] Request body:', JSON.stringify(audioRequestBody, null, 2));

    const audioResponse = await fetch(
      'https://openapi.akool.com/api/open/v3/audio/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(audioRequestBody),
      }
    );

    const audioData = await audioResponse.json();
    console.log('🔍 [Audio Generate] Response:', audioData);

    if (!audioResponse.ok) {
      return NextResponse.json(
        { error: audioData.msg || '音声生成に失敗しました' },
        { status: audioResponse.status }
      );
    }

    const audioJobId = audioData.data?._id || audioData._id;
    
    if (!audioJobId) {
      return NextResponse.json(
        { error: 'Audio Job IDの取得に失敗しました' },
        { status: 500 }
      );
    }

    // VIDEO Jobを更新
    await supabase
      .from('video_jobs')
      .update({
        voice: {
          ...videoJob.voice,
          audioJobId: audioJobId,
          voiceId: voice_id || 'pMsXgVXv3BLzUgSXRplE',
          status: 1, // 処理中
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      audio_job_id: audioJobId,
      message: '音声生成を開始しました',
    });
  } catch (error: any) {
    console.error('Error in audio-generate:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

