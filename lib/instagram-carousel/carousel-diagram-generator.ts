/**
 * Instagram Carousel Diagram Generator
 *
 * Gemini (gemini-3.1-flash-image-preview) でコンテンツスライドと
 * まとめスライドの図解画像を生成する。
 * 1-2枚目(Satori)とのブランド統一をプロンプトで厳密に指定。
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ContentSlide, SummaryData, SummaryTable, SummaryTakeaway } from './types'
import { BRAND } from './types'

// ============================================================
// Gemini Client
// ============================================================

function getGeminiModel() {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is not set')
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' })
}

// ============================================================
// ブランドガイドテキスト（全プロンプト共通）
// ============================================================

export function brandGuide(slideNumber: number, totalSlides: number): string {
  return `【重要: ブランドデザインガイド — 厳守】
このカルーセルの1-2枚目はダークネイビー基調のモダンなデザインで統一されています。
3枚目以降もこのブランドトーンに必ず合わせてください。

■ ブランドカラー（これ以外の色は使わない）
- プライマリ: ダークネイビー ${BRAND.navy}（ヘッダー帯、フッター帯）
- セカンダリ: ${BRAND.navyLight}（サブ背景）
- アクセント: シアン ${BRAND.cyan}（番号バッジ、アクセント線、ハイライト）
- ハイライト: イエロー ${BRAND.yellow}（補足コメントのテキスト色）
- テキスト: ダーク ${BRAND.textDark} / ライト ${BRAND.textLight}
- メインエリア背景: ホワイト #FFFFFF または ライトグレー #F5F7FA

■ レイアウト構造（厳守）
1. ヘッダーバー（画像上部）: ダークネイビー ${BRAND.navy} の水平帯
   - 左端にシアン ${BRAND.cyan} の丸バッジ（中にスライド番号）
   - 白文字でタイトル（太字、大きめ）
   - 右端に「${slideNumber}/${totalSlides}」
2. メインエリア（中央の大部分）: 白背景。カード・矢印・アイコン・図形で情報を構造化
3. フッターバー（画像下部）: ダークネイビー ${BRAND.navy} の水平帯
   - 💡アイコン + イエロー ${BRAND.yellow} テキストで補足コメント

■ タイポグラフィ
- ゴシック体（太め、モダン、角ゴシック）
- 全て日本語（技術用語の英語はそのまま）
- 文字は大きく、スマホでも読めるサイズ

■ デザイントーン
- クリーン、モダン、プロフェッショナル
- フラットデザイン（過度なグラデーション・影は禁止）
- 手描き風・カジュアルすぎるデザインは禁止
- 写真やリアルな人物画像は入れない

■ 技術仕様
- アスペクト比: 4:5 縦長（1080x1350px相当）
- 高品質・高解像度
- 日本語テキストを正確に描画`
}

// ============================================================
// コンテンツスライド用プロンプト
// ============================================================

function buildContentSlidePrompt(
  slide: ContentSlide,
  slideNumber: number,
  totalSlides: number,
): string {
  const pointsText = slide.points
    .map((p, i) => `${i + 1}. ${p}`)
    .join('\n')

  return `Instagramカルーセル投稿の図解スライドを1枚生成してください。

${brandGuide(slideNumber, totalSlides)}

【このスライドの情報】
- タイトル: ${slide.title}
- スライド番号: ${slideNumber}/${totalSlides}

【伝える内容（全て図解に含めること、省略禁止）】
${pointsText}

【フッター補足コメント】
${slide.callout}

【メインエリアのデザイン指示】
- 各ポイントをカード、矢印、アイコン、図形で視覚的に構造化する
- 番号付き、フローチャート、ステップ図解など読者が一目で理解できる形式
- シアン ${BRAND.cyan} をアクセントカラーとして使う（矢印、下線、バッジ背景等）
- 情報密度は高く。ブログ記事1セクション分の内容を1枚に凝縮する
- ただし余白は適度に取り、詰め込みすぎない

教育系Instagramアカウントの図解投稿として、保存したくなるクオリティで生成してください。`
}

// ============================================================
// まとめスライド（比較表）用プロンプト
// ============================================================

function buildSummaryTablePrompt(
  summary: SummaryTable,
  slideNumber: number,
  totalSlides: number,
): string {
  const tableText = summary.rows
    .map((r) => `| ${r.label} | ${r.values.join(' | ')} |`)
    .join('\n')

  return `Instagramカルーセル投稿の比較表スライドを1枚生成してください。

${brandGuide(slideNumber, totalSlides)}

【このスライドの情報】
- タイトル: ${summary.title}
- スライド番号: ${slideNumber}/${totalSlides}

【比較表データ（全行全列を含めること）】
| 項目 | ${summary.headers.join(' | ')} |
|------|${summary.headers.map(() => '------').join('|')}|
${tableText}

【デザイン指示】
- きれいな表組みで表示（行ごとに白/ライトグレー交互背景）
- ヘッダー行: ダークネイビー ${BRAND.navy} 背景 + 白文字
- ✅ は緑 #22C55E、❌ は赤 #EF4444
- テキスト値は黒太字
- 表は角丸ボーダー付き
- 右下にイエロー ${BRAND.yellow} バッジ「🔖 保存して見返そう！」

保存したくなる、見やすい比較表を生成してください。`
}

// ============================================================
// まとめスライド（Takeaway）用プロンプト
// ============================================================

function buildSummaryTakeawayPrompt(
  summary: SummaryTakeaway,
  slideNumber: number,
  totalSlides: number,
): string {
  const itemsText = summary.items
    .map((item, i) => `${i + 1}. ${item.text} — ${item.detail}`)
    .join('\n')

  return `Instagramカルーセル投稿のまとめスライドを1枚生成してください。

${brandGuide(slideNumber, totalSlides)}

【このスライドの情報】
- タイトル: ${summary.title}
- スライド番号: ${slideNumber}/${totalSlides}

【まとめ項目（全て含めること）】
${itemsText}

【デザイン指示】
- 各項目を白カード（角丸、ボーダー付き）で表示
- 左にシアン ${BRAND.cyan} の番号バッジ（丸）
- タイトルは太字、補足は小さめのグレー文字
- 右下にイエロー ${BRAND.yellow} バッジ「🔖 保存して見返そう！」

保存したくなる、見やすいまとめを生成してください。`
}

// ============================================================
// 画像生成実行
// ============================================================

export async function generateImageFromPrompt(prompt: string): Promise<Buffer> {
  const model = getGeminiModel()

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      temperature: 0.5,
      candidateCount: 1,
      maxOutputTokens: 8192,
    } as any,
  })

  const parts = result.response.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    const p = part as any
    if (p.inlineData?.mimeType?.startsWith('image/')) {
      return Buffer.from(p.inlineData.data, 'base64')
    }
  }
  throw new Error('Gemini did not return an image')
}

// ============================================================
// エクスポート
// ============================================================

export async function generateContentSlideImage(
  slide: ContentSlide,
  slideNumber: number,
  totalSlides: number,
): Promise<Buffer> {
  const prompt = buildContentSlidePrompt(slide, slideNumber, totalSlides)
  process.stdout.write(`  Generating content diagram: ${slide.title}\n`)
  return generateImageFromPrompt(prompt)
}

export async function generateSummarySlideImage(
  summary: SummaryData,
  slideNumber: number,
  totalSlides: number,
): Promise<Buffer> {
  const prompt = summary.type === 'table'
    ? buildSummaryTablePrompt(summary, slideNumber, totalSlides)
    : buildSummaryTakeawayPrompt(summary, slideNumber, totalSlides)
  process.stdout.write(`  Generating summary diagram: ${summary.title}\n`)
  return generateImageFromPrompt(prompt)
}
