# TASK-03: サムネイル生成APIの作成

## 📌 概要

Gemini 3 Pro Image Previewを使用してサムネイル画像を生成する
APIエンドポイントを作成します。

## ✅ チェックリスト

- [ ] APIルート `/api/generate-ai-thumbnail/route.ts` の作成
- [ ] ベース画像の読み込み機能
- [ ] Gemini APIへの画像生成リクエスト
- [ ] 生成画像のSupabase Storageへのアップロード
- [ ] エラーハンドリング

## 📁 ファイル構成

```
app/api/generate-ai-thumbnail/
└── route.ts
```

## 🔧 API仕様

### エンドポイント
```
POST /api/generate-ai-thumbnail
```

### リクエストボディ
```typescript
interface GenerateThumbnailRequest {
  // 記事情報
  title: string;           // 記事タイトル（必須）
  content?: string;        // 記事本文（オプション、要約用）
  
  // 画像生成オプション
  baseImageId: number;     // ベース画像ID（1, 2, 3）
  style?: 'professional' | 'casual' | 'tech'; // スタイル
  
  // テキストオプション
  subtitleText?: string;   // サブタイトル（自動生成も可）
}
```

### レスポンス
```typescript
interface GenerateThumbnailResponse {
  success: boolean;
  url?: string;           // 生成された画像のURL
  path?: string;          // Storageパス
  error?: string;         // エラーメッセージ
  generationTime?: number; // 生成時間（ms）
}
```

## 💻 実装コード

```typescript
// app/api/generate-ai-thumbnail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const maxDuration = 120; // 2分タイムアウト

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { title, content, baseImageId, style, subtitleText } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'タイトルは必須です' },
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
      return NextResponse.json(
        { success: false, error: 'ベース画像が見つかりません' },
        { status: 404 }
      );
    }

    // 2. ベース画像をBase64に変換
    const imageResponse = await fetch(baseImage.url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = 'image/jpeg';

    // 3. Gemini APIで画像生成
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview'
    });

    const prompt = buildThumbnailPrompt(title, content, subtitleText, style);

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        temperature: 0.9,
        candidateCount: 1,
        maxOutputTokens: 4096,
        imageConfig: {
          aspectRatio: '16:9'
        }
      } as any,
    });

    // 4. 生成された画像を取得
    const response = result.response;
    let generatedImageData: string | null = null;
    let generatedMimeType = 'image/jpeg';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          generatedImageData = part.inlineData.data;
          generatedMimeType = part.inlineData.mimeType;
          break;
        }
      }
    }

    if (!generatedImageData) {
      return NextResponse.json(
        { success: false, error: '画像生成に失敗しました' },
        { status: 500 }
      );
    }

    // 5. Supabase Storageにアップロード
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `ai-thumbnail-${timestamp}-${randomString}.jpg`;
    const filePath = `images/${fileName}`;

    const imageBuffer2 = Buffer.from(generatedImageData, 'base64');

    const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
      .from('blog')
      .upload(filePath, imageBuffer2, {
        contentType: generatedMimeType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: `アップロードエラー: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 6. 公開URLを取得
    const { data: { publicUrl } } = supabaseServiceRole.storage
      .from('blog')
      .getPublicUrl(filePath);

    const generationTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      generationTime
    });

  } catch (error: any) {
    console.error('❌ サムネイル生成エラー:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'サムネイル生成に失敗しました' },
      { status: 500 }
    );
  }
}

// プロンプト生成関数
function buildThumbnailPrompt(
  title: string,
  content?: string,
  subtitleText?: string,
  style?: string
): string {
  return `You are a premium thumbnail designer.
Create a professional thumbnail image based on the reference image provided.

【重要】参照画像の人物は絶対に変更しないでください。
背景とテキストのみを変更してください。

【記事情報】
タイトル: ${title}
${content ? `内容の要約: ${content.substring(0, 200)}...` : ''}

【タイトル文字（最重要）】
メインタイトル: 「${title}」
${subtitleText ? `サブタイトル: ${subtitleText}` : ''}

【文字仕様】
- フォント: 高品質サンセリフ（Noto Sans JP系）
- 太さ: Bold（700〜900）
- 配置: 画面上部の安全領域
- 日本語を完璧に描画

【デザイン要件】
- 解像度: 3840×2160（16:9、4K）
- スタイル: ${style || 'professional'}
- 明るく前向きな雰囲気
- プロフェッショナル品質

【禁止事項】
- 参照画像の人物の顔を変更すること
- 文字の歪み、欠け、にじみ
- 暗すぎる画像

Generate a high-quality, professional thumbnail.`;
}
```

## 🧪 テスト用curlコマンド

```bash
curl -X POST http://localhost:3000/api/generate-ai-thumbnail \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AIエージェント開発の完全ガイド",
    "baseImageId": 1,
    "style": "professional"
  }'
```

## 📝 完了条件

1. APIが正常にリクエストを受け付ける
2. Gemini APIで画像が生成される
3. 生成画像がSupabase Storageにアップロードされる
4. 公開URLが返される

## ⏭️ 次のタスク

→ [TASK-04: 記事編集画面UIの実装](./TASK-04-edit-page-ui.md)

