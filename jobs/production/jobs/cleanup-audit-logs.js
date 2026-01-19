/**
 * 古い監査ログ削除ジョブ
 * 
 * 機能: aso.cleanup_old_audit_logs() を呼び出して
 *       保持期間（デフォルト90日）を過ぎた監査ログを削除
 */

export async function execute(supabase, tenantId) {
  console.log('=== 監査ログクリーンアップジョブ開始 ===');
  console.log(`テナントID: ${tenantId}`);

  try {
    // 保持期間（環境変数で上書き可能、デフォルト90日）
    const retentionDays = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90', 10);
    console.log(`保持期間: ${retentionDays}日`);

    // Step 1: cleanup_old_audit_logs RPC実行
    console.log('Step 1: cleanup_old_audit_logs RPC実行中...');
    const { data, error } = await supabase.rpc('cleanup_old_audit_logs', {
      p_retention_days: retentionDays,
    });

    if (error) {
      throw new Error(`RPC実行エラー: ${JSON.stringify(error)}`);
    }

    const deletedCount = data;
    console.log(`✅ 削除完了: ${deletedCount}件の古い監査ログを削除しました`);

    // Step 2: 結果をログ出力
    const result = {
      job_type: 'cleanup-audit-logs',
      tenant_id: tenantId,
      retention_days: retentionDays,
      deleted_count: deletedCount,
      executed_at: new Date().toISOString(),
    };

    console.log('=== 監査ログクリーンアップジョブ完了 ===');
    return result;

  } catch (error) {
    console.error('❌ 監査ログクリーンアップジョブエラー:', error);
    throw error;
  }
}

