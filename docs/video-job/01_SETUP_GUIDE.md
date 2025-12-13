# VIDEO Job セットアップガイド

**ステータス**: 🟡 セットアップ待ち

---

## 📋 セットアップチェックリスト

### 必須タスク

- [ ] **Step 1**: データベースマイグレーション実行
- [ ] **Step 2**: Supabase Storageバケット作成
- [ ] **Step 3**: 環境変数設定
- [ ] **Step 4**: 動作確認

---

## Step 1: データベースマイグレーション

### 方法A: Supabaseダッシュボード（推奨）

1. [Supabaseダッシュボード](https://supabase.com/dashboard) を開く
2. プロジェクトを選択
3. **SQL Editor** を開く
4. 以下のファイル内容をコピー&ペースト:

```
supabase/migrations/042_create_video_jobs_table.sql
```

5. **Run** をクリック

### 方法B: CLI

```bash
# 接続文字列を取得してから
psql $DATABASE_URL -f supabase/migrations/042_create_video_jobs_table.sql
```

### 確認方法

```sql
-- テーブルが作成されたか確認
SELECT * FROM video_jobs LIMIT 1;
```

---

## Step 2: Supabase Storageバケット作成

1. Supabaseダッシュボード → **Storage** を開く
2. **New bucket** をクリック
3. 以下の設定:

| 項目 | 値 |
|------|-----|
| Name | `video-jobs` |
| Public bucket | ✅ チェック |
| File size limit | `500MB` |
| Allowed MIME types | `video/*` |

4. **Create bucket** をクリック

---

## Step 3: 環境変数設定

`.env.local` ファイルに以下を追加:

```bash
# ========================================
# VIDEO Job機能用
# ========================================

# Akool API（必須）
AKOOL_CLIENT_ID=your_akool_client_id_here
AKOOL_API_KEY=your_akool_api_key_here

# Webhook URL（本番環境用）
AKOOL_WEBHOOK_URL=https://your-domain.com/api/admin/akool/webhook

# YouTube API（Phase 2で使用）
# YOUTUBE_API_KEY=...
# YOUTUBE_CLIENT_ID=...
# YOUTUBE_CLIENT_SECRET=...
# YOUTUBE_REFRESH_TOKEN=...
```

### Akool API認証情報の取得方法

1. [Akool Platform](https://platform.akool.com/) にログイン
2. **Settings** → **API Keys** を開く
3. **Client ID** と **API Key** をコピー

---

## Step 4: 動作確認

### 1. 開発サーバー再起動

```bash
npm run dev
# または
yarn dev
```

### 2. 管理画面にアクセス

1. `/admin/video-jobs` にアクセス
2. 「新規 VIDEO Job」ボタンが表示されることを確認
3. 新規作成を試す

### 3. 動作確認チェックリスト

- [ ] リストページが表示される
- [ ] 新規作成ができる
- [ ] 詳細ページが開ける
- [ ] 4つのタブが表示される

---

## ⚠️ トラブルシューティング

### エラー: `relation "video_jobs" does not exist`

**原因**: マイグレーションが実行されていない

**解決**: Step 1を実行

---

### エラー: `Bucket not found: video-jobs`

**原因**: Storageバケットが作成されていない

**解決**: Step 2を実行

---

### エラー: `AKOOL認証情報が設定されていません`

**原因**: 環境変数が設定されていない

**解決**: Step 3を実行し、開発サーバーを再起動

---

### エラー: `Attempted import error: 'createClient'`

**原因**: Supabaseのインポートエラー（既に修正済み）

**解決**: 最新のコードを確認。`createClient()`ではなく`supabase`を使用

---

## 📍 次のステップ

セットアップが完了したら:

1. **テスト用VIDEO Jobを作成** - 新規作成ページから
2. **台本を入力** - Script & Metaタブ
3. **音声生成テスト** - Avatarタブ（Akool API必要）
4. **動画アップロードテスト** - Publishタブ

---

**最終更新**: 2025-12-10

