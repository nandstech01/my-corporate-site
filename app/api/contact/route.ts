import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, name, email, phone, message, to } = body;

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
      to: to,
      subject: '【AI副業セミナー】お問い合わせがありました',
      text: mailBody,
    });

    return NextResponse.json({ message: 'メールを送信しました' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'メールの送信に失敗しました' },
      { status: 500 }
    );
  }
} 