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

// 確認対象の長いslug
const TARGET_SLUGS = [
  'aio対策完全ガイド-2025年最新版-google-aiに-選ばれる-新常識-レリバンスエンジニアリングとは-成功事例で証明'
]

async function checkExistingSlugs() {
  console.log('🔍 既存slugの確認を開始します...\n')
  
  for (const slug of TARGET_SLUGS) {
    console.log(`📝 確認中: ${slug}`)
    console.log(`   文字数: ${slug.length}`)
    
    try {
      // chatgpt_postsテーブルで確認
      const { data: result, error } = await supabase
        .from('chatgpt_posts')
        .select('id, title, slug, status, created_at')
        .eq('slug', slug)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('   ❌ 記事が見つかりません')
        } else {
          console.error(`   ⚠️  エラー: ${error.message}`)
        }
      } else if (result) {
        console.log('   ✅ 記事を発見:')
        console.log(`      ID: ${result.id}`)
        console.log(`      タイトル: ${result.title}`)
        console.log(`      ステータス: ${result.status}`)
        console.log(`      作成日: ${result.created_at}`)
      }

    } catch (error) {
      console.error(`   ❌ 予期しないエラー:`, error)
    }
    
    console.log('') // 空行
  }
  
  console.log('🎉 確認完了!')
}

checkExistingSlugs().catch(console.error) 