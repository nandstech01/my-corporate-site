import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    // 設定をデータベースに保存
    const { data, error } = await supabaseServiceRole
      .from('scheduler_config')
      .upsert({
        id: 'auto-blog-scheduler',
        config: config,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Schedule config save error:', error);
      return NextResponse.json({
        success: false,
        error: 'スケジュール設定の保存に失敗しました'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Schedule config API error:', error);
    return NextResponse.json({
      success: false,
      error: 'APIエラーが発生しました'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseServiceRole
      .from('scheduler_config')
      .select('*')
      .eq('id', 'auto-blog-scheduler')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Schedule config fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'スケジュール設定の取得に失敗しました'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      config: data?.config || null
    });

  } catch (error) {
    console.error('Schedule config GET API error:', error);
    return NextResponse.json({
      success: false,
      error: 'APIエラーが発生しました'
    }, { status: 500 });
  }
} 