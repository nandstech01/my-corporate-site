/**
 * Complete URIドメイン修正スクリプト
 * ken12.tech → nands.tech に一括変更
 * 
 * 実行方法:
 * npx tsx scripts/fix-complete-uri-domain.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env.localファイルを読み込む
config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixCompletUriDomain() {
  console.log('🔧 Complete URIドメイン修正開始\n')

  // 1. 対象レコードを確認
  console.log('📊 修正対象の確認中...')
  const { data: targetRecords, error: fetchError } = await supabase
    .from('company_youtube_shorts')
    .select('id, fragment_id, complete_uri, blog_slug')
    .like('complete_uri', '%ken12.tech%')

  if (fetchError) {
    console.error('❌ データ取得エラー:', fetchError)
    return
  }

  if (!targetRecords || targetRecords.length === 0) {
    console.log('✅ 修正対象のレコードはありません（既に修正済み）')
    return
  }

  console.log(`📋 修正対象: ${targetRecords.length}件\n`)
  
  // 2. レコードごとに表示
  for (const record of targetRecords) {
    console.log(`  ID: ${record.id}`)
    console.log(`  Fragment ID: ${record.fragment_id}`)
    console.log(`  現在: ${record.complete_uri}`)
    console.log(`  修正後: ${record.complete_uri?.replace('ken12.tech', 'nands.tech')}`)
    console.log('')
  }

  // 3. 修正実行
  console.log('🔄 Complete URI修正中...')
  let successCount = 0
  let errorCount = 0

  for (const record of targetRecords) {
    const newCompleteUri = record.complete_uri?.replace('ken12.tech', 'nands.tech')
    
    if (!newCompleteUri) {
      console.log(`⚠️  ID ${record.id}: Complete URIがnullのためスキップ`)
      continue
    }

    const { error: updateError } = await supabase
      .from('company_youtube_shorts')
      .update({ complete_uri: newCompleteUri })
      .eq('id', record.id)

    if (updateError) {
      console.error(`❌ ID ${record.id}: 更新エラー`, updateError)
      errorCount++
    } else {
      console.log(`✅ ID ${record.id}: 更新成功`)
      successCount++
    }
  }

  // 4. 結果サマリー
  console.log('\n📊 修正結果サマリー')
  console.log(`  ✅ 成功: ${successCount}件`)
  console.log(`  ❌ 失敗: ${errorCount}件`)
  console.log(`  📋 合計: ${targetRecords.length}件`)

  // 5. fragment_vectorsテーブルも修正
  console.log('\n🔄 fragment_vectorsテーブルも修正中...')
  
  const { data: vectorRecords, error: vectorFetchError } = await supabase
    .from('fragment_vectors')
    .select('id, fragment_id, complete_uri')
    .like('complete_uri', '%ken12.tech%')

  if (vectorFetchError) {
    console.error('❌ fragment_vectors取得エラー:', vectorFetchError)
  } else if (!vectorRecords || vectorRecords.length === 0) {
    console.log('✅ fragment_vectorsに修正対象なし')
  } else {
    console.log(`📋 fragment_vectors修正対象: ${vectorRecords.length}件\n`)
    
    let vectorSuccessCount = 0
    let vectorErrorCount = 0

    for (const record of vectorRecords) {
      const newCompleteUri = record.complete_uri?.replace('ken12.tech', 'nands.tech')
      
      if (!newCompleteUri) {
        console.log(`⚠️  ID ${record.id}: Complete URIがnullのためスキップ`)
        continue
      }

      const { error: updateError } = await supabase
        .from('fragment_vectors')
        .update({ complete_uri: newCompleteUri })
        .eq('id', record.id)

      if (updateError) {
        console.error(`❌ ID ${record.id}: 更新エラー`, updateError)
        vectorErrorCount++
      } else {
        console.log(`✅ ID ${record.id}: 更新成功`)
        vectorSuccessCount++
      }
    }

    console.log('\n📊 fragment_vectors修正結果')
    console.log(`  ✅ 成功: ${vectorSuccessCount}件`)
    console.log(`  ❌ 失敗: ${vectorErrorCount}件`)
  }

  // 6. 最終確認
  console.log('\n🔍 最終確認...')
  
  const { data: afterShorts } = await supabase
    .from('company_youtube_shorts')
    .select('id, complete_uri')
    .like('complete_uri', '%ken12.tech%')

  const { data: afterVectors } = await supabase
    .from('fragment_vectors')
    .select('id, complete_uri')
    .like('complete_uri', '%ken12.tech%')

  let allClear = true
  
  if (afterShorts && afterShorts.length > 0) {
    console.log(`⚠️  company_youtube_shortsにまだken12.techが残っています: ${afterShorts.length}件`)
    allClear = false
  } else {
    console.log('✅ company_youtube_shorts: ken12.tech完全削除')
  }

  if (afterVectors && afterVectors.length > 0) {
    console.log(`⚠️  fragment_vectorsにまだken12.techが残っています: ${afterVectors.length}件`)
    allClear = false
  } else {
    console.log('✅ fragment_vectors: ken12.tech完全削除')
  }

  if (allClear) {
    console.log('\n🎉 全テーブルでken12.techを完全に削除しました！')
  }

  console.log('\n🎉 Complete URIドメイン修正完了')
}

// 実行
fixCompletUriDomain()
  .then(() => {
    console.log('\n✅ スクリプト正常終了')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ スクリプトエラー:', error)
    process.exit(1)
  })
