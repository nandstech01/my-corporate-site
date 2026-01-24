/**
 * AI Search Optimizer Cloud Run Jobs - Entry Point
 *
 * 環境変数 JOB_TYPE で実行するジョブを動的に切り替え
 *
 * 利用可能なジョブ:
 * - cleanup-audit-logs: 古い監査ログ削除
 * - example-job: サンプルジョブ（テスト用）
 */

import { createClient } from '@supabase/supabase-js';
import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';

// .envファイル読み込み（ローカル開発用、Cloud Runでは環境変数で上書き）
dotenv.config();

// 環境変数検証
const requiredEnvVars = [
  'SUPABASE_URL',
  'API_URL',
  'GCP_PROJECT_ID',
  'GCP_SERVICE_ACCOUNT_EMAIL',
  'TENANT_ID'
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ 必須環境変数が設定されていません: ${varName}`);
    process.exit(1);
  }
}

const JOB_TYPE = process.env.JOB_TYPE || 'cleanup-audit-logs';
const SUPABASE_URL = process.env.SUPABASE_URL;
const API_URL = process.env.API_URL; // https://your-domain.com
const TENANT_ID = process.env.TENANT_ID;
const OIDC_AUDIENCE = process.env.OIDC_AUDIENCE || `${API_URL}/api/clavi/job-token`;

console.log('=== AI Search Optimizer Cloud Run Job 開始 ===');
console.log(`ジョブ種別: ${JOB_TYPE}`);
console.log(`テナントID: ${TENANT_ID}`);
console.log(`API URL: ${API_URL}`);

/**
 * OIDC IDトークン取得
 */
async function getOidcToken() {
  try {
    const auth = new OAuth2Client();
    const client = await auth.getIdTokenClient(OIDC_AUDIENCE);
    const token = await client.idTokenProvider.fetchIdToken(OIDC_AUDIENCE);
    return token;
  } catch (error) {
    console.error('❌ OIDC IDトークン取得失敗:', error);
    throw error;
  }
}

/**
 * Supabase JWTトークン取得（/api/clavi/job-token経由）
 */
async function getSupabaseToken(oidcToken) {
  try {
    const response = await fetch(`${API_URL}/api/clavi/job-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${oidcToken}`,
        'X-Tenant-ID': TENANT_ID,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API呼び出し失敗: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.access_token || data.job_token;
  } catch (error) {
    console.error('❌ Supabase JWTトークン取得失敗:', error);
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    // Step 1: OIDC IDトークン取得
    console.log('Step 1: OIDC IDトークン取得中...');
    const oidcToken = await getOidcToken();
    console.log('✅ OIDC IDトークン取得成功');

    // Step 2: Supabase JWTトークン取得
    console.log('Step 2: Supabase JWTトークン取得中...');
    const supabaseToken = await getSupabaseToken(oidcToken);
    console.log('✅ Supabase JWTトークン取得成功');

    // Step 3: Supabaseクライアント作成
    console.log('Step 3: Supabaseクライアント作成中...');
    const supabase = createClient(SUPABASE_URL, supabaseToken, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
        },
      },
    });
    console.log('✅ Supabaseクライアント作成成功');

    // Step 4: ジョブ実行
    console.log(`Step 4: ジョブ実行中（${JOB_TYPE}）...`);
    
    // ジョブ種別に応じて動的にインポート
    const jobModule = await import(`./jobs/${JOB_TYPE}.js`);
    const result = await jobModule.execute(supabase, TENANT_ID);
    
    console.log('✅ ジョブ実行成功:', result);
    console.log('=== ジョブ完了 ===');
    process.exit(0);

  } catch (error) {
    console.error('❌ ジョブ実行エラー:', error);
    console.error('スタックトレース:', error.stack);
    process.exit(1);
  }
}

// 実行
main();

