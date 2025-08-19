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

// 並行実行防止のためのロック機能（データベースベース）
const LOCK_KEY = 'vectorize-all-content-lock';
const LOCK_DURATION = 15 * 60 * 1000; // 15分（処理時間を考慮して延長）

export async function POST() {
  try {
    // 1. データベースベースロックチェック
    const { data: lockData } = await supabaseServiceRole
      .from('system_locks')
      .select('locked_at')
      .eq('lock_key', LOCK_KEY)
      .single();

    const now = new Date();
    
    if (lockData) {
      const lockedAt = new Date(lockData.locked_at);
      const timeSincelock = now.getTime() - lockedAt.getTime();
      
      if (timeSincelock < LOCK_DURATION) {
        console.log('⚠️ 全コンテンツベクトル化が既に実行中です（DBロック）');
        return NextResponse.json({
          success: false,
          error: '全コンテンツベクトル化が既に実行中です。しばらく待ってから再試行してください。',
          lockedAt: lockData.locked_at
        }, { status: 423 }); // 423 Locked
      }
    }

    // DBロック設定
    await supabaseServiceRole
      .from('system_locks')
      .upsert({
        lock_key: LOCK_KEY,
        locked_at: now.toISOString()
      });
    
    console.log('🔒 全コンテンツベクトル化ロック設定（DB）');

    console.log('🚀 全コンテンツベクトル化開始...');
    
    // 2. 既存の重複可能性があるベクトルを削除（重複防止強化）
    const deleteTypes = ['structured-data', 'service', 'corporate', 'technical'];
    let totalDeletedCount = 0;
    
    for (const contentType of deleteTypes) {
      console.log(`🗑️ 既存の${contentType}ベクトルを削除中...`);
      
      // まず既存件数を確認
      const { data: existingData, error: countError } = await supabaseServiceRole
        .from('company_vectors')
        .select('id')
        .eq('content_type', contentType);
        
      if (countError) {
        console.error(`❌ ${contentType}ベクトル確認エラー:`, countError);
        continue;
      }
      
      const existingCount = existingData?.length || 0;
      console.log(`📊 削除対象${contentType}ベクトル: ${existingCount}件`);
      
      if (existingCount === 0) {
        console.log(`ℹ️ ${contentType}ベクトルは既に存在しません`);
        continue;
      }
      
      // 削除実行
      const { data: deletedData, error: deleteError } = await supabaseServiceRole
        .from('company_vectors')
        .delete()
        .eq('content_type', contentType)
        .select('id');

      if (deleteError) {
        console.error(`❌ ${contentType}ベクトル削除エラー:`, deleteError);
        // DBロック解除
        await supabaseServiceRole
          .from('system_locks')
          .delete()
          .eq('lock_key', LOCK_KEY);
        return NextResponse.json({
          success: false,
          error: `削除エラー (${contentType}): ${deleteError.message}`
        }, { status: 500 });
      }

      const deletedCount = deletedData?.length || 0;
      totalDeletedCount += deletedCount;
      console.log(`✅ ${deletedCount}個の既存${contentType}ベクトルを削除`);
      
      // 削除確認
      const { data: remainingData } = await supabaseServiceRole
        .from('company_vectors')
        .select('id')
        .eq('content_type', contentType);
        
      const remainingCount = remainingData?.length || 0;
      if (remainingCount > 0) {
        console.warn(`⚠️ ${contentType}ベクトル削除後に${remainingCount}件残存`);
      } else {
        console.log(`✅ ${contentType}ベクトル完全削除確認`);
      }
    }

    console.log(`🎯 総削除件数: ${totalDeletedCount}件`);
    
    // 3. コンテンツ抽出
    const contentExtractor = new ContentExtractor();
    const contents = await contentExtractor.extractAllContent();
    console.log(`📄 抽出されたコンテンツ数: ${contents.length}`);
    
    if (contents.length === 0) {
      // DBロック解除
      await supabaseServiceRole
        .from('system_locks')
        .delete()
        .eq('lock_key', LOCK_KEY);
      return NextResponse.json({
        success: false,
        error: 'ベクトル化するコンテンツが見つかりません'
      }, { status: 404 });
    }
    
    // 4. OpenAI Embeddings初期化
    const embeddings = new OpenAIEmbeddings();
    
    // 5. SupabaseVectorStore初期化
    const vectorStore = new SupabaseVectorStore();
    
    // 6. 全コンテンツをベクトル化
    console.log(`🔄 ${contents.length}個のコンテンツをベクトル化中...`);
    const allVectors = await embeddings.processExtractedContent(contents);
    
    console.log(`🎯 総ベクトル数: ${allVectors.length}`);
    
    // 7. 全ベクトルを保存
    console.log('💾 全ベクトルを保存中...');
    const saveResults = [];
    let successCount = 0;
    let failureCount = 0;
    
    for (const vector of allVectors) {
      try {
        const result = await vectorStore.saveVector(vector);
        saveResults.push(result);
        successCount++;
        console.log(`✅ ベクトル保存成功: ${vector.metadata.title} (ID: ${result.id})`);
      } catch (error) {
        console.error(`❌ ベクトル保存エラー: ${vector.metadata.title}`, error);
        failureCount++;
      }
    }
    
    console.log(`✅ 全コンテンツベクトル化完了！削除: ${totalDeletedCount}, 成功: ${successCount}, 失敗: ${failureCount}`);
    
    // DBロック解除
    await supabaseServiceRole
      .from('system_locks')
      .delete()
      .eq('lock_key', LOCK_KEY);
    console.log('🔓 全コンテンツベクトル化ロック解除（DB）');
    
    return NextResponse.json({
      success: true,
      message: '全コンテンツのベクトル化が完了しました',
      results: {
        deletedVectors: totalDeletedCount,
        extractedContents: contents.length,
        totalVectors: allVectors.length,
        saveResults: {
          success: successCount,
          failure: failureCount,
          total: allVectors.length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ 全コンテンツベクトル化エラー:', error);
    // DBロック解除
    await supabaseServiceRole
      .from('system_locks')
      .delete()
      .eq('lock_key', LOCK_KEY);
    console.log('🔓 全コンテンツベクトル化ロック解除（エラー時・DB）');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }, { status: 500 });
  }
} 