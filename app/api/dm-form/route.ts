import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

/**
 * Instagram DM広告フォームのデータをGoogle Sheetsに保存する関数
 * 既存の /api/contact と同じパターンを踏襲
 */
async function saveLead(data: {
  company: string;
  name: string;
  email: string;
  phone: string;
  preferredDateTime: string;
}) {
  // 指定されたスプレッドシートIDを使用
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE';
  // シート2に書き込む（デフォルトで「シート2!A1」）
  const sheetName = process.env.GOOGLE_SHEETS_DM_FORM_SHEET_NAME || 'シート2!A1';
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  // Google Sheets の設定が無い場合はスキップ
  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.warn('Google Sheets configuration not found. Skipping sheet append.');
    return;
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // 日本時間のタイムスタンプ
    const timestampJST = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    // スプレッドシートに追記
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            timestampJST,
            'Instagram DM',
            data.company,
            data.name,
            data.email,
            data.phone,
            data.preferredDateTime,
          ],
        ],
      },
    });

    console.log('Lead saved to Google Sheets successfully');
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    throw error;
  }
}

/**
 * メール送信関数
 */
async function sendNotificationEmail(data: {
  company: string;
  name: string;
  email: string;
  phone: string;
  preferredDateTime: string;
}) {
  // SMTP設定が無い場合はスキップ
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP configuration not found. Skipping email notification.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailTo = process.env.CONTACT_TO || 'contact@nands.tech';

  const mailBody = `
【Instagram DM広告経由】新規相談申し込みがありました

■ 会社名: ${data.company || '（未入力）'}
■ お名前: ${data.name}
■ メールアドレス: ${data.email}
■ 電話番号: ${data.phone}
■ 希望日時:
${data.preferredDateTime}

---
このメールは自動送信されています。
`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: mailTo,
    subject: '【Instagram DM広告】新規相談申し込み',
    text: mailBody,
  });

  console.log('Notification email sent successfully');
}

/**
 * POST /api/dm-form
 * Instagram DM広告フォームからのデータを受け取る
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company = '', name, email, phone, preferredDateTime } = body;

    // バリデーション
    if (!name || !email || !phone || !preferredDateTime) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // データをログ出力（開発時の確認用）
    console.log('DM Form submission received:', {
      company,
      name,
      email,
      phone,
      preferredDateTime,
      timestamp: new Date().toISOString(),
    });

    // Google Sheets に保存
    try {
      await saveLead({
        company,
        name,
        email,
        phone,
        preferredDateTime,
      });
    } catch (error) {
      console.error('Failed to save lead to Google Sheets:', error);
      // スプレッドシートへの保存に失敗してもエラーにしない（続行）
    }

    // メール通知を送信
    try {
      await sendNotificationEmail({
        company,
        name,
        email,
        phone,
        preferredDateTime,
      });
    } catch (error) {
      console.error('Failed to send notification email:', error);
      // メール送信に失敗してもエラーにしない（続行）
    }

    return NextResponse.json({ 
      success: true,
      message: '送信しました' 
    });
  } catch (error) {
    console.error('DM Form API error:', error);
    return NextResponse.json(
      { error: '送信に失敗しました' },
      { status: 500 }
    );
  }
}

