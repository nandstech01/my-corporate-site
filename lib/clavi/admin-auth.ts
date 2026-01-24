/**
 * CLAVI Admin Authentication Utilities
 * プラットフォーム管理者の認証・権限チェック
 *
 * @description
 * 環境変数 CLAVI_PLATFORM_ADMIN_EMAILS でプラットフォーム管理者を指定
 * カンマ区切りで複数指定可能
 */

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export interface AdminUser {
  id: string;
  email: string;
  isPlatformAdmin: boolean;
}

/**
 * プラットフォーム管理者のメールアドレス一覧を取得
 */
export function getPlatformAdminEmails(): string[] {
  const envValue = process.env.CLAVI_PLATFORM_ADMIN_EMAILS || '';
  return envValue
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

/**
 * 指定されたメールアドレスがプラットフォーム管理者かどうかを判定
 */
export function isPlatformAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = getPlatformAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}

/**
 * 現在のユーザーがプラットフォーム管理者かどうかを確認
 * 管理者でない場合はnullを返す
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Authorizationヘッダーからトークンを取得
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.replace('Bearer ', '');

    // トークンを使ってユーザー情報を取得
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    const email = user.email;
    const isAdmin = isPlatformAdmin(email);

    if (!isAdmin) {
      return null;
    }

    return {
      id: user.id,
      email: email || '',
      isPlatformAdmin: true,
    };
  } catch {
    return null;
  }
}

/**
 * 管理者権限チェック用のレスポンスを生成
 */
export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'Unauthorized: Admin access required' }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * 認証エラー用のレスポンスを生成
 */
export function unauthenticatedResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'Unauthenticated: Please log in' }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
