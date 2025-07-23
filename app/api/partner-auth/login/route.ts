import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key'

// Service Role Keyを使用してRLSをバイパス
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const { email, password }: LoginRequest = await request.json()
    
    console.log('🔐 パートナーログイン試行:', {
      email,
      timestamp: new Date().toISOString()
    })
    
    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードが必要です' },
        { status: 400 }
      )
    }
    
    // パートナー情報取得
    const { data: partner, error: fetchError } = await supabase
      .from('partners')
      .select('*')
      .eq('email', email)
      .eq('status', 'approved') // 承認済みパートナーのみ
      .single()
    
    if (fetchError || !partner) {
      console.log('❌ パートナー情報なし:', { email, error: fetchError })
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      )
    }
    
    console.log('✅ パートナー情報取得成功:', {
      partnerId: partner.id,
      email: partner.email,
      hasPassword: !!partner.temp_password,
      isActive: partner.is_active
    })
    
    // パスワード検証
    let passwordValid = false
    
    if (partner.password_hash) {
      // ハッシュ化パスワードで検証
      passwordValid = await bcrypt.compare(password, partner.password_hash)
      console.log('🔒 ハッシュパスワード検証:', passwordValid)
    } else if (partner.temp_password) {
      // 仮パスワードで検証（平文比較）
      passwordValid = password === partner.temp_password
      console.log('🔑 仮パスワード検証:', passwordValid)
    }
    
    if (!passwordValid) {
      console.log('❌ パスワード検証失敗:', { email })
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      )
    }
    
    // パートナーがアクティブでない場合
    if (!partner.is_active) {
      console.log('⚠️ 非アクティブパートナー:', { email })
      return NextResponse.json(
        { error: 'アカウントが無効になっています。管理者にお問い合わせください。' },
        { status: 401 }
      )
    }
    
    // JWT生成
    const tokenPayload = {
      partnerId: partner.id,
      email: partner.email,
      partnerType: partner.partner_type,
      referralCode: partner.referral_code,
      isFirstLogin: !!partner.temp_password && !partner.password_hash
    }
    
    const token = jwt.sign(tokenPayload, jwtSecret, { 
      expiresIn: '24h',
      issuer: 'nands-partner-system'
    })
    
    // ログイン成功ログ
    console.log('✅ パートナーログイン成功:', {
      partnerId: partner.id,
      email: partner.email,
      partnerType: partner.partner_type,
      isFirstLogin: tokenPayload.isFirstLogin
    })
    
    // 最終ログイン時刻更新
    await supabase
      .from('partners')
      .update({ 
        updated_at: new Date().toISOString() 
      })
      .eq('id', partner.id)
    
    const response = NextResponse.json({
      success: true,
      message: 'ログインに成功しました',
      partner: {
        id: partner.id,
        email: partner.email,
        name: partner.representative_name,
        company: partner.company_name,
        partnerType: partner.partner_type,
        referralCode: partner.referral_code,
        isFirstLogin: tokenPayload.isFirstLogin
      },
      requiresPasswordChange: tokenPayload.isFirstLogin
    })
    
    // JWTをHTTPOnlyクッキーとして設定
    response.cookies.set('partner-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24時間
      path: '/partner-admin'
    })
    
    return response
    
  } catch (error) {
    console.error('❌ ログインAPI エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error },
      { status: 500 }
    )
  }
} 