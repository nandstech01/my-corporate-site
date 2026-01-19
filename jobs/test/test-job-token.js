const { GoogleAuth } = require('google-auth-library');

/**
 * Task 5.2 E2Eテスト
 * Cloud Run Jobs環境でOIDC IDトークンを取得し、job-token APIを呼び出す
 */
async function main() {
  console.log('=== Task 5.2: ジョブトークン発行 E2Eテスト開始 ===\n');

  // 環境変数確認
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  const TENANT_ID = process.env.TENANT_ID || 'test-tenant-uuid';
  const OIDC_AUDIENCE = process.env.OIDC_AUDIENCE || 'https://nands.tech/api/aso/job-token';

  console.log('📋 設定確認:');
  console.log(`  - API_URL: ${API_URL}`);
  console.log(`  - TENANT_ID: ${TENANT_ID}`);
  console.log(`  - OIDC_AUDIENCE: ${OIDC_AUDIENCE}\n`);

  try {
    // Step 1: OIDC IDトークン取得
    console.log('Step 1: OIDC IDトークン取得...');
    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(OIDC_AUDIENCE);
    const idToken = await client.idTokenProvider.fetchIdToken(OIDC_AUDIENCE);
    
    if (!idToken) {
      throw new Error('OIDC IDトークンが取得できませんでした');
    }
    console.log('✅ OIDC IDトークン取得成功\n');

    // トークンのペイロード確認（デバッグ用）
    const [, payloadB64] = idToken.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    console.log('📄 OIDC IDトークンペイロード:');
    console.log(`  - iss: ${payload.iss}`);
    console.log(`  - aud: ${payload.aud}`);
    console.log(`  - email: ${payload.email}`);
    console.log(`  - sub: ${payload.sub}\n`);

    // Step 2: ジョブトークン発行API呼び出し
    console.log('Step 2: ジョブトークン発行API呼び出し...');
    console.log(`  - エンドポイント: ${API_URL}/api/aso/job-token`);
    console.log(`  - テナントID: ${TENANT_ID}\n`);

    const response = await fetch(`${API_URL}/api/aso/job-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'X-Tenant-ID': TENANT_ID,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API呼び出し失敗: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('✅ ジョブトークン発行成功\n');

    // Step 3: レスポンス確認
    console.log('Step 3: レスポンス確認...');
    console.log('📋 発行されたジョブトークン情報:');
    console.log(`  - tenant_id: ${data.tenant_id}`);
    console.log(`  - expires_at: ${data.expires_at}`);
    console.log(`  - token_length: ${data.job_token?.length || 0} chars\n`);

    // JWTペイロード確認
    if (data.job_token) {
      const [, jwtPayloadB64] = data.job_token.split('.');
      const jwtPayload = JSON.parse(Buffer.from(jwtPayloadB64, 'base64url').toString('utf8'));
      console.log('📄 発行されたSupabase JWTペイロード:');
      console.log(`  - iss: ${jwtPayload.iss}`);
      console.log(`  - aud: ${jwtPayload.aud}`);
      console.log(`  - role: ${jwtPayload.role}`);
      console.log(`  - sub: ${jwtPayload.sub}`);
      console.log(`  - tenant_id (custom claim): ${jwtPayload['https://nands.tech/tenant_id']}`);
      console.log(`  - tenant_role (custom claim): ${jwtPayload['https://nands.tech/tenant_role']}`);
      console.log(`  - source (custom claim): ${jwtPayload['https://nands.tech/source']}\n`);

      // 検証
      let allChecksPassed = true;

      if (jwtPayload['https://nands.tech/tenant_id'] !== TENANT_ID) {
        console.error(`❌ tenant_id不一致: ${jwtPayload['https://nands.tech/tenant_id']} (期待値: ${TENANT_ID})`);
        allChecksPassed = false;
      } else {
        console.log('✅ tenant_id 正しい');
      }

      if (jwtPayload['https://nands.tech/tenant_role'] !== 'member') {
        console.error(`❌ tenant_role不一致: ${jwtPayload['https://nands.tech/tenant_role']} (期待値: member)`);
        allChecksPassed = false;
      } else {
        console.log('✅ tenant_role が member');
      }

      if (jwtPayload['https://nands.tech/source'] !== 'cloud_run_job') {
        console.error(`❌ source不一致: ${jwtPayload['https://nands.tech/source']} (期待値: cloud_run_job)`);
        allChecksPassed = false;
      } else {
        console.log('✅ source が cloud_run_job');
      }

      if (jwtPayload.role !== 'authenticated') {
        console.error(`❌ role不一致: ${jwtPayload.role} (期待値: authenticated)`);
        allChecksPassed = false;
      } else {
        console.log('✅ role が authenticated');
      }

      if (!jwtPayload.exp || jwtPayload.exp < Math.floor(Date.now() / 1000)) {
        console.error(`❌ expが過去: ${jwtPayload.exp}`);
        allChecksPassed = false;
      } else {
        console.log('✅ exp が未来');
      }

      if (allChecksPassed) {
        console.log('\n🎉 すべてのチェック合格！');
        console.log('\n✅ Task 5.2 E2Eテスト成功！');
        process.exit(0);
      } else {
        console.error('\n❌ 検証失敗！');
        process.exit(1);
      }
    } else {
      throw new Error('job_tokenが返されませんでした');
    }

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('スタックトレース:', error.stack);
    }
    process.exit(1);
  } finally {
    console.log('\n=== テスト完了 ===');
  }
}

main();

