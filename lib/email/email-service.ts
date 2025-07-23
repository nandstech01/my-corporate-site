import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface PartnerEmailData {
  partnerName: string;
  partnerEmail: string;
  companyName: string;
  tempPassword?: string;
  referralCode?: string;
  loginUrl: string;
}

class EmailService {
  private transporter?: nodemailer.Transporter;
  private resend?: Resend;
  private emailProvider: string;

  constructor() {
    this.emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
    
    // メール送信プロバイダーの初期化
    if (this.emailProvider === 'resend' && process.env.RESEND_API_KEY) {
      // Resend SDK使用（推奨）
      this.resend = new Resend(process.env.RESEND_API_KEY);
      console.log('📧 Resend SDK initialized');
    } else {
      // Gmail SMTP設定（フォールバック）
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'contact@nands.tech',
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      console.log('📧 Gmail SMTP initialized (fallback)');
    }
  }

  // パートナー承認メールテンプレート
  private generateApprovalEmail(data: PartnerEmailData): EmailTemplate {
    const { partnerName, companyName, tempPassword, referralCode, loginUrl } = data;
    
    const subject = '【NANDS】パートナー承認のお知らせ';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: #fff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .btn { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 パートナー承認完了</h1>
              <p>NANDS パートナープログラムへようこそ！</p>
            </div>
            <div class="content">
              <p><strong>${partnerName}</strong> 様</p>
              
              <p>この度は、NANDS パートナープログラムにお申し込みいただき、ありがとうございます。</p>
              <p>審査の結果、<span class="highlight">承認</span>させていただきました。</p>
              
              <div class="credentials">
                <h3>🔐 ログイン情報</h3>
                <ul>
                  <li><strong>メールアドレス:</strong> ${data.partnerEmail}</li>
                  <li><strong>仮パスワード:</strong> <code>${tempPassword}</code></li>
                  <li><strong>リファーラルコード:</strong> <code>${referralCode}</code></li>
                </ul>
                <p style="color: #ef4444; font-size: 14px;">
                  ⚠️ セキュリティのため、初回ログイン後にパスワードを変更してください
                </p>
              </div>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="btn">📋 パートナー管理画面にログイン</a>
              </div>
              
              <h3>📈 次のステップ</h3>
              <ol>
                <li>管理画面にログインしてダッシュボードを確認</li>
                <li>リファーラルリンクを取得・共有</li>
                <li>売上データの確認とレポート閲覧</li>
              </ol>
              
              <div class="footer">
                <p>株式会社エヌアンドエス (NANDS)<br>
                Email: contact@nands.tech<br>
                URL: https://nands.tech</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `
【NANDS】パートナー承認のお知らせ

${partnerName} 様

この度は、NANDS パートナープログラムにお申し込みいただき、ありがとうございます。
審査の結果、承認させていただきました。

ログイン情報:
- メールアドレス: ${data.partnerEmail}
- 仮パスワード: ${tempPassword}
- リファーラルコード: ${referralCode}

ログインURL: ${loginUrl}

セキュリティのため、初回ログイン後にパスワードを変更してください。

株式会社エヌアンドエス (NANDS)
Email: contact@nands.tech
URL: https://nands.tech
    `;

    return { subject, html, text };
  }

  // パートナー却下メールテンプレート
  private generateRejectionEmail(data: PartnerEmailData, reason?: string): EmailTemplate {
    const { partnerName } = data;
    
    const subject = '【NANDS】パートナー申請結果のお知らせ';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444, #f87171); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 パートナー申請結果</h1>
            </div>
            <div class="content">
              <p><strong>${partnerName}</strong> 様</p>
              
              <p>この度は、NANDS パートナープログラムにお申し込みいただき、ありがとうございます。</p>
              <p>誠に申し訳ございませんが、今回の申請は<strong>見送り</strong>とさせていただきました。</p>
              
              ${reason ? `<h3>理由</h3><p>${reason}</p>` : ''}
              
              <p>今後、条件が整いましたら、再度お申し込みいただけますと幸いです。</p>
              
              <div class="footer">
                <p>株式会社エヌアンドエス (NANDS)<br>
                Email: contact@nands.tech<br>
                URL: https://nands.tech</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `
【NANDS】パートナー申請結果のお知らせ

${partnerName} 様

この度は、NANDS パートナープログラムにお申し込みいただき、ありがとうございます。
誠に申し訳ございませんが、今回の申請は見送りとさせていただきました。

${reason ? `理由: ${reason}` : ''}

今後、条件が整いましたら、再度お申し込みいただけますと幸いです。

株式会社エヌアンドエス (NANDS)
Email: contact@nands.tech
URL: https://nands.tech
    `;

    return { subject, html, text };
  }

  // メール送信（Resend SDK使用）
  private async sendWithResend(to: string, emailData: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.resend) {
        throw new Error('Resend is not initialized');
      }

      console.log('📧 Resend経由でメール送信開始:', { to, subject: emailData.subject });

      const response = await this.resend.emails.send({
        from: 'NANDS Partner System <noreply@nands.tech>',
        to: [to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      console.log('✅ Resendメール送信成功:', response);

      return {
        success: true,
        messageId: response.data?.id
      };

    } catch (error) {
      console.error('❌ Resendメール送信失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // メール送信（nodemailer使用）
  private async sendWithNodemailer(to: string, emailData: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Nodemailer transporter is not initialized');
      }

      console.log('📧 Nodemailer経由でメール送信開始:', { to, subject: emailData.subject });

      const info = await this.transporter.sendMail({
        from: '"NANDS Partner System" <contact@nands.tech>',
        to: to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log('✅ Nodemailerメール送信成功:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('❌ Nodemailerメール送信失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 承認メール送信
  async sendApprovalEmail(data: PartnerEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('📧 承認メール送信開始:', {
        to: data.partnerEmail,
        partner: data.partnerName,
        company: data.companyName
      });

      const emailData = this.generateApprovalEmail(data);
      
      // プロバイダーに応じてメール送信
      if (this.resend) {
        return await this.sendWithResend(data.partnerEmail, emailData);
      } else if (this.transporter) {
        return await this.sendWithNodemailer(data.partnerEmail, emailData);
      } else {
        throw new Error('No email provider configured');
      }

    } catch (error) {
      console.error('❌ 承認メール送信失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 却下メール送信
  async sendRejectionEmail(data: PartnerEmailData, reason?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('📧 却下メール送信開始:', {
        to: data.partnerEmail,
        partner: data.partnerName,
        reason: reason ? '理由あり' : '理由なし'
      });

      const emailData = this.generateRejectionEmail(data, reason);
      
      // プロバイダーに応じてメール送信
      if (this.resend) {
        return await this.sendWithResend(data.partnerEmail, emailData);
      } else if (this.transporter) {
        return await this.sendWithNodemailer(data.partnerEmail, emailData);
      } else {
        throw new Error('No email provider configured');
      }

    } catch (error) {
      console.error('❌ 却下メール送信失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// シングルトンインスタンス
export const emailService = new EmailService(); 