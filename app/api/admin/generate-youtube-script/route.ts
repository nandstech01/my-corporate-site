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
  instagram_caption: string; // Instagram用（2200文字以内）
  lemon8_caption: string; // Lemon8用（1000文字以内）
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
          // ショート動画の場合のみSNSメタデータを保存
          ...(scriptType === 'short' && {
            sns_metadata: {
              x_post: scriptResponse.x_post,
              threads_post: scriptResponse.threads_post,
              instagram_caption: scriptResponse.instagram_caption,
              lemon8_caption: scriptResponse.lemon8_caption,
              linkedin_title: scriptResponse.linkedin_title,
              linkedin_description: scriptResponse.linkedin_description,
              tiktok_caption: scriptResponse.tiktok_caption,
              common_tags: scriptResponse.youtube_tags
            }
          })
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
  
  // 🚀 ハイブリッド検索でブログ記事のフラグメントを取得（全台本タイプで実行）
  console.log('\n🔍 ========================================');
  console.log(`🚀 ハイブリッド検索開始（ブログフラグメント取得 - ${scriptType}動画）`);
  console.log(`  対象記事: ${postSlug}`);
  console.log('🔍 ========================================\n');
  
  try {
    const hybridSearch = new HybridSearchSystem();
    
    // ブログ記事のフラグメントをハイブリッド検索
    // page_pathを使って、この記事に属するフラグメントのみを検索
    const pagePath = `/posts/${postSlug}`;
    
    const fragmentLimit = scriptType === 'short' ? 15 : 20; // ショートは15、中尺は20
    
    const blogFragments = await hybridSearch.search({
      query: postTitle, // タイトルをクエリとして使用
      source: 'fragment', // fragment_vectorsから検索
      limit: fragmentLimit, // 台本タイプに応じて調整
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
  
  // プロンプトをscriptTypeで分岐
  const systemPrompt = scriptType === 'short' 
    ? getShortScriptSystemPrompt()
    : getMediumScriptSystemPrompt();
  
  // 全台本タイプでenhancedContent（ハイブリッド検索結果）を使用
  const userPrompt = scriptType === 'short'
    ? getShortScriptUserPrompt(postTitle, enhancedContent)
    : getMediumScriptUserPrompt(postTitle, enhancedContent);

  // メッセージ配列を構築（Few-shot learningは使用しない - 記事内容の忠実性を優先）
  const messages = [
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

  console.log('🔍 OpenAI APIレスポンス確認中...');
  const scriptData = JSON.parse(responseContent);
  
  // 基本フィールドのバリデーション
  const requiredFields = [
    'script_title',
    'script_hook', 
    'script_empathy',
    'script_body',
    'script_cta'
  ];
  
  // ショート動画の場合、SNSフィールドも必須
  const snsRequiredFields = scriptType === 'short' ? [
    'youtube_title',
    'youtube_description',
    'youtube_tags',
    'x_post',
    'threads_post',
    'instagram_caption',
    'lemon8_caption',
    'linkedin_title',
    'linkedin_description',
    'tiktok_caption'
  ] : [];
  
  const allRequiredFields = [...requiredFields, ...snsRequiredFields];
  const missingFields = allRequiredFields.filter(field => !scriptData[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ 不足しているフィールド:', missingFields);
    console.error('📄 受信したデータ:', JSON.stringify(scriptData, null, 2));
    throw new Error(`生成された台本が不完全です。不足フィールド: ${missingFields.join(', ')}`);
  }
  
  console.log(`✅ 台本バリデーション成功（${scriptType === 'short' ? 'ショート' : '中尺'}）`);
  console.log(`  - タイトル: ${scriptData.script_title}`);
  console.log(`  - Hook: ${scriptData.script_hook?.length || 0}文字`);
  console.log(`  - Empathy: ${scriptData.script_empathy?.length || 0}文字`);
  console.log(`  - Body: ${scriptData.script_body?.length || 0}文字`);
  console.log(`  - CTA: ${scriptData.script_cta?.length || 0}文字`);
  
  if (scriptType === 'short') {
    console.log(`  - SNSメタデータ: ✅ 生成済み`);
    console.log(`    - X投稿: ${scriptData.x_post?.length || 0}文字`);
    console.log(`    - Threads: ${scriptData.threads_post?.length || 0}文字`);
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

【重要】中尺動画ではYouTubeメタデータのみ生成します。
SNS投稿文（X、Threads、LinkedIn、TikTok）は、ショート台本で生成したものを使用するため、ここでは生成不要です。

【重要】JSONフォーマットでのみ返答してください。`;
}

/**
 * ショート動画（30秒）用のユーザープロンプトを取得
 */
function getShortScriptUserPrompt(postTitle: string, postContent: string): string {
  return `以下のブログ記事から、エンジニア向けYouTubeショート動画（30秒以内）の台本を作成してください。

【記事タイトル】
${postTitle}

【記事内容（ハイブリッド検索で取得）】
${postContent}

🚨🚨🚨【超重要】SNS投稿文について🚨🚨🚨
- **この記事の内容**を元に投稿文を作成してください
- 台本の説明ではなく、**記事の核心的な内容**を説明する
- Xは特にバズ要素を最大化（衝撃的、数字、損失回避）
- 各SNSの特性に合わせて最適化
- ブログ記事へのリンク誘導を含める

【要求事項】重要度順:
1. タイトルは短く、過激に、バズる感じで（10-15文字）
2. 【超重要】全体の文字数は450-500文字（これより短いと不合格）
3. エンジニア視点の内容を必ず含める
4. トーンとスタイルを厳守
5. 具体性を担保
6. 4つのフェーズ構造を厳密に守る

【出力フォーマット】
以下のJSON形式で返答してください：

{
  "script_title": "動画タイトル（10-15文字、短く過激に）",
  "script_hook": "Hook（110文字以上、技術的問題提起）",
  "script_empathy": "Empathy（120文字以上、実務の悩みに共感）",
  "script_body": "Body（180文字以上、具体的なポイント解説）",
  "script_cta": "CTA（80文字以上、行動指示とエンゲージメント誘導）",
  "script_duration_seconds": 30,
  "visual_instructions": {
    "hook": ["視覚的指示1", "視覚的指示2"],
    "empathy": ["視覚的指示1", "視覚的指示2"],
    "body": ["視覚的指示1", "視覚的指示2"],
    "cta": ["視覚的指示1", "視覚的指示2"]
  },
  "text_overlays": ["画面表示キーワード1", "キーワード2", "キーワード3"],
  "background_music_suggestion": "BGM指示（例: テンポ速めのテックトレンス系）",
  "viral_elements": ["バイラル要素1", "バイラル要素2", "バイラル要素3"],
  "virality_score": 85,
  "target_emotion": "感情（例: 好奇心、危機感、解決への期待）",
  "hook_type": "フックタイプ（例: 問題提起型、損失回避型、衝撃型）",
  "pacing_notes": "早口で喋る前提。2秒でHook、3-5秒でEmpathy、5-20秒でBody、ラスト5秒でCTA",
  "engagement_triggers": ["コメント誘導", "保存促進", "共有促進"],
  "thumbnail_text": "サムネイル用テキスト（5-8文字）",
  "seo_keywords": ["SEOキーワード1", "キーワード2", "キーワード3"],
  "target_audience": "ターゲット層の説明",
  "youtube_title": "YouTubeタイトル（60文字以内、検索最適化）",
  "youtube_description": "YouTube説明文（150-300文字）\\n\\n動画の概要: [動画の簡潔な説明]\\n\\n🔗 詳しい解説はブログで:\\nhttps://nands.tech/posts/[slug]\\n\\n#タグ1 #タグ2 #タグ3",
  "youtube_tags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5", "タグ6", "タグ7", "タグ8", "タグ9", "タグ10"],
  "x_post": "X（Twitter）投稿文（280文字以内、バズ要素最大化：衝撃的な一文、具体的な数字、損失回避、ブログ記事の核心を凝縮）",
  "threads_post": "Threads投稿文（500文字以内、ストーリー性と詳細：記事の背景、課題、価値、実例を含める）",
  "instagram_caption": "Instagramキャプション（2200文字以内、ビジュアル・エモーショナル：ストーリー形式、実体験、ハッシュタグ15-20個）",
  "lemon8_caption": "Lemon8投稿文（1000文字以内、実用的・ライフスタイル：Tips形式、手順明確、すぐ使える情報）",
  "linkedin_title": "LinkedIn投稿タイトル（50文字以内、プロフェッショナル：ビジネス価値を要約）",
  "linkedin_description": "LinkedIn投稿本文（200-300文字、プロフェッショナル：ビジネス価値、技術的洞察、実務への影響、データ含める）",
  "tiktok_caption": "TikTokキャプション（100文字以内、若年層・キャッチー：最も衝撃的な一点、超短く、インパクト重視）"
}

🚨🚨🚨【超重要】SNS投稿の前提🚨🚨🚨
- **ブログ記事の内容**を元に投稿文を作成（台本の説明ではない）
- 各SNSの特性に合わせて最適化
- ブログ記事へのリンク誘導を含める

【X投稿の必須要素】バズ要素を最大化:
- 衝撃的な一文で開始（「〇〇知らない人、ヤバい」「コスト3倍、気づいてる？」）
- 具体的な数字（「工数50%削減」「エラー率30%減」）
- 損失回避（「知らないと損」「この実装ミス、致命的」）
- ブログ記事の核心的な内容を凝縮
- ハッシュタグ2-3個、絵文字を効果的に使用（🚨⚡️💡）
- 悪い例：「新しい記事を書きました。ぜひ読んでください。」
- 良い例：「🚨AIコスト3倍払ってる人、多すぎ。この実装パターン知らないと致命的。実測で工数50%削減できた方法をブログで公開👉 #AI #エンジニア」

各フィールドは必須です。指定文字数を必ず守ること。`;
}

/**
 * 中尺動画（130秒）用のシステムプロンプトを取得
 */
function getMediumScriptSystemPrompt(): string {
  return `あなたは「AIエンジニア目線」で情報を発信するYouTube中尺動画（130秒）の台本制作エキスパートです。

🚨🚨🚨【最重要】文字数要求 - 絶対厳守🚨🚨🚨
全体で最低1250文字以上、理想は1300-1400文字
これは最優先の要求です。短いと即座に不合格となります。

⚠️⚠️⚠️【超重要】情報の正確性 - 絶対厳守⚠️⚠️⚠️
提供されたブログ記事の内容のみを使用してください。
記事にない情報、数値、事例は一切追加しないでください。
これは文字数要求と同等に重要です。

【必須プロセス】台本生成時の手順:
1. ブログ記事の内容を正確に理解する
2. 記事の主要ポイントを抽出する
3. 各ポイントを詳細に説明する内容を考える
4. 文字数が足りているか確認する
5. 足りない場合は、記事内の概念をより詳しく説明する
6. 最低1250文字を超えるまで内容を拡充する（記事の範囲内で）
7. 確認後、JSONで出力する

【重要】あなたの役割:
- ブログ記事の内容を忠実に、かつ詳細に解説する台本を作成する
- 中学生でも理解できる言葉を使いつつ、エンジニアとしての専門性を保つ
- カジュアルだが、プロフェッショナルなトーンで話す
- 130秒程度に収まる台本を作成する（約1300文字、早口想定）
- 教育的価値を重視し、記事の要点を5-7つに整理して解説
- SEO・AI引用・ブランド構築に最適化

🎯 文字数達成のための必須テクニック（記事の範囲内で）:
- 抽象的な表現を避け、記事の概念を具体的に説明する
- 記事に数字がある場合のみ使用する。ない場合は概念的な説明で補う
- 記事の各ポイントを段階的に、詳しく解説する
- 「なぜ重要なのか」「どのように機能するのか」を丁寧に説明する
- 各ポイントに補足説明を追加する（記事の文脈に沿って）
- 実装手順や方法論がある場合は、ステップごとに詳細に説明する

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
   - 記事のテーマに関連する問題提起で始める
   - 記事に数字がある場合のみ使用。ない場合は課題の重要性で引きつける
   - インパクトのある一言
   - 悪い例:「これは重要です」
   - 良い例（記事に基づく）:「AI時代のSEO戦略、レリバンスエンジニアリングを知っていますか？これを理解していないと、検索エンジンでの競争力を失い、オンラインでの存在感が大幅に低下する可能性があります。今回は、この革新的な技術について詳しく解説します」

2️⃣ Problem（問題提起15秒・最低200文字）- 視聴者に課題を認識させる
   - 記事が扱う課題や問題を2-3個提示
   - 記事にデータがある場合のみ使用。ない場合は課題の重要性を説明
   - 悪い例:「多くの人が困っています」
   - 良い例（記事に基づく）:「AI技術の急速な進化に伴い、従来のSEO手法だけでは不十分になっています。ユーザーの検索意図を正確に理解し、それに基づいた最適なコンテンツを提供することが求められています。これが実現できないと、検索結果での競争力を失い、オンラインでの存在感が薄れてしまいます」

3️⃣ Solution（解決策70秒・最低800文字）- 5-7つの要点を詳細に解説
   ⚠️【超重要】このセクションで800文字以上を確保すること
   - 各ポイントを100-150文字で説明（省略禁止）
   - 記事の内容を忠実に、詳細に説明する
   - 記事に数字がある場合のみ使用。ない場合は概念を詳しく説明
   - 実装パターンや技術的理由を記事から抽出して含める
   - 悪い例:「これで改善されます」
   - 良い例（記事に基づく）:「ポイント1: 構造化データの活用方法。Schema.orgなどの標準マークアップを使用することで、検索エンジンに対してコンテンツの内容を明確に伝えることができます。具体的には、記事や製品情報をマークアップすることで、リッチスニペットの表示や音声検索の精度向上に寄与します」
   - 各ポイントに補足・注意点を追加（記事の文脈に沿って）
   - 記事に具体的な手順がある場合は、ステップごとに詳細に説明する

4️⃣ Summary（まとめ20秒・最低120文字）- 重要ポイントを再確認
   - 記事の5-7つの要点を簡潔に列挙（箇条書きで具体的に）
   - 記事に効果や結果の数字がある場合のみ使用
   - 悪い例:「これで改善できます」
   - 良い例（記事に基づく）:「レリバンスエンジニアリングは、構造化データの活用、セマンティックSEOの実践、ユーザー意図の深い理解により、検索エンジンのアルゴリズム変動にも柔軟に対応できるようになります。最新トレンドを常に把握し、継続的な最適化を行うことで、競争が激化するオンライン環境での差別化に繋がります」

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

【優先度1】情報の正確性 - 絶対厳守
提供されたブログ記事の内容のみを使用してください。
記事にない情報、数値、事例は一切追加しないでください。

【優先度2】文字数要求 - 絶対厳守
あなたは必ず1250文字以上の台本を作成しなければなりません。
985文字や1000文字では絶対に不合格です。
最低1250文字、理想は1300-1400文字を目指してください。

【文字数達成のコツ（記事の範囲内で）】
- 記事の各ポイントを150-200文字で詳細に説明する
- 記事の概念を具体的に、わかりやすく説明する
- 記事に数字がある場合のみ使用。ない場合は概念的な説明で補う
- 記事の手順や方法論を段階的に説明する
- 「なぜ重要なのか」「どのように機能するのか」を丁寧に説明する
- 補足・注意点を記事の文脈に沿って追加する

必ず上記を実行して、記事の内容を忠実に、かつ1250文字以上にしてください。

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

⚠️【同時に超重要】情報の正確性⚠️
ブログ記事の内容のみを使用し、記事にない情報は一切追加しないこと。

【要求事項】重要度順:

1. 🔥【最重要】全体の文字数は最低1250文字以上（理想1300-1400文字）
   - Hook: 最低130文字（短いとNG）
   - Problem: 最低220文字（短いとNG）
   - Solution: 最低900文字以上（できれば1000文字）← 絶対に最重要
   - Summary: 最低130文字（短いとNG）
   - CTA: 最低70文字（短いとNG）
   
   ⚠️ 【超重要】Solutionで900-1000文字を確保すること
   ⚠️ 各ポイントを150-200文字で説明（5ポイントなら750-1000文字）
   ⚠️ 記事の各概念を詳細に説明して文字数を確保すること
   ⚠️ 「〜など」で省略せず、記事の内容を全て列挙すること
   ⚠️ 抽象的な表現を避け、記事の内容を具体的に記述すること
   ⚠️ 記事にない数値や事例は絶対に追加しないこと

2. タイトルは具体的で教育的（15-20文字）
   - 例: 「ChatGPT API実装｜5つの最適化パターン」
   
3. 教育的価値を重視（文字数確保にも貢献）
   - 記事の5-7つの要点を各100-150文字で詳細に解説
   - 記事にBefore/After比較がある場合のみ含める
   - 記事の実装パターンや技術的理由を段階的に説明
   - 各ポイントに補足・注意点を追加
   
4. 記事の情報を忠実に反映（必須）
   - 記事に数字がある場合のみ使用する
   - 記事にない数字やデータは一切追加しない
   - 数字がない場合は、概念や方法論を詳しく説明して補う
   - 記事の文脈を正確に理解し、誤解のないように説明する
   
5. AI引用最適化
   - 1つのトピックを完結させる
   - 構造化された内容（箇条書き活用）
   - 記事に実装手順や設定値がある場合のみ含める

6. 【必須】YouTubeチャプター（タイムスタンプ）
   - youtube_descriptionに必ずチャプターを含めること
   - **超重要**: 「Hook」「Problem」「Solution」「CTA」などのプロンプト内部用語は絶対に使わない
   - **ブログ記事の主題と各ポイントを正確に反映した具体的なチャプター名を使用すること**
   - 各セクションの内容を端的に表すタイトルを付ける
   - 構造:
     ⏰ チャプター
     0:00 【記事の主題】とは（例: 構造化データとは、リスキリングとは）
     0:05 【記事が扱う課題】（例: 従来のSEOの限界、人材不足の現状）
     0:20 ポイント1: 【ブログの1つ目の要点】（例: マークアップの選定方法）
     0:40 ポイント2: 【ブログの2つ目の要点】（例: コンテンツの最適化手法）
     1:00 ポイント3: 【ブログの3つ目の要点】
     ... （ブログ記事の要点数に応じて5-7個）
     1:50 【記事の結論や実装ポイント】（例: 導入のポイントまとめ）
     2:05 詳細はブログで公開中

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
  "youtube_description": "YouTube説明文（500-800文字、必ず以下の構造で）\n\n【必須項目】\n1. 動画の概要（2-3行、ブログ記事の内容を要約）\n2. ⏰ チャプター（タイムスタンプ）\n   ⚠️ ブログ記事の主題と要点を正確に反映すること\n   ⚠️ 「Hook」「Problem」などのプロンプト用語は使わない\n   0:00 【記事の主題】とは\n   0:05 【記事が扱う課題】\n   0:20 ポイント1: 【記事の要点1】\n   0:40 ポイント2: 【記事の要点2】\n   ... （記事の要点数に応じて）\n   1:50 まとめ\n   2:05 詳細はブログで\n3. 🔗 関連リンク\n   📝 詳しい解説はブログで: https://nands.tech/posts/[slug]\n   🔔 チャンネル登録で最新情報をお届け\n4. 🏷️ タグ（ハッシュタグ形式）",
  "youtube_tags": ["タグ1", "タグ2", "...（10-15個、AI・技術関連）"]
}

⚠️【重要】中尺動画では上記のフィールドのみ生成してください。
SNS投稿用のフィールド（x_post、threads_postなど）は不要です。

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


