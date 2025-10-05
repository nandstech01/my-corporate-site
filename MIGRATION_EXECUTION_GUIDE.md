# 🗄️ YouTubeショートテーブル マイグレーション実行ガイド

## 🎯 実行するマイグレーション

**ファイル**: `supabase/migrations/20250201000000_create_company_youtube_shorts_table.sql`

**内容**: 
- `company_youtube_shorts` テーブル作成
- Fragment ID統合
- ベクトル検索関数 `match_company_youtube_shorts()` 作成
- インデックス最適化

---

## 📋 実行方法（推奨順）

### ✅ 方法1: Supabase Dashboard経由（最も安全）

#### Step 1: Supabaseダッシュボードにアクセス

```
https://supabase.com/dashboard
```

1. プロジェクトを選択
2. 左メニュー「SQL Editor」をクリック

#### Step 2: マイグレーションSQLを実行

1. 「New query」をクリック
2. 以下のファイルの内容をコピー&ペースト:
   ```
   supabase/migrations/20250201000000_create_company_youtube_shorts_table.sql
   ```

3. 「Run」ボタンをクリック

#### Step 3: 実行結果を確認

**成功時の表示:**
```
Success. No rows returned
```

**テーブル作成確認:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'company_youtube_shorts';
```

**関数作成確認:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'match_company_youtube_shorts';
```

---

### ✅ 方法2: Supabase CLI経由（ローカル開発）

#### 前提条件
```bash
# Supabase CLIインストール済み
brew install supabase/tap/supabase

# プロジェクトにリンク済み
supabase link --project-ref YOUR_PROJECT_ID
```

#### マイグレーション実行
```bash
cd /Users/nands/my-corporate-site

# ローカルでマイグレーション実行（テスト）
supabase db reset

# 本番環境にプッシュ
supabase db push
```

---

### ✅ 方法3: psql直接実行（上級者向け）

#### 接続情報取得

Supabase Dashboard → Settings → Database → Connection string → URI

```
postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

#### 実行コマンド

```bash
# 環境変数に設定
export DATABASE_URL="postgresql://postgres:PASSWORD@PROJECT_ID.supabase.co:5432/postgres"

# マイグレーション実行
psql $DATABASE_URL -f supabase/migrations/20250201000000_create_company_youtube_shorts_table.sql
```

**成功時の出力例:**
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE FUNCTION
```

---

## 🔍 実行後の確認

### 1. テーブル構造確認

```sql
\d company_youtube_shorts
```

**期待される出力:**
```
Column              | Type                     | Nullable
--------------------|--------------------------|----------
id                  | bigint                   | not null (auto)
fragment_id         | character varying(255)   | not null (unique)
complete_uri        | text                     | not null
page_path           | text                     | not null
video_id            | character varying(50)    | not null (unique)
title               | text                     | not null
embedding           | vector(1536)             | 
...
```

### 2. インデックス確認

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'company_youtube_shorts';
```

**期待されるインデックス:**
- `company_youtube_shorts_pkey` (PRIMARY KEY on id)
- `company_youtube_shorts_fragment_id_key` (UNIQUE on fragment_id)
- `company_youtube_shorts_video_id_key` (UNIQUE on video_id)
- `company_youtube_shorts_embedding_idx` (ivfflat for vector search)
- `company_youtube_shorts_category_idx` (btree on category)

### 3. ベクトル検索関数確認

```sql
SELECT match_company_youtube_shorts(
  query_embedding := ARRAY[0.1, 0.2, ...]::vector(1536),
  match_threshold := 0.7,
  match_count := 5
);
```

**期待される動作:**
- 類似度の高い順にYouTubeショート動画を返す
- `similarity` カラムで類似度スコア表示

---

## ⚠️ トラブルシューティング

### エラー1: `extension "vector" does not exist`

**原因**: pgvector拡張機能が有効化されていない

**解決策**:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### エラー2: `permission denied for schema public`

**原因**: 権限不足

**解決策**:
- Supabase Dashboard経由で実行（サービスロール権限で実行される）
- または、`SUPABASE_SERVICE_ROLE_KEY` を使用

### エラー3: `table already exists`

**原因**: 既にテーブルが存在

**確認**:
```sql
SELECT * FROM company_youtube_shorts LIMIT 1;
```

**解決策**:
- 既存テーブルをドロップする場合:
  ```sql
  DROP TABLE IF EXISTS company_youtube_shorts CASCADE;
  ```
- その後、再度マイグレーション実行

### エラー4: ベクトル埋め込みの次元数エラー

**原因**: `embedding` カラムが1536次元に設定されていない

**確認**:
```sql
SELECT atttypmod 
FROM pg_attribute 
WHERE attrelid = 'company_youtube_shorts'::regclass 
AND attname = 'embedding';
```

**期待値**: `1540` (1536次元 + 4バイトのヘッダー)

---

## 📊 マイグレーション完了後の初期データ確認

### サンプルクエリ

```sql
-- テーブルの行数
SELECT COUNT(*) FROM company_youtube_shorts;
-- 期待値: 0（初期状態）

-- Fragment ID一覧
SELECT fragment_id, complete_uri 
FROM company_youtube_shorts 
ORDER BY created_at DESC 
LIMIT 10;

-- カテゴリ別集計
SELECT category, COUNT(*) as count 
FROM company_youtube_shorts 
GROUP BY category;

-- Fragment Vectors統合確認
SELECT 
  fv.fragment_id,
  fv.content_type,
  cys.video_id,
  cys.title
FROM fragment_vectors fv
LEFT JOIN company_youtube_shorts cys 
  ON fv.fragment_id = cys.fragment_id
WHERE fv.content_type = 'youtube-short';
```

---

## ✅ マイグレーション成功のチェックリスト

実行前:
- [ ] Supabaseプロジェクトにアクセス可能
- [ ] pgvector拡張機能が有効
- [ ] バックアップ取得済み（本番環境の場合）

実行中:
- [ ] SQLエラーなしで完了
- [ ] `CREATE TABLE` 成功
- [ ] `CREATE FUNCTION` 成功
- [ ] `CREATE INDEX` 成功（3つ）

実行後:
- [ ] `company_youtube_shorts` テーブル存在確認
- [ ] `match_company_youtube_shorts()` 関数存在確認
- [ ] インデックス作成確認
- [ ] ベクトル検索テスト成功

---

## 🚀 次のステップ

マイグレーション完了後:

1. **YouTube Data API設定**
   ```bash
   # .env.local に追加
   YOUTUBE_API_KEY=AIzaSyxxxxx
   ```

2. **初回同期実行**
   ```bash
   curl -X POST http://localhost:3000/api/admin/sync-youtube-shorts \
     -H "Content-Type: application/json" \
     -d '{"maxResults": 10}'
   ```

3. **Fragment Vectors管理画面で確認**
   ```
   http://localhost:3000/admin/fragment-vectors
   ```

---

**準備完了！YouTubeショート動画のベクトルリンク化が可能になりました 🎉**

