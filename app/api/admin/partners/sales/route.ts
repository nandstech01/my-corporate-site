import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service Role Keyを使用してRLSをバイパス
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const inputData = await request.json()
    
    console.log('売上データ受信:', inputData)
    
    // 1. パートナー情報取得（tierを確認）
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, name, tier, referrer_id')
      .eq('id', inputData.partnerId)
      .single()
    
    if (partnerError || !partner) {
      console.error('パートナー情報取得エラー:', partnerError)
      return NextResponse.json(
        { error: 'パートナー情報が見つかりません', details: partnerError },
        { status: 404 }
      )
    }
    
    console.log('パートナー情報:', partner)
    
    // 2. 正確な報酬計算
    const totalAmount = inputData.totalAmount
    let partnerCommission = 0
    let partnerCommissionRate = 0
    let referrerCommission = 0
    let referrerCommissionRate = 0
    let referrerId = null
    
    if (partner.tier === 1) {
      // 1段目パートナー（直接営業）
      partnerCommissionRate = 50
      partnerCommission = Math.floor(totalAmount * 0.50)
      console.log('1段目パートナー直接営業: 50%報酬')
      
    } else if (partner.tier === 2) {
      // 2段目パートナー（紹介者）
      partnerCommissionRate = 35
      partnerCommission = Math.floor(totalAmount * 0.35)
      
      // 1段目の紹介者がいる場合、15%を支払う
      if (partner.referrer_id) {
        referrerId = partner.referrer_id
        referrerCommissionRate = 15
        referrerCommission = Math.floor(totalAmount * 0.15)
        console.log('2段目パートナー営業: 35%報酬 + 1段目紹介者15%報酬')
      } else {
        console.log('2段目パートナー営業: 35%報酬のみ（紹介者なし）')
      }
    } else {
      return NextResponse.json(
        { error: '無効なパートナー段階です', details: `tier: ${partner.tier}` },
        { status: 400 }
      )
    }
    
    // 3. 売上レコード作成
    const salesRecord = {
      partner_id: partner.id,
      referrer_id: referrerId,
      client_company: inputData.clientCompany,
      course_type: inputData.courseType,
      course_name: getCourseNameFromType(inputData.courseType),
      participants: inputData.participants,
      unit_price: inputData.unitPrice,
      total_amount: totalAmount,
      partner_commission_rate: partnerCommissionRate,
      partner_commission: partnerCommission,
      referrer_commission_rate: referrerCommissionRate || null,
      referrer_commission: referrerCommission || null,
      status: 'confirmed', // 管理者入力なので即座に確定
      sale_date: inputData.saleDate
    }
    
    console.log('計算された売上データ:', salesRecord)
    
    // 4. データベース保存
    const { data: saleRecord, error: saleError } = await supabase
      .from('partner_sales')
      .insert(salesRecord)
      .select()
      .single()
    
    if (saleError) {
      console.error('売上データ挿入エラー:', saleError)
      return NextResponse.json(
        { error: '売上データの保存に失敗しました', details: saleError }, 
        { status: 500 }
      )
    }
    
    console.log('売上データ挿入成功:', saleRecord)
    
    // 5. パートナー統計の更新
    await updatePartnerStats(partner.id)
    if (referrerId) {
      await updatePartnerStats(referrerId)
    }
    
    // 6. レスポンス作成
    const response = {
      success: true,
      message: '売上入力が完了しました',
      saleRecord,
      calculation: {
        totalAmount,
        partnerInfo: {
          id: partner.id,
          name: partner.name,
          tier: partner.tier,
          commission: partnerCommission,
          rate: `${partnerCommissionRate}%`
        },
        referrerInfo: referrerId ? {
          id: referrerId,
          commission: referrerCommission,
          rate: `${referrerCommissionRate}%`
        } : null,
        systemDescription: partner.tier === 1 
          ? '1段目パートナー直接営業（50%報酬）'
          : referrerId 
            ? '2段目パートナー営業（35%報酬）+ 1段目紹介者（15%報酬）'
            : '2段目パートナー営業（35%報酬のみ）'
      }
    }
    
    console.log('売上処理完了:', response.calculation)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('売上入力API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// コースタイプから日本語名を取得
function getCourseNameFromType(courseType: string): string {
  const courseMap: Record<string, string> = {
    'ai_development': 'AI駆動開発講座',
    'aio_re_implementation': 'AIO・RE実装講座',
    'sns_consulting': 'SNSコンサル講座'
  }
  return courseMap[courseType] || courseType
}

// パートナー統計更新（トリガーの補助）
async function updatePartnerStats(partnerId: string) {
  try {
    // 確定売上の統計を再計算
    const { data: stats } = await supabase
      .from('partner_sales')
      .select('partner_commission, referrer_commission')
      .eq('partner_id', partnerId)
      .eq('status', 'confirmed')
    
    if (stats) {
      const totalRevenue = stats.reduce((sum, sale) => sum + (sale.partner_commission || 0), 0)
      
      await supabase
        .from('partners')
        .update({
          total_revenue: totalRevenue,
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerId)
    }
    
    console.log(`パートナー統計更新完了: ${partnerId}`)
  } catch (error) {
    console.error('パートナー統計更新エラー:', error)
  }
}

// パートナー一覧取得API
export async function GET() {
  try {
    const { data: partners, error } = await supabase
      .from('partners')
      .select('id, company_name, partner_type, representative_name, status')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('パートナー一覧取得エラー:', error)
      return NextResponse.json(
        { error: 'パートナー一覧の取得に失敗しました' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      partners: partners || [],
      count: partners?.length || 0
    })
    
  } catch (error) {
    console.error('パートナー一覧API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 