# Supabase Storage バケット作成手順

## 🎯 必要なバケット

VIDEO Job機能では以下のStorageバケットが必要です：

### 1. `final-videos` バケット

最終的な動画ファイルを保存するバケット

---

## 📝 作成手順

### 方法1: Supabase ダッシュボードから作成（推奨）

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. プロジェクト選択: `xhmhzhethpwjxuwksmuv`
3. 左メニュー → **Storage**
4. **New bucket** ボタンをクリック
5. 設定:
   - **Name**: `final-videos`
   - **Public bucket**: ✅ **ON**（公開アクセス可能にする）
   - **File size limit**: `500 MB`（任意）
   - **Allowed MIME types**: 空欄（すべての動画形式を許可）
6. **Create bucket** をクリック

---

### 方法2: SQLコマンドで作成

```sql
-- Storageバケット作成（Supabase Dashboard の Storage > Policies で実行）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'final-videos',
  'final-videos',
  true,  -- 公開バケット
  524288000,  -- 500MB (バイト単位)
  NULL  -- すべてのMIMEタイプを許可
)
ON CONFLICT (id) DO NOTHING;
```

---

## ✅ 確認方法

作成後、以下で確認:

```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE name = 'final-videos';
```

期待される結果:

```
id            | name          | public | file_size_limit
--------------|---------------|--------|----------------
final-videos  | final-videos  | true   | 524288000
```

---

## 🔐 アクセスポリシー設定（任意）

公開バケットでも、特定のユーザーのみアップロード可能にする場合:

```sql
-- アップロードポリシー: 認証済みユーザーのみ
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'final-videos');

-- 読み取りポリシー: すべてのユーザー（公開）
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'final-videos');

-- 削除ポリシー: 自分がアップロードしたファイルのみ
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'final-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 📂 ディレクトリ構造

アップロードされる動画は以下の構造で保存されます:

```
final-videos/
├── video-jobs/
│   ├── {user_id}/
│   │   ├── {job_id}_final_{timestamp}.mp4
│   │   ├── {job_id}_final_{timestamp}.mov
│   │   └── ...
```

例:

```
final-videos/
└── video-jobs/
    └── 3773439d-9e0a-47a5-b6af-8a21d0ff5c33/
        └── d0768a33-2d2d-4557-be32-8fef7f7afaa6_final_1234567890.mp4
```

---

## 🚨 トラブルシューティング

### エラー: `The object exceeded the maximum allowed size`

**原因**: ファイルサイズがバケットの制限を超えている

**解決**:
1. Supabase Dashboard → Storage → `final-videos` → Settings
2. **File size limit** を `500 MB` 以上に設定
3. または、動画を圧縮してファイルサイズを小さくする

### エラー: `new row violates row-level security policy`

**原因**: Storageのアクセスポリシーが設定されていない

**解決**: 上記の「アクセスポリシー設定」を実行

---

## 次のステップ

1. ✅ Supabase Dashboard で `final-videos` バケットを作成
2. ✅ Public設定を **ON** にする
3. → VIDEO Job機能で動画アップロードをテスト！

