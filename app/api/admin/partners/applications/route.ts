import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service Role Keyを使用してRLSをバイパス
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending, approved, rejected, all
    const partnerType = searchParams.get('type') // kol, corporate, all
    
    const timestamp = new Date().toISOString()
    console.log(`🚀 申請一覧取得開始 [${timestamp}] - status:`, status, 'type:', partnerType)
    
    // 基本クエリ
    let query = supabase
      .from('partners')
      .select(`
        id,
        company_name,
        representative_name,
        email,
        phone,
        website,
        social_media,
        partner_type,
        business_description,
        experience,
        expected_monthly_deals,
        motivation,
        status,
        created_at,
        referral_code
      `)
      .order('created_at', { ascending: false })
    
    // ステータスフィルター
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    // パートナータイプフィルター
    if (partnerType && partnerType !== 'all') {
      query = query.eq('partner_type', partnerType)
    }
    
    // 🔥 最新申請を確実に上部表示: created_at降順ソート（強制更新）
    query = query.order('created_at', { ascending: false })
    
    const { data: applications, error } = await query
    
    if (error) {
      console.error('申請一覧取得エラー:', error)
      return NextResponse.json(
        { error: '申請一覧の取得に失敗しました', details: error },
        { status: 500 }
      )
    }
    
    // 統計情報を計算
    const stats = {
      total: applications?.length || 0,
      pending: applications?.filter(app => app.status === 'pending').length || 0,
      approved: applications?.filter(app => app.status === 'approved').length || 0,
      rejected: applications?.filter(app => app.status === 'rejected').length || 0,
      kolCount: applications?.filter(app => app.partner_type === 'kol').length || 0,
      corporateCount: applications?.filter(app => app.partner_type === 'corporate').length || 0
    }
    
    // 🔍 デバッグ: 最新5件の申請情報
    const latestApps = applications?.slice(0, 5).map(app => ({
      id: app.id.substring(0, 8),
      company: app.company_name,
      name: app.representative_name,
      status: app.status,
      created: app.created_at
    })) || []
    
    console.log(`✅ 申請一覧取得成功 [${timestamp}]:`, {
      count: applications?.length || 0,
      stats,
      latestApps
    })
    
    return NextResponse.json({
      success: true,
      applications: applications || [],
      stats,
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('申請一覧API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error },
      { status: 500 }
    )
  }
} 