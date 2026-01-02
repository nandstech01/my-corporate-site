# Docker Desktop インストール手順

**sudoパスワード入力が必要**なため、以下のいずれかの方法でインストールしてください。

---

## 🎯 方法1: Homebrew (推奨)

### ターミナルで実行

```bash
brew install --cask docker
```

**パスワード入力**のプロンプトが表示されたら、Macのログインパスワードを入力してください。

### 確認

```bash
ls -la /Applications/Docker.app
```

---

## 🎯 方法2: 公式サイトからダウンロード

### 1. ダウンロード

```bash
open https://www.docker.com/products/docker-desktop
```

### 2. インストール

1. **Docker.dmg** をダウンロード
2. **.dmg** ファイルを開く
3. **Docker.app** を **Applications** フォルダにドラッグ&ドロップ

---

## ✅ インストール確認

### Docker Desktopを起動

```bash
open -a Docker
```

### 初回起動時

1. **Accept** をクリック（利用規約）
2. Docker Desktopが起動するまで待つ（数十秒）
3. メニューバーにDockerアイコン🐋が表示される

### 動作確認

```bash
# Docker が起動するまで待つ（30秒ほど）
sleep 30

# 確認
docker --version
docker ps
```

---

## 🚀 次のステップ

### Step 1: Docker MCP Toolkit を有効化

1. **Docker Desktop** を開く
2. **⚙️ (Settings)** → **Beta features**
3. **✅ "Enable Docker MCP Toolkit"** にチェック
4. **Apply** をクリック

### Step 2: MCP Catalog からサーバーを追加

1. **MCP Toolkit** タブを選択
2. **Catalog** タブを選択
3. **"GitHub Official"** を検索 → **Add (+)**
4. **OAuth** で認証
5. **"Grafana"** も同様に追加
   - GRAFANA_URL: `http://localhost:3001`
   - GRAFANA_SERVICE_ACCOUNT_TOKEN: (Grafana起動後に取得)

### Step 3: Cursor に接続

#### 自動接続 (推奨)

1. **Docker Desktop** → **MCP Toolkit** → **Clients**
2. **Cursor** を見つける
3. **Connect** をクリック

#### 手動接続

`/Users/nands/.cursor/mcp.json` は既に設定済み ✅

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

### Step 4: Cursor を再起動

```bash
# Cursorを再起動
# Cursor Settings → Tools & MCP で確認
```

---

## 📊 Grafana の起動（Phase 1 完了のため）

Docker Desktopがインストールできたら、Grafanaも起動できます:

```bash
cd /Users/nands/my-corporate-site

# docker-compose.ymlを使って起動
docker-compose up -d grafana
```

---

## ❓ トラブルシューティング

### エラー: `Cannot connect to the Docker daemon`

→ **解決**: Docker Desktopが起動していない
```bash
open -a Docker
sleep 30  # 起動を待つ
```

### Docker Desktopが起動しない

→ **確認事項**:
- macOS のバージョンが対応しているか
- Apple Siliconの場合、ARM64版をダウンロードしているか
- 管理者権限があるか

---

## 🎉 完了後

以下のコマンドでPhase 1のすべてのサービスを起動できます:

```bash
cd /Users/nands/my-corporate-site
docker-compose up -d
```

**起動するサービス**:
- Django RAG Backend (ポート8000)
- Grafana (ポート3001)

---

**所要時間**: 約5分  
**次**: `DOCKER_MCP_QUICK_START.md`

