#!/usr/bin/env npx tsx
/**
 * 管理者パスワードリセットスクリプト
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

async function resetPassword() {
  const email = 'contact@nands.tech';
  const newPassword = 'AsoAdmin2026!';

  // ユーザーIDを取得
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users.find(u => u.email === email);

  if (!user) {
    console.log('❌ ユーザーが見つかりません');
    return;
  }

  // パスワード更新
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword
  });

  if (error) {
    console.log('❌ エラー:', error.message);
    return;
  }

  console.log('✅ パスワードをリセットしました');
  console.log('');
  console.log('=== ログイン情報 ===');
  console.log('Email:', email);
  console.log('Password:', newPassword);
  console.log('');
  console.log('URL: http://localhost:3000/aso/login');
}

resetPassword();
