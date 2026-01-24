# Phase 8 テスト手順ガイド

**作成日**: 2026-01-20

---

## 前提条件

- Supabaseにアカウントが存在すること
- テナントに所属していること

---

## Step 1: テストアカウントの確認/作成

### 方法A: 既存アカウントを使用

Supabaseダッシュボードで確認：
1. https://supabase.com/dashboard にアクセス
2. プロジェクトを選択
3. **Authentication** → **Users** で既存ユーザーを確認

### 方法B: 新規アカウント作成（Supabase経由）

1. Supabase Dashboard → **Authentication** → **Users**
2. **Add User** → **Create New User**
3. 以下を入力：
   - Email: `test@example.com`
   - Password: 任意の強力なパスワード
   - Auto Confirm User: ON

### 方法C: SQL経由でテナント紐付け

新規ユーザーをテナントに紐付ける：

```sql
-- 1. user_idを確認（Supabase Auth Usersから）
-- 2. テナントIDを確認
SELECT id, name FROM clavi.tenants LIMIT 5;

-- 3. ユーザーをテナントに紐付け
INSERT INTO clavi.user_tenants (user_id, tenant_id, role)
VALUES (
  'ユーザーUUID',
  'テナントUUID',
  'admin'  -- admin, member, viewer
);
```

---

## Step 2: ローカル環境起動

```bash
# プロジェクトディレクトリへ移動
cd /Users/nands/my-corporate-site

# 開発サーバー起動
npm run dev
```

---

## Step 3: CLAVI SaaSにログイン

1. ブラウザで http://localhost:3000/clavi/login を開く
2. テストアカウントでログイン
3. ダッシュボードに遷移することを確認

---

## Step 4: 設定画面でsameAs/Author入力

1. サイドメニューから **設定** をクリック
2. **ソーシャルリンク** セクションで以下を入力：
   - Twitter/X URL
   - LinkedIn URL
   - YouTube URL
   - GitHub URL
3. **代表者情報** セクションで以下を入力：
   - 氏名
   - 役職
   - 説明文
   - 専門分野（タグ形式）
4. **設定を保存** をクリック
5. 「設定を保存しました」メッセージを確認

---

## Step 5: 設定が保存されたか確認

### 方法A: UIで再確認

1. ページをリロード
2. 入力した値が表示されていることを確認

### 方法B: データベースで確認

```sql
-- テナント設定を確認
SELECT
  t.id,
  t.name,
  t.settings->'sameAs' as same_as,
  t.settings->'author' as author
FROM clavi.tenants t
WHERE t.settings IS NOT NULL;
```

---

## Step 6: JSON-LD生成テスト（スクリプト）

```bash
# 環境変数設定
export OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' .env.local | cut -d'=' -f2)

# JSON-LD生成
npx tsx scripts/phase5-generate-jsonld.ts \
  --url https://nands.tech/ai-agents \
  --config nands

# 結果確認
cat docs/saas-product/phase5-data/jsonld-output/ai-agents-*.json | head -50
```

---

## Step 7: Rich Results Test検証

1. https://search.google.com/test/rich-results を開く
2. 「コード」タブを選択
3. 生成されたJSON-LDをペースト
4. 「コードをテスト」をクリック
5. エラーがないことを確認

---

## 期待される結果

| テスト項目 | 期待結果 |
|-----------|---------|
| ログイン | ダッシュボードに遷移 |
| 設定保存 | 「設定を保存しました」表示 |
| 設定再読込 | 保存した値が表示される |
| JSON-LD生成 | ファイルが生成される |
| Rich Results Test | エラーなし |

---

## トラブルシューティング

### ログインできない

- Supabaseでユーザーが存在するか確認
- パスワードが正しいか確認
- `clavi.user_tenants`にレコードがあるか確認

### 設定が保存されない

```bash
# APIログを確認
# ブラウザの開発者ツール → Network → settings リクエストを確認
```

### 「No tenant context」エラー

```sql
-- ユーザーがテナントに紐付いているか確認
SELECT * FROM clavi.user_tenants WHERE user_id = 'ユーザーUUID';
```

---

## 関連ファイル

- 設定画面: `/app/clavi/settings/page.tsx`
- 設定API: `/app/api/clavi/settings/route.ts`
- RPC関数: `/supabase/migrations/20260120000010_tenant_settings_rpc.sql`
- 型定義: `/lib/clavi/types/tenant-settings.ts`
