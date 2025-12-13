# VIDEO Job トラブルシューティング

## 🐛 よくあるエラーと解決方法

---

### ❌ エラー 1: `406 Not Acceptable` (youtube_auth)

**エラーメッセージ:**
```
GET .../rest/v1/youtube_auth?select=id&user_id=eq.... 406 (Not Acceptable)
```

**原因:**
- PostgRESTのスキーマキャッシュが更新されていない
- テーブルは存在するが、PostgRESTがまだ認識していない

**解決方法:**

#### 方法1: 時間を待つ（推奨）
PostgRESTは数分ごとに自動的にスキーマキャッシュを更新します。5〜10分待ってからブラウザをリロードしてください。

#### 方法2: 手動でスキーマキャッシュをリロード
```sql
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
```

#### 方法3: コードを修正してエラーを無視
`PublishTab.tsx`で`.single()`を`.maybeSingle()`に変更し、エラーを警告として扱います（既に実装済み）。

**重要:** このエラーは表示されますが、機能的には影響ありません。YouTube認証は別のフローで行われるためです。

---

### ❌ エラー 2: `Bucket not found`

**エラーメッセージ:**
```
Error: Bucket not found
```

**原因:**
- Supabase Storageのバケット`final-videos`が存在しない

**解決方法:**

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'final-videos',
  'final-videos',
  true,
  524288000,  -- 500MB
  NULL
)
ON CONFLICT (id) DO NOTHING;
```

または、Supabase Dashboard → Storage → New bucket → `final-videos`を作成

---

### ❌ エラー 3: `The object exceeded the maximum allowed size`

**エラーメッセージ:**
```
Error: The object exceeded the maximum allowed size
```

**原因:**
- アップロードするファイルが500MBを超えている
- または、バケットのfile_size_limitが小さすぎる

**解決方法:**

1. **ファイルを圧縮:**
   - HandBrake、FFmpegなどで動画を圧縮
   - 推奨: H.264コーデック、1080p、30fps

2. **バケットの制限を増やす:**
```sql
UPDATE storage.buckets
SET file_size_limit = 1048576000  -- 1GB
WHERE name = 'final-videos';
```

---

### ❌ エラー 4: `new row violates row-level security policy`

**エラーメッセージ:**
```
Error: new row violates row-level security policy for table "video_jobs"
```

**原因:**
- ログインしていない
- または、RLSポリシーが正しく設定されていない

**解決方法:**

1. **ログイン状態を確認:**
   - `/admin`にアクセスして、ログインしているか確認
   - ログアウトして再ログイン

2. **RLSポリシーを確認:**
```sql
-- video_jobsテーブルのRLSポリシー確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'video_jobs';
```

---

### ❌ エラー 5: YouTube認証エラー

**エラーメッセージ:**
```
Error: YouTube認証が必要です
```

**原因:**
- YouTube OAuth認証が完了していない
- または、アクセストークンが期限切れ

**解決方法:**

1. **Publish**タブで**🔐 YouTube認証**ボタンをクリック
2. Googleアカウントでログイン
3. 権限を許可
4. リダイレクト後、「✅ YouTube認証済み」と表示されることを確認

---

### ❌ エラー 6: Akool生成が`processing`のまま

**症状:**
- Akool生成を開始したが、ステータスが`akool_processing`のまま変わらない
- 10分以上経過しても完了しない

**原因:**
- Akool APIの処理遅延
- または、Akool側のエラー

**解決方法:**

1. **ページをリロード:**
   - ブラウザをリロードして最新のステータスを確認

2. **Akool APIの状態を確認:**
```bash
curl -X GET "https://openapi.akool.com/api/open/v3/content/video/list?pageSize=10" \
  -H "Authorization: Bearer YOUR_AKOOL_TOKEN"
```

3. **20分以上待っても変わらない場合:**
   - Akool側のエラーの可能性があります
   - 新しいVIDEO Jobを作成してやり直してください

---

### ❌ エラー 7: YouTube投稿時に401エラー

**エラーメッセージ:**
```
Error: YouTube認証の有効期限が切れています
```

**原因:**
- アクセストークンの有効期限切れ

**解決方法:**

1. **Publish**タブで**再認証**ボタンをクリック
2. 再度Googleアカウントでログイン
3. 権限を許可

**自動更新:** 通常、アクセストークンは自動的にリフレッシュされますが、まれに失敗する場合があります。

---

## 🔍 デバッグ方法

### 1. ブラウザのコンソールを確認

1. デベロッパーツールを開く（F12またはCmd+Option+I）
2. **Console**タブを確認
3. エラーメッセージをコピーしてログを確認

### 2. ネットワークタブを確認

1. デベロッパーツールを開く
2. **Network**タブを確認
3. 失敗したリクエストをクリック
4. **Response**タブでエラー詳細を確認

### 3. データベースの状態を確認

```sql
-- VIDEO Jobの状態を確認
SELECT id, title_internal, status, created_at, updated_at
FROM video_jobs
ORDER BY created_at DESC
LIMIT 5;

-- YouTube認証の状態を確認
SELECT id, user_id, expires_at, created_at
FROM youtube_auth
ORDER BY created_at DESC
LIMIT 5;

-- Storageバケットを確認
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE name = 'final-videos';
```

---

## 📞 サポート

上記の方法で解決しない場合は、以下の情報を添えて問い合わせてください：

1. エラーメッセージの全文
2. ブラウザのコンソールログ（スクリーンショット）
3. 実行した操作の手順
4. VIDEO JobのID（例: `d0768a33-2d2d-4557-be32-8fef7f7afaa6`）

---

## 🎯 予防策

### 定期的なメンテナンス

1. **アクセストークンの更新:**
   - 3ヶ月ごとにYouTube認証を再実行

2. **Storageの容量確認:**
   - Supabase Dashboard → Storage で使用量を確認
   - 80%を超えたら古いファイルを削除

3. **データベースのクリーンアップ:**
```sql
-- 30日以上前のdraftステータスのVIDEO Jobを削除
DELETE FROM video_jobs
WHERE status = 'draft'
AND created_at < NOW() - INTERVAL '30 days';
```

---

Happy Video Jobbing! 🎬✨

