/**
 * AIサムネイル生成API
 * - Gemini 2.5 Flash Image（ナノバナナプロ）を使用
 * - ベース画像のテキストのみを変更し、人物は維持
 * 
 * 参考: https://ai.google.dev/gemini-api/docs/image-generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Gemini API初期化
const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// タイムアウト設定（3分 - 高品質生成には時間がかかる）
export const maxDuration = 180;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // APIキーチェック
    if (!genAI) {
      return NextResponse.json(
        { success: false, error: 'GOOGLE_AI_API_KEY が設定されていません' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      content, 
      baseImageId, 
      style = 'professional',
      subtitleText 
    } = body;

    console.log('🎨 AIサムネイル生成開始（Nano Banana Pro）');
    console.log(`  タイトル: ${title}`);
    console.log(`  ベース画像ID: ${baseImageId}`);
    console.log(`  スタイル: ${style}`);

    // バリデーション
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    if (!baseImageId) {
      return NextResponse.json(
        { success: false, error: 'ベース画像IDは必須です' },
        { status: 400 }
      );
    }

    // 1. ベース画像を取得
    const { data: baseImage, error: baseError } = await supabaseServiceRole
      .from('thumbnail_base_images')
      .select('*')
      .eq('id', baseImageId)
      .single();

    if (baseError || !baseImage) {
      console.error('❌ ベース画像取得エラー:', baseError);
      return NextResponse.json(
        { success: false, error: 'ベース画像が見つかりません' },
        { status: 404 }
      );
    }

    console.log(`✅ ベース画像取得: ${baseImage.name}`);

    // 2. ベース画像をBase64に変換
    let base64Image: string;
    let mimeType = 'image/png';
    
    try {
      let imageUrl = baseImage.url;
      if (imageUrl.startsWith('/')) {
        // ローカル開発環境の場合はファイルシステムから直接読み込む
        const fs = await import('fs/promises');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'public', imageUrl);
        
        const fileBuffer = await fs.readFile(filePath);
        base64Image = fileBuffer.toString('base64');
        mimeType = imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
        console.log(`✅ ローカルファイルから読み込み: ${filePath} (${Math.round(fileBuffer.length / 1024)}KB)`);
      } else {
        // 外部URLの場合はfetchで取得
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`画像取得失敗: ${imageResponse.status}`);
        }
      
        const contentType = imageResponse.headers.get('content-type');
        if (contentType) {
          mimeType = contentType;
        }
      
        const imageBuffer = await imageResponse.arrayBuffer();
        base64Image = Buffer.from(imageBuffer).toString('base64');
        console.log(`✅ 外部URLから読み込み: ${imageUrl} (${Math.round(imageBuffer.byteLength / 1024)}KB)`);
      }
    } catch (fetchError: any) {
      console.error('❌ ベース画像取得エラー:', fetchError);
      return NextResponse.json(
        { success: false, error: `ベース画像の読み込みに失敗しました: ${fetchError.message}` },
        { status: 500 }
      );
    }

    // 3. 画像編集用プロンプト生成（公式ガイドライン準拠）
    const prompt = buildImageEditPrompt(title, subtitleText, baseImage.color_scheme);

    console.log('🤖 Gemini API呼び出し中（Nano Banana Pro）...');
    console.log(`📝 プロンプト: ${prompt.substring(0, 200)}...`);

    // 4. Gemini APIで画像編集（Nano Banana Pro / ナノバナナプロ）
    // 正式モデル名: gemini-3-pro-image-preview
    // 特徴: 高品質画像生成・編集、マルチモーダル推論、テキスト埋め込み
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview'
    });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.4, // 低めの温度で一貫性を重視
        candidateCount: 1,
        maxOutputTokens: 8192,
      } as any,
    });

    // 5. 生成された画像を取得
    const response = result.response;
    let generatedImageData: string | null = null;
    let generatedMimeType = 'image/png';

    console.log('📥 レスポンス解析中...');

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        const partAny = part as any;
        if (partAny.inlineData?.mimeType?.startsWith('image/')) {
          generatedImageData = partAny.inlineData.data;
          generatedMimeType = partAny.inlineData.mimeType;
          console.log(`✅ 画像生成成功 (${generatedMimeType})`);
          break;
        }
        if (partAny.text) {
          console.log(`📝 テキストレスポンス: ${partAny.text.substring(0, 200)}...`);
        }
      }
    }

    if (!generatedImageData) {
      const textResponse = response.text?.() || '';
      console.error('❌ 画像生成失敗');
      console.error('📝 レスポンス:', textResponse.substring(0, 500));
      return NextResponse.json(
        { 
          success: false, 
          error: '画像生成に失敗しました。再試行してください。',
          details: textResponse.substring(0, 200)
        },
        { status: 500 }
      );
    }

    // 6. Supabase Storageにアップロード
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = generatedMimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `ai-thumbnail-${timestamp}-${randomString}.${ext}`;
    const filePath = `images/${fileName}`;

    const imageBuffer = Buffer.from(generatedImageData, 'base64');
    console.log(`📦 アップロード中: ${filePath} (${Math.round(imageBuffer.length / 1024)}KB)`);

    const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
      .from('blog')
      .upload(filePath, imageBuffer, {
        contentType: generatedMimeType,
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ アップロードエラー:', uploadError);
      return NextResponse.json(
        { success: false, error: `アップロードエラー: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 7. 公開URLを取得
    const { data: { publicUrl } } = supabaseServiceRole.storage
      .from('blog')
      .getPublicUrl(filePath);

    const generationTime = Date.now() - startTime;
    console.log(`✅ AIサムネイル生成完了 (${generationTime}ms)`);
    console.log(`🔗 URL: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      generationTime
    });

  } catch (error: any) {
    console.error('❌ AIサムネイル生成エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'サムネイル生成に失敗しました',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

/**
 * 画像編集用プロンプト（公式ガイドライン準拠）
 * 
 * 参考: "Update this infographic to be in Spanish. Do not change any other"
 * https://ai.google.dev/gemini-api/docs/image-generation
 */
function buildImageEditPrompt(
  title: string,
  subtitleText?: string,
  colorScheme?: { primary: string; secondary: string }
): string {
  const colors = colorScheme || { primary: '#FFFFFF', secondary: '#FF0000' };

  // 公式ガイドライン: シンプルで明確な指示
  return `Edit this thumbnail image: Replace ALL the existing text with the new title below.

NEW TITLE TEXT: "${title}"
${subtitleText ? `SUBTITLE: "${subtitleText}"` : ''}

CRITICAL RULES:
1. KEEP the person EXACTLY as they are - do not modify the person's face, body, pose, or clothing in ANY way
2. KEEP the background and composition EXACTLY as they are
3. ONLY replace the text/typography with the new title
4. Use the same text style, position, and layout as the original image
5. Text color: ${colors.primary} with ${colors.secondary} outline/shadow
6. Render Japanese text clearly and accurately - no typos or distortions
7. Maintain the same professional quality as the original

Do not change anything else in the image except the text.`;
}
