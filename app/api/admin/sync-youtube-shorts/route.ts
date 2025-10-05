/**
 * 自社YouTubeショート動画自動同期API
 * 
 * 実行内容:
 * 1. YouTube Data APIから最新のショート動画を自動取得
 * 2. Fragment ID生成
 * 3. ベクトル埋め込み生成
 * 4. Supabase company_youtube_shorts テーブルに保存
 * 5. Schema.org構造化データ生成
 * 6. エンティティ統合
 * 
 * 使用方法:
 * POST /api/admin/sync-youtube-shorts
 * Body: { maxResults?: number, forceUpdate?: boolean }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { 
  fetchCompanyYouTubeShorts, 
  fetchVideoByUrl,
  type YouTubeShortInfo 
} from '@/lib/youtube/youtube-data-api';
import { 
  generateYouTubeShortSchema,
  generateYouTubeShortEntityDefinition,
  calculateAIOptimizationScore,
  type YouTubeShortEntity
} from '@/lib/structured-data/youtube-short-schema';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { maxResults = 50, forceUpdate = false, manualUrl = null } = body;

    console.log('🎬 YouTubeショート動画自動同期開始');

    // 1. YouTube動画取得
    let shortVideos: YouTubeShortInfo[];
    
    if (manualUrl) {
      console.log(`📌 手動URL取得: ${manualUrl}`);
      const video = await fetchVideoByUrl(manualUrl);
      if (!video) {
        return NextResponse.json(
          { error: '動画が取得できませんでした' },
          { status: 404 }
        );
      }
      shortVideos = [video];
    } else {
      console.log('🔄 チャンネルから自動取得');
      shortVideos = await fetchCompanyYouTubeShorts(maxResults);
    }

    if (shortVideos.length === 0) {
      return NextResponse.json(
        { message: '新しいショート動画がありません', syncedCount: 0 },
        { status: 200 }
      );
    }

    console.log(`✅ ${shortVideos.length}件のショート動画を取得`);

    // 2. 既存データ確認
    const { data: existingShorts } = await supabase
      .from('company_youtube_shorts')
      .select('video_id, fragment_id')
      .in('video_id', shortVideos.map(v => v.videoId));

    const existingVideoIds = new Set(existingShorts?.map(s => s.video_id) || []);
    
    // 新規動画のみフィルタ（forceUpdate=falseの場合）
    const newShorts = forceUpdate 
      ? shortVideos 
      : shortVideos.filter(v => !existingVideoIds.has(v.videoId));

    console.log(`  新規: ${newShorts.length}件`);
    console.log(`  既存: ${shortVideos.length - newShorts.length}件`);

    if (newShorts.length === 0) {
      return NextResponse.json(
        { message: '同期済みです', syncedCount: 0, totalShorts: shortVideos.length },
        { status: 200 }
      );
    }

    // 3. Fragment ID採番（既存の最大IDを確認）
    const { data: maxFragmentData } = await supabase
      .from('company_youtube_shorts')
      .select('fragment_id')
      .order('id', { ascending: false })
      .limit(1);

    let nextFragmentNumber = 1;
    if (maxFragmentData && maxFragmentData.length > 0) {
      const match = maxFragmentData[0].fragment_id.match(/youtube-short-(\d+)/);
      if (match) {
        nextFragmentNumber = parseInt(match[1]) + 1;
      }
    }

    // 4. ベクトル埋め込み生成 + 保存
    const results = [];
    
    for (const shortVideo of newShorts) {
      try {
        console.log(`\n📹 処理中: ${shortVideo.title}`);
        
        // Fragment ID生成
        const fragmentId = `youtube-short-${nextFragmentNumber}`;
        const completeUri = `https://nands.tech/shorts#${fragmentId}`;
        
        console.log(`  Fragment ID: ${fragmentId}`);

        // カテゴリ自動判定（タイトルとタグから）
        const category = detectCategory(shortVideo);

        // エンティティ情報生成
        const entity: YouTubeShortEntity = {
          fragmentId,
          completeUri,
          videoId: shortVideo.videoId,
          title: shortVideo.title,
          description: shortVideo.description,
          category,
          tags: shortVideo.tags,
          targetQueries: generateTargetQueries(shortVideo),
          relatedEntities: extractEntities(shortVideo)
        };

        // AI最適化スコア計算
        const aiScore = calculateAIOptimizationScore(shortVideo, entity);
        console.log(`  AI最適化スコア: ${aiScore.totalScore}点`);

        // Schema.org構造化データ生成
        const schemaData = generateYouTubeShortSchema(shortVideo, entity);

        // ベクトル埋め込み生成
        console.log('  🔮 ベクトル埋め込み生成中...');
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-large',
          input: shortVideo.contentForEmbedding,
          dimensions: 1536
        });

        const embedding = embeddingResponse.data[0].embedding;
        console.log(`  ✅ ベクトル生成完了（1536次元）`);

        // Supabaseに保存
        const { data: insertedData, error: insertError } = await supabase
          .from('company_youtube_shorts')
          .insert({
            fragment_id: fragmentId,
            complete_uri: completeUri,
            page_path: '/shorts',
            
            // YouTube動画情報
            video_id: shortVideo.videoId,
            video_url: shortVideo.shortUrl,
            embed_url: shortVideo.embedUrl,
            title: shortVideo.title,
            description: shortVideo.description,
            thumbnail_url: shortVideo.thumbnailUrl,
            duration_seconds: shortVideo.durationSeconds,
            published_at: shortVideo.publishedAt,
            
            // Fragment ID用コンテンツ（必須）
            content_title: shortVideo.title,
            content: shortVideo.contentForEmbedding,
            content_type: 'youtube-short',
            
            // バズ指標
            view_count: shortVideo.viewCount,
            like_count: shortVideo.likeCount,
            comment_count: shortVideo.commentCount,
            engagement_rate: shortVideo.viewCount > 0 
              ? (shortVideo.likeCount + shortVideo.commentCount) / shortVideo.viewCount 
              : 0,
            
            // メタデータ
            tags: shortVideo.tags,
            category,
            
            // ベクトル埋め込み
            content_for_embedding: shortVideo.contentForEmbedding,
            embedding,
            
            // AI最適化
            schema_data: schemaData,
            entity_definition: generateYouTubeShortEntityDefinition(entity),
            ai_optimization_score: aiScore.totalScore,
            target_queries: entity.targetQueries,
            related_entities: entity.relatedEntities,
            semantic_weight: 0.8,
            
            // ステータス
            status: 'published' // 既存動画は公開済み
          })
          .select();

        if (insertError) {
          console.error(`  ❌ 保存エラー:`, insertError);
          results.push({
            videoId: shortVideo.videoId,
            title: shortVideo.title,
            success: false,
            error: insertError.message
          });
        } else {
          console.log(`  ✅ 保存完了 (ID: ${insertedData[0].id})`);
          
          // Fragment Vectorsテーブルにも追加（統合管理用）
          await syncToFragmentVectors(insertedData[0]);
          
          results.push({
            videoId: shortVideo.videoId,
            title: shortVideo.title,
            fragmentId,
            completeUri,
            aiScore: aiScore.totalScore,
            success: true
          });
          
          nextFragmentNumber++;
        }

      } catch (error) {
        console.error(`  ❌ 処理エラー:`, error);
        results.push({
          videoId: shortVideo.videoId,
          title: shortVideo.title,
          success: false,
          error: error instanceof Error ? error.message : '不明なエラー'
        });
      }
    }

    // 5. 統計情報
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('\n✅ YouTubeショート動画同期完了');
    console.log(`  成功: ${successCount}件`);
    console.log(`  失敗: ${failCount}件`);

    return NextResponse.json({
      message: 'YouTubeショート動画同期完了',
      totalVideos: shortVideos.length,
      syncedCount: successCount,
      failedCount: failCount,
      results
    });

  } catch (error) {
    console.error('❌ YouTubeショート動画同期エラー:', error);
    return NextResponse.json(
      { 
        error: 'YouTubeショート動画同期失敗',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}

// ===== ヘルパー関数 =====

/**
 * カテゴリ自動判定
 */
function detectCategory(video: YouTubeShortInfo): string {
  const text = `${video.title} ${video.description} ${video.tags.join(' ')}`.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    'ai-technology': ['ai', '人工知能', 'chatgpt', 'claude', 'llm', '機械学習'],
    'business': ['ビジネス', '経営', 'マーケティング', '営業', 'dx'],
    'technology': ['技術', 'プログラミング', '開発', 'システム', 'エンジニア'],
    'tutorial': ['方法', '使い方', 'how to', 'チュートリアル', '解説'],
    'news': ['最新', 'ニュース', '発表', 'リリース', 'アップデート'],
    'tips': ['コツ', 'ポイント', 'テクニック', '秘訣', 'ヒント']
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'general';
}

/**
 * ターゲットクエリ生成
 */
function generateTargetQueries(video: YouTubeShortInfo): string[] {
  const queries: string[] = [];

  // タイトルから抽出
  queries.push(video.title);

  // タグから関連クエリ生成
  video.tags.forEach(tag => {
    queries.push(tag);
    queries.push(`${tag} とは`);
    queries.push(`${tag} 使い方`);
  });

  // 重複除去して最大10件
  return [...new Set(queries)].slice(0, 10);
}

/**
 * エンティティ抽出
 */
function extractEntities(video: YouTubeShortInfo): string[] {
  const entities: string[] = [];

  // 固定エンティティ
  entities.push('株式会社エヌアンドエス');
  entities.push('AI技術');

  // タグからエンティティ化
  video.tags.forEach(tag => {
    if (tag.length > 2) {
      entities.push(tag);
    }
  });

  // 重複除去
  return [...new Set(entities)];
}

/**
 * Fragment Vectorsテーブルにも同期
 * 統合管理用
 */
async function syncToFragmentVectors(shortData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('fragment_vectors')
      .insert({
        fragment_id: shortData.fragment_id,
        complete_uri: shortData.complete_uri,
        page_path: shortData.page_path,
        content_title: shortData.title,
        content: shortData.content_for_embedding,
        content_type: 'youtube-short',
        category: shortData.category,
        embedding: shortData.embedding,
        semantic_weight: shortData.semantic_weight,
        target_queries: shortData.target_queries,
        related_entities: shortData.related_entities,
        metadata: {
          video_id: shortData.video_id,
          video_url: shortData.video_url,
          duration_seconds: shortData.duration_seconds,
          view_count: shortData.view_count,
          like_count: shortData.like_count,
          ai_optimization_score: shortData.ai_optimization_score
        }
      });

    if (error) {
      console.warn('⚠️ Fragment Vectors同期エラー:', error.message);
    } else {
      console.log('  ✅ Fragment Vectorsにも同期完了');
    }
  } catch (error) {
    console.warn('⚠️ Fragment Vectors同期失敗:', error);
  }
}

