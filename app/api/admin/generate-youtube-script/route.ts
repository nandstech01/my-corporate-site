import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';

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
    const { postId, postSlug, postTitle, postContent }: ScriptGenerationRequest = await request.json();

    console.log('\n🎬 ========================================');
    console.log('📝 YouTubeショート台本生成開始');
    console.log(`  記事ID: ${postId}`);
    console.log(`  記事Slug: ${postSlug}`);
    console.log(`  記事タイトル: ${postTitle}`);
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

    // 2. 既に台本が生成済みかチェック
    if (existingPost.youtube_script_id) {
      console.log('⚠️ 既に台本が存在します');
      return NextResponse.json(
        { 
          error: '既にこの記事の台本は生成されています。台本を削除してから再生成してください。',
          scriptId: existingPost.youtube_script_id,
          status: existingPost.youtube_script_status
        },
        { status: 409 }
      );
    }

    console.log('✅ 記事確認完了、台本生成を開始します\n');

    // 3. OpenAI APIで台本生成
    console.log('🤖 OpenAI APIで台本生成中...');
    const scriptResponse = await generateYouTubeScript(postTitle, postContent);
    console.log('✅ 台本生成完了\n');

    // 4. Fragment IDを生成（Complete URIはYouTube URL登録時に生成）
    const fragmentId = `youtube-short-${postSlug}-${Date.now()}`;
    console.log(`🔗 Fragment ID: ${fragmentId}`);
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
        content_type: 'youtube-short',
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
 * OpenAI APIを使用してYouTubeショート台本を生成
 */
async function generateYouTubeScript(
  postTitle: string,
  postContent: string
): Promise<YouTubeScriptResponse> {
  
  const systemPrompt = `あなたは「AIエンジニア目線」で情報を発信するYouTubeショート動画の台本制作エキスパートです。

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
   
   🔗 ブログ記事: https://ken12.tech/posts/[slug]
   
   #ChatGPT #API実装 #エンジニア #プログラミング #AI開発」

3. YouTubeタグ（10-15個）
   - 関連するキーワード
   - 検索されやすいタグ
   - 例: ChatGPT, API, プログラミング, エンジニア, 実装, コスト削減, AI, 開発, コード, システム開発

【重要】JSONフォーマットでのみ返答してください。`;

  const userPrompt = `以下のブログ記事から、エンジニア向けYouTubeショート動画（30秒以内）の台本を作成してください。

【記事タイトル】
${postTitle}

【記事内容（抜粋）】
${postContent.substring(0, 3000)}

【要求事項】重要度順:
1. タイトルは短く、過激に、バズる感じで（10-15文字）
   - 悪い例: 「ChatGPT API実装の完全ガイド」（長すぎる）
   - 良い例: 「ChatGPT使えない人、終了」（14文字）
   
2. 【超重要】全体の文字数は450-500文字（これより短いと不合格）
   - Hook: 必ず110文字以上（詳細に説明）
   - Empathy: 必ず120文字以上（詳細に説明）
   - Body: 必ず180文字以上（詳細に説明）
   - CTA: 必ず80文字以上（詳細に説明）
   - 各フェーズで詳細な説明を必ず含めること
   
3. エンジニア視点の内容を必ず含める
   - 技術的な裏付けを簡潔に示す
   - 実務での応用例を含める
   - 具体的な数字や事例を使う
   
4. トーンとスタイルを厳守
   - 「〜です」「〜ます」が基本
   - 子供っぽい語尾（「〜よね」「〜してね」）は絶対に使わない
   - カジュアルだがプロフェッショナル
   
5. 具体性を担保
   - 抽象的な表現を避ける
   - 数字を使う（「効率化」→「開発時間3割削減」）
   - 実例を含める
   
6. 4つのフェーズ構造を厳密に守る
7. エンジニア向けバイラル要素を組み込む
8. 視覚的指示も含める（テロップ、コードスニペット）

9. 【重要】バリエーション生成について:
   - 上記20パターンの中からランダムに選んで組み合わせる
   - フック、Empathy、Body、CTAそれぞれで異なるパターンを使う
   - 毎回違う表現になるように工夫する
   - 同じパターンの繰り返しを避ける
   - 自然な流れになるように調整する

10. 【重要】YouTube投稿用メタデータも生成:
   - YouTubeタイトル（100文字以内、SEO最適化）
   - YouTube説明文（300-500文字、ブログへの誘導含む）
   - YouTubeタグ（10-15個、検索されやすいキーワード）

【出力フォーマット】
以下のJSON形式で返答してください：

{
  "script_title": "動画タイトル（短く過激に10-15文字、例：ChatGPT使えない人、終了）",
  "script_hook": "Hook（冒頭2秒）の台本テキスト - エンジニア向け技術的問題提起。必ず110文字以上で構成。早口で2秒。インパクトのある一言から始める。詳細に説明すること。",
  "script_empathy": "Empathy（3-5秒）の台本テキスト - エンジニアあるあるの具体的な悩み。必ず120文字以上で構成。早口で3-5秒。自分ごと化させる。詳細に説明すること。",
  "script_body": "Body（5-20秒）の台本テキスト - 実務で使える情報を数字で示す。必ず180文字以上で構成。早口で5-20秒。1-3つのポイントをテンポよく詳細に解説。",
  "script_cta": "CTA（ラスト5秒）の台本テキスト - 実装コードはブログへ誘導。必ず80文字以上で構成。早口で5秒。明確な行動指示。エンゲージメントを促す詳細な誘導。",
  "script_duration_seconds": 30,
  "visual_instructions": {
    "hook": ["視覚的指示1（大きなテロップ、コードスニペット）", "視覚的指示2（急な動き）"],
    "empathy": ["視覚的指示1（共感を示すビジュアル）", "視覚的指示2（エンジニアあるあるの視覚化）"],
    "body": ["視覚的指示1（数字、グラフ、Before/After）", "視覚的指示2（テロップ＋ジェスチャー）"],
    "cta": ["視覚的指示1（ブログへの導線、プロフィールリンク）"]
  },
  "text_overlays": ["画面に表示する技術的キーワード1", "具体的な数字2", "インパクトのあるキーワード3"],
  "background_music_suggestion": "BGMの雰囲気（例: テンポよく、エネルギッシュ、集中できる）",
  "viral_elements": ["エンジニア向けバイラル要素1（損失回避）", "バイラル要素2（技術的好奇心）", "バイラル要素3（意外性）"],
  "virality_score": 85,
  "target_emotion": "ターゲットとする感情（例: 技術的好奇心、危機感、問題解決の達成感）",
  "hook_type": "フックのタイプ（例: 問題提起型、コスト削減型、禁止型）",
  "youtube_title": "YouTubeタイトル（100文字以内、SEOキーワード含む、例: ChatGPT使えない人、終了｜9割が知らないAPI実装の落とし穴【エンジニア必見】）",
  "youtube_description": "YouTube説明文（300-500文字、動画の詳細説明、ブログへの誘導、ハッシュタグ含む）",
  "youtube_tags": ["タグ1", "タグ2", "タグ3", "...", "タグ15（10-15個のキーワード）"]
}

【文字数チェック】必ず以下を厳守（短いと不合格）:
- script_title: 10-15文字（上記20パターンから選択）
- script_hook: 必ず110文字以上（詳細に説明、20パターンから選択）
- script_empathy: 必ず120文字以上（詳細に説明、20パターンから選択）
- script_body: 必ず180文字以上（詳細に説明、20パターンから選択）
- script_cta: 必ず80文字以上（詳細に説明、20パターンから選択）
- 合計: 450-500文字必須（これより短いと不合格）

【重要】各フェーズで詳細な説明を含め、指定文字数を必ず守ること
【重要】毎回異なるパターンを使い、バリエーションを持たせること`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
    max_tokens: 2000,
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

