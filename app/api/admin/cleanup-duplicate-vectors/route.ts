import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key を使用してRLSをバイパス
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { dry_run = true } = await request.json();
    
    console.log(`🧹 重複ベクトルクリーンアップ開始 (${dry_run ? 'DRY RUN' : 'LIVE'})`);

    // 🛡️ 絶対保護対象の確認
    const protectedTypes = ['generated_blog', 'structured-data', 'corporate', 'technical'];
    
    const protectedCounts: Record<string, number> = {};
    for (const type of protectedTypes) {
      const { count } = await supabaseServiceRole
        .from('company_vectors')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', type);
      protectedCounts[type] = count || 0;
    }

    console.log('🛡️ 保護対象データ:', protectedCounts);

    // 🔍 service重複データの分析
    const { data: duplicateAnalysis, error: analysisError } = await supabaseServiceRole
      .from('company_vectors')
      .select('section_title, id, created_at')
      .eq('content_type', 'service')
      .order('section_title')
      .order('created_at');

    if (analysisError) {
      throw new Error(`分析エラー: ${analysisError.message}`);
    }

    // 🎯 重複データをグループ化（最古のものは保持）
    interface VectorRecord {
      id: string;
      section_title: string;
      created_at: string;
    }
    
    const duplicateGroups: Record<string, VectorRecord[]> = {};
    duplicateAnalysis?.forEach((record) => {
      if (!duplicateGroups[record.section_title]) {
        duplicateGroups[record.section_title] = [];
      }
      duplicateGroups[record.section_title].push(record);
    });

    // 📊 削除対象の特定（各グループの最古以外）
    let deleteTargets: string[] = [];
    let preserveCount = 0;
    
    Object.entries(duplicateGroups).forEach(([title, records]) => {
      if (records.length > 1) {
        // 最古のレコードは保持、それ以外は削除対象
        const sortedRecords = records.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const toKeep = sortedRecords[0]; // 最古を保持
        const toDelete = sortedRecords.slice(1); // それ以外は削除
        
        preserveCount += 1;
        deleteTargets = deleteTargets.concat(toDelete.map(r => r.id));
        
        console.log(`📝 ${title}: 保持(${toKeep.created_at}) / 削除${toDelete.length}個`);
      } else {
        preserveCount += 1;
      }
    });

    const stats = {
      total_service_records: duplicateAnalysis.length,
      unique_services: Object.keys(duplicateGroups).length,
      records_to_preserve: preserveCount,
      records_to_delete: deleteTargets.length,
      protected_data: protectedCounts
    };

    console.log('📊 クリーンアップ統計:', stats);

    // 🗑️ 実際の削除実行
    let deletedCount = 0;
    if (!dry_run && deleteTargets.length > 0) {
      console.log(`🗑️ ${deleteTargets.length}個の重複レコードを削除中...`);
      
      // バッチごとに削除（安全のため）
      const batchSize = 50;
      for (let i = 0; i < deleteTargets.length; i += batchSize) {
        const batch = deleteTargets.slice(i, i + batchSize);
        
        const { data: deletedData, error: deleteError } = await supabaseServiceRole
          .from('company_vectors')
          .delete()
          .in('id', batch)
          .eq('content_type', 'service') // 二重安全チェック
          .select('id');

        if (deleteError) {
          console.error(`❌ バッチ削除エラー (${i}-${i + batchSize}):`, deleteError);
          throw deleteError;
        }

        deletedCount += deletedData?.length || 0;
        console.log(`✅ バッチ ${Math.ceil((i + 1) / batchSize)} 完了: ${deletedData?.length}個削除`);
      }
    }

    // 🔍 クリーンアップ後の確認
    const { count: finalServiceCount } = await supabaseServiceRole
      .from('company_vectors')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'service');

    // 🛡️ 保護対象データの整合性確認
    const finalProtectedCounts: Record<string, number> = {};
    for (const type of protectedTypes) {
      const { count } = await supabaseServiceRole
        .from('company_vectors')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', type);
      finalProtectedCounts[type] = count || 0;
    }

    // 🚨 保護対象データの変更チェック
    let dataIntegrityOk = true;
    for (const type of protectedTypes) {
      if (protectedCounts[type] !== finalProtectedCounts[type]) {
        console.error(`🚨 保護データ変更検出: ${type} ${protectedCounts[type]} → ${finalProtectedCounts[type]}`);
        dataIntegrityOk = false;
      }
    }

    const finalStats = {
      ...stats,
      execution_mode: dry_run ? 'DRY_RUN' : 'LIVE',
      actually_deleted: deletedCount,
      final_service_count: finalServiceCount,
      final_protected_counts: finalProtectedCounts,
      data_integrity_ok: dataIntegrityOk,
      timestamp: new Date().toISOString()
    };

    console.log('✅ クリーンアップ完了:', finalStats);

    return NextResponse.json({
      success: true,
      dry_run: dry_run,
      stats: finalStats,
      message: dry_run 
        ? `DRY RUN完了: ${deleteTargets.length}個の重複レコードが削除対象として特定されました`
        : `クリーンアップ完了: ${deletedCount}個の重複レコードを削除しました`,
      recommendations: [
        "まずDRY RUN (dry_run: true) で安全性を確認してください",
        "保護対象データ (generated_blog, structured-data, corporate, technical) は絶対に削除されません",
        "各サービスの最古のレコードは保持されます",
        "実行前に必ずデータベースのバックアップを取ることを推奨します"
      ]
    });

  } catch (error) {
    console.error('❌ クリーンアップエラー:', error);
    return NextResponse.json({
      success: false,
      error: 'クリーンアップに失敗しました',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 