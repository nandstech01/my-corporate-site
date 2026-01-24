/**
 * OIDC ID Token取得テスト
 * 
 * このスクリプトはCloud Run Jobs内で実行され、
 * OIDC IDトークンを取得してペイロードを表示します。
 * 
 * 既存システムへの影響: なし（読み取りのみ）
 */

const { GoogleAuth } = require('google-auth-library');

async function testOIDC() {
  console.log('=== OIDC ID Token取得テスト開始 ===\n');

  try {
    // Step 1: GoogleAuthインスタンス作成
    console.log('Step 1: GoogleAuthインスタンス作成...');
    const auth = new GoogleAuth();
    console.log('✅ GoogleAuthインスタンス作成成功\n');

    // Step 2: audienceを設定（将来の内部API URL）
    const audience = 'https://nands.tech/api/clavi/job-token';
    console.log(`Step 2: audience設定: ${audience}\n`);

    // Step 3: IDトークンクライアント取得
    console.log('Step 3: IDトークンクライアント取得...');
    const client = await auth.getIdTokenClient(audience);
    console.log('✅ IDトークンクライアント取得成功\n');

    // Step 4: IDトークン取得
    console.log('Step 4: IDトークン取得...');
    const idToken = await client.idTokenProvider.fetchIdToken(audience);
    console.log('✅ IDトークン取得成功\n');

    // Step 5: トークンのペイロード確認
    console.log('Step 5: トークンペイロード確認...');
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: audience
    });
    const payload = ticket.getPayload();
    console.log('✅ トークンペイロード:');
    console.log(JSON.stringify(payload, null, 2));
    console.log();

    // Step 6: 重要なフィールド確認
    console.log('Step 6: 重要フィールド確認...');
    console.log(`  - iss (発行者): ${payload.iss}`);
    console.log(`  - aud (audience): ${payload.aud}`);
    console.log(`  - sub (subject): ${payload.sub}`);
    console.log(`  - email: ${payload.email}`);
    console.log(`  - exp (有効期限): ${new Date(payload.exp * 1000).toISOString()}`);
    console.log();

    // 検証
    console.log('=== 検証結果 ===');
    const checks = [
      { name: 'iss がGoogle', pass: payload.iss.includes('accounts.google.com') },
      { name: 'aud が設定値と一致', pass: payload.aud === audience },
      { name: 'email がSAのメール', pass: payload.email.includes('aso-job-runner') },
      { name: 'exp が未来', pass: payload.exp > Date.now() / 1000 }
    ];

    checks.forEach(check => {
      console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
    });

    const allPass = checks.every(c => c.pass);
    console.log();
    console.log(allPass ? '🎉 すべてのチェック合格！' : '⚠️ 一部チェック失敗');

    console.log('\n=== テスト完了 ===');
    process.exit(allPass ? 0 : 1);

  } catch (error) {
    console.error('❌ エラー発生:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 実行
testOIDC();

