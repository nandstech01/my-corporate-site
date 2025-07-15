import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// 統一Supabaseクライアント（シングルトンパターン）
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const getUnifiedSupabaseClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'User-Agent': 'nands-corp-site/1.0'
        }
      }
    })
  }

  return supabaseInstance
}

// デフォルトエクスポート（後方互換性）
export const supabase = getUnifiedSupabaseClient()
export default supabase 