import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('2段目ダッシュボードデータ取得開始')
    
    // TODO: 認証機能実装後、実際のユーザーIDを取得
    // 現在はテスト用：tier=2のパートナーを取得
    const { data: referrers, error: referrerError } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        email,
        tier,
        total_sales,
        total_commission,
        status,
        created_at,
        referrer_id
      `)
      .eq('tier', 2)
      .eq('status', 'active')
      .limit(1)

    if (referrerError) {
      console.error('2段目パートナー取得エラー:', referrerError)
      return NextResponse.json(
        { error: '2段目パートナー情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!referrers || referrers.length === 0) {
      console.log('2段目パートナーが見つかりません')
      return NextResponse.json({
        referrer: null,
        sales: [],
        message: '2段目パートナーとして登録されていません'
      })
    }

    const referrer = referrers[0]
    console.log('2段目パートナー取得成功:', referrer)

    // 売上履歴取得（2段目は referrer_id として記録される）
    const { data: salesData, error: salesError } = await supabase
      .from('partner_sales')
      .select(`
        id,
        client_company,
        course_name,
        total_amount,
        referrer_commission,
        sale_date,
        status,
        created_at
      `)
      .eq('referrer_id', referrer.id)
      .order('created_at', { ascending: false })

    if (salesError) {
      console.error('売上履歴取得エラー:', salesError)
      return NextResponse.json(
        { error: '売上履歴の取得に失敗しました' },
        { status: 500 }
      )
    }

    console.log('売上履歴取得成功:', {
      referrerId: referrer.id,
      salesCount: salesData?.length || 0
    })

    // 1段目パートナー（紹介者）の情報取得
    let referrerName = null
    if (referrer.referrer_id) {
      const { data: referrerInfo } = await supabase
        .from('partners')
        .select('name')
        .eq('id', referrer.referrer_id)
        .single()
      
      referrerName = referrerInfo?.name || null
    }

    const response = {
      referrer: {
        ...referrer,
        referrer_name: referrerName
      },
      sales: salesData || [],
      summary: {
        totalSales: salesData?.length || 0,
        totalCommission: salesData?.reduce((sum, sale) => sum + (sale.referrer_commission || 0), 0) || 0,
        commissionRate: 35 // 2段目の固定報酬率
      }
    }

    console.log('ダッシュボードデータ取得完了:', {
      referrerId: referrer.id,
      salesCount: response.sales.length,
      totalCommission: response.summary.totalCommission
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('ダッシュボード取得エラー:', error)
    return NextResponse.json(
      { error: 'ダッシュボードデータの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 