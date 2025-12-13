# ローカル環境トラブルシューティング

## 🐛 現在発生している問題と解決方法

---

## 問題1: YouTube認証でポートミスマッチエラー

### 症状

```
ERR_CONNECTION_REFUSED
localhost で接続が拒否されました。
```

リダイレクトURLが `http://localhost:3001/api/auth/youtube/callback` になっている

### 原因

1. **サーバーがポート3000で起動**している
2. **Googleからのリダイレクトはポート3001**に来る
3. ポート3001でサーバーが動いていないため接続拒否

### 解決方法

#### 方法A: ポート3000に統一（推奨）

1. `.env.local` を確認:
   ```bash
   YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
   PORT=3000
   ```

2. Google Cloud Consoleで `http://localhost:3000/api/auth/youtube/callback` が登録されているか確認

3. サーバーを再起動:
   ```bash
   pkill -f "node.*next"
   rm -rf .next
   npm run dev
   ```

4. 認証をテスト:
   ```
   http://localhost:3000/api/auth/youtube
   ```

#### 方法B: ポート3001に統一

1. `.env.local` を確認:
   ```bash
   YOUTUBE_REDIRECT_URI=http://localhost:3001/api/auth/youtube/callback
   PORT=3001
   ```

2. Google Cloud Consoleで `http://localhost:3001/api/auth/youtube/callback` を追加 → **保存**

3. サーバーを再起動:
   ```bash
   pkill -f "node.*next"
   rm -rf .next
   npm run dev
   ```

4. 認証をテスト:
   ```
   http://localhost:3001/api/auth/youtube
   ```

---

## 問題2: 複数のNext.jsサーバーが同時に動いている

### 症状

- 環境変数を更新してもエラーが消えない
- 古いコードが実行され続ける
- ポート3000と3001の両方が使用中

### 原因

複数のターミナルでサーバーを起動している、または、バックグラウンドで古いプロセスが残っている

### 解決方法

#### すべてのNext.jsプロセスを停止

```bash
# すべてのNext.jsプロセスを強制終了
pkill -f "node.*next"

# 確認（何も表示されなければOK）
lsof -i :3000 -i :3001
```

#### クリーンスタート

```bash
cd /Users/nands/my-corporate-site

# キャッシュ削除
rm -rf .next

# サーバー起動
npm run dev
```

---

## 問題3: 環境変数が読み込まれない

### 症状

```
{"error":"YouTube API credentials not configured"}
```

テストエンドポイント（`/api/test-env`）で確認すると：
```json
{
  "YOUTUBE_CLIENT_ID": "NOT SET",
  "YOUTUBE_CLIENT_SECRET": "NOT SET"
}
```

### 原因

1. `.env.local` ファイルが存在しない
2. 環境変数の記述が間違っている
3. サーバーを再起動していない

### 解決方法

#### ファイルの確認

```bash
# .env.localが存在するか確認
ls -la /Users/nands/my-corporate-site/.env.local

# 内容を確認（エディタで開く）
```

#### 正しい記述形式

```bash
# ✅ 正しい
YOUTUBE_CLIENT_ID=7956384386-58c1a2874uoii9bvp6d3lbttfaop9tcp.apps.googleusercontent.com

# ❌ 間違い（ダブルクォート）
YOUTUBE_CLIENT_ID="7956384386-58c1a2874uoii9bvp6d3lbttfaop9tcp.apps.googleusercontent.com"

# ❌ 間違い（スペース）
YOUTUBE_CLIENT_ID = 7956384386-58c1a2874uoii9bvp6d3lbttfaop9tcp.apps.googleusercontent.com

# ❌ 間違い（セミコロン）
YOUTUBE_CLIENT_ID=7956384386-58c1a2874uoii9bvp6d3lbttfaop9tcp.apps.googleusercontent.com;
```

#### サーバーを完全に再起動

```bash
# すべて停止
pkill -f "node.*next"

# キャッシュ削除
rm -rf .next

# 起動
npm run dev
```

#### テスト

```bash
# 環境変数が読み込まれているか確認
curl http://localhost:3000/api/test-env
```

---

## 問題4: OAuth同意画面で403エラー

### 症状

```
エラー 403: access_denied
このアプリは現在テスト中で、デベロッパーに承認されたテスターのみがアクセスできます
```

### 原因

Google Cloud ConsoleのOAuth同意画面で、**テストユーザー**として登録されていない

### 解決方法

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent?project=youtube-toukou) → **OAuth同意画面**
2. **テストユーザー**セクションまでスクロール
3. **+ ADD USERS** をクリック
4. あなたのメールアドレス（YouTubeチャンネルと同じGoogleアカウント）を入力:
   ```
   starkriz12@gmail.com
   ```
5. **保存**

---

## 問題5: googleapis パッケージエラー

### 症状

```
Error: Cannot find module 'googleapis'
```

### 原因

`googleapis` パッケージがインストールされていない

### 解決方法

```bash
cd /Users/nands/my-corporate-site

# インストール
npm install googleapis

# または、既にpackage.jsonに含まれている場合
npm install
```

**確認:**

```bash
grep googleapis package.json
# 出力: "googleapis": "^155.0.1"
```

---

## 問題6: Next.jsキャッシュの問題

### 症状

- コードを変更してもエラーが消えない
- 古いバージョンが実行され続ける
- 環境変数を更新しても反映されない

### 原因

`.next` フォルダにキャッシュが残っている

### 解決方法

```bash
cd /Users/nands/my-corporate-site

# すべてのプロセスを停止
pkill -f "node.*next"

# キャッシュ削除
rm -rf .next

# node_modulesも再インストール（必要な場合）
rm -rf node_modules
npm install

# サーバー起動
npm run dev
```

---

## 🔍 デバッグ方法

### 1. 環境変数を確認

```bash
# テストエンドポイントにアクセス
curl http://localhost:3000/api/test-env
```

期待される出力:

```json
{
  "env_check": {
    "YOUTUBE_CLIENT_ID": "7956384386-58c1a2874uoii9bvp6d3lbttfaop9tcp.apps.googleusercontent.com",
    "YOUTUBE_CLIENT_SECRET": "SET (hidden)",
    "all_env_keys": ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", ...]
  }
}
```

### 2. サーバーのログを確認

ターミナルで以下が表示されることを確認:

```
 ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in xxxms
```

### 3. ポートを確認

```bash
# どのポートが使用中か確認
lsof -i :3000 -i :3001 | grep LISTEN
```

出力が**1つのみ**であることを確認（2つ以上ある場合は複数サーバーが起動中）

---

## ✅ 推奨設定（ローカル環境）

### `.env.local`

```bash
# Google AI
GOOGLE_AI_API_KEY=AIzaSyAHLXD9rL2ng4TLUSApq-oVDc90lL05qIc

# Supabase (既存)
NEXT_PUBLIC_SUPABASE_URL=https://xhmhzhethpwjxuwksmuv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Akool API (既存)
AKOOL_CLIENT_ID=your_akool_client_id
AKOOL_CLIENT_SECRET=your_akool_client_secret

# YouTube API
YOUTUBE_CLIENT_ID=7956384386-58c1a2874uoii9bvp6d3lbttfaop9tcp.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=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
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
YOUTUBE_DEFAULT_PRIVACY=unlisted

# ポート固定
PORT=3000
```

### Google Cloud Console

**OAuth 2.0 承認済みリダイレクトURI:**

- `http://localhost:3000/api/auth/youtube/callback`
- `http://localhost:3001/api/auth/youtube/callback` (念のため)

---

## 🎯 確実な起動手順

```bash
# 1. すべてのプロセスを停止
pkill -f "node.*next"

# 2. キャッシュをクリア
cd /Users/nands/my-corporate-site
rm -rf .next

# 3. .env.localを確認（PORT=3000が設定されているか）
cat .env.local | grep PORT

# 4. サーバーを起動
npm run dev

# 5. 起動確認（ポート3000であることを確認）
# ターミナルに「- Local: http://localhost:3000」と表示される

# 6. テスト
curl http://localhost:3000/api/test-env
```

---

## 📞 それでも解決しない場合

1. `.env.local` の内容を再確認（スペース、クォート、セミコロンがないか）
2. `package.json` に `googleapis` があるか確認
3. `node_modules` を削除して再インストール
4. Macを再起動（稀にプロセスが残っている場合）

---

Happy Debugging! 🔧✨

