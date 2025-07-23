import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    console.log('昇格申請処理開始')
    
    // TODO: 認証機能実装後、実際のユーザーIDを取得
    // 現在はテスト用：tier=2のパートナーを取得
    const { data: referrers, error: referrerError } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        email,
        tier,
        status,
        company_name,
        phone
      `)
      .eq('tier', 2)
      .eq('status', 'active')
      .limit(1)

    if (referrerError) {
      console.error('2段目パートナー取得エラー:', referrerError)
      return NextResponse.json(
        { error: '申請者情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!referrers || referrers.length === 0) {
      console.log('2段目パートナーが見つかりません')
      return NextResponse.json(
        { error: '2段目パートナーとして登録されていません' },
        { status: 404 }
      )
    }

    const referrer = referrers[0]
    console.log('昇格申請者確認:', referrer)

    // 既存の昇格申請があるかチェック
    const { data: existingRequests, error: requestError } = await supabase
      .from('partner_upgrade_requests')
      .select('id, status')
      .eq('partner_id', referrer.id)
      .eq('status', 'pending')

    if (requestError) {
      console.error('既存申請確認エラー:', requestError)
    } else if (existingRequests && existingRequests.length > 0) {
      console.log('既存の昇格申請が存在します')
      return NextResponse.json(
        { error: '既に昇格申請が処理中です' },
        { status: 400 }
      )
    }

    // 昇格申請データを作成
    const upgradeRequestData = {
      partner_id: referrer.id,
      partner_name: referrer.name,
      partner_email: referrer.email,
      current_tier: referrer.tier,
      requested_tier: 1,
      request_type: 'tier_upgrade',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('昇格申請データ:', upgradeRequestData)

    // 昇格申請をデータベースに保存
    const { data: savedRequest, error: saveError } = await supabase
      .from('partner_upgrade_requests')
      .insert(upgradeRequestData)
      .select()
      .single()

    if (saveError) {
      console.error('昇格申請保存エラー:', saveError)
      return NextResponse.json(
        { error: '昇格申請の保存に失敗しました', details: saveError.message },
        { status: 500 }
      )
    }

    console.log('昇格申請保存成功:', savedRequest)

    // 管理者通知メール（ログ出力）
    const notificationContent = {
      to: 'admin@nands.tech',
      subject: '【NANDS】パートナー昇格申請のお知らせ',
      html: `
        <h2>パートナー昇格申請が届きました</h2>
        
        <h3>📋 申請者情報</h3>
        <ul>
          <li><strong>名前:</strong> ${referrer.name}</li>
          <li><strong>メールアドレス:</strong> ${referrer.email}</li>
          <li><strong>会社名:</strong> ${referrer.company_name || 'なし'}</li>
          <li><strong>電話番号:</strong> ${referrer.phone || 'なし'}</li>
        </ul>
        
        <h3>🔄 昇格内容</h3>
        <ul>
          <li><strong>現在:</strong> 2段目パートナー（35%報酬）</li>
          <li><strong>希望:</strong> 1段目パートナー（50%報酬 + 紹介機能）</li>
          <li><strong>費用:</strong> 月額10万円</li>
        </ul>
        
        <h3>⚠️ 管理者アクション</h3>
        <p>管理画面で昇格申請を承認・却下してください。</p>
        <p><a href="https://nands.tech/admin/partners/applications">管理画面を開く</a></p>
        
        <hr>
        <p>株式会社エヌアンドエス (NANDS)<br>
        管理システム自動通知</p>
      `
    }

    console.log('管理者通知メール（ログのみ）:', notificationContent)

    // 成功レスポンス
    const response = {
      success: true,
      requestId: savedRequest.id,
      message: '昇格申請を受け付けました。管理者からの連絡をお待ちください。',
      details: {
        currentTier: 2,
        requestedTier: 1,
        monthlyFee: '¥100,000',
        benefits: [
          '直接営業で50%報酬',
          'リファーラルURL発行可能',
          '2段目紹介時に15%継続報酬'
        ]
      }
    }

    console.log('昇格申請完了:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('昇格申請処理エラー:', error)
    return NextResponse.json(
      { error: '昇格申請処理中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 