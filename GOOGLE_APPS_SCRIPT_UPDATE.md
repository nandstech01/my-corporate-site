# Google Apps Script 更新ガイド - 相談内容カラム追加

## 🔄 更新内容

Instagram DM広告フォームに「相談内容」ラジオボタンを追加したため、Google Apps Scriptとスプレッドシートを更新します。

## 📊 スプレッドシート「シート2」の新しい構造

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| 送信日時 | 流入元 | 会社名 | お名前 | メールアドレス | 電話番号 | **相談内容** | 希望日時 |

## 📝 Google Apps Script 更新コード

以下のコードで**完全に置き換え**してください：

```javascript
function doPost(e) {
  try {
    // スプレッドシートを開く
    const ss = SpreadsheetApp.openById('1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE');
    
    // リクエストデータを取得
    const data = JSON.parse(e.postData.contents);
    
    // 共通項目
    const timestamp = new Date();
    const source = data.source || 'contact';
    
    // sourceによって保存先シートを切り替え
    let sheet;
    let rowData;
    
    if (source === 'dm-form') {
      // Instagram DM広告フォーム用（シート2）
      sheet = ss.getSheetByName('シート2');
      if (!sheet) {
        // シート2が存在しない場合は作成
        sheet = ss.insertSheet('シート2');
        // ヘッダー行を追加（相談内容カラムを追加）
        sheet.appendRow(['送信日時', '流入元', '会社名', 'お名前', 'メールアドレス', '電話番号', '相談内容', '希望日時']);
      }
      
      rowData = [
        timestamp,
        'Instagram DM',
        data.company || '',
        data.name || '',
        data.email || '',
        data.phone || '',
        data.consultationType || '', // 相談内容を追加
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
    
    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      message: 'Data successfully recorded'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 🔧 更新手順

### ステップ1: スプレッドシートのヘッダーを手動で更新（推奨）

既存のデータがある場合、ヘッダーを手動で更新することをお勧めします：

1. スプレッドシートを開く
2. 「シート2」の1行目を確認
3. G列（7列目）に「相談内容」を挿入
4. H列（8列目）が「希望日時」になっていることを確認

**更新前**:
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| 送信日時 | 流入元 | 会社名 | お名前 | メールアドレス | 電話番号 | 希望日時 |

**更新後**:
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| 送信日時 | 流入元 | 会社名 | お名前 | メールアドレス | 電話番号 | **相談内容** | 希望日時 |

### ステップ2: Google Apps Scriptを更新

1. スプレッドシートで「拡張機能」→「Apps Script」
2. 既存のコードを全て削除
3. 上記のコードを貼り付け
4. 保存（Ctrl+S / Cmd+S）

### ステップ3: 再デプロイ

1. 「デプロイ」→「デプロイを管理」
2. 既存のデプロイの「編集」アイコン
3. **「新しいバージョン」**を選択
4. 「デプロイ」をクリック

## ✅ テスト

1. http://localhost:3000/dm-form でテスト
2. 相談内容のラジオボタンを選択
3. 送信
4. スプレッドシートの「シート2」を確認

## 📋 選択肢

ユーザーは以下の4つから選択できます：

1. AI時代の検索対策について相談したい
2. SNS自動化について相談したい
3. その他、相談したい内容があります
4. AI時代の検索対策の「実演無料相談」について相談したい

## 🎯 既存機能への影響

- ✅ トップページのフォーム（シート1）: 影響なし
- ✅ 既存のDM広告フォームデータ: G列に「相談内容」が挿入されます
- ✅ 今後のデータ: 正しく「相談内容」が保存されます

---

**注意**: 既存データがある場合は、必ずバックアップを取ってから作業してください。

