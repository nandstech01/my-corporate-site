/**
 * ベース画像一覧取得API
 * - サムネイル生成のベースとなる画像を取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: images, error } = await supabaseServiceRole
      .from('thumbnail_base_images')
      .select('*')
      .eq('is_active', true)
      .order('id');

    if (error) {
      console.error('❌ ベース画像取得エラー:', error);
      return NextResponse.json(
        { success: false, error: 'ベース画像の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: images || []
    });

  } catch (error: any) {
    console.error('❌ ベース画像APIエラー:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'エラーが発生しました' },
      { status: 500 }
    );
  }
}

// ベース画像の追加（管理者用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, url, pattern_type, text_position, color_scheme } = body;

    if (!name || !url || !pattern_type) {
      return NextResponse.json(
        { success: false, error: 'name, url, pattern_type は必須です' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServiceRole
      .from('thumbnail_base_images')
      .insert({
        name,
        description,
        url,
        pattern_type,
        text_position: text_position || { x: 0.5, y: 0.15, width: 0.8 },
        color_scheme: color_scheme || { primary: '#FFFFFF', secondary: '#000000' }
      })
      .select()
      .single();

    if (error) {
      console.error('❌ ベース画像追加エラー:', error);
      return NextResponse.json(
        { success: false, error: 'ベース画像の追加に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: data
    });

  } catch (error: any) {
    console.error('❌ ベース画像追加APIエラー:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'エラーが発生しました' },
      { status: 500 }
    );
  }
}

