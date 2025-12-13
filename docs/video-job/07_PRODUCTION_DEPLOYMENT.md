# VIDEO Job 本番環境デプロイガイド

## 🎯 概要

このドキュメントでは、VIDEO Job機能を本番環境（Vercel + Supabase）にデプロイする手順を説明します。

---

## ✅ デプロイ前のチェックリスト

### ローカル環境で完了していること

- [x] データベースマイグレーション実行済み
  - `042_create_video_jobs_table.sql`
  - `043_create_youtube_auth_table.sql`
- [x] Supabase Storage バケット `final-videos` 作成済み
- [x] Google Cloud Console で YouTube Data API v3 設定完了
- [x] OAuth 2.0 クライアントID取得済み

---

## 📋 本番環境デプロイ手順

### STEP 1: Google Cloud Console - 本番ドメインを追加

#### 1-1. OAuth 2.0クライアント設定を開く

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=youtube-toukou) にアクセス
2. 作成したOAuth 2.0クライアントIDをクリック

#### 1-2. 本番リダイレクトURIを追加

**承認済みのリダイレクトURI**セクションで：

- **+ URI を追加** をクリック
- 以下を入力:
  ```
  https://nands.tech/api/auth/youtube/callback
  ```
- または、あなたの本番ドメイン:
  ```
  https://your-domain.com/api/auth/youtube/callback
  ```
- **「保存」をクリック**

#### 1-3. 最終的なリダイレクトURI一覧

以下の3つが登録されているはず：

```
✅ http://localhost:3000/api/auth/youtube/callback  (開発用)
✅ http://localhost:3001/api/auth/youtube/callback  (開発用)
✅ https://nands.tech/api/auth/youtube/callback     (本番用)
```

---

### STEP 2: Vercel環境変数設定

#### 2-1. Vercelダッシュボードにアクセス

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト `my-corporate-site` を選択
3. **Settings** → **Environment Variables**

#### 2-2. YouTube API環境変数を追加

以下の環境変数を**1つずつ追加**：

| Key | Value | Environment |
|-----|-------|-------------|
| `YOUTUBE_CLIENT_ID` | `7956384386-58c1a2874uoii9bvp6d3lbttfaop9tcp.apps.googleusercontent.com` | Production, Preview, Development |
| `YOUTUBE_CLIENT_SECRET` | `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` | Production, Preview, Development |
| `YOUTUBE_REDIRECT_URI` | `https://nands.tech/api/auth/youtube/callback` | Production |
| `YOUTUBE_REDIRECT_URI` | `http://localhost:3000/api/auth/youtube/callback` | Development |
| `YOUTUBE_DEFAULT_PRIVACY` | `unlisted` | Production, Preview, Development |

**注意:** `YOUTUBE_REDIRECT_URI` は環境ごとに異なる値を設定します。

#### 2-3. 既存の環境変数を確認

以下が既に設定されているはず：

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `AKOOL_CLIENT_ID`
- ✅ `AKOOL_CLIENT_SECRET`
- ✅ `GOOGLE_AI_API_KEY`

---

### STEP 3: Supabase本番環境設定

#### 3-1. データベースマイグレーション実行

本番データベースに対してマイグレーションを実行：

```bash
# 本番データベースURL
DATABASE_URL=postgres://postgres:PASSWORD@db.xhmhzhethpwjxuwksmuv.supabase.co:5432/postgres

# マイグレーション実行
psql $DATABASE_URL -f supabase/migrations/042_create_video_jobs_table.sql
psql $DATABASE_URL -f supabase/migrations/043_create_youtube_auth_table.sql
```

**確認:**

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('video_jobs', 'youtube_auth');
```

#### 3-2. Supabase Storage バケット作成

1. [Supabase Dashboard](https://app.supabase.com/project/xhmhzhethpwjxuwksmuv/storage/buckets) にアクセス
2. **New bucket** をクリック
3. 設定:
   - **Name**: `final-videos`
   - **Public bucket**: ✅ **ON**
   - **File size limit**: `500 MB`
4. **Create bucket**

**確認:**

```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE name = 'final-videos';
```

---

### STEP 4: Gitにコミット & プッシュ

```bash
cd /Users/nands/my-corporate-site

# 現状を確認
git status

# すべての変更を追加
git add .

# コミット
git commit -m "Add VIDEO Job feature with YouTube OAuth integration"

# プッシュ
git push origin main
```

Vercelが自動的にデプロイを開始します。

---

### STEP 5: Vercelデプロイを確認

1. [Vercel Dashboard](https://vercel.com/dashboard) でデプロイ状況を確認
2. デプロイが完了するまで待つ（通常2〜5分）
3. ✅ 「Ready」になったら完了

---

### STEP 6: 本番環境でテスト

#### 6-1. VIDEO Job作成

1. `https://nands.tech/admin/youtube-scripts/145` にアクセス
2. **🎬 VIDEO Job作成** をクリック
3. → VIDEO Job詳細ページにリダイレクト

#### 6-2. YouTube認証

1. **Publish** タブをクリック
2. **🔐 YouTube認証** ボタンをクリック
3. Googleログイン → 権限を許可
4. → `https://nands.tech` にリダイレクト
5. ✅ 「YouTube認証済み」と表示される

#### 6-3. 動画アップロード & YouTube投稿

1. 動画ファイルをアップロード
2. **🚀 YouTubeに投稿** をクリック
3. ✅ 限定公開でYouTubeに自動投稿！

---

## 🔍 本番環境でのトラブルシューティング

### エラー: `YouTube API credentials not configured`

**原因:** Vercel環境変数が設定されていない

**解決:**
1. Vercel Dashboard → Settings → Environment Variables
2. `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` を確認
3. なければ追加
4. **Redeploy** をクリック

---

### エラー: `redirect_uri_mismatch`

**原因:** Google Cloud ConsoleにリダイレクトURIが登録されていない

**解決:**
1. [認証情報ページ](https://console.cloud.google.com/apis/credentials?project=youtube-toukou) を開く
2. OAuth 2.0クライアントIDをクリック
3. **承認済みのリダイレクトURI**に以下を追加:
   ```
   https://nands.tech/api/auth/youtube/callback
   ```
4. **保存**

---

### エラー: `Bucket not found`

**原因:** Supabase本番環境に`final-videos`バケットがない

**解決:**
1. [Supabase Dashboard](https://app.supabase.com/project/xhmhzhethpwjxuwksmuv/storage/buckets) を開く
2. **New bucket** → `final-videos` → **Public: ON** → **Create**

---

### エラー: `Table 'video_jobs' does not exist`

**原因:** 本番データベースにテーブルがない

**解決:**

```bash
# 本番データベースでマイグレーション実行
DATABASE_URL=postgres://postgres:PASSWORD@db.xhmhzhethpwjxuwksmuv.supabase.co:5432/postgres

psql $DATABASE_URL -f supabase/migrations/042_create_video_jobs_table.sql
psql $DATABASE_URL -f supabase/migrations/043_create_youtube_auth_table.sql
```

---

## 📊 環境別設定まとめ

### ローカル環境 (localhost)

```bash
# .env.local
YOUTUBE_CLIENT_ID=7956384386-58c1a2874uoii9bvp6d3lbttfaop9tcp.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=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
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
YOUTUBE_DEFAULT_PRIVACY=unlisted
PORT=3000
```

**Google Cloud Console リダイレクトURI:**
- `http://localhost:3000/api/auth/youtube/callback`
- `http://localhost:3001/api/auth/youtube/callback`

---

### 本番環境 (Vercel)

**Vercel環境変数:**

```bash
YOUTUBE_CLIENT_ID=7956384386-58c1a2874uoii9bvp6d3lbttfaop9tcp.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=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
YOUTUBE_REDIRECT_URI=https://nands.tech/api/auth/youtube/callback
YOUTUBE_DEFAULT_PRIVACY=unlisted
```

**Google Cloud Console リダイレクトURI:**
- `https://nands.tech/api/auth/youtube/callback`

---

## 🚀 デプロイコマンド

```bash
# 1. 変更をコミット
git add .
git commit -m "Add VIDEO Job feature with YouTube OAuth"

# 2. プッシュ（Vercelが自動デプロイ）
git push origin main

# 3. Vercel Dashboardでデプロイ状況を確認
# https://vercel.com/dashboard
```

---

## ✅ デプロイ後の確認

1. ✅ `https://nands.tech/admin/video-jobs` にアクセス
2. ✅ VIDEO Jobが正しく表示される
3. ✅ YouTube認証が機能する
4. ✅ 動画アップロードが成功する
5. ✅ YouTubeへの投稿が成功する

---

## 📞 サポート

問題が発生した場合：

1. Vercel Dashboard → Deployments → 最新のデプロイ → **Runtime Logs** を確認
2. Supabase Dashboard → Logs → API Logs を確認
3. ブラウザのコンソールログを確認

---

これで本番環境でも完全に機能します！🎉✨

