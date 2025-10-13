import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptTitle, scriptHook, scriptBody, scriptCta, relatedNewsTitle } = body;

    if (!scriptTitle) {
      return NextResponse.json(
        { success: false, error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    console.log('🎨 サムネイル文言生成開始');
    console.log(`  台本タイトル: ${scriptTitle}`);
    console.log(`  Hook: ${scriptHook?.substring(0, 50)}...`);
    console.log(`  関連ニュース: ${relatedNewsTitle || 'なし'}`);

    // GPT-5でサムネイル文言を生成
    const systemPrompt = `あなたはYouTubeショート動画のサムネイル文言生成のエキスパートです。

【最重要】バズるサムネイル文言の条件:
1. **タイトル**: 7-8文字以内（厳守）
   - 対立構造を使う（例: 数vs体験）
   - 「vs」「=」などの記号でインパクト
   - 一瞬でわかる
   - シンプルに

2. **サブタイトル**: 10文字以内（厳守）
   - 意外性を強調（例: AIの意外な判決）
   - 「意外な〜」「衝撃的な〜」「驚きの〜」
   - 続きが気になる

【必須】5パターン生成:
- 各パターンは異なるアプローチで
- パターン1: 対立構造型（最推奨）
- パターン2: 時事性型
- パターン3: コンセプト明示型
- パターン4: 哲学的インパクト型
- パターン5: 結論先出し型

【禁止事項】:
❌ タイトルが9文字以上
❌ サブタイトルが11文字以上
❌ 難しい専門用語
❌ 長すぎる文章

【JSON形式で返答】:
{
  "patterns": [
    {
      "id": 1,
      "name": "対立構造型（最推奨）",
      "title": "数vs体験",
      "subtitle": "AIの意外な判決",
      "score": 95,
      "reason": "対立構造が明確、一瞬でわかる、バズりやすい"
    },
    ...
  ]
}`;

    const userPrompt = `以下の台本から、バズるサムネイル文言を5パターン生成してください。

【台本タイトル】
${scriptTitle}

【Hook】
${scriptHook || 'なし'}

【Body】
${scriptBody || 'なし'}

【CTA】
${scriptCta || 'なし'}

${relatedNewsTitle ? `【関連ニュース】\n${relatedNewsTitle}` : ''}

【要求事項】:
1. タイトル: 7-8文字以内（厳守）
2. サブタイトル: 10文字以内（厳守）
3. 5パターン生成（異なるアプローチ）
4. 各パターンにスコア（100点満点）と理由を付ける
5. JSON形式で返答

【重要】:
- 台本の内容から「対立構造」「時事性」「意外性」を抽出
- シンプルで強烈なインパクト
- モバイルで読みやすい`;

    console.log('🤖 OpenAI API呼び出し中...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-5はまだサムネ生成には不要、GPT-4oで十分
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI APIからの応答が空です');
    }

    const result = JSON.parse(content);
    console.log('✅ サムネイル文言生成完了');
    console.log(`  生成パターン数: ${result.patterns?.length || 0}`);

    return NextResponse.json({
      success: true,
      patterns: result.patterns || []
    });

  } catch (error: any) {
    console.error('❌ サムネイル生成エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'サムネイル生成中にエラーが発生しました' 
      },
      { status: 500 }
    );
  }
}

