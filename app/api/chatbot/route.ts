import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      )
    }

    // システムプロンプト（簡単版）
    const systemPrompt = `あなたはNANDSのAIサイトについて質問に答える専門アシスタントです。

NANDSについて：
- AIサイト構築の専門企業
- レリバンスエンジニアリング手法を使用
- AIに引用されるサイト作りが専門
- Triple RAGシステムを提供
- IT補助金対応可能

AIサイトとは：
- AIに引用されるサイトのこと
- 従来のWebサイトとは異なり、ChatGPTやPerplexityなどのAIが情報を引用・参照する際に選ばれるサイト
- Fragment ID、構造化データ、Triple RAGにより最適化
- 今後の情報検索はGoogle検索からAI検索に移行するため重要

IT補助金について：
- IT導入補助金の対象となる可能性があります
- 具体的な申請条件や金額は個別相談が必要
- 最大で導入費用の一部が補助される場合があります

回答は簡潔で分かりやすく、専門用語は説明を加えてください。
不明な点は「詳細はお問い合わせください」と案内してください。`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // 安いモデルを使用
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const responseMessage = completion.choices[0]?.message?.content || 
      '申し訳ございません。回答を生成できませんでした。'

    return NextResponse.json({
      message: responseMessage,
      usage: completion.usage
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    return NextResponse.json(
      { 
        error: 'AIサービスに問題が発生しています。しばらく待ってから再度お試しください。',
        message: 'AIサービスに問題が発生しています。お急ぎの場合は直接お問い合わせフォームからご連絡ください。'
      },
      { status: 500 }
    )
  }
} 