# X (Twitter) 自動投稿機能

このドキュメントは、X (Twitter) API v2を使った自動投稿機能のセットアップガイドです。

## 概要

既存のX投稿生成機能に、X API v2（無料プラン）を使った自動投稿機能を追加しています。

**特徴**:
- 既存機能に一切影響を与えない独立した実装
- Free プランで月1,500件まで投稿可能
- シンプルなワンクリック投稿

## クイックスタート

### 1. X Developer Portal で認証情報を取得

詳細は [DEVELOPER_PORTAL.md](./DEVELOPER_PORTAL.md) を参照してください。

必要な認証情報:
- API Key (Consumer Key)
- API Key Secret (Consumer Secret)
- Access Token
- Access Token Secret

### 2. 環境変数を設定

`.env.local` ファイルに以下を追記:

```bash
# X (Twitter) API
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

### 3. パッケージインストール（初回のみ）

```bash
npm install
```

### 4. サーバー起動

```bash
npm run dev
```

### 5. 投稿を実行

1. `/admin/content-generation` にアクセス
2. X投稿を生成
3. 「Xに投稿」ボタンをクリック
4. 実際のXアカウントで投稿を確認

## ファイル構成

```
lib/x-api/
  client.ts                    # X APIクライアント

app/api/post-to-x/
  route.ts                     # 投稿エンドポイント

app/admin/content-generation/components/
  XPostGenerationSection.tsx   # 投稿ボタン追加済み

docs/x-auto-post/
  README.md                    # このファイル
  DEVELOPER_PORTAL.md          # 認証情報取得手順
  API_REFERENCE.md             # API仕様
```

## API仕様

詳細は [API_REFERENCE.md](./API_REFERENCE.md) を参照してください。

## 料金について

### Free プラン（無料）
- **投稿**: 月1,500件まで
- **読み取り**: 月1,500件まで
- **アプリ数**: 1つ
- **費用**: $0

1日2投稿 = 月60件なので、Free プランで十分対応可能です。

## 注意事項

- 同一内容の重複投稿はXにより拒否されます
- 画像付き投稿は対象外（今後の拡張予定）
- 環境変数が設定されていない場合、投稿ボタンは非表示になります

## トラブルシューティング

### 投稿ボタンが表示されない

環境変数が正しく設定されているか確認してください:

```bash
# 設定確認
curl http://localhost:3000/api/post-to-x
```

### 認証エラー

1. Developer Portal で権限が "Read and write" になっているか確認
2. Access Token を再生成
3. `.env.local` の値を更新

### レート制限エラー

Free プランは月1,500件までです。月末まで待つか、有料プランへアップグレードしてください。

## ロールバック方法

問題が発生した場合:

```bash
# 関連ファイルを削除
rm -rf lib/x-api/
rm -rf app/api/post-to-x/

# コンポーネントの変更を元に戻す
git checkout app/admin/content-generation/components/XPostGenerationSection.tsx

# 環境変数を削除（.env.localから手動で削除）

# パッケージを削除
npm uninstall twitter-api-v2
```
