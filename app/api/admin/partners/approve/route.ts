import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { emailService } from '../../../../../lib/email/email-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service Role Keyを使用してRLSをバイパス
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { applicationId, action, reason } = await request.json()
    
    console.log('承認・却下処理開始:', {
      applicationId,
      action,
      reason: reason ? '理由あり' : '理由なし'
    })
    
    // パートナー情報取得
    const { data: partner, error: fetchError } = await supabase
      .from('partners')
      .select('*')
      .eq('id', applicationId)
      .single()
    
    if (fetchError || !partner) {
      console.error('パートナー取得エラー:', fetchError)
      return NextResponse.json(
        { error: 'パートナー情報が見つかりません' },
        { status: 404 }
      )
    }
    
    if (partner.status !== 'pending') {
      return NextResponse.json(
        { error: '既に処理済みの申請です' },
        { status: 400 }
      )
    }
    
    if (action === 'approve') {
      // 承認処理
      return await approvePartner(partner)
    } else if (action === 'reject') {
      // 却下処理
      return await rejectPartner(partner, reason)
    } else {
      return NextResponse.json(
        { error: '無効なアクションです' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('承認・却下API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error },
      { status: 500 }
    )
  }
}

// パートナー承認処理
async function approvePartner(partner: any) {
  try {
    // 1. 仮パスワード生成とハッシュ化
    const tempPassword = generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPassword, 12) // 強力なハッシュ化
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7日後に期限切れ
    
    console.log('仮パスワード生成・ハッシュ化完了:', {
      partnerId: partner.id,
      passwordLength: tempPassword.length,
      hashLength: passwordHash.length,
      expiresAt
    })
    
    // 2. パートナー情報更新
    const { data: updatedPartner, error: updateError } = await supabase
      .from('partners')
      .update({
        status: 'approved',
        password_hash: passwordHash, // ハッシュ化されたパスワード
        temp_password: tempPassword, // メール送信用（一時的）
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', partner.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('パートナー更新エラー:', updateError)
      throw new Error('パートナー情報の更新に失敗しました')
    }
    
    // 3. リファーラルリンク作成・更新
    await createOrUpdateReferralLink(partner.id, partner.referral_code)
    
    // 4. メール送信
    const emailResult = await sendApprovalEmail(partner, tempPassword)
    
    console.log('承認処理完了:', {
      partnerId: partner.id,
      email: partner.email,
      emailSent: emailResult.success
    })
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nands.tech'
    
    return NextResponse.json({
      success: true,
      message: '承認が完了しました',
      partner: updatedPartner,
      tempPassword, // 管理者確認用
      email: partner.email,
      emailSent: emailResult.success,
      loginUrl: `${baseUrl}/partner-admin`
    })
    
  } catch (error) {
    console.error('承認処理エラー:', error)
    throw error
  }
}

// パートナー却下処理
async function rejectPartner(partner: any, reason?: string) {
  try {
    // 🔥 修正: 存在するカラムのみ更新
    const { data: updatedPartner, error: updateError } = await supabase
      .from('partners')
      .update({
        status: 'rejected',
        // rejection_reason と rejected_at カラムは存在しないため除外
        updated_at: new Date().toISOString()
      })
      .eq('id', partner.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('却下更新エラー:', updateError)
      throw new Error('却下処理に失敗しました')
    }
    
    // 却下通知メール送信
    await sendRejectionEmail(partner, reason || '申請内容が基準を満たしていません')
    
    console.log('却下処理完了:', {
      partnerId: partner.id,
      email: partner.email,
      reason: reason || '申請内容が基準を満たしていません',
      rejectedAt: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      message: '却下が完了しました',
      partner: updatedPartner,
      reason: reason || '申請内容が基準を満たしていません'
    })
    
  } catch (error) {
    console.error('却下処理エラー:', error)
    throw error
  }
}

// 仮パスワード生成
function generateTempPassword(): string {
  // 8文字のランダムパスワード（数字・英字）
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// パスワードハッシュ化（簡易版）
async function hashPassword(password: string): Promise<string> {
  // 本番環境ではbcryptなど使用推奨
  return crypto.createHash('sha256').update(password + 'salt').digest('hex')
}

// リファーラルリンク作成・更新
async function createOrUpdateReferralLink(partnerId: string, referralCode: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nands.tech'
    const referralUrl = `${baseUrl}/partners?ref=${referralCode}`
    
    const { error } = await supabase
      .from('referral_links')
      .upsert({
        partner_id: partnerId,
        referral_code: referralCode,
        referral_url: referralUrl,
        is_active: true,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'partner_id'
      })
    
    if (error) {
      console.error('リファーラルリンク作成エラー:', error)
    } else {
      console.log('リファーラルリンク作成成功:', referralUrl)
    }
  } catch (error) {
    console.error('リファーラルリンク処理エラー:', error)
  }
}

// 承認メール送信
async function sendApprovalEmail(partner: any, tempPassword: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nands.tech'
    const loginUrl = `${baseUrl}/partner-admin`
    
    console.log('📧 実際の承認メール送信開始:', {
      partner: partner.representative_name,
      email: partner.email,
      tempPassword
    })
    
    // 🔥 実際のメール送信サービスを使用
    const emailResult = await emailService.sendApprovalEmail({
      partnerName: partner.representative_name,
      partnerEmail: partner.email,
      companyName: partner.company_name,
      tempPassword: tempPassword,
      referralCode: partner.referral_code,
      loginUrl: loginUrl
    })
    
    if (emailResult.success) {
      console.log('✅ 承認メール送信完了:', partner.email)
    } else {
      console.error('❌ 承認メール送信失敗:', emailResult.error)
    }
    
    return emailResult
    
  } catch (error) {
    console.error('❌ 承認メール送信エラー:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラー' }
  }
}

// 却下メール送信
async function sendRejectionEmail(partner: any, reason?: string) {
  try {
    console.log('📧 実際の却下メール送信開始:', {
      partner: partner.representative_name,
      email: partner.email,
      reason: reason || '申請内容が基準を満たしていません'
    })
    
    // 🔥 実際のメール送信サービスを使用
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://my-corporate-site-r4h.vercel.app'
    const loginUrl = `${baseUrl}/partners`
    
    const emailResult = await emailService.sendRejectionEmail({
      partnerName: partner.representative_name,
      partnerEmail: partner.email,
      companyName: partner.company_name,
      loginUrl: loginUrl
    }, reason)
    
    if (emailResult.success) {
      console.log('✅ 却下メール送信完了:', partner.email)
    } else {
      console.error('❌ 却下メール送信失敗:', emailResult.error)
    }
    
    return emailResult
    
  } catch (error) {
    console.error('❌ 却下メール送信エラー:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラー' }
  }
} 