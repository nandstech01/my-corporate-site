import { createClient } from '@supabase/supabase-js'
import { generateSlug } from '../utils/slug'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// 長いslugを短縮版に更新する記事リスト
const SLUG_UPDATES = [
  {
    oldSlug: 'aio対策完全ガイド-2025年最新版-google-aiに-選ばれる-新常識-レリバンスエンジニアリングとは-成功事例で証明',
    newSlug: 'aio-レリバンスエンジニアリング-2025-構造化データ',
    title: 'AIO対策完全ガイド 2025年最新版 Google AIに選ばれる新常識 レリバンスエンジニアリングとは 成功事例で証明'
  }
  // 他の長いslugもここに追加
]

async function updateLongSlugs() {
  console.log('🚀 長いslugの更新を開始します...')
  
  for (const update of SLUG_UPDATES) {
    console.log(`\n📝 更新中: ${update.oldSlug}`)
    console.log(`➡️  新slug: ${update.newSlug}`)
    
    try {
      // chatgpt_postsテーブルで更新
      const { data: result, error } = await supabase
        .from('chatgpt_posts')
        .update({ 
          slug: update.newSlug,
          updated_at: new Date().toISOString()
        })
        .eq('slug', update.oldSlug)
        .select()

      if (error) {
        console.error(`❌ エラー: ${error.message}`)
        continue
      }

      if (result && result.length > 0) {
        console.log(`✅ 更新完了: ID ${result[0].id}`)
      } else {
        console.log(`⚠️  記事が見つかりません: ${update.oldSlug}`)
      }

    } catch (error) {
      console.error(`❌ 予期しないエラー:`, error)
    }
  }
  
  console.log('\n🎉 全ての更新が完了しました!')
}

updateLongSlugs().catch(console.error) 