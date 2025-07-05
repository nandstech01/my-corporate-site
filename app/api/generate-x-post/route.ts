import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { contentId, title, summary } = await request.json();

    if (!title || !summary) {
      return NextResponse.json(
        { error: 'タイトルと要約が必要です' },
        { status: 400 }
      );
    }

    // 5パターンのX投稿を生成
    const xPosts = await generateXPosts(title, summary);

    return NextResponse.json({
      contentId,
      posts: xPosts,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('X Post generation error:', error);
    return NextResponse.json(
      { error: 'X投稿の生成でエラーが発生しました' },
      { status: 500 }
    );
  }
}

async function generateXPosts(title: string, summary: string) {
  const patterns = [
    {
      name: 'インサイト型',
      prompt: `以下の記事から重要な洞察を抽出し、専門的な視点でX投稿を作成してください：

記事タイトル: ${title}
要約: ${summary}

要件:
- 280文字以内
- 業界の専門家らしい洞察
- ハッシュタグ2-3個
- 引用元の記載
- 専門用語を適切に使用

投稿文のみを生成してください。`
    },
    {
      name: '質問型',
      prompt: `以下の記事を基に、読者の関心を引く質問形式でX投稿を作成してください：

記事タイトル: ${title}
要約: ${summary}

要件:
- 280文字以内
- 読者の関心を引く質問
- 議論を促す内容
- ハッシュタグ2-3個
- 引用元の記載

投稿文のみを生成してください。`
    },
    {
      name: '統計・データ型',
      prompt: `以下の記事から数値やデータを強調したX投稿を作成してください：

記事タイトル: ${title}
要約: ${summary}

要件:
- 280文字以内
- 数値やデータを強調
- 視覚的にインパクトのある表現
- ハッシュタグ2-3個
- 引用元の記載

投稿文のみを生成してください。`
    },
    {
      name: '予測・未来型',
      prompt: `以下の記事から将来の展望や予測を含むX投稿を作成してください：

記事タイトル: ${title}
要約: ${summary}

要件:
- 280文字以内
- 将来の展望や予測
- 読者の関心を引く未来像
- ハッシュタグ2-3個
- 引用元の記載

投稿文のみを生成してください。`
    },
    {
      name: 'アクション型',
      prompt: `以下の記事から読者に行動を促すX投稿を作成してください：

記事タイトル: ${title}
要約: ${summary}

要件:
- 280文字以内
- 読者に具体的な行動を促す
- 実践的なアドバイス
- ハッシュタグ2-3個
- 引用元の記載

投稿文のみを生成してください。`
    }
  ];

  const posts = [];

  for (const pattern of patterns) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `あなたは、AI技術に精通したソーシャルメディアマーケターです。
            
株式会社エヌアンドエス（@nands_tech）のアカウントとして、専門的でありながら親しみやすい投稿を作成します。

投稿の特徴：
- 専門性と親しみやすさのバランス
- 読者の関心を引く内容
- 議論を促す要素
- 適切なハッシュタグの使用
- 引用元の明記

必ず280文字以内で投稿文のみを生成してください。`
          },
          {
            role: 'user',
            content: pattern.prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      
      posts.push({
        type: pattern.name,
        content: content,
        characterCount: content.length
      });

    } catch (error) {
      console.error(`Error generating ${pattern.name} post:`, error);
      posts.push({
        type: pattern.name,
        content: `【${pattern.name}】\n${title}\n\n記事の詳細は弊社ブログをご確認ください。\n\n#AI #技術トレンド #エヌアンドエス`,
        characterCount: 0,
        error: true
      });
    }
  }

  return posts;
} 