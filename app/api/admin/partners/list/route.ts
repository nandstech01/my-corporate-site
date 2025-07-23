import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service Role Keyを使用してRLSをバイパス
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // パートナーデータと統計情報を結合して取得
    const { data: partners, error } = await supabase
      .from('partner_dashboard_view')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('パートナー一覧取得エラー:', error)
      return NextResponse.json(
        { error: 'パートナー一覧の取得に失敗しました', details: error },
        { status: 500 }
      )
    }

    // 各パートナーのリファーラル数を取得
    const partnersWithReferrals = await Promise.all(
      (partners || []).map(async (partner) => {
        try {
          // 紹介者数を取得
          const { count: referralCount } = await supabase
            .from('partners')
            .select('id', { count: 'exact' })
            .eq('parent_partner_id', partner.id)
          
          // 最新の売上活動を取得
          const { data: latestSales } = await supabase
            .from('partner_sales')
            .select('sale_date')
            .eq('partner_id', partner.id)
            .order('sale_date', { ascending: false })
            .limit(1)
          
          return {
            ...partner,
            total_referrals: referralCount || 0,
            latest_sale_date: latestSales?.[0]?.sale_date || null,
            // 追加の統計情報
            performance_metrics: {
              monthly_revenue: await getMonthlyRevenue(partner.id),
              sales_count: await getSalesCount(partner.id),
              conversion_rate: await calculateConversionRate(partner.id)
            }
          }
        } catch (err) {
          console.error(`パートナー ${partner.id} の詳細取得エラー:`, err)
          return {
            ...partner,
            total_referrals: 0,
            latest_sale_date: null,
            performance_metrics: {
              monthly_revenue: 0,
              sales_count: 0,
              conversion_rate: 0
            }
          }
        }
      })
    )

    // 全体統計を計算
    const totalStats = calculateTotalStats(partnersWithReferrals)

    return NextResponse.json({
      success: true,
      partners: partnersWithReferrals,
      totalStats,
      count: partnersWithReferrals.length,
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('パートナー一覧API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error },
      { status: 500 }
    )
  }
}

// 月間売上取得
async function getMonthlyRevenue(partnerId: string): Promise<number> {
  try {
    const currentMonth = new Date()
    currentMonth.setDate(1) // 月初
    
    const { data } = await supabase
      .from('partner_sales')
      .select('partner_commission')
      .eq('partner_id', partnerId)
      .gte('sale_date', currentMonth.toISOString())
      .eq('status', 'confirmed')
    
    return data?.reduce((sum, sale) => sum + (sale.partner_commission || 0), 0) || 0
  } catch {
    return 0
  }
}

// 売上件数取得
async function getSalesCount(partnerId: string): Promise<number> {
  try {
    const { count } = await supabase
      .from('partner_sales')
      .select('id', { count: 'exact' })
      .eq('partner_id', partnerId)
      .eq('status', 'confirmed')
    
    return count || 0
  } catch {
    return 0
  }
}

// 成約率計算（仮）
async function calculateConversionRate(partnerId: string): Promise<number> {
  try {
    // リファーラルクリック数とかがあれば計算できるが、
    // とりあえず売上件数÷紹介者数として簡易計算
    const salesCount = await getSalesCount(partnerId)
    const { count: referralClicks } = await supabase
      .from('referral_links')
      .select('id', { count: 'exact' })
      .eq('partner_id', partnerId)
    
    if (!referralClicks || referralClicks === 0) return 0
    return Math.round((salesCount / referralClicks) * 100 * 100) / 100 // 小数点第2位まで
  } catch {
    return 0
  }
}

// 全体統計計算
function calculateTotalStats(partners: any[]) {
  return {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === 'approved').length,
    pendingPartners: partners.filter(p => p.status === 'pending').length,
    totalRevenue: partners.reduce((sum, p) => sum + (p.total_revenue || 0), 0),
    totalMonthlyRevenue: partners.reduce((sum, p) => sum + (p.performance_metrics?.monthly_revenue || 0), 0),
    totalSales: partners.reduce((sum, p) => sum + (p.performance_metrics?.sales_count || 0), 0),
    averageRevenue: partners.length > 0 
      ? partners.reduce((sum, p) => sum + (p.total_revenue || 0), 0) / partners.length 
      : 0,
    topPerformers: partners
      .filter(p => p.status === 'approved')
      .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        company_name: p.company_name,
        total_revenue: p.total_revenue,
        partner_type: p.partner_type
      }))
  }
} 