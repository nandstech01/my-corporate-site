# Docker Desktop セットアップ - 次のステップ

**✅ Docker Desktop インストール完了！**

現在のステータス：
- ✅ Docker Desktop インストール済み
- ✅ Docker version 29.1.3 確認済み
- ⚠️ Docker Daemon の起動確認が必要

---

## 🎯 次に行うこと（2分）

### Step 1: Docker Desktop の初期設定

**Docker Desktop のウィンドウを確認してください**

メニューバーに **🐋 Docker アイコン**が表示されているはずです。

#### 初回起動の場合：

1. **利用規約への同意**
   - "Accept" をクリック

2. **Docker Desktop の起動完了を待つ**
   - メニューバーの 🐋 アイコンが緑色になるまで待つ
   - 「Docker Desktop is running」と表示される

---

### Step 2: 動作確認（ターミナルで実行）

```bash
# Docker が起動しているか確認
docker ps

# 正常な場合、以下のように表示されます：
# CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

**エラーが出る場合**：
```bash
# Docker Desktop を再起動
open /Applications/Docker.app
```

---

## 🚀 Step 3: Docker MCP Toolkit を有効化

Docker が起動したら、以下の手順を実行してください：

### 3-1. Docker Desktop の設定を開く

1. メニューバーの **🐋 Docker アイコン**をクリック
2. **Settings (⚙️)** を選択

### 3-2. Beta features を有効化

1. 左メニューから **Beta features** を選択
2. **✅ "Enable Docker MCP Toolkit"** にチェック
3. **Apply** をクリック
4. Docker Desktop が再起動します（数秒）

---

## 📦 Step 4: MCP サーバーを追加

### 4-1. MCP Toolkit に移動

1. Docker Desktop のウィンドウで
2. 左メニューの **MCP Toolkit** をクリック
3. **Catalog** タブを選択

### 4-2. GitHub サーバーを追加

1. 検索バーで **"GitHub Official"** を検索
2. **Add (+)** アイコンをクリック
3. **Configuration** タブで **OAuth** を選択
4. ブラウザが開くので、GitHub で認証
5. 完了！

### 4-3. Grafana サーバーを追加

1. 検索バーで **"Grafana"** を検索
2. **Add (+)** アイコンをクリック
3. **Configuration** で以下を設定：
   ```
   GRAFANA_URL: http://localhost:3001
   GRAFANA_SERVICE_ACCOUNT_TOKEN: (後で設定)
   ```
4. **Save** をクリック

---

## 🔗 Step 5: Cursor に接続

### 5-1. 自動接続（推奨）

1. Docker Desktop で **MCP Toolkit → Clients** タブ
2. **Cursor** を見つける
3. **Connect** をクリック

### 5-2. 手動確認

`/Users/nands/.cursor/mcp.json` は既に設定済みです：

```json
{
  "mcpServers": {
    "MCP_DOCKER": {
      "command": "docker",
      "args": ["mcp", "gateway", "run"],
      "type": "stdio"
    }
  }
}
```

---

## ✅ Step 6: Cursor を再起動

1. **Cursor を完全に終了**
2. **Cursor を再起動**
3. **Cursor Settings → Tools & MCP** を開く
4. **MCP_DOCKER** が表示されることを確認 ✅

---

## 🧪 Step 7: テスト

Cursor のチャットで以下を試してください：

```
Use the GitHub MCP server to list my repositories
```

または

```
Use the Docker MCP Toolkit to show available MCP servers
```

---

## 📊 Step 8: Phase 1 のサービスを起動

すべてのセットアップが完了したら、以下でプロジェクト全体を起動できます：

```bash
cd /Users/nands/my-corporate-site

# Docker Compose でサービスを起動
docker-compose up -d

# 起動確認
docker ps
```

**起動するサービス**：
- **Django Backend** (ポート 8000)
- **Grafana** (ポート 3001)

### Grafana にアクセス

```bash
open http://localhost:3001
```

**ログイン情報**：
- Username: `admin`
- Password: `admin`

---

## ❓ トラブルシューティング

### `docker ps` でエラーが出る

```bash
# Docker Desktop を再起動
open /Applications/Docker.app

# 30秒待ってから再試行
sleep 30
docker ps
```

### MCP_DOCKER が Cursor に表示されない

1. Cursor を完全に終了（⌘ + Q）
2. `/Users/nands/.cursor/mcp.json` の JSON 構文を確認
3. Cursor を再起動

### Docker MCP Toolkit が見つからない

→ **Beta features で有効化されていない可能性**
1. Docker Desktop → Settings → Beta features
2. ✅ "Enable Docker MCP Toolkit"

---

## 🎉 完了チェックリスト

- [ ] Docker Desktop が起動している
- [ ] `docker ps` が動作する
- [ ] Docker MCP Toolkit を有効化
- [ ] GitHub サーバーを追加（OAuth 認証済み）
- [ ] Grafana サーバーを追加
- [ ] Cursor に接続
- [ ] Cursor を再起動
- [ ] MCP_DOCKER が Cursor に表示される
- [ ] `docker-compose up -d` でサービス起動
- [ ] http://localhost:3001 で Grafana にアクセス

---

## 📚 関連ドキュメント

- [DOCKER_MCP_QUICK_START.md](./DOCKER_MCP_QUICK_START.md) - クイックスタート
- [docs/phase-1-django-rag-foundation/10_DOCKER_MCP_TOOLKIT.md](./docs/phase-1-django-rag-foundation/10_DOCKER_MCP_TOOLKIT.md) - 詳細ガイド
- [SETUP_COMPLETE_GUIDE.md](./SETUP_COMPLETE_GUIDE.md) - 完全セットアップガイド

---

**現在地**: Step 1 (Docker Desktop 初期設定)  
**次**: Step 2 (動作確認)

---

**作成日**: 2025年12月29日  
**ステータス**: Docker Desktop インストール完了、初期設定待ち

