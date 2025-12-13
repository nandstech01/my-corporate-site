# VIDEO Job 完全ワークフロー

## 🎯 目的
YouTube台本からアバター動画を生成し、YouTubeに限定公開で投稿するまでの完全な手順

---

## 📋 前提条件

### 必須設定
- ✅ データベースマイグレーション実行済み（`042_create_video_jobs_table.sql`, `043_create_youtube_auth_table.sql`）
- ✅ 環境変数が設定済み（`.env.local`）
- ✅ Supabase Storage バケット `final-videos` 作成済み
- ✅ YouTube Data API v3 有効化
- ✅ OAuth 2.0 認証情報作成済み

---

## 🚀 完全ワークフロー

### STEP 1: YouTube台本から VIDEO Job を作成

1. `/admin/youtube-scripts` に移動
2. 動画化したい台本を選択（例: `/admin/youtube-scripts/145`）
3. **YouTube投稿メタデータ**が設定されている台本のみ対応
4. 画面下部の **🎬 VIDEO Job作成** ボタンをクリック
5. 確認ダイアログで **OK**
6. → 新しいVIDEO Jobが作成され、詳細ページへリダイレクト

**自動転送されるデータ:**
- ✅ 内部タイトル: `YouTube台本: {台本タイトル}`
- ✅ YouTubeタイトル
- ✅ YouTube説明文
- ✅ YouTubeタグ
- ✅ 台本全文（Hook + Empathy + Body + CTA）
- ✅ 関連ブログ記事ID
- ✅ 記事スラッグ

---

### STEP 2: Script & Meta タブでメタデータを確認・編集

📝 **Script & Meta** タブ

1. **内部タイトル**: 管理用タイトル（任意変更可）
2. **YouTubeタイトル**: そのままYouTubeに投稿されるタイトル ⚠️
3. **YouTube説明文**: 動画の説明（任意）
4. **YouTubeタグ**: カンマ区切りで入力（例: `退職代行,ビジネス,キャリア`）
5. **台本全文**: アバター動画で読み上げられるテキスト

💾 編集したら **保存** ボタンをクリック

---

### STEP 3: Avatar タブでアバター動画を生成

🎭 **Avatar** タブ

#### 3-1. 音声生成
1. **音声生成** ボタンをクリック
2. 台本からTTS（Text-to-Speech）で音声ファイルを生成
3. → `audio_job_id` がDBに保存される

#### 3-2. アバター動画生成（Akool API）
1. **Akool生成開始** ボタンをクリック
2. Akool APIに音声 + アバター + 背景を送信
3. → `akool_job_id` がDBに保存
4. → ステータスが `akool_processing` に変更
5. **自動ポーリング開始**（10秒ごとにステータスチェック）
6. → 完了すると `akool_done` に変更
7. → `akool_video_url` に動画URLが保存される

**生成後:**
- ✅ プレビュー動画が表示される
- ✅ 動画をダウンロード可能

---

### STEP 4: Publish タブで YouTube に投稿

🚀 **Publish** タブ

#### 4-1. YouTube認証（初回のみ）
1. **🔐 YouTube認証** ボタンをクリック
2. Googleアカウントでログイン
3. YouTubeへのアップロード権限を許可
4. → `youtube_auth` テーブルにトークンが保存される
5. ✅ 認証完了（以降は自動でトークン更新）

#### 4-2. 最終動画をアップロード（Supabase Storage）
1. **ファイルを選択** または **ドラッグ&ドロップ** で動画ファイル（`.mp4`, `.mov`, `.avi`）をアップロード
2. → Supabase Storage `final-videos` バケットに保存
3. → `final_video_url` がDBに保存
4. → ステータスが `final_uploaded` に変更

**または:**
- Akoolで生成した動画を直接使う場合は、**Step 3**でダウンロードしてアップロード

#### 4-3. YouTubeに投稿
1. **メタデータ確認**:
   - タイトル: `{youtube_title}`
   - 説明文: `{youtube_description}`
   - タグ: `{youtube_tags}`
   - 公開設定: **🔒 限定公開（Unlisted）**
2. **🚀 YouTubeに投稿** ボタンをクリック
3. 確認ダイアログで **OK**
4. → YouTube Data API v3 でアップロード開始
5. → 完了すると以下が保存:
   - `youtube_video_id`: 例 `dQw4w9WgXcQ`
   - `youtube_url`: 例 `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - `youtube_published_at`: 投稿日時
6. → ステータスが `youtube_uploaded` に変更
7. ✅ 投稿完了アラート表示

**投稿後:**
- ✅ YouTubeリンクをクリックして動画を確認
- ✅ YouTubeに限定公開で自動投稿されている

---

## 🔄 ステータス遷移

```
draft
  ↓ (音声生成)
draft
  ↓ (Akool生成開始)
akool_processing
  ↓ (ポーリング完了)
akool_done
  ↓ (動画アップロード)
final_uploaded
  ↓ (YouTube投稿)
youtube_uploaded ✅
```

---

## ⚠️ トラブルシューティング

### 問題: YouTube認証エラー
**原因:** トークンが期限切れ  
**解決:** Publish タブで **再認証** ボタンをクリック

### 問題: Akool生成が`processing`のまま
**原因:** Akool APIの処理遅延  
**解決:** ページを更新してステータスを再確認。20分以上待っても変わらない場合はAkool側のエラーの可能性

### 問題: YouTubeタイトルが設定されていない
**原因:** Script & Metaタブで未入力  
**解決:** Script & Metaタブで **YouTubeタイトル** を入力して保存

### 問題: 最終動画がアップロードできない
**原因:** Supabase Storage バケット `final-videos` が作成されていない  
**解決:** Supabase ダッシュボードでバケットを作成（Public設定）

---

## 📊 データの流れ

```
YouTube台本 (youtube_scripts)
  ↓
VIDEO Job作成
  ↓
video_jobs テーブルに保存
  ↓
Script & Meta: メタデータ編集
  ↓
Avatar: Akool API → akool_video_url
  ↓
Publish: Supabase Storage → final_video_url
  ↓
Publish: YouTube API → youtube_video_id, youtube_url
  ↓
完了 ✅
```

---

## 次のステップ

1. ✅ この手順を参考に実際のフローを実行
2. ✅ 環境変数（YouTube API）を設定
3. ✅ YouTube認証を完了
4. → 実際のYouTubeチャンネルに動画を投稿！

