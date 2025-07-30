const { Resend } = require('resend');

// 環境変数から設定を読み込み
require('dotenv').config({ path: '.env.local' });

async function testDomainEmail() {
  console.log('🧪 ドメイン認証後メール送信テスト開始');
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY が設定されていません');
    return;
  }
  
  const resend = new Resend(apiKey);
  
  try {
    console.log('📧 ドメイン認証済みメール送信テスト中...');
    
    const result = await resend.emails.send({
      from: 'contact@nands.tech', // 認証済みドメインから送信
      to: 'contact@nands.tech', // 自分に送信（安全テスト）
      subject: '【NANDS】ドメイン認証テスト成功',
      html: `
        <h2>✅ ドメイン認証テスト成功</h2>
        <p>NANDS管理者様</p>
        <p>Resendドメイン認証が正常に完了しました！</p>
        <ul>
          <li>送信者: contact@nands.tech ✅</li>
          <li>認証: DKIM + SPF ✅</li>
          <li>配信率: 高品質 ✅</li>
        </ul>
        <p><strong>これで他のメールアドレスにも送信可能になりました。</strong></p>
        <hr>
        <p>株式会社エヌアンドエス (NANDS)<br>
        Email: contact@nands.tech<br>
        URL: https://nands.tech</p>
      `
    });
    
    console.log('✅ ドメイン認証済みメール送信成功:', result);
    
    if (result.data && result.data.id) {
      console.log('🎉 パートナーシステムのメール送信準備完了！');
      console.log('📧 メールID:', result.data.id);
    }
    
  } catch (error) {
    console.error('❌ メール送信失敗:', error);
    
    if (error.message.includes('domain')) {
      console.error('🌐 ドメイン認証がまだ完了していません');
      console.error('💡 Resendダッシュボードで認証ステータスを確認してください');
    }
  }
}

testDomainEmail(); 