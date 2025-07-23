import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service Role Keyを使用してRLSをバイパス
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const salesData = await request.json()
    
    console.log('売上データ受信:', salesData)
    
    // 1. partner_salesテーブルに売上データを挿入
    const { data: saleRecord, error: saleError } = await supabase
      .from('partner_sales')
      .insert({
        partner_id: salesData.partnerId,
        referrer_id: salesData.referrerId || null,
        client_company: salesData.clientCompany,
        course_type: salesData.courseType,
        course_name: getCourseNameFromType(salesData.courseType),
        participants: salesData.participants,
        unit_price: salesData.unitPrice,
        total_amount: salesData.totalAmount,
        partner_commission_rate: salesData.partnerCommissionRate,
        partner_commission: salesData.partnerCommission,
        referrer_commission_rate: salesData.referrerCommissionRate || null,
        referrer_commission: salesData.referrerCommission || null,
        status: 'confirmed', // 管理者入力なので即座に確定
        sale_date: salesData.saleDate
      })
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
    
    // 2. パートナー統計の更新（トリガーで自動実行されるが、確認のため手動でも更新）
    await updatePartnerStats(salesData.partnerId)
    if (salesData.referrerId) {
      await updatePartnerStats(salesData.referrerId)
    }
    
    return NextResponse.json({
      success: true,
      message: '売上入力が完了しました',
      saleRecord,
      partnerDashboardUpdate: 'パートナーダッシュボードに反映されました'
    })
    
  } catch (error) {
    console.error('売上入力API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error },
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