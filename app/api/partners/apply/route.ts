import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    console.log('パートナー申請受信開始')
    console.log('環境変数チェック:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      supabaseUrlLength: supabaseUrl?.length,
      serviceKeyLength: supabaseServiceKey?.length
    })
    
    const body = await request.json()
    const {
      partnerType,
      companyName,
      representativeName,
      email,
      phone,
      website,
      socialMedia,
      businessDescription,
      experience,
      expectedMonthlyDeals,
      motivation,
      referrerCode
    } = body

    console.log('申請データ:', {
      partnerType,
      companyName,
      email,
      referrerCode
    })

    // リファーラーが存在する場合、存在確認
    let referrerId = null
    if (referrerCode) {
      const { data: referrer, error: referrerError } = await supabase
        .from('partners')
        .select('id, representative_name, partner_type')
        .eq('referral_code', referrerCode)
        .eq('status', 'approved')
        .single()

      if (referrerError) {
        console.log('リファーラー確認エラー:', referrerError)
        // リファーラーが見つからない場合は警告ログのみ（申請は継続）
      } else {
        referrerId = referrer.id
        console.log('リファーラー確認成功:', {
          referrerId,
          referrerName: referrer.representative_name,
          referrerType: referrer.partner_type
        })
      }
    }

    // パートナー申請データを保存
    const partnerData = {
      referral_code: `TEMP_${Date.now()}`, // 一時的なリファーラルコード（承認時に正式なものに変更）
      representative_name: representativeName,
      email: email,
      company_name: companyName,
      phone: phone,
      website: website || null,
      social_media: socialMedia || null,
      partner_type: partnerType === 'corporate' ? 'corporate' : 'kol',
      business_description: businessDescription,
      experience: experience,
      expected_monthly_deals: parseInt(expectedMonthlyDeals) || 1,
      motivation: motivation,
      parent_partner_id: referrerId, // リファーラーID保存
      status: 'pending' // 承認待ち状態
    }

    console.log('保存データ:', partnerData)
    console.log('Supabase保存開始 - テーブル:partners')

    const { data: savedPartner, error: saveError } = await supabase
      .from('partners')
      .insert(partnerData)
      .select()
      .single()

    console.log('Supabase保存結果:', {
      success: !saveError,
      data: savedPartner,
      error: saveError
    })

    if (saveError) {
      console.error('申請保存エラー詳細:', {
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        code: saveError.code
      })
      return NextResponse.json(
        { error: '申請の保存に失敗しました', details: saveError.message },
        { status: 500 }
      )
    }

    console.log('申請保存成功:', savedPartner)

    // 成功レスポンス
    const response = {
      success: true,
      partnerId: savedPartner.id,
      tier: referrerId ? 2 : 1, // 紹介者がいれば2段目、いなければ1段目
      referrerInfo: referrerId ? {
        referrerId,
        referrerCode
      } : null,
      message: referrerId 
        ? `2段目パートナーとして申請を受付ました（紹介者: ${referrerCode}）`
        : '1段目パートナーとして申請を受付ました'
    }

    console.log('申請完了:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('申請処理エラー:', error)
    return NextResponse.json(
      { error: '申請処理中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 