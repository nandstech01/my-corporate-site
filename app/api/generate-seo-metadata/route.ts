import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容が必要です' },
        { status: 400 }
      );
    }

    // 内容から最初の1000文字程度を抽出（分析用）
    const contentPreview = content.substring(0, 1000);

    const prompt = `あなたは日本のSEO専門家で、AIO LLMO（AI Language Model Optimization）に特化したメタデータ生成のエキスパートです。

以下の記事について、Mike King理論に基づく最適化されたメタディスクリプションとSEOキーワードを生成してください。

【記事タイトル】
${title}

【記事内容（抜粋）】
${contentPreview}

【要求事項】

## メタディスクリプション作成基準
- 120-160文字以内（日本語）
- ChatGPT、Perplexity、Google AI などのAI検索エンジンに最適化
- クリック率向上を目的とした魅力的な文言
- 記事の価値提案を明確に表現
- アクション指向のCTA要素を含む
- 数字や具体的な成果を含む（可能な場合）
- "なぜこの記事を読むべきか"を明確にする

## SEOキーワード選定基準
- 10-15個のキーワード・フレーズ
- AI検索時代の意図ベースキーワード
- 長テールキーワードを重視
- 関連性の高い共起語を含む
- 競合性と検索意図のバランスを考慮
- 記事内容に自然に含まれるキーワード優先

【出力形式】
以下のJSON形式で出力してください：

{
  "meta_description": "生成されたメタディスクリプション",
  "seo_keywords": [
    "キーワード1",
    "キーワード2",
    "キーワード3"
  ],
  "analysis": {
    "primary_topic": "主要トピック",
    "target_audience": "ターゲット読者層",
    "value_proposition": "価値提案"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('OpenAI APIからの応答が空です');
    }

    // JSONを抽出（マークダウンのコードブロックを除去）
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                     responseText.match(/```\n([\s\S]*?)\n```/) ||
                     [null, responseText];
    
    const jsonString = jsonMatch[1] || responseText;
    const result = JSON.parse(jsonString.trim());

    return NextResponse.json({
      metaDescription: result.meta_description,
      seoKeywords: result.seo_keywords,
      analysis: result.analysis,
    });

  } catch (error) {
    console.error('SEOメタデータ生成エラー:', error);
    return NextResponse.json(
      { error: 'SEOメタデータの生成に失敗しました' },
      { status: 500 }
    );
  }
} 