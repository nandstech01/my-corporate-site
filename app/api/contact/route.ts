import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

async function appendToSheet(row: any[]) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Responses!A1';
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!spreadsheetId || !clientEmail || !privateKey) return; // 設定が無ければスキップ

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: sheetName,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let company = '', name = '', email = '', phone = '', message = '', to = '' as string | undefined, source = '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      ({ company = '', name = '', email = '', phone = '', message = '', to, source = '' } = body || {});
    } else {
      const form = await request.formData();
      company = String(form.get('company') || '');
      name = String(form.get('name') || form.get('representative') || '');
      email = String(form.get('email') || '');
      phone = String(form.get('phone') || '');
      message = String(form.get('message') || '');
      source = 'corporate';
    }
    const mailTo = to || process.env.CONTACT_TO || 'contact@nands.tech';

    // メールトランスポーターの設定
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // メール本文の作成
    const mailBody = `
 会社名: ${company}
 お名前: ${name}
 メールアドレス: ${email}
 電話番号: ${phone}
 お問い合わせ内容:
 ${message}
     `;

    // メールの送信
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: mailTo,
      subject: '【AI副業セミナー】お問い合わせがありました',
      text: mailBody,
    });

    // スプレッドシートへ追記（環境変数が存在する場合）
    try {
      const timestampJST = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
      await appendToSheet([
        timestampJST,
        source || 'lp',
        company,
        name,
        email,
        phone,
        message,
      ]);
    } catch (e) {
      console.warn('Sheets append skipped or failed:', e);
    }

    return NextResponse.json({ message: '送信しました' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: '送信に失敗しました' },
      { status: 500 }
    );
  }
} 