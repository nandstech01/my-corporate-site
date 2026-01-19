/**
 * サンプルジョブ（テスト用）
 * 
 * 機能: Supabaseクライアントが正しく動作するかテスト
 */

export async function execute(supabase, tenantId) {
  console.log('=== サンプルジョブ開始 ===');
  console.log(`テナントID: ${tenantId}`);

  try {
    // Step 1: テナント情報取得
    console.log('Step 1: テナント情報取得中...');
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, subscription_tier')
      .eq('id', tenantId)
      .maybeSingle();

    if (tenantError) {
      throw new Error(`テナント情報取得エラー: ${JSON.stringify(tenantError)}`);
    }

    if (!tenant) {
      throw new Error(`テナントが見つかりません: ${tenantId}`);
    }

    console.log('✅ テナント情報:', tenant);

    // Step 2: 監査ログ件数確認
    console.log('Step 2: 監査ログ件数確認中...');
    const { count, error: countError } = await supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    if (countError) {
      throw new Error(`監査ログ件数確認エラー: ${JSON.stringify(countError)}`);
    }

    console.log(`✅ 監査ログ件数: ${count}件`);

    // Step 3: 結果返却
    const result = {
      job_type: 'example-job',
      tenant_id: tenantId,
      tenant_name: tenant.name,
      audit_log_count: count,
      executed_at: new Date().toISOString(),
      message: 'サンプルジョブが正常に実行されました',
    };

    console.log('=== サンプルジョブ完了 ===');
    return result;

  } catch (error) {
    console.error('❌ サンプルジョブエラー:', error);
    throw error;
  }
}

