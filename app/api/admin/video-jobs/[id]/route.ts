import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * VIDEO Jobの詳細を取得するAPI
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoJobId = params.id;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: videoJob, error: fetchError } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('id', videoJobId)
      .single();

    if (fetchError || !videoJob) {
      console.error('[Get Video Job] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'VIDEO Job not found', details: fetchError },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, video_job: videoJob },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Get Video Job] Unexpected error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

