/**
 * 画像アップロードAPI
 * - Service Role Keyを使用してRLSをバイパス
 * - サムネイル画像などのアップロードに使用
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseServiceRole = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabaseServiceRole) {
      return NextResponse.json(
        { error: 'Database configuration not available' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイル検証
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます（10MB以下にしてください）' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '画像ファイルを選択してください' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt)) {
      return NextResponse.json(
        { error: 'サポートされていない画像形式です' },
        { status: 400 }
      );
    }

    // ファイル名生成
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // ArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
      .from('blog')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `アップロードエラー: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabaseServiceRole.storage
      .from('blog')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { 
        error: 'アップロードに失敗しました',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

