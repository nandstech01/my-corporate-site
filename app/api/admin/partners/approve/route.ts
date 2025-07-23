import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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
    // 1. 仮パスワード生成
    const tempPassword = generateTempPassword()
    const passwordHash = tempPassword // 簡易版：プレーンテキスト（開発用）
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7日後に期限切れ
    
    console.log('仮パスワード生成完了:', {
      partnerId: partner.id,
      password: tempPassword,
      expiresAt
    })
    
    // 2. パートナー情報更新
    const { data: updatedPartner, error: updateError } = await supabase
      .from('partners')
      .update({
        status: 'approved',
        temp_password: tempPassword, // 仮パスワード（開発用）
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
    const referralUrl = `${baseUrl}/partners?ref=${partner.referral_code}`
    
    // TODO: 実際のメール送信サービス（SendGrid、Resend等）を使用
    // 現在はログ出力のみ
    const emailContent = {
      to: partner.email,
      subject: '【NANDS】パートナー申請承認のお知らせ',
      html: `
        <h2>パートナー申請承認のお知らせ</h2>
        <p>${partner.representative_name} 様</p>
        <p>この度は、NANDS パートナープログラムにお申し込みいただき、ありがとうございます。</p>
        <p>審査の結果、<strong>承認</strong>させていただきました。</p>
        
        <h3>📋 ログイン情報</h3>
        <ul>
          <li><strong>メールアドレス:</strong> ${partner.email}</li>
          <li><strong>仮パスワード:</strong> ${tempPassword}</li>
          <li><strong>ログインURL:</strong> <a href="${loginUrl}">${loginUrl}</a></li>
        </ul>
        
        <h3>🔗 あなた専用のリファーラルURL</h3>
        <p><a href="${referralUrl}">${referralUrl}</a></p>
        
        <h3>⚠️ 重要なお知らせ</h3>
        <ul>
          <li>仮パスワードは7日間有効です</li>
          <li>初回ログイン後、パスワードを変更してください</li>
          <li>リファーラルURLを使って新規パートナーを紹介できます</li>
        </ul>
        
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        <p>今後ともよろしくお願いいたします。</p>
        
        <hr>
        <p>株式会社エヌアンドエス (NANDS)<br>
        Email: contact@nands.tech<br>
        URL: https://nands.tech</p>
      `
    }
    
    console.log('承認メール送信（ログのみ）:', emailContent)
    
    // 実際のメール送信はここで実装
    // await sendEmailService(emailContent)
    
    return { success: true, emailContent }
    
  } catch (error) {
    console.error('承認メール送信エラー:', error)
    return { success: false, error }
  }
}

// 却下メール送信
async function sendRejectionEmail(partner: any, reason?: string) {
  try {
    const emailContent = {
      to: partner.email,
      subject: '【NANDS】パートナー申請結果のお知らせ',
      html: `
        <h2>パートナー申請結果のお知らせ</h2>
        <p>${partner.representative_name} 様</p>
        <p>この度は、NANDS パートナープログラムにお申し込みいただき、ありがとうございます。</p>
        <p>誠に申し訳ございませんが、今回の申請は<strong>見送り</strong>とさせていただきました。</p>
        
        ${reason ? `<h3>理由</h3><p>${reason}</p>` : ''}
        
        <p>今後、条件が整いましたら、再度お申し込みいただけますと幸いです。</p>
        
        <hr>
        <p>株式会社エヌアンドエス (NANDS)<br>
        Email: contact@nands.tech<br>
        URL: https://nands.tech</p>
      `
    }
    
    console.log('却下メール送信（ログのみ）:', emailContent)
    
    return { success: true, emailContent }
    
  } catch (error) {
    console.error('却下メール送信エラー:', error)
    return { success: false, error }
  }
} 