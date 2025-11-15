# Instagram DM広告フォーム - 環境変数設定ガイド

## 概要

`/dm-form` ページで収集したリード情報を、Google SheetsとメールでP受け取るための環境変数設定ガイドです。

## 必要な環境変数

`.env.local` ファイルに以下の環境変数を追加してください。

### 1. メール送信設定（SMTP）

お問い合わせがあった際に、管理者にメール通知を送るための設定です。

```env
# SMTPサーバーホスト名
SMTP_HOST=smtp.example.com

# SMTPポート番号（通常465または587）
SMTP_PORT=465

# SMTPユーザー名（メールアドレス）
SMTP_USER=your-email@example.com

# SMTPパスワード
SMTP_PASS=your-smtp-password

# 送信元メールアドレス
SMTP_FROM=noreply@example.com

# お問い合わせ受信メールアドレス
CONTACT_TO=contact@example.com
```

**Gmail を使用する場合の例：**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password  # Gmailの場合はアプリパスワードを使用
SMTP_FROM=your-gmail@gmail.com
CONTACT_TO=your-gmail@gmail.com
```

### 2. Google Sheets連携設定

フォームデータをGoogle Sheetsに自動保存するための設定です。

```env
# Google Sheets スプレッドシートID
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Instagram DM広告フォーム用のシート名
GOOGLE_SHEETS_DM_FORM_SHEET_NAME=DM_Form!A1

# Google サービスアカウントのメールアドレス
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Google サービスアカウントの秘密鍵
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

## Google Sheets 設定手順

### ステップ1: スプレッドシートの作成

1. Google Sheets で新規スプレッドシートを作成
2. シート名を `DM_Form` に変更
3. 1行目（ヘッダー行）に以下を入力：

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| 送信日時 | 流入元 | 会社名 | お名前 | メールアドレス | 電話番号 | 希望日時 |

### ステップ2: Google Cloud Platform でサービスアカウントを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新規プロジェクトを作成（または既存プロジェクトを選択）
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「サービスアカウント」を選択
5. サービスアカウント名を入力（例：`spreadsheet-automation`）
6. 作成したサービスアカウントをクリック
7. 「キー」タブ→「鍵を追加」→「新しい鍵を作成」→「JSON」を選択
8. ダウンロードしたJSONファイルから以下を取得：
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

### ステップ3: Google Sheets API を有効化

1. Google Cloud Console で「APIとサービス」→「ライブラリ」に移動
2. 「Google Sheets API」を検索
3. 「有効にする」をクリック

### ステップ4: スプレッドシートの共有設定

1. 作成したスプレッドシートを開く
2. 右上の「共有」ボタンをクリック
3. サービスアカウントのメールアドレス（`GOOGLE_SERVICE_ACCOUNT_EMAIL`）を追加
4. 権限を「編集者」に設定

### ステップ5: スプレッドシートIDの取得

スプレッドシートのURLから ID を取得：
```
https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
                                      ^^^^^^^^^^^^^^^^^^^
                                      この部分がスプレッドシートID
```

## 環境変数が未設定の場合

環境変数が未設定の場合でも、フォームは正常に動作します：

- **Google Sheets連携なし**: コンソールログにデータが出力されます
- **メール送信なし**: コンソールログに警告が出力されますが、フォーム送信は成功します

## テスト方法

### 1. 開発サーバーの起動

```bash
npm run dev
```

### 2. フォームにアクセス

ブラウザで http://localhost:3000/dm-form にアクセス

### 3. テスト送信

フォームに以下のようなテストデータを入力して送信：

- 会社名: テスト株式会社
- お名前: テスト太郎
- メールアドレス: test@example.com
- 電話番号: 090-1234-5678
- 希望日時: 第1希望 11/20 15:00

### 4. 確認

- **コンソール**: サーバーのコンソールログを確認
- **Google Sheets**: スプレッドシートに行が追加されているか確認
- **メール**: 指定したメールアドレスに通知が届いているか確認

## トラブルシューティング

### スプレッドシートにデータが保存されない

- サービスアカウントのメールアドレスがスプレッドシートに共有されているか確認
- Google Sheets API が有効になっているか確認
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` の改行が `\n` になっているか確認

### メールが送信されない

- SMTP設定が正しいか確認
- Gmailの場合、2段階認証を有効にしてアプリパスワードを使用
- ファイアウォールでSMTPポート（465または587）がブロックされていないか確認

### エラーログの確認

サーバーのコンソールログを確認してください：

```bash
# 開発環境の場合
npm run dev

# ログを確認
```

## 本番環境への適用

Vercel などのホスティングサービスを使用する場合：

1. プロジェクトの環境変数設定画面に移動
2. 上記の環境変数をすべて追加
3. `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` は改行を `\n` に置換して入力
4. 再デプロイ

## セキュリティ注意事項

⚠️ **重要**: 以下のファイルを `.gitignore` に追加して、機密情報をGitにコミットしないようにしてください：

```gitignore
.env.local
.env
*.json  # サービスアカウントのJSONファイル
```

既に `.gitignore` に含まれていますが、念のため確認してください。

