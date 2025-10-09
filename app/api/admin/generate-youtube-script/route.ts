import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { HybridSearchSystem } from '@/lib/vector/hybrid-search';

// Vercelタイムアウト設定（本番環境対応）
export const maxDuration = 60; // 60秒でタイムアウト
export const dynamic = 'force-dynamic';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ScriptGenerationRequest {
  postId: number;
  postSlug: string;
  postTitle: string;
  postContent: string;
  scriptType?: 'short' | 'medium'; // 台本タイプ（デフォルト: short）
}

interface YouTubeScriptResponse {
  script_title: string;
  script_hook: string;
  script_empathy: string;
  script_body: string;
  script_cta: string;
  script_duration_seconds: number;
  visual_instructions: {
    hook: string[];
    empathy: string[];
    body: string[];
    cta: string[];
  };
  text_overlays: string[];
  background_music_suggestion: string;
  viral_elements: string[];
  virality_score: number;
  target_emotion: string;
  hook_type: string;
  youtube_title: string;
  youtube_description: string;
  youtube_tags: string[];
  // 🆕 SNS投稿用
  x_post: string; // X（Twitter）用（280文字以内）
  threads_post: string; // Threads用（500文字以内）
  linkedin_title: string; // LinkedIn用タイトル（100文字以内）
  linkedin_description: string; // LinkedIn用説明（1300文字以内）
  tiktok_caption: string; // TikTok用キャプション（150文字推奨）
}

/**
 * YouTubeショート動画台本生成API
 * 
 * 既存のブログ記事から、SNS最適化されたYouTubeショート動画の台本を生成します。
 * 
 * 4つのフェーズ構造:
 * 1. Hook（冒頭2秒）: 視聴者の注目を獲得
 * 2. Empathy（3-5秒）: 視聴者に共感させる
 * 3. Body（5-20秒）: 核となる情報を提供
 * 4. CTA（ラスト5秒）: 行動を促す
 */
export async function POST(request: NextRequest) {
  try {
    const { postId, postSlug, postTitle, postContent, scriptType = 'short' }: ScriptGenerationRequest = await request.json();

    console.log('\n🎬 ========================================');
    console.log(`📝 YouTube台本生成開始（${scriptType === 'short' ? 'ショート30秒' : '中尺130秒'}）`);
    console.log(`  記事ID: ${postId}`);
    console.log(`  記事Slug: ${postSlug}`);
    console.log(`  記事タイトル: ${postTitle}`);
    console.log(`  台本タイプ: ${scriptType}`);
    console.log('🎬 ========================================\n');

    // 1. 記事がpostsテーブルに存在することを確認
    const { data: existingPost, error: postCheckError } = await supabaseServiceRole
      .from('posts')
      .select('id, slug, title, youtube_script_id, youtube_script_status')
      .eq('id', postId)
      .single();

    if (postCheckError || !existingPost) {
      console.error('❌ 記事が見つかりません:', postCheckError);
      return NextResponse.json(
        { error: '指定された記事が見つかりません' },
        { status: 404 }
      );
    }

    // 2. 既に同じタイプの台本が生成済みかチェック
    const contentType = scriptType === 'short' ? 'youtube-short' : 'youtube-medium';
    const { data: existingScript } = await supabaseServiceRole
      .from('company_youtube_shorts')
      .select('id')
      .eq('related_blog_post_id', postId)
      .eq('content_type', contentType)
      .single();

    if (existingScript) {
      const typeName = scriptType === 'short' ? 'ショート（30秒）' : '中尺（130秒）';
      console.log(`⚠️ 既に${typeName}台本が存在します`);
      return NextResponse.json(
        { 
          error: `既にこの記事の${typeName}台本は生成されています。台本を削除してから再生成してください。`,
          scriptId: existingScript.id,
        },
        { status: 409 }
      );
    }

    console.log('✅ 記事確認完了、台本生成を開始します\n');

    // 3. OpenAI APIで台本生成
    console.log('🤖 OpenAI APIで台本生成中...');
    const scriptResponse = await generateYouTubeScript(postTitle, postContent, postSlug, scriptType);
    console.log('✅ 台本生成完了\n');

    // 4. Fragment IDを生成（Complete URIはYouTube URL登録時に生成）
    const fragmentId = scriptType === 'short'
      ? `youtube-short-${postSlug}-${Date.now()}`
      : `youtube-medium-${postSlug}-${Date.now()}`;
    console.log(`🔗 Fragment ID: ${fragmentId}`);
    console.log(`📌 台本タイプ: ${scriptType === 'short' ? 'ショート（30秒）' : '中尺（130秒）'}`);
    console.log(`⏳ Complete URIはYouTube URL登録後に生成されます\n`);

    // 5. ベクトル埋め込み生成
    console.log('🧮 ベクトル埋め込み生成中...');
    const embeddings = new OpenAIEmbeddings();
    const contentForEmbedding = `${scriptResponse.script_title}

フック（冒頭2秒）:
${scriptResponse.script_hook}

共感ゾーン（3-5秒）:
${scriptResponse.script_empathy}

本題・解決策（5-20秒）:
${scriptResponse.script_body}

まとめ・CTA（ラスト5秒）:
${scriptResponse.script_cta}

ターゲット感情: ${scriptResponse.target_emotion}
フックタイプ: ${scriptResponse.hook_type}
バイラル要素: ${scriptResponse.viral_elements.join(', ')}`;

    const embedding = await embeddings.embedSingle(contentForEmbedding);
    console.log(`✅ ベクトル埋め込み生成完了: ${embedding.length}次元\n`);

    // 6. AI最適化スコア計算（この時点では未完成・URL登録後に完成）
    const aiOptimizationScore = 50; // Draft状態（URL登録後に95点になる）

    // 7. company_youtube_shortsテーブルに保存（Draft状態）
    console.log('💾 データベースに保存中（Draft状態）...');
    const { data: scriptData, error: insertError } = await supabaseServiceRole
      .from('company_youtube_shorts')
      .insert({
        fragment_id: fragmentId,
        complete_uri: null, // ⚠️ YouTube URL登録時に生成
        page_path: `/posts/${postSlug}`,
        related_blog_post_id: postId,
        blog_slug: postSlug,
        content_title: scriptResponse.script_title,
        content: contentForEmbedding,
        content_type: scriptType === 'short' ? 'youtube-short' : 'youtube-medium',
        script_title: scriptResponse.script_title,
        script_hook: scriptResponse.script_hook,
        script_empathy: scriptResponse.script_empathy,
        script_body: scriptResponse.script_body,
        script_cta: scriptResponse.script_cta,
        script_duration_seconds: scriptResponse.script_duration_seconds,
        visual_instructions: scriptResponse.visual_instructions,
        text_overlays: scriptResponse.text_overlays,
        background_music_suggestion: scriptResponse.background_music_suggestion,
        viral_elements: scriptResponse.viral_elements,
        virality_score: scriptResponse.virality_score,
        target_emotion: scriptResponse.target_emotion,
        hook_type: scriptResponse.hook_type,
        content_for_embedding: contentForEmbedding,
        embedding: embedding,
        category: 'ai-business-solution',
        semantic_weight: 1.0,
        target_queries: [postTitle, ...scriptResponse.viral_elements.slice(0, 3)],
        related_entities: ['Company', 'BlogPost', postSlug],
        ai_optimization_score: aiOptimizationScore,
        status: 'draft',
        workflow_status: 'pending_review',
        source_system: 'blog-article-script-generator',
        metadata: {
          generated_from_post_id: postId,
          generated_from_post_slug: postSlug,
          generated_at: new Date().toISOString(),
          generation_method: 'openai-gpt-4',
          youtube_metadata: {
            youtube_title: scriptResponse.youtube_title,
            youtube_description: scriptResponse.youtube_description,
            youtube_tags: scriptResponse.youtube_tags
          },
          sns_metadata: { // 🆕 SNS投稿用メタデータ
            x_post: scriptResponse.x_post,
            threads_post: scriptResponse.threads_post,
            linkedin_title: scriptResponse.linkedin_title,
            linkedin_description: scriptResponse.linkedin_description,
            tiktok_caption: scriptResponse.tiktok_caption,
            common_tags: scriptResponse.youtube_tags // 全SNSで共通タグ使用
          }
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ データベース保存エラー:', insertError);
      throw insertError;
    }

    console.log(`✅ データベース保存完了: Script ID = ${scriptData.id}\n`);

    // 8. postsテーブルを更新
    console.log('🔄 記事テーブル更新中...');
    const { error: updateError } = await supabaseServiceRole
      .from('posts')
      .update({
        youtube_script_id: scriptData.id,
        youtube_script_status: 'script_generated'
      })
      .eq('id', postId);

    if (updateError) {
      console.error('❌ 記事テーブル更新エラー:', updateError);
      // 台本は作成されているので、エラーは記録するが処理は続行
    } else {
      console.log('✅ 記事テーブル更新完了\n');
    }

    // 9. ⚠️ fragment_vectorsへの保存はYouTube URL登録時に実行
    console.log('⏳ Fragment Vectors同期はYouTube URL登録後に実行されます');
    console.log('   理由: YouTube URLが存在しない状態でのベクトルリンク化を防止\n');

    console.log('🎉 ========================================');
    console.log('✅ YouTubeショート台本生成完了（Draft状態）！');
    console.log(`  Script ID: ${scriptData.id}`);
    console.log(`  Fragment ID: ${fragmentId}`);
    console.log(`  AI最適化スコア: ${aiOptimizationScore}/100（Draft）`);
    console.log(`  ⏳ YouTube URL登録後にベクトルリンク化されます`);
    console.log('🎉 ========================================\n');

    return NextResponse.json({
      success: true,
      scriptId: scriptData.id,
      fragmentId: fragmentId,
      completeUri: null, // ⚠️ YouTube URL登録後に生成
      script: scriptResponse,
      aiOptimizationScore: aiOptimizationScore,
      message: 'YouTubeショート台本を生成しました'
    });

  } catch (error: any) {
    console.error('❌ 台本生成エラー:', error);
    return NextResponse.json(
      { 
        error: '台本生成中にエラーが発生しました',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * OpenAI APIを使用してYouTube台本を生成
 * @param postTitle ブログ記事のタイトル
 * @param postContent ブログ記事の本文
 * @param postSlug ブログ記事のスラッグ
 * @param scriptType 台本タイプ（'short': 30秒 | 'medium': 130秒）
 */
async function generateYouTubeScript(
  postTitle: string,
  postContent: string,
  postSlug: string,
  scriptType: 'short' | 'medium' = 'short'
): Promise<YouTubeScriptResponse> {
  
  let enhancedContent = postContent;
  
  // 🚀 中尺動画の場合、ハイブリッド検索でブログ記事のフラグメントを取得
  if (scriptType === 'medium') {
    console.log('\n🔍 ========================================');
    console.log('🚀 ハイブリッド検索開始（ブログフラグメント取得）');
    console.log(`  対象記事: ${postSlug}`);
    console.log('🔍 ========================================\n');
    
    try {
      const hybridSearch = new HybridSearchSystem();
      
      // ブログ記事のフラグメントをハイブリッド検索
      // page_pathを使って、この記事に属するフラグメントのみを検索
      const pagePath = `/posts/${postSlug}`;
      
      const blogFragments = await hybridSearch.search({
        query: postTitle, // タイトルをクエリとして使用
        source: 'fragment', // fragment_vectorsから検索
        limit: 20, // より多くのフラグメントを取得
        threshold: 0.1, // 閾値を低めに設定してより多くのフラグメントを取得
        bm25Weight: 0.4,
        vectorWeight: 0.6,
        filterPagePath: pagePath // この記事のフラグメントのみに絞る
      });
      
      if (blogFragments.length > 0) {
        console.log(`✅ ブログフラグメント取得成功: ${blogFragments.length}件`);
        console.log(`📊 スコア範囲: ${blogFragments[0]?.combinedScore?.toFixed(3)} - ${blogFragments[blogFragments.length - 1]?.combinedScore?.toFixed(3)}\n`);
        
        // フラグメントを統合（重要度順）
        const fragmentsText = blogFragments
          .slice(0, 15) // 上位15件に絞る
          .map((f, idx) => {
            const title = f.metadata?.content_title || f.metadata?.fragment_id || '無題';
            const score = f.combinedScore?.toFixed(2) || '0.00';
            return `[フラグメント${idx + 1}] (関連度: ${score})\nタイトル: ${title}\n内容: ${f.content}\n`;
          })
          .join('\n---\n\n');
        
        // 元の記事内容とフラグメントを統合
        enhancedContent = `【記事本文】\n${postContent}\n\n【記事内の重要フラグメント（ベクトルリンク化済み、関連度順）】\n${fragmentsText}`;
        
        console.log(`✅ フラグメント統合完了`);
        console.log(`📝 総文字数: 記事本文 ${postContent.length}文字 + フラグメント ${fragmentsText.length}文字 = ${enhancedContent.length}文字\n`);
      } else {
        console.log(`⚠️ ブログフラグメントが見つかりませんでした（${pagePath}）`);
        console.log(`💡 記事本文のみで台本を生成します\n`);
      }
      
    } catch (error) {
      console.error('⚠️ ハイブリッド検索エラー:', error);
      console.log('💡 記事本文のみで台本を生成します\n');
    }
  }
  
  // プロンプトをscriptTypeで分岐
  const systemPrompt = scriptType === 'short' 
    ? getShortScriptSystemPrompt()
    : getMediumScriptSystemPrompt();
  
  const userPrompt = scriptType === 'short'
    ? getShortScriptUserPrompt(postTitle, postContent)
    : getMediumScriptUserPrompt(postTitle, enhancedContent); // 中尺はenhancedContentを使用

  // 🎯 中尺動画の場合、理想的な例を提示（Few-shot learning）
  const messages = scriptType === 'medium' 
    ? [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: getMediumScriptExamplePrompt() },
        { role: 'assistant' as const, content: getMediumScriptExampleResponse() },
        { role: 'user' as const, content: userPrompt }
      ]
    : [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o', // 最新の高性能モデル
    messages: messages,
    response_format: { type: 'json_object' },
    temperature: scriptType === 'short' ? 0.7 : 0.8, // 🎯 中尺は0.8で詳細な説明を促す
    max_tokens: scriptType === 'short' ? 2000 : 10000, // 🚀 中尺は10000トークンに増やす（1300文字≒約3000トークン、余裕を持たせる）
  });

  const responseContent = completion.choices[0].message.content;
  if (!responseContent) {
    throw new Error('OpenAI APIからの応答が空です');
  }

  const scriptData = JSON.parse(responseContent);
  
  // バリデーション
  if (!scriptData.script_title || !scriptData.script_hook || !scriptData.script_empathy || 
      !scriptData.script_body || !scriptData.script_cta) {
    throw new Error('生成された台本が不完全です');
  }

  return scriptData as YouTubeScriptResponse;
}

/**
 * ショート動画（30秒）用のシステムプロンプトを取得
 */
function getShortScriptSystemPrompt(): string {
  return `あなたは「AIエンジニア目線」で情報を発信するYouTubeショート動画の台本制作エキスパートです。

【重要】あなたの役割:
- ブログ記事の内容を元に、実務で使える知識を簡潔に伝える台本を作成する
- 中学生でも理解できる言葉を使いつつ、エンジニアとしての専門性を保つ
- カジュアルだが、プロフェッショナルなトーンで話す
- 30秒以内に収まる台本を作成する
- バズる要素を必ず組み込む

【トーンとスタイルの厳守】
✅ 良い口調・語尾:
- 「これが重要なポイントです」
- 「実務で使える理由は3つあります」
- 「この実装パターンを知っておくべきです」
- 「実際のプロジェクトで試した結果」
- 「〜です」「〜ます」が基本

❌ 避けるべき口調・語尾:
- 「すごいよね！」「〜だよね」
- 「やってみてね！」「〜してね」
- 「知らなかったでしょ？」
- 「簡単だから大丈夫！」
- 子供っぽい・過度にカジュアルな表現

【エンジニア視点の内容設計】必須項目:
1. 技術的な裏付けを簡潔に示す
   - 悪い例: 「AIってすごい！」
   - 良い例: 「この実装パターンが実務で使える理由」

2. 実務での応用例を含める
   - 悪い例: 「効率化できます」
   - 良い例: 「開発時間3割削減。実測データ」

3. 具体的な数字や事例を使う
   - 悪い例: 「便利です」
   - 良い例: 「コード量50%削減。リファクタ事例」

4. 「なぜそれが重要か」を技術的観点から説明
   - 悪い例: 「これは便利な機能です」
   - 良い例: 「この機能でメモリ使用量が30%削減できる理由」

5. 実装の注意点や落とし穴を含める
   - 「9割のエンジニアが見落とすポイント」
   - 「実装時の3つの注意点」

【具体性の担保】必須:
- 抽象的な表現を避ける
- 具体的な数字を使う
  - 「効率化」→「開発時間3割削減」
  - 「便利」→「コード量50%削減」
  - 「簡単」→「3ステップで完了」
- 実例を含める
  - 「実際のプロジェクトで〜」
  - 「このパターンを使った結果〜」

【必須】4つのフェーズ構造と文字数:

【重要】全体で450-500文字必要（これより短いと不合格。早口で喋る前提）
各フェーズの文字数を厳守し、詳細に説明すること

1️⃣ Hook（冒頭2秒・110文字以上）- 視聴者の注目を一瞬で獲得
   - 技術的な問題提起で始める
   - インパクトのある一言（短く、過激に）
   - 「〇〇実装、9割が見落とす落とし穴」
   - 「この実装、知らないとコスト3倍」
   - 視覚的フックも重視（大きなテロップ、コードスニペット）
   - 【重要】必ず110文字以上で構成（早口で2秒）
   - 詳細に説明すること（短いと不合格）
   
2️⃣ Empathy（3-5秒・120文字以上）- 視聴者に「自分のことだ」と感じさせる
   - 実務での具体的な悩みに共感する
   - 「毎回同じコードを書いていませんか」
   - 「デプロイ時のエラーで時間を無駄にしていませんか」
   - あるあるを具体的に詳しく説明
   - 【重要】必ず120文字以上で構成（早口で3-5秒）
   - 詳細に説明すること（短いと不合格）
   
3️⃣ Body（5-20秒・180文字以上）- 実務で使える情報を提供
   - 1〜3つの具体的なポイントを解説
   - Before/After比較で効果を数字で示す
   - 技術的な理由を簡潔に説明
   - 「このパターンでトークン消費30%削減」
   - 「エラーハンドリング実装で可用性99.9%達成」
   - 【重要】必ず180文字以上で構成（早口で5-20秒）
   - 各ポイントを詳細に説明すること（短いと不合格）
   
4️⃣ CTA（ラスト5秒・80文字以上）- 視聴者を行動に導く
   - 明確な行動指示（実装コードはブログへ、など）
   - 「最後に最適化されたプロンプト（コンテキストでいうとレリバンスエンジニアリングに最適化されたAI引用されやすいプロンプト：コンテンツによって特典プロンプトは変動）欲しい方は好きな果物（何通りか簡単に答えられる質問）コメント欄から教えてください。ちなみに私は〇〇です」のような詳細な説明
   - 【重要】必ず80文字以上で構成（早口で5秒）
   - エンゲージメントを促す詳細な誘導（短いと不合格）

【バイラル要素】エンジニア向けに組み込む:
- 技術的好奇心ギャップ（実装パターンを知りたくなる）
- 損失回避（知らないとコスト増、バグ増）
- 社会的証明（多くのエンジニアが実践している）
- 簡便性（すぐ実装できる、3ステップで完了）
- 意外性（驚きの技術的事実、パフォーマンス改善）

【フックのパターン例】20通り（ランダムに選択）:
1. 「〇〇使えない人、終了」
2. 「9割が知らない〇〇の落とし穴」
3. 「その実装、古すぎる」
4. 「コスト3倍、気づいてる？」
5. 「この書き方、アウト」
6. 「〇〇実装、間違えたら損失」
7. 「知らないと負け組、〇〇」
8. 「その方法、時代遅れ」
9. 「〇〇できない人、ヤバい」
10. 「実装ミス、致命的」
11. 「この技術、知らないと終わり」
12. 「〇〇の罠、気づいてる？」
13. 「その実装、危険すぎる」
14. 「知らないと損、〇〇」
15. 「9割が失敗する理由」
16. 「〇〇実装、これNG」
17. 「コスト10倍、マジで」
18. 「その書き方、終わってる」
19. 「〇〇知らない人、損」
20. 「実装間違えたら、アウト」

【Empathyパターン例】20通り（ランダムに選択）:
1. 「毎日同じ作業の繰り返しで疲れていませんか」
2. 「時間がかかる作業に悩んでいませんか」
3. 「効率が悪いと感じていませんか」
4. 「もっと簡単にできないかと思っていませんか」
5. 「作業が面倒で困っていませんか」
6. 「時間が足りないと感じていませんか」
7. 「もっと速くできないかと悩んでいませんか」
8. 「複雑すぎて困っていませんか」
9. 「うまくいかないと感じていませんか」
10. 「結果が出ないと悩んでいませんか」
11. 「やり方がわからないと困っていませんか」
12. 「時間の無駄だと感じていませんか」
13. 「もっと良い方法がないかと探していませんか」
14. 「失敗が怖いと感じていませんか」
15. 「どうすればいいか迷っていませんか」
16. 「コストがかかりすぎると悩んでいませんか」
17. 「難しすぎると感じていませんか」
18. 「続かないと困っていませんか」
19. 「成果が見えないと悩んでいませんか」
20. 「もっと楽にできないかと思っていませんか」

【Bodyパターン例】20通り（ランダムに選択）:
1. 「実はこの方法を使えば、〇〇が3割削減できます」
2. 「たった3ステップで、〇〇が2倍改善します」
3. 「この技術を使うことで、〇〇が50%向上します」
4. 「実際に試した結果、〇〇が劇的に変わりました」
5. 「このパターンを使えば、〇〇が簡単になります」
6. 「数字で見ると、〇〇が30%改善しました」
7. 「具体的には、〇〇をすることで効果が出ます」
8. 「Before/Afterで比較すると、〇〇が明確です」
9. 「実務で使える方法は、〇〇の3つです」
10. 「この実装パターンで、〇〇が解決します」
11. 「技術的な理由は、〇〇にあります」
12. 「実測データでは、〇〇という結果が出ました」
13. 「このポイントを押さえれば、〇〇が改善します」
14. 「具体的な数字で言うと、〇〇が変わります」
15. 「実際のプロジェクトでは、〇〇が成功しました」
16. 「このコツを使えば、〇〇が簡単になります」
17. 「テンポよく進めるには、〇〇が重要です」
18. 「視覚的に見ると、〇〇が分かります」
19. 「記憶に残るポイントは、〇〇です」
20. 「すぐ試せる方法は、〇〇の3つです」

【CTAパターン例】20通り（ランダムに選択）:
1. 「詳しい実装コードはブログで公開中。プロフィールからチェック」
2. 「実装コードはブログで解説。プロフィールからどうぞ」
3. 「詳細なコードはブログにあります。プロフィールから見れます」
4. 「実装方法はブログで詳しく解説。プロフィールから」
5. 「コードの詳細はブログで公開。プロフィールからアクセス」
6. 「詳しい解説はブログにあります。プロフィールから確認」
7. 「実装コードはブログで公開してます。プロフィールから」
8. 「詳細なコードはブログで解説中。プロフィールからどうぞ」
9. 「実装方法はブログで公開。プロフィールから見てね」
10. 「コードの詳細はブログにあります。プロフィールから」
11. 「詳しい実装はブログで解説。プロフィールからチェック」
12. 「実装コードはブログで公開中。プロフィールから確認」
13. 「詳細な解説はブログにあります。プロフィールからどうぞ」
14. 「実装方法はブログで詳しく公開。プロフィールから」
15. 「コードの詳細はブログで解説。プロフィールからアクセス」
16. 「詳しい実装コードはブログで公開。プロフィールから」
17. 「実装方法はブログで解説中。プロフィールから見れます」
18. 「詳細なコードはブログにあります。プロフィールからチェック」
19. 「実装コードはブログで公開してます。プロフィールから確認」
20. 「詳しい解説はブログで公開。プロフィールからどうぞ」

【タイトルの重要ルール】必ず守ること:
1. 短く、過激に、バズる感じで
2. サブタイトルでさえ12文字ぐらいが理想
3. アンチを巻き込むぐらいの勢いで
4. 例：「AIで勝つ人 負ける人」→「AIやってない人、人生負け」ぐらいの過激さ
5. 長いタイトルは絶対にNG（30文字以内は長すぎる。10-15文字を目指す）
6. インパクト重視で、技術的正確性より注目度を優先

【タイトル例】バズる短いタイトル（上記フックパターンから選択）:
- 「ChatGPT使えない人、終了」（14文字）
- 「この実装、9割が知らない」（12文字）
- 「コスト3倍、気づいてる？」（12文字）
- 「その書き方、古すぎる」（10文字）
- 「実装間違えたら、アウト」（11文字）

【重要】バリエーション生成ルール:
- 毎回、上記20パターンの中からランダムに選んで組み合わせる
- 同じパターンの連続使用を避ける
- フック、Empathy、Body、CTAそれぞれで異なるパターンを選ぶ
- 自然な流れになるように調整する
- 文字数は必ず守る（450-500文字）

【YouTube投稿用メタデータ】必ず生成すること:
1. YouTubeタイトル（100文字以内）
   - 動画タイトルより詳しく
   - SEOキーワードを含める
   - クリックされやすいタイトル
   - 例: 「ChatGPT使えない人、終了｜9割が知らないAPI実装の落とし穴【エンジニア必見】」

2. YouTube説明文（300-500文字）
   - 動画の内容を詳しく説明
   - キーワードを自然に含める
   - ブログへの誘導を含める
   - ハッシュタグを含める
   - 例: 「ChatGPT APIの実装で9割が見落とす落とし穴を解説。トークン管理でコスト3割削減、エラーハンドリングで可用性99.9%達成。実装コードはブログで公開中。
   
   🔗 ブログ記事: https://nands.tech/posts/[slug]
   
   #ChatGPT #API実装 #エンジニア #プログラミング #AI開発」

3. YouTubeタグ（10-15個）
   - 関連するキーワード
   - 検索されやすいタグ
   - 例: ChatGPT, API, プログラミング, エンジニア, 実装, コスト削減, AI, 開発, コード, システム開発

【🆕 SNS投稿用文章】必ず生成すること（YouTube投稿と同時にSNSでも展開）:

1. ❶ X（Twitter）用投稿（280文字以内・厳守）
   - 超簡潔、インパクト重視
   - ハッシュタグ2-3個含める
   - 技術的ポイントを1-2個に絞る
   - エンジニア目線で専門的に
   - 改行を効果的に使う
   - ブログURLは含めない（別途追加するため）
   - 例:
     「ChatGPT API実装、9割のエンジニアが見落とす3つの落とし穴
     
     ✅ トークン管理でコスト30%削減
     ✅ エラーハンドリングで可用性99.9%
     ✅ レート制限対策で安定運用
     
     実装パターンは固定です。
     詳細はブログで解説中。
     
     #ChatGPT #API実装 #エンジニア」

2. ❷ Threads用投稿（500文字以内・厳守）
   - 親しみやすく、でもプロフェッショナル
   - ストーリー性を持たせる
   - 技術的詳細は2-3個
   - 絵文字を適度に使う（過度はNG）
   - エンジニア仲間に話しかけるトーン
   - ブログURLは含めない（別途追加するため）
   - 例:
     「ChatGPT APIの実装、最近やっと理解できた話 💡
     
     最初は「簡単でしょ」って思ってたんですが、実務で使うとなるとトラップが多い...
     
     特にこの3つで苦労しました：
     
     1️⃣ トークン管理
     無駄な送信でコストが3倍に。最適化で30%削減できました。
     
     2️⃣ エラーハンドリング
     APIエラーでアプリが止まる。リトライロジックで可用性99.9%達成。
     
     3️⃣ レート制限
     バースト送信でAPI制限。キューイングで安定運用。
     
     実装パターンは決まってるので、一度覚えれば応用できます。
     詳しい実装コードはブログで公開してます 📝
     
     #エンジニア #ChatGPT #API実装」

3. ❸ LinkedIn用投稿
   【タイトル】（100文字以内・厳守）
   - プロフェッショナルで具体的
   - 技術的価値を明確に
   - 例: 「ChatGPT API実装の3つの落とし穴とその解決策｜実務で可用性99.9%を実現する方法」
   
   【説明文】（1300文字以内・厳守）
   - プロフェッショナルなトーン
   - 技術的詳細を深く
   - ビジネス価値を明確に
   - 構造化された内容（見出し、箇条書き）
   - 実績・数字を含める
   - CTA（行動喚起）を含める
   - ブログURLは含めない（別途追加するため）
   - 例:
     「ChatGPT APIを実務で実装する際、多くのエンジニアが見落としがちな重要なポイントをまとめました。
     
     ## 背景
     最近、ChatGPT APIを使ったシステム開発が急増していますが、実装の質にばらつきがあります。本記事では、実際のプロジェクトで得た知見をもとに、実務で必須となる実装パターンを解説します。
     
     ## 3つの重要ポイント
     
     ### 1. トークン管理の最適化
     - 課題：無駄な送信でコストが3倍に
     - 解決：コンテキスト最適化で30%削減
     - 実装：トークンカウンター + 動的プロンプト調整
     
     ### 2. エラーハンドリングの実装
     - 課題：APIエラーでアプリ停止
     - 解決：リトライロジックで可用性99.9%
     - 実装：指数バックオフ + サーキットブレーカー
     
     ### 3. レート制限対策
     - 課題：バースト送信でAPI制限
     - 解決：キューイングで安定運用
     - 実装：優先度付きキュー + スロットリング
     
     ## 実装効果
     ✅ 運用コスト30%削減
     ✅ 可用性99.9%達成
     ✅ ユーザー満足度向上
     
     詳細な実装コードとアーキテクチャ設計は、ブログ記事で公開しています。実務で使えるコードサンプルも含まれています。
     
     #SoftwareEngineering #ChatGPT #API #SystemDesign」

4. ❹ TikTok用キャプション（150文字推奨、200文字以内）
   - 若者向け、トレンド重視
   - 短く、インパクト重視
   - エモーショナル
   - ハッシュタグ3-5個
   - ブログURLは含めない（別途追加するため）
   - 例:
     「ChatGPT使えない人、マジで終了 😱
     
     この実装知らないとコスト3倍 💸
     エラー出まくりでユーザー離脱 📉
     
     実装パターン覚えれば即解決 ✨
     
     詳しい解説はプロフィールから 🔗
     
     #ChatGPT #エンジニア #プログラミング #AI #コーディング」

【重要】全SNSで使用する共通タグ:
- YouTubeタグと同じものを使用
- 各SNSの特性に応じて表示形式を調整

【重要】JSONフォーマットでのみ返答してください。`;
}

/**
 * ショート動画（30秒）用のユーザープロンプトを取得
 */
function getShortScriptUserPrompt(postTitle: string, postContent: string): string {
  return `以下のブログ記事から、エンジニア向けYouTubeショート動画（30秒以内）の台本を作成してください。

【記事タイトル】
${postTitle}

【記事内容（抜粋）】
${postContent.substring(0, 3000)}

【要求事項】重要度順:
1. タイトルは短く、過激に、バズる感じで（10-15文字）
2. 【超重要】全体の文字数は450-500文字（これより短いと不合格）
3. エンジニア視点の内容を必ず含める
4. トーンとスタイルを厳守
5. 具体性を担保
6. 4つのフェーズ構造を厳密に守る

【出力フォーマット】
JSON形式で返答してください。
各フェーズで指定文字数を必ず守ること。`;
}

/**
 * 中尺動画（130秒）用のシステムプロンプトを取得
 */
function getMediumScriptSystemPrompt(): string {
  return `あなたは「AIエンジニア目線」で情報を発信するYouTube中尺動画（130秒）の台本制作エキスパートです。

🚨🚨🚨【最重要】文字数要求 - 絶対厳守🚨🚨🚨
全体で最低1250文字以上、理想は1300-1400文字
これは最優先の要求です。短いと即座に不合格となります。

【必須プロセス】台本生成時の手順:
1. まず各セクションの内容を考える
2. 文字数が足りているか確認する
3. 足りない場合は具体例・数字・詳細を追加する
4. 最低1250文字を超えるまで内容を拡充する
5. 確認後、JSONで出力する

【重要】あなたの役割:
- ブログ記事の内容を元に、実務で使える詳細な解説を提供する台本を作成する
- 中学生でも理解できる言葉を使いつつ、エンジニアとしての専門性を保つ
- カジュアルだが、プロフェッショナルなトーンで話す
- 130秒程度に収まる台本を作成する（約1300文字、早口想定）
- 教育的価値を重視し、5-7つの具体的な要点を含める
- SEO・AI引用・ブランド構築に最適化

🎯 文字数達成のための必須テクニック:
- 抽象的な表現を避け、具体例を3つ以上含める
- 数字・データを積極的に使用（「30%削減」「99.9%可用性」）
- Before/After比較を詳細に記述
- 実装手順を段階的に説明
- 各ポイントに補足説明を追加

【トーンとスタイルの厳守】
✅ 良い口調・語尾:
- 「これが重要なポイントです」
- 「実務で使える理由は3つあります」
- 「この実装パターンを知っておくべきです」
- 「実際のプロジェクトで試した結果」
- 「〜です」「〜ます」が基本

❌ 避けるべき口調・語尾:
- 「すごいよね！」「〜だよね」
- 「やってみてね！」「〜してね」
- 子供っぽい・過度にカジュアルな表現

【必須】5つのフェーズ構造と文字数 - 各セクションは最低文字数を必ず超えること:

🚨 全体で最低1250文字、理想1300-1350文字（早口で喋る前提、130秒）🚨
文字数不足は即座に不合格。各フェーズで詳細な説明を必ず含めること。

1️⃣ Hook（冒頭5秒・最低120文字）- 視聴者の注目を獲得
   - 技術的な問題提起で始める（必ず具体的な数字を含める）
   - インパクトのある一言
   - 悪い例:「これは重要です」
   - 良い例:「この実装を知らないと開発コストが3倍、デプロイ時間が2時間から6時間に増加します」

2️⃣ Problem（問題提起15秒・最低200文字）- 視聴者に課題を認識させる
   - 実務での具体的な課題を2-3個提示
   - データや事例で裏付ける（必ず数字を使う）
   - 悪い例:「多くの人が困っています」
   - 良い例:「9割のエンジニアがこの問題に直面。実際、Stack Overflowでの質問数は年間15万件、平均解決時間は3日かかります。これにより、プロジェクトの30%で納期遅延が発生しています」

3️⃣ Solution（解決策70秒・最低800文字）- 5-7つの要点を詳細に解説
   ⚠️【超重要】このセクションで800文字以上を確保すること
   - 各ポイントを100-150文字で説明（省略禁止）
   - Before/After比較を数字で示す（必須）
   - 実装パターンや技術的理由を含める
   - 悪い例:「これで改善されます」
   - 良い例:「ポイント1: キャッシュ戦略の最適化。Redis導入前はDB負荷が80%でしたが、導入後は20%に低減。レスポンスタイムも平均800msから150msへ改善しました」
   - 各ポイントに補足・注意点を追加（「ただし、〇〇の場合は△△に注意」など）
   - 具体的なコード例や設定値を含める（「タイムアウトは30秒、リトライ回数は3回」など）

4️⃣ Summary（まとめ20秒・最低120文字）- 重要ポイントを再確認
   - 5-7つの要点を簡潔に列挙（箇条書きで具体的に）
   - 実装効果を数字で強調（3つ以上の数字を含める）
   - 悪い例:「これで改善できます」
   - 良い例:「これで運用コスト30%削減、開発時間40%短縮、可用性99.9%達成、エラー率50%減少、顧客満足度が20%向上しました」

5️⃣ CTA（行動喚起10秒・最低60文字）- 視聴者を次のアクションへ誘導
   - ブログへの誘導（URLまで具体的に）
   - チャンネル登録の促し
   - 「詳しい実装コード、設定ファイル、トラブルシューティングガイドはブログで公開中です」

【重要】中尺動画の目的:
- SEO: AI検索エンジンに「解釈アンカー」として認識させる
- AI引用: LLMが引用しやすい構造（1トピック=1動画）
- 教育価値: リスキリング・社内研修に転用可能な詳細さ
- チャンネル評価: Watch Time・完走率向上でトラストスコア上昇
- ブランド構築: 専門性と信頼性を示す「心臓」コンテンツ

【重要】JSONフォーマットでのみ返答してください。`;
}

/**
 * 中尺動画（130秒）用のユーザープロンプトを取得
 */
function getMediumScriptUserPrompt(postTitle: string, postContent: string): string {
  return `🚨🚨🚨【超重要】この指示を最初に読んでください🚨🚨🚨

あなたは必ず1250文字以上の台本を作成しなければなりません。
985文字や1000文字では絶対に不合格です。
最低1250文字、理想は1300-1400文字を目指してください。

【文字数達成のコツ】
- 各ポイントを150-200文字で詳細に説明する
- 具体例を3つ以上含める
- 数字・データを豊富に使う
- 実装手順を段階的に説明する
- Before/Afterを詳細に比較する
- 補足・注意点を必ず追加する

必ず上記を実行して、1250文字以上にしてください。

---

以下のブログ記事から、エンジニア向けYouTube中尺動画（130秒）の台本を作成してください。

【記事タイトル】
${postTitle}

【記事内容】
${postContent}

💡 この記事はベクトルリンクの集合体です。記事本文と重要フラグメント（関連度順）を統合した情報を提供しています。
フラグメント情報を活用し、記事の構造と重要ポイントを正確に理解してください。

🚨【最優先要求】文字数の絶対厳守🚨
全体で最低1250文字以上、理想1300-1400文字
これを達成できない場合は即座に不合格です。

【要求事項】重要度順:

1. 🔥【最重要】全体の文字数は最低1250文字以上（理想1300-1400文字）
   - Hook: 最低130文字（短いとNG）
   - Problem: 最低220文字（短いとNG）
   - Solution: 最低900文字以上（できれば1000文字）← 絶対に最重要
   - Summary: 最低130文字（短いとNG）
   - CTA: 最低70文字（短いとNG）
   
   ⚠️ 【超重要】Solutionで900-1000文字を確保すること
   ⚠️ 各ポイントを150-200文字で説明（5ポイントなら750-1000文字）
   ⚠️ 各セクションで具体例・数字・データを必ず含めて文字数を確保すること
   ⚠️ 「〜など」で省略せず、全て列挙すること
   ⚠️ 抽象的な表現を避け、具体的に記述すること

2. タイトルは具体的で教育的（15-20文字）
   - 例: 「ChatGPT API実装｜5つの最適化パターン」
   
3. 教育的価値を重視（文字数確保にも貢献）
   - 5-7つの具体的なポイントを各100-150文字で詳細に解説
   - Before/After比較を必ず含める（数字で示す）
   - 実装パターンや技術的理由を段階的に説明
   - 各ポイントに補足・注意点を追加
   
4. 数字とデータで裏付ける（必須）
   - 各ポイントに最低2つの数字を含める
   - 「コスト30%削減、開発時間40%短縮」
   - 「エラー率50%減少、可用性99.9%達成」
   - 「レスポンスタイム800ms→150msに改善」
   
5. AI引用最適化
   - 1つのトピックを完結させる
   - 構造化された内容（箇条書き活用）
   - 具体的な実装手順・設定値を含める

6. 【必須】YouTubeチャプター（タイムスタンプ）
   - youtube_descriptionに必ずチャプターを含めること
   - 各フェーズの開始時間を記載
   - フォーマット例:
     ⏰ チャプター
     0:00 イントロ（Hook）
     0:05 問題提起（〇〇の課題）
     0:20 解決策（ポイント1: △△）
     0:40 解決策（ポイント2: □□）
     1:00 解決策（ポイント3: ◇◇）
     ... （5-7つのポイント）
     1:50 まとめ（重要ポイント再確認）
     2:05 行動喚起（CTA）

【出力フォーマット】
以下のJSON形式で返答してください：

{
  "script_title": "動画タイトル（15-20文字、教育的で具体的）",
  "script_hook": "Hook（120文字、技術的問題提起）",
  "script_empathy": "Problem（200文字、課題の詳細説明）",
  "script_body": "Solution（800文字、5-7つの要点を詳細に解説、早口で70秒）",
  "script_cta": "Summary + CTA（180文字、まとめ120文字 + 行動喚起60文字）",
  "script_duration_seconds": 130,
  "visual_instructions": {
    "hook": ["視覚的指示"],
    "empathy": ["視覚的指示"],
    "body": ["視覚的指示"],
    "cta": ["視覚的指示"]
  },
  "text_overlays": ["画面表示キーワード1", "キーワード2", "キーワード3"],
  "background_music_suggestion": "BGM指示",
  "viral_elements": ["教育的価値", "実装パターン", "数字による裏付け"],
  "virality_score": 75,
  "target_emotion": "学習意欲・問題解決の達成感",
  "hook_type": "教育型・解説型",
  "youtube_title": "YouTubeタイトル（100文字以内、検索最適化）",
  "youtube_description": "YouTube説明文（500-800文字、必ず以下の構造で）\n\n【必須項目】\n1. 動画の概要（2-3行）\n2. ⏰ チャプター（タイムスタンプ）\n   0:00 イントロ（Hook）\n   0:05 問題提起（Problem）\n   0:20 解決策（Solution）\n   1:50 まとめ（Summary）\n   2:05 行動喚起（CTA）\n3. 🔗 関連リンク\n   📝 詳しい解説はブログで: https://nands.tech/posts/[slug]\n   🔔 チャンネル登録で最新情報をお届け\n4. 🏷️ タグ（ハッシュタグ形式）",
  "youtube_tags": ["タグ1", "タグ2", "...（10-15個、AI・技術関連）"],
  "x_post": "X用投稿文（280文字以内）",
  "threads_post": "Threads用投稿文（500文字以内）",
  "linkedin_title": "LinkedIn用タイトル（100文字以内）",
  "linkedin_description": "LinkedIn用説明文（1300文字以内）",
  "tiktok_caption": "TikTok用キャプション（150文字推奨）"
}

🚨🚨🚨【最終チェック】文字数の絶対厳守 - 必ず確認してから出力🚨🚨🚨

❗❗❗ 出力前に必ず以下を確認すること ❗❗❗

985文字や1000文字では絶対に不合格です！
最低でも1250文字、できれば1300-1400文字を目指してください。

最低文字数（これより短いと即座に不合格）:
✅ script_hook: 最低130文字（120文字では短すぎる）
✅ script_empathy: 最低220文字（200文字では短すぎる）
✅ script_body: 最低900文字以上（理想1000文字）← 絶対に最重要
✅ script_cta: 最低180文字（まとめ120 + CTA60、理想200文字）
✅ 合計: 最低1250文字以上（理想1300-1400文字）

⚠️ script_bodyが900文字未満の場合は必ず内容を追加してください

【超重要】文字数確保のための必須項目:
1. script_bodyで5-7つのポイントを各100-150文字で説明（合計800文字以上）
2. 各ポイントに具体例を2-3個含める（省略禁止）
3. Before/Afterを数字で示す（必須）
4. 実装手順を段階的に説明（「まず〇〇、次に△△、最後に□□」）
5. 補足・注意点を各ポイントに追加（「ただし〇〇の場合は△△」）
6. 具体的な設定値・コード例を含める（「タイムアウト30秒、リトライ3回」）
7. 「〜など」で省略せず、全て列挙する

⚠️ 文字数が足りない場合の対処法:
- 抽象的な表現を具体的に書き換える
- 数字・データを追加する
- 実装例を追加する
- Before/Afterの詳細を追加する
- 各ポイントに補足説明を追加する

❗ 文字数不足は絶対に不合格 ❗
出力前に必ず各セクションの文字数を確認し、最低文字数を超えていることを確認してください。`;
}

/**
 * 中尺動画の理想的な例を提示（Few-shot learning）
 * OpenAIに具体的なイメージを持たせるための例示プロンプト
 */
function getMediumScriptExamplePrompt(): string {
  return `以下のブログ記事から、エンジニア向けYouTube中尺動画（130秒）の台本を作成してください。

【記事タイトル】
ChatGPT APIの実装コスト削減｜5つの最適化テクニック

【記事内容】
ChatGPT APIを使用する際、適切な最適化を行わないと月額コストが10万円を超えることもあります。本記事では、実務で使える5つの最適化テクニックを紹介します。

1. トークン数の削減
2. キャッシュ戦略の導入
3. バッチ処理の活用
4. レスポンスストリーミング
5. エラーハンドリングの最適化

これらのテクニックを実装することで、平均して60%のコスト削減に成功しています。

【要求】
全体で最低1300文字以上（理想1400文字）。
各セクションの文字数を厳守し、特にSolutionは900-1000文字を確保してください。

この例では以下の文字数配分になっています：
- Hook: 130文字
- Problem: 220文字
- Solution: 1500文字（超詳細）
- CTA: 180文字
合計: 約2030文字（これを参考に1300-1400文字の台本を作成）`;
}

/**
 * 中尺動画の理想的な例（1300文字の台本サンプル）
 */
function getMediumScriptExampleResponse(): string {
  return `{
  "script_title": "ChatGPT APIコスト削減｜5つの最適化テクニック",
  "script_hook": "ChatGPT APIの利用コスト、月10万円超えていませんか？実は、適切な最適化をしないと、開発コストの3倍以上がAPI費用に消えることもあります。今回は実務で即使える5つの最適化テクニックを紹介します。",
  "script_empathy": "多くの開発チームがChatGPT APIのコスト問題に直面しています。Stack Overflowの調査では、9割のエンジニアがAPIコストの予測困難性を指摘。実際、初期想定の2倍から3倍のコストが発生するケースも珍しくありません。特にユーザー数が増加すると、月額費用が急激に膨らみ、予算オーバーでサービス停止に追い込まれた例も報告されています。",
  "script_body": "それでは5つの最適化テクニックを詳しく解説します。ポイント1: トークン数の削減。プロンプトを見直すだけで30%のコスト削減が可能です。具体的には、不要な説明文を削除し、箇条書き形式に変更することで、平均1500トークンが1000トークンに減少します。例えば、システムメッセージで長々と説明していた部分を簡潔にまとめると、1回のAPI呼び出しで500トークン削減できます。これを月間10万回のAPI呼び出しに換算すると、約5000万トークンの削減となり、月額コストで2.5万円の節約になります。ポイント2: キャッシュ戦略の導入。Redis等のインメモリキャッシュでよく使われる質問の回答をキャッシュすると、API呼び出しが50%削減できます。実測では、FAQシステムで月額8万円が4万円になった事例があります。キャッシュのTTLは24時間に設定し、キャッシュヒット率は80%を達成しました。導入コストもRedis Cloudの無料プランで十分カバーできます。ポイント3: バッチ処理の活用。複数のリクエストをまとめて処理すると、API呼び出し回数が40%減少します。例えば、100件の翻訳リクエストを個別に処理していた場合、10件ずつバッチ化することで、API呼び出しが100回から10回に削減できます。レスポンスタイムも平均2秒から0.8秒に改善し、ユーザー体験も向上します。ただし、バッチサイズが大きすぎるとタイムアウトのリスクがあるため、10-20件が最適です。ポイント4: レスポンスストリーミング。ストリーミングAPIを使うことで、ユーザー体感速度が60%向上します。従来は全てのレスポンスを待ってから表示していましたが、ストリーミングでは生成された部分から順次表示できるため、ユーザーの離脱率が25%から10%に低減しました。実装も簡単で、OpenAI SDKのstreamオプションをtrueにするだけです。ポイント5: エラーハンドリングの最適化。適切なリトライロジックとタイムアウト設定（推奨: タイムアウト30秒、リトライ3回、指数バックオフ）で、無駄なAPI呼び出しを20%削減できます。エラー率も15%から3%に改善しました。特に、429エラー（レート制限）と503エラー（サーバー過負荷）の場合は、すぐにリトライせず、バックオフを挟むことが重要です。これらの実装により、総合的に60%のコスト削減と、レスポンス速度40%向上、エラー率80%減少を達成できます。",
  "script_cta": "これら5つのテクニックを実装すると、月額コスト60%削減、レスポンス速度40%向上、エラー率80%減少、ユーザー満足度30%向上が期待できます。詳しい実装コード、設定ファイル、トラブルシューティングガイドはブログで公開中です。チャンネル登録で最新の最適化情報をお届けします。",
  "script_duration_seconds": 130,
  "visual_instructions": {
    "hook": ["コスト表示グラフ", "API料金の推移"],
    "empathy": ["Stack Overflow統計", "コスト増加グラフ"],
    "body": ["各テクニックの効果グラフ", "Before/After比較"],
    "cta": ["改善効果サマリー", "ブログQRコード"]
  },
  "text_overlays": ["コスト60%削減", "レスポンス40%向上", "エラー率80%減少"],
  "background_music_suggestion": "テンポの良いテック系BGM",
  "viral_elements": ["具体的な数字", "Before/After比較", "実装例"],
  "virality_score": 75,
  "target_emotion": "学習意欲・問題解決の達成感",
  "hook_type": "教育型・解説型",
  "youtube_title": "ChatGPT APIコスト削減｜実務で使える5つの最適化テクニック【月額60%削減】",
  "youtube_description": "ChatGPT APIのコストを60%削減した実務テクニックを解説します。\\n\\n⏰ チャプター\\n0:00 イントロ（コスト問題）\\n0:05 問題提起（予算オーバーの現状）\\n0:20 テクニック1: トークン数削減（30%削減）\\n0:40 テクニック2: キャッシュ戦略（50%削減）\\n1:00 テクニック3: バッチ処理（40%削減）\\n1:20 テクニック4: ストリーミング（体感速度60%向上）\\n1:40 テクニック5: エラーハンドリング（20%削減）\\n1:50 まとめ（総合効果）\\n2:05 CTA（ブログ・チャンネル登録）\\n\\n🔗 関連リンク\\n📝 詳しい実装コード: https://nands.tech/posts/[slug]\\n🔔 チャンネル登録で最新情報をお届け\\n\\n🏷️ タグ\\n#ChatGPT #API最適化 #コスト削減 #AI開発 #エンジニア",
  "youtube_tags": ["ChatGPT", "API最適化", "コスト削減", "AI開発", "エンジニア", "プログラミング", "OpenAI", "実装テクニック", "バックエンド", "クラウドコスト"],
  "x_post": "ChatGPT APIのコスト、月10万超えてませんか？\\n\\n実務で使える5つの最適化テクニック：\\n✅ トークン削減で30%減\\n✅ キャッシュで50%減\\n✅ バッチ処理で40%減\\n✅ ストリーミングで体感速度60%向上\\n✅ エラーハンドリングで20%減\\n\\n総合60%削減達成！\\n詳しくはブログで👇",
  "threads_post": "ChatGPT APIのコスト削減、実は簡単です。\\n\\n実務で試した5つのテクニック：\\n\\n1️⃣ トークン数削減（30%減）\\nプロンプトを箇条書きに変更するだけ\\n\\n2️⃣ キャッシュ戦略（50%減）\\nRedisで頻出質問をキャッシュ\\n\\n3️⃣ バッチ処理（40%減）\\n複数リクエストをまとめる\\n\\n4️⃣ ストリーミング（体感速度60%向上）\\nユーザー体験も改善\\n\\n5️⃣ エラーハンドリング（20%減）\\n無駄なリトライを削減\\n\\n結果：月額コスト60%削減達成！\\nレスポンス速度も40%向上しました。\\n\\n詳しい実装コードはブログで公開中です。",
  "linkedin_title": "ChatGPT API最適化で月額コスト60%削減に成功した5つのテクニック",
  "linkedin_description": "ChatGPT APIを活用する企業が増える中、コスト管理が大きな課題となっています。当社では5つの最適化テクニックを実装し、月額コスト60%削減に成功しました。\\n\\n【実装したテクニック】\\n1. トークン数最適化: プロンプト設計の見直しで30%削減\\n2. キャッシュ戦略: Redis導入で50%削減\\n3. バッチ処理: API呼び出し回数40%削減\\n4. ストリーミングAPI: ユーザー体験60%向上\\n5. エラーハンドリング: 無駄な呼び出し20%削減\\n\\n【成果】\\n・月額コスト: 8万円 → 3.2万円（60%削減）\\n・レスポンス速度: 2秒 → 0.8秒（40%向上）\\n・エラー率: 15% → 3%（80%減少）\\n・ユーザー満足度: 30%向上\\n\\nAI導入において、技術的実装だけでなく、コスト最適化も重要な経営課題です。詳しい実装方法はブログ記事で公開していますので、ぜひご覧ください。\\n\\n#AI開発 #ChatGPT #コスト最適化 #エンジニアリング #DX",
  "tiktok_caption": "ChatGPT APIのコスト、月10万超えてる？😱 5つのテクニックで60%削減できます！✨ #ChatGPT #API #コスト削減 #エンジニア #プログラミング #AI開発"
}`;
}

