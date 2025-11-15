# Google Apps Script 設定ガイド - Instagram DM広告フォーム対応

## 現状の把握

トップページの `ContactSection.tsx` は、以下のGoogle Apps ScriptにPOSTリクエストを送信しています：

```
https://script.google.com/macros/s/AKfycbxP89a1VvqlldbOXkaomiBSf_49tdd8UGVAzNBzKP7LA7rmcy1i3s9inzAVOuyYDF1jjA/exec
```

## 🎯 目標

このGoogle Apps Scriptを拡張して、Instagram DM広告フォームからのデータを「シート2」に保存できるようにします。

## 📋 手順

### ステップ1: Google Apps Scriptエディタを開く

1. https://script.google.com/ にアクセス
2. 既存のプロジェクトを開く（上記URLに対応するプロジェクト）

### ステップ2: 既存のコードを確認・修正

現在のコードはおそらくこのような形になっているはずです：

```javascript
function doPost(e) {
  try {
    // スプレッドシートを開く
    const ss = SpreadsheetApp.openById('1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE');
    
    // リクエストデータを取得
    const data = JSON.parse(e.postData.contents);
    const name = data.name || '';
    const email = data.email || '';
    const message = data.message || '';
    
    // タイムスタンプ
    const timestamp = new Date();
    
    // デフォルトのシート（既存のフォーム用）
    const sheet = ss.getSheetByName('シート1'); // または 'Responses'
    sheet.appendRow([timestamp, name, email, message]);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      message: 'データを保存しました'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### ステップ3: コードを拡張（source パラメータで切り替え）

以下のコードに書き換えてください：

```javascript
function doPost(e) {
  try {
    // スプレッドシートを開く
    const ss = SpreadsheetApp.openById('1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE');
    
    // リクエストデータを取得
    const data = JSON.parse(e.postData.contents);
    
    // 共通項目
    const timestamp = new Date();
    const source = data.source || 'contact'; // デフォルトは 'contact'
    
    // sourceによって保存先シートを切り替え
    let sheet;
    let rowData;
    
    if (source === 'dm-form') {
      // Instagram DM広告フォーム用（シート2）
      sheet = ss.getSheetByName('シート2');
      if (!sheet) {
        // シート2が存在しない場合は作成
        sheet = ss.insertSheet('シート2');
        // ヘッダー行を追加
        sheet.appendRow(['送信日時', '流入元', '会社名', 'お名前', 'メールアドレス', '電話番号', '希望日時']);
      }
      
      rowData = [
        timestamp,
        'Instagram DM',
        data.company || '',
        data.name || '',
        data.email || '',
        data.phone || '',
        data.preferredDateTime || ''
      ];
    } else {
      // 既存のトップページフォーム用（シート1）
      sheet = ss.getSheetByName('シート1') || ss.getSheets()[0];
      rowData = [
        timestamp,
        data.name || '',
        data.email || '',
        data.message || ''
      ];
    }
    
    // データを追記
    sheet.appendRow(rowData);
    
    // 成功レスポンス
    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      message: 'データを保存しました'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // エラーレスポンス
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// テスト用関数
function testDMForm() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        source: 'dm-form',
        company: 'テスト株式会社',
        name: 'テスト太郎',
        email: 'test@example.com',
        phone: '090-1234-5678',
        preferredDateTime: '第1希望 11/20 15:00\n第2希望 11/21 10:00'
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}
```

### ステップ4: デプロイ

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 「ウェブアプリ」を選択
3. 設定：
   - 「実行ユーザー」：自分
   - 「アクセスできるユーザー」：全員
4. 「デプロイ」をクリック
5. 生成されたURLをコピー（既存と同じURLになります）

### ステップ5: フロントエンドコードを更新

`/dm-form/page.tsx` を以下のように修正します：

```typescript
// フォーム送信処理
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // バリデーション実行
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);
  setSubmitStatus('idle');

  try {
    // Google Apps Script URLを使用
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxP89a1VvqlldbOXkaomiBSf_49tdd8UGVAzNBzKP7LA7rmcy1i3s9inzAVOuyYDF1jjA/exec';
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // CORS対策
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'dm-form', // 重要：これで「シート2」に保存される
        company: formData.company,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredDateTime: formData.preferredDateTime,
      }),
    });

    setSubmitStatus('success');
    // フォームをクリア
    setFormData({
      company: '',
      name: '',
      email: '',
      phone: '',
      preferredDateTime: '',
    });
    setErrors({});
  } catch (error) {
    console.error('送信エラー:', error);
    setSubmitStatus('error');
  } finally {
    setIsSubmitting(false);
  }
};
```

## 🧪 テスト方法

### Google Apps Script側のテスト

1. Google Apps Scriptエディタで `testDMForm` 関数を実行
2. 「実行ログ」を確認して成功メッセージを確認
3. スプレッドシートの「シート2」にテストデータが追加されているか確認

### フロントエンド側のテスト

1. 開発サーバーを起動: `npm run dev`
2. http://localhost:3000/dm-form にアクセス
3. テストデータを入力して送信
4. スプレッドシートの「シート2」を確認

## 📊 スプレッドシートの構成

### シート1（既存のトップページフォーム）

| 送信日時 | お名前 | メールアドレス | お問い合わせ内容 |
|---------|--------|----------------|-----------------|

### シート2（Instagram DM広告フォーム）

| 送信日時 | 流入元 | 会社名 | お名前 | メールアドレス | 電話番号 | 希望日時 |
|---------|--------|--------|--------|----------------|----------|----------|

## 🔧 トラブルシューティング

### エラー: "Exception: シートが見つかりません"

→ Google Apps Scriptで「シート2」が作成されていない可能性があります。
   手動でスプレッドシートに「シート2」という名前のシートを作成してください。

### エラー: "CORS policy"

→ `mode: 'no-cors'` を使用しているため、レスポンスは読み取れませんが、データは正常に送信されています。

### データが保存されない

1. Google Apps Scriptのログを確認
2. スプレッドシートIDが正しいか確認
3. Google Apps Scriptの実行権限を確認

## 🌟 メリット

この方法を使うと：

✅ 環境変数が不要  
✅ サーバーサイドの設定が不要  
✅ 既存のトップページフォームと同じ仕組み  
✅ 簡単にメンテナンス可能  
✅ Vercelへのデプロイ時も追加設定不要  

## 📚 参考情報

- [Google Apps Script ドキュメント](https://developers.google.com/apps-script)
- [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)

---

**次のステップ**:
1. Google Apps Scriptのコードを更新
2. フロントエンドのコードを更新
3. テスト実行
4. 本番環境にデプロイ

