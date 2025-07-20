import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// 環境変数を読み込み
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔑 環境変数確認:')
console.log(`  Supabase URL: ${supabaseUrl ? '✅ 設定済み' : '❌ 未設定'}`)
console.log(`  Service Role Key: ${supabaseKey ? '✅ 設定済み' : '❌ 未設定'}\n`)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数が設定されていません。.env.localファイルを確認してください。')
  process.exit(1)
}

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