# X Developer Portal 認証情報取得手順

このドキュメントでは、X (Twitter) API を使用するための認証情報取得手順を説明します。

## Step 1: Developer Portal にアクセス

1. https://developer.twitter.com/ にアクセス
2. 右上の「Sign up」または「Log in」をクリック
3. Xアカウントでログイン

## Step 2: Developer Account 申請

1. 「Sign up for Free Account」をクリック
2. 利用目的を選択
   - 「Making a bot」
   - 「Building tools for myself」
   - など
3. 規約に同意して申請

## Step 3: プロジェクト・アプリ作成

1. Developer Portal ダッシュボードで「Projects & Apps」へ
2. 「+ Add App」または「Create App」をクリック
3. アプリ名を入力（例: `nands-auto-post`）

## Step 4: 認証情報を取得

アプリ作成後、以下の情報を取得してメモしてください:

1. **API Key** (Consumer Key)
2. **API Key Secret** (Consumer Secret)
3. **Bearer Token**
4. **Access Token**
5. **Access Token Secret**

## Step 5: User Authentication Settings の設定

**重要**: 「User authentication settings」で以下を設定してください。

### App permissions
- **Read and write** を選択（投稿に必要）

### Type of App
- **Web App, Automated App or Bot** を選択

### Callback URL
```
http://localhost:3000/api/auth/callback/twitter
```

### Website URL
```
https://nands.tech
```

## Step 6: Access Token の再生成

権限を「Read and write」に変更した後、Access Token を再生成する必要があります:

1. 「Keys and tokens」タブへ移動
2. 「Access Token and Secret」セクションの「Regenerate」をクリック
3. 新しい Access Token と Access Token Secret をメモ

## 環境変数の設定

取得した認証情報を `.env.local` ファイルに設定:

```bash
# X (Twitter) API
TWITTER_API_KEY=取得したAPI Key
TWITTER_API_SECRET=取得したAPI Key Secret
TWITTER_ACCESS_TOKEN=取得したAccess Token
TWITTER_ACCESS_TOKEN_SECRET=取得したAccess Token Secret
```

## 設定確認

以下のコマンドで設定が正しく行われたか確認できます:

```bash
# 開発サーバー起動後
curl http://localhost:3000/api/post-to-x

# 正常な場合のレスポンス
# {"configured":true,"message":"Twitter API is configured"}

# 設定されていない場合のレスポンス
# {"configured":false,"message":"Twitter API credentials are not set..."}
```

## よくある問題

### 403 Forbidden エラー

- App permissions が「Read and write」になっているか確認
- Access Token を再生成したか確認

### 401 Unauthorized エラー

- API Key / Secret が正しいか確認
- Access Token / Secret が正しいか確認
- 環境変数名のスペルミスがないか確認

### Rate Limit エラー

- Free プランは月1,500件まで
- 制限に達した場合は翌月まで待つ
