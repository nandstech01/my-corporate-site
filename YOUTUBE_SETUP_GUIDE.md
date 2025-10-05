# 📺 YouTubeショート動画ベクトルリンク実装ガイド

## 🎯 概要

自社YouTubeチャンネル（@kenjiharada_ai_site）のショート動画を自動取得し、Mike King理論準拠のベクトルリンク資産として統合します。

### 実装内容
- ✅ YouTube Data API v3統合（自動取得）
- ✅ Fragment ID生成（`youtube-short-{id}`）
- ✅ Complete URI（`https://nands.tech/shorts#youtube-short-{id}`）
- ✅ ベクトル埋め込み（OpenAI text-embedding-3-large, 1536次元）
- ✅ Schema.org VideoObject構造化データ
- ✅ エンティティ統合
- ✅ Fragment Vectors管理画面統合

---

## 📋 セットアップ手順

### Step 1: YouTube Data API v3のAPIキー取得

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/

2. **新しいプロジェクトを作成**（既存プロジェクトでも可）
   - プロジェクト名: `nands-youtube-integration`

3. **YouTube Data API v3を有効化**
   - 「APIとサービス」→「ライブラリ」
   - 「YouTube Data API v3」を検索
   - 「有効にする」をクリック

4. **APIキーを作成**
   - 「認証情報」→「認証情報を作成」→「APIキー」
   - 作成されたAPIキーをコピー
   - （推奨）「キーを制限」→「APIの制限」→「YouTube Data API v3」のみ選択

5. **環境変数に設定**
   ```bash
   # .env.local に追加
   YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 2: データベースマイグレーション実行

#### 方法A: Supabase管理画面から実行（推奨）

1. **Supabase Dashboardにログイン**
   - https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor

2. **SQL Editorを開く**
   - 左メニュー「SQL Editor」

3. **マイグレーションファイルの内容を貼り付け**
   ```sql
   -- supabase/migrations/20250201000000_create_company_youtube_shorts_table.sql
   -- の内容をコピー&ペースト
   ```

4. **「Run」をクリック**
   - ✅ テーブル作成完了

#### 方法B: psqlコマンドで実行

```bash
# Supabase接続情報を環境変数に設定
export DATABASE_URL="postgresql://postgres:PASSWORD@PROJECT_ID.supabase.co:5432/postgres"

# マイグレーション実行
psql $DATABASE_URL -f supabase/migrations/20250201000000_create_company_youtube_shorts_table.sql
```

### Step 3: YouTubeショート動画の自動同期

#### API経由で同期（推奨）

```bash
# チャンネルから最新50件を自動取得
curl -X POST http://localhost:3000/api/admin/sync-youtube-shorts \
  -H "Content-Type: application/json" \
  -d '{"maxResults": 50}'
```

#### 特定の動画URLを手動登録

```bash
curl -X POST http://localhost:3000/api/admin/sync-youtube-shorts \
  -H "Content-Type: application/json" \
  -d '{
    "manualUrl": "https://youtube.com/shorts/WTHkxADdgao?si=JWPucL1JnBmBQN9c"
  }'
```

---

## 🔍 動作確認

### 1. Fragment Vectors管理画面で確認

```
http://localhost:3000/admin/fragment-vectors
```

**確認ポイント:**
- ✅ `youtube-short` タイプが赤色バッジ+🎬アイコンで表示
- ✅ Fragment ID: `youtube-short-1`, `youtube-short-2`...
- ✅ Complete URI: `https://nands.tech/shorts#youtube-short-1`
- ✅ AI最適化スコアが表示される

### 2. データベースで直接確認

```sql
-- YouTubeショート動画一覧
SELECT 
  id,
  fragment_id,
  title,
  video_url,
  view_count,
  ai_optimization_score,
  created_at
FROM company_youtube_shorts
ORDER BY created_at DESC;

-- Fragment Vectors統合確認
SELECT 
  fragment_id,
  complete_uri,
  content_type,
  category
FROM fragment_vectors
WHERE content_type = 'youtube-short'
ORDER BY created_at DESC;
```

---

## 🎬 使用方法

### 定期的な同期（cron設定推奨）

```typescript
// 例: 毎日午前9時にYouTubeショート動画を自動同期
// Vercel Cron Jobs等を使用

// vercel.json
{
  "crons": [
    {
      "path": "/api/admin/sync-youtube-shorts",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### ブログ記事との連携

```typescript
// ブログ記事生成時に関連YouTubeショートを検索
const relatedShorts = await supabase
  .rpc('match_company_youtube_shorts', {
    query_embedding: blogEmbedding,
    match_threshold: 0.7,
    match_count: 3
  });

// 記事詳細ページに埋め込み
<YouTubeShortEmbed videoId={relatedShorts[0].video_id} />
```

---

## 📊 AI引用最適化スコア

各YouTubeショート動画には **AI最適化スコア（0-100点）** が自動計算されます。

### スコア内訳

| 項目 | 配点 | 説明 |
|------|------|------|
| Fragment ID実装 | 30点 | Fragment ID + Complete URI |
| Schema.org実装 | 25点 | VideoObject構造化データ |
| エンティティ統合 | 25点 | 関連エンティティ・ターゲットクエリ |
| エンゲージメント | 20点 | 再生数・いいね数・コメント数 |

**目標**: 80点以上（AI検索エンジンで引用されやすい）

---

## 🔗 ベクトルリンク構造

```
YouTubeショート動画のベクトルリンク構造

公開層（Complete URI）
↓
https://nands.tech/shorts#youtube-short-1
↓
Fragment ID: youtube-short-1
↓
ベクトル埋め込み（1536次元）
↓
AI検索エンジンで正確に引用可能
```

---

## 📈 期待される効果

### 1. AI検索エンジンでの引用精度向上
- ChatGPT、Perplexity、Claude、Geminiで正確に引用される
- Complete URI形式でセクション単位の参照が可能

### 2. SEO効果
- Schema.org VideoObject実装でGoogle検索に最適化
- リッチスニペット表示（動画プレビュー）

### 3. コンテンツ資産の価値向上
- ベクトルリンクによる長期的な資産価値
- トリプルRAG検索に統合され、ブログ記事生成に活用

### 4. エンゲージメント向上
- YouTubeショート ↔ ブログ記事の相互リンク
- ユーザーの回遊率・滞在時間の向上

---

## 🚀 次のステップ

### Phase 2: ブログ記事+台本同時生成

```typescript
// トリプルRAG検索からブログ記事と台本を同時生成
POST /api/admin/generate-blog-with-script

Response:
{
  blogPost: { ... },
  youtubeScript: {
    title: "...",
    hook: "実はこれ知らないと損します",
    body: "...",
    cta: "詳しくはブログで解説中！"
  }
}
```

### Phase 3: Supabase BM25ハイブリッド検索

```sql
-- セマンティック検索 × フルテキスト検索の融合
CREATE INDEX ON company_youtube_shorts 
USING GIN (to_tsvector('japanese', title || ' ' || description));
```

---

## 📚 参考資料

- [YouTube Data API v3 公式ドキュメント](https://developers.google.com/youtube/v3/docs)
- [Mike King理論（レリバンスエンジニアリング）](https://prtimes.jp/main/html/rd/p/000000011.000155176.html)
- [Schema.org VideoObject](https://schema.org/VideoObject)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)

---

## 💡 トラブルシューティング

### エラー: YouTube API quota exceeded

**原因**: YouTube Data APIの無料枠（10,000 units/日）を超過

**解決策**:
1. Google Cloud Consoleで課金を有効化
2. 同期頻度を減らす（1日1回など）
3. `maxResults` パラメータを減らす

### エラー: Video not found

**原因**: 
- 動画が非公開または削除済み
- URLが間違っている

**解決策**:
- 動画のURLを確認
- 公開設定を確認

### エラー: Embedding generation failed

**原因**: OpenAI APIのレート制限

**解決策**:
- リトライ処理を実装（exponential backoff）
- バッチサイズを減らす

---

## ✅ チェックリスト

実装前に確認:
- [ ] YouTube Data API v3のAPIキー取得済み
- [ ] 環境変数 `YOUTUBE_API_KEY` 設定済み
- [ ] データベースマイグレーション実行済み
- [ ] `googleapis` パッケージインストール済み（✅ 既にインストール済み）
- [ ] OpenAI API設定済み

初回同期前に確認:
- [ ] YouTubeチャンネル（@kenjiharada_ai_site）が公開されている
- [ ] ショート動画が投稿されている（60秒以下の動画）
- [ ] Supabase接続が正常

同期後に確認:
- [ ] Fragment Vectors管理画面でyoutube-shortタイプが表示される
- [ ] Complete URIが正しい形式（`https://nands.tech/shorts#youtube-short-{id}`）
- [ ] ベクトル埋め込みが1536次元
- [ ] Schema.org VideoObjectデータが生成されている
- [ ] AI最適化スコアが計算されている

---

**実装完了！YouTubeショート動画がベクトルリンク資産として統合されました 🎉**

