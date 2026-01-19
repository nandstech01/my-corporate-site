# X 自動投稿 API リファレンス

## エンドポイント

### POST /api/post-to-x

Xに投稿を送信します。

#### リクエスト

```http
POST /api/post-to-x
Content-Type: application/json

{
  "text": "投稿内容（最大280文字）"
}
```

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| text | string | Yes | 投稿テキスト（最大280文字） |

#### レスポンス（成功時）

```json
{
  "success": true,
  "tweetId": "1234567890123456789",
  "tweetUrl": "https://twitter.com/i/web/status/1234567890123456789",
  "message": "Xへの投稿が完了しました"
}
```

#### レスポンス（エラー時）

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

#### エラーコード

| HTTPステータス | エラー内容 |
|---------------|-----------|
| 400 | 投稿テキストが空、または280文字超過 |
| 400 | 重複投稿（同一内容が既に存在） |
| 400 | レート制限に達した |
| 500 | API認証情報が設定されていない |
| 500 | その他のサーバーエラー |

---

### GET /api/post-to-x

API設定状態を確認します。

#### リクエスト

```http
GET /api/post-to-x
```

#### レスポンス（設定済み）

```json
{
  "configured": true,
  "message": "Twitter API is configured"
}
```

#### レスポンス（未設定）

```json
{
  "configured": false,
  "message": "Twitter API credentials are not set. Please configure TWITTER_* environment variables."
}
```

---

## クライアントライブラリ

### lib/x-api/client.ts

#### isTwitterConfigured()

環境変数が設定されているかを確認します。

```typescript
import { isTwitterConfigured } from '@/lib/x-api/client';

if (isTwitterConfigured()) {
  // API使用可能
}
```

#### getTwitterClient()

Twitter APIクライアントを取得します。

```typescript
import { getTwitterClient } from '@/lib/x-api/client';

const client = getTwitterClient();
// client.v2.tweet() などで直接APIを呼び出し可能
```

#### postTweet(text: string)

Xに投稿します。

```typescript
import { postTweet } from '@/lib/x-api/client';

const result = await postTweet('投稿テキスト');

if (result.success) {
  console.log('投稿URL:', result.tweetUrl);
} else {
  console.error('エラー:', result.error);
}
```

**戻り値の型**:

```typescript
interface PostTweetResult {
  success: boolean;
  tweetId?: string;      // 成功時のみ
  tweetUrl?: string;     // 成功時のみ
  error?: string;        // エラー時のみ
}
```

---

## 使用例

### cURL

```bash
# 投稿
curl -X POST http://localhost:3000/api/post-to-x \
  -H "Content-Type: application/json" \
  -d '{"text": "テスト投稿です"}'

# 設定確認
curl http://localhost:3000/api/post-to-x
```

### JavaScript (fetch)

```javascript
// 投稿
const response = await fetch('/api/post-to-x', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'テスト投稿です',
  }),
});

const data = await response.json();

if (data.success) {
  console.log('投稿成功:', data.tweetUrl);
} else {
  console.error('投稿失敗:', data.error);
}
```

---

## 制限事項

- **文字数制限**: 280文字まで
- **重複投稿**: 同一内容の投稿は拒否されます
- **レート制限**: Free プランは月1,500件まで
- **画像投稿**: 現在は対象外（テキストのみ）

---

## 環境変数

| 変数名 | 説明 |
|--------|------|
| TWITTER_API_KEY | API Key (Consumer Key) |
| TWITTER_API_SECRET | API Key Secret (Consumer Secret) |
| TWITTER_ACCESS_TOKEN | Access Token |
| TWITTER_ACCESS_TOKEN_SECRET | Access Token Secret |
