import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { HybridSearchSystem } from '@/lib/vector/hybrid-search';
import {
  getShortScriptSystemPrompt,
  getShortScriptUserPrompt,
  getMediumScriptSystemPrompt,
  getMediumScriptUserPrompt,
  MODEL_CONFIG,
} from '@/lib/prompts';
import {
  NEWS_TO_BLOG_CATEGORY_MAPPING,
  YahooNewsCategory,
  calculateTagOverlap,
  determineMatchingPattern,
} from '@/lib/news-category-mapping';

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
  script_empathy?: string; // 中尺動画のみ必須
  script_body: string;
  script_cta: string;
  script_duration_seconds: number;
  visual_instructions: {
    hook: string[];
    empathy?: string[]; // 中尺動画のみ
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

    // 🆕 2.5. ブログ記事のカテゴリタグを取得（ショート動画のみ）
    let blogCategoryTags: string[] = [];
    if (scriptType === 'short') {
      const { data: blogPost } = await supabaseServiceRole
        .from('posts')
        .select('category_tags')
        .eq('slug', postSlug)
        .single();
      
      if (blogPost && blogPost.category_tags) {
        blogCategoryTags = blogPost.category_tags;
        console.log(`✅ ブログ記事のカテゴリタグ: ${blogCategoryTags.join(', ')}`);
      } else {
        console.log(`⚠️ ブログ記事にカテゴリタグが設定されていません（デフォルトの動作）`);
      }
    }

    // 3. OpenAI APIで台本生成
    console.log('🤖 OpenAI APIで台本生成中...');
    const scriptResponse = await generateYouTubeScript(postTitle, postContent, postSlug, scriptType, blogCategoryTags);
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
          generation_method: 'openai-gpt-5', // ✅ GPT-5を記録
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
 * @param blogCategoryTags ブログ記事のカテゴリタグ（ショート動画のみ）
 */
async function generateYouTubeScript(
  postTitle: string,
  postContent: string,
  postSlug: string,
  scriptType: 'short' | 'medium' = 'short',
  blogCategoryTags: string[] = []
): Promise<YouTubeScriptResponse> {
  
  let enhancedContent = postContent;
  let matchingPattern: 'direct' | 'pivot' | 'parallel' | 'news-only' = 'news-only'; // 🆕 デフォルトはnews-only
  
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
  
  // 📰 トレンドニュースの取得（Yahoo! News RSSでリアルタイム）
  console.log('\n📰 ========================================');
  console.log(`🚀 トレンドニュース取得開始（${scriptType}動画）`);
  console.log(`  方法: ${scriptType === 'short' ? 'Yahoo! News RSS（リアルタイム）' : 'トレンドRAGテーブル'}`);
  console.log('📰 ========================================\n');

  let trendContext = '';
  let newsCategory: YahooNewsCategory = 'IT'; // 🆕 デフォルトはIT

      // 🆕 ショート動画の場合はYahoo! News RSSでリアルタイムニュース取得
      if (scriptType === 'short') {
        try {
          console.log('🔍 Yahoo! News RSSでリアルタイムニュースを取得中...');
          
          // 🛡️ NGワードリスト（戦争・人質・暴力関連を除外）
          const ngWords = [
            '戦争', '人質', '軍事', 'テロ', '紛争', '殺害', '攻撃', '爆発',
            'ミサイル', '空爆', '砲撃', '死亡', '死者', '犠牲', '拘束',
            '銃撃', '暴力', '武装', '兵士', '軍隊', 'タリバン', 'ハマス',
            'イスラエル', 'ガザ', 'ウクライナ', 'ロシア', '北朝鮮',
            '核', 'ミサイル', '制裁', '報復', '侵攻', '占領'
          ];
          
          // Yahoo! News RSSフィード（安全なカテゴリのみ）
          const yahooRssFeeds = [
            { name: 'IT', url: 'https://news.yahoo.co.jp/rss/topics/it.xml' },
            { name: '科学', url: 'https://news.yahoo.co.jp/rss/topics/science.xml' },
            { name: 'エンタメ', url: 'https://news.yahoo.co.jp/rss/topics/entertainment.xml' },
            { name: 'スポーツ', url: 'https://news.yahoo.co.jp/rss/topics/sports.xml' },
            { name: '経済', url: 'https://news.yahoo.co.jp/rss/topics/business.xml' },
          ];
      
      const selectedFeed = yahooRssFeeds[Math.floor(Math.random() * yahooRssFeeds.length)];
      newsCategory = selectedFeed.name as YahooNewsCategory;
      console.log(`  🎲 選択カテゴリ: ${newsCategory}`);
      console.log(`  📡 RSSフィード: ${selectedFeed.url}`);
      
      // Yahoo! News RSSを取得
      const response = await fetch(selectedFeed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Yahoo RSS取得エラー: ${response.status}`);
      }
      
      const xmlText = await response.text();
      
      // 簡易XMLパース（<item>タグを抽出）
      const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
      
      console.log(`📰 RSS取得成功: ${itemMatches.length}件のニュース`);
      
      if (itemMatches.length === 0) {
        throw new Error('Yahoo RSSからニュースを取得できませんでした');
      }
      
      // 各ニュースをパース
      const allNewsItems = itemMatches.map((item: string) => {
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        
        const pubDateStr = pubDateMatch ? pubDateMatch[1] : null;
        let pubDate = null;
        
        if (pubDateStr) {
          try {
            pubDate = new Date(pubDateStr);
            // デバッグログ
            console.log(`  🔍 パース: "${titleMatch?.[1]?.substring(0, 30)}..." → pubDate: ${pubDateStr} → ${pubDate.toISOString()}`);
          } catch (e) {
            console.log(`  ⚠️ pubDateパースエラー: ${pubDateStr}`);
          }
        }
        
        return {
          title: titleMatch ? titleMatch[1] : '',
          link: linkMatch ? linkMatch[1] : '',
          description: descMatch ? descMatch[1] : '',
          pubDate: pubDate,
        };
      }).filter(item => item.title);
      
      // 🛡️ NGワードフィルタリング
      const newsItems = allNewsItems.filter(item => {
        const fullText = `${item.title} ${item.description}`;
        const hasNgWord = ngWords.some(ngWord => fullText.includes(ngWord));
        
        if (hasNgWord) {
          console.log(`  🚫 NGワード検出: "${item.title.substring(0, 40)}..." → 除外`);
          return false;
        }
        return true;
      });
      
      console.log(`✅ NGワードフィルタリング完了: ${allNewsItems.length}件 → ${newsItems.length}件（安全）`);
      
      if (newsItems.length === 0) {
        throw new Error(`安全なニュースが見つかりませんでした（カテゴリ: ${newsCategory}）。別のカテゴリで再試行してください。`);
      }
      
      // 24時間以内のニュースをフィルタリング
      const now = new Date();
      const jstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
      const twentyFourHoursAgo = new Date(jstNow.getTime() - 24 * 60 * 60 * 1000);
      
      console.log(`🕐 現在時刻（JST）: ${jstNow.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
      console.log(`🕐 24時間前（JST）: ${twentyFourHoursAgo.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
      
      // 24時間以内のニュースをフィルタリング
      let recentNews = newsItems.filter(item => {
        if (!item.pubDate) return false;
        const isRecent = item.pubDate >= twentyFourHoursAgo;
        const hoursAgo = (jstNow.getTime() - item.pubDate.getTime()) / (1000 * 60 * 60);
        console.log(`  📅 ${item.title.substring(0, 50)}... → ${hoursAgo.toFixed(1)}時間前 ${isRecent ? '✅' : '❌'}`);
        return isRecent;
      }).slice(0, 3); // 最大3件
      
      // 🎯 フォールバック: 24時間以内がなければ、最新の3件を使用
      if (recentNews.length === 0) {
        console.log(`⚠️ 24時間以内のニュースが見つかりませんでした`);
        console.log(`💡 フォールバック: 最新の3件を使用します`);
        
        // pubDateがあるニュースを新しい順にソート
        const sortedNews = newsItems
          .filter(item => item.pubDate)
          .sort((a, b) => b.pubDate!.getTime() - a.pubDate!.getTime())
          .slice(0, 3);
        
        if (sortedNews.length === 0) {
          throw new Error(`ニュースが取得できませんでした（カテゴリ: ${newsCategory}）`);
        }
        
        recentNews = sortedNews;
        console.log(`✅ フォールバックで${recentNews.length}件のニュースを取得しました`);
      }
      
      // ニュースが24時間以内かチェック
      const isWithin24h = recentNews.every(item => item.pubDate && item.pubDate >= twentyFourHoursAgo);
      console.log(`✅ ニュース取得成功: ${recentNews.length}件${isWithin24h ? '（24時間以内）' : '（最新）'}`);
      
      // トレンドコンテキストを生成
      trendContext = recentNews
        .map((item: any, idx: number) => {
          const hoursAgo = ((jstNow.getTime() - item.pubDate.getTime()) / (1000 * 60 * 60)).toFixed(1);
          return `【今日のニュース${idx + 1}】(${hoursAgo}時間前)\nタイトル: ${item.title}\n内容: ${item.description}\nURL: ${item.link}`;
        })
        .join('\n\n---\n\n');
      
      console.log(`✅ トレンドコンテキスト統合完了: ${trendContext.length}文字`);
      console.log(`📰 ニュース例: ${recentNews[0].title}\n`);
      
      // 🆕 📊 カテゴリマッチング（ショート動画のみ）
      if (blogCategoryTags.length > 0) {
        console.log('\n📊 ========================================');
        console.log('🧩 カテゴリマッチング開始');
        console.log(`  ニュースカテゴリ: ${newsCategory}`);
        console.log(`  ブログカテゴリタグ: ${blogCategoryTags.join(', ')}`);
        console.log('📊 ========================================\n');
        
        // ニュースカテゴリに対応するブログタグを取得
        const newsCategoryTags = NEWS_TO_BLOG_CATEGORY_MAPPING[newsCategory] || [];
        
        // タグ重なり度を計算
        const overlapPercentage = calculateTagOverlap(newsCategoryTags, blogCategoryTags);
        
        // マッチングパターンを判定
        matchingPattern = determineMatchingPattern(overlapPercentage);
        
        console.log(`📊 タグ重なり度: ${overlapPercentage}%`);
        console.log(`🎯 マッチングパターン: ${matchingPattern}`);
        console.log(`  - direct (70%以上): 対立構造パターン`);
        console.log(`  - pivot (40-70%): ピボットパターン`);
        console.log(`  - parallel (20-40%): 並列紹介パターン`);
        console.log(`  - news-only (20%未満): ニュース解説専用\n`);
      } else {
        console.log('\n⚠️ ブログ記事にカテゴリタグが設定されていないため、デフォルト動作（news-only）を使用します\n');
      }
      
    } catch (error: any) {
      console.error('❌ Yahoo News RSS取得エラー:', error.message);
      throw new Error(`リアルタイムニュース取得に失敗しました: ${error.message}`);
    }
  } else {
    // 中尺動画の場合は従来のトレンドRAGテーブルを使用（オプション）
    try {
      const hybridSearch = new HybridSearchSystem();
      
      // 今日のトレンドニュースを検索
      const trendResults = await hybridSearch.search({
        query: postTitle,
        source: 'trend', // trend_ragから検索
        limit: 3, // 最大3件
        threshold: 0.1, // 関連度 > 0.1（広く取得）
      });

      if (trendResults.length > 0) {
        console.log(`✅ トレンドニュース取得: ${trendResults.length}件`);
        
        trendContext = trendResults
          .map((trend: any, idx: number) => {
            const title = trend.trend_title || '無題';
            const content = trend.trend_content || '';
            const url = trend.trend_url || '';
            const similarity = trend.similarity?.toFixed(3) || 'N/A';
            
            return `【トレンド${idx + 1}】(関連度: ${similarity})\nタイトル: ${title}\n内容: ${content}\nURL: ${url}`;
          })
          .join('\n\n---\n\n');
        
        console.log(`✅ トレンドコンテキスト統合完了: ${trendContext.length}文字\n`);
      } else {
        console.log('⚠️ 関連するトレンドニュースが見つかりませんでした（中尺動画は任意）\n');
      }
    } catch (error: any) {
      console.error('❌ トレンドRAG検索エラー:', error.message);
      console.log('⚠️ エラーのためトレンドなしで生成します\n');
    }
  }

  // 🧠 Kenji Harada思想RAGの検索と統合
  console.log('\n🧠 ========================================');
  console.log(`🚀 Kenji思想RAG検索開始（${scriptType}動画）`);
  console.log(`  クエリ: ${postTitle}`);
  console.log('🧠 ========================================\n');

  let kenjiThoughtsContext = '';
  let filteredAnalogies: any[] = [];
  
  try {
    const hybridSearch = new HybridSearchSystem();
    
    // 1. Kenji思想を検索（通常の思想）
    const kenjiThoughts = await hybridSearch.search({
      query: postTitle,
      source: 'kenji',
      limit: scriptType === 'short' ? 2 : 3, // 通常思想は少なめ
      threshold: 0.3,
    });
    
    // 2. 比喩RAGを強制取得（わかりやすさのため）
    const analogyThoughts = await hybridSearch.search({
      query: postTitle,
      source: 'kenji',
      limit: scriptType === 'short' ? 3 : 5, // 比喩は多めに
      threshold: 0.1, // 閾値を下げて広く取得
      // category='analogy'でフィルタ（今回は手動フィルタ）
    });
    
    // 3. 比喩のみフィルタ（category='analogy'）
    filteredAnalogies = analogyThoughts.filter((t: any) => 
      t.thought_category === 'analogy'
    );
    
    // 4. 統合（比喩を優先）
    const allThoughts = [...filteredAnalogies.slice(0, scriptType === 'short' ? 3 : 5), ...kenjiThoughts];
    
    console.log(`✅ 比喩RAG取得: ${filteredAnalogies.length}件 / 通常思想: ${kenjiThoughts.length}件`);
    
    if (allThoughts.length > 0) {
      console.log(`✅ Kenji思想取得成功（統合）: ${allThoughts.length}件`);
      
      // 取得した思想を整形
      kenjiThoughtsContext = allThoughts
        .map((thought: any, idx: number) => {
          const title = thought.thought_title || '無題';
          const content = thought.thought_content || '';
          const category = thought.thought_category || 'general';
          const keyTerms = thought.key_terms ? thought.key_terms.join(', ') : '';
          const similarity = thought.similarity?.toFixed(2) || '0.00';
          return `【Kenji思想${idx + 1}】(関連度: ${similarity}, カテゴリ: ${category})\nタイトル: ${title}\n重要用語: ${keyTerms}\n内容: ${content}`;
        })
        .join('\n\n---\n\n');
      
      console.log(`✅ Kenji思想統合完了: ${kenjiThoughtsContext.length}文字\n`);
    } else {
      console.log('⚠️ Kenji思想が見つかりませんでした（プロンプトのみで生成）\n');
    }
    
    if (filteredAnalogies.length > 0) {
      console.log(`📚 比喩RAG詳細:`);
      filteredAnalogies.slice(0, 3).forEach((a: any, idx: number) => {
        console.log(`   ${idx + 1}. ${a.thought_title || '無題'}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Kenji思想RAG検索エラー:', error.message);
    console.log('⚠️ エラーのためKenji思想なしで生成します\n');
  }

  // 🧩 個人ストーリーRAGの検索（中尺動画のみ）
  let personalStoryContext = '';
  
  if (scriptType === 'medium') {
    console.log('\n🧩 ========================================');
    console.log('🚀 個人ストーリーRAG検索開始（中尺動画専用）');
    console.log(`  クエリ: ${postTitle}`);
    console.log('🧩 ========================================\n');
    
    try {
      const hybridSearch = new HybridSearchSystem();
      const embeddings = new OpenAIEmbeddings();
      
      // クエリを3072次元でベクトル化
      const queryEmbedding = await embeddings.embedSingle(postTitle, 3072);
      
      // 個人ストーリーRAG検索（閾値を下げて広く取得）
      const personalStoryResults = await hybridSearch.searchPersonalStoryRAG(
        postTitle,
        queryEmbedding,
        2, // 最大2件
        0.2 // 類似度閾値（0.3→0.2に下げて広く取得）
      );
      
      if (personalStoryResults.length > 0) {
        console.log(`✅ 個人ストーリーRAG取得成功: ${personalStoryResults.length}件`);
        console.log(`   トーン抽出: ${personalStoryResults.map(s => s.emotion).join(', ')}`);
        
        // 🎯 「喋らず、滲ませる」実装
        // 取得したストーリーの「トーン」だけを抽出（内容は絶対に渡さない）
        personalStoryContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧩 個人ストーリーのトーン指示【絶対に内容を台本に書かないこと】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以下の要素を全体のトーンとして滲ませてください。
個人ストーリーの「内容」は絶対に台本に書かないでください。

【抽出されたトーン】
${personalStoryResults.map((story: any, idx: number) => {
  return `- 感情: ${story.emotion}
- 声の方向性: ${story.voice_direction || '低く、抑えた熱'}
- リズム: ${story.rhythm_note || '完結した文章、1文ごとに間を取る'}
- 核心テーマ: ${story.core_theme}
- 使用箇所: ${story.use_cases.join(', ')}`;
}).join('\n\n')}

【適用方法】
このトーンで技術を語ってください。個人的な主張は一切しない。
客観的に情報提供するが、その奥に「静かな決意」が感じられる語り口にする。

例:
✅ 「構造が整うと、同じ一手でも意味が変わります。」
   → 淡々と、でも確信を持って
✅ 「最初に全体の流れを捉えることが大切です。」
   → 余計な説明なし、本質だけを示す

【絶対厳守】
❌ 「理解されなくてもいい」（個人ストーリーの内容を書いている）
❌ 「構造を信じてきました」（個人的な主張）
❌ 「感情は語らない。構造で示す。」（個人ストーリーの結論を引用）
✅ 客観的に情報提供しつつ、トーンで「静かな決意」を滲ませる
`;
        
        console.log(`✅ 個人ストーリーのトーン抽出完了: ${personalStoryContext.length}文字`);
        console.log(`   トーン: ${personalStoryResults.map(s => s.emotion).join(', ')}`);
        console.log(`   核心テーマ: ${personalStoryResults.map(s => s.core_theme).join(', ')}\n`);
      } else {
        console.log('⚠️ 個人ストーリーRAGが見つかりませんでした（トーンはプロンプトベース）\n');
      }
    } catch (error: any) {
      console.error('❌ 個人ストーリーRAG検索エラー:', error.message);
      console.log('⚠️ エラーのため個人ストーリーなしで生成します\n');
    }
  }

  // 💎 偉人RAG（Catalyst RAG）の検索（中尺動画のみ）
  let catalystContext = '';
  
  if (scriptType === 'medium') {
    console.log('\n💎 ========================================');
    console.log('🚀 偉人RAG（Catalyst RAG）検索開始（中尺動画専用）');
    console.log(`  クエリ: ${postTitle}`);
    console.log('💎 ========================================\n');
    
    try {
      const hybridSearch = new HybridSearchSystem();
      const embeddings = new OpenAIEmbeddings();
      
      // クエリを3072次元でベクトル化
      const queryEmbedding = await embeddings.embedSingle(postTitle, 3072);
      
      // 偉人RAG検索
      const catalystResults = await hybridSearch.searchCatalystRAG(
        postTitle,
        queryEmbedding,
        3, // 最大3件
        0.25 // 類似度閾値（Kenji思想より低め）
      );
      
      if (catalystResults.length > 0) {
        console.log(`✅ 偉人RAG取得成功: ${catalystResults.length}件`);
        
        // 取得した偉人RAGを整形
        catalystContext = catalystResults
          .map((catalyst: any, idx: number) => {
            return `【${catalyst.person} - ${catalyst.theme}】
原典引用: "${catalyst.quote}"
Kenjiさんの言葉: ${catalyst.your_voice_paraphrase}
核心メッセージ: ${catalyst.core_message}
反対視点: ${catalyst.counterpoint}
使用箇所: ${catalyst.use_cases.join(', ')}
検証ステータス: ${catalyst.verify_status}
類似度: ${catalyst.similarity?.toFixed(3)}`;
          })
          .join('\n\n---\n\n');
        
        console.log(`✅ 偉人RAGコンテキスト統合完了: ${catalystContext.length}文字\n`);
      } else {
        console.log('⚠️ 偉人RAGが見つかりませんでした\n');
      }
    } catch (error: any) {
      console.error('❌ 偉人RAG検索エラー:', error.message);
      console.log('⚠️ エラーのため偉人RAGなしで生成します\n');
    }
  }
  
      // トレンド + Kenji思想をenhancedContentに追加
      let finalContent = enhancedContent;
      
      // 1. トレンドRAGを追加（ショート動画のみ最優先）
      if (trendContext && scriptType === 'short') {
        finalContent = `${finalContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧭【必須】今日のトレンドニュース（AI的再解釈）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【最重要指示】「AIが裁く今日」コンセプト:
1. **Hook: ニュースから対立構造を抽出 + AIに審判させる**（必須）
   - 「〇〇 vs △△、どっちが正解？AIに聞いたら、意外な答えが返ってきました。」
   - 例: 「醬油、濃い方 vs 薄い方？AIに聞いたら〜」
   - 例: 「猛暑でホタテピンチ。自然 vs 技術、AIにどっちが勝つ？って聞いたら〜」
   
2. **Body: AI審判の理由 + 人間とのズレ + 思想RAG融合**（必須）
   - 「人間は〇〇と思うが、AIは△△と答えた。理由は【思想RAG】。」
   - 思想RAGを「AI審判の価値軸」として自然に融合（教育的に説明しない）
   - 例: 「人間は"濃い=美味い"と思うが、AIは"用途で変わる"と答えた。つまり、"文脈で価値が変わる"。ChatGPTも同じ。」
   - 🚨🚨🚨 ブログの実装詳細は絶対に含めない（「やることリスト」形式は厳禁）🚨🚨🚨
   - ブログテーマへの軽い接続を1文だけ含める
   - 一言哲学で締める
   
3. **必須要素チェック**
   - 対立構造（〇〇 vs △△）✅
   - AI審判（「AIに聞いたら」）✅
   - 意外性（「意外な答えが」）✅
   - 人間とのズレ（「人間は〇〇、AIは△△」）✅
   - 感情フック（驚き、ワクワク）✅

${trendContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      }
      
      // 2. Kenji思想を追加
      if (kenjiThoughtsContext) {
        finalContent = `${finalContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠【補助】Kenji Harada 思想 + わかりやすい比喩
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【重要指示】思想RAGの使い方:
1. **思想RAGを「AI審判の価値軸」として使う**（教育ツールとして使わない）
   - ベクトルリンク → 「AIは文脈で判断する」「文脈で価値が変わる」
   - LLMO → 「AIは最適化で逆転する」「データ駆動で未来を書き換える」
   - Triple RAG → 「AIは表層だけでなく、背景・哲学まで読む」
   
2. **AI審判の理由として自然に融合**
   - 「人間は〇〇と思うが、AIは△△と答えた。理由は【思想RAG】。」
   - 例: 「AIは"用途で変わる"と答えた。つまり、"文脈で価値が変わる"。」
   
3. **ブログの実装詳細は絶対に含めない**（「やることリスト」形式は厳禁）

${kenjiThoughtsContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      }

  // 🆕 matchingPatternに応じた指示を追加（ショート動画のみ）
  if (scriptType === 'short' && matchingPattern === 'news-only') {
    finalContent = `${finalContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯【重要】マッチングパターン: news-only（ニュース解説専用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【台本生成指示】
1. **ニュース解説を中心に**
   - ニュースの対立構造と AI 審判に焦点を当てる
   - ブログ記事の詳細な実装手順は含めない
   
2. **ブログへの言及は最小限に**
   - CTA で「詳しくはブログで」と軽く触れる程度
   - ブログ記事の具体的な内容は台本に含めない
   
3. **AI の視点でニュースを再解釈**
   - 人間の常識 vs AI の判断
   - AI がどう考えるか、その理由
   - 哲学的な一言で締める

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else if (scriptType === 'short' && matchingPattern !== 'news-only') {
    finalContent = `${finalContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯【重要】マッチングパターン: ${matchingPattern}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【台本生成指示】
1. **ニュースとブログを自然に結びつける**
   - direct: 直接対決パターン（対立構造で結びつける）
   - pivot: ピボットパターン（視点の転換で結びつける）
   - parallel: 並列紹介パターン（共通点を示しつつ紹介）
   
2. **ブログ記事の要点を含める**
   - Body で技術的な要点を1-2文で説明
   - CTA でブログへの誘導を強化
   
3. **AI の視点で統一**
   - ニュースもブログも、AI の視点で再解釈
   - 哲学的な一言で締める

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }

  // プロンプトをscriptTypeで分岐
  const systemPrompt = scriptType === 'short' 
    ? getShortScriptSystemPrompt()
    : getMediumScriptSystemPrompt();
  
  // 全台本タイプでfinalContent（ハイブリッド検索結果 + Kenji思想）を使用
  const userPrompt = scriptType === 'short'
    ? getShortScriptUserPrompt(postTitle, finalContent)
    : getMediumScriptUserPrompt(postTitle, finalContent, personalStoryContext, catalystContext);

  // メッセージ配列を構築（Few-shot learningは使用しない - 記事内容の忠実性を優先）
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPrompt }
  ];

  console.log('🤖 OpenAI APIリクエスト詳細:', {
    model: MODEL_CONFIG.SCRIPT_MODEL,
    messageCount: messages.length,
    systemPromptLength: systemPrompt.length,
    userPromptLength: userPrompt.length
  });

  const modelName = MODEL_CONFIG.SCRIPT_MODEL;
  const isGPT5 = modelName === 'gpt-5';
  
  const completion = await openai.chat.completions.create({
    model: modelName,
    messages: messages,
    response_format: { type: 'json_object' },
    // GPT-5の場合はtemperature指定不可、GPT-4oの場合は指定可能
    ...(!isGPT5 && {
      temperature: scriptType === 'short' ? MODEL_CONFIG.TEMPERATURE.SHORT : MODEL_CONFIG.TEMPERATURE.MEDIUM,
    }),
    max_completion_tokens: scriptType === 'short' ? MODEL_CONFIG.MAX_TOKENS.SHORT : MODEL_CONFIG.MAX_TOKENS.MEDIUM,
  });

  console.log('✅ OpenAI APIレスポンス受信:', {
    model: completion.model,
    usage: completion.usage,
    finishReason: completion.choices[0]?.finish_reason,
    hasContent: !!completion.choices[0]?.message?.content,
    contentLength: completion.choices[0]?.message?.content?.length || 0
  });

  const responseContent = completion.choices[0].message.content;
  if (!responseContent) {
    console.error('❌ レスポンス詳細:', JSON.stringify(completion, null, 2));
    throw new Error('OpenAI APIからの応答が空です');
  }

  console.log('🔍 OpenAI APIレスポンス確認中...');
  const scriptData = JSON.parse(responseContent);
  
  // 基本フィールドのバリデーション
  const requiredFields = scriptType === 'short' ? [
    'script_title',
    'script_hook',
    'script_body',
    'script_cta'
  ] : [
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
  
  if (scriptType === 'short') {
    console.log(`  - Body: ${scriptData.script_body?.length || 0}文字`);
    console.log(`  - CTA: ${scriptData.script_cta?.length || 0}文字`);
    const totalChars = (scriptData.script_hook?.length || 0) + (scriptData.script_body?.length || 0) + (scriptData.script_cta?.length || 0);
    console.log(`  - 合計: ${totalChars}文字（目標: 240-260文字）`);
    console.log(`  - SNSメタデータ: ✅ 生成済み`);
    console.log(`    - X投稿: ${scriptData.x_post?.length || 0}文字`);
    console.log(`    - Threads: ${scriptData.threads_post?.length || 0}文字`);
  } else {
    console.log(`  - Empathy: ${scriptData.script_empathy?.length || 0}文字`);
    console.log(`  - Body: ${scriptData.script_body?.length || 0}文字`);
    console.log(`  - CTA: ${scriptData.script_cta?.length || 0}文字`);
  }

  return scriptData as YouTubeScriptResponse;
}
