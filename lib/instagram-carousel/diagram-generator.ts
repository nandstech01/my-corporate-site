/**
 * Instagram Carousel 図解画像生成 (スライド3用)
 *
 * Gemini画像生成APIを使用して、カルーセルのソリューションスライド用の
 * ライト背景図解を生成する。
 *
 * ブランドカラー: cyan #06B6D4, blue #2563EB, navy #0F172A
 * 背景: #F8FAFE (ライト)
 * ターゲットサイズ: 700x500px領域
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// ============================================================
// Gemini レスポンスから画像データ抽出
// ============================================================

interface ExtractedImageData {
  readonly data: string
  readonly mimeType: string
}

function extractImageFromResponse(
  response: {
    candidates?: ReadonlyArray<{
      content?: { parts?: ReadonlyArray<unknown> }
    }>
  },
): ExtractedImageData | null {
  const parts = response.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    const partAny = part as {
      inlineData?: { mimeType: string; data: string }
    }
    if (partAny.inlineData?.mimeType?.startsWith('image/')) {
      return {
        data: partAny.inlineData.data,
        mimeType: partAny.inlineData.mimeType,
      }
    }
  }
  return null
}

// ============================================================
// プロンプト構築
// ============================================================

function buildDiagramPrompt(topic: string, keyPoints: string[]): string {
  const pointsText =
    keyPoints.length > 0
      ? keyPoints
          .slice(0, 5)
          .map((p, i) => `${i + 1}. ${p.substring(0, 40)}`)
          .join('\n')
      : '（トピックの主要ポイントを図解化）'

  return `Instagramカルーセル投稿のスライド用図解画像を生成してください。

【トピック】
${topic}

【要点（これを図解化）】
${pointsText}

【デザイン指示 - 最重要】
■ シンプルさ優先
- 要素は3〜5個のみに絞る
- アイコン・矢印・図形を中心に構成
- 余白を十分に取る
- 細かい説明テキストは入れない

■ カラースキーム
- 背景: ライトブルーグレー (#F8FAFE)
- メインカラー: シアン (#06B6D4)
- セカンダリ: ブルー (#2563EB)
- テキスト・線: ネイビー (#0F172A)
- アクセント: グラデーション（シアン→ブルー）

■ レイアウト
- フローチャートまたはカード型レイアウト
- 要素間は矢印や線で接続
- 各要素にアイコンを配置
- 全体が700x500pxの領域に収まるサイズ

■ テキスト
- 図中のラベルやキーワードは必ず日本語で書く
- 英語テキストは使わない（日本語のみ）
- テキストは短く簡潔に（各ラベル10文字以内）
- 文字は大きく読みやすく

■ 禁止事項
- 英語のテキストやラベルを使わない
- 暗い背景にしない（ライト背景のみ）
- 細かすぎる情報を入れない
- 長い文章を入れない

【技術仕様】
- サイズ: 約700x500ピクセル
- 高品質・高解像度
- ライト背景にネイビー・シアン・ブルーの配色

一目で理解できる、シンプルで美しいライト背景の図解を生成してください。`
}

// ============================================================
// エクスポート
// ============================================================

/**
 * トピックとキーポイントから図解画像を生成する。
 * 失敗時はnullを返す（throwしない）。
 */
export async function generateDiagram(
  topic: string,
  keyPoints: string[],
): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    process.stdout.write('GOOGLE_AI_API_KEY not configured, skipping diagram\n')
    return null
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-image-preview',
    })

    const prompt = buildDiagramPrompt(topic, keyPoints)

    process.stdout.write('Generating carousel diagram via Gemini...\n')

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 8192,
      } as Parameters<typeof model.generateContent>[0]['generationConfig'] & {
        responseModalities: string[]
      },
    })

    const imageData = extractImageFromResponse(result.response)
    if (!imageData) {
      process.stdout.write('Gemini did not return a diagram image\n')
      return null
    }

    const buffer = Buffer.from(imageData.data, 'base64')
    process.stdout.write(
      `Diagram generated: ${buffer.length} bytes (${imageData.mimeType})\n`,
    )
    return buffer
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`Diagram generation failed: ${message}\n`)
    return null
  }
}
