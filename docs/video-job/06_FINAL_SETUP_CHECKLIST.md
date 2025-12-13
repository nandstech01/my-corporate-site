# VIDEO Job 最終セットアップチェックリスト

## ✅ 完了済み（自動実装）

### データベース
- [x] `video_jobs` テーブル作成（`042_create_video_jobs_table.sql`）
- [x] `youtube_auth` テーブル作成（`043_create_youtube_auth_table.sql`）
- [x] RLS（Row Level Security）ポリシー設定
- [x] インデックス作成
- [x] `updated_at` トリガー設定

### コード実装
- [x] TypeScript型定義（`lib/types/videoJob.ts`）
- [x] YouTube API クライアント（`lib/youtube/client.ts`）
- [x] OAuth認証エンドポイント（`/api/auth/youtube`, `/api/auth/youtube/callback`）
- [x] VIDEO Job一覧ページ（`/admin/video-jobs`）
- [x] VIDEO Job作成ページ（`/admin/video-jobs/new`）
- [x] VIDEO Job詳細ページ（`/admin/video-jobs/[id]`）
  - [x] Script & Meta タブ
  - [x] Avatar タブ（Akool連携）
  - [x] Assets タブ（プレースホルダー）
  - [x] Publish タブ（YouTube投稿）
- [x] API Routes
  - [x] `GET /api/admin/video-jobs/[id]` - Job取得
  - [x] `POST /api/admin/video-jobs/[id]/audio-generate` - 音声生成
  - [x] `POST /api/admin/video-jobs/[id]/akool-generate` - Akool生成
  - [x] `POST /api/admin/video-jobs/[id]/upload-final` - 動画アップロード
  - [x] `POST /api/admin/video-jobs/[id]/publish-youtube` - YouTube投稿
- [x] AdminSidebar に「VIDEO Jobs」メニュー追加
- [x] YouTube台本詳細ページに「VIDEO Job作成」ボタン追加

### ドキュメント
- [x] README (`docs/video-job/README.md`)
- [x] セットアップガイド (`docs/video-job/01_SETUP_GUIDE.md`)
- [x] データベーススキーマ (`docs/video-job/02_DATABASE_SCHEMA.md`)
- [x] 使用ガイド (`docs/video-job/03_USAGE_GUIDE.md`)
- [x] YouTube API セットアップ (`docs/video-job/04_YOUTUBE_API_SETUP.md`)
- [x] 完全ワークフロー (`docs/video-job/05_USAGE_WORKFLOW.md`)

---

## 🚨 あなたが手動で設定する必要があるもの

### 1️⃣ Google Cloud Console でYouTube API設定

📝 **参照ドキュメント:** `docs/video-job/04_YOUTUBE_API_SETUP.md`

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存を選択）
3. **YouTube Data API v3** を有効化
4. **OAuth 2.0 同意画面** を設定:
   - アプリ名: `NANDS VIDEO Job Manager`
   - スコープ: `youtube.upload`, `youtube`
   - テストユーザー追加
5. **OAuth 2.0 クライアントID** を作成:
   - アプリケーションの種類: **ウェブアプリケーション**
   - 承認済みのリダイレクトURI:
     ```
     http://localhost:3000/api/auth/youtube/callback
     https://nands.tech/api/auth/youtube/callback
     ```
6. **クライアントIDとシークレット**をメモ

---

### 2️⃣ 環境変数を `.env.local` に追加

```bash
# YouTube API（追加）
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback

# YouTube設定
YOUTUBE_DEFAULT_PRIVACY=unlisted
YOUTUBE_CHANNEL_ID=your_channel_id_here  # 任意（YouTube Studioで取得）

# ---- 以下は既存の環境変数（確認のみ） ----

# Supabase（既存）
NEXT_PUBLIC_SUPABASE_URL=https://xhmhzhethpwjxuwksmuv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Akool API（既存）
AKOOL_CLIENT_ID=your_akool_client_id
AKOOL_CLIENT_SECRET=your_akool_client_secret

# データベース（既存）
DATABASE_URL=postgres://postgres:11925532kG1192@db.xhmhzhethpwjxuwksmuv.supabase.co:5432/postgres
```

---

### 3️⃣ Supabase Storage バケット作成（既存確認）

Supabase ダッシュボードで以下を確認:

- [x] バケット名: `final-videos`
- [x] Public設定: **ON**（公開アクセス可能）
- [x] Allowed MIME types: `video/mp4`, `video/quicktime`, `video/x-msvideo`

**作成方法:**
1. [Supabase Dashboard](https://app.supabase.com/) → プロジェクト選択
2. Storage → Create bucket
3. 名前: `final-videos`
4. Public bucket: **ON**
5. Create

---

### 4️⃣ 開発サーバーを再起動

```bash
cd /Users/nands/my-corporate-site
pnpm dev
```

または

```bash
npm run dev
```

---

## 🎬 使い方（完全ワークフロー）

📝 **詳細:** `docs/video-job/05_USAGE_WORKFLOW.md`

### ✅ STEP 1: YouTube台本から VIDEO Job を作成
1. `/admin/youtube-scripts/145` にアクセス
2. **🎬 VIDEO Job作成** ボタンをクリック
3. → 詳細ページ `/admin/video-jobs/{新しいID}` へ自動リダイレクト

### ✅ STEP 2: Script & Meta タブでメタデータ確認
- YouTubeタイトル、説明文、タグを確認・編集
- 保存ボタンをクリック

### ✅ STEP 3: Avatar タブでアバター動画生成
1. **音声生成** ボタンをクリック
2. **Akool生成開始** ボタンをクリック
3. → 自動ポーリングで完了を待つ（10秒ごと）
4. → 完了すると動画プレビューが表示される

### ✅ STEP 4: Publish タブで YouTube に投稿

#### 初回のみ: YouTube認証
1. **🔐 YouTube認証** ボタンをクリック
2. Googleアカウントでログイン
3. 権限を許可
4. → リダイレクトされて認証完了

#### 動画アップロード & YouTube投稿
1. **ファイルを選択** または **ドラッグ&ドロップ** で動画をアップロード
2. → Supabase Storage に保存
3. **🚀 YouTubeに投稿** ボタンをクリック
4. → 限定公開（Unlisted）で自動投稿
5. ✅ 完了！YouTubeリンクが表示される

---

## 🎯 確認テスト（実際に試す）

1. ✅ `/admin/video-jobs` にアクセス → ページが表示される
2. ✅ YouTube台本 `/admin/youtube-scripts/145` → **VIDEO Job作成** ボタンが表示される
3. ✅ VIDEO Job作成 → 詳細ページへリダイレクト
4. ✅ Script & Meta タブ → メタデータ編集 → 保存成功
5. ✅ Avatar タブ → Akool生成 → ポーリング → 完了
6. ✅ Publish タブ → YouTube認証 → 認証成功
7. ✅ Publish タブ → 動画アップロード → YouTube投稿 → 成功

---

## ⚠️ トラブルシューティング

### YouTube認証エラー
**原因:** OAuth 2.0 設定ミス  
**解決:** `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI` を再確認

### `googleapis` パッケージエラー
**原因:** パッケージ未インストール  
**解決:** すでにインストール済み（`package.json` に `googleapis: ^155.0.1`）

### Akool生成が `processing` のまま
**原因:** Akool APIの遅延  
**解決:** ページ更新してステータス再確認。20分以上変わらない場合はAkool側エラー

### YouTube投稿時に401エラー
**原因:** トークン期限切れ  
**解決:** Publish タブで **再認証** ボタンをクリック

---

## 📊 システム構成図

```
┌─────────────────────┐
│ YouTube台本ページ   │
│ /admin/youtube-     │
│ scripts/[id]        │
└──────────┬──────────┘
           │ 🎬 VIDEO Job作成
           ↓
┌─────────────────────────────────────────┐
│ VIDEO Job詳細ページ                      │
│ /admin/video-jobs/[id]                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📝 Script & Meta タブ               │ │
│ │ - YouTubeタイトル、説明文、タグ     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🎭 Avatar タブ                      │ │
│ │ - 音声生成 → Akool生成 → ポーリング │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🚀 Publish タブ                     │ │
│ │ - YouTube認証                       │ │
│ │ - 動画アップロード（Supabase）      │ │
│ │ - YouTube投稿（限定公開）           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
           │
           ↓
    ┌──────────────┐
    │ YouTube      │
    │ 限定公開     │
    │ （Unlisted） │
    └──────────────┘
```

---

## 🎉 完了！

すべての実装が完了しました！

### 次のステップ:
1. ✅ Google Cloud Consoleで **YouTube Data API v3** を設定
2. ✅ `.env.local` に **YouTube API credentials** を追加
3. ✅ 開発サーバーを再起動
4. ✅ `/admin/youtube-scripts/145` で **VIDEO Job作成** をテスト
5. ✅ YouTube認証を完了
6. ✅ 実際の動画をYouTubeに投稿！

---

## 📞 サポート

問題が発生した場合は、以下のドキュメントを参照してください:

- `docs/video-job/README.md` - プロジェクト概要
- `docs/video-job/04_YOUTUBE_API_SETUP.md` - YouTube API詳細設定
- `docs/video-job/05_USAGE_WORKFLOW.md` - 完全ワークフロー

Happy Video Jobbing! 🎬✨

