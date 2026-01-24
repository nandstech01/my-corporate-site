#!/usr/bin/env npx tsx
/**
 * スーパーアドミンユーザー確認スクリプト
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  console.error('   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY が必要です');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const adminEmail = process.env.CLAVI_PLATFORM_ADMIN_EMAILS?.split(',')[0]?.trim() || 'contact@nands.tech';

  console.log('=== スーパーアドミン設定確認 ===\n');
  console.log('対象メール:', adminEmail);

  // 1. ユーザー存在確認
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('ユーザー一覧取得エラー:', listError.message);
    return;
  }

  const existingUser = users.users.find(u => u.email === adminEmail);

  if (existingUser) {
    console.log('\n✅ ユーザーが存在します');
    console.log('   ID:', existingUser.id);
    console.log('   Email:', existingUser.email);
    console.log('   確認済み:', existingUser.email_confirmed_at ? 'はい' : 'いいえ');

    // テナント紐付け確認（claviスキーマ）
    const { data: tenants, error: tenantError } = await supabase
      .rpc('get_user_tenants_admin', { p_user_id: existingUser.id });

    if (!tenantError && tenants && tenants.length > 0) {
      console.log('\n✅ テナント紐付け:');
      tenants.forEach((t: any) => {
        console.log('   -', t.tenant_name || t.tenant_id, '(役割:', t.role + ')');
      });
    } else {
      console.log('\n⚠️ テナントに紐付けられていません');
      console.log('   → プラットフォーム管理者として /clavi/admin にアクセス可能です');
    }
  } else {
    console.log('\n❌ ユーザーが存在しません - 作成します...');

    // ユーザー作成
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'TempPassword123!',  // 初期パスワード
      email_confirm: true,
    });

    if (createError) {
      console.error('ユーザー作成エラー:', createError.message);
      return;
    }

    console.log('\n✅ ユーザーを作成しました');
    console.log('   ID:', newUser.user.id);
    console.log('   Email:', newUser.user.email);
    console.log('   初期パスワード: TempPassword123!');
    console.log('   ⚠️ ログイン後、パスワードを変更してください');
  }

  console.log('\n=== 既存ユーザー一覧 ===');
  users.users.slice(0, 10).forEach(u => {
    const isAdmin = u.email === adminEmail ? ' ⭐ ADMIN' : '';
    console.log('-', u.email, isAdmin);
  });
  if (users.users.length > 10) {
    console.log('... 他', users.users.length - 10, '件');
  }

  console.log('\n=== 次のステップ ===');
  console.log('1. npm run dev でサーバー起動');
  console.log('2. http://localhost:3000/clavi/login でログイン');
  console.log('3. /clavi/admin でプラットフォーム管理画面にアクセス');
}

main().catch(console.error);
