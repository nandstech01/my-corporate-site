import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { FragmentVectorizer } from '@/lib/vector/fragment-vectorizer';

export async function POST(request: Request) {
  try {
    console.log('🚀 既存ブログ記事Fragment ID専用ベクトル化開始...');
    
    const { postIds } = await request.json();
    
    // Supabaseクライアント作成
    const supabase = createClient();
    
    // 対象ブログ記事を取得
    let query = supabase
      .from('posts')
      .select('id, title, slug, content, meta_keywords, category_id, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    // 特定のpostIdsが指定されている場合はフィルタ
    if (postIds && Array.isArray(postIds) && postIds.length > 0) {
      query = query.in('id', postIds);
      console.log(`📝 指定された記事ID: ${postIds.join(', ')}`);
    } else {
      console.log('📝 全ての公開済み記事を対象にします');
    }
    
    const { data: posts, error: postsError } = await query;
    
    if (postsError) {
      console.error('❌ ブログ記事取得エラー:', postsError);
      throw new Error(`ブログ記事取得エラー: ${postsError.message}`);
    }
    
    if (!posts || posts.length === 0) {
      console.log('📝 対象ブログ記事が見つかりませんでした');
      return NextResponse.json({
        success: true,
        message: '対象ブログ記事が見つかりませんでした',
        results: {
          processedPosts: 0,
          totalFragments: 0,
          vectorizedCount: 0,
          successRate: '100.0%',
          errors: []
        }
      });
    }
    
    console.log(`📚 ${posts.length}件のブログ記事を処理開始`);
    
    const fragmentVectorizer = new FragmentVectorizer();
    const allResults = [];
    const allErrors = [];
    let totalFragments = 0;
    let totalVectorized = 0;
    
    // 各ブログ記事を順次処理
    for (const post of posts) {
      try {
        console.log(`\n📖 記事処理開始: "${post.title}" (ID: ${post.id})`);
        
        // Markdownコンテンツから Fragment ID を抽出・ベクトル化
        const result = await fragmentVectorizer.extractAndVectorizeFromMarkdown(
          post.content,
          {
            post_id: post.id,
            post_title: post.title,
            slug: post.slug,
            page_path: `/posts/${post.slug}`,
            category: post.category_id ? `category-${post.category_id}` : 'blog',
            seo_keywords: post.meta_keywords || [],
            rag_sources: ['blog-content', 'user-generated']
          }
        );
        
        const fragmentsFound = result.extractedFragments.length;
        totalFragments += fragmentsFound;
        totalVectorized += result.vectorizedCount;
        
        allResults.push({
          postId: post.id,
          postTitle: post.title,
          slug: post.slug,
          fragmentsFound: fragmentsFound,
          vectorizedCount: result.vectorizedCount,
          successRate: fragmentsFound > 0 ? `${((result.vectorizedCount / fragmentsFound) * 100).toFixed(1)}%` : '100.0%',
          errors: result.errors
        });
        
        if (result.errors.length > 0) {
          allErrors.push(...result.errors.map(error => `[${post.title}] ${error}`));
        }
        
        console.log(`  ✅ 記事処理完了: ${result.vectorizedCount}/${fragmentsFound}個のFragment IDをベクトル化`);
        
        // API制限対策: 記事間で少し待機
        if (posts.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (postError) {
        const errorMessage = `記事 "${post.title}" (ID: ${post.id}) の処理エラー: ${postError instanceof Error ? postError.message : 'Unknown error'}`;
        console.error(`❌ ${errorMessage}`);
        allErrors.push(errorMessage);
        
        allResults.push({
          postId: post.id,
          postTitle: post.title,
          slug: post.slug,
          fragmentsFound: 0,
          vectorizedCount: 0,
          successRate: '0.0%',
          errors: [errorMessage]
        });
      }
    }
    
    const overallSuccessRate = totalFragments > 0 ? ((totalVectorized / totalFragments) * 100).toFixed(1) : '100.0';
    
    console.log(`\n🎉 既存ブログ記事Fragment IDベクトル化完了:`);
    console.log(`   処理記事数: ${posts.length}件`);
    console.log(`   総Fragment ID数: ${totalFragments}個`);
    console.log(`   ベクトル化成功: ${totalVectorized}個`);
    console.log(`   成功率: ${overallSuccessRate}%`);
    console.log(`   エラー数: ${allErrors.length}個`);
    
    return NextResponse.json({
      success: true,
      message: '既存ブログ記事Fragment IDベクトル化完了',
      results: {
        processedPosts: posts.length,
        totalFragments,
        vectorizedCount: totalVectorized,
        successRate: `${overallSuccessRate}%`,
        errors: allErrors,
        postResults: allResults,
        summary: {
          avgFragmentsPerPost: posts.length > 0 ? (totalFragments / posts.length).toFixed(1) : '0',
          postsWithFragments: allResults.filter(r => r.fragmentsFound > 0).length,
          postsWithErrors: allResults.filter(r => r.errors.length > 0).length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ 既存ブログ記事Fragment IDベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: '既存ブログ記事Fragment IDベクトル化でエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 特定記事のFragment IDベクトル化（GET）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({
        success: false,
        error: 'postIdパラメータが必要です'
      }, { status: 400 });
    }
    
    console.log(`🔍 記事ID ${postId} のFragment ID情報を取得中...`);
    
    const supabase = createClient();
    
    // 記事情報を取得
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, title, slug, content, meta_keywords, category_id')
      .eq('id', postId)
      .eq('status', 'published')
      .single();
    
    if (postError || !post) {
      return NextResponse.json({
        success: false,
        error: '指定された記事が見つかりませんでした'
      }, { status: 404 });
    }
    
    // Fragment ID情報を取得
    const { data: fragments, error: fragmentsError } = await supabase
      .from('fragment_vectors')
      .select('fragment_id, content_title, category, complete_uri, created_at')
      .eq('page_path', `/posts/${post.slug}`)
      .order('created_at', { ascending: true });
    
    if (fragmentsError) {
      console.error('Fragment ID取得エラー:', fragmentsError);
      return NextResponse.json({
        success: false,
        error: 'Fragment ID情報の取得に失敗しました'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category_id ? `category-${post.category_id}` : 'blog'
      },
      fragments: fragments || [],
      fragmentCount: fragments?.length || 0,
      categories: Array.from(new Set((fragments || []).map((f: any) => f.category)))
    });
    
  } catch (error) {
    console.error('❌ Fragment ID情報取得エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'Fragment ID情報取得でエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 