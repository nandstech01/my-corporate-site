import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('2段目ダッシュボードデータ取得開始')
    
    // JWT認証
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    let decodedToken: any

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (tokenError) {
      console.log('トークン検証エラー:', tokenError)
      return NextResponse.json(
        { error: '無効なトークンです' },
        { status: 401 }
      )
    }

    if (decodedToken.tier !== 2) {
      return NextResponse.json(
        { error: '2段目パートナーのみアクセス可能です' },
        { status: 403 }
      )
    }

    const partnerId = decodedToken.partnerId
    console.log('認証成功 - パートナーID:', partnerId)
    
    // 認証されたパートナーの情報を取得
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select(`
        id,
        company_name,
        individual_name,
        email,
        tier,
        total_sales,
        total_commission,
        status,
        created_at,
        referrer_id
      `)
      .eq('id', partnerId)
      .eq('tier', 2)
      .single()

    if (partnerError) {
      console.error('2段目パートナー取得エラー:', partnerError)
      return NextResponse.json(
        { error: '2段目パートナー情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!partner) {
      console.log('2段目パートナーが見つかりません')
      return NextResponse.json({
        referrer: null,
        sales: [],
        message: '2段目パートナーとして登録されていません'
      })
    }

    const referrer = partner
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
        .select('company_name, individual_name')
        .eq('id', referrer.referrer_id)
        .single()
      
      referrerName = referrerInfo?.company_name || referrerInfo?.individual_name || null
    }

    const response = {
      referrer: {
        ...referrer,
        name: referrer.company_name || referrer.individual_name,
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