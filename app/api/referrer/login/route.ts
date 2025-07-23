import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  console.log('2段目パートナーログイン試行開始')
  
  try {
    const { email, password } = await request.json()
    console.log('ログイン試行:', { email, password: '***' })

    // メールアドレスでパートナーを検索
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('email', email)
      .eq('tier', 2) // 2段目パートナーのみ
      .eq('status', 'approved') // 承認済みのみ
      .single()

    if (partnerError || !partner) {
      console.log('パートナーが見つかりません:', partnerError)
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      )
    }

    console.log('パートナー情報取得成功:', {
      id: partner.id,
      email: partner.email,
      tier: partner.tier,
      status: partner.status
    })

    // 仮パスワードの確認
    const { data: tempPassword, error: passwordError } = await supabase
      .from('partner_temporary_passwords')
      .select('*')
      .eq('partner_id', partner.id)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (passwordError || !tempPassword) {
      console.log('有効な仮パスワードが見つかりません:', passwordError)
      return NextResponse.json(
        { error: '仮パスワードが無効または期限切れです' },
        { status: 401 }
      )
    }

    // パスワード検証
    const isValidPassword = await bcrypt.compare(password, tempPassword.password_hash)
    if (!isValidPassword) {
      console.log('パスワードが一致しません')
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      )
    }

    console.log('パスワード検証成功')

    // JWTトークン生成
    const token = jwt.sign(
      { 
        partnerId: partner.id,
        email: partner.email,
        tier: partner.tier,
        type: 'referrer'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // 仮パスワードを使用済みに更新
    await supabase
      .from('partner_temporary_passwords')
      .update({ is_used: true })
      .eq('id', tempPassword.id)

    console.log('ログイン成功:', { partnerId: partner.id })

    return NextResponse.json({
      success: true,
      token,
      partner: {
        id: partner.id,
        name: partner.company_name || partner.individual_name,
        email: partner.email,
        tier: partner.tier,
        status: partner.status,
        created_at: partner.created_at
      }
    })

  } catch (error) {
    console.error('ログインAPI エラー:', error)
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 