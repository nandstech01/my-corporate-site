import { NextResponse } from 'next/server';
import { FragmentVectorizer, FragmentInfo } from '@/lib/vector/fragment-vectorizer';

export async function POST() {
  try {
    console.log('🚀 既存ブログ記事著者Fragment IDベクトル化開始...');
    
    const fragmentVectorizer = new FragmentVectorizer();
    
    // 著者Fragment ID情報（全ブログ記事共通・HARADA_KENJI_PROFILE統合版）
    const authorFragmentInfo: FragmentInfo = {
      fragment_id: 'author-profile',
      content_title: '著者プロフィール - 原田賢治',
      content: `原田賢治 - 代表取締役・AI技術責任者。Mike King理論に基づくレリバンスエンジニアリング専門家。生成AI検索最適化、ChatGPT・Perplexity対応のGEO実装、企業向けAI研修を手がける。15年以上のAI・システム開発経験を持ち、全国で企業のDX・AI活用、退職代行サービスを支援。Triple RAGベクトル検索システム構築、自動記事生成システム実用化など革新的技術開発に取り組む。X(Twitter): @NANDS_AI、LinkedIn: 原田賢治プロフィール。`,
      content_type: 'author',
      category: 'author',
      semantic_weight: 0.90, // 信頼性向上のため重み増加
      target_queries: [
        '原田賢治',
        '代表取締役',
        'AI技術責任者', 
        'レリバンスエンジニアリング専門家',
        'Mike King理論',
        'AI研修講師',
        'NANDS代表',
        'AI検索最適化専門家',
        'Triple RAGシステム',
        'ベクトル検索専門家'
      ],
      related_entities: [
        'NANDS',
        'レリバンスエンジニアリング',
        'Mike King理論',
        'AI検索最適化',
        'ChatGPT',
        'Perplexity',
        'GEO対策',
        'AI研修',
        'Triple RAG',
        'ベクトル検索システム',
        '自動記事生成システム'
      ]
    };

    // 既存のブログ記事Fragment IDを取得
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 既存のブログ記事Fragment IDを取得（著者以外）
    const { data: existingFragments, error: fetchError } = await supabase
      .from('fragment_vectors')
      .select('page_path, fragment_id')
      .like('page_path', '/posts/%')
      .neq('content_type', 'author');

    if (fetchError) {
      console.error('❌ 既存Fragment ID取得エラー:', fetchError);
      return NextResponse.json({
        success: false,
        error: '既存Fragment ID取得エラー',
        details: fetchError.message
      }, { status: 500 });
    }

    // ユニークなpage_pathを取得
    const uniquePagePaths = Array.from(new Set(existingFragments?.map(f => f.page_path) || []));
    console.log(`📊 対象ブログ記事数: ${uniquePagePaths.length}件`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 各ブログ記事に著者Fragment IDを追加
    for (const pagePath of uniquePagePaths) {
      try {
        const slug = pagePath.replace('/posts/', '');
        
        // 著者Fragment IDが既に存在するかチェック
        const { data: existingAuthor } = await supabase
          .from('fragment_vectors')
          .select('id')
          .eq('page_path', pagePath)
          .eq('fragment_id', 'author-profile')
          .single();

        if (existingAuthor) {
          console.log(`⚠️ 著者Fragment ID既存: ${pagePath}`);
          continue;
        }

        // 著者Fragment IDをベクトル化
        const result = await fragmentVectorizer.vectorizeBlogFragments({
          post_id: 0, // 既存記事用特別ID
          post_title: `既存ブログ記事著者 - ${slug}`,
          slug: slug,
          page_path: pagePath,
          fragments: [authorFragmentInfo],
          category: 'author',
          seo_keywords: ['原田賢治', 'NANDS', 'AI専門家'],
          rag_sources: ['author-profile', 'company-profile']
        });

        if (result.success) {
          successCount++;
          console.log(`✅ 著者Fragment ID追加完了: ${pagePath}`);
        } else {
          errorCount++;
          errors.push(`${pagePath}: ${result.errors.join(', ')}`);
          console.error(`❌ 著者Fragment ID追加失敗: ${pagePath}`, result.errors);
        }

      } catch (error) {
        errorCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${pagePath}: ${errorMsg}`);
        console.error(`❌ 著者Fragment ID処理エラー: ${pagePath}`, error);
      }
    }

    const successRate = uniquePagePaths.length > 0 
      ? ((successCount / uniquePagePaths.length) * 100).toFixed(1)
      : '0.0';

    console.log(`📊 既存ブログ記事著者Fragment IDベクトル化完了:`);
    console.log(`   対象記事数: ${uniquePagePaths.length}件`);
    console.log(`   成功: ${successCount}件`);
    console.log(`   エラー: ${errorCount}件`);
    console.log(`   成功率: ${successRate}%`);

    return NextResponse.json({
      success: true,
      message: '既存ブログ記事著者Fragment IDベクトル化完了',
      results: {
        targetArticles: uniquePagePaths.length,
        successCount: successCount,
        errorCount: errorCount,
        successRate: `${successRate}%`,
        errors: errors,
        summary: {
          fragmentId: 'author-profile',
          contentType: 'author',
          category: 'author',
          targetQueries: authorFragmentInfo.target_queries?.length || 0,
          relatedEntities: authorFragmentInfo.related_entities?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('❌ 既存ブログ記事著者Fragment IDベクトル化エラー:', error);
    return NextResponse.json({
      success: false,
      error: '既存ブログ記事著者Fragment IDベクトル化でエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 