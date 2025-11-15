# 環境変数復旧ガイド - Google Sheets & SMTP設定

## 問題

`.env.local` から以下の環境変数が消えてしまいました：
- Google Sheets 連携設定
- SMTP メール送信設定

## 復旧手順

### ステップ1: Vercelの環境変数を確認（推奨）

本番環境（Vercel）で既に動作している場合、そこに設定があります。

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクト `my-corporate-site-r4h` を選択
3. 「Settings」→「Environment Variables」に移動
4. 以下の変数を探してコピー：

```
GOOGLE_SHEETS_SPREADSHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
CONTACT_TO
```

### ステップ2: `.env.local` に追加

以下を `.env.local` ファイルに追加してください：

```env
# ====================
# メール送信設定 (SMTP)
# ====================
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@example.com
CONTACT_TO=contact@nands.tech

# ====================
# Google Sheets連携設定
# ====================
# スプレッドシートID（既に使用しているもの）
GOOGLE_SHEETS_SPREADSHEET_ID=1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE

# 通常のお問い合わせフォーム用のシート名
GOOGLE_SHEETS_SHEET_NAME=Responses!A1

# Instagram DM広告フォーム用のシート名（シート2）
GOOGLE_SHEETS_DM_FORM_SHEET_NAME=シート2!A1

# Google サービスアカウントのメールアドレス
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Google サービスアカウントの秘密鍵
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

### ステップ3: Google Sheets の準備

指定されたスプレッドシート「シート2」に以下のヘッダーを設定：

**スプレッドシートURL**: 
https://docs.google.com/spreadsheets/d/1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE/edit#gid=774673710

**シート2の1行目（ヘッダー）**:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| 送信日時 | 流入元 | 会社名 | お名前 | メールアドレス | 電話番号 | 希望日時 |

## サービスアカウントが不明な場合

### オプション1: Google Cloud Console で確認

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 使用しているプロジェクトを選択
3. 「IAMと管理」→「サービスアカウント」に移動
4. 既存のサービスアカウントを確認

### オプション2: 新しいサービスアカウントを作成

既存のサービスアカウント情報が完全に失われた場合は、新規作成してください：

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「サービスアカウント」を選択
5. サービスアカウント名を入力（例：`nands-spreadsheet-automation`）
6. 作成後、サービスアカウントをクリック
7. 「キー」タブ→「鍵を追加」→「新しい鍵を作成」→「JSON」を選択
8. ダウンロードしたJSONファイルから情報を取得：

```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  ...
}
```

- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

9. Google Sheets API を有効化：
   - 「APIとサービス」→「ライブラリ」
   - 「Google Sheets API」を検索して有効化

10. スプレッドシートの共有設定：
    - スプレッドシートを開く
    - 「共有」ボタンをクリック
    - サービスアカウントのメールアドレスを追加
    - 権限を「編集者」に設定

## SMTP設定の例

### Gmail を使用する場合

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password  # アプリパスワードを使用
SMTP_FROM=your-gmail@gmail.com
CONTACT_TO=your-gmail@gmail.com
```

**Gmailアプリパスワードの取得方法**:
1. Googleアカウントの2段階認証を有効化
2. https://myaccount.google.com/apppasswords にアクセス
3. 「アプリパスワード」を生成
4. 生成された16文字のパスワードを使用

### その他のSMTPプロバイダー

- **SendGrid**: `smtp.sendgrid.net`（ポート587）
- **Mailgun**: `smtp.mailgun.org`（ポート587）
- **Amazon SES**: リージョンによって異なる

## Instagram DM広告フォーム用の設定

`/dm-form` フォームは以下の設定を使用します：

```env
# スプレッドシートID（既存のもの）
GOOGLE_SHEETS_SPREADSHEET_ID=1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE

# シート2を指定
GOOGLE_SHEETS_DM_FORM_SHEET_NAME=シート2!A1
```

この設定により、Instagram DM広告からの申し込みは「シート2」に保存されます。

## 既存のお問い合わせフォームとの分離

- **既存フォーム** (`/api/contact`): `GOOGLE_SHEETS_SHEET_NAME` で指定したシート（例：Responses）
- **DM広告フォーム** (`/api/dm-form`): `GOOGLE_SHEETS_DM_FORM_SHEET_NAME` で指定したシート（シート2）

これにより、流入元ごとにデータを分けて管理できます。

## テスト方法

### 1. 開発サーバー起動

```bash
npm run dev
```

### 2. フォームにアクセス

```
http://localhost:3000/dm-form
```

### 3. テストデータを送信

- 会社名: テスト株式会社
- お名前: テスト太郎
- メールアドレス: test@example.com
- 電話番号: 090-1234-5678
- 希望日時: 第1希望 11/20 15:00

### 4. 確認

1. **コンソールログ**: サーバーのターミナルを確認
2. **Google Sheets**: シート2にデータが追加されているか確認
3. **メール**: 指定したメールアドレスに通知が届いているか確認

## トラブルシューティング

### エラー: "Google Sheets configuration not found"

→ 環境変数が設定されていません。`.env.local` を確認してください。

### エラー: "Request had insufficient authentication scopes"

→ サービスアカウントがスプレッドシートに共有されていません。
   スプレッドシートの共有設定で、サービスアカウントのメールアドレスを「編集者」として追加してください。

### エラー: "The caller does not have permission"

→ Google Sheets API が有効化されていません。
   Google Cloud Console で有効化してください。

### メールが送信されない

→ SMTP設定を確認してください。
   - Gmailの場合はアプリパスワードを使用
   - ファイアウォールでSMTPポートがブロックされていないか確認

## 本番環境（Vercel）への適用

1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
2. 以下の環境変数を追加/更新：

```
GOOGLE_SHEETS_SPREADSHEET_ID=1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE
GOOGLE_SHEETS_DM_FORM_SHEET_NAME=シート2!A1
GOOGLE_SERVICE_ACCOUNT_EMAIL=(サービスアカウントのメール)
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=(秘密鍵 ※改行を\nに置換)
SMTP_HOST=(SMTPホスト)
SMTP_PORT=465
SMTP_USER=(SMTPユーザー)
SMTP_PASS=(SMTPパスワード)
SMTP_FROM=(送信元メール)
CONTACT_TO=(受信先メール)
```

3. 「Save」をクリック
4. 自動的に再デプロイされます

## まとめ

✅ スプレッドシートID: `1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE`
✅ シート名: `シート2`（デフォルト設定済み）
✅ 既存フォームとの分離: 完了

次のステップ:
1. Vercelの環境変数から情報をコピー
2. `.env.local` に追加
3. 開発サーバーで動作確認
4. 本番環境にも同じ設定を適用

---

**補足**: コードには既にスプレッドシートID `1LlAIXN20EbR-7iWZJv7KulY06MOoFjzAbuWDVpWkBFE` がデフォルト値として設定されているため、環境変数が無くてもこのスプレッドシートに書き込まれます。ただし、サービスアカウントの認証情報は必須です。

