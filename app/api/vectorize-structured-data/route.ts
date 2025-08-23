import { NextResponse } from 'next/server';
import { ContentExtractor } from '@/lib/vector/content-extractor';
import { OpenAIEmbeddings } from '@/lib/vector/openai-embeddings';
import { SupabaseVectorStore } from '@/lib/vector/supabase-vector-store';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('🔧 構造化データ専用ベクトル化開始...');
    
    // 1. ContentExtractorで構造化データファイルを抽出
    console.log('📄 構造化データファイル抽出中...');
    const extractor = new ContentExtractor();
    const allContents = await extractor.extractAllContent();
    
    // 構造化データファイルのみをフィルタ
    const structuredDataContents = allContents.filter(content => 
      content.metadata.type === 'structured-data'
    );
    
    console.log(`📊 構造化データファイル数: ${structuredDataContents.length}個`);
    
    if (structuredDataContents.length === 0) {
      return NextResponse.json({
        success: false,
        message: '構造化データファイルが見つかりません'
      });
    }
    
    // 2. 既存の構造化データベクトルを削除
    console.log('🗑️ 既存の構造化データベクトルを削除中...');
    
    const { data: deletedData, error: deleteError } = await supabaseServiceRole
      .from('company_vectors')
      .delete()
      .eq('content_type', 'structured-data')
      .select('id');

    if (deleteError) {
      console.error('❌ 既存ベクトル削除エラー:', deleteError);
    } else {
      const deletedCount = deletedData?.length || 0;
      console.log(`✅ ${deletedCount}個の既存構造化データベクトルを削除`);
    }
    
    // 3. OpenAI Embeddings とベクトルストア初期化
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = new SupabaseVectorStore();
    
    let totalVectorized = 0;
    const results = [];
    
    // 4. 各構造化データファイルをベクトル化
    for (const content of structuredDataContents) {
      try {
        console.log(`📝 ${content.title} をベクトル化中...`);
        
        // ベクトル化実行
        const embedding = await embeddings.embedSingle(content.content);
        
        const vectorData = {
          id: `${content.url.replace(/\//g, '-').replace(/^-/, '')}-${Date.now()}`,
          content: content.content,
          embedding: embedding,
          metadata: {
            url: content.url,
            title: content.title,
            type: content.metadata.type,
            category: content.metadata.category,
            wordCount: content.metadata.wordCount,
            createdAt: new Date().toISOString(),
            technicalConcepts: content.metadata.technicalConcepts,
            headings: content.metadata.headings,
            lastModified: content.metadata.lastModified
          },
          content_type: 'structured-data',
          page_slug: content.url,
          section_title: content.title
        };
        
        const result = await vectorStore.saveVector(vectorData);
        totalVectorized++;
        
        results.push({
          file: content.url,
          title: content.title,
          wordCount: content.metadata.wordCount,
          technicalConcepts: content.metadata.technicalConcepts?.length || 0,
          status: 'success'
        });
        
        console.log(`✅ ${content.title} ベクトル化完了`);
        
      } catch (error) {
        console.error(`❌ ${content.title} ベクトル化エラー:`, error);
        results.push({
          file: content.url,
          title: content.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // 5. 統計確認
    const { data: newVectorData } = await supabaseServiceRole
      .from('company_vectors')
      .select('id')
      .eq('content_type', 'structured-data');
      
    const newVectorCount = newVectorData?.length || 0;
    
    console.log(`🎯 構造化データベクトル化完了: ${totalVectorized}個作成`);
    console.log(`📊 構造化データベクトル総数: ${newVectorCount}個`);
    
    return NextResponse.json({
      success: true,
      message: '構造化データ専用ベクトル化が正常に完了しました',
      results: {
        totalVectorized,
        newVectorCount,
        details: results,
        fileList: structuredDataContents.map(c => ({
          file: c.url,
          title: c.title,
          wordCount: c.metadata.wordCount,
          technicalConcepts: c.metadata.technicalConcepts?.length || 0
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ 構造化データベクトル化エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: '構造化データベクトル化に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 