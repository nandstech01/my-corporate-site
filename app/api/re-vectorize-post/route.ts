import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { FragmentVectorizer } from '@/lib/vector/fragment-vectorizer';
import { FragmentVectorStore } from '@/lib/vector/fragment-vector-store';

/**
 * 🔄 記事の再ベクトル化専用API
 * 
 * 既存のFragment Vectorを削除してから再ベクトル化を行う
 * 編集ページの「再ベクトル化」ボタン専用
 * 
 * ⚠️ 既存の /api/vectorize-blog-fragments とは独立
 */
export async function POST(request: Request) {
  try {
    console.log('🔄 記事再ベクトル化API開始...');
    
    const { postId } = await request.json();
    
    if (!postId) {
      return NextResponse.json({
        success: false,
        error: 'postIdパラメータが必要です'
      }, { status: 400 });
    }

    console.log(`📝 対象記事ID: ${postId}`);
    
    // Supabaseクライアント作成
    const supabase = createClient();
    
    // 記事情報を取得
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, title, slug, content, meta_keywords, category_id, status')
      .eq('id', postId)
      .single();
    
    if (postError || !post) {
      console.error('❌ 記事取得エラー:', postError);
      return NextResponse.json({
        success: false,
        error: '記事が見つかりませんでした',
        details: postError?.message
      }, { status: 404 });
    }

    console.log(`📖 記事取得成功: "${post.title}" (slug: ${post.slug})`);

    // page_pathを構築
    const pagePath = `/posts/${post.slug}`;
    
    // 🗑️ 既存のFragment Vectorを削除
    console.log(`🗑️ 既存のFragment Vector削除開始: ${pagePath}`);
    
    const fragmentVectorStore = new FragmentVectorStore();
    const deleteResult = await fragmentVectorStore.clearFragmentVectors({
      pagePathFilter: pagePath
    });

    if (deleteResult.success) {
      console.log(`✅ ${deleteResult.deletedCount}個の既存Fragment Vectorを削除しました`);
    } else {
      console.warn(`⚠️ 既存Fragment Vectorの削除に失敗しました（初回の場合は正常）`);
    }

    // 🔄 再ベクトル化実行
    console.log('🔄 Fragment ID再抽出・再ベクトル化開始...');
    
    const fragmentVectorizer = new FragmentVectorizer();
    const result = await fragmentVectorizer.extractAndVectorizeFromMarkdown(
      post.content,
      {
        post_id: post.id,
        post_title: post.title,
        slug: post.slug,
        page_path: pagePath,
        category: post.category_id ? `category-${post.category_id}` : 'blog',
        seo_keywords: post.meta_keywords || [],
        rag_sources: ['blog-content', 'user-generated']
      }
    );

    const fragmentsFound = result.extractedFragments.length;
    
    console.log(`📊 再ベクトル化完了:`);
    console.log(`  - Fragment ID抽出: ${fragmentsFound}個`);
    console.log(`  - ベクトル化成功: ${result.vectorizedCount}個`);
    console.log(`  - エラー数: ${result.errors.length}個`);

    if (result.errors.length > 0) {
      console.warn('⚠️ エラー詳細:');
      result.errors.forEach((error, index) => {
        console.warn(`  ${index + 1}. ${error}`);
      });
    }

    const successRate = fragmentsFound > 0 
      ? `${((result.vectorizedCount / fragmentsFound) * 100).toFixed(1)}%` 
      : '100.0%';

    return NextResponse.json({
      success: result.success,
      message: '記事のFragment ID再ベクトル化完了',
      result: {
        postId: post.id,
        postTitle: post.title,
        slug: post.slug,
        pagePath: pagePath,
        deletedVectors: deleteResult.deletedCount,
        fragmentsFound: fragmentsFound,
        vectorizedCount: result.vectorizedCount,
        successRate: successRate,
        errors: result.errors
      }
    });
    
  } catch (error) {
    console.error('❌ 記事再ベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: '記事再ベクトル化でエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

