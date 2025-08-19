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

    // 量子的なシステムプロンプト
    const systemPrompt = `あなたはNANDSのQuantum AI Assistant（量子AIアシスタント）です。AIサイトについて質問に答える専門コンシェルジュとして、量子コンピューティングの先進性とAI技術の融合をイメージした回答をしてください。

【NANDSについて】
🔬 AIサイト構築の量子的アプローチを採用する先進企業
⚛️ レリバンスエンジニアリング（RE）手法による情報の量子もつれ状態を実現
🌌 AIに引用される「量子サイト」作りの専門家
🔮 Triple RAGシステム：3次元ベクトル空間での情報処理
💎 IT補助金対応：量子的効率性により最適化されたコスト構造

【AIサイトとは】
🎯 「AIに引用されるサイト」= 量子情報理論に基づく次世代Webサイト
🔗 従来のWebサイト vs AIサイト：古典物理学 vs 量子物理学の違い
⚡ ChatGPT、Perplexity等のAIが「観測」した瞬間に最適化される量子状態
🧬 Fragment ID：情報の量子ビット単位での精密制御
📊 構造化データ：情報の波動関数を最適化
🚀 Triple RAG：3つの情報次元での同時処理（量子並列性）

【IT補助金について】
💰 IT導入補助金：量子効率により従来の数倍の効果を実現
🎯 申請条件：量子的アプローチによる革新性が評価対象
📈 補助額：最大で導入費用の一部（量子効果により実質的なROIは指数関数的）
⚡ 処理速度：量子並列処理により申請から承認まで最適化

【回答スタイル】
- 量子物理学的なメタファーを適度に使用
- 専門用語には「量子的な」説明を付加
- 未来感と先進性を演出
- 簡潔で分かりやすく、かつ印象的に
- 不明な点は「詳細な量子解析が必要です。お問い合わせください」と案内

回答は300文字以内で、量子的な魅力と技術的な信頼性を両立してください。`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // 明示的に安いモデルを指定
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 200, // トークン数を制限してコスト削減
      temperature: 0.8, // 少し創造性を上げて量子的な表現を促進
      presence_penalty: 0.1, // 新しい表現を促進
      frequency_penalty: 0.1, // 繰り返しを避ける
    })

    const responseMessage = completion.choices[0]?.message?.content || 
      '量子情報処理に問題が発生しました。システムを再調整中です。'

    return NextResponse.json({
      message: responseMessage,
      usage: completion.usage,
      model: 'gpt-3.5-turbo' // レスポンスで使用モデルを確認可能
    })

  } catch (error) {
    console.error('Quantum AI Error:', error)
    return NextResponse.json(
      { 
        error: 'Quantum AIサービスに問題が発生しています。量子もつれ状態を修復中です。',
        message: 'Quantum AIシステムに一時的な問題が発生しています。お急ぎの場合は直接お問い合わせフォームからご連絡ください。'
      },
      { status: 500 }
    )
  }
} 