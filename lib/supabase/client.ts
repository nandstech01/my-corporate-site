import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// シングルトンパターンでSupabaseクライアントを作成（既存コード用）
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
  }
  return supabaseInstance;
})();

// App Router用のクライアント作成関数（CLAVI SaaS用）
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
}

// レビュー数を取得する関数
export async function getReviewStats(serviceId: string) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('service_id', serviceId)
      .eq('is_approved', true)
      .eq('is_public', true);

    if (error) {
      console.error('レビュー統計取得エラー:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0
      };
    }

    const totalReviews = data.length;
    type ReviewRatingRow = { rating: number | null };
    const rows = data as unknown as ReviewRatingRow[];
    const averageRating =
      rows.reduce((sum, review) => sum + (review.rating ?? 0), 0) / totalReviews;

    return {
      totalReviews,
      averageRating: Number(averageRating.toFixed(1))
    };
  } catch (error) {
    console.error('レビュー統計取得エラー:', error);
    return null;
  }
} 