#!/usr/bin/env npx tsx
/**
 * 全分析データ削除スクリプト
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function deleteAllAnalyses() {
  console.log('=== 分析データ削除 ===\n');

  // 削除前の件数確認
  const { data: beforeData, error: beforeError } = await supabase.rpc('admin_count_analyses');

  if (beforeError) {
    // RPCがない場合は直接SQLを試す
    console.log('RPC未定義のため、直接削除を実行...');
  } else {
    console.log('削除前の件数:', beforeData);
  }

  // 全ての分析データを削除（RPC経由）
  const { data, error } = await supabase.rpc('admin_delete_all_analyses');

  if (error) {
    console.error('❌ エラー:', error.message);
    console.log('\n手動で削除する場合は、Supabase SQL Editorで以下を実行してください:');
    console.log('DELETE FROM clavi.analyses;');
    return;
  }

  console.log('削除結果:', data);
  console.log('\n✅ 分析データを全て削除しました');
}

deleteAllAnalyses();
