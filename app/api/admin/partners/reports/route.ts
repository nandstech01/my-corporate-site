import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service Role Keyを使用してRLSをバイパス
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    console.log('レポート生成開始 - 期間:', range)
    
    // 基本統計データを取得
    const [overviewData, performerData, salesData] = await Promise.all([
      getOverviewStats(),
      getTopPerformers(),
      getSalesStats(range)
    ])
    
    // レポートデータを生成
    const report = {
      overview: overviewData,
      topPerformers: performerData,
      typeBreakdown: await getTypeBreakdown(),
      monthlyTrends: await getMonthlyTrends(range),
      recentActivity: await getRecentActivity()
    }
    
    console.log('レポート生成完了:', {
      totalPartners: report.overview.totalPartners,
      totalRevenue: report.overview.totalRevenue
    })
    
    return NextResponse.json({
      success: true,
      report,
      generatedAt: new Date().toISOString(),
      range
    })
    
  } catch (error) {
    console.error('レポートAPI エラー:', error)
    return NextResponse.json(
      { error: 'レポート生成に失敗しました', details: error },
      { status: 500 }
    )
  }
}

// 概要統計取得
async function getOverviewStats() {
  try {
    // パートナー統計
    const { data: partnerStats } = await supabase
      .from('partners')
      .select('status, total_revenue')
    
    // 売上統計
    const { data: salesStats } = await supabase
      .from('partner_sales')
      .select('partner_commission, sale_date')
      .eq('status', 'confirmed')
    
    const totalPartners = partnerStats?.length || 0
    const activePartners = partnerStats?.filter(p => p.status === 'approved').length || 0
    const pendingPartners = partnerStats?.filter(p => p.status === 'pending').length || 0
    
    const totalRevenue = partnerStats?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) || 0
    
    // 今月の売上
    const currentMonth = new Date()
    currentMonth.setDate(1)
    const monthlyRevenue = salesStats?.filter(s => new Date(s.sale_date) >= currentMonth)
      .reduce((sum, s) => sum + (s.partner_commission || 0), 0) || 0
    
    const avgRevenuePerPartner = activePartners > 0 ? totalRevenue / activePartners : 0
    
    return {
      totalPartners,
      activePartners,
      pendingPartners,
      totalRevenue,
      monthlyRevenue,
      avgRevenuePerPartner
    }
  } catch (error) {
    console.error('概要統計取得エラー:', error)
    return {
      totalPartners: 0,
      activePartners: 0,
      pendingPartners: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      avgRevenuePerPartner: 0
    }
  }
}

// トップパフォーマー取得
async function getTopPerformers() {
  try {
    const { data: performers } = await supabase
      .from('partner_dashboard_view')
      .select('*')
      .eq('status', 'approved')
      .order('total_revenue', { ascending: false })
      .limit(10)
    
    if (!performers) return []
    
    // 月間売上と件数を追加
    const performersWithDetails = await Promise.all(
      performers.map(async (performer) => {
        const currentMonth = new Date()
        currentMonth.setDate(1)
        
        const { data: monthlySales } = await supabase
          .from('partner_sales')
          .select('partner_commission')
          .eq('partner_id', performer.id)
          .eq('status', 'confirmed')
          .gte('sale_date', currentMonth.toISOString())
        
        const { count: salesCount } = await supabase
          .from('partner_sales')
          .select('id', { count: 'exact' })
          .eq('partner_id', performer.id)
          .eq('status', 'confirmed')
        
        const monthlyRevenue = monthlySales?.reduce((sum, s) => sum + (s.partner_commission || 0), 0) || 0
        
        return {
          id: performer.id,
          company_name: performer.company_name,
          partner_type: performer.partner_type,
          total_revenue: performer.total_revenue || 0,
          monthly_revenue: monthlyRevenue,
          sales_count: salesCount || 0
        }
      })
    )
    
    return performersWithDetails
  } catch (error) {
    console.error('トップパフォーマー取得エラー:', error)
    return []
  }
}

// 売上統計取得
async function getSalesStats(range: string) {
  try {
    let dateFilter = new Date()
    
    switch (range) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30)
        break
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90)
        break
      case '1y':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1)
        break
    }
    
    const { data: sales } = await supabase
      .from('partner_sales')
      .select('*')
      .eq('status', 'confirmed')
      .gte('sale_date', dateFilter.toISOString())
    
    return sales || []
  } catch (error) {
    console.error('売上統計取得エラー:', error)
    return []
  }
}

// タイプ別分析取得
async function getTypeBreakdown() {
  try {
    const { data: partners } = await supabase
      .from('partner_dashboard_view')
      .select('partner_type, total_revenue')
      .eq('status', 'approved')
    
    if (!partners) return { kol: { count: 0, revenue: 0 }, corporate: { count: 0, revenue: 0 } }
    
    const kolPartners = partners.filter(p => p.partner_type === 'kol')
    const corporatePartners = partners.filter(p => p.partner_type === 'corporate')
    
    return {
      kol: {
        count: kolPartners.length,
        revenue: kolPartners.reduce((sum, p) => sum + (p.total_revenue || 0), 0)
      },
      corporate: {
        count: corporatePartners.length,
        revenue: corporatePartners.reduce((sum, p) => sum + (p.total_revenue || 0), 0)
      }
    }
  } catch (error) {
    console.error('タイプ別分析取得エラー:', error)
    return { kol: { count: 0, revenue: 0 }, corporate: { count: 0, revenue: 0 } }
  }
}

// 月次トレンド取得
async function getMonthlyTrends(range: string) {
  try {
    // 簡易版：過去6ヶ月のデータ
    const trends = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1)
      
      // その月のパートナー数
      const { count: partnersCount } = await supabase
        .from('partners')
        .select('id', { count: 'exact' })
        .gte('created_at', monthDate.toISOString())
        .lt('created_at', nextMonth.toISOString())
      
      // その月の売上
      const { data: monthlySales } = await supabase
        .from('partner_sales')
        .select('partner_commission')
        .eq('status', 'confirmed')
        .gte('sale_date', monthDate.toISOString())
        .lt('sale_date', nextMonth.toISOString())
      
      const { count: salesCount } = await supabase
        .from('partner_sales')
        .select('id', { count: 'exact' })
        .eq('status', 'confirmed')
        .gte('sale_date', monthDate.toISOString())
        .lt('sale_date', nextMonth.toISOString())
      
      const revenue = monthlySales?.reduce((sum, s) => sum + (s.partner_commission || 0), 0) || 0
      
      trends.push({
        month: monthDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }),
        partners: partnersCount || 0,
        revenue,
        sales: salesCount || 0
      })
    }
    
    return trends
  } catch (error) {
    console.error('月次トレンド取得エラー:', error)
    return []
  }
}

// 最近のアクティビティ取得
async function getRecentActivity() {
  try {
    const activities: Array<{
      type: 'application' | 'sale' | 'approval'
      description: string
      date: string
      amount?: number
    }> = []
    
    // 最近の申請
    const { data: recentApplications } = await supabase
      .from('partners')
      .select('company_name, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5)
    
    // 最近の売上
    const { data: recentSales } = await supabase
      .from('partner_sales')
      .select('client_company, partner_commission, sale_date')
      .eq('status', 'confirmed')
      .order('sale_date', { ascending: false })
      .limit(5)
    
    // 申請をアクティビティに変換
    recentApplications?.forEach(app => {
      if (app.status === 'pending') {
        activities.push({
          type: 'application' as const,
          description: `${app.company_name}からパートナー申請`,
          date: app.created_at
        })
      } else if (app.status === 'approved') {
        activities.push({
          type: 'approval' as const,
          description: `${app.company_name}のパートナー申請を承認`,
          date: app.created_at
        })
      }
    })
    
    // 売上をアクティビティに変換
    recentSales?.forEach(sale => {
      activities.push({
        type: 'sale' as const,
        description: `${sale.client_company}との成約`,
        date: sale.sale_date,
        amount: sale.partner_commission
      })
    })
    
    // 日付順でソート
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return activities.slice(0, 10)
  } catch (error) {
    console.error('最近のアクティビティ取得エラー:', error)
    return []
  }
} 