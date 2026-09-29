import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { recordInquiry } from '@/lib/cortex/metrics/inquiries';
import { contactMailSubject, guideReturnPaths, isSameOriginPost, normalizeContactSource, type GuideReturnPaths } from './source';

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

/** JS が動かないガイドの相談フォームには JSON ではなく、元の記事の送信結果の文章への 303 を返す (送信後の画面を JSON にしない) */
function redirectTo(request: Request, path: string): Response {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  // form の POST (JSON 以外) で届いたガイドの相談なら、送信の成否にかかわらず記事へ戻す
  let guideReturn: GuideReturnPaths | null = null;
  try {
    const contentType = request.headers.get('content-type') || '';
    let company = '', name = '', email = '', phone = '', message = '', to = '' as string | undefined, source = '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      ({ company = '', name = '', email = '', phone = '', message = '', to } = body || {});
      source = normalizeContactSource(body?.source);
    } else {
      const form = await request.formData();
      company = String(form.get('company') || '');
      name = String(form.get('name') || form.get('representative') || '');
      email = String(form.get('email') || '');
      phone = String(form.get('phone') || '');
      message = String(form.get('message') || '');
      // JS が動かないときのガイドの相談フォームは source を hidden で送る。無ければ従来どおり corporate
      source = normalizeContactSource(form.get('source')) || 'corporate';
      guideReturn = guideReturnPaths(source);
      // 別のサイトからのフォームの POST は受け付けない (記録もメールもしない)
      if (guideReturn && !isSameOriginPost(request)) {
        return redirectTo(request, guideReturn.failed);
      }
    }
    // 送信先はリクエストで任意指定させない (任意宛先へのメール送信＝スパムの踏み台になるため)。
    // 許可リストにある宛先だけ受け付け、それ以外は既定の宛先に送る。
    const defaultTo = process.env.CONTACT_TO || 'contact@nands.tech';
    const allowedTo = new Set([defaultTo, 'contact@nands.tech']);
    const mailTo = to && allowedTo.has(to.trim().toLowerCase()) ? to.trim().toLowerCase() : defaultTo;

    // 司令塔ダッシュボード用に Supabase へも記録（best-effort・既存のメール/シートは不変）
    await recordInquiry({ source: source || 'general-contact', name, email, company, phone, message, cookieHeader: request.headers.get('cookie') });

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
 送信元: ${source || 'general-contact'}
     `;

    // メールの送信
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: mailTo,
      subject: contactMailSubject(source),
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

    if (guideReturn) return redirectTo(request, guideReturn.sent);
    return NextResponse.json({ message: '送信しました' });
  } catch (error) {
    console.error('Email sending error:', error);
    if (guideReturn) return redirectTo(request, guideReturn.failed);
    return NextResponse.json(
      { error: '送信に失敗しました' },
      { status: 500 }
    );
  }
} 