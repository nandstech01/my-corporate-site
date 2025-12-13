# YouTube API セットアップガイド

## 🎯 目的
VIDEO Jobから直接YouTubeに動画を限定公開（Unlisted）でアップロードする

## 📝 前提条件
- Googleアカウント
- YouTubeチャンネル
- Google Cloud Platformアカウント

---

## 手順1: Google Cloud Consoleでプロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
   - プロジェクト名: `my-corporate-site-youtube` など

---

## 手順2: YouTube Data API v3を有効化

1. 左メニュー → **APIとサービス** → **ライブラリ**
2. 「YouTube Data API v3」を検索
3. **有効にする** をクリック

---

## 手順3: OAuth 2.0 認証情報を作成

### 3-1. 同意画面の設定
1. **APIとサービス** → **OAuth同意画面**
2. ユーザータイプ: **外部** を選択 → **作成**
3. 必須項目を入力:
   - アプリ名: `NANDS VIDEO Job Manager`
   - ユーザーサポートメール: `contact@nands.tech`
   - デベロッパー連絡先: `contact@nands.tech`
4. **スコープを追加または削除** → 以下を追加:
   ```
   https://www.googleapis.com/auth/youtube.upload
   https://www.googleapis.com/auth/youtube
   ```
5. **テストユーザー** を追加（自分のGoogleアカウント）

### 3-2. OAuth 2.0 クライアントIDを作成
1. **APIとサービス** → **認証情報**
2. **認証情報を作成** → **OAuth 2.0 クライアントID**
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前: `NANDS VIDEO Job OAuth`
5. **承認済みのリダイレクトURI**:
   ```
   http://localhost:3000/api/auth/youtube/callback
   https://nands.tech/api/auth/youtube/callback
   ```
6. **作成** → クライアントIDとシークレットをメモ

---

## 手順4: 環境変数を設定

`.env.local` に追加:

```bash
# YouTube API
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback

# アップロード設定
YOUTUBE_DEFAULT_PRIVACY=unlisted
YOUTUBE_CHANNEL_ID=your_channel_id_here  # 任意
```

---

## 手順5: YouTube Channel IDの取得（任意）

1. [YouTube Studio](https://studio.youtube.com/) にアクセス
2. 設定 → チャンネル → 詳細設定
3. **チャンネルID** をコピー

---

## 🔐 認証フロー

```
1. ユーザーが「YouTube認証」ボタンをクリック
   ↓
2. Googleログイン画面へリダイレクト
   ↓
3. 権限を許可
   ↓
4. コールバックURLに戻る
   ↓
5. アクセストークンとリフレッシュトークンを取得
   ↓
6. トークンをデータベースに保存
   ↓
7. 以降、自動でYouTubeへアップロード可能
```

---

## 📊 データベーステーブル（YouTube認証用）

```sql
CREATE TABLE youtube_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS有効化
ALTER TABLE youtube_auth ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のトークンのみアクセス可能
CREATE POLICY "Users can manage own youtube auth"
ON youtube_auth
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## 次のステップ

1. ✅ このガイドを参考にGoogle Cloud Consoleで設定
2. ✅ 環境変数を `.env.local` に追加
3. → 実装コードを作成（次のドキュメント参照）

