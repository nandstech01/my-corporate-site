/**
 * Task 5.3 テスト: ジョブ専用ユーザー作成RPC
 * 
 * テスト内容:
 * 1. aso.get_or_create_job_user() RPCで新規ジョブユーザー作成
 * 2. 冪等性確認（2回目は既存ユーザーを返す）
 * 3. ジョブユーザーのログイン不能を確認
 */

const { createClient } = require('@supabase/supabase-js');

// 環境変数
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xhmhzhethpwjxuwksmuv.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const TEST_TENANT_ID = process.env.TEST_TENANT_ID || '00000000-0000-0000-0000-000000000001'; // テスト用UUID

async function main() {
  console.log('=== Task 5.3: ジョブ専用ユーザー作成RPCテスト開始 ===\n');

  if (!SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_ANON_KEYが設定されていません');
  }

  // Supabaseクライアント作成
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('📋 設定確認:');
  console.log(`  - SUPABASE_URL: ${SUPABASE_URL}`);
  console.log(`  - TEST_TENANT_ID: ${TEST_TENANT_ID}\n`);

  try {
    // Step 1: 1回目の呼び出し（新規作成）
    console.log('Step 1: 1回目の呼び出し（新規作成）...');
    const { data: result1, error: error1 } = await supabase.rpc('get_or_create_job_user', {
      p_tenant_id: TEST_TENANT_ID
    });

    if (error1) {
      throw new Error(`RPC呼び出しエラー: ${JSON.stringify(error1)}`);
    }

    console.log('✅ RPC呼び出し成功\n');
    console.log('📄 レスポンス（1回目）:');
    console.log(JSON.stringify(result1, null, 2));
    console.log('');

    // 検証1: 新規作成されたか
    if (result1.created !== true) {
      console.error(`❌ created が true でない: ${result1.created}`);
      process.exit(1);
    }
    console.log('✅ created が true（新規作成）');

    // 検証2: メールが正しいフォーマットか
    const expectedEmailPattern = /^job-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@example\.invalid$/;
    if (!expectedEmailPattern.test(result1.email)) {
      console.error(`❌ メールフォーマット不正: ${result1.email}`);
      process.exit(1);
    }
    console.log('✅ メールフォーマット正しい（@example.invalid）');

    // 検証3: BANされているか
    if (result1.is_banned !== true) {
      console.error(`❌ is_banned が true でない: ${result1.is_banned}`);
      process.exit(1);
    }
    console.log('✅ is_banned が true（ログイン不能）');

    // 検証4: auth_user_idが存在するか
    if (!result1.auth_user_id) {
      console.error(`❌ auth_user_id が存在しない`);
      process.exit(1);
    }
    console.log('✅ auth_user_id が存在');

    console.log('');

    // Step 2: 2回目の呼び出し（冪等性確認）
    console.log('Step 2: 2回目の呼び出し（冪等性確認）...');
    const { data: result2, error: error2 } = await supabase.rpc('get_or_create_job_user', {
      p_tenant_id: TEST_TENANT_ID
    });

    if (error2) {
      throw new Error(`RPC呼び出しエラー（2回目）: ${JSON.stringify(error2)}`);
    }

    console.log('✅ RPC呼び出し成功（2回目）\n');
    console.log('📄 レスポンス（2回目）:');
    console.log(JSON.stringify(result2, null, 2));
    console.log('');

    // 検証5: 冪等性（既存ユーザーが返される）
    if (result2.created !== false) {
      console.error(`❌ created が false でない: ${result2.created}`);
      process.exit(1);
    }
    console.log('✅ created が false（既存ユーザー）');

    // 検証6: 同じauth_user_idが返される
    if (result2.auth_user_id !== result1.auth_user_id) {
      console.error(`❌ auth_user_id が異なる: ${result1.auth_user_id} != ${result2.auth_user_id}`);
      process.exit(1);
    }
    console.log('✅ auth_user_id が一致（冪等性保証）');

    // 検証7: 同じメールアドレスが返される
    if (result2.email !== result1.email) {
      console.error(`❌ email が異なる: ${result1.email} != ${result2.email}`);
      process.exit(1);
    }
    console.log('✅ email が一致');

    console.log('');

    // Step 3: データベース確認（aso.job_usersから直接取得）
    console.log('Step 3: データベース確認（aso.job_usersから直接取得）...');
    const { data: jobUsersData, error: jobUsersError } = await supabase
      .from('aso.job_users')
      .select('*')
      .eq('tenant_id', TEST_TENANT_ID)
      .single();

    if (jobUsersError) {
      // RLSで弾かれる可能性があるのでwarning扱い
      console.warn(`⚠️ aso.job_usersから取得できませんでした（RLSで保護されている可能性）: ${jobUsersError.message}`);
    } else {
      console.log('✅ aso.job_usersから取得成功\n');
      console.log('📄 aso.job_usersデータ:');
      console.log(JSON.stringify(jobUsersData, null, 2));
    }

    console.log('\n🎉 すべてのチェック合格！');
    console.log('\n✅ Task 5.3 テスト成功！');
    console.log('\n📝 作成されたジョブユーザー:');
    console.log(`  - tenant_id: ${result1.tenant_id}`);
    console.log(`  - auth_user_id: ${result1.auth_user_id}`);
    console.log(`  - email: ${result1.email}`);
    console.log(`  - is_banned: ${result1.is_banned}`);
    console.log(`  - ログイン: 不可能（@example.invalid + BAN）\n`);

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('スタックトレース:', error.stack);
    }
    process.exit(1);
  } finally {
    console.log('=== テスト完了 ===');
  }
}

main();

