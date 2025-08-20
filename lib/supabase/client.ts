import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// シングルトンパターンでSupabaseクライアントを作成
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
    const averageRating = data.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    return {
      totalReviews,
      averageRating: Number(averageRating.toFixed(1))
    };
  } catch (error) {
    console.error('レビュー統計取得エラー:', error);
    return null;
  }
} 