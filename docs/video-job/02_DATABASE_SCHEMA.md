# VIDEO Job データベーススキーマ

---

## 📊 video_jobs テーブル

### 概要

ショート動画制作ジョブを管理するメインテーブル。

### カラム一覧

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | UUID | 主キー（自動生成） |
| `user_id` | UUID | ユーザーID（FK: auth.users） |
| `status` | VARCHAR(50) | ステータス |
| `title_internal` | TEXT | 内部管理用タイトル |
| `youtube_title` | TEXT | YouTubeタイトル |
| `youtube_description` | TEXT | YouTube説明文 |
| `youtube_tags` | TEXT[] | YouTubeタグ配列 |
| `script_raw` | TEXT | 生の台本テキスト |
| `script_struct` | JSONB | 構造化台本 |
| `voice` | JSONB | 音声設定 |
| `avatar` | JSONB | アバター設定 |
| `background` | JSONB | 背景設定 |
| `caption` | JSONB | 字幕設定 |
| `music` | JSONB | BGM設定 |
| `timeline` | JSONB | タイムライン |
| `akool_job_id` | TEXT | Akool Job ID |
| `akool_video_url` | TEXT | Akool生成動画URL |
| `final_video_url` | TEXT | 最終動画URL |
| `youtube_video_id` | TEXT | YouTube Video ID |
| `youtube_url` | TEXT | YouTube URL |
| `youtube_published_at` | TIMESTAMP | YouTube投稿日時 |
| `metrics` | JSONB | 分析メトリクス |
| `related_blog_post_id` | UUID | 関連ブログ記事ID |
| `article_slug` | TEXT | 記事スラッグ |
| `created_at` | TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | 更新日時 |

---

## 🔄 ステータス遷移

```
draft
  ↓ (Akool生成開始)
akool_processing
  ↓ (Akool完成)
akool_done
  ↓ (Storageアップロード)
final_uploaded
  ↓ (YouTube投稿)
youtube_uploaded ✅

  ↓ (エラー発生時)
error ❌
```

### ステータス詳細

| ステータス | 説明 |
|-----------|------|
| `draft` | 下書き・編集中 |
| `akool_processing` | Akool処理中（2-5分） |
| `akool_done` | アバター生成完了 |
| `final_uploaded` | 最終動画アップロード済み |
| `youtube_uploaded` | YouTube投稿完了 |
| `error` | エラー発生 |

---

## 🔐 Row Level Security (RLS)

ユーザーは**自分のレコードのみ**アクセス可能。

```sql
-- SELECT
CREATE POLICY "Users can view own video jobs"
ON video_jobs FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can create own video jobs"
ON video_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own video jobs"
ON video_jobs FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete own video jobs"
ON video_jobs FOR DELETE
USING (auth.uid() = user_id);
```

---

## 📁 マイグレーションファイル

```
supabase/migrations/042_create_video_jobs_table.sql
```

---

**最終更新**: 2025-12-10

